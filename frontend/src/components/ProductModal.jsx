import React, { useState } from 'react';
import { FiX, FiCheck, FiShoppingBag, FiInfo } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { getOptimizedImageUrl, getImageSrcSet } from '../utils/imageOptimizer';

export default function ProductModal({ product, onClose }) {
  if (!product) return null;

  const [isImgLoaded, setIsImgLoaded] = useState(false);

  const whatsappMessage = encodeURIComponent(
    `Namaste Suryodaya Farms! I am interested in inquiring about your premium organic "${product.name}" (${product.price}). Please share more details regarding delivery timelines.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-dark-olive/65 backdrop-blur-md animate-fade-in">
      <div 
        className="absolute inset-0" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-4xl bg-cream-bg rounded-3xl overflow-hidden shadow-2xl border border-light-beige max-h-[90vh] flex flex-col md:flex-row animate-scale-up z-10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-cream-bg/80 backdrop-blur border border-light-beige flex items-center justify-center text-dark-olive hover:bg-primary-green hover:text-white transition-all duration-300"
        >
          <FiX size={18} />
        </button>

        {/* Image Column */}
        <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-[450px] bg-transparent flex items-center justify-center">
          {!isImgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-transparent">
              <div className="w-20 h-20 rounded-full bg-light-beige/30 animate-pulse" />
            </div>
          )}
          <img
            src={getOptimizedImageUrl(product.image, { width: 800, cropMode: 'limit' })}
            srcSet={getImageSrcSet(product.image, { widths: [400, 800, 1500], cropMode: 'limit' })}
            sizes="(max-width: 768px) 100vw, 450px"
            alt={product.name}
            onLoad={() => setIsImgLoaded(true)}
            className={`w-full h-full object-contain p-6 filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.15)] transition-opacity duration-300 ${
              isImgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          
          <div className="absolute bottom-6 left-6 z-10">
            <span className="inline-block bg-[#4E641A] text-white font-sans text-xs font-semibold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-3 shadow-md">
              {product.category}
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-dark-olive font-bold leading-tight">
              {product.name}
            </h3>
          </div>
        </div>

        {/* Details Column */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between max-h-[50vh] md:max-h-[90vh]">
          <div className="flex flex-col gap-5">
            {/* Price & Status */}
            <div className="flex items-baseline justify-between border-b border-light-beige pb-3">
              <span className="font-serif text-xl md:text-2xl font-bold text-primary-green">
                {product.price}
              </span>
              {product.isComingSoon ? (
                <span className="font-sans text-[10px] font-semibold tracking-wider bg-sunrise-gold/25 text-sunrise-gold border border-sunrise-gold/40 px-3 py-1 rounded-full uppercase">
                  Harvest Coming Soon
                </span>
              ) : (
                <span className="font-sans text-[10px] font-semibold tracking-wider bg-primary-green/10 text-primary-green border border-primary-green/20 px-3 py-1 rounded-full uppercase">
                  Fresh In Stock
                </span>
              )}
            </div>

            {/* Story Description */}
            <div className="flex flex-col gap-2">
              <h4 className="font-serif text-sm font-semibold tracking-wide text-dark-olive">
                The Heritage Story
              </h4>
              <p className="font-sans text-xs md:text-sm text-dark-text/80 leading-relaxed font-light">
                {product.longDesc}
              </p>
            </div>

            {/* Benefits Checkpoints */}
            <div className="flex flex-col gap-2">
              <h4 className="font-serif text-sm font-semibold tracking-wide text-dark-olive">
                Pure Natural Elements
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {product.benefits.map((benefit, i) => (
                  <div key={i} className="flex gap-2 items-start text-xs text-dark-text/75">
                    <span className="w-4 h-4 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green shrink-0 mt-0.5">
                      <FiCheck size={10} />
                    </span>
                    <span className="font-sans font-light leading-snug">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition Table */}
            {product.nutrients && (
              <div className="bg-light-beige/50 border border-light-beige rounded-2xl p-4 flex gap-3 items-start">
                <FiInfo className="text-primary-green text-base mt-0.5 shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="font-serif text-xs font-semibold text-dark-olive">
                    Nutritional Information (Approx)
                  </span>
                  <span className="font-sans text-xs text-dark-text/70 leading-relaxed font-light">
                    {product.nutrients}
                  </span>
                </div>
              </div>
            )}

            {/* Origin */}
            <div className="flex justify-between items-center text-[11px] font-sans text-dark-text/50 font-medium">
              <span>Farm Plot: <strong className="text-primary-green">{product.origin}</strong></span>
              <span>100% Certified Organic</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 border-t border-light-beige pt-6 shrink-0">
            <a
              href={`https://wa.me/919845273105?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-sans text-xs font-semibold uppercase tracking-widest py-4 rounded-xl hover:bg-[#1ebd59] transition-colors duration-300 shadow-md"
            >
              <FaWhatsapp size={16} />
              <span>Inquire via WhatsApp</span>
            </a>
            
            <button
              onClick={onClose}
              className="px-6 py-4 rounded-xl border border-light-beige font-sans text-xs font-semibold uppercase tracking-widest text-dark-text hover:bg-light-beige transition-colors duration-300"
            >
              Back to Catalog
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
