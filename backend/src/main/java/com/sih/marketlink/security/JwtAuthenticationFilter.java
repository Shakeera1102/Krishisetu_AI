package com.sih.marketlink.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String requestUri = request.getRequestURI();
        final String method = request.getMethod();

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        try {
            final String userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                boolean isValid = jwtService.isTokenValid(jwt, userDetails);

                System.out.println("\n===== AUTH DEBUG =====");
                System.out.println("Endpoint: " + requestUri);
                System.out.println("Method: " + method);
                System.out.println("User: " + userEmail);
                System.out.println("Role: " + userDetails.getAuthorities());
                System.out.println("Token received: true");
                System.out.println("Token valid: " + isValid);
                System.out.println("Authentication result: " + (isValid ? "SUCCESS" : "INVALID_TOKEN"));
                System.out.println("HTTP Status: Authenticated");
                System.out.println("Error: None");
                System.out.println("Exception: None");
                System.out.println("======================\n");

                if (isValid) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception ex) {
            System.err.println("\n===== AUTH DEBUG =====");
            System.err.println("Endpoint: " + requestUri);
            System.err.println("Method: " + method);
            System.err.println("User: Unknown (token extraction failed)");
            System.err.println("Role: None");
            System.err.println("Token received: true");
            System.err.println("Token valid: false");
            System.err.println("Authentication result: FAILED");
            System.err.println("HTTP Status: 401 UNAUTHORIZED");
            System.err.println("Error: " + ex.getMessage());
            System.err.println("Exception: " + ex.getClass().getName());
            System.err.println("======================\n");
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
