package com.sih.marketlink.controller;

import com.sih.marketlink.dto.common.ApiResponse;
import com.sih.marketlink.dto.matching.BuyerMatchResponse;
import com.sih.marketlink.dto.matching.FarmerMatchResponse;
import com.sih.marketlink.service.BuyerMatchingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matching")
@Tag(name = "Buyer & Farmer Matching", description = "AI Matchmaking between Farmer Lots and Buyer Sourcing Demands")
public class MatchingController {

    private final BuyerMatchingService buyerMatchingService;

    public MatchingController(BuyerMatchingService buyerMatchingService) {
        this.buyerMatchingService = buyerMatchingService;
    }

    @GetMapping("/buyers")
    @Operation(summary = "Find Matching Buyers for Farmer", description = "Evaluate nearby corporate buyers matching farmer crop, volume, and quality grade")
    public ResponseEntity<ApiResponse<List<BuyerMatchResponse>>> getMatchingBuyers(
            @RequestParam(required = false) Long farmerId,
            @RequestParam(required = false) Long cropId,
            @RequestParam(required = false) Long varietyId,
            @RequestParam(required = false) Double quantity
    ) {
        List<BuyerMatchResponse> matches = buyerMatchingService.findMatchingBuyers(farmerId, cropId, varietyId, quantity);
        return ResponseEntity.ok(ApiResponse.success(matches, "Matching buyers retrieved successfully"));
    }

    @GetMapping("/farmers")
    @Operation(summary = "Find Matching Farmers for Buyer", description = "Evaluate available farmer crop harvests matching buyer requirement")
    public ResponseEntity<ApiResponse<List<FarmerMatchResponse>>> getMatchingFarmers(
            @RequestParam(required = false) Long buyerId
    ) {
        List<FarmerMatchResponse> matches = buyerMatchingService.findMatchingFarmersForBuyer(buyerId);
        return ResponseEntity.ok(ApiResponse.success(matches, "Matching farmers retrieved successfully"));
    }
}
