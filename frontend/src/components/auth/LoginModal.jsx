import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { SuccessState } from './SuccessState';

export const LoginModal = () => {
  const navigate = useNavigate();
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    authModalTab,
    login,
    register,
    checkoutResumeRedirect,
    setCheckoutResumeRedirect,
  } = useAuthStore();

  // Step: 'form' | 'success'
  const [step, setStep] = useState('form');
  // Tabs: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState('login');

  // Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalTab || 'login');
    } else {
      setStep('form');
      setName('');
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setApiError('');
      setIsActionLoading(false);
    }
  }, [isAuthModalOpen, authModalTab]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Validations
    if (!email || !password) {
      setApiError('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setApiError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setApiError('Password must be at least 6 characters long.');
      return;
    }

    if (activeTab === 'signup' && !name) {
      setApiError('Name is required.');
      return;
    }

    setIsActionLoading(true);

    try {
      let res;
      if (activeTab === 'login') {
        res = await login(email, password);
      } else {
        res = await register(name, email, password);
      }

      if (res.success) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          setUserName(currentUser.name || currentUser.email || '');
        }
        
        setStep('success');

        setTimeout(() => {
          setAuthModalOpen(false);
          if (checkoutResumeRedirect) {
            navigate(checkoutResumeRedirect);
            setCheckoutResumeRedirect(null);
          } else {
            window.location.reload();
          }
        }, 2200);
      } else {
        setApiError(res.message);
      }
    } catch (err) {
      setApiError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setAuthModalOpen(false)}
        className="absolute inset-0 bg-[#2F3B0C]/40 backdrop-blur-md"
      />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 260 }}
        className="relative w-full max-w-md md:max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-[#EAE4D8] z-10 text-left max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-y-visible"
      >
        {/* Left Side: Premium Agriculture Sunrise Panel */}
        <div className="relative w-full md:w-1/2 bg-gradient-to-tr from-[#2F3B0C] via-[#4E641A] to-[#C68A2B]/80 flex-col justify-between p-8 text-[#F6F3ED] overflow-hidden select-none hidden md:flex">
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#C68A2B]/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#F6F3ED]/5 blur-2xl" />

          {/* Logo Brand */}
          <div className="relative flex items-center space-x-2.5 z-10">
            <img 
              src="https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png" 
              alt="Suryodaya Farms Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="font-serif text-base font-bold tracking-widest text-[#F6F3ED] uppercase">
              Suryodaya Farms
            </span>
          </div>

          {/* Branding Copy */}
          <div className="relative z-10 my-auto py-10">
            <motion.h4 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="font-serif text-2xl font-semibold leading-snug text-white mb-3"
            >
              Nurturing Soil.<br />Delivering Health.
            </motion.h4>
            <p className="text-stone-200 text-xxs leading-relaxed max-w-[260px] font-semibold">
              Every purchase preserves nature. Handcrafted luxury farm produce sourced directly from restorative soil systems.
            </p>
          </div>

          {/* Pillars */}
          <div className="relative z-10 grid grid-cols-2 gap-4 text-[9px] font-bold tracking-wider text-stone-300 border-t border-[#F6F3ED]/10 pt-5 uppercase">
            <div className="flex items-center space-x-1.5">
              <span className="text-[#C68A2B] text-xs">✓</span>
              <span>100% Organic</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[#C68A2B] text-xs">✓</span>
              <span>Direct Sourcing</span>
            </div>
          </div>
        </div>

        {/* Right Side: Inputs */}
        <div className="relative w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-white w-full">
          <button
            onClick={() => setAuthModalOpen(false)}
            disabled={isActionLoading && step !== 'success'}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>

          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-750 text-xxs font-bold flex items-start"
            >
              <span className="mr-2">⚠️</span>
              <span>{apiError}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div
                key="auth-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="w-full flex flex-col"
              >
                {/* Header Tabs */}
                <div className="flex border-b border-stone-200 mb-6">
                  <button
                    onClick={() => {
                      setActiveTab('login');
                      setApiError('');
                    }}
                    className={`pb-3 pr-6 text-xs font-serif font-bold tracking-wide transition relative cursor-pointer ${
                      activeTab === 'login' ? 'text-[#2F3B0C]' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    Login
                    {activeTab === 'login' && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-6 h-0.5 bg-[#4E641A]"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('signup');
                      setApiError('');
                    }}
                    className={`pb-3 px-6 text-xs font-serif font-bold tracking-wide transition relative cursor-pointer ${
                      activeTab === 'signup' ? 'text-[#2F3B0C]' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    Create Account
                    {activeTab === 'signup' && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#4E641A]"
                      />
                    )}
                  </button>
                </div>

                <div className="mb-4">
                  <h3 className="font-serif text-sm font-semibold text-[#2F3B0C] mb-1">
                    {activeTab === 'login' ? 'Welcome Back' : 'Join Suryodaya Farms'}
                  </h3>
                  <p className="text-[10px] text-stone-500 font-semibold">
                    {activeTab === 'login' 
                      ? 'Sign in to access your direct farm delivery and loyalty coins.' 
                      : 'Register your email to enjoy organic harvest and member benefits.'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name field (Signup only) */}
                  {activeTab === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative"
                    >
                      <label className="block text-[9px] font-bold tracking-wider uppercase text-stone-500 mb-1">
                        Full Name
                      </label>
                      <div className="flex items-center w-full bg-stone-50 border border-stone-200 rounded-xl overflow-hidden focus-within:border-[#4E641A] transition duration-200">
                        <div className="pl-4 py-3 text-stone-400">
                          {/* User Icon */}
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                          disabled={isActionLoading}
                          className="w-full px-3 py-2 bg-transparent text-stone-800 text-xxs font-semibold placeholder-stone-400 focus:outline-none"
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Email field */}
                  <div className="relative">
                    <label className="block text-[9px] font-bold tracking-wider uppercase text-stone-500 mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center w-full bg-stone-50 border border-stone-200 rounded-xl overflow-hidden focus-within:border-[#4E641A] transition duration-200">
                      <div className="pl-4 py-3 text-stone-400">
                        {/* Mail Icon */}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@example.com"
                        disabled={isActionLoading}
                        className="w-full px-3 py-2 bg-transparent text-stone-800 text-xxs font-semibold placeholder-stone-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="relative">
                    <label className="block text-[9px] font-bold tracking-wider uppercase text-stone-500 mb-1">
                      Password
                    </label>
                    <div className="flex items-center w-full bg-stone-50 border border-stone-200 rounded-xl overflow-hidden focus-within:border-[#4E641A] transition duration-200">
                      <div className="pl-4 py-3 text-stone-400">
                        {/* Lock Icon */}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isActionLoading}
                        className="w-full px-3 py-2 bg-transparent text-stone-800 text-xxs font-semibold placeholder-stone-400 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="pr-4 py-3 text-stone-400 hover:text-stone-600 transition cursor-pointer"
                      >
                        {showPassword ? (
                          /* EyeOff Icon */
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          /* Eye Icon */
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isActionLoading}
                    className="w-full relative py-3.5 mt-2 bg-[#4E641A] hover:bg-[#2F3B0C] disabled:bg-stone-300 disabled:cursor-not-allowed text-[#F6F3ED] font-bold text-xs tracking-widest uppercase rounded-xl transition duration-300 shadow flex items-center justify-center cursor-pointer"
                  >
                    {isActionLoading ? (
                      <div className="flex items-center space-x-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500 font-semibold">
                  <span className="flex items-center">
                    <span className="text-[#C68A2B] mr-1">🛡️</span>
                    Secure 256-Bit SSL Encryption
                  </span>
                  <span>Soil First Organic</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success-checkmark"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <SuccessState 
                  message={activeTab === 'login' ? 'Sign In Successful' : 'Account Created successfully'} 
                  name={userName} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
