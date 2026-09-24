package com.sih.marketlink.controller;

import com.sih.marketlink.dto.common.ApiResponse;
import com.sih.marketlink.dto.prediction.PricePredictionResponse;
import com.sih.marketlink.service.PricePredictionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/predictions")
@Tag(name = "AI Predictions", description = "Machine Learning Agricultural Price Forecasting")
public class PredictionController {

    private final PricePredictionService pricePredictionService;

    public PredictionController(PricePredictionService pricePredictionService) {
        this.pricePredictionService = pricePredictionService;
    }

    @GetMapping("/price")
    @Operation(summary = "Get AI Price Prediction", description = "Query ML forecast model for projected 1, 3, and 7-day price trajectory")
    public ResponseEntity<ApiResponse<PricePredictionResponse>> getPricePrediction(
            @RequestParam(required = false) Long cropId,
            @RequestParam(required = false) Long varietyId,
            @RequestParam(required = false) Long marketId,
            @RequestParam(defaultValue = "7") Integer days
    ) {
        PricePredictionResponse prediction = pricePredictionService.predictPrice(cropId, varietyId, marketId, days);
        return ResponseEntity.ok(ApiResponse.success(prediction, "Price prediction generated successfully"));
    }
}
