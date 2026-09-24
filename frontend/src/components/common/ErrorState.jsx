import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({ message = 'Unable to load this information.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3 shadow-2xs">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-base font-black text-slate-900 mb-1">Unable to Load Data</h4>
        <p className="text-xs text-rose-800 font-medium max-w-md">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-rose-100 text-rose-700 text-xs font-extrabold px-4 py-2 rounded-xl transition-all border border-rose-300 shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
