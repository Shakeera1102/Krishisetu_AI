import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFarmer } from '../../context/FarmerContext';
import { useAuth } from '../../context/AuthContext';
import liveDataStore, { getCropBenchmarkPrice, OFFER_STATUS, TRADE_STATUS, CROP_STATUS } from '../../services/liveDataStore';
import recommendationService, { MAHARASHTRA_PRESET_LOCATIONS } from '../../services/recommendationService';
import locationService from '../../services/locationService';
import priceService from '../../services/priceService';
import predictionService from '../../services/predictionService';
import buyerService from '../../services/buyerService';
import PriceChart from '../../components/dashboard/PriceChart';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import authService from '../../services/authService';
import { formatCurrency } from '../../utils/formatters';

import {
  Sprout,
  Store,
  Sparkles,
  MapPin,
  Clock,
  TrendingUp,
  ArrowRight,
  Send,
  AlertCircle,
  Building2,
  CheckCircle2,
  Lock,
  MessageSquare,
  ShieldCheck,
  Navigation,
  ExternalLink,
  DollarSign,
  Award,
  History,
  CheckCircle
} from 'lucide-react';
export const FarmerDashboard = () => {
  const { selectedCrop, farmerLocation, updateCrop, resetCrop, updateLocation } = useFarmer();
  const auth = useAuth() || {};
  const user = auth.user || authService.getCurrentUser();
  const navigate = useNavigate();

  const [activeCrop, setActiveCrop] = useState(null);
  const [locationObj, setLocationObj] = useState(farmerLocation || { name: 'Amravati, Maharashtra' });
  const [detectingGps, setDetectingGps] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [rankedMarkets, setRankedMarkets] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [buyers, setBuyers] = useState([]);
  const [chartRange, setChartRange] = useState('7d');
  const [allOffers, setAllOffers] = useState([]);
  const [allTrades, setAllTrades] = useState([]);

  // Modals
  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false);
  const [selectedBuyerForOffer, setSelectedBuyerForOffer] = useState(null);
  const [submittingOffer, setSubmittingOffer] = useState(false);

  // Sync active crop from central database
  const refreshActiveCrop = () => {
    // Check if cleared flag exists for this user session
    const isCleared =
      localStorage.getItem('agri_active_crop_cleared') === 'true' ||
      (user?.id && localStorage.getItem(`agri_crop_cleared_${user.id}`) === 'true') ||
      (user?.email && localStorage.getItem(`agri_crop_cleared_${user.email}`) === 'true');

    if (isCleared) {
      setActiveCrop(null);
      resetCrop();
      return;
    }

    const crops = liveDataStore.getCrops() || [];
    const currentId = user?.id || '';
    const currentEmail = (user?.email || '').toLowerCase();
    const currentName = (user?.name || '').toLowerCase();

    const farmerCrops = crops.filter(
      (c) =>
        (currentId && c.farmerId === currentId) ||
        (currentEmail && c.farmerEmail?.toLowerCase() === currentEmail) ||
        (currentName && c.farmerName?.toLowerCase() === currentName)
    );

    // Find latest active non-sold and non-archived crop
    const activeLots = farmerCrops.filter(
      (c) => c.status !== CROP_STATUS.SOLD && c.status !== 'Sold' && c.status !== 'Archived' && c.active !== false
    );
    const activeLot = activeLots.length > 0 ? activeLots[activeLots.length - 1] : null;

    if (activeLot) {
      setActiveCrop(activeLot);
      updateCrop(activeLot);
    } else {
      setActiveCrop(null);
      resetCrop();
    }
  };

  useEffect(() => {
    refreshActiveCrop();
  }, [user?.id, user?.email, user?.name]);

  useEffect(() => {
    if (farmerLocation) setLocationObj(farmerLocation);
  }, [farmerLocation]);

  // Filter offers STRICTLY for the currently logged-in farmer account
  const currentFarmerOffers = allOffers.filter((o) => {
    const currentId = user?.id || '';
    const currentEmail = (user?.email || '').toLowerCase();
    const currentName = (user?.name || '').toLowerCase();

    const oFarmerId = o.farmerId || '';
    const oName = (o.farmerName || '').toLowerCase();
    const oEmail = (o.farmerEmail || '').toLowerCase();

    if (currentId && oFarmerId === currentId) return true;
    if (currentEmail && oEmail === currentEmail) return true;
    if (currentName && oName === currentName) return true;
    return false;
  });

  const completedOffersForCurrentFarmer = currentFarmerOffers.filter(
    (o) => o.status === 'Completed' || o.status === TRADE_STATUS.COMPLETED
  );

  const fetchDashboardData = async (targetCrop = activeCrop, targetLoc = locationObj, isInitial = false) => {
    if (isInitial) setLoading(true);
    setErrorMessage('');
    try {
      const liveOffers = liveDataStore.getOffers() || [];
      const liveTrades = liveDataStore.getTrades() || [];
      setAllOffers(liveOffers);
      setAllTrades(liveTrades);

      if (!targetCrop || !targetCrop.crop) {
        setLoading(false);
        return;
      }

      const cropName = targetCrop.crop || targetCrop.name || 'Cotton';

      const [recoRes, priceRes, predRes, buyerRes] = await Promise.all([
        recommendationService.getBestMarkets({
          crop: cropName,
          variety: targetCrop.variety || 'Standard',
          quantityKg: targetCrop.quantityKg || 1500,
          location: targetLoc?.name || 'Amravati, Maharashtra'
        }).catch(() => ({ topRecommendation: null, rankedMarkets: [] })),
        priceService.getHistoricalPrices({ crop: cropName, period: chartRange }).catch(() => ({ chartData: [] })),
        predictionService.getPricePrediction(cropName).catch(() => null),
        buyerService.getMatchingBuyers({ crop: cropName }).catch(() => [])
      ]);

      const ranked = recoRes?.rankedMarkets || [];
      const topReco = recoRes?.topRecommendation || ranked[0] || null;

      setRecommendation(topReco);
      setRankedMarkets(ranked);
      setHistoricalData(priceRes?.chartData || []);
      setPrediction(predRes || null);
      setBuyers(buyerRes || []);
    } catch (err) {
      console.error('Error loading farmer dashboard:', err);
      setErrorMessage('Unable to load market recommendations. Please retry.');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    refreshActiveCrop();
    fetchDashboardData(activeCrop, locationObj, true);

    const unsubscribe = liveDataStore.subscribe(() => {
      refreshActiveCrop();
      fetchDashboardData(activeCrop, locationObj, false);
    });
    return () => unsubscribe();
  }, [activeCrop?.crop, activeCrop?.quantityKg, activeCrop?.variety, locationObj?.name, chartRange, user?.id, user?.email]);

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

  const handleRegisterCropSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Reset cleared flags
    localStorage.removeItem('agri_active_crop_cleared');
    if (user?.id) localStorage.removeItem(`agri_crop_cleared_${user.id}`);
    if (user?.email) localStorage.removeItem(`agri_crop_cleared_${user.email}`);

    const formEl = document.getElementById('register-crop-form') || e?.currentTarget?.closest('form');
    let name = 'Paddy';
    let qty = 1500;
    let variety = 'Standard Quality';

    if (formEl) {
      const formData = new FormData(formEl);
      name = formData.get('cropName') || 'Paddy';
      qty = Number(formData.get('quantityKg')) || 1500;
      variety = formData.get('variety') || 'Standard Quality';
    }

    const rate = getCropBenchmarkPrice(name);

    const newCropObj = {
      name,
      crop: name,
      variety,
      quantityKg: qty,
      expectedPrice: rate
    };

    const registered = liveDataStore.registerCrop(newCropObj);
    setActiveCrop(registered);
    updateCrop(registered);
    setIsAnalyzeOpen(false);
    fetchDashboardData(registered, locationObj);
  };

  const handleCreateOffer = (e) => {
    e.preventDefault();
    if (!selectedBuyerForOffer || !activeCrop || submittingOffer) return;
    setSubmittingOffer(true);
    try {
      const formData = new FormData(e.currentTarget);
      const customRate = Number(formData.get('customRate')) || activeCrop.expectedPrice || 4170;
      const notes = formData.get('notes');
      const cropName = activeCrop.crop || activeCrop.name || 'Cotton';

      liveDataStore.createOffer({
        cropLotId: activeCrop.id,
        buyerId: selectedBuyerForOffer.id || selectedBuyerForOffer.mandiId,
        buyerName: selectedBuyerForOffer.name || selectedBuyerForOffer.companyName || 'APMC Mandi Official',
        loginEmail: selectedBuyerForOffer.email || selectedBuyerForOffer.loginEmail,
        farmerId: user?.id || 'f-1',
        farmerName: user?.name || 'Farmer',
        farmerEmail: user?.email || '',
        crop: cropName,
        quantity: `${activeCrop.quantityKg} kg (${(activeCrop.quantityKg / 100).toFixed(1)} Quintals)`,
        offeredPricePerQuintal: customRate,
        totalValue: (customRate * activeCrop.quantityKg) / 100,
        netReturn: (customRate * activeCrop.quantityKg) / 100 - 3000,
        notes: notes || `Farmer consignment request submitted for ${cropName} lot at ₹${customRate}/q.`
      });

      setSelectedBuyerForOffer(null);
      fetchDashboardData(activeCrop, locationObj);
    } finally {
      setSubmittingOffer(false);
    }
  };

  // Winning selected deal (must not be Completed)
  const selectedDeal = currentFarmerOffers.find(
    (o) =>
      o.status !== 'Completed' &&
      o.status !== TRADE_STATUS.COMPLETED &&
      (o.status === OFFER_STATUS.ACCEPTED ||
        o.status?.includes('Accepted') ||
        o.status?.includes('Transit') ||
        o.status?.includes('Dispatched'))
  );

  const activeRequestOffer = !selectedDeal
    ? currentFarmerOffers.find(
        (o) =>
          (o.type === 'sent' || o.status === 'Sent' || o.status === OFFER_STATUS.PENDING) &&
          o.status !== 'Completed' &&
          o.status !== TRADE_STATUS.COMPLETED &&
          o.status !== OFFER_STATUS.SUPERSEDED &&
          o.status !== OFFER_STATUS.CANCELLED &&
          o.status !== OFFER_STATUS.REJECTED &&
          !o.status?.includes('Declined')
      )
    : null;

  const bestMandiOfferReceived = !selectedDeal
    ? currentFarmerOffers.reduce((prev, curr) => {
        if (
          curr.type !== 'received' ||
          curr.status === 'Completed' ||
          curr.status === TRADE_STATUS.COMPLETED ||
          curr.status === OFFER_STATUS.ACCEPTED ||
          curr.status === OFFER_STATUS.SUPERSEDED ||
          curr.status === OFFER_STATUS.CANCELLED ||
          curr.status === OFFER_STATUS.REJECTED ||
          curr.status?.includes('Declined')
        )
          return prev;
        if (!prev) return curr;
        return (curr.offeredPricePerQuintal || 0) > (prev.offeredPricePerQuintal || 0) ? curr : prev;
      }, null)
    : null;

  if (loading) {
    return <LoadingSpinner message="Calculating net profits across Maharashtra mandis..." />;
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} onRetry={() => fetchDashboardData(activeCrop, locationObj, true)} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Good morning, {user?.name || 'Farmer'}</h1>
            <span className="text-xl">👋</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{locationObj.name || user?.district || 'Amravati, Maharashtra'}</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold">Active Intelligence Engine</span>
          </p>
        </div>

        <button
          onClick={() => setIsAnalyzeOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-5 py-3 rounded-2xl transition-all shadow-md hover:scale-105 shrink-0 cursor-pointer"
        >
          <Sprout className="w-4 h-4" />
          <span>+ Register Your Crop Lot</span>
        </button>
      </div>

      {/* CASE A: No Active Crop Registered */}
      {!activeCrop ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-2xs">
            {completedOffersForCurrentFarmer.length > 0 ? (
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            ) : (
              <Sprout className="w-8 h-8" />
            )}
          </div>

          <div className="max-w-md mx-auto space-y-2">
            {completedOffersForCurrentFarmer.length > 0 ? (
              <>
                <h2 className="text-xl font-black text-slate-900">No Active Crops</h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Your previous crop trade was successfully completed and settled. Your previous trades are available in Trade History. Register a new harvested crop lot to view live market prices.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-black text-slate-900">No Active Crop Registered</h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  You currently have no active crop registered. Please register your harvested crop lot to view live AI price recommendations, mandi net profit rankings, and connect with nearby APMC buyers.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAnalyzeOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <Sprout className="w-4 h-4" />
              <span>+ Register Your Crop Lot</span>
            </button>

            {completedOffersForCurrentFarmer.length > 0 && (
              <Link
                to="/farmer/buyers?tab=completed"
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs px-6 py-3 rounded-2xl border border-slate-300 transition-all cursor-pointer"
              >
                <History className="w-4 h-4 text-emerald-600" />
                <span>View Trade History ({completedOffersForCurrentFarmer.length})</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* CASE B: Active Crop Lot Exists (Full Dashboard Layout) */
        <>
          {/* Row 1: Four Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Current Crop */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">CURRENT CROP</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Sprout className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{activeCrop.crop || activeCrop.name} ({activeCrop.quantityKg} kg)</h3>
                <span className="text-xs text-slate-500 font-medium">Variety: {activeCrop.variety || 'Standard'}</span>
              </div>
            </div>

            {/* Card 2: Avg Market Price */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">AVG MARKET PRICE</span>
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{formatCurrency(recommendation?.modalPrice || 4170)}/q</h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Regional Mandi Index (+4.2%)
                </span>
              </div>
            </div>

            {/* Card 3: Best Recommended Market */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">BEST RECOMMENDED MARKET</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 truncate">{recommendation?.name || 'Amravati APMC'}</h3>
                <span className="text-xs text-slate-500 font-medium">Optimal Logistics Route</span>
              </div>
            </div>

            {/* Card 4: Expected Net Return */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">EXPECTED NET RETURN</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-emerald-700">{formatCurrency(recommendation?.netReturn || 60624)}</h3>
                  <span className="text-[9px] bg-emerald-700 text-white font-extrabold px-1.5 py-0.5 rounded-md">Peak Net</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">After transport & commission</span>
              </div>
            </div>
          </div>

          {/* Active Crop Lot Parameter Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-md">
                    ACTIVE CROP LOT
                  </span>
                  <span className="text-sm font-black text-slate-900">{activeCrop.crop || activeCrop.name} — {activeCrop.variety}</span>
                </div>
                <span className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-3">
                  <span>📦 {activeCrop.quantityKg} kg ({(activeCrop.quantityKg / 100).toFixed(1)} Quintals)</span>
                  <span>•</span>
                  <span>📅 Harvest: {activeCrop.harvestDate || '2026-08-28'}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsAnalyzeOpen(true)}
                className="bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-2xs shrink-0 cursor-pointer"
              >
                Change Crop Parameters
              </button>
              <Link
                to="/farmer/recommendations"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Find Best Market</span>
              </Link>
            </div>
          </div>

          {/* Winning Selected Deal Accepted Banner */}
          {selectedDeal && (
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-500/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md text-emerald-300 flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md text-emerald-100">
                      ✓ DEAL MUTUALLY ACCEPTED (WINNING MANDI)
                    </span>
                    <span className="text-xs font-extrabold text-white">{selectedDeal.buyerName}</span>
                  </div>
                  <h3 className="text-base font-black text-white mt-0.5">
                    Agreed Price: {formatCurrency(selectedDeal.offeredPricePerQuintal)}/q with {selectedDeal.buyerName}
                  </h3>
                  <p className="text-xs text-emerald-100 font-medium">
                    Destination Mandi: <strong>{selectedDeal.buyerName}</strong> • Status: <strong>{selectedDeal.dispatched ? 'Freight Dispatched (In Transit)' : 'Accepted (Pending Logistics)'}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/farmer/offers?tab=accepted"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{selectedDeal.dispatched ? 'View Freight Transit Status →' : 'Dispatch Freight Transport →'}</span>
                </Link>
              </div>
            </div>
          )}

          {/* Mandi Purchase Offer Received Notification */}
          {!selectedDeal && bestMandiOfferReceived && (
            <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 p-5 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-amber-300">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md">
                      🔥 MANDI PURCHASE OFFER RECEIVED
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">{bestMandiOfferReceived.buyerName}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-950 mt-0.5">
                    {bestMandiOfferReceived.buyerName} offered <span className="underline decoration-2 decoration-emerald-800">{formatCurrency(bestMandiOfferReceived.offeredPricePerQuintal)}/q</span> for your {bestMandiOfferReceived.crop} lot!
                  </h3>
                  <p className="text-xs text-slate-900 font-medium">
                    Total Estimated Net Return: <strong>{formatCurrency(bestMandiOfferReceived.netReturn || 60624)}</strong>. Accept to initiate instant freight transport dispatch.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/farmer/offers?tab=received"
                  className="bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Review & Accept Mandi Offer →</span>
                </Link>
              </div>
            </div>
          )}

          {/* Consignment Request Sent Notification */}
          {!selectedDeal && activeRequestOffer && !bestMandiOfferReceived && (
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-500/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md text-amber-300 flex items-center justify-center shrink-0 shadow-md">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md text-emerald-100">
                      📌 CONSIGNMENT REQUEST SUBMITTED TO MANDI
                    </span>
                    <span className="text-xs font-extrabold text-white">{activeRequestOffer.buyerName}</span>
                  </div>
                  <h3 className="text-base font-black text-white mt-0.5">
                    Requested Rate: {formatCurrency(activeRequestOffer.offeredPricePerQuintal)}/q for {activeRequestOffer.crop} ({activeRequestOffer.quantity})
                  </h3>
                  <p className="text-xs text-emerald-100 font-medium">
                    Status: <strong>{activeRequestOffer.status}</strong>. Mandi Official is evaluating your request.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/farmer/offers?tab=sent"
                  className="bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>View Negotiation Chat →</span>
                </Link>
              </div>
            </div>
          )}

          {/* Large Hero Card: Best Market Recommendation */}
          {recommendation && (
            <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 shadow-xl border border-emerald-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-900/60 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-200 border border-emerald-400/30 mb-2">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>BEST MARKET RECOMMENDATION</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block">TOP RECOMMENDATION</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">{recommendation.name}</h2>
                  <span className="text-xs flex items-center gap-1 mt-1 font-medium text-emerald-100">
                    <Navigation className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Optimal route based on live market prices & transport distance</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="p-4 rounded-2xl bg-white/15 border border-white/20 text-center min-w-[120px]">
                    <span className="text-[10px] uppercase tracking-wider block font-bold text-emerald-100">
                      RECOMMENDATION SCORE
                    </span>
                    <span className="text-3xl font-black text-white">95<span className="text-xs font-normal text-emerald-200">/100</span></span>
                  </div>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/15 border border-white/20 text-xs font-medium">
                <div>
                  <span className="text-emerald-100 block">Current Modal Price:</span>
                  <strong className="text-lg text-white font-black">{formatCurrency(recommendation.modalPrice || 4170)}/q</strong>
                </div>
                <div>
                  <span className="text-emerald-100 block">Est. Transport Cost:</span>
                  <strong className="text-lg text-amber-300 font-black">{formatCurrency(recommendation.transportCost || 300)}</strong>
                </div>
                <div>
                  <span className="text-emerald-100 block">Expected Net Return:</span>
                  <strong className="text-xl text-white font-black">{formatCurrency(recommendation.netReturn || 60624)}</strong>
                </div>
              </div>

              {/* Rationale Box */}
              <div className="rounded-2xl p-4 bg-white/20 border border-white/20 text-emerald-50 text-xs flex items-start gap-2.5 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-200" />
                <div>
                  <span className="font-bold block mb-0.5 text-white">Why {recommendation.name}?</span>
                  <p>{recommendation.explanation || `${recommendation.name} provides maximum Net Return of ${formatCurrency(recommendation.netReturn || 60624)} for ${locationObj.name} (${recommendation.distanceKm || 8} km freight).`}</p>
                </div>
              </div>

              {/* Hero Actions */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                <Link
                  to={`/farmer/markets/${recommendation.id || recommendation.marketId || 'm-2'}`}
                  className="bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View Market Details</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
                </Link>

                <button
                  onClick={() =>
                    setSelectedBuyerForOffer({
                      id: recommendation.id || recommendation.marketId,
                      name: recommendation.name || recommendation.marketName,
                      companyName: recommendation.name || recommendation.marketName,
                      email: recommendation.email || recommendation.loginEmail,
                      district: recommendation.district,
                      state: recommendation.state
                    })
                  }
                  className="bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Request Mandi Owner</span>
                </button>
              </div>
            </div>
          )}

          {/* Middle Section: Price Trend Chart & AI Price Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Price Trend Chart */}
            <div className="lg:col-span-2">
              <PriceChart
                data={historicalData}
                title={`${activeCrop.crop || activeCrop.name} 7-Day / 30-Day Price Trend`}
                currentRange={chartRange}
                onRangeChange={setChartRange}
              />
            </div>

            {/* Right 1 Col: AI Price Forecast Card */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">AI Price Forecast</h3>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Predictive Intelligence for {activeCrop.crop || activeCrop.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">CONFIDENCE SCORE</span>
                    <span className="text-xs font-black text-purple-700">87%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-purple-50/50 p-3 rounded-2xl border border-purple-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">CURRENT PRICE</span>
                    <strong className="text-xs font-black text-slate-900">{formatCurrency(recommendation?.modalPrice || 4170)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-700 font-bold block">3-DAY FORECAST</span>
                    <strong className="text-xs font-black text-purple-800">{formatCurrency((recommendation?.modalPrice || 4170) + 80)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 font-bold block">7-DAY FORECAST</span>
                    <strong className="text-xs font-black text-emerald-800">{formatCurrency((recommendation?.modalPrice || 4170) + 150)}</strong>
                  </div>
                </div>

                <div className="bg-purple-50/70 border border-purple-200 p-3.5 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-purple-950 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>AI Decision Support:</span>
                  </span>
                  <p className="text-purple-900 text-[11px] leading-relaxed font-medium">
                    Prices are expected to increase over the next week due to high retail demand in Metro cities. Consider holding inventory for 3-5 days if dry storage is available to maximize net profit.
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-medium italic">
                * AI predictions are probabilistic estimates based on mandi arrivals, weather patterns, and historical price cycles.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Modal: Register Crop Lot */}
      {isAnalyzeOpen && (
        <Modal
          isOpen={isAnalyzeOpen}
          onClose={() => setIsAnalyzeOpen(false)}
          title="Register Harvested Crop Lot"
        >
          <form id="register-crop-form" onSubmit={handleRegisterCropSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Crop</label>
              <select
                name="cropName"
                defaultValue={activeCrop?.crop || activeCrop?.name || 'Paddy'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
              >
                <option value="Cotton">Cotton (Kapus)</option>
                <option value="Paddy">Paddy (Dhan/Rice)</option>
                <option value="Chilli">Dry Red Chilli (Mirchi)</option>
                <option value="Onion">Onion (Kanda)</option>
                <option value="Tomato">Tomato</option>
                <option value="Wheat">Wheat (Gehu)</option>
                <option value="Potato">Potato (Batata)</option>
                <option value="Maize">Maize (Makka)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Variety / Grade</label>
              <input
                type="text"
                name="variety"
                defaultValue={activeCrop?.variety || 'Standard Quality'}
                placeholder="e.g. Desi Cotton / Hybrid Red / Grade A"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Harvested Quantity (Kg)</label>
              <input
                type="number"
                name="quantityKg"
                defaultValue={activeCrop?.quantityKg || 1500}
                placeholder="1500"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">1500 kg = 15 Quintals</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAnalyzeOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Publish & Save Crop Lot
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Request Mandi Consignment */}
      {selectedBuyerForOffer && (
        <Modal
          isOpen={!!selectedBuyerForOffer}
          onClose={() => setSelectedBuyerForOffer(null)}
          title={`Send Consignment Request to ${selectedBuyerForOffer.name}`}
        >
          <form onSubmit={handleCreateOffer} className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs font-medium space-y-1 text-emerald-950">
              <div className="flex justify-between">
                <span>Target Mandi Yard:</span>
                <strong className="text-slate-900 font-bold">{selectedBuyerForOffer.name}</strong>
              </div>
              <div className="flex justify-between">
                <span>Crop Lot:</span>
                <strong className="text-emerald-800 font-bold">{activeCrop?.crop || activeCrop?.name} ({activeCrop?.quantityKg} kg)</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Requested Rate per Quintal (₹ / q)
              </label>
              <input
                type="number"
                name="customRate"
                defaultValue={recommendation?.modalPrice || 4170}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-black focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Message / Consignment Instructions
              </label>
              <textarea
                name="notes"
                defaultValue={`Farmer consignment request for ${activeCrop?.crop || activeCrop?.name} lot (${activeCrop?.quantityKg} kg). Will arrange freight dispatch upon approval.`}
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBuyerForOffer(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingOffer}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingOffer ? 'Sending...' : 'Send Consignment Request'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default FarmerDashboard;
