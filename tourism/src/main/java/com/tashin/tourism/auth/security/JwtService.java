package com.tashin.tourism.auth.security;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.tashin.tourism.user.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtService {

    private final SecretKey key;
    private final long refreshExpirationMs;
    private static final long ACCESS_TOKEN_EXPIRY_SECONDS = 900; // 15 minutes
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.refresh-expiration:604800000}") long refreshExpirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String generateAccessToken(User user, Collection<String> roles) {
        var now = new Date();
        var expiry = new Date(now.getTime() + ACCESS_TOKEN_EXPIRY_SECONDS * 1000);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    /** Generate a cryptographically secure opaque refresh token (URL-safe Base64, 256 bits). */
    public String generateRawRefreshToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }

    public String extractUserId(String token) {
        return parseClaims(token).getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        return parseClaims(token).get("roles", List.class);
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getAccessTokenExpirySeconds() {
        return ACCESS_TOKEN_EXPIRY_SECONDS;
    }
}
