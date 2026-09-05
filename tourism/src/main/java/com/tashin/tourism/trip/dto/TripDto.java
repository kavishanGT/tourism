package com.tashin.tourism.trip.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tashin.tourism.trip.entity.Trip;
import com.tashin.tourism.trip.entity.TripDay;
import com.tashin.tourism.trip.entity.TripItem;

public record TripDto(
        UUID id,
        UUID userId,
        String title,
        String description,
        @JsonProperty("start_date") LocalDate startDate,
        @JsonProperty("end_date") LocalDate endDate,
        String status,
        String visibility,
        String source,
        List<TripDayDto> days,
        @JsonProperty("created_at") Instant createdAt,
        @JsonProperty("updated_at") Instant updatedAt) {

    public record TripDayDto(
            UUID id,
            @JsonProperty("day_number") int dayNumber,
            LocalDate date,
            String title,
            List<TripItemDto> items) {
    }

    public record TripItemDto(
            UUID id,
            String title,
            @JsonProperty("entity_type") String entityType,
            @JsonProperty("entity_title") String entityTitle,
            @JsonProperty("entity_id") UUID entityId,
            @JsonProperty("start_time") LocalTime startTime,
            @JsonProperty("end_time") LocalTime endTime,
            int position,
            String notes,
            @JsonProperty("estimated_cost") BigDecimal estimatedCost,
            String currency) {
    }

    public static TripDto fromEntity(Trip trip) {
        List<TripDayDto> dayDtos = trip.getDays() != null ? trip.getDays().stream()
                .map(TripDto::fromDayEntity)
                .toList() : List.of();

        return new TripDto(
                trip.getId(),
                trip.getUser() != null ? trip.getUser().getId() : null,
                trip.getTitle(),
                trip.getDescription(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getStatus(),
                trip.getVisibility(),
                trip.getSource(),
                dayDtos,
                trip.getCreatedAt(),
                trip.getUpdatedAt());
    }

    public static TripDayDto fromDayEntity(TripDay day) {
        List<TripItemDto> itemDtos = day.getItems() != null ? day.getItems().stream()
                .map(TripDto::fromItemEntity)
                .toList() : List.of();

        return new TripDayDto(
                day.getId(),
                day.getDayNumber(),
                day.getDate(),
                day.getTitle(),
                itemDtos);
    }

    public static TripItemDto fromItemEntity(TripItem itm) {
        String entityType = null;
        String entityTitle = null;
        UUID entityId = null;

        if (itm.getAttraction() != null) {
            entityType = "ATTRACTION";
            entityTitle = itm.getAttraction().getName();
            entityId = itm.getAttraction().getId();
        } else if (itm.getExperience() != null) {
            entityType = "EXPERIENCE";
            entityTitle = itm.getExperience().getName();
            entityId = itm.getExperience().getId();
        } else if (itm.getRestaurant() != null) {
            entityType = "RESTAURANT";
            entityTitle = itm.getRestaurant().getName();
            entityId = itm.getRestaurant().getId();
        } else if (itm.getAccommodation() != null) {
            entityType = "ACCOMMODATION";
            entityTitle = itm.getAccommodation().getName();
            entityId = itm.getAccommodation().getId();
        }

        return new TripItemDto(
                itm.getId(),
                itm.getTitle(),
                entityType,
                entityTitle,
                entityId,
                itm.getStartTime(),
                itm.getEndTime(),
                itm.getPosition(),
                itm.getNotes(),
                itm.getEstimatedCost(),
                itm.getCurrency() != null ? itm.getCurrency().trim() : "USD");
    }
}
