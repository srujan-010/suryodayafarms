'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { SuccessState } from './SuccessState';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, X, Sparkles } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    login,
    register,
    checkoutResumeRedirect,
    setCheckoutResumeRedirect,
  } = useAuthStore();

  // Internal steps: 'form' | 'success'
  const [step, setStep] = useState<'form' | 'success'>('form');
  // Tabs: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [userName, setUserName] = useState('');

  // Reset modal state on close/open
  useEffect(() => {
    if (!isAuthModalOpen) {
      setStep('form');
      setActiveTab('login');
      setName('');
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setApiError('');
      setIsActionLoading(false);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
        // Retrieve current store user name for success greeting
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          setUserName(currentUser.name || currentUser.email || '');
        }
        
        setStep('success');

        // Close modal and redirect / refresh after 2 seconds
        setTimeout(() => {
          setAuthModalOpen(false);
          if (checkoutResumeRedirect) {
            window.location.href = checkoutResumeRedirect;
            setCheckoutResumeRedirect(null);
          } else {
            // Soft page reload to trigger session hooks across other pages
            window.location.reload();
          }
        }, 2200);
      } else {
        setApiError(res.message);
      }
    } catch (err: any) {
      setApiError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Glassmorphism */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setAuthModalOpen(false)}
        className="absolute inset-0 bg-[#2F3B0C]/40 backdrop-blur-md"
      />

      {/* Main Premium Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 260 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px] border border-[#EAE4D8] z-10"
      >
        {/* Left Side: Premium Agriculture Sunrise Panel (CSS Landscape Art) */}
        <div className="relative w-full md:w-1/2 bg-gradient-to-tr from-[#2F3B0C] via-[#4E641A] to-[#C68A2B]/80 flex flex-col justify-between p-8 text-[#F6F3ED] overflow-hidden">
          {/* Decorative Sunrise Glowing Sphere */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#C68A2B]/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#F6F3ED]/5 blur-2xl" />

          {/* Luxury Brand Seal */}
          <div className="relative flex items-center space-x-2.5 z-10">
            <img 
              src="https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png" 
              alt="Suryodaya Farms Logo" 
              className="w-9 h-9 object-contain"
            />
            <span className="font-serif text-lg font-bold tracking-widest text-[#F6F3ED] uppercase">
              Suryodaya Farms
            </span>
          </div>

          {/* Inspirational Marketing & Brand Pillars */}
          <div className="relative z-10 my-auto py-10">
            <motion.h4 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="font-serif text-3xl font-semibold leading-snug text-white mb-4"
            >
              Nurturing Soil.<br />Delivering Health.
            </motion.h4>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-stone-200 text-xs leading-relaxed max-w-[280px] font-medium"
            >
              Every purchase preserves nature. Handcrafted luxury farm produce sourced directly from restorative soil systems.
            </motion.p>
          </div>

          {/* Bottom Promises */}
          <div className="relative z-10 grid grid-cols-2 gap-4 text-xxs font-semibold tracking-wider text-stone-300 border-t border-[#F6F3ED]/10 pt-5 text-left">
            <div className="flex items-center space-x-2">
              <span className="text-[#C68A2B] text-base">✓</span>
              <span>100% ORGANIC CERTIFIED</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#C68A2B] text-base">✓</span>
              <span>DIRECT FARM SOURCING</span>
            </div>
          </div>
        </div>

        {/* Right Side: Active Forms Panel */}
        <div className="relative w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white text-left">
          {/* Close button */}
          <button
            onClick={() => setAuthModalOpen(false)}
            disabled={isActionLoading && step !== 'success'}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Api level error banners */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-semibold flex items-start"
            >
              <svg className="w-4 h-4 text-red-500 mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{apiError}</span>
            </motion.div>
          )}

          {/* Form Content Slide Transitions */}
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
                    className={`pb-3 pr-6 text-sm font-serif font-bold tracking-wide transition relative cursor-pointer ${
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
                    className={`pb-3 px-6 text-sm font-serif font-bold tracking-wide transition relative cursor-pointer ${
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
                  <h3 className="font-serif text-xl font-semibold text-[#2F3B0C] mb-1">
                    {activeTab === 'login' ? 'Welcome Back' : 'Join Suryodaya Farms'}
                  </h3>
                  <p className="text-xs text-stone-500">
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
                      <label className="block text-[10px] font-bold tracking-wider uppercase text-stone-500 mb-1">
                        Full Name
                      </label>
                      <div className="flex items-center w-full bg-stone-50 border border-stone-200 rounded-xl overflow-hidden focus-within:border-[#4E641A] transition duration-200">
                        <div className="pl-4 py-3 text-stone-400">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                          disabled={isActionLoading}
                          className="w-full px-3 py-3 bg-transparent text-stone-800 text-xs font-semibold placeholder-stone-400 focus:outline-none"
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Email field */}
                  <div className="relative">
                    <label className="block text-[10px] font-bold tracking-wider uppercase text-stone-500 mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center w-full bg-stone-50 border border-stone-200 rounded-xl overflow-hidden focus-within:border-[#4E641A] transition duration-200">
                      <div className="pl-4 py-3 text-stone-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@example.com"
                        disabled={isActionLoading}
                        className="w-full px-3 py-3 bg-transparent text-stone-800 text-xs font-semibold placeholder-stone-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="relative">
                    <label className="block text-[10px] font-bold tracking-wider uppercase text-stone-500 mb-1">
                      Password
                    </label>
                    <div className="flex items-center w-full bg-stone-50 border border-stone-200 rounded-xl overflow-hidden focus-within:border-[#4E641A] transition duration-200">
                      <div className="pl-4 py-3 text-stone-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isActionLoading}
                        className="w-full px-3 py-3 bg-transparent text-stone-800 text-xs font-semibold placeholder-stone-400 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="pr-4 py-3 text-stone-400 hover:text-stone-600 transition cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

                {/* Footer Disclaimers */}
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
