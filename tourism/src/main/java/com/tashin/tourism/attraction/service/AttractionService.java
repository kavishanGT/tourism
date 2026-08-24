package com.tashin.tourism.attraction.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.attraction.dto.AttractionResponse;
import com.tashin.tourism.attraction.dto.NearbyAttractionResponse;
import com.tashin.tourism.attraction.entity.Attraction;
import com.tashin.tourism.attraction.repository.AttractionRepository;
import com.tashin.tourism.attraction.specification.AttractionSpecifications;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttractionService {

    private static final int NEARBY_LIMIT = 50;

    private final AttractionRepository repository;

    public Page<AttractionResponse> search(
            String search,
            String destination,
            Boolean featured,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable) {
        Specification<Attraction> spec = AttractionSpecifications.notDeleted()
                .and(AttractionSpecifications.published())
                .and(AttractionSpecifications.search(search))
                .and(AttractionSpecifications.destination(destination))
                .and(AttractionSpecifications.minPrice(minPrice))
                .and(AttractionSpecifications.maxPrice(maxPrice));

        if (Boolean.TRUE.equals(featured)) {
            spec = spec.and(AttractionSpecifications.featured());
        }

        return repository.findAll(spec, pageable).map(this::toResponse);
    }

    public AttractionResponse getBySlug(String slug) {
        Attraction a = repository.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new RuntimeException("Attraction not found: " + slug));
        return toResponse(a);
    }

    public List<NearbyAttractionResponse> findNearby(
            double latitude, double longitude, double radius) {
        return repository.findNearby(latitude, longitude, radius, NEARBY_LIMIT)
                .stream()
                .map(this::toNearbyResponse)
                .toList();
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private AttractionResponse toResponse(Attraction a) {
        double lat = a.getLocation() != null ? a.getLocation().getY() : 0;
        double lng = a.getLocation() != null ? a.getLocation().getX() : 0;
        return new AttractionResponse(
                a.getId(),
                a.getName(),
                a.getSlug(),
                a.getShortDescription(),
                a.getDescription(),
                lat, lng,
                a.getDurationMinutes(),
                a.getPriceFrom(),
                a.getCurrency(),
                a.getStatus(),
                a.isFeatured(),
                a.getDestination() != null ? a.getDestination().getId() : null,
                a.getDestination() != null ? a.getDestination().getName() : null);
    }

    private NearbyAttractionResponse toNearbyResponse(Object[] row) {
        // Columns: id, name, slug, latitude, longitude, distance_meters
        return new NearbyAttractionResponse(
                UUID.fromString(row[0].toString()),
                (String) row[1],
                (String) row[2],
                ((Number) row[3]).doubleValue(),
                ((Number) row[4]).doubleValue(),
                ((Number) row[5]).doubleValue());
    }
}
