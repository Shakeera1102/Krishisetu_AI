package com.sih.marketlink.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.ZonedDateTime;

@Entity
@Table(
        name = "market_prices",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_market_crop_variety_date",
                columnNames = {"market_id", "crop_id", "variety_id", "date"}
        ),
        indexes = {
                @Index(name = "idx_market_prices_crop_id", columnList = "crop_id"),
                @Index(name = "idx_market_prices_market_id", columnList = "market_id"),
                @Index(name = "idx_market_prices_date", columnList = "date"),
                @Index(name = "idx_market_prices_crop_market_date", columnList = "crop_id, market_id, date")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id", nullable = false)
    private Crop crop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variety_id")
    private CropVariety variety;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "min_price", nullable = false)
    private Double minPrice;

    @Column(name = "max_price", nullable = false)
    private Double maxPrice;

    @Column(name = "modal_price", nullable = false)
    private Double modalPrice;

    @Column(name = "arrival_quantity")
    @Builder.Default
    private Double arrivalQuantity = 0.0;

    @Column(length = 30)
    @Builder.Default
    private String unit = "₹/Quintal";

    @Column(length = 100)
    @Builder.Default
    private String source = "AGMARKNET";

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
