import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiX } from 'react-icons/fi';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginRequiredModal = () => {
  const {
    isLoginRequiredModalOpen,
    setLoginRequiredModalOpen,
    setAuthModalOpen,
    setAuthModalTab,
    loginRequiredMessage
  } = useAuthStore();

  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isLoginRequiredModalOpen) {
        setLoginRequiredModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoginRequiredModalOpen, setLoginRequiredModalOpen]);

  if (!isLoginRequiredModalOpen) return null;

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setLoginRequiredModalOpen(false);
    }
  };

  const handleAction = (tab) => {
    setLoginRequiredModalOpen(false);
    setAuthModalTab(tab);
    setTimeout(() => {
      setAuthModalOpen(true);
    }, 100);
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-[#2F3B0C]/40 backdrop-blur-md z-[110] flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in"
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 260 }}
        className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-[32px] max-w-sm w-full p-6 sm:p-8 shadow-2xl relative text-center flex flex-col gap-5 font-sans select-none"
      >
        {/* Close Button */}
        <button
          onClick={() => setLoginRequiredModalOpen(false)}
          className="absolute top-5 right-5 p-1 rounded-full bg-light-beige hover:bg-[#4E641A]/10 text-stone-400 hover:text-stone-700 transition cursor-pointer border-none"
          aria-label="Close"
        >
          <FiX size={16} />
        </button>

        {/* Lock Icon Illustration */}
        <div className="pt-2">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            {/* Glowing rings */}
            <div className="absolute inset-0 bg-[#4E641A]/5 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-1.5 bg-gradient-to-tr from-[#4E641A]/10 to-[#C68A2B]/10 rounded-full shadow-inner" />
            <FiLock className="w-8 h-8 text-[#4E641A] relative z-10 animate-pulse-slow" />
          </div>
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <h3 className="font-serif text-xl font-bold text-dark-olive leading-tight">
            Login Required
          </h3>
          <p className="text-xs text-stone-500 font-medium leading-relaxed max-w-xs mx-auto">
            {loginRequiredMessage || "Sign in to save products to your wishlist, manage saved coordinates, and track your orders."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('login')}
              className="flex-1 py-3 bg-[#4E641A] hover:bg-[#37411A] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer border-none"
            >
              Login
            </button>
            <button
              onClick={() => handleAction('signup')}
              className="flex-1 py-3 bg-white hover:bg-stone-50 text-[#4E641A] border border-[#EDE7D9] text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              Create Account
            </button>
          </div>
          <button
            onClick={() => setLoginRequiredModalOpen(false)}
            className="w-full py-3 text-stone-500 hover:text-stone-700 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer bg-transparent border-none mt-1"
          >
            Continue Shopping
          </button>
        </div>
      </motion.div>
    </div>
  );
};
