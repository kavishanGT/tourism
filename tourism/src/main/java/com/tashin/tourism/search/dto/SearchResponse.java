package com.tashin.tourism.search.dto;

import java.util.List;

public record SearchResponse(
                String query,
                List<DestinationSummaryResponse> destinations,
                List<AttractionSummaryResponse> attractions,
                List<ExperienceSummaryResponse> experiences,
                List<RestaurantSummaryResponse> restaurants,
                List<AccommodationSummaryResponse> accommodations,
                List<EventSummaryResponse> events) {
}
