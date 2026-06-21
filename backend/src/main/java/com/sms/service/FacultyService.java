package com.sms.service;
import com.sms.dto.ApiDtos.*;
import com.sms.entity.*;
import com.sms.exception.ApiException;
import com.sms.repository.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service @Transactional
public class FacultyService {
 private final FacultyRepository faculty;private final CourseRepository courses;private final EnrollmentRepository enrollments;private final AttendanceRepository attendance;private final MarkRepository marks;private final StudentRepository students;private final NotificationService notificationService;
 public FacultyService(FacultyRepository f,CourseRepository c,EnrollmentRepository e,AttendanceRepository a,MarkRepository m,StudentRepository s,NotificationService ns){faculty=f;courses=c;enrollments=e;attendance=a;marks=m;students=s;notificationService=ns;}
 private Faculty current(String email){return faculty.findByUserEmailIgnoreCase(email).orElseThrow(()->ApiException.notFound("Faculty profile"));}
 public List<Course> courses(String email){return courses.findByFacultyId(current(email).getId());}
 public List<Enrollment> roster(String email,Long courseId){Course c=assigned(email,courseId);return enrollments.findByCourseId(c.getId());}
 public List<Attendance> attendance(String email,Long courseId,AttendanceRequest r){assigned(email,courseId);return r.records().stream().map(item->{var e=enrollments.findById(item.enrollmentId()).orElseThrow(()->ApiException.notFound("Enrollment"));if(!e.getCourse().getId().equals(courseId))throw new ApiException(HttpStatus.FORBIDDEN,"Enrollment is outside this course");var a=attendance.findByEnrollmentIdAndDate(e.getId(),r.date()).orElseGet(Attendance::new);a.setEnrollment(e);a.setDate(r.date());a.setStatus(item.status());var saved = attendance.save(a);notificationService.checkAndAlertLowAttendance(e.getStudent());return saved;}).toList();}
 public Mark mark(String email,MarkRequest r){var e=enrollments.findById(r.enrollmentId()).orElseThrow(()->ApiException.notFound("Enrollment"));assigned(email,e.getCourse().getId());if(r.score().compareTo(r.maxScore())>0)throw new ApiException(HttpStatus.BAD_REQUEST,"Score cannot exceed maximum score");var m=marks.findByEnrollmentIdAndAssessment(e.getId(),r.assessment()).orElseGet(Mark::new);m.setEnrollment(e);m.setAssessment(r.assessment());m.setScore(r.score());m.setMaxScore(r.maxScore());m.setGrade(r.grade());return marks.save(m);}
 @Transactional(readOnly=true) public Page<Student> search(String q,Pageable p){return students.search(q,p);}
 @Transactional(readOnly=true) public List<Mark> performance(String email,Long studentId){Long facultyId=current(email).getId();return marks.findByEnrollmentStudentId(studentId).stream().filter(m->m.getEnrollment().getCourse().getFaculty()!=null&&m.getEnrollment().getCourse().getFaculty().getId().equals(facultyId)).toList();}
 private Course assigned(String email,Long id){var c=courses.findById(id).orElseThrow(()->ApiException.notFound("Course"));if(c.getFaculty()==null||!c.getFaculty().getId().equals(current(email).getId()))throw new ApiException(HttpStatus.FORBIDDEN,"Course is not assigned to this faculty member");return c;}
}
