package com.tashin.tourism.search.dto;

import java.util.UUID;

public record DestinationSummaryResponse(
                UUID id,
                String name,
                String slug,
                String shortDescription,
                boolean featured,
                String status) {
}
