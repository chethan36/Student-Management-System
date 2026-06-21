package com.sms.repository;
import com.sms.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface FacultyRepository extends JpaRepository<Faculty,Long> { Optional<Faculty> findByUserEmailIgnoreCase(String email); }
