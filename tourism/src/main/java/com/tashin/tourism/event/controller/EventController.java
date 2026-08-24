package com.tashin.tourism.event.controller;

import java.time.Instant;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tashin.tourism.common.PageUtils;
import com.tashin.tourism.common.api.ApiResponse;
import com.tashin.tourism.common.api.PageMapper;
import com.tashin.tourism.event.dto.EventResponse;
import com.tashin.tourism.event.service.EventService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService service;
    private static final Set<String> ALLOWED_SORTS = Set.of("name", "startDatetime", "createdAt");

    @GetMapping
    public ApiResponse<List<EventResponse>> getEvents(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "startDatetime,asc") String[] sort) {
        Pageable pageable = PageUtils.buildPageable(page, size, sort, ALLOWED_SORTS, "startDatetime");
        Page<EventResponse> result = service.search(destination, startDate, endDate, pageable);
        return ApiResponse.success(result.getContent(), PageMapper.meta(result));
    }

    @GetMapping("/{slug}")
    public ApiResponse<EventResponse> getEvent(@PathVariable String slug) {
        return ApiResponse.success(service.getBySlug(slug));
    }
}
