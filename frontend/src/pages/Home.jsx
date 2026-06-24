import React, { useState, useEffect, Profiler } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight,
  FiHeart,
  FiStar,
  FiShoppingBag,
  FiCheckCircle,
  FiChevronRight,
  FiMapPin,
  FiLock,
  FiX,
  FiTrendingUp,
  FiActivity,
  FiCpu,
  FiShoppingBag as CartIcon
} from 'react-icons/fi';
import { GiWheat, GiWaterDrop, GiSprout, GiSun } from 'react-icons/gi';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { getOptimizedImageUrl, getImageSrcSet } from '../utils/imageOptimizer';

// Module cache for Stale-While-Revalidate loading
let homepageCache = null;

const getCloudinaryCroppedUrl = (url, crop, options = {}) => {
  return getOptimizedImageUrl(url, { ...options, crop });
};

export function HeroSkeleton() {
  return (
    <div className="w-full bg-[#FAF8F5] py-6 md:py-8 lg:py-10 px-6 md:px-12 lg:px-20 animate-pulse border-b border-[#EAE4D8]/50">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 items-center">
        {/* Left Column (35%) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-4 space-y-4">
          <div className="h-5 w-32 bg-stone-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-8 w-full bg-stone-300 rounded-xl" />
            <div className="h-8 w-5/6 bg-stone-300 rounded-xl" />
          </div>
          <div className="h-12 w-full bg-stone-200 rounded-xl" />
          <div className="flex gap-3">
            <div className="h-10 w-28 bg-stone-300 rounded-lg" />
            <div className="h-10 w-28 bg-stone-200 rounded-lg" />
          </div>
        </div>

        {/* Right Column (65%) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-8 flex justify-center items-center relative min-h-[340px] sm:min-h-[380px] lg:min-h-[420px]">
          <div className="absolute bottom-4 w-3/4 h-[60px] rounded-full bg-stone-200/50" />
          <div className="w-40 h-56 sm:w-52 sm:h-72 lg:w-60 lg:h-80 bg-stone-300 rounded-2xl z-10" />
        </div>

        {/* Product selector strip (col-span-12) */}
        <div className="col-span-12 mt-6 flex justify-center gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-20 h-12 bg-stone-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CategoriesSkeleton() {
  return (
    <div className="bg-gradient-to-b from-[#FDFBF7] via-[#FDFBF7] to-[#F5F2EA] py-16 md:py-24 animate-pulse border-b border-[#EAE4D8]/80">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
          <div className="h-5 w-32 bg-stone-200 rounded-full mx-auto" />
          <div className="h-10 w-64 bg-stone-300 rounded-xl mx-auto" />
          <div className="h-4 w-80 bg-stone-200 rounded-lg mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-[#EAE4D8] rounded-[24px] p-4 h-72 flex flex-col justify-between">
              <div className="aspect-[4/3] w-full bg-stone-200 rounded-xl" />
              <div className="space-y-2 mt-4">
                <div className="h-4 w-3/4 bg-stone-300 rounded" />
                <div className="h-3 w-1/2 bg-stone-200 rounded" />
              </div>
              <div className="h-8 w-full bg-stone-200 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="bg-white border border-[#EAE4D8] rounded-[24px] p-4 space-y-4 animate-pulse">
      <div className="aspect-square w-full bg-stone-200 rounded-xl" />
      <div className="space-y-2">
        <div className="h-3 w-1/4 bg-stone-200 rounded" />
        <div className="h-5 w-3/4 bg-stone-300 rounded" />
        <div className="h-4 w-1/2 bg-stone-200 rounded" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 w-16 bg-stone-300 rounded" />
        <div className="h-8 w-24 bg-stone-300 rounded-lg" />
      </div>
    </div>
  );
}

export function CollectionsSkeleton() {
  return (
    <div className="py-20 px-6 max-w-7xl mx-auto animate-pulse border-b border-[#EAE4D8]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3">
          <div className="h-4 w-36 bg-stone-200 rounded" />
          <div className="h-10 w-72 bg-stone-300 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-[420px] bg-stone-200 rounded-[32px]" />
        ))}
      </div>
    </div>
  );
}

export function TestimonialsSkeleton() {
  return (
    <div className="py-20 px-6 bg-[#F3EFE6]/40 animate-pulse border-b border-[#EAE4D8]">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-4">
          <div className="h-4 w-36 bg-stone-200 rounded mx-auto" />
          <div className="h-10 w-72 bg-stone-300 rounded-xl mx-auto" />
          <div className="h-4 w-80 bg-stone-200 rounded mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-[28px] p-8 h-64 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-4 w-24 bg-stone-200 rounded" />
                <div className="h-16 w-full bg-stone-200 rounded-lg" />
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-stone-300" />
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-stone-300 rounded" />
                  <div className="h-2.5 w-24 bg-stone-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomepageSkeleton() {
  return (
    <div className="flex flex-col bg-[#F9F6F0] overflow-hidden w-full pt-20">
      <HeroSkeleton />
      <CategoriesSkeleton />
      <div className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
          <div className="h-5 w-32 bg-stone-200 rounded-full mx-auto" />
          <div className="h-10 w-64 bg-stone-300 rounded-xl mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
      <CollectionsSkeleton />
      <TestimonialsSkeleton />
    </div>
  );
}


export default function Home() {
  const navigate = useNavigate();

  // State for the selected premium range item (0: Moringa, 1: Mint, 2: Amla, 3: Banana, 4: Beetroot)
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);

  // Global stores
  const { addItem } = useCartStore();
  const { wishlistItems, toggleWishlist, fetchWishlist } = useWishlistStore();
  const { isAuthenticated, setAuthModalOpen } = useAuthStore();

  // Local state initialized from cache if available for instant SWR loading
  const [productsList, setProductsList] = useState(homepageCache?.productsList || []);
  const [homepageCategories, setHomepageCategories] = useState(homepageCache?.homepageCategories || []);
  const [homepageCollections, setHomepageCollections] = useState(homepageCache?.homepageCollections || []);
  const [heroesList, setHeroesList] = useState(homepageCache?.heroesList || []);
  const [sectionsSequence, setSectionsSequence] = useState(homepageCache?.sectionsSequence || ['hero', 'categories', 'best-sellers', 'trust', 'collections', 'benefits', 'footer-banner']);
  const [activeCampaign, setActiveCampaign] = useState(homepageCache?.activeCampaign || null);
  const [activeHero, setActiveHero] = useState(homepageCache?.activeHero || null);
  const [sliderAutoRotate, setSliderAutoRotate] = useState(homepageCache?.sliderAutoRotate !== undefined ? homepageCache.sliderAutoRotate : true);
  const [sliderDuration, setSliderDuration] = useState(homepageCache?.sliderDuration || 5);
  const [testimonialsList, setTestimonialsList] = useState(homepageCache?.testimonialsList || []);

  const [isLoading, setIsLoading] = useState(!homepageCache);
  const [homepageConfigLoaded, setHomepageConfigLoaded] = useState(!!homepageCache);
  const [categoriesLoaded, setCategoriesLoaded] = useState(!!homepageCache);
  const [apiError, setApiError] = useState(false);
  const settingsLoaded = useSettingsStore((state) => state.settingsLoaded);
  const settings = useSettingsStore((state) => state.settings);
  const [hasHydrated, setHasHydrated] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '' });
  const [activeCategory, setActiveCategory] = useState({ id: 'All', name: 'All' });
  const [activeBenefit, setActiveBenefit] = useState('All');

  const promoCategories = homepageCollections.filter(c => {
    if (c.description && c.description.startsWith('{')) {
      try {
        const parsed = JSON.parse(c.description);
        return !!parsed.isPromoCategory;
      } catch (e) { }
    }
    return false;
  });

  const signatureCollections = homepageCollections.filter(c => {
    if (c.description && c.description.startsWith('{')) {
      try {
        const parsed = JSON.parse(c.description);
        return !parsed.isPromoCategory;
      } catch (e) { }
    }
    return true;
  });

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Carousel slider states (controls selectedProductIndex dynamically)
  const [slideDirection, setSlideDirection] = useState(1); // 1 = forward, -1 = backward

  const getActiveSlidesCount = () => {
    const activeCount = heroesList.filter(h => h.isActive).length;
    return activeCount > 0 ? activeCount : 5;
  };

  const nextSlide = () => {
    setSlideDirection(1);
    const count = getActiveSlidesCount();
    setSelectedProductIndex((prev) => (prev + 1) % count);
  };

  const prevSlide = () => {
    setSlideDirection(-1);
    const count = getActiveSlidesCount();
    setSelectedProductIndex((prev) => (prev - 1 + count) % count);
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      nextSlide();
    } else if (info.offset.x > swipeThreshold) {
      prevSlide();
    }
  };

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProductIndex]);

  // Auto rotation timer effect
  useEffect(() => {
    if (!sliderAutoRotate) return;

    const timer = setInterval(() => {
      nextSlide();
    }, sliderDuration * 1000);

    return () => clearInterval(timer);
  }, [sliderAutoRotate, sliderDuration, selectedProductIndex]);

  // Adjust active slide index if list shrinks
  useEffect(() => {
    const count = heroesList.filter(h => h.isActive).length;
    if (count > 0 && selectedProductIndex >= count) {
      setSelectedProductIndex(0);
    }
  }, [heroesList]);

  const loadHomepageData = async () => {
    // If not cached, set loading state to true
    if (!homepageCache) {
      setIsLoading(true);
      setHomepageConfigLoaded(false);
      setCategoriesLoaded(false);
      setApiError(false);
    }

    try {
      // Define the promises with catch handlers for error resilience
      const productsPromise = api.get('/products');
      const cmsPromise = api.get('/public/homepage');
      const categoriesPromise = api.get('/products/categories');
      const settingsPromise = useSettingsStore.getState().fetchSettings();

      const cartPromise = isAuthenticated
        ? useCartStore.getState().fetchCart().catch(err => {
          console.error("Failed to fetch cart:", err);
          return null;
        })
        : Promise.resolve();

      const wishlistPromise = isAuthenticated
        ? useWishlistStore.getState().fetchWishlist().catch(err => {
          console.error("Failed to fetch wishlist:", err);
          return null;
        })
        : Promise.resolve();

      const testimonialsPromise = api.get('/public/testimonials')
        .catch(err => {
          console.error("Failed to fetch testimonials:", err);
          return { success: false, testimonials: [] };
        });

      // Load all in parallel using Promise.all
      const [productsRes, cmsRes, categoriesRes, _settings, _cart, _wishlist, testimonialsRes] = await Promise.all([
        productsPromise,
        cmsPromise,
        categoriesPromise,
        settingsPromise,
        cartPromise,
        wishlistPromise,
        testimonialsPromise
      ]);

      if (!cmsRes || !cmsRes.success) {
        throw new Error("Failed to load homepage configuration");
      }
      if (!categoriesRes || !categoriesRes.categories) {
        throw new Error("Failed to load categories catalog");
      }
      if (!useSettingsStore.getState().settingsLoaded) {
        throw new Error("Failed to load settings");
      }
      if (!productsRes || !productsRes.products) {
        throw new Error("Failed to load products");
      }

      // 1. Process Products
      let mappedProducts = [];
      if (productsRes.products && productsRes.products.length > 0) {
        mappedProducts = productsRes.products.map(p => ({
          id: p.id || p._id,
          name: p.name,
          price: p.price,
          mrp: p.mrp,
          discountPercent: p.discountPercent || 0,
          taxPercent: p.taxPercent || 0,
          stockStatus: p.stockStatus || 'IN_STOCK',
          originalPrice: p.compareAtPrice || p.mrp || (p.price + Math.round(p.price * 0.15)),
          weight: p.weight || (p.variants?.length > 0 ? p.variants[0].name : '500 g'),
          rating: p.averageRating || 5.0,
          reviewsCount: p.reviews?.length || 10,
          image: p.images?.length > 0 ? p.images[0].url : p.image || 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=400',
          hoverImage: p.hoverImage,
          mobileBanner: p.mobileBanner,
          isFeatured: !!p.isFeatured,
          isTrending: !!p.isTrending,
          isBestseller: !!p.isBestseller,
          isNewLaunch: !!p.isNewLaunch,
          isVisible: p.isVisible !== undefined ? !!p.isVisible : true,
          tag: p.categories?.[0]?.name || 'Organic Staple',
          description: p.description,
          categories: p.categories || [],
          categoryId: p.categories?.[0]?.id || '',
          category: p.categories?.[0]?.name || 'Organic',
          slug: p.slug,
          variants: p.variants || []
        }));
      }
      setProductsList(mappedProducts);

      // 2. Process CMS config
      let freshHeroes = [];
      let freshCampaign = null;
      let freshHero = null;
      let freshAutoRotate = true;
      let freshDuration = 5;
      let freshCategories = [];
      let freshCollections = [];
      let freshOrder = ['hero', 'categories', 'best-sellers', 'trust', 'collections', 'benefits', 'footer-banner'];

      if (cmsRes.success) {
        if (cmsRes.campaign) freshCampaign = cmsRes.campaign;
        if (cmsRes.hero) freshHero = cmsRes.hero;
        if (cmsRes.heroes && cmsRes.heroes.length > 0) {
          freshHeroes = cmsRes.heroes;
        } else if (cmsRes.hero) {
          freshHeroes = [cmsRes.hero];
        }
        if (cmsRes.autoRotate !== undefined) freshAutoRotate = cmsRes.autoRotate;
        if (cmsRes.slideDuration !== undefined) freshDuration = cmsRes.slideDuration;
        if (cmsRes.categories) {
          freshCategories = cmsRes.categories.filter(
            c => c.slug?.toLowerCase() !== 'uncategorized' && c.name?.toLowerCase() !== 'uncategorized'
          ).map(c => {
            const matched = categoriesRes.categories?.find(cat => cat.id === c.id || cat.slug === c.slug);
            return {
              ...c,
              _count: matched?._count || c._count || { products: 0 }
            };
          });
        }
        if (cmsRes.collections && cmsRes.collections.length > 0) freshCollections = cmsRes.collections;
        if (cmsRes.sectionOrder) {
          freshOrder = cmsRes.sectionOrder.split(',');
        }

        setActiveCampaign(freshCampaign);
        setActiveHero(freshHero);
        setHeroesList(freshHeroes);
        setSliderAutoRotate(freshAutoRotate);
        setSliderDuration(freshDuration);
        setHomepageCategories(freshCategories);
        setHomepageCollections(freshCollections);
        setSectionsSequence(freshOrder);
      }

      // Fallback categories sync if dynamic CMS config didn't provide categories
      if (freshCategories.length === 0 && categoriesRes.categories && categoriesRes.categories.length > 0) {
        const filteredFallback = categoriesRes.categories.filter(
          c => c.slug?.toLowerCase() !== 'uncategorized' && c.name?.toLowerCase() !== 'uncategorized'
        );
        setHomepageCategories(filteredFallback);
        freshCategories = filteredFallback;
      }

      // 3. Process Testimonials
      let freshTestimonials = [];
      if (testimonialsRes.success && testimonialsRes.testimonials) {
        freshTestimonials = testimonialsRes.testimonials;
        setTestimonialsList(freshTestimonials);
      }

      // Save to cache for SWR instant loads
      homepageCache = {
        productsList: mappedProducts,
        homepageCategories: freshCategories.length > 0 ? freshCategories : homepageCategories,
        homepageCollections: freshCollections,
        heroesList: freshHeroes,
        sectionsSequence: freshOrder,
        activeCampaign: freshCampaign,
        activeHero: freshHero,
        sliderAutoRotate: freshAutoRotate,
        sliderDuration: freshDuration,
        testimonialsList: freshTestimonials
      };

      setHomepageConfigLoaded(true);
      setCategoriesLoaded(true);

    } catch (e) {
      console.error("Critical error in parallel homepage data loading:", e);
      setApiError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHomepageData();
  }, [isAuthenticated]);

  const handleAddToCart = async (product) => {
    const hasVariants = product.variants && product.variants.length > 0;
    const sizesCount = hasVariants
      ? product.variants.length + (product.variants.some(v => v.name.toLowerCase().replace(/\s+/g, '') === product.weight?.toLowerCase().replace(/\s+/g, '')) ? 0 : 1)
      : 1;

    if (sizesCount > 1) {
      navigate(`/products/${product.slug}`);
      return;
    }

    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    try {
      await addItem(product.id, null, 1);
      showToast(`Added ${product.name} to basket!`);
    } catch (err) {
      console.error(err);
      showToast(`Could not add ${product.name} to cart.`);
    }
  };

  const handleWishlistToggle = async (productId) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    try {
      await toggleWishlist(productId);
      showToast(`Wishlist updated!`);
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const isProductWishlisted = (productId) => {
    return wishlistItems.some(item => item.productId === productId || item.id === productId);
  };

  // Filter products by category tab
  const filteredProducts = productsList.filter(p => {
    const activeId = activeCategory?.id || activeCategory;
    const activeName = activeCategory?.name || activeCategory;

    if (activeId === 'All' || activeName === 'All') {
      const hasBestsellers = productsList.some(prod => prod.isBestseller);
      return hasBestsellers ? p.isBestseller : true;
    }
    // Show all products under selected category immediately (Requirement 9)
    return p.categories?.some(cat => cat.id === activeId || cat.name === activeName || cat.slug === activeId) || p.categoryId === activeId;
  });



  const selectCategoryByName = (name) => {
    const found = homepageCategories.find(c =>
      c.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(c.name.toLowerCase()) ||
      c.slug.toLowerCase().includes(name.toLowerCase())
    );
    if (found) {
      setActiveCategory(found);
    } else {
      setActiveCategory(name);
    }
  };

  const getCategorySlugByName = (name) => {
    const found = homepageCategories.find(c =>
      c.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(c.name.toLowerCase()) ||
      c.slug.toLowerCase().includes(name.toLowerCase())
    );
    return found ? found.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const renderCategoriesSection = () => {
    // Calculate if categories are loading or waiting for hydration
    const isLoadingCategoryData = !hasHydrated || !categoriesLoaded || isLoading;

    // Derive categoriesToShow directly from homepageCategories state (the single database source of truth)
    const categoriesToShow = homepageCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      productCount: c._count?.products || 0
    }));

    if (isLoadingCategoryData) {
      return <CategoriesSkeleton />;
    }

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.08,
          delayChildren: 0.1
        }
      }
    };

    const itemVariants = {
      hidden: {
        opacity: 0,
        y: 20
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: [0.215, 0.61, 0.355, 1]
        }
      }
    };

    if (promoCategories.length > 0) {
      return (
        <section
          key="categories"
          className="bg-gradient-to-b from-[#FDFBF7] via-[#FDFBF7] to-[#F5F2EA] border-b border-[#EAE4D8]/80 py-16 md:py-24 select-none shadow-[inset_0_-2px_10px_rgba(0,0,0,0.01)]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
            {/* Section Header */}
            <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C68A2B] bg-[#C68A2B]/10 px-3.5 py-1 rounded-full inline-block">
                {settings.homepage_section_badge_categories || "Organic Harvest"}
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#2F3B0C]">
                {settings.homepage_section_title_categories || "Shop By Category"}
              </h2>
              <p className="text-xs md:text-sm text-stone-500 leading-relaxed font-medium">
                {settings.homepage_section_subtitle_categories || "Explore our carefully curated farm-fresh collections."}
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8"
            >
              {promoCategories.map((item) => {
                let meta = {
                  subtitle: item.badge || '',
                  mobileImage: '',
                  overlayPosition: 'bottom-left',
                  overlayDarkness: 0.5,
                  textColorTheme: 'light',
                  isFeatured: false,
                  imageFocalPoint: 'center',
                  hoverZoom: true,
                  ctaStyle: 'arrow',
                  cornerRadius: '3xl'
                };
                if (item.description && item.description.startsWith('{')) {
                  try { meta = { ...meta, ...JSON.parse(item.description) }; } catch (e) { }
                }

                const isDark = meta.textColorTheme === 'dark';
                const dark = meta.overlayDarkness !== undefined ? parseFloat(meta.overlayDarkness) : 0.5;
                const overlay = isDark
                  ? `linear-gradient(to top, rgba(253,251,247,${dark}) 0%, rgba(253,251,247,${dark * 0.3}) 60%, transparent 100%)`
                  : `linear-gradient(to top, rgba(0,0,0,${dark}) 0%, rgba(0,0,0,${dark * 0.3}) 60%, transparent 100%)`;

                let alignClass = 'justify-end items-start text-left';
                if (meta.overlayPosition === 'center') alignClass = 'justify-center items-center text-center';
                else if (meta.overlayPosition === 'top-left') alignClass = 'justify-start items-start text-left';
                else if (meta.overlayPosition === 'top-right') alignClass = 'justify-start items-end text-right';
                else if (meta.overlayPosition === 'bottom-right') alignClass = 'justify-end items-end text-right';

                let roundClass = 'rounded-[24px] md:rounded-[32px]';
                if (meta.cornerRadius === 'none') roundClass = 'rounded-none';
                else if (meta.cornerRadius === 'md') roundClass = 'rounded-md';
                else if (meta.cornerRadius === 'lg') roundClass = 'rounded-lg';
                else if (meta.cornerRadius === 'xl') roundClass = 'rounded-xl';
                else if (meta.cornerRadius === 'full') roundClass = 'rounded-[32px] md:rounded-[40px]';

                let objectFocal = 'object-center';
                if (meta.imageFocalPoint === 'top') objectFocal = 'object-top';
                else if (meta.imageFocalPoint === 'bottom') objectFocal = 'object-bottom';
                else if (meta.imageFocalPoint === 'left') objectFocal = 'object-left';
                else if (meta.imageFocalPoint === 'right') objectFocal = 'object-right';

                const spanClass = meta.isFeatured
                  ? 'col-span-2 sm:col-span-2 lg:col-span-2 h-[160px] sm:h-[220px] md:h-[320px]'
                  : 'col-span-1 h-[160px] sm:h-[220px] md:h-[320px]';

                const hoverZoomClass = meta.hoverZoom ? 'group-hover:scale-105' : '';

                return (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    onClick={() => navigate(`/category/${item.categorySlug}`)}
                    className={`relative overflow-hidden group shadow-sm border border-[#EAE4D8] transition-all duration-500 cursor-pointer ${spanClass} ${roundClass}`}
                  >
                    <img
                      src={item.image}
                      srcSet={getImageSrcSet(item.image, { widths: [400, 800, 1500], cropMode: 'fill' })}
                      sizes={meta.isFeatured ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 100vw, 33vw"}
                      alt={item.title}
                      loading="lazy"
                      className={`absolute inset-0 w-full h-full object-cover transition duration-700 ease-out ${hoverZoomClass} ${objectFocal}`}
                    />
                    <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: overlay }} />
                    <div className={`absolute inset-0 z-20 flex flex-col p-6 md:p-8 ${alignClass}`} style={{ color: isDark ? '#2F3B0C' : '#fff' }}>

                      {meta.subtitle && (
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block w-fit mb-2 ${isDark ? 'bg-[#2F3B0C]/10 text-[#2F3B0C]' : 'bg-white/20 text-white backdrop-blur-xs'
                          }`}>
                          {meta.subtitle}
                        </span>
                      )}

                      <h3 className={`font-serif text-lg sm:text-xl md:text-2xl font-bold leading-tight max-w-[90%] ${isDark ? 'text-[#2F3B0C]' : 'text-white'}`}>{item.title}</h3>

                      {item.ctaStyle === 'arrow' ? (
                        <div className={`absolute bottom-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-sm transition duration-300 ${isDark ? 'bg-[#2F3B0C]/10 text-[#2F3B0C] group-hover:bg-[#2F3B0C] group-hover:text-white' : 'bg-white/10 text-white backdrop-blur-xs group-hover:bg-white group-hover:text-[#2F3B0C]'
                          }`}>
                          →
                        </div>
                      ) : item.ctaStyle === 'button-outline' ? (
                        <div className={`mt-3 text-[10px] font-bold uppercase tracking-wider px-3 py-1 border rounded select-none ${isDark ? 'border-[#2F3B0C] text-[#2F3B0C]' : 'border-white text-white'
                          }`}>
                          {item.ctaText || 'Explore'}
                        </div>
                      ) : (
                        <div className="mt-3 text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded select-none shadow-sm" style={{ background: isDark ? '#4E641A' : '#fff', color: isDark ? '#fff' : '#2F3B0C' }}>
                          {item.ctaText || 'Explore'}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      );
    }

    if (categoriesToShow.length === 0) {
      return null;
    }

    // Default Fallback
    return (
      <section
        key="categories"
        className="bg-gradient-to-b from-[#FDFBF7] via-[#FDFBF7] to-[#F5F2EA] border-b border-[#EAE4D8]/80 py-16 md:py-24 select-none shadow-[inset_0_-2px_10px_rgba(0,0,0,0.01)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C68A2B] bg-[#C68A2B]/10 px-3.5 py-1 rounded-full inline-block">
              {settings.homepage_section_badge_categories || "Organic Harvest"}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#2F3B0C]">
              {settings.homepage_section_title_categories || "Shop By Category"}
            </h2>
            <p className="text-xs md:text-sm text-stone-500 leading-relaxed font-medium">
              {settings.homepage_section_subtitle_categories || "Explore our carefully curated farm-fresh collections."}
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8"
          >
            {categoriesToShow.map((cat) => {
              if (!cat || !cat.slug || !cat.name) return null;

              const optimizedImageUrl = getOptimizedImageUrl(cat.image, { width: 400, height: 300, cropMode: 'fill' });

              return (
                <motion.div
                  key={cat.id || cat.slug}
                  variants={itemVariants}
                  className="group bg-white border border-[#EAE4D8] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full cursor-pointer relative w-full text-left"
                  onClick={() => navigate(`/category/${cat.slug}`)}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F8F5F0] border-b border-[#EAE4D8]/40 shrink-0">
                    {cat.image ? (
                      <img
                        src={optimizedImageUrl}
                        srcSet={getImageSrcSet(cat.image, { widths: [400, 800], cropMode: 'fill' })}
                        sizes="(max-width: 640px) 50vw, 25vw"
                        alt={cat.name}
                        width={400}
                        height={300}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#EDE7D9]/80 to-[#FDFBF7] flex items-center justify-center font-serif text-stone-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-grow gap-3">
                    <div className="space-y-0.5">
                      <h3 className="font-serif text-sm sm:text-base md:text-lg font-bold text-[#2F3B0C] group-hover:text-[#4E641A] transition-colors leading-tight line-clamp-1">
                        {cat.name}
                      </h3>
                      <span className="font-sans text-[10px] sm:text-xs font-semibold text-stone-400 block">
                        {cat.productCount} {cat.productCount === 1 ? 'Staple' : 'Staples'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between mt-auto">
                      <span className="font-sans text-[9px] sm:text-xs font-bold text-[#4E641A] group-hover:text-[#2F3B0C] uppercase tracking-widest transition-colors">
                        Explore
                      </span>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#4E641A]/10 text-[#4E641A] group-hover:bg-[#4E641A] group-hover:text-white flex items-center justify-center transition-all duration-300">
                        <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    );
  };

  const renderHeroSection = () => {
    const sortedHeroes = [...heroesList]
      .filter(h => h.isActive)
      .sort((a, b) => (a.slideOrder || 0) - (b.slideOrder || 0));

    // Resolve index safely
    const activeHeroIndex = selectedProductIndex < sortedHeroes.length ? selectedProductIndex : 0;
    const activeHero = sortedHeroes[activeHeroIndex] || null;

    const matchedHero = activeHero;

    const resolvedFeaturedProduct = activeHero?.featuredProduct || (activeHero?.featuredProductId ? productsList.find(p => p.id === activeHero.featuredProductId) : null);

    const activeProduct = resolvedFeaturedProduct;

    // Resolve content dynamically: Use CMS values if matched, otherwise defaults
    const headingLine1 = activeHero?.headingLine1 || "Pristine Organic Staples";
    const headingHighlight = activeHero?.headingHighlight || "100% Pure & Natural";
    const headingLine2 = activeHero?.headingLine2 || "Daily Superfood Nourishment";
    const description = activeHero?.description || activeProduct?.description || "Carefully processed to preserve natural vitamins, minerals, and enzymes.";

    const primaryButtonText = activeHero?.primaryButtonText || 'SHOP NOW';
    const primaryButtonLink = activeHero?.primaryButtonLink || '/';
    const secondaryButtonText = activeHero?.secondaryButtonText || 'EXPLORE PRODUCTS';
    const secondaryButtonLink = activeHero?.secondaryButtonLink || '/';

    const bulletOne = activeHero?.bulletOne || "Chemical Free";
    const bulletTwo = activeHero?.bulletTwo || "Farm Fresh";
    const bulletThree = activeHero?.bulletThree || "Traditional Nutrition";
    const bulletFour = activeHero?.bulletFour || "";

    // Use custom CMS saved showcase image if available, else active product image
    const packetImage = activeHero?.showcaseImage || activeHero?.heroImage || activeProduct?.image || activeProduct?.images?.[0]?.url || "";

    const desktopHeroImageUrl = packetImage ? getCloudinaryCroppedUrl(packetImage, activeHero || {}, { width: 2000, cropMode: 'limit' }) : '';

    if (isLoading && sortedHeroes.length === 0) {
      return <HeroSkeleton />;
    }

    const trustBadgeText = activeHero
      ? activeHero.trustBadgeText?.trim()
      : "🌿 100% Natural & Chemical Free";

    const handleFeaturedProductAction = () => {
      const targetProduct = resolvedFeaturedProduct;
      if (targetProduct) {
        handleAddToCart(targetProduct);
      }
    };

    const getIngredientKey = (hero) => {
      if (!hero) return '';
      const text = `${hero.headingLine1} ${hero.headingLine2} ${hero.featuredProduct?.name || ''} ${hero.featuredProduct?.slug || ''}`.toLowerCase();
      if (text.includes('moringa')) return 'moringa';
      if (text.includes('mint')) return 'mint';
      if (text.includes('amla')) return 'amla';
      if (text.includes('banana')) return 'banana';
      if (text.includes('beet')) return 'beetroot';
      return '';
    };

    // Bullets icons mapping
    const getBulletIcon = (title) => {
      const lower = title.toLowerCase();
      if (lower.includes('chemical') || lower.includes('pure')) {
        return (
          <svg className="w-4.5 h-4.5 text-[#4E641A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      }
      if (lower.includes('farm') || lower.includes('fresh') || lower.includes('direct')) {
        return (
          <svg className="w-4.5 h-4.5 text-[#4E641A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
          </svg>
        );
      }
      return (
        <svg className="w-4.5 h-4.5 text-[#4E641A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    };

    const getBulletDescription = (title) => {
      const lower = title.toLowerCase();
      if (lower.includes('chemical') || lower.includes('pure')) {
        return "No chemicals or harmful additives";
      }
      if (lower.includes('farm') || lower.includes('fresh') || lower.includes('direct')) {
        return "Directly sourced from our farms";
      }
      return "100% natural superfoods";
    };

    const renderFloatingIngredients = (type) => {
      switch (type) {
        case 'moringa':
          return (
            <>
              {/* Green juice glass on the stage right */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-8 right-[5%] sm:right-[10%] w-16 h-24 sm:w-20 sm:h-28 z-20 pointer-events-none select-none"
              >
                <svg viewBox="0 0 100 120" fill="none" className="w-full h-full drop-shadow-lg">
                  <path d="M25 10 L75 10 L68 110 L32 110 Z" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                  <path d="M27 35 L73 35 L68 108 L32 108 Z" fill="#3D5014" opacity="0.9" />
                  <ellipse cx="50" cy="35" rx="23" ry="5" fill="#4E641A" />
                  <line x1="45" y1="5" x2="60" y2="70" stroke="#C68A2B" strokeWidth="4" strokeLinecap="round" />
                  <path d="M30 15 L33 90" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </motion.div>
              {/* Powder Bowl on the stage left */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-6 left-[10%] sm:left-[15%] w-24 h-16 sm:w-32 sm:h-20 z-20 pointer-events-none select-none"
              >
                <svg viewBox="0 0 120 80" fill="none" className="w-full h-full drop-shadow-xl">
                  <path d="M20 50 Q60 85 100 50 Q100 48 20 48 Z" fill="#6E553A" stroke="#523E28" strokeWidth="1" />
                  <path d="M20 48 Q60 5 100 48 Z" fill="#4E641A" opacity="0.95" />
                  <path d="M35 48 Q60 20 85 48 Z" fill="#607D1E" opacity="0.9" />
                  <path d="M35 60 Q60 75 85 60" stroke="#523E28" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </motion.div>
            </>
          );
        case 'mint':
          return (
            <>
              {/* Powder Bowl left */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                className="absolute bottom-6 left-[12%] sm:left-[18%] w-24 h-16 sm:w-28 sm:h-20 z-20 pointer-events-none select-none"
              >
                <svg viewBox="0 0 120 80" fill="none" className="w-full h-full drop-shadow-xl">
                  <path d="M20 50 Q60 85 100 50 Q100 48 20 48 Z" fill="#6E553A" stroke="#523E28" strokeWidth="1" />
                  <path d="M20 48 Q60 8 100 48 Z" fill="#3B7A57" opacity="0.95" />
                  <path d="M35 48 Q60 22 85 48 Z" fill="#4B9A6F" opacity="0.9" />
                </svg>
              </motion.div>
            </>
          );
        case 'amla':
          return (
            <>
              {/* Amla fruits bottom-right on the stage */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                className="absolute bottom-6 right-[8%] sm:right-[12%] w-20 h-20 sm:w-24 sm:h-24 z-20 pointer-events-none select-none"
              >
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-lg">
                  <circle cx="35" cy="55" r="28" fill="#8A9A5B" opacity="0.95" />
                  <circle cx="35" cy="55" r="28" fill="url(#amlaGlowDesktop2)" />
                  <circle cx="65" cy="45" r="20" fill="#7A8A4D" opacity="0.9" />
                  <circle cx="65" cy="45" r="20" fill="url(#amlaGlowDesktop2)" />
                  <path d="M45 35 C55 20 70 25 80 15 C70 30 55 25 45 35 Z" fill="#6F7E47" />
                </svg>
              </motion.div>
              {/* Powder Bowl left */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="absolute bottom-6 left-[10%] sm:left-[15%] w-24 h-16 sm:w-28 sm:h-20 z-20 pointer-events-none select-none"
              >
                <svg viewBox="0 0 120 80" fill="none" className="w-full h-full drop-shadow-xl">
                  <path d="M20 50 Q60 85 100 50 Q100 48 20 48 Z" fill="#6E553A" stroke="#523E28" strokeWidth="1" />
                  <path d="M20 48 Q60 10 100 48 Z" fill="#A4B774" opacity="0.95" />
                  <path d="M35 48 Q60 25 85 48 Z" fill="#B3C485" opacity="0.9" />
                </svg>
              </motion.div>
            </>
          );
        case 'banana':
          return (
            <>
              {/* Banana whole on stage right */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
                className="absolute bottom-6 right-[5%] sm:right-[10%] w-28 h-20 sm:w-32 sm:h-24 z-20 pointer-events-none select-none"
              >
                <svg viewBox="0 0 120 100" fill="none" className="w-full h-full drop-shadow-lg">
                  <path d="M10 20 Q55 50 110 25 Q95 70 30 65 Q15 50 10 20 Z" fill="#E2B742" stroke="#B79124" strokeWidth="1.5" />
                  <path d="M107 24 Q110 25 113 22 L110 18 Z" fill="#4B3A0E" />
                  <path d="M10 20 Q12 25 8 28 L5 22 Z" fill="#4B3A0E" />
                </svg>
              </motion.div>
              {/* Powder Bowl left */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                className="absolute bottom-6 left-[10%] sm:left-[15%] w-24 h-16 sm:w-28 sm:h-20 z-20 pointer-events-none select-none"
              >
                <svg viewBox="0 0 120 80" fill="none" className="w-full h-full drop-shadow-xl">
                  <path d="M20 50 Q60 85 100 50 Q100 48 20 48 Z" fill="#6E553A" stroke="#523E28" strokeWidth="1" />
                  <path d="M20 48 Q60 12 100 48 Z" fill="#F2DFB8" opacity="0.95" />
                  <path d="M35 48 Q60 26 85 48 Z" fill="#FAF1DF" opacity="0.9" />
                </svg>
              </motion.div>
            </>
          );
        case 'beetroot':
          return (
            <>
              {/* Beetroot leaves bottom-right on stage */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
                className="absolute bottom-6 right-[6%] sm:right-[12%] w-24 h-24 sm:w-28 sm:h-28 z-20 pointer-events-none select-none"
              >
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-lg">
                  <path d="M10 75 Q40 55 60 25 C50 45 30 65 10 75 Z" fill="#4B6C36" />
                  <path d="M10 75 L60 25" stroke="#800020" strokeWidth="2" />
                  <path d="M20 80 Q55 60 85 45 C70 60 45 75 20 80 Z" fill="#3D5C28" />
                  <path d="M20 80 L85 45" stroke="#800020" strokeWidth="2.5" />
                </svg>
              </motion.div>
              {/* Powder Bowl left */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="absolute bottom-6 left-[10%] sm:left-[15%] w-24 h-16 sm:w-28 sm:h-20 z-20 pointer-events-none select-none"
              >
                <svg viewBox="0 0 120 80" fill="none" className="w-full h-full drop-shadow-xl">
                  <path d="M20 50 Q60 85 100 50 Q100 48 20 48 Z" fill="#6E553A" stroke="#523E28" strokeWidth="1" />
                  <path d="M20 48 Q60 10 100 48 Z" fill="#800020" opacity="0.95" />
                  <path d="M35 48 Q60 24 85 48 Z" fill="#A31D3B" opacity="0.9" />
                </svg>
              </motion.div>
            </>
          );
        default:
          return null;
      }
    };

    return (
      <section
        key="hero"
        className="home-hero-section relative overflow-hidden pt-20 pb-6 md:pt-32 md:pb-12 lg:pt-36 lg:pb-16 min-h-0 md:min-h-[700px] lg:min-h-[750px] flex items-center px-4 sm:px-6 md:px-12 lg:px-20 border-b border-[#EAE4D8]/50 bg-[#FAF8F5] text-left select-none animate-fade-in"
      >
        {/* Soft cream-green blurred background gradients */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#EAF2DE]/50 rounded-full filter blur-3xl opacity-60 pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-[#F2ECE1]/60 rounded-full filter blur-3xl opacity-50 pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto relative z-10 w-full">

          {/* Desktop & Tablet Layout (md+) */}
          <div className="hidden md:grid md:grid-cols-[45%_55%] gap-6 lg:gap-8 items-start w-full">

            {/* Left Content Area (45% width) */}
            <div className="flex flex-col justify-start space-y-5 lg:space-y-6 -mt-[40px] md:-mt-[60px] lg:-mt-[80px]">

              {/* Badge */}
              {trustBadgeText ? (
                <div className="inline-flex items-center space-x-2 bg-[#E8EFE0] border border-[#D5E2C7] px-2.5 py-0.5 rounded-full shadow-sm w-fit">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#2F3B0C] flex items-center">
                    {trustBadgeText}
                  </span>
                </div>
              ) : null}

              {/* Headline (Spacious, less wrapping) */}
              <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-[#2F3B0C] leading-[1.15] max-w-none">
                <>
                  {headingLine1 && <span className="block text-[#2F3B0C]">{headingLine1}</span>}
                  {headingHighlight && <span className="block text-[#C68A2B] italic font-normal font-serif my-0.5">{headingHighlight}</span>}
                  {headingLine2 && <span className="block text-[#C68A2B]">{headingLine2}</span>}
                </>
              </h1>

              {/* Description (Wider and readable) */}
              <p className="text-[12px] lg:text-sm text-stone-600 max-w-none leading-relaxed font-medium">
                {description}
              </p>

              {/* Benefits Bullet Points */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 pb-1">
                {[bulletOne, bulletTwo, bulletThree, bulletFour].filter(Boolean).map((bullet, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="text-[#4E641A] text-xs font-bold">✓</span>
                    <span className="font-sans text-[11px] font-bold text-stone-600 uppercase tracking-wider">{bullet}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-row gap-4 pt-1">
                <button
                  onClick={handleFeaturedProductAction}
                  className="group px-4.5 py-2 bg-[#2F3B0C] hover:bg-[#1E2707] text-white text-[10.5px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg cursor-pointer border-none"
                >
                  <span>{primaryButtonText}</span>
                  <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    document.getElementById('best-sellers-grid')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4.5 py-2 bg-white hover:bg-stone-50 text-[#2F3B0C] border border-[#2F3B0C] text-[10.5px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer text-center"
                >
                  {secondaryButtonText}
                </button>
              </div>

              {/* Promo Coupon Bar */}
              {activeHero?.promoText && (
                <div className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase text-[#C68A2B] bg-[#C68A2B]/10 py-1.5 px-3 rounded-xl border border-[#C68A2B]/20 w-fit mt-2 select-all">
                  <span className="bg-[#C68A2B] text-white px-1.5 py-0.5 rounded text-[8px] tracking-wider leading-none">PROMO</span>
                  <span className="truncate">{activeHero.promoText}</span>
                </div>
              )}

            </div>

            {/* Right Showcase Column (55% width) - Centered vertically within container, aligned top in grid */}
            <div className="relative flex justify-center items-start h-[380px] sm:h-[440px] lg:h-[480px] xl:h-[520px] w-full pt-[44px] lg:pt-[48px] -mt-[40px] md:-mt-[60px] lg:-mt-[80px]">

              {/* Product Presentation Wooden Stage */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-[80px] sm:h-[90px] lg:h-[100px] xl:h-[110px] bg-gradient-to-br from-[#D8C7B3] via-[#C5B39E] to-[#AB9983] rounded-[100%] shadow-[0_15px_30px_rgba(0,0,0,0.15)] border border-[#C5B39E]/60 z-0 flex items-center justify-center overflow-hidden">
                <div className="w-[95%] h-[95%] rounded-[100%] border border-[#FAF8F5]/10 absolute" />
                <div className="w-[85%] h-[85%] rounded-[100%] border border-[#FAF8F5]/15 absolute" />
                <div className="w-[70%] h-[70%] rounded-[100%] border border-[#FAF8F5]/20 absolute" />
              </div>

              {/* Dynamic Floating Ingredients */}
              {renderFloatingIngredients(getIngredientKey(activeHero))}

              {/* Main Product Packet (Dominates layout, centered vertically, 70-80% height of showcase) */}
              <motion.div
                key={selectedProductIndex}
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -15 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-fit filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.22)] hover:drop-shadow-[0_30px_45px_rgba(0,0,0,0.28)] transition-all duration-500 flex items-center justify-center"
              >
                {desktopHeroImageUrl ? (
                  <motion.img
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    src={desktopHeroImageUrl}
                    srcSet={getImageSrcSet(packetImage, { widths: [800, 1500, 2000, 2500], cropMode: 'limit', crop: activeHero })}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    alt={activeProduct?.name || 'Suryodaya Product Packet'}
                    className="h-[320px] sm:h-[380px] lg:h-[430px] xl:h-[480px] w-auto object-contain"
                  />
                ) : (
                  <div className="w-40 h-56 rounded-2xl bg-gradient-to-tr from-[#EDE7D9] to-[#FDFBF7] flex items-center justify-center font-serif text-stone-400">
                    Product Image
                  </div>
                )}
              </motion.div>

              {/* Simulated/Dynamic Floating Badge Overlay (Desktop) */}
              {(matchedHero?.floatingBadgeTitle?.trim() || matchedHero?.floatingBadge?.title?.trim() || matchedHero?.floatingBadgeSubtitle?.trim() || matchedHero?.floatingBadge?.subtitle?.trim()) ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-4 right-[10%] bg-white/90 backdrop-blur-sm border border-[#EAE4D8]/80 rounded-2xl p-2 sm:p-2.5 shadow-md flex items-center space-x-2 z-20 pointer-events-none select-none max-w-[150px]"
                >
                  <span className="text-base sm:text-lg">🌾</span>
                  <div className="text-left leading-none font-sans">
                    {(matchedHero?.floatingBadgeTitle?.trim() || matchedHero?.floatingBadge?.title?.trim()) && (
                      <span className="block text-[9.5px] sm:text-[10px] font-extrabold text-[#2F3B0C] truncate">
                        {matchedHero?.floatingBadgeTitle?.trim() || matchedHero?.floatingBadge?.title?.trim()}
                      </span>
                    )}
                    {(matchedHero?.floatingBadgeSubtitle?.trim() || matchedHero?.floatingBadge?.subtitle?.trim()) && (
                      <span className="block text-[8px] sm:text-[8.5px] text-[#C68A2B] font-bold uppercase tracking-wider mt-0.5">
                        {matchedHero?.floatingBadgeSubtitle?.trim() || matchedHero?.floatingBadge?.subtitle?.trim()}
                      </span>
                    )}
                  </div>
                </motion.div>
              ) : null}

              {/* Featured Product Card Overlay (Desktop) */}
              {resolvedFeaturedProduct ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => navigate(`/products/${resolvedFeaturedProduct.slug}`)}
                  className="absolute bottom-4 left-[5%] bg-white/90 backdrop-blur-sm border border-[#EAE4D8]/80 rounded-2xl p-2.5 shadow-lg flex items-center justify-between gap-3 text-left z-20 cursor-pointer hover:scale-[1.03] hover:shadow-xl transition-all duration-300 max-w-[220px] pointer-events-auto"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={resolvedFeaturedProduct.image || resolvedFeaturedProduct.images?.[0]?.url}
                      alt={resolvedFeaturedProduct.name}
                      className="w-9 h-9 rounded-lg object-contain bg-[#FAF8F5] border border-[#EAE4D8]/50 p-1 shrink-0 filter drop-shadow-xs"
                    />
                    <div className="min-w-0">
                      <span className="block text-[7.5px] font-bold text-stone-400 uppercase tracking-widest leading-none">Featured Product</span>
                      <span className="block text-[9.5px] font-bold text-[#2F3B0C] truncate mt-0.5 leading-tight">{resolvedFeaturedProduct.name}</span>
                      <span className="block text-[8px] font-bold text-[#4E641A] mt-0.5 font-sans">
                        ₹{resolvedFeaturedProduct.price}
                        {resolvedFeaturedProduct.compareAtPrice && (
                          <span className="line-through text-stone-400 font-medium ml-1">₹{resolvedFeaturedProduct.compareAtPrice}</span>
                        )}
                      </span>
                    </div>
                  </div>
                  {(matchedHero?.offerBadge?.trim() || matchedHero?.offerBadgeText?.trim()) ? (
                    <span className="bg-[#C68A2B] text-white text-[7.5px] font-extrabold uppercase py-0.5 px-1.5 rounded-full shadow-sm leading-none shrink-0 animate-pulse">
                      {matchedHero.offerBadge?.trim() || matchedHero.offerBadgeText?.trim()}
                    </span>
                  ) : null}
                </motion.div>
              ) : null}

            </div>

            {/* Product Selector Strip (Desktop) */}
            <div className="md:col-span-2 mt-6 md:mt-[84px] lg:mt-[104px] border-t border-[#EAE4D8]/60 pt-4 flex flex-col items-center">
              {/* Header */}
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[#C68A2B] text-xs">🍃</span>
                <h3 className="font-serif text-[#2F3B0C] text-[10px] font-bold uppercase tracking-wider text-center">
                  Our Superfood Range
                </h3>
                <span className="text-[#C68A2B] text-xs">🌿</span>
              </div>

              {/* Selectors flex row */}
              <div className="flex flex-row justify-center gap-2 md:gap-2.5 w-full select-none">
                {sortedHeroes.map((hr, idx) => {
                  const isActive = idx === activeHeroIndex;
                  const featuredProd = hr.featuredProduct || (hr.featuredProductId ? productsList.find(p => p.id === hr.featuredProductId) : null);
                  const imageSrc = hr.showcaseImage || hr.heroImage || featuredProd?.image || featuredProd?.images?.[0]?.url || "";
                  const displayName = featuredProd?.name
                    ? featuredProd.name.replace(' Leaf Powder', '').replace(' Powder', '').replace(' Flour', '')
                    : hr.headingLine1 || 'Staple';

                  return (
                    <button
                      key={hr.id || idx}
                      onClick={() => setSelectedProductIndex(idx)}
                      className={`flex flex-row items-center space-x-2 p-1.5 w-[95px] xs:w-[105px] sm:w-[115px] md:w-[140px] h-[44px] sm:h-[48px] border rounded-xl transition-all duration-300 cursor-pointer bg-white text-left ${isActive
                        ? 'border-[#2F3B0C] shadow-md bg-stone-50/50 scale-[1.02] ring-1 ring-[#2F3B0C]'
                        : 'border-[#EAE4D8] shadow-sm hover:border-stone-400/80 hover:scale-[1.01]'
                        }`}
                    >
                      {/* Thumbnail Packet */}
                      <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {imageSrc ? (
                          <img
                            src={getOptimizedImageUrl(imageSrc, { width: 400, cropMode: 'limit' })}
                            alt={displayName}
                            loading="lazy"
                            className="w-full h-full object-contain filter drop-shadow-sm"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded bg-stone-100 flex items-center justify-center text-[7px] text-stone-400">
                            {displayName.substring(0, 8)}
                          </div>
                        )}
                      </div>

                      {/* Selector title */}
                      <span className="font-serif text-[9px] sm:text-[10px] font-bold text-[#2F3B0C] block tracking-tight line-clamp-1">
                        {displayName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Mobile Layout (< md) */}
          <div className="flex md:hidden flex-col space-y-4 text-center items-center w-full">

            {/* 1. Product Image (Showcase packet centered, 70-80% max-width) */}
            <div className="relative flex justify-center items-center pt-2 pb-2 h-[180px] w-full overflow-hidden">
              {/* Wooden Round Board backdrop ellipse */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[70%] h-[45px] bg-gradient-to-br from-[#D8C7B3] to-[#C0AD97] opacity-70 border border-[#BFAFA1]/40 z-0 rounded-[100%] shadow-md" />

              {/* Dynamic Floating Ingredients for mobile */}
              {renderFloatingIngredients(getIngredientKey(activeHero))}

              <motion.div
                key={selectedProductIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 h-[160px] max-w-[70%] sm:max-w-[80%] mx-auto flex items-center justify-center filter drop-shadow-xl"
              >
                {desktopHeroImageUrl ? (
                  <motion.img
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                    src={getOptimizedImageUrl(packetImage, { width: 1550, cropMode: 'limit', crop: activeHero })}
                    srcSet={getImageSrcSet(packetImage, { widths: [400, 800, 1500], cropMode: 'limit', crop: activeHero })}
                    sizes="100vw"
                    alt={activeProduct?.name}
                    className="h-full w-auto object-contain"
                  />
                ) : (
                  <div className="w-20 h-30 rounded-xl bg-stone-200 flex items-center justify-center text-xs text-stone-400">
                    Product Image
                  </div>
                )}
              </motion.div>
            </div>

            {/* 2. Product Selector Strip (placed directly below the image for touch control) */}
            <div className="w-full mt-0.5 flex flex-col items-center">
              <div className="flex flex-row gap-1.5 overflow-x-auto no-scrollbar py-1 w-full justify-start xs:justify-center px-4 select-none">
                {sortedHeroes.map((hr, idx) => {
                  const isActive = idx === activeHeroIndex;
                  const featuredProd = hr.featuredProduct || (hr.featuredProductId ? productsList.find(p => p.id === hr.featuredProductId) : null);
                  const imageSrc = hr.showcaseImage || hr.heroImage || featuredProd?.image || featuredProd?.images?.[0]?.url || "";
                  const displayName = featuredProd?.name
                    ? featuredProd.name.replace(' Leaf Powder', '').replace(' Powder', '').replace(' Flour', '')
                    : hr.headingLine1 || 'Staple';

                  return (
                    <button
                      key={hr.id || idx}
                      onClick={() => setSelectedProductIndex(idx)}
                      className={`flex flex-row items-center space-x-1 p-1 min-w-[84px] h-[34px] border rounded-lg transition-all duration-300 bg-white text-left ${isActive
                        ? 'border-[#2F3B0C] shadow-md bg-stone-50 ring-1 ring-[#2F3B0C]'
                        : 'border-[#EAE4D8] shadow-sm'
                        }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {imageSrc ? (
                          <img src={getOptimizedImageUrl(imageSrc, { width: 400, cropMode: 'limit' })} alt={displayName} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-5 h-5 rounded bg-stone-100 flex items-center justify-center text-[6px]">
                            {displayName[0]}
                          </div>
                        )}
                      </div>
                      <span className="font-serif text-[8.5px] font-bold text-[#2F3B0C] truncate">
                        {displayName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Badge */}
            {trustBadgeText ? (
              <div className="inline-flex items-center space-x-1 bg-[#E8EFE0] border border-[#D5E2C7] px-3 py-1 rounded-full shadow-xs mt-1">
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-[#2F3B0C] flex items-center">
                  {trustBadgeText}
                </span>
              </div>
            ) : null}

            {/* 4. Title & Subtitle */}
            <div className="space-y-1 px-6 text-center">
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2F3B0C] leading-tight">
                {headingLine1 && <span className="block text-[#2F3B0C]">{headingLine1}</span>}
              </h2>
              {headingHighlight && (
                <span className="block text-sm sm:text-base text-[#C68A2B] italic font-normal font-serif mt-0.5">
                  {headingHighlight}
                </span>
              )}
              {headingLine2 && (
                <span className="block text-sm sm:text-base font-bold text-[#C68A2B] uppercase tracking-wider">
                  {headingLine2}
                </span>
              )}
            </div>

            {/* 5. Description */}
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium px-6 max-w-sm mx-auto mt-1">
              {description}
            </p>

            {/* 6. Benefits checkmarks */}
            <div className="flex flex-wrap justify-center gap-x-3.5 gap-y-1.5 pt-1 border-t border-[#EAE4D8]/40 w-full px-6 text-[9px] sm:text-xs text-stone-500 font-bold uppercase tracking-wider mt-2">
              {[bulletOne, bulletTwo, bulletThree, bulletFour].filter(Boolean).map((bullet, idx) => (
                <span key={idx}>✓ {bullet}</span>
              ))}
            </div>

            {/* 7. CTA Buttons (Full width on mobile) */}
            <div className="flex flex-col gap-2.5 w-full px-6 max-w-sm justify-center mt-3">
              <button
                onClick={handleFeaturedProductAction}
                className="w-full h-11 bg-[#2F3B0C] hover:bg-[#1E2707] text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md cursor-pointer border-none text-center flex items-center justify-center space-x-2"
              >
                <span>{primaryButtonText}</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('best-sellers-grid')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full h-11 bg-white hover:bg-stone-50 text-[#2F3B0C] border border-[#2F3B0C] text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 shadow-sm cursor-pointer text-center"
              >
                {secondaryButtonText}
              </button>
            </div>

            {/* Promo Code Bar */}
            {activeHero?.promoText && (
              <div className="mx-6 w-[calc(100%-3rem)] max-w-sm flex items-center justify-center space-x-1.5 text-[8.5px] font-bold uppercase text-[#C68A2B] bg-[#C68A2B]/10 py-1.5 px-3 rounded-xl border border-[#C68A2B]/20 select-all mt-2">
                <span className="bg-[#C68A2B] text-white px-1.5 py-0.5 rounded text-[7.5px] tracking-wider leading-none">PROMO</span>
                <span className="truncate">{activeHero.promoText}</span>
              </div>
            )}

            {/* 8. Product Information Card (centered full width card, click opens details page) */}
            {resolvedFeaturedProduct ? (
              <div
                onClick={() => navigate(`/products/${resolvedFeaturedProduct.slug}`)}
                className="w-full px-6 max-w-sm mt-3 cursor-pointer pointer-events-auto"
              >
                <div className="bg-white border border-[#EAE4D8] rounded-2xl p-3 shadow-md flex items-center justify-between gap-3 hover:scale-[1.01] transition-all duration-300 text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={resolvedFeaturedProduct.image || resolvedFeaturedProduct.images?.[0]?.url}
                      alt={resolvedFeaturedProduct.name}
                      className="w-11 h-11 rounded-xl object-contain bg-[#FAF8F5] border border-[#EAE4D8]/50 p-1 shrink-0 filter drop-shadow-xs"
                    />
                    <div className="min-w-0">
                      <span className="block text-[7.5px] font-bold text-stone-400 uppercase tracking-widest leading-none font-sans">Featured Product</span>
                      <span className="block text-[10.5px] font-bold text-[#2F3B0C] truncate mt-1 leading-tight">{resolvedFeaturedProduct.name}</span>
                      <span className="block text-[9.5px] font-bold text-[#4E641A] mt-1 font-sans">
                        ₹{resolvedFeaturedProduct.price}
                        {resolvedFeaturedProduct.compareAtPrice && (
                          <span className="line-through text-stone-400 font-medium ml-1.5">₹{resolvedFeaturedProduct.compareAtPrice}</span>
                        )}
                      </span>
                    </div>
                  </div>
                  {(matchedHero?.offerBadge?.trim() || matchedHero?.offerBadgeText?.trim()) ? (
                    <span className="bg-[#C68A2B] text-white text-[8px] font-extrabold uppercase py-1 px-2 rounded-full shadow-xs leading-none shrink-0 animate-pulse">
                      {matchedHero.offerBadge?.trim() || matchedHero.offerBadgeText?.trim()}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  };

  const renderBestSellersSection = () => {
    return (
      <section key="best-sellers" id="best-sellers-grid" className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-b border-[#EAE4D8]">
        <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C68A2B] bg-[#C68A2B]/10 px-3.5 py-1 rounded-full">
            {settings.homepage_section_badge_best_sellers || "Customer Favorites"}
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#2F3B0C]">
            {settings.homepage_section_title_best_sellers || "Direct From Soil Best Sellers"}
          </h2>
          <p className="text-xs md:text-sm text-stone-500 leading-relaxed font-medium">
            {settings.homepage_section_subtitle_best_sellers || "Discover the daily organic essentials that nourish thousands of Indian families. Non-GMO, freshly batched, and absolute chemical-free."}
          </p>
        </div>

        {/* Dynamic Category Filtering Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[{ id: 'All', name: 'All' }, ...homepageCategories].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 cursor-pointer ${(activeCategory === 'All' && cat.id === 'All') || activeCategory?.id === cat.id
                ? 'bg-[#4E641A] text-white border-transparent shadow'
                : 'bg-white hover:bg-stone-50 text-stone-600 border-[#EAE4D8]'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-16 flex flex-col items-center justify-center gap-2">
            <GiSun className="text-primary-green text-3xl animate-spin" />
            <span className="text-xs font-semibold text-stone-500">Loading catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#EAE4D8] rounded-[28px]">
            <GiSprout className="w-12 h-12 text-stone-300 mx-auto mb-2 animate-bounce" />
            <p className="text-sm font-semibold text-stone-500">No staples found in this category.</p>
            <button onClick={() => { setActiveCategory({ id: 'All', name: 'All' }); }} className="mt-2 text-xs font-bold text-[#4E641A] underline">Reset Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    );
  };

  const renderTrustSection = () => {
    return (
      <section key="trust" className="bg-[#2F3B0C] text-[#F9F6F0] py-16 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#4E641A_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-15" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C68A2B]">
              {settings.homepage_section_badge_trust || "The Suryodaya Standard"}
            </span>
            <h2 className="font-serif text-2xl md:text-4xl font-semibold leading-tight text-white">
              {settings.homepage_section_title_trust || "Purity Certified at Every Step of the Soil"}
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-6 text-center">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-6 space-y-2.5 sm:space-y-4 hover:bg-white/10 transition duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#C68A2B]/20 text-[#C68A2B] flex items-center justify-center mx-auto text-lg sm:text-xl shadow-inner shrink-0">
                🧪
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-xs sm:text-sm font-bold uppercase tracking-wider text-white">Chemical Free</h4>
                <p className="text-[9px] sm:text-[10px] text-white/85 leading-relaxed font-light line-clamp-2">
                  Strictly zero chemical pesticides, artificial urea, or hormone growth catalysts used.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-6 space-y-2.5 sm:space-y-4 hover:bg-white/10 transition duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#C68A2B]/20 text-[#C68A2B] flex items-center justify-center mx-auto text-lg sm:text-xl shadow-inner shrink-0">
                🚜
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-xs sm:text-sm font-bold uppercase tracking-wider text-white">Farm Fresh</h4>
                <p className="text-[9px] sm:text-[10px] text-white/85 leading-relaxed font-light line-clamp-2">
                  Harvested and batched in limited runs, bypassing rotting warehouse delays.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-6 space-y-2.5 sm:space-y-4 hover:bg-white/10 transition duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#C68A2B]/20 text-[#C68A2B] flex items-center justify-center mx-auto text-lg sm:text-xl shadow-inner shrink-0">
                🏺
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-xs sm:text-sm font-bold uppercase tracking-wider text-white">Traditional Methods</h4>
                <p className="text-[9px] sm:text-[10px] text-white/85 leading-relaxed font-light line-clamp-2">
                  Wood Ghanis cold-press, and Bilona curd churns maintain ancient biological structures.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-6 space-y-2.5 sm:space-y-4 hover:bg-white/10 transition duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#C68A2B]/20 text-[#C68A2B] flex items-center justify-center mx-auto text-lg sm:text-xl shadow-inner shrink-0">
                🚫
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-xs sm:text-sm font-bold uppercase tracking-wider text-white">No Preservatives</h4>
                <p className="text-[9px] sm:text-[10px] text-white/85 leading-relaxed font-light line-clamp-2">
                  Absolutely no color stabilizers, bleach refinements, or added artificial flavorings.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-6 space-y-2.5 sm:space-y-4 hover:bg-white/10 transition duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#C68A2B]/20 text-[#C68A2B] flex items-center justify-center mx-auto text-lg sm:text-xl shadow-inner shrink-0">
                👨‍🌾
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-xs sm:text-sm font-bold uppercase tracking-wider text-white">Direct From Farmers</h4>
                <p className="text-[9px] sm:text-[10px] text-white/85 leading-relaxed font-light line-clamp-2">
                  Direct revenue loops feed back to our cooperative homestead growers in Wardha.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderCollectionsSection = () => {
    const collectionsToShow = signatureCollections;

    if (collectionsToShow.length === 0) {
      if (isLoading) {
        return <CollectionsSkeleton />;
      }
      return null;
    }

    const getProductCountForCollection = (coll) => {
      if (!coll.categorySlug || coll.categorySlug === 'all') {
        return productsList.length;
      }
      const category = homepageCategories.find(
        c => c.slug === coll.categorySlug || c.id === coll.categorySlug || c.name?.toLowerCase() === coll.title?.toLowerCase()
      );
      if (category && category._count) {
        return category._count.products;
      }
      return productsList.filter(p =>
        p.categories?.some(cat => cat.slug === coll.categorySlug || cat.id === coll.categorySlug) ||
        p.categoryId === coll.categorySlug
      ).length;
    };

    return (
      <section key="collections" id="collections-grid" className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-b border-[#EAE4D8]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-left">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C68A2B]">
              {settings.homepage_section_badge_collections || "Handcrafted Categories"}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#2F3B0C]">
              {settings.homepage_section_title_collections || "Signature Farm Collections"}
            </h2>
            {settings.homepage_section_subtitle_collections && (
              <p className="text-xs md:text-sm text-stone-500 leading-relaxed font-medium">
                {settings.homepage_section_subtitle_collections}
              </p>
            )}
          </div>
          <button
            onClick={() => { setActiveCategory({ id: 'All', name: 'All' }); document.getElementById('best-sellers-grid')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="group inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#4E641A] hover:text-[#2F3B0C] transition cursor-pointer border-none bg-transparent"
          >
            <span>Explore All Catalog</span>
            <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full signature-grid">
          {collectionsToShow.map((coll) => {
            const count = getProductCountForCollection(coll);
            const countText = `${count} ${count === 1 ? 'Product' : 'Products'}`;

            const desktopCollUrl = getOptimizedImageUrl(coll.image, { width: 600, height: 380, cropMode: 'fill' });
            const mobileCollUrl = getOptimizedImageUrl(coll.image, { width: 450, height: 300, cropMode: 'fill' });

            return (
              <div
                key={coll.id}
                className="group relative w-full h-[180px] sm:h-[200px] md:h-[240px] rounded-[24px] md:rounded-[32px] overflow-hidden border border-[#EAE4D8]/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] cursor-pointer text-left transition-all duration-500 hover:-translate-y-1.5 bg-stone-900 signature-card"
                onClick={() => {
                  if (coll.categorySlug && coll.categorySlug !== 'all') {
                    navigate(`/products?category=${coll.categorySlug}`);
                  } else {
                    navigate('/products');
                  }
                }}
              >
                {/* Background Image with subtle zoom */}
                <img
                  src={getOptimizedImageUrl(coll.image, { width: 800, cropMode: 'fill' })}
                  srcSet={getImageSrcSet(coll.image, { widths: [400, 800, 1500], cropMode: 'fill' })}
                  sizes="(max-width: 768px) 85vw, 33vw"
                  alt={coll.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] opacity-90 group-hover:opacity-85"
                />

                {/* Dark Gradient Overlay for Readability */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none transition-all duration-500 group-hover:brightness-95"
                  style={{
                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.2) 100%)'
                  }}
                />

                {/* Text Content - Bottom-Left Overlay */}
                <div className="absolute bottom-0 left-0 w-full z-20 p-5 md:p-6 flex flex-col justify-end text-left select-none pointer-events-none">
                  {/* Category Title */}
                  <h3 className="font-serif text-lg md:text-xl font-bold text-white tracking-wide leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] signature-title">
                    {coll.title}
                  </h3>

                  {/* Product Count */}
                  <span className="text-[10px] md:text-xs font-semibold text-stone-300 tracking-wider uppercase mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] signature-subtitle">
                    {countText}
                  </span>

                  {coll.description && (
                    <p className="text-[11px] text-stone-200/90 leading-relaxed font-light line-clamp-2 mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                      {coll.description}
                    </p>
                  )}

                  {/* CTA link with arrow icon */}
                  <div className="mt-2.5 flex items-center text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#C68A2B] group-hover:text-white transition-colors duration-300 signature-button">
                    <span>{coll.ctaText || 'Browse Collection'}</span>
                    <FiArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform duration-300 transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderBenefitsSection = () => {
    return (
      <section key="benefits" className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-b border-[#EAE4D8] bg-[#FDFBF7]/30">
        <div className="text-center max-w-xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C68A2B] bg-[#C68A2B]/10 px-3.5 py-1 rounded-full">
            {settings.homepage_section_badge_benefits || "Targeted Purity"}
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#2F3B0C]">
            {settings.homepage_section_title_benefits || "Shop By Health Benefit"}
          </h2>
          <p className="text-xs md:text-sm text-stone-500 font-medium">
            {settings.homepage_section_subtitle_benefits || "Find the perfect staple configured for your family's personal wellness pathways."}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6 text-left benefits-grid">
          <div
            className="bg-white border border-[#EAE4D8] rounded-2xl p-4 sm:p-6 shadow-sm transition duration-300 group cursor-default benefits-card"
          >
            <span className="text-2xl mb-4 block">❤️</span>
            <h4 className="font-serif text-base font-bold text-[#2F3B0C]">Heart Healthy</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-light mt-1.5">
              Unsaturated fatty acids from pure cold-pressed wooden-mill oils.
            </p>
          </div>

          <div
            className="bg-white border border-[#EAE4D8] rounded-2xl p-4 sm:p-6 shadow-sm transition duration-300 group cursor-default benefits-card"
          >
            <span className="text-2xl mb-4 block">🌾</span>
            <h4 className="font-serif text-base font-bold text-[#2F3B0C]">Diabetic Friendly</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-light mt-1.5">
              Low glycemic index heirloom grains, rich in natural fibers and minerals.
            </p>
          </div>

          <div
            className="bg-white border border-[#EAE4D8] rounded-2xl p-4 sm:p-6 shadow-sm transition duration-300 group cursor-default benefits-card"
          >
            <span className="text-2xl mb-4 block">💪</span>
            <h4 className="font-serif text-base font-bold text-[#2F3B0C]">Protein Rich</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-light mt-1.5">
              Unpolished ancient seeds and indigenous farm pulses packed with bio-proteins.
            </p>
          </div>

          <div
            className="bg-white border border-[#EAE4D8] rounded-2xl p-4 sm:p-6 shadow-sm transition duration-300 group cursor-default benefits-card"
          >
            <span className="text-2xl mb-4 block">👧</span>
            <h4 className="font-serif text-base font-bold text-[#2F3B0C]">Kids Nutrition</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-light mt-1.5">
              Bilona ghee and sprouted multigrain porridge formulas for growing bones and brains.
            </p>
          </div>

          <div
            className="bg-white border border-[#EAE4D8] rounded-2xl p-4 sm:p-6 shadow-sm transition duration-300 group cursor-default benefits-card col-span-2 lg:col-span-1"
          >
            <span className="text-2xl mb-4 block">🧘</span>
            <h4 className="font-serif text-base font-bold text-[#2F3B0C]">Traditional Wellness</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-light mt-1.5">
              Raw honeys and forest medicinal herbs that nurture core Agni and immune shield.
            </p>
          </div>
        </div>
      </section>
    );
  };

  const renderReviewsSection = () => {
    if (testimonialsList.length === 0) {
      if (isLoading) {
        return <TestimonialsSkeleton />;
      }
      return null;
    }

    return (
      <section key="reviews" className="py-10 px-4 md:py-20 md:px-12 bg-[#F3EFE6]/40 border-b border-[#EAE4D8]">

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-10 md:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C68A2B]">
              {settings.homepage_section_badge_reviews || "Verified Testimonials"}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#2F3B0C]">
              {settings.homepage_section_title_reviews || "Earning Faith in Indian Homes"}
            </h2>
            <p className="text-xs md:text-sm text-stone-500 font-medium leading-relaxed">
              {settings.homepage_section_subtitle_reviews || "Read real stories of restoration, wellness improvements, and flavor rediscoveries from our lovely community."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {testimonialsList.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-stone-200 rounded-[28px] p-5 sm:p-8 shadow-sm flex flex-col justify-between text-left space-y-4 sm:space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-1 text-amber-500">
                      {[...Array(review.rating)].map((_, i) => <FiStar key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1 shrink-0">
                      <span>✓ Verified Purchase</span>
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-light italic">
                    "{review.testimonialText}"
                  </p>
                </div>

                <div className="flex items-center space-x-3.5 pt-4 border-t border-stone-100 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#4E641A]/10 border border-[#EAE4D8] flex items-center justify-center font-bold text-[#4E641A] font-serif shrink-0 overflow-hidden">
                    {review.customerPhoto && (review.customerPhoto.startsWith('http') || review.customerPhoto.includes('/')) ? (
                      <img
                        src={getOptimizedImageUrl(review.customerPhoto, { width: 40, height: 40, cropMode: 'fill' })}
                        alt={review.customerName}
                        width={40}
                        height={40}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      review.customerPhoto || (review.customerName ? review.customerName.charAt(0) : 'C')
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-[#2F3B0C]">{review.customerName}</span>
                    <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">
                      {review.location}{review.productPurchased ? ` • ${review.productPurchased}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderFooterBannerSection = () => {
    return (
      <section key="footer-banner" className="py-10 md:py-16 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-[0_24px_50px_-15px_rgba(47,59,12,0.3)] border border-[#EAE4D8]/15 bg-stone-900 group"
        >
          <img
            src={getOptimizedImageUrl("https://images.unsplash.com/photo-1599933310633-6f17f41f71df", { width: 1200, height: 600, cropMode: 'fill' })}
            alt="Indian Harvest"
            width={1200}
            height={600}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] scale-100 group-hover:scale-105 transition-transform duration-[2.5s] ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2F3B0C]/40 via-[#1C2307]/85 to-[#0E1204]/95 z-0" />
          <div className="absolute inset-0 bg-black/30 z-0" />

          <div className="relative z-10 max-w-3xl mx-auto p-8 sm:p-12 md:p-16 flex flex-col items-center text-center gap-5 md:gap-6">
            <span className="font-sans text-[11px] font-bold tracking-[0.25em] uppercase text-[#C68A2B]">
              {settings.homepage_section_badge_footer_banner || "Join Our Journey"}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-white font-bold leading-[1.2] max-w-2xl mx-auto">
              {settings.homepage_section_title_footer_banner || "Bring the Blessings of Pure Soil to Your Family"}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-stone-200/90 leading-relaxed font-light max-w-xl mx-auto">
              {settings.homepage_section_subtitle_footer_banner || "Are you ready to transcend chemical food? Subscribe to our monthly organic farm hampers, book a personalized tour of our fields in Wardha, or partner with us to support our cooperative farmers."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto justify-center items-center">
              <button
                onClick={() => document.getElementById('best-sellers-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="font-sans text-xs font-bold tracking-[0.15em] uppercase bg-[#C68A2B] hover:bg-[#A8721E] text-white border-none px-8 py-3.5 rounded-full transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center w-full sm:w-auto"
              >
                Explore Catalog Staples
              </button>
              <Link
                to="/contact"
                className="font-sans text-xs font-bold tracking-[0.15em] uppercase bg-white/10 hover:bg-white hover:text-[#2F3B0C] text-white border border-white/25 hover:border-white/80 px-8 py-3.5 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm text-center w-full sm:w-auto"
              >
                Book a Farm Visit
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    );
  };

  const renderSection = (sectName) => {
    // Section visibility check
    const isVisible = settings[`homepage_section_visible_${sectName}`] !== 'false';
    if (!isVisible) return null;

    switch (sectName) {
      case 'categories':
        return renderCategoriesSection();
      case 'hero':
        return renderHeroSection();
      case 'best-sellers':
        return renderBestSellersSection();
      case 'trust':
        return renderTrustSection();
      case 'collections':
        return renderCollectionsSection();
      case 'benefits':
        return renderBenefitsSection();
      case 'reviews':
        return renderReviewsSection();
      case 'footer-banner':
        return renderFooterBannerSection();
      default:
        return null;
    }
  };

  const onRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
    if (import.meta.env.DEV) {
      console.log(`[Profiler] ${id} - Phase: ${phase} - Actual Duration: ${actualDuration.toFixed(2)}ms`);
    }
  };

  const isPageLoaded = homepageConfigLoaded && categoriesLoaded && settingsLoaded;

  if (apiError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F6F0] p-6 text-center">
        <div className="max-w-md p-8 bg-white border border-[#EAE4D8] rounded-[32px] shadow-sm space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-550 rounded-full flex items-center justify-center mx-auto text-2xl">
            ⚠️
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#2F3B0C]">Failed to Load Content</h2>
            <p className="text-sm text-stone-500 leading-relaxed font-medium">
              Unable to load content. Please refresh.
            </p>
          </div>
          <button
            onClick={() => {
              setApiError(false);
              setIsLoading(true);
              loadHomepageData();
            }}
            className="px-8 py-3 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer border-none font-semibold"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !isPageLoaded) {
    return <HomepageSkeleton />;
  }

  return (
    <Profiler id="Homepage" onRender={onRenderCallback}>

      <div className="flex flex-col bg-[#F9F6F0] overflow-hidden w-full relative pt-20">

        {/* FLOATING SUCCESS TOAST MICRO-ANIMATION */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-8 right-8 z-50 bg-[#2F3B0C] border border-[#C68A2B]/40 text-white font-sans text-xs font-semibold px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3"
            >
              <GiSprout className="text-sunrise-gold text-lg animate-bounce" />
              <span>{toast.message}</span>
              <button onClick={() => setToast({ show: false, message: '' })} className="text-stone-400 hover:text-white pl-2">
                <FiX />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {sectionsSequence.map(sectName => renderSection(sectName))}

      </div>
    </Profiler>
  );
}
