package com.tashin.tourism.destination.dto;

import java.util.UUID;

public record DestinationResponse(
                UUID id,
                String name,
                String slug,
                String shortDescription,
                String description,
                LocationResponse location,
                RegionSummary region,
                boolean featured,
                String status,
                String seoTitle,
                String seoDescription) {
}
