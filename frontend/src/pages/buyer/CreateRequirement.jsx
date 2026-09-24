import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import buyerService from '../../services/buyerService';
import locationService from '../../services/locationService';
import { DollarSign, CheckCircle2, Navigation, Loader2, MapPin } from 'lucide-react';

export const CreateRequirement = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      crop: 'Onion',
      variety: 'Nasik Red',
      quantityRequired: '5 Tonnes (50 Quintals)',
      minQuality: 'Grade A Premium',
      requiredDate: new Date(Date.now() + 604800000).toISOString().split('T')[0],
      location: 'Sinnar, Nashik',
      offerPrice: 3400,
      additionalRequirements: 'Sorted size 45mm+, low moisture content for processing.'
    }
  });

  const handleDetectGps = async () => {
    setDetectingGps(true);
    setGpsStatus('Accessing device GPS location...');
    try {
      const locDetails = await locationService.detectLocation();
      setValue('location', locDetails.name);
      setGpsStatus(`GPS detected: ${locDetails.name}`);
    } catch (err) {
      setGpsStatus(err.message || 'Location error.');
    } finally {
      setDetectingGps(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await buyerService.createRequirement(data);
      setPublished(true);
      setTimeout(() => {
        navigate('/buyer/requirements');
      }, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Publish Sourcing Requirement</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Post your bulk crop buying requirements to match with verified regional farmers in real time.
        </p>
      </div>

      {published ? (
        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-3xl text-center space-y-3 shadow-2xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
          <h3 className="text-xl font-black text-slate-900">Requirement Published!</h3>
          <p className="text-xs text-slate-600 font-medium">
            Broadcast complete! Nearby farmers will see your requirement on their dashboard.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Crop Needed</label>
              <select
                {...register('crop')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              >
                <option value="Onion">Onion</option>
                <option value="Tomato">Tomato</option>
                <option value="Potato">Potato</option>
                <option value="Paddy">Paddy</option>
                <option value="Cotton">Cotton</option>
                <option value="Chilli">Chilli</option>
                <option value="Wheat">Wheat</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Variety</label>
              <input
                type="text"
                {...register('variety')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required Quantity</label>
              <input
                type="text"
                {...register('quantityRequired')}
                placeholder="e.g. 5 Tonnes (50 Quintals)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Offer Price (₹ / quintal)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <input
                  type="number"
                  {...register('offerPrice')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Quality Grade</label>
              <select
                {...register('minQuality')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              >
                <option value="Grade A Premium">Grade A Premium</option>
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required By Date</label>
              <input
                type="date"
                {...register('requiredDate')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Warehouse / Delivery Location (GPS)</label>
            <div className="space-y-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <input
                  type="text"
                  {...register('location')}
                  placeholder="City, District, State"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-28 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
                />
                <button
                  type="button"
                  onClick={handleDetectGps}
                  disabled={detectingGps}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  {detectingGps ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3 text-emerald-700" />}
                  <span>{detectingGps ? 'Detecting...' : 'Detect GPS'}</span>
                </button>
              </div>
              {gpsStatus && <p className="text-[11px] text-emerald-700 font-semibold">{gpsStatus}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Additional Requirements</label>
            <textarea
              rows={3}
              {...register('additionalRequirements')}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/buyer/requirements')}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-semibold rounded-xl bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-2xs transition-colors"
            >
              {submitting ? 'Broadcasting...' : 'Publish Requirement Live'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateRequirement;
