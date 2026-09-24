package com.sih.marketlink.service;

import com.sih.marketlink.dto.market.MarketDto;
import com.sih.marketlink.entity.Market;
import com.sih.marketlink.exception.ResourceNotFoundException;
import com.sih.marketlink.repository.MarketRepository;
import com.sih.marketlink.util.HaversineUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class MarketService {

    private final MarketRepository marketRepository;

    public MarketService(MarketRepository marketRepository) {
        this.marketRepository = marketRepository;
    }

    public List<MarketDto> getAllMarkets() {
        return marketRepository.findAllActiveMarkets().stream()
                .map(this::mapToDto)
                .toList();
    }

    public MarketDto getMarketById(Long id) {
        Market market = marketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Market not found with id: " + id));
        return mapToDto(market);
    }

    public List<MarketDto> getNearbyMarkets(Double latitude, Double longitude, Double radiusKm) {
        double radius = radiusKm != null && radiusKm > 0 ? radiusKm : 300.0;
        double lat = latitude != null ? latitude : 20.0059;
        double lng = longitude != null ? longitude : 73.7898;

        return marketRepository.findAllActiveMarkets().stream()
                .map(market -> {
                    double dist = HaversineUtil.calculateDistanceKm(lat, lng, market.getLatitude(), market.getLongitude());
                    MarketDto dto = mapToDto(market);
                    dto.setDistanceKm(dist);
                    return dto;
                })
                .filter(m -> m.getDistanceKm() <= radius)
                .sorted(Comparator.comparingDouble(MarketDto::getDistanceKm))
                .toList();
    }

    private MarketDto mapToDto(Market market) {
        return MarketDto.builder()
                .id(market.getId())
                .name(market.getName())
                .state(market.getState())
                .district(market.getDistrict())
                .address(market.getAddress())
                .latitude(market.getLatitude())
                .longitude(market.getLongitude())
                .active(market.getActive())
                .build();
    }
}
