package com.tashin.tourism.auth.controller;

import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.tashin.tourism.auth.service.AuthService;
import com.tashin.tourism.common.api.ApiResponse;
import com.tashin.tourism.common.api.ErrorResponse;
import com.tashin.tourism.common.exception.BusinessException;
import com.tashin.tourism.common.exception.ConflictException;
import com.tashin.tourism.common.exception.ResourceNotFoundException;

import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.failure(ErrorResponse.of(ex.getCode(), ex.getMessage())));
        }

        @ExceptionHandler(ConflictException.class)
        public ResponseEntity<ApiResponse<Void>> handleConflict(ConflictException ex) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(ApiResponse.failure(ErrorResponse.of(ex.getCode(), ex.getMessage())));
        }

        @ExceptionHandler(BusinessException.class)
        public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException ex) {
                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                                .body(ApiResponse.failure(ErrorResponse.of(ex.getCode(), ex.getMessage())));
        }

        @ExceptionHandler(AuthService.EmailAlreadyExistsException.class)
        public ResponseEntity<ApiResponse<Void>> handleEmailExists(AuthService.EmailAlreadyExistsException ex) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(ApiResponse.failure(ErrorResponse.of("EMAIL_EXISTS", ex.getMessage())));
        }

        @ExceptionHandler(AuthService.InvalidCredentialsException.class)
        public ResponseEntity<ApiResponse<Void>> handleInvalidCredentials(AuthService.InvalidCredentialsException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.failure(ErrorResponse.of("INVALID_CREDENTIALS", ex.getMessage())));
        }

        @ExceptionHandler(AuthService.AccountDisabledException.class)
        public ResponseEntity<ApiResponse<Void>> handleDisabled(AuthService.AccountDisabledException ex) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.failure(ErrorResponse.of("ACCOUNT_DISABLED", ex.getMessage())));
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<Void>> handleValidation1(MethodArgumentNotValidException ex) {
                String message = ex.getBindingResult().getFieldErrors().stream()
                                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                                .collect(Collectors.joining(", "));
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.failure(ErrorResponse.of("VALIDATION_ERROR", message)));
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiResponse<Void>> handleBadRequest1(IllegalArgumentException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.failure(ErrorResponse.of("BAD_REQUEST", ex.getMessage())));
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiResponse<Void>> handleAccessDenied1(AccessDeniedException ex) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.failure(ErrorResponse.of("ACCESS_DENIED",
                                                "You do not have permission to perform this action")));
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<Void>> handleGeneral1(Exception ex) {
                log.error("Unhandled exception", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ApiResponse.failure(
                                                ErrorResponse.of("INTERNAL_ERROR", "An unexpected error occurred")));
        }
}
