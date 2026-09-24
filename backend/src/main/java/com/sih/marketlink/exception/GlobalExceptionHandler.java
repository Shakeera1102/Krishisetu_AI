package com.sih.marketlink.exception;

import com.sih.marketlink.dto.common.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(ZonedDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("NOT_FOUND")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(ZonedDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("BAD_REQUEST")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(ZonedDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("VALIDATION_ERROR")
                .message("Input validation failed on one or more fields")
                .path(request.getRequestURI())
                .validationErrors(errors)
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({BadCredentialsException.class, UnauthorizedException.class})
    public ResponseEntity<ErrorResponse> handleAuthenticationException(Exception ex, HttpServletRequest request) {
        System.err.println("\n===== AUTH DEBUG =====");
        System.err.println("Endpoint: " + request.getRequestURI());
        System.err.println("Method: " + request.getMethod());
        System.err.println("User: " + (request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "Anonymous"));
        System.err.println("Token received: " + (request.getHeader("Authorization") != null));
        System.err.println("Token valid: false");
        System.err.println("Authentication result: 401 UNAUTHORIZED");
        System.err.println("HTTP Status: 401");
        System.err.println("Error: " + ex.getMessage());
        System.err.println("Exception: " + ex.getClass().getName());
        System.err.println("======================\n");

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(ZonedDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("UNAUTHORIZED")
                .message(ex.getMessage() != null ? ex.getMessage() : "Invalid credentials or unauthorized access")
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        System.err.println("\n===== AUTH DEBUG =====");
        System.err.println("Endpoint: " + request.getRequestURI());
        System.err.println("Method: " + request.getMethod());
        System.err.println("User: " + (request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "Anonymous"));
        System.err.println("Token received: " + (request.getHeader("Authorization") != null));
        System.err.println("Token valid: true");
        System.err.println("Authentication result: 403 FORBIDDEN");
        System.err.println("HTTP Status: 403");
        System.err.println("Error: " + ex.getMessage());
        System.err.println("Exception: " + ex.getClass().getName());
        System.err.println("======================\n");

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(ZonedDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .error("FORBIDDEN")
                .message("You do not have permission to access this resource")
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex, HttpServletRequest request) {
        System.err.println("\n===== AUTH DEBUG =====");
        System.err.println("Endpoint: " + request.getRequestURI());
        System.err.println("Method: " + request.getMethod());
        System.err.println("User: " + (request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "Anonymous"));
        System.err.println("Token received: " + (request.getHeader("Authorization") != null));
        System.err.println("HTTP Status: 500 INTERNAL_SERVER_ERROR");
        System.err.println("Error: " + ex.getMessage());
        System.err.println("Exception: " + ex.getClass().getName());
        System.err.println("======================\n");

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(ZonedDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("INTERNAL_SERVER_ERROR")
                .message(ex.getMessage() != null ? ex.getMessage() : "An unexpected internal server error occurred")
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
