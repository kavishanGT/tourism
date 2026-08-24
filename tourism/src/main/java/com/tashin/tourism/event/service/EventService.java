package com.tashin.tourism.event.service;

import java.time.Instant;

import org.locationtech.jts.geom.Point;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.event.dto.EventResponse;
import com.tashin.tourism.event.entity.Event;
import com.tashin.tourism.event.repository.EventRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository repository;

    public Page<EventResponse> search(
            String destination,
            Instant startDate,
            Instant endDate,
            Pageable pageable) {

        Specification<Event> spec = (root, query, cb) -> cb.equal(root.get("status"), "PUBLISHED");

        if (destination != null && !destination.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.join("destination").get("slug"), destination));
        }
        if (startDate != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("startDatetime"), startDate));
        }
        if (endDate != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("startDatetime"), endDate));
        }

        return repository.findAll(spec, pageable).map(this::toResponse);
    }

    public EventResponse getBySlug(String slug) {
        Event e = repository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Event not found: " + slug));
        return toResponse(e);
    }

    private EventResponse toResponse(Event e) {
        Point p = e.getLocation();
        return new EventResponse(
                e.getId(), e.getName(), e.getSlug(), e.getDescription(),
                e.getStartDatetime(), e.getEndDatetime(),
                p != null ? p.getY() : null,
                p != null ? p.getX() : null,
                e.getOrganizer(), e.isTicketRequired(), e.getTicketUrl(),
                e.getStatus(),
                e.getDestination() != null ? e.getDestination().getId() : null,
                e.getDestination() != null ? e.getDestination().getName() : null);
    }
}
