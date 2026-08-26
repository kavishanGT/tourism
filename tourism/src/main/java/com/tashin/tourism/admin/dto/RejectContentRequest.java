package com.tashin.tourism.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RejectContentRequest(
        @NotBlank @Size(max = 1000)
        String reason
) {}
