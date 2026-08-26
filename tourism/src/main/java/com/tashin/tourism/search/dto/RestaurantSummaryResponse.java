package com.tashin.tourism.search.dto;

import java.util.UUID;

public record RestaurantSummaryResponse(
                UUID id,
                String name,
                String slug,
                String description,
                String priceLevel,
                String status) {
}
