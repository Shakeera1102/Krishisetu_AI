import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import marketService from '../services/marketService';
import {
  Sprout,
  Sparkles,
  Store,
  Users,
  Calculator,
  Search,
  MapPin,
  TrendingUp,
  TrendingDown,
  Clock,
  Truck,
  ArrowRight,
  Building2
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const MAHARASHTRA_PHOTOS = [
  'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80'
];

export const LandingPage = () => {
  const [markets, setMarkets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchPublicMarkets = async () => {
    setLoading(true);
    try {
      const res = await marketService.getCurrentPrices({
        search: searchQuery,
        crop: selectedCrop,
        pageSize: 100
      });
      setMarkets(res.data || res || []);
    } catch (err) {
      console.error('Error fetching live mandis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicMarkets();
  }, [searchQuery, selectedCrop]);

  const scrollToMandiSection = () => {
    const el = document.getElementById('live-mandis');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 overflow-hidden">
      {/* Top Hero Section with Lush Professional Crop Background */}
      <section className="relative pt-12 pb-10 px-4 sm:px-6 lg:px-8 text-center text-white overflow-hidden">
        {/* Background Crop Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80"
            alt="Lush Crop Field"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950/90 backdrop-blur-[1px]"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>SIH 2026 Agri Fintech Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4 leading-tight drop-shadow-md">
            Sell Smarter. <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">Earn Better.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto mb-6 leading-relaxed font-medium drop-shadow-sm">
            AI-powered market intelligence helping Indian farmers find optimal Mandi marketplaces and APMC Mandi Owners by calculating true Net Profit.
          </p>

          {/* Concise CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={scrollToMandiSection}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-sm hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-emerald-100" />
              <span>Find Best Market</span>
            </button>
            <Link
              to="/register?role=farmer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-xl border border-white/30 backdrop-blur-md transition-all text-sm"
            >
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>Join as Farmer</span>
            </Link>
            <Link
              to="/login?role=mandi"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-xl border border-white/30 backdrop-blur-md transition-all text-sm"
            >
              <Building2 className="w-4 h-4 text-teal-300" />
              <span>Mandi Official Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* COMPACT CONCISE LIVE MAHARASHTRA APMC MANDIS SHOWCASE SECTION */}
      <section id="live-mandis" className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-14">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-1 border border-emerald-200">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Agmarknet Mandi Network ({markets.length} APMC Markets)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              All Maharashtra APMC Mandis & Daily Rates
            </h2>
          </div>

          {/* Search & Filter Compact Bar */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, district or APMC..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              {['All', 'Onion', 'Tomato', 'Potato', 'Cotton', 'Chilli'].map((crop) => (
                <button
                  key={crop}
                  onClick={() => setSelectedCrop(crop)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCrop === crop
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mandi Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {markets.map((market, idx) => {
            const photoUrl = MAHARASHTRA_PHOTOS[idx % MAHARASHTRA_PHOTOS.length];
            const isUp = market.trend === 'up' || (market.trendPercent && market.trendPercent > 0);

            return (
              <div
                key={market.id}
                className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Mandi Photo Header */}
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  <img
                    src={photoUrl}
                    alt={market.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent"></div>

                  <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-slate-800 flex items-center gap-1 shadow-2xs">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>{market.district}, {market.state}</span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-2xs">
                    {market.commodity || 'Onion'}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                    <h3 className="text-base font-black leading-tight drop-shadow-sm">{market.name}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-200 font-medium mt-0.5">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      <span>{market.operatingHours || '06:00 AM - 04:00 PM'}</span>
                    </div>
                  </div>
                </div>

                {/* Price Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Modal Rate</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-slate-900">{formatCurrency(market.modalPrice)}</span>
                          <span className="text-xs text-slate-500 font-bold">/q</span>
                        </div>
                      </div>

                      <div className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border ${
                        isUp ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {isUp ? <TrendingUp className="w-3 h-3 text-emerald-600" /> : <TrendingDown className="w-3 h-3 text-rose-600" />}
                        <span>{market.trendPercent ? `${market.trendPercent > 0 ? '+' : ''}${market.trendPercent}%` : '+3.5%'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11px] font-medium">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Min - Max:</span>
                        <strong className="text-slate-900">{formatCurrency(market.minPrice)} - {formatCurrency(market.maxPrice)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Arrival Volume:</span>
                        <strong className="text-slate-900">{market.arrivalQty || '4,500 Quintals'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Net Return Highlight Box */}
                  <div className="bg-emerald-50/90 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-wider text-emerald-800 block">Est. Net Return</span>
                      <strong className="text-sm font-black text-emerald-900">
                        {formatCurrency(market.expectedNetReturn || market.modalPrice * 10 - 1200)}
                      </strong>
                    </div>
                    <div className="text-right text-[10px] text-slate-600 font-medium">
                      <span className="flex items-center justify-end gap-1">
                        <Truck className="w-3 h-3 text-emerald-600" />
                        Cost: {formatCurrency(market.transportCost || 900)}
                      </span>
                      <span className="text-slate-500 block text-[9px]">{market.distanceKm || 25} km</span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="pt-1 flex items-center justify-between text-[11px] border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium">{market.lastUpdated || 'Agmarknet Daily Feed'}</span>
                    <Link
                      to="/register?role=farmer"
                      className="text-emerald-700 font-bold hover:text-emerald-800 flex items-center gap-1 hover:underline text-xs"
                    >
                      <span>Connect Mandi</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-12 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              Everything Farmers Need for Maximum Profit
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              Combining real-time prices, transport logistics, machine learning forecasts, and direct buyer linkage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl hover:border-emerald-300 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-3">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Live Mandi Prices</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Real-time price feeds across hundreds of APMC mandis in India for all major agricultural commodities.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl hover:border-purple-300 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">AI Price Prediction</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Machine learning model forecasting 3-day and 7-day price trends so you sell at peak market rates.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl hover:border-amber-300 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-3">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Net Profit Calculation</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Automatically subtract transport, handling, storage, and mandi commissions to reveal actual cash in hand.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
