package com.sih.marketlink.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "crop_varieties",
        uniqueConstraints = @UniqueConstraint(name = "uk_crop_variety", columnNames = {"crop_id", "name"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CropVariety {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id", nullable = false)
    private Crop crop;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;
}
