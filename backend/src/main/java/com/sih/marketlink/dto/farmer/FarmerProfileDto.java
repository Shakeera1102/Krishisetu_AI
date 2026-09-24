package com.sih.marketlink.dto.farmer;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerProfileDto {

    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String mobile;
    private String state;
    private String district;
    private String village;
    private Double latitude;
    private Double longitude;
    private String preferredLanguage;
    private String farmSize;
}
