package com.tashin.tourism.auth.service;

import java.time.Instant;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.auth.dto.AuthResponse;
import com.tashin.tourism.auth.dto.LoginRequest;
import com.tashin.tourism.auth.dto.RegisterRequest;
import com.tashin.tourism.auth.security.JwtService;
import com.tashin.tourism.user.entity.Role;
import com.tashin.tourism.user.entity.User;
import com.tashin.tourism.user.entity.UserProfile;
import com.tashin.tourism.user.repository.RoleRepository;
import com.tashin.tourism.user.repository.UserProfileRepository;
import com.tashin.tourism.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // ── Register ────────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        // 1. Email uniqueness check
        if (userRepository.existsByEmailIgnoreCaseAndDeletedAtIsNull(request.email())) {
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
        user = userRepository.save(user);

        // 3. Assign USER role
        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new IllegalStateException("Role USER not found — run seed migration"));
        user.getRoles().add(userRole);
        user = userRepository.save(user);

        // 4. Create user profile
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setFirstName(request.firstName());
        profile.setLastName(request.lastName());
        profile.setDisplayName(request.firstName() + " " + request.lastName());
        profile.setCreatedAt(Instant.now());
        profile.setUpdatedAt(Instant.now());
        userProfileRepository.save(profile);

        // 5. Generate token and return response
        List<String> roles = user.getRoles().stream().map(Role::getName).toList();
        String token = jwtService.generateAccessToken(user, roles);

        return buildAuthResponse(user, roles, token);
    }

    // ── Login ────────────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {

        // 1. Find user
        User user = userRepository
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

        // 4. Load roles & generate JWT
        List<String> roles = user.getRoles().stream().map(Role::getName).toList();
        String token = jwtService.generateAccessToken(user, roles);

        // 5. Update last login
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        return buildAuthResponse(user, roles, token);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user, List<String> roles, String token) {
        return new AuthResponse(
                token,
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
