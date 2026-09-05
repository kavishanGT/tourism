package com.tashin.tourism.auth.dto;

import java.util.List;
import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserInfo user) {

    public record UserInfo(
            UUID id,
            String email,
            List<String> roles) {
    }
}
