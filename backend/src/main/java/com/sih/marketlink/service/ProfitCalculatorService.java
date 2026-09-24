package com.sih.marketlink.service;

import com.sih.marketlink.dto.farmer.ProfitCalculationRequest;
import com.sih.marketlink.dto.farmer.ProfitCalculationResponse;
import org.springframework.stereotype.Service;

@Service
public class ProfitCalculatorService {

    public ProfitCalculationResponse calculate(ProfitCalculationRequest request) {
        double quantityKg = request.getQuantity();
        double sellingPricePerQuintal = request.getSellingPrice();
        
        // Quantity in quintals (1 quintal = 100 kg)
        double quintals = quantityKg / 100.0;
        double grossRevenue = quintals * sellingPricePerQuintal;

        double transport = request.getTransportCost() != null ? request.getTransportCost() : 0.0;
        double handling = request.getHandlingCost() != null ? request.getHandlingCost() : 0.0;
        double storage = request.getStorageCost() != null ? request.getStorageCost() : 0.0;
        double commission = request.getCommission() != null ? request.getCommission() : 0.0;
        double other = request.getOtherCost() != null ? request.getOtherCost() : 0.0;

        double totalCost = transport + handling + storage + commission + other;
        double netReturn = grossRevenue - totalCost;

        double profitPerKg = quantityKg > 0 ? (netReturn / quantityKg) : 0.0;
        double profitPerQuintal = profitPerKg * 100.0;
        double roiPercent = totalCost > 0 ? ((netReturn / totalCost) * 100.0) : 100.0;

        return ProfitCalculationResponse.builder()
                .grossRevenue(Math.round(grossRevenue * 100.0) / 100.0)
                .totalCost(Math.round(totalCost * 100.0) / 100.0)
                .netReturn(Math.round(netReturn * 100.0) / 100.0)
                .profitPerKg(Math.round(profitPerKg * 100.0) / 100.0)
                .profitPerQuintal(Math.round(profitPerQuintal * 100.0) / 100.0)
                .roiPercent(Math.round(roiPercent * 10.0) / 10.0)
                .build();
    }
}
