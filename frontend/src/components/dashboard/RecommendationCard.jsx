import React from 'react';
import { Link } from 'react-router-dom';
import { getMandiImage } from '../../services/mandiImageService';
import { Award, ArrowRight, CheckCircle, Navigation, Send, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import liveDataStore from '../../services/liveDataStore';

export const RecommendationCard = ({ recommendation, onRequestMandi }) => {
  if (!recommendation) return null;

  const marketName = recommendation.marketName || recommendation.name || 'Optimal Mandi';
  const marketId = recommendation.marketId || recommendation.id || 'm-3';
  const photoUrl = getMandiImage(marketId, marketName);

  const score = recommendation.score || recommendation.recommendationScore || 95;
  const netReturn = recommendation.estimatedNetReturn || recommendation.netReturn || 32124;
  const modalPrice = recommendation.modalPrice || recommendation.currentModalPrice || 3380;
  const transportCost = recommendation.transportCost || recommendation.estimatedTransportCost || 700;

  const offers = liveDataStore.getOffers();
  const cleanName = marketName.split('(')[0].trim();
  const existingOffer = offers.find(
    (o) =>
      (o.buyerName?.toLowerCase().includes(cleanName.toLowerCase()) ||
       cleanName.toLowerCase().includes(o.buyerName?.toLowerCase()) ||
       o.buyerId === marketId) &&
      o.status !== 'Completed' &&
      !o.status?.includes('Declined')
  );

  return (
    <div className="relative bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 sm:p-7 shadow-xl overflow-hidden border border-emerald-500/30">
      {/* Background High-Res Mandi Photo Overlay matching exact Mandi card image */}
      <div className="absolute inset-0 z-0">
        <img
          src={photoUrl}
          alt={marketName}
          className="w-full h-full object-cover opacity-30 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-emerald-950/85 to-teal-950/90"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="bg-white/15 border border-white/25 backdrop-blur-md text-emerald-100 font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-300" />
            <span>BEST MARKET RECOMMENDATION</span>
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">
              Top Recommendation
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {marketName}
            </h3>
            <p className="text-xs text-emerald-100 mt-1 flex items-center gap-2 font-medium">
              <Navigation className="w-3.5 h-3.5 text-emerald-300" />
              <span>Optimal route based on live market prices & transport distance</span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
            <div>
              <div className="text-[11px] text-emerald-100 uppercase font-bold">Recommendation Score</div>
              <div className="text-2xl font-black text-white">
                {score}<span className="text-sm font-semibold text-emerald-200">/100</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-amber-300 flex items-center justify-center bg-white/20 font-black text-xs text-white shadow-inner">
              {score}%
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 mb-5">
          <div>
            <span className="text-xs text-emerald-100 block font-semibold">Current Modal Price</span>
            <span className="text-xl font-black text-white">
              {formatCurrency(modalPrice)}
              <span className="text-xs font-normal text-emerald-200"> /q</span>
            </span>
          </div>

          <div>
            <span className="text-xs text-emerald-100 block font-semibold">Est. Transport Cost</span>
            <span className="text-xl font-black text-amber-300">
              {formatCurrency(transportCost)}
            </span>
          </div>

          <div>
            <span className="text-xs text-emerald-100 block font-semibold">Expected Net Return</span>
            <span className="text-2xl font-black text-white">
              {formatCurrency(netReturn)}
            </span>
          </div>
        </div>

        {/* Rationale */}
        <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-4 mb-5 text-xs text-emerald-50 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-200 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-white block mb-0.5">Why {marketName}?</span>
            <p className="leading-relaxed text-emerald-100 font-medium">
              {recommendation.reasoning || recommendation.reason || `${marketName} provides maximum Net Return of ${formatCurrency(netReturn)} after deducting transport and handling costs.`}
            </p>
          </div>
        </div>

        {/* Action Buttons: View Details & Request Mandi Owner */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          <Link
            to={`/farmer/markets/${marketId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-5 py-2.5 rounded-xl border border-white/20 transition-all"
          >
            <span>View Market Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {existingOffer ? (
            <button
              disabled
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-500/30 border border-emerald-300 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-default shadow-2xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>✓ Requested</span>
            </button>
          ) : (
            <button
              onClick={() => onRequestMandi && onRequestMandi({
                id: marketId,
                companyName: marketName,
                name: marketName,
                cropRequired: recommendation.crop || 'Crop',
                offerPrice: modalPrice
              })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-105"
            >
              <Send className="w-3.5 h-3.5 text-emerald-700" />
              <span>Request Mandi Owner</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
