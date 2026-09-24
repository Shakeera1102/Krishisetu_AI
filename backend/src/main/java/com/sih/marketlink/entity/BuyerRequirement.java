package com.sih.marketlink.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.ZonedDateTime;

@Entity
@Table(
        name = "buyer_requirements",
        indexes = {
                @Index(name = "idx_buyer_requirements_crop_variety_status", columnList = "crop_id, variety_id, status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuyerRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private BuyerProfile buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id", nullable = false)
    private Crop crop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variety_id")
    private CropVariety variety;

    @Column(nullable = false)
    private Double quantity;

    @Column(name = "minimum_quality", length = 50)
    @Builder.Default
    private String minimumQuality = "GRADE_A";

    @Column(name = "required_date", nullable = false)
    private LocalDate requiredDate;

    @Column(length = 200)
    private String location;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column(name = "offer_price", nullable = false)
    private Double offerPrice;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE"; // 'ACTIVE', 'CLOSED', 'EXPIRED'

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = ZonedDateTime.now();
    }
}
