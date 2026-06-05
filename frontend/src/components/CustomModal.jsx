import React, { useEffect, useRef } from 'react';
import { useModalStore } from '../store/useModalStore';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiHelpCircle, FiInfo } from 'react-icons/fi';

export default function CustomModal() {
  const { 
    isOpen, 
    type, 
    title, 
    description, 
    primaryLabel, 
    secondaryLabel, 
    closeModal, 
    confirmAction 
  } = useModalStore();

  const modalRef = useRef(null);

  // Esc key behavior
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  // Icon mapping
  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-12 h-12 text-[#4E641A] mx-auto animate-bounce-short" />;
      case 'error':
        return <FiXCircle className="w-12 h-12 text-red-650 mx-auto animate-shake" />;
      case 'warning':
        return <FiAlertTriangle className="w-12 h-12 text-[#B8833E] mx-auto" />;
      case 'confirm':
        return <FiHelpCircle className="w-12 h-12 text-[#4E641A] mx-auto" />;
      case 'info':
      default:
        return <FiInfo className="w-12 h-12 text-stone-500 mx-auto" />;
    }
  };

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-[#2F3B0C]/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in"
    >
      <div 
        ref={modalRef}
        className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-[28px] max-w-sm w-full p-6 sm:p-7 shadow-2xl relative transform transition-all duration-300 scale-100 animate-scale-up text-center flex flex-col gap-4 font-sans select-none"
      >
        <div className="pt-2">
          {renderIcon()}
        </div>

        <div className="space-y-1.5">
          <h3 className="font-serif text-lg font-bold text-[#37411A] leading-snug">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-stone-500 font-medium leading-relaxed max-w-xs mx-auto">
              {description}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-3">
          {secondaryLabel && (
            <button
              onClick={closeModal}
              className="flex-1 py-3 border border-[#EDE7D9] hover:bg-stone-50 text-stone-600 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              {secondaryLabel}
            </button>
          )}
          <button
            onClick={confirmAction}
            className={`flex-1 py-3 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer border-none ${
              type === 'error' ? 'bg-red-600 hover:bg-red-700' :
              type === 'warning' ? 'bg-[#B8833E] hover:bg-amber-600' :
              'bg-[#4E641A] hover:bg-[#37411A]'
            }`}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
