package com.tashin.tourism.admin.controller;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tashin.tourism.admin.dto.ProviderActionRequest;
import com.tashin.tourism.admin.service.AdminProviderService;
import com.tashin.tourism.common.PageUtils;
import com.tashin.tourism.common.api.ApiResponse;
import com.tashin.tourism.common.api.PageMapper;
import com.tashin.tourism.provider.entity.Provider;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/admin/providers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminProviderController {

    private final AdminProviderService service;
    private static final Set<String> ALLOWED_SORTS = Set.of("businessName", "createdAt", "verificationStatus");

    @GetMapping
    public ApiResponse<List<Provider>> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort
    ) {
        Pageable pageable = PageUtils.buildPageable(page, size, sort, ALLOWED_SORTS, "createdAt");
        Page<Provider> result = service.list(status, pageable);
        return ApiResponse.success(result.getContent(), PageMapper.meta(result));
    }

    @GetMapping("/{id}")
    public ApiResponse<Provider> getById(@PathVariable UUID id) {
        return ApiResponse.success(service.getById(id));
    }

    @PostMapping("/{id}/review")
    public ApiResponse<Provider> markUnderReview(@PathVariable UUID id, Authentication auth) {
        return ApiResponse.success(service.markUnderReview(id, auth));
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<Provider> approve(
            @PathVariable UUID id,
            @Valid @RequestBody ProviderActionRequest req,
            Authentication auth) {
        return ApiResponse.success(service.approve(id, req, auth));
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<Provider> reject(
            @PathVariable UUID id,
            @Valid @RequestBody ProviderActionRequest req,
            Authentication auth) {
        return ApiResponse.success(service.reject(id, req, auth));
    }

    @PostMapping("/{id}/suspend")
    public ApiResponse<Provider> suspend(
            @PathVariable UUID id,
            @Valid @RequestBody ProviderActionRequest req,
            Authentication auth) {
        return ApiResponse.success(service.suspend(id, req, auth));
    }

    @PostMapping("/{id}/reactivate")
    public ApiResponse<Provider> reactivate(@PathVariable UUID id, Authentication auth) {
        return ApiResponse.success(service.reactivate(id, auth));
    }
}
