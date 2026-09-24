package com.sih.marketlink;

import com.sih.marketlink.controller.MarketController;
import com.sih.marketlink.dto.market.MarketDto;
import com.sih.marketlink.service.MarketPriceService;
import com.sih.marketlink.service.MarketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MarketController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
public class MarketPriceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MarketService marketService;

    @MockBean
    private MarketPriceService marketPriceService;

    @MockBean
    private com.sih.marketlink.security.JwtService jwtService;

    @MockBean
    private com.sih.marketlink.security.CustomUserDetailsService userDetailsService;

    @Test
    void testGetAllMarkets() throws Exception {
        MarketDto m1 = MarketDto.builder().id(1L).name("Nashik APMC").state("Maharashtra").district("Nashik").active(true).build();
        when(marketService.getAllMarkets()).thenReturn(List.of(m1));

        mockMvc.perform(get("/api/markets").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Nashik APMC"));
    }
}
