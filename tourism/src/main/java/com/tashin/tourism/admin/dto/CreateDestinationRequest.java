package com.tashin.tourism.admin.dto;

import java.util.UUID;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateDestinationRequest(

        @NotBlank @Size(max = 200)
        String name,

        @NotBlank @Size(max = 220)
        String slug,

        UUID regionId,

        @Size(max = 500)
        String shortDescription,

        String description,

        @NotNull @DecimalMin("-90") @DecimalMax("90")
        Double latitude,

        @NotNull @DecimalMin("-180") @DecimalMax("180")
        Double longitude,

        Boolean featured,

        @Size(max = 255)
        String seoTitle,

        @Size(max = 500)
        String seoDescription
) {}
