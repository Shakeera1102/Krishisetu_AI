import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading market data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-slate-600">
      <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
      <p className="text-sm font-semibold animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
