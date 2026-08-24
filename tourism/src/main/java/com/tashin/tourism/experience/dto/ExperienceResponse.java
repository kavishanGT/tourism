package com.tashin.tourism.experience.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ExperienceResponse(
                UUID id,
                String name,
                String slug,
                String shortDescription,
                String description,
                Integer durationMinutes,
                int minGuests,
                Integer maxGuests,
                BigDecimal priceFrom,
                String currency,
                Double latitude,
                Double longitude,
                String status,
                boolean featured,
                UUID destinationId,
                String destinationName,
                UUID providerId,
                String providerName) {
}
