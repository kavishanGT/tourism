package com.tashin.tourism.trip.service;

import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.accommodation.repository.AccommodationRepository;
import com.tashin.tourism.attraction.repository.AttractionRepository;
import com.tashin.tourism.experience.repository.ExperienceRepository;
import com.tashin.tourism.restaurant.repository.RestaurantRepository;
import com.tashin.tourism.trip.dto.AddTripItemRequest;
import com.tashin.tourism.trip.dto.CreateTripRequest;
import com.tashin.tourism.trip.dto.TripDto;
import com.tashin.tourism.trip.entity.Trip;
import com.tashin.tourism.trip.entity.TripDay;
import com.tashin.tourism.trip.entity.TripItem;
import com.tashin.tourism.trip.repository.TripRepository;
import com.tashin.tourism.user.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripService {

    private final TripRepository tripRepository;
    private final AttractionRepository attractionRepository;
    private final ExperienceRepository experienceRepository;
    private final RestaurantRepository restaurantRepository;
    private final AccommodationRepository accommodationRepository;

    @Transactional
    public TripDto createTrip(User user, CreateTripRequest request) {
        Trip trip = Trip.builder()
                .user(user)
                .title(request.title())
                .description(request.description())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .status("DRAFT")
                .visibility("PRIVATE")
                .source("AI_AGENT")
                .days(new ArrayList<>())
                .build();

        if (request.days() != null && !request.days().isEmpty()) {
            for (var dayReq : request.days()) {
                TripDay day = TripDay.builder()
                        .trip(trip)
                        .dayNumber(dayReq.dayNumber() > 0 ? dayReq.dayNumber() : 1)
                        .date(dayReq.date() != null ? dayReq.date()
                                : (request.startDate() != null ? request.startDate().plusDays(dayReq.dayNumber() - 1)
                                        : null))
                        .title(dayReq.title())
                        .items(new ArrayList<>())
                        .build();

                if (dayReq.items() != null) {
                    int pos = 1;
                    for (var itemReq : dayReq.items()) {
                        TripItem item = TripItem.builder()
                                .tripDay(day)
                                .title(itemReq.title())
                                .startTime(parseTime(itemReq.startTime()))
                                .endTime(parseTime(itemReq.endTime()))
                                .position(pos++)
                                .notes(itemReq.notes())
                                .estimatedCost(itemReq.estimatedCost())
                                .currency(itemReq.currency() != null ? itemReq.currency() : "USD")
                                .build();

                        // Resolve entity if slug or type is provided
                        resolveEntityForItem(item, itemReq.entityType(), itemReq.entitySlug());
                        day.getItems().add(item);
                    }
                }

                trip.getDays().add(day);
            }
        }

        Trip saved = tripRepository.save(trip);
        log.info("Created trip '{}' (ID: {}) for user {}", saved.getTitle(), saved.getId(), user.getEmail());
        return TripDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<TripDto> getUserTrips(User user) {
        return tripRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(TripDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public TripDto getTripById(UUID tripId, User user) {
        Trip trip = tripRepository.findById(tripId)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Trip not found or unauthorized"));
        return TripDto.fromEntity(trip);
    }

    @Transactional
    public TripDto addTripItem(UUID tripId, User user, AddTripItemRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Trip not found or unauthorized"));

        int targetDayNum = request.dayNumber() > 0 ? request.dayNumber() : 1;
        TripDay targetDay = trip.getDays().stream()
                .filter(d -> d.getDayNumber() == targetDayNum)
                .findFirst()
                .orElseGet(() -> {
                    TripDay newDay = TripDay.builder()
                            .trip(trip)
                            .dayNumber(targetDayNum)
                            .title("Day " + targetDayNum)
                            .items(new ArrayList<>())
                            .build();
                    trip.getDays().add(newDay);
                    return newDay;
                });

        TripItem item = TripItem.builder()
                .tripDay(targetDay)
                .title(request.title())
                .startTime(parseTime(request.startTime()))
                .endTime(parseTime(request.endTime()))
                .position(targetDay.getItems().size() + 1)
                .notes(request.notes())
                .estimatedCost(request.estimatedCost())
                .currency(request.currency() != null ? request.currency() : "USD")
                .build();

        if (request.entityId() != null && request.entityType() != null) {
            resolveEntityById(item, request.entityType(), request.entityId());
        } else if (request.entitySlug() != null && request.entityType() != null) {
            resolveEntityForItem(item, request.entityType(), request.entitySlug());
        }

        targetDay.getItems().add(item);
        Trip saved = tripRepository.save(trip);
        return TripDto.fromEntity(saved);
    }

    @Transactional
    public void deleteTrip(UUID tripId, User user) {
        Trip trip = tripRepository.findById(tripId)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Trip not found or unauthorized"));
        tripRepository.delete(trip);
    }

    private void resolveEntityForItem(TripItem item, String type, String slug) {
        if (type == null || slug == null || slug.isBlank())
            return;
        try {
            switch (type.toUpperCase()) {
                case "ATTRACTION" ->
                    attractionRepository.findBySlugAndDeletedAtIsNull(slug).ifPresent(item::setAttraction);
                case "EXPERIENCE" ->
                    experienceRepository.findBySlugAndDeletedAtIsNull(slug).ifPresent(item::setExperience);
                case "RESTAURANT" -> restaurantRepository.findBySlug(slug).ifPresent(item::setRestaurant);
                case "ACCOMMODATION" -> accommodationRepository.findBySlug(slug).ifPresent(item::setAccommodation);
            }
        } catch (Exception e) {
            log.debug("Could not resolve entity by slug {}: {}", slug, e.getMessage());
        }
    }

    private void resolveEntityById(TripItem item, String type, UUID id) {
        if (type == null || id == null)
            return;
        try {
            switch (type.toUpperCase()) {
                case "ATTRACTION" -> attractionRepository.findById(id).ifPresent(item::setAttraction);
                case "EXPERIENCE" -> experienceRepository.findById(id).ifPresent(item::setExperience);
                case "RESTAURANT" -> restaurantRepository.findById(id).ifPresent(item::setRestaurant);
                case "ACCOMMODATION" -> accommodationRepository.findById(id).ifPresent(item::setAccommodation);
            }
        } catch (Exception e) {
            log.debug("Could not resolve entity by id {}: {}", id, e.getMessage());
        }
    }

    /**
     * Safely parse an "HH:mm" or "HH:mm:ss" string to LocalTime.
     * Returns null for blank or unparseable values instead of throwing.
     */
    private LocalTime parseTime(String value) {
        if (value == null || value.isBlank())
            return null;
        try {
            return LocalTime.parse(value.trim());
        } catch (DateTimeParseException e) {
            log.debug("Could not parse time value '{}': {}", value, e.getMessage());
            return null;
        }
    }
}
