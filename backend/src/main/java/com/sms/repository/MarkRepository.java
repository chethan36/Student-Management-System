package com.sms.repository;
import com.sms.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface MarkRepository extends JpaRepository<Mark,Long> { Optional<Mark> findByEnrollmentIdAndAssessment(Long enrollmentId, String assessment); List<Mark> findByEnrollmentStudentId(Long studentId); }
