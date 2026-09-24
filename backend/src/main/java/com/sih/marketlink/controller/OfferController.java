package com.sih.marketlink.controller;

import com.sih.marketlink.dto.common.ApiResponse;
import com.sih.marketlink.dto.offer.CounterOfferRequest;
import com.sih.marketlink.dto.offer.CreateOfferRequest;
import com.sih.marketlink.dto.offer.OfferResponse;
import com.sih.marketlink.security.SecurityUtils;
import com.sih.marketlink.service.OfferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
@Tag(name = "Offers & Trade Negotiations", description = "Farmer-Buyer Direct Trade Offers, Accept, Reject, and Counter-Offers")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @PostMapping
    @Operation(summary = "Submit Offer to Buyer", description = "Farmer submits a direct selling offer against a buyer profile or requirement")
    public ResponseEntity<ApiResponse<OfferResponse>> createOffer(@Valid @RequestBody CreateOfferRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        OfferResponse created = offerService.createOffer(request, userId);
        return new ResponseEntity<>(ApiResponse.success(created, "Offer submitted successfully"), HttpStatus.CREATED);
    }

    @GetMapping("/farmer")
    @Operation(summary = "Get Farmer Offers", description = "List trade offers sent or received by authenticated farmer")
    public ResponseEntity<ApiResponse<List<OfferResponse>>> getFarmerOffers(@RequestParam(required = false) String status) {
        Long userId = SecurityUtils.getCurrentUserId();
        List<OfferResponse> offers = offerService.getFarmerOffers(userId, status);
        return ResponseEntity.ok(ApiResponse.success(offers, "Farmer offers retrieved successfully"));
    }

    @GetMapping("/buyer")
    @Operation(summary = "Get Buyer Offers", description = "List purchase bids and incoming farmer offers for authenticated buyer")
    public ResponseEntity<ApiResponse<List<OfferResponse>>> getBuyerOffers(@RequestParam(required = false) String status) {
        Long userId = SecurityUtils.getCurrentUserId();
        List<OfferResponse> offers = offerService.getBuyerOffers(userId, status);
        return ResponseEntity.ok(ApiResponse.success(offers, "Buyer offers retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Offer Details", description = "Retrieve complete details of a specific offer")
    public ResponseEntity<ApiResponse<OfferResponse>> getOfferById(@PathVariable Long id) {
        OfferResponse offer = offerService.getOfferById(id);
        return ResponseEntity.ok(ApiResponse.success(offer, "Offer retrieved successfully"));
    }

    @PutMapping("/{id}/accept")
    @Operation(summary = "Accept Offer", description = "Accept an offer and lock in the trade agreement")
    public ResponseEntity<ApiResponse<OfferResponse>> acceptOffer(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        OfferResponse offer = offerService.acceptOffer(id, userId);
        return ResponseEntity.ok(ApiResponse.success(offer, "Offer accepted successfully"));
    }

    @PutMapping("/{id}/reject")
    @Operation(summary = "Reject Offer", description = "Decline a proposed trade offer")
    public ResponseEntity<ApiResponse<OfferResponse>> rejectOffer(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        OfferResponse offer = offerService.rejectOffer(id, userId);
        return ResponseEntity.ok(ApiResponse.success(offer, "Offer rejected"));
    }

    @PutMapping("/{id}/counter")
    @Operation(summary = "Submit Counter Offer", description = "Submit a counter price quotation")
    public ResponseEntity<ApiResponse<OfferResponse>> counterOffer(
            @PathVariable Long id,
            @Valid @RequestBody CounterOfferRequest request
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        OfferResponse offer = offerService.counterOffer(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(offer, "Counter offer submitted successfully"));
    }
}
