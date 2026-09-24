package com.sih.marketlink.dto.farmer;

import com.sih.marketlink.dto.market.MarketPriceDto;
import com.sih.marketlink.dto.matching.BuyerMatchResponse;
import com.sih.marketlink.dto.offer.OfferResponse;
import com.sih.marketlink.dto.prediction.PricePredictionResponse;
import com.sih.marketlink.dto.recommendation.MarketRecommendationResponse;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerDashboardResponse {

    private FarmerProfileDto farmerProfile;
    private List<FarmerCropDto> currentCrops;
    private List<MarketPriceDto> topMarketPrices;
    private MarketRecommendationResponse.RecommendedMarketDto bestRecommendation;
    private PricePredictionResponse pricePrediction;
    private List<BuyerMatchResponse> topBuyerMatches;
    private List<OfferResponse> recentOffers;
}
