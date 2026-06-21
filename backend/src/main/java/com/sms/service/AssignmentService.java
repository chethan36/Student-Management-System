package com.sms.service;

import com.sms.dto.ApiDtos.*;
import com.sms.entity.*;
import com.sms.exception.ApiException;
import com.sms.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AssignmentService {
    private final AssignmentRepository assignments;
    private final AssignmentSubmissionRepository submissions;
    private final CourseRepository courses;
    private final StudentRepository students;
    private final FacultyRepository faculty;

    public AssignmentService(AssignmentRepository a, AssignmentSubmissionRepository s, CourseRepository c, StudentRepository st, FacultyRepository f) {
        assignments = a;
        submissions = s;
        courses = c;
        students = st;
        faculty = f;
    }

    public Assignment createAssignment(AssignmentRequest r, String facultyEmail) {
        Faculty fac = faculty.findByUserEmailIgnoreCase(facultyEmail)
                .orElseThrow(() -> ApiException.notFound("Faculty"));
        Course c = courses.findById(r.courseId())
                .orElseThrow(() -> ApiException.notFound("Course"));

        if (c.getFaculty() == null || !c.getFaculty().getId().equals(fac.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Access denied. Faculty not assigned to this course.");
        }

        Assignment a = new Assignment();
        a.setCourse(c);
        a.setTitle(r.title());
        a.setDescription(r.description());
        a.setDueDate(LocalDate.parse(r.dueDate()));
        a.setMaxScore(r.maxScore());
        return assignments.save(a);
    }

    public AssignmentSubmission submitAssignment(SubmissionRequest r, String studentEmail) {
        Student s = students.findByUserEmailIgnoreCase(studentEmail)
                .orElseThrow(() -> ApiException.notFound("Student"));
        Assignment a = assignments.findById(r.assignmentId())
                .orElseThrow(() -> ApiException.notFound("Assignment"));

        // Check if student already submitted
        var existing = submissions.findByAssignmentIdAndStudentId(a.getId(), s.getId());
        AssignmentSubmission sub = existing.orElseGet(AssignmentSubmission::new);

        sub.setAssignment(a);
        sub.setStudent(s);
        sub.setFilePath(r.filePath());
        sub.setStatus("PENDING");

        // Simulate similarity check/plagiarism checker (returns random value 5% - 22% for realism)
        double sim = 5.0 + (Math.random() * 17.0);
        sub.setSimilarityScore(BigDecimal.valueOf(sim));

        return submissions.save(sub);
    }

    public AssignmentSubmission gradeSubmission(Long id, GradeRequest r, String facultyEmail) {
        Faculty fac = faculty.findByUserEmailIgnoreCase(facultyEmail)
                .orElseThrow(() -> ApiException.notFound("Faculty"));
        AssignmentSubmission sub = submissions.findById(id)
                .orElseThrow(() -> ApiException.notFound("Submission"));

        Course c = sub.getAssignment().getCourse();
        if (c.getFaculty() == null || !c.getFaculty().getId().equals(fac.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        if (r.score().compareTo(sub.getAssignment().getMaxScore()) > 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Score cannot exceed max score.");
        }

        sub.setScore(r.score());
        sub.setFeedback(r.feedback());
        sub.setImprovementSuggestions(r.improvementSuggestions());
        sub.setStatus("EVALUATED");

        return submissions.save(sub);
    }

    @Transactional(readOnly = true)
    public List<Assignment> getCourseAssignments(Long courseId) {
        return assignments.findByCourseId(courseId);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentAssignments(String studentEmail) {
        Student s = students.findByUserEmailIgnoreCase(studentEmail)
                .orElseThrow(() -> ApiException.notFound("Student"));

        List<Assignment> list = assignments.findByStudentId(s.getId());
        List<Map<String, Object>> res = new ArrayList<>();

        for (Assignment a : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("assignment", a);

            var sub = submissions.findByAssignmentIdAndStudentId(a.getId(), s.getId());
            if (sub.isPresent()) {
                map.put("submission", sub.get());
                map.put("submitted", true);
            } else {
                map.put("submitted", false);
            }
            res.add(map);
        }
        return res;
    }

    @Transactional(readOnly = true)
    public List<AssignmentSubmission> getSubmissionsForAssignment(Long assignmentId, String facultyEmail) {
        Faculty fac = faculty.findByUserEmailIgnoreCase(facultyEmail)
                .orElseThrow(() -> ApiException.notFound("Faculty"));
        Assignment a = assignments.findById(assignmentId)
                .orElseThrow(() -> ApiException.notFound("Assignment"));

        if (a.getCourse().getFaculty() == null || !a.getCourse().getFaculty().getId().equals(fac.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        return submissions.findByAssignmentId(assignmentId);
    }
}
