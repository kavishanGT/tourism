package com.tashin.tourism.common.api;

import lombok.Builder;

@Builder
public record ApiResponse<T>(
        boolean success,
        T data,
        MetaResponse meta,
        ErrorResponse error) {

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(
                true,
                data,
                null,
                null);
    }

    public static <T> ApiResponse<T> success(
            T data,
            MetaResponse meta) {
        return new ApiResponse<>(
                true,
                data,
                meta,
                null);
    }

    public static <T> ApiResponse<T> failure(
            ErrorResponse error) {
        return new ApiResponse<>(
                false,
                null,
                null,
                error);
    }
}
