package com.tashin.tourism.region.controller;

import com.tashin.tourism.common.api.ApiResponse;
import com.tashin.tourism.region.dto.RegionResponse;
import com.tashin.tourism.region.service.RegionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/regions")
@RequiredArgsConstructor
public class RegionController {

    private final RegionService service;

    @GetMapping
    public ApiResponse<List<RegionResponse>> getRegions() {
        return ApiResponse.success(
                service.getAll());
    }

    @GetMapping("/{slug}")
    public ApiResponse<RegionResponse> getRegion(
            @PathVariable String slug) {
        return ApiResponse.success(
                service.getBySlug(slug));
    }
}