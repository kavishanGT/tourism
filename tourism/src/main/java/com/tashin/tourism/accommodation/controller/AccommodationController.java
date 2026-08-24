package com.tashin.tourism.accommodation.controller;

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

import com.tashin.tourism.accommodation.dto.AccommodationResponse;
import com.tashin.tourism.accommodation.service.AccommodationService;
import com.tashin.tourism.common.PageUtils;
import com.tashin.tourism.common.api.ApiResponse;
import com.tashin.tourism.common.api.PageMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/accommodations")
@RequiredArgsConstructor
public class AccommodationController {

    private final AccommodationService service;
    private static final Set<String> ALLOWED_SORTS = Set.of("name", "priceFrom", "createdAt");

    @GetMapping
    public ApiResponse<List<AccommodationResponse>> getAccommodations(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "name,asc") String[] sort) {
        Pageable pageable = PageUtils.buildPageable(page, size, sort, ALLOWED_SORTS, "name");
        Page<AccommodationResponse> result = service.search(destination, type, minPrice, maxPrice, pageable);
        return ApiResponse.success(result.getContent(), PageMapper.meta(result));
    }

    @GetMapping("/{slug}")
    public ApiResponse<AccommodationResponse> getAccommodation(@PathVariable String slug) {
        return ApiResponse.success(service.getBySlug(slug));
    }
}
