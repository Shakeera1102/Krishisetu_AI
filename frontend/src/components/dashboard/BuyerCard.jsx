import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Zap, Building2, CheckCircle2 } from 'lucide-react';
import VerifiedBadge from '../common/VerifiedBadge';
import Rating from '../common/Rating';
import { formatCurrency } from '../../utils/formatters';
import liveDataStore from '../../services/liveDataStore';

export const BuyerCard = ({ buyer, onSendOffer }) => {
  const mandiName = buyer.companyName || buyer.name || 'APMC Mandi Yard';
  const cleanMandiName = mandiName.split('(')[0].trim();
  
  const offers = liveDataStore.getOffers();
  const existingOffer = offers.find(
    (o) =>
      (o.buyerName?.toLowerCase().includes(cleanMandiName.toLowerCase()) ||
       cleanMandiName.toLowerCase().includes(o.buyerName?.toLowerCase()) ||
       o.buyerId === buyer.id) &&
      o.status !== 'Completed' &&
      !o.status?.includes('Declined')
  );

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-emerald-300 transition-all shadow-2xs hover:shadow-sm flex flex-col justify-between space-y-3">
      <div>
        {/* Header Title & Match Badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{cleanMandiName}</span>
              </h4>
              {buyer.verified && <VerifiedBadge />}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{buyer.location || 'Maharashtra'} • {buyer.distanceKm || 25} km</span>
              <span className="text-slate-300">•</span>
              <Rating score={buyer.rating || 4.9} />
            </div>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black px-2 py-0.5 rounded-full">
              <Zap className="w-3 h-3 fill-emerald-600" />
              <span>{buyer.matchPercentage || 98}%</span>
            </span>
          </div>
        </div>

        {/* Compact Summary Box */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Benchmark Price</span>
            <span className="text-base font-black text-emerald-700">
              {formatCurrency(buyer.offerPrice)}
              <span className="text-xs font-medium text-slate-400">/q</span>
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Crop</span>
            <span className="text-xs font-extrabold text-slate-900">{buyer.cropRequired || 'Potato'}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Link
          to={`/farmer/markets/${buyer.mandiId || 'm-4'}`}
          className="w-full flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl transition-all"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {existingOffer ? (
          <button
            disabled
            className="w-full flex items-center justify-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-black py-2 rounded-xl cursor-default shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>✓ Requested</span>
          </button>
        ) : (
          <button
            onClick={() => onSendOffer && onSendOffer(buyer)}
            className="w-full flex items-center justify-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-xs"
          >
            <span>Request Mandi</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BuyerCard;
