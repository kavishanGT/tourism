package com.tashin.tourism.trip.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

public record AddTripItemRequest(
                @JsonProperty("day_number") int dayNumber,

                @NotBlank(message = "Title must not be blank") String title,

                @JsonProperty("entity_type") String entityType,

                @JsonProperty("entity_id") UUID entityId,

                @JsonProperty("entity_slug") String entitySlug,

                // Accept as plain "HH:mm" string — converted to LocalTime in TripService
                @JsonProperty("start_time") String startTime,

                @JsonProperty("end_time") String endTime,

                String notes,

                @JsonProperty("estimated_cost") BigDecimal estimatedCost,

                String currency) {
}
