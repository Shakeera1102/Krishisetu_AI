package com.sih.marketlink.service;

import com.sih.marketlink.client.mandi.MandiApiClient;
import com.sih.marketlink.dto.market.MarketPriceDto;
import com.sih.marketlink.entity.Crop;
import com.sih.marketlink.entity.CropVariety;
import com.sih.marketlink.entity.Market;
import com.sih.marketlink.entity.MarketPrice;
import com.sih.marketlink.repository.CropRepository;
import com.sih.marketlink.repository.CropVarietyRepository;
import com.sih.marketlink.repository.MarketPriceRepository;
import com.sih.marketlink.repository.MarketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
public class MarketPriceSyncService {

    private final MandiApiClient mandiApiClient;
    private final MarketPriceRepository marketPriceRepository;
    private final MarketRepository marketRepository;
    private final CropRepository cropRepository;
    private final CropVarietyRepository cropVarietyRepository;

    public MarketPriceSyncService(
            MandiApiClient mandiApiClient,
            MarketPriceRepository marketPriceRepository,
            MarketRepository marketRepository,
            CropRepository cropRepository,
            CropVarietyRepository cropVarietyRepository
    ) {
        this.mandiApiClient = mandiApiClient;
        this.marketPriceRepository = marketPriceRepository;
        this.marketRepository = marketRepository;
        this.cropRepository = cropRepository;
        this.cropVarietyRepository = cropVarietyRepository;
    }

    @Scheduled(cron = "${app.mandi-api.sync-cron:0 0 6 * * ?}")
    public void scheduledPriceSync() {
        log.info("Starting automated scheduled Mandi price synchronization for today...");
        syncPricesForDate(LocalDate.now());
    }

    @Transactional
    public int syncPricesForDate(LocalDate date) {
        LocalDate syncDate = date != null ? date : LocalDate.now();
        List<MarketPriceDto> fetchedRecords = mandiApiClient.fetchDailyMandiPrices(syncDate);
        int savedCount = 0;

        for (MarketPriceDto dto : fetchedRecords) {
            Market market = marketRepository.findById(dto.getMarketId()).orElse(null);
            Crop crop = cropRepository.findById(dto.getCropId()).orElse(null);
            CropVariety variety = dto.getVarietyId() != null 
                    ? cropVarietyRepository.findById(dto.getVarietyId()).orElse(null) 
                    : null;

            if (market != null && crop != null) {
                // Prevent duplicates
                var existing = marketPriceRepository.findByMarketIdAndCropIdAndVarietyIdAndDate(
                        market.getId(),
                        crop.getId(),
                        variety != null ? variety.getId() : null,
                        syncDate
                );

                if (existing.isEmpty()) {
                    MarketPrice price = MarketPrice.builder()
                            .market(market)
                            .crop(crop)
                            .variety(variety)
                            .date(syncDate)
                            .minPrice(dto.getMinPrice())
                            .maxPrice(dto.getMaxPrice())
                            .modalPrice(dto.getModalPrice())
                            .arrivalQuantity(dto.getArrivalQuantity())
                            .unit(dto.getUnit() != null ? dto.getUnit() : "₹/Quintal")
                            .source(dto.getSource() != null ? dto.getSource() : "AGMARKNET")
                            .build();
                    marketPriceRepository.save(price);
                    savedCount++;
                }
            }
        }

        log.info("Mandi price synchronization finished. Inserted {} new price records for date: {}", savedCount, syncDate);
        return savedCount;
    }
}
