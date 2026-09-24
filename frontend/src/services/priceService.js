import apiClient, { USE_MOCK } from './api';
import { MOCK_HISTORICAL_PRICES } from './mockData';

export const priceService = {
  getHistoricalPrices: async (params = {}) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 300));
      const period = params.period || '7d';
      
      let sliceCount = 7;
      if (period === '30d') sliceCount = 10;
      if (period === '90d') sliceCount = 10;

      const data = MOCK_HISTORICAL_PRICES.slice(-sliceCount);
      const prices = data.map((d) => d.price);
      
      const highest = Math.max(...prices);
      const lowest = Math.min(...prices);
      const average = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      const current = prices[prices.length - 1];
      const initial = prices[0];
      const percentChange = Number((((current - initial) / initial) * 100).toFixed(1));

      return {
        period,
        crop: params.crop || 'Onion',
        market: params.market || 'Nashik APMC',
        chartData: data,
        stats: {
          highest,
          lowest,
          average,
          current,
          percentChange,
          insight: `Prices increased by ${percentChange}% during the selected ${period} period due to strong regional demand.`
        }
      };
    }
    return apiClient.get('/prices/historical', { params });
  }
};

export default priceService;
