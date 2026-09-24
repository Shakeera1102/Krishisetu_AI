package com.sih.marketlink.service;

import com.sih.marketlink.dto.matching.BuyerMatchResponse;
import com.sih.marketlink.dto.matching.BuyerMatchResponse.MatchBreakdownDto;
import com.sih.marketlink.dto.matching.FarmerMatchResponse;
import com.sih.marketlink.entity.BuyerRequirement;
import com.sih.marketlink.entity.FarmerCrop;
import com.sih.marketlink.entity.FarmerProfile;
import com.sih.marketlink.repository.BuyerRequirementRepository;
import com.sih.marketlink.repository.FarmerCropRepository;
import com.sih.marketlink.repository.FarmerProfileRepository;
import com.sih.marketlink.util.HaversineUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class BuyerMatchingService {

    private final BuyerRequirementRepository buyerRequirementRepository;
    private final FarmerCropRepository farmerCropRepository;
    private final FarmerProfileRepository farmerProfileRepository;

    public BuyerMatchingService(
            BuyerRequirementRepository buyerRequirementRepository,
            FarmerCropRepository farmerCropRepository,
            FarmerProfileRepository farmerProfileRepository
    ) {
        this.buyerRequirementRepository = buyerRequirementRepository;
        this.farmerCropRepository = farmerCropRepository;
        this.farmerProfileRepository = farmerProfileRepository;
    }

    @Value("${app.matching.weights.crop:0.30}")
    private double weightCrop;

    @Value("${app.matching.weights.quantity:0.20}")
    private double weightQuantity;

    @Value("${app.matching.weights.distance:0.15}")
    private double weightDistance;

    @Value("${app.matching.weights.price:0.20}")
    private double weightPrice;

    @Value("${app.matching.weights.date:0.10}")
    private double weightDate;

    @Value("${app.matching.weights.quality:0.05}")
    private double weightQuality;

    public List<BuyerMatchResponse> findMatchingBuyers(Long farmerId, Long cropId, Long varietyId, Double quantity) {
        FarmerProfile farmer = farmerProfileRepository.findById(farmerId != null ? farmerId : 1L).orElse(null);
        double fLat = farmer != null && farmer.getLatitude() != null ? farmer.getLatitude() : 20.0059;
        double fLng = farmer != null && farmer.getLongitude() != null ? farmer.getLongitude() : 73.7898;

        List<BuyerRequirement> activeRequirements = cropId != null 
                ? buyerRequirementRepository.findActiveByCropId(cropId) 
                : buyerRequirementRepository.findAllActive();

        List<BuyerMatchResponse> matches = new ArrayList<>();
        double farmerQty = quantity != null && quantity > 0 ? quantity : 1000.0;

        for (BuyerRequirement req : activeRequirements) {
            double distanceKm = HaversineUtil.calculateDistanceKm(
                    fLat, fLng,
                    req.getLatitude() != null ? req.getLatitude() : 18.75,
                    req.getLongitude() != null ? req.getLongitude() : 73.85
            );

            // Sub-scores
            int cropScore = (cropId == null || req.getCrop().getId().equals(cropId)) ? 100 : 0;
            int varietyScore = (varietyId == null || (req.getVariety() != null && req.getVariety().getId().equals(varietyId))) ? 100 : 80;
            int effectiveCropScore = (int) (cropScore * 0.7 + varietyScore * 0.3);

            double qtyRatio = Math.min(farmerQty, req.getQuantity()) / Math.max(farmerQty, req.getQuantity());
            int qtyScore = (int) Math.round(qtyRatio * 100.0);

            int distScore = (int) Math.max(10, Math.min(100, Math.round(100.0 - (distanceKm * 0.4))));
            int priceScore = req.getOfferPrice() >= 3200 ? 96 : 85;
            int dateScore = 90;
            int qualityScore = 95;

            double composite = (weightCrop * effectiveCropScore) +
                    (weightQuantity * qtyScore) +
                    (weightDistance * distScore) +
                    (weightPrice * priceScore) +
                    (weightDate * dateScore) +
                    (weightQuality * qualityScore);

            int totalScore = (int) Math.min(99, Math.max(50, Math.round(composite)));

            MatchBreakdownDto breakdown = MatchBreakdownDto.builder()
                    .cropMatch(effectiveCropScore)
                    .quantityMatch(qtyScore)
                    .distanceMatch(distScore)
                    .priceMatch(priceScore)
                    .dateMatch(dateScore)
                    .qualityMatch(qualityScore)
                    .build();

            matches.add(BuyerMatchResponse.builder()
                    .requirementId(req.getId())
                    .buyerId(req.getBuyer().getId())
                    .businessName(req.getBuyer().getBusinessName())
                    .businessType(req.getBuyer().getBusinessType())
                    .verified(req.getBuyer().getVerified())
                    .rating(req.getBuyer().getRating())
                    .cropName(req.getCrop().getName())
                    .varietyName(req.getVariety() != null ? req.getVariety().getName() : "Standard")
                    .quantityRequired(req.getQuantity())
                    .offerPrice(req.getOfferPrice())
                    .location(req.getLocation())
                    .distanceKm(distanceKm)
                    .requiredDate(req.getRequiredDate())
                    .matchScore(totalScore)
                    .matchBreakdown(breakdown)
                    .build());
        }

        matches.sort(Comparator.comparingInt(BuyerMatchResponse::getMatchScore).reversed());
        return matches;
    }

    public List<FarmerMatchResponse> findMatchingFarmersForBuyer(Long buyerId) {
        List<FarmerCrop> availableCrops = farmerCropRepository.findAllAvailable();
        List<FarmerMatchResponse> matches = new ArrayList<>();

        for (FarmerCrop fc : availableCrops) {
            double distanceKm = HaversineUtil.calculateDistanceKm(18.75, 73.85, fc.getLatitude() != null ? fc.getLatitude() : 20.0059, fc.getLongitude() != null ? fc.getLongitude() : 73.7898);
            int score = (int) Math.max(70, Math.min(98, 100 - (int) (distanceKm * 0.2)));

            matches.add(FarmerMatchResponse.builder()
                    .farmerCropId(fc.getId())
                    .farmerId(fc.getFarmer().getId())
                    .farmerName(fc.getFarmer().getUser().getName())
                    .cropName(fc.getCrop().getName())
                    .varietyName(fc.getVariety() != null ? fc.getVariety().getName() : "Standard")
                    .availableQuantity(fc.getQuantity())
                    .expectedPrice(fc.getExpectedPrice() != null ? fc.getExpectedPrice() : 3300.0)
                    .quality(fc.getQuality())
                    .location(fc.getFarmer().getDistrict() + ", " + fc.getFarmer().getState())
                    .distanceKm(distanceKm)
                    .availableDate(fc.getAvailableDate())
                    .matchScore(score)
                    .build());
        }

        matches.sort(Comparator.comparingInt(FarmerMatchResponse::getMatchScore).reversed());
        return matches;
    }
}
