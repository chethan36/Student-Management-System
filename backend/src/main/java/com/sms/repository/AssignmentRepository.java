package com.sms.repository;

import com.sms.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCourseId(Long courseId);

    @Query("SELECT a FROM Assignment a JOIN Enrollment e ON e.course.id = a.course.id WHERE e.student.id = :studentId")
    List<Assignment> findByStudentId(Long studentId);
}
