package com.tashin.tourism.ai.dto;

import java.util.List;

public record CitationValidationDto(
        Boolean valid,
        List<String> found,
        List<String> invalid
) {}
