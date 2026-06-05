import React from 'react';
import { FiPlus } from 'react-icons/fi';

export default function EmptyState({
  title,
  description,
  illustration, // E.g., "📦", "🏷️", "🛒", "👥", "📈", "🎨"
  actionLabel,
  actionLink,
  onAction
}) {
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionLink) {
      window.location.href = actionLink;
    }
  };

  return (
    <div className="w-full bg-[#FDFBF7] border border-[#EDE7D9] rounded-[32px] p-8 md:p-12 text-center flex flex-col items-center gap-6 shadow-sm animate-scale-up select-none max-w-xl mx-auto my-6 relative overflow-hidden">
      {/* Inline styles for custom gentle floating animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
        .animate-gentle-float {
          animation: gentleFloat 4s ease-in-out infinite;
        }
      `}} />

      {/* Background Decorative Seals */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#C68A2B]/5 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#4E641A]/5 blur-2xl pointer-events-none" />

      {/* Illustration / Graphic */}
      <div className="w-24 h-24 rounded-full bg-[#4E641A]/5 border border-[#4E641A]/10 flex items-center justify-center text-4.5xl shadow-inner animate-gentle-float shrink-0">
        <span role="img" aria-label={title}>
          {illustration || '🌿'}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-2 max-w-sm">
        <h3 className="font-serif text-xl md:text-2xl font-bold text-[#2F3B0C] leading-snug">
          {title}
        </h3>
        {description && (
          <p className="text-stone-500 font-sans text-xs md:text-sm font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* CTA Button */}
      {(actionLabel && (onAction || actionLink)) && (
        <button
          onClick={handleAction}
          className="mt-2 px-6 py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 cursor-pointer border-none scale-100 hover:scale-[1.02] active:scale-[0.98]"
        >
          <FiPlus className="text-base" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
