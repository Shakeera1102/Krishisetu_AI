package com.sih.marketlink.controller;

import com.sih.marketlink.dto.auth.AuthResponse;
import com.sih.marketlink.dto.auth.LoginRequest;
import com.sih.marketlink.dto.auth.RefreshTokenRequest;
import com.sih.marketlink.dto.auth.RegisterRequest;
import com.sih.marketlink.dto.common.ApiResponse;
import com.sih.marketlink.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Registration, Login, and JWT Token Management")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register Farmer or Buyer", description = "Create an account for a Farmer or Corporate Buyer with role verification")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(ApiResponse.success(response, "User registered successfully"), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate User", description = "Authenticate using email/mobile and password to receive JWT access token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh JWT Token", description = "Obtain new JWT token using a valid refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Verify Account for Forgot Password", description = "Verify registered email/mobile for password recovery")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody com.sih.marketlink.dto.auth.ForgotPasswordRequest request) {
        String msg = authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(msg, "Account verified successfully"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset Password", description = "Update password for verified account")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody com.sih.marketlink.dto.auth.ResetPasswordRequest request) {
        String msg = authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(msg, "Password reset successfully"));
    }
}
