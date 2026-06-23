package com.sms.repository;
import com.sms.entity.Attendance;
import com.sms.entity.Enrollment;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.*;
public interface AttendanceRepository extends JpaRepository<Attendance,Long> {
 Optional<Attendance> findByEnrollmentIdAndDate(Long enrollmentId, LocalDate date);
 List<Attendance> findByEnrollmentStudentId(Long studentId);
 List<Attendance> findByEnrollmentIn(Collection<Enrollment> enrollments);
 @Query("select count(a) from Attendance a where a.status=com.sms.entity.Attendance.Status.PRESENT") long countPresent();
 @Query("select count(a) from Attendance a where a.enrollment.student.id=:id") long countForStudent(@Param("id") Long id);
 @Query("select count(a) from Attendance a where a.enrollment.student.id=:id and a.status=com.sms.entity.Attendance.Status.PRESENT") long countPresentForStudent(@Param("id") Long id);
}
