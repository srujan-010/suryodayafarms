import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeedbackStore } from '../store/useFeedbackStore';
import { FiLoader, FiX } from 'react-icons/fi';

export default function GlobalFeedback() {
  const { toasts, removeToast, isLoading, loadingText } = useFeedbackStore();

  return (
    <>
      {/* 1. Centered Page-Level Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-55 flex flex-col items-center justify-center pointer-events-auto select-none"
          >
            <div className="bg-white border border-stone-200 rounded-[28px] p-8 shadow-2xl flex flex-col items-center gap-4 text-center max-w-xs w-full animate-scale-up z-60">
              <FiLoader className="w-10 h-10 text-[#4E641A] animate-spin" />
              <div className="space-y-1">
                <h3 className="font-sans text-sm font-bold text-stone-900">Loading...</h3>
                <p className="font-sans text-xs text-stone-500 font-medium leading-relaxed">
                  {loadingText}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Top-Right Toast Notifications Container */}
      <div className="fixed top-6 right-6 z-55 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="pointer-events-auto w-full"
            >
              <div className={`p-4 bg-white rounded-xl shadow-lg border-l-4 flex items-start justify-between gap-3 border border-stone-200/50 ${
                toast.type === 'success' 
                  ? 'border-l-[#4E641A]' 
                  : toast.type === 'error' 
                    ? 'border-l-red-500' 
                    : toast.type === 'warning' 
                      ? 'border-l-amber-500' 
                      : 'border-l-blue-500'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="shrink-0 text-sm">
                    {toast.type === 'success' && '✅'}
                    {toast.type === 'error' && '❌'}
                    {toast.type === 'warning' && '⚠️'}
                    {toast.type === 'info' && 'ℹ️'}
                  </span>
                  <span className="text-xs font-sans font-medium text-stone-850 leading-normal text-left break-words">
                    {toast.message}
                  </span>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 text-stone-400 hover:text-stone-600 border-none bg-transparent cursor-pointer p-0.5 rounded-full hover:bg-stone-55 transition"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
