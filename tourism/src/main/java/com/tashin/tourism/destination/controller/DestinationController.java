package com.tashin.tourism.destination.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tashin.tourism.common.api.ApiResponse;
import com.tashin.tourism.common.api.PageMapper;
import com.tashin.tourism.destination.dto.DestinationResponse;
import com.tashin.tourism.destination.service.DestinationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationService service;

    private static final int MAX_PAGE_SIZE = 100;

    /**
     * Only these fields are safe to sort by — prevents SQL injection via property
     * names.
     */
    private static final Set<String> ALLOWED_SORTS = Set.of("name", "createdAt", "updatedAt");

    @GetMapping
    public ApiResponse<List<DestinationResponse>> getDestinations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "name,asc") String[] sort) {
        int safeSize = Math.min(size, MAX_PAGE_SIZE);

        Sort sorting = Sort.by(
                Arrays.stream(sort)
                        .map(value -> {
                            String[] parts = value.split(",");
                            String field = parts[0].trim();

                            // ── Sort whitelist ─────────────────────────────
                            if (!ALLOWED_SORTS.contains(field)) {
                                field = "name"; // safe default
                            }

                            Sort.Direction dir = (parts.length > 1
                                    && parts[1].trim().equalsIgnoreCase("desc"))
                                            ? Sort.Direction.DESC
                                            : Sort.Direction.ASC;

                            return new Sort.Order(dir, field);
                        })
                        .toList());

        Pageable pageable = PageRequest.of(Math.max(page, 0), safeSize, sorting);

        Page<DestinationResponse> result = service.search(search, region, featured, pageable);

        return ApiResponse.success(result.getContent(), PageMapper.meta(result));
    }

    @GetMapping("/{slug}")
    public ApiResponse<DestinationResponse> getDestination(@PathVariable String slug) {
        return ApiResponse.success(service.getBySlug(slug));
    }
}
