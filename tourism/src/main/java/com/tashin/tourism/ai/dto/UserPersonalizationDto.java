package com.tashin.tourism.ai.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserPersonalizationDto(
        @JsonProperty("profile") UserProfileContextDto profile,
        @JsonProperty("favorites") List<UserFavoriteItemDto> favorites,
        @JsonProperty("saved_trips") List<UserSavedTripDto> savedTrips,
        @JsonProperty("active_trip_id") String activeTripId) {

    public record UserProfileContextDto(
            @JsonProperty("user_id") String userId,
            @JsonProperty("display_name") String displayName,
            @JsonProperty("first_name") String firstName,
            @JsonProperty("country_code") String countryCode,
            @JsonProperty("preferred_language") String preferredLanguage,
            @JsonProperty("bio") String bio,
            @JsonProperty("travel_styles") List<String> travelStyles,
            @JsonProperty("dietary_preferences") List<String> dietaryPreferences) {
    }

    public record UserFavoriteItemDto(
            @JsonProperty("entity_type") String entityType,
            @JsonProperty("entity_id") String entityId,
            @JsonProperty("title") String title,
            @JsonProperty("category") String category,
            @JsonProperty("region") String region,
            @JsonProperty("slug") String slug) {
    }

    public record UserSavedTripDto(
            @JsonProperty("trip_id") String tripId,
            @JsonProperty("title") String title,
            @JsonProperty("description") String description,
            @JsonProperty("start_date") String startDate,
            @JsonProperty("end_date") String endDate,
            @JsonProperty("status") String status,
            @JsonProperty("days") List<UserTripDayDto> days) {
    }

    public record UserTripDayDto(
            @JsonProperty("day_number") int dayNumber,
            @JsonProperty("date") String date,
            @JsonProperty("title") String title,
            @JsonProperty("items") List<UserTripDayItemDto> items) {
    }

    public record UserTripDayItemDto(
            @JsonProperty("title") String title,
            @JsonProperty("entity_type") String entityType,
            @JsonProperty("entity_title") String entityTitle,
            @JsonProperty("start_time") String startTime,
            @JsonProperty("end_time") String endTime,
            @JsonProperty("notes") String notes) {
    }
}
