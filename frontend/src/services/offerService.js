import apiClient, { USE_MOCK } from './api';
import liveDataStore from './liveDataStore';

export const offerService = {
  getOffers: async (type = 'all') => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      const allOffers = liveDataStore.getOffers();
      if (type === 'all') return allOffers;
      return allOffers.filter(
        (off) => off.type === type || off.status.toLowerCase() === type.toLowerCase()
      );
    }
    return apiClient.get('/offers', { params: { type } });
  },

  createOffer: async (offerData) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 300));
      const created = liveDataStore.createOffer(offerData);
      return created;
    }
    return apiClient.post('/offers', offerData);
  },

  updateOfferStatus: async (offerId, status, counterPrice = null) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      const updated = liveDataStore.updateOfferStatus(offerId, status, counterPrice);
      return updated;
    }
    return apiClient.patch(`/offers/${offerId}`, { status, counterPrice });
  }
};

export default offerService;
