package com.tashin.tourism.admin.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.admin.dto.ProviderActionRequest;
import com.tashin.tourism.audit.service.AuditService;
import com.tashin.tourism.common.exception.ResourceNotFoundException;
import com.tashin.tourism.provider.entity.Provider;
import com.tashin.tourism.provider.repository.ProviderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminProviderService {

    private final ProviderRepository repository;
    private final AuditService auditService;

    public Page<Provider> list(String verificationStatus, Pageable pageable) {
        Specification<Provider> spec = (root, query, cb) -> cb.conjunction();
        if (verificationStatus != null && !verificationStatus.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("verificationStatus"), verificationStatus));
        }
        return repository.findAll(spec, pageable);
    }

    public Provider getById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PROVIDER_NOT_FOUND", "Provider not found"));
    }

    @Transactional
    public Provider markUnderReview(UUID id, Authentication auth) {
        Provider p = findOrThrow(id);
        p.setVerificationStatus("UNDER_REVIEW");
        auditService.log(auth, "PROVIDER_UNDER_REVIEW", "PROVIDER", id);
        return p;
    }

    @Transactional
    public Provider approve(UUID id, ProviderActionRequest req, Authentication auth) {
        Provider p = findOrThrow(id);
        p.setVerificationStatus("APPROVED");
        auditService.log(auth, "PROVIDER_APPROVED", "PROVIDER", id);
        return p;
    }

    @Transactional
    public Provider reject(UUID id, ProviderActionRequest req, Authentication auth) {
        Provider p = findOrThrow(id);
        p.setVerificationStatus("REJECTED");
        auditService.log(auth, "PROVIDER_REJECTED", "PROVIDER", id);
        return p;
    }

    @Transactional
    public Provider suspend(UUID id, ProviderActionRequest req, Authentication auth) {
        Provider p = findOrThrow(id);
        p.setVerificationStatus("SUSPENDED");
        p.setStatus("INACTIVE");
        auditService.log(auth, "PROVIDER_SUSPENDED", "PROVIDER", id);
        return p;
    }

    @Transactional
    public Provider reactivate(UUID id, Authentication auth) {
        Provider p = findOrThrow(id);
        p.setVerificationStatus("APPROVED");
        p.setStatus("ACTIVE");
        auditService.log(auth, "PROVIDER_REACTIVATED", "PROVIDER", id);
        return p;
    }

    private Provider findOrThrow(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PROVIDER_NOT_FOUND", "Provider not found"));
    }
}
