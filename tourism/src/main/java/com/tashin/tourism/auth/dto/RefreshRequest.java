package com.tashin.tourism.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(
        @NotBlank(message = "Refresh token must not be blank")
        @JsonProperty("refresh_token")
        String refreshToken) {
}
