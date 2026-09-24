package com.sih.marketlink.dto.matching;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuyerMatchResponse {

    private Long requirementId;
    private Long buyerId;
    private String businessName;
    private String businessType;
    private Boolean verified;
    private Double rating;
    private String cropName;
    private String varietyName;
    private Double quantityRequired;
    private Double offerPrice;
    private String location;
    private Double distanceKm;
    private LocalDate requiredDate;
    private Integer matchScore;
    private MatchBreakdownDto matchBreakdown;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MatchBreakdownDto {
        private Integer cropMatch;
        private Integer quantityMatch;
        private Integer distanceMatch;
        private Integer priceMatch;
        private Integer dateMatch;
        private Integer qualityMatch;
    }
}
