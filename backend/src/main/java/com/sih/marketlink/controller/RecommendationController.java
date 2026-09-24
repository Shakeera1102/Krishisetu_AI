package com.sih.marketlink.controller;

import com.sih.marketlink.dto.common.ApiResponse;
import com.sih.marketlink.dto.recommendation.MarketRecommendationRequest;
import com.sih.marketlink.dto.recommendation.MarketRecommendationResponse;
import com.sih.marketlink.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommendations")
@Tag(name = "Market Recommendations", description = "AI Dynamic Best Market Ranking based on Net Profit Logistics")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping("/best-market")
    @Operation(summary = "Calculate Best Market Recommendation", description = "Calculates transportation logistics, net profit, and scores nearby markets to recommend the optimal selling location")
    public ResponseEntity<ApiResponse<MarketRecommendationResponse>> getBestMarketRecommendation(
            @Valid @RequestBody MarketRecommendationRequest request
    ) {
        MarketRecommendationResponse response = recommendationService.getBestMarkets(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Market recommendations calculated successfully"));
    }
}
