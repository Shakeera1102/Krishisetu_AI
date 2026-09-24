package com.sih.marketlink.dto.offer;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounterOfferRequest {

    @NotNull(message = "Counter price is required")
    @Positive(message = "Counter price must be positive")
    private Double counterPrice;

    private String message;
}
