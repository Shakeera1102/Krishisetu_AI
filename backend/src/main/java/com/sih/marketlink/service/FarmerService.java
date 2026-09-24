package com.sih.marketlink.service;

import com.sih.marketlink.dto.farmer.FarmerCropDto;
import com.sih.marketlink.dto.farmer.FarmerDashboardResponse;
import com.sih.marketlink.dto.farmer.FarmerProfileDto;
import com.sih.marketlink.dto.market.MarketPriceDto;
import com.sih.marketlink.dto.matching.BuyerMatchResponse;
import com.sih.marketlink.dto.offer.OfferResponse;
import com.sih.marketlink.dto.prediction.PricePredictionResponse;
import com.sih.marketlink.dto.recommendation.MarketRecommendationRequest;
import com.sih.marketlink.dto.recommendation.MarketRecommendationResponse;
import com.sih.marketlink.entity.Crop;
import com.sih.marketlink.entity.CropVariety;
import com.sih.marketlink.entity.FarmerCrop;
import com.sih.marketlink.entity.FarmerProfile;
import com.sih.marketlink.exception.ResourceNotFoundException;
import com.sih.marketlink.repository.CropRepository;
import com.sih.marketlink.repository.CropVarietyRepository;
import com.sih.marketlink.repository.FarmerCropRepository;
import com.sih.marketlink.repository.FarmerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class FarmerService {

    private final FarmerProfileRepository farmerProfileRepository;
    private final FarmerCropRepository farmerCropRepository;
    private final CropRepository cropRepository;
    private final CropVarietyRepository cropVarietyRepository;
    private final MarketPriceService marketPriceService;
    private final RecommendationService recommendationService;
    private final PricePredictionService pricePredictionService;
    private final BuyerMatchingService buyerMatchingService;
    private final OfferService offerService;

    public FarmerService(
            FarmerProfileRepository farmerProfileRepository,
            FarmerCropRepository farmerCropRepository,
            CropRepository cropRepository,
            CropVarietyRepository cropVarietyRepository,
            MarketPriceService marketPriceService,
            RecommendationService recommendationService,
            PricePredictionService pricePredictionService,
            BuyerMatchingService buyerMatchingService,
            OfferService offerService
    ) {
        this.farmerProfileRepository = farmerProfileRepository;
        this.farmerCropRepository = farmerCropRepository;
        this.cropRepository = cropRepository;
        this.cropVarietyRepository = cropVarietyRepository;
        this.marketPriceService = marketPriceService;
        this.recommendationService = recommendationService;
        this.pricePredictionService = pricePredictionService;
        this.buyerMatchingService = buyerMatchingService;
        this.offerService = offerService;
    }

    public FarmerProfileDto getProfileByUserId(Long userId) {
        FarmerProfile profile = farmerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for user id: " + userId));
        return mapProfileToDto(profile);
    }

    @Transactional
    public FarmerProfileDto updateProfile(Long userId, FarmerProfileDto dto) {
        FarmerProfile profile = farmerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for user id: " + userId));

        if (dto.getState() != null) profile.setState(dto.getState());
        if (dto.getDistrict() != null) profile.setDistrict(dto.getDistrict());
        if (dto.getVillage() != null) profile.setVillage(dto.getVillage());
        if (dto.getLatitude() != null) profile.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) profile.setLongitude(dto.getLongitude());
        if (dto.getPreferredLanguage() != null) profile.setPreferredLanguage(dto.getPreferredLanguage());
        if (dto.getFarmSize() != null) profile.setFarmSize(dto.getFarmSize());

        return mapProfileToDto(farmerProfileRepository.save(profile));
    }

    @Transactional
    public FarmerCropDto addCrop(Long userId, FarmerCropDto dto) {
        FarmerProfile farmer = farmerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for user id: " + userId));

        Crop crop = cropRepository.findById(dto.getCropId())
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with id: " + dto.getCropId()));

        CropVariety variety = null;
        if (dto.getVarietyId() != null) {
            variety = cropVarietyRepository.findById(dto.getVarietyId()).orElse(null);
        }

        FarmerCrop farmerCrop = FarmerCrop.builder()
                .farmer(farmer)
                .crop(crop)
                .variety(variety)
                .quantity(dto.getQuantity())
                .availableDate(dto.getAvailableDate() != null ? dto.getAvailableDate() : LocalDate.now())
                .expectedPrice(dto.getExpectedPrice())
                .quality(dto.getQuality() != null ? dto.getQuality() : "Grade A Premium")
                .latitude(farmer.getLatitude())
                .longitude(farmer.getLongitude())
                .status("AVAILABLE")
                .build();

        FarmerCrop saved = farmerCropRepository.save(farmerCrop);
        return mapCropToDto(saved);
    }

    public List<FarmerCropDto> getFarmerCrops(Long userId) {
        FarmerProfile farmer = farmerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));

        return farmerCropRepository.findByFarmerId(farmer.getId()).stream()
                .map(this::mapCropToDto)
                .toList();
    }

    public FarmerDashboardResponse getDashboard(Long userId) {
        FarmerProfile profile = farmerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for user id: " + userId));

        List<FarmerCropDto> crops = getFarmerCrops(userId);
        Long currentCropId = crops.isEmpty() ? 1L : crops.get(0).getCropId();
        Double currentQty = crops.isEmpty() ? 1000.0 : crops.get(0).getQuantity();

        // 1. Top market prices
        List<MarketPriceDto> topPrices = marketPriceService.getCurrentPrices(currentCropId, null, null, null, null, null, 1, 3).getContent();

        // 2. Best Recommendation
        MarketRecommendationRequest recoReq = MarketRecommendationRequest.builder()
                .cropId(currentCropId)
                .quantity(currentQty)
                .latitude(profile.getLatitude() != null ? profile.getLatitude() : 20.0059)
                .longitude(profile.getLongitude() != null ? profile.getLongitude() : 73.7898)
                .build();
        MarketRecommendationResponse recoRes = recommendationService.getBestMarkets(recoReq);

        // 3. Price Prediction
        PricePredictionResponse prediction = pricePredictionService.predictPrice(currentCropId, null, 1L, 7);

        // 4. Buyer Matches
        List<BuyerMatchResponse> buyerMatches = buyerMatchingService.findMatchingBuyers(profile.getId(), currentCropId, null, currentQty);

        // 5. Recent Offers
        List<OfferResponse> offers = offerService.getFarmerOffers(userId, "ALL");

        return FarmerDashboardResponse.builder()
                .farmerProfile(mapProfileToDto(profile))
                .currentCrops(crops)
                .topMarketPrices(topPrices)
                .bestRecommendation(recoRes.getRecommendedMarket())
                .pricePrediction(prediction)
                .topBuyerMatches(buyerMatches.stream().limit(3).toList())
                .recentOffers(offers.stream().limit(5).toList())
                .build();
    }

    public FarmerProfileDto mapProfileToDto(FarmerProfile p) {
        return FarmerProfileDto.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .name(p.getUser().getName())
                .email(p.getUser().getEmail())
                .mobile(p.getUser().getMobile())
                .state(p.getState())
                .district(p.getDistrict())
                .village(p.getVillage())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .preferredLanguage(p.getPreferredLanguage())
                .farmSize(p.getFarmSize())
                .build();
    }

    public FarmerCropDto mapCropToDto(FarmerCrop fc) {
        return FarmerCropDto.builder()
                .id(fc.getId())
                .farmerId(fc.getFarmer().getId())
                .cropId(fc.getCrop().getId())
                .cropName(fc.getCrop().getName())
                .varietyId(fc.getVariety() != null ? fc.getVariety().getId() : null)
                .varietyName(fc.getVariety() != null ? fc.getVariety().getName() : "Standard")
                .quantity(fc.getQuantity())
                .availableDate(fc.getAvailableDate())
                .expectedPrice(fc.getExpectedPrice())
                .quality(fc.getQuality())
                .latitude(fc.getLatitude())
                .longitude(fc.getLongitude())
                .status(fc.getStatus())
                .build();
    }
}
