package com.sih.marketlink.service;

import com.sih.marketlink.dto.auth.AuthResponse;
import com.sih.marketlink.dto.auth.LoginRequest;
import com.sih.marketlink.dto.auth.RefreshTokenRequest;
import com.sih.marketlink.dto.auth.RegisterRequest;
import com.sih.marketlink.entity.BuyerProfile;
import com.sih.marketlink.entity.FarmerProfile;
import com.sih.marketlink.entity.User;
import com.sih.marketlink.exception.BadRequestException;
import com.sih.marketlink.exception.UnauthorizedException;
import com.sih.marketlink.repository.BuyerProfileRepository;
import com.sih.marketlink.repository.FarmerProfileRepository;
import com.sih.marketlink.repository.UserRepository;
import com.sih.marketlink.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final BuyerProfileRepository buyerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            FarmerProfileRepository farmerProfileRepository,
            BuyerProfileRepository buyerProfileRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.farmerProfileRepository = farmerProfileRepository;
        this.buyerProfileRepository = buyerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }
        if (userRepository.existsByMobile(request.getMobile())) {
            throw new BadRequestException("Mobile number is already registered: " + request.getMobile());
        }

        String role = request.getRole().toUpperCase().startsWith("ROLE_") 
                ? request.getRole().toUpperCase() 
                : "ROLE_" + request.getRole().toUpperCase();

        if (!role.equals("ROLE_FARMER") && !role.equals("ROLE_BUYER") && !role.equals("ROLE_ADMIN")) {
            throw new BadRequestException("Invalid role specified. Must be ROLE_FARMER or ROLE_BUYER");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .status("ACTIVE")
                .build();

        User savedUser = userRepository.save(user);
        Long profileId = null;

        if ("ROLE_FARMER".equals(role)) {
            FarmerProfile farmerProfile = FarmerProfile.builder()
                    .user(savedUser)
                    .state(request.getState() != null ? request.getState() : "Maharashtra")
                    .district(request.getDistrict() != null ? request.getDistrict() : "Nashik")
                    .village(request.getVillage())
                    .latitude(request.getLatitude() != null ? request.getLatitude() : 20.0059)
                    .longitude(request.getLongitude() != null ? request.getLongitude() : 73.7898)
                    .preferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "Hindi")
                    .farmSize(request.getFarmSize())
                    .build();
            FarmerProfile savedProfile = farmerProfileRepository.save(farmerProfile);
            profileId = savedProfile.getId();
        } else if ("ROLE_BUYER".equals(role)) {
            BuyerProfile buyerProfile = BuyerProfile.builder()
                    .user(savedUser)
                    .businessName(request.getBusinessName() != null ? request.getBusinessName() : request.getName() + " Enterprises")
                    .businessType(request.getBusinessType() != null ? request.getBusinessType() : "Food Processor")
                    .state(request.getState() != null ? request.getState() : "Maharashtra")
                    .district(request.getDistrict() != null ? request.getDistrict() : "Pune")
                    .address(request.getAddress())
                    .latitude(request.getLatitude() != null ? request.getLatitude() : 18.5204)
                    .longitude(request.getLongitude() != null ? request.getLongitude() : 73.8567)
                    .verified(true)
                    .rating(4.5)
                    .totalTransactions(0)
                    .build();
            BuyerProfile savedProfile = buyerProfileRepository.save(buyerProfile);
            profileId = savedProfile.getId();
        }

        String token = jwtService.generateToken(savedUser, savedUser.getId(), savedUser.getRole());
        String refreshToken = jwtService.generateRefreshToken(savedUser, savedUser.getId());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .profileId(profileId)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailOrMobile(request.getEmailOrMobile(), request.getEmailOrMobile())
                .orElseThrow(() -> new UnauthorizedException("User not found. Please register first."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Incorrect password. Please verify your credentials.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );

        Long profileId = null;
        if ("ROLE_FARMER".equals(user.getRole())) {
            profileId = farmerProfileRepository.findByUserId(user.getId())
                    .map(FarmerProfile::getId)
                    .orElse(null);
        } else if ("ROLE_BUYER".equals(user.getRole())) {
            profileId = buyerProfileRepository.findByUserId(user.getId())
                    .map(BuyerProfile::getId)
                    .orElse(null);
        }

        String token = jwtService.generateToken(user, user.getId(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user, user.getId());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .profileId(profileId)
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        String userEmail = jwtService.extractUsername(refreshToken);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("User not found for provided refresh token"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        String newToken = jwtService.generateToken(user, user.getId(), user.getRole());
        String newRefreshToken = jwtService.generateRefreshToken(user, user.getId());

        return AuthResponse.builder()
                .token(newToken)
                .refreshToken(newRefreshToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public String forgotPassword(com.sih.marketlink.dto.auth.ForgotPasswordRequest request) {
        User user = userRepository.findByEmailOrMobile(request.getEmailOrMobile(), request.getEmailOrMobile())
                .orElseThrow(() -> new BadRequestException("No registered account found with this email or mobile number."));
        return "Account verified for " + user.getName() + " (" + user.getRole() + "). You can now reset your password.";
    }

    @Transactional
    public String resetPassword(com.sih.marketlink.dto.auth.ResetPasswordRequest request) {
        User user = userRepository.findByEmailOrMobile(request.getEmailOrMobile(), request.getEmailOrMobile())
                .orElseThrow(() -> new BadRequestException("No registered account found with this email or mobile number."));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return "Password updated successfully. You can now sign in with your new password.";
    }
}

