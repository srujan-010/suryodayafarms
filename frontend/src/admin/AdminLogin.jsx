import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminAuthStore } from '../store/useAdminAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { FiMail, FiLock, FiAlertCircle, FiShield } from 'react-icons/fi';
import { GiSun } from 'react-icons/gi';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || 'dashboard';

  // Global Admin Store
  const { adminLogin, isAdminLoading, adminError, isAdminAuthenticated, clearAdminError, checkAdminAuth } = useAdminAuthStore();
  const { settings, fetchSettings } = useSettingsStore();

  // Local Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientError, setClientError] = useState(null);

  // Check existing session on mount
  useEffect(() => {
    checkAdminAuth();
    fetchSettings();
  }, []);

  const domain = settings?.email ? settings.email.split('@')[1] : 'suryodayafarms.com';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate(`/admin/${redirectPath}`);
    }
  }, [isAdminAuthenticated, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientError(null);
    clearAdminError();

    if (!email || !password) {
      setClientError('Please fill in all security parameters.');
      return;
    }

    const res = await adminLogin(email, password);
    if (res.success) {
      navigate(`/admin/${redirectPath}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#37411A] flex items-center justify-center px-4 relative overflow-hidden font-sans selection:bg-[#B8833E] selection:text-[#F7F4ED]">
      
      {/* Blurred background radial glow lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#5C6B2F]/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#B8833E]/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Login Card Panel */}
      <div className="w-full max-w-md bg-[#F9F6F0]/95 border border-[#EDE7D9] rounded-[32px] p-8 sm:p-10 shadow-xl relative z-10 backdrop-blur-md">
        
        {/* Glowing border ring effect */}
        <div className="absolute inset-0 rounded-[32px] border border-gradient-to-tr from-[#B8833E]/10 via-transparent to-[#5C6B2F]/10 pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col gap-6 text-center">
          
          {/* Header Branding */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[#EDE7D9]/50 border border-[#EDE7D9] flex items-center justify-center relative overflow-hidden group shadow-sm">
              <img 
                src="https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png" 
                alt="Suryodaya Farms Logo" 
                className="w-12 h-12 object-contain group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-[#B8833E]/5 opacity-35 blur-sm" />
            </div>
            
            <div className="space-y-1 mt-2">
              <h2 className="font-serif text-2xl font-bold tracking-widest text-[#37411A] uppercase">
                {settings?.companyName ? settings.companyName.split(' ')[0] : 'SURYODAYA'}
              </h2>
              <span className="font-sans text-[8px] font-extrabold tracking-[0.35em] text-[#B8833E] uppercase block">
                Administrative Workspace
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-[11px] text-stone-500 max-w-xs mx-auto font-light leading-relaxed">
            Access to this administrative space is restricted. Authenticate using master credentials to access the CMS dashboard.
          </p>

          {/* Error Alert Display */}
          {(clientError || adminError) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-left animate-shake">
              <FiAlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span className="text-[10px] font-semibold text-red-650 leading-normal">
                {clientError || adminError}
              </span>
            </div>
          )}

          {/* Login Form */}
          <form noValidate onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[9px] font-extrabold tracking-widest uppercase text-[#B8833E] pl-1">Master Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`admin@${domain}`}
                  className="w-full bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 pl-11 pr-5 font-sans text-xs text-[#37411A] placeholder-stone-400 focus:outline-none focus:border-[#5C6B2F] focus:ring-1 focus:ring-[#5C6B2F] transition duration-300"
                  required
                  disabled={isAdminLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[9px] font-extrabold tracking-widest uppercase text-[#B8833E] pl-1">Cryptographic Key (Password)</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 pl-11 pr-5 font-sans text-xs text-[#37411A] placeholder-stone-400 focus:outline-none focus:border-[#5C6B2F] focus:ring-1 focus:ring-[#5C6B2F] transition duration-300"
                  required
                  disabled={isAdminLoading}
                />
              </div>
            </div>

            {/* Submit Trigger */}
            <button
              type="submit"
              disabled={isAdminLoading}
              className="w-full py-4 bg-[#5C6B2F] hover:bg-[#37411A] text-white disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed font-sans text-xs font-bold tracking-widest uppercase rounded-xl transition duration-300 flex items-center justify-center space-x-2 shadow mt-6 cursor-pointer border-none"
            >
              {isAdminLoading ? (
                <div className="flex items-center space-x-2">
                  <GiSun className="text-lg animate-spin" />
                  <span>Decrypting Credentials...</span>
                </div>
              ) : (
                <>
                  <FiShield className="w-4 h-4" />
                  <span>Secure Admin Login</span>
                </>
              )}
            </button>

          </form>

          {/* Quick links details */}
          <div className="pt-2 border-t border-[#EDE7D9] flex items-center justify-between text-[9px] font-extrabold tracking-wider text-stone-400 uppercase">
            <button 
              type="button" 
              onClick={() => navigate('/')} 
              className="hover:text-[#5C6B2F] transition cursor-pointer bg-transparent border-none"
            >
              ← Back to Storefront
            </button>
            <span className="text-[#5C6B2F] flex items-center">
              ● SECURE PORTAL
            </span>
          </div>

        </div>

      </div>
      
    </div>
  );
}
