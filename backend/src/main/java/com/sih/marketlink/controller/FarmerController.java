package com.sih.marketlink.controller;

import com.sih.marketlink.dto.common.ApiResponse;
import com.sih.marketlink.dto.farmer.*;
import com.sih.marketlink.security.SecurityUtils;
import com.sih.marketlink.service.FarmerService;
import com.sih.marketlink.service.ProfitCalculatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmer")
@Tag(name = "Farmer Services", description = "Farmer Profile, Crops, Unified Dashboard, and Net Margin Calculations")
public class FarmerController {

    private final FarmerService farmerService;
    private final ProfitCalculatorService profitCalculatorService;

    public FarmerController(FarmerService farmerService, ProfitCalculatorService profitCalculatorService) {
        this.farmerService = farmerService;
        this.profitCalculatorService = profitCalculatorService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get Farmer Profile", description = "Retrieve profile of currently authenticated farmer")
    public ResponseEntity<ApiResponse<FarmerProfileDto>> getProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        FarmerProfileDto profile = farmerService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(profile, "Farmer profile retrieved successfully"));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update Farmer Profile", description = "Update farm size, location, and regional settings")
    public ResponseEntity<ApiResponse<FarmerProfileDto>> updateProfile(@RequestBody FarmerProfileDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        FarmerProfileDto updated = farmerService.updateProfile(userId, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Farmer profile updated successfully"));
    }

    @PostMapping("/crop")
    @Operation(summary = "Register Farmer Crop Lot", description = "Register a harvested or upcoming crop lot")
    public ResponseEntity<ApiResponse<FarmerCropDto>> addCrop(@Valid @RequestBody FarmerCropDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        FarmerCropDto created = farmerService.addCrop(userId, dto);
        return new ResponseEntity<>(ApiResponse.success(created, "Farmer crop registered successfully"), HttpStatus.CREATED);
    }

    @GetMapping("/crop")
    @Operation(summary = "Get Farmer Crop Lots", description = "List all crop lots registered by the farmer")
    public ResponseEntity<ApiResponse<List<FarmerCropDto>>> getCrops() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<FarmerCropDto> list = farmerService.getFarmerCrops(userId);
        return ResponseEntity.ok(ApiResponse.success(list, "Farmer crops retrieved successfully"));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Farmer Aggregated Dashboard", description = "Get unified data for farmer home view in a single high-performance payload")
    public ResponseEntity<ApiResponse<FarmerDashboardResponse>> getDashboard() {
        Long userId = SecurityUtils.getCurrentUserId();
        FarmerDashboardResponse dashboard = farmerService.getDashboard(userId);
        return ResponseEntity.ok(ApiResponse.success(dashboard, "Farmer dashboard retrieved successfully"));
    }

    @PostMapping("/profit/calculate")
    @Operation(summary = "Net Profit Calculation", description = "Calculates gross revenue, itemized operational expenses, net return, and profit per kg/quintal")
    public ResponseEntity<ApiResponse<ProfitCalculationResponse>> calculateProfit(@Valid @RequestBody ProfitCalculationRequest request) {
        ProfitCalculationResponse response = profitCalculatorService.calculate(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Net profit calculated successfully"));
    }
}
