package com.tashin.tourism.search.service;

import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.accommodation.entity.Accommodation;
import com.tashin.tourism.accommodation.repository.AccommodationRepository;
import com.tashin.tourism.attraction.entity.Attraction;
import com.tashin.tourism.attraction.repository.AttractionRepository;
import com.tashin.tourism.destination.entity.Destination;
import com.tashin.tourism.destination.repository.DestinationRepository;
import com.tashin.tourism.event.entity.Event;
import com.tashin.tourism.event.repository.EventRepository;
import com.tashin.tourism.experience.entity.Experience;
import com.tashin.tourism.experience.repository.ExperienceRepository;
import com.tashin.tourism.restaurant.entity.Restaurant;
import com.tashin.tourism.restaurant.repository.RestaurantRepository;
import com.tashin.tourism.search.dto.AccommodationSummaryResponse;
import com.tashin.tourism.search.dto.AttractionSummaryResponse;
import com.tashin.tourism.search.dto.DestinationSummaryResponse;
import com.tashin.tourism.search.dto.EventSummaryResponse;
import com.tashin.tourism.search.dto.ExperienceSummaryResponse;
import com.tashin.tourism.search.dto.RestaurantSummaryResponse;
import com.tashin.tourism.search.dto.SearchResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchService {

        private static final int SEARCH_LIMIT = 10;

        private final DestinationRepository destinationRepository;
        private final AttractionRepository attractionRepository;
        private final ExperienceRepository experienceRepository;
        private final RestaurantRepository restaurantRepository;
        private final AccommodationRepository accommodationRepository;
        private final EventRepository eventRepository;

        public SearchResponse search(String query) {
                String pattern = "%" + query.toLowerCase() + "%";

                return new SearchResponse(
                                query,
                                searchDestinations(pattern),
                                searchAttractions(pattern),
                                searchExperiences(pattern),
                                searchRestaurants(pattern),
                                searchAccommodations(pattern),
                                searchEvents(pattern));
        }

        // ── Destinations ─────────────────────────────────────────────────────────

        private List<DestinationSummaryResponse> searchDestinations(String pattern) {
                Specification<Destination> spec = (root, query, cb) -> cb.and(
                                cb.isNull(root.get("deletedAt")),
                                cb.equal(root.get("status"), "PUBLISHED"),
                                cb.or(
                                                cb.like(cb.lower(root.get("name")), pattern),
                                                cb.like(cb.lower(root.get("shortDescription")), pattern),
                                                cb.like(cb.lower(root.get("description")), pattern)));

                return destinationRepository.findAll(spec)
                                .stream()
                                .limit(SEARCH_LIMIT)
                                .map(d -> new DestinationSummaryResponse(
                                                d.getId(), d.getName(), d.getSlug(),
                                                d.getShortDescription(), d.isFeatured(), d.getStatus()))
                                .toList();
        }

        // ── Attractions ───────────────────────────────────────────────────────────

        private List<AttractionSummaryResponse> searchAttractions(String pattern) {
                Specification<Attraction> spec = (root, query, cb) -> cb.and(
                                cb.isNull(root.get("deletedAt")),
                                cb.equal(root.get("status"), "PUBLISHED"),
                                cb.or(
                                                cb.like(cb.lower(root.get("name")), pattern),
                                                cb.like(cb.lower(root.get("shortDescription")), pattern),
                                                cb.like(cb.lower(root.get("description")), pattern)));

                return attractionRepository.findAll(spec)
                                .stream()
                                .limit(SEARCH_LIMIT)
                                .map(a -> new AttractionSummaryResponse(
                                                a.getId(), a.getName(), a.getSlug(),
                                                a.getShortDescription(), a.getPriceFrom(), a.getCurrency(),
                                                a.isFeatured()))
                                .toList();
        }

        // ── Experiences ───────────────────────────────────────────────────────────

        private List<ExperienceSummaryResponse> searchExperiences(String pattern) {
                Specification<Experience> spec = (root, query, cb) -> cb.and(
                                cb.isNull(root.get("deletedAt")),
                                cb.equal(root.get("status"), "PUBLISHED"),
                                cb.or(
                                                cb.like(cb.lower(root.get("name")), pattern),
                                                cb.like(cb.lower(root.get("shortDescription")), pattern),
                                                cb.like(cb.lower(root.get("description")), pattern)));

                return experienceRepository.findAll(spec)
                                .stream()
                                .limit(SEARCH_LIMIT)
                                .map(e -> new ExperienceSummaryResponse(
                                                e.getId(), e.getName(), e.getSlug(),
                                                e.getShortDescription(), e.getDurationMinutes(),
                                                e.getPriceFrom(), e.getCurrency(), e.isFeatured()))
                                .toList();
        }

        // ── Restaurants ───────────────────────────────────────────────────────────

        private List<RestaurantSummaryResponse> searchRestaurants(String pattern) {
                Specification<Restaurant> spec = (root, query, cb) -> cb.and(
                                cb.equal(root.get("status"), "PUBLISHED"),
                                cb.or(
                                                cb.like(cb.lower(root.get("name")), pattern),
                                                cb.like(cb.lower(root.get("description")), pattern)));

                return restaurantRepository.findAll(spec)
                                .stream()
                                .limit(SEARCH_LIMIT)
                                .map(r -> new RestaurantSummaryResponse(
                                                r.getId(), r.getName(), r.getSlug(),
                                                r.getDescription(), r.getPriceLevel(), r.getStatus()))
                                .toList();
        }

        // ── Accommodations ────────────────────────────────────────────────────────

        private List<AccommodationSummaryResponse> searchAccommodations(String pattern) {
                Specification<Accommodation> spec = (root, query, cb) -> cb.and(
                                cb.equal(root.get("status"), "PUBLISHED"),
                                cb.or(
                                                cb.like(cb.lower(root.get("name")), pattern),
                                                cb.like(cb.lower(root.get("description")), pattern)));

                return accommodationRepository.findAll(spec)
                                .stream()
                                .limit(SEARCH_LIMIT)
                                .map(a -> new AccommodationSummaryResponse(
                                                a.getId(), a.getName(), a.getSlug(),
                                                a.getDescription(), a.getAccommodationType(),
                                                a.getPriceFrom(), a.getCurrency()))
                                .toList();
        }

        // ── Events ────────────────────────────────────────────────────────────────

        private List<EventSummaryResponse> searchEvents(String pattern) {
                Specification<Event> spec = (root, query, cb) -> cb.and(
                                cb.equal(root.get("status"), "PUBLISHED"),
                                cb.or(
                                                cb.like(cb.lower(root.get("name")), pattern),
                                                cb.like(cb.lower(root.get("description")), pattern)));

                return eventRepository.findAll(spec)
                                .stream()
                                .limit(SEARCH_LIMIT)
                                .map(e -> new EventSummaryResponse(
                                                e.getId(), e.getName(), e.getSlug(),
                                                e.getDescription(), e.getStartDatetime(), e.getEndDatetime(),
                                                e.getOrganizer(), e.isTicketRequired()))
                                .toList();
        }
}
