package com.sih.marketlink.dto.buyer;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuyerProfileDto {

    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String mobile;
    private String businessName;
    private String businessType;
    private String state;
    private String district;
    private String address;
    private Double latitude;
    private Double longitude;
    private Boolean verified;
    private Double rating;
    private Integer totalTransactions;
}
