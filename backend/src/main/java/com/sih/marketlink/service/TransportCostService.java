package com.sih.marketlink.service;

import com.sih.marketlink.util.HaversineUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TransportCostService {

    @Value("${app.transport.base-cost:300.0}")
    private double baseCost;

    @Value("${app.transport.cost-per-km:20.0}")
    private double costPerKm;

    @Value("${app.transport.quintal-divisor:10.0}")
    private double quintalDivisor;

    /**
     * Calculates distance and estimated freight transport cost.
     */
    public double calculateDistance(double originLat, double originLng, double destLat, double destLng) {
        return HaversineUtil.calculateDistanceKm(originLat, originLng, destLat, destLng);
    }

    public double calculateTransportCost(double distanceKm, double quantityKg) {
        double quintals = quantityKg / 100.0;
        double loadFactor = Math.max(1.0, quintals / quintalDivisor);
        double cost = baseCost + (distanceKm * costPerKm * loadFactor);
        return Math.round(cost * 100.0) / 100.0;
    }
}
