package com.tashin.tourism.admin.dto;

import jakarta.validation.constraints.Size;

public record UpdateDestinationRequest(

        @Size(max = 200)
        String name,

        @Size(max = 500)
        String shortDescription,

        String description,

        Double latitude,
        Double longitude,

        Boolean featured,

        @Size(max = 255)
        String seoTitle,

        @Size(max = 500)
        String seoDescription
) {}
