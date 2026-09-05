package com.tashin.tourism.ai.dto;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiChatResponse(
        String query,
        String answer,
        String status,
        List<CitationDto> citations,
        @JsonProperty("citation_validation") CitationValidationDto citationValidation,
        RetrievalMetadataDto retrieval,
        @JsonProperty("action_plan") Map<String, Object> actionPlan
) {}
