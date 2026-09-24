import marketService, { normalizeCropName } from './marketService';
import apiClient, { USE_MOCK } from './api';
import { formatCurrency } from '../utils/formatters';
import { calculateCropProfit } from '../utils/profitEngine';

export const MAHARASHTRA_PRESET_LOCATIONS = [
  { id: 'nashik', name: 'Nashik, Maharashtra', district: 'Nashik', state: 'Maharashtra', lat: 20.0059, lng: 73.7898 },
  { id: 'thane', name: 'Thane, Maharashtra', district: 'Thane', state: 'Maharashtra', lat: 19.2183, lng: 72.9781 },
  { id: 'mumbai', name: 'Mumbai, Maharashtra', district: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { id: 'pune', name: 'Pune, Maharashtra', district: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { id: 'solapur', name: 'Solapur, Maharashtra', district: 'Solapur', state: 'Maharashtra', lat: 17.6599, lng: 75.9064 },
  { id: 'kolhapur', name: 'Kolhapur, Maharashtra', district: 'Kolhapur', state: 'Maharashtra', lat: 16.7050, lng: 74.2433 },
  { id: 'ahmednagar', name: 'Ahmednagar, Maharashtra', district: 'Ahmednagar', state: 'Maharashtra', lat: 19.0948, lng: 74.7480 },
  { id: 'jalgaon', name: 'Jalgaon, Maharashtra', district: 'Jalgaon', state: 'Maharashtra', lat: 21.0077, lng: 75.5626 },
  { id: 'amravati', name: 'Amravati, Maharashtra', district: 'Amravati', state: 'Maharashtra', lat: 20.9374, lng: 77.7796 },
  { id: 'latur', name: 'Latur, Maharashtra', district: 'Latur', state: 'Maharashtra', lat: 18.4088, lng: 76.5604 },
  { id: 'nanded', name: 'Nanded, Maharashtra', district: 'Nanded', state: 'Maharashtra', lat: 19.1383, lng: 77.3210 },
  { id: 'aurangabad', name: 'Chhatrapati Sambhajinagar (Aurangabad), Maharashtra', district: 'Aurangabad', state: 'Maharashtra', lat: 19.8762, lng: 75.3433 },
  { id: 'nagpur', name: 'Nagpur, Maharashtra', district: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 }
];

const MANDI_COORDINATES = {
  'm-1': { lat: 20.1472, lng: 74.2306 }, // Lasalgaon
  'm-2': { lat: 20.0059, lng: 73.7898 }, // Nashik
  'm-3': { lat: 20.1714, lng: 73.9875 }, // Pimplegaon
  'm-4': { lat: 18.4975, lng: 73.8654 }, // Pune
  'm-5': { lat: 19.0748, lng: 73.0035 }, // Mumbai Vashi
  'm-6': { lat: 21.1625, lng: 79.1240 }, // Nagpur
  'm-7': { lat: 17.6599, lng: 75.9064 }, // Solapur
  'm-8': { lat: 16.7050, lng: 74.2433 }, // Kolhapur
  'm-9': { lat: 19.0948, lng: 74.7480 }, // Ahmednagar
  'm-10': { lat: 21.0077, lng: 75.5626 }, // Jalgaon
  'm-11': { lat: 20.9374, lng: 77.7796 }, // Amravati
  'm-12': { lat: 18.4088, lng: 76.5604 }, // Latur
  'm-13': { lat: 19.1383, lng: 77.3210 }, // Nanded
  'm-14': { lat: 19.8762, lng: 75.3433 }, // Chhatrapati Sambhajinagar
  'm-15': { lat: 18.1517, lng: 74.5772 }  // Baramati
};

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(8, Math.round(R * c * 1.25));
}

function resolveOriginCoords(loc) {
  if (!loc) return MAHARASHTRA_PRESET_LOCATIONS[0];
  if (typeof loc === 'object' && loc.lat && loc.lng) return loc;

  const str = String(loc).toLowerCase();
  const found = MAHARASHTRA_PRESET_LOCATIONS.find((l) =>
    str.includes(l.id) || str.includes(l.district.toLowerCase()) || str.includes(l.name.toLowerCase())
  );
  return found || MAHARASHTRA_PRESET_LOCATIONS[0];
}

export const recommendationService = {
  getBestMarkets: async (params = {}) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 250));

      const origin = resolveOriginCoords(params.location);
      const quantityKg = Number(params.quantityKg) || 1000;
      const crop = normalizeCropName(params.crop || 'Onion');

      const marketsRes = await marketService.getCurrentPrices({ crop });
      const rawMarkets = marketsRes.data || (Array.isArray(marketsRes) ? marketsRes : []);
      const maxPrice = Math.max(...rawMarkets.map((m) => m.modalPrice || 1), 1);
      const calculatedMarkets = rawMarkets.map((market) => {
        const mCoords = MANDI_COORDINATES[market.id] || { lat: 20.0059, lng: 73.7898 };
        const distanceKm = calculateDistanceKm(origin.lat, origin.lng, mCoords.lat, mCoords.lng);

        const fin = calculateCropProfit({
          quantityKg,
          modalPrice: market.modalPrice,
          distanceKm,
          commissionPercent: market.commissionPercent || 2
        });

        return {
          ...market,
          distanceKm,
          grossRevenue: fin.grossRevenue,
          transportCost: fin.transportCost,
          handlingCost: fin.handlingCost,
          commission: fin.commission,
          netReturn: fin.netReturn
        };
      });

      const maxNetReturn = Math.max(...calculatedMarkets.map((m) => m.netReturn || 1), 1);

      const ranked = calculatedMarkets
        .map((market) => {
          // Exact Formula: Score = Price * 40% + Net Return * 35% + Distance * 10% + Price Trend * 10% + Demand * 5%
          const priceScore = (market.modalPrice / maxPrice) * 40;
          const netScore = Math.max(0, market.netReturn / maxNetReturn) * 35;
          const distScore = Math.max(0, 1 - market.distanceKm / 400) * 10;
          const trendScore = market.trend === 'up' ? 10 : 7;
          const demandScore = 5;
          const recommendationScore = Math.min(99, Math.max(50, Math.round(priceScore + netScore + distScore + trendScore + demandScore)));

          return {
            ...market,
            recommendationScore
          };
        })
        .sort((a, b) => b.recommendationScore - a.recommendationScore || b.netReturn - a.netReturn)
        .map((market, idx) => ({
          ...market,
          rank: idx + 1,
          badge: idx === 0 ? '🥇 Best Value' : idx === 1 ? '🥈 2nd Choice' : '🥉 3rd Choice',
          explanation: idx === 0
            ? `${market.name} provides maximum Net Return of ${formatCurrency(market.netReturn)} for ${origin.name} (${market.distanceKm} km freight, Score: ${market.recommendationScore}/100).`
            : `Competitive modal price (${formatCurrency(market.modalPrice)}/q), but ${market.distanceKm} km distance incurs ${formatCurrency(market.transportCost)} freight cost (Score: ${market.recommendationScore}/100).`
        }));

      const topReco = ranked[0] ? {
        ...ranked[0],
        marketName: ranked[0].name,
        estimatedNetReturn: ranked[0].netReturn,
        currentModalPrice: ranked[0].modalPrice,
        estimatedTransportCost: ranked[0].transportCost,
        recommendationScore: ranked[0].recommendationScore || 95,
        reasoning: ranked[0].explanation
      } : null;

      return {
        topRecommendation: topReco,
        rankedMarkets: ranked,
        inputSummary: {
          crop,
          quantityKg,
          quintals: quantityKg / 100,
          locationName: origin.name
        }
      };
    }

    return apiClient.get('/recommendations/markets', { params });
  }
};

export default recommendationService;
