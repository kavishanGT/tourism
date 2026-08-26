package com.tashin.tourism.audit.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.audit.entity.AuditLog;
import com.tashin.tourism.audit.repository.AuditLogRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository repository;

    /**
     * Logs an admin action. Runs in a separate transaction so audit is not
     * rolled back if the caller's transaction fails.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(Authentication authentication, String action,
            String entityType, UUID entityId) {
        try {
            AuditLog entry = new AuditLog();
            entry.setAction(action);
            entry.setEntityType(entityType);
            entry.setEntityId(entityId);
            entry.setCreatedAt(Instant.now());

            if (authentication != null && authentication.getName() != null) {
                try {
                    entry.setUserId(UUID.fromString(authentication.getName()));
                } catch (IllegalArgumentException ex) {
                    log.warn("Could not parse user ID from authentication: {}", authentication.getName());
                }
            }

            repository.save(entry);
        } catch (Exception ex) {
            // Audit failure must never break the main operation
            log.error("Failed to write audit log: action={}, entity={}/{}", action, entityType, entityId, ex);
        }
    }
}
