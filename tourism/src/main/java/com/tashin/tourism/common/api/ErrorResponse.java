package com.tashin.tourism.common.api;

public record ErrorResponse(
        String code,
        String message) {

    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(code, message);
    }

    public static ErrorResponse of(String message) {
        return new ErrorResponse("ERROR", message);
    }
}
