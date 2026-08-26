package com.tashin.tourism.search.dto;

import java.time.Instant;
import java.util.UUID;

public record EventSummaryResponse(
                UUID id,
                String name,
                String slug,
                String description,
                Instant startDatetime,
                Instant endDatetime,
                String organizer,
                boolean ticketRequired) {
}
