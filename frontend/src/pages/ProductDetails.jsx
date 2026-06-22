import React, { useState, useEffect, Profiler } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheck, FiShoppingBag, FiInfo, FiTruck, FiArrowLeft, FiHeart, FiStar, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { GiSun } from 'react-icons/gi';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { useModalStore } from '../store/useModalStore';
import api from '../utils/api';
import UnifiedUploader from '../components/UnifiedUploader';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

// Simple, high-quality, organic confetti effect
const triggerConfetti = (canvasEl) => {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext('2d');
  const width = canvasEl.width = canvasEl.offsetWidth;
  const height = canvasEl.height = canvasEl.offsetHeight;
  
  const colors = [
    '#4E641A', // Olive green (primary-green)
    '#2F3B0C', // Dark olive
    '#C68A2B', // Sunrise gold
    '#EAE4D8', // Light beige
    '#8FBC8F', // Soft sea green
  ];
  
  let particles = Array.from({ length: 60 }).map(() => ({
    x: Math.random() * width,
    y: -10 - Math.random() * 20,
    r: 3 + Math.random() * 4,
    d: Math.random() * height,
    color: colors[Math.floor(Math.random() * colors.length)],
    tilt: Math.random() * 10 - 5,
    tiltAngleIncremental: Math.random() * 0.05 + 0.02,
    tiltAngle: 0,
    vy: 1.5 + Math.random() * 1.5,
    vx: Math.random() * 1.5 - 0.75
  }));
  
  let animationFrameId;
  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    let remaining = false;
    
    particles.forEach((p) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.tiltAngle) * 0.4;
      
      if (p.y < height) {
        remaining = true;
      }
      
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });
    
    if (remaining) {
      animationFrameId = requestAnimationFrame(draw);
    }
  };
  
  draw();
  return () => {
    cancelAnimationFrame(animationFrameId);
  };
};

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [allVariants, setAllVariants] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedReviewDetails, setSubmittedReviewDetails] = useState(null);

  // Global Stores bindings
  const { addToCart } = useCartStore();
  const wishlistItems = useWishlistStore(state => state.wishlistItems);
  const toggleWishlist = useWishlistStore(state => state.toggleWishlist);
  const { isAuthenticated } = useAuthStore();
  const modal = useModalStore();

  const isProductWishlisted = product
    ? wishlistItems.some((item) => item.productId === product.id || item.id === product.id)
    : false;

  useEffect(() => {
    if (slug) {
      fetchProductDetails();
    }
  }, [slug]);

  const getProductVariants = (prod) => {
    if (!prod) return [];
    const baseVariant = {
      id: 'base',
      name: prod.weight || 'Default Size',
      price: prod.price,
      mrp: prod.compareAtPrice || prod.mrp || prod.price,
      sku: prod.sku,
      inventory: prod.inventory,
      stockStatus: prod.stockStatus,
      isBase: true
    };

    if (!prod.variants || prod.variants.length === 0) {
      return [baseVariant];
    }

    const baseWeightNorm = (prod.weight || '').toLowerCase().replace(/\s+/g, '').replace(/kb/g, 'kg');
    const hasBaseInVariants = prod.variants.some(
      v => (v.name || '').toLowerCase().replace(/\s+/g, '').replace(/kb/g, 'kg') === baseWeightNorm
    );

    let list = [...prod.variants];
    if (!hasBaseInVariants) {
      list.push(baseVariant);
    }
    return list.sort((a, b) => a.price - b.price);
  };

  const fetchProductDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/products/${slug}`);
      const prod = response.product;
      setProduct(prod);
      setActiveImage(prod.image || (prod.images?.length > 0 ? prod.images[0].url : ''));
      
      const compiledVariants = getProductVariants(prod);
      setAllVariants(compiledVariants);
      
      if (compiledVariants.length > 0) {
        setSelectedVariant(compiledVariants[0]);
      } else {
        setSelectedVariant(null);
      }
      
      // Fetch related products under same category - isolated error handling
      try {
        const categoryName = (prod.categories && prod.categories.length > 0)
          ? prod.categories[0].name
          : (prod.category?.name || 'Staples');
        const relResponse = await api.get(`/products?category=${categoryName}&limit=4`);
        if (relResponse && relResponse.products) {
          setRelatedProducts(relResponse.products.filter(p => p.id !== prod.id).slice(0, 3));
        }
      } catch (relErr) {
        console.error("Failed to fetch related products, using fallback empty list:", relErr);
        setRelatedProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch product details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedVariantId = () => {
    if (!selectedVariant || selectedVariant.isBase || selectedVariant.id === 'base') {
      return null;
    }
    return selectedVariant.id;
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      useAuthStore.getState().setLoginRequiredModalOpen(true);
      return;
    }
    if (isAdding) return;
    setIsAdding(true);
    try {
      await addToCart(product.id, getSelectedVariantId(), quantity);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      useAuthStore.getState().setCheckoutResumeRedirect('/checkout');
      useAuthStore.getState().setLoginRequiredModalOpen(true);
      return;
    }
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await addToCart(product.id, getSelectedVariantId(), quantity, true);
      navigate('/checkout');
    } catch (err) {
      modal.alert('Action Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      useAuthStore.getState().setLoginRequiredModalOpen(true, "Please login to save items to your wishlist.");
      return;
    }
    try {
      await toggleWishlist(product.id);
    } catch (err) {
      modal.alert('Action Failed', err.message, 'error');
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      useAuthStore.getState().setLoginRequiredModalOpen(true);
      return;
    }

    try {
      const response = await api.post(`/products/${product.id}/reviews`, { 
        rating, 
        reviewTitle, 
        reviewText: comment, 
        reviewImages: reviewImages 
      });
      if (response.success) {
        setSubmittedReviewDetails({
          rating,
          title: reviewTitle,
          text: comment,
          productName: product.name,
          status: response.review?.status || 'PENDING'
        });
        setShowSuccessModal(true);
      }
      setReviewSuccess(true);
      setComment('');
      setReviewTitle('');
      setReviewImages([]);
      fetchProductDetails();
      setTimeout(() => setReviewSuccess(false), 5000);
    } catch (err) {
      modal.alert('Action Failed', err.message, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-bg flex items-center justify-center pt-20">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <GiSun className="text-sunrise-gold text-4xl animate-spin-slow" />
          <span className="font-sans text-xs font-semibold text-dark-olive uppercase tracking-widest">Loading Premium Staples...</span>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = selectedVariant
    ? (selectedVariant.isBase
      ? (selectedVariant.inventory <= 0 || product.stockStatus === 'OUT_OF_STOCK')
      : (selectedVariant.inventory <= 0))
    : (product.inventory <= 0 || product.stockStatus === 'OUT_OF_STOCK');

  const whatsappMessage = encodeURIComponent(
    `Namaste Suryodaya Farms! I am interested in inquiring about your premium organic "${product.name}" (${selectedVariant ? selectedVariant.price : product.price}). Please share more details.`
  );

  const getProductImagesList = () => {
    if (!product) return [];
    const list = [];
    
    // Add Main Image
    if (product.image) {
      list.push(product.image);
    } else if (product.images && product.images.length > 0) {
      const featuredImg = product.images.find(img => img.isFeatured);
      if (featuredImg) {
        list.push(featuredImg.url);
      } else {
        list.push(product.images[0].url);
      }
    }
    
    // Add Gallery Image (hoverImage / galleryImage)
    if (product.galleryImage) {
      list.push(product.galleryImage);
    } else if (product.hoverImage) {
      list.push(product.hoverImage);
    }
    
    // Add other images from images relation
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (!list.includes(img.url)) {
          list.push(img.url);
        }
      });
    }
    
    // Add any from galleryImages array in case of future support
    if (product.galleryImages && Array.isArray(product.galleryImages)) {
      product.galleryImages.forEach(img => {
        if (img && !list.includes(img)) {
          list.push(img);
        }
      });
    }
    
    return list.filter(Boolean);
  };

  const onRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
    if (import.meta.env.DEV) {
      console.log(`[Profiler] ${id} - Phase: ${phase} - Actual Duration: ${actualDuration.toFixed(2)}ms`);
    }
  };

  return (
    <Profiler id="ProductDetails" onRender={onRenderCallback}>
      <div className="min-h-screen bg-cream-bg pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        
        {/* Back navigation */}
        <button
          onClick={() => navigate('/products')}
          className="self-start flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest text-primary-green hover:text-sunrise-gold transition-colors duration-300 cursor-pointer"
        >
          <FiArrowLeft />
          <span>Back to Marketplace</span>
        </button>
        
        {/* 1. Splitted Image and Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Column 1: Image Gallery & Badges */}
          <div className="flex flex-col gap-6 w-full text-left">
            <div className="relative aspect-square w-full rounded-[36px] overflow-hidden border border-light-beige shadow-sm bg-light-beige">
              <img
                src={getOptimizedImageUrl(activeImage, { width: 600, height: 600, cropMode: 'fill' })}
                alt={product.name}
                width={600}
                height={600}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              
              <button
                onClick={handleToggleWishlist}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-cream-bg/90 backdrop-blur shadow-md flex items-center justify-center text-dark-olive hover:text-primary-green hover:bg-white transition-all duration-300 border border-light-beige cursor-pointer"
              >
                <FiHeart size={20} className={isProductWishlisted ? 'fill-primary-green text-primary-green' : ''} />
              </button>
            </div>

            {/* Thumbnails list */}
            <div className="flex gap-4">
              {getProductImagesList().map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                    activeImage === img ? 'border-primary-green scale-95 shadow-inner' : 'border-light-beige hover:border-sunrise-gold'
                  }`}
                >
                  <img 
                    src={getOptimizedImageUrl(img, { width: 80, height: 80, cropMode: 'fill' })} 
                    alt={`Product Thumbnail ${i + 1}`} 
                    width={80}
                    height={80}
                    loading="lazy"
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>

            {/* Organic Badges Panel */}
            <div className="grid grid-cols-3 gap-4 border-t border-light-beige/60 pt-6 mt-4">
              {[
                { title: 'USDA Organic', desc: '100% Certified pure soil' },
                { title: 'Preserved Heirloom', desc: 'Desi seed preservation' },
                { title: 'Vedic Churned', desc: 'Vedic kitchen systems' }
              ].map((badge, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-3 rounded-2xl bg-light-beige/25 border border-light-beige/40">
                  <FiCheck className="text-primary-green mb-1 text-base" />
                  <span className="font-serif text-xs font-bold text-dark-olive">{badge.title}</span>
                  <span className="font-sans text-[9px] text-dark-text/50 font-light mt-0.5">{badge.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: E-Commerce Product Parameters */}
          <div className="flex flex-col gap-6 text-left w-full">
            <div className="flex flex-col gap-2">
              <span className="inline-block bg-sunrise-gold text-dark-olive font-sans text-[10px] font-bold uppercase tracking-widest px-3.5 py-1 rounded-full self-start shadow-sm mb-1">
                {(product.categories && product.categories.length > 0) ? product.categories[0].name : (product.category?.name || 'Vedic Staples')}
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-dark-olive leading-tight">
                {product.name}
              </h1>
              
              {/* Ratings averages */}
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex text-sunrise-gold shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className={`text-sm shrink-0 ${
                      i < Math.round(product.averageRating || 0) ? 'text-sunrise-gold fill-sunrise-gold' : 'text-light-beige'
                    }`} />
                  ))}
                </div>
                <span className="font-sans text-xs text-dark-text/60 font-semibold pl-1">
                  {product.totalReviews > 0 ? (
                    `${product.averageRating} (${product.totalReviews} Reviews)`
                  ) : (
                    'No reviews yet'
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 border-b border-light-beige pb-4">
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-2xl font-bold text-primary-green">
                  ₹{selectedVariant ? selectedVariant.price : product.price}
                </span>
                {(() => {
                  const mrpVal = selectedVariant ? (selectedVariant.mrp || product.compareAtPrice) : product.compareAtPrice;
                  const priceVal = selectedVariant ? selectedVariant.price : product.price;
                  if (!mrpVal || mrpVal <= priceVal) return null;
                  const discVal = Math.round(((mrpVal - priceVal) / mrpVal) * 100);
                  return (
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-sm text-dark-text/40 line-through font-light">
                        ₹{mrpVal}
                      </span>
                      {discVal > 0 && (
                        <span className="text-[10px] font-bold text-[#C68A2B] bg-[#C68A2B]/10 px-2 py-0.5 rounded shadow-xs select-none">
                          {discVal}% OFF
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                isOutOfStock
                  ? 'bg-red-50 text-red-650 border border-red-200' 
                  : 'bg-[#4E641A]/5 text-[#4E641A] border border-[#4E641A]/20'
              }`}>
                {isOutOfStock ? 'Out of Stock' : 'In Stock'}
              </span>
            </div>

            <p className="font-sans text-xs md:text-sm text-dark-text/75 leading-relaxed font-light">
              {product.description}
            </p>

            {/* Variant Selector */}
            {allVariants.length > 1 && (
              <div className="flex flex-col gap-3 my-2 border-t border-light-beige/50 pt-4">
                <span className="font-sans text-xs font-semibold text-dark-olive uppercase tracking-wider text-left">Select Size / Weight:</span>
                <div className="flex flex-wrap gap-2.5">
                  {allVariants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                        selectedVariant?.id === v.id
                          ? 'bg-primary-green text-white border-transparent shadow-sm'
                          : 'bg-white hover:bg-light-beige text-dark-text border-light-beige'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity counters */}
            <div className="flex items-center gap-4 my-2 border-t border-b border-light-beige/50 py-4">
              <span className="font-sans text-xs font-semibold text-dark-olive uppercase tracking-wider">Select Quantities:</span>
              <div className="flex items-center border border-light-beige rounded-xl bg-cream-bg shadow-inner">
                <button
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="p-2.5 text-dark-olive hover:text-primary-green cursor-pointer"
                >
                  <FiMinus size={12} />
                </button>
                <span className="font-sans text-sm font-semibold px-4 text-dark-olive select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 text-dark-olive hover:text-primary-green cursor-pointer"
                >
                  <FiPlus size={12} />
                </button>
              </div>
            </div>

            {/* Buy and Add triggers */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className={`flex-1 flex items-center justify-center gap-2 border font-sans text-xs font-semibold uppercase tracking-widest py-4.5 rounded-xl transition-colors duration-300 shadow-sm cursor-pointer ${
                  isOutOfStock || isAdding
                    ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                    : 'border-primary-green text-primary-green hover:bg-primary-green hover:text-white'
                }`}
              >
                <FiShoppingBag />
                <span>{isOutOfStock ? 'Sold Out' : isAdding ? 'Adding...' : 'Add to Basket'}</span>
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || isProcessing}
                className={`flex-grow flex items-center justify-center font-sans text-xs font-semibold uppercase tracking-widest py-4.5 rounded-xl transition-colors duration-300 shadow-md cursor-pointer ${
                  isOutOfStock || isProcessing
                    ? 'bg-stone-300 text-stone-400 cursor-not-allowed'
                    : 'bg-primary-green hover:bg-dark-olive text-white'
                }`}
              >
                {isOutOfStock ? 'Out of Stock' : isProcessing ? 'Processing...' : 'Buy Now'}
              </button>
            </div>

            {/* WhatsApp direct CTA */}
            <a
              href={`https://wa.me/919845273105?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-sans text-xs font-semibold uppercase tracking-widest py-4 rounded-xl hover:bg-[#1ebd59] transition-colors duration-300 shadow-md"
            >
              <FaWhatsapp size={16} />
              <span>Inquire via WhatsApp</span>
            </a>

            {/* Packing / Delivery timelines details */}
            <div className="bg-light-beige/35 border border-light-beige rounded-2xl p-5 flex gap-4 mt-2">
              <FiTruck className="text-primary-green text-xl shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-left">
                <span className="font-serif text-sm font-bold text-dark-olive">Shipping Details</span>
                <p className="font-sans text-xs text-dark-text/70 leading-relaxed font-light">
                  Freshly packaged in eco-friendly cotton bags on shipping mornings. Shipped direct to Indian metros, arriving within 3–4 business days.
                </p>
              </div>
            </div>

            {/* Nutrient details panel */}
            {product.nutrients && (
              <div className="bg-light-beige/10 border border-light-beige/50 rounded-2xl p-5 flex gap-4 mt-1">
                <FiInfo className="text-primary-green text-lg shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 text-left">
                  <span className="font-serif text-sm font-bold text-dark-olive">Nutritional Details</span>
                  <span className="font-sans text-xs text-dark-text/75 font-light leading-relaxed">{product.nutrients}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. REVIEWS & SUBMISSIONS SECTION */}
        <div className="border-t border-light-beige/60 pt-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start text-left">
          
          {/* Review listings */}
          <div className="flex flex-col gap-6 w-full">
            <h3 className="font-serif text-2xl font-bold text-dark-olive">Family Reviews ({product.totalReviews || 0})</h3>
            
            <div className="flex flex-col gap-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-light-beige/50 pb-5 last:border-0">
                    <div className="flex justify-between items-baseline gap-2 mb-1.5">
                      <span className="font-serif text-sm font-bold text-dark-olive">{rev.customerName || rev.user?.name}</span>
                      <span className="font-sans text-[10px] text-dark-text/40">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={`text-xs ${
                          i < rev.rating ? 'text-sunrise-gold fill-sunrise-gold' : 'text-light-beige'
                        }`} />
                      ))}
                    </div>
                    {rev.reviewTitle && (
                      <h5 className="font-serif text-sm font-bold text-dark-olive mb-1">{rev.reviewTitle}</h5>
                    )}
                    <p className="font-sans text-xs text-dark-text/75 leading-relaxed font-light mb-2">{rev.reviewText || rev.comment}</p>
                    {rev.reviewImages && rev.reviewImages.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {rev.reviewImages.map((img, index) => (
                          <img 
                            key={index} 
                            src={getOptimizedImageUrl(img, { width: 48, height: 48, cropMode: 'fill' })} 
                            alt={`Review Thumbnail ${index + 1}`} 
                            width={48}
                            height={48}
                            loading="lazy"
                            className="w-12 h-12 object-cover rounded-lg border border-light-beige" 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-light-beige/10 border border-light-beige/40 rounded-2xl p-6 text-center text-xs font-sans text-dark-text/50 font-light">
                  Be the first family member to review this harvest.
                </div>
              )}
            </div>
          </div>

          {/* Add review form */}
          <div className="bg-light-beige/25 border border-light-beige rounded-[32px] p-6 md:p-8 w-full text-left">
            <h4 className="font-serif text-xl font-bold text-dark-olive mb-2">Write a Review</h4>
            <p className="font-sans text-xs text-dark-text/60 leading-relaxed font-light mb-6">
              Share your organic tasting feedback to help other families select their dryland staples.
            </p>

            <form onSubmit={handleAddReview} className="flex flex-col gap-5">
              {reviewSuccess && (
                <div className="bg-primary-green/10 border border-primary-green/20 rounded-xl p-3 text-[10px] text-primary-green font-semibold">
                  Namaste! Your review has been submitted for moderation.
                </div>
              )}

              {/* Rating stars selectors */}
              <div className="flex items-center gap-3">
                <span className="font-sans text-xs font-semibold text-dark-olive uppercase tracking-wider">Select Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-lg focus:outline-none cursor-pointer"
                    >
                      <FiStar className={star <= rating ? 'text-sunrise-gold fill-sunrise-gold' : 'text-light-beige'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title details */}
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-semibold text-dark-olive tracking-wide">Review Title</label>
                <input
                  type="text"
                  placeholder="Summarize your experience (e.g. Traditional Flavor, Heavenly Aroma)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full bg-cream-bg border border-light-beige rounded-xl py-3 px-4 font-sans text-xs focus:outline-none focus:border-sunrise-gold"
                />
              </div>

              {/* Comment details */}
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-semibold text-dark-olive tracking-wide">Review Comment</label>
                <textarea
                  placeholder="Tell us about the granular texture of Bilona ghee, or the pungent aroma of wood ghani mustard oils..."
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-cream-bg border border-light-beige rounded-xl py-3 px-4 font-sans text-xs focus:outline-none focus:border-sunrise-gold resize-none"
                  required
                />
              </div>

              {/* Review Images Upload */}
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-semibold text-dark-olive tracking-wide">Review Photos</label>
                
                {/* Uploaded photos list */}
                {reviewImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-2">
                    {reviewImages.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-light-beige group">
                        <img src={img} alt={`Uploaded review ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setReviewImages(reviewImages.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-[#0E1204]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200 border-none cursor-pointer"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Uploader for adding new images */}
                {reviewImages.length < 5 ? (
                  <UnifiedUploader
                    value=""
                    onChange={(newUrl) => {
                      if (newUrl) {
                        setReviewImages([...reviewImages, newUrl]);
                      }
                    }}
                    label={reviewImages.length === 0 ? "Add Photos of the Harvest" : "Add Another Photo"}
                    folder="reviews"
                    aspectRatio={1}
                  />
                ) : (
                  <p className="text-[10px] text-stone-400 font-medium">Maximum 5 photos allowed.</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-primary-green hover:bg-dark-olive text-white font-sans text-xs font-semibold uppercase tracking-widest py-3.5 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          </div>

        </div>

        {/* 3. RELATED PRODUCTS RECOMMENDATIONS */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-light-beige/60 pt-16 flex flex-col gap-8 text-left w-full">
            <h3 className="font-serif text-2xl font-bold text-dark-olive">Related Seasonal Harvests</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/products/${p.slug}`)}
                  className="group bg-cream-bg border border-light-beige rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 cursor-pointer flex flex-col h-full"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-light-beige shrink-0">
                    <img 
                      src={getOptimizedImageUrl(p.image || p.images?.[0]?.url, { width: 400, height: 400, cropMode: 'fill' })} 
                      alt={p.name} 
                      width={400}
                      height={400}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <span className="absolute bottom-4 left-4 bg-cream-bg/95 backdrop-blur-sm border border-light-beige text-dark-olive font-sans text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                      {(p.categories && p.categories.length > 0) ? p.categories[0].name : (p.category?.name || 'Vedic')}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col justify-between flex-1 gap-3">
                    <div className="flex flex-col gap-1.5 text-left">
                      <strong className="font-serif text-base font-bold text-dark-olive group-hover:text-primary-green transition-colors">{p.name}</strong>
                      <span className="font-serif text-sm font-semibold text-primary-green">₹{p.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 4. PREMIUM SUCCESS MODAL */}
      {showSuccessModal && submittedReviewDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-olive/40 backdrop-blur-md animate-fade-in font-sans">
          {/* Confetti Canvas */}
          {(submittedReviewDetails.rating >= 4) && (
            <canvas
              ref={(el) => {
                if (el) triggerConfetti(el);
              }}
              className="absolute inset-0 pointer-events-none w-full h-full z-10"
            />
          )}
          
          {/* Modal Container */}
          <div className="relative w-full max-w-lg bg-cream-bg border border-light-beige rounded-[32px] p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden animate-scale-up z-20">
            {/* Background glowing gradients */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-green/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-sunrise-gold/5 rounded-full blur-2xl pointer-events-none" />

            {/* Success Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-green/10 text-primary-green rounded-full flex items-center justify-center mb-5 animate-icon-spring animate-pulse-subtle shadow-inner">
              <FiStar className="w-8 h-8 sm:w-10 sm:h-10 fill-current text-primary-green" />
            </div>

            {/* Pending Approval Badge */}
            {submittedReviewDetails.status === 'PENDING' && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 mb-4 select-none animate-fade-in">
                🕒 Pending Approval
              </span>
            )}

            {/* Header */}
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-dark-olive mb-3 leading-snug">
              Thank You For Sharing Your Experience 🌿
            </h3>

            {/* Message */}
            <p className="text-xs sm:text-sm text-dark-text/75 leading-relaxed font-light mb-6 px-2">
              Your review has been submitted successfully.
              <br />
              Our team will verify and publish it shortly to help other families discover authentic farm products.
            </p>

            {/* Review Summary Box */}
            <div className="w-full bg-light-beige/30 border border-light-beige/70 rounded-2xl p-4 mb-6 flex flex-col items-center gap-2 select-none text-xs">
              <span className="text-[9px] font-extrabold tracking-widest text-sunrise-gold uppercase font-sans">Your Submitted Review</span>
              
              {/* Product Name */}
              <span className="font-serif text-sm font-bold text-dark-olive truncate max-w-xs">{submittedReviewDetails.productName}</span>

              {/* Rating stars */}
              <div className="flex text-sunrise-gold">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={`w-4.5 h-4.5 ${i < submittedReviewDetails.rating ? 'fill-current' : 'text-stone-200'}`} />
                ))}
              </div>

              {/* Review Title */}
              {submittedReviewDetails.title && (
                <span className="font-serif text-xs font-bold text-dark-olive italic mt-1">
                  "{submittedReviewDetails.title}"
                </span>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full font-bold text-xs select-none">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/products');
                }}
                className="flex-1 py-3 px-5 bg-primary-green hover:bg-dark-olive text-white rounded-xl uppercase tracking-wider transition-colors cursor-pointer font-extrabold border-none shadow-md"
              >
                Continue Shopping
              </button>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 py-3 px-5 bg-transparent border border-light-beige hover:bg-light-beige/40 text-dark-olive rounded-xl uppercase tracking-wider transition-colors cursor-pointer font-extrabold"
              >
                Stay Here
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Profiler>
  );
}
