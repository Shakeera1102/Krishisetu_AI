package com.sih.marketlink.dto.market;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketPriceDto {

    private Long id;
    private Long marketId;
    private String marketName;
    private String state;
    private String district;
    private Long cropId;
    private String cropName;
    private Long varietyId;
    private String varietyName;
    private LocalDate date;
    private Double minPrice;
    private Double maxPrice;
    private Double modalPrice;
    private Double arrivalQuantity;
    private String unit;
    private String source;
    private String trend; // 'UP', 'DOWN', 'STABLE'
    private Double trendPercent;
}
