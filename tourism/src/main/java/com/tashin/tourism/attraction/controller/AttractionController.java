package com.tashin.tourism.attraction.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tashin.tourism.attraction.dto.AttractionResponse;
import com.tashin.tourism.attraction.dto.NearbyAttractionResponse;
import com.tashin.tourism.attraction.service.AttractionService;
import com.tashin.tourism.common.PageUtils;
import com.tashin.tourism.common.api.ApiResponse;
import com.tashin.tourism.common.api.PageMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/attractions")
@RequiredArgsConstructor
public class AttractionController {

    private final AttractionService service;

    private static final Set<String> ALLOWED_SORTS = Set.of("name", "priceFrom", "createdAt", "updatedAt");

    @GetMapping
    public ApiResponse<List<AttractionResponse>> getAttractions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "name,asc") String[] sort) {
        Pageable pageable = PageUtils.buildPageable(page, size, sort, ALLOWED_SORTS, "name");
        Page<AttractionResponse> result = service.search(search, destination, featured, minPrice, maxPrice, pageable);
        return ApiResponse.success(result.getContent(), PageMapper.meta(result));
    }

    @GetMapping("/nearby")
    public ApiResponse<List<NearbyAttractionResponse>> nearby(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "5000") double radius) {
        if (radius <= 0 || radius > 100_000) {
            throw new IllegalArgumentException("Radius must be between 1 and 100000 meters");
        }
        return ApiResponse.success(service.findNearby(latitude, longitude, radius));
    }

    @GetMapping("/{slug}")
    public ApiResponse<AttractionResponse> getAttraction(@PathVariable String slug) {
        return ApiResponse.success(service.getBySlug(slug));
    }
}
