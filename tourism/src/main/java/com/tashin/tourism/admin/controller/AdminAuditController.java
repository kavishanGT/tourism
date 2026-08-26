package com.tashin.tourism.admin.controller;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tashin.tourism.audit.entity.AuditLog;
import com.tashin.tourism.audit.repository.AuditLogRepository;
import com.tashin.tourism.common.PageUtils;
import com.tashin.tourism.common.api.ApiResponse;
import com.tashin.tourism.common.api.PageMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminAuditController {

    private final AuditLogRepository repository;
    private static final Set<String> ALLOWED_SORTS = Set.of("createdAt", "action", "entityType");

    @GetMapping
    public ApiResponse<List<AuditLog>> list(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) UUID entityId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {
        Pageable pageable = PageUtils.buildPageable(page, size, sort, ALLOWED_SORTS, "createdAt");
        Page<AuditLog> result = repository.search(userId, action, entityType, entityId, from, to, pageable);
        return ApiResponse.success(result.getContent(), PageMapper.meta(result));
    }
}
