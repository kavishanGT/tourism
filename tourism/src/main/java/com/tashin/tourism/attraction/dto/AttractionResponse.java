package com.tashin.tourism.attraction.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record AttractionResponse(
                UUID id,
                String name,
                String slug,
                String shortDescription,
                String description,
                double latitude,
                double longitude,
                Integer durationMinutes,
                BigDecimal priceFrom,
                String currency,
                String status,
                boolean featured,
                UUID destinationId,
                String destinationName) {
}
