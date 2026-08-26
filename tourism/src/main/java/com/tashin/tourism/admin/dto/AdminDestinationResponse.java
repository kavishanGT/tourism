package com.tashin.tourism.admin.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminDestinationResponse(
        UUID id,
        String name,
        String slug,
        String shortDescription,
        String description,
        double latitude,
        double longitude,
        boolean featured,
        String status,
        String seoTitle,
        String seoDescription,
        UUID regionId,
        String regionName,
        Instant createdAt,
        Instant updatedAt,
        Instant publishedAt,
        UUID publishedBy,
        String rejectionReason,
        Instant deletedAt
) {}
