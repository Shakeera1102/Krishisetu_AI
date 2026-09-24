import apiClient, { USE_MOCK } from './api';
import centralDatabase from './centralDatabase';

const MAHARASHTRA_MANDI_DIRECTORY = [
  { id: 'm-1', name: 'Lasalgaon APMC (Asia\'s Largest Mandi)', district: 'Nashik', state: 'Maharashtra', email: 'lasalgaon@gmail.com', operatingHours: '05:00 AM - 05:00 PM' },
  { id: 'm-2', name: 'Nashik APMC (Dindori Road)', district: 'Nashik', state: 'Maharashtra', email: 'nashik@gmail.com', operatingHours: '06:00 AM - 04:00 PM' },
  { id: 'm-3', name: 'Pimplegaon Baswant APMC', district: 'Nashik', state: 'Maharashtra', email: 'pimplegaon@gmail.com', operatingHours: '05:30 AM - 05:00 PM' },
  { id: 'm-4', name: 'Pune APMC (Gultekdi Market Yard)', district: 'Pune', state: 'Maharashtra', email: 'pune@gmail.com', operatingHours: '04:30 AM - 06:00 PM' },
  { id: 'm-5', name: 'Mumbai Vashi APMC (Terminal Wholesale)', district: 'Thane', state: 'Maharashtra', email: 'vashi@gmail.com', operatingHours: '04:00 AM - 07:00 PM' },
  { id: 'm-6', name: 'Nagpur APMC (Kalamna Market)', district: 'Nagpur', state: 'Maharashtra', email: 'nagpur@gmail.com', operatingHours: '06:00 AM - 05:00 PM' },
  { id: 'm-7', name: 'Solapur APMC', district: 'Solapur', state: 'Maharashtra', email: 'solapur@gmail.com', operatingHours: '06:00 AM - 04:00 PM' },
  { id: 'm-8', name: 'Kolhapur APMC (Shahupuri)', district: 'Kolhapur', state: 'Maharashtra', email: 'kolhapur@gmail.com', operatingHours: '05:00 AM - 05:00 PM' },
  { id: 'm-9', name: 'Ahmednagar APMC', district: 'Ahmednagar', state: 'Maharashtra', email: 'ahmednagar@gmail.com', operatingHours: '06:00 AM - 04:30 PM' },
  { id: 'm-10', name: 'Jalgaon APMC', district: 'Jalgaon', state: 'Maharashtra', email: 'jalgaon@gmail.com', operatingHours: '06:00 AM - 05:00 PM' },
  { id: 'm-11', name: 'Amravati APMC', district: 'Amravati', state: 'Maharashtra', email: 'amravati@gmail.com', operatingHours: '05:30 AM - 04:30 PM' },
  { id: 'm-12', name: 'Latur APMC (Pulses & Grain Hub)', district: 'Latur', state: 'Maharashtra', email: 'latur@gmail.com', operatingHours: '05:00 AM - 06:00 PM' },
  { id: 'm-13', name: 'Nanded APMC', district: 'Nanded', state: 'Maharashtra', email: 'nanded@gmail.com', operatingHours: '06:00 AM - 05:00 PM' },
  { id: 'm-14', name: 'Chhatrapati Sambhajinagar (Aurangabad) APMC', district: 'Aurangabad', state: 'Maharashtra', email: 'aurangabad@gmail.com', operatingHours: '06:00 AM - 04:30 PM' },
  { id: 'm-15', name: 'Baramati APMC', district: 'Pune', state: 'Maharashtra', email: 'baramati@gmail.com', operatingHours: '05:30 AM - 05:00 PM' },
  { id: 'm-16', name: 'Sangli APMC (Turmeric & Spices Hub)', district: 'Sangli', state: 'Maharashtra', email: 'sangli@gmail.com', operatingHours: '05:00 AM - 05:00 PM' },
  { id: 'm-17', name: 'Akola APMC (Cotton & Pulses Hub)', district: 'Akola', state: 'Maharashtra', email: 'akola@gmail.com', operatingHours: '06:00 AM - 04:30 PM' },
  { id: 'm-18', name: 'Yavatmal APMC (White Gold Cotton Market)', district: 'Yavatmal', state: 'Maharashtra', email: 'yavatmal@gmail.com', operatingHours: '06:00 AM - 05:00 PM' },
  { id: 'm-19', name: 'Satara APMC', district: 'Satara', state: 'Maharashtra', email: 'satara@gmail.com', operatingHours: '05:30 AM - 04:30 PM' },
  { id: 'm-20', name: 'Dhule APMC', district: 'Dhule', state: 'Maharashtra', email: 'dhule@gmail.com', operatingHours: '06:00 AM - 05:00 PM' }
];

const CROP_PRICE_BENCHMARKS = {
  Potato: { basePrice: 2280, minPrice: 1950, maxPrice: 2500, variety: 'Kufri Jyoti', arrival: '8,500 Quintals' },
  Tomato: { basePrice: 2850, minPrice: 2450, maxPrice: 3200, variety: 'Hybrid Red', arrival: '12,000 Quintals' },
  Onion: { basePrice: 3380, minPrice: 3000, maxPrice: 3680, variety: 'Nasik Red', arrival: '18,000 Quintals' },
  Cotton: { basePrice: 6900, minPrice: 6300, maxPrice: 7300, variety: 'Medium Staple', arrival: '9,200 Quintals' },
  'Green Chilli': { basePrice: 3850, minPrice: 3400, maxPrice: 4250, variety: 'Guntur Green', arrival: '4,500 Quintals' },
  Chilli: { basePrice: 16350, minPrice: 15000, maxPrice: 17800, variety: 'Red Hot Teja (Dry)', arrival: '3,100 Quintals' },
  Paddy: { basePrice: 4150, minPrice: 3750, maxPrice: 4500, variety: 'Indrayani / Basmati', arrival: '14,000 Quintals' },
  Wheat: { basePrice: 2550, minPrice: 2300, maxPrice: 2850, variety: 'Lokwan Grade A', arrival: '11,500 Quintals' },
  Maize: { basePrice: 2250, minPrice: 2000, maxPrice: 2500, variety: 'Yellow Hybrid', arrival: '7,800 Quintals' }
};

const MANDI_NATIVE_CROPS = {
  'm-1': 'Onion',
  'm-2': 'Tomato',
  'm-3': 'Onion',
  'm-4': 'Potato',
  'm-5': 'Green Chilli',
  'm-6': 'Cotton',
  'm-7': 'Onion',
  'm-8': 'Paddy',
  'm-9': 'Wheat',
  'm-10': 'Maize',
  'm-11': 'Chilli',
  'm-12': 'Paddy',
  'm-13': 'Wheat',
  'm-14': 'Potato',
  'm-15': 'Tomato',
  'm-16': 'Onion',
  'm-17': 'Cotton',
  'm-18': 'Cotton',
  'm-19': 'Tomato',
  'm-20': 'Onion'
};

export function normalizeCropName(cropStr) {
  if (!cropStr) return 'All';
  if (cropStr === 'All') return 'All';
  const clean = String(cropStr).toLowerCase();
  if (clean.includes('potato')) return 'Potato';
  if (clean.includes('tomato')) return 'Tomato';
  if (clean.includes('onion')) return 'Onion';
  if (clean.includes('cotton')) return 'Cotton';
  if (clean.includes('chilli') || clean.includes('chili')) return 'Chilli';
  if (clean.includes('paddy') || clean.includes('rice')) return 'Paddy';
  if (clean.includes('wheat')) return 'Wheat';
  if (clean.includes('maize') || clean.includes('corn')) return 'Maize';
  return 'Onion';
}

function generateLiveMandiRecords(cropName = 'All') {
  const normCrop = normalizeCropName(cropName);
  const filterBySingleCrop = normCrop !== 'All' && CROP_PRICE_BENCHMARKS[normCrop];
  const customMandis = centralDatabase.getMandis() || [];
  const fullDirectory = [...MAHARASHTRA_MANDI_DIRECTORY, ...customMandis];

  return fullDirectory.map((mandi, idx) => {
    const targetCrop = filterBySingleCrop
      ? normCrop
      : mandi.commodity || MANDI_NATIVE_CROPS[mandi.id] || 'Onion';

    const benchmark = CROP_PRICE_BENCHMARKS[targetCrop] || CROP_PRICE_BENCHMARKS['Onion'];
    const priceModifier = ((idx * 37) % 250) - 100;
    const modalPrice = mandi.modalPrice || Math.max(1500, benchmark.basePrice + priceModifier);
    const minPrice = mandi.minPrice || Math.max(1200, modalPrice - 250);
    const maxPrice = mandi.maxPrice || (modalPrice + 350);

    return {
      ...mandi,
      commodity: targetCrop,
      variety: mandi.variety || benchmark.variety,
      minPrice,
      maxPrice,
      modalPrice,
      arrivalQty: mandi.arrivalQty || benchmark.arrival,
      trend: idx % 3 === 0 ? 'up' : 'stable',
      trendPercent: Number((((idx * 7) % 40) / 10 + 1.2).toFixed(1)),
      commissionPercent: 2,
      lastUpdated: 'Live Agmarknet Feed • Today'
    };
  });
}

export const marketService = {
  getCurrentPrices: async (filters = {}) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      let markets = generateLiveMandiRecords(filters.crop);

      if (filters.search) {
        const query = filters.search.toLowerCase();
        markets = markets.filter(
          (m) =>
            m.name.toLowerCase().includes(query) ||
            m.district.toLowerCase().includes(query) ||
            m.state.toLowerCase().includes(query) ||
            m.commodity.toLowerCase().includes(query)
        );
      }
      if (filters.state && filters.state !== 'All') {
        markets = markets.filter((m) => m.state.toLowerCase() === filters.state.toLowerCase());
      }

      const page = Number(filters.page) || 1;
      const pageSize = Number(filters.pageSize) || 100;
      const totalCount = markets.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const startIndex = (page - 1) * pageSize;
      const paginatedMarkets = markets.slice(startIndex, startIndex + pageSize);

      return {
        data: paginatedMarkets,
        totalCount,
        totalPages,
        page,
        pageSize
      };
    }
    return apiClient.get('/markets/prices', { params: filters });
  },

  getTopMarkets: async (limit = 3) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      const records = generateLiveMandiRecords('All');
      return records.slice(0, limit);
    }
    return apiClient.get('/markets/top', { params: { limit } });
  },

  getMarketById: async (marketId) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      const records = generateLiveMandiRecords('All');
      const market = records.find((m) => m.id === marketId) || records[0];
      return market;
    }
    return apiClient.get(`/markets/${marketId}`);
  }
};

export default marketService;
