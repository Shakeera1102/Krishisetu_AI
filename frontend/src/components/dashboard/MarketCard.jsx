import React from 'react';
import { Link } from 'react-router-dom';
import { getMandiImage } from '../../services/mandiImageService';
import { MapPin, TrendingUp, TrendingDown, ArrowRight, Clock, Truck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { calculateCropProfit } from '../../utils/profitEngine';

export const MarketCard = ({ market, cropQuantityKg = 1000 }) => {
  if (!market) return null;

  const isUp = market.trend === 'up' || (market.trendPercent && market.trendPercent > 0);
  const photoUrl = getMandiImage(market.id, market.name);

  const modalPrice = Number(market.modalPrice) || 2291;
  const distanceKm = Number(market.distanceKm) || 25;
  const quantityKg = Number(market.quantityKg || cropQuantityKg) || 1000;

  const fin = calculateCropProfit({
    quantityKg,
    modalPrice,
    distanceKm,
    commissionPercent: market.commissionPercent || 2
  });

  const netReturn = market.expectedNetReturn || market.netReturn || fin.netReturn;
  const transportCost = market.transportCost || fin.transportCost;

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Visual Mandi Photo Header */}
      <div className="relative h-40 overflow-hidden bg-slate-100">
        <img
          src={photoUrl}
          alt={market.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent"></div>

        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-slate-800 flex items-center gap-1 shadow-2xs">
          <MapPin className="w-3 h-3 text-emerald-600" />
          <span>{market.district || 'Maharashtra'}, {market.state || 'Maharashtra'} • {distanceKm} km</span>
        </div>

        <div className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
          isUp ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
        }`}>
          {isUp ? <TrendingUp className="w-3 h-3 text-white" /> : <TrendingDown className="w-3 h-3 text-white" />}
          <span>{isUp ? `+${market.trendPercent || 4.2}%` : `${market.trendPercent || 1.8}%`}</span>
        </div>

        <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
          <h4 className="text-base font-black leading-tight drop-shadow-sm">{market.name}</h4>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-200 font-medium mt-0.5">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{market.operatingHours || '05:00 AM - 06:00 PM'}</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Inner Price Metrics */}
        <div className="grid grid-cols-2 gap-2 py-2 bg-emerald-50/80 border border-emerald-200/80 p-3 rounded-2xl">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-600 block font-bold">
              Modal Price
            </span>
            <span className="text-lg font-black text-slate-900">
              {formatCurrency(modalPrice)}
              <span className="text-xs font-normal text-slate-500">/q</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-emerald-800 block font-bold">
              Est. Net Return
            </span>
            <span className="text-lg font-black text-emerald-700">
              {formatCurrency(netReturn)}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center justify-between px-1">
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-amber-600" />
            Freight: <strong className="text-slate-700">{formatCurrency(transportCost)}</strong>
          </span>
          <span>Arrival: <strong className="text-slate-700">{market.arrivalQty || '18,000 Quintals'}</strong></span>
        </div>

        <Link
          to={`/farmer/markets/${market.id}`}
          className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs"
        >
          <span>View Market Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default MarketCard;
