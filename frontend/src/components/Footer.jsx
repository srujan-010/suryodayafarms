import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiYoutube, FiArrowRight } from 'react-icons/fi';
import { GiSun } from 'react-icons/gi';
import { useSettingsStore } from '../store/useSettingsStore';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const quickLinks = [
    { label: 'Home Story', path: '/' },
    { label: 'Our Heritage', path: '/about' },
    { label: 'Organic Harvest', path: '/products' },
    { label: 'Inquiries', path: '/contact' },
  ];

  return (
    <footer className="bg-dark-olive text-cream-bg pt-16 pb-8 px-6 md:px-12 border-t border-primary-green/20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        {/* Brand Section */}
        <div className="flex flex-col gap-5">
          <Link to="/" className="flex items-center gap-2 cursor-pointer select-none">
            <GiSun className="text-sunrise-gold text-3xl animate-spin-slow" />
            <div className="flex flex-col text-left">
              <span className="font-serif text-2xl font-bold tracking-wide text-white">
                {settings.companyName?.toUpperCase() || 'SURYODAYA'}
              </span>
              <span className="font-sans text-[10px] font-semibold tracking-[0.25em] text-sunrise-gold">
                {settings.brandName?.toUpperCase().replace(settings.companyName?.toUpperCase(), '').trim() || 'FARMS & ORGANICS'}
              </span>
            </div>
          </Link>
          <p className="font-sans text-sm text-light-beige/70 leading-relaxed font-light text-left">
            Rooted in traditional Vedic wisdom and modern agronomic science, we cultivate pure, high-vitality organic foods. Nurtured by local hands, dedicated to global wellness.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-green/30 flex items-center justify-center text-light-beige hover:bg-sunrise-gold hover:text-dark-olive transition-all duration-300">
              <FiInstagram size={18} />
            </a>
            <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-green/30 flex items-center justify-center text-light-beige hover:bg-sunrise-gold hover:text-dark-olive transition-all duration-300">
              <FiFacebook size={18} />
            </a>
            <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-green/30 flex items-center justify-center text-light-beige hover:bg-sunrise-gold hover:text-dark-olive transition-all duration-300">
              <FiYoutube size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-5 lg:pl-8">
          <h3 className="font-serif text-lg font-semibold tracking-wide text-white border-b border-primary-green/20 pb-2 text-left">
            Quick Navigation
          </h3>
          <ul className="flex flex-col gap-3">
            {quickLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="font-sans text-sm text-light-beige/75 hover:text-sunrise-gold transition-colors duration-300 flex items-center gap-1 group text-left"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sunrise-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-5">
          <h3 className="font-serif text-lg font-semibold tracking-wide text-white border-b border-primary-green/20 pb-2 text-left">
            Contact Information
          </h3>
          <ul className="flex flex-col gap-4 text-left">
            <li className="flex gap-3 items-start">
              <FiMapPin className="text-sunrise-gold text-lg mt-0.5 shrink-0" />
              <span className="font-sans text-sm text-light-beige/75 leading-relaxed font-light">
                {settings.address}
              </span>
            </li>
            <li className="flex gap-3 items-center">
              <FiPhone className="text-sunrise-gold text-base shrink-0" />
              <span className="font-sans text-sm text-light-beige/75 font-light">
                {settings.phone}
              </span>
            </li>
            <li className="flex gap-3 items-center">
              <FiMail className="text-sunrise-gold text-base shrink-0" />
              <span className="font-sans text-sm text-light-beige/75 font-light">
                {settings.email}
              </span>
            </li>
          </ul>
        </div>

        {/* Newsletter Section */}
        <div className="flex flex-col gap-5">
          <h3 className="font-serif text-lg font-semibold tracking-wide text-white border-b border-primary-green/20 pb-2 text-left">
            Harvest Newsletter
          </h3>
          <p className="font-sans text-sm text-light-beige/70 leading-relaxed font-light text-left">
            Subscribe to receive organic wellness articles, crop harvesting updates, and seasonal grain availabilities straight from our soil.
          </p>
          <form onSubmit={handleSubscribe} className="relative flex items-center mt-2 w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full bg-[#394713] border border-primary-green/40 rounded-full py-3 px-5 pr-12 font-sans text-sm text-white placeholder-light-beige/40 focus:outline-none focus:border-sunrise-gold transition-colors duration-300"
              required
            />
            <button
              type="submit"
              className="absolute right-1 w-10 h-10 rounded-full bg-sunrise-gold flex items-center justify-center text-dark-olive hover:bg-white hover:text-primary-green transition-all duration-300 cursor-pointer"
            >
              <FiArrowRight size={16} />
            </button>
          </form>
          {subscribed && (
            <p className="font-sans text-xs text-sunrise-gold animate-pulse text-left">
              Namaste! You are now subscribed to our organic harvest updates.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-primary-green/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-sans text-xs text-light-beige/50 text-center md:text-left">
          © {new Date().getFullYear()} {settings.companyName || 'Suryodaya Farms'}. All rights reserved.
        </p>
        <p className="font-sans text-xs text-light-beige/40 text-center md:text-right flex items-center gap-1 font-light">
          Nurtured in India with ancient wisdom & modern science.
        </p>
      </div>
    </footer>
  );
}
