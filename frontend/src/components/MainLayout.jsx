import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { FaWhatsapp } from 'react-icons/fa';

export default function MainLayout() {
  const { pathname } = useLocation();

  // Scroll to top instantly on any route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const whatsappMessage = encodeURIComponent(
    "Namaste Suryodaya Farms! I am visiting your premium website and would like to inquire about the available organic harvest packages and delivery schedules."
  );

  return (
    <div className="flex flex-col min-h-screen bg-cream-bg text-dark-text relative selection:bg-primary-green selection:text-white">
      {/* 1. Transparent-to-Solid Sticky Navbar */}
      <Navbar />

      {/* 2. Fluid Content Area and Transition Engine */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* 3. Spacious Dark Olive Footer */}
      <Footer />

      {/* 4. Floating WhatsApp Assistant Overlay */}
      <a
        href={`https://wa.me/919845273105?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#1ebd59] transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer ring-4 ring-white/10 group whatsapp-floating-btn"
        title="Chat on WhatsApp"
      >
        <FaWhatsapp size={24} className="group-hover:rotate-12 transition-transform duration-300" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-sans text-xs font-semibold tracking-wider uppercase pl-0 group-hover:pl-2">
          Chat With Us
        </span>
      </a>
    </div>
  );
}
