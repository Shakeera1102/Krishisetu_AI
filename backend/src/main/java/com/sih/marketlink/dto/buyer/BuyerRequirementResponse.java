package com.sih.marketlink.dto.buyer;

import lombok.*;

import java.time.LocalDate;
import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuyerRequirementResponse {

    private Long id;
    private Long buyerId;
    private String businessName;
    private Long cropId;
    private String cropName;
    private Long varietyId;
    private String varietyName;
    private Double quantity;
    private String minimumQuality;
    private LocalDate requiredDate;
    private String location;
    private Double latitude;
    private Double longitude;
    private Double offerPrice;
    private String description;
    private String status;
    private Double distanceKm;
    private Integer matchingFarmersCount;
    private ZonedDateTime createdAt;
}
