package com.sih.marketlink.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.ZonedDateTime;

@Entity
@Table(
        name = "farmer_crops",
        indexes = {
                @Index(name = "idx_farmer_crops_crop_variety_status", columnList = "crop_id, variety_id, status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerCrop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private FarmerProfile farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id", nullable = false)
    private Crop crop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variety_id")
    private CropVariety variety;

    @Column(nullable = false)
    private Double quantity;

    @Column(name = "available_date", nullable = false)
    private LocalDate availableDate;

    @Column(name = "expected_price")
    private Double expectedPrice;

    @Column(length = 50)
    @Builder.Default
    private String quality = "GRADE_A";

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "AVAILABLE"; // 'AVAILABLE', 'RESERVED', 'SOLD'

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
