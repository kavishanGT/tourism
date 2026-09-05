package com.tashin.tourism.favorite.dto;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

public record FavoriteDto(
        UUID id,
        @JsonProperty("entity_type") String entityType,
        @JsonProperty("entity_id") UUID entityId,
        String title,
        String slug,
        String region,
        String category,
        @JsonProperty("created_at") Instant createdAt) {
}
