// Realistic Indian agricultural dataset for mock services

export const MOCK_FARMER_PROFILE = {
  id: 'f-101',
  name: 'Ramesh Patil',
  role: 'farmer',
  mobile: '+91 98765 43210',
  email: 'ramesh.patil@example.com',
  state: 'Maharashtra',
  district: 'Nashik',
  village: 'Pimplegaon',
  preferredLanguage: 'Marathi',
  farmSize: '5.5 Acres',
  mainCrops: ['Onion', 'Tomato', 'Paddy'],
  currentCrop: {
    name: 'Onion',
    variety: 'Nasik Red',
    quantityKg: 1000,
    harvestDate: '2026-08-20',
    qualityGrade: 'Grade A Premium',
  },
  location: {
    lat: 20.0059,
    lng: 73.7898,
    name: 'Nashik District, MH'
  }
};

export const MOCK_BUYER_PROFILE = {
  id: 'b-201',
  name: 'Anil Gupta',
  role: 'buyer',
  companyName: 'ABC Foods & Processing Ltd',
  contactPerson: 'Anil Gupta (Procurement Head)',
  mobile: '+91 91234 56789',
  email: 'procurement@abcfoods.com',
  state: 'Maharashtra',
  district: 'Pune',
  businessType: 'Food Processor & Distributor',
  rating: 4.8,
  verified: true,
  activeRequirementsCount: 4,
  completedTransactions: 128
};

export const MOCK_CROPS = [
  { id: 'c1', name: 'Onion', variety: 'Nasik Red', avgPrice: 3200, unit: 'quintal' },
  { id: 'c2', name: 'Tomato', variety: 'Hybrid Green', avgPrice: 2800, unit: 'quintal' },
  { id: 'c3', name: 'Potato', variety: 'Kufri Jyoti', avgPrice: 2100, unit: 'quintal' },
  { id: 'c4', name: 'Paddy', variety: 'Basmati 1121', avgPrice: 4200, unit: 'quintal' },
  { id: 'c5', name: 'Cotton', variety: 'Medium Staple', avgPrice: 6800, unit: 'quintal' },
  { id: 'c6', name: 'Chilli', variety: 'Guntur Teja', avgPrice: 18500, unit: 'quintal' },
];

export const MOCK_MARKETS = [
  {
    id: 'm-1',
    name: 'Nashik APMC',
    district: 'Nashik',
    state: 'Maharashtra',
    commodity: 'Onion',
    variety: 'Nasik Red',
    minPrice: 3000,
    maxPrice: 3450,
    modalPrice: 3200,
    arrivalQty: '4,500 Quintals',
    distanceKm: 25,
    trend: 'up',
    trendPercent: 4.2,
    transportCost: 900,
    handlingCost: 300,
    commissionPercent: 2,
    expectedNetReturn: 30800,
    rating: 4.7,
    operatingHours: '06:00 AM - 04:00 PM',
    lastUpdated: 'Today, 09:30 AM'
  },
  {
    id: 'm-2',
    name: 'Pune APMC (Gultekdi)',
    district: 'Pune',
    state: 'Maharashtra',
    commodity: 'Onion',
    variety: 'Nasik Red',
    minPrice: 3100,
    maxPrice: 3500,
    modalPrice: 3350,
    arrivalQty: '6,200 Quintals',
    distanceKm: 150,
    trend: 'up',
    trendPercent: 2.1,
    transportCost: 2000,
    handlingCost: 400,
    commissionPercent: 2.5,
    expectedNetReturn: 29900,
    rating: 4.5,
    operatingHours: '05:00 AM - 05:00 PM',
    lastUpdated: 'Today, 10:15 AM'
  },
  {
    id: 'm-3',
    name: 'Mumbai Vashi APMC',
    district: 'Thane',
    state: 'Maharashtra',
    commodity: 'Onion',
    variety: 'Nasik Red',
    minPrice: 3250,
    maxPrice: 3700,
    modalPrice: 3500,
    arrivalQty: '9,800 Quintals',
    distanceKm: 170,
    trend: 'down',
    trendPercent: -1.2,
    transportCost: 3500,
    handlingCost: 500,
    commissionPercent: 3,
    expectedNetReturn: 28700,
    rating: 4.8,
    operatingHours: '04:00 AM - 06:00 PM',
    lastUpdated: 'Today, 08:45 AM'
  },
  {
    id: 'm-4',
    name: 'Azadpur Mandi',
    district: 'North Delhi',
    state: 'Delhi',
    commodity: 'Onion',
    variety: 'Nasik Red',
    minPrice: 3400,
    maxPrice: 3900,
    modalPrice: 3680,
    arrivalQty: '14,000 Quintals',
    distanceKm: 1150,
    trend: 'up',
    trendPercent: 5.5,
    transportCost: 9500,
    handlingCost: 800,
    commissionPercent: 4,
    expectedNetReturn: 25800,
    rating: 4.9,
    operatingHours: '03:00 AM - 07:00 PM',
    lastUpdated: 'Today, 07:30 AM'
  },
  {
    id: 'm-5',
    name: 'Kurnool APMC',
    district: 'Kurnool',
    state: 'Andhra Pradesh',
    commodity: 'Onion',
    variety: 'Local Red',
    minPrice: 2800,
    maxPrice: 3200,
    modalPrice: 3000,
    arrivalQty: '3,100 Quintals',
    distanceKm: 680,
    trend: 'stable',
    trendPercent: 0.5,
    transportCost: 5800,
    handlingCost: 450,
    commissionPercent: 2,
    expectedNetReturn: 23500,
    rating: 4.3,
    operatingHours: '06:00 AM - 03:00 PM',
    lastUpdated: 'Today, 11:00 AM'
  }
];

export const MOCK_HISTORICAL_PRICES = [
  { date: 'Aug 01', price: 2950, avg: 3000, high: 3100, low: 2900 },
  { date: 'Aug 04', price: 3020, avg: 3010, high: 3150, low: 2950 },
  { date: 'Aug 07', price: 3080, avg: 3040, high: 3200, low: 3000 },
  { date: 'Aug 10', price: 3120, avg: 3080, high: 3250, low: 3050 },
  { date: 'Aug 13', price: 3100, avg: 3100, high: 3280, low: 3080 },
  { date: 'Aug 16', price: 3180, avg: 3120, high: 3300, low: 3100 },
  { date: 'Aug 19', price: 3240, avg: 3150, high: 3350, low: 3150 },
  { date: 'Aug 22', price: 3210, avg: 3180, high: 3380, low: 3180 },
  { date: 'Aug 25', price: 3280, avg: 3200, high: 3420, low: 3200 },
  { date: 'Aug 26 (Today)', price: 3350, avg: 3220, high: 3500, low: 3250 },
];

export const MOCK_AI_PREDICTION = {
  crop: 'Onion',
  currentPrice: 3200,
  predicted3Days: 3280,
  predicted7Days: 3350,
  trend: 'Upward',
  trendPercent: 4.7,
  confidence: 87,
  recommendation: 'Prices are expected to increase over the next week due to high retail demand in Metro cities. Consider holding inventory for 3–5 days if dry storage is available to maximize net profit.',
  disclaimer: 'AI predictions are probabilistic estimates based on mandi arrivals, weather patterns, and historical price cycles. Use as decision support.',
  factors: [
    { name: 'Monsoon Impact on Supply', impact: 'Positive (+3%)' },
    { name: 'Festival Season Demand', impact: 'Positive (+4%)' },
    { name: 'Fuel & Transport Costs', impact: 'Slight Negative (-1%)' }
  ]
};

export const MOCK_BEST_MARKET_RECOMMENDATION = {
  marketId: 'm-1',
  marketName: 'Nashik APMC',
  modalPrice: 3200,
  transportCost: 900,
  estimatedNetReturn: 30800,
  recommendationScore: 92,
  rank: 1,
  reason: 'Although Mumbai Vashi offers a higher headline modal price (₹3,500/q), Nashik APMC yields the highest NET return (₹30,800) for 10 quintals due to low transport distance (25 km vs 170 km) and lower mandi commission.'
};

export const MOCK_BUYERS = [];
export const MOCK_OFFERS = [];
export const MOCK_BUYER_REQUIREMENTS = [];
export const MOCK_MATCHING_FARMERS = [];
