import React, { useState, useEffect } from 'react';
import { useFarmer } from '../../context/FarmerContext';
import ProfitCard from '../../components/dashboard/ProfitCard';
import { calculateNetReturn } from '../../utils/math';
import { Calculator, DollarSign, Truck } from 'lucide-react';

export const ProfitCalculator = () => {
  const { selectedCrop, updateCrop } = useFarmer();

  const [crop, setCrop] = useState(selectedCrop?.name || selectedCrop?.crop || 'Onion');
  const [quantityKg, setQuantityKg] = useState(selectedCrop?.quantityKg || 1000);
  const [pricePerQuintal, setPricePerQuintal] = useState(3200);
  const [transportCost, setTransportCost] = useState(900);
  const [handlingCost, setHandlingCost] = useState(300);
  const [storageCost, setStorageCost] = useState(200);
  const [commissionPercent, setCommissionPercent] = useState(2);
  const [miscCost, setMiscCost] = useState(100);

  useEffect(() => {
    if (selectedCrop?.name || selectedCrop?.crop) setCrop(selectedCrop?.name || selectedCrop?.crop);
    if (selectedCrop?.quantityKg) setQuantityKg(selectedCrop.quantityKg);
  }, [selectedCrop]);

  const handleCropChange = (e) => {
    const newCrop = e.target.value;
    setCrop(newCrop);
    updateCrop({ name: newCrop });
  };

  const handleQtyChange = (e) => {
    const newQty = Number(e.target.value) || 0;
    setQuantityKg(newQty);
    updateCrop({ quantityKg: newQty });
  };

  const result = calculateNetReturn({
    quantityKg: Number(quantityKg) || 1,
    pricePerQuintal: Number(pricePerQuintal) || 0,
    transportCost: Number(transportCost) || 0,
    handlingCost: Number(handlingCost) || 0,
    storageCost: Number(storageCost) || 0,
    commissionPercent: Number(commissionPercent) || 0,
    miscCost: Number(miscCost) || 0
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Net Profit Calculator</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Calculate your exact pocket margin by factoring transport freight, APMC commissions, and labor handling costs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs Column */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <span>Market & Cost Parameters</span>
            </h3>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Auto-synced from Dashboard
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Crop</label>
              <select
                value={crop}
                onChange={handleCropChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              >
                <option value="Onion">Onion</option>
                <option value="Tomato">Tomato</option>
                <option value="Potato">Potato</option>
                <option value="Paddy">Paddy</option>
                <option value="Cotton">Cotton</option>
                <option value="Chilli">Chilli</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (in Kg)</label>
              <input
                type="number"
                value={quantityKg}
                onChange={handleQtyChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
                {(quantityKg / 100).toFixed(1)} Quintals
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹ / quintal)</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <input
                  type="number"
                  value={pricePerQuintal}
                  onChange={(e) => setPricePerQuintal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transport Freight (₹)</label>
              <div className="relative">
                <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600" />
                <input
                  type="number"
                  value={transportCost}
                  onChange={(e) => setTransportCost(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Handling & Loading (₹)</label>
              <input
                type="number"
                value={handlingCost}
                onChange={(e) => setHandlingCost(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Storage / Rent (₹)</label>
              <input
                type="number"
                value={storageCost}
                onChange={(e) => setStorageCost(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mandi Commission (%)</label>
              <input
                type="number"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
            </div>
          </div>
        </div>

        {/* Output Column */}
        <div>
          <ProfitCard result={result} />
        </div>
      </div>
    </div>
  );
};

export default ProfitCalculator;
