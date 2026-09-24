import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import buyerService from '../../services/buyerService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { PlusCircle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const BuyerRequirements = () => {
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState([]);

  useEffect(() => {
    const fetchReqs = async () => {
      setLoading(true);
      try {
        const res = await buyerService.getRequirements();
        setRequirements(res);
      } finally {
        setLoading(false);
      }
    };
    fetchReqs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Sourcing Requirements (RFQs)</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage active crop requests visible to regional farmers.</p>
        </div>

        <Link
          to="/buyer/requirements/create"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Requirement</span>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching RFQ list..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requirements.map((req) => (
            <div key={req.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-emerald-800 font-extrabold uppercase">{req.crop} • {req.variety}</span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">{req.quantityRequired}</h3>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 text-xs font-medium">
                <div>
                  <span className="text-slate-600 block">Offer Price:</span>
                  <strong className="text-emerald-700 text-base font-black">{formatCurrency(req.offerPrice)}/q</strong>
                </div>
                <div>
                  <span className="text-slate-600 block">Location:</span>
                  <strong className="text-slate-900">{req.location}</strong>
                </div>
              </div>

              <p className="text-xs text-slate-500 italic font-medium">Requirements: {req.additionalRequirements}</p>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">{req.matchingFarmersCount} Matching Farmers</span>
                <Link to="/buyer/matches" className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                  <span>View Matching Farmers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerRequirements;
