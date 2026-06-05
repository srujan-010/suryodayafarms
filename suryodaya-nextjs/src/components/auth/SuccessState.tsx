'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SuccessStateProps {
  message?: string;
  name?: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({ 
  message = 'Verification Successful', 
  name 
}) => {
  // SVG drawing animation variants
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: 0.2, type: 'spring', duration: 1.2, bounce: 0 },
        opacity: { delay: 0.2, duration: 0.01 }
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      {/* Premium Outer Ring */}
      <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-[#F6F3ED] border border-[#EAE4D8] mb-6">
        {/* Pulsing Back Glow */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-[#4E641A]/5"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Animated Green Checkmark SVG */}
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 48 48" 
          fill="none" 
          stroke="currentColor" 
          className="text-[#4E641A] z-10"
        >
          <motion.path
            d="M10 24L20 34L38 14"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={draw}
            initial="hidden"
            animate="visible"
          />
        </svg>
      </div>

      {/* Success Title */}
      <motion.h3 
        className="font-serif text-2xl font-semibold text-[#2F3B0C] mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {message}
      </motion.h3>

      {/* Welcoming Message */}
      <motion.p 
        className="text-sm text-stone-600 max-w-[280px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {name ? (
          <span>Welcome back, <strong className="text-[#C68A2B]">{name}</strong>! Resuming your organic farm fresh experience.</span>
        ) : (
          'Welcome to Suryodaya Farms. Preparing your premium farm products.'
        )}
      </motion.p>
    </div>
  );
};
