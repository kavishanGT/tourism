package com.tashin.tourism.search.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record AttractionSummaryResponse(
                UUID id,
                String name,
                String slug,
                String shortDescription,
                BigDecimal priceFrom,
                String currency,
                boolean featured) {
}
