package com.sih.marketlink.dto.buyer;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuyerRequirementRequest {

    @NotNull(message = "Crop ID is required")
    private Long cropId;

    private Long varietyId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;

    @Builder.Default
    private String minimumQuality = "GRADE_A";

    @NotNull(message = "Required date is required")
    private LocalDate requiredDate;

    @NotNull(message = "Offer price is required")
    @Positive(message = "Offer price must be positive")
    private Double offerPrice;

    private String location;
    private Double latitude;
    private Double longitude;
    private String description;
}
