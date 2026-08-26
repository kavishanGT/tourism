package com.tashin.tourism.admin.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.admin.dto.AdminDestinationResponse;
import com.tashin.tourism.admin.dto.CreateDestinationRequest;
import com.tashin.tourism.admin.dto.RejectContentRequest;
import com.tashin.tourism.admin.dto.UpdateDestinationRequest;
import com.tashin.tourism.audit.service.AuditService;
import com.tashin.tourism.common.exception.BusinessException;
import com.tashin.tourism.common.exception.ConflictException;
import com.tashin.tourism.common.exception.ResourceNotFoundException;
import com.tashin.tourism.common.spatial.GeometryUtils;
import com.tashin.tourism.destination.entity.Destination;
import com.tashin.tourism.destination.repository.DestinationRepository;
import com.tashin.tourism.region.entity.Region;
import com.tashin.tourism.region.repository.RegionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDestinationService {

    private final DestinationRepository repository;
    private final RegionRepository regionRepository;
    private final AuditService auditService;

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    public AdminDestinationResponse create(CreateDestinationRequest req, Authentication auth) {
        if (repository.existsBySlugAndDeletedAtIsNull(req.slug())) {
            throw new ConflictException("DESTINATION_SLUG_EXISTS", "Slug already exists: " + req.slug());
        }

        Region region = null;
        if (req.regionId() != null) {
            region = regionRepository.findById(req.regionId())
                    .orElseThrow(() -> new ResourceNotFoundException("REGION_NOT_FOUND", "Region not found"));
        }

        Destination d = Destination.builder()
                .name(req.name())
                .slug(req.slug())
                .region(region)
                .shortDescription(req.shortDescription())
                .description(req.description())
                .location(GeometryUtils.createPoint(req.latitude(), req.longitude()))
                .featured(Boolean.TRUE.equals(req.featured()))
                .status("DRAFT")
                .seoTitle(req.seoTitle())
                .seoDescription(req.seoDescription())
                .build();

        Destination saved = repository.save(d);
        auditService.log(auth, "DESTINATION_CREATED", "DESTINATION", saved.getId());
        return toAdminResponse(saved);
    }

    // ── List (admin sees all statuses) ────────────────────────────────────────

    public Page<AdminDestinationResponse> list(String status, String search, Pageable pageable) {
        Specification<Destination> spec = (root, query, cb) -> cb.conjunction();

        if (status != null && !status.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("shortDescription")), pattern)));
        }

        return repository.findAll(spec, pageable).map(this::toAdminResponse);
    }

    // ── Get by ID ─────────────────────────────────────────────────────────────

    public AdminDestinationResponse getById(UUID id) {
        return toAdminResponse(findOrThrow(id));
    }

    // ── Update (PATCH) ────────────────────────────────────────────────────────

    @Transactional
    public AdminDestinationResponse update(UUID id, UpdateDestinationRequest req, Authentication auth) {
        Destination d = findOrThrow(id);

        if (req.name() != null)
            d.setName(req.name());
        if (req.shortDescription() != null)
            d.setShortDescription(req.shortDescription());
        if (req.description() != null)
            d.setDescription(req.description());
        if (req.featured() != null)
            d.setFeatured(req.featured());
        if (req.seoTitle() != null)
            d.setSeoTitle(req.seoTitle());
        if (req.seoDescription() != null)
            d.setSeoDescription(req.seoDescription());
        if (req.latitude() != null && req.longitude() != null) {
            d.setLocation(GeometryUtils.createPoint(req.latitude(), req.longitude()));
        }

        auditService.log(auth, "DESTINATION_UPDATED", "DESTINATION", id);
        return toAdminResponse(d);
    }

    // ── Publish ───────────────────────────────────────────────────────────────

    @Transactional
    public AdminDestinationResponse publish(UUID id, Authentication auth) {
        Destination d = findOrThrow(id);
        validateForPublishing(d);

        d.setStatus("PUBLISHED");
        d.setPublishedAt(Instant.now());
        try {
            d.setPublishedBy(UUID.fromString(auth.getName()));
        } catch (Exception ignored) {
        }

        auditService.log(auth, "DESTINATION_PUBLISHED", "DESTINATION", id);
        return toAdminResponse(d);
    }

    // ── Unpublish ─────────────────────────────────────────────────────────────

    @Transactional
    public AdminDestinationResponse unpublish(UUID id, Authentication auth) {
        Destination d = findOrThrow(id);
        d.setStatus("DRAFT");
        auditService.log(auth, "DESTINATION_UNPUBLISHED", "DESTINATION", id);
        return toAdminResponse(d);
    }

    // ── Reject ────────────────────────────────────────────────────────────────

    @Transactional
    public AdminDestinationResponse reject(UUID id, RejectContentRequest req, Authentication auth) {
        Destination d = findOrThrow(id);
        d.setStatus("REJECTED");
        d.setRejectionReason(req.reason());
        auditService.log(auth, "DESTINATION_REJECTED", "DESTINATION", id);
        return toAdminResponse(d);
    }

    // ── Soft Delete ───────────────────────────────────────────────────────────

    @Transactional
    public void delete(UUID id, Authentication auth) {
        Destination d = findOrThrow(id);
        d.setDeletedAt(Instant.now());
        auditService.log(auth, "DESTINATION_DELETED", "DESTINATION", id);
    }

    // ── Restore ───────────────────────────────────────────────────────────────

    @Transactional
    public AdminDestinationResponse restore(UUID id, Authentication auth) {
        Destination d = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DESTINATION_NOT_FOUND", "Destination not found"));
        d.setDeletedAt(null);
        d.setStatus("DRAFT");
        auditService.log(auth, "DESTINATION_RESTORED", "DESTINATION", id);
        return toAdminResponse(d);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Destination findOrThrow(UUID id) {
        return repository.findById(id)
                .filter(d -> d.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("DESTINATION_NOT_FOUND", "Destination not found"));
    }

    private void validateForPublishing(Destination d) {
        if (d.getName() == null || d.getName().isBlank()) {
            throw new BusinessException("CONTENT_INCOMPLETE", "Destination name is required");
        }
        if (d.getLocation() == null) {
            throw new BusinessException("CONTENT_INCOMPLETE", "Destination location is required");
        }
    }

    private AdminDestinationResponse toAdminResponse(Destination d) {
        double lat = d.getLocation() != null ? d.getLocation().getY() : 0;
        double lng = d.getLocation() != null ? d.getLocation().getX() : 0;
        return new AdminDestinationResponse(
                d.getId(), d.getName(), d.getSlug(),
                d.getShortDescription(), d.getDescription(),
                lat, lng, d.isFeatured(), d.getStatus(),
                d.getSeoTitle(), d.getSeoDescription(),
                d.getRegion() != null ? d.getRegion().getId() : null,
                d.getRegion() != null ? d.getRegion().getName() : null,
                d.getCreatedAt(), d.getUpdatedAt(),
                d.getPublishedAt(), d.getPublishedBy(),
                d.getRejectionReason(), d.getDeletedAt());
    }
}
