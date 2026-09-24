import apiClient, { USE_MOCK } from './api';
import liveDataStore from './liveDataStore';
import marketService from './marketService';

const VERIFIED_NETWORK_MANDIS = [
  {
    id: 'mandi-net-2',
    mandiId: 'm-2',
    companyName: 'Nashik APMC (Dindori Road)',
    contactPerson: 'Shri S. K. Gaikwad (APMC Secretary)',
    verified: true,
    cropRequired: 'Paddy',
    variety: 'Standard',
    quantityRequired: '150 Quintals',
    offerPrice: 4170,
    distanceKm: 12,
    location: 'Nashik / Dindori Hub',
    rating: 4.9,
    matchPercentage: 99,
    loginEmail: 'nashik@gmail.com',
    terms: 'Government APMC Auction Guarantee • Direct Gate Payment'
  },
  {
    id: 'mandi-net-6',
    mandiId: 'm-6',
    companyName: 'Amravati APMC Main Yard',
    contactPerson: 'Shri R. N. Deshmukh (Procurement Officer)',
    verified: true,
    cropRequired: 'Paddy',
    variety: 'Standard',
    quantityRequired: '200 Quintals',
    offerPrice: 4170,
    distanceKm: 8,
    location: 'Amravati Hub',
    rating: 4.9,
    matchPercentage: 99,
    loginEmail: 'amravati@gmail.com',
    terms: 'Instant Gate Settlement • Dynamic Freight Refund'
  },
  {
    id: 'mandi-net-3',
    mandiId: 'm-3',
    companyName: 'Pimplegaon Baswant APMC',
    contactPerson: 'Shri K. T. Jadhav (Procurement Officer)',
    verified: true,
    cropRequired: 'Maize',
    variety: 'Yellow Hybrid',
    quantityRequired: '120 Quintals',
    offerPrice: 3354,
    distanceKm: 15,
    location: 'Pimplegaon Hub',
    rating: 4.8,
    matchPercentage: 98,
    loginEmail: 'pimplegaon@gmail.com',
    terms: 'Direct Gate Weighment • Instant Settlement'
  },
  {
    id: 'mandi-net-1',
    mandiId: 'm-1',
    companyName: 'Lasalgaon APMC (Asia\'s Largest Mandi)',
    contactPerson: 'Shri D. B. Patil (Yard In-charge)',
    verified: true,
    cropRequired: 'Maize',
    variety: 'Yellow Hybrid',
    quantityRequired: '150 Quintals',
    offerPrice: 3280,
    distanceKm: 18,
    location: 'Nashik / Lasalgaon',
    rating: 4.9,
    matchPercentage: 97,
    loginEmail: 'lasalgaon@gmail.com',
    terms: 'Daily APMC Agmarknet Rates • 2-Day Formalities Window'
  },
  {
    id: 'mandi-net-4',
    mandiId: 'm-4',
    companyName: 'Pune APMC (Gultekdi Market Yard)',
    contactPerson: 'Shri V. R. Shinde (APMC Yard Manager)',
    verified: true,
    cropRequired: 'Maize',
    variety: 'Yellow Hybrid',
    quantityRequired: '100 Quintals',
    offerPrice: 2787,
    distanceKm: 25,
    location: 'Pune / Gultekdi Hub',
    rating: 4.9,
    matchPercentage: 96,
    loginEmail: 'pune@gmail.com',
    terms: 'Government APMC Auction Guarantee • 2-Day Formalities Window'
  },
  {
    id: 'mandi-net-5',
    mandiId: 'm-5',
    companyName: 'Mumbai Vashi APMC (Terminal Wholesale)',
    contactPerson: 'Shri A. P. More (General Manager)',
    verified: true,
    cropRequired: 'Maize',
    variety: 'Yellow Hybrid',
    quantityRequired: '80 Quintals',
    offerPrice: 3150,
    distanceKm: 42,
    location: 'Thane / Vashi Terminal',
    rating: 4.7,
    matchPercentage: 95,
    loginEmail: 'vashi@gmail.com',
    terms: 'Terminal Market Guarantee • Direct Cash/RTGS'
  }
];

export const buyerService = {
  getRequirements: async (filters = {}) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      return liveDataStore.getBuyerRequirements();
    }
    return apiClient.get('/buyer/requirements', { params: filters });
  },

  getMatchingBuyers: async (params = {}) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      const cropName = params.crop || 'Maize';

      const marketsRes = await marketService.getCurrentPrices({ crop: cropName });
      const rawMarkets = marketsRes.data || [];

      const networkMatches = VERIFIED_NETWORK_MANDIS.map((m) => {
        const matchedMarket = rawMarkets.find((rm) => rm.id === m.mandiId || rm.name.includes(m.companyName.split('(')[0].trim()));
        return {
          ...m,
          cropRequired: cropName !== 'All' ? cropName : m.cropRequired,
          offerPrice: matchedMarket ? matchedMarket.modalPrice : m.offerPrice
        };
      });

      return networkMatches;
    }
    return apiClient.get('/buyer/matches', { params });
  },

  getFarmerMatches: async () => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      return liveDataStore.getMatchingFarmersForBuyer();
    }
    return apiClient.get('/buyer/farmer-matches');
  },

  createRequirement: async (requirementData) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      return liveDataStore.addBuyerRequirement(requirementData);
    }
    return apiClient.post('/buyer/requirements', requirementData);
  }
};

export default buyerService;
