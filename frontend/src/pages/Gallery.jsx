import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiSearch, FiSliders } from 'react-icons/fi';
import { galleryItems } from '../data/mockData';
import GalleryLightbox from '../components/GalleryLightbox';

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);

  const filters = ['All', 'Fields', 'Harvest', 'Farmers', 'Crops'];

  // Filter gallery items based on active tab
  const filteredItems = galleryItems.filter((item) => {
    return activeFilter === 'All' || item.category === activeFilter;
  });

  const handleOpenLightbox = (item) => {
    // Find index of this item in the currently FILTERED list
    const indexInFiltered = filteredItems.findIndex((img) => img.id === item.id);
    if (indexInFiltered !== -1) {
      setActiveLightboxIndex(indexInFiltered);
    }
  };

  return (
    <div className="flex flex-col bg-cream-bg overflow-hidden w-full pt-20">
      {/* 1. Page Header */}
      <section className="py-16 px-6 md:px-12 text-center max-w-4xl mx-auto flex flex-col items-center gap-5">
        <span className="font-sans text-[10px] font-bold tracking-[0.3em] uppercase text-sunrise-gold">
          Farm Chronicles
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-dark-olive leading-tight">
          Visual Storytelling
        </h1>
        <p className="font-sans text-xs md:text-sm text-dark-text/70 leading-relaxed font-light max-w-xl">
          A glimpse into the daily life of Suryodaya Farms. Sunbeams rising across biodiverse fields, organic hand-harvests, A2 churning Vedic kitchens, and the proud hands of our farmer partners.
        </p>
      </section>

      {/* 2. Filter Pills Section */}
      <section className="px-6 md:px-12 mb-12 max-w-4xl mx-auto w-full flex justify-center">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 border border-light-beige bg-light-beige/35 rounded-full p-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => { setActiveFilter(filter); setActiveLightboxIndex(null); }}
              className={`font-sans text-xs font-semibold tracking-wider px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-primary-green text-white shadow-sm'
                  : 'bg-transparent text-dark-text/80 hover:bg-light-beige hover:text-dark-text'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Masonry / Column Grid Gallery */}
      <section className="px-6 md:px-12 pb-24 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                onClick={() => handleOpenLightbox(item)}
                className="group relative h-[300px] rounded-3xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer border border-light-beige"
              >
                {/* Visual Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Hover overlay panel */}
                <div className="absolute inset-0 bg-dark-olive/75 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-6 border-2 border-transparent group-hover:border-primary-green/20 rounded-3xl" />
                
                <div className="absolute inset-x-6 bottom-6 flex flex-col gap-1.5 z-10 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <span className="font-sans text-[9px] font-bold text-sunrise-gold uppercase tracking-widest leading-none">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-lg text-white font-bold tracking-wide">
                    {item.title}
                  </h3>
                  <p className="font-sans text-[11px] text-light-beige/70 leading-relaxed font-light line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center gap-1 text-[10px] text-sunrise-gold uppercase tracking-widest font-semibold mt-2.5">
                    <FiEye size={12} />
                    <span>Zoom Image</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* 4. Fullscreen image lightbox integration */}
      <AnimatePresence>
        {activeLightboxIndex !== null && (
          <GalleryLightbox
            images={filteredItems}
            currentIndex={activeLightboxIndex}
            setCurrentIndex={setActiveLightboxIndex}
            onClose={() => setActiveLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
