package com.sih.marketlink.controller;

import com.sih.marketlink.dto.common.ApiResponse;
import com.sih.marketlink.dto.common.PageResponse;
import com.sih.marketlink.dto.market.HistoricalPriceResponse;
import com.sih.marketlink.dto.market.MarketDto;
import com.sih.marketlink.dto.market.MarketPriceDto;
import com.sih.marketlink.service.MarketPriceService;
import com.sih.marketlink.service.MarketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/markets")
@Tag(name = "Markets & Mandi Prices", description = "Regulated Mandi directories, current live arrival prices, and historical trends")
public class MarketController {

    private final MarketService marketService;
    private final MarketPriceService marketPriceService;

    public MarketController(MarketService marketService, MarketPriceService marketPriceService) {
        this.marketService = marketService;
        this.marketPriceService = marketPriceService;
    }

    @GetMapping
    @Operation(summary = "Get All Markets", description = "List all active APMC mandis across India")
    public ResponseEntity<ApiResponse<List<MarketDto>>> getAllMarkets() {
        List<MarketDto> markets = marketService.getAllMarkets();
        return ResponseEntity.ok(ApiResponse.success(markets, "Markets retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Market by ID", description = "Retrieve specific mandi details, address, and coordinates")
    public ResponseEntity<ApiResponse<MarketDto>> getMarketById(@PathVariable Long id) {
        MarketDto market = marketService.getMarketById(id);
        return ResponseEntity.ok(ApiResponse.success(market, "Market retrieved successfully"));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Get Nearby Markets", description = "Find APMC mandis within a given radius sorted by distance")
    public ResponseEntity<ApiResponse<List<MarketDto>>> getNearbyMarkets(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(defaultValue = "300") Double radius
    ) {
        List<MarketDto> markets = marketService.getNearbyMarkets(latitude, longitude, radius);
        return ResponseEntity.ok(ApiResponse.success(markets, "Nearby markets retrieved successfully"));
    }

    @GetMapping("/prices/current")
    @Operation(summary = "Get Current Mandi Prices", description = "Filter current mandi arrivals and modal prices with pagination")
    public ResponseEntity<ApiResponse<PageResponse<MarketPriceDto>>> getCurrentPrices(
            @RequestParam(required = false) Long cropId,
            @RequestParam(required = false) Long varietyId,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) Long marketId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<MarketPriceDto> prices = marketPriceService.getCurrentPrices(cropId, varietyId, state, district, marketId, date, page, size);
        return ResponseEntity.ok(ApiResponse.success(prices, "Current market prices retrieved successfully"));
    }

    @GetMapping("/prices/history")
    @Operation(summary = "Get Historical Mandi Prices", description = "Retrieve historical price chart timeline and statistical bounds")
    public ResponseEntity<ApiResponse<HistoricalPriceResponse>> getHistoricalPrices(
            @RequestParam(required = false) Long cropId,
            @RequestParam(required = false) Long varietyId,
            @RequestParam(required = false) Long marketId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        HistoricalPriceResponse history = marketPriceService.getHistoricalPrices(cropId, varietyId, marketId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(history, "Historical prices retrieved successfully"));
    }
}
