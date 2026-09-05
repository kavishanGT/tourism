package com.tashin.tourism.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.auth.dto.AuthResponse;
import com.tashin.tourism.auth.dto.LoginRequest;
import com.tashin.tourism.auth.dto.RefreshRequest;
import com.tashin.tourism.auth.dto.RegisterRequest;
import com.tashin.tourism.auth.entity.RefreshToken;
import com.tashin.tourism.auth.repository.RefreshTokenRepository;
import com.tashin.tourism.auth.security.JwtService;
import com.tashin.tourism.user.entity.Role;
import com.tashin.tourism.user.entity.User;
import com.tashin.tourism.user.entity.UserProfile;
import com.tashin.tourism.user.repository.RoleRepository;
import com.tashin.tourism.user.repository.UserProfileRepository;
import com.tashin.tourism.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository1;
    private final RoleRepository roleRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;

    // ── Register ────────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        // 1. Email uniqueness check
        if (userRepository1.existsByEmailIgnoreCaseAndDeletedAtIsNull(request.email())) {
            throw new EmailAlreadyExistsException(
                    "Email already registered: " + request.email());
        }

        // 2. Create and persist user
        User user = new User();
        user.setEmail(request.email().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setStatus("ACTIVE");
        user.setEmailVerified(false);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        user = userRepository1.save(user);

        // 3. Assign USER role
        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new IllegalStateException("Role USER not found — run seed migration"));
        user.getRoles().add(userRole);
        user = userRepository1.save(user);

        // 4. Create user profile
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setFirstName(request.firstName());
        profile.setLastName(request.lastName());
        profile.setDisplayName(request.firstName() + " " + request.lastName());
        profile.setCreatedAt(Instant.now());
        profile.setUpdatedAt(Instant.now());
        userProfileRepository.save(profile);

        // 5. Generate tokens and return response
        List<String> roles = user.getRoles().stream().map(Role::getName).toList();
        String accessToken = jwtService.generateAccessToken(user, roles);
        String rawRefresh = issueRefreshToken(user);

        return buildAuthResponse(user, roles, accessToken, rawRefresh);
    }

    // ── Login ────────────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse login(LoginRequest request) {

        // 1. Find user
        User user = userRepository1
                .findByEmailIgnoreCaseAndDeletedAtIsNull(request.email())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        // 2. Verify password
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        // 3. Verify account status
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new AccountDisabledException("Account is " + user.getStatus().toLowerCase());
        }

        // 4. Load roles & generate tokens
        List<String> roles = user.getRoles().stream().map(Role::getName).toList();
        String accessToken = jwtService.generateAccessToken(user, roles);
        String rawRefresh = issueRefreshToken(user);

        // 5. Update last login
        user.setLastLoginAt(Instant.now());
        userRepository1.save(user);

        return buildAuthResponse(user, roles, accessToken, rawRefresh);
    }

    // ── Refresh ──────────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse refreshToken(RefreshRequest request) {
        String hash = hashToken(request.refreshToken());

        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid refresh token"));

        if (!stored.isValid()) {
            throw new InvalidCredentialsException("Refresh token expired or revoked");
        }

        User user = stored.getUser();
        if (user.getDeletedAt() != null || !"ACTIVE".equals(user.getStatus())) {
            throw new AccountDisabledException("Account is unavailable");
        }

        // Rotate: revoke old token, issue new pair
        stored.setRevokedAt(Instant.now());
        refreshTokenRepository.save(stored);

        List<String> roles = user.getRoles().stream().map(Role::getName).toList();
        String accessToken = jwtService.generateAccessToken(user, roles);
        String rawRefresh = issueRefreshToken(user);

        log.debug("Refreshed token pair for user {}", user.getEmail());
        return buildAuthResponse(user, roles, accessToken, rawRefresh);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    private String issueRefreshToken(User user) {
        String raw = jwtService.generateRawRefreshToken();
        RefreshToken entity = RefreshToken.builder()
                .user(user)
                .tokenHash(hashToken(raw))
                .expiresAt(Instant.now().plusMillis(jwtService.getRefreshExpirationMs()))
                .build();
        refreshTokenRepository.save(entity);
        return raw;
    }

    private String hashToken(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private AuthResponse buildAuthResponse(User user, List<String> roles, String accessToken, String refreshToken) {
        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.getAccessTokenExpirySeconds(),
                new AuthResponse.UserInfo(user.getId(), user.getEmail(), roles));
    }

    // ── Inner exception classes ──────────────────────────────────────────────────

    public static class EmailAlreadyExistsException extends RuntimeException {
        public EmailAlreadyExistsException(String msg) {
            super(msg);
        }
    }

    public static class InvalidCredentialsException extends RuntimeException {
        public InvalidCredentialsException(String msg) {
            super(msg);
        }
    }

    public static class AccountDisabledException extends RuntimeException {
        public AccountDisabledException(String msg) {
            super(msg);
        }
    }
}
