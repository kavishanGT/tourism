package com.tashin.tourism.restaurant.dto;

import java.util.UUID;

public record RestaurantResponse(
                UUID id,
                String name,
                String slug,
                String description,
                String priceLevel,
                Double latitude,
                Double longitude,
                String status,
                UUID destinationId,
                String destinationName) {
}
