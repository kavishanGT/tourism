package com.tashin.tourism.admin.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tashin.tourism.admin.dto.DashboardResponse;
import com.tashin.tourism.admin.service.AdminDashboardService;
import com.tashin.tourism.common.api.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService service;

    @GetMapping
    public ApiResponse<DashboardResponse> dashboard(Authentication auth) {
        return ApiResponse.success(service.getDashboard(auth));
    }
}
