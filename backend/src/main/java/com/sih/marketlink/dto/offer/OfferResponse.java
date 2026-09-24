package com.sih.marketlink.dto.offer;

import lombok.*;

import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferResponse {

    private Long id;
    private Long farmerId;
    private String farmerName;
    private Long buyerId;
    private String buyerName;
    private Long requirementId;
    private Long cropId;
    private String cropName;
    private Double quantity;
    private Double pricePerUnit;
    private Double totalAmount;
    private String message;
    private String status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
