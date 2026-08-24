package com.tashin.tourism.accommodation.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record AccommodationResponse(
                UUID id,
                String name,
                String slug,
                String description,
                String accommodationType,
                BigDecimal priceFrom,
                String currency,
                Double latitude,
                Double longitude,
                String status,
                UUID destinationId,
                String destinationName) {
}
