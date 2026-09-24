package com.sih.marketlink;

import com.sih.marketlink.dto.auth.AuthResponse;
import com.sih.marketlink.dto.auth.LoginRequest;
import com.sih.marketlink.dto.auth.RegisterRequest;
import com.sih.marketlink.entity.FarmerProfile;
import com.sih.marketlink.entity.User;
import com.sih.marketlink.repository.BuyerProfileRepository;
import com.sih.marketlink.repository.FarmerProfileRepository;
import com.sih.marketlink.repository.UserRepository;
import com.sih.marketlink.security.JwtService;
import com.sih.marketlink.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FarmerProfileRepository farmerProfileRepository;

    @Mock
    private BuyerProfileRepository buyerProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private FarmerProfile sampleFarmerProfile;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .name("Ramesh Patil")
                .email("ramesh.patil@example.com")
                .mobile("+91 9876543210")
                .password("encoded_pass")
                .role("ROLE_FARMER")
                .status("ACTIVE")
                .build();

        sampleFarmerProfile = FarmerProfile.builder()
                .id(1L)
                .user(sampleUser)
                .state("Maharashtra")
                .district("Nashik")
                .build();
    }

    @Test
    void testRegisterFarmerSuccess() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Ramesh Patil")
                .email("ramesh.patil@example.com")
                .mobile("+91 9876543210")
                .password("password123")
                .role("ROLE_FARMER")
                .state("Maharashtra")
                .district("Nashik")
                .build();

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.existsByMobile(request.getMobile())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(farmerProfileRepository.save(any(FarmerProfile.class))).thenReturn(sampleFarmerProfile);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("mock-jwt-token");
        when(jwtService.generateRefreshToken(any(), any())).thenReturn("mock-refresh-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("ramesh.patil@example.com", response.getEmail());
        assertEquals("ROLE_FARMER", response.getRole());
        assertEquals("mock-jwt-token", response.getToken());
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = LoginRequest.builder()
                .emailOrMobile("ramesh.patil@example.com")
                .password("password123")
                .build();

        when(userRepository.findByEmailOrMobile(any(), any())).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password123", "encoded_pass")).thenReturn(true);
        when(farmerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleFarmerProfile));
        when(jwtService.generateToken(any(), any(), any())).thenReturn("mock-jwt-token");
        when(jwtService.generateRefreshToken(any(), any())).thenReturn("mock-refresh-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals(1L, response.getUserId());
    }
}
