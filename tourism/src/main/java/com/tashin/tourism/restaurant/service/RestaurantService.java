package com.tashin.tourism.restaurant.service;

import java.util.List;
import java.util.UUID;

import org.locationtech.jts.geom.Point;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.restaurant.dto.RestaurantResponse;
import com.tashin.tourism.restaurant.entity.Restaurant;
import com.tashin.tourism.restaurant.repository.RestaurantRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RestaurantService {

    private static final int NEARBY_LIMIT = 50;
    private final RestaurantRepository repository;

    public Page<RestaurantResponse> search(
            String destination, String priceLevel, Pageable pageable) {

        Specification<Restaurant> spec = (root, query, cb) -> cb.conjunction();

        if (destination != null && !destination.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.join("destination").get("slug"), destination));
        }
        if (priceLevel != null && !priceLevel.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("priceLevel"), priceLevel));
        }
        spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), "PUBLISHED"));

        return repository.findAll(spec, pageable).map(this::toResponse);
    }

    public RestaurantResponse getBySlug(String slug) {
        Restaurant r = repository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Restaurant not found: " + slug));
        return toResponse(r);
    }

    public List<RestaurantResponse> findNearby(double lat, double lng, double radius) {
        return repository.findNearby(lat, lng, radius, NEARBY_LIMIT)
                .stream()
                .map(row -> new RestaurantResponse(
                        UUID.fromString(row[0].toString()),
                        (String) row[1], (String) row[2], null, null,
                        ((Number) row[3]).doubleValue(),
                        ((Number) row[4]).doubleValue(),
                        "PUBLISHED", null, null))
                .toList();
    }

    private RestaurantResponse toResponse(Restaurant r) {
        Point p = r.getLocation();
        return new RestaurantResponse(
                r.getId(), r.getName(), r.getSlug(), r.getDescription(),
                r.getPriceLevel(),
                p != null ? p.getY() : null,
                p != null ? p.getX() : null,
                r.getStatus(),
                r.getDestination() != null ? r.getDestination().getId() : null,
                r.getDestination() != null ? r.getDestination().getName() : null);
    }
}
