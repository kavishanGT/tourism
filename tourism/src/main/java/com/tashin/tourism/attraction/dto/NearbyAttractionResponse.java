package com.tashin.tourism.attraction.dto;

import java.util.UUID;

public record NearbyAttractionResponse(
                UUID id,
                String name,
                String slug,
                double latitude,
                double longitude,
                double distanceMeters) {
}
