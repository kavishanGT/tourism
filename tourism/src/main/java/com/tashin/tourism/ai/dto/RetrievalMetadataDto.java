package com.tashin.tourism.ai.dto;

import java.util.Map;
import com.fasterxml.jackson.annotation.JsonProperty;

public record RetrievalMetadataDto(
        @JsonProperty("requested_mode") String requestedMode,
        @JsonProperty("execution_mode") String executionMode,
        @JsonProperty("top_k") Integer topK,
        @JsonProperty("db_results_count") Integer dbResultsCount,
        @JsonProperty("doc_results_count") Integer docResultsCount,
        Map<String, Object> route
) {}
