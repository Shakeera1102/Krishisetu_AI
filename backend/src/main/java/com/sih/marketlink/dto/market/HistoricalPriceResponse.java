package com.sih.marketlink.dto.market;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoricalPriceResponse {

    private String cropName;
    private String varietyName;
    private String marketName;
    private Double highestPrice;
    private Double lowestPrice;
    private Double averagePrice;
    private Double currentPrice;
    private Double percentageChange;
    private String insight;
    private List<HistoricalPricePointDto> prices;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HistoricalPricePointDto {
        private LocalDate date;
        private Double minPrice;
        private Double maxPrice;
        private Double modalPrice;
        private Double arrivalQuantity;
    }
}
