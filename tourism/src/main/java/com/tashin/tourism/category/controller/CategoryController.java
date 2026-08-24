package com.tashin.tourism.category.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tashin.tourism.category.dto.CategoryResponse;
import com.tashin.tourism.category.service.CategoryService;
import com.tashin.tourism.common.api.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService service;

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getCategories() {
        return ApiResponse.success(service.getAll());
    }

    @GetMapping("/{slug}")
    public ApiResponse<CategoryResponse> getCategory(@PathVariable String slug) {
        return ApiResponse.success(service.getBySlug(slug));
    }
}
