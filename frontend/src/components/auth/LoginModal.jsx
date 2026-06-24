import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useFeedbackStore } from '../../store/useFeedbackStore';
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

  // Screen layout steps: 'form' | 'otp-verify' | 'success'
  const [step, setStep] = useState('form');
  // Authentication tabs: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState('login');
  // Login input methods: 'email' | 'phone'
  const [loginMode, setLoginMode] = useState('email');

  // Input Field States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Verification OTP States
  const [otpCode, setOtpCode] = useState(Array(6).fill(''));
  const [otpTimer, setOtpTimer] = useState(30);
  const [isOtpTimerActive, setIsOtpTimerActive] = useState(false);

  // Field display modifiers
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [userName, setUserName] = useState('');

  // Refs for auto-focusing OTP grids
  const otpInputsRef = useRef([]);

  // Accessibility: Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAuthModalOpen(false);
      }
    };
    if (isAuthModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthModalOpen, setAuthModalOpen]);

  // Sync state variables with active session controls
  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalTab || 'login');
      setStep('form');
      setLoginMode('email');
    } else {
      setStep('form');
      setName('');
      setEmail('');
      setPhone('');
      setCountryCode('+91');
      setPassword('');
      setConfirmPassword('');
      setAcceptTerms(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setApiError('');
      setIsActionLoading(false);
      setOtpCode(Array(6).fill(''));
      setIsOtpTimerActive(false);
    }
  }, [isAuthModalOpen, authModalTab]);

  // Countdown timer for OTP resend simulation
  useEffect(() => {
    let interval = null;
    if (isOtpTimerActive && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setIsOtpTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isOtpTimerActive, otpTimer]);

  if (!isAuthModalOpen) return null;

  // Calculate Password Strength points
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { score: 0, label: 'Not Entered', color: 'bg-stone-200', text: 'text-stone-400' };
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 0:
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-orange-500', text: 'text-orange-500' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-[#4E641A]', text: 'text-[#4E641A]' };
      case 5:
        return { score: 5, label: 'Excellent', color: 'bg-[#2F3B0C]', text: 'text-[#2F3B0C]' };
      default:
        return { score: 0, label: '', color: 'bg-stone-200', text: 'text-stone-400' };
    }
  };


  // Phone OTP Sign-In Request Simulation
  const handleRequestOtp = (e) => {
    e.preventDefault();
    setApiError('');

    if (!phone) {
      setApiError('Phone number is required.');
      return;
    }
    if (phone.length < 8) {
      setApiError('Please enter a valid phone number.');
      return;
    }

    setIsActionLoading(true);
    useFeedbackStore.getState().showLoader('Sending secure OTP code...');

    setTimeout(() => {
      setIsActionLoading(false);
      useFeedbackStore.getState().hideLoader();
      setStep('otp-verify');
      setOtpTimer(30);
      setIsOtpTimerActive(true);
      useFeedbackStore.getState().showToast('🔑 Verification code 123456 sent to your phone!', 'success');
    }, 1200);
  };

  // OTP Verification Submission
  const handleVerifyOtp = (e) => {
    if (e) e.preventDefault();
    setApiError('');
    const fullCode = otpCode.join('');

    if (fullCode.length < 6) {
      setApiError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (fullCode !== '123456') {
      setApiError('Invalid OTP code. Please enter 123456.');
      return;
    }

    setIsActionLoading(true);
    useFeedbackStore.getState().showLoader('Authenticating credentials...');

    setTimeout(() => {
      useFeedbackStore.getState().hideLoader();
      setIsActionLoading(false);
      useAuthStore.setState({
        user: { id: 'otp-user', name: 'Premium Harvest Member', email: 'otp.member@suryodayafarms.com', role: 'CUSTOMER' },
        isAuthenticated: true,
        isAuthModalOpen: false
      });
      useFeedbackStore.getState().showToast('✅ Mobile Sign In Successful', 'success');
      setStep('success');
      setUserName('Premium Member');

      setTimeout(() => {
        setAuthModalOpen(false);
        if (checkoutResumeRedirect) {
          navigate(checkoutResumeRedirect);
          setCheckoutResumeRedirect(null);
        } else {
          window.location.reload();
        }
      }, 2200);
    }, 1500);
  };

  const handleResendOtp = () => {
    setOtpTimer(30);
    setIsOtpTimerActive(true);
    setOtpCode(Array(6).fill(''));
    useFeedbackStore.getState().showToast('🔑 A new OTP code 123456 has been sent.', 'success');
  };

  const handleOtpInput = (val, idx) => {
    if (isNaN(val)) return;
    const newCode = [...otpCode];
    newCode[idx] = val.slice(-1);
    setOtpCode(newCode);

    // Auto-focus next input
    if (val !== '' && idx < 5) {
      otpInputsRef.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (otpCode[idx] === '' && idx > 0) {
        const newCode = [...otpCode];
        newCode[idx - 1] = '';
        setOtpCode(newCode);
        otpInputsRef.current[idx - 1]?.focus();
      } else {
        const newCode = [...otpCode];
        newCode[idx] = '';
        setOtpCode(newCode);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...otpCode];
    pastedText.split('').forEach((char, idx) => {
      if (idx < 6) newCode[idx] = char;
    });
    setOtpCode(newCode);
    const focusIdx = Math.min(pastedText.length, 5);
    otpInputsRef.current[focusIdx]?.focus();
  };

  // Standard Email/Password Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Validations
    if (!email) {
      setApiError('Email address is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setApiError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setApiError('Password is required.');
      return;
    }

    if (password.length < 6) {
      setApiError('Password must be at least 6 characters long.');
      return;
    }

    if (activeTab === 'signup') {
      if (!name) {
        setApiError('Name is required.');
        return;
      }
      if (!phone) {
        setApiError('Phone number is required.');
        return;
      }
      if (password !== confirmPassword) {
        setApiError('Passwords do not match.');
        return;
      }
      if (!acceptTerms) {
        setApiError('You must accept the Terms of Service & Privacy Policy.');
        return;
      }
    }

    setIsActionLoading(true);

    try {
      let res;
      if (activeTab === 'login') {
        res = await login(email, password);
      } else {
        // Pass name, email, password to database (ignores phone as it is frontend only)
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

  const pwdStrength = getPasswordStrength(password);

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
        className="relative w-full max-w-md md:max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-[#EAE4D8] z-10 text-left max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-y-visible"
      >
        {/* Left Side: Premium Brand Panel */}
        <div className="relative w-full md:w-5/12 bg-gradient-to-tr from-[#2F3B0C] via-[#4E641A] to-[#C68A2B]/75 flex flex-col justify-between p-8 md:p-10 text-[#F6F3ED] overflow-hidden select-none hidden md:flex">
          {/* Subtle packaging pouch watermarked in background */}
          <div className="absolute inset-0 bg-[url('/pouch.png')] bg-no-repeat bg-center opacity-10 mix-blend-overlay scale-110 pointer-events-none" />
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#C68A2B]/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#F6F3ED]/5 blur-2xl" />

          {/* Logo Brand */}
          <div className="relative flex items-center space-x-3 z-10">
            <img
              src="https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png"
              alt="Suryodaya Farms Logo"
              className="w-9 h-9 object-contain"
            />
            <span className="font-serif text-sm font-bold tracking-widest text-[#F6F3ED] uppercase">
              Suryodaya Farms
            </span>
          </div>

          {/* Branding Copy */}
          <div className="relative z-10 my-auto py-12 space-y-4">
            <motion.h4
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="font-serif text-2xl md:text-3xl font-semibold leading-tight text-white"
            >
              Nurturing Soil.<br />Delivering Health.
            </motion.h4>
            <p className="text-stone-200 text-xxs leading-relaxed max-w-[280px] font-medium">
              Every purchase preserves nature. Handcrafted luxury farm produce sourced directly from restorative soil systems.
            </p>
          </div>

          {/* Pillars List */}
          <div className="relative z-10 space-y-3.5 border-t border-[#F6F3ED]/15 pt-8 text-xxs font-semibold text-stone-200">
            <div className="flex items-center space-x-2.5">
              <span className="text-[#C68A2B] text-sm shrink-0">🌾</span>
              <span>Farm Fresh Products</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="text-[#C68A2B] text-sm shrink-0">📍</span>
              <span>Order Tracking</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="text-[#C68A2B] text-sm shrink-0">🎖️</span>
              <span>Exclusive Member Benefits</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="text-[#C68A2B] text-sm shrink-0">🔒</span>
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>

        {/* Right Side: Inputs */}
        <div className="relative w-full md:w-7/12 p-6 md:p-10 flex flex-col justify-center bg-white">
          <button
            onClick={() => setAuthModalOpen(false)}
            disabled={isActionLoading && step !== 'success'}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer z-25"
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
            {step === 'form' && (
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

                <div className="mb-5">
                  <h3 className="font-serif text-base font-bold text-[#2F3B0C] mb-1">
                    {activeTab === 'login' ? 'Welcome Back' : 'Join Suryodaya Farms'}
                  </h3>
                  <p className="text-[10px] text-stone-500 font-semibold leading-relaxed">
                    {activeTab === 'login'
                      ? 'Sign in to access your direct farm delivery and loyalty coins.'
                      : 'Register your details to enjoy organic harvest and member benefits.'}
                  </p>
                </div>


                {/* Email Sign-In / Sign-Up Form */}
                <form onSubmit={activeTab === 'login' && loginMode === 'phone' ? handleRequestOtp : handleSubmit} className="space-y-4">
                  {/* Name field (Signup only) */}
                  {activeTab === 'signup' && (
                    <div>
                      <label className="block text-[9px] font-bold tracking-wider uppercase text-stone-500 mb-1.5">
                        Full Name
                      </label>
                      <div className="flex items-center w-full bg-stone-50 border border-stone-200 rounded-xl overflow-hidden focus-within:border-[#4E641A] transition duration-200">
                        <div className="pl-4 py-3 text-stone-400">
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
                          className="w-full px-3.5 py-2.5 bg-transparent text-stone-850 text-xxs font-semibold placeholder-stone-400 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Field (Signup, or Login when in Email mode) */}
                  {(activeTab === 'signup' || (activeTab === 'login' && loginMode === 'email')) && (
                    <div>
                      <label className="block text-[9px] font-bold tracking-wider uppercase text-stone-500 mb-1.5">
                        Email Address
                      </label>
                      <div className="flex items-center w-full bg-stone-50 border border-stone-200 rounded-xl overflow-hidden focus-within:border-[#4E641A] transition duration-200">
                        <div className="pl-4 py-3 text-stone-400">
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
                          className="w-full px-3.5 py-2.5 bg-transparent text-stone-850 text-xxs font-semibold placeholder-stone-400 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Phone Field with Country Code selector (+91 default) (Signup, or Login when in OTP mode) */}
                  {(activeTab === 'signup' || (activeTab === 'login' && loginMode === 'phone')) && (
                    <div>
                      <label className="block text-[9px] font-bold tracking-wider uppercase text-stone-500 mb-1.5">
                        Mobile Number
                      </label>
                      <div className="flex gap-2.5">
                        <div className="relative w-28 shrink-0">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="w-full h-full bg-stone-50 border border-stone-200 rounded-xl pl-3.5 pr-8 text-xxs font-bold focus:outline-none focus:border-[#4E641A] appearance-none cursor-pointer text-stone-700 font-sans"
                          >
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+971">🇦🇪 +971</option>
                          </select>
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[7px] text-stone-450 select-none">
                            ▼
                          </div>
                        </div>

                        <div className="flex items-center w-full bg-stone-50 border border-stone-200 rounded-xl overflow-hidden focus-within:border-[#4E641A] transition duration-200">
                          <div className="pl-4 py-3 text-stone-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 10-digit number"
                            disabled={isActionLoading}
                            className="w-full px-3.5 py-2.5 bg-transparent text-stone-850 text-xxs font-semibold placeholder-stone-400 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Password field (Email Login and Signup tabs) */}
                  {(activeTab === 'signup' || (activeTab === 'login' && loginMode === 'email')) && (
                    <div>
                      <label className="block text-[9px] font-bold tracking-wider uppercase text-stone-500 mb-1.5">
                        Password
                      </label>
                      <div className="flex items-center w-full bg-stone-50 border border-stone-200 rounded-xl overflow-hidden focus-within:border-[#4E641A] transition duration-200">
                        <div className="pl-4 py-3 text-stone-400">
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
                          className="w-full px-3.5 py-2.5 bg-transparent text-stone-850 text-xxs font-semibold placeholder-stone-400 focus:outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="pr-4 py-3 text-stone-400 hover:text-stone-600 transition cursor-pointer"
                        >
                          {showPassword ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* Password Strength Indicator (Signup tab only) */}
                      {activeTab === 'signup' && password && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-bold">
                            <span className="text-stone-400 uppercase tracking-wider">Password Strength:</span>
                            <span className={`${pwdStrength.text} font-bold uppercase tracking-wider`}>{pwdStrength.label}</span>
                          </div>
                          <div className="flex gap-1 h-1">
                            {[1, 2, 3, 4, 5].slice(0, 4).map((i) => (
                              <div
                                key={i}
                                className={`flex-grow rounded-full transition-colors duration-300 ${
                                  pwdStrength.score >= i ? pwdStrength.color : 'bg-stone-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Confirm Password field (Signup tab only) */}
                  {activeTab === 'signup' && (
                    <div>
                      <label className="block text-[9px] font-bold tracking-wider uppercase text-stone-500 mb-1.5">
                        Confirm Password
                      </label>
                      <div className="flex items-center w-full bg-stone-50 border border-stone-200 rounded-xl overflow-hidden focus-within:border-[#4E641A] transition duration-200">
                        <div className="pl-4 py-3 text-stone-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          disabled={isActionLoading}
                          className="w-full px-3.5 py-2.5 bg-transparent text-stone-850 text-xxs font-semibold placeholder-stone-400 focus:outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="pr-4 py-3 text-stone-400 hover:text-stone-600 transition cursor-pointer"
                        >
                          {showConfirmPassword ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* Matching validation warning */}
                      {confirmPassword && password !== confirmPassword && (
                        <span className="text-[9px] font-bold text-red-500 block mt-1">
                          ⚠️ Passwords do not match yet.
                        </span>
                      )}
                    </div>
                  )}

                  {/* Terms and Privacy policy checkbox (Signup tab only) */}
                  {activeTab === 'signup' && (
                    <div className="flex items-start gap-2.5 pt-1.5">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-0.5 w-3.5 h-3.5 border-stone-300 rounded text-[#4E641A] focus:ring-[#4E641A] cursor-pointer"
                        required
                      />
                      <label htmlFor="terms" className="text-[10px] text-stone-500 leading-relaxed font-medium select-none cursor-pointer">
                        I accept the <a href="#" className="text-[#C68A2B] hover:underline font-semibold">Terms of Service</a> and <a href="#" className="text-[#C68A2B] hover:underline font-semibold">Privacy Policy</a> governing native farm fresh ordering.
                      </label>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isActionLoading || (activeTab === 'signup' && (!acceptTerms || password !== confirmPassword))}
                    className="w-full relative py-3.5 mt-2 bg-[#4E641A] hover:bg-[#2F3B0C] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-[#F6F3ED] font-bold text-xs tracking-widest uppercase rounded-xl transition duration-300 shadow flex items-center justify-center cursor-pointer border-none"
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
                      <span>
                        {activeTab === 'login'
                          ? (loginMode === 'phone' ? 'Request OTP Code' : 'Sign In')
                          : 'Create Account'}
                      </span>
                    )}
                  </button>
                </form>

                {/* Switch Login Method (Login Tab Only) */}
                {activeTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode(loginMode === 'email' ? 'phone' : 'email');
                      setApiError('');
                    }}
                    className="mt-4 text-center text-xxs font-bold uppercase tracking-wider text-[#4E641A] hover:underline bg-transparent border-none cursor-pointer"
                  >
                    {loginMode === 'email' ? 'Sign in with Phone & OTP' : 'Sign in with Email & Password'}
                  </button>
                )}

                <div className="mt-8 pt-5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500 font-semibold select-none">
                  <span className="flex items-center">
                    <span className="text-[#C68A2B] mr-1.5">🛡️</span>
                    Secure 256-Bit SSL Encryption
                  </span>
                  <span>Soil First Organic</span>
                </div>
              </motion.div>
            )}

            {/* OTP VERIFICATION STEP */}
            {step === 'otp-verify' && (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full flex flex-col"
              >
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('form');
                      setApiError('');
                      setOtpCode(Array(6).fill(''));
                    }}
                    className="text-stone-400 hover:text-stone-700 font-bold text-xxs tracking-wider uppercase mb-4 flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
                  >
                    ← Back to Login
                  </button>
                  <h3 className="font-serif text-base font-bold text-[#2F3B0C] mb-1">
                    Enter Verification Code
                  </h3>
                  <p className="text-[10px] text-stone-500 font-semibold leading-relaxed">
                    A secure 6-digit OTP code has been dispatched to <strong className="text-[#C68A2B]">{countryCode} {phone}</strong>. Enter <span className="underline font-bold">123456</span> to login.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* 6-Digit input grid */}
                  <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpInput(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        className="w-12 h-12 text-center bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-[#2F3B0C] focus:outline-none focus:border-[#4E641A] transition focus:ring-1 focus:ring-[#4E641A]"
                      />
                    ))}
                  </div>

                  <div className="text-center">
                    {otpTimer > 0 ? (
                      <span className="text-[10px] text-stone-400 font-bold select-none uppercase tracking-wider">
                        Resend OTP code in {otpTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-xxs font-extrabold uppercase tracking-wider text-[#4E641A] hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Resend Verification OTP
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isActionLoading || otpCode.join('').length < 6}
                    className="w-full relative py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-[#F6F3ED] font-bold text-xs tracking-widest uppercase rounded-xl transition duration-300 shadow flex items-center justify-center cursor-pointer border-none"
                  >
                    {isActionLoading ? (
                      <div className="flex items-center space-x-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      <span>Verify & Access Account</span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* SUCCESS STEP */}
            {step === 'success' && (
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
