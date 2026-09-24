package com.sih.marketlink.dto.buyer;

import com.sih.marketlink.dto.matching.FarmerMatchResponse;
import com.sih.marketlink.dto.offer.OfferResponse;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuyerDashboardResponse {

    private BuyerProfileDto buyerProfile;
    private List<BuyerRequirementResponse> activeRequirements;
    private List<FarmerMatchResponse> matchingFarmers;
    private List<OfferResponse> pendingOffers;
    private Integer activeRequirementsCount;
    private Integer totalCompletedTransactions;
}
