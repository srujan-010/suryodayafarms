import React from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function GalleryLightbox({ images, currentIndex, setCurrentIndex, onClose }) {
  if (currentIndex === null || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-300 animate-fade-in"
      onClick={onClose}
    >
      {/* Close trigger button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-300 backdrop-blur"
      >
        <FiX size={22} />
      </button>

      {/* Prev Arrow */}
      <button
        onClick={handlePrev}
        className="absolute left-4 md:left-8 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-300 backdrop-blur"
      >
        <FiChevronLeft size={24} />
      </button>

      {/* Main Image Container */}
      <div
        className="relative max-w-5xl max-h-[75vh] w-[90%] flex items-center justify-center animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.image}
          alt={currentImage.title}
          className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/5"
        />
      </div>

      {/* Next Arrow */}
      <button
        onClick={handleNext}
        className="absolute right-4 md:right-8 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-300 backdrop-blur"
      >
        <FiChevronRight size={24} />
      </button>

      {/* Info Overlay Panel */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1 items-center">
          <span className="font-sans text-[10px] font-semibold uppercase tracking-widest text-sunrise-gold mb-1">
            {currentImage.category} • {currentIndex + 1} of {images.length}
          </span>
          <h3 className="font-serif text-xl font-bold text-white mb-2">
            {currentImage.title}
          </h3>
          <p className="font-sans text-xs text-white/70 leading-relaxed max-w-lg font-light">
            {currentImage.description}
          </p>
        </div>
      </div>
    </div>
  );
}
