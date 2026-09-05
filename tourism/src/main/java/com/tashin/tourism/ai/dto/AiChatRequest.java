package com.tashin.tourism.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiChatRequest(
        @NotBlank(message = "Query must not be empty")
        @Size(min = 1, max = 2000, message = "Query length must be between 1 and 2000 characters")
        String query,

        String retrievalMode,

        Integer topK
) {
    public AiChatRequest {
        if (retrievalMode == null || retrievalMode.isBlank()) {
            retrievalMode = "auto";
        }
        if (topK == null || topK < 1) {
            topK = 5;
        }
    }
}
