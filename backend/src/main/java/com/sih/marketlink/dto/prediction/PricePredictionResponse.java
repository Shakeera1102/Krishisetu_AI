package com.sih.marketlink.dto.prediction;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricePredictionResponse {

    private String crop;
    private String variety;
    private String market;
    private Double currentPrice;
    private List<PredictionPointDto> predictions;
    private String trend; // 'INCREASING', 'DECREASING', 'STABLE'
    private Double confidence;
    private String recommendation;
    private String disclaimer;
    private List<FactorImpactDto> factors;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PredictionPointDto {
        private Integer daysAhead;
        private Double predictedPrice;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FactorImpactDto {
        private String name;
        private String impact;
    }
}
