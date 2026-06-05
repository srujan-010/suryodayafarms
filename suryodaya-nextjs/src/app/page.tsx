'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { 
  ShoppingBag, 
  User as UserIcon, 
  LogOut, 
  Lock, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  Star,
  Search,
  Heart,
  ArrowRight,
  ChevronLeft,
  X,
  Menu,
  ArrowUpRight,
  BadgePercent,
  ThumbsUp,
  Sliders,
  Compass,
  Sprout
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  weight: string;
  rating: number;
  reviewsCount: number;
  image: string;
  tag: string;
  description: string;
  category: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  weight: string;
  quantity: number;
  image: string;
}

export default function LuxuryStorefrontPage() {
  const { 
    user, 
    isAuthenticated, 
    setAuthModalOpen, 
    setCheckoutResumeRedirect,
    logout,
    checkSession
  } = useAuthStore();

  // Dynamic State for Database-Driven Catalog
  const [productsList, setProductsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Centralized Website Settings state
  const [settings, setSettings] = useState<any>({
    companyName: 'Suryodaya Farms',
    brandName: 'Suryodaya Farms & Organics',
    email: 'care@suryodayafarms.com',
    phone: '+91 9100422140',
    address: 'Plot No-20 NP, Kuruma Nagar, Peerzadiguda Mandal, Medchal (Malkajgiri), Telangana – 500039',
    websiteUrl: 'https://suryodayafarms.com',
    gstNumber: '36AAAAA0000A1Z5',
    registrationDetails: 'FSSAI Licence No: 11524999000342 | Soil Bio-Dynamic System ISO 14001',
    socialTwitter: 'https://twitter.com/suryodayafarms',
    socialFacebook: 'https://facebook.com/suryodayafarms',
    socialInstagram: 'https://instagram.com/suryodayafarms',
    socialYoutube: 'https://youtube.com/suryodayafarms'
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    loadSettings();
  }, []);

  // Initialize interactive cart items
  const [cart, setCart] = useState<CartItem[]>([
    { 
      id: 'a2-ghee', 
      name: 'A2 Gir Cow Desi Ghee', 
      price: 950, 
      weight: '500 ml', 
      quantity: 1, 
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=600' 
    },
    { 
      id: 'sesame-oil', 
      name: 'Wood Pressed Sesame Oil', 
      price: 390, 
      weight: '1 Litre', 
      quantity: 1, 
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600' 
    }
  ]);

  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [activeBenefit, setActiveBenefit] = useState<string>('All');
  const [activeCategory, setActiveCategory] = useState<any>({ id: 'All', name: 'All' });

  // References for scrolling
  const bestSellersRef = useRef<HTMLDivElement>(null);
  const collectionsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Fetch products and categories on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products').then(res => res.json()),
          fetch('/api/categories').then(res => res.json())
        ]);
        
        // Populate products with fallback support
        if (prodRes.success && prodRes.products && prodRes.products.length > 0) {
          setProductsList(prodRes.products);
        } else {
          setProductsList([
            {
              id: 'a2-ghee',
              name: 'A2 Gir Cow Desi Ghee',
              price: 950,
              originalPrice: 1100,
              weight: '500 ml',
              rating: 4.9,
              reviewsCount: 142,
              image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=600',
              tag: 'Vedic Bilona Method',
              description: 'Hand-churned at sunrise from organic curd of grass-fed Gir cows using traditional Bilona process.',
              category: 'A2 Ghee'
            },
            {
              id: 'sesame-oil',
              name: 'Wood Pressed Sesame Oil',
              price: 390,
              originalPrice: 450,
              weight: '1 Litre',
              rating: 4.8,
              reviewsCount: 89,
              image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600',
              tag: 'Cold-Extracted',
              description: 'Traditional Vagai wood press extraction at low temperatures to preserve native antioxidants and aroma.',
              category: 'Cold Pressed Oils'
            },
            {
              id: 'forest-honey',
              name: 'Raw Himalayan Wild Forest Honey',
              price: 450,
              originalPrice: 520,
              weight: '250 g',
              rating: 5.0,
              reviewsCount: 210,
              image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600',
              tag: '100% Unfiltered',
              description: 'Pure raw honey harvested by forest tribals from wild beehives in high-altitude Himalayan valleys.',
              category: 'New Launches'
            },
            {
              id: 'bansi-atta',
              name: 'Ancient Bansi Wheat Atta',
              price: 180,
              originalPrice: 220,
              weight: '1 kg',
              rating: 4.7,
              reviewsCount: 74,
              image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=600',
              tag: 'Sieved Whole Grain',
              description: 'Stone-ground flour of indigenous heirloom Bansi wheat, rich in dietary fibers and high gluten strength.',
              category: 'Grains'
            },
            {
              id: 'jaggery-powder',
              name: 'Organic Jaggery Powder',
              price: 140,
              originalPrice: 175,
              weight: '500 g',
              rating: 4.9,
              reviewsCount: 104,
              image: 'https://images.unsplash.com/photo-1608408881648-a1c97a5ee2e3?auto=format&fit=crop&q=80&w=600',
              tag: 'Chemical Free',
              description: 'Natural unrefined jaggery made from fresh sugarcane juice clarified with organic wild herb extracts.',
              category: 'Jaggery'
            },
            {
              id: 'millet-mix',
              name: 'Sprouted Multi-Millet Mix',
              price: 260,
              originalPrice: 320,
              weight: '500 g',
              rating: 4.8,
              reviewsCount: 63,
              image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
              tag: 'Kids & Wellness',
              description: 'Blend of 9 organic millets sprouted, solar-dried, and stone-ground to provide maximum bioactive minerals.',
              category: 'Millets'
            }
          ]);
        }

        // Populate categories with fallback support
        if (catRes.success && catRes.categories && catRes.categories.length > 0) {
          const emojiMap: Record<string, string> = {
            'Cold Pressed Oils': '🫗',
            'A2 Ghee': '🧈',
            'Organic Grains': '🌾',
            'Ancient Millets': '🌱',
            'Stone-Ground Spices': '🫚',
            'Raw Honey & Sweeteners': '🍯',
            'Pickles': '🌶️',
            'Pulses': '🫘'
          };
          const mapped = catRes.categories.map((c: any) => ({
            id: c.id,
            name: c.name,
            label: c.name,
            emoji: emojiMap[c.name] || '🌿',
            image: c.image || '',
            slug: c.slug
          }));
          setCategoriesList(mapped);
        } else {
          setCategoriesList([
            { id: '1', name: 'Cold Pressed Oils', label: 'Cold Pressed Oils', emoji: '🫗', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600', slug: 'cold-pressed-oils' },
            { id: '2', name: 'A2 Ghee', label: 'A2 Ghee', emoji: '🧈', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=600', slug: 'a2-ghee' },
            { id: '3', name: 'Organic Grains', label: 'Organic Grains', emoji: '🌾', image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=600', slug: 'grains' },
            { id: '4', name: 'Ancient Millets', label: 'Ancient Millets', emoji: '🌱', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600', slug: 'millets' }
          ]);
        }
      } catch (error) {
        console.error("Failed to load storefront data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const selectCategoryByName = (name: string) => {
    const found = categoriesList.find(c => 
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

  // Sync state with server session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        weight: product.weight,
        quantity: 1,
        image: product.image
      }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = 0; // Free Shipping
  const taxRate = 0.05; // 5% GST
  const calculateTotal = () => {
    const sub = calculateSubtotal();
    const tax = sub * taxRate;
    return sub + tax + shippingFee;
  };

  const handleCheckoutTrigger = () => {
    if (!isAuthenticated) {
      setCheckoutResumeRedirect('/');
      setAuthModalOpen(true);
    } else {
      setIsProcessingCheckout(true);
      setTimeout(() => {
        setIsProcessingCheckout(false);
        setCheckoutComplete(true);
        setOrderNumber(`SURYODAYA-${Math.floor(100000 + Math.random() * 900000)}`);
        setCart([]); // Clear cart
      }, 1800);
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const scrollToSection = (elementRef: React.RefObject<HTMLDivElement | null>) => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCheckoutComplete(false);
  };



  // Static Testimonials
  const testimonials = [
    {
      id: 1,
      name: 'Dr. Radhika Krishnan',
      role: 'Ayurveda Practitioner & Health Advisor',
      avatar: 'R',
      review: 'Suryodaya\'s Bilona A2 Ghee and cold wood-pressed oils are foundational to high-potency nutritional therapies. The bio-availability of trace elements is exceptional because they avoid heat and chemical processing.',
      rating: 5,
      location: 'Chennai'
    },
    {
      id: 2,
      name: 'Prof. Amit V. Sathe',
      role: 'Agritech Researcher & Nutritionist',
      avatar: 'A',
      review: 'What sets Suryodaya apart is their scientifically guided production combined with traditional wisdom. Their focus on dryland multi-cropping and soil microbiome enrichment yields crops with superior trace mineral levels.',
      rating: 5,
      location: 'Mumbai'
    },
    {
      id: 3,
      name: 'Shalini Sen',
      role: 'Functional Wellness Coach',
      avatar: 'S',
      review: 'I recommend Suryodaya\'s organic sprouted finger millet to all my clients seeking digestive health and clean energy. Being gluten-free and hygienically processed, it provides a perfect slow-release carb profile.',
      rating: 5,
      location: 'Bangalore'
    }
  ];

  const filteredProducts = productsList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const activeId = activeCategory?.id || activeCategory;
    const activeName = activeCategory?.name || activeCategory;
    
    const matchesCategory = activeId === 'All' || activeName === 'All' ||
                            p.categories?.some((cat: any) => 
                              cat.id === activeId || 
                              cat.name === activeName || 
                              cat.slug === activeId
                            ) || p.categoryId === activeId || p.category === activeName;
                            
    return matchesSearch && matchesCategory;
  });

  // Category Filter Debugging Log
  useEffect(() => {
    const activeId = activeCategory?.id || (typeof activeCategory === 'string' ? activeCategory : '');
    const activeName = activeCategory?.name || (typeof activeCategory === 'string' ? activeCategory : '');
    const activeSlug = activeCategory?.slug || '';

    if (activeCategory && activeCategory !== 'All' && activeId !== 'All' && activeName !== 'All') {
      const totalLinkedProducts = productsList.filter(p => 
        p.categories?.some((cat: any) => cat.id === activeId || cat.name === activeName || cat.slug === activeId) || p.categoryId === activeId || p.category === activeName
      );
      console.log(`[NextJS Category Filter Debug Log]:`, {
        selectedCategoryId: activeId,
        selectedCategorySlug: activeSlug || (typeof activeCategory === 'string' ? activeCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
        productsReturnedCount: filteredProducts.length,
        productsReturned: filteredProducts.map(p => p.name),
        totalLinkedProductsCount: totalLinkedProducts.length,
        totalLinkedProducts: totalLinkedProducts.map(p => p.name)
      });
    }
  }, [activeCategory, productsList, filteredProducts]);

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#2F3B0C] selection:bg-[#4E641A] selection:text-white relative overflow-x-hidden font-sans">
      
      {/* SECTION 1 — PREMIUM ECOMMERCE HEADER */}
      <header className="sticky top-0 z-40 bg-[#F9F6F0]/95 backdrop-blur-md border-b border-[#EAE4D8] transition-all duration-300 py-3 md:py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src="https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png" 
              alt="Suryodaya Farms Logo" 
              className="w-12 h-12 md:w-14 md:h-14 object-contain transition duration-500 hover:rotate-6 hover:scale-105"
            />
            <div className="flex flex-col text-left">
              <span className="font-serif text-lg md:text-xl font-bold tracking-widest text-[#2F3B0C] uppercase leading-none">
                {settings.companyName.split(' ')[0]}
              </span>
              <span className="font-sans text-[8px] font-semibold tracking-[0.25em] text-[#C68A2B] uppercase mt-1 leading-none">
                {settings.brandName.split(' ').slice(1).join(' ') || 'Farms & Organics'}
              </span>
            </div>
          </div>

          {/* Clean Ecommerce Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-bold tracking-widest text-[#2F3B0C]/80">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#4E641A] transition relative group py-1">
              HOME
              <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#4E641A] scale-x-100 origin-left transition-transform" />
            </button>
            <button onClick={() => scrollToSection(bestSellersRef)} className="hover:text-[#4E641A] transition relative group py-1">
              SHOP ALL
              <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#4E641A] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </button>
            <button onClick={() => scrollToSection(collectionsRef)} className="hover:text-[#4E641A] transition relative group py-1">
              COLLECTIONS
              <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#4E641A] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </button>
            <button onClick={() => scrollToSection(bestSellersRef)} className="hover:text-[#4E641A] transition relative group py-1">
              BEST SELLERS
              <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#4E641A] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </button>
            <span className="hover:text-[#4E641A] cursor-pointer transition relative group py-1">
              NEW ARRIVALS
              <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#4E641A] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </span>
            <span className="hover:text-[#4E641A] cursor-pointer transition relative group py-1">
              TRACK ORDER
              <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#4E641A] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </span>
            <button onClick={() => scrollToSection(contactRef)} className="hover:text-[#4E641A] transition relative group py-1">
              CONTACT
              <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#4E641A] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </button>
          </nav>

          {/* Right Controls: Profile, Search, Wishlist, Cart Drawer */}
          <div className="flex items-center space-x-2 md:space-x-4">
            
            {/* Search toggler */}
            <div className="relative">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-[#2F3B0C] hover:text-[#4E641A] hover:bg-[#EAE4D8]/30 rounded-full transition cursor-pointer"
                title="Search Products"
              >
                <Search className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-64 md:w-80 bg-white border border-[#EAE4D8] rounded-2xl p-3 shadow-xl z-50 flex items-center gap-2"
                  >
                    <input 
                      type="text" 
                      placeholder="Search organic staple..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#4E641A]"
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-stone-100 rounded-full">
                        <X className="w-3.5 h-3.5 text-stone-400" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile/Login Icon */}
            {isAuthenticated && user ? (
              <a
                href="/profile"
                className="flex items-center space-x-2 bg-[#EAE4D8]/50 hover:bg-[#EAE4D8]/80 px-3.5 py-1.5 rounded-full border border-[#EAE4D8] transition"
              >
                <div className="w-6 h-6 rounded-full bg-[#4E641A]/10 flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5 text-[#4E641A]" />
                </div>
                <span className="text-xs font-bold text-[#2F3B0C] hidden md:inline truncate max-w-[80px]">
                  {user.name || 'Account'}
                </span>
              </a>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="p-2 text-[#2F3B0C] hover:text-[#4E641A] hover:bg-[#EAE4D8]/30 rounded-full transition cursor-pointer"
                title="Sign In"
              >
                <UserIcon className="w-5 h-5" />
              </button>
            )}

            {/* Wishlist Icon */}
            <div className="relative">
              <button 
                onClick={() => scrollToSection(bestSellersRef)}
                className="p-2 text-[#2F3B0C] hover:text-red-700 hover:bg-[#EAE4D8]/30 rounded-full transition cursor-pointer"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[8px] font-bold flex items-center justify-center rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </button>
            </div>

            {/* Cart Icon with badge */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-[#4E641A] text-white hover:bg-[#2F3B0C] rounded-full transition flex items-center justify-center cursor-pointer shadow-md"
              title="Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C68A2B] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-[#F9F6F0] scale-100 animate-pulse">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* SECTION 2 — CATEGORY QUICK ACCESS BAR */}
      {categoriesList.length > 0 && (
        <section 
          className="bg-gradient-to-b from-[#FDFBF7] via-[#FDFBF7] to-[#F5F2EA] border-b border-[#EAE4D8]/80 py-10 md:py-14 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain select-none shadow-[inset_0_-2px_10px_rgba(0,0,0,0.01)]"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-start md:justify-center gap-10 md:gap-16 min-w-max">
            
            {/* "All" categories shortcut */}
            <button 
              onClick={() => setActiveCategory({ id: 'All', name: 'All' })}
              className="flex flex-col items-center gap-4 group transition-all duration-500 ease-out shrink-0 relative"
            >
              <div className={`w-24 h-24 md:w-[108px] md:h-[108px] rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border-2 transition-all duration-500 relative overflow-hidden transform group-hover:-translate-y-2.5 group-hover:shadow-[0_20px_40px_rgba(78,100,26,0.12)] ${
                activeCategory === 'All' || activeCategory?.id === 'All' || activeCategory?.name === 'All'
                  ? 'border-[#4E641A] ring-[6px] ring-[#4E641A]/10 scale-105 shadow-[0_12px_24px_rgba(78,100,26,0.15)] bg-gradient-to-b from-white to-[#FDFBF7]' 
                  : 'border-transparent group-hover:border-[#C68A2B]/40'
              }`}>
                <div className="absolute inset-0 bg-[#4E641A]/5 group-hover:bg-transparent transition-colors duration-500" />
                {/* Glassmorphic border ring */}
                <div className="absolute inset-0.5 rounded-full border border-stone-100 pointer-events-none" />
                <span className="text-3xl md:text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)] transition-transform duration-500 group-hover:scale-115">🌿</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className={`text-xs md:text-sm font-bold tracking-wide transition-all duration-300 uppercase ${(activeCategory === 'All' || activeCategory?.id === 'All' || activeCategory?.name === 'All') ? 'text-[#4E641A] scale-105' : 'text-stone-700 group-hover:text-[#4E641A]'}`}>
                  Shop All
                </span>
                <span className="text-[9px] font-bold tracking-[0.1em] text-[#C68A2B] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Pristine
                </span>
              </div>
            </button>

            {categoriesList.map((cat, i) => {
              const isActive = activeCategory?.id === cat.id || 
                               activeCategory?.name === cat.name || 
                               (typeof activeCategory === 'string' && cat.name === activeCategory);
              return (
                <button 
                  key={i}
                  onClick={() => {
                    setActiveCategory(cat);
                    scrollToSection(bestSellersRef);
                  }}
                  className="flex flex-col items-center gap-4 group transition-all duration-500 ease-out shrink-0 relative"
                >
                  <div className={`w-24 h-24 md:w-[108px] md:h-[108px] rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border-2 transition-all duration-500 relative overflow-hidden transform group-hover:-translate-y-2.5 group-hover:shadow-[0_20px_40px_rgba(78,100,26,0.12)] ${
                    isActive 
                      ? 'border-[#4E641A] ring-[6px] ring-[#4E641A]/10 scale-105 shadow-[0_12px_24px_rgba(78,100,26,0.15)] bg-gradient-to-b from-white to-[#FDFBF7]' 
                      : 'border-transparent group-hover:border-[#C68A2B]/40'
                  }`}>
                    {cat.image ? (
                      <>
                        {/* Organic Warm Tone sepia/orange overlay */}
                        <div className="absolute inset-0 bg-[#C68A2B]/12 mix-blend-multiply opacity-80 group-hover:opacity-0 transition-opacity duration-700 z-10" />
                        <img 
                          src={cat.image} 
                          alt={cat.label} 
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 absolute inset-0"
                        />
                        {/* Glassmorphic border ring */}
                        <div className="absolute inset-0.5 rounded-full border border-white/20 pointer-events-none z-10" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-[#F5F2EA] flex items-center justify-center z-10">
                        <span className="text-3xl md:text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] text-[#4E641A]/50 select-none">🌿</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-xs md:text-sm font-bold tracking-wide transition-all duration-300 uppercase text-center max-w-[130px] line-clamp-1 ${isActive ? 'text-[#4E641A] scale-105' : 'text-stone-700 group-hover:text-[#4E641A]'}`}>
                      {cat.label}
                    </span>
                    <span className="text-[9px] font-bold tracking-[0.1em] text-[#C68A2B] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Direct Farm
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 3 — HERO BANNER (MAIN SELLING SECTION) */}
      <section className="relative overflow-hidden py-12 md:py-24 px-4 md:px-8 border-b border-[#EAE4D8] bg-gradient-to-b from-[#F9F6F0] via-[#F6F3ED] to-[#EAE4D8]/20">
        
        {/* Soft floating blurred ambient blobs */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#4E641A]/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 w-80 h-80 bg-[#C68A2B]/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 text-left">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Organic star rating trust pills */}
            <div className="inline-flex items-center space-x-2 bg-white border border-[#EAE4D8] px-3 py-1.5 rounded-full shadow-sm">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
                Loved by 12,000+ Indian Families (4.9★)
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#2F3B0C] leading-[1.1] max-w-2xl">
              Pristine Vedic Staples <br />
              <span className="text-[#C68A2B] italic font-normal font-serif">Hand-Extracted</span> For Your Wellness
            </h1>

            <p className="text-sm md:text-base text-stone-600 max-w-xl leading-relaxed">
              We preserve heirloom seeds, practice strictly chemical-free cultivation in Wardha, and slowly process harvests under 35°C to preserve deep mineral enzymes, natural flavor, and life force.
            </p>

            {/* Core D2C Trust Checklist */}
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-[#2F3B0C]/80 pt-2 max-w-md">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#4E641A]" />
                <span>Chemical-Free Soil</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#4E641A]" />
                <span>Vedic Bilona Churned</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#4E641A]" />
                <span>Wood Pressed Ghanis</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#4E641A]" />
                <span>No Added Preservatives</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => scrollToSection(bestSellersRef)}
                className="group px-8 py-4 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition duration-300 flex items-center space-x-3.5 shadow-lg cursor-pointer"
              >
                <span>Shop Fresh Staples</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
              <button 
                onClick={() => scrollToSection(collectionsRef)}
                className="px-8 py-4 bg-white hover:bg-stone-50 text-[#4E641A] border border-[#EAE4D8] text-xs font-bold uppercase tracking-widest rounded-xl transition duration-300 shadow-sm cursor-pointer"
              >
                Explore Collections
              </button>
            </div>

            {/* Micro-offer banner */}
            <div className="pt-4 flex items-center space-x-2 text-xxs font-bold uppercase tracking-wider text-[#C68A2B]">
              <BadgePercent className="w-4 h-4" />
              <span>Use Code: SURYODAYA10 to get 10% Extra Soil Credits on first purchase</span>
            </div>

          </div>

          {/* Right Product Collage Column */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center">
            <div className="relative w-80 h-96 sm:w-96 sm:h-[420px] rounded-[36px] overflow-hidden border border-[#EAE4D8] shadow-2xl bg-white p-4">
              
              {/* Product background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#F6F3ED] via-[#F9F6F0] to-[#EAE4D8]/20 z-0" />
              
              {/* Main promotional crop visual */}
              <img 
                src="https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800" 
                alt="A2 Gir Cow Ghee Promotional Staple" 
                className="w-full h-2/3 object-cover rounded-[28px] border border-stone-100 z-10 relative shadow"
              />

              <div className="p-4 relative z-10 space-y-2 mt-4 text-left">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#C68A2B] bg-[#C68A2B]/10 px-2 py-0.5 rounded-full inline-block">
                  Harvest Star of the Month
                </span>
                <h3 className="font-serif text-lg font-bold text-[#2F3B0C]">
                  A2 Gir Cow Desi Ghee (Bilona Method)
                </h3>
                <div className="flex justify-between items-center pt-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-base font-bold text-[#4E641A]">₹950</span>
                    <span className="text-xs line-through text-stone-400">₹1100</span>
                  </div>
                  <button 
                    onClick={() => {
                      const gheeProduct = productsList.find(p => p.id.includes('ghee') || p.name.includes('Ghee')) || productsList[0];
                      if (gheeProduct) addToCart(gheeProduct);
                    }}
                    className="px-4 py-2 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition shadow-sm cursor-pointer"
                  >
                    Quick Add
                  </button>
                </div>
              </div>

              {/* absolute badge badge */}
              <div className="absolute top-8 right-8 bg-[#C68A2B] text-white text-xs font-extrabold uppercase py-2 px-3.5 rounded-full shadow-lg z-20 flex flex-col items-center leading-none">
                <span>15%</span>
                <span className="text-[8px] tracking-wide mt-0.5">OFF</span>
              </div>

            </div>

            {/* Overlap background design ring elements */}
            <div className="absolute -bottom-6 -left-6 bg-white/80 border border-[#EAE4D8] rounded-2xl p-4 shadow-lg hidden sm:flex items-center space-x-3.5 z-20">
              <div className="w-9 h-9 rounded-full bg-[#4E641A]/10 text-[#4E641A] flex items-center justify-center font-bold">
                🌾
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold">100% Heirloom</span>
                <span className="block text-[9px] text-stone-500 uppercase tracking-wider font-semibold">Non-Hybrid seeds</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 4 — BEST SELLERS */}
      <section ref={bestSellersRef} className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-b border-[#EAE4D8]">
        
        {/* Section Header */}
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
          {[{ id: 'All', name: 'All' }, ...categoriesList].map((cat) => {
            const isActive = (activeCategory === 'All' && cat.id === 'All') ||
                             activeCategory?.id === cat.id ||
                             activeCategory?.name === cat.name ||
                             (typeof activeCategory === 'string' && cat.name === activeCategory);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-[#4E641A] text-white border-transparent shadow'
                    : 'bg-white hover:bg-stone-50 text-stone-600 border-[#EAE4D8]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-16 flex flex-col items-center justify-center gap-2">
            <Sprout className="w-12 h-12 text-[#4E641A] mx-auto mb-2 animate-spin" />
            <span className="text-xs font-semibold text-stone-500">Loading dynamic products...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#EAE4D8] rounded-[28px]">
            <Sprout className="w-12 h-12 text-stone-300 mx-auto mb-2 animate-bounce" />
            <p className="text-sm font-semibold text-stone-500">No staples found in this category.</p>
            <button onClick={() => { setActiveCategory({ id: 'All', name: 'All' }); setSearchQuery(''); }} className="mt-2 text-xs font-bold text-[#4E641A] underline">Reset Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col justify-between"
              >
                {/* Visual Area */}
                <div className="relative h-64 overflow-hidden bg-stone-50 shrink-0">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Category Tag overlay */}
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#2F3B0C] text-[9px] font-bold uppercase py-1 px-2.5 rounded-full border border-stone-200 shadow-sm">
                    {product.tag}
                  </span>

                  {/* Add to Wishlist Circle button */}
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-4 right-4 w-9 h-9 bg-white hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-full flex items-center justify-center shadow-md border border-stone-150 transition cursor-pointer"
                    title="Add to Wishlist"
                  >
                    <Heart className={`w-4.5 h-4.5 ${wishlist.includes(product.id) ? 'fill-red-600 text-red-600' : 'text-stone-400'}`} />
                  </button>

                  {/* Discount percentage indicator */}
                  {product.originalPrice > product.price && (
                    <span className="absolute bottom-4 left-4 bg-[#C68A2B] text-white text-[10px] font-extrabold uppercase py-1 px-2.5 rounded-lg shadow-md leading-none">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>

                {/* Body details */}
                <div className="p-6 text-left flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    
                    {/* Star review ratings */}
                    <div className="flex items-center space-x-1.5">
                      <div className="flex text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <span className="text-xxs font-bold text-stone-700">
                        {product.rating} <span className="text-stone-400 font-medium">({product.reviewsCount} verified)</span>
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#2F3B0C] group-hover:text-[#4E641A] transition leading-tight">
                      {product.name}
                    </h3>

                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Pricing and Action triggers */}
                  <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                    <div className="flex flex-col text-left">
                      <span className="text-xxs font-semibold text-stone-400 uppercase tracking-wide">{product.weight}</span>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-base font-bold text-[#4E641A]">₹{product.price}</span>
                        <span className="text-xs line-through text-stone-400 font-medium">₹{product.originalPrice}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => addToCart(product)}
                      className="px-5 py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center space-x-2 shadow-sm cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Basket</span>
                    </button>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>
        )}

      </section>

      {/* SECTION 5 — TRUST INDICATORS */}
      <section className="bg-[#2F3B0C] text-[#F9F6F0] py-16 px-4 md:px-8 relative overflow-hidden">
        
        {/* Geometric aesthetic lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#4E641A_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-15" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C68A2B]">
              The Suryodaya Standard
            </span>
            <h2 className="font-serif text-2xl md:text-4xl font-semibold leading-tight">
              Purity Certified at Every Step of the Soil
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 text-center">
            
            {/* Badge 1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:bg-white/10 transition duration-300 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#C68A2B]/20 text-[#C68A2B] flex items-center justify-center mx-auto text-xl shadow-inner shrink-0">
                🌱
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider">100% Natural</h4>
                <p className="text-[10px] text-[#F9F6F0]/70 leading-relaxed font-light">
                  Strictly pure seeds, grains, and dairy with zero chemical modifications or artificial fillers.
                </p>
              </div>
            </div>

            {/* Badge 2 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:bg-white/10 transition duration-300 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#C68A2B]/20 text-[#C68A2B] flex items-center justify-center mx-auto text-xl shadow-inner shrink-0">
                🚫
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider">No Preservatives</h4>
                <p className="text-[10px] text-[#F9F6F0]/70 leading-relaxed font-light">
                  Absolutely no artificial shelf-enhancers, synthetic color stabilizers, or chemical additives.
                </p>
              </div>
            </div>

            {/* Badge 3 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:bg-white/10 transition duration-300 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#C68A2B]/20 text-[#C68A2B] flex items-center justify-center mx-auto text-xl shadow-inner shrink-0">
                🧼
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider">Hygienically Processed</h4>
                <p className="text-[10px] text-[#F9F6F0]/70 leading-relaxed font-light">
                  Prepared in strictly ISO-standard clean environments with pristine dust-free machinery.
                </p>
              </div>
            </div>

            {/* Badge 4 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:bg-white/10 transition duration-300 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#C68A2B]/20 text-[#C68A2B] flex items-center justify-center mx-auto text-xl shadow-inner shrink-0">
                🏡
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider">Farm-to-Consumer</h4>
                <p className="text-[10px] text-[#F9F6F0]/70 leading-relaxed font-light">
                  Direct supply chains from our Wardha Organic Cluster to your doorstep, bypassing warehouses.
                </p>
              </div>
            </div>

            {/* Badge 5 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:bg-white/10 transition duration-300 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#C68A2B]/20 text-[#C68A2B] flex items-center justify-center mx-auto text-xl shadow-inner shrink-0">
                🔬
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider">Scientifically Guided</h4>
                <p className="text-[10px] text-[#F9F6F0]/70 leading-relaxed font-light">
                  Advanced plant physiology combined with traditional Vedic agricultural sciences.
                </p>
              </div>
            </div>

            {/* Badge 6 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:bg-white/10 transition duration-300 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#C68A2B]/20 text-[#C68A2B] flex items-center justify-center mx-auto text-xl shadow-inner shrink-0">
                🇮🇳
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider">Made in India</h4>
                <p className="text-[10px] text-[#F9F6F0]/70 leading-relaxed font-light">
                  Proudly grown and slowly processed in the fertile soils of Maharashtra.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 6 — FEATURED COLLECTIONS */}
      <section ref={collectionsRef} className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-b border-[#EAE4D8]">
        
        {/* Title details */}
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
            onClick={() => { setActiveCategory({ id: 'All', name: 'All' }); scrollToSection(bestSellersRef); }}
            className="group inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#4E641A] hover:text-[#2F3B0C] transition cursor-pointer"
          >
            <span>Explore All Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Cinematic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1 */}
          <div className="group relative h-[380px] rounded-[32px] overflow-hidden border border-[#EAE4D8] shadow-sm cursor-pointer" onClick={() => { selectCategoryByName('Cold Pressed Oils'); scrollToSection(bestSellersRef); }}>
            <img 
              src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800" 
              alt="Wood Pressed Oils Category Banner" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2F3B0C] via-[#2F3B0C]/40 to-transparent transition-opacity" />
            
            <div className="absolute bottom-8 left-8 right-8 text-left text-white space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C68A2B] bg-[#C68A2B]/20 border border-[#C68A2B]/30 px-3 py-1 rounded-full inline-block">
                Wood Ghanis
              </span>
              <h3 className="font-serif text-2xl md:text-3xl font-semibold">
                Pure Wood Pressed Oils
              </h3>
              <p className="text-xs text-[#F9F6F0]/85 max-w-md leading-relaxed font-light">
                Extracted under low heat using slow mechanical Vagai wood press logs. Zero refinement chemicals or bleaching agents.
              </p>
              <span className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#C68A2B] group-hover:underline pt-2">
                <span>Browse Oils Collection</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative h-[380px] rounded-[32px] overflow-hidden border border-[#EAE4D8] shadow-sm cursor-pointer" onClick={() => { selectCategoryByName('A2 Ghee'); scrollToSection(bestSellersRef); }}>
            <img 
              src="https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800" 
              alt="Village Ghee Banner" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2F3B0C] via-[#2F3B0C]/40 to-transparent transition-opacity" />
            
            <div className="absolute bottom-8 left-8 right-8 text-left text-white space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C68A2B] bg-[#C68A2B]/20 border border-[#C68A2B]/30 px-3 py-1 rounded-full inline-block">
                Curd Churned Bilona
              </span>
              <h3 className="font-serif text-2xl md:text-3xl font-semibold">
                Traditional Village Ghee
              </h3>
              <p className="text-xs text-[#F9F6F0]/85 max-w-md leading-relaxed font-light">
                Slowly melted over firewood logs from organic hand-churned butter of grass-fed desi Gir Cows.
              </p>
              <span className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#C68A2B] group-hover:underline pt-2">
                <span>Browse Ghee Collection</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative h-[380px] rounded-[32px] overflow-hidden border border-[#EAE4D8] shadow-sm cursor-pointer" onClick={() => { selectCategoryByName('Organic Grains'); scrollToSection(bestSellersRef); }}>
            <img 
              src="https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=800" 
              alt="Ancient Grains Banner" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2F3B0C] via-[#2F3B0C]/40 to-transparent transition-opacity" />
            
            <div className="absolute bottom-8 left-8 right-8 text-left text-white space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C68A2B] bg-[#C68A2B]/20 border border-[#C68A2B]/30 px-3 py-1 rounded-full inline-block">
                Ancient Heritage
              </span>
              <h3 className="font-serif text-2xl md:text-3xl font-semibold">
                Native Rice & Wheat
              </h3>
              <p className="text-xs text-[#F9F6F0]/85 max-w-md leading-relaxed font-light">
                Cultivated with ancient non-hybrid heirloom seeds, keeping vitamins, soluble fiber, and proteins pure.
              </p>
              <span className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#C68A2B] group-hover:underline pt-2">
                <span>Browse Staple Grains</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="group relative h-[380px] rounded-[32px] overflow-hidden border border-[#EAE4D8] shadow-sm cursor-pointer" onClick={() => { selectCategoryByName('Pickles'); scrollToSection(bestSellersRef); }}>
            <img 
              src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=800" 
              alt="Traditional Pickles Banner" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2F3B0C] via-[#2F3B0C]/40 to-transparent transition-opacity" />
            
            <div className="absolute bottom-8 left-8 right-8 text-left text-white space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C68A2B] bg-[#C68A2B]/20 border border-[#C68A2B]/30 px-3 py-1 rounded-full inline-block">
                Homestead Recipe
              </span>
              <h3 className="font-serif text-2xl md:text-3xl font-semibold">
                Traditional Pickles
              </h3>
              <p className="text-xs text-[#F9F6F0]/85 max-w-md leading-relaxed font-light">
                Sun-matured and pickled in cold-pressed mustard oil with organic spices and zero acid preservatives.
              </p>
              <span className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#C68A2B] group-hover:underline pt-2">
                <span>Browse Pickles Collection</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

        </div>

      </section>

      {/* SECTION 7 — SHOP BY BENEFIT */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-b border-[#EAE4D8] bg-[#FDFBF7]/30">
        
        {/* Section Title */}
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

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
          
          {/* Card 1 */}
          <div 
            onClick={() => { selectCategoryByName('Cold Pressed Oils'); scrollToSection(bestSellersRef); }}
            className="bg-white border border-[#EAE4D8] hover:border-[#4E641A] rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300 group cursor-pointer"
          >
            <span className="text-2xl mb-4 block">❤️</span>
            <h4 className="font-serif text-base font-bold text-[#2F3B0C] group-hover:text-[#4E641A]">Heart Healthy</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-light mt-1.5">
              Unsaturated fatty acids from pure cold-pressed wooden-mill oils.
            </p>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => { selectCategoryByName('Organic Grains'); scrollToSection(bestSellersRef); }}
            className="bg-white border border-[#EAE4D8] hover:border-[#4E641A] rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300 group cursor-pointer"
          >
            <span className="text-2xl mb-4 block">🌾</span>
            <h4 className="font-serif text-base font-bold text-[#2F3B0C] group-hover:text-[#4E641A]">Diabetic Friendly</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-light mt-1.5">
              Low glycemic index heirloom grains, rich in natural fibers and minerals.
            </p>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => { selectCategoryByName('Ancient Millets'); scrollToSection(bestSellersRef); }}
            className="bg-white border border-[#EAE4D8] hover:border-[#4E641A] rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300 group cursor-pointer"
          >
            <span className="text-2xl mb-4 block">💪</span>
            <h4 className="font-serif text-base font-bold text-[#2F3B0C] group-hover:text-[#4E641A]">Protein Rich</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-light mt-1.5">
              Unpolished ancient seeds and indigenous farm pulses packed with bio-proteins.
            </p>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => { selectCategoryByName('A2 Ghee'); scrollToSection(bestSellersRef); }}
            className="bg-white border border-[#EAE4D8] hover:border-[#4E641A] rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300 group cursor-pointer"
          >
            <span className="text-2xl mb-4 block">👧</span>
            <h4 className="font-serif text-base font-bold text-[#2F3B0C] group-hover:text-[#4E641A]">Kids Nutrition</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-light mt-1.5">
              Bilona ghee and sprouted multigrain porridge formulas for growing bones and brains.
            </p>
          </div>

          {/* Card 5 */}
          <div 
            onClick={() => { selectCategoryByName('Raw Honey & Sweeteners'); scrollToSection(bestSellersRef); }}
            className="bg-white border border-[#EAE4D8] hover:border-[#4E641A] rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300 group cursor-pointer"
          >
            <span className="text-2xl mb-4 block">🧘</span>
            <h4 className="font-serif text-base font-bold text-[#2F3B0C] group-hover:text-[#4E641A]">Traditional Wellness</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-light mt-1.5">
              Raw honeys and forest medicinal herbs that nurture core Agni and immune shield.
            </p>
          </div>

        </div>

      </section>

      {/* SECTION 8 — CUSTOMER REVIEWS */}
      <section className="py-20 px-4 md:px-8 bg-[#F3EFE6]/40 border-b border-[#EAE4D8]">
        <div className="max-w-7xl mx-auto">
          
          {/* Section details */}
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

          {/* Reviews list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((review) => (
              <div 
                key={review.id}
                className="bg-white border border-stone-200 rounded-[28px] p-8 shadow-sm flex flex-col justify-between text-left space-y-6"
              >
                {/* Header detail */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-1 text-amber-500">
                      {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1 shrink-0">
                      <span>✓ Verified Purchase</span>
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-light italic">
                    "{review.review}"
                  </p>
                </div>

                {/* Customer footer */}
                <div className="flex items-center space-x-3.5 pt-4 border-t border-stone-100 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#4E641A]/10 border border-[#EAE4D8] flex items-center justify-center font-bold text-[#4E641A] font-serif shrink-0">
                    {review.avatar}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-[#2F3B0C]">{review.name}</span>
                    <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">{review.role} • {review.location}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 9 — FOOTER */}
      <footer ref={contactRef} className="bg-[#2F3B0C] text-[#F9F6F0] pt-16 pb-8 px-4 md:px-8 border-t border-[#4E641A]/20 relative overflow-hidden">
        
        {/* Soft lighting visual overlay */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#4E641A]/20 rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 relative z-10 text-left border-b border-white/10 pb-12 mb-8">
          
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png" 
                alt="Suryodaya Farms Logo" 
                className="w-10 h-10 object-contain bg-white/10 p-1.5 rounded-xl border border-white/20"
              />
              <span className="font-serif text-lg font-bold tracking-widest text-[#F9F6F0] uppercase">
                {settings.companyName.split(' ')[0]}
              </span>
            </div>
            <p className="text-xxs text-[#F9F6F0]/70 leading-relaxed font-light">
              Restoring traditional crop ecosystems, supporting dryland farmers, and serving premium unrefined Vedic staples. We believe that soil health is direct human health.
            </p>
            <div className="space-y-1 text-xxs font-semibold text-stone-300">
              <p>🏡 Address: {settings.address}</p>
              <p>📞 Phone support: {settings.phone}</p>
              <p>✉️ Email support: {settings.email}</p>
            </div>
          </div>

          {/* Quick Links Col */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#C68A2B]">Staples Shop</h4>
            <ul className="space-y-2 text-xxs font-medium text-[#F9F6F0]/70">
              <li><button onClick={() => { selectCategoryByName('Cold Pressed Oils'); scrollToSection(bestSellersRef); }} className="hover:text-white transition">Cold Pressed Oils</button></li>
              <li><button onClick={() => { selectCategoryByName('A2 Ghee'); scrollToSection(bestSellersRef); }} className="hover:text-white transition">A2 Cow Ghee</button></li>
              <li><button onClick={() => { selectCategoryByName('Organic Grains'); scrollToSection(bestSellersRef); }} className="hover:text-white transition">Ancient Wheat & Rice</button></li>
              <li><button onClick={() => { selectCategoryByName('Ancient Millets'); scrollToSection(bestSellersRef); }} className="hover:text-white transition">Sprouted Millets</button></li>
              <li><button onClick={() => { selectCategoryByName('Raw Honey & Sweeteners'); scrollToSection(bestSellersRef); }} className="hover:text-white transition">New Organic Launches</button></li>
            </ul>
          </div>

          {/* Company Links Col */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#C68A2B]">Policies & Help</h4>
            <ul className="space-y-2 text-xxs font-medium text-[#F9F6F0]/70">
              <li className="hover:text-white cursor-pointer transition">Organic Certifications</li>
              <li className="hover:text-white cursor-pointer transition">Shipping Direct Rates</li>
              <li className="hover:text-white cursor-pointer transition">Returns & Replacements</li>
              <li className="hover:text-white cursor-pointer transition">Track Your Order</li>
              <li className="hover:text-white cursor-pointer transition">Privacy Policy</li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#C68A2B]">The Soil Chronicles</h4>
            <p className="text-xxs text-[#F9F6F0]/70 leading-relaxed font-light">
              Receive updates on seasonal harvest cycles, Vedic recipe tutorials, and exclusive farmer cooperative campaigns.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xxs w-full text-white placeholder-white/30 focus:outline-none focus:border-[#C68A2B]"
              />
              <button className="px-4 py-2 bg-[#C68A2B] hover:bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shrink-0">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        {/* Copy details */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-semibold text-stone-400">
          <div>
            <p>© 2026 {settings.companyName.toUpperCase()} PRIVATE LIMITED. All Organic Staple Rights Reserved.</p>
            <p className="text-xxs text-stone-500 font-light mt-0.5">{settings.registrationDetails}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span>🛡️ SSL Secured</span>
            <span>•</span>
            <span>💳 UPI / Card Verified</span>
            <span>•</span>
            <span>🔒 Data Encrypted</span>
          </div>
        </div>

      </footer>

      {/* DYNAMIC COMPONENT — SLIDING CART DRAWER (PORTAL BACKDROP) */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-50 bg-[#2F3B0C]/40 backdrop-blur-sm"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#F9F6F0] z-50 shadow-2xl border-l border-[#EAE4D8] flex flex-col justify-between py-6 px-6"
            >
              
              {/* Drawer Content */}
              <div className="flex flex-col h-full overflow-hidden text-left">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#EAE4D8] pb-4 shrink-0">
                  <h3 className="font-serif text-lg font-bold text-[#2F3B0C] flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5 text-[#4E641A]" />
                    <span>Your Shopping Basket</span>
                  </h3>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 hover:bg-[#EAE4D8]/50 rounded-full transition cursor-pointer text-[#2F3B0C]"
                    title="Close Drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body Area */}
                <div className="flex-grow overflow-y-auto py-4 space-y-4 no-scrollbar">
                  
                  {checkoutComplete ? (
                    <div className="space-y-6 py-8 text-center max-w-xs mx-auto">
                      <div className="w-14 h-14 bg-green-500/10 text-green-700 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 animate-bounce" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-serif text-xl font-bold text-[#2F3B0C]">Staples Confirmed!</h4>
                        <p className="text-xs text-stone-500 leading-relaxed font-light">
                          Your biological harvest is queued for logistics extraction. Receipts has been processed and saved under your credentials.
                        </p>
                      </div>

                      <div className="bg-[#F3EFE6] border border-[#EAE4D8] rounded-xl p-4 text-left space-y-2 font-semibold text-xxs text-stone-600">
                        <div className="flex justify-between">
                          <span>Order Reference</span>
                          <span className="font-mono text-stone-850 font-bold">{orderNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dispatch Logistics</span>
                          <span className="text-[#4E641A]">Direct Wardha Cold Transport</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Est. Doorbell Delivery</span>
                          <span className="text-stone-850">Tomorrow, before 11:30 AM</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setCheckoutComplete(false);
                          setCart([
                            { id: 'a2-ghee', name: 'A2 Gir Cow Desi Ghee', price: 950, weight: '500 ml', quantity: 1, image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=600' }
                          ]);
                        }}
                        className="w-full py-3 bg-[#4E641A] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#2F3B0C] transition cursor-pointer"
                      >
                        Shop More Harvests
                      </button>
                    </div>
                  ) : cart.length === 0 ? (
                    <div className="py-16 text-center space-y-4">
                      <ShoppingBag className="w-12 h-12 text-[#EAE4D8] mx-auto" />
                      <p className="text-xs font-semibold text-stone-500">Your basket is empty of soil blessings.</p>
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          scrollToSection(bestSellersRef);
                        }}
                        className="px-6 py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm"
                      >
                        Shop Best Sellers
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-150">
                      {cart.map((item) => (
                        <div key={item.id} className="py-4 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                          
                          {/* Image Staple */}
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-14 h-14 object-cover rounded-xl border border-stone-200 bg-stone-50 shrink-0"
                          />

                          {/* Info */}
                          <div className="flex-grow min-w-0 text-left">
                            <h4 className="font-serif text-xs font-bold text-[#2F3B0C] truncate leading-tight">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-stone-400 font-medium mt-0.5">{item.weight}</p>
                            <span className="text-xs font-bold text-[#4E641A] md:hidden block mt-1">₹{item.price}</span>
                          </div>

                          {/* Increments */}
                          <div className="flex items-center space-x-2 shrink-0">
                            <div className="flex items-center bg-white border border-[#EAE4D8] rounded-lg overflow-hidden scale-90">
                              <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-1 hover:bg-stone-50 text-stone-500 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-bold text-stone-700">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-1 hover:bg-stone-50 text-stone-500 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-xs font-bold text-[#2F3B0C] hidden md:inline min-w-[50px] text-right">
                              ₹{item.price * item.quantity}
                            </span>

                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-stone-300 hover:text-red-600 p-1 rounded transition cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                  {/* Delivery Location card */}
                  {!checkoutComplete && cart.length > 0 && (
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-start space-x-2.5 text-left shrink-0">
                      <MapPin className="w-4 h-4 text-[#4E641A] shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-bold text-[#2F3B0C] uppercase tracking-wider">Direct Dispatch Hub Address</span>
                        <p className="text-[10px] text-stone-500 leading-normal font-light">
                          Suryodaya Organic Farms Hub, Sector 15-A, Gurugram, Haryana, 122001
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                {/* Subtotal Receipt Area */}
                {!checkoutComplete && cart.length > 0 && (
                  <div className="border-t border-[#EAE4D8] pt-4 space-y-4 shrink-0">
                    <div className="space-y-2 text-xxs font-semibold text-stone-500">
                      <div className="flex justify-between">
                        <span>Harvest Subtotal</span>
                        <span className="text-stone-850 font-bold">₹{calculateSubtotal()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nature Preservations Tax (5% GST)</span>
                        <span className="text-stone-850">₹{Math.round(calculateSubtotal() * taxRate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Logistics Transport Fee</span>
                        <span className="text-green-700 font-extrabold uppercase">FREE</span>
                      </div>
                      <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-xs font-serif font-bold text-[#2F3B0C]">
                        <span>Total Investment</span>
                        <span className="text-sm text-[#4E641A] font-sans font-bold">₹{Math.round(calculateTotal())}</span>
                      </div>
                    </div>

                    {/* Checkout Button CTA */}
                    <div className="space-y-2">
                      
                      {!isAuthenticated && (
                        <div className="p-2 bg-[#C68A2B]/5 rounded-xl border border-[#C68A2B]/10 flex items-start space-x-2 text-left">
                          <Lock className="w-3.5 h-3.5 text-[#C68A2B] shrink-0 mt-0.5" />
                          <p className="text-[9px] text-[#C68A2B] leading-snug font-medium">
                            Please authenticate using email verification before placing secure orders.
                          </p>
                        </div>
                      )}

                      <button
                        onClick={handleCheckoutTrigger}
                        disabled={isProcessingCheckout}
                        className="w-full py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center justify-center space-x-2.5 shadow-md cursor-pointer disabled:bg-stone-300 disabled:cursor-not-allowed"
                      >
                        {isProcessingCheckout ? (
                          <div className="flex items-center space-x-2">
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span>Encrypting Order...</span>
                          </div>
                        ) : (
                          <>
                            <ShieldCheck className="w-4.5 h-4.5 text-[#C68A2B]" />
                            <span>Confirm Order (Simulated Checkout)</span>
                          </>
                        )}
                      </button>

                      <div className="flex justify-center items-center space-x-1.5 text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                        <span>💳 VISA</span>
                        <span>•</span>
                        <span>💵 COD</span>
                        <span>•</span>
                        <span>⚡ RAZORPAY</span>
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
