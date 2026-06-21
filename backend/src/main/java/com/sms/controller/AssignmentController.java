package com.sms.controller;

import com.sms.dto.ApiDtos.*;
import com.sms.entity.Assignment;
import com.sms.entity.AssignmentSubmission;
import com.sms.service.AssignmentService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {
    private final AssignmentService service;

    public AssignmentController(AssignmentService s) {
        service = s;
    }

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public Assignment create(@Valid @RequestBody AssignmentRequest r, Authentication a) {
        return service.createAssignment(r, a.getName());
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public AssignmentSubmission submit(@Valid @RequestBody SubmissionRequest r, Authentication a) {
        return service.submitAssignment(r, a.getName());
    }

    @PutMapping("/submissions/{id}/grade")
    @PreAuthorize("hasRole('FACULTY')")
    public AssignmentSubmission grade(@PathVariable Long id, @Valid @RequestBody GradeRequest r, Authentication a) {
        return service.gradeSubmission(id, r, a.getName());
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('FACULTY', 'STUDENT', 'ADMIN')")
    public List<Assignment> listForCourse(@PathVariable Long courseId) {
        return service.getCourseAssignments(courseId);
    }

    @GetMapping("/student/mine")
    @PreAuthorize("hasRole('STUDENT')")
    public List<Map<String, Object>> studentMine(Authentication a) {
        return service.getStudentAssignments(a.getName());
    }

    @GetMapping("/{id}/submissions")
    @PreAuthorize("hasRole('FACULTY')")
    public List<AssignmentSubmission> submissions(@PathVariable Long id, Authentication a) {
        return service.getSubmissionsForAssignment(id, a.getName());
    }
}
