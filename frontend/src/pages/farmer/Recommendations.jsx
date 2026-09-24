import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFarmer } from '../../context/FarmerContext';
import { useAuth } from '../../context/AuthContext';
import recommendationService, { MAHARASHTRA_PRESET_LOCATIONS } from '../../services/recommendationService';
import locationService from '../../services/locationService';
import liveDataStore from '../../services/liveDataStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { Sparkles, MapPin, CheckCircle2, Navigation, ExternalLink, Send, Building2, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const Recommendations = () => {
  const { selectedCrop, farmerLocation, updateCrop, updateLocation } = useFarmer();
  const { user } = useAuth() || {};

  const [crop, setCrop] = useState(selectedCrop?.name || selectedCrop?.crop || 'Onion');
  const [variety, setVariety] = useState(selectedCrop?.variety || 'Standard');
  const [quantityKg, setQuantityKg] = useState(selectedCrop?.quantityKg || 1500);
  const [locationObj, setLocationObj] = useState(farmerLocation || { name: 'Amravati, Maharashtra' });
  
  const [detectingGps, setDetectingGps] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rankedMarkets, setRankedMarkets] = useState([]);
  const [selectedBuyerForOffer, setSelectedBuyerForOffer] = useState(null);

  useEffect(() => {
    if (selectedCrop?.name || selectedCrop?.crop) setCrop(selectedCrop?.name || selectedCrop?.crop);
    if (selectedCrop?.variety) setVariety(selectedCrop.variety);
    if (selectedCrop?.quantityKg) setQuantityKg(selectedCrop.quantityKg);
  }, [selectedCrop]);

  useEffect(() => {
    if (farmerLocation) setLocationObj(farmerLocation);
  }, [farmerLocation]);

  const handleLocationSelect = (presetId) => {
    const found = MAHARASHTRA_PRESET_LOCATIONS.find((l) => l.id === presetId || l.name === presetId);
    if (found) {
      setLocationObj(found);
      updateLocation(found);
    }
  };

  const handleGpsDetect = async () => {
    setDetectingGps(true);
    try {
      const loc = await locationService.getCurrentLocation();
      setLocationObj(loc);
      updateLocation(loc);
    } catch (err) {
      alert('Could not detect GPS location: ' + err.message);
    } finally {
      setDetectingGps(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await recommendationService.getBestMarkets({
        crop,
        variety,
        quantityKg: Number(quantityKg),
        location: locationObj
      });
      setRankedMarkets(res.rankedMarkets || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    updateCrop({ name: crop, variety, quantityKg: Number(quantityKg) });
  }, [crop, variety, quantityKg, locationObj]);

  const handleCreateOffer = (e) => {
    e.preventDefault();
    if (!selectedBuyerForOffer) return;
    const formData = new FormData(e.currentTarget);
    const customRate = Number(formData.get('customRate')) || selectedCrop?.expectedPrice || 6900;
    const notes = formData.get('notes');

    liveDataStore.createOffer({
      cropLotId: selectedCrop?.id,
      buyerId: selectedBuyerForOffer.id || selectedBuyerForOffer.mandiId,
      buyerName: selectedBuyerForOffer.name || selectedBuyerForOffer.companyName || 'APMC Mandi Official',
      loginEmail: selectedBuyerForOffer.email || selectedBuyerForOffer.loginEmail,
      farmerId: user?.id || 'f-1',
      farmerName: user?.name || 'Farmer',
      farmerEmail: user?.email || '',
      crop: crop,
      quantity: `${quantityKg} kg (${quantityKg / 100} Quintals)`,
      offeredPricePerQuintal: customRate,
      totalValue: (customRate * quantityKg) / 100,
      netReturn: (customRate * quantityKg) / 100 - 3195,
      notes: notes || `Farmer consignment request submitted for ${crop} lot at ₹${customRate}/q.`
    });

    setSelectedBuyerForOffer(null);
    alert(`Trade request submitted successfully to ${selectedBuyerForOffer.name || selectedBuyerForOffer.companyName || 'APMC Mandi Official'}! You can view discussion thread in My Offers & Negotiations.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase mb-2 shadow-2xs">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>AI Net Profit Decision Engine</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Mandi Intelligence & Recommended Markets</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Complete analytical breakdown ranked by true Net Profit after deducting freight distance, handling, and APMC commission fees.
        </p>
      </div>

      {/* Input Parameters Box */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Your Crop & Location Details</h3>
          <span className="text-[11px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Auto-synced across portal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
            >
              <option value="Onion">Onion</option>
              <option value="Tomato">Tomato</option>
              <option value="Potato">Potato</option>
              <option value="Paddy">Paddy</option>
              <option value="Cotton">Cotton</option>
              <option value="Chilli">Chilli</option>
              <option value="Wheat">Wheat</option>
              <option value="Maize">Maize</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Variety</label>
            <input
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Harvest Quantity (kg)</label>
            <input
              type="number"
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
            />
          </div>

          {/* Source Location Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Source Location</label>
              <button
                type="button"
                onClick={handleGpsDetect}
                disabled={detectingGps}
                className="text-[10px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" />
                <span>{detectingGps ? 'Detecting...' : 'Detect GPS'}</span>
              </button>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
              <select
                value={locationObj.id || MAHARASHTRA_PRESET_LOCATIONS.find(l => l.name === locationObj.name)?.id || 'amravati'}
                onChange={(e) => handleLocationSelect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
              >
                {MAHARASHTRA_PRESET_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    📍 {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Convenient Find Best Market Action Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 rounded-3xl shadow-lg border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md text-amber-300 flex items-center justify-center shrink-0 border border-white/20 shadow-md">
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-black text-white">Find Best Market for {crop} ({quantityKg} kg)</h4>
            <p className="text-xs text-emerald-100 font-medium mt-0.5">
              Calculate live APMC modal prices, freight transport costs, and net return rankings for <strong>{locationObj.name || 'your farm location'}</strong>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchRecommendations}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg transition-all hover:scale-105 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Find Best Market</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating dynamic freight distances & optimal net returns..." />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recommended Markets</h3>
            <span className="text-xs text-slate-500 font-medium">
              Source: <strong className="text-slate-800">{locationObj.name || locationObj}</strong>
            </span>
          </div>

          {rankedMarkets.map((market, idx) => {
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(locationObj.name || 'Amravati, Maharashtra')}&destination=${encodeURIComponent(market.name + ', Maharashtra')}`;

            return (
              <div
                key={market.id}
                className={`rounded-3xl p-6 shadow-md transition-all ${
                  idx === 0
                    ? 'bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white border border-emerald-500/30'
                    : 'bg-white border border-slate-200/80 text-slate-900 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{market.badge.split(' ')[0]}</div>
                    <div>
                      <span className={`text-xs font-black uppercase tracking-wider ${idx === 0 ? 'text-emerald-200' : 'text-emerald-700'}`}>
                        {market.badge}
                      </span>
                      <h4 className={`text-xl font-black ${idx === 0 ? 'text-white' : 'text-slate-900'}`}>{market.name}</h4>
                      <span className={`text-xs flex items-center gap-1 mt-0.5 font-medium ${idx === 0 ? 'text-emerald-100' : 'text-slate-500'}`}>
                        <MapPin className={`w-3.5 h-3.5 ${idx === 0 ? 'text-emerald-300' : 'text-slate-400'}`} />
                        {market.district}, {market.state} • {market.distanceKm} km away
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className={`p-3 rounded-2xl border text-right ${idx === 0 ? 'bg-white/15 border-white/20' : 'bg-emerald-50 border-emerald-200'}`}>
                      <span className={`text-[11px] uppercase tracking-wider block font-bold ${idx === 0 ? 'text-emerald-100' : 'text-slate-600'}`}>
                        Expected Net Return
                      </span>
                      <span className={`text-2xl font-black ${idx === 0 ? 'text-white' : 'text-emerald-700'}`}>
                        {formatCurrency(market.netReturn)}
                      </span>
                    </div>

                    <Link
                      to={`/farmer/markets/${market.id || 'm-2'}`}
                      className={`p-3 rounded-2xl border font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                        idx === 0 ? 'bg-white text-emerald-900 border-white hover:bg-emerald-50' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-emerald-600'
                      }`}
                    >
                      <span>View Market Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Metrics */}
                <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl border text-xs font-medium mb-4 ${
                  idx === 0 ? 'bg-white/15 border-white/20' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className={idx === 0 ? 'text-emerald-100 block' : 'text-slate-500 block'}>Headline Modal Price:</span>
                    <strong className={`text-sm ${idx === 0 ? 'text-white font-black' : 'text-slate-900 font-extrabold'}`}>{formatCurrency(market.modalPrice)}/q</strong>
                  </div>
                  <div>
                    <span className={idx === 0 ? 'text-emerald-100 block' : 'text-slate-500 block'}>Freight Transport Cost:</span>
                    <strong className={`text-sm ${idx === 0 ? 'text-amber-300 font-black' : 'text-amber-700 font-extrabold'}`}>{formatCurrency(market.transportCost)}</strong>
                  </div>
                  <div>
                    <span className={idx === 0 ? 'text-emerald-100 block' : 'text-slate-500 block'}>Gross Market Value:</span>
                    <strong className={`text-sm ${idx === 0 ? 'text-white font-black' : 'text-slate-800 font-extrabold'}`}>{formatCurrency(market.grossRevenue)}</strong>
                  </div>
                  <div>
                    <span className={idx === 0 ? 'text-emerald-100 block' : 'text-slate-500 block'}>Mandi Trend:</span>
                    <strong className={`text-sm ${idx === 0 ? 'text-white font-black' : 'text-emerald-700 font-extrabold'}`}>↑ +{market.trendPercent || 3.5}%</strong>
                  </div>
                </div>

                {/* Explanation & Trade Action */}
                <div className={`rounded-2xl p-3.5 border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-medium ${
                  idx === 0 ? 'bg-white/20 border-white/20 text-emerald-50' : 'bg-emerald-50/70 border-emerald-200 text-slate-700'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${idx === 0 ? 'text-emerald-200' : 'text-emerald-700'}`} />
                    <div>
                      <span className={`font-bold block mb-0.5 ${idx === 0 ? 'text-white' : 'text-slate-900'}`}>Why this market?</span>
                      <p>{market.explanation}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedBuyerForOffer({
                      id: market.id,
                      name: market.name,
                      companyName: market.name,
                      email: market.email,
                      district: market.district,
                      state: market.state
                    })}
                    className="bg-emerald-950 hover:bg-slate-900 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Request Trade Offer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Request Trade Offer */}
      {selectedBuyerForOffer && (
        <Modal
          isOpen={!!selectedBuyerForOffer}
          onClose={() => setSelectedBuyerForOffer(null)}
          title={`Request Trade Offer from ${selectedBuyerForOffer.name}`}
        >
          <form onSubmit={handleCreateOffer} className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs font-medium space-y-1">
              <div className="flex justify-between">
                <span>Selected Mandi Yard:</span>
                <strong className="text-slate-900 font-bold">{selectedBuyerForOffer.name}</strong>
              </div>
              <div className="flex justify-between">
                <span>Crop Lot:</span>
                <strong className="text-emerald-800 font-bold">{crop} ({quantityKg} kg / {quantityKg / 100} Quintals)</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Requested Rate per Quintal (₹ / q)
              </label>
              <input
                type="number"
                name="customRate"
                defaultValue={selectedCrop?.expectedPrice || 4170}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-black focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Notes / Terms for Mandi Official
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="e.g. Grade A premium quality lot ready for immediate gate delivery..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBuyerForOffer(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Trade Request</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Recommendations;
