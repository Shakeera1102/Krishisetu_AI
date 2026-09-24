import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Sprout, UserCheck, Building2, ShieldCheck } from 'lucide-react';

export const RegisterPage = () => {
  const { register: registerAuth } = useAuth() || {};
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = { ...data, role: 'farmer' };
      await registerAuth(payload);
      navigate('/farmer/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-10 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 w-full max-w-xl p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-600/20">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Create Farmer Account</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Register your farm to access live Mandi intelligence & connect with procurement yards</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                placeholder="Shaik Jakeera"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
              {errors.name && <span className="text-[11px] text-red-600 mt-1 block font-medium">{errors.name.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                {...register('mobile', { required: 'Mobile is required' })}
                placeholder="+91 98480 12345"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
              {errors.mobile && <span className="text-[11px] text-red-600 mt-1 block font-medium">{errors.mobile.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="farmer@example.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
              {errors.email && <span className="text-[11px] text-red-600 mt-1 block font-medium">{errors.email.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
              {errors.password && <span className="text-[11px] text-red-600 mt-1 block font-medium">{errors.password.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                {...register('state')}
                defaultValue="Maharashtra"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
              <input
                type="text"
                {...register('district')}
                defaultValue="Nashik"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Village</label>
              <input
                type="text"
                {...register('village')}
                placeholder="Pimplegaon"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Language</label>
              <select
                {...register('preferredLanguage')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              >
                <option value="Marathi">Marathi</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Telugu">Telugu</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Farm Size (Optional)</label>
              <input
                type="text"
                {...register('farmSize')}
                placeholder="e.g. 5 Acres"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4"
          >
            <UserCheck className="w-4 h-4" />
            <span>{submitting ? 'Creating Account...' : 'Complete Farmer Registration'}</span>
          </button>
        </form>

        {/* Pre-Authorized Government Mandi Official Notice */}
        <div className="mt-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Government APMC Mandi Official?</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
            APMC Mandi Official accounts are pre-authorized directly from the Agmarknet Government Portal. No registration required.
          </p>
          <Link to="/login?role=mandi" className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold hover:underline pt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sign In with Government Mandi Credentials →</span>
          </Link>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 font-medium pt-4 border-t border-slate-200">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-700 font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
