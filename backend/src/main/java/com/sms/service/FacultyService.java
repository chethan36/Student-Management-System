package com.sms.service;

import com.sms.dto.ApiDtos.*;
import com.sms.entity.*;
import com.sms.exception.ApiException;
import com.sms.repository.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class FacultyService {
    private final FacultyRepository faculty;
    private final CourseRepository courses;
    private final EnrollmentRepository enrollments;
    private final AttendanceRepository attendance;
    private final MarkRepository marks;
    private final StudentRepository students;
    private final NotificationService notificationService;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;

    public FacultyService(FacultyRepository f, CourseRepository c, EnrollmentRepository e, 
                          AttendanceRepository a, MarkRepository m, StudentRepository s, 
                          NotificationService ns, AssignmentRepository asR, 
                          AssignmentSubmissionRepository asSR) {
        faculty = f;
        courses = c;
        enrollments = e;
        attendance = a;
        marks = m;
        students = s;
        notificationService = ns;
        assignmentRepository = asR;
        assignmentSubmissionRepository = asSR;
    }

    private Faculty current(String email) {
        return faculty.findByUserEmailIgnoreCase(email).orElseThrow(() -> ApiException.notFound("Faculty profile"));
    }

    public List<Course> courses(String email) {
        return courses.findByFacultyId(current(email).getId());
    }

    public List<Enrollment> roster(String email, Long courseId) {
        Course c = assigned(email, courseId);
        return enrollments.findByCourseId(c.getId());
    }

    public List<Attendance> attendance(String email, Long courseId, AttendanceRequest r) {
        assigned(email, courseId);
        return r.records().stream().map(item -> {
            var e = enrollments.findById(item.enrollmentId()).orElseThrow(() -> ApiException.notFound("Enrollment"));
            if (!e.getCourse().getId().equals(courseId))
                throw new ApiException(HttpStatus.FORBIDDEN, "Enrollment is outside this course");
            var a = attendance.findByEnrollmentIdAndDate(e.getId(), r.date()).orElseGet(Attendance::new);
            a.setEnrollment(e);
            a.setDate(r.date());
            a.setStatus(item.status());
            var saved = attendance.save(a);
            notificationService.checkAndAlertLowAttendance(e.getStudent());
            return saved;
        }).toList();
    }

    public Mark mark(String email, MarkRequest r) {
        var e = enrollments.findById(r.enrollmentId()).orElseThrow(() -> ApiException.notFound("Enrollment"));
        assigned(email, e.getCourse().getId());
        if (r.score().compareTo(r.maxScore()) > 0)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Score cannot exceed maximum score");
        var m = marks.findByEnrollmentIdAndAssessment(e.getId(), r.assessment()).orElseGet(Mark::new);
        m.setEnrollment(e);
        m.setAssessment(r.assessment());
        m.setScore(r.score());
        m.setMaxScore(r.maxScore());
        m.setGrade(r.grade());
        return marks.save(m);
    }

    @Transactional(readOnly = true)
    public Page<Student> search(String q, Pageable p) {
        return students.search(q, p);
    }

    @Transactional(readOnly = true)
    public List<Mark> performance(String email, Long studentId) {
        Long facultyId = current(email).getId();
        return marks.findByEnrollmentStudentId(studentId).stream().filter(m -> m.getEnrollment().getCourse().getFaculty() != null && m.getEnrollment().getCourse().getFaculty().getId().equals(facultyId)).toList();
    }

    private Course assigned(String email, Long id) {
        var c = courses.findById(id).orElseThrow(() -> ApiException.notFound("Course"));
        if (c.getFaculty() == null || !c.getFaculty().getId().equals(current(email).getId()))
            throw new ApiException(HttpStatus.FORBIDDEN, "Course is not assigned to this faculty member");
        return c;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFacultyStats(String email) {
        Faculty f = current(email);
        List<Course> myCourses = courses.findByFacultyId(f.getId());
        
        List<Enrollment> myEnrollments = new ArrayList<>();
        for (Course c : myCourses) {
            myEnrollments.addAll(enrollments.findByCourseId(c.getId()));
        }

        long uniqueStudents = myEnrollments.stream()
                .map(e -> e.getStudent().getId())
                .distinct()
                .count();

        double avgAttendance = 100.0;
        int attTotal = 0;
        int attPresent = 0;
        for (Enrollment e : myEnrollments) {
            List<Attendance> records = attendance.findByEnrollmentStudentId(e.getStudent().getId()).stream()
                    .filter(a -> a.getEnrollment().getCourse().getId().equals(e.getCourse().getId()))
                    .toList();
            for (Attendance a : records) {
                attTotal++;
                if (a.getStatus() == Attendance.Status.PRESENT) {
                    attPresent++;
                }
            }
        }
        if (attTotal > 0) {
            avgAttendance = (attPresent * 100.0) / attTotal;
        }

        long pendingAssignments = 0;
        if (!myCourses.isEmpty()) {
            List<Assignment> myAssignments = new ArrayList<>();
            for (Course c : myCourses) {
                myAssignments.addAll(assignmentRepository.findByCourseId(c.getId()));
            }
            if (!myAssignments.isEmpty()) {
                pendingAssignments = assignmentSubmissionRepository.findByAssignmentIn(myAssignments).stream()
                        .filter(sub -> "PENDING".equals(sub.getStatus()))
                        .count();
            }
        }

        List<Map<String, Object>> courseAnalytics = new ArrayList<>();
        for (Course c : myCourses) {
            List<Enrollment> courseEnrollments = enrollments.findByCourseId(c.getId());
            double courseAtt = 100.0;
            int cAttTotal = 0;
            int cAttPresent = 0;
            for (Enrollment e : courseEnrollments) {
                List<Attendance> records = attendance.findByEnrollmentStudentId(e.getStudent().getId()).stream()
                        .filter(a -> a.getEnrollment().getCourse().getId().equals(c.getId()))
                        .toList();
                for (Attendance a : records) {
                    cAttTotal++;
                    if (a.getStatus() == Attendance.Status.PRESENT) {
                        cAttPresent++;
                    }
                }
            }
            if (cAttTotal > 0) {
                courseAtt = (cAttPresent * 100.0) / cAttTotal;
            }

            double avgScore = 0.0;
            int marksCount = 0;
            double totalScorePct = 0.0;
            for (Enrollment e : courseEnrollments) {
                List<Mark> studentMarks = marks.findByEnrollmentStudentId(e.getStudent().getId()).stream()
                        .filter(m -> m.getEnrollment().getCourse().getId().equals(c.getId()))
                        .filter(m -> !m.getAssessment().toLowerCase().contains("assignment"))
                        .toList();
                for (Mark m : studentMarks) {
                    if (m.getMaxScore().doubleValue() > 0) {
                        totalScorePct += (m.getScore().doubleValue() / m.getMaxScore().doubleValue()) * 100.0;
                        marksCount++;
                    }
                }
            }
            if (marksCount > 0) {
                avgScore = totalScorePct / marksCount;
            }

            Map<String, Object> cData = new HashMap<>();
            cData.put("courseCode", c.getCode());
            cData.put("courseName", c.getName());
            cData.put("studentsCount", courseEnrollments.size());
            cData.put("avgAttendance", Math.round(courseAtt * 10.0) / 10.0);
            cData.put("avgScore", Math.round(avgScore * 10.0) / 10.0);
            courseAnalytics.add(cData);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", uniqueStudents);
        stats.put("totalCourses", myCourses.size());
        stats.put("averageAttendance", Math.round(avgAttendance * 10.0) / 10.0);
        stats.put("pendingAssignments", pendingAssignments);
        stats.put("courseAnalytics", courseAnalytics);
        return stats;
    }
}
