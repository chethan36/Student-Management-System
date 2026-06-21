package com.sms.repository;
import com.sms.entity.Student;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
public interface StudentRepository extends JpaRepository<Student,Long> {
 Optional<Student> findByUserEmailIgnoreCase(String email);
 @Query("select s from Student s where lower(s.name) like lower(concat('%',:q,'%')) or lower(s.usn) like lower(concat('%',:q,'%')) or lower(s.department.name) like lower(concat('%',:q,'%'))") Page<Student> search(@Param("q") String q, Pageable pageable);
}
