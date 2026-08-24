package com.tashin.tourism.experience.service;

import java.math.BigDecimal;

import org.locationtech.jts.geom.Point;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.experience.dto.ExperienceResponse;
import com.tashin.tourism.experience.entity.Experience;
import com.tashin.tourism.experience.repository.ExperienceRepository;
import com.tashin.tourism.experience.specification.ExperienceSpecifications;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExperienceService {

    private final ExperienceRepository repository;

    public Page<ExperienceResponse> search(
            String destination,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minDuration,
            Integer maxDuration,
            Pageable pageable) {
        Specification<Experience> spec = ExperienceSpecifications.notDeleted()
                .and(ExperienceSpecifications.published())
                .and(ExperienceSpecifications.destination(destination))
                .and(ExperienceSpecifications.minPrice(minPrice))
                .and(ExperienceSpecifications.maxPrice(maxPrice))
                .and(ExperienceSpecifications.minDuration(minDuration))
                .and(ExperienceSpecifications.maxDuration(maxDuration));

        return repository.findAll(spec, pageable).map(this::toResponse);
    }

    public ExperienceResponse getBySlug(String slug) {
        Experience e = repository.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new RuntimeException("Experience not found: " + slug));
        return toResponse(e);
    }

    private ExperienceResponse toResponse(Experience e) {
        Point p = e.getLocation();
        Double lat = p != null ? p.getY() : null;
        Double lng = p != null ? p.getX() : null;

        return new ExperienceResponse(
                e.getId(), e.getName(), e.getSlug(),
                e.getShortDescription(), e.getDescription(),
                e.getDurationMinutes(), e.getMinGuests(), e.getMaxGuests(),
                e.getPriceFrom(), e.getCurrency(), lat, lng,
                e.getStatus(), e.isFeatured(),
                e.getDestination() != null ? e.getDestination().getId() : null,
                e.getDestination() != null ? e.getDestination().getName() : null,
                e.getProvider() != null ? e.getProvider().getId() : null,
                e.getProvider() != null ? e.getProvider().getBusinessName() : null);
    }
}
