package com.tashin.tourism.search.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record AccommodationSummaryResponse(
                UUID id,
                String name,
                String slug,
                String description,
                String accommodationType,
                BigDecimal priceFrom,
                String currency) {
}
