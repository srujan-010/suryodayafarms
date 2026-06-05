import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSliders, FiArrowRight, FiStar, FiChevronRight, FiChevronLeft, FiHeart, FiShoppingBag } from 'react-icons/fi';
import { GiSun } from 'react-icons/gi';
import api from '../utils/api';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import ProductCard from '../components/ProductCard';

export default function CategoryCollection() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);

  // Global store actions
  const { addItem } = useCartStore();
  const { wishlistItems, toggleWishlist } = useWishlistStore();

  const isProductWishlisted = (id) => {
    return wishlistItems.some(item => item.id === id || item.productId === id);
  };

  const handleWishlistToggle = async (productId, e) => {
    if (e) e.stopPropagation();
    await toggleWishlist(productId);
  };

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    const hasVariants = product.variants && product.variants.length > 0;
    const sizesCount = hasVariants 
      ? product.variants.length + (product.variants.some(v => v.name.toLowerCase().replace(/\s+/g, '') === product.weight?.toLowerCase().replace(/\s+/g, '')) ? 0 : 1)
      : 1;

    if (sizesCount > 1) {
      navigate(`/products/${product.slug}`);
      return;
    }

    const imageUrl = product.images?.length > 0 ? product.images[0].url : product.image;
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.compareAtPrice || product.price,
      weight: product.weight || '500g',
      image: imageUrl,
      tag: product.tag || 'Organic',
      description: product.description,
      category: product.categories?.[0]?.name || 'Organic'
    };
    addItem(cartProduct);
  };

  // Load category details and products
  useEffect(() => {
    fetchCategoryAndProducts();
  }, [slug, sortBy]);

  const fetchCategoryAndProducts = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch category metadata
      const catResponse = await api.get(`/products/categories/${slug}`);
      const catData = catResponse.category;
      setCategory(catData);

      // Dynamically update SEO tags
      if (catData) {
        document.title = catData.seoTitle || `${catData.name} | Suryodaya Farms`;
        
        // Update meta description dynamically if exists
        let metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', catData.seoDescription || catData.description || '');
        }
      }

      // 2. Fetch products linked to this category
      const sortParam = sortBy !== 'newest' ? `&sort=${sortBy}` : '';
      // We pass the category slug to backend products endpoint
      const prodResponse = await api.get(`/products?limit=40&category=${catData.slug}${sortParam}`);
      setProductsList(prodResponse.products || []);
    } catch (err) {
      console.error("Failed to load collection data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (productSlug) => {
    navigate(`/products/${productSlug}`);
  };

  return (
    <div className="flex flex-col bg-[#F9F6F0] overflow-hidden w-full pt-20 min-h-screen text-left">
      {/* 1. Breadcrumbs */}
      <nav className="px-6 md:px-12 py-4 max-w-7xl mx-auto w-full flex items-center space-x-2 text-[10px] font-extrabold uppercase tracking-widest text-[#B8833E]/70 font-sans">
        <Link to="/" className="hover:text-[#4E641A] transition">Home</Link>
        <FiChevronRight className="w-3 h-3 text-stone-300" />
        <Link to="/products" className="hover:text-[#4E641A] transition">Storefront</Link>
        <FiChevronRight className="w-3 h-3 text-stone-300" />
        <span className="text-[#37411A]">{category?.name || 'Loading Collection...'}</span>
      </nav>

      {isLoading && !category ? (
        <div className="text-center py-32 flex flex-col items-center gap-3 flex-1 justify-center">
          <GiSun className="text-[#4E641A] text-4xl animate-spin-slow" />
          <span className="font-sans text-xs text-stone-400 font-semibold uppercase tracking-wider">Unearthing Heritage Staples...</span>
        </div>
      ) : !category ? (
        <div className="text-center py-32 flex flex-col items-center gap-4 flex-1 justify-center max-w-md mx-auto px-6">
          <p className="font-serif text-xl text-[#37411A] font-bold">
            Collection Not Found
          </p>
          <p className="font-sans text-xs text-stone-500 max-w-sm leading-relaxed">
            The requested product collection parameters do not exist in our farm registry. Return to our marketplace.
          </p>
          <Link
            to="/products"
            className="font-sans text-xs font-semibold tracking-widest uppercase bg-[#4E641A] text-white px-6 py-3 rounded-xl hover:bg-[#37411A] transition shadow"
          >
            Go to Storefront
          </Link>
        </div>
      ) : (
        <>
          {/* 2. Collection Header Hero */}
          <section className="px-4 sm:px-6 md:px-12 py-4 sm:py-6 max-w-7xl mx-auto w-full">
            <div className="relative h-64 rounded-[32px] overflow-hidden border border-[#EAE4D8] shadow-sm flex flex-col justify-end p-5 sm:p-8 md:p-12">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#EDE7D9]/80 to-[#FDFBF7]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2F3B0C] via-[#2F3B0C]/45 to-transparent" />
              
              <div className="relative text-white space-y-2 max-w-2xl text-left">
                <span className="font-sans text-[9px] font-extrabold tracking-[0.3em] uppercase text-[#C68A2B]">
                  Suryodaya Organic Harvest
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight drop-shadow-sm text-white">
                  {category.name}
                </h1>
                <p className="font-sans text-xs md:text-sm text-[#F9F6F0]/90 leading-relaxed font-light drop-shadow-sm">
                  {category.description || 'Pure unrefined chemical-free biodynamic collections sourced directly from the crop cycles of Wardha Valley.'}
                </p>
              </div>
            </div>
          </section>

          {/* 3. Interactive Filters Bar */}
          <section className="px-6 md:px-12 mb-10 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#FDFBF7]/40 border border-[#EDE7D9] rounded-2xl p-4">
              <span className="font-sans text-[10px] text-stone-500 font-extrabold uppercase tracking-wider">
                Showing {productsList.length} Dynamic Staples
              </span>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-[#EDE7D9] rounded-xl py-2 px-3 font-sans text-xs text-stone-600 focus:outline-none focus:border-[#4E641A]"
                >
                  <option value="newest">Newest Crops</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </section>

          {/* 4. Category Grid List */}
          <section className="px-6 md:px-12 pb-24 max-w-7xl mx-auto w-full flex-1">
            {isLoading ? (
              <div className="text-center py-20 flex flex-col items-center gap-3">
                <GiSun className="text-[#4E641A] text-4xl animate-spin-slow" />
                <span className="font-sans text-xs text-stone-400 font-semibold uppercase tracking-wider">Loading dynamic collection items...</span>
              </div>
            ) : productsList.length === 0 ? (
              // EMPTY STATE
              <div className="text-center py-16 flex flex-col items-center gap-4 bg-white border border-[#EDE7D9] rounded-[32px] p-10 max-w-lg mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-full bg-[#FDFBF7] border border-[#EDE7D9] flex items-center justify-center text-2xl shadow-inner">
                  🌾
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-lg font-bold text-[#37411A]">No products linked yet</h4>
                  <p className="font-sans text-xs text-stone-400 font-light max-w-xs leading-normal">
                    Our cooperative farmers are preparing this harvest. Check back soon for fresh, chemical-free native additions.
                  </p>
                </div>
                <Link
                  to="/products"
                  className="font-sans text-xs font-semibold tracking-widest uppercase bg-[#4E641A] text-white px-5 py-2.5 rounded-xl hover:bg-[#37411A] transition shadow"
                >
                  Explore Other Staples
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
                <AnimatePresence mode="popLayout">
                  {productsList.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
