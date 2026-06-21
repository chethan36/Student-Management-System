package com.sms.repository;
import com.sms.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface EnrollmentRepository extends JpaRepository<Enrollment,Long> { List<Enrollment> findByStudentId(Long id); List<Enrollment> findByCourseId(Long id); Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId); }
