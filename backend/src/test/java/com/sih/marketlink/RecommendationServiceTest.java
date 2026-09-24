package com.sih.marketlink;

import com.sih.marketlink.client.ai.AiServiceClient;
import com.sih.marketlink.dto.prediction.PricePredictionResponse;
import com.sih.marketlink.dto.recommendation.MarketRecommendationRequest;
import com.sih.marketlink.dto.recommendation.MarketRecommendationResponse;
import com.sih.marketlink.entity.Crop;
import com.sih.marketlink.entity.Market;
import com.sih.marketlink.entity.MarketPrice;
import com.sih.marketlink.repository.CropRepository;
import com.sih.marketlink.repository.MarketPriceRepository;
import com.sih.marketlink.repository.MarketRepository;
import com.sih.marketlink.service.RecommendationService;
import com.sih.marketlink.service.TransportCostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RecommendationServiceTest {

    @Mock
    private MarketRepository marketRepository;

    @Mock
    private MarketPriceRepository marketPriceRepository;

    @Mock
    private CropRepository cropRepository;

    @Mock
    private TransportCostService transportCostService;

    @Mock
    private AiServiceClient aiServiceClient;

    @InjectMocks
    private RecommendationService recommendationService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(recommendationService, "weightPrice", 0.40);
        ReflectionTestUtils.setField(recommendationService, "weightNetReturn", 0.35);
        ReflectionTestUtils.setField(recommendationService, "weightDistance", 0.10);
        ReflectionTestUtils.setField(recommendationService, "weightTrend", 0.10);
        ReflectionTestUtils.setField(recommendationService, "weightDemand", 0.05);
    }

    @Test
    void testBestMarketRecommendation() {
        Crop crop = Crop.builder().id(1L).name("Onion").build();
        Market market1 = Market.builder().id(1L).name("Nashik APMC").latitude(20.0059).longitude(73.7898).active(true).build();
        Market market2 = Market.builder().id(2L).name("Mumbai Vashi APMC").latitude(19.0760).longitude(73.0070).active(true).build();

        MarketPrice p1 = MarketPrice.builder().modalPrice(3200.0).build();
        MarketPrice p2 = MarketPrice.builder().modalPrice(3500.0).build();

        PricePredictionResponse pred = PricePredictionResponse.builder()
                .predictions(List.of(PricePredictionResponse.PredictionPointDto.builder().daysAhead(7).predictedPrice(3350.0).build()))
                .build();

        when(cropRepository.findById(1L)).thenReturn(Optional.of(crop));
        when(marketRepository.findAllActiveMarkets()).thenReturn(List.of(market1, market2));
        when(transportCostService.calculateDistance(anyDouble(), anyDouble(), eq(20.0059), eq(73.7898))).thenReturn(25.0);
        when(transportCostService.calculateDistance(anyDouble(), anyDouble(), eq(19.0760), eq(73.0070))).thenReturn(170.0);
        when(transportCostService.calculateTransportCost(eq(25.0), anyDouble())).thenReturn(900.0);
        when(transportCostService.calculateTransportCost(eq(170.0), anyDouble())).thenReturn(3500.0);

        when(marketPriceRepository.findTopByCropIdAndMarketIdOrderByDateDesc(eq(1L), eq(1L), any())).thenReturn(List.of(p1));
        when(marketPriceRepository.findTopByCropIdAndMarketIdOrderByDateDesc(eq(1L), eq(2L), any())).thenReturn(List.of(p2));
        when(aiServiceClient.predictPrice(any(), any(), any(), anyDouble(), anyInt())).thenReturn(pred);

        MarketRecommendationRequest request = MarketRecommendationRequest.builder()
                .cropId(1L)
                .quantity(1000.0)
                .latitude(20.00)
                .longitude(73.78)
                .build();

        MarketRecommendationResponse response = recommendationService.getBestMarkets(request);

        assertNotNull(response);
        assertNotNull(response.getRecommendedMarket());
        assertEquals("Nashik APMC", response.getRecommendedMarket().getMarketName());
        assertTrue(response.getRecommendedMarket().getExpectedNetReturn() > 0);
    }
}
