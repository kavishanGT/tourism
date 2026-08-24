package com.tashin.tourism.region.dto;

import java.util.UUID;

public record RegionResponse(
        UUID id,
        String name,
        String slug,
        String description,
        UUID parentId) {
}