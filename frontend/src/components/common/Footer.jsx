import React from 'react';
import { Sprout, Heart, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative bg-slate-950 text-slate-300 overflow-hidden mt-auto border-t border-slate-800">
      {/* Background Crop Image Overlay */}
      <div className="absolute inset-0 z-0 opacity-20">
        <img
          src="https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1600&q=80"
          alt="Agriculture Field"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/90"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-white text-base tracking-tight">KrishiSetu Platform</span>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              SIH 2026 Innovation Challenge
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 font-medium">
            <span>AI Decision Support</span>
            <span className="text-slate-600">•</span>
            <span>Agmarknet Mandi Feed</span>
            <span className="text-slate-600">•</span>
            <span>Direct Buyer Network</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for Indian Farmers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
