import React from 'react';
import { Cpu, AlertCircle, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const PredictionCard = ({ prediction }) => {
  if (!prediction) return null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <span>AI Price Forecast</span>
              <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-purple-200">
                ML Model v2.4
              </span>
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              Predictive intelligence for {prediction.crop}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-500 block font-semibold uppercase">Confidence Score</span>
          <span className="text-lg font-black text-emerald-700">{prediction.confidence}%</span>
        </div>
      </div>

      {/* Forecast Matrix - Green Inner Box */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/70 mb-4 text-center">
        <div>
          <span className="text-[11px] text-slate-600 block uppercase font-bold">Current Price</span>
          <span className="text-lg font-extrabold text-slate-900">
            {formatCurrency(prediction.currentPrice)}
          </span>
        </div>
        <div className="border-x border-emerald-200">
          <span className="text-[11px] text-emerald-800 block uppercase font-bold">3-Day Forecast</span>
          <span className="text-lg font-black text-emerald-700">
            {formatCurrency(prediction.predicted3Days)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-emerald-800 block uppercase font-bold">7-Day Forecast</span>
          <span className="text-lg font-black text-emerald-700">
            {formatCurrency(prediction.predicted7Days)}
          </span>
        </div>
      </div>

      {/* Recommendation Message - Purple Inner Box */}
      <div className="bg-purple-50/90 border border-purple-200 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-900 mb-1">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>AI Decision Support:</span>
        </div>
        <p className="text-xs text-purple-950 font-medium leading-relaxed">{prediction.recommendation}</p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 text-[11px] text-slate-500 border-t border-slate-200 pt-3 font-medium">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>{prediction.disclaimer}</p>
      </div>
    </div>
  );
};

export default PredictionCard;
