package com.sih.marketlink.config;

import com.sih.marketlink.security.CustomUserDetailsService;
import com.sih.marketlink.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, CustomUserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:5174,http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/v3/api-docs.yaml"
                        ).permitAll()
                        // Public market intelligence & predictions
                        .requestMatchers(HttpMethod.GET, "/api/markets/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/predictions/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/recommendations/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/farmer/profit/calculate").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/buyers/requirements/**").permitAll()
                        
                        // Farmer-only endpoints
                        .requestMatchers("/api/farmer/**").hasAuthority("ROLE_FARMER")
                        
                        // Buyer-only endpoints
                        .requestMatchers("/api/buyer/**").hasAuthority("ROLE_BUYER")
                        
                        // Admin-only endpoints
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                        
                        // Authenticated endpoints
                        .requestMatchers("/api/offers/**").authenticated()
                        .requestMatchers("/api/matching/**").authenticated()
                        
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, authEx) -> {
                            System.err.println("\n===== AUTH DEBUG =====");
                            System.err.println("Endpoint: " + req.getRequestURI());
                            System.err.println("Method: " + req.getMethod());
                            System.err.println("User: Anonymous");
                            System.err.println("Role: None");
                            System.err.println("Token received: " + (req.getHeader("Authorization") != null));
                            System.err.println("Token valid: false");
                            System.err.println("Authentication result: 401 UNAUTHORIZED");
                            System.err.println("HTTP Status: 401");
                            System.err.println("Error: " + authEx.getMessage());
                            System.err.println("Exception: " + authEx.getClass().getName());
                            System.err.println("======================\n");
                            res.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                            res.setContentType("application/json");
                            res.getWriter().write("{\"success\":false,\"message\":\"Unauthorized: " + authEx.getMessage() + "\"}");
                        })
                        .accessDeniedHandler((req, res, accessEx) -> {
                            String user = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() != null
                                    ? org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName()
                                    : "Anonymous";
                            Object roles = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() != null
                                    ? org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                                    : "None";

                            System.err.println("\n===== AUTH DEBUG =====");
                            System.err.println("Endpoint: " + req.getRequestURI());
                            System.err.println("Method: " + req.getMethod());
                            System.err.println("User: " + user);
                            System.err.println("Role: " + roles);
                            System.err.println("Token received: " + (req.getHeader("Authorization") != null));
                            System.err.println("Token valid: true");
                            System.err.println("Authentication result: 403 FORBIDDEN");
                            System.err.println("HTTP Status: 403");
                            System.err.println("Error: " + accessEx.getMessage());
                            System.err.println("Exception: " + accessEx.getClass().getName());
                            System.err.println("======================\n");
                            res.setStatus(jakarta.servlet.http.HttpServletResponse.SC_FORBIDDEN);
                            res.setContentType("application/json");
                            res.getWriter().write("{\"success\":false,\"message\":\"Access Denied: " + accessEx.getMessage() + "\"}");
                        })
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .toList();

        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
