package com.tashin.tourism.admin.controller;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tashin.tourism.admin.dto.AdminDestinationResponse;
import com.tashin.tourism.admin.dto.CreateDestinationRequest;
import com.tashin.tourism.admin.dto.RejectContentRequest;
import com.tashin.tourism.admin.dto.UpdateDestinationRequest;
import com.tashin.tourism.admin.service.AdminDestinationService;
import com.tashin.tourism.common.PageUtils;
import com.tashin.tourism.common.api.ApiResponse;
import com.tashin.tourism.common.api.PageMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/admin/destinations")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminDestinationController {

    private final AdminDestinationService service;
    private static final Set<String> ALLOWED_SORTS = Set.of("name", "createdAt", "updatedAt", "status");

    @PostMapping
    public ResponseEntity<ApiResponse<AdminDestinationResponse>> create(
            @Valid @RequestBody CreateDestinationRequest req, Authentication auth) {
        AdminDestinationResponse response = service.create(req, auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping
    public ApiResponse<List<AdminDestinationResponse>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort
    ) {
        Pageable pageable = PageUtils.buildPageable(page, size, sort, ALLOWED_SORTS, "createdAt");
        Page<AdminDestinationResponse> result = service.list(status, search, pageable);
        return ApiResponse.success(result.getContent(), PageMapper.meta(result));
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminDestinationResponse> getById(@PathVariable UUID id) {
        return ApiResponse.success(service.getById(id));
    }

    @PatchMapping("/{id}")
    public ApiResponse<AdminDestinationResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDestinationRequest req,
            Authentication auth) {
        return ApiResponse.success(service.update(id, req, auth));
    }

    @PostMapping("/{id}/publish")
    public ApiResponse<AdminDestinationResponse> publish(@PathVariable UUID id, Authentication auth) {
        return ApiResponse.success(service.publish(id, auth));
    }

    @PostMapping("/{id}/unpublish")
    public ApiResponse<AdminDestinationResponse> unpublish(@PathVariable UUID id, Authentication auth) {
        return ApiResponse.success(service.unpublish(id, auth));
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<AdminDestinationResponse> reject(
            @PathVariable UUID id,
            @Valid @RequestBody RejectContentRequest req,
            Authentication auth) {
        return ApiResponse.success(service.reject(id, req, auth));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        service.delete(id, auth);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/restore")
    public ApiResponse<AdminDestinationResponse> restore(@PathVariable UUID id, Authentication auth) {
        return ApiResponse.success(service.restore(id, auth));
    }
}
