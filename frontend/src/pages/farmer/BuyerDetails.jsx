import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import buyerService from '../../services/buyerService';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import Rating from '../../components/common/Rating';
import SendOfferModal from '../../components/modals/SendOfferModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { MapPin, ArrowLeft, Send, Zap } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const BuyerDetails = () => {
  const { buyerId } = useParams();
  const [loading, setLoading] = useState(true);
  const [buyer, setBuyer] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  useEffect(() => {
    const fetchBuyer = async () => {
      setLoading(true);
      try {
        const res = await buyerService.getBuyerById(buyerId);
        setBuyer(res);
      } finally {
        setLoading(false);
      }
    };
    fetchBuyer();
  }, [buyerId]);

  if (loading || !buyer) {
    return <LoadingSpinner message="Fetching buyer profile & match criteria..." />;
  }

  const { matchDetails } = buyer;

  return (
    <div className="space-y-6">
      <Link
        to="/farmer/buyers"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Buyer Marketplace</span>
      </Link>

      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black text-slate-900">{buyer.companyName}</h1>
            {buyer.verified && <VerifiedBadge />}
          </div>
          <p className="text-xs text-slate-500 font-medium">Contact: {buyer.contactPerson}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {buyer.location} ({buyer.distanceKm} km away)
            </span>
            <span className="text-slate-300">•</span>
            <Rating score={buyer.rating} />
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold">{buyer.completedTransactions} Completed Trades</span>
          </div>
        </div>

        <button
          onClick={() => setIsOfferModalOpen(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-2xs transition-all"
        >
          <Send className="w-4 h-4" />
          <span>Send Offer Now</span>
        </button>
      </div>

      {/* Match Details Matrix - Green Highlight Container */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" />
            <h3 className="text-lg font-black text-slate-900">Why This Buyer Matches You</h3>
          </div>
          <span className="text-2xl font-black text-emerald-700">{buyer.matchPercentage}% AI Score</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded-2xl border border-emerald-200/60 shadow-2xs">
            <span className="text-[11px] text-slate-500 block font-bold">Crop Match</span>
            <span className="text-xl font-black text-emerald-700">{matchDetails.cropMatch}%</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200/60 shadow-2xs">
            <span className="text-[11px] text-slate-500 block font-bold">Quantity Match</span>
            <span className="text-xl font-black text-emerald-700">{matchDetails.quantityMatch}%</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200/60 shadow-2xs">
            <span className="text-[11px] text-slate-500 block font-bold">Location Proximity</span>
            <span className="text-xl font-black text-emerald-700">{matchDetails.locationMatch}%</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200/60 shadow-2xs">
            <span className="text-[11px] text-slate-500 block font-bold">Price Alignment</span>
            <span className="text-xl font-black text-emerald-700">{matchDetails.priceMatch}%</span>
          </div>
        </div>
      </div>

      {/* Requirement Details */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Procurement Requirement Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-slate-500 block mb-1 font-medium">Required Crop</span>
            <strong className="text-base text-slate-900 font-extrabold">{buyer.cropRequired} ({buyer.variety})</strong>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-slate-500 block mb-1 font-medium">Required Quantity</span>
            <strong className="text-base text-slate-900 font-extrabold">{buyer.quantityRequired}</strong>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
            <span className="text-slate-600 block mb-1 font-medium">Baseline Offer Price</span>
            <strong className="text-base text-emerald-700 font-black">{formatCurrency(buyer.offerPrice)} / quintal</strong>
          </div>
        </div>

        <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium">
          <span className="font-bold text-slate-900 block mb-1">Procurement Terms & Notes:</span>
          <p>{buyer.terms}</p>
        </div>
      </div>

      <SendOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        buyer={buyer}
      />
    </div>
  );
};

export default BuyerDetails;
