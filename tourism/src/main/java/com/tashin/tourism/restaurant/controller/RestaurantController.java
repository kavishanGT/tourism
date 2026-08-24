package com.tashin.tourism.restaurant.controller;

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
import com.tashin.tourism.restaurant.dto.RestaurantResponse;
import com.tashin.tourism.restaurant.service.RestaurantService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService service;
    private static final Set<String> ALLOWED_SORTS = Set.of("name", "createdAt", "priceLevel");

    @GetMapping
    public ApiResponse<List<RestaurantResponse>> getRestaurants(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String priceLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "name,asc") String[] sort) {
        Pageable pageable = PageUtils.buildPageable(page, size, sort, ALLOWED_SORTS, "name");
        Page<RestaurantResponse> result = service.search(destination, priceLevel, pageable);
        return ApiResponse.success(result.getContent(), PageMapper.meta(result));
    }

    @GetMapping("/nearby")
    public ApiResponse<List<RestaurantResponse>> nearby(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "5000") double radius) {
        if (radius <= 0 || radius > 100_000) {
            throw new IllegalArgumentException("Radius must be between 1 and 100000 meters");
        }
        return ApiResponse.success(service.findNearby(latitude, longitude, radius));
    }

    @GetMapping("/{slug}")
    public ApiResponse<RestaurantResponse> getRestaurant(@PathVariable String slug) {
        return ApiResponse.success(service.getBySlug(slug));
    }
}
