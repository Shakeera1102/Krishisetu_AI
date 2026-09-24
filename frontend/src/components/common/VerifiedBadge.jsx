import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const VerifiedBadge = ({ text = 'Verified Buyer' }) => {
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2 py-0.5 rounded-md">
      <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-slate-900" />
      <span>{text}</span>
    </span>
  );
};

export default VerifiedBadge;
