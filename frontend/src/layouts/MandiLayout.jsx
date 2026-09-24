import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Footer from '../components/common/Footer';
import { FarmerProvider } from '../context/FarmerContext';

export const MandiLayout = () => {
  return (
    <FarmerProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-16 md:pb-0">
        <Navbar />
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar role="mandi" />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
        <BottomNav />
        <Footer />
      </div>
    </FarmerProvider>
  );
};

export default MandiLayout;
