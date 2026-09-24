import React from 'react';
import { Calculator } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const ProfitCard = ({ result }) => {
  if (!result) return null;

  const grossRevenue = Number(result.grossRevenue) || 0;
  const netReturn = Number(result.netReturn) || 0;
  const quintals = Number(result.quintals) || 10;
  const profitPerQuintal = result.profitPerQuintal ?? (quintals > 0 ? Math.round(netReturn / quintals) : 0);

  const transportCost = result.expenses?.transportCost ?? result.transportCost ?? 0;
  const handlingCost = result.expenses?.handlingCost ?? result.handlingCost ?? 0;
  const storageCost = result.expenses?.storageCost ?? result.storageCost ?? 0;
  const commissionCost = result.expenses?.commissionCost ?? result.commission ?? 0;
  const miscCost = result.expenses?.miscCost ?? result.miscCost ?? 0;
  const totalExpenses = result.expenses?.totalExpenses ?? result.totalDeductions ?? (transportCost + handlingCost + storageCost + commissionCost + miscCost);

  const netMarginPercent = grossRevenue > 0 ? (netReturn / grossRevenue) * 100 : 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <h4 className="font-extrabold text-slate-900 text-sm leading-tight">Net Profit Analysis</h4>
        </div>

        <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-2xs shrink-0">
          Margin: {netMarginPercent.toFixed(1)}%
        </div>
      </div>

      {/* Primary Green Hero Highlight Card */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-4 shadow-md border border-emerald-500/30 space-y-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-extrabold block">
            EST. NET RETURN
          </span>
          <div className="text-2xl font-black text-white leading-tight mt-0.5">
            {formatCurrency(netReturn)}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/15 flex items-center justify-between gap-2">
          <span className="text-[11px] text-emerald-100 font-bold">
            Profit / Quintal:
          </span>
          <div className="text-base font-black text-amber-300 flex items-baseline gap-1">
            <span>{formatCurrency(profitPerQuintal)}</span>
            <span className="text-[11px] text-emerald-200 font-normal">/q</span>
          </div>
        </div>
      </div>

      {/* Expense Items Breakdown */}
      <div className="space-y-1.5 text-xs font-medium">
        <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-slate-700">
          <span>Gross Revenue</span>
          <span className="font-extrabold text-slate-900 text-xs">{formatCurrency(grossRevenue)}</span>
        </div>

        <div className="flex justify-between items-center py-1 text-slate-600">
          <span>(-) Transportation</span>
          <span className="font-semibold">{formatCurrency(transportCost)}</span>
        </div>

        <div className="flex justify-between items-center py-1 text-slate-600">
          <span>(-) Handling & Loading</span>
          <span className="font-semibold">{formatCurrency(handlingCost)}</span>
        </div>

        {storageCost > 0 && (
          <div className="flex justify-between items-center py-1 text-slate-600">
            <span>(-) Storage / Rent</span>
            <span className="font-semibold">{formatCurrency(storageCost)}</span>
          </div>
        )}

        <div className="flex justify-between items-center py-1 text-slate-600">
          <span>(-) Mandi Commission</span>
          <span className="font-semibold">{formatCurrency(commissionCost)}</span>
        </div>

        {miscCost > 0 && (
          <div className="flex justify-between items-center py-1 text-slate-600">
            <span>(-) Misc Expenses</span>
            <span className="font-semibold">{formatCurrency(miscCost)}</span>
          </div>
        )}

        <div className="flex justify-between items-center py-2 border-t border-slate-200 text-slate-900 font-bold text-xs pt-2">
          <span>Total Operational Costs</span>
          <span className="text-rose-600 font-black">-{formatCurrency(totalExpenses)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfitCard;
