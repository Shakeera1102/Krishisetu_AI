package com.sih.marketlink.dto.matching;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerMatchResponse {

    private Long farmerCropId;
    private Long farmerId;
    private String farmerName;
    private String cropName;
    private String varietyName;
    private Double availableQuantity;
    private Double expectedPrice;
    private String quality;
    private String location;
    private Double distanceKm;
    private LocalDate availableDate;
    private Integer matchScore;
}
