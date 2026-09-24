package com.sih.marketlink.service;

import com.sih.marketlink.dto.buyer.BuyerDashboardResponse;
import com.sih.marketlink.dto.buyer.BuyerProfileDto;
import com.sih.marketlink.dto.buyer.BuyerRequirementRequest;
import com.sih.marketlink.dto.buyer.BuyerRequirementResponse;
import com.sih.marketlink.dto.common.PageResponse;
import com.sih.marketlink.dto.matching.FarmerMatchResponse;
import com.sih.marketlink.dto.offer.OfferResponse;
import com.sih.marketlink.entity.BuyerProfile;
import com.sih.marketlink.entity.BuyerRequirement;
import com.sih.marketlink.entity.Crop;
import com.sih.marketlink.entity.CropVariety;
import com.sih.marketlink.exception.ResourceNotFoundException;
import com.sih.marketlink.repository.*;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class BuyerService {

    private final BuyerProfileRepository buyerProfileRepository;
    private final BuyerRequirementRepository buyerRequirementRepository;
    private final CropRepository cropRepository;
    private final CropVarietyRepository cropVarietyRepository;
    private final BuyerMatchingService buyerMatchingService;
    private final OfferService offerService;

    public BuyerService(
            BuyerProfileRepository buyerProfileRepository,
            BuyerRequirementRepository buyerRequirementRepository,
            CropRepository cropRepository,
            CropVarietyRepository cropVarietyRepository,
            BuyerMatchingService buyerMatchingService,
            OfferService offerService
    ) {
        this.buyerProfileRepository = buyerProfileRepository;
        this.buyerRequirementRepository = buyerRequirementRepository;
        this.cropRepository = cropRepository;
        this.cropVarietyRepository = cropVarietyRepository;
        this.buyerMatchingService = buyerMatchingService;
        this.offerService = offerService;
    }

    public BuyerProfileDto getProfileByUserId(Long userId) {
        BuyerProfile profile = buyerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found for user id: " + userId));
        return mapProfileToDto(profile);
    }

    @Transactional
    public BuyerProfileDto updateProfile(Long userId, BuyerProfileDto dto) {
        BuyerProfile profile = buyerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found for user id: " + userId));

        if (dto.getBusinessName() != null) profile.setBusinessName(dto.getBusinessName());
        if (dto.getBusinessType() != null) profile.setBusinessType(dto.getBusinessType());
        if (dto.getState() != null) profile.setState(dto.getState());
        if (dto.getDistrict() != null) profile.setDistrict(dto.getDistrict());
        if (dto.getAddress() != null) profile.setAddress(dto.getAddress());
        if (dto.getLatitude() != null) profile.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) profile.setLongitude(dto.getLongitude());

        return mapProfileToDto(buyerProfileRepository.save(profile));
    }

    @Transactional
    public BuyerRequirementResponse createRequirement(Long userId, BuyerRequirementRequest request) {
        BuyerProfile buyer = buyerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found for user id: " + userId));

        Crop crop = cropRepository.findById(request.getCropId())
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with id: " + request.getCropId()));

        CropVariety variety = null;
        if (request.getVarietyId() != null) {
            variety = cropVarietyRepository.findById(request.getVarietyId()).orElse(null);
        }

        BuyerRequirement req = BuyerRequirement.builder()
                .buyer(buyer)
                .crop(crop)
                .variety(variety)
                .quantity(request.getQuantity())
                .minimumQuality(request.getMinimumQuality() != null ? request.getMinimumQuality() : "GRADE_A")
                .requiredDate(request.getRequiredDate())
                .location(request.getLocation() != null ? request.getLocation() : buyer.getDistrict() + ", " + buyer.getState())
                .latitude(request.getLatitude() != null ? request.getLatitude() : buyer.getLatitude())
                .longitude(request.getLongitude() != null ? request.getLongitude() : buyer.getLongitude())
                .offerPrice(request.getOfferPrice())
                .description(request.getDescription())
                .status("ACTIVE")
                .build();

        BuyerRequirement saved = buyerRequirementRepository.save(req);
        return mapRequirementToDto(saved);
    }

    public PageResponse<BuyerRequirementResponse> getRequirements(
            Long cropId,
            Long varietyId,
            Double minPrice,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), size > 0 ? size : 10, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<BuyerRequirement> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), "ACTIVE"));

            if (cropId != null) {
                predicates.add(cb.equal(root.get("crop").get("id"), cropId));
            }
            if (varietyId != null) {
                predicates.add(cb.equal(root.get("variety").get("id"), varietyId));
            }
            if (minPrice != null && minPrice > 0) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("offerPrice"), minPrice));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<BuyerRequirement> reqPage = buyerRequirementRepository.findAll(spec, pageable);
        List<BuyerRequirementResponse> dtos = reqPage.getContent().stream()
                .map(this::mapRequirementToDto)
                .toList();

        return PageResponse.<BuyerRequirementResponse>builder()
                .content(dtos)
                .pageNumber(reqPage.getNumber() + 1)
                .pageSize(reqPage.getSize())
                .totalElements(reqPage.getTotalElements())
                .totalPages(reqPage.getTotalPages())
                .last(reqPage.isLast())
                .build();
    }

    public BuyerRequirementResponse getRequirementById(Long id) {
        BuyerRequirement req = buyerRequirementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer requirement not found with id: " + id));
        return mapRequirementToDto(req);
    }

    public BuyerDashboardResponse getDashboard(Long userId) {
        BuyerProfile profile = buyerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found for user id: " + userId));

        List<BuyerRequirementResponse> activeRequirements = buyerRequirementRepository.findByBuyerIdAndStatus(profile.getId(), "ACTIVE")
                .stream().map(this::mapRequirementToDto).toList();

        List<FarmerMatchResponse> matchingFarmers = buyerMatchingService.findMatchingFarmersForBuyer(profile.getId());
        List<OfferResponse> pendingOffers = offerService.getBuyerOffers(userId, "PENDING");

        return BuyerDashboardResponse.builder()
                .buyerProfile(mapProfileToDto(profile))
                .activeRequirements(activeRequirements)
                .matchingFarmers(matchingFarmers.stream().limit(5).toList())
                .pendingOffers(pendingOffers)
                .activeRequirementsCount(activeRequirements.size())
                .totalCompletedTransactions(profile.getTotalTransactions())
                .build();
    }

    public BuyerProfileDto mapProfileToDto(BuyerProfile p) {
        return BuyerProfileDto.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .name(p.getUser().getName())
                .email(p.getUser().getEmail())
                .mobile(p.getUser().getMobile())
                .businessName(p.getBusinessName())
                .businessType(p.getBusinessType())
                .state(p.getState())
                .district(p.getDistrict())
                .address(p.getAddress())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .verified(p.getVerified())
                .rating(p.getRating())
                .totalTransactions(p.getTotalTransactions())
                .build();
    }

    public BuyerRequirementResponse mapRequirementToDto(BuyerRequirement br) {
        return BuyerRequirementResponse.builder()
                .id(br.getId())
                .buyerId(br.getBuyer().getId())
                .businessName(br.getBuyer().getBusinessName())
                .cropId(br.getCrop().getId())
                .cropName(br.getCrop().getName())
                .varietyId(br.getVariety() != null ? br.getVariety().getId() : null)
                .varietyName(br.getVariety() != null ? br.getVariety().getName() : "Standard")
                .quantity(br.getQuantity())
                .minimumQuality(br.getMinimumQuality())
                .requiredDate(br.getRequiredDate())
                .location(br.getLocation())
                .latitude(br.getLatitude())
                .longitude(br.getLongitude())
                .offerPrice(br.getOfferPrice())
                .description(br.getDescription())
                .status(br.getStatus())
                .matchingFarmersCount(5)
                .createdAt(br.getCreatedAt())
                .build();
    }
}
