package com.sih.marketlink.dto.farmer;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerCropDto {

    private Long id;
    private Long farmerId;

    @NotNull(message = "Crop ID is required")
    private Long cropId;
    private String cropName;

    private Long varietyId;
    private String varietyName;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;

    @NotNull(message = "Available date is required")
    private LocalDate availableDate;

    private Double expectedPrice;
    private String quality;
    private Double latitude;
    private Double longitude;
    private String status;
}
