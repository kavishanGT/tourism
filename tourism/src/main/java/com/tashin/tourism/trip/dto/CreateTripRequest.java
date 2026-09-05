package com.tashin.tourism.trip.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTripRequest(
                @NotBlank(message = "Title must not be blank") @Size(max = 250, message = "Title must not exceed 250 characters") String title,

                String description,

                String destination,

                @JsonProperty("start_date") LocalDate startDate,

                @JsonProperty("end_date") LocalDate endDate,

                List<CreateTripDayRequest> days) {

        public record CreateTripDayRequest(
                        @JsonProperty("day_number") int dayNumber,

                        LocalDate date,

                        String title,

                        List<CreateTripItemRequest> items) {
        }

        public record CreateTripItemRequest(
                        @NotBlank(message = "Item title must not be blank") String title,

                        @JsonProperty("entity_type") String entityType,

                        @JsonProperty("entity_slug") String entitySlug,

                        // Accept as plain "HH:mm" string — converted to LocalTime in TripService
                        @JsonProperty("start_time") String startTime,

                        @JsonProperty("end_time") String endTime,

                        String notes,

                        @JsonProperty("estimated_cost") BigDecimal estimatedCost,

                        String currency) {
        }
}
