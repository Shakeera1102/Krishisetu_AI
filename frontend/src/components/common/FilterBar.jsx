import React from 'react';
import { Search, MapPin, Filter } from 'lucide-react';

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedCrop,
  onCropChange,
  selectedState,
  onStateChange,
  onLocationClick
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search market, district, commodity..."
          className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors placeholder:text-slate-400"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <select
            value={selectedCrop}
            onChange={(e) => onCropChange(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-600 focus:bg-white"
          >
            <option value="All">All Crops</option>
            <option value="Onion">Onion</option>
            <option value="Tomato">Tomato</option>
            <option value="Potato">Potato</option>
            <option value="Paddy">Paddy</option>
            <option value="Cotton">Cotton</option>
            <option value="Chilli">Chilli</option>
          </select>
        </div>

        <select
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          className="bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-600 focus:bg-white"
        >
          <option value="All">All States</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Delhi">Delhi</option>
          <option value="Andhra Pradesh">Andhra Pradesh</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Punjab">Punjab</option>
        </select>

        {onLocationClick && (
          <button
            onClick={onLocationClick}
            className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all ml-auto md:ml-0 shadow-2xs"
          >
            <MapPin className="w-4 h-4" />
            <span>Use My Location</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
