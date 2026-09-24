package com.sih.marketlink.controller;

import com.sih.marketlink.dto.common.ApiResponse;
import com.sih.marketlink.service.MarketPriceSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Services", description = "Mandi price data ingestion and administrative controls")
public class AdminController {

    private final MarketPriceSyncService marketPriceSyncService;

    public AdminController(MarketPriceSyncService marketPriceSyncService) {
        this.marketPriceSyncService = marketPriceSyncService;
    }

    @PostMapping("/market-prices/sync")
    @Operation(summary = "Manual Mandi Price Sync", description = "Trigger manual synchronization with government Agmarknet / e-NAM feeds")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncMarketPrices(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate syncDate = date != null ? date : LocalDate.now();
        int count = marketPriceSyncService.syncPricesForDate(syncDate);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("syncedCount", count, "date", syncDate),
                "Mandi prices synchronized successfully"
        ));
    }
}
