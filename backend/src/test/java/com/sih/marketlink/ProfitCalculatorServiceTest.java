package com.sih.marketlink;

import com.sih.marketlink.dto.farmer.ProfitCalculationRequest;
import com.sih.marketlink.dto.farmer.ProfitCalculationResponse;
import com.sih.marketlink.service.ProfitCalculatorService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ProfitCalculatorServiceTest {

    private final ProfitCalculatorService calculatorService = new ProfitCalculatorService();

    @Test
    void testProfitCalculationFormula() {
        // Quantity: 1000 kg (10 quintals), Selling price: ₹3200/q -> Gross = 32,000
        // Transport: 900, Handling: 300, Storage: 500, Commission: 200, Other: 100 -> Total Cost = 2,000
        // Net Return = 30,000
        // Profit per kg = 30, Profit per quintal = 3,000
        ProfitCalculationRequest request = ProfitCalculationRequest.builder()
                .cropId(1L)
                .quantity(1000.0)
                .sellingPrice(3200.0)
                .transportCost(900.0)
                .handlingCost(300.0)
                .storageCost(500.0)
                .commission(200.0)
                .otherCost(100.0)
                .build();

        ProfitCalculationResponse response = calculatorService.calculate(request);

        assertNotNull(response);
        assertEquals(32000.0, response.getGrossRevenue());
        assertEquals(2000.0, response.getTotalCost());
        assertEquals(30000.0, response.getNetReturn());
        assertEquals(30.0, response.getProfitPerKg());
        assertEquals(3000.0, response.getProfitPerQuintal());
        assertEquals(1500.0, response.getRoiPercent());
    }
}
