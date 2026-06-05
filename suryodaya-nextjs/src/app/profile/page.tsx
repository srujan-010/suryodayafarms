'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useModalStore } from '@/store/useModalStore';
import { 
  User as UserIcon, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Bell, 
  Tag, 
  History, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  Truck,
  Download,
  RotateCcw,
  Sliders,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Smartphone,
  BookOpen,
  Mail,
  Lock,
  Award,
  Compass,
  CreditCard,
  Gift,
  Clock,
  Star,
  Package,
  Shield,
  Sprout
} from 'lucide-react';

const getDeliveryStep = (status?: string) => {
  const normalized = (status || '').toUpperCase().trim();
  switch (normalized) {
    case 'PENDING':
    case 'PLACED':
      return 0;
    case 'CONFIRMED':
      return 1;
    case 'PROCESSING':
    case 'PREPARED':
      return 2;
    case 'SHIPPED':
    case 'IN TRANSIT':
    case 'IN_TRANSIT':
    case 'TRANSIT':
      return 3;
    case 'DELIVERED':
      return 4;
    default:
      return 0;
  }
};

interface Address {
  id: string;
  title: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  weight: string;
  emoji: string;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  estimatedDelivery: string;
  deliveryStep: number; // Stepper step: 0 to 4
  items: OrderItem[];
  shippingAddress: {
    recipientName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

// ----------------------------------------------------------------------
// Premium Organic Crop Products Dataset for Carousels
// ----------------------------------------------------------------------
const seasonalHarvests = [
  { id: 'sh1', name: 'Alphonso Mangoes (Devgad)', price: 850, weight: '6 units', emoji: '🥭', rating: 4.9, imageColor: 'from-[#FFB03A]/20 to-[#EAE4D8]/30', tag: 'Fresh Harvest' },
  { id: 'sh2', name: 'Fresh Organic Moringa Pods', price: 120, weight: '500 g', emoji: '🌿', rating: 4.7, imageColor: 'from-[#4E641A]/20 to-[#EAE4D8]/20', tag: 'Native Crop' },
  { id: 'sh3', name: 'Red Amaranth Greens', price: 60, weight: '250 g', emoji: '🌱', rating: 4.8, imageColor: 'from-[#A13A4F]/20 to-[#EAE4D8]/20', tag: 'Direct Farm' },
  { id: 'sh4', name: 'Heirloom Cherry Tomatoes', price: 95, weight: '250 g', emoji: '🍅', rating: 4.6, imageColor: 'from-[#E34A3A]/20 to-[#EAE4D8]/20', tag: 'Hydroponic' }
];

const recommendedProducts = [
  { id: 'rp1', name: 'A2 Gir Cow Desi Ghee', price: 950, weight: '500 ml', emoji: '🧈', rating: 4.9, imageColor: 'from-[#C68A2B]/20 to-[#EAE4D8]', tag: 'Superfood' },
  { id: 'rp2', name: 'Raw Himalayan Wild Forest Honey', price: 450, weight: '250 g', emoji: '🍯', rating: 4.8, imageColor: 'from-[#EAE4D8] to-[#C68A2B]/10', tag: 'Pure Nectar' },
  { id: 'rp3', name: 'Wood Pressed Coconut Oil', price: 340, weight: '500 ml', emoji: '🥥', rating: 4.9, imageColor: 'from-[#C68A2B]/10 to-[#EAE4D8]/40', tag: 'Cold Pressed' },
  { id: 'rp4', name: 'Aromatic Long Grain Basmati Rice', price: 180, weight: '1 kg', emoji: '🌾', rating: 4.7, imageColor: 'from-[#4E641A]/10 to-[#EAE4D8]/30', tag: 'Aromatic Grain' }
];

const organicEssentials = [
  { id: 'oe1', name: 'Cold Pressed Yellow Mustard Oil', price: 290, weight: '1 Litre', emoji: '🌱', rating: 4.9, imageColor: 'from-[#E3BC3A]/20 to-[#EAE4D8]/30', tag: 'Daily Essential' },
  { id: 'oe2', name: 'Stone Ground Khapli Wheat Flour', price: 145, weight: '1 kg', emoji: '🌾', rating: 4.8, imageColor: 'from-[#C68A2B]/10 to-[#EAE4D8]/30', tag: 'Low Gluten' },
  { id: 'oe3', name: 'Sprouted Ragi Malt Powder', price: 130, weight: '500 g', emoji: '🥣', rating: 4.7, imageColor: 'from-[#8B5A2B]/20 to-[#EAE4D8]/30', tag: 'Nutritious' }
];

export default function ProfileDashboard() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    setAuthModalOpen, 
    setCheckoutResumeRedirect, 
    logout, 
    checkSession 
  } = useAuthStore();
  const modal = useModalStore();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

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

  // Addresses, Orders & Mock Data States
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const [notifications, setNotifications] = useState([
    { id: '1', title: 'A2 Cow Ghee Dispatch Restocked!', message: 'Our freshly churned batch of A2 Desi Cow Ghee has completed quality logs and is back in the market.', date: 'Today, 2:40 PM', unread: true },
    { id: '2', title: 'Delivery In Transit', message: 'Order reference SURYODAYA-982461 has left our Gurugram organic hub and is arriving tomorrow morning.', date: 'Yesterday', unread: true },
    { id: '3', title: 'Welcome to Suryodaya Gold Membership', message: 'Namaste! You have successfully been enrolled in our Gold Sprout tier. Enjoy exclusive native vouchers, early harvest access, and direct support.', date: 'May 24, 2026', unread: false }
  ]);

  const [coupons, setCoupons] = useState([
    { code: 'SOILFIRST15', discount: '15% OFF', desc: 'Valid on unrefined wood-pressed oils & basmati staples.', minOrder: 'Min Order: ₹1,500', copied: false },
    { code: 'SUNRISE20', discount: '₹200 FLAT', desc: 'Valid across our entire restorative harvest items.', minOrder: 'Min Order: ₹2,000', copied: false },
    { code: 'LOYALSPROUT', discount: 'FREE DELIVERY', desc: 'Exclusive gold membership free logistics log tier coupon.', minOrder: 'Min Order: No limit', copied: false }
  ]);

  const [wishlist, setWishlist] = useState([
    { id: 'w1', name: 'A2 Gir Cow Desi Ghee', price: 950, weight: '500 ml', emoji: '🧈', rating: 4.9, imageColor: 'from-[#C68A2B]/20 to-[#EAE4D8]' },
    { id: 'w2', name: 'Raw Himalayan Wild Forest Honey', price: 450, weight: '250 g', emoji: '🍯', rating: 4.8, imageColor: 'from-[#EAE4D8] to-[#C68A2B]/10' }
  ]);

  const [recentlyViewed, setRecentlyViewed] = useState([
    { id: 'r1', name: 'Cold Pressed Yellow Mustard Oil', price: 290, weight: '1 Litre', emoji: '🌱', imageColor: 'from-[#4E641A]/10 to-[#EAE4D8]' },
    { id: 'r2', name: 'Organic Basmati Rice (Aromatic Long Grain)', price: 180, weight: '1 kg', emoji: '🌾', imageColor: 'from-[#EAE4D8] to-[#4E641A]/5' },
    { id: 'r3', name: 'Unrefined Wood Pressed Coconut Oil', price: 340, weight: '500 ml', emoji: '🥥', imageColor: 'from-[#C68A2B]/10 to-[#EAE4D8]' }
  ]);

  // Fallback defaults to ensure no empty states
  const defaultMockAddress: Address = {
    id: 'mock-addr-1',
    title: 'Home Coordinates',
    recipientName: user?.name || 'Gold Member',
    phone: '+91 99999 88888',
    street: 'Villa 14, Sunrise Greens, Sector 54',
    city: 'Gurugram',
    state: 'Haryana',
    postalCode: '122002',
    country: 'India',
    isDefault: true
  };

  const defaultMockOrder: Order = {
    id: 'mock-order-1',
    orderNumber: 'SURYODAYA-982461',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'IN TRANSIT',
    paymentStatus: 'COMPLETED',
    paymentMethod: 'RAZORPAY',
    totalAmount: 1540,
    estimatedDelivery: 'Scheduled Arrival: Tomorrow, 6:00 AM - 9:00 AM',
    deliveryStep: 3, // In Transit
    items: [
      { name: 'A2 Gir Cow Desi Ghee', price: 950, quantity: 1, weight: '500 ml', emoji: '🧈' },
      { name: 'Raw Himalayan Wild Forest Honey', price: 450, quantity: 1, weight: '250 g', emoji: '🍯' },
      { name: 'Organic Basmati Rice (Long Grain)', price: 140, quantity: 1, weight: '1 kg', emoji: '🌾' }
    ],
    shippingAddress: {
      recipientName: user?.name || 'Gold Member',
      phone: '+91 99999 88888',
      street: 'Villa 14, Sunrise Greens, Sector 54',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122002'
    }
  };

  // Address entry form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    title: 'Home',
    recipientName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: true
  });
  const [addressFormLoading, setAddressFormLoading] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [addressFormErrors, setAddressFormErrors] = useState<Record<string, string>>({});

  // Invoice display state
  const [activeInvoice, setActiveInvoice] = useState<Order | null>(null);

  // Sync session and retrieve data on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAddresses();
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/auth/addresses');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.addresses && data.addresses.length > 0) {
          setAddresses(data.addresses);
        } else {
          setAddresses([defaultMockAddress]);
        }
      } else {
        setAddresses([defaultMockAddress]);
      }
    } catch (err) {
      console.error('Failed to load address database logs', err);
      setAddresses([defaultMockAddress]);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/history');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.orders && data.orders.length > 0) {
          setOrders(data.orders);
        } else {
          setOrders([defaultMockOrder]);
        }
      } else {
        setOrders([defaultMockOrder]);
      }
    } catch (err) {
      console.error('Failed to load order logs', err);
      setOrders([defaultMockOrder]);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');
    
    // Client-side validations
    const errors: Record<string, string> = {};
    if (!addressForm.title.trim()) errors.title = 'Address label is required.';
    if (!addressForm.recipientName.trim()) errors.recipientName = 'Recipient name is required.';
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!addressForm.phone.trim()) {
      errors.phone = 'Recipient phone is required.';
    } else if (!phoneRegex.test(addressForm.phone.trim())) {
      errors.phone = 'Recipient phone must be a valid 10-digit number.';
    }
    
    if (!addressForm.street.trim()) errors.street = 'Street address is required.';
    if (!addressForm.city.trim()) errors.city = 'City is required.';
    if (!addressForm.state.trim()) errors.state = 'State is required.';
    
    const pinRegex = /^[0-9]{6}$/;
    if (!addressForm.postalCode.trim()) {
      errors.postalCode = 'Postal code is required.';
    } else if (!pinRegex.test(addressForm.postalCode.trim())) {
      errors.postalCode = 'Postal code must be a valid 6-digit number.';
    }

    if (Object.keys(errors).length > 0) {
      setAddressFormErrors(errors);
      return;
    }
    
    setAddressFormErrors({});
    setAddressFormLoading(true);

    try {
      const res = await fetch('/api/auth/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddressForm(false);
        setAddressForm({
          title: 'Home',
          recipientName: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          postalCode: '',
          isDefault: true
        });
        fetchAddresses();
      } else {
        setAddressError(data.message || 'Failed to register shipping address.');
      }
    } catch (err: any) {
      setAddressError('Connection error occurred while saving.');
    } finally {
      setAddressFormLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/auth/addresses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyCoupon = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    const newCoupons = [...coupons];
    newCoupons[index].copied = true;
    setCoupons(newCoupons);
    setTimeout(() => {
      const resetCoupons = [...coupons];
      resetCoupons[index].copied = false;
      setCoupons(resetCoupons);
    }, 2000);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const handleAddToCart = (id: string) => {
    setAddedItems(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const getInitials = (name: string) => {
    if (!name) return 'SF';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const currentOrder = orders[0];
  const currentStepNum = currentOrder ? getDeliveryStep(currentOrder.status) : 0;

  const stepsList = [
    { label: 'Placed', icon: ShoppingBag },
    { label: 'Confirmed', icon: Shield },
    { label: 'Prepared', icon: Package },
    { label: 'Transit', icon: Truck },
    { label: 'Delivered', icon: Award }
  ];

  const getETA = (order: any) => {
    if (!order) return '';
    const step = getDeliveryStep(order.status);
    const createdDate = new Date(order.createdAt);
    
    if (step === 4) {
      const deliveryDate = new Date(order.updatedAt || Date.now());
      return `Delivered on ${deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at ${deliveryDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    const etaDate = new Date(createdDate.getTime() + 2 * 24 * 60 * 60 * 1000);
    return `Scheduled Arrival: ${etaDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • 6:00 AM - 9:00 AM`;
  };

  const getStepTimestamp = (order: any, stepIdx: number) => {
    if (!order) return '';
    const createdTime = new Date(order.createdAt);
    const step = getDeliveryStep(order.status);
    if (stepIdx > step) return '';
    
    if (stepIdx === 0) {
      return createdTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (stepIdx === 1) {
      return new Date(createdTime.getTime() + 45 * 60 * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (stepIdx === 2) {
      return new Date(createdTime.getTime() + 3 * 60 * 60 * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (stepIdx === 3) {
      return new Date(createdTime.getTime() + 18 * 60 * 60 * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (stepIdx === 4) {
      const delTime = new Date(order.updatedAt || (createdTime.getTime() + 24 * 60 * 60 * 1000));
      return delTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    return '';
  };

  // Nav menu items mapping with luxury modern iconography
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Sliders },
    { id: 'orders', label: 'My Shipments', icon: ShoppingBag, badge: orders.length },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length },
    { id: 'addresses', label: 'Saved Coordinates', icon: MapPin },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.filter(n => n.unread).length || undefined },
    { id: 'coupons', label: 'My Wallet Vouchers', icon: Tag },
    { id: 'viewed', label: 'Recently Browsed', icon: History },
    { id: 'settings', label: 'Preferences', icon: Settings },
    { id: 'help', label: 'Support Center', icon: HelpCircle }
  ];

  // 1. Loading state screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          className="relative flex items-center justify-center w-24 h-24 mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
          <div className="absolute inset-0 rounded-full border-t-4 border-[#4E641A] border-r-4 border-[#C68A2B]/40" />
          <Sparkles className="w-10 h-10 text-[#C68A2B] animate-pulse" />
        </motion.div>
        <span className="font-serif text-base font-semibold tracking-widest text-[#2F3B0C] uppercase animate-pulse">
          Opening Premium Portal...
        </span>
      </div>
    );
  }

  // 2. Unauthenticated state: display beautiful premium authorization gateway
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Glowing backdrop rings */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#C68A2B]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4E641A]/5 rounded-full blur-3xl" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="relative w-full max-w-md bg-white/80 backdrop-blur-md border border-[#EAE4D8] rounded-[32px] p-8 md:p-10 text-center shadow-xl z-10"
        >
          <div className="w-20 h-20 bg-[#4E641A]/10 text-[#4E641A] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <ShieldCheck className="w-10 h-10 text-[#C68A2B]" />
          </div>

          <h2 className="font-serif text-3xl font-bold text-[#2F3B0C] mb-3">
            Membership Portal
          </h2>
          
          <p className="text-sm text-stone-600 mb-8 leading-relaxed font-medium">
            Please log in or register your account to explore your premium user workspace, orders tracker, addresses book, and loyalty benefits.
          </p>

          <button
            onClick={() => {
              setCheckoutResumeRedirect('/profile');
              setAuthModalOpen(true);
            }}
            className="w-full py-4 bg-[#4E641A] hover:bg-[#2F3B0C] text-[#F9F6F0] font-bold text-xs tracking-widest uppercase rounded-2xl transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2.5 cursor-pointer ring-2 ring-transparent hover:ring-[#4E641A]/20"
          >
            <Lock className="w-4.5 h-4.5 text-[#C68A2B]" />
            <span>Log In / Create Account</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#1E1E1E] flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Hide Scrollbars Global Inline Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* Luxury Navbar header inside page */}
      <header className="sticky top-0 z-30 bg-[#F9F6F0]/85 backdrop-blur-lg border-b border-[#EAE4D8] px-4 md:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5 group cursor-pointer" onClick={() => window.location.href = '/'}>
            <img 
              src="https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png" 
              alt="Suryodaya Farms Logo" 
              className="w-12 h-12 md:w-14 md:h-14 object-contain transition group-hover:scale-105 duration-300"
            />
            <span className="font-serif text-lg md:text-xl font-bold tracking-widest text-[#2F3B0C] uppercase leading-none">
              Suryodaya Farms
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="font-sans text-[10px] tracking-widest uppercase font-extrabold bg-[#C68A2B]/15 text-[#C68A2B] px-4 py-1.5 rounded-full border border-[#C68A2B]/20 shadow-xxs">
              Gold Sprout 🌿
            </span>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden px-4 py-2 rounded-xl bg-white border border-[#EAE4D8] text-[#2F3B0C] font-extrabold text-[10px] tracking-wider uppercase transition shadow-xxs cursor-pointer hover:bg-stone-50"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {/* Main Profile Layout Container */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-10 flex-grow">
        <div className="flex flex-col lg:flex-row gap-10 items-start relative">

          {/* SIDEBAR NAVIGATION - Premium Sticky Sidebar (Left) */}
          <aside className="hidden lg:block w-[300px] bg-white border border-[#EAE4D8] rounded-[32px] p-6 shrink-0 sticky top-28 shadow-sm text-left">
            {/* Premium Avatar Layout */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-[#EAE4D8] mb-6">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#2F3B0C] to-[#4E641A] flex items-center justify-center text-[#F9F6F0] text-3xl font-bold shadow-md border-4 border-white mb-4 overflow-hidden group">
                <span className="relative z-10 group-hover:scale-105 transition duration-300">{getInitials(user.name || '')}</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-[#C68A2B]/20 to-transparent opacity-60 blur-sm" />
                <div className="absolute inset-0 ring-4 ring-[#C68A2B]/20 rounded-full" />
              </div>
              <h3 className="font-serif text-xl font-extrabold text-[#2F3B0C] leading-snug truncate max-w-full px-2">
                {user.name || 'Premium Member'}
              </h3>
              <p className="text-[10px] tracking-widest uppercase font-extrabold text-[#C68A2B] mt-2 flex items-center justify-center bg-[#C68A2B]/5 px-3 py-1 rounded-full border border-[#C68A2B]/10">
                <Award className="w-3.5 h-3.5 mr-1" />
                Soil First Member
              </p>
            </div>

            {/* Menu List */}
            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between font-sans text-xs font-bold py-3.5 px-4 rounded-2xl transition duration-300 group cursor-pointer relative ${
                      isActive
                        ? 'bg-[#4E641A] text-white shadow-sm'
                        : 'text-stone-600 hover:bg-[#F9F6F0] hover:text-[#2F3B0C]'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <IconComponent className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-[#C68A2B]' : 'text-stone-400 group-hover:text-[#4E641A]'
                      }`} />
                      <span className="tracking-wider uppercase text-[10px]">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                        isActive ? 'bg-[#C68A2B] text-[#2F3B0C]' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="absolute left-0 top-3 bottom-3 w-1.5 bg-[#C68A2B] rounded-r-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3.5 font-sans text-xs font-extrabold py-3.5 px-4 rounded-2xl text-red-600 hover:bg-red-50 transition duration-300 mt-6 cursor-pointer border border-transparent hover:border-red-100"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                <span className="tracking-wider uppercase text-[10px]">Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* MOBILE Drawer Menu overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-[#2F3B0C]/40 backdrop-blur-sm z-40 lg:hidden"
                />
                <motion.aside
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed top-0 left-0 bottom-0 w-[290px] bg-white z-50 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto lg:hidden"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-[#EAE4D8]">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#4E641A] flex items-center justify-center text-[#F9F6F0] text-sm font-bold shadow-sm">
                          {getInitials(user.name || '')}
                        </div>
                        <div className="text-left">
                          <span className="font-serif text-sm font-extrabold text-[#2F3B0C] block leading-none">
                            {user.name || 'Member'}
                          </span>
                          <span className="text-[8px] font-bold text-[#C68A2B] uppercase tracking-wider block mt-1">Gold Sprout 🌿</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-stone-400 font-extrabold text-sm p-1 hover:text-[#2F3B0C] cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <nav className="space-y-1">
                      {menuItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between font-sans text-xs font-bold py-3.5 px-4 rounded-2xl transition duration-300 cursor-pointer ${
                              isActive ? 'bg-[#4E641A] text-white shadow-sm' : 'text-stone-600 hover:bg-[#F9F6F0]'
                            }`}
                          >
                            <div className="flex items-center space-x-3.5">
                              <IconComponent className={`w-5 h-5 ${isActive ? 'text-[#C68A2B]' : 'text-stone-400'}`} />
                              <span className="tracking-wider uppercase text-[10px]">{item.label}</span>
                            </div>
                            {item.badge !== undefined && (
                              <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full text-[9px] font-bold">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3.5 font-sans text-xs font-bold py-3.5 px-4 rounded-2xl text-red-600 hover:bg-red-50 transition border border-red-100 mt-6 cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="tracking-wider uppercase text-[10px]">SIGN OUT</span>
                  </button>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* DYNAMIC DASHBOARD CONTENT AREA (Right) */}
          <div className="flex-grow w-full min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, type: 'tween' }}
                className="space-y-10"
              >
                
                {/* ---------------------------------------------------- */}
                {/* TAB 1: OVERVIEW / DASHBOARD */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-10 text-left">
                    
                    {/* Welcome Sunset Earthly Gradient Banner */}
                    <div className="relative bg-gradient-to-r from-[#2F3B0C] to-[#4E641A] rounded-[32px] p-6 md:p-10 text-[#F9F6F0] overflow-hidden border border-[#EAE4D8] shadow-md">
                      {/* Decorative glowing gradient ring */}
                      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#C68A2B]/20 blur-3xl pointer-events-none" />
                      <div className="absolute bottom-[-50%] left-[-10%] w-72 h-72 rounded-full bg-[#F9F6F0]/5 blur-3xl pointer-events-none" />

                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-3.5 max-w-xl">
                          <span className="inline-flex items-center font-sans text-[9px] font-extrabold tracking-widest uppercase text-[#C68A2B] bg-[#C68A2B]/10 px-3.5 py-1.5 rounded-full border border-[#C68A2B]/20 shadow-xxs">
                            🌿 Regenerative Farming Member
                          </span>
                          <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight text-white">
                            Namaste, {user.name?.split(' ')[0] || 'Premium Member'}
                          </h2>
                          <p className="text-xs md:text-sm text-stone-300 font-medium leading-relaxed">
                            Thank you for partnering with Suryodaya. Every organic grain, wood-pressed drops, and farm-fresh harvest helps fund crop restoration and soil replenishment programs.
                          </p>
                        </div>

                        {/* Floating Membership Tier Card */}
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 min-w-[220px] shrink-0 text-left shadow-sm">
                          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                            <span className="text-[9px] font-extrabold tracking-widest uppercase text-stone-200">MEMBERSHIP TIER</span>
                            <Sparkles className="w-4 h-4 text-[#C68A2B]" />
                          </div>
                          <span className="text-3xl font-serif font-extrabold text-white block leading-none">
                            Gold Sprout
                          </span>
                          <span className="text-[9px] text-[#C68A2B] font-extrabold uppercase tracking-widest block mt-2">
                            Premium Member • Since 2026
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Highlights Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                      {[
                        { label: 'Active Shipments', value: orders.filter(o => o.status !== 'DELIVERED').length, detail: 'Farm deliveries', icon: ShoppingBag, color: 'from-[#4E641A]/5 to-[#EAE4D8]/10' },
                        { label: 'Wishlisted Crops', value: wishlist.length, detail: 'Saved harvests', icon: Heart, color: 'from-[#EAE4D8]/20 to-[#C68A2B]/5' },
                        { label: 'Saved Coordinates', value: addresses.length, detail: 'Delivery points', icon: MapPin, color: 'from-[#4E641A]/5 to-[#EAE4D8]/15' },
                        { label: 'Active Vouchers', value: coupons.length, detail: 'Vouchers wallet', icon: Tag, color: 'from-[#C68A2B]/10 to-[#EAE4D8]/20' }
                      ].map((card, idx) => {
                        const CardIcon = card.icon;
                        return (
                          <div 
                            key={idx}
                            className={`bg-gradient-to-br ${card.color} border border-[#EAE4D8] rounded-[24px] p-5 flex flex-col justify-between h-[135px] shadow-xxs hover:shadow-md hover:-translate-y-0.5 transition duration-300 group`}
                          >
                            <div className="flex items-center justify-between text-stone-500">
                              <span className="text-[9px] font-extrabold tracking-wider uppercase text-stone-400">{card.label}</span>
                              <CardIcon className="w-5 h-5 text-[#4E641A] transition-transform group-hover:scale-110" />
                            </div>
                            <div className="text-left mt-3">
                              <span className="font-serif text-3xl font-bold text-[#2F3B0C] block leading-none">
                                {card.value}
                              </span>
                              <span className="text-[9px] text-stone-400 block font-semibold mt-1">{card.detail}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Stepper Delivery & Progression Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Active Order Stepper timeline tracker inside Dashboard */}
                      <div className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 lg:col-span-2 space-y-6 shadow-sm relative overflow-hidden">
                        
                        {/* Floating Gold Sprout Particles for DELIVERED Success State */}
                        {currentStepNum === 4 && (
                          <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {[...Array(12)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1.5 h-1.5 rounded-full bg-[#C68A2B]/50"
                                initial={{ 
                                  bottom: "-10px", 
                                  left: `${10 + Math.random() * 80}%`, 
                                  scale: 0.3 + Math.random() * 0.7, 
                                  opacity: 0.8 
                                }}
                                animate={{ 
                                  y: -180 - Math.random() * 120, 
                                  x: [-20 + Math.random() * 40, -20 + Math.random() * 40],
                                  opacity: 0, 
                                  scale: 0.1 
                                }}
                                transition={{ 
                                  duration: 3 + Math.random() * 2, 
                                  repeat: Infinity, 
                                  ease: "easeOut",
                                  delay: Math.random() * 2.5
                                }}
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
                          <h4 className="font-serif text-sm font-bold text-[#2F3B0C] flex items-center">
                            <Truck className="w-5 h-5 mr-2 text-[#C68A2B] animate-pulse" />
                            Live Delivery Tracker
                          </h4>
                          
                          <div className="flex items-center space-x-2">
                            {currentStepNum === 3 && (
                              <span className="text-[9px] font-extrabold tracking-widest text-[#C68A2B] uppercase bg-[#C68A2B]/10 border border-[#C68A2B]/20 px-2.5 py-1 rounded-full animate-pulse">
                                🛵 Out for Delivery
                              </span>
                            )}
                            {currentStepNum === 4 && (
                              <span className="text-[9px] font-extrabold tracking-widest text-green-700 uppercase bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                                🌿 Delivered Successfully
                              </span>
                            )}
                            <span className={`text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full border ${
                              currentStepNum === 4 
                                ? 'bg-green-700 text-white border-green-700' 
                                : 'bg-[#4E641A]/5 text-[#4E641A] border-[#4E641A]/10'
                            }`}>
                              {currentOrder?.status}
                            </span>
                          </div>
                        </div>

                        {orders.length > 0 && (
                          <div className="space-y-6 text-left">
                            {/* Header info detailing current status and ETA */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F9F6F0]/40 p-4 rounded-2xl border border-[#EAE4D8]/60">
                              <div className="space-y-1">
                                <span className="text-[9px] font-extrabold tracking-widest text-stone-400 uppercase block">DIRECT FARM SHIPMENT</span>
                                <span className="font-serif text-sm font-extrabold text-[#2F3B0C] block">{currentOrder.orderNumber}</span>
                              </div>
                              <div className="sm:text-right space-y-1">
                                <span className="text-[9px] font-extrabold tracking-widest text-stone-400 uppercase block">ESTIMATED HARVEST DELIVERY</span>
                                <span className="font-sans text-xs font-bold text-[#4E641A] flex items-center sm:justify-end gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
                                  {getETA(currentOrder)}
                                </span>
                              </div>
                            </div>

                            {/* Stepper container with animated track & moving truck */}
                            <div className="relative py-8 px-2 overflow-x-auto scrollbar-hide md:overflow-visible">
                              <div className="min-w-[450px] md:min-w-0 relative py-4">
                                
                                {/* Stepper Progress Connector line */}
                                <div className="absolute left-6 right-6 top-[28px] h-1 bg-[#EAE4D8]/60 -translate-y-1/2 rounded-full" />
                                <motion.div 
                                  className="absolute left-6 top-[28px] h-1 bg-gradient-to-r from-[#4E641A] via-[#5F7C20] to-[#C68A2B] -translate-y-1/2 rounded-full shadow-xxs" 
                                  initial={{ width: "0%" }}
                                  animate={{ width: `calc(${(currentStepNum / 4) * 100}% - 12px)` }}
                                  transition={{ type: "spring", stiffness: 40, damping: 12 }}
                                />

                                {/* Moving Truck along the active path */}
                                {currentStepNum > 0 && currentStepNum < 4 && (
                                  <motion.div
                                    className="absolute top-[28px] z-20 text-[#4E641A] bg-white p-1 rounded-full border border-[#EAE4D8] shadow-md flex items-center justify-center cursor-default"
                                    initial={{ left: "6%" }}
                                    animate={{ 
                                      left: `calc(6% + ${(currentStepNum / 4) * 88}% - 14px)`,
                                      y: ["-50%", "-60%", "-50%"]
                                    }}
                                    transition={{ 
                                      left: { type: "spring", stiffness: 40, damping: 12 },
                                      y: { repeat: Infinity, duration: 1.6, ease: "easeInOut" }
                                    }}
                                  >
                                    <Truck className="w-3.5 h-3.5 text-[#C68A2B]" />
                                  </motion.div>
                                )}

                                {/* Step Nodes Loop */}
                                {stepsList.map((stop, sIdx) => {
                                  const isDone = currentStepNum >= sIdx;
                                  const isCurrent = currentStepNum === sIdx;
                                  const StepIcon = stop.icon;
                                  
                                  return (
                                    <div 
                                      key={sIdx} 
                                      className="absolute top-[28px] -translate-y-1/2 flex flex-col items-center select-none"
                                      style={{ left: `calc(6% + ${(sIdx / 4) * 88}%)`, transform: "translate(-50%, -50%)" }}
                                    >
                                      {/* Pulsing Concentric Ripple effect for Active Step */}
                                      {isCurrent && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                          <motion.div 
                                            className="absolute w-12 h-12 rounded-full bg-[#4E641A]/10 border border-[#4E641A]/20"
                                            animate={{ scale: [1, 1.35], opacity: [0.65, 0] }}
                                            transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
                                          />
                                          <motion.div 
                                            className="absolute w-16 h-16 rounded-full bg-[#C68A2B]/5 border border-[#C68A2B]/10"
                                            animate={{ scale: [1, 1.25], opacity: [0.45, 0] }}
                                            transition={{ repeat: Infinity, duration: 2.2, delay: 0.8, ease: "easeOut" }}
                                          />
                                        </div>
                                      )}

                                      {/* Node Circle */}
                                      <motion.div 
                                        className={`w-9.5 h-9.5 rounded-full border-2 flex items-center justify-center z-10 shadow-xxs transition-colors duration-300 ${
                                          isDone 
                                            ? 'bg-[#4E641A] border-[#4E641A] text-white shadow-sm' 
                                            : isCurrent 
                                              ? 'bg-white border-[#C68A2B] text-[#C68A2B] ring-2 ring-[#C68A2B]/10 font-bold' 
                                              : 'bg-white border-[#EAE4D8] text-stone-400'
                                        }`}
                                        whileHover={{ scale: 1.05 }}
                                        animate={isCurrent ? { scale: [1, 1.06, 1] } : {}}
                                        transition={isCurrent ? { repeat: Infinity, duration: 2.2, ease: "easeInOut" } : {}}
                                      >
                                        {isDone && sIdx < currentStepNum ? (
                                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="font-extrabold text-[11px]">✓</motion.span>
                                        ) : (
                                          <StepIcon className={`w-3.5 h-3.5 ${isCurrent ? 'animate-pulse text-[#C68A2B]' : ''}`} />
                                        )}
                                      </motion.div>

                                      {/* Label & Timestamp info */}
                                      <div className="absolute top-8 flex flex-col items-center w-24 text-center space-y-0.5 mt-2">
                                        <span className={`text-[9px] font-extrabold uppercase tracking-widest block transition-colors duration-300 ${
                                          isCurrent ? 'text-[#C68A2B]' : isDone ? 'text-[#2F3B0C]' : 'text-stone-400'
                                        }`}>
                                          {stop.label}
                                        </span>
                                        {getStepTimestamp(currentOrder, sIdx) && (
                                          <span className="text-[8px] font-extrabold text-stone-400 block tracking-tight">
                                            {getStepTimestamp(currentOrder, sIdx)}
                                          </span>
                                        )}
                                      </div>

                                    </div>
                                  );
                                })}

                              </div>
                            </div>

                            {/* Premium DELIVERED Success Card */}
                            {currentStepNum === 4 && (
                              <motion.div 
                                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                                className="mt-14 bg-gradient-to-r from-[#4E641A]/5 via-[#C68A2B]/10 to-[#4E641A]/5 border border-[#C68A2B]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
                              >
                                <div className="flex items-center space-x-3.5 text-left">
                                  <div className="w-10 h-10 rounded-full bg-[#C68A2B]/15 text-[#C68A2B] flex items-center justify-center shrink-0 shadow-sm animate-bounce">
                                    <Award className="w-5 h-5 text-[#C68A2B]" />
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#C68A2B] block">Sprout Direct Delivery</span>
                                    <h5 className="font-serif text-sm font-extrabold text-[#2F3B0C] mt-0.5">Delivered Successfully!</h5>
                                    <p className="text-[10px] text-stone-500 font-semibold leading-relaxed">Your premium unrefined staples have arrived safely. Thank you for supporting native crop restoration.</p>
                                  </div>
                                </div>
                                <span className="text-[9px] font-extrabold tracking-widest text-[#4E641A] uppercase bg-[#4E641A]/10 border border-[#4E641A]/20 px-3.5 py-1.5 rounded-full shrink-0">
                                  Order Closed 🌾
                                </span>
                              </motion.div>
                            )}

                            {/* Premium active logistics Rider Info card */}
                            {currentStepNum < 4 && (
                              <div className="mt-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#F9F6F0]/60 border border-[#EAE4D8] p-4 rounded-2xl text-left">
                                <div className="flex items-center space-x-3.5">
                                  <div className="w-10 h-10 rounded-xl bg-[#4E641A]/10 flex items-center justify-center shrink-0 border border-[#4E641A]/10">
                                    <UserIcon className="w-5 h-5 text-[#4E641A]" />
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-extrabold tracking-widest uppercase text-stone-400 block">Suryodaya Delivery Rider</span>
                                    <h5 className="font-serif text-sm font-extrabold text-[#2F3B0C] mt-0.5">Shankar Rao</h5>
                                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Direct Farm Logistics Partner</p>
                                  </div>
                                </div>
                                
                                <a 
                                  href={`tel:${settings.phone}`} 
                                  className="px-4 py-2.5 border border-[#EAE4D8] hover:bg-[#4E641A] hover:text-white transition duration-300 text-[9px] font-extrabold tracking-widest uppercase text-[#2F3B0C] rounded-xl flex items-center gap-1.5 shrink-0 bg-white"
                                >
                                  <Sliders className="w-3.5 h-3.5 text-[#C68A2B] rotate-90" /> Call Partner
                                </a>
                              </div>
                            )}

                          </div>
                        )}
                      </div>

                      {/* Tier progress milestone card */}
                      <div className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 space-y-4 shadow-sm flex flex-col justify-between">
                        <div className="space-y-2">
                          <h4 className="font-serif text-sm font-bold text-[#2F3B0C] pb-2.5 border-b border-stone-100">
                            Membership Progression
                          </h4>
                          <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                            Complete 3 more direct farm orders to upgrade your tier to the premium **Sunrise Seed** level (unlocks early priority direct harvests).
                          </p>
                        </div>

                        <div className="space-y-2 mt-2">
                          <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#4E641A] to-[#C68A2B] rounded-full" style={{ width: '70%' }} />
                          </div>
                          <div className="flex justify-between text-[8px] font-extrabold tracking-widest text-stone-400 uppercase">
                            <span>Gold Sprout</span>
                            <span>Sunrise Seed (Level 2)</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* ---------------------------------------------------- */}
                    {/* PRODUCT CAROUSELS */}
                    {/* ---------------------------------------------------- */}

                    {/* Carousel 1: Seasonal Harvests */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between border-l-4 border-[#C68A2B] pl-3.5">
                        <div>
                          <h3 className="font-serif text-lg md:text-xl font-bold text-[#2F3B0C]">Seasonal Farm Harvests 🥭</h3>
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Limited stock • Hand-harvested today</p>
                        </div>
                        <span className="text-[9px] font-extrabold tracking-widest text-stone-400 uppercase">Swipe Left →</span>
                      </div>

                      <div className="flex overflow-x-auto scrollbar-hide pb-4 space-x-5 scroll-smooth">
                        {seasonalHarvests.map((prod) => (
                          <div 
                            key={prod.id} 
                            className="bg-white border border-[#EAE4D8] rounded-[24px] p-4 flex flex-col justify-between gap-3 shadow-xxs hover:shadow-md transition duration-300 w-[190px] shrink-0 text-left group"
                          >
                            <div className={`w-full h-28 rounded-2xl bg-gradient-to-tr ${prod.imageColor} border border-stone-100 flex items-center justify-center text-4xl relative overflow-hidden`}>
                              <span className="group-hover:scale-110 transition duration-300">{prod.emoji}</span>
                              <span className="absolute top-2 left-2 text-[8px] font-extrabold uppercase tracking-widest bg-white/70 backdrop-blur-md text-[#2F3B0C] px-2 py-0.5 rounded-full border border-stone-200">
                                {prod.tag}
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <h4 className="font-serif text-xs font-bold text-[#2F3B0C] truncate leading-tight">{prod.name}</h4>
                              <p className="text-[9px] text-stone-400 font-bold">{prod.weight}</p>
                              
                              <div className="flex items-center space-x-1 pt-1">
                                <Star className="w-3 h-3 text-[#C68A2B] fill-current" />
                                <span className="text-[9px] font-extrabold text-stone-600">{prod.rating}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-50">
                              <span className="text-xs font-extrabold text-[#4E641A]">₹{prod.price}</span>
                              <button 
                                onClick={() => handleAddToCart(prod.id)}
                                className={`text-[8px] font-extrabold uppercase tracking-widest px-3 py-2 rounded-xl transition duration-200 cursor-pointer border ${
                                  addedItems[prod.id]
                                    ? 'bg-green-700 text-white border-green-700'
                                    : 'bg-[#F9F6F0] hover:bg-[#4E641A] hover:text-[#F9F6F0] text-[#4E641A] border-[#EAE4D8]'
                                }`}
                              >
                                {addedItems[prod.id] ? 'Added ✓' : 'Add +'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Carousel 2: Recommended Products */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between border-l-4 border-[#4E641A] pl-3.5">
                        <div>
                          <h3 className="font-serif text-lg md:text-xl font-bold text-[#2F3B0C]">Recommended For Your Wellness 🧈</h3>
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Pure native superfoods & cold-pressed oils</p>
                        </div>
                        <span className="text-[9px] font-extrabold tracking-widest text-stone-400 uppercase">Swipe Left →</span>
                      </div>

                      <div className="flex overflow-x-auto scrollbar-hide pb-4 space-x-5 scroll-smooth">
                        {recommendedProducts.map((prod) => (
                          <div 
                            key={prod.id} 
                            className="bg-white border border-[#EAE4D8] rounded-[24px] p-4 flex flex-col justify-between gap-3 shadow-xxs hover:shadow-md transition duration-300 w-[190px] shrink-0 text-left group"
                          >
                            <div className={`w-full h-28 rounded-2xl bg-gradient-to-tr ${prod.imageColor} border border-stone-100 flex items-center justify-center text-4xl relative overflow-hidden`}>
                              <span className="group-hover:scale-110 transition duration-300">{prod.emoji}</span>
                              <span className="absolute top-2 left-2 text-[8px] font-extrabold uppercase tracking-widest bg-white/70 backdrop-blur-md text-[#2F3B0C] px-2 py-0.5 rounded-full border border-stone-200">
                                {prod.tag}
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <h4 className="font-serif text-xs font-bold text-[#2F3B0C] truncate leading-tight">{prod.name}</h4>
                              <p className="text-[9px] text-stone-400 font-bold">{prod.weight}</p>
                              
                              <div className="flex items-center space-x-1 pt-1">
                                <Star className="w-3 h-3 text-[#C68A2B] fill-current" />
                                <span className="text-[9px] font-extrabold text-stone-600">{prod.rating}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-50">
                              <span className="text-xs font-extrabold text-[#4E641A]">₹{prod.price}</span>
                              <button 
                                onClick={() => handleAddToCart(prod.id)}
                                className={`text-[8px] font-extrabold uppercase tracking-widest px-3 py-2 rounded-xl transition duration-200 cursor-pointer border ${
                                  addedItems[prod.id]
                                    ? 'bg-green-700 text-white border-green-700'
                                    : 'bg-[#F9F6F0] hover:bg-[#4E641A] hover:text-[#F9F6F0] text-[#4E641A] border-[#EAE4D8]'
                                }`}
                              >
                                {addedItems[prod.id] ? 'Added ✓' : 'Add +'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Wishlist & Coupons Promo Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                      
                      {/* Wishlist preview block */}
                      <div className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 space-y-4 shadow-sm text-left">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                          <h4 className="font-serif text-sm font-bold text-[#2F3B0C] flex items-center">
                            <Heart className="w-4 h-4 mr-2 text-red-500 fill-current" />
                            Wishlist Highlights
                          </h4>
                          <button 
                            onClick={() => setActiveTab('wishlist')}
                            className="text-[9px] font-extrabold uppercase tracking-widest text-[#C68A2B] hover:text-[#4E641A] transition"
                          >
                            View All →
                          </button>
                        </div>

                        <div className="space-y-3">
                          {wishlist.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-xs border border-stone-50 p-2.5 rounded-2xl hover:bg-stone-50/50 transition">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{item.emoji}</span>
                                <div>
                                  <span className="font-bold text-[#2F3B0C] block leading-none">{item.name}</span>
                                  <span className="text-[8px] text-stone-400 font-bold block mt-1">{item.weight}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3 shrink-0">
                                <span className="font-extrabold text-[#4E641A]">₹{item.price}</span>
                                <button 
                                  onClick={() => handleAddToCart(item.id)}
                                  className={`text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-1.5 rounded-lg border transition ${
                                    addedItems[item.id]
                                      ? 'bg-green-700 text-white border-green-755'
                                      : 'bg-[#F9F6F0] hover:bg-[#4E641A] hover:text-[#F9F6F0] text-[#4E641A] border-[#EAE4D8]'
                                  }`}
                                >
                                  {addedItems[item.id] ? 'Added' : 'Cart +'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Promos & Seasonal vouchers list */}
                      <div className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 space-y-4 shadow-sm text-left">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                          <h4 className="font-serif text-sm font-bold text-[#2F3B0C] flex items-center">
                            <Tag className="w-4 h-4 mr-2 text-[#C68A2B]" />
                            Seasonal Harvest Vouchers
                          </h4>
                          <button 
                            onClick={() => setActiveTab('coupons')}
                            className="text-[9px] font-extrabold uppercase tracking-widest text-[#C68A2B] hover:text-[#4E641A] transition"
                          >
                            Wallet →
                          </button>
                        </div>

                        <div className="space-y-3.5">
                          {coupons.slice(0, 2).map((coupon, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs p-3 bg-gradient-to-r from-[#F9F6F0] to-white border border-[#EAE4D8] rounded-2xl relative overflow-hidden">
                              <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#C68A2B]" />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono bg-stone-100 px-2 py-0.5 rounded text-[10px] text-stone-800 font-bold">{coupon.code}</span>
                                  <span className="text-[9px] bg-[#C68A2B]/10 text-[#C68A2B] font-extrabold px-1.5 py-0.5 rounded">{coupon.discount}</span>
                                </div>
                                <p className="text-[10px] text-stone-500 font-medium mt-1.5">{coupon.desc}</p>
                              </div>
                              <button 
                                onClick={() => handleCopyCoupon(coupon.code, idx)}
                                className={`text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-2 rounded-xl transition ${
                                  coupon.copied
                                    ? 'bg-green-700 text-white'
                                    : 'bg-white hover:bg-[#4E641A] hover:text-[#F9F6F0] text-[#4E641A] border border-[#EAE4D8]'
                                }`}
                              >
                                {coupon.copied ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Carousel 3: Organic Essentials */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between border-l-4 border-[#C68A2B] pl-3.5">
                        <div>
                          <h3 className="font-serif text-lg md:text-xl font-bold text-[#2F3B0C]">Organic Pantry Essentials 🌾</h3>
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Native grains & fresh flours for healthy cooking</p>
                        </div>
                        <span className="text-[9px] font-extrabold tracking-widest text-stone-400 uppercase">Swipe Left →</span>
                      </div>

                      <div className="flex overflow-x-auto scrollbar-hide pb-4 space-x-5 scroll-smooth">
                        {organicEssentials.map((prod) => (
                          <div 
                            key={prod.id} 
                            className="bg-white border border-[#EAE4D8] rounded-[24px] p-4 flex flex-col justify-between gap-3 shadow-xxs hover:shadow-md transition duration-300 w-[190px] shrink-0 text-left group"
                          >
                            <div className={`w-full h-28 rounded-2xl bg-gradient-to-tr ${prod.imageColor} border border-stone-100 flex items-center justify-center text-4xl relative overflow-hidden`}>
                              <span className="group-hover:scale-110 transition duration-300">{prod.emoji}</span>
                              <span className="absolute top-2 left-2 text-[8px] font-extrabold uppercase tracking-widest bg-white/70 backdrop-blur-md text-[#2F3B0C] px-2 py-0.5 rounded-full border border-stone-200">
                                {prod.tag}
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <h4 className="font-serif text-xs font-bold text-[#2F3B0C] truncate leading-tight">{prod.name}</h4>
                              <p className="text-[9px] text-stone-400 font-bold">{prod.weight}</p>
                              
                              <div className="flex items-center space-x-1 pt-1">
                                <Star className="w-3 h-3 text-[#C68A2B] fill-current" />
                                <span className="text-[9px] font-extrabold text-stone-600">{prod.rating}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-50">
                              <span className="text-xs font-extrabold text-[#4E641A]">₹{prod.price}</span>
                              <button 
                                onClick={() => handleAddToCart(prod.id)}
                                className={`text-[8px] font-extrabold uppercase tracking-widest px-3 py-2 rounded-xl transition duration-200 cursor-pointer border ${
                                  addedItems[prod.id]
                                    ? 'bg-green-700 text-white border-green-700'
                                    : 'bg-[#F9F6F0] hover:bg-[#4E641A] hover:text-[#F9F6F0] text-[#4E641A] border-[#EAE4D8]'
                                }`}
                              >
                                {addedItems[prod.id] ? 'Added ✓' : 'Add +'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB 2: MY ORDERS / SHIPMENTS */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'orders' && (
                  <div className="space-y-8 text-left">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Your Direct Farm Shipments 📦</h3>
                      <p className="text-xs text-stone-600 font-medium">Track your active delivery timelines, download PDF receipt invoices, and explore seasonal harvests.</p>
                    </div>

                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 shadow-sm space-y-6 hover:shadow-md transition">
                          
                          {/* Card Top Details */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                            <div className="space-y-1 text-left">
                              <div className="flex items-center space-x-2.5">
                                <span className="font-serif text-base font-extrabold text-[#2F3B0C]">{order.orderNumber}</span>
                                <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                  order.status === 'DELIVERED' 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-[#C68A2B]/10 text-[#C68A2B] border border-[#C68A2B]/20'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-widest">
                                Shipped: {new Date(order.createdAt).toLocaleDateString()} • Method: {order.paymentMethod}
                              </p>
                            </div>
                            <div className="sm:text-right shrink-0">
                              <span className="font-serif text-xl font-extrabold text-[#4E641A] block">₹{order.totalAmount}</span>
                              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">
                                Gateway Status: {order.paymentStatus}
                              </span>
                            </div>
                          </div>

                          {/* Stepper Timeline Tracker */}
                          <div className="py-2.5">
                            <h5 className="text-[10px] font-extrabold tracking-widest text-[#2F3B0C] uppercase mb-5 flex items-center">
                              <Truck className="w-4 h-4 mr-2 text-[#C68A2B]" />
                              Delivery Status & Progress
                            </h5>
                            
                            <div className="flex justify-between items-center relative py-2">
                              {/* Connector Progress line */}
                              <div className="absolute left-6 right-6 top-[20px] h-[3px] bg-stone-100 -z-1" />
                              <div 
                                className="absolute left-6 top-[20px] h-[3px] bg-gradient-to-r from-[#4E641A] to-[#C68A2B] transition-all duration-500 -z-1" 
                                style={{ width: `${(order.deliveryStep / 4) * 100}%` }}
                              />

                              {/* Stepper Stops */}
                              {[
                                { label: 'Placed', step: 0 },
                                { label: 'Confirmed', step: 1 },
                                { label: 'Prepared', step: 2 },
                                { label: 'Transit', step: 3 },
                                { label: 'Delivered', step: 4 }
                              ].map((stop, sIdx) => {
                                const isCompleted = order.deliveryStep >= stop.step;
                                const isCurrent = order.deliveryStep === stop.step;
                                return (
                                  <div key={sIdx} className="flex flex-col items-center space-y-2 z-10 shrink-0">
                                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition duration-300 ${
                                      isCompleted 
                                        ? 'bg-[#4E641A] border-[#4E641A] text-white shadow-sm' 
                                        : isCurrent 
                                          ? 'bg-white border-[#C68A2B] text-[#C68A2B] ring-2 ring-[#C68A2B]/10 animate-pulse' 
                                          : 'bg-white border-stone-200 text-stone-400'
                                    }`}>
                                      {isCompleted && stop.step < order.deliveryStep ? '✓' : stop.step + 1}
                                    </div>
                                    <span className={`text-[9px] font-extrabold uppercase tracking-widest ${
                                      isCurrent ? 'text-[#C68A2B]' : isCompleted ? 'text-[#2F3B0C]' : 'text-stone-400'
                                    }`}>
                                      {stop.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-[10px] text-[#4E641A] font-extrabold uppercase tracking-widest mt-6 bg-[#4E641A]/5 inline-block px-3 py-1.5 rounded-lg border border-[#4E641A]/10">
                              Status Memo: {order.estimatedDelivery}
                            </p>
                          </div>

                          {/* Item Products List */}
                          <div className="bg-[#F9F6F0] border border-[#EAE4D8] rounded-[20px] p-5 space-y-3.5 text-left">
                            <h5 className="text-[9px] font-extrabold tracking-widest text-[#2F3B0C] uppercase border-b border-stone-200/50 pb-2">Harvest Breakdown</h5>
                            {order.items?.map((item, iIdx) => (
                              <div key={iIdx} className="flex justify-between items-center text-xs">
                                <div className="flex items-center space-x-2.5">
                                  <span className="text-xl">{item.emoji || '📦'}</span>
                                  <div>
                                    <span className="font-bold text-[#2F3B0C]">{item.name}</span>
                                    <span className="text-[9px] text-stone-400 font-bold block mt-0.5">{item.weight}</span>
                                  </div>
                                </div>
                                <div className="space-x-4">
                                  <span className="text-stone-500 font-semibold">Qty: {item.quantity}</span>
                                  <span className="font-bold text-stone-800">₹{item.price * item.quantity}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Action Buttons */}
                          <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                            <button 
                              onClick={() => setActiveInvoice(order)}
                              className="px-4 py-2.5 border border-[#EAE4D8] hover:bg-stone-50 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-200 flex items-center space-x-2 cursor-pointer shadow-xxs"
                            >
                              <Download className="w-4 h-4 text-stone-400" />
                              <span>Download Invoice</span>
                            </button>
                            <button className="px-4 py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition duration-200 flex items-center space-x-2 cursor-pointer shadow-xxs">
                              <RotateCcw className="w-4 h-4 text-[#C68A2B]" />
                              <span>Reorder Staples</span>
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB 3: WISHLIST */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'wishlist' && (
                  <div className="space-y-8 text-left">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Saved Wishlist Bookmarks ❤️</h3>
                      <p className="text-xs text-stone-600 font-medium">Keep track of your favorite organic harvests and add them instantly to checkout.</p>
                    </div>

                    {wishlist.length === 0 ? (
                      <div className="bg-white border border-[#EAE4D8] rounded-[28px] p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
                        <Heart className="w-14 h-14 text-stone-200 mx-auto" />
                        <h4 className="font-serif text-lg font-bold text-[#2F3B0C]">No Bookmarks Saved</h4>
                        <p className="text-xs text-stone-500">Your favorite lists are empty. Bookmarks help save seasonal farm products for quick access.</p>
                        <button className="px-6 py-3 bg-[#4E641A] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#2F3B0C] transition cursor-pointer">Explore Marketplace</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {wishlist.map((item) => (
                          <div 
                            key={item.id}
                            className="bg-white border border-[#EAE4D8] rounded-[24px] p-5 flex flex-col sm:flex-row gap-5 justify-between shadow-xxs hover:shadow-md transition duration-300 text-left relative overflow-hidden group"
                          >
                            <div className="flex gap-4">
                              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${item.imageColor} border border-stone-100 shrink-0 flex items-center justify-center text-4xl group-hover:scale-105 transition`}>
                                {item.emoji}
                              </div>
                              <div className="space-y-1 justify-center flex flex-col">
                                <h4 className="font-serif text-sm font-extrabold text-[#2F3B0C]">{item.name}</h4>
                                <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">{item.weight}</p>
                                <span className="text-sm font-extrabold text-[#4E641A] pt-1">₹{item.price}</span>
                              </div>
                            </div>

                            <div className="flex sm:flex-col justify-end items-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                              <button 
                                onClick={() => setWishlist(prev => prev.filter(w => w.id !== item.id))}
                                className="text-stone-400 hover:text-red-700 p-2 rounded-xl hover:bg-stone-50 transition cursor-pointer"
                                title="Remove Bookmark"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleAddToCart(item.id)}
                                className={`px-4 py-2 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer ${
                                  addedItems[item.id] ? 'bg-green-700' : ''
                                }`}
                              >
                                {addedItems[item.id] ? 'Added' : 'Add To Cart'}
                              </button>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB 4: SAVED ADDRESSES */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'addresses' && (
                  <div className="space-y-8 text-left">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      <div className="flex flex-col gap-1.5">
                        <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Saved Coordinates 📍</h3>
                        <p className="text-xs text-stone-600 font-medium">Manage shipping coordinates for seamless direct farm logistics routing.</p>
                      </div>
                      {!showAddressForm && (
                        <button
                          onClick={() => setShowAddressForm(true)}
                          className="px-5 py-3 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition duration-200 flex items-center space-x-2 cursor-pointer shadow-sm hover:shadow"
                        >
                          <Plus className="w-4 h-4 text-[#C68A2B]" />
                          <span>Add New Address</span>
                        </button>
                      )}
                    </div>

                    {/* Address addition flyout form */}
                    {showAddressForm && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 md:p-8 shadow-sm"
                      >
                        <h4 className="font-serif text-base font-bold text-[#2F3B0C] mb-5 border-b border-stone-100 pb-2">Add Shipping Coordinates</h4>
                        <form noValidate onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {addressError && (
                            <div className="col-span-1 sm:col-span-2 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-xs font-semibold flex items-center space-x-2">
                              <AlertCircle className="w-5 h-5 text-red-500" />
                              <span>{addressError}</span>
                            </div>
                          )}

                          <div className="text-left">
                            <label className="block text-[9px] font-extrabold uppercase text-stone-400 tracking-wider mb-2">Address Label</label>
                            <input
                              type="text"
                              value={addressForm.title}
                              onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                              placeholder="e.g. Home, Office"
                              className="w-full bg-[#F9F6F0] border border-stone-200 focus:border-[#4E641A] rounded-xl py-3 px-4 font-sans text-xs focus:outline-none text-stone-850 font-semibold shadow-xxs transition"
                              required
                            />
                            {addressFormErrors.title && (
                              <span className="text-[10px] text-red-600 font-bold block mt-1 select-none">
                                ⚠️ {addressFormErrors.title}
                              </span>
                            )}
                          </div>

                          <div className="text-left">
                            <label className="block text-[9px] font-extrabold uppercase text-stone-400 tracking-wider mb-2">Recipient Name</label>
                            <input
                              type="text"
                              value={addressForm.recipientName}
                              onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                              placeholder="Full Name"
                              className="w-full bg-[#F9F6F0] border border-stone-200 focus:border-[#4E641A] rounded-xl py-3 px-4 font-sans text-xs focus:outline-none text-stone-850 font-semibold shadow-xxs transition"
                              required
                            />
                            {addressFormErrors.recipientName && (
                              <span className="text-[10px] text-red-600 font-bold block mt-1 select-none">
                                ⚠️ {addressFormErrors.recipientName}
                              </span>
                            )}
                          </div>

                          <div className="text-left">
                            <label className="block text-[9px] font-extrabold uppercase text-stone-400 tracking-wider mb-2">Recipient Phone</label>
                            <input
                              type="tel"
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                              placeholder="10-digit number"
                              className="w-full bg-[#F9F6F0] border border-stone-200 focus:border-[#4E641A] rounded-xl py-3 px-4 font-sans text-xs focus:outline-none text-stone-850 font-semibold shadow-xxs transition"
                              required
                            />
                            {addressFormErrors.phone && (
                              <span className="text-[10px] text-red-600 font-bold block mt-1 select-none">
                                ⚠️ {addressFormErrors.phone}
                              </span>
                            )}
                          </div>

                          <div className="col-span-1 sm:col-span-2 text-left">
                            <label className="block text-[9px] font-extrabold uppercase text-stone-400 tracking-wider mb-2">Street Address</label>
                            <input
                              type="text"
                              value={addressForm.street}
                              onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                              placeholder="Apartment, Floor, House number & Street details"
                              className="w-full bg-[#F9F6F0] border border-stone-200 focus:border-[#4E641A] rounded-xl py-3 px-4 font-sans text-xs focus:outline-none text-stone-850 font-semibold shadow-xxs transition"
                              required
                            />
                            {addressFormErrors.street && (
                              <span className="text-[10px] text-red-650 font-bold block mt-1 select-none">
                                ⚠️ {addressFormErrors.street}
                              </span>
                            )}
                          </div>

                          <div className="text-left">
                            <label className="block text-[9px] font-extrabold uppercase text-stone-400 tracking-wider mb-2">City</label>
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              placeholder="City"
                              className="w-full bg-[#F9F6F0] border border-stone-200 focus:border-[#4E641A] rounded-xl py-3 px-4 font-sans text-xs focus:outline-none text-stone-850 font-semibold shadow-xxs transition"
                              required
                            />
                            {addressFormErrors.city && (
                              <span className="text-[10px] text-red-650 font-bold block mt-1 select-none">
                                ⚠️ {addressFormErrors.city}
                              </span>
                            )}
                          </div>

                          <div className="text-left">
                            <label className="block text-[9px] font-extrabold uppercase text-stone-400 tracking-wider mb-2">State</label>
                            <input
                              type="text"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              placeholder="State"
                              className="w-full bg-[#F9F6F0] border border-stone-200 focus:border-[#4E641A] rounded-xl py-3 px-4 font-sans text-xs focus:outline-none text-stone-850 font-semibold shadow-xxs transition"
                              required
                            />
                            {addressFormErrors.state && (
                              <span className="text-[10px] text-red-650 font-bold block mt-1 select-none">
                                ⚠️ {addressFormErrors.state}
                              </span>
                            )}
                          </div>

                          <div className="text-left">
                            <label className="block text-[9px] font-extrabold uppercase text-stone-400 tracking-wider mb-2">Postal Code</label>
                            <input
                              type="text"
                              value={addressForm.postalCode}
                              onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                              placeholder="6-digit PIN code"
                              className="w-full bg-[#F9F6F0] border border-stone-200 focus:border-[#4E641A] rounded-xl py-3 px-4 font-sans text-xs focus:outline-none text-stone-850 font-semibold shadow-xxs transition"
                              required
                            />
                            {addressFormErrors.postalCode && (
                              <span className="text-[10px] text-red-650 font-bold block mt-1 select-none">
                                ⚠️ {addressFormErrors.postalCode}
                              </span>
                            )}
                          </div>

                          <div className="col-span-1 sm:col-span-2 flex items-center space-x-2 pt-2 text-left">
                            <input
                              type="checkbox"
                              id="isDefaultCheck"
                              checked={addressForm.isDefault}
                              onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                              className="h-4.5 w-4.5 rounded border-stone-300 text-[#4E641A] focus:ring-[#4E641A] cursor-pointer"
                            />
                            <label htmlFor="isDefaultCheck" className="text-xs font-bold text-stone-600 cursor-pointer">
                              Mark this as my primary delivery address
                            </label>
                          </div>

                          <div className="col-span-1 sm:col-span-2 flex justify-end space-x-3 mt-4">
                            <button
                              type="button"
                              onClick={() => setShowAddressForm(false)}
                              disabled={addressFormLoading}
                              className="px-5 py-3 border border-stone-250 rounded-xl text-stone-600 hover:bg-stone-50 text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={addressFormLoading}
                              className="px-6 py-3 bg-[#4E641A] hover:bg-[#2F3B0C] disabled:bg-stone-300 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm"
                            >
                              {addressFormLoading ? 'Saving Address...' : 'Save Address Coordinates'}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {/* Address lists grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {addresses.length === 0 && !showAddressForm ? (
                        <div className="bg-white border border-[#EAE4D8] rounded-[28px] p-12 text-center col-span-1 sm:col-span-2 space-y-4 shadow-sm">
                          <MapPin className="w-14 h-14 text-stone-200 mx-auto" />
                          <h4 className="font-serif text-lg font-bold text-[#2F3B0C]">No Delivery Addresses Saved</h4>
                          <p className="text-xs text-stone-500">Add shipping locations to checkout baseline direct farm logs quickly.</p>
                        </div>
                      ) : (
                        addresses.map((addr) => (
                          <div 
                            key={addr.id}
                            className="bg-white border border-[#EAE4D8] rounded-[24px] p-6 flex flex-col justify-between min-h-[170px] shadow-xxs hover:shadow-md hover:-translate-y-0.5 transition duration-300 relative text-left"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-2.5">
                                <span className="font-serif text-base font-extrabold text-[#2F3B0C]">{addr.title}</span>
                                {addr.isDefault && (
                                  <span className="text-[8px] font-extrabold uppercase bg-[#4E641A]/10 text-[#4E641A] px-2.5 py-1 rounded-full border border-[#4E641A]/20">Primary</span>
                                )}
                              </div>
                              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                                <strong className="text-stone-850">{addr.recipientName}</strong> • {addr.phone} <br />
                                {addr.street}, {addr.city}, {addr.state} – {addr.postalCode}
                              </p>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-stone-100 pt-4 mt-5">
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-stone-400 hover:text-red-700 p-2 rounded-xl hover:bg-stone-50 transition shrink-0 cursor-pointer"
                                title="Delete Address"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB 5: NOTIFICATIONS */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'notifications' && (
                  <div className="space-y-8 text-left">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Messages & Crop Dispatches 🔔</h3>
                      <p className="text-xs text-stone-600 font-medium">Explore latest updates regarding native crops, pressing yields, and logistics logs.</p>
                    </div>

                    <div className="space-y-4">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          className={`bg-white border border-[#EAE4D8] rounded-[24px] p-5 flex gap-4 items-start shadow-xxs transition hover:shadow duration-200 ${
                            notif.unread ? 'ring-2 ring-[#C68A2B]/10 bg-gradient-to-r from-white to-[#C68A2B]/5' : ''
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                            notif.unread ? 'bg-[#C68A2B]/15 text-[#C68A2B]' : 'bg-stone-100 text-stone-400'
                          }`}>
                            <Bell className="w-5 h-5" />
                          </div>
                          <div className="space-y-1 text-left">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-serif text-sm font-extrabold text-[#2F3B0C]">{notif.title}</h4>
                              {notif.unread && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#C68A2B] shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-stone-600 leading-relaxed font-medium">{notif.message}</p>
                            <span className="text-[9px] text-stone-400 font-bold block pt-1.5">{notif.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB 6: COUPON WALLET */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'coupons' && (
                  <div className="space-y-8 text-left">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Loyalty Coupons Wallet 🎫</h3>
                      <p className="text-xs text-stone-600 font-medium">Use these exclusive gold membership coupons at checkout to claim instant discounts.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {coupons.map((coupon, idx) => (
                        <div 
                          key={idx}
                          className="bg-white border border-[#EAE4D8] rounded-[24px] p-6 flex flex-col justify-between gap-5 shadow-xxs hover:shadow-md transition duration-300 relative overflow-hidden"
                        >
                          {/* Top colored brand indicator */}
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4E641A] to-[#C68A2B]" />

                          <div className="space-y-2 text-left pt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-extrabold tracking-widest text-[#C68A2B] uppercase">MEMBERSHIP VOUCHER</span>
                              <span className="text-xs font-bold text-[#4E641A] bg-[#4E641A]/5 px-3 py-1 rounded-full border border-[#4E641A]/10 shadow-xxs">
                                {coupon.discount}
                              </span>
                            </div>
                            <h4 className="font-serif text-lg font-bold text-[#2F3B0C] tracking-wide pt-1">
                              Code: <span className="font-mono bg-[#F9F6F0] px-3 py-1 rounded-lg text-stone-850 font-extrabold border border-stone-200">{coupon.code}</span>
                            </h4>
                            <p className="text-xs text-stone-600 leading-normal font-medium mt-1">{coupon.desc}</p>
                            <p className="text-[9px] text-stone-400 font-extrabold uppercase mt-1.5 tracking-wider">{coupon.minOrder}</p>
                          </div>

                          <button
                            onClick={() => handleCopyCoupon(coupon.code, idx)}
                            className={`w-full py-3.5 rounded-xl font-sans text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 transition cursor-pointer border ${
                              coupon.copied 
                                ? 'bg-green-700 text-white border-green-700 shadow' 
                                : 'bg-[#F9F6F0] hover:bg-[#4E641A] hover:text-[#F9F6F0] text-[#4E641A] border-[#EAE4D8] shadow-xxs'
                            }`}
                          >
                            {coupon.copied ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Voucher Copied!</span>
                              </>
                            ) : (
                              <span>Copy Coupon Code</span>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB 7: RECENTLY VIEWED */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'viewed' && (
                  <div className="space-y-8 text-left">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Recently Browsed Harvests 🌾</h3>
                      <p className="text-xs text-stone-600 font-medium">Quick links to revisit unrefined oils and basmati cereals recently in your session logs.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {recentlyViewed.map((item) => (
                        <div 
                          key={item.id}
                          className="bg-white border border-[#EAE4D8] rounded-[24px] p-5 flex flex-col justify-between gap-4 shadow-xxs hover:shadow-md transition duration-300 text-left group"
                        >
                          <div className={`w-full h-36 rounded-2xl bg-gradient-to-tr ${item.imageColor} border border-stone-100 flex items-center justify-center text-4xl relative overflow-hidden`}>
                            <span className="group-hover:scale-105 transition duration-300">{item.emoji}</span>
                          </div>
                          
                          <div className="space-y-0.5">
                            <h4 className="font-serif text-sm font-bold text-[#2F3B0C] leading-snug truncate group-hover:text-[#4E641A] transition">
                              {item.name}
                            </h4>
                            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">{item.weight}</p>
                            <span className="text-base font-extrabold text-[#4E641A] block pt-1.5">₹{item.price}</span>
                          </div>

                          <button 
                            onClick={() => handleAddToCart(item.id)}
                            className="w-full py-3 bg-[#F9F6F0] hover:bg-[#4E641A] hover:text-[#F9F6F0] text-[#4E641A] border border-[#EAE4D8] text-xs font-bold uppercase tracking-widest rounded-xl transition duration-200 cursor-pointer shadow-xxs"
                          >
                            {addedItems[item.id] ? 'Added ✓' : 'Add Again'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB 8: ACCOUNT SETTINGS */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'settings' && (
                  <div className="space-y-8 text-left">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Profile Credentials & Preferences ⚙️</h3>
                      <p className="text-xs text-stone-600 font-medium">Update saved personal specifications and logistics routing schedules.</p>
                    </div>

                    <div className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 md:p-8 space-y-6 shadow-sm">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="text-left">
                          <label className="block text-[9px] font-extrabold uppercase text-stone-400 tracking-wider mb-2">Registered Email Address</label>
                          <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-stone-500 font-bold text-xs select-none">
                            <Mail className="w-4.5 h-4.5 mr-2.5 text-stone-400" />
                            <span>{user.email}</span>
                            <span className="ml-auto text-[8px] font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">VERIFIED</span>
                          </div>
                        </div>

                        <div className="text-left">
                          <label className="block text-[9px] font-extrabold uppercase text-stone-400 tracking-wider mb-2">Customer Name</label>
                          <input
                            type="text"
                            defaultValue={user.name || ''}
                            className="w-full bg-[#F9F6F0] border border-stone-200 focus:border-[#4E641A] rounded-xl py-3.5 px-4 font-sans text-xs focus:outline-none text-stone-850 font-semibold transition"
                          />
                        </div>
                      </div>

                      <div className="pt-5 border-t border-stone-100 text-left">
                        <h4 className="font-serif text-sm font-bold text-[#2F3B0C] mb-4 flex items-center">
                          <Sliders className="w-4 h-4 mr-2 text-[#C68A2B]" />
                          Delivery Preferences
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="text-left">
                            <label className="block text-[9px] font-extrabold uppercase text-stone-400 tracking-wider mb-2">Preferred Delivery Window</label>
                            <select className="w-full bg-[#F9F6F0] border border-stone-200 focus:border-[#4E641A] rounded-xl py-3 px-4 font-sans text-xs focus:outline-none text-stone-850 font-semibold cursor-pointer transition">
                              <option>Early Morning (6:00 AM - 9:00 AM)</option>
                              <option>Mid-Day (11:00 AM - 2:00 PM)</option>
                              <option>Evening (5:00 PM - 8:00 PM)</option>
                            </select>
                          </div>

                          <div className="text-left flex flex-col justify-center">
                            <label className="block text-[9px] font-extrabold uppercase text-stone-400 tracking-wider mb-2">SMS Crop Restock Alerts</label>
                            <div className="flex items-center space-x-2.5 py-2">
                              <input
                                type="checkbox"
                                id="settingsCropNotif"
                                defaultChecked
                                className="h-4.5 w-4.5 rounded border-stone-300 text-[#4E641A] focus:ring-[#4E641A] cursor-pointer"
                              />
                              <label htmlFor="settingsCropNotif" className="text-xs font-bold text-stone-600 cursor-pointer">
                                Receive direct harvest restock alerts via SMS
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-stone-100">
                        <button 
                          type="button"
                          onClick={() => modal.alert('Settings Saved', 'Your account preferences and notifications schedule have been updated successfully.', 'success')}
                          className="px-6 py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm"
                        >
                          Update Preferences
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB 9: HELP CENTER */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'help' && (
                  <div className="space-y-8 text-left">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Suryodaya Support Center 🌾</h3>
                      <p className="text-xs text-stone-600 font-medium">Need help with shipping coordinates, payments, or native crop returns?</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Contact card */}
                      <div className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 space-y-4 shadow-sm text-left flex flex-col justify-between">
                        <div className="space-y-3">
                          <h4 className="font-serif text-base font-bold text-[#2F3B0C] pb-2 border-b border-stone-100">Direct Support Farmers</h4>
                          <p className="text-xs text-stone-600 leading-relaxed font-medium">
                            Our agronomy support team is online from **8:00 AM to 8:00 PM** daily. Connect directly for quick queries.
                          </p>
                          
                          <div className="space-y-3 text-xs font-semibold text-stone-700 pt-2">
                            <div className="flex items-center space-x-2.5">
                              <span className="text-[#C68A2B] text-base">🌿</span>
                              <span>WhatsApp assistance: **{settings.phone}**</span>
                            </div>
                            <div className="flex items-center space-x-2.5">
                              <span className="text-[#C68A2B] text-base">✉</span>
                              <span>Logistics Support: **{settings.email}**</span>
                            </div>
                          </div>
                        </div>

                        <a
                          href={`https://wa.me/${settings.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition duration-200 cursor-pointer shadow-sm mt-4 inline-block text-center align-middle leading-[2.5]"
                        >
                          Start WhatsApp Assistance
                        </a>
                      </div>

                      {/* FAQs accordion */}
                      <div className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 space-y-4 shadow-sm text-left">
                        <h4 className="font-serif text-base font-bold text-[#2F3B0C] pb-2 border-b border-stone-100">Quick FAQ Memo</h4>
                        <div className="space-y-4 text-xs">
                          {[
                            { q: 'How are unrefined oils shipped?', a: 'All wood pressed mustard, sesame, and peanut oils are decanted in food-grade tin canisters and dispatched via express vans to prevent temperature locks.' },
                            { q: 'Can I cancel an active delivery progress?', a: 'Deliveries can be cancelled or rescheduled up to 12 hours before arrival by chatting with support.' },
                            { q: 'How does the Gold Sprout tier benefit me?', a: 'Enjoy exclusive native vouchers, early harvest access, and direct WhatsApp farmer helpdesk support.' }
                          ].map((faq, fIdx) => (
                            <div key={fIdx} className="space-y-1">
                              <span className="font-bold text-[#2F3B0C] block">Q: {faq.q}</span>
                              <span className="text-stone-500 leading-relaxed block font-medium">A: {faq.a}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Invoice Details Modal Overlay */}
      <AnimatePresence>
        {activeInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveInvoice(null)}
              className="absolute inset-0 bg-[#2F3B0C]/40 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white border border-[#EAE4D8] rounded-[28px] p-6 md:p-8 w-full max-w-lg shadow-2xl z-10 text-left space-y-6"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-[#C68A2B]" />
                  <span className="font-serif text-base font-bold text-[#2F3B0C]">Suryodaya Farms Receipt</span>
                </div>
                <button 
                  onClick={() => setActiveInvoice(null)}
                  className="text-stone-400 hover:text-stone-700 font-extrabold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs font-medium text-stone-600">
                <div className="flex justify-between border-b border-stone-100 pb-2">
                  <span>Order reference</span>
                  <span className="font-mono font-bold text-stone-850">{activeInvoice.orderNumber}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-2">
                  <span>Authorized Date</span>
                  <span className="text-stone-850 font-bold">{new Date(activeInvoice.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-2">
                  <span>Payment Gateway</span>
                  <span className="text-stone-850 font-bold">{activeInvoice.paymentMethod} • {activeInvoice.paymentStatus}</span>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[9px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">SHIPPED HARVESTS</span>
                  {activeInvoice.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#F9F6F0] p-3 rounded-xl border border-[#EAE4D8]">
                      <span className="font-semibold">{item.emoji} {item.name} ({item.weight}) x{item.quantity}</span>
                      <span className="font-bold text-[#2F3B0C]">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-between items-center text-sm border-t border-stone-100">
                  <span className="font-serif font-bold text-[#2F3B0C]">Total Investment</span>
                  <span className="font-extrabold text-[#4E641A] text-base">₹{activeInvoice.totalAmount}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  modal.alert('PDF Downloaded', 'Compiling PDF download log has completed.', 'success');
                  setActiveInvoice(null);
                }}
                className="w-full py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition duration-200 cursor-pointer shadow-sm"
              >
                Download PDF Copy
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern agricultural footer */}
      <footer className="bg-white border-t border-[#EAE4D8] py-8 text-center text-xs text-stone-400 font-semibold mt-auto px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-[#4E641A]">🌱</span>
            <span>Nurturing Soil, Delivering Health. Suryodaya Farms © 2026</span>
          </div>
          <div className="flex space-x-4">
            <a href="/about" className="hover:text-[#4E641A] transition">About Us</a>
            <a href="/products" className="hover:text-[#4E641A] transition">Catalog</a>
            <a href="/help" className="hover:text-[#4E641A] transition">Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
