import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiArrowRight, FiStar, FiShoppingBag, FiInfo } from 'react-icons/fi';
import { GiSun } from 'react-icons/gi';
import api from '../utils/api';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import ProductCard from '../components/ProductCard';

const ProductCardSkeleton = () => (
  <div className="bg-white border border-[#EAE4D8] rounded-[24px] overflow-hidden p-4 flex flex-col gap-3 animate-pulse shadow-sm h-full justify-between">
    <div className="flex flex-col gap-3 w-full">
      <div className="aspect-square w-full bg-[#F8F5F0] rounded-2xl" />
      <div className="h-3 bg-stone-100 rounded w-1/4 animate-pulse" />
      <div className="h-5 bg-stone-100 rounded w-3/4 animate-pulse" />
      <div className="h-3 bg-stone-100 rounded w-1/2 animate-pulse" />
      <div className="h-4 bg-stone-100 rounded w-1/3 mt-2 animate-pulse" />
    </div>
    <div className="h-10 bg-stone-100 rounded-xl mt-4 w-full" />
  </div>
);

const getProductVariants = (prod) => {
  if (!prod) return [];
  const baseVariant = {
    id: 'base',
    name: prod.weight || '500g',
    price: prod.price,
    mrp: prod.originalPrice || prod.compareAtPrice || prod.mrp || prod.price,
    sku: prod.sku,
    inventory: prod.inventory,
    stockStatus: prod.stockStatus,
    isBase: true
  };

  const rawVariants = prod.variants || [];
  if (rawVariants.length === 0) {
    return [baseVariant];
  }

  const baseWeightNorm = (prod.weight || '').toLowerCase().replace(/\s+/g, '').replace(/kb/g, 'kg');
  const hasBaseInVariants = rawVariants.some(
    v => (v.name || '').toLowerCase().replace(/\s+/g, '').replace(/kb/g, 'kg') === baseWeightNorm
  );

  let list = [...rawVariants];
  if (!hasBaseInVariants) {
    list.push(baseVariant);
  }
  return list.sort((a, b) => a.price - b.price);
};

export default function Products() {
  const navigate = useNavigate();
  const location = useLocation();
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState([{ id: 'All', name: 'All', slug: 'All' }]);
  const [selectedCategory, setSelectedCategory] = useState({ id: 'All', name: 'All', slug: 'All' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);

  // Search suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Category counts mapping
  const [categoryCounts, setCategoryCounts] = useState({});

  // Quick View states
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [qvSelectedVariant, setQvSelectedVariant] = useState(null);
  const [qvQuantity, setQvQuantity] = useState(1);
  const [qvIsAdding, setQvIsAdding] = useState(false);
  const [qvIsAdded, setQvIsAdded] = useState(false);

  // Global store states
  const { addItem, cartItems, subtotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      return;
    }
    const filtered = productsList
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
    setSuggestions(filtered);
  }, [searchQuery, productsList]);

  useEffect(() => {
    if (quickViewProduct) {
      const qvVariants = getProductVariants(quickViewProduct);
      setQvSelectedVariant(qvVariants[0] || null);
      setQvQuantity(1);
      setQvIsAdding(false);
      setQvIsAdded(false);
    }
  }, [quickViewProduct]);

  // Load categories and counts on mount
  useEffect(() => {
    fetchCategories();
    fetchCounts();
  }, []);

  // Read category parameter from URL and scroll
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catSlug = params.get('category');
    if (catSlug && categories.length > 1) {
      const found = categories.find(c => 
        c.slug === catSlug || 
        c.id === catSlug ||
        (catSlug === 'a2-ghee' && c.slug === 'ghee') ||
        (c.slug === 'ghee' && catSlug.includes('ghee')) ||
        (catSlug === 'cold-pressed-oils' && c.slug === 'oils') ||
        (c.slug === 'oils' && catSlug.includes('oils')) ||
        c.slug.includes(catSlug) ||
        catSlug.includes(c.slug)
      );
      if (found) {
        setSelectedCategory(found);
      } else {
        const formattedName = catSlug
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        const virtualCat = {
          id: catSlug,
          name: formattedName.toUpperCase(),
          slug: catSlug
        };
        if (!categories.some(c => c.slug === catSlug)) {
          setCategories(prev => [...prev, virtualCat]);
        }
        setSelectedCategory(virtualCat);
      }
      setTimeout(() => {
        const section = document.getElementById('products-catalog-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (!catSlug && categories.length > 1) {
      setSelectedCategory({ id: 'All', name: 'All', slug: 'All' });
    }
  }, [location.search, categories]);

  // Update browser tab title
  useEffect(() => {
    if (selectedCategory && selectedCategory.id !== 'All') {
      document.title = `Products > ${selectedCategory.name} | Suryodaya Farms`;
    } else {
      document.title = `Organic Marketplace | Suryodaya Farms`;
    }
  }, [selectedCategory]);

  // Fetch products when queries or sorting change
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      const filtered = (response.categories || []).filter(
        c => c.slug?.toLowerCase() !== 'uncategorized' && c.name?.toLowerCase() !== 'uncategorized'
      );
      setCategories([{ id: 'All', name: 'All', slug: 'All' }, ...filtered]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCounts = async () => {
    try {
      const response = await api.get('/products'); // Fetch all products for dynamic count
      const allProds = response.products || [];
      const counts = { all: allProds.length };
      allProds.forEach((p) => {
        const cats = p.categories || [];
        if (cats.length > 0) {
          cats.forEach((c) => {
            const key = (c.slug || '').toLowerCase();
            counts[key] = (counts[key] || 0) + 1;
          });
        } else {
          const key = (p.category?.slug || p.category || p.tag || 'organic').toLowerCase();
          counts[key] = (counts[key] || 0) + 1;
        }
      });
      setCategoryCounts(counts);
    } catch (err) {
      console.error("Error fetching category counts:", err);
    }
  };

  const getCount = (cat) => {
    if (cat.id === 'All') return categoryCounts['all'] || 0;
    const key = (cat.slug || '').toLowerCase();
    return categoryCounts[key] || 0;
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory.id !== 'All') params.append('category', selectedCategory.slug);
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy !== 'newest') params.append('sort', sortBy);

      const response = await api.get(`/products?${params.toString()}`);
      const fetchedProducts = response.products || [];
      setProductsList(fetchedProducts);

      console.log(`[Storefront Product Logs] Total products in database: ${response.totalCount || fetchedProducts.length}`);
      console.log(`[Storefront Product Logs] Total products returned by API: ${fetchedProducts.length}`);
      console.log(`[Storefront Product Logs] Total products rendered on screen: ${fetchedProducts.length}`);

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (name) => {
    setSearchQuery(name);
    setShowSuggestions(false);
  };

  const handleQvAddToCart = async () => {
    if (!isAuthenticated) {
      useAuthStore.getState().setLoginRequiredModalOpen(true, "Please login to add items to your cart.");
      return;
    }

    if (qvIsAdding || qvIsAdded || !qvSelectedVariant) return;

    const variantId = qvSelectedVariant.isBase ? null : qvSelectedVariant.id;
    setQvIsAdding(true);
    try {
      await addItem(quickViewProduct.id, variantId, qvQuantity, true); // silent cart add
      setQvIsAdded(true);
      setTimeout(() => {
        setQvIsAdded(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setQvIsAdding(false);
    }
  };

  const qvVariants = quickViewProduct ? getProductVariants(quickViewProduct) : [];

  return (
    <div className="flex flex-col bg-cream-bg min-h-screen relative w-full pt-20 pb-24">
      {/* 1. Page Header (Storytelling Banner) */}
      <div className="w-full bg-[#FAF7F2] border-b border-[#EAE4D8] py-12 md:py-16 px-4 sm:px-6 md:px-12 text-center flex flex-col items-center gap-4 select-none products-hero-banner">
        <div className="w-10 h-10 rounded-full bg-[#4E641A]/5 flex items-center justify-center text-sunrise-gold products-hero-badge">
          <GiSun className="w-5 h-5 animate-spin-slow" />
        </div>
        <span className="font-sans text-[10px] font-bold tracking-[0.3em] uppercase text-sunrise-gold products-hero-category">
          {selectedCategory.id !== 'All' ? `Marketplace > ${selectedCategory.name}` : 'Vedic Biodynamic Farming • Wardha'}
        </span>
        <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-[#2F3B0C] leading-tight products-hero-heading">
          Nurturing Soil, Nourishing Souls
        </h1>
        <p className="font-sans text-xs md:text-sm text-stone-600 leading-relaxed font-light max-w-2xl products-hero-description">
          At Suryodaya Farms, we practice ancient Vedic agricultural techniques combined with modern regenerative sciences. 
          Every seed is sown with positive intention, irrigated with fresh river water, and processed without chemicals 
          to deliver high-vibrational, nutrient-dense organic staples directly from our soil to your family.
        </p>
        <div className="flex flex-wrap gap-2.5 justify-center mt-2 products-hero-chips">
          <span className="text-[9px] uppercase font-bold text-[#4E641A] tracking-wider bg-[#4E641A]/5 px-3 py-1 rounded-full border border-[#4E641A]/10">🌱 100% Chemical-Free</span>
          <span className="text-[9px] uppercase font-bold text-[#C68A2B] tracking-wider bg-[#C68A2B]/5 px-3 py-1 rounded-full border border-[#C68A2B]/10">☀️ Solar Dried</span>
          <span className="text-[9px] uppercase font-bold text-stone-600 tracking-wider bg-stone-100 px-3 py-1 rounded-full border border-stone-200">🤝 Fair Price to Farmers</span>
        </div>
      </div>

      {/* 2. Interactive Search & Filters Section */}
      <section id="products-catalog-section" className="px-4 sm:px-6 md:px-12 mt-8 mb-6 md:mb-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-[#FAF7F2] border border-[#EAE4D8] rounded-3xl p-4 md:p-6 products-toolbar products-filter-section shop-controls-wrapper">
          
          {/* Search bar with suggestions */}
          <div className="relative w-full lg:max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-olive/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search native grains, wood pressed oils..."
              className="w-full bg-cream-bg border border-light-beige rounded-2xl py-3 pl-10 pr-5 font-sans text-xs placeholder-dark-text/45 focus:outline-none focus:border-sunrise-gold focus:ring-1 focus:ring-sunrise-gold transition-all duration-300 shadow-sm products-search-input"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#EAE4D8] rounded-xl shadow-lg z-30 overflow-hidden">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSuggestionClick(s.name)}
                    className="px-4 py-2.5 text-xs font-sans text-stone-700 hover:bg-stone-50 cursor-pointer border-b border-stone-100 last:border-none flex items-center justify-between"
                  >
                    <span>{s.name}</span>
                    <span className="text-[9px] text-stone-400 font-bold uppercase">{s.categories?.[0]?.name || 'Organic'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort & Category Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto shrink-0 justify-between sm:justify-end">
            <div className="flex items-center gap-2 justify-between sm:justify-start products-sort-row">
              <span className="font-sans text-xs text-dark-text/60 font-semibold uppercase tracking-wider">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-cream-bg border border-light-beige rounded-xl py-2 px-3 font-sans text-xs text-dark-text/80 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest Harvest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {/* Horizontal Category pills scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full max-w-full sm:max-w-md select-none py-1 products-category-pills">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat);
                    if (cat.id === 'All') {
                      navigate('/products');
                    } else {
                      navigate(`/products?category=${cat.slug}`);
                    }
                  }}
                  className={`font-sans text-[10px] md:text-xs font-bold tracking-wider px-3.5 py-2 rounded-full whitespace-nowrap transition-all duration-300 border category-pill ${
                    selectedCategory.id === cat.id
                      ? 'bg-[#4E641A] border-[#4E641A] text-white shadow-sm'
                      : 'bg-cream-bg border-light-beige text-dark-text hover:bg-light-beige hover:border-light-beige/85'
                  }`}
                >
                  {cat.name} ({getCount(cat)})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Catalog Grid */}
      <section className="px-4 sm:px-6 md:px-12 pb-12 max-w-7xl mx-auto w-full min-h-[400px] products-catalog-section">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 products-grid">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : productsList.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md border border-[#EDE7D9] rounded-[32px] p-8 md:p-12 max-w-lg mx-auto shadow-[0_15px_40px_rgba(0,0,0,0.03)] my-8 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#4E641A]/5 rounded-full animate-ping opacity-60" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-2 bg-gradient-to-tr from-[#4E641A]/10 to-[#C68A2B]/10 rounded-full shadow-inner" />
              
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-12 h-12 relative z-10 text-[#4E641A] drop-shadow-sm transition-transform duration-500 hover:scale-110">
                <path d="M16,48 C20,52 44,52 48,48 C46,45 18,45 16,48 Z" fill="#C68A2B" opacity="0.8" />
                <path d="M32,48 C32,32 30,22 38,16" fill="none" stroke="#4E641A" strokeWidth="3" strokeLinecap="round" />
                <path d="M32,48 C32,38 36,30 24,24" fill="none" stroke="#4E641A" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M38,16 C42,12 48,14 44,20 C40,24 36,20 38,16 Z" fill="#7A9A32" />
                <path d="M24,24 C20,22 16,26 20,30 C24,32 26,28 24,24 Z" fill="#7A9A32" />
                <path d="M34,14 C34,8 30,6 28,10 C26,14 30,16 34,14 Z" fill="#4E641A" />
              </svg>
            </div>
            
            <div className="space-y-3 mb-8">
              <h3 className="font-serif text-xl md:text-2xl text-dark-olive font-extrabold tracking-tight">
                Harvest Preparing in Fields
              </h3>
              <p className="font-sans text-xs md:text-sm text-dark-text/65 max-w-sm mx-auto leading-relaxed">
                Our cooperative farmers are nurturing this batch under the Wardha sun. We don't use chemical storage to force supply.
              </p>
            </div>
            
            <button
              onClick={() => { 
                setSearchQuery(''); 
                setSelectedCategory({ id: 'All', name: 'All', slug: 'All' }); 
                navigate('/products');
              }}
              className="px-8 py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer border-none"
            >
              Browse All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 products-grid">
            <AnimatePresence mode="popLayout">
              {productsList.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onQuickView={(p) => setQuickViewProduct(p)} 
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* 4. Quick View Modal Overlay */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-olive/45 backdrop-blur-md animate-fade-in font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-cream-bg border border-light-beige rounded-[32px] p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row gap-6 sm:gap-8 overflow-y-auto max-h-[90vh] text-left z-50"
            >
              {/* Close Button */}
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white hover:bg-stone-50 text-stone-400 hover:text-[#4E641A] flex items-center justify-center shadow transition border border-stone-200 cursor-pointer"
              >
                ✕
              </button>

              {/* Column 1: Image & Farm Origin Card */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-light-beige shadow-sm bg-light-beige">
                  <img
                    src={quickViewProduct.images?.length > 0 ? quickViewProduct.images[0].url : quickViewProduct.image}
                    alt={quickViewProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Micro farm badge */}
                <div className="bg-[#4E641A]/5 border border-[#4E641A]/20 rounded-xl p-3 flex gap-2 select-none">
                  <span className="text-lg">🌾</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-dark-olive uppercase">Farm Direct Wardha</span>
                    <span className="text-[9px] text-stone-500 font-light">Nurtured on dryland, chemical-free soils.</span>
                  </div>
                </div>
              </div>

              {/* Column 2: E-Commerce Details */}
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#C68A2B] bg-[#C68A2B]/10 px-2 py-0.5 rounded select-none">
                    {quickViewProduct.categories?.[0]?.name || 'Staples'}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#2F3B0C] mt-1.5 leading-tight">
                    {quickViewProduct.name}
                  </h2>
                  
                  {/* Reviews summary */}
                  {quickViewProduct.totalReviews > 0 ? (
                    <div className="flex items-center gap-1 mt-1 text-xs">
                      <div className="flex text-sunrise-gold">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={`w-3 h-3 ${i < Math.round(quickViewProduct.averageRating) ? 'fill-sunrise-gold text-sunrise-gold' : 'text-stone-200'}`} />
                        ))}
                      </div>
                      <span className="text-stone-500 font-semibold">{quickViewProduct.averageRating} ({quickViewProduct.totalReviews} Reviews)</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-stone-400 italic block mt-1">No reviews yet</span>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-xl font-bold text-[#4E641A]">
                    ₹{qvSelectedVariant ? qvSelectedVariant.price : quickViewProduct.price}
                  </span>
                  {qvSelectedVariant && qvSelectedVariant.mrp > qvSelectedVariant.price && (
                    <span className="font-sans text-xs text-stone-400 line-through">
                      ₹{qvSelectedVariant.mrp}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  {quickViewProduct.description}
                </p>

                {/* Size select */}
                {qvVariants.length > 1 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider select-none">Available Sizes:</span>
                    <div className="flex flex-wrap gap-2">
                      {qvVariants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setQvSelectedVariant(v)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                            qvSelectedVariant?.id === v.id
                              ? 'bg-[#4E641A] text-white border-transparent'
                              : 'bg-white text-stone-600 border-light-beige hover:bg-stone-50'
                          }`}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center gap-3 py-2 border-t border-b border-[#EAE4D8]/50 select-none">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Qty:</span>
                  <div className="flex items-center border border-light-beige rounded-lg bg-cream-bg shadow-inner text-xs">
                    <button
                      onClick={() => qvQuantity > 1 && setQvQuantity(qvQuantity - 1)}
                      className="px-2.5 py-1 text-dark-olive hover:text-[#4E641A] font-bold cursor-pointer border-none bg-transparent"
                    >
                      -
                    </button>
                    <span className="px-3 font-semibold text-dark-olive select-none">
                      {qvQuantity}
                    </span>
                    <button
                      onClick={() => setQvQuantity(qvQuantity + 1)}
                      className="px-2.5 py-1 text-dark-olive hover:text-[#4E641A] font-bold cursor-pointer border-none bg-transparent"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add Button */}
                <button
                  type="button"
                  onClick={handleQvAddToCart}
                  disabled={qvIsAdding}
                  className={`w-full py-3.5 text-xs font-bold uppercase tracking-widest rounded-xl transition duration-300 flex items-center justify-center space-x-2 shadow-md border-none cursor-pointer ${
                    qvIsAdded
                      ? 'bg-[#4E641A] text-white'
                      : 'bg-[#4E641A] hover:bg-[#2F3B0C] text-white hover:scale-[1.01]'
                  }`}
                >
                  <span>🛒</span>
                  <span>{qvIsAdding ? 'Adding...' : qvIsAdded ? '✓ Added to Cart' : 'Add to Basket'}</span>
                </button>

                {/* Nutrients details inside Quick View if present */}
                {quickViewProduct.nutrients && (
                  <div className="bg-[#FAF7F2] border border-[#EAE4D8]/60 rounded-xl p-3 flex gap-2 select-none">
                    <FiInfo className="text-primary-green shrink-0 mt-0.5 text-xs" />
                    <div className="flex flex-col gap-0.5 font-sans">
                      <span className="text-[10px] font-bold text-[#2F3B0C]">Nutritional Details</span>
                      <span className="text-[9px] text-stone-500 font-light leading-normal">{quickViewProduct.nutrients}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Floating Smart Cart Widget */}
      <AnimatePresence>
        {totalCartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-45 bg-[#2F3B0C] text-white border border-[#C68A2B]/40 rounded-[20px] shadow-xl p-4 flex items-center justify-between gap-4 max-w-sm w-full select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sunrise-gold">
                <FiShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#C68A2B] mb-0.5">Your Organic Basket</span>
                {cartItems.length === 1 ? (
                  <div className="flex flex-col">
                    <span className="text-xs font-serif font-bold truncate max-w-[190px]">
                      {cartItems[0].product?.name || 'Item'} × {cartItems[0].quantity}
                    </span>
                    <span className="text-[11px] font-sans font-bold text-white/95 mt-0.5">₹{subtotal}</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5 max-h-24 overflow-y-auto custom-scroll pr-1">
                    <span className="text-xs font-serif font-bold">{cartItems.length} Items • ₹{subtotal}</span>
                    <div className="space-y-0.5 mt-1 border-t border-white/15 pt-1">
                      {cartItems.map((item, idx) => (
                        <div key={idx} className="text-[10px] text-white/85 truncate max-w-[210px] font-sans font-medium">
                          {item.product?.name || 'Item'} × {item.quantity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="bg-[#C68A2B] hover:bg-[#b07820] text-[#2F3B0C] hover:text-white px-4 py-2 rounded-xl text-[10px] font-sans font-bold uppercase tracking-widest transition duration-300 flex items-center gap-1.5 border-none cursor-pointer"
            >
              <span>Checkout</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
