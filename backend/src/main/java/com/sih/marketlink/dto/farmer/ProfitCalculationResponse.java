package com.sih.marketlink.dto.farmer;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfitCalculationResponse {

    private Double grossRevenue;
    private Double totalCost;
    private Double netReturn;
    private Double profitPerKg;
    private Double profitPerQuintal;
    private Double roiPercent;
}
