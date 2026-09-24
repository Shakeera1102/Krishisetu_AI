package com.sih.marketlink.dto.market;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketDto {

    private Long id;
    private String name;
    private String state;
    private String district;
    private String address;
    private Double latitude;
    private Double longitude;
    private Boolean active;
    private Double distanceKm;
}
