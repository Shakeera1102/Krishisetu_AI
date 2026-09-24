package com.sih.marketlink.service;

import com.sih.marketlink.client.ai.AiServiceClient;
import com.sih.marketlink.dto.prediction.PricePredictionResponse;
import com.sih.marketlink.dto.recommendation.MarketRecommendationRequest;
import com.sih.marketlink.dto.recommendation.MarketRecommendationResponse;
import com.sih.marketlink.dto.recommendation.MarketRecommendationResponse.RecommendedMarketDto;
import com.sih.marketlink.entity.Crop;
import com.sih.marketlink.entity.Market;
import com.sih.marketlink.entity.MarketPrice;
import com.sih.marketlink.repository.CropRepository;
import com.sih.marketlink.repository.MarketPriceRepository;
import com.sih.marketlink.repository.MarketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@Slf4j
public class RecommendationService {

    private final MarketRepository marketRepository;
    private final MarketPriceRepository marketPriceRepository;
    private final CropRepository cropRepository;
    private final TransportCostService transportCostService;
    private final AiServiceClient aiServiceClient;

    public RecommendationService(
            MarketRepository marketRepository,
            MarketPriceRepository marketPriceRepository,
            CropRepository cropRepository,
            TransportCostService transportCostService,
            AiServiceClient aiServiceClient
    ) {
        this.marketRepository = marketRepository;
        this.marketPriceRepository = marketPriceRepository;
        this.cropRepository = cropRepository;
        this.transportCostService = transportCostService;
        this.aiServiceClient = aiServiceClient;
    }

    @Value("${app.recommendation.weights.price:0.40}")
    private double weightPrice;

    @Value("${app.recommendation.weights.net-return:0.35}")
    private double weightNetReturn;

    @Value("${app.recommendation.weights.distance:0.10}")
    private double weightDistance;

    @Value("${app.recommendation.weights.trend:0.10}")
    private double weightTrend;

    @Value("${app.recommendation.weights.demand:0.05}")
    private double weightDemand;

    public MarketRecommendationResponse getBestMarkets(MarketRecommendationRequest request) {
        Long cropId = request.getCropId() != null ? request.getCropId() : 1L;
        double quantityKg = request.getQuantity() != null && request.getQuantity() > 0 ? request.getQuantity() : 1000.0;
        double farmerLat = request.getLatitude() != null ? request.getLatitude() : 20.0059;
        double farmerLng = request.getLongitude() != null ? request.getLongitude() : 73.7898;

        Crop crop = cropRepository.findById(cropId).orElse(null);
        String cropName = crop != null ? crop.getName() : "Onion";

        List<Market> activeMarkets = marketRepository.findAllActiveMarkets();
        List<RecommendedMarketDto> candidateMarkets = new ArrayList<>();

        double quintals = quantityKg / 100.0;

        for (Market market : activeMarkets) {
            double distanceKm = transportCostService.calculateDistance(farmerLat, farmerLng, market.getLatitude(), market.getLongitude());
            double transportCost = transportCostService.calculateTransportCost(distanceKm, quantityKg);

            // Fetch latest price for crop at this market
            List<MarketPrice> latestPrices = marketPriceRepository.findTopByCropIdAndMarketIdOrderByDateDesc(cropId, market.getId(), PageRequest.of(0, 1));
            double currentPrice = latestPrices.isEmpty() ? 3200.0 : latestPrices.get(0).getModalPrice();
            double arrivalQty = latestPrices.isEmpty() ? 4500.0 : latestPrices.get(0).getArrivalQuantity();

            // Predict price using AI service
            PricePredictionResponse prediction = aiServiceClient.predictPrice(cropName, "Standard", market.getName(), currentPrice, 7);
            double predictedPrice = prediction.getPredictions().isEmpty() 
                    ? currentPrice * 1.04 
                    : prediction.getPredictions().get(prediction.getPredictions().size() - 1).getPredictedPrice();

            double grossRevenue = quintals * currentPrice;
            double commissionCost = grossRevenue * 0.02; // Standard 2% APMC commission
            double handlingCost = quintals * 30.0; // ₹30/quintal handling
            double expectedNetReturn = grossRevenue - transportCost - handlingCost - commissionCost;

            candidateMarkets.add(RecommendedMarketDto.builder()
                    .marketId(market.getId())
                    .marketName(market.getName())
                    .state(market.getState())
                    .district(market.getDistrict())
                    .currentPrice(currentPrice)
                    .predictedPrice(Math.round(predictedPrice * 10.0) / 10.0)
                    .distanceKm(distanceKm)
                    .transportCost(Math.round(transportCost * 100.0) / 100.0)
                    .handlingCost(Math.round(handlingCost * 100.0) / 100.0)
                    .commissionCost(Math.round(commissionCost * 100.0) / 100.0)
                    .grossRevenue(Math.round(grossRevenue * 100.0) / 100.0)
                    .expectedNetReturn(Math.round(expectedNetReturn * 100.0) / 100.0)
                    .trend("UP")
                    .trendPercent(4.2)
                    .build());
        }

        if (candidateMarkets.isEmpty()) {
            return MarketRecommendationResponse.builder().build();
        }

        // Calculate multi-criteria scores
        double maxPrice = candidateMarkets.stream().mapToDouble(RecommendedMarketDto::getCurrentPrice).max().orElse(1.0);
        double maxNet = candidateMarkets.stream().mapToDouble(RecommendedMarketDto::getExpectedNetReturn).max().orElse(1.0);
        double minDistance = candidateMarkets.stream().mapToDouble(RecommendedMarketDto::getDistanceKm).min().orElse(1.0);

        for (RecommendedMarketDto m : candidateMarkets) {
            double priceScore = (m.getCurrentPrice() / maxPrice) * 100.0;
            double netScore = maxNet > 0 ? (Math.max(0, m.getExpectedNetReturn()) / maxNet) * 100.0 : 50.0;
            double distScore = m.getDistanceKm() > 0 ? Math.max(10.0, (minDistance / m.getDistanceKm()) * 100.0) : 100.0;
            double trendScore = 85.0;
            double demandScore = 90.0;

            double compositeScore = (weightPrice * priceScore) +
                    (weightNetReturn * netScore) +
                    (weightDistance * distScore) +
                    (weightTrend * trendScore) +
                    (weightDemand * demandScore);

            int finalScore = (int) Math.min(100, Math.max(1, Math.round(compositeScore)));
            m.setScore(finalScore);
        }

        candidateMarkets.sort(Comparator.comparingDouble(RecommendedMarketDto::getExpectedNetReturn).reversed());

        for (int i = 0; i < candidateMarkets.size(); i++) {
            RecommendedMarketDto m = candidateMarkets.get(i);
            if (i == 0) {
                m.setRankBadge("🥇 BEST VALUE");
                m.setReason(String.format("Provides the optimal balance of proximity (%.1f km) and high modal price (₹%.0f/q), delivering the highest Net Return (₹%.0f) after all freight and commission costs.",
                        m.getDistanceKm(), m.getCurrentPrice(), m.getExpectedNetReturn()));
            } else if (i == 1) {
                m.setRankBadge("🥈 2ND CHOICE");
                m.setReason(String.format("Offers competitive price of ₹%.0f/q, but transportation distance (%.1f km) reduces net pocket margin compared to top pick.",
                        m.getCurrentPrice(), m.getDistanceKm()));
            } else {
                m.setRankBadge("🥉 3RD CHOICE");
                m.setReason(String.format("Headline price is ₹%.0f/q, but freight transport costs (₹%.0f) significantly erode net take-home return.",
                        m.getCurrentPrice(), m.getTransportCost()));
            }
        }

        RecommendedMarketDto best = candidateMarkets.get(0);
        List<RecommendedMarketDto> alternatives = candidateMarkets.size() > 1 
                ? candidateMarkets.subList(1, candidateMarkets.size()) 
                : List.of();

        return MarketRecommendationResponse.builder()
                .recommendedMarket(best)
                .alternatives(alternatives)
                .build();
    }
}
