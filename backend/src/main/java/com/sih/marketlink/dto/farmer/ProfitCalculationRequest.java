package com.sih.marketlink.dto.farmer;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfitCalculationRequest {

    private Long cropId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity; // in kg

    @NotNull(message = "Selling price is required")
    @Positive(message = "Selling price must be positive")
    private Double sellingPrice; // ₹ per quintal

    @PositiveOrZero(message = "Transport cost cannot be negative")
    @Builder.Default
    private Double transportCost = 0.0;

    @PositiveOrZero(message = "Handling cost cannot be negative")
    @Builder.Default
    private Double handlingCost = 0.0;

    @PositiveOrZero(message = "Storage cost cannot be negative")
    @Builder.Default
    private Double storageCost = 0.0;

    @PositiveOrZero(message = "Commission cannot be negative")
    @Builder.Default
    private Double commission = 0.0;

    @PositiveOrZero(message = "Other cost cannot be negative")
    @Builder.Default
    private Double otherCost = 0.0;
}
