import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import FarmerLayout from '../layouts/FarmerLayout';
import BuyerLayout from '../layouts/BuyerLayout';
import MandiLayout from '../layouts/MandiLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Farmer Pages
import FarmerDashboard from '../pages/farmer/FarmerDashboard';
import MandiPrices from '../pages/farmer/MandiPrices';
import MarketDetails from '../pages/farmer/MarketDetails';
import HistoricalPrices from '../pages/farmer/HistoricalPrices';
import Recommendations from '../pages/farmer/Recommendations';
import ProfitCalculator from '../pages/farmer/ProfitCalculator';
import BuyerMarketplace from '../pages/farmer/BuyerMarketplace';
import BuyerDetails from '../pages/farmer/BuyerDetails';
import FarmerOffers from '../pages/farmer/FarmerOffers';
import FarmerProfile from '../pages/farmer/FarmerProfile';

// Buyer Pages
import BuyerDashboard from '../pages/buyer/BuyerDashboard';
import BuyerRequirements from '../pages/buyer/BuyerRequirements';
import CreateRequirement from '../pages/buyer/CreateRequirement';
import BuyerMatches from '../pages/buyer/BuyerMatches';
import BuyerOffers from '../pages/buyer/BuyerOffers';
import BuyerProfile from '../pages/buyer/BuyerProfile';

// Mandi Pages
import MandiDashboard from '../pages/mandi/MandiDashboard';

// Admin Pages & Layout
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Farmer Routes */}
      <Route
        element={
          <ProtectedRoute requiredRole="farmer">
            <FarmerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/markets" element={<MandiPrices />} />
        <Route path="/farmer/markets/:marketId" element={<MarketDetails />} />
        <Route path="/farmer/prices" element={<HistoricalPrices />} />
        <Route path="/farmer/recommendations" element={<Recommendations />} />
        <Route path="/farmer/profit-calculator" element={<ProfitCalculator />} />
        <Route path="/farmer/buyers" element={<BuyerMarketplace />} />
        <Route path="/farmer/buyers/:buyerId" element={<BuyerDetails />} />
        <Route path="/farmer/offers" element={<FarmerOffers />} />
        <Route path="/farmer/profile" element={<FarmerProfile />} />
      </Route>

      {/* Buyer Routes */}
      <Route
        element={
          <ProtectedRoute requiredRole="buyer">
            <BuyerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/buyer/requirements" element={<BuyerRequirements />} />
        <Route path="/buyer/requirements/create" element={<CreateRequirement />} />
        <Route path="/buyer/matches" element={<BuyerMatches />} />
        <Route path="/buyer/offers" element={<BuyerOffers />} />
        <Route path="/buyer/profile" element={<BuyerProfile />} />
      </Route>

      {/* Mandi Official Routes */}
      <Route
        element={
          <ProtectedRoute requiredRole="mandi">
            <MandiLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/mandi/dashboard" element={<MandiDashboard />} />
        <Route path="/mandi/rates" element={<MandiPrices />} />
        <Route path="/mandi/markets/:marketId" element={<MarketDetails />} />
        <Route path="/mandi/profile" element={<FarmerProfile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
