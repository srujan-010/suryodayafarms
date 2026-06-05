import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail, FiSend, FiCheckCircle, FiBriefcase, FiUsers, FiClock } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useSettingsStore } from '../store/useSettingsStore';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'Millets & Grains',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API submit delay
    setTimeout(() => {
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', type: 'Millets & Grains', message: '' });
      setTimeout(() => setIsSubmitted(false), 6000);
    }, 800);
  };

  return (
    <div className="flex flex-col bg-cream-bg overflow-hidden w-full pt-20">
      
      {/* 1. Page Header — Company Introduction */}
      <section className="py-16 px-6 md:px-12 text-center max-w-4xl mx-auto flex flex-col items-center gap-5">
        <span className="font-sans text-[10px] font-bold tracking-[0.3em] uppercase text-sunrise-gold">
          Connect With Us
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-dark-olive leading-tight">
          Get in Touch with Suryodaya Farms
        </h1>
        <p className="font-sans text-xs md:text-sm text-dark-text/70 leading-relaxed font-light max-w-2xl">
          Namaste! We are delighted to hear from you. Whether you have an inquiry about our slow-processed organic staples, want to visit our biodynamic crop clusters in Maharashtra, or are seeking high-fidelity wholesale partnerships, our team is at your disposal.
        </p>
      </section>

      {/* 2. Direct Address, Phone, & Email Details */}
      <section className="px-6 md:px-12 pb-16 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Column 1: Contact Placeholders & WhatsApp */}
        <div className="flex flex-col gap-8 w-full text-left">
          <div className="flex flex-col gap-2">
            <span className="font-sans text-[10px] font-bold tracking-widest uppercase text-sunrise-gold">
              Homestead Points
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-dark-olive">
              Reach Out Directly
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Address Placeholder */}
            <div className="bg-light-beige/25 border border-light-beige rounded-2xl p-6 flex flex-col gap-3">
              <FiMapPin className="text-sunrise-gold text-xl" />
              <h3 className="font-serif text-sm font-bold text-dark-olive">Official Address</h3>
              <p className="font-sans text-xs text-dark-text/70 leading-relaxed font-light">
                {settings.address}
              </p>
            </div>

            {/* Phone Placeholder */}
            <div className="bg-light-beige/25 border border-light-beige rounded-2xl p-6 flex flex-col gap-3">
              <FiPhone className="text-sunrise-gold text-lg" />
              <h3 className="font-serif text-sm font-bold text-dark-olive">Support Phone</h3>
              <p className="font-sans text-xs text-dark-text/70 leading-relaxed font-light">
                {settings.phone} <br />
                <span className="text-[10px] text-dark-text/50">Mon – Sat, 9:00 AM – 6:00 PM IST</span>
              </p>
            </div>

            {/* Email Placeholder */}
            <div className="bg-light-beige/25 border border-light-beige rounded-2xl p-6 flex flex-col gap-3">
              <FiMail className="text-sunrise-gold text-lg" />
              <h3 className="font-serif text-sm font-bold text-dark-olive">Support Email</h3>
              <p className="font-sans text-xs text-dark-text/70 leading-relaxed font-light">
                {settings.email} <br />
                <span className="text-[10px] text-dark-text/50">Response within 24 business hours</span>
              </p>
            </div>

            {/* WhatsApp Integration */}
            <a
              href={`https://wa.me/${settings.phone?.replace(/[^0-9]/g, '') || '919100422140'}?text=Namaste%20Suryodaya%20Farms!%20I%20would%20like%20to%20know%20more%20about%20your%20organic%20products.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366]/10 border border-[#25D366]/40 hover:bg-[#25D366]/20 rounded-2xl p-6 flex flex-col gap-3 transition-colors duration-300 group"
            >
              <FaWhatsapp className="text-[#25D366] text-2xl group-hover:scale-105 transition-transform duration-300" />
              <h3 className="font-serif text-sm font-bold text-dark-olive">WhatsApp Support</h3>
              <p className="font-sans text-xs text-dark-text/70 leading-relaxed font-light">
                Tap to chat directly for quick inquiries or order tracking updates.
              </p>
            </a>
          </div>

          {/* Styled High-contrast Maps Placeholder */}
          <div className="w-full h-[220px] rounded-3xl overflow-hidden border border-light-beige bg-light-beige/35 relative flex items-center justify-center shadow-inner group">
            <div className="absolute inset-0 opacity-20 bg-cover bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600')]" />
            <div className="relative z-10 flex flex-col items-center gap-2 text-center px-4">
              <FiMapPin className="text-primary-green text-3xl animate-bounce" />
              <span className="font-serif text-xs sm:text-sm font-bold text-dark-olive max-w-[280px] leading-snug">
                Plot No-20 NP, Kuruma Nagar, Peerzadiguda Mandal, Medchal (Malkajgiri), Telangana – 500039
              </span>
              <span className="font-sans text-[10px] text-sunrise-gold font-semibold uppercase tracking-wider leading-none">
                Plot Location Centered
              </span>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Plot+No-20+NP,+Kuruma+Nagar,+Peerzadiguda+Mandal,+Medchal+(Malkajgiri),+Telangana+-+500039"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 font-sans text-[10px] font-bold tracking-widest uppercase bg-primary-green text-white px-5 py-2 rounded-full hover:bg-dark-olive transition-colors duration-300 shadow-md"
              >
                Open Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Column 2: Contact Form */}
        <div className="bg-light-beige/25 border border-light-beige rounded-[36px] p-8 md:p-10 w-full shadow-sm text-left">
          <div className="flex flex-col gap-2 mb-8">
            <h3 className="font-serif text-2xl font-bold text-dark-olive">
              Send an Inquiry
            </h3>
            <p className="font-sans text-xs text-dark-text/70 leading-relaxed font-light">
              Fill in your details below and our farm management team will get back to you within one working day.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-semibold text-dark-olive tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-cream-bg border border-light-beige rounded-xl py-3 px-4 font-sans text-xs focus:outline-none focus:border-sunrise-gold transition-colors duration-300"
                  required
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-semibold text-dark-olive tracking-wide">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 98452 73105"
                  className="w-full bg-cream-bg border border-light-beige rounded-xl py-3 px-4 font-sans text-xs focus:outline-none focus:border-sunrise-gold transition-colors duration-300"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-semibold text-dark-olive tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. rahul@gmail.com"
                  className="w-full bg-cream-bg border border-light-beige rounded-xl py-3 px-4 font-sans text-xs focus:outline-none focus:border-sunrise-gold transition-colors duration-300"
                  required
                />
              </div>

              {/* Inquiry Type */}
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-semibold text-dark-olive tracking-wide">
                  Inquiry Topic
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-cream-bg border border-light-beige rounded-xl py-3 px-4 font-sans text-xs focus:outline-none focus:border-sunrise-gold transition-colors duration-300 text-dark-text/80"
                >
                  <option value="Millets & Grains">Millets & Grains</option>
                  <option value="Wood Pressed Oils">Wood Pressed Oils</option>
                  <option value="A2 Gir Ghee">A2 Bilona Gir Ghee</option>
                  <option value="Fruits & Veggies">Fruits & Vegetables</option>
                  <option value="Wholesale Business">Commercial Wholesale</option>
                  <option value="Farm Homestead Visit">Homestead / Farm Visit</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-2">
              <label className="font-sans text-xs font-semibold text-dark-olive tracking-wide">
                Your Inquiry Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please describe the quantities, delivery addresses, or scheduling requirements you have..."
                rows={4}
                className="w-full bg-cream-bg border border-light-beige rounded-xl py-3 px-4 font-sans text-xs focus:outline-none focus:border-sunrise-gold transition-colors duration-300 resize-none"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-primary-green hover:bg-dark-olive text-white font-sans text-xs font-semibold uppercase tracking-widest py-4 rounded-xl transition-colors duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiSend />
              <span>Submit Message</span>
            </button>

            {/* Success message popup */}
            {isSubmitted && (
              <div className="flex items-center gap-3 bg-primary-green/10 border border-primary-green/20 rounded-2xl p-4 text-primary-green mt-2 animate-fade-in">
                <FiCheckCircle className="text-xl shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="font-serif text-sm font-bold">Namaste! Message Dispatched</span>
                  <span className="font-sans text-xs text-dark-text/70 leading-relaxed font-light mt-0.5">
                    Your details have safely reached Suryodaya's farm office. We will call you back shortly.
                  </span>
                </div>
              </div>
            )}
          </form>
        </div>

      </section>

      {/* 3. Business Inquiry Section */}
      <section className="bg-light-beige/35 py-20 px-6 md:px-12 border-t border-light-beige/60 w-full text-left">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <span className="font-sans text-[10px] font-bold tracking-widest uppercase text-sunrise-gold">
              Wholesale & Institutional
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-dark-olive">
              Business & Trade Inquiries
            </h2>
            <p className="font-sans text-xs md:text-sm text-dark-text/75 leading-relaxed font-light">
              Are you interested in sourcing premium, single-origin cold-pressed oils, native heirloom millets, or wood-clarified A2 ghee for your wellness clinic, gourmet restaurant, or organic retail store?
            </p>
            <p className="font-sans text-xs md:text-sm text-dark-text/75 leading-relaxed font-light">
              We cooperate with custom bulk sorting, institutional clean room packaging, and freight logistics across India. Contact our commercial trade office directly at <strong className="text-primary-green">{settings.email}</strong> or call our business director at <strong className="text-primary-green">{settings.phone}</strong>.
            </p>
          </div>

          <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="bg-cream-bg border border-light-beige rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
              <FiBriefcase className="text-sunrise-gold text-2xl" />
              <h3 className="font-serif text-base font-bold text-dark-olive">Trade Accounts</h3>
              <p className="font-sans text-xs text-dark-text/70 leading-relaxed font-light">
                Custom pricing matrices and scheduled monthly container dispatches for qualified retailers.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-cream-bg border border-light-beige rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
              <FiUsers className="text-sunrise-gold text-2xl" />
              <h3 className="font-serif text-base font-bold text-dark-olive">Wellness Centers</h3>
              <p className="font-sans text-xs text-dark-text/70 leading-relaxed font-light">
                Supplying bulk cold-pressed base oils and A2 ghee prepared under ancient bio-acoustic hums for health practitioners.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
