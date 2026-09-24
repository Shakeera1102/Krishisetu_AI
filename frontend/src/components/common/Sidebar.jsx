import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Users,
  User,
  PlusCircle,
  Target,
  Handshake,
  Building2
} from 'lucide-react';

export const Sidebar = ({ role = 'farmer' }) => {
  const farmerLinks = [
    { to: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/farmer/markets', label: 'Mandi Intelligence', icon: Store },
    { to: '/farmer/buyers', label: 'My Offers & Negotiations', icon: Handshake },
    { to: '/farmer/profile', label: 'My Profile', icon: User },
  ];

  const buyerLinks = [
    { to: '/buyer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/buyer/requirements', label: 'Requirements', icon: Store },
    { to: '/buyer/requirements/create', label: 'Post Requirement', icon: PlusCircle },
    { to: '/buyer/matches', label: 'Farmer Matches', icon: Target },
    { to: '/buyer/offers', label: 'Purchase Offers', icon: Handshake },
    { to: '/buyer/profile', label: 'Company Profile', icon: User },
  ];

  const mandiLinks = [
    { to: '/mandi/dashboard', label: 'Mandi Dashboard', icon: LayoutDashboard },
    { to: '/mandi/rates', label: 'Live Yard Rates', icon: Store },
    { to: '/mandi/profile', label: 'Yard Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Command Center', icon: LayoutDashboard },
    { to: '/admin/dashboard?tab=users', label: 'Manage Users', icon: Users },
    { to: '/admin/dashboard?tab=mandis', label: 'Manage Mandis', icon: Building2 },
    { to: '/admin/dashboard?tab=crops', label: 'Manage Crops', icon: Store },
    { to: '/admin/dashboard?tab=trades', label: 'Trades & Logistics', icon: Handshake },
  ];

  const links = role === 'admin' ? adminLinks : (role === 'mandi' ? mandiLinks : (role === 'buyer' ? buyerLinks : farmerLinks));
  const portalName = role === 'admin' ? 'Master Admin Portal' : (role === 'mandi' ? 'APMC Mandi Portal' : (role === 'buyer' ? 'Buyer Portal' : 'Farmer Portal'));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col min-h-[calc(100vh-4rem)] p-4 shadow-xs">
      <div className="text-xs uppercase tracking-wider text-emerald-800 font-bold px-3 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        {portalName}
      </div>
      <nav className="space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
