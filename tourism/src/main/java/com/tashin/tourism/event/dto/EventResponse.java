package com.tashin.tourism.event.dto;

import java.time.Instant;
import java.util.UUID;

public record EventResponse(
                UUID id,
                String name,
                String slug,
                String description,
                Instant startDatetime,
                Instant endDatetime,
                Double latitude,
                Double longitude,
                String organizer,
                boolean ticketRequired,
                String ticketUrl,
                String status,
                UUID destinationId,
                String destinationName) {
}
