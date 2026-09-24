package com.sih.marketlink.service;

import com.sih.marketlink.client.ai.AiServiceClient;
import com.sih.marketlink.dto.prediction.PricePredictionResponse;
import com.sih.marketlink.entity.Crop;
import com.sih.marketlink.entity.Market;
import com.sih.marketlink.entity.MarketPrice;
import com.sih.marketlink.repository.CropRepository;
import com.sih.marketlink.repository.MarketPriceRepository;
import com.sih.marketlink.repository.MarketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PricePredictionService {

    private final AiServiceClient aiServiceClient;
    private final CropRepository cropRepository;
    private final MarketRepository marketRepository;
    private final MarketPriceRepository marketPriceRepository;

    public PricePredictionService(
            AiServiceClient aiServiceClient,
            CropRepository cropRepository,
            MarketRepository marketRepository,
            MarketPriceRepository marketPriceRepository
    ) {
        this.aiServiceClient = aiServiceClient;
        this.cropRepository = cropRepository;
        this.marketRepository = marketRepository;
        this.marketPriceRepository = marketPriceRepository;
    }

    public PricePredictionResponse predictPrice(Long cropId, Long varietyId, Long marketId, Integer days) {
        Long cId = cropId != null ? cropId : 1L;
        Long mId = marketId != null ? marketId : 1L;
        int forecastDays = days != null && days > 0 ? days : 7;

        Crop crop = cropRepository.findById(cId).orElse(null);
        Market market = marketRepository.findById(mId).orElse(null);

        String cropName = crop != null ? crop.getName() : "Onion";
        String marketName = market != null ? market.getName() : "Nashik APMC";

        List<MarketPrice> latest = marketPriceRepository.findTopByCropIdAndMarketIdOrderByDateDesc(cId, mId, PageRequest.of(0, 1));
        double currentPrice = latest.isEmpty() ? 3200.0 : latest.get(0).getModalPrice();

        return aiServiceClient.predictPrice(cropName, "Standard", marketName, currentPrice, forecastDays);
    }
}
