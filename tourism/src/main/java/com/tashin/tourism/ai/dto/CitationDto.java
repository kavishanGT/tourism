package com.tashin.tourism.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CitationDto(
        @JsonProperty("citation_id") String citationId,
        @JsonProperty("source_type") String sourceType,
        @JsonProperty("entity_type") String entityType,
        String title,
        String slug,
        String category,
        String region,
        @JsonProperty("document_id") String documentId,
        @JsonProperty("file_name") String fileName,
        @JsonProperty("page_number") Integer pageNumber,
        String section
) {}
