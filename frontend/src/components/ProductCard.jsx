import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiHeart, FiSearch } from 'react-icons/fi';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

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

  const rawFrontImage = product.image || (product.images?.length > 0 ? product.images[0].url : null) || (product.galleryImages?.length > 0 ? product.galleryImages[0] : '/placeholder.png');
  const rawBackImage = product.hoverImage || product.galleryImage || (product.images?.length > 1 ? product.images[1].url : null) || (product.galleryImages?.length > 1 ? product.galleryImages[1] : null);

  const frontImage = getOptimizedImageUrl(rawFrontImage, { width: 400, height: 400, cropMode: 'fill' });
  const backImage = rawBackImage ? getOptimizedImageUrl(rawBackImage, { width: 400, height: 400, cropMode: 'fill' }) : null;

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
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group bg-white border border-[#EAE4D8] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md hover:border-[#4E641A]/20 transition-all duration-500 flex flex-col justify-between h-full cursor-pointer relative w-full text-left product-card-wrapper"
    >
      {/* Product Image Section */}
      <div 
        onClick={handleCardClick}
        className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden bg-[#F8F5F0] border-b border-[#EAE4D8]/40 shrink-0 product-card-image-wrapper"
      >
        <img
          src={frontImage}
          alt={product.name}
          width={400}
          height={400}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-300 product-card-image"
        />
        {backImage && (
          <img
            src={backImage}
            alt={`${product.name} back view`}
            width={400}
            height={400}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 product-card-image-hover"
          />
        )}

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
          <div className="flex items-center justify-between text-[8px] sm:text-[10px] text-stone-400 font-sans font-medium product-card-meta">
            <span className="text-[#4E641A] font-bold uppercase tracking-wider flex items-center gap-0.5">
              <span>{getCategoryEmoji(categoryName)}</span>
              <span>{categoryName}</span>
            </span>
            {product.totalReviews > 0 ? (
              <span className="flex items-center gap-0.5 text-sunrise-gold">
                <FiStar className="w-3 h-3 fill-sunrise-gold text-sunrise-gold" />
                <span className="text-dark-text/75 font-bold">{product.averageRating}</span>
                <span className="text-stone-400/70 font-normal">({product.totalReviews})</span>
              </span>
            ) : (
              <span className="italic text-stone-400/80">New Harvest</span>
            )}
          </div>

          {/* Product Name */}
          <h3 
            onClick={handleCardClick}
            className="font-serif text-[11px] sm:text-base font-bold text-[#2F3B0C] group-hover:text-[#4E641A] transition leading-tight line-clamp-1 cursor-pointer product-card-title"
          >
            {product.name}
          </h3>

          {/* Product Benefit Line */}
          <p className="text-[10px] text-stone-500 font-medium leading-none truncate select-none hidden sm:block">
            {getProductBenefits(product)}
          </p>

          {/* Size Pills */}
          {variants.length > 1 ? (
            <>
              <div className="flex flex-wrap gap-1 mt-1 hidden sm:flex" onClick={(e) => e.stopPropagation()}>
                {variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded-md border transition-all duration-200 ${
                      selectedVariant.id === v.id
                        ? 'bg-[#4E641A] border-[#4E641A] text-white shadow-sm'
                        : 'bg-white border-[#EAE4D8] text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
              {/* Mobile view selector */}
              {variants.length <= 3 ? (
                /* Segmented Pills for 2-3 variants */
                <div className="flex flex-wrap gap-1.5 mt-1 sm:hidden" onClick={(e) => e.stopPropagation()}>
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`product-card-segmented-btn border ${
                        selectedVariant.id === v.id
                          ? 'bg-[#4E641A] border-[#4E641A] text-white shadow-sm'
                          : 'bg-[#FAF7F2] border-[#EAE4D8] text-dark-olive/80 hover:bg-light-beige'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              ) : (
                /* Premium Dropdown Pill for > 3 variants */
                <div className="relative inline-block mt-1 sm:hidden" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={selectedVariant.id}
                    onChange={(e) => {
                      const vId = e.target.value;
                      const found = variants.find(v => v.id === vId);
                      if (found) setSelectedVariant(found);
                    }}
                    className="appearance-none pr-6 rounded-full focus:outline-none cursor-pointer text-left product-card-weight-selector"
                  >
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[6px] text-dark-olive/50">
                    ▼
                  </div>
                </div>
              )}
            </>
          ) : (
            <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-0.5 sm:mt-1 block product-card-weight">
              {selectedVariant.name}
            </span>
          )}
        </div>

          {/* Pricing & CTA Block */}
        <div className="pt-1.5 sm:pt-3 border-t border-stone-100 flex items-center justify-between gap-1.5 mt-auto product-card-action-bar">
          <div className="flex flex-col text-left">
            <span className="text-[8px] sm:text-[9px] font-bold text-stone-400 uppercase tracking-wider leading-none">Price</span>
            <div className="flex items-baseline gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
              <span className="text-xs sm:text-base font-extrabold text-[#4E641A]">
                ₹{selectedVariant.price}
              </span>
              {selectedVariant.mrp > selectedVariant.price && (
                <span className="text-[8px] sm:text-[9px] line-through text-stone-400 font-medium">
                  ₹{selectedVariant.mrp}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center h-8 sm:h-9 relative overflow-hidden select-none">
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
                  className={`px-2.5 py-1.5 sm:px-4 sm:py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all duration-350 flex items-center justify-center space-x-1 shadow-sm border-none cursor-pointer select-none product-card-add-btn h-full w-full ${
                    isOutOfStock 
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      : 'bg-[#4E641A] hover:bg-[#2F3B0C] text-white hover:scale-[1.03] active:scale-[0.98]'
                  }`}
                >
                  <span>🛒</span>
                  <span>
                    {isOutOfStock ? 'Out' : isAdding ? 'Adding...' : 'Add'}
                  </span>
                </motion.button>
              ) : (
                <motion.div
                  key="quantity-selector"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-between bg-white border border-[#4E641A] text-[#4E641A] rounded-xl h-full shadow-sm w-20 sm:w-24 overflow-hidden"
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
                    className="px-2 sm:px-2.5 h-full bg-transparent hover:bg-[#4E641A]/5 text-[#4E641A] font-bold text-xs sm:text-sm border-none cursor-pointer flex items-center justify-center transition active:scale-90"
                  >
                    -
                  </button>
                  <span className="font-sans text-[10px] sm:text-xs font-extrabold text-stone-900 select-none">
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
                    className="px-2 sm:px-2.5 h-full bg-transparent hover:bg-[#4E641A]/5 text-[#4E641A] font-bold text-xs sm:text-sm border-none cursor-pointer flex items-center justify-center transition active:scale-90"
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

