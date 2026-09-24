import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFarmer } from '../../context/FarmerContext';
import marketService from '../../services/marketService';
import priceService from '../../services/priceService';
import recommendationService from '../../services/recommendationService';
import PriceChart from '../../components/dashboard/PriceChart';
import ProfitCard from '../../components/dashboard/ProfitCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SendOfferModal from '../../components/modals/SendOfferModal';
import LiveRouteMap from '../../components/dashboard/LiveRouteMap';
import { calculateCropProfit } from '../../utils/profitEngine';
import { MapPin, Navigation, Clock, ShieldCheck, CheckCircle2, ArrowLeft, Sprout, ExternalLink, Compass } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const DEFAULT_CROP = { name: 'Potato', variety: 'Kufri Jyoti', quantityKg: 1000 };
const DEFAULT_LOCATION = { name: 'Nashik, Maharashtra', district: 'Nashik', state: 'Maharashtra', lat: 20.0059, lng: 73.7898 };

const MANDI_COORDINATES = {
  'm-1': { lat: 20.1472, lng: 74.2306, manager: 'Shri D. B. Patil (Yard In-charge)', phone: '+91 94222 10002' },
  'm-2': { lat: 20.0059, lng: 73.7898, manager: 'Shri R. K. Pawar (APMC Officer)', phone: '+91 94222 10005' },
  'm-3': { lat: 20.1714, lng: 73.9875, manager: 'Shri K. T. Jadhav (Procurement Officer)', phone: '+91 94222 10003' },
  'm-4': { lat: 18.4975, lng: 73.8654, manager: 'Shri V. R. Shinde (APMC Yard Manager)', phone: '+91 94222 10001' },
  'm-5': { lat: 19.0748, lng: 73.0035, manager: 'Shri A. P. More (General Manager)', phone: '+91 94222 10004' },
  'm-6': { lat: 21.1625, lng: 79.1240, manager: 'Shri S. M. Deshmukh (Secretary)', phone: '+91 94222 10006' },
  'm-7': { lat: 17.6599, lng: 75.9064, manager: 'Shri P. B. Gaikwad (APMC Manager)', phone: '+91 94222 10007' },
  'm-8': { lat: 16.7050, lng: 74.2433, manager: 'Shri N. R. Kulkarni (Yard Officer)', phone: '+91 94222 10008' },
  'm-11': { lat: 20.9374, lng: 77.7796, manager: 'Shri M. L. Joshi (APMC Officer)', phone: '+91 94222 10009' }
};

export const MarketDetails = () => {
  const { marketId } = useParams();
  const navigate = useNavigate();
  const { selectedCrop, farmerLocation } = useFarmer() || {};

  const safeCrop = selectedCrop && selectedCrop.name ? selectedCrop : DEFAULT_CROP;
  const safeLocation = farmerLocation && farmerLocation.name ? farmerLocation : DEFAULT_LOCATION;

  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [range, setRange] = useState('7d');
  const [profitDetails, setProfitDetails] = useState(null);
  const [isSendOfferOpen, setIsSendOfferOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const cropName = safeCrop.name || 'Potato';
        const quantityKg = Number(safeCrop.quantityKg) || 1000;

        const recoRes = await recommendationService.getBestMarkets({
          crop: cropName,
          quantityKg,
          location: safeLocation
        }).catch(() => ({ rankedMarkets: [] }));

        const rankedList = recoRes?.rankedMarkets || [];
        let matched = rankedList.find((m) => m.id === marketId);

        if (!matched) {
          matched = await marketService.getMarketById(marketId).catch(() => null);
        }

        const pRes = await priceService.getHistoricalPrices({
          crop: cropName,
          market: matched?.name || 'APMC Mandi Yard',
          period: range
        }).catch(() => ({ chartData: [] }));

        const modalPrice = Number(matched?.modalPrice) || 2291;
        const distanceKm = Number(matched?.distanceKm) || 25;

        const fin = calculateCropProfit({
          quantityKg,
          modalPrice,
          distanceKm,
          commissionPercent: matched?.commissionPercent || 2
        });

        const roiPercent = ((fin.netReturn - (fin.transportCost + fin.handlingCost)) / (fin.transportCost + fin.handlingCost)) * 100;

        const pDetails = {
          ...fin,
          roiPercent: Math.max(0, roiPercent)
        };

        const mCoordInfo = MANDI_COORDINATES[marketId] || {
          lat: 18.4975,
          lng: 73.8654,
          manager: 'APMC Yard Manager',
          phone: '+91 94222 10001'
        };

        if (isMounted) {
          setMarket({
            ...(matched || {}),
            ...mCoordInfo,
            id: marketId,
            name: matched?.name || 'APMC Mandi Yard',
            district: matched?.district || 'Nashik',
            state: matched?.state || 'Maharashtra',
            distanceKm,
            transportCost: fin.transportCost,
            expectedNetReturn: fin.netReturn
          });
          setProfitDetails(pDetails);
          setPriceHistory(pRes?.chartData || []);
        }
      } catch (err) {
        console.error('MarketDetails fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [marketId, range, safeCrop.name, safeCrop.quantityKg, safeLocation.name]);

  if (loading || !market || !profitDetails) {
    return <LoadingSpinner message="Calculating market logistics and price history..." />;
  }

  const mapDirectionUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(safeLocation.name)}&destination=${market.lat || 18.4975},${market.lng || 73.8654}&travelmode=driving`;

  return (
    <div className="space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 font-bold bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>← Back to Previous Page</span>
        </button>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <Link to="/farmer/dashboard" className="text-slate-500 hover:text-slate-900">
            Farmer Dashboard
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/farmer/markets" className="text-emerald-700 hover:underline font-bold">
            All Mandi Prices
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Government APMC Regulated Yard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{market.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {market.district}, {market.state}
            </span>
            <span className="flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              Distance from {safeLocation.name}: <strong className="text-slate-900">{profitDetails.distanceKm} km</strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Hours: {market.operatingHours || '05:00 AM - 06:00 PM'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <a
            href={mapDirectionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs px-4 py-3 rounded-2xl transition-all shadow-2xs"
          >
            <Compass className="w-4 h-4 text-emerald-600 animate-spin-slow" />
            <span>Navigate to Mandi Yard (Live GPS)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => setIsSendOfferOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-xs transition-all hover:scale-105"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Request Mandi Owner</span>
          </button>
        </div>
      </div>

      {/* Embedded Live Google Maps Route Visualizer */}
      <LiveRouteMap
        mandiName={market.name}
        mandiId={market.id}
        originName={safeLocation.name}
        originCoords={{ lat: safeLocation.lat || 20.0059, lng: safeLocation.lng || 73.7898 }}
        destCoords={{ lat: market.lat || 18.4975, lng: market.lng || 73.8654 }}
        distanceKm={profitDetails.distanceKm}
        transportCost={profitDetails.transportCost}
        managerName={market.manager}
        phone={market.phone}
        operatingHours={market.operatingHours}
      />

      {/* Active Crop Context Banner */}
      <div className="bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-2xl text-xs text-emerald-900 font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Analyzing <strong>{safeCrop.name} ({safeCrop.variety || 'Standard'})</strong> • {safeCrop.quantityKg} kg ({(safeCrop.quantityKg / 100).toFixed(1)} Quintals) for farmer at <strong>{safeLocation.name}</strong></span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 block font-bold uppercase">Modal Price</span>
          <span className="text-2xl font-black text-slate-900">{formatCurrency(profitDetails.modalPrice)}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">Live Agmarknet Feed • Today</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 block font-bold uppercase">Min - Max Band</span>
          <span className="text-lg font-bold text-slate-800">
            {formatCurrency(market.minPrice || profitDetails.modalPrice - 200)} - {formatCurrency(market.maxPrice || profitDetails.modalPrice + 250)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">Per Quintal (100 kg)</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 block font-bold uppercase">Est. Freight Transport</span>
          <span className="text-2xl font-black text-amber-600">{formatCurrency(profitDetails.transportCost)}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">₹20/km for {safeCrop.quantityKg} kg</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-2xs">
          <span className="text-xs text-emerald-800 block font-bold uppercase">Estimated Net Return</span>
          <span className="text-2xl font-black text-emerald-700">{formatCurrency(profitDetails.netReturn)}</span>
          <span className="text-[11px] text-slate-600 block mt-0.5 font-semibold">Net Profit after all costs</span>
        </div>
      </div>

      {/* Grid: Historical Price Chart + Profit Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart
            data={priceHistory}
            title={`${market.name} (${safeCrop.name}) Historical Price Movement`}
            currentRange={range}
            onRangeChange={(r) => setRange(r)}
          />
        </div>

        <div>
          <ProfitCard result={profitDetails} />
        </div>
      </div>

      {/* Modal for Requesting Mandi Owner */}
      <SendOfferModal
        isOpen={isSendOfferOpen}
        onClose={() => setIsSendOfferOpen(false)}
        buyer={{
          id: market.id,
          companyName: market.name,
          name: market.name,
          cropRequired: safeCrop.name,
          offerPrice: profitDetails.modalPrice
        }}
        onOfferSent={() => navigate('/farmer/buyers')}
      />
    </div>
  );
};

export default MarketDetails;
