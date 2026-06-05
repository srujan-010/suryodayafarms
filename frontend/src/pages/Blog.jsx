import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiUser, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { blogArticles } from '../data/mockData';

export default function Blog() {
  const [activeArticle, setActiveArticle] = useState(null);

  // If an article is active, render the fullscreen beautiful reading layout
  if (activeArticle) {
    return (
      <div className="flex flex-col bg-cream-bg overflow-hidden w-full pt-20">
        <article className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-8">
          {/* Back button */}
          <button
            onClick={() => { setActiveArticle(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="self-start flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest text-primary-green hover:text-sunrise-gold transition-colors duration-300"
          >
            <FiArrowLeft />
            <span>Back to Journal</span>
          </button>

          {/* Heading metadata */}
          <div className="flex flex-col gap-4">
            <span className="inline-block self-start bg-sunrise-gold/20 text-sunrise-gold border border-sunrise-gold/40 font-sans text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              {activeArticle.category}
            </span>
            
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-dark-olive leading-tight">
              {activeArticle.title}
            </h1>

            <div className="flex items-center gap-6 text-xs text-dark-text/60 border-b border-light-beige pb-6 mt-2">
              <span className="flex items-center gap-1.5">
                <FiUser />
                <span>{activeArticle.author}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <FiClock />
                <span>{activeArticle.readTime}</span>
              </span>
              <span>{activeArticle.date}</span>
            </div>
          </div>

          {/* Large cover image */}
          <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-md border border-light-beige">
            <img
              src={activeArticle.image}
              alt={activeArticle.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article text body */}
          <div className="font-sans text-sm md:text-base text-dark-text/80 leading-relaxed font-light flex flex-col gap-6 pt-4">
            {activeArticle.content.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Closing tag */}
          <div className="border-t border-light-beige pt-8 mt-6 flex justify-between items-center text-xs text-dark-text/50 font-medium">
            <span>Written by: <strong className="text-primary-green">{activeArticle.author}</strong></span>
            <span>Suryodaya Editorial Chronicles</span>
          </div>
        </article>
      </div>
    );
  }

  // Otherwise, render the standard magazine grid
  return (
    <div className="flex flex-col bg-cream-bg overflow-hidden w-full pt-20">
      {/* 1. Page Header */}
      <section className="py-16 px-6 md:px-12 text-center max-w-4xl mx-auto flex flex-col items-center gap-5">
        <span className="font-sans text-[10px] font-bold tracking-[0.3em] uppercase text-sunrise-gold">
          The Solar Journal
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-dark-olive leading-tight">
          Earthy Chronicles
        </h1>
        <p className="font-sans text-xs md:text-sm text-dark-text/70 leading-relaxed font-light max-w-xl">
          An editorial compilation of sustainable biodynamic insights, heart-healthy wood-press chemistry, A2 digestive reports, and crop chronicles written directly by our agronomic directors.
        </p>
      </section>

      {/* 2. Featured Article Hero banner */}
      <section className="px-6 md:px-12 mb-16 max-w-7xl mx-auto w-full">
        {blogArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0 }}
            onClick={() => { setActiveArticle(blogArticles[0]); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="group bg-light-beige/25 border border-light-beige rounded-[40px] overflow-hidden flex flex-col lg:flex-row shadow-sm hover:shadow-md cursor-pointer transition-shadow duration-300"
          >
            {/* Thumbnail */}
            <div className="w-full lg:w-1/2 h-[350px] lg:h-auto min-h-[300px] overflow-hidden bg-light-beige relative">
              <img
                src={blogArticles[0].image}
                alt={blogArticles[0].title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
              />
              <span className="absolute top-6 left-6 bg-sunrise-gold text-dark-olive font-sans text-[9px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
                Featured Editorial
              </span>
            </div>

            {/* Meta context details */}
            <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 text-xs text-dark-text/50 font-medium">
                  <span className="text-primary-green uppercase tracking-widest text-[9px] font-bold">
                    {blogArticles[0].category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FiClock />
                    <span>{blogArticles[0].readTime}</span>
                  </span>
                </div>

                <h3 className="font-serif text-2xl md:text-3xl text-dark-olive font-bold tracking-wide group-hover:text-primary-green transition-colors duration-300 leading-tight">
                  {blogArticles[0].title}
                </h3>
                
                <p className="font-sans text-xs md:text-sm text-dark-text/75 leading-relaxed font-light">
                  {blogArticles[0].summary}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-sunrise-gold uppercase tracking-widest font-semibold mt-4 border-t border-light-beige/50 pt-6">
                <span>Read Full Chronicle</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* 3. Columns Editorial Grid */}
      <section className="px-6 md:px-12 pb-24 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {blogArticles.slice(1).map((article, idx) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              onClick={() => { setActiveArticle(article); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="group flex flex-col gap-5 cursor-pointer"
            >
              {/* Photo */}
              <div className="aspect-[16/10] w-full rounded-[28px] overflow-hidden border border-light-beige shadow-sm bg-light-beige">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                />
              </div>

              {/* Context */}
              <div className="flex flex-col gap-3 px-2">
                <div className="flex items-center gap-3 text-[10px] text-dark-text/50 font-medium">
                  <span className="text-primary-green uppercase tracking-widest font-bold">
                    {article.category}
                  </span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>

                <h4 className="font-serif text-xl text-dark-olive font-bold leading-tight group-hover:text-primary-green transition-colors duration-300">
                  {article.title}
                </h4>

                <p className="font-sans text-xs text-dark-text/75 leading-relaxed font-light">
                  {article.summary}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] text-sunrise-gold uppercase tracking-widest font-semibold mt-2">
                  <span>Read Story</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
