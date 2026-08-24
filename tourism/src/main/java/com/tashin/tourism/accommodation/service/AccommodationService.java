package com.tashin.tourism.accommodation.service;

import java.math.BigDecimal;

import org.locationtech.jts.geom.Point;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.accommodation.dto.AccommodationResponse;
import com.tashin.tourism.accommodation.entity.Accommodation;
import com.tashin.tourism.accommodation.repository.AccommodationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccommodationService {

    private final AccommodationRepository repository;

    public Page<AccommodationResponse> search(
            String destination, String type,
            BigDecimal minPrice, BigDecimal maxPrice,
            Pageable pageable) {

        Specification<Accommodation> spec = (root, query, cb) -> cb.equal(root.get("status"), "PUBLISHED");

        if (destination != null && !destination.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.join("destination").get("slug"), destination));
        }
        if (type != null && !type.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("accommodationType"), type));
        }
        if (minPrice != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("priceFrom"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("priceFrom"), maxPrice));
        }

        return repository.findAll(spec, pageable).map(this::toResponse);
    }

    public AccommodationResponse getBySlug(String slug) {
        Accommodation a = repository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Accommodation not found: " + slug));
        return toResponse(a);
    }

    private AccommodationResponse toResponse(Accommodation a) {
        Point p = a.getLocation();
        return new AccommodationResponse(
                a.getId(), a.getName(), a.getSlug(), a.getDescription(),
                a.getAccommodationType(), a.getPriceFrom(), a.getCurrency(),
                p != null ? p.getY() : null,
                p != null ? p.getX() : null,
                a.getStatus(),
                a.getDestination() != null ? a.getDestination().getId() : null,
                a.getDestination() != null ? a.getDestination().getName() : null);
    }
}
