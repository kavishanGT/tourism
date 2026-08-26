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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tashin.tourism.admin.dto.CreateAttractionRequest;
import com.tashin.tourism.admin.dto.RejectContentRequest;
import com.tashin.tourism.admin.service.AdminAttractionService;
import com.tashin.tourism.attraction.dto.AttractionResponse;
import com.tashin.tourism.common.PageUtils;
import com.tashin.tourism.common.api.ApiResponse;
import com.tashin.tourism.common.api.PageMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/admin/attractions")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminAttractionController {

    private final AdminAttractionService service;
    private static final Set<String> ALLOWED_SORTS = Set.of("name", "createdAt", "status");

    @PostMapping
    public ResponseEntity<ApiResponse<AttractionResponse>> create(
            @Valid @RequestBody CreateAttractionRequest req, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(service.create(req, auth)));
    }

    @GetMapping
    public ApiResponse<List<AttractionResponse>> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {
        Pageable pageable = PageUtils.buildPageable(page, size, sort, ALLOWED_SORTS, "createdAt");
        Page<AttractionResponse> result = service.list(status, pageable);
        return ApiResponse.success(result.getContent(), PageMapper.meta(result));
    }

    @PostMapping("/{id}/publish")
    public ApiResponse<AttractionResponse> publish(@PathVariable UUID id, Authentication auth) {
        return ApiResponse.success(service.publish(id, auth));
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<AttractionResponse> reject(
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
    public ApiResponse<AttractionResponse> restore(@PathVariable UUID id, Authentication auth) {
        return ApiResponse.success(service.restore(id, auth));
    }
}
