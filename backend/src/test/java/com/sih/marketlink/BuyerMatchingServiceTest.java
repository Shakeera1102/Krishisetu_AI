package com.sih.marketlink;

import com.sih.marketlink.dto.matching.BuyerMatchResponse;
import com.sih.marketlink.entity.BuyerProfile;
import com.sih.marketlink.entity.BuyerRequirement;
import com.sih.marketlink.entity.Crop;
import com.sih.marketlink.entity.FarmerProfile;
import com.sih.marketlink.repository.BuyerRequirementRepository;
import com.sih.marketlink.repository.FarmerCropRepository;
import com.sih.marketlink.repository.FarmerProfileRepository;
import com.sih.marketlink.service.BuyerMatchingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BuyerMatchingServiceTest {

    @Mock
    private BuyerRequirementRepository buyerRequirementRepository;

    @Mock
    private FarmerCropRepository farmerCropRepository;

    @Mock
    private FarmerProfileRepository farmerProfileRepository;

    @InjectMocks
    private BuyerMatchingService buyerMatchingService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(buyerMatchingService, "weightCrop", 0.30);
        ReflectionTestUtils.setField(buyerMatchingService, "weightQuantity", 0.20);
        ReflectionTestUtils.setField(buyerMatchingService, "weightDistance", 0.15);
        ReflectionTestUtils.setField(buyerMatchingService, "weightPrice", 0.20);
        ReflectionTestUtils.setField(buyerMatchingService, "weightDate", 0.10);
        ReflectionTestUtils.setField(buyerMatchingService, "weightQuality", 0.05);
    }

    @Test
    void testBuyerMatching() {
        FarmerProfile farmer = FarmerProfile.builder().id(1L).latitude(20.0059).longitude(73.7898).build();
        Crop crop = Crop.builder().id(1L).name("Onion").build();
        BuyerProfile buyer = BuyerProfile.builder().id(1L).businessName("ABC Foods").businessType("Food Processor").verified(true).rating(4.8).build();

        BuyerRequirement req = BuyerRequirement.builder()
                .id(1L)
                .buyer(buyer)
                .crop(crop)
                .quantity(5000.0)
                .offerPrice(3400.0)
                .requiredDate(LocalDate.now().plusDays(10))
                .latitude(19.85)
                .longitude(74.00)
                .status("ACTIVE")
                .build();

        when(farmerProfileRepository.findById(1L)).thenReturn(Optional.of(farmer));
        when(buyerRequirementRepository.findActiveByCropId(1L)).thenReturn(List.of(req));

        List<BuyerMatchResponse> matches = buyerMatchingService.findMatchingBuyers(1L, 1L, null, 1000.0);

        assertNotNull(matches);
        assertEquals(1, matches.size());
        assertEquals("ABC Foods", matches.get(0).getBusinessName());
        assertTrue(matches.get(0).getMatchScore() >= 50);
        assertNotNull(matches.get(0).getMatchBreakdown());
    }
}
