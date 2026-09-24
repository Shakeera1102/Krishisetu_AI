package com.sih.marketlink.dto.recommendation;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketRecommendationResponse {

    private RecommendedMarketDto recommendedMarket;
    private List<RecommendedMarketDto> alternatives;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecommendedMarketDto {
        private Long marketId;
        private String marketName;
        private String state;
        private String district;
        private Double currentPrice;
        private Double predictedPrice;
        private Double distanceKm;
        private Double transportCost;
        private Double handlingCost;
        private Double commissionCost;
        private Double grossRevenue;
        private Double expectedNetReturn;
        private Integer score;
        private String rankBadge;
        private String reason;
        private String trend;
        private Double trendPercent;
    }
}
