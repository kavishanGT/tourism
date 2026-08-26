package com.tashin.tourism.audit.repository;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tashin.tourism.audit.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

        @Query("""
                        SELECT a FROM AuditLog a
                        WHERE (:userId IS NULL OR a.userId = :userId)
                          AND (:action IS NULL OR a.action = :action)
                          AND (:entityType IS NULL OR a.entityType = :entityType)
                          AND (:entityId IS NULL OR a.entityId = :entityId)
                          AND (:from IS NULL OR a.createdAt >= :from)
                          AND (:to IS NULL OR a.createdAt <= :to)
                        ORDER BY a.createdAt DESC
                        """)
        Page<AuditLog> search(
                        @Param("userId") UUID userId,
                        @Param("action") String action,
                        @Param("entityType") String entityType,
                        @Param("entityId") UUID entityId,
                        @Param("from") Instant from,
                        @Param("to") Instant to,
                        Pageable pageable);
}
