import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiStar, FiPlay } from 'react-icons/fi';
import api from '../utils/api';

export default function Testimonials() {
  const [testimonialsList, setTestimonialsList] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await api.get('/public/testimonials');
        if (response.success && response.testimonials) {
          setTestimonialsList(response.testimonials);
        }
      } catch (err) {
        console.error('Failed to fetch testimonials:', err);
      }
    };
    fetchTestimonials();
  }, []);

  const videoTestimonials = [
    {
      id: 1,
      title: "Harvesting Millets in Arid Soils",
      speaker: "Ramdas Balaji Jadhav",
      role: "Suryodaya Cooperative Farmer",
      duration: "3:42 mins",
      thumbnail: "https://images.unsplash.com/photo-1592890278983-18616401d4ed?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      title: "Vedic Churning of Bilona A2 Ghee",
      speaker: "Acharya Rajesh",
      role: "Ghee Clarification Lead",
      duration: "4:15 mins",
      thumbnail: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <div className="flex flex-col bg-cream-bg overflow-hidden w-full pt-20">
      {/* 1. Page Header */}
      <section className="py-16 px-6 md:px-12 text-center max-w-4xl mx-auto flex flex-col items-center gap-5">
        <span className="font-sans text-[10px] font-bold tracking-[0.3em] uppercase text-sunrise-gold">
          Community Trust
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-dark-olive leading-tight">
          Voices of Organic Faith
        </h1>
        <p className="font-sans text-xs md:text-sm text-dark-text/70 leading-relaxed font-light max-w-xl">
          Discover why thousands of health-conscious families, pediatricians, wellness coaches, and traditional culinary chefs rely exclusively on Suryodaya's pure agricultural crafts.
        </p>
      </section>

      {/* 2. Customer Trust Grid */}
      <section className="px-6 md:px-12 pb-20 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonialsList.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="bg-light-beige/25 border border-light-beige rounded-3xl p-8 flex flex-col justify-between gap-6 relative shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Double Quote Graphic Vector */}
              <span className="absolute top-6 right-8 font-serif text-8xl text-sunrise-gold/15 select-none leading-none pointer-events-none">
                “
              </span>

              <div className="flex flex-col gap-4">
                {/* Five Star Review Indicators */}
                <div className="flex items-center gap-1">
                  {[...Array(test.rating)].map((_, i) => (
                    <FiStar key={i} className="text-sunrise-gold fill-sunrise-gold text-sm shrink-0" />
                  ))}
                </div>

                <p className="font-serif text-base text-dark-olive italic leading-relaxed font-light relative z-10">
                  {test.testimonialText}
                </p>
              </div>

              {/* Identity details */}
              <div className="flex items-center gap-4 mt-2 border-t border-light-beige/60 pt-4">
                <div className="w-12 h-12 rounded-full border border-sunrise-gold overflow-hidden bg-[#4E641A]/10 flex items-center justify-center font-bold text-[#4E641A] font-serif shrink-0">
                  {test.customerPhoto && (test.customerPhoto.startsWith('http') || test.customerPhoto.includes('/')) ? (
                    <img
                      src={test.customerPhoto}
                      alt={test.customerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    test.customerPhoto || (test.customerName ? test.customerName.charAt(0) : 'C')
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-sm font-bold text-dark-olive">
                    {test.customerName}
                  </span>
                  <span className="font-sans text-[10px] text-sunrise-gold uppercase tracking-wider font-semibold mt-0.5">
                    {test.location}
                  </span>
                </div>
                
                {test.productPurchased && (
                  <span className="ml-auto bg-primary-green/10 text-primary-green font-sans text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0">
                    {test.productPurchased}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Cooperative Farmer Spotlight Section */}
      <section className="bg-light-beige/35 py-24 px-6 md:px-12 border-t border-b border-light-beige/60 my-12 w-full">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <span className="font-sans text-[10px] font-bold tracking-widest uppercase text-sunrise-gold">
              Social Cooperative Model
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-dark-olive">
              Building a Soil-First Collective
            </h2>
            <p className="font-sans text-xs md:text-sm text-dark-text/75 leading-relaxed font-light">
              We do not purchase farmlands to create corporate monocultures. Suryodaya operates on an indigenous farmer-first cooperative model, empowering traditional dryland families to return to their organic roots.
            </p>
            <p className="font-sans text-xs md:text-sm text-dark-text/75 leading-relaxed font-light">
              We supply composting microorganisms, organic seeds, and agronomic support at zero cost. By purchasing 100% of their harvests at stable premium price agreements, we ensure absolute financial independence and dignity for local communities.
            </p>
          </div>

          {/* Interactive Stats cards */}
          <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-cream-bg border border-light-beige rounded-2xl p-6 flex flex-col gap-2">
              <span className="font-serif text-2xl font-bold text-primary-green">Zero Synthetic Poisons</span>
              <span className="font-sans text-xs text-dark-text/65 font-light leading-relaxed">
                Empowered over 120 farming families to discard highly hazardous insecticides.
              </span>
            </div>
            <div className="bg-cream-bg border border-light-beige rounded-2xl p-6 flex flex-col gap-2">
              <span className="font-serif text-2xl font-bold text-primary-green">75% Aquifer Savings</span>
              <span className="font-sans text-xs text-dark-text/65 font-light leading-relaxed">
                Trained farmers in native millets, reducing traditional groundwater water consumption.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Play Overlay Testimonial Video Boards */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-4 mb-16">
          <span className="font-sans text-[10px] font-bold tracking-widest uppercase text-sunrise-gold">
            The Digital Homestead
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-dark-olive">
            Visual Sights of Truth
          </h2>
          <p className="font-sans text-xs md:text-sm text-dark-text/70 leading-relaxed font-light">
            Take a digital stroll through our fields and witness our harvesting and clarifying Vedic systems on tape.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {videoTestimonials.map((vid) => (
            <motion.div
              key={vid.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group relative h-[360px] rounded-[32px] overflow-hidden shadow-md border border-light-beige cursor-pointer"
            >
              {/* Video Thumbnail photo */}
              <img
                src={vid.thumbnail}
                alt={vid.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.70]"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Pulsing Play Overlay Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center border border-white/40 transition-all duration-300 backdrop-blur group-hover:scale-110">
                  <FiPlay className="text-xl fill-white text-white translate-x-0.5" />
                </div>
              </div>

              {/* Speaker Metadata info */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="flex flex-col gap-1 text-left">
                  <span className="font-sans text-[9px] font-bold text-sunrise-gold uppercase tracking-widest">
                    {vid.role}
                  </span>
                  <h3 className="font-serif text-lg text-white font-bold tracking-wide leading-tight">
                    {vid.title}
                  </h3>
                  <span className="font-sans text-xs text-light-beige/70 font-light mt-1">
                    Featuring {vid.speaker}
                  </span>
                </div>
                
                <span className="font-sans text-[10px] text-white/60 bg-black/40 border border-white/10 px-3 py-1 rounded-full uppercase shrink-0">
                  {vid.duration}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
