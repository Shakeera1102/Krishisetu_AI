import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useFarmer } from '../../context/FarmerContext';
import marketService from '../../services/marketService';
import priceService from '../../services/priceService';
import FilterBar from '../../components/common/FilterBar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import PriceChart from '../../components/dashboard/PriceChart';
import Recommendations from './Recommendations';
import ProfitCalculator from './ProfitCalculator';
import { TrendingUp, TrendingDown, MapPin, ArrowRight, Store, LineChart, Sparkles, Layers } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const MandiPrices = () => {
  const { selectedCrop } = useFarmer();
  const [searchParams] = useSearchParams();

  const paramTab = searchParams.get('tab');
  const paramMarketId = searchParams.get('marketId');

  const [activeTab, setActiveTab] = useState(paramTab || 'live-rates');
  const [loading, setLoading] = useState(true);
  const [markets, setMarkets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [crop, setCrop] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(3);

  // Price Trend Chart State
  const [historicalData, setHistoricalData] = useState([]);
  const [chartRange, setChartRange] = useState('7d');
  const [selectedMarketName, setSelectedMarketName] = useState('Nashik APMC');

  useEffect(() => {
    if (paramTab) {
      setActiveTab(paramTab);
    }
  }, [paramTab]);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const [mRes, pRes] = await Promise.all([
        marketService.getCurrentPrices({
          search: searchQuery,
          crop: crop,
          state: selectedState,
          page: currentPage,
          pageSize: 5
        }),
        priceService.getHistoricalPrices({
          crop: crop === 'All' ? 'Onion' : crop,
          period: chartRange,
          market: selectedMarketName
        })
      ]);

      const mList = mRes.data || mRes || [];
      setMarkets(mList);
      setTotalPages(mRes.totalPages || 3);
      setHistoricalData(pRes.chartData || []);

      if (paramMarketId && mList.length > 0) {
        const found = mList.find((m) => m.id === paramMarketId);
        if (found) {
          setSelectedMarketName(found.name);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, [searchQuery, crop, selectedState, currentPage, chartRange, selectedMarketName, paramMarketId]);

  const handleUseLocation = () => {
    setSelectedState('Maharashtra');
    setSearchQuery('Nashik');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase mb-1">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>Mandi Intelligence Hub</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">APMC Mandi Rates & Comparison</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time daily Mandi rates, historical price trend charts, and AI Net Profit decision support.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab('live-rates')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'live-rates'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Live Rates</span>
          </button>

          <button
            onClick={() => setActiveTab('price-trends')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'price-trends'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Price Comparison & Trends</span>
          </button>

          <button
            onClick={() => setActiveTab('best-market-ai')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'best-market-ai'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Best Market AI</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Live Rates */}
      {activeTab === 'live-rates' && (
        <div className="space-y-6">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
            selectedCrop={crop}
            onCropChange={(c) => { setCrop(c); setCurrentPage(1); }}
            selectedState={selectedState}
            onStateChange={(s) => { setSelectedState(s); setCurrentPage(1); }}
            onLocationClick={handleUseLocation}
          />

          {loading ? (
            <LoadingSpinner message="Fetching live mandi prices..." />
          ) : markets.length === 0 ? (
            <EmptyState
              title="No mandi prices found"
              description="Try adjusting your crop or location filters."
              onRetry={() => {
                setSearchQuery('');
                setCrop('All');
                setSelectedState('All');
                setCurrentPage(1);
              }}
            />
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Market / Mandi</th>
                      <th className="py-3.5 px-4">Commodity</th>
                      <th className="py-3.5 px-4">Variety</th>
                      <th className="py-3.5 px-4">Min Price</th>
                      <th className="py-3.5 px-4">Max Price</th>
                      <th className="py-3.5 px-4">Modal Price</th>
                      <th className="py-3.5 px-4">Arrival Volume</th>
                      <th className="py-3.5 px-4">Trend</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {markets.map((market) => {
                      const isUp = market.trend === 'up' || (market.trendPercent && market.trendPercent > 0);
                      return (
                        <tr key={market.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-900">
                            <div>{market.name}</div>
                            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{market.district}, {market.state} ({market.distanceKm || 25} km)</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-bold text-emerald-700">{market.commodity}</td>
                          <td className="py-4 px-4 text-slate-600 font-medium">{market.variety}</td>
                          <td className="py-4 px-4 text-slate-500">{formatCurrency(market.minPrice)}</td>
                          <td className="py-4 px-4 text-slate-500">{formatCurrency(market.maxPrice)}</td>
                          <td className="py-4 px-4 font-black text-slate-900 text-sm">
                            {formatCurrency(market.modalPrice)}
                            <span className="text-[10px] font-normal text-slate-400"> /q</span>
                          </td>
                          <td className="py-4 px-4 text-slate-600 font-medium">{market.arrivalQty}</td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                                isUp
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {isUp ? <TrendingUp className="w-3 h-3 text-emerald-600" /> : <TrendingDown className="w-3 h-3 text-rose-600" />}
                              <span>{isUp ? `+${market.trendPercent || 3.5}%` : `${market.trendPercent}%`}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/farmer/markets/${market.id || 'm-1'}`}
                                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-all"
                              >
                                <span>View Market Details</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => {
                                  setSelectedMarketName(market.name);
                                  setActiveTab('price-trends');
                                }}
                                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-bold text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-all"
                              >
                                <span>Compare</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Price Comparison & Trends */}
      {activeTab === 'price-trends' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-slate-900">Comparing Mandi:</span>
              <select
                value={selectedMarketName}
                onChange={(e) => setSelectedMarketName(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
              >
                {markets.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.district})
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Historical daily modal price timeline vs. regional average baseline
            </span>
          </div>

          <PriceChart
            data={historicalData}
            title={`${crop === 'All' ? 'Onion' : crop} Price History — ${selectedMarketName}`}
            currentRange={chartRange}
            onRangeChange={(r) => setChartRange(r)}
          />
        </div>
      )}

      {/* Tab 3: Best Market AI & Profit Calculator */}
      {activeTab === 'best-market-ai' && (
        <div className="space-y-8">
          <Recommendations />
          <div className="pt-4 border-t border-slate-200/80">
            <ProfitCalculator />
          </div>
        </div>
      )}
    </div>
  );
};

export default MandiPrices;
