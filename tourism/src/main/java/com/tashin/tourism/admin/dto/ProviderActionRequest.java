package com.tashin.tourism.admin.dto;

import jakarta.validation.constraints.Size;

public record ProviderActionRequest(
        @Size(max = 1000)
        String notes,

        @Size(max = 1000)
        String reason
) {}
