import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  ExternalLink,
  Compass,
  Clock,
  Truck,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const LiveRouteMap = ({
  mandiName = 'APMC Mandi Yard',
  mandiId = 'm-4',
  originName = 'Nashik, Maharashtra',
  originCoords = { lat: 20.0059, lng: 73.7898 },
  destCoords = { lat: 18.4975, lng: 73.8654 },
  distanceKm = 25,
  transportCost = 501,
  managerName = 'Shri V. R. Shinde (APMC Yard Manager)',
  phone = '+91 94222 10001',
  operatingHours = '05:00 AM - 06:00 PM'
}) => {
  const [showTurnByTurn, setShowTurnByTurn] = useState(false);

  const hasValidCoords =
    originCoords &&
    typeof originCoords.lat === 'number' &&
    typeof originCoords.lng === 'number' &&
    destCoords &&
    typeof destCoords.lat === 'number' &&
    typeof destCoords.lng === 'number';

  if (!hasValidCoords) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black text-slate-900">Route Information Unavailable</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
          GPS coordinates for {mandiName} could not be determined. Please verify your origin location or contact APMC helpline.
        </p>
      </div>
    );
  }

  const googleMapsRouteUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    originName
  )}&destination=${destCoords.lat},${destCoords.lng}&travelmode=driving`;

  const mapEmbedUrl = `https://maps.google.com/maps?saddr=${originCoords.lat},${originCoords.lng}&daddr=${destCoords.lat},${destCoords.lng}&output=embed`;

  const estMins = Math.round(distanceKm * 1.8);

  const turnByTurnSteps = [
    { distance: '0.0 km', instruction: `Start from farm origin at ${originName}. Head towards State Highway.` },
    { distance: `${(distanceKm * 0.25).toFixed(1)} km`, instruction: 'Merge onto APMC Express Highway / NH Trunk Road.' },
    { distance: `${(distanceKm * 0.75).toFixed(1)} km`, instruction: `Take exit towards ${mandiName.split('(')[0]} Main Gate.` },
    { distance: `${distanceKm} km`, instruction: `Arrive at ${mandiName} Security Weighbridge & Gate Entry.` }
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl shadow-lg overflow-hidden space-y-0">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-1.5 border border-emerald-400/30">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live GPS Route & Location Navigation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Route to {mandiName}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium mt-1">
            <span>From: <strong className="text-white">{originName}</strong></span>
            <span>•</span>
            <span>Distance: <strong className="text-emerald-400">{distanceKm} km</strong></span>
            <span>•</span>
            <span>Est. Transit: <strong className="text-amber-300">~{estMins} mins</strong></span>
          </div>
        </div>

        <a
          href={googleMapsRouteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold px-5 py-3 rounded-2xl shadow-md transition-all hover:scale-105 shrink-0 cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
          <span>Launch Full Google Maps Navigation</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Embedded Live Google Maps Frame */}
      <div className="relative w-full h-80 sm:h-96 bg-slate-100 border-y border-slate-200">
        <iframe
          title={`Route to ${mandiName}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={mapEmbedUrl}
          className="w-full h-full"
        ></iframe>

        {/* Live Route Status Overlay Badge */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-slate-200/80 p-3 rounded-2xl shadow-lg max-w-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Live Route Active</span>
          </div>
          <div className="text-xs text-slate-700 font-medium space-y-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Freight Cost:</span>
              <strong className="text-slate-900 font-black">{formatCurrency(transportCost)}</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Gate Entry Hours:</span>
              <strong className="text-emerald-700 font-bold">{operatingHours}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Route Details & Mandi Manager Contact Footer */}
      <div className="p-5 sm:p-6 bg-slate-50 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Origin Farm</span>
              <strong className="text-xs text-slate-900 block font-bold">{originName}</strong>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Transit Corridor</span>
              <strong className="text-xs text-slate-900 block font-bold">NH Express • {distanceKm} km (~{estMins} mins)</strong>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Mandi Manager Helpline</span>
              <strong className="text-xs text-slate-900 block font-bold">{phone} ({managerName.split('(')[0]})</strong>
            </div>
          </div>
        </div>

        {/* Accordion: Turn-by-Turn Waypoint Directions */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          <button
            onClick={() => setShowTurnByTurn(!showTurnByTurn)}
            className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>View Turn-by-Turn Driving Directions to Mandi Gate</span>
            </div>
            {showTurnByTurn ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showTurnByTurn && (
            <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50/50">
              {turnByTurnSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">{step.distance}</span>
                    <p className="text-slate-800 font-medium">{step.instruction}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveRouteMap;
