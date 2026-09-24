package com.sih.marketlink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MarketLinkApplication {

    public static void main(String[] args) {
        SpringApplication.run(MarketLinkApplication.class, args);
    }
}
