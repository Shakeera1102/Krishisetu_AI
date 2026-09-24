/**
 * KrishiSetu File-Only Central Database Service
 * Operates strictly on project JSON files:
 * - src/data/users.json
 * - src/data/crops.json
 * - src/data/offers.json
 * - src/data/trades.json
 * - src/data/audits.json
 */

import initialUsers from '../data/users.json';
import initialCrops from '../data/crops.json';
import initialOffers from '../data/offers.json';
import initialTrades from '../data/trades.json';
import initialAudits from '../data/audits.json';

export const DEFAULT_MANDI_DIRECTORY = [
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

const DEFAULT_PRESET_USERS = [
  {
    id: 'u-admin',
    name: 'System Administrator',
    companyName: 'KrishiSetu Headquarters',
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'admin',
    mobile: '+91 99999 00000',
    state: 'Maharashtra',
    district: 'National',
    createdDate: '2026-08-31'
  },
  {
    id: 'm-dhule',
    name: 'Dhule APMC Main Yard',
    companyName: 'Dhule APMC Main Yard',
    email: 'dhule@gmail.com',
    password: 'govt123',
    role: 'mandi',
    mobile: '+91 94222 10007',
    state: 'Maharashtra',
    district: 'Dhule',
    createdDate: '2026-08-30'
  },
  {
    id: 'm-nashik',
    name: 'Nashik APMC (Dindori Road)',
    companyName: 'Nashik APMC (Dindori Road)',
    email: 'nashik@gmail.com',
    password: 'govt123',
    role: 'mandi',
    mobile: '+91 94222 10001',
    state: 'Maharashtra',
    district: 'Nashik',
    createdDate: '2026-08-27'
  },
  {
    id: 'm-amravati',
    name: 'Amravati APMC Main Yard',
    companyName: 'Amravati APMC Main Yard',
    email: 'amravati@gmail.com',
    password: 'govt123',
    role: 'mandi',
    mobile: '+91 94222 10005',
    state: 'Maharashtra',
    district: 'Amravati',
    createdDate: '2026-08-27'
  },
  {
    id: 'm-pune',
    name: 'Pune APMC (Gultekdi)',
    companyName: 'Pune APMC (Gultekdi)',
    email: 'pune@gmail.com',
    password: 'govt123',
    role: 'mandi',
    mobile: '+91 94222 10002',
    state: 'Maharashtra',
    district: 'Pune',
    createdDate: '2026-08-27'
  },
  {
    id: 'm-lasalgaon',
    name: 'Lasalgaon APMC',
    companyName: 'Lasalgaon APMC',
    email: 'lasalgaon@gmail.com',
    password: 'govt123',
    role: 'mandi',
    mobile: '+91 94222 10003',
    state: 'Maharashtra',
    district: 'Nashik',
    createdDate: '2026-08-27'
  },
  {
    id: 'm-vashi',
    name: 'Mumbai Vashi APMC',
    companyName: 'Mumbai Vashi APMC',
    email: 'vashi@gmail.com',
    password: 'govt123',
    role: 'mandi',
    mobile: '+91 94222 10004',
    state: 'Maharashtra',
    district: 'Thane',
    createdDate: '2026-08-27'
  },
  {
    id: 'm-pimplegaon',
    name: 'Pimplegaon Baswant APMC',
    companyName: 'Pimplegaon Baswant APMC',
    email: 'pimplegaon@gmail.com',
    password: 'govt123',
    role: 'mandi',
    mobile: '+91 94222 10006',
    state: 'Maharashtra',
    district: 'Nashik',
    createdDate: '2026-08-27'
  },
  {
    id: 'u-1787929241765',
    name: 'Ravi',
    companyName: 'Ravi',
    email: 'ravi@gmail.com',
    password: '123456',
    role: 'farmer',
    mobile: '+911234567890',
    state: 'Maharashtra',
    district: 'Pune',
    createdDate: '2026-08-28'
  },
  {
    id: 'u-1787933137256',
    name: 'Ram',
    companyName: 'Ram',
    email: 'ram@gmail.com',
    password: '123456',
    role: 'farmer',
    mobile: '1209876543',
    state: 'Maharashtra',
    district: 'Nashik',
    createdDate: '2026-08-28'
  },
  {
    id: 'u-1788110287567',
    name: 'Meena',
    companyName: 'Meena',
    email: 'meena@gmail.com',
    password: '123456',
    role: 'farmer',
    mobile: '1234567542',
    state: 'Maharashtra',
    district: 'Pune',
    createdDate: '2026-08-30'
  }
];

const DEMO_RESET_VERSION = 'v4_clean_demo_reset';

if (typeof window !== 'undefined') {
  try {
    const currentVer = localStorage.getItem('agri_demo_reset_ver');
    if (currentVer !== DEMO_RESET_VERSION) {
      localStorage.removeItem('agri_custom_offers');
      localStorage.removeItem('agri_custom_trades');
      localStorage.removeItem('agri_custom_crops');
      localStorage.removeItem('agri_farmer_crop');
      localStorage.removeItem('agri_active_crop_cleared');
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('agri_crop_cleared_')) {
          localStorage.removeItem(k);
        }
      });
      localStorage.setItem('agri_demo_reset_ver', DEMO_RESET_VERSION);
    }
  } catch (e) {
    console.error('Error checking demo reset version:', e);
  }
}

// In-Memory Database initialized directly from physical JSON files with fallback presets
let memoryDb = {
  users: Array.isArray(initialUsers) && initialUsers.length > 0 ? [...initialUsers] : [...DEFAULT_PRESET_USERS],
  crops: Array.isArray(initialCrops) ? [...initialCrops] : [],
  offers: Array.isArray(initialOffers) ? [...initialOffers] : [],
  trades: Array.isArray(initialTrades) ? [...initialTrades] : [],
  audits: Array.isArray(initialAudits) ? [...initialAudits] : []
};

// Sync database changes directly to disk files via Vite dev middleware
const syncToFile = (collection, data) => {
  if (typeof window !== 'undefined') {
    fetch(`/api/db/${collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {});
  }
};

export const centralDatabase = {
  getDatabase: () => {
    return memoryDb;
  },

  loadFromDisk: async () => {
    if (typeof window === 'undefined') return;
    try {
      const [resOffers, resTrades, resCrops, resUsers] = await Promise.all([
        fetch('/api/db/offers').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/db/trades').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/db/crops').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/db/users').then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      if (Array.isArray(resOffers)) {
        memoryDb.offers = resOffers;
        try { localStorage.setItem('agri_custom_offers', JSON.stringify(resOffers)); } catch {}
      }
      if (Array.isArray(resTrades)) {
        memoryDb.trades = resTrades;
        try { localStorage.setItem('agri_custom_trades', JSON.stringify(resTrades)); } catch {}
      }
      if (Array.isArray(resCrops)) {
        memoryDb.crops = resCrops;
        try { localStorage.setItem('agri_custom_crops', JSON.stringify(resCrops)); } catch {}
      }
      if (Array.isArray(resUsers)) {
        memoryDb.users = resUsers;
      }
    } catch (err) {
      console.error('Error loading data from disk:', err);
    }
  },

  resetDemoData: () => {
    memoryDb.offers = [];
    memoryDb.trades = [];
    memoryDb.audits = [];
    memoryDb.crops = Array.isArray(initialCrops) ? JSON.parse(JSON.stringify(initialCrops)) : [];

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('agri_custom_offers');
        localStorage.removeItem('agri_custom_trades');
        localStorage.removeItem('agri_custom_crops');
        localStorage.removeItem('agri_farmer_crop');
        localStorage.removeItem('agri_active_crop_cleared');
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('agri_crop_cleared_')) {
            localStorage.removeItem(k);
          }
        });
        localStorage.setItem('agri_demo_reset_ver', DEMO_RESET_VERSION);
      } catch {}
    }

    syncToFile('offers', memoryDb.offers);
    syncToFile('trades', memoryDb.trades);
    syncToFile('audits', memoryDb.audits);
    syncToFile('crops', memoryDb.crops);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('central_database_updated'));
    }
  },

  // USERS FILE (src/data/users.json) + Dynamic Persistent Store
  getUsers: () => {
    let localRegistered = [];
    try {
      const stored = localStorage.getItem('agri_registered_users');
      if (stored) localRegistered = JSON.parse(stored);
    } catch {}

    const customMandis = centralDatabase.getMandis();
    const mandiUsers = customMandis
      .filter((m) => m && m.email)
      .map((m) => ({
        id: m.id,
        name: m.name,
        companyName: m.name,
        email: m.email.trim().toLowerCase(),
        password: (m.password || 'govt123').trim(),
        role: 'mandi',
        mobile: m.mobile || '+91 94222 10000',
        state: m.state || 'Maharashtra',
        district: m.district || 'Maharashtra'
      }));

    // Dynamic users and mandis take priority over old cached seeds
    const combined = [...mandiUsers, ...localRegistered, ...(memoryDb.users || []), ...DEFAULT_PRESET_USERS];

    const uniqueMap = new Map();
    combined.forEach((u) => {
      if (u && u.email) {
        const cleanEmail = u.email.trim().toLowerCase();
        if (!uniqueMap.has(cleanEmail)) {
          uniqueMap.set(cleanEmail, {
            ...u,
            email: cleanEmail,
            password: (u.password || 'govt123').trim(),
            role: (u.role || 'farmer').toLowerCase().replace('role_', '').trim()
          });
        }
      }
    });

    memoryDb.users = Array.from(uniqueMap.values());
    return memoryDb.users;
  },

  registerUser: (user) => {
    const cleanEmail = (user.email || '').trim().toLowerCase();
    const existingIndex = (memoryDb.users || []).findIndex(
      (u) => u.email?.toLowerCase().trim() === cleanEmail
    );

    const newUserObj = {
      id: user.id || 'u-' + Date.now(),
      name: user.name || user.companyName || 'User',
      companyName: user.companyName || user.name || 'User',
      email: cleanEmail,
      password: (user.password || 'govt123').trim(),
      role: (user.role || 'farmer').toLowerCase().replace('role_', '').trim(),
      mobile: user.mobile || '+91 98480 12345',
      state: user.state || 'Maharashtra',
      district: user.district || 'Maharashtra',
      createdDate: user.createdDate || new Date().toISOString().split('T')[0]
    };

    if (existingIndex >= 0) {
      memoryDb.users[existingIndex] = { ...memoryDb.users[existingIndex], ...newUserObj };
    } else {
      memoryDb.users.push(newUserObj);
    }

    try {
      let localRegistered = [];
      const stored = localStorage.getItem('agri_registered_users');
      if (stored) localRegistered = JSON.parse(stored);
      const lIdx = localRegistered.findIndex((u) => (u.email || '').toLowerCase().trim() === cleanEmail);
      if (lIdx >= 0) localRegistered[lIdx] = newUserObj;
      else localRegistered.push(newUserObj);
      localStorage.setItem('agri_registered_users', JSON.stringify(localRegistered));
    } catch {}

    syncToFile('users', memoryDb.users);
    window.dispatchEvent(new Event('central_database_updated'));
    return newUserObj;
  },

  findUserByEmail: (email) => {
    return (memoryDb.users || []).find((u) => u.email?.toLowerCase() === (email || '').toLowerCase());
  },

  setUsers: (usersArray) => {
    memoryDb.users = Array.isArray(usersArray) ? [...usersArray] : [];
    syncToFile('users', memoryDb.users);
    window.dispatchEvent(new Event('central_database_updated'));
    return memoryDb.users;
  },

  // CROPS FILE (src/data/crops.json) + Dynamic Persistent Store
  getCrops: () => {
    let localCrops = [];
    try {
      const stored = localStorage.getItem('agri_custom_crops');
      if (stored) localCrops = JSON.parse(stored);
    } catch {}

    let singleActive = null;
    try {
      const single = localStorage.getItem('agri_farmer_crop');
      if (single) singleActive = JSON.parse(single);
    } catch {}

    const combined = [...(memoryDb.crops || []), ...localCrops];
    if (singleActive && singleActive.crop && singleActive.active !== false && singleActive.status !== 'Sold') {
      combined.push(singleActive);
    }

    const uniqueMap = new Map();
    combined.forEach((c) => {
      if (c && c.id) {
        uniqueMap.set(c.id, c);
      }
    });

    memoryDb.crops = Array.from(uniqueMap.values());
    return memoryDb.crops;
  },

  saveCrop: (cropData) => {
    const isSold = cropData.status === 'Sold';
    const cleanCropName = (cropData.crop || cropData.name || '').toLowerCase().trim();

    // Match exact crop lot ID or same farmer & same crop type
    const index = (memoryDb.crops || []).findIndex(
      (c) =>
        c.id === cropData.id ||
        (cleanCropName &&
          (c.farmerId === cropData.farmerId || c.farmerEmail?.toLowerCase() === cropData.farmerEmail?.toLowerCase()) &&
          (c.crop || c.name || '').toLowerCase().trim() === cleanCropName &&
          c.status !== 'Sold')
    );

    if (index >= 0) {
      memoryDb.crops[index] = { ...memoryDb.crops[index], ...cropData, active: !isSold };
    } else {
      memoryDb.crops.push({ ...cropData, active: !isSold });
    }

    // Persist to localStorage
    try {
      localStorage.setItem('agri_custom_crops', JSON.stringify(memoryDb.crops));
      if (!isSold) {
        localStorage.setItem('agri_farmer_crop', JSON.stringify(cropData));
      }
    } catch {}

    syncToFile('crops', memoryDb.crops);
    window.dispatchEvent(new Event('central_database_updated'));
    return cropData;
  },

  setCrops: (cropsArray) => {
    memoryDb.crops = Array.isArray(cropsArray) ? [...cropsArray] : [];
    try {
      localStorage.setItem('agri_custom_crops', JSON.stringify(memoryDb.crops));
    } catch {}
    syncToFile('crops', memoryDb.crops);
    window.dispatchEvent(new Event('central_database_updated'));
    return memoryDb.crops;
  },

  // OFFERS FILE (src/data/offers.json) + Dynamic Persistent Store
  getOffers: () => {
    let localOffers = [];
    try {
      const stored = localStorage.getItem('agri_custom_offers');
      if (stored) localOffers = JSON.parse(stored);
    } catch {}

    const combined = [...(memoryDb.offers || []), ...localOffers];
    const uniqueMap = new Map();
    combined.forEach((o) => {
      if (o && o.id) {
        uniqueMap.set(o.id, o);
      }
    });

    memoryDb.offers = Array.from(uniqueMap.values());
    return memoryDb.offers;
  },

  saveOffer: (offerData) => {
    const index = (memoryDb.offers || []).findIndex((o) => o.id === offerData.id);
    if (index >= 0) {
      memoryDb.offers[index] = { ...memoryDb.offers[index], ...offerData };
    } else {
      memoryDb.offers.push(offerData);
    }

    try {
      localStorage.setItem('agri_custom_offers', JSON.stringify(memoryDb.offers));
    } catch {}

    syncToFile('offers', memoryDb.offers);
    window.dispatchEvent(new Event('central_database_updated'));
    return offerData;
  },

  setOffers: (offersArray) => {
    memoryDb.offers = Array.isArray(offersArray) ? [...offersArray] : [];
    try {
      localStorage.setItem('agri_custom_offers', JSON.stringify(memoryDb.offers));
    } catch {}
    syncToFile('offers', memoryDb.offers);
    window.dispatchEvent(new Event('central_database_updated'));
    return memoryDb.offers;
  },

  // TRADES FILE (src/data/trades.json) + Dynamic Persistent Store
  getTrades: () => {
    let localTrades = [];
    try {
      const stored = localStorage.getItem('agri_custom_trades');
      if (stored) localTrades = JSON.parse(stored);
    } catch {}

    const combined = [...(memoryDb.trades || []), ...localTrades];
    const uniqueMap = new Map();
    combined.forEach((t) => {
      if (t && t.id) {
        uniqueMap.set(t.id, t);
      }
    });

    memoryDb.trades = Array.from(uniqueMap.values());
    return memoryDb.trades;
  },

  saveTrade: (tradeData) => {
    const index = (memoryDb.trades || []).findIndex((t) => t.id === tradeData.id);
    if (index >= 0) {
      memoryDb.trades[index] = { ...memoryDb.trades[index], ...tradeData };
    } else {
      memoryDb.trades.push(tradeData);
    }

    try {
      localStorage.setItem('agri_custom_trades', JSON.stringify(memoryDb.trades));
    } catch {}

    syncToFile('trades', memoryDb.trades);
    window.dispatchEvent(new Event('central_database_updated'));
    return tradeData;
  },

  setTrades: (tradesArray) => {
    memoryDb.trades = Array.isArray(tradesArray) ? [...tradesArray] : [];
    try {
      localStorage.setItem('agri_custom_trades', JSON.stringify(memoryDb.trades));
    } catch {}
    syncToFile('trades', memoryDb.trades);
    window.dispatchEvent(new Event('central_database_updated'));
    return memoryDb.trades;
  },

  // AUDITS FILE (src/data/audits.json) - Append Only
  getAudits: () => {
    return memoryDb.audits || [];
  },

  appendAudit: (auditEntry) => {
    const entry = {
      id: auditEntry.id || 'evt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      eventType: auditEntry.eventType,
      entityId: auditEntry.entityId,
      entityType: auditEntry.entityType || 'TRADE',
      actorId: auditEntry.actorId || 'system',
      actorName: auditEntry.actorName || 'System',
      actorRole: auditEntry.actorRole || 'system',
      previousStatus: auditEntry.previousStatus || null,
      newStatus: auditEntry.newStatus,
      reason: auditEntry.reason || '',
      metadata: auditEntry.metadata || {},
      timestamp: new Date().toISOString()
    };

    memoryDb.audits.push(entry);
    syncToFile('audits', memoryDb.audits);
    window.dispatchEvent(new Event('central_database_updated'));
    return entry;
  },

  // ADMIN USER MANAGEMENT
  updateUser: (userId, updatedFields) => {
    const idx = (memoryDb.users || []).findIndex((u) => u.id === userId || u.email?.toLowerCase() === userId?.toLowerCase());
    if (idx >= 0) {
      memoryDb.users[idx] = { ...memoryDb.users[idx], ...updatedFields };
      syncToFile('users', memoryDb.users);
      window.dispatchEvent(new Event('central_database_updated'));
      return memoryDb.users[idx];
    }
    return null;
  },

  deleteUser: (userId) => {
    memoryDb.users = (memoryDb.users || []).filter((u) => u.id !== userId && u.email?.toLowerCase() !== userId?.toLowerCase());
    syncToFile('users', memoryDb.users);
    window.dispatchEvent(new Event('central_database_updated'));
    return true;
  },

  // ADMIN CROP MANAGEMENT
  updateCrop: (cropId, updatedFields) => {
    const idx = (memoryDb.crops || []).findIndex((c) => c.id === cropId);
    if (idx >= 0) {
      memoryDb.crops[idx] = { ...memoryDb.crops[idx], ...updatedFields };
      syncToFile('crops', memoryDb.crops);
      window.dispatchEvent(new Event('central_database_updated'));
      return memoryDb.crops[idx];
    }
    return null;
  },

  deleteCrop: (cropId) => {
    memoryDb.crops = (memoryDb.crops || []).filter((c) => c.id !== cropId);
    syncToFile('crops', memoryDb.crops);
    window.dispatchEvent(new Event('central_database_updated'));
    return true;
  },

  // ADMIN OFFER & TRADE MANAGEMENT
  updateOffer: (offerId, updatedFields) => {
    const idx = (memoryDb.offers || []).findIndex((o) => o.id === offerId);
    if (idx >= 0) {
      memoryDb.offers[idx] = { ...memoryDb.offers[idx], ...updatedFields };
      syncToFile('offers', memoryDb.offers);
      window.dispatchEvent(new Event('central_database_updated'));
      return memoryDb.offers[idx];
    }
    return null;
  },

  deleteOffer: (offerId) => {
    memoryDb.offers = (memoryDb.offers || []).filter((o) => o.id !== offerId);
    syncToFile('offers', memoryDb.offers);
    window.dispatchEvent(new Event('central_database_updated'));
    return true;
  },

  updateTrade: (tradeId, updatedFields) => {
    const idx = (memoryDb.trades || []).findIndex((t) => t.id === tradeId);
    if (idx >= 0) {
      memoryDb.trades[idx] = { ...memoryDb.trades[idx], ...updatedFields };
      syncToFile('trades', memoryDb.trades);
      window.dispatchEvent(new Event('central_database_updated'));
      return memoryDb.trades[idx];
    }
    return null;
  },

  deleteTrade: (tradeId) => {
    memoryDb.trades = (memoryDb.trades || []).filter((t) => t.id !== tradeId);
    syncToFile('trades', memoryDb.trades);
    window.dispatchEvent(new Event('central_database_updated'));
    return true;
  },

  // MANDI DIRECTORY MANAGEMENT
  getMandis: () => {
    let custom = [];
    try {
      const stored = localStorage.getItem('agri_custom_mandis');
      if (stored) custom = JSON.parse(stored);
    } catch {
      custom = [];
    }
    const combined = [...DEFAULT_MANDI_DIRECTORY, ...(Array.isArray(custom) ? custom : [])];
    const uniqueMap = new Map();
    combined.forEach((m) => {
      if (m && (m.id || m.email)) {
        const key = (m.id || m.email).toLowerCase();
        if (!uniqueMap.has(key)) uniqueMap.set(key, m);
      }
    });
    return Array.from(uniqueMap.values());
  },

  addMandi: (mandiData) => {
    const custom = centralDatabase.getMandis();
    const newMandi = {
      id: mandiData.id || 'm-' + Date.now(),
      name: mandiData.name || 'APMC Yard',
      district: mandiData.district || 'Maharashtra',
      state: mandiData.state || 'Maharashtra',
      operatingHours: mandiData.operatingHours || '06:00 AM - 05:00 PM',
      commodity: mandiData.commodity || 'Onion',
      modalPrice: Number(mandiData.modalPrice) || 3200,
      minPrice: Number(mandiData.minPrice) || 2800,
      maxPrice: Number(mandiData.maxPrice) || 3600,
      arrivalQty: mandiData.arrivalQty || '5,000 Quintals',
      email: (mandiData.email || '').trim().toLowerCase(),
      password: (mandiData.password || 'govt123').trim(),
      mobile: mandiData.mobile || '+91 94222 10000',
      createdAt: new Date().toISOString()
    };
    custom.push(newMandi);
    localStorage.setItem('agri_custom_mandis', JSON.stringify(custom));

    // Also register an official Mandi login user if email is provided
    if (newMandi.email) {
      centralDatabase.registerUser({
        id: newMandi.id,
        name: newMandi.name,
        companyName: newMandi.name,
        email: newMandi.email,
        password: newMandi.password,
        role: 'mandi',
        mobile: newMandi.mobile,
        state: newMandi.state,
        district: newMandi.district
      });
    }

    window.dispatchEvent(new Event('central_database_updated'));
    return newMandi;
  },

  updateMandi: (mandiId, updatedFields) => {
    let custom = centralDatabase.getMandis();
    const idx = custom.findIndex((m) => m.id === mandiId);
    if (idx >= 0) {
      custom[idx] = { ...custom[idx], ...updatedFields };
      if (updatedFields.email) custom[idx].email = updatedFields.email.trim().toLowerCase();
      if (updatedFields.password) custom[idx].password = updatedFields.password.trim();
      localStorage.setItem('agri_custom_mandis', JSON.stringify(custom));

      if (custom[idx].email) {
        centralDatabase.registerUser({
          id: custom[idx].id,
          name: custom[idx].name,
          companyName: custom[idx].name,
          email: custom[idx].email,
          password: custom[idx].password || 'govt123',
          role: 'mandi',
          mobile: custom[idx].mobile,
          state: custom[idx].state,
          district: custom[idx].district
        });
      }

      window.dispatchEvent(new Event('central_database_updated'));
      return custom[idx];
    }
    return null;
  },

  deleteMandi: (mandiId) => {
    let custom = centralDatabase.getMandis();
    const target = custom.find((m) => m.id === mandiId);
    custom = custom.filter((m) => m.id !== mandiId);
    localStorage.setItem('agri_custom_mandis', JSON.stringify(custom));
    if (target && target.email) {
      centralDatabase.deleteUser(target.email);
    }
    window.dispatchEvent(new Event('central_database_updated'));
    return true;
  }
};

export default centralDatabase;
