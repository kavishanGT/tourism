package com.tashin.tourism.search.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ExperienceSummaryResponse(
                UUID id,
                String name,
                String slug,
                String shortDescription,
                Integer durationMinutes,
                BigDecimal priceFrom,
                String currency,
                boolean featured) {
}
