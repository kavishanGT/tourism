package com.tashin.tourism.admin.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.admin.dto.CreateAttractionRequest;
import com.tashin.tourism.admin.dto.RejectContentRequest;
import com.tashin.tourism.attraction.dto.AttractionResponse;
import com.tashin.tourism.attraction.entity.Attraction;
import com.tashin.tourism.attraction.repository.AttractionRepository;
import com.tashin.tourism.audit.service.AuditService;
import com.tashin.tourism.common.exception.BusinessException;
import com.tashin.tourism.common.exception.ConflictException;
import com.tashin.tourism.common.exception.ResourceNotFoundException;
import com.tashin.tourism.common.spatial.GeometryUtils;
import com.tashin.tourism.destination.entity.Destination;
import com.tashin.tourism.destination.repository.DestinationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAttractionService {

    private final AttractionRepository repository;
    private final DestinationRepository destinationRepository;
    private final AuditService auditService;

    @Transactional
    public AttractionResponse create(CreateAttractionRequest req, Authentication auth) {
        if (repository.findBySlugAndDeletedAtIsNull(req.slug()).isPresent()) {
            throw new ConflictException("ATTRACTION_SLUG_EXISTS", "Slug already exists: " + req.slug());
        }

        Destination destination = null;
        if (req.destinationId() != null) {
            destination = destinationRepository.findById(req.destinationId())
                    .orElseThrow(() -> new ResourceNotFoundException("DESTINATION_NOT_FOUND", "Destination not found"));
        }

        Attraction a = new Attraction();
        a.setDestination(destination);
        a.setName(req.name());
        a.setSlug(req.slug());
        a.setShortDescription(req.shortDescription());
        a.setDescription(req.description());
        a.setLocation(GeometryUtils.createPoint(req.latitude(), req.longitude()));
        a.setDurationMinutes(req.durationMinutes());
        a.setPriceFrom(req.priceFrom());
        a.setCurrency(req.currency());
        a.setFeatured(Boolean.TRUE.equals(req.featured()));
        a.setStatus("DRAFT");

        Attraction saved = repository.save(a);
        auditService.log(auth, "ATTRACTION_CREATED", "ATTRACTION", saved.getId());
        return toResponse(saved);
    }

    public Page<AttractionResponse> list(String status, Pageable pageable) {
        Specification<Attraction> spec = (root, query, cb) -> cb.conjunction();
        if (status != null && !status.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        return repository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional
    public AttractionResponse publish(UUID id, Authentication auth) {
        Attraction a = findOrThrow(id);
        if (a.getLocation() == null) {
            throw new BusinessException("CONTENT_INCOMPLETE", "Location is required before publishing");
        }
        a.setStatus("PUBLISHED");
        a.setPublishedAt(Instant.now());
        try { a.setPublishedBy(UUID.fromString(auth.getName())); } catch (Exception ignored) {}
        auditService.log(auth, "ATTRACTION_PUBLISHED", "ATTRACTION", id);
        return toResponse(a);
    }

    @Transactional
    public AttractionResponse reject(UUID id, RejectContentRequest req, Authentication auth) {
        Attraction a = findOrThrow(id);
        a.setStatus("REJECTED");
        a.setRejectionReason(req.reason());
        auditService.log(auth, "ATTRACTION_REJECTED", "ATTRACTION", id);
        return toResponse(a);
    }

    @Transactional
    public void delete(UUID id, Authentication auth) {
        Attraction a = findOrThrow(id);
        a.setDeletedAt(Instant.now());
        auditService.log(auth, "ATTRACTION_DELETED", "ATTRACTION", id);
    }

    @Transactional
    public AttractionResponse restore(UUID id, Authentication auth) {
        Attraction a = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ATTRACTION_NOT_FOUND", "Attraction not found"));
        a.setDeletedAt(null);
        a.setStatus("DRAFT");
        auditService.log(auth, "ATTRACTION_RESTORED", "ATTRACTION", id);
        return toResponse(a);
    }

    private Attraction findOrThrow(UUID id) {
        return repository.findById(id)
                .filter(a -> a.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("ATTRACTION_NOT_FOUND", "Attraction not found"));
    }

    private AttractionResponse toResponse(Attraction a) {
        double lat = a.getLocation() != null ? a.getLocation().getY() : 0;
        double lng = a.getLocation() != null ? a.getLocation().getX() : 0;
        return new AttractionResponse(
                a.getId(), a.getName(), a.getSlug(),
                a.getShortDescription(), a.getDescription(),
                lat, lng, a.getDurationMinutes(), a.getPriceFrom(),
                a.getCurrency(), a.getStatus(), a.isFeatured(),
                a.getDestination() != null ? a.getDestination().getId() : null,
                a.getDestination() != null ? a.getDestination().getName() : null
        );
    }
}
