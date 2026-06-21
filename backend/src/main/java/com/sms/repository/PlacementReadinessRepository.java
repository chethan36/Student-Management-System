package com.sms.repository;

import com.sms.entity.PlacementReadiness;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PlacementReadinessRepository extends JpaRepository<PlacementReadiness, Long> {
    Optional<PlacementReadiness> findByStudentId(Long studentId);
    Optional<PlacementReadiness> findByStudentUserEmailIgnoreCase(String email);
}
