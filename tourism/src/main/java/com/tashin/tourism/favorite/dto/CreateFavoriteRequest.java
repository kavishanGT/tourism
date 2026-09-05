package com.tashin.tourism.favorite.dto;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

public record CreateFavoriteRequest(
        @NotBlank(message = "Entity type must not be blank")
        @JsonProperty("entity_type")
        String entityType,

        @JsonProperty("entity_id")
        UUID entityId,

        @JsonProperty("entity_slug")
        String entitySlug) {
}
