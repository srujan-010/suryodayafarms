import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiHeart, FiSearch } from 'react-icons/fi';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { getOptimizedImageUrl, getImageSrcSet } from '../utils/imageOptimizer';

const getCategoryEmoji = (name) => {
  const norm = (name || '').toLowerCase();
  if (norm.includes('rice') || norm.includes('grain')) return '🌾';
  if (norm.includes('pickle')) return '🥒';
  if (norm.includes('spice') || norm.includes('chilli') || norm.includes('powder') || norm.includes('coriander') || norm.includes('turmeric')) return '🌿';
  if (norm.includes('ghee')) return '🥛';
  if (norm.includes('pulse') || norm.includes('dal') || norm.includes('pulses')) return '🫘';
  if (norm.includes('oil')) return '🫗';
  if (norm.includes('honey') || norm.includes('sweet')) return '🍯';
  return '🌱';
};

const getProductBenefits = (prod) => {
  const name = (prod.name || '').toLowerCase();
  if (name.includes('brown rice')) return 'High Fiber • Unpolished';
  if (name.includes('sona masuri')) return 'Lightweight • Daily Cooking';
  if (name.includes('chilli')) return 'Fresh Ground • Rich Heat';
  if (name.includes('coriander')) return 'Fresh Ground • Rich Aroma';
  if (name.includes('ghee')) return 'Bilona Churned • A2 Ghee';
  if (name.includes('mustard') || name.includes('oil')) return 'Wood Pressed • Slow Extracted';
  if (name.includes('honey')) return 'Raw Wild Forest • Unprocessed';
  if (name.includes('turmeric')) return 'High Curcumin • Pure Ground';
  
  const categoryName = (prod.categories && prod.categories.length > 0)
    ? prod.categories[0].name
    : (prod.category?.name || prod.category || prod.tag || '');
  const cat = categoryName.toLowerCase();
  if (cat.includes('oil')) return 'Wood Pressed • Unrefined';
  if (cat.includes('ghee')) return 'Traditional Bilona • Pure A2';
  if (cat.includes('grain') || cat.includes('rice')) return 'Naturally Grown • Heritage';
  if (cat.includes('spice')) return 'Stone Ground • Pure Spice';
  if (cat.includes('honey')) return 'Naturally Sourced • Pure Honey';
  return '100% Organic • Chemical Free';
};

const getDynamicBadge = (prod) => {
  const name = (prod.name || '').toLowerCase();
  const category = (prod.categories && prod.categories[0]?.name || prod.category || '').toLowerCase();
  if (name.includes('ghee') || name.includes('bilona')) return 'Vedic A2';
  if (name.includes('unpolished') || name.includes('brown rice')) return 'Heritage Crop';
  if (name.includes('wood') || name.includes('pressed') || name.includes('oil')) return 'Cold Pressed';
  if (name.includes('chilli') || name.includes('turmeric') || name.includes('spices') || category.includes('spice')) return 'Stone Ground';
  if (name.includes('raw') || name.includes('honey')) return 'Wild Forest';
  if (prod.totalReviews > 10 || prod.averageRating >= 4.8) return 'Best Seller';
  return 'Single Origin';
};

export default function ProductCard({ product, onQuickView }) {
  const navigate = useNavigate();
  const { addItem, cartItems, updateQuantity, removeItem } = useCartStore();
  const wishlistItems = useWishlistStore(state => state.wishlistItems);
  const toggleWishlist = useWishlistStore(state => state.toggleWishlist);
  const { isAuthenticated } = useAuthStore();

  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Smooth image transition state variables
  const [isHovered, setIsHovered] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const cardRef = useRef(null);

  // Set up intersection observer for mobile viewports to trigger visible carousel
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.4 } // Activate visible carousel when 40% of card is in viewport
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const categoryName = (product.categories && product.categories.length > 0)
    ? product.categories[0].name
    : (product.category?.name || product.category || product.tag || 'Organic');

  const isProductWishlisted = wishlistItems.some(
    (item) => item.productId === product.id || item.id === product.id
  );

  const handleWishlistToggle = async (e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated) {
      useAuthStore.getState().setLoginRequiredModalOpen(true, "Please login to save items to your wishlist.");
      return;
    }
    await toggleWishlist(product.id);
  };

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

  const variants = getProductVariants(product);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (variants.length > 0) {
      setSelectedVariant(variants[0]);
    }
  }, [product]);

  // Parse and optimize all unique product images (declared before early return to obey React hooks order rules)
  const getProductImageUrls = () => {
    let urls = [];
    if (Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (typeof img === 'string') {
          if (img) urls.push(img);
        } else if (img && typeof img === 'object' && img.url) {
          urls.push(img.url);
        }
      });
    }
    // Fallback logic
    if (urls.length === 0) {
      if (product.image) urls.push(product.image);
      if (product.hoverImage) urls.push(product.hoverImage);
    }
    return [...new Set(urls)].filter(Boolean);
  };

  const allImages = getProductImageUrls();
  const optimizedImages = allImages.map(url =>
    getOptimizedImageUrl(url, { width: 800, cropMode: 'limit' })
  );

  const isActive = isHovered || isIntersecting;

  // Handles image selection and slideshow transitions (declared before early return)
  useEffect(() => {
    if (optimizedImages.length <= 1) {
      setCurrentImageIndex(0);
      return;
    }

    if (optimizedImages.length === 2) {
      setCurrentImageIndex(isActive ? 1 : 0);
      return;
    }

    if (optimizedImages.length >= 3) {
      if (!isActive) {
        setCurrentImageIndex(0);
        return;
      }

      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % optimizedImages.length);
      }, 2500); // Cycle every 2.5s

      return () => clearInterval(interval);
    }
  }, [isActive, optimizedImages.length]);

  const handleImageLoad = (index) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };

  if (!selectedVariant) return null;

  const isOutOfStock = selectedVariant.isBase
    ? (selectedVariant.inventory <= 0 || product.stockStatus === 'OUT_OF_STOCK')
    : (selectedVariant.inventory <= 0);

  const discountPercent = selectedVariant.mrp > selectedVariant.price
    ? Math.round(((selectedVariant.mrp - selectedVariant.price) / selectedVariant.mrp) * 100)
    : 0;

  const variantId = selectedVariant.isBase ? null : selectedVariant.id;
  const cartItem = cartItems.find(
    (item) => item.productId === product.id && 
    (variantId ? item.variantId === variantId : !item.variantId)
  );


  const handleAddToCart = async (e) => {
    if (e) e.stopPropagation();
    
    if (!isAuthenticated) {
      useAuthStore.getState().setLoginRequiredModalOpen(true, "Please login to add items to your cart.");
      return;
    }

    if (isAdding || isAdded) return;

    const variantId = selectedVariant.isBase ? null : selectedVariant.id;
    setIsAdding(true);
    try {
      await addItem(product.id, variantId, 1, true); // true = silent add to cart
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCardClick = () => {
    if (product.slug) {
      navigate(`/products/${product.slug}`);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white border border-[#EAE4D8] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md hover:border-[#4E641A]/20 transition-all duration-500 flex flex-col justify-between h-full cursor-pointer relative w-full text-left product-card-wrapper"
    >
      {/* Product Image Section */}
      <div 
        onClick={handleCardClick}
        className="relative aspect-square w-full overflow-hidden bg-transparent shrink-0 product-card-image-wrapper flex items-center justify-center"
      >
        {!loadedImages[0] && (
          <div className="absolute inset-0 flex items-center justify-center bg-transparent">
            <div className="w-16 h-16 rounded-full bg-light-beige/30 animate-pulse" />
          </div>
        )}
        {optimizedImages.map((src, index) => (
          <img
            key={src}
            src={src}
            srcSet={getImageSrcSet(allImages[index], { widths: [400, 800], cropMode: 'limit' })}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            alt={`${product.name} - view ${index + 1}`}
            width={800}
            height={800}
            loading={index === 0 ? "lazy" : "eager"}
            onLoad={() => handleImageLoad(index)}
            className="absolute inset-0 w-full h-full object-contain p-3.5 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-opacity duration-600 ease-in-out product-card-image"
            style={{
              opacity: (index === currentImageIndex && loadedImages[index]) ? 1 : 0,
              zIndex: index === currentImageIndex ? 10 : 0,
              pointerEvents: index === currentImageIndex ? 'auto' : 'none'
            }}
          />
        ))}

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white text-stone-400 hover:text-[#4E641A] rounded-full flex items-center justify-center shadow-md border border-stone-150 transition cursor-pointer z-20 product-card-wishlist"
          title="Wishlist"
        >
          <FiHeart className={`w-4 h-4 ${isProductWishlisted ? 'fill-[#4E641A] text-[#4E641A]' : 'text-stone-400'}`} />
        </button>

        {/* Dynamic Badges */}
        {isOutOfStock ? (
          <span className="absolute top-2 left-2 bg-red-500 text-white font-sans text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm z-20 product-card-dynamic-badge">
            Sold Out
          </span>
        ) : product.isComingSoon ? (
          <span className="absolute top-2 left-2 bg-sunrise-gold text-dark-olive font-sans text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm z-20 product-card-dynamic-badge">
            Upcoming
          </span>
        ) : (
          <span className="absolute top-2 left-2 bg-[#4E641A] text-white font-sans text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm z-20 product-card-dynamic-badge">
            {getDynamicBadge(product)}
          </span>
        )}

        {discountPercent > 0 && !isOutOfStock && (
          <span className="absolute bottom-2 left-2 bg-[#C68A2B] text-white text-[8px] font-extrabold uppercase py-0.5 px-1.5 rounded shadow-sm leading-none z-20 product-card-discount-badge">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Card Details Section */}
      <div className="p-2 sm:p-4.5 flex-grow flex flex-col justify-between gap-1 sm:gap-2.5 product-card-details">
        <div className="flex flex-col gap-1 sm:gap-1.5">
          {/* Category Tag & Ratings */}
          <div className="flex items-center justify-between text-[8px] sm:text-[10px] text-[#4E641A] font-sans font-medium product-card-meta">
            <span className="bg-[#4E641A]/5 text-[#4E641A] border border-[#4E641A]/15 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md product-category-badge leading-none">
              {categoryName}
            </span>
            {product.totalReviews > 0 ? (
              <span className="flex items-center gap-0.5 text-sunrise-gold text-[9px] sm:text-[10px] font-bold product-card-rating">
                <FiStar className="w-2.5 h-2.5 fill-sunrise-gold text-sunrise-gold sm:w-3 sm:h-3" />
                <span className="text-dark-text/75">{product.averageRating}</span>
                <span className="text-stone-400/70 font-normal hidden sm:inline">({product.totalReviews})</span>
              </span>
            ) : (
              <span className="italic text-stone-450/80 text-[8px] sm:text-[9px] hidden sm:inline">New Harvest</span>
            )}
          </div>

          {/* Product Name */}
          <h3 
            onClick={handleCardClick}
            className="font-serif text-[13px] sm:text-base font-bold text-[#2F3B0C] group-hover:text-[#4E641A] transition leading-tight line-clamp-2 cursor-pointer product-card-title mt-1"
          >
            {product.name}
          </h3>

          {/* Mobile-only Price Section */}
          <div className="flex items-baseline gap-1.5 mt-1 sm:hidden product-card-price-mobile">
            <span className="text-[16px] font-black text-[#4E641A] leading-none">
              ₹{selectedVariant.price}
            </span>
            {selectedVariant.mrp > selectedVariant.price && (
              <span className="text-[12px] line-through text-stone-450 font-medium leading-none">
                ₹{selectedVariant.mrp}
              </span>
            )}
          </div>

          {/* Product Benefit Line */}
          <p className="text-[10px] text-stone-500 font-medium leading-none truncate select-none hidden sm:block mt-1">
            {getProductBenefits(product)}
          </p>

          {/* Size Pills */}
          {variants.length > 1 ? (
            <div 
              className="flex flex-row sm:flex-wrap gap-1.5 mt-2 overflow-x-auto no-scrollbar whitespace-nowrap w-full scroll-smooth product-card-sizes-container"
              onClick={(e) => e.stopPropagation()}
            >
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition-all duration-200 shrink-0 select-none ${
                    selectedVariant.id === v.id
                      ? 'bg-[#4E641A] border-[#4E641A] text-white shadow-sm'
                      : 'bg-white border-[#EAE4D8] text-[#2F3B0C]/80 hover:bg-stone-50'
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-[10px] font-bold text-stone-450 uppercase tracking-wider mt-2 block product-card-weight">
              {selectedVariant.name}
            </span>
          )}
        </div>

        {/* Pricing & CTA Block */}
        <div className="product-card-action-bar pt-2 border-t border-stone-100 sm:pt-3 flex flex-row items-center justify-between mt-auto w-full">
          {/* Desktop-only Price Column */}
          <div className="hidden sm:flex flex-col items-start leading-none">
            <span className="text-[9px] font-bold text-stone-450 uppercase tracking-wider leading-none">Price</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-extrabold text-[#4E641A]">
                ₹{selectedVariant.price}
              </span>
              {selectedVariant.mrp > selectedVariant.price && (
                <span className="text-[11px] line-through text-stone-400 font-medium">
                  ₹{selectedVariant.mrp}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button Container */}
          <div className="product-card-btn-container w-full sm:w-28 md:w-32 h-[42px] sm:h-9 relative overflow-hidden select-none">
            <AnimatePresence mode="wait">
              {!cartItem ? (
                <motion.button
                  key="add"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdding}
                  className={`product-card-add-btn px-3 py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all duration-350 flex items-center justify-center space-x-1.5 border-none cursor-pointer select-none h-full w-full ${
                    isOutOfStock 
                      ? 'bg-stone-100 text-stone-450 cursor-not-allowed'
                      : 'bg-[#4E641A] hover:bg-[#2F3B0C] text-white hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <span>🛒</span>
                  <span>
                    {isOutOfStock ? 'Out' : isAdding ? 'Adding...' : 'Add to Cart'}
                  </span>
                </motion.button>
              ) : (
                <motion.div
                  key="quantity-selector"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="product-card-qty-selector flex items-center justify-between bg-white border border-[#4E641A] text-[#4E641A] rounded-xl h-full shadow-sm w-full overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        if (cartItem.quantity > 1) {
                          await updateQuantity(cartItem.id, cartItem.quantity - 1);
                        } else {
                          await removeItem(cartItem.id);
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-3 h-full bg-transparent hover:bg-[#4E641A]/5 text-[#4E641A] font-bold text-sm border-none cursor-pointer flex items-center justify-center transition active:scale-90"
                  >
                    -
                  </button>
                  <span className="font-sans text-xs font-extrabold text-stone-900 select-none">
                    {cartItem.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await updateQuantity(cartItem.id, cartItem.quantity + 1);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-3 h-full bg-transparent hover:bg-[#4E641A]/5 text-[#4E641A] font-bold text-sm border-none cursor-pointer flex items-center justify-center transition active:scale-90"
                  >
                    +
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

