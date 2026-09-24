package com.sih.marketlink.dto.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String refreshToken;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private Long profileId;
}
