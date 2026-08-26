package com.tashin.tourism.admin.dto;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateAttractionRequest(

        @NotNull
        UUID destinationId,

        @NotBlank @Size(max = 200)
        String name,

        @NotBlank @Size(max = 220)
        String slug,

        @Size(max = 500)
        String shortDescription,

        String description,

        @NotNull @DecimalMin("-90") @DecimalMax("90")
        Double latitude,

        @NotNull @DecimalMin("-180") @DecimalMax("180")
        Double longitude,

        Integer durationMinutes,

        BigDecimal priceFrom,

        @Size(max = 3)
        String currency,

        Boolean featured,

        @Size(max = 255)
        String seoTitle,

        String seoDescription
) {}
