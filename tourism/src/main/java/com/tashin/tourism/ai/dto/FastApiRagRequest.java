package com.tashin.tourism.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record FastApiRagRequest(
        @JsonProperty("query") String query,
        @JsonProperty("retrieval_mode") String retrievalMode,
        @JsonProperty("top_k") Integer topK,
        @JsonProperty("user_context") UserPersonalizationDto userContext) {
}
