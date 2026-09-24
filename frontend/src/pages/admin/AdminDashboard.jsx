import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import centralDatabase from '../../services/centralDatabase';
import liveDataStore, { OFFER_STATUS, TRADE_STATUS, CROP_STATUS } from '../../services/liveDataStore';
import marketService from '../../services/marketService';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import {
  ShieldAlert,
  Users,
  Store,
  Handshake,
  Building2,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  AlertCircle,
  Truck,
  MessageSquare,
  DollarSign,
  Activity,
  FileSpreadsheet,
  XCircle,
  Key,
  MapPin,
  RefreshCw,
  Clock
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth() || {};
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const [activeTab, setActiveTab] = useState(currentTab);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Data states
  const [users, setUsers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [offers, setOffers] = useState([]);
  const [trades, setTrades] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [audits, setAudits] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals state
  const [isMandiModalOpen, setIsMandiModalOpen] = useState(false);
  const [editingMandi, setEditingMandi] = useState(null);
  const [mandiForm, setMandiForm] = useState({
    name: '',
    district: 'Nashik',
    state: 'Maharashtra',
    operatingHours: '06:00 AM - 05:00 PM',
    commodity: 'Onion',
    modalPrice: 3200,
    minPrice: 2800,
    maxPrice: 3600,
    arrivalQty: '5,000 Quintals',
    email: '',
    password: 'govt123',
    mobile: '+91 94222 10000'
  });

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '123',
    role: 'farmer',
    mobile: '+91 98480 12345',
    state: 'Maharashtra',
    district: 'Pune'
  });

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [cropForm, setCropForm] = useState({
    crop: 'Cotton',
    variety: 'Standard Quality',
    quantityKg: 1500,
    expectedPrice: 6900,
    location: 'Nashik, Maharashtra',
    farmerName: 'Farmer',
    status: CROP_STATUS.ACTIVE
  });

  const [selectedOfferForChat, setSelectedOfferForChat] = useState(null);
  const [adminChatMessage, setAdminChatMessage] = useState('');

  // Sync tab with URL parameter
  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab'));
    }
  }, [searchParams]);

  const loadAllSystemData = () => {
    try {
      const u = centralDatabase.getUsers() || [];
      const c = centralDatabase.getCrops() || [];
      const o = centralDatabase.getOffers() || [];
      const t = centralDatabase.getTrades() || [];
      const a = centralDatabase.getAudits() || [];
      const customM = centralDatabase.getMandis() || [];

      // Combine standard directory + custom mandis
      setUsers(u);
      setCrops(c);
      setOffers(o);
      setTrades(t);
      setAudits(a);
      setMandis(customM);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setErrorMsg('Failed to load system data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllSystemData();
    const handleUpdate = () => loadAllSystemData();
    window.addEventListener('central_database_updated', handleUpdate);
    const unsub = liveDataStore.subscribe(handleUpdate);
    return () => {
      window.removeEventListener('central_database_updated', handleUpdate);
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const showToast = (msg, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // ==================== MANDI HANDLERS ====================
  const handleOpenAddMandi = () => {
    setEditingMandi(null);
    setMandiForm({
      name: '',
      district: 'Nashik',
      state: 'Maharashtra',
      operatingHours: '06:00 AM - 05:00 PM',
      commodity: 'Onion',
      modalPrice: 3200,
      minPrice: 2800,
      maxPrice: 3600,
      arrivalQty: '5,000 Quintals',
      email: '',
      password: 'govt123',
      mobile: '+91 94222 10000'
    });
    setIsMandiModalOpen(true);
  };

  const handleOpenEditMandi = (mandi) => {
    setEditingMandi(mandi);
    setMandiForm({
      name: mandi.name || '',
      district: mandi.district || 'Maharashtra',
      state: mandi.state || 'Maharashtra',
      operatingHours: mandi.operatingHours || '06:00 AM - 05:00 PM',
      commodity: mandi.commodity || 'Onion',
      modalPrice: mandi.modalPrice || 3200,
      minPrice: mandi.minPrice || 2800,
      maxPrice: mandi.maxPrice || 3600,
      arrivalQty: mandi.arrivalQty || '5,000 Quintals',
      email: mandi.email || '',
      password: mandi.password || 'govt123',
      mobile: mandi.mobile || '+91 94222 10000'
    });
    setIsMandiModalOpen(true);
  };

  const handleSaveMandi = (e) => {
    e.preventDefault();
    if (!mandiForm.name.trim()) {
      showToast('Please enter a valid Mandi yard name.', true);
      return;
    }
    if (editingMandi) {
      centralDatabase.updateMandi(editingMandi.id, mandiForm);
      showToast(`Mandi "${mandiForm.name}" updated successfully.`);
    } else {
      const created = centralDatabase.addMandi(mandiForm);
      showToast(`New Mandi "${created.name}" created and added to directory.`);
    }
    setIsMandiModalOpen(false);
    loadAllSystemData();
  };

  const handleDeleteMandi = (mandiId, mandiName) => {
    if (window.confirm(`Are you sure you want to remove ${mandiName}?`)) {
      centralDatabase.deleteMandi(mandiId);
      showToast(`Mandi "${mandiName}" deleted.`);
      loadAllSystemData();
    }
  };

  // ==================== USER HANDLERS ====================
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      password: '123',
      role: 'farmer',
      mobile: '+91 98480 12345',
      state: 'Maharashtra',
      district: 'Pune'
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setUserForm({
      name: u.name || u.companyName || '',
      email: u.email || '',
      password: u.password || '123',
      role: u.role || 'farmer',
      mobile: u.mobile || '',
      state: u.state || 'Maharashtra',
      district: u.district || 'Pune'
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!userForm.email.trim() || !userForm.name.trim()) {
      showToast('Name and Email are required.', true);
      return;
    }
    if (editingUser) {
      centralDatabase.updateUser(editingUser.id, userForm);
      showToast(`User ${userForm.name} updated.`);
    } else {
      centralDatabase.registerUser(userForm);
      showToast(`User ${userForm.name} registered.`);
    }
    setIsUserModalOpen(false);
    loadAllSystemData();
  };

  const handleDeleteUser = (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      centralDatabase.deleteUser(userId);
      showToast(`User "${userName}" removed from system.`);
      loadAllSystemData();
    }
  };

  // ==================== CROP HANDLERS ====================
  const handleOpenEditCrop = (crop) => {
    setEditingCrop(crop);
    setCropForm({
      crop: crop.crop || crop.name || 'Cotton',
      variety: crop.variety || 'Standard Quality',
      quantityKg: crop.quantityKg || 1500,
      expectedPrice: crop.expectedPrice || 6900,
      location: crop.location || 'Maharashtra',
      farmerName: crop.farmerName || 'Farmer',
      status: crop.status || CROP_STATUS.ACTIVE
    });
    setIsCropModalOpen(true);
  };

  const handleSaveCrop = (e) => {
    e.preventDefault();
    if (editingCrop) {
      centralDatabase.updateCrop(editingCrop.id, cropForm);
      showToast(`Crop Lot #${editingCrop.id} updated.`);
      setIsCropModalOpen(false);
      loadAllSystemData();
    }
  };

  const handleDeleteCrop = (cropId) => {
    if (window.confirm(`Are you sure you want to delete Crop Lot #${cropId}?`)) {
      centralDatabase.deleteCrop(cropId);
      showToast(`Crop Lot #${cropId} deleted.`);
      loadAllSystemData();
    }
  };

  // ==================== OFFER HANDLERS ====================
  const handleUpdateOfferStatus = (offerId, newStatus) => {
    centralDatabase.updateOffer(offerId, { status: newStatus });
    showToast(`Offer #${offerId} status set to ${newStatus}.`);
    loadAllSystemData();
  };

  const handleDeleteOffer = (offerId) => {
    if (window.confirm(`Delete offer #${offerId}?`)) {
      centralDatabase.deleteOffer(offerId);
      showToast(`Offer #${offerId} removed.`);
      loadAllSystemData();
    }
  };

  const handleSendAdminChat = (e) => {
    e.preventDefault();
    if (!selectedOfferForChat || !adminChatMessage.trim()) return;
    liveDataStore.addOfferMessage(
      selectedOfferForChat.id,
      'System Admin',
      'admin',
      `[ADMIN NOTICE]: ${adminChatMessage.trim()}`
    );
    setAdminChatMessage('');
    showToast('Admin message posted to trade conversation.');
    loadAllSystemData();
  };

  if (loading) {
    return <LoadingSpinner message="Initializing KrishiSetu Master Admin Console..." />;
  }

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    if (!u) return false;
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.district || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || (u.role || '').toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold text-sm">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3 shadow-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-semibold text-sm">{errorMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
              <ShieldAlert className="w-3.5 h-3.5" /> Root Administrator Access
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Master Admin Command Center
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Complete administrative authority over users, APMC mandis, crop registrations, freight logistics, trade settlements, and audit ledgers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddMandi}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add APMC Mandi
            </button>
            <button
              onClick={handleOpenAddUser}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-4 py-2.5 rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" /> Add User
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'overview', label: 'System Overview', icon: Activity, count: null },
          { id: 'users', label: 'Manage Users', icon: Users, count: users.length },
          { id: 'mandis', label: 'Manage Mandis', icon: Building2, count: mandis.length },
          { id: 'crops', label: 'Crop Lots', icon: Store, count: crops.length },
          { id: 'offers', label: 'Offers & Logistics', icon: Handshake, count: offers.length },
          { id: 'trades', label: 'Settlements', icon: DollarSign, count: trades.length },
          { id: 'audits', label: 'Audit Trail', icon: FileSpreadsheet, count: audits.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchParams({ tab: tab.id });
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================
          TAB 1: OVERVIEW
      ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Registered Users</span>
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{users.length}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <span className="font-semibold text-emerald-700">{users.filter(u => u.role === 'farmer').length} Farmers</span> • 
                <span className="font-semibold text-blue-700">{users.filter(u => u.role === 'buyer').length} Buyers</span> • 
                <span className="font-semibold text-purple-700">{users.filter(u => u.role === 'mandi').length} Mandis</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Active Crop Lots</span>
                <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
                  <Store className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{crops.length}</p>
              <p className="text-xs text-slate-500 mt-2">
                Total Volume:{' '}
                <span className="font-bold text-slate-700">
                  {(crops.reduce((acc, c) => acc + (Number(c.quantityKg) || 0), 0) / 100).toFixed(1)} Qtl
                </span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Offers & Trades</span>
                <div className="p-2 bg-teal-50 rounded-xl text-teal-700">
                  <Handshake className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{offers.length}</p>
              <p className="text-xs text-slate-500 mt-2">
                Settled Trades:{' '}
                <span className="font-bold text-emerald-700">{trades.length}</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Custom Mandi Yards</span>
                <div className="p-2 bg-purple-50 rounded-xl text-purple-700">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{mandis.length}</p>
              <p className="text-xs text-purple-700 font-semibold mt-2">
                + 20 Default Agmarknet Mandis
              </p>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" /> Recent System Audit Activity
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {audits.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No system events logged yet.</p>
                ) : (
                  [...audits].reverse().slice(0, 8).map((evt) => (
                    <div key={evt.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800">{evt.eventType}</span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : 'Just now'}
                        </span>
                      </div>
                      <p className="text-slate-700">{evt.reason || 'System state modification'}</p>
                      <div className="text-[11px] text-slate-500">
                        Actor: <span className="font-semibold text-slate-800">{evt.actorName}</span> ({evt.actorRole})
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-600" /> Quick Administrative Tasks
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleOpenAddMandi}
                  className="p-4 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl text-left transition-all cursor-pointer"
                >
                  <div className="font-bold text-sm text-emerald-900 flex items-center justify-between">
                    Add APMC Mandi <Plus className="w-4 h-4 text-emerald-700" />
                  </div>
                  <p className="text-xs text-emerald-700 mt-1">Register a new government mandi yard and login.</p>
                </button>

                <button
                  onClick={handleOpenAddUser}
                  className="p-4 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-xl text-left transition-all cursor-pointer"
                >
                  <div className="font-bold text-sm text-blue-900 flex items-center justify-between">
                    Register User <Plus className="w-4 h-4 text-blue-700" />
                  </div>
                  <p className="text-xs text-blue-700 mt-1">Add a new Farmer, Buyer, or Mandi Official.</p>
                </button>

                <button
                  onClick={() => setActiveTab('offers')}
                  className="p-4 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 rounded-xl text-left transition-all cursor-pointer"
                >
                  <div className="font-bold text-sm text-teal-900 flex items-center justify-between">
                    Manage Trades <Handshake className="w-4 h-4 text-teal-700" />
                  </div>
                  <p className="text-xs text-teal-700 mt-1">View ongoing trade negotiations and logistics.</p>
                </button>

                <button
                  onClick={() => setActiveTab('crops')}
                  className="p-4 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl text-left transition-all cursor-pointer"
                >
                  <div className="font-bold text-sm text-amber-900 flex items-center justify-between">
                    Review Crop Lots <Store className="w-4 h-4 text-amber-700" />
                  </div>
                  <p className="text-xs text-amber-700 mt-1">Inspect active harvest listings and pricing.</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: MANAGE USERS
      ========================================================= */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search user by name, email, or district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700"
              >
                <option value="all">All Roles</option>
                <option value="farmer">Farmers</option>
                <option value="buyer">Buyers</option>
                <option value="mandi">Mandi Officials</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddUser}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2 rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Email / Mobile</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id || u.email} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {u.name || u.companyName || 'Unnamed User'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'mandi'
                            ? 'bg-blue-100 text-blue-800'
                            : u.role === 'buyer'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role || 'farmer'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono">
                      <div>{u.email}</div>
                      <div className="text-slate-400">{u.mobile}</div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {u.district}, {u.state}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditUser(u)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id || u.email, u.name || u.email)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: MANAGE MANDIS
      ========================================================= */}
      {activeTab === 'mandis' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">APMC Mandi Directory Management</h2>
              <p className="text-xs text-slate-500">
                Manually added Mandis instantly integrate into Market Intelligence, price ranking algorithms, and buyer dispatch routes.
              </p>
            </div>
            <button
              onClick={handleOpenAddMandi}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2 rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Mandi
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {mandis.length === 0 ? (
              <div className="col-span-full py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 font-semibold">No custom Mandis added yet.</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add New Mandi" above to create and publish a new Mandi yard.</p>
              </div>
            ) : (
              mandis.map((m) => (
                <div key={m.id} className="p-4 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                        Custom Mandi
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1">{m.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {m.district}, {m.state}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditMandi(m)}
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMandi(m.id, m.name)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Commodity</span>
                      <span className="font-bold text-slate-800">{m.commodity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Modal Price</span>
                      <span className="font-bold text-emerald-700">₹{m.modalPrice}/q</span>
                    </div>
                    {m.email && (
                      <div className="col-span-2 text-[11px] font-mono text-slate-600 truncate">
                        Login: {m.email}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: MANAGE CROPS
      ========================================================= */}
      {activeTab === 'crops' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Registered Crop Lots</h2>
            <span className="text-xs font-semibold text-slate-500">{crops.length} Total Lots</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Farmer</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Expected Rate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {crops.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{c.crop || c.name}</div>
                      <div className="text-xs text-slate-400">{c.variety}</div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="font-semibold text-slate-800">{c.farmerName || 'Farmer'}</div>
                      <div className="text-slate-400">{c.location || 'Maharashtra'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-xs">
                      {c.quantityKg} kg ({((c.quantityKg || 0) / 100).toFixed(1)} Qtl)
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      ₹{c.expectedPrice}/q
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditCrop(c)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCrop(c.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 5: MANAGE OFFERS & LOGISTICS
      ========================================================= */}
      {activeTab === 'offers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Trade Offers & Negotiations</h2>
            <span className="text-xs font-semibold text-slate-500">{offers.length} Total Offers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Offer ID</th>
                  <th className="py-3 px-4">Parties</th>
                  <th className="py-3 px-4">Crop & Qty</th>
                  <th className="py-3 px-4">Offered Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Logistics</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offers.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-xs text-slate-500">
                      #{o.id}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div><span className="text-slate-400">Farmer:</span> <span className="font-semibold text-slate-800">{o.farmerName}</span></div>
                      <div><span className="text-slate-400">Buyer/Mandi:</span> <span className="font-semibold text-emerald-800">{o.buyerName}</span></div>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold">
                      {o.crop} ({o.quantity})
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      ₹{o.offeredPricePerQuintal}/q
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOfferStatus(o.id, e.target.value)}
                        className="text-xs font-bold px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                      >
                        <option value={OFFER_STATUS.PENDING}>Pending</option>
                        <option value={OFFER_STATUS.ACCEPTED}>Accepted</option>
                        <option value="Freight Dispatched">Dispatched</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {o.truckNo ? (
                        <div className="font-mono text-slate-700">
                          <Truck className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                          {o.truckNo} ({o.driverName})
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not Dispatched</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOfferForChat(o)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                        title="View Chat / Send Admin Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(o.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer"
                        title="Delete Offer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 6: SETTLEMENTS & AUDITS
      ========================================================= */}
      {activeTab === 'trades' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Completed Settlements & Trade Contracts</h2>
            <span className="text-xs font-semibold text-slate-500">{trades.length} Settled Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Trade Contract</th>
                  <th className="py-3 px-4">Buyer & Farmer</th>
                  <th className="py-3 px-4">Settled Amount</th>
                  <th className="py-3 px-4">Gate Pass</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trades.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-xs">
                      {t.id}
                      <div className="text-[11px] text-slate-400 font-normal">{t.crop}</div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="font-semibold text-slate-900">{t.buyerName}</div>
                      <div className="text-slate-500">Farmer: {t.farmerName}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      ₹{t.finalAmount || t.payoutAmount || '21,673'}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">
                      {t.gatePassNo || 'GP-2026-NASHIK'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        {t.status || 'Settled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 7: SYSTEM AUDIT LEDGER
      ========================================================= */}
      {activeTab === 'audits' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">System Audit Log</h2>
            <span className="text-xs font-semibold text-slate-500">{audits.length} Recorded Events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Reason / Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {[...audits].reverse().map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {a.timestamp ? new Date(a.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-800">
                      {a.eventType}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {a.actorName} ({a.actorRole})
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {a.reason || 'State update'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: ADD / EDIT MANDI
      ========================================================= */}
      <Modal
        isOpen={isMandiModalOpen}
        onClose={() => setIsMandiModalOpen(false)}
        title={editingMandi ? 'Edit APMC Mandi Details' : 'Register New APMC Mandi Yard'}
      >
        <form onSubmit={handleSaveMandi} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Mandi Yard Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dhule APMC Main Yard"
              value={mandiForm.name}
              onChange={(e) => setMandiForm({ ...mandiForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">District</label>
              <input
                type="text"
                value={mandiForm.district}
                onChange={(e) => setMandiForm({ ...mandiForm, district: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State</label>
              <input
                type="text"
                value={mandiForm.state}
                onChange={(e) => setMandiForm({ ...mandiForm, state: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Email</label>
              <input
                type="email"
                placeholder="e.g. dhule@gmail.com"
                value={mandiForm.email}
                onChange={(e) => setMandiForm({ ...mandiForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Password</label>
              <input
                type="text"
                placeholder="govt123"
                value={mandiForm.password}
                onChange={(e) => setMandiForm({ ...mandiForm, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Commodity</label>
              <input
                type="text"
                value={mandiForm.commodity}
                onChange={(e) => setMandiForm({ ...mandiForm, commodity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Modal Rate (₹/q)</label>
              <input
                type="number"
                value={mandiForm.modalPrice}
                onChange={(e) => setMandiForm({ ...mandiForm, modalPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Arrival Qty</label>
              <input
                type="text"
                value={mandiForm.arrivalQty}
                onChange={(e) => setMandiForm({ ...mandiForm, arrivalQty: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMandiModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
            >
              Save APMC Mandi
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================
          MODAL: ADD / EDIT USER
      ========================================================= */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUser ? 'Edit User Credentials' : 'Create New User Account'}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name / Entity Name *</label>
            <input
              type="text"
              required
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email *</label>
              <input
                type="email"
                required
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              >
                <option value="farmer">Farmer</option>
                <option value="buyer">Buyer</option>
                <option value="mandi">Mandi Official</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
              <input
                type="text"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile</label>
              <input
                type="text"
                value={userForm.mobile}
                onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
            >
              Save User
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================
          MODAL: EDIT CROP LOT
      ========================================================= */}
      <Modal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        title={`Edit Crop Lot #${editingCrop?.id || ''}`}
      >
        <form onSubmit={handleSaveCrop} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Crop</label>
              <input
                type="text"
                value={cropForm.crop}
                onChange={(e) => setCropForm({ ...cropForm, crop: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Variety</label>
              <input
                type="text"
                value={cropForm.variety}
                onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantity (kg)</label>
              <input
                type="number"
                value={cropForm.quantityKg}
                onChange={(e) => setCropForm({ ...cropForm, quantityKg: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expected Rate (₹/q)</label>
              <input
                type="number"
                value={cropForm.expectedPrice}
                onChange={(e) => setCropForm({ ...cropForm, expectedPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCropModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
            >
              Update Crop Lot
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================
          MODAL: TRADE CHAT & ADMIN BROADCAST
      ========================================================= */}
      <Modal
        isOpen={!!selectedOfferForChat}
        onClose={() => setSelectedOfferForChat(null)}
        title={`Offer #${selectedOfferForChat?.id || ''} Message Ledger`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-slate-900">{selectedOfferForChat?.crop} ({selectedOfferForChat?.quantity})</div>
            <div className="text-slate-500">
              Farmer: <span className="font-semibold text-slate-800">{selectedOfferForChat?.farmerName}</span> ↔ Buyer: <span className="font-semibold text-slate-800">{selectedOfferForChat?.buyerName}</span>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-slate-50/50 rounded-xl border border-slate-100">
            {(!selectedOfferForChat?.messages || selectedOfferForChat.messages.length === 0) ? (
              <p className="text-xs text-slate-400 text-center py-4 italic">No chat messages logged in this negotiation.</p>
            ) : (
              selectedOfferForChat.messages.map((m, idx) => (
                <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs shadow-2xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold text-slate-700">{m.sender} ({m.senderRole})</span>
                    <span>{m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ''}</span>
                  </div>
                  <p className="text-slate-800">{m.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendAdminChat} className="flex gap-2">
            <input
              type="text"
              placeholder="Post administrative notice..."
              value={adminChatMessage}
              onChange={(e) => setAdminChatMessage(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
            >
              Post Notice
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
