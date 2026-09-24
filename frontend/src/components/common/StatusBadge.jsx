import React from 'react';

export const StatusBadge = ({ status = 'PENDING' }) => {
  const norm = String(status || '').toLowerCase().trim();

  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (norm.includes('completed') || norm === 'sold') {
    style = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black';
  } else if (norm.includes('accepted')) {
    style = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-extrabold';
  } else if (norm.includes('transit') || norm.includes('dispatched')) {
    style = 'bg-indigo-50 text-indigo-800 border-indigo-200 font-extrabold';
  } else if (norm.includes('verified') || norm.includes('delivery')) {
    style = 'bg-teal-50 text-teal-800 border-teal-200 font-extrabold';
  } else if (norm.includes('superceded') || norm.includes('superseded')) {
    style = 'bg-slate-100 text-slate-600 border-slate-300 font-medium';
  } else if (norm.includes('rejected') || norm.includes('declined')) {
    style = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
  } else if (norm.includes('cancelled')) {
    style = 'bg-slate-100 text-slate-500 border-slate-200 font-medium';
  } else if (norm.includes('pending') || norm === 'sent' || norm === 'received' || norm.includes('offer')) {
    style = 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
