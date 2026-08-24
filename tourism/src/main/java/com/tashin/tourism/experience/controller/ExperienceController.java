package com.tashin.tourism.experience.controller;

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

import com.tashin.tourism.common.PageUtils;
import com.tashin.tourism.common.api.ApiResponse;
import com.tashin.tourism.common.api.PageMapper;
import com.tashin.tourism.experience.dto.ExperienceResponse;
import com.tashin.tourism.experience.service.ExperienceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/experiences")
@RequiredArgsConstructor
public class ExperienceController {

    private final ExperienceService service;
    private static final Set<String> ALLOWED_SORTS = Set.of("name", "priceFrom", "createdAt");

    @GetMapping
    public ApiResponse<List<ExperienceResponse>> getExperiences(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minDuration,
            @RequestParam(required = false) Integer maxDuration,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "name,asc") String[] sort) {
        Pageable pageable = PageUtils.buildPageable(page, size, sort, ALLOWED_SORTS, "name");
        Page<ExperienceResponse> result = service.search(destination, minPrice, maxPrice, minDuration, maxDuration,
                pageable);
        return ApiResponse.success(result.getContent(), PageMapper.meta(result));
    }

    @GetMapping("/{slug}")
    public ApiResponse<ExperienceResponse> getExperience(@PathVariable String slug) {
        return ApiResponse.success(service.getBySlug(slug));
    }
}
