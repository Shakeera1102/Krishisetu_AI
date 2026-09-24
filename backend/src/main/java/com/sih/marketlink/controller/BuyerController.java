package com.sih.marketlink.controller;

import com.sih.marketlink.dto.buyer.BuyerDashboardResponse;
import com.sih.marketlink.dto.buyer.BuyerProfileDto;
import com.sih.marketlink.dto.buyer.BuyerRequirementRequest;
import com.sih.marketlink.dto.buyer.BuyerRequirementResponse;
import com.sih.marketlink.dto.common.ApiResponse;
import com.sih.marketlink.dto.common.PageResponse;
import com.sih.marketlink.security.SecurityUtils;
import com.sih.marketlink.service.BuyerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/buyer")
@Tag(name = "Buyer Services", description = "Corporate Buyer Profile, Sourcing Requirements (RFQs), and Dashboard")
public class BuyerController {

    private final BuyerService buyerService;

    public BuyerController(BuyerService buyerService) {
        this.buyerService = buyerService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get Buyer Profile", description = "Retrieve profile of authenticated buyer")
    public ResponseEntity<ApiResponse<BuyerProfileDto>> getProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        BuyerProfileDto profile = buyerService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(profile, "Buyer profile retrieved successfully"));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update Buyer Profile", description = "Update corporate business details and location")
    public ResponseEntity<ApiResponse<BuyerProfileDto>> updateProfile(@RequestBody BuyerProfileDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        BuyerProfileDto updated = buyerService.updateProfile(userId, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Buyer profile updated successfully"));
    }

    @PostMapping("/requirements")
    @Operation(summary = "Publish Sourcing Requirement", description = "Publish a bulk crop buying requirement (RFQ)")
    public ResponseEntity<ApiResponse<BuyerRequirementResponse>> createRequirement(@Valid @RequestBody BuyerRequirementRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        BuyerRequirementResponse created = buyerService.createRequirement(userId, request);
        return new ResponseEntity<>(ApiResponse.success(created, "Buyer requirement published successfully"), HttpStatus.CREATED);
    }

    @GetMapping("/requirements")
    @Operation(summary = "List Sourcing Requirements", description = "Browse published buyer requirements with pagination and crop filters")
    public ResponseEntity<ApiResponse<PageResponse<BuyerRequirementResponse>>> getRequirements(
            @RequestParam(required = false) Long cropId,
            @RequestParam(required = false) Long varietyId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<BuyerRequirementResponse> response = buyerService.getRequirements(cropId, varietyId, minPrice, page, size);
        return ResponseEntity.ok(ApiResponse.success(response, "Buyer requirements retrieved successfully"));
    }

    @GetMapping("/requirements/{id}")
    @Operation(summary = "Get Requirement by ID", description = "Retrieve full details of a specific requirement")
    public ResponseEntity<ApiResponse<BuyerRequirementResponse>> getRequirementById(@PathVariable Long id) {
        BuyerRequirementResponse response = buyerService.getRequirementById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Requirement details retrieved successfully"));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Buyer Aggregated Dashboard", description = "Get unified data for corporate procurement dashboard")
    public ResponseEntity<ApiResponse<BuyerDashboardResponse>> getDashboard() {
        Long userId = SecurityUtils.getCurrentUserId();
        BuyerDashboardResponse dashboard = buyerService.getDashboard(userId);
        return ResponseEntity.ok(ApiResponse.success(dashboard, "Buyer dashboard retrieved successfully"));
    }
}
