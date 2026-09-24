import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import buyerService from '../../services/buyerService';
import offerService from '../../services/offerService';
import liveDataStore from '../../services/liveDataStore';
import DashboardCard from '../../components/dashboard/DashboardCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { Store, ShoppingBag, PlusCircle, Target, ArrowRight, Handshake } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const BuyerDashboard = () => {
  const { user } = useAuth() || {};
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState([]);
  const [matches, setMatches] = useState([]);
  const [offers, setOffers] = useState([]);

  const fetchData = async () => {
    try {
      const [reqRes, matchRes, offRes] = await Promise.all([
        buyerService.getRequirements(),
        buyerService.getFarmerMatches(),
        offerService.getOffers()
      ]);
      setRequirements(reqRes);
      setMatches(matchRes);
      setOffers(offRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = liveDataStore.subscribe(() => {
      fetchData();
    });
    return () => unsubscribe();
  }, []);

  const pendingCount = offers.filter((o) => o.status === 'Sent' || o.status === 'Received' || o.status === 'PENDING').length;
  const completedCount = offers.filter((o) => o.status === 'Completed' || o.status === 'Accepted').length;

  if (loading) {
    return <LoadingSpinner message="Loading live procurement portal dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 sm:p-7 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Welcome back, {user?.companyName || user?.name || 'Buyer'} 👋
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Corporate Procurement & Mandi Sourcing Hub — Live Network Connected
          </p>
        </div>

        <Link
          to="/buyer/requirements/create"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-sm transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish Requirement</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardCard
          title="Active Requirements"
          value={requirements.length}
          subtitle="Open Sourcing Requests"
          icon={Store}
          color="emerald"
        />
        <DashboardCard
          title="Farmer Matches"
          value={matches.length}
          subtitle="Verified Grade A Lots"
          icon={Target}
          trend="up"
          trendText="Live Network"
          color="indigo"
        />
        <DashboardCard
          title="Pending Offers"
          value={pendingCount}
          subtitle="Awaiting Farmer Payout"
          icon={Handshake}
          color="amber"
        />
        <DashboardCard
          title="Completed Purchases"
          value={completedCount}
          subtitle="Total Tonnes Procured"
          icon={ShoppingBag}
          color="teal"
        />
      </div>

      {/* Active Requirements List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Active Crop Requirements</h3>
            <p className="text-xs text-slate-500 font-medium">Published RFQs visible to regional farmers in real time</p>
          </div>

          <Link
            to="/buyer/requirements"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
          >
            <span>View All ({requirements.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {requirements.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center space-y-3 shadow-xs">
            <p className="text-sm font-bold text-slate-800">No active sourcing requirements published yet.</p>
            <p className="text-xs text-slate-500 font-medium">Click "Publish Requirement" to post your bulk crop request for regional farmers.</p>
            <Link
              to="/buyer/requirements/create"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish First Requirement</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {requirements.map((req) => (
              <div key={req.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-emerald-800 font-extrabold uppercase tracking-wider">{req.crop} ({req.variety})</span>
                    <h4 className="text-lg font-black text-slate-900 mt-0.5">{req.quantityRequired}</h4>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                    {req.status}
                  </span>
                </div>

                {/* Inner Indigo Box */}
                <div className="grid grid-cols-2 gap-2 bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs font-medium">
                  <div>
                    <span className="text-slate-600 block">Offer Price:</span>
                    <strong className="text-emerald-700 text-sm font-black">{formatCurrency(req.offerPrice)}/q</strong>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Required By:</span>
                    <strong className="text-slate-900">{req.requiredDate}</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-500 font-medium">{req.matchingFarmersCount || matches.length} Matching Farmers</span>
                  <Link
                    to="/buyer/matches"
                    className="text-emerald-700 hover:underline font-bold"
                  >
                    View Matches →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
