package com.sih.marketlink.service;

import com.sih.marketlink.dto.offer.CounterOfferRequest;
import com.sih.marketlink.dto.offer.CreateOfferRequest;
import com.sih.marketlink.dto.offer.OfferResponse;
import com.sih.marketlink.entity.*;
import com.sih.marketlink.exception.BadRequestException;
import com.sih.marketlink.exception.ResourceNotFoundException;
import com.sih.marketlink.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OfferService {

    private final OfferRepository offerRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final BuyerProfileRepository buyerProfileRepository;
    private final CropRepository cropRepository;
    private final BuyerRequirementRepository buyerRequirementRepository;
    private final FarmerCropRepository farmerCropRepository;

    public OfferService(
            OfferRepository offerRepository,
            FarmerProfileRepository farmerProfileRepository,
            BuyerProfileRepository buyerProfileRepository,
            CropRepository cropRepository,
            BuyerRequirementRepository buyerRequirementRepository,
            FarmerCropRepository farmerCropRepository
    ) {
        this.offerRepository = offerRepository;
        this.farmerProfileRepository = farmerProfileRepository;
        this.buyerProfileRepository = buyerProfileRepository;
        this.cropRepository = cropRepository;
        this.buyerRequirementRepository = buyerRequirementRepository;
        this.farmerCropRepository = farmerCropRepository;
    }

    @Transactional
    public OfferResponse createOffer(CreateOfferRequest request, Long userId) {
        FarmerProfile farmer = farmerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for authenticated user"));

        BuyerProfile buyer = buyerProfileRepository.findById(request.getBuyerId())
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found with id: " + request.getBuyerId()));

        Crop crop = cropRepository.findById(request.getCropId())
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with id: " + request.getCropId()));

        // Concurrency / Status Check: verify if farmer's crop is already committed via an ACCEPTED offer
        List<Offer> farmerOffers = offerRepository.findByFarmerIdOrderByCreatedAtDesc(farmer.getId());
        boolean hasActiveAcceptedOffer = farmerOffers.stream()
                .anyMatch(o -> o.getCrop().getId().equals(crop.getId()) && "ACCEPTED".equalsIgnoreCase(o.getStatus()));

        List<FarmerCrop> farmerCrops = farmerCropRepository.findByFarmerId(farmer.getId());
        FarmerCrop matchingCrop = farmerCrops.stream()
                .filter(fc -> fc.getCrop().getId().equals(crop.getId()))
                .findFirst()
                .orElse(null);

        if ((matchingCrop != null && "SOLD".equalsIgnoreCase(matchingCrop.getStatus())) || hasActiveAcceptedOffer) {
            throw new BadRequestException("This crop is already committed to another mandi or sold.");
        }

        BuyerRequirement req = null;
        if (request.getRequirementId() != null) {
            req = buyerRequirementRepository.findById(request.getRequirementId()).orElse(null);
        }

        double totalAmount = (request.getQuantity() / 100.0) * request.getPricePerUnit();

        Offer offer = Offer.builder()
                .farmer(farmer)
                .buyer(buyer)
                .requirement(req)
                .crop(crop)
                .quantity(request.getQuantity())
                .pricePerUnit(request.getPricePerUnit())
                .totalAmount(totalAmount)
                .message(request.getMessage())
                .status("PENDING")
                .build();

        Offer saved = offerRepository.save(offer);
        return mapToDto(saved);
    }

    public List<OfferResponse> getFarmerOffers(Long userId, String status) {
        FarmerProfile farmer = farmerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));

        List<Offer> list = (status != null && !status.equalsIgnoreCase("ALL"))
                ? offerRepository.findByFarmerIdAndStatusOrderByCreatedAtDesc(farmer.getId(), status.toUpperCase())
                : offerRepository.findByFarmerIdOrderByCreatedAtDesc(farmer.getId());

        return list.stream().map(this::mapToDto).toList();
    }

    public List<OfferResponse> getBuyerOffers(Long userId, String status) {
        BuyerProfile buyer = buyerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        List<Offer> list = (status != null && !status.equalsIgnoreCase("ALL"))
                ? offerRepository.findByBuyerIdAndStatusOrderByCreatedAtDesc(buyer.getId(), status.toUpperCase())
                : offerRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId());

        return list.stream().map(this::mapToDto).toList();
    }

    public OfferResponse getOfferById(Long id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with id: " + id));
        return mapToDto(offer);
    }

    @Transactional
    public OfferResponse acceptOffer(Long id, Long userId) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with id: " + id));

        // Strict State Checks
        String currentStatus = offer.getStatus();
        if ("SUPERSEDED".equalsIgnoreCase(currentStatus) || "CANCELLED".equalsIgnoreCase(currentStatus) || "REJECTED".equalsIgnoreCase(currentStatus)) {
            throw new BadRequestException("This offer is no longer active (Status: " + currentStatus + ")");
        }
        if ("ACCEPTED".equalsIgnoreCase(currentStatus)) {
            return mapToDto(offer); // Idempotent
        }

        Long farmerId = offer.getFarmer().getId();
        Long cropId = offer.getCrop().getId();

        // 1. Lock Farmer Crop
        List<FarmerCrop> farmerCrops = farmerCropRepository.findByFarmerId(farmerId);
        FarmerCrop farmerCrop = farmerCrops.stream()
                .filter(fc -> fc.getCrop().getId().equals(cropId))
                .findFirst()
                .orElse(null);

        if (farmerCrop != null) {
            if ("SOLD".equalsIgnoreCase(farmerCrop.getStatus())) {
                throw new BadRequestException("This crop has already been completed and sold.");
            }
            farmerCrop.setStatus("RESERVED");
            farmerCropRepository.save(farmerCrop);
        }

        // 2. Mark winning offer as ACCEPTED
        offer.setStatus("ACCEPTED");
        Offer saved = offerRepository.save(offer);

        // 3. Automatically SUPERSEDE all competing pending offers for the same farmer & crop
        List<Offer> competingOffers = offerRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
        for (Offer competing : competingOffers) {
            if (!competing.getId().equals(saved.getId()) &&
                    competing.getCrop().getId().equals(cropId) &&
                    ("PENDING".equalsIgnoreCase(competing.getStatus()) || "COUNTERED".equalsIgnoreCase(competing.getStatus()))) {
                competing.setStatus("SUPERSEDED");
                offerRepository.save(competing);
            }
        }

        return mapToDto(saved);
    }

    @Transactional
    public OfferResponse rejectOffer(Long id, Long userId) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with id: " + id));

        if ("ACCEPTED".equalsIgnoreCase(offer.getStatus()) || "COMPLETED".equalsIgnoreCase(offer.getStatus())) {
            throw new BadRequestException("Cannot reject an accepted or completed offer.");
        }

        offer.setStatus("REJECTED");
        Offer saved = offerRepository.save(offer);

        // Restore crop status to ACTIVE if no other ACCEPTED offer exists
        Long farmerId = offer.getFarmer().getId();
        Long cropId = offer.getCrop().getId();
        List<Offer> remainingOffers = offerRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
        boolean hasOtherAccepted = remainingOffers.stream()
                .anyMatch(o -> !o.getId().equals(saved.getId()) && o.getCrop().getId().equals(cropId) && "ACCEPTED".equalsIgnoreCase(o.getStatus()));

        if (!hasOtherAccepted) {
            List<FarmerCrop> farmerCrops = farmerCropRepository.findByFarmerId(farmerId);
            farmerCrops.stream()
                    .filter(fc -> fc.getCrop().getId().equals(cropId) && !"SOLD".equalsIgnoreCase(fc.getStatus()))
                    .findFirst()
                    .ifPresent(fc -> {
                        fc.setStatus("ACTIVE");
                        farmerCropRepository.save(fc);
                    });
        }

        return mapToDto(saved);
    }

    @Transactional
    public OfferResponse counterOffer(Long id, CounterOfferRequest request, Long userId) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with id: " + id));

        if (!"PENDING".equalsIgnoreCase(offer.getStatus()) && !"COUNTERED".equalsIgnoreCase(offer.getStatus())) {
            throw new BadRequestException("Cannot counter an offer with status: " + offer.getStatus());
        }

        offer.setPricePerUnit(request.getCounterPrice());
        offer.setTotalAmount((offer.getQuantity() / 100.0) * request.getCounterPrice());
        offer.setStatus("COUNTERED");
        if (request.getMessage() != null) {
            offer.setMessage(request.getMessage());
        }
        return mapToDto(offerRepository.save(offer));
    }

    public OfferResponse mapToDto(Offer offer) {
        return OfferResponse.builder()
                .id(offer.getId())
                .farmerId(offer.getFarmer().getId())
                .farmerName(offer.getFarmer().getUser().getName())
                .buyerId(offer.getBuyer().getId())
                .buyerName(offer.getBuyer().getBusinessName())
                .requirementId(offer.getRequirement() != null ? offer.getRequirement().getId() : null)
                .cropId(offer.getCrop().getId())
                .cropName(offer.getCrop().getName())
                .quantity(offer.getQuantity())
                .pricePerUnit(offer.getPricePerUnit())
                .totalAmount(offer.getTotalAmount())
                .message(offer.getMessage())
                .status(offer.getStatus())
                .createdAt(offer.getCreatedAt())
                .updatedAt(offer.getUpdatedAt())
                .build();
    }
}
