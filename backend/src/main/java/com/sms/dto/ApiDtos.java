package com.sms.dto;

import com.sms.entity.*;
import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class ApiDtos {
 private ApiDtos() {}
 public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
 public record LoginResponse(String token, String email, Role role, String name) {}
 public record PersonRequest(@NotBlank String identifier, @NotBlank String name, @Email @NotBlank String email, @Size(min=8) String password, @NotNull Long departmentId, String phone, Integer semester, String designation) {}
 public record CourseRequest(@NotBlank String code, @NotBlank String name, @Min(1) @Max(10) Integer credits, @Min(1) @Max(12) Integer semester, @NotNull Long departmentId, Long facultyId) {}
 public record EnrollmentRequest(@NotNull Long studentId, @NotNull Long courseId, @NotBlank String academicYear) {}
 public record AttendanceItem(@NotNull Long enrollmentId, @NotNull Attendance.Status status) {}
 public record AttendanceRequest(@NotNull LocalDate date, @NotEmpty List<@Valid @NotNull AttendanceItem> records) {}
 public record MarkRequest(@NotNull Long enrollmentId, @NotBlank String assessment, @NotNull @DecimalMin("0") BigDecimal score, @NotNull @DecimalMin("0.01") BigDecimal maxScore, String grade) {}
 public record Dashboard(long students, long faculty, long courses, long departments, double attendancePercentage) {}
 public record AssignmentRequest(@NotNull Long courseId, @NotBlank String title, String description, @NotBlank String dueDate, @NotNull BigDecimal maxScore) {}
 public record SubmissionRequest(@NotNull Long assignmentId, @NotBlank String filePath) {}
 public record GradeRequest(@NotNull BigDecimal score, String feedback, String improvementSuggestions) {}
}
