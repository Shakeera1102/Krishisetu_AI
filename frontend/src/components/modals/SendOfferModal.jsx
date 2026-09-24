import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import offerService from '../../services/offerService';
import { useFarmer } from '../../context/FarmerContext';
import { calculateCropProfit } from '../../utils/profitEngine';
import { DollarSign, Send, CheckCircle2, Clock, ShieldCheck, Sprout } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const DEFAULT_CROP = { name: 'Maize', quantityKg: 3000, variety: 'Yellow Hybrid' };

export const SendOfferModal = ({ isOpen, onClose, buyer, onOfferSent }) => {
  const { selectedCrop } = useFarmer() || {};
  const safeCrop = selectedCrop && selectedCrop.name ? selectedCrop : DEFAULT_CROP;

  const mandiName = buyer?.companyName || buyer?.name || 'APMC Mandi Yard';
  const cropName = safeCrop.name || buyer?.cropRequired || 'Maize';

  const initialPrice = Number(buyer?.offerPrice) || Number(buyer?.modalPrice) || 2187;
  const initialQty = Number(safeCrop.quantityKg) || 3000;

  const [pricePerQuintal, setPricePerQuintal] = useState(initialPrice);
  const [quantityKg, setQuantityKg] = useState(initialQty);
  const [notes, setNotes] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && buyer) {
      const p = Number(buyer?.offerPrice) || Number(buyer?.modalPrice) || 2187;
      const q = Number(safeCrop.quantityKg) || 3000;
      setPricePerQuintal(p);
      setQuantityKg(q);
      setNotes(`Hello APMC Mandi Official, I want to sell my ${cropName} lot (${q} kg) to ${mandiName}. If accepted, I will proceed within 2 days with all transport & gate entry arrangements.`);
    }
  }, [isOpen, buyer, safeCrop.quantityKg, safeCrop.name]);

  if (!buyer) return null;

  const fin = calculateCropProfit({
    quantityKg: Number(quantityKg) || 3000,
    modalPrice: Number(pricePerQuintal) || 2187,
    distanceKm: Number(buyer?.distanceKm) || 25
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await offerService.createOffer({
        cropLotId: safeCrop.id,
        buyerId: buyer.id || buyer.mandiId,
        buyerName: mandiName,
        loginEmail: buyer.loginEmail || buyer.email,
        crop: cropName,
        quantity: `${quantityKg} kg (${(quantityKg / 100).toFixed(1)} Quintals)`,
        offeredPricePerQuintal: Number(pricePerQuintal),
        totalValue: fin.grossRevenue,
        netReturn: fin.netReturn,
        notes
      });
      setSuccess(true);
      if (onOfferSent) onOfferSent();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1400);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Request ${mandiName} Official`}>
      {success ? (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-1 animate-bounce" />
          <h4 className="text-lg font-black text-slate-900">Consignment Request Submitted!</h4>
          <p className="text-xs text-slate-600 font-medium max-w-sm">
            {mandiName} official has received your request for {cropName} ({quantityKg} kg). Check status in My Offers & Negotiations tab.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header Summary Box */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 text-xs font-medium space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Government APMC Mandi Official Procurement</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Target Mandi Yard:</span>
              <strong className="text-slate-900 font-extrabold">{mandiName}</strong>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Active Crop Lot:</span>
              <strong className="text-emerald-800 font-extrabold flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                {cropName} ({safeCrop.variety || 'Standard'})
              </strong>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Mandi Baseline Rate:</span>
              <strong className="text-emerald-700 font-black">{formatCurrency(buyer.offerPrice || buyer.modalPrice || 2187)}/q</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Offered Rate (₹ / quintal)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <input
                  type="number"
                  value={pricePerQuintal}
                  onChange={(e) => setPricePerQuintal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Consignment Quantity (in Kg)
              </label>
              <input
                type="number"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-bold"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
                {(quantityKg / 100).toFixed(1)} Quintals
              </span>
            </div>
          </div>

          {/* Dynamic Financial Calculation Box */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-4 space-y-1.5 shadow-xs">
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-100 font-medium">Gross Consignment Value:</span>
              <strong className="text-white font-black text-sm">{formatCurrency(fin.grossRevenue)}</strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-200 font-medium">(-) Est. Freight & APMC Fees:</span>
              <span className="text-amber-300 font-bold">-{formatCurrency(fin.totalDeductions)}</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-1.5 border-t border-white/20">
              <span className="text-emerald-100 font-bold">Expected Net Payout to Farmer:</span>
              <span className="text-xl font-black text-white">{formatCurrency(fin.netReturn)}</span>
            </div>
          </div>

          {/* 2-Day Formalities Commitment Warning Banner */}
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 flex items-start gap-2 text-xs text-amber-900 font-medium">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-extrabold text-amber-950">2-Day Formalities Commitment:</strong>
              If accepted by Mandi Yard Official, farmer commits to proceed within 2 days with all transport & gate entry arrangements.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Message to Mandi Official
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium leading-relaxed"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Sending Request...' : 'Send Request to Mandi Owner'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default SendOfferModal;
