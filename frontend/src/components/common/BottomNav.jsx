import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, Users, Handshake, User } from 'lucide-react';

export const BottomNav = () => {
  const links = [
    { to: '/farmer/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/farmer/markets', label: 'Markets', icon: Store },
    { to: '/farmer/buyers', label: 'Buyers', icon: Users },
    { to: '/farmer/offers', label: 'Offers', icon: Handshake },
    { to: '/farmer/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
