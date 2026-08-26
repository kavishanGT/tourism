package com.tashin.tourism.search.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tashin.tourism.common.api.ApiResponse;
import com.tashin.tourism.search.dto.SearchResponse;
import com.tashin.tourism.search.service.SearchService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService service;

    /**
     * Global search across destinations, attractions, experiences,
     * restaurants, accommodations and events.
     *
     * GET /api/v1/search?q=ella
     */
    @GetMapping
    public ApiResponse<SearchResponse> search(@RequestParam String q) {

        if (q == null || q.trim().length() < 2) {
            throw new IllegalArgumentException(
                    "Search query must contain at least 2 characters");
        }

        return ApiResponse.success(service.search(q.trim()));
    }
}
