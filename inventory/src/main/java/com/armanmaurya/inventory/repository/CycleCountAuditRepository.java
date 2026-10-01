package com.armanmaurya.inventory.repository;

import com.armanmaurya.inventory.entity.CycleCountAudit;
import com.armanmaurya.inventory.enums.AuditStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CycleCountAuditRepository extends JpaRepository<CycleCountAudit, Long> {

    Optional<CycleCountAudit> findByAuditNumber(String auditNumber);

    List<CycleCountAudit> findByLocationId(Long locationId);

    List<CycleCountAudit> findByStatus(AuditStatus status);

    boolean existsByAuditNumber(String auditNumber);
}
