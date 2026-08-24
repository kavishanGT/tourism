package com.tashin.tourism.destination.dto;

import java.util.UUID;

public record RegionSummary(
                UUID id,
                String name,
                String slug) {
}
