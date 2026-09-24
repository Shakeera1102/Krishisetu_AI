package com.sih.marketlink.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email format")
    private String email;

    @NotBlank(message = "Mobile number is required")
    private String mobile;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Role is required (ROLE_FARMER or ROLE_BUYER)")
    private String role; // 'ROLE_FARMER', 'ROLE_BUYER'

    // Farmer specific fields
    private String state;
    private String district;
    private String village;
    private Double latitude;
    private Double longitude;
    private String preferredLanguage;
    private String farmSize;

    // Buyer specific fields
    private String businessName;
    private String businessType;
    private String address;
}
