import React from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiHeart, FiShield, FiTrendingUp, FiCheckCircle, FiAward, FiSettings, FiBriefcase, FiSun, FiSliders } from 'react-icons/fi';

export default function About() {
  const whyChooseUsCards = [
    {
      title: "Scientifically Cultivated Crops",
      description: "Our farming methods integrate advanced plant physiology with biological soil health. We monitor mineral uptake, soil aeration, and sap pH to produce crops rich in micro-nutrients without a single chemical drop.",
      icon: <FiSliders size={24} />
    },
    {
      title: "Expert & Research-Based Approach",
      description: "Guided by agronomy researchers and bio-organic experts, we bridge ancient agricultural manuscripts with modern soil laboratory testing to optimize plant vitality and pest resilience naturally.",
      icon: <FiSettings size={24} />
    },
    {
      title: "Better Processing for Better Nutrition",
      description: "We slow-extract oils in wooden ghanis and churn A2 curd at sunrise (Bilona). Keeping processing temperatures strictly under 35°C safeguards active life enzymes, delicate fatty acids, and natural vitamins.",
      icon: <FiTrendingUp size={24} />
    },
    {
      title: "Hygienic Production Standards",
      description: "Our state-of-the-art processing units operate under ISO-certified sanitary conditions. Every batch undergoes rigorous quality-control checks, particulate filtration, and sterile processing lines.",
      icon: <FiCheckCircle size={24} />
    },
    {
      title: "Premium Packaging Protection",
      description: "We secure our products in premium UV-protective dark amber glass jars, food-grade tins, and eco-friendly oxygen-absorbing barrier pouches to prevent light oxidation and preserve pristine freshness.",
      icon: <FiShield size={24} />
    },
    {
      title: "Scientific Post-Harvest Handling",
      description: "From cold-chain direct transport to humidity-controlled sorting rooms, we scientifically prevent mold, aflatoxins, and degradation, ensuring that what reaches your kitchen has zero nutrient decay.",
      icon: <FiEye size={24} />
    }
  ];

  const trustIndicators = [
    { label: "100% Natural Products", desc: "Strictly pure seeds, grains, and dairy with zero modifications.", icon: <FiAward /> },
    { label: "No Artificial Preservatives", desc: "No color stabilizers, artificial shelf-enhancers, or chemical additives.", icon: <FiShield /> },
    { label: "Hygienically Processed", desc: "ISO-standard clean environments with pristine dust-free machinery.", icon: <FiCheckCircle /> },
    { label: "Farm-to-Consumer Quality", desc: "Bypassing intermediate warehouses for direct, transparent logistics.", icon: <FiHeart /> },
    { label: "Scientifically Guided", desc: "Agronomic science meeting traditional Vedic principles.", icon: <FiSettings /> },
    { label: "Made in India", desc: "Rooted proudly in the fertile soils of Wardha, Maharashtra.", icon: <FiSun /> }
  ];

  return (
    <div className="flex flex-col bg-cream-bg overflow-hidden w-full pt-20">
      
      {/* 1. Page Header — About Suryodaya Farms */}
      <section className="py-20 px-6 md:px-12 text-center max-w-4xl mx-auto flex flex-col items-center gap-6">
        <span className="font-sans text-[10px] font-bold tracking-[0.3em] uppercase text-sunrise-gold">
          Our Heritage & Story
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-dark-olive leading-tight">
          About Suryodaya Farms
        </h1>
        <div className="w-16 h-[1px] bg-sunrise-gold" />
        <p className="font-sans text-sm md:text-lg text-dark-text/80 leading-relaxed font-light max-w-2xl">
          Nurturing biological vitality, honoring ancient Vedic agro-sciences, and elevating standard agriculture into a lifestyle of pure wellness in Wardha, Maharashtra.
        </p>
      </section>

      {/* 2. Main Narrative & Split Section */}
      <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative h-[480px] rounded-3xl overflow-hidden shadow-xl border border-light-beige">
          <img
            src="https://images.unsplash.com/photo-1592890278983-18616401d4ed?auto=format&fit=crop&q=80&w=800"
            alt="Traditional Indian Farm"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-olive/50 to-transparent" />
        </div>

        <div className="flex flex-col gap-6 text-left">
          <span className="font-sans text-[10px] font-bold tracking-widest uppercase text-sunrise-gold">
            The Awakening
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-dark-olive">
            Our Journey Back to Purity
          </h2>
          <p className="font-sans text-xs md:text-sm text-dark-text/75 leading-relaxed font-light">
            Suryodaya Farms was born out of a simple, urgent realization: true wellness begins in the soil, not in the laboratory. For decades, intensive chemical agriculture has stripped our soils of their natural microbiome, depleted groundwater resources, and filled our kitchens with nutrient-hollow food.
          </p>
          <p className="font-sans text-xs md:text-sm text-dark-text/75 leading-relaxed font-light">
            Located in the historic Wardha district of Maharashtra, we set out to restore balance. By combining the profound wisdom of ancient Vedic agricultural manuscripts with modern soil chemistry and advanced post-harvest engineering, we have created a sanctuary for bio-active nutrition.
          </p>
          <p className="font-sans text-xs md:text-sm text-dark-text/75 leading-relaxed font-light">
            Today, Suryodaya Farms is more than a agricultural cooperative; it is a movement. We deliver pure, uncompromised, farm-to-consumer grains, cold-pressed oils, and A2 dairy that preserve their natural enzymes, raw vitality, and deep native flavor.
          </p>
        </div>
      </section>

      {/* 3. Our Mission & Our Vision */}
      <section className="bg-light-beige/35 py-24 px-6 md:px-12 border-t border-b border-light-beige/60 my-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Our Mission */}
            <div className="bg-cream-bg rounded-3xl p-8 border border-light-beige shadow-sm flex flex-col gap-4 text-left">
              <div className="w-10 h-10 rounded-2xl bg-primary-green/10 flex items-center justify-center text-primary-green">
                <FiAward size={20} />
              </div>
              <h3 className="font-serif text-xl font-bold text-dark-olive">
                Our Mission
              </h3>
              <p className="font-sans text-xs md:text-sm text-dark-text/70 leading-relaxed font-light">
                To restore nutritional sovereignty and health to families by producing high-density, chemical-free staples. We are committed to regenerating depleted soil microbiomes, respecting local water cycles, and paying fair, premium wages to our proud cooperative farming partners.
              </p>
            </div>

            {/* Our Vision */}
            <div className="bg-cream-bg rounded-3xl p-8 border border-light-beige shadow-sm flex flex-col gap-4 text-left">
              <div className="w-10 h-10 rounded-2xl bg-primary-green/10 flex items-center justify-center text-primary-green">
                <FiEye size={20} />
              </div>
              <h3 className="font-serif text-xl font-bold text-dark-olive">
                Our Vision
              </h3>
              <p className="font-sans text-xs md:text-sm text-dark-text/70 leading-relaxed font-light">
                To become India's most trusted, scientifically guided bio-dynamic organic farm network. We envision a future where agriculture is a source of ecological regeneration, where farmers work with immense pride and security, and where consumers enjoy food exactly as nature intended—whole, pristine, and vital.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Why Choose Suryodaya Farms (6 visual cards) */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-4 mb-16">
          <span className="font-sans text-[10px] font-bold tracking-widest uppercase text-sunrise-gold">
            Our Standards
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-dark-olive">
            Why Choose Suryodaya Farms
          </h2>
          <p className="font-sans text-xs md:text-sm text-dark-text/70 leading-relaxed font-light">
            We bridge scientific rigor with traditional care to deliver an unmatched standard of dietary wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {whyChooseUsCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-white border border-light-beige rounded-3xl p-8 flex flex-col gap-4 hover:shadow-lg transition-all duration-300 text-left group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-green/10 text-primary-green flex items-center justify-center transition-all duration-300 group-hover:bg-primary-green group-hover:text-white shadow-sm shrink-0">
                {card.icon}
              </div>
              <h3 className="font-serif text-lg font-bold text-dark-olive group-hover:text-primary-green transition-colors duration-300">
                {card.title}
              </h3>
              <p className="font-sans text-xs md:text-sm text-dark-text/70 leading-relaxed font-light">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Our Commitment Section */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col gap-6 lg:order-2 text-left">
          <span className="font-sans text-[10px] font-bold tracking-widest uppercase text-sunrise-gold">
            Our Commitment
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-dark-olive">
            Absolute Integrity, Direct to Your Table
          </h2>
          <p className="font-sans text-xs md:text-sm text-dark-text/75 leading-relaxed font-light">
            We pledge a solemn commitment to you and the environment. We do not participate in commercial shortcuts. We never use artificial ripening chemicals, synthetic color stabilizers, or high-speed extraction methods that burn sensitive organic compounds.
          </p>
          <p className="font-sans text-xs md:text-sm text-dark-text/75 leading-relaxed font-light">
            By sourcing directly from our Wardha Organic Cluster cooperative, we guarantee that 100% of our products are traceably grown. We bypass middle brokers completely, ensuring our cooperative growers earn sustainable, premium wages while you receive maximum nutritional value.
          </p>
          <blockquote className="border-l-2 border-sunrise-gold pl-6 py-2 my-2">
            <p className="font-serif text-base text-dark-olive italic font-light">
              “Suryodaya Farms has returned dignity and financial hope to our lives, while restoring life to soil that had been poisoned by chemicals. We harvest with absolute pride.”
            </p>
            <cite className="font-sans text-[10px] text-sunrise-gold font-semibold uppercase tracking-wider block mt-2">
              — Ramdas Balaji Jadhav, 5th Generation Cooperative Farmer
            </cite>
          </blockquote>
        </div>

        <div className="relative h-[480px] rounded-3xl overflow-hidden shadow-xl border border-light-beige lg:order-1">
          <img
            src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800"
            alt="Hand holding crop soil"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-olive/50 to-transparent" />
        </div>
      </section>

      {/* 6. Quality & Trust Indicators */}
      <section className="bg-[#2F3B0C] text-[#F9F6F0] py-24 px-6 md:px-12 border-t border-light-beige/50">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-4 mb-20">
            <span className="font-sans text-[10px] font-bold tracking-widest uppercase text-sunrise-gold">
              Quality Assured
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white">
              Quality & Trust Indicators
            </h2>
            <p className="font-sans text-xs md:text-sm text-white/70 leading-relaxed font-light">
              Our products are backed by rigorous standards, transparent practices, and deep environmental respect.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {trustIndicators.map((ind, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 flex gap-5 hover:bg-white/10 transition duration-300 text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-sunrise-gold/20 text-sunrise-gold flex items-center justify-center text-xl shadow-inner shrink-0">
                  {ind.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-serif text-base font-bold text-white uppercase tracking-wider">{ind.label}</h4>
                  <p className="font-sans text-xs text-[#F9F6F0]/70 leading-relaxed font-light">
                    {ind.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
