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
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

// Module cache for Stale-While-Revalidate loading
let homepageCache = null;

const getCloudinaryCroppedUrl = (url, crop, options = {}) => {
  return getOptimizedImageUrl(url, { ...options, crop });
};

export function HeroSkeleton() {
  return (
    <div className="w-full bg-gradient-to-b from-[#F9F6F0] via-[#F6F3ED] to-[#EAE4D8]/20 py-12 md:py-24 px-6 md:px-12 animate-pulse border-b border-[#EAE4D8]">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8 items-center">
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="h-6 w-48 bg-stone-200 rounded-full" />
          <div className="h-12 w-3/4 bg-stone-300 rounded-xl" />
          <div className="h-12 w-1/2 bg-stone-300 rounded-xl" />
          <div className="h-20 w-5/6 bg-stone-200 rounded-xl" />
          <div className="flex gap-4">
            <div className="h-12 w-36 bg-stone-300 rounded-xl" />
            <div className="h-12 w-44 bg-stone-200 rounded-xl" />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 flex justify-center">
          <div className="w-full h-80 bg-stone-300 rounded-[36px]" />
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
  const [hasHydrated, setHasHydrated] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '' });
  const [activeCategory, setActiveCategory] = useState({ id: 'All', name: 'All' });
  const [activeBenefit, setActiveBenefit] = useState('All');
  
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Carousel slider states
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1); // 1 = forward, -1 = backward

  const nextSlide = () => {
    if (heroesList.length <= 1) return;
    setSlideDirection(1);
    setCurrentSlideIndex((prev) => (prev + 1) % heroesList.length);
  };

  const prevSlide = () => {
    if (heroesList.length <= 1) return;
    setSlideDirection(-1);
    setCurrentSlideIndex((prev) => (prev - 1 + heroesList.length) % heroesList.length);
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
      if (heroesList.length <= 1) return;
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
  }, [heroesList, currentSlideIndex]);

  // Auto rotation timer effect
  useEffect(() => {
    if (!sliderAutoRotate || heroesList.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, sliderDuration * 1000);

    return () => clearInterval(timer);
  }, [sliderAutoRotate, heroesList, sliderDuration, currentSlideIndex]);

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
          freshOrder = cmsRes.sectionOrder.split(',').filter(s => s !== 'reviews');
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

    if (categoriesToShow.length === 0) {
      if (isLoadingCategoryData) {
        return <CategoriesSkeleton />;
      }
      return null;
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

    return (
      <section 
        key="categories" 
        className="bg-gradient-to-b from-[#FDFBF7] via-[#FDFBF7] to-[#F5F2EA] border-b border-[#EAE4D8]/80 py-16 md:py-24 select-none shadow-[inset_0_-2px_10px_rgba(0,0,0,0.01)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C68A2B] bg-[#C68A2B]/10 px-3.5 py-1 rounded-full inline-block">
              Organic Harvest
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#2F3B0C]">
              Shop By Category
            </h2>
            <p className="text-xs md:text-sm text-stone-500 leading-relaxed font-medium">
              Explore our carefully curated farm-fresh collections.
            </p>
          </div>

          {/* Cards Grid */}
          {isLoadingCategoryData ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={`skeleton-${i}`} 
                  className="bg-stone-200/60 animate-pulse h-64 sm:h-80 rounded-[24px] pointer-events-none" 
                />
              ))}
            </div>
          ) : (
            categoriesToShow && categoriesToShow.length > 0 && (
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
                      {/* Category Thumbnail Image with fixed 4:3 aspect ratio */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F8F5F0] border-b border-[#EAE4D8]/40 shrink-0">
                        {cat.image ? (
                          <img 
                            src={optimizedImageUrl} 
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

                      {/* Card Content - Aligned below the image */}
                      <div className="p-4 flex flex-col justify-between flex-grow gap-3">
                        <div className="space-y-0.5">
                          <h3 className="font-serif text-sm sm:text-base md:text-lg font-bold text-[#2F3B0C] group-hover:text-[#4E641A] transition-colors leading-tight line-clamp-1">
                            {cat.name}
                          </h3>
                          <span className="font-sans text-[10px] sm:text-xs font-semibold text-stone-400 block">
                            {cat.productCount} {cat.productCount === 1 ? 'Staple' : 'Staples'}
                          </span>
                        </div>

                        {/* CTA Row - Identical position across all cards */}
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
            )
          )}
        </div>
      </section>
    );
  };

  const renderHeroSection = () => {
    const currentHero = heroesList[currentSlideIndex] || activeHero;
    const hasHero = !!currentHero;

    if (!hasHero) {
      if (isLoading) {
        return <HeroSkeleton />;
      }
      return null;
    }

    const title = currentHero.headingLine1 || '';
    const highlight = currentHero.headingHighlight || '';
    const titleLine2 = currentHero.headingLine2 || '';
    const description = currentHero.description || '';
    const primaryButtonText = currentHero.primaryButtonText || 'Shop Now';
    const primaryButtonLink = currentHero.primaryButtonLink || '/';
    const secondaryButtonText = currentHero.secondaryButtonText || 'Explore Collections';
    const secondaryButtonLink = currentHero.secondaryButtonLink || '/';
    const badgeText = currentHero.trustBadgeText || '';
    const promoCodeText = currentHero.promoText || '';

    // Bullets list
    const bulletOne = currentHero.bulletOne || '';
    const bulletTwo = currentHero.bulletTwo || '';
    const bulletThree = currentHero.bulletThree || '';
    const bulletFour = currentHero.bulletFour || '';

    // Featured Product Reference
    const featuredProduct = currentHero.featuredProduct || productsList.find(p => p.isFeatured) || null;
    const hasFeaturedProduct = !!featuredProduct;

    const featuredProductName = hasFeaturedProduct ? featuredProduct.name : '';
    const featuredProductPrice = hasFeaturedProduct ? featuredProduct.price : 0;
    const featuredProductOriginalPrice = hasFeaturedProduct ? (featuredProduct.compareAtPrice || featuredProduct.originalPrice || featuredProduct.mrp || 0) : 0;
    const featuredProductImage = hasFeaturedProduct 
      ? (featuredProduct.images?.length > 0 ? featuredProduct.images[0].url : featuredProduct.image) 
      : null;

    // Use currentHero.heroImage as primary, fallback to featured product image
    const heroImage = currentHero.heroImage || featuredProductImage || '';

    const desktopHeroImageUrl = heroImage ? getCloudinaryCroppedUrl(heroImage, currentHero, { width: 500, height: 333, cropMode: 'fill' }) : '';
    const tabletHeroImageUrl = heroImage ? getCloudinaryCroppedUrl(heroImage, currentHero, { width: 400, height: 266, cropMode: 'fill' }) : '';
    const mobileHeroImageUrl = heroImage ? getCloudinaryCroppedUrl(heroImage, currentHero, { width: 300, height: 165, cropMode: 'fill' }) : '';

    // Right card badges
    const offerBadgeText = currentHero.offerBadgeText || '';
    const floatingBadgeTitle = currentHero.floatingBadgeTitle || '';
    const floatingBadgeSubtitle = currentHero.floatingBadgeSubtitle || '';


    const handleFeaturedProductAction = () => {
      if (hasFeaturedProduct) {
        const prod = {
          id: featuredProduct.id,
          name: featuredProduct.name,
          price: featuredProduct.price,
          originalPrice: featuredProductOriginalPrice,
          weight: featuredProduct.weight,
          image: featuredProductImage || heroImage,
          tag: 'Featured',
          description: featuredProduct.description,
          category: 'Featured'
        };
        handleAddToCart(prod);
      } else {
        const firstProd = productsList[0];
        if (firstProd) {
          handleAddToCart(firstProd);
        }
      }
    };

    // Stagger animation variants for text lines inside slides
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

    const textItemVariants = {
      hidden: { opacity: 0, y: 15 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: [0.215, 0.61, 0.355, 1] // easeOutCubic
        }
      }
    };

    const rightCardVariants = {
      hidden: { opacity: 0, scale: 0.96, y: 20 },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.215, 0.61, 0.355, 1],
          delay: 0.25
        }
      }
    };

    const slideVariants = {
      enter: (direction) => ({
        x: direction > 0 ? 50 : -50,
        opacity: 0
      }),
      center: {
        x: 0,
        opacity: 1,
        transition: {
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.4 }
        }
      },
      exit: (direction) => ({
        x: direction < 0 ? 50 : -50,
        opacity: 0,
        transition: {
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.3 }
        }
      })
    };

    return (
      <section 
        key="hero" 
        className="home-hero-section relative overflow-hidden py-4 sm:py-12 md:py-24 px-4 sm:px-6 md:px-12 border-b border-[#EAE4D8] bg-gradient-to-b from-[#F9F6F0] via-[#F6F3ED] to-[#EAE4D8]/20 text-left animate-fade-in"
      >
        {/* Background blobs with subtle movement */}
        <motion.div 
          animate={{
            x: currentSlideIndex * 20,
            y: currentSlideIndex * -15,
          }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#4E641A]/5 rounded-full filter blur-3xl pointer-events-none" 
        />
        <motion.div 
          animate={{
            x: currentSlideIndex * -20,
            y: currentSlideIndex * 15,
          }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-1/4 right-1/10 w-80 h-80 bg-[#C68A2B]/5 rounded-full filter blur-3xl pointer-events-none" 
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatePresence mode="wait" custom={slideDirection}>
            <motion.div
              key={currentSlideIndex}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="grid grid-cols-12 gap-3 sm:gap-6 lg:gap-12 items-center cursor-grab active:cursor-grabbing select-none"
            >
              {/* Left Text */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="col-span-12 lg:col-span-7 space-y-2 sm:space-y-6 text-left"
              >
                {badgeText && (
                  <motion.div variants={textItemVariants} className="inline-flex items-center space-x-1 sm:space-x-2 bg-white border border-[#EAE4D8] px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-sm">
                    <div className="flex text-amber-500 shrink-0">
                      {[...Array(5)].map((_, i) => <FiStar key={i} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current" />)}
                    </div>
                    <span className="text-[7px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-600 truncate max-w-[110px] xs:max-w-none">
                      {badgeText}
                    </span>
                  </motion.div>
                )}

                <motion.h1 variants={textItemVariants} className="font-serif text-sm xs:text-base sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#2F3B0C] leading-[1.2] sm:leading-[1.1] max-w-2xl">
                  {title} {highlight && <><span className="sm:inline hidden"><br /></span><span className="text-[#C68A2B] italic font-normal font-serif text-xs xs:text-sm sm:text-4xl md:text-5xl lg:text-6xl"> {highlight}</span></>}
                  {titleLine2 && <><span className="sm:inline hidden"><br /></span><span> {titleLine2}</span></>}
                </motion.h1>

                {description && (
                  <motion.p variants={textItemVariants} className="text-[9px] sm:text-sm lg:text-base text-stone-600 max-w-xl leading-normal sm:leading-relaxed line-clamp-2 sm:line-clamp-none hidden xs:block">
                    {description}
                  </motion.p>
                )}

                <motion.div variants={textItemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs font-semibold text-[#2F3B0C]/80 pt-2 max-w-md hidden sm:grid">
                  {bulletOne && (
                    <div className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-[#4E641A]" />
                      <span>{bulletOne}</span>
                    </div>
                  )}
                  {bulletTwo && (
                    <div className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-[#4E641A]" />
                      <span>{bulletTwo}</span>
                    </div>
                  )}
                  {bulletThree && (
                    <div className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-[#4E641A]" />
                      <span>{bulletThree}</span>
                    </div>
                  )}
                  {bulletFour && (
                    <div className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-[#4E641A]" />
                      <span>{bulletFour}</span>
                    </div>
                  )}
                </motion.div>

                <motion.div variants={textItemVariants} className="flex flex-row gap-2 sm:gap-3 pt-1 sm:pt-4 w-full">
                  {primaryButtonText && (
                    <button 
                      onClick={() => {
                        if (primaryButtonLink && primaryButtonLink !== '/') {
                          navigate(primaryButtonLink);
                        } else {
                          document.getElementById('best-sellers-grid')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="group px-3 py-1.5 sm:px-8 sm:py-4 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-[9px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest rounded-lg sm:rounded-xl transition duration-300 flex items-center justify-center space-x-1.5 sm:space-x-3 shadow-md cursor-pointer border-none"
                    >
                      <span>{primaryButtonText}</span>
                      <FiArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {secondaryButtonText && (
                    <button 
                      onClick={() => {
                        if (secondaryButtonLink && secondaryButtonLink !== '/') {
                          navigate(secondaryButtonLink);
                        } else {
                          document.getElementById('collections-grid')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="px-3 py-1.5 sm:px-8 sm:py-4 bg-white hover:bg-stone-50 text-[#4E641A] border border-[#EAE4D8] text-[9px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest rounded-lg sm:rounded-xl transition duration-300 shadow-sm cursor-pointer text-center font-semibold sm:block hidden"
                    >
                      {secondaryButtonText}
                    </button>
                  )}
                </motion.div>

                {promoCodeText && (
                  <motion.div variants={textItemVariants} className="pt-2 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-[#C68A2B] hidden sm:flex">
                    <span className="bg-[#C68A2B]/10 px-2 py-1 rounded-md">PROMO</span>
                    <span>{promoCodeText}</span>
                  </motion.div>
                )}
              </motion.div>

              {/* Right Visual Image */}
              <motion.div 
                variants={rightCardVariants}
                initial="hidden"
                animate="visible"
                className="col-span-12 lg:col-span-5 relative mt-0 flex justify-center w-full"
              >
                {!featuredProduct ? (
                  <div className="w-full">
                    <ProductSkeleton />
                  </div>
                ) : (
                  <div className="relative w-full h-[120px] min-[360px]:h-[145px] min-[390px]:h-[165px] sm:h-[450px] rounded-2xl sm:rounded-[36px] overflow-hidden border border-[#EAE4D8] shadow-md sm:shadow-2xl bg-white p-1.5 sm:p-4">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#F6F3ED] via-[#F9F6F0] to-[#EAE4D8]/20 z-0" />
                    
                    <picture className="w-full h-full sm:h-2/3 rounded-xl sm:rounded-[28px] overflow-hidden border border-stone-100 z-10 relative shadow block">
                      <source media="(max-width: 640px)" srcSet={mobileHeroImageUrl} />
                      <source media="(max-width: 1024px)" srcSet={tabletHeroImageUrl} />
                      {desktopHeroImageUrl ? (
                        <img 
                          src={desktopHeroImageUrl} 
                          alt="Storefront Hero Staple" 
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-200" />
                      )}
                    </picture>

                    <div className="hidden sm:block p-4 relative z-10 space-y-2 mt-4 text-left">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#C68A2B] bg-[#C68A2B]/10 px-2 py-0.5 rounded-full inline-block">
                        {currentHero.isFeatured ? '★ Featured Harvest' : 'Staple Harvest of the Month'}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#2F3B0C] line-clamp-1">
                        {featuredProductName}
                      </h3>
                      <div className="flex justify-between items-center pt-1">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-base font-bold text-[#4E641A]">₹{featuredProductPrice}</span>
                          {featuredProductOriginalPrice > featuredProductPrice && (
                            <span className="text-xs line-through text-stone-400 font-medium">₹{featuredProductOriginalPrice}</span>
                          )}
                        </div>
                        <button 
                          onClick={handleFeaturedProductAction}
                          disabled={hasFeaturedProduct && featuredProduct.inventory <= 0}
                          className={`px-4 py-2 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition shadow-sm border-none ${
                            hasFeaturedProduct && featuredProduct.inventory <= 0 
                              ? 'bg-stone-300 cursor-not-allowed' 
                              : 'bg-[#4E641A] hover:bg-[#2F3B0C] cursor-pointer'
                          }`}
                        >
                          {hasFeaturedProduct && featuredProduct.inventory <= 0 ? 'Sold Out' : 'Quick Add'}
                        </button>
                      </div>
                    </div>

                    {/* Discount Offer Badge */}
                    {offerBadgeText && (
                      <div className="absolute top-3 right-3 sm:top-8 sm:right-8 bg-[#C68A2B] text-white text-[8px] sm:text-xs font-extrabold uppercase py-1 px-2 sm:py-2 sm:px-3.5 rounded-full shadow-md sm:shadow-lg z-20 flex flex-col items-center leading-none">
                        <span>{offerBadgeText}</span>
                      </div>
                    )}
                  </div>
                )}

                {(floatingBadgeTitle || floatingBadgeSubtitle) && (
                  <div className="hero-floating-card flex absolute -bottom-6 -left-6 bg-white/80 border border-[#EAE4D8] rounded-2xl p-4 shadow-lg items-center space-x-3.5 z-20">
                    <div className="w-9 h-9 rounded-full bg-[#4E641A]/10 text-[#4E641A] flex items-center justify-center font-bold">
                      🌾
                    </div>
                    <div className="text-left">
                      {floatingBadgeTitle && <span className="block text-xs font-bold">{floatingBadgeTitle}</span>}
                      {floatingBadgeSubtitle && <span className="block text-[9px] text-stone-500 uppercase tracking-wider font-semibold">{floatingBadgeSubtitle}</span>}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slider Indicators & Controls Bar */}
        {heroesList.length > 1 && (
          <div className="hidden md:flex max-w-7xl mx-auto mt-12 items-center justify-between gap-6 border-t border-[#EAE4D8]/60 pt-6 text-xs text-stone-500 relative z-10 select-none">
            {/* Fraction & Navigation buttons */}
            <div className="flex items-center space-x-4">
              <span className="font-serif text-sm font-bold text-[#2F3B0C]">
                {String(currentSlideIndex + 1).padStart(2, '0')} <span className="text-stone-300">/</span> {String(heroesList.length).padStart(2, '0')}
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={prevSlide}
                  className="w-8 h-8 rounded-full border border-[#EAE4D8] flex items-center justify-center text-stone-600 hover:bg-[#4E641A] hover:text-white transition duration-300 cursor-pointer border-none bg-transparent"
                  title="Previous Campaign"
                >
                  <FiChevronRight className="rotate-180 text-stone-550" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="w-8 h-8 rounded-full border border-[#EAE4D8] flex items-center justify-center text-stone-600 hover:bg-[#4E641A] hover:text-white transition duration-300 cursor-pointer border-none bg-transparent"
                  title="Next Campaign"
                >
                  <FiChevronRight className="text-stone-550" />
                </button>
              </div>
            </div>

            {/* Pagination Dots with Micro Progress bar */}
            <div className="flex items-center space-x-3">
              {heroesList.map((hr, idx) => {
                const isActive = idx === currentSlideIndex;
                return (
                  <button
                    key={hr.id || idx}
                    onClick={() => {
                      setSlideDirection(idx > currentSlideIndex ? 1 : -1);
                      setCurrentSlideIndex(idx);
                    }}
                    className="group relative h-2 flex items-center transition-all cursor-pointer border-none bg-transparent"
                    style={{ width: isActive ? '40px' : '8px' }}
                    title={`Go to slide ${idx + 1}`}
                  >
                    {isActive ? (
                      <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden relative">
                        {/* Interactive ticking progress bar inside dot */}
                        <motion.div 
                          key={currentSlideIndex}
                          initial={{ width: "0%" }}
                          animate={{ width: !sliderAutoRotate ? "0%" : "100%" }}
                          transition={{ 
                            duration: !sliderAutoRotate ? 0 : sliderDuration, 
                            ease: "linear" 
                          }}
                          className="absolute top-0 left-0 h-full bg-[#4E641A] rounded-full"
                        />
                      </div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-stone-300 group-hover:bg-stone-555 transition duration-300" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Slider Status Info */}
            <div className="hidden lg:flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              <span className={`w-1.5 h-1.5 rounded-full ${!sliderAutoRotate ? 'bg-amber-500' : 'bg-[#4E641A] animate-pulse'}`} />
              <span>{!sliderAutoRotate ? 'Manual Mode' : 'Auto Rotating'}</span>
            </div>
          </div>
        )}
      </section>
    );
  };

  const renderBestSellersSection = () => {
    return (
      <section key="best-sellers" id="best-sellers-grid" className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-b border-[#EAE4D8]">
        <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C68A2B] bg-[#C68A2B]/10 px-3.5 py-1 rounded-full">
            Customer Favorites
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#2F3B0C]">
            Direct From Soil Best Sellers
          </h2>
          <p className="text-xs md:text-sm text-stone-500 leading-relaxed font-medium">
            Discover the daily organic essentials that nourish thousands of Indian families. Non-GMO, freshly batched, and absolute chemical-free.
          </p>
        </div>

        {/* Dynamic Category Filtering Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[{ id: 'All', name: 'All' }, ...homepageCategories].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                (activeCategory === 'All' && cat.id === 'All') || activeCategory?.id === cat.id
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
              The Suryodaya Standard
            </span>
            <h2 className="font-serif text-2xl md:text-4xl font-semibold leading-tight text-white">
              Purity Certified at Every Step of the Soil
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
    const collectionsToShow = homepageCollections;

    if (collectionsToShow.length === 0) {
      if (isLoading) {
        return <CollectionsSkeleton />;
      }
      return null;
    }

    const gridColsClass = collectionsToShow.length >= 3 
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
      : "grid grid-cols-1 md:grid-cols-2 gap-8";


    return (
      <section key="collections" id="collections-grid" className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-b border-[#EAE4D8]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-left">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C68A2B]">
              Handcrafted Categories
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#2F3B0C]">
              Signature Farm Collections
            </h2>
          </div>
          <button 
            onClick={() => { setActiveCategory({ id: 'All', name: 'All' }); document.getElementById('best-sellers-grid')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="group inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#4E641A] hover:text-[#2F3B0C] transition cursor-pointer border-none bg-transparent"
          >
            <span>Explore All Catalog</span>
            <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className={`${gridColsClass} signature-grid`}>
          {collectionsToShow.map((coll) => {
            let meta = {
              subtitle: coll.description || '',
              mobileImage: '',
              overlayPosition: 'bottom-left',
              overlayDarkness: 0.5,
              textColorTheme: 'light',
              ctaText: coll.ctaText || 'Browse Collection',
              badge: coll.badge || ''
            };
            if (coll.description && coll.description.startsWith('{')) {
              try {
                const parsed = JSON.parse(coll.description);
                meta = { ...meta, ...parsed };
              } catch (e) {}
            }

            const darkness = meta.overlayDarkness !== undefined ? parseFloat(meta.overlayDarkness) : 0.5;
            // Normalize overlay gradients to fade top (transparent) to bottom (dark gradient zone)
            const overlayBg = `linear-gradient(to top, rgba(0,0,0,${darkness + 0.35}) 0%, rgba(0,0,0,${darkness}) 45%, rgba(0,0,0,0.1) 75%, transparent 100%)`;

            const desktopCollUrl = getOptimizedImageUrl(coll.image, { width: 600, height: 420, cropMode: 'fill' });
            const mobileCollUrl = getOptimizedImageUrl(meta.mobileImage || coll.image, { width: 350, height: 380, cropMode: 'fill' });

            return (
              <div 
                key={coll.id} 
                className="group relative h-[380px] md:h-[420px] rounded-[24px] md:rounded-[32px] overflow-hidden border border-[#EAE4D8] shadow-sm hover:shadow-[0_20px_40px_rgba(78,100,26,0.15)] cursor-pointer text-left transition-all duration-500 hover:-translate-y-1.5 bg-stone-900 signature-card" 
                onClick={() => {
                  if (coll.categorySlug && coll.categorySlug !== 'all') {
                    navigate(`/products?category=${coll.categorySlug}`);
                  } else {
                    navigate('/products');
                  }
                }}
              >
                {/* Desktop Background Image with subtle zoom */}
                <img 
                  src={desktopCollUrl} 
                  alt={coll.title} 
                  width={600}
                  height={420}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 opacity-85 group-hover:opacity-80 hidden md:block"
                />
                
                {/* Mobile Background Image with subtle zoom */}
                <img 
                  src={mobileCollUrl} 
                  alt={coll.title} 
                  width={350}
                  height={380}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 opacity-85 group-hover:opacity-80 block md:hidden"
                />

                {/* Dark Gradient Overlay for Readability */}
                <div 
                  className="absolute inset-0 z-10 pointer-events-none transition-all duration-500 group-hover:brightness-95"
                  style={{ background: overlayBg }}
                />
                
                {/* Text Content - Safe Zone Bottom-Left Overlay with backdrop glass strip */}
                <div className="absolute bottom-5 left-5 right-5 md:bottom-6 md:left-6 md:right-6 z-20 p-4 md:p-6 rounded-[20px] md:rounded-[24px] bg-black/20 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] space-y-2 md:space-y-3 transition-all duration-500 group-hover:-translate-y-1 hover:bg-black/25 signature-overlay">
                  {meta.badge && (
                    <span className="text-[8px] md:text-[9px] font-extrabold uppercase tracking-widest text-[#C68A2B] bg-[#C68A2B]/10 border border-[#C68A2B]/20 px-2.5 py-0.5 rounded-full inline-block">
                      {meta.badge}
                    </span>
                  )}
                  
                  {/* Floating premium storyteller label above title for short subtitles */}
                  {meta.subtitle && meta.subtitle.length < 50 && (
                    <span className="block text-[8px] md:text-[9px] font-bold text-[#C68A2B] uppercase tracking-wider line-clamp-1 opacity-90 signature-subtitle">
                      {meta.subtitle}
                    </span>
                  )}

                  <h3 className="font-serif text-lg md:text-2xl font-bold tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] leading-tight signature-title">
                    {coll.title}
                  </h3>

                  {/* Elegant line clamped description block */}
                  {meta.subtitle && meta.subtitle.length >= 50 && (
                    <p className="text-[10px] md:text-xs text-stone-200 leading-relaxed font-light line-clamp-2 max-w-prose drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] signature-description">
                      {meta.subtitle}
                    </p>
                  )}
                  
                  {/* Redesigned CTA Button with arrow hover micro-animation */}
                  <div className="pt-1 flex items-center justify-between signature-button">
                    <span className="inline-flex items-center space-x-2 text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest text-[#C68A2B] transition-colors duration-300 group-hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                      <span>{meta.ctaText || 'Browse Collection'}</span>
                      <FiArrowRight className="w-3.5 h-3.5 transition-transform duration-300 transform group-hover:translate-x-1.5" />
                    </span>
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
            Targeted Purity
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#2F3B0C]">
            Shop By Health Benefit
          </h2>
          <p className="text-xs md:text-sm text-stone-500 font-medium">
            Find the perfect staple configured for your family's personal wellness pathways.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left benefits-grid">
          <div 
            className="bg-white border border-[#EAE4D8] rounded-2xl p-6 shadow-sm transition duration-300 group cursor-default benefits-card"
          >
            <span className="text-2xl mb-4 block">❤️</span>
            <h4 className="font-serif text-base font-bold text-[#2F3B0C]">Heart Healthy</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-light mt-1.5">
              Unsaturated fatty acids from pure cold-pressed wooden-mill oils.
            </p>
          </div>

          <div 
            className="bg-white border border-[#EAE4D8] rounded-2xl p-6 shadow-sm transition duration-300 group cursor-default benefits-card"
          >
            <span className="text-2xl mb-4 block">🌾</span>
            <h4 className="font-serif text-base font-bold text-[#2F3B0C]">Diabetic Friendly</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-light mt-1.5">
              Low glycemic index heirloom grains, rich in natural fibers and minerals.
            </p>
          </div>

          <div 
            className="bg-white border border-[#EAE4D8] rounded-2xl p-6 shadow-sm transition duration-300 group cursor-default benefits-card"
          >
            <span className="text-2xl mb-4 block">💪</span>
            <h4 className="font-serif text-base font-bold text-[#2F3B0C]">Protein Rich</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-light mt-1.5">
              Unpolished ancient seeds and indigenous farm pulses packed with bio-proteins.
            </p>
          </div>

          <div 
            className="bg-white border border-[#EAE4D8] rounded-2xl p-6 shadow-sm transition duration-300 group cursor-default benefits-card"
          >
            <span className="text-2xl mb-4 block">👧</span>
            <h4 className="font-serif text-base font-bold text-[#2F3B0C]">Kids Nutrition</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-light mt-1.5">
              Bilona ghee and sprouted multigrain porridge formulas for growing bones and brains.
            </p>
          </div>

          <div 
            className="bg-white border border-[#EAE4D8] rounded-2xl p-6 shadow-sm transition duration-300 group cursor-default benefits-card"
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
      <section key="reviews" className="py-20 px-6 md:px-12 bg-[#F3EFE6]/40 border-b border-[#EAE4D8]">

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C68A2B]">
              Verified Testimonials
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#2F3B0C]">
              Earning Faith in Indian Homes
            </h2>
            <p className="text-xs md:text-sm text-stone-500 font-medium leading-relaxed">
              Read real stories of restoration, wellness improvements, and flavor rediscoveries from our lovely community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsList.map((review) => (
              <div 
                key={review.id}
                className="bg-white border border-stone-200 rounded-[28px] p-8 shadow-sm flex flex-col justify-between text-left space-y-6"
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
              Join Our Journey
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-white font-bold leading-[1.2] max-w-2xl mx-auto">
              Bring the Blessings of Pure Soil to Your Family
            </h2>
            <p className="font-sans text-xs sm:text-sm text-stone-200/90 leading-relaxed font-light max-w-xl mx-auto">
              Are you ready to transcend chemical food? Subscribe to our monthly organic farm hampers, book a personalized tour of our fields in Wardha, or partner with us to support our cooperative farmers.
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
