import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import { useFarmer } from '../../context/FarmerContext';
import farmerService from '../../services/farmerService';
import locationService from '../../services/locationService';
import liveDataStore from '../../services/liveDataStore';
import { MAHARASHTRA_PRESET_LOCATIONS } from '../../services/recommendationService';
import { Sprout, Scale, Calendar, MapPin, Navigation, Loader2 } from 'lucide-react';

export const AnalyzeCropModal = ({ isOpen, onClose, onAnalyze }) => {
  const { selectedCrop, farmerLocation, updateCrop, updateLocation } = useFarmer();
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      name: selectedCrop?.name || 'Maize',
      variety: selectedCrop?.variety || 'Yellow Hybrid',
      quantityKg: selectedCrop?.quantityKg || 3000,
      harvestDate: selectedCrop?.harvestDate || new Date().toISOString().split('T')[0],
      location: farmerLocation?.name || 'Nashik, Maharashtra'
    }
  });

  const handleSelectPresetLocation = (e) => {
    const selectedVal = e.target.value;
    const found = MAHARASHTRA_PRESET_LOCATIONS.find((l) => l.id === selectedVal || l.name === selectedVal);
    if (found) {
      setValue('location', found.name);
      updateLocation(found);
    } else {
      updateLocation({ name: selectedVal });
    }
  };

  const handleDetectGps = async () => {
    setDetectingGps(true);
    setGpsStatus('Accessing device GPS coordinates...');
    try {
      const locDetails = await locationService.detectLocation();
      setValue('location', locDetails.name);
      updateLocation({
        name: locDetails.name,
        lat: locDetails.latitude,
        lng: locDetails.longitude,
        district: locDetails.district,
        state: locDetails.state
      });
      setGpsStatus(`GPS detected: ${locDetails.name}`);
    } catch (err) {
      setGpsStatus(err.message || 'GPS location error. Using default location.');
    } finally {
      setDetectingGps(false);
    }
  };

  const onSubmit = async (data) => {
    const cropPayload = {
      name: data.name,
      variety: data.variety || 'Standard',
      quantityKg: Number(data.quantityKg),
      harvestDate: data.harvestDate,
      location: data.location
    };

    updateCrop(cropPayload);
    liveDataStore.publishFarmerCrop(cropPayload);
    await farmerService.updateCurrentCrop(cropPayload);

    if (onAnalyze) onAnalyze(cropPayload);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Analyze & Publish My Crop Lot">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Select Crop</label>
          <div className="relative">
            <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
            <select
              {...register('name')}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
            >
              <option value="Maize">Maize</option>
              <option value="Onion">Onion</option>
              <option value="Tomato">Tomato</option>
              <option value="Potato">Potato</option>
              <option value="Paddy">Paddy</option>
              <option value="Cotton">Cotton</option>
              <option value="Chilli">Chilli</option>
              <option value="Wheat">Wheat</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Variety</label>
          <input
            type="text"
            {...register('variety')}
            placeholder="e.g. Yellow Hybrid / Nasik Red"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (in Kg)</label>
          <div className="relative">
            <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="number"
              {...register('quantityKg')}
              placeholder="3000"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-medium">
            3,000 kg = 30 Quintals = 3 Tonnes
          </span>
        </div>

        {/* SINGLE Source Location Box */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700">Source Location</label>
            <button
              type="button"
              onClick={handleDetectGps}
              disabled={detectingGps}
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              {detectingGps ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3 text-emerald-700" />}
              <span>{detectingGps ? 'Detecting...' : 'Detect GPS'}</span>
            </button>
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
            <select
              value={farmerLocation?.id || (Array.isArray(MAHARASHTRA_PRESET_LOCATIONS) ? MAHARASHTRA_PRESET_LOCATIONS.find(l => l.name === farmerLocation?.name)?.id : 'nashik') || 'nashik'}
              onChange={handleSelectPresetLocation}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
            >
              {(Array.isArray(MAHARASHTRA_PRESET_LOCATIONS) ? MAHARASHTRA_PRESET_LOCATIONS : []).map((loc) => (
                <option key={loc.id} value={loc.id}>
                  📍 {loc.name}
                </option>
              ))}
            </select>
          </div>
          {gpsStatus && <p className="text-[11px] text-emerald-700 font-semibold mt-1">{gpsStatus}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Harvest Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              {...register('harvestDate')}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Sprout className="w-4 h-4" />
            <span>Publish & Analyze Lot</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AnalyzeCropModal;
