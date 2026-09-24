import centralDatabase from './centralDatabase.js';

export const OFFER_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  SUPERSEDED: 'SUPERSEDED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

export const TRADE_STATUS = {
  ACCEPTED: 'ACCEPTED',
  DISPATCHED: 'DISPATCHED',
  DELIVERY_VERIFIED: 'DELIVERY_VERIFIED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const CROP_STATUS = {
  ACTIVE: 'Active',
  RESERVED: 'Reserved',
  SOLD: 'Sold'
};

export function getCropBenchmarkPrice(cropName) {
  const norm = (cropName || '').toLowerCase();
  if (norm.includes('cotton')) return 6900;
  if (norm.includes('chilli') || norm.includes('chili')) return 16350;
  if (norm.includes('paddy') || norm.includes('rice')) return 4150;
  if (norm.includes('onion')) return 3380;
  if (norm.includes('tomato')) return 2850;
  if (norm.includes('wheat')) return 2550;
  if (norm.includes('potato')) return 2280;
  if (norm.includes('maize') || norm.includes('corn')) return 2250;
  return 3000;
}

function normalizeMandiString(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/apmc/g, '')
    .replace(/main yard/g, '')
    .replace(/market yard/g, '')
    .replace(/market/g, '')
    .replace(/terminal/g, '')
    .replace(/wholesale/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Generic canonical Mandi resolution from user database and directory.
 * Resolves canonical mandiId, name, and loginEmail without hardcoding special cases.
 */
export function resolveMandiDetails(identifier) {
  if (!identifier) return { buyerId: '', buyerName: 'APMC Mandi Official', loginEmail: '' };

  const targetId = typeof identifier === 'string'
    ? identifier.trim()
    : (identifier.id || identifier.mandiId || identifier.buyerId || '').trim();

  const targetEmail = (typeof identifier === 'string' && identifier.includes('@')
    ? identifier
    : (identifier.email || identifier.loginEmail || identifier.buyerEmail || '')).trim().toLowerCase();

  const targetName = (typeof identifier === 'string' && !identifier.includes('@')
    ? identifier
    : (identifier.companyName || identifier.name || identifier.buyerName || '')).trim();

  const users = centralDatabase.getUsers() || [];
  const mandis = centralDatabase.getMandis() || [];

  const normTarget = normalizeMandiString(targetName);

  // Match canonical mandi entity or user
  const foundMandi = mandis.find(
    (m) =>
      (targetId && (m.id === targetId || m.mandiId === targetId)) ||
      (targetEmail && m.email?.toLowerCase() === targetEmail) ||
      (normTarget && normalizeMandiString(m.name) === normTarget) ||
      (targetName && m.name?.toLowerCase() === targetName.toLowerCase())
  );

  const foundUser = users.find(
    (u) =>
      u.role === 'mandi' &&
      ((targetId && u.id === targetId) ||
        (targetEmail && u.email?.toLowerCase() === targetEmail) ||
        (normTarget && (normalizeMandiString(u.companyName) === normTarget || normalizeMandiString(u.name) === normTarget)) ||
        (targetName &&
          (u.companyName?.toLowerCase() === targetName.toLowerCase() ||
            u.name?.toLowerCase() === targetName.toLowerCase())))
  );

  const canonical = foundMandi || foundUser;
  if (canonical) {
    return {
      buyerId: canonical.id || canonical.mandiId || targetId,
      buyerName: canonical.companyName || canonical.name || targetName || 'APMC Mandi Official',
      loginEmail: canonical.email || targetEmail || (foundUser ? foundUser.email : '')
    };
  }

  return {
    buyerId: targetId || 'm-2',
    buyerName: targetName || 'APMC Mandi Official',
    loginEmail: targetEmail || ''
  };
}

/**
 * Generic Mandi Matcher: determines if an offer/trade belongs to the specified Mandi user.
 * Works for any Mandi dynamically using canonical IDs, emails, and database relationships.
 */
export function isMandiMatch(offerOrTrade, mandiUser) {
  if (!offerOrTrade || !mandiUser) return false;

  const currentId = (mandiUser.id || mandiUser.mandiId || mandiUser.buyerId || '').trim();
  const currentEmail = (mandiUser.email || mandiUser.loginEmail || '').trim().toLowerCase();
  const currentName = (mandiUser.companyName || mandiUser.name || '').trim().toLowerCase();

  const oBuyerId = (offerOrTrade.buyerId || offerOrTrade.mandiId || '').trim();
  const oLoginEmail = (offerOrTrade.loginEmail || offerOrTrade.buyerEmail || '').trim().toLowerCase();
  const oBuyerName = (offerOrTrade.buyerName || offerOrTrade.companyName || '').trim().toLowerCase();

  // 1. Direct match by canonical user ID or mandiId
  if (currentId && oBuyerId && currentId === oBuyerId) return true;

  // 2. Direct match by canonical login email
  if (currentEmail && oLoginEmail && currentEmail === oLoginEmail) return true;

  // 3. Match through central database mapping (e.g. preset user vs directory item)
  const users = centralDatabase.getUsers() || [];
  const mandis = centralDatabase.getMandis() || [];

  const canonicalUser = users.find(
    (u) => (currentId && u.id === currentId) || (currentEmail && u.email?.toLowerCase() === currentEmail)
  );
  const canonicalOfferMandi = mandis.find(
    (m) =>
      (oBuyerId && (m.id === oBuyerId || m.mandiId === oBuyerId)) ||
      (oLoginEmail && m.email?.toLowerCase() === oLoginEmail) ||
      (oBuyerName && normalizeMandiString(m.name) === normalizeMandiString(oBuyerName))
  );

  if (canonicalUser && canonicalOfferMandi) {
    if (canonicalUser.id && (canonicalUser.id === canonicalOfferMandi.id || canonicalUser.id === canonicalOfferMandi.mandiId)) return true;
    if (canonicalUser.email && canonicalOfferMandi.email && canonicalUser.email.toLowerCase() === canonicalOfferMandi.email.toLowerCase()) return true;
    if (canonicalUser.name && canonicalOfferMandi.name && normalizeMandiString(canonicalUser.name) === normalizeMandiString(canonicalOfferMandi.name)) return true;
  }

  // 4. Normalized mandi name comparison
  if (currentName && oBuyerName) {
    const normCur = normalizeMandiString(currentName);
    const normOffer = normalizeMandiString(oBuyerName);
    if (normCur && normOffer && (normCur === normOffer || normCur.includes(normOffer) || normOffer.includes(normCur))) {
      return true;
    }
  }

  return false;
}

export function isTradeForMandi(trade, mandiUser) {
  return isMandiMatch(trade, mandiUser);
}

/**
 * Generic Active Commitment Calculation:
 * Evaluates whether a farmer and crop currently have an active, valid ACCEPTED trade/offer.
 * PENDING, REJECTED, CANCELLED, SUPERSEDED, EXPIRED, and COMPLETED records do NOT count as active commitments.
 */
export function getActiveCommitmentForCrop(farmerIdOrName, cropName, cropLotId) {
  const offers = centralDatabase.getOffers() || [];
  const trades = centralDatabase.getTrades() || [];

  const cleanFarmer = String(farmerIdOrName || '').trim().toLowerCase();
  const cleanCrop = String(cropName || '').trim().toLowerCase();
  const cleanLotId = String(cropLotId || '').trim();

  // 1. Check Offers
  const activeOffer = offers.find((o) => {
    if (!o) return false;

    if (cleanLotId && o.cropLotId) {
      if (o.cropLotId !== cleanLotId) return false;
    } else {
      const matchesFarmer =
        cleanFarmer &&
        ((o.farmerId && String(o.farmerId).toLowerCase() === cleanFarmer) ||
          (o.farmerEmail && String(o.farmerEmail).toLowerCase() === cleanFarmer) ||
          (o.farmerName && String(o.farmerName).toLowerCase() === cleanFarmer));

      const matchesCrop =
        cleanCrop &&
        o.crop &&
        (o.crop.toLowerCase().includes(cleanCrop) || cleanCrop.includes(o.crop.toLowerCase()));

      if (!matchesFarmer || !matchesCrop) return false;
    }

    const isAccepted =
      o.status === OFFER_STATUS.ACCEPTED ||
      o.status === 'Accepted' ||
      o.status?.includes('Accepted') ||
      o.status?.includes('Transit') ||
      o.status?.includes('Dispatched');

    const isInactive =
      o.status === OFFER_STATUS.REJECTED ||
      o.status?.includes('Declined') ||
      o.status === OFFER_STATUS.CANCELLED ||
      o.status === OFFER_STATUS.SUPERSEDED ||
      o.status === OFFER_STATUS.EXPIRED ||
      o.status === 'Completed' ||
      o.status === TRADE_STATUS.COMPLETED;

    return isAccepted && !isInactive;
  });

  if (activeOffer) return activeOffer;

  // 2. Check Trades
  const activeTrade = trades.find((t) => {
    if (!t) return false;

    if (cleanLotId && t.cropLotId) {
      if (t.cropLotId !== cleanLotId) return false;
    } else {
      const matchesFarmer =
        cleanFarmer &&
        ((t.farmerId && String(t.farmerId).toLowerCase() === cleanFarmer) ||
          (t.farmerEmail && String(t.farmerEmail).toLowerCase() === cleanFarmer) ||
          (t.farmerName && String(t.farmerName).toLowerCase() === cleanFarmer));

      const matchesCrop =
        cleanCrop &&
        t.crop &&
        (t.crop.toLowerCase().includes(cleanCrop) || cleanCrop.includes(t.crop.toLowerCase()));

      if (!matchesFarmer || !matchesCrop) return false;
    }

    const isAccepted =
      t.status === TRADE_STATUS.ACCEPTED ||
      t.status === TRADE_STATUS.DISPATCHED ||
      t.status === TRADE_STATUS.DELIVERY_VERIFIED ||
      t.status === TRADE_STATUS.PAYMENT_PENDING;

    const isInactive = t.status === TRADE_STATUS.COMPLETED || t.status === TRADE_STATUS.CANCELLED;

    return isAccepted && !isInactive;
  });

  return activeTrade || null;
}

/**
 * Evaluates whether a specific crop lot has reached a final completed / settled state.
 * Evaluates at the individual crop-lot level using cropLotId, offerId, and tradeId.
 */
export function isCropLotCompletedOrSold(crop) {
  if (!crop) return false;
  if (
    crop.status === CROP_STATUS.SOLD ||
    crop.status === 'Sold' ||
    crop.active === false ||
    crop.status === 'Archived'
  ) {
    return true;
  }

  const cleanLotId = String(crop.id || '').trim();
  const offers = centralDatabase.getOffers() || [];
  const trades = centralDatabase.getTrades() || [];

  // Check Trades for COMPLETED / SETTLED state on this specific crop lot
  const completedTrade = trades.find((t) => {
    if (!t) return false;
    const isCompletedStatus =
      t.status === TRADE_STATUS.COMPLETED ||
      t.status === 'Completed' ||
      t.paymentReleased === true ||
      Boolean(t.completedAt && t.paidAmount);

    if (!isCompletedStatus) return false;

    if (cleanLotId && t.cropLotId && t.cropLotId === cleanLotId) return true;
    if (crop.selectedOfferId && t.offerId && t.offerId === crop.selectedOfferId) return true;
    if (crop.tradeId && t.id && t.id === crop.tradeId) return true;

    return false;
  });

  if (completedTrade) return true;

  // Check Offers for COMPLETED / SETTLED state on this specific crop lot
  const completedOffer = offers.find((o) => {
    if (!o) return false;
    const isCompletedStatus =
      o.status === 'Completed' ||
      o.status === TRADE_STATUS.COMPLETED ||
      Boolean(o.completedAt && o.paidAmount);

    if (!isCompletedStatus) return false;

    if (cleanLotId && o.cropLotId && o.cropLotId === cleanLotId) return true;
    if (crop.selectedOfferId && o.id && o.id === crop.selectedOfferId) return true;

    return false;
  });

  if (completedOffer) return true;

  return false;
}

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('agri_user');
    if (!raw || raw === 'undefined' || raw === 'null') return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
};

const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Error notifying live store listener:', e);
    }
  });
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', () => notifyListeners());
  window.addEventListener('central_database_updated', () => notifyListeners());
}

export const liveDataStore = {
  getStoredUser,
  OFFER_STATUS,
  TRADE_STATUS,
  CROP_STATUS,
  getCropBenchmarkPrice,
  resolveMandiDetails,
  isMandiMatch,
  isTradeForMandi,
  getActiveCommitmentForCrop,
  isCropLotCompletedOrSold,

  subscribe: (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  /**
   * BUYERS & REQUIREMENTS
   */
  getBuyerRequirements: () => {
    return centralDatabase.getDatabase()?.requirements || [];
  },

  /**
   * FARMER CROPS
   */
  getCrops: () => {
    const crops = centralDatabase.getCrops();
    // Dynamically evaluate each crop lot independently
    return crops.map((c) => {
      // 1. If this specific crop lot is completed / settled, mark as Sold & inactive
      if (isCropLotCompletedOrSold(c)) {
        return {
          ...c,
          status: CROP_STATUS.SOLD,
          active: false,
          locked: true
        };
      }

      // 2. If this specific crop lot has an active valid ACCEPTED commitment
      const activeCommitment = getActiveCommitmentForCrop(c.farmerId || c.farmerName, c.crop, c.id);
      if (activeCommitment) {
        return {
          ...c,
          status: CROP_STATUS.RESERVED,
          locked: true,
          selectedMandiId: activeCommitment.buyerId || activeCommitment.mandiId || c.selectedMandiId,
          selectedMandiName: activeCommitment.buyerName || activeCommitment.companyName || c.selectedMandiName,
          selectedOfferId: activeCommitment.offerId || activeCommitment.id || c.selectedOfferId,
          agreedRate: activeCommitment.agreedPricePerQuintal || activeCommitment.offeredPricePerQuintal || c.agreedRate
        };
      } else {
        return {
          ...c,
          status: CROP_STATUS.ACTIVE,
          locked: false,
          selectedMandiId: null,
          selectedMandiName: null,
          selectedOfferId: null,
          tradeId: null,
          agreedRate: null
        };
      }
    });
  },

  getFarmerCrops: () => {
    const crops = liveDataStore.getCrops();
    const currentUser = getStoredUser();
    if (currentUser.role === 'farmer' && (currentUser.id || currentUser.email)) {
      return crops.filter(
        (c) =>
          (currentUser.id && c.farmerId === currentUser.id) ||
          (currentUser.email && c.farmerEmail?.toLowerCase() === currentUser.email?.toLowerCase()) ||
          (currentUser.name && c.farmerName?.toLowerCase() === currentUser.name?.toLowerCase())
      );
    }
    return crops;
  },

  getActiveCropForFarmer: (farmerUser) => {
    const user = farmerUser || getStoredUser();
    const crops = liveDataStore.getCrops();
    const farmerCrops = crops.filter(
      (c) =>
        (user.id && c.farmerId === user.id) ||
        (user.email && c.farmerEmail?.toLowerCase() === user.email?.toLowerCase()) ||
        (user.name && c.farmerName?.toLowerCase() === user.name?.toLowerCase())
    );
    // Find non-sold crop
    return farmerCrops.find((c) => c.status !== CROP_STATUS.SOLD && c.status !== 'Sold' && c.active !== false && !isCropLotCompletedOrSold(c)) || null;
  },

  getMatchingFarmersForBuyer: () => {
    const crops = liveDataStore.getCrops();
    // Return only active / available harvest lots; completed & settled crop lots are strictly excluded
    return crops.filter(
      (c) => c && c.status !== CROP_STATUS.SOLD && c.status !== 'Sold' && c.active !== false && !isCropLotCompletedOrSold(c)
    );
  },

  registerCrop: (cropData) => {
    const currentUser = getStoredUser();
    const cropName = cropData.name || cropData.crop || 'Cotton';
    const benchmarkPrice = getCropBenchmarkPrice(cropName);

    const expectedPrice =
      cropData.expectedPrice && Number(cropData.expectedPrice) > 1000
        ? Number(cropData.expectedPrice)
        : benchmarkPrice;

    const newCropLot = {
      id: cropData.id || 'crop-lot-' + Date.now(),
      farmerId: currentUser.id || ('f-' + Date.now()),
      farmerName: currentUser.name || 'Farmer',
      farmerEmail: currentUser.email || '',
      mobile: currentUser.mobile || '+91 98480 12345',
      crop: cropName,
      variety: cropData.variety || 'Standard Quality',
      quantityKg: Number(cropData.quantityKg) || 1500,
      availableQty: `${cropData.quantityKg || 1500} kg (${((cropData.quantityKg || 1500) / 100).toFixed(1)} Quintals)`,
      location: cropData.location || currentUser.district || 'Nashik, Maharashtra',
      distanceKm: Number(cropData.distanceKm) || 15,
      expectedPrice: expectedPrice,
      harvestDate: cropData.harvestDate || new Date().toISOString().split('T')[0],
      rating: 5.0,
      qualityGrade: 'Grade A Premium',
      status: CROP_STATUS.ACTIVE,
      locked: false,
      active: true,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('agri_farmer_crop', JSON.stringify(newCropLot));
    centralDatabase.saveCrop(newCropLot);

    centralDatabase.appendAudit({
      eventType: 'CROP_REGISTERED',
      entityId: newCropLot.id,
      entityType: 'CROP',
      actorId: currentUser.id || 'farmer',
      actorName: currentUser.name || 'Farmer',
      actorRole: 'farmer',
      newStatus: CROP_STATUS.ACTIVE,
      reason: `Registered ${newCropLot.quantityKg} kg of ${newCropLot.crop} (${newCropLot.variety})`
    });

    notifyListeners();
    return newCropLot;
  },

  publishFarmerCrop: function (cropData) {
    return this.registerCrop(cropData);
  },

  /**
   * OFFERS & NEGOTIATIONS
   */
  getOffers: () => {
    return centralDatabase.getOffers();
  },

  getOfferById: (offerId) => {
    return centralDatabase.getOffers().find((o) => o.id === offerId) || null;
  },

  createOffer: (offerData) => {
    const currentUser = getStoredUser();
    const cropName = offerData.crop || 'Cotton';
    const price =
      Number(offerData.offeredPricePerQuintal) && Number(offerData.offeredPricePerQuintal) > 1000
        ? Number(offerData.offeredPricePerQuintal)
        : getCropBenchmarkPrice(cropName);

    const mandiDetails = resolveMandiDetails(offerData);

    const farmerId = currentUser.role === 'farmer' ? (currentUser.id || 'f-1') : (offerData.farmerId || 'f-1');
    const farmerName = currentUser.role === 'farmer' ? (currentUser.name || 'Farmer') : (offerData.farmerName || 'Farmer');
    const farmerEmail = currentUser.role === 'farmer' ? (currentUser.email || '') : (offerData.farmerEmail || '');

    // Concurrency / Commitment check: verify whether an active ACCEPTED commitment already exists
    const activeCommitment = getActiveCommitmentForCrop(farmerId || farmerName, cropName, offerData.cropLotId);
    if (activeCommitment) {
      throw new Error(`This crop is already committed to ${activeCommitment.buyerName || 'another mandi'}.`);
    }

    const newOffer = {
      id: 'off-' + Date.now(),
      cropLotId: offerData.cropLotId || null,
      buyerId: mandiDetails.buyerId,
      buyerName: mandiDetails.buyerName,
      loginEmail: mandiDetails.loginEmail,
      farmerId: farmerId,
      farmerName: farmerName,
      farmerEmail: farmerEmail,
      crop: cropName,
      quantity: offerData.quantity || '15 Quintals',
      offeredPricePerQuintal: price,
      totalValue: Number(offerData.totalValue) || (price * 15),
      netReturn: Number(offerData.netReturn) || (price * 15 - 3000),
      status: OFFER_STATUS.PENDING,
      type: currentUser.role === 'farmer' ? 'sent' : 'received',
      createdDate: new Date().toISOString().split('T')[0],
      notes: offerData.notes || `Consignment request initiated for ${cropName} at ₹${price}/q.`,
      discussion: [
        {
          id: 'msg-' + Date.now(),
          senderName: currentUser.name || (currentUser.role === 'mandi' ? 'Mandi Official' : 'Farmer'),
          senderRole: currentUser.role || 'farmer',
          text: `Consignment request initiated for ${cropName} lot at ₹${price}/q.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    centralDatabase.saveOffer(newOffer);

    centralDatabase.appendAudit({
      eventType: 'OFFER_CREATED',
      entityId: newOffer.id,
      entityType: 'OFFER',
      actorId: currentUser.id || 'user',
      actorName: currentUser.name || 'User',
      actorRole: currentUser.role || 'farmer',
      newStatus: OFFER_STATUS.PENDING,
      reason: `Offer created for ${newOffer.crop} at ₹${price}/q`
    });

    notifyListeners();
    return newOffer;
  },

  createOfferFromBuyer: (buyerOfferData) => {
    const price =
      Number(buyerOfferData.offeredPricePerQuintal) && Number(buyerOfferData.offeredPricePerQuintal) > 1000
        ? Number(buyerOfferData.offeredPricePerQuintal)
        : getCropBenchmarkPrice(buyerOfferData.crop);

    const users = centralDatabase.getUsers();
    const crops = centralDatabase.getCrops();

    let targetFarmerId = buyerOfferData.farmerId || '';
    let targetFarmerName = buyerOfferData.farmerName || '';
    let targetFarmerEmail = buyerOfferData.farmerEmail || '';
    let cropLotId = null;

    if (targetFarmerId.startsWith('crop-lot-')) {
      cropLotId = targetFarmerId;
      const cropObj = crops.find((c) => c.id === targetFarmerId);
      if (cropObj) {
        const activeCommitment = getActiveCommitmentForCrop(cropObj.farmerId || cropObj.farmerName, cropObj.crop, cropObj.id);
        if (cropObj.status === CROP_STATUS.SOLD || cropObj.status === 'Sold' || activeCommitment) {
          throw new Error('This crop has already been committed to another mandi.');
        }
        if (cropObj.farmerId) targetFarmerId = cropObj.farmerId;
        if (cropObj.farmerName) targetFarmerName = cropObj.farmerName;
        if (cropObj.farmerEmail) targetFarmerEmail = cropObj.farmerEmail;
      }
    } else {
      const cropObj = crops.find(
        (c) =>
          (c.farmerId === targetFarmerId || c.farmerName === targetFarmerName) &&
          c.crop?.toLowerCase().includes((buyerOfferData.crop || '').toLowerCase()) &&
          c.status !== CROP_STATUS.SOLD &&
          c.status !== 'Sold'
      );
      if (cropObj) {
        cropLotId = cropObj.id;
        const activeCommitment = getActiveCommitmentForCrop(cropObj.farmerId || cropObj.farmerName, cropObj.crop, cropObj.id);
        if (activeCommitment) {
          throw new Error('This crop has already been committed to another mandi.');
        }
      }
    }

    const farmerUser = users.find(
      (u) =>
        (targetFarmerId && u.id === targetFarmerId) ||
        (targetFarmerEmail && u.email?.toLowerCase() === targetFarmerEmail.toLowerCase()) ||
        (targetFarmerName && u.name?.toLowerCase() === targetFarmerName.toLowerCase())
    );

    if (farmerUser) {
      targetFarmerId = farmerUser.id || targetFarmerId;
      targetFarmerName = farmerUser.name || targetFarmerName;
      targetFarmerEmail = farmerUser.email || targetFarmerEmail;
    }

    const mandiDetails = resolveMandiDetails(buyerOfferData);

    const newOffer = {
      id: 'off-' + Date.now(),
      cropLotId: cropLotId,
      buyerId: mandiDetails.buyerId,
      buyerName: mandiDetails.buyerName,
      loginEmail: mandiDetails.loginEmail,
      farmerId: targetFarmerId || 'f-1',
      farmerName: targetFarmerName || 'Farmer',
      farmerEmail: targetFarmerEmail || '',
      crop: buyerOfferData.crop || 'Cotton',
      quantity: buyerOfferData.quantity || '15 Quintals',
      offeredPricePerQuintal: price,
      totalValue: Number(buyerOfferData.totalValue) || (price * 15),
      netReturn: Number(buyerOfferData.netReturn) || (price * 15 - 3000),
      status: OFFER_STATUS.PENDING,
      type: 'received',
      createdDate: new Date().toISOString().split('T')[0],
      notes: buyerOfferData.notes || `${mandiDetails.buyerName} Official issued purchase offer at ₹${price}/q.`,
      discussion: [
        {
          id: 'msg-' + Date.now(),
          senderName: mandiDetails.buyerName || 'Mandi Official',
          senderRole: 'mandi',
          text: `Official purchase offer issued at ₹${price}/q for ${buyerOfferData.crop} lot.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    centralDatabase.saveOffer(newOffer);

    centralDatabase.appendAudit({
      eventType: 'OFFER_CREATED',
      entityId: newOffer.id,
      entityType: 'OFFER',
      actorId: mandiDetails.buyerId || 'mandi',
      actorName: mandiDetails.buyerName || 'Mandi Official',
      actorRole: 'mandi',
      newStatus: OFFER_STATUS.PENDING,
      reason: `Purchase offer issued for ${newOffer.crop} lot at ₹${price}/q`
    });

    notifyListeners();
    return newOffer;
  },

  rejectOfferWithReason: (offerId, reason) => {
    const offers = centralDatabase.getOffers();
    const target = offers.find((o) => o.id === offerId);
    if (!target) throw new Error('Offer not found.');

    if (
      target.status === OFFER_STATUS.ACCEPTED ||
      target.status === OFFER_STATUS.SUPERSEDED ||
      target.status === OFFER_STATUS.REJECTED
    ) {
      throw new Error(`Cannot reject an offer with status: ${target.status}`);
    }

    const currentUser = getStoredUser();
    const updated = offers.map((off) => {
      if (off.id === offerId) {
        const discussion = off.discussion || [];
        return {
          ...off,
          status: OFFER_STATUS.REJECTED,
          rejectionReason: reason,
          notes: `Declined by ${currentUser.name || 'Mandi Official'}. Reason: ${reason}`,
          discussion: [
            ...discussion,
            {
              id: 'msg-' + Date.now(),
              senderName: currentUser.name || off.buyerName || 'Mandi Official',
              senderRole: currentUser.role || 'mandi',
              text: `Request declined. Reason: ${reason}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return off;
    });

    centralDatabase.setOffers(updated);

    // Update any associated trade record to CANCELLED (preserve history without deleting)
    const trades = centralDatabase.getTrades() || [];
    const updatedTrades = trades.map((t) => {
      if (t.offerId === offerId && t.status !== TRADE_STATUS.COMPLETED) {
        return { ...t, status: TRADE_STATUS.CANCELLED };
      }
      return t;
    });
    centralDatabase.setTrades(updatedTrades);

    // Verify if any OTHER active accepted commitment exists for this crop lot before unlocking
    const crops = centralDatabase.getCrops() || [];
    const cropLotId = target.cropLotId;
    const targetCrop = crops.find(
      (c) =>
        (cropLotId && c.id === cropLotId) ||
        ((c.farmerId === target.farmerId || c.farmerName === target.farmerName) &&
          c.crop?.toLowerCase().includes((target.crop || '').toLowerCase()) &&
          c.status !== CROP_STATUS.SOLD &&
          c.status !== 'Sold')
    );

    if (targetCrop && targetCrop.status !== CROP_STATUS.SOLD && targetCrop.status !== 'Sold') {
      const otherAccepted = updated.find(
        (o) =>
          o.id !== offerId &&
          (o.cropLotId === targetCrop.id ||
            ((o.farmerId === target.farmerId || o.farmerName === target.farmerName) && o.crop === targetCrop.crop)) &&
          (o.status === OFFER_STATUS.ACCEPTED || o.status?.includes('Accepted'))
      );

      if (!otherAccepted) {
        const updatedCrops = crops.map((c) => {
          if (c.id === targetCrop.id) {
            return {
              ...c,
              status: CROP_STATUS.ACTIVE,
              locked: false,
              selectedMandiId: null,
              selectedMandiName: null,
              selectedOfferId: null,
              tradeId: null,
              agreedRate: null
            };
          }
          return c;
        });
        centralDatabase.setCrops(updatedCrops);
      }
    }

    centralDatabase.appendAudit({
      eventType: 'OFFER_REJECTED',
      entityId: offerId,
      entityType: 'OFFER',
      actorId: currentUser.id || 'user',
      actorName: currentUser.name || 'User',
      actorRole: currentUser.role || 'mandi',
      previousStatus: target.status,
      newStatus: OFFER_STATUS.REJECTED,
      reason: reason
    });

    notifyListeners();
  },

  /**
   * CRITICAL ACCEPT OFFER & LOCK CROP WORKFLOW (Strict State Machine & Concurrency Guard)
   */
  acceptOfferAndCancelOthers: function (acceptedOfferId) {
    const offers = centralDatabase.getOffers();
    const crops = centralDatabase.getCrops();
    const currentUser = getStoredUser();

    const targetOffer = offers.find((o) => o.id === acceptedOfferId);
    if (!targetOffer) {
      throw new Error('Target offer not found.');
    }

    // Guard against operating on an already finalized/cancelled offer
    if (
      targetOffer.status === OFFER_STATUS.SUPERSEDED ||
      targetOffer.status === OFFER_STATUS.CANCELLED ||
      targetOffer.status === OFFER_STATUS.REJECTED
    ) {
      throw new Error(`This offer is no longer active (Status: ${targetOffer.status}).`);
    }

    if (targetOffer.status === OFFER_STATUS.ACCEPTED) {
      // Idempotent: already accepted, do nothing
      return targetOffer;
    }

    // Locate the crop lot
    let cropLot = null;
    if (targetOffer.cropLotId) {
      cropLot = crops.find((c) => c.id === targetOffer.cropLotId);
    }
    if (!cropLot) {
      cropLot = crops.find(
        (c) =>
          (c.farmerId === targetOffer.farmerId || c.farmerName === targetOffer.farmerName) &&
          c.crop?.toLowerCase().includes((targetOffer.crop || '').toLowerCase()) &&
          c.status !== CROP_STATUS.SOLD &&
          c.status !== 'Sold'
      );
    }

    // CONCURRENCY & LOCKING CHECK:
    // Check if there is an active accepted commitment to another Mandi
    const existingActiveCommitment = getActiveCommitmentForCrop(
      targetOffer.farmerId || targetOffer.farmerName,
      targetOffer.crop,
      cropLot?.id
    );
    if (
      existingActiveCommitment &&
      existingActiveCommitment.id !== targetOffer.id &&
      existingActiveCommitment.buyerId !== targetOffer.buyerId
    ) {
      throw new Error(`This crop has already been accepted by ${existingActiveCommitment.buyerName || 'another mandi'}.`);
    }

    if (cropLot && (cropLot.status === CROP_STATUS.SOLD || cropLot.status === 'Sold')) {
      throw new Error('This crop has already been completed and sold.');
    }

    const targetCropName = targetOffer.crop;
    const targetFarmerId = targetOffer.farmerId;
    const targetFarmerName = targetOffer.farmerName;

    // 1. Update winning offer to ACCEPTED
    // 2. Automatically update ALL competing pending offers for the same crop lot to SUPERSEDED
    const updatedOffers = offers.map((off) => {
      if (off.id === acceptedOfferId) {
        const discussion = off.discussion || [];
        const isDuplicateMsg = discussion.some((m) => m.text?.includes('Offer accepted! Proceeding with crop'));
        const newDiscussion = isDuplicateMsg
          ? discussion
          : [
              ...discussion,
              {
                id: 'msg-' + Date.now(),
                senderName: currentUser.name || off.farmerName || 'Farmer',
                senderRole: currentUser.role || 'farmer',
                text: `Offer accepted! Proceeding with crop harvest and transport dispatch to ${off.buyerName}.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ];

        return {
          ...off,
          status: OFFER_STATUS.ACCEPTED,
          acceptedAt: new Date().toISOString(),
          notes: `Offer mutually accepted with ${off.buyerName} at ₹${off.offeredPricePerQuintal}/q. Complete freight dispatch within 2 days.`,
          discussion: newDiscussion
        };
      }

      // Check competing offers for same crop & farmer that are still pending
      const isSameCrop = off.crop === targetCropName;
      const isSameFarmer = off.farmerId === targetFarmerId || off.farmerName === targetFarmerName;
      const isPending = off.status === OFFER_STATUS.PENDING || off.status === 'Sent' || off.status === 'Received';

      if (off.id !== acceptedOfferId && isSameCrop && isSameFarmer && isPending) {
        return {
          ...off,
          status: OFFER_STATUS.SUPERSEDED,
          notes: `Superseded: Deal accepted with ${targetOffer.buyerName} at ₹${targetOffer.offeredPricePerQuintal}/q.`
        };
      }

      return off;
    });

    centralDatabase.setOffers(updatedOffers);

    // 3. Create or Update Committed Trade Record
    const tradeId = 'trd-' + Date.now();
    const newTrade = {
      id: tradeId,
      offerId: targetOffer.id,
      cropLotId: cropLot ? cropLot.id : null,
      farmerId: targetOffer.farmerId,
      farmerName: targetOffer.farmerName,
      farmerEmail: targetOffer.farmerEmail,
      buyerId: targetOffer.buyerId,
      buyerName: targetOffer.buyerName,
      loginEmail: targetOffer.loginEmail,
      crop: targetOffer.crop,
      variety: cropLot?.variety || 'Standard Quality',
      quantity: targetOffer.quantity,
      agreedPricePerQuintal: targetOffer.offeredPricePerQuintal,
      grossValue: targetOffer.totalValue,
      netReturn: targetOffer.netReturn,
      status: TRADE_STATUS.ACCEPTED,
      dispatched: false,
      deliveryVerified: false,
      paymentReleased: false,
      createdAt: new Date().toISOString()
    };
    centralDatabase.saveTrade(newTrade);

    // 4. Lock Crop Lot
    if (cropLot) {
      const updatedCrops = crops.map((c) => {
        if (c.id === cropLot.id) {
          return {
            ...c,
            status: CROP_STATUS.RESERVED,
            locked: true,
            selectedMandiId: targetOffer.buyerId,
            selectedMandiName: targetOffer.buyerName,
            selectedOfferId: targetOffer.id,
            tradeId: tradeId,
            agreedRate: targetOffer.offeredPricePerQuintal
          };
        }
        return c;
      });
      centralDatabase.setCrops(updatedCrops);
    }

    // 5. Append Audit Logs
    centralDatabase.appendAudit({
      eventType: 'OFFER_ACCEPTED',
      entityId: targetOffer.id,
      entityType: 'OFFER',
      actorId: currentUser.id || 'user',
      actorName: currentUser.name || 'User',
      actorRole: currentUser.role || 'farmer',
      previousStatus: targetOffer.status,
      newStatus: OFFER_STATUS.ACCEPTED,
      reason: `Accepted offer at ₹${targetOffer.offeredPricePerQuintal}/q`
    });

    if (cropLot) {
      centralDatabase.appendAudit({
        eventType: 'CROP_LOCKED',
        entityId: cropLot.id,
        entityType: 'CROP',
        actorId: currentUser.id || 'user',
        actorName: currentUser.name || 'User',
        actorRole: currentUser.role || 'farmer',
        previousStatus: cropLot.status,
        newStatus: CROP_STATUS.RESERVED,
        reason: `Locked for winning mandi ${targetOffer.buyerName}`
      });
    }

    centralDatabase.appendAudit({
      eventType: 'TRADE_CREATED',
      entityId: tradeId,
      entityType: 'TRADE',
      actorId: currentUser.id || 'user',
      actorName: currentUser.name || 'User',
      actorRole: currentUser.role || 'farmer',
      newStatus: TRADE_STATUS.ACCEPTED,
      reason: `Committed trade initiated between ${targetOffer.farmerName} and ${targetOffer.buyerName}`
    });

    notifyListeners();
    return newTrade;
  },

  acceptOfferByBuyer: function (offerId) {
    return this.acceptOfferAndCancelOthers(offerId);
  },

  /**
   * FREIGHT DISPATCH WORKFLOW
   */
  dispatchFreight: (offerOrTradeId, transportDetails) => {
    const offers = centralDatabase.getOffers();
    const trades = centralDatabase.getTrades();
    const currentUser = getStoredUser();

    const targetOffer = offers.find((o) => o.id === offerOrTradeId);
    const targetTrade = trades.find((t) => t.id === offerOrTradeId || t.offerId === offerOrTradeId);

    if (targetOffer && (targetOffer.status === OFFER_STATUS.SUPERSEDED || targetOffer.status === OFFER_STATUS.CANCELLED)) {
      throw new Error('Cannot dispatch freight for a superseded or cancelled offer.');
    }

    const driverName = transportDetails?.driverName || 'Ramesh Kumar';
    const truckNo = transportDetails?.truckNo || 'MH-27-AX-4821';
    const dispatchedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update Offer
    const updatedOffers = offers.map((off) => {
      if (off.id === offerOrTradeId || (targetTrade && off.id === targetTrade.offerId)) {
        const discussion = off.discussion || [];
        return {
          ...off,
          dispatched: true,
          transportDetails: { driverName, truckNo, dispatchedAt },
          discussion: [
            ...discussion,
            {
              id: 'msg-' + Date.now(),
              senderName: off.farmerName || 'Farmer',
              senderRole: 'farmer',
              text: `🚚 Freight transport dispatched! Vehicle ${truckNo} (${driverName}) en route to ${off.buyerName} gate.`,
              timestamp: dispatchedAt
            }
          ]
        };
      }
      return off;
    });
    centralDatabase.setOffers(updatedOffers);

    // Update Trade
    if (targetTrade) {
      const updatedTrades = trades.map((t) => {
        if (t.id === targetTrade.id) {
          return {
            ...t,
            status: TRADE_STATUS.DISPATCHED,
            dispatched: true,
            transportDetails: { driverName, truckNo, dispatchedAt }
          };
        }
        return t;
      });
      centralDatabase.setTrades(updatedTrades);
    }

    centralDatabase.appendAudit({
      eventType: 'TRADE_DISPATCHED',
      entityId: targetTrade ? targetTrade.id : offerOrTradeId,
      entityType: 'TRADE',
      actorId: currentUser.id || 'farmer',
      actorName: currentUser.name || 'Farmer',
      actorRole: 'farmer',
      newStatus: TRADE_STATUS.DISPATCHED,
      reason: `Transport dispatched: ${truckNo} driven by ${driverName}`
    });

    notifyListeners();
  },

  /**
   * GATE DELIVERY VERIFICATION WORKFLOW
   */
  verifyGateDelivery: (tradeOrOfferId, inspectionDetails) => {
    const trades = centralDatabase.getTrades();
    const currentUser = getStoredUser();
    const targetTrade = trades.find((t) => t.id === tradeOrOfferId || t.offerId === tradeOrOfferId);

    const verifiedAt = new Date().toISOString();
    const gatePassNo = inspectionDetails?.gatePassNo || ('GP-' + Math.floor(100000 + Math.random() * 900000));

    if (targetTrade) {
      const updatedTrades = trades.map((t) => {
        if (t.id === targetTrade.id) {
          return {
            ...t,
            status: TRADE_STATUS.DELIVERY_VERIFIED,
            deliveryVerified: true,
            inspectionDetails: {
              gatePassNo,
              weighbridgeVerified: true,
              qualityGrade: inspectionDetails?.qualityGrade || 'Grade A Premium',
              verifiedAt,
              inspectorNotes: inspectionDetails?.inspectorNotes || 'Physical inspection and moisture analysis verified.'
            }
          };
        }
        return t;
      });
      centralDatabase.setTrades(updatedTrades);
    }

    centralDatabase.appendAudit({
      eventType: 'DELIVERY_VERIFIED',
      entityId: targetTrade ? targetTrade.id : tradeOrOfferId,
      entityType: 'TRADE',
      actorId: currentUser.id || 'mandi',
      actorName: currentUser.name || 'Mandi Official',
      actorRole: 'mandi',
      newStatus: TRADE_STATUS.DELIVERY_VERIFIED,
      reason: `Gate entry pass ${gatePassNo} issued. Weighment and quality verified.`
    });

    notifyListeners();
  },

  /**
   * ESCROW PAYMENT RELEASE & TRADE COMPLETION WORKFLOW (Idempotent & Strict)
   */
  completeOfferAndPay: function (offerOrTradeId, paidAmount, gateDetails) {
    const offers = centralDatabase.getOffers();
    const trades = centralDatabase.getTrades();
    const crops = centralDatabase.getCrops();
    const currentUser = getStoredUser();

    let targetOffer = offers.find((o) => o.id === offerOrTradeId);
    let targetTrade = trades.find((t) => t.id === offerOrTradeId || t.offerId === offerOrTradeId);

    if (!targetOffer && targetTrade) {
      targetOffer = offers.find((o) => o.id === targetTrade.offerId);
    }

    // IDEMPOTENCY GUARD:
    // If trade or offer is already completed, prevent double payment release
    if ((targetTrade && targetTrade.status === TRADE_STATUS.COMPLETED) || (targetOffer && targetOffer.completedAt && targetOffer.paidAmount)) {
      throw new Error('Payment has already been released for this trade.');
    }

    const total = Number(paidAmount) || targetOffer?.netReturn || targetTrade?.netReturn || targetOffer?.totalValue || 60000;
    const completedAt = new Date().toISOString();

    // 1. Update Offer Record
    let completedOffer = null;
    const updatedOffers = offers.map((off) => {
      if (off.id === targetOffer?.id) {
        const discussion = off.discussion || [];
        completedOffer = {
          ...off,
          status: 'Completed',
          paidAmount: total,
          completedAt: completedAt,
          notes: `Deal completed successfully. ₹${total.toLocaleString('en-IN')} released to farmer account.`,
          discussion: [
            ...discussion,
            {
              id: 'msg-' + Date.now(),
              senderName: currentUser.name || off.buyerName || 'Mandi Official',
              senderRole: 'mandi',
              text: `Payment of ₹${total.toLocaleString('en-IN')} released to farmer account. Order marked completed.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
        return completedOffer;
      }
      return off;
    });
    centralDatabase.setOffers(updatedOffers);

    // 2. Update Trade Record
    if (targetTrade) {
      const updatedTrades = trades.map((t) => {
        if (t.id === targetTrade.id) {
          return {
            ...t,
            status: TRADE_STATUS.COMPLETED,
            deliveryVerified: true,
            paymentReleased: true,
            paidAmount: total,
            completedAt: completedAt
          };
        }
        return t;
      });
      centralDatabase.setTrades(updatedTrades);
    }

    // 3. Mark Crop Lot as SOLD & ACTIVE=FALSE
    const targetCropLotId = targetTrade?.cropLotId || targetOffer?.cropLotId;
    const updatedCrops = crops.map((c) => {
      const isTarget =
        (targetCropLotId && c.id === targetCropLotId) ||
        ((c.farmerId === targetOffer?.farmerId || c.farmerName === targetOffer?.farmerName) &&
          c.crop?.toLowerCase().includes((targetOffer?.crop || '').toLowerCase()) &&
          c.status !== CROP_STATUS.SOLD);

      if (isTarget) {
        return {
          ...c,
          status: CROP_STATUS.SOLD,
          active: false,
          locked: true,
          completedAt: completedAt,
          finalPaidAmount: total
        };
      }
      return c;
    });
    centralDatabase.setCrops(updatedCrops);

    // Session cache flags
    if (targetOffer?.farmerId) localStorage.setItem(`agri_crop_cleared_${targetOffer.farmerId}`, 'true');
    if (targetOffer?.farmerEmail) localStorage.setItem(`agri_crop_cleared_${targetOffer.farmerEmail}`, 'true');
    localStorage.setItem('agri_active_crop_cleared', 'true');
    localStorage.removeItem('agri_farmer_crop');

    // 4. Append Audit Logs
    centralDatabase.appendAudit({
      eventType: 'PAYMENT_RELEASED',
      entityId: targetTrade ? targetTrade.id : (targetOffer?.id || 'trade'),
      entityType: 'TRADE',
      actorId: currentUser.id || 'mandi',
      actorName: currentUser.name || 'Mandi Official',
      actorRole: 'mandi',
      previousStatus: targetTrade?.status || TRADE_STATUS.DELIVERY_VERIFIED,
      newStatus: TRADE_STATUS.COMPLETED,
      reason: `Settled payment of ₹${total.toLocaleString('en-IN')} to farmer account`
    });

    centralDatabase.appendAudit({
      eventType: 'TRADE_COMPLETED',
      entityId: targetTrade ? targetTrade.id : (targetOffer?.id || 'trade'),
      entityType: 'TRADE',
      actorId: currentUser.id || 'mandi',
      actorName: currentUser.name || 'Mandi Official',
      actorRole: 'mandi',
      newStatus: TRADE_STATUS.COMPLETED,
      reason: 'Trade finalized and archived in trade history'
    });

    notifyListeners();
    return completedOffer || targetTrade;
  },

  cancelOfferByFarmer: (offerId) => {
    const offers = centralDatabase.getOffers();
    const target = offers.find((o) => o.id === offerId);
    if (!target) throw new Error('Offer not found.');

    if (target.status === 'Completed' || target.dispatched === true) {
      throw new Error('Cannot cancel a dispatched or completed trade.');
    }

    const currentUser = getStoredUser();
    const updated = offers.map((off) => {
      if (off.id === offerId) {
        return { ...off, status: OFFER_STATUS.CANCELLED };
      }
      return off;
    });
    centralDatabase.setOffers(updated);

    // Update any associated trade record to CANCELLED (preserve history)
    const trades = centralDatabase.getTrades() || [];
    const updatedTrades = trades.map((t) => {
      if (t.offerId === offerId && t.status !== TRADE_STATUS.COMPLETED) {
        return { ...t, status: TRADE_STATUS.CANCELLED };
      }
      return t;
    });
    centralDatabase.setTrades(updatedTrades);

    // Check if any other active accepted commitment exists for this crop before unlocking
    const crops = centralDatabase.getCrops() || [];
    const targetCrop = crops.find(
      (c) =>
        (target.cropLotId && c.id === target.cropLotId) ||
        ((c.farmerId === target.farmerId || c.farmerName === target.farmerName) &&
          c.crop?.toLowerCase().includes((target.crop || '').toLowerCase()) &&
          c.status !== CROP_STATUS.SOLD &&
          c.status !== 'Sold')
    );

    if (targetCrop && targetCrop.status !== CROP_STATUS.SOLD && targetCrop.status !== 'Sold') {
      const otherAccepted = updated.find(
        (o) =>
          o.id !== offerId &&
          (o.cropLotId === targetCrop.id ||
            ((o.farmerId === target.farmerId || o.farmerName === target.farmerName) && o.crop === targetCrop.crop)) &&
          (o.status === OFFER_STATUS.ACCEPTED || o.status?.includes('Accepted'))
      );

      if (!otherAccepted) {
        const updatedCrops = crops.map((c) => {
          if (c.id === targetCrop.id) {
            return {
              ...c,
              status: CROP_STATUS.ACTIVE,
              locked: false,
              selectedMandiId: null,
              selectedMandiName: null,
              selectedOfferId: null,
              tradeId: null,
              agreedRate: null
            };
          }
          return c;
        });
        centralDatabase.setCrops(updatedCrops);
      }
    }

    centralDatabase.appendAudit({
      eventType: 'OFFER_CANCELLED',
      entityId: offerId,
      entityType: 'OFFER',
      actorId: currentUser.id || 'farmer',
      actorName: currentUser.name || 'Farmer',
      actorRole: 'farmer',
      previousStatus: target.status,
      newStatus: OFFER_STATUS.CANCELLED,
      reason: 'Consignment request cancelled by farmer'
    });

    notifyListeners();
  },

  addOfferMessage: (offerId, senderName, senderRole, text) => {
    const offers = centralDatabase.getOffers();
    const updated = offers.map((off) => {
      if (off.id === offerId) {
        const discussion = off.discussion || [];
        return {
          ...off,
          discussion: [
            ...discussion,
            {
              id: 'msg-' + Date.now(),
              senderName: senderName || 'User',
              senderRole: senderRole || 'user',
              text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return off;
    });
    centralDatabase.setOffers(updated);
    notifyListeners();
  },

  getTrades: () => {
    return centralDatabase.getTrades();
  },

  getAudits: () => {
    return centralDatabase.getAudits();
  },

  resetDemoData: () => {
    centralDatabase.resetDemoData();
    notifyListeners();
  }
};

export default liveDataStore;
