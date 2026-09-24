import apiClient, { USE_MOCK } from './api';
import { getCropBenchmarkPrice } from './liveDataStore';

export const predictionService = {
  getPricePrediction: async (crop = 'Onion', district = 'Nashik') => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 250));
      const cropName = crop || 'Onion';
      const basePrice = getCropBenchmarkPrice(cropName) || 3200;

      const pred1Day = Math.round(basePrice * 1.018);
      const pred3Days = Math.round(basePrice * 1.038);
      const pred7Days = Math.round(basePrice * 1.062);

      return {
        crop: cropName,
        district,
        currentPrice: basePrice,
        predicted1Day: pred1Day,
        predicted3Days: pred3Days,
        predicted7Days: pred7Days,
        trend: 'Upward',
        trendPercent: 6.2,
        confidence: 89,
        recommendation: `Wholesale APMC demand for ${cropName} is projected to rise +6.2% over the next 7 days across major Maharashtra corridors. Consider holding inventory for 3–5 days if storage allows to maximize net return.`,
        disclaimer: 'AI predictions are probabilistic estimates derived from mandi arrivals, weather patterns, and historical price cycles. Use as decision support.',
        factors: [
          { name: `${cropName} Wholesale Demand`, impact: 'Positive (+4.2%)' },
          { name: 'Regional Mandi Arrivals', impact: 'Moderate (+2.5%)' },
          { name: 'Freight & Logistics Cost', impact: 'Slight Negative (-0.5%)' }
        ]
      };
    }
    return apiClient.get('/predictions/price', { params: { crop, district } });
  }
};

export default predictionService;
