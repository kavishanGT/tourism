package com.tashin.tourism.common.api;

public record MetaResponse(
        int page,
        int size,
        long totalElements,
        int totalPages) {
}
