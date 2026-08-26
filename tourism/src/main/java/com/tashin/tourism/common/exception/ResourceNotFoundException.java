package com.tashin.tourism.common.exception;

public class ResourceNotFoundException extends RuntimeException {

    private final String code;

    public ResourceNotFoundException(String code, String message) {
        super(message);
        this.code = code;
    }

    public ResourceNotFoundException(String code) {
        super(code.replace('_', ' ').toLowerCase());
        this.code = code;
    }

    public String getCode() { return code; }
}
