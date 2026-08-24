package com.tashin.tourism.destination.service;

import org.locationtech.jts.geom.Point;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.destination.dto.DestinationResponse;
import com.tashin.tourism.destination.dto.LocationResponse;
import com.tashin.tourism.destination.dto.RegionSummary;
import com.tashin.tourism.destination.entity.Destination;
import com.tashin.tourism.destination.repository.DestinationRepository;
import com.tashin.tourism.destination.specification.DestinationSpecifications;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DestinationService {

    private final DestinationRepository repository;

    public Page<DestinationResponse> search(
            String search,
            String region,
            Boolean featured,
            Pageable pageable) {
        Specification<Destination> spec = DestinationSpecifications.notDeleted()
                .and(DestinationSpecifications.published())
                .and(DestinationSpecifications.search(search))
                .and(DestinationSpecifications.region(region));

        if (Boolean.TRUE.equals(featured)) {
            spec = spec.and(DestinationSpecifications.featured());
        }

        return repository.findAll(spec, pageable).map(this::toResponse);
    }

    public DestinationResponse getBySlug(String slug) {
        Destination destination = repository
                .findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new RuntimeException("Destination not found: " + slug));
        return toResponse(destination);
    }

    private DestinationResponse toResponse(Destination d) {
        Point p = d.getLocation();
        // JTS convention: x = longitude, y = latitude
        LocationResponse location = new LocationResponse(p.getY(), p.getX());

        RegionSummary region = null;
        if (d.getRegion() != null) {
            region = new RegionSummary(
                    d.getRegion().getId(),
                    d.getRegion().getName(),
                    d.getRegion().getSlug());
        }

        return new DestinationResponse(
                d.getId(),
                d.getName(),
                d.getSlug(),
                d.getShortDescription(),
                d.getDescription(),
                location,
                region,
                d.isFeatured(),
                d.getStatus(),
                d.getSeoTitle(),
                d.getSeoDescription());
    }
}
