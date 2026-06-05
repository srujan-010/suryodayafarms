import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useModalStore } from '../store/useModalStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { 
  FiUser, 
  FiMapPin, 
  FiShoppingBag, 
  FiBell, 
  FiSettings, 
  FiLogOut, 
  FiPlus, 
  FiTrash2, 
  FiCheck, 
  FiInfo, 
  FiHeart, 
  FiTag, 
  FiClock, 
  FiStar, 
  FiActivity, 
  FiArrowUpRight, 
  FiTruck, 
  FiDownload, 
  FiRefreshCw, 
  FiSliders, 
  FiHelpCircle, 
  FiMail, 
  FiLock,
  FiPackage,
  FiShield,
  FiCompass,
  FiAward
} from 'react-icons/fi';
import { GiSun } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import UnifiedUploader from '../components/UnifiedUploader';

const getDeliveryStep = (status) => {
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAuthChecked, setLoginRequiredModalOpen, checkAuth } = useAuthStore();
  const { clearCart, addItem } = useCartStore();
  const { wishlistItems, toggleWishlist, fetchWishlist } = useWishlistStore();
  const modal = useModalStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [addedItems, setAddedItems] = useState({});

  // Addresses and Orders state
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);


  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const saved = localStorage.getItem('recentlyViewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const getTimelineSteps = (order) => {
    return [
      { label: 'Placed', icon: FiShoppingBag },
      { label: 'Confirmed', icon: FiShield },
      { label: 'Prepared', icon: FiPackage },
      { label: 'Shipped', icon: FiTruck },
      { label: 'In Transit', icon: FiClock },
      { label: 'Out for Delivery', icon: FiCompass },
      { label: 'Delivered', icon: FiAward }
    ];
  };

  const getCurrentStepIndex = (order, steps) => {
    if (!order || !steps || steps.length === 0) return 0;
    const status = (order.logistics?.status || order.status || '').toUpperCase().trim();
    
    if (status === 'PENDING' || status === 'PLACED') return 0;
    if (status === 'CONFIRMED') return 1;
    if (status === 'PROCESSING' || status === 'PREPARED') return 2;
    if (status === 'SHIPPED') return 3;
    if (status === 'TRANSIT' || status === 'IN_TRANSIT' || status === 'IN TRANSIT') return 4;
    if (status === 'OUT_FOR_DELIVERY' || status === 'OUT OF DELIVERY') return 5;
    if (status === 'DELIVERED') return 6;
    if (status === 'CANCELLED') return -1;
    
    return 0;
  };

  const currentOrder = orders[0];
  const stepsList = currentOrder ? getTimelineSteps(currentOrder) : [];
  const currentStepNum = currentOrder ? getCurrentStepIndex(currentOrder, stepsList) : 0;
  const isCancelled = currentOrder?.status === 'CANCELLED';

  const getETA = (order) => {
    if (!order) return '';
    const status = (order.status || '').toUpperCase().trim();
    const isDispatched = ['SHIPPED', 'IN TRANSIT', 'IN_TRANSIT', 'TRANSIT', 'DELIVERED', 'OUT_FOR_DELIVERY'].includes(status);
    
    if (status === 'DELIVERED') {
      const deliveryDate = new Date(order.updatedAt || Date.now());
      return `Delivered on ${deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at ${deliveryDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    if (isDispatched) {
      const estDate = order.logistics?.estimatedDeliveryDate || order.estimatedDelivery;
      if (estDate) {
        const etaDate = new Date(estDate);
        return `Scheduled Arrival: ${etaDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • 6:00 AM - 9:00 AM`;
      }
      const createdDate = new Date(order.createdAt);
      const etaDate = new Date(createdDate.getTime() + 2 * 24 * 60 * 60 * 1000);
      return `Scheduled Arrival: ${etaDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • 6:00 AM - 9:00 AM`;
    }
    
    return "Preparing your harvest. Delivery schedule will be available soon.";
  };

  const getStepTimestamp = (order, stepIdx, steps) => {
    if (!order || !steps || order.status === 'CANCELLED') return '';
    const createdTime = new Date(order.createdAt);
    const step = getCurrentStepIndex(order, steps);
    if (stepIdx > step) return '';
    
    if (stepIdx === 0) {
      return createdTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (stepIdx === steps.length - 1 && step === steps.length - 1) {
      const delTime = new Date(order.updatedAt || order.createdAt);
      return delTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    return '';
  };

  // No fallback mock configurations to ensure brand-new accounts see 0 counts
  
  // New Address form state
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
  const [addressError, setAddressError] = useState(null);
  const [activeInvoice, setActiveInvoice] = useState(null);

  useEffect(() => {
    if (!isAuthChecked) return;

    if (!isAuthenticated) {
      navigate('/');
      setLoginRequiredModalOpen(true);
    }
  }, [isAuthenticated, isAuthChecked, navigate, setLoginRequiredModalOpen]);

  // Sync profile details when user changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileAvatar(user.avatarUrl || '');
    }
  }, [user]);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSettingsMessage('');
    setIsSavingSettings(true);
    try {
      const response = await api.put('/auth/profile', {
        name: profileName,
        avatarUrl: profileAvatar
      });
      if (response.success) {
        setSettingsMessage('Preferences saved successfully.');
        await checkAuth();
      }
    } catch (err) {
      setSettingsMessage(err.message || 'Failed to save preferences.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Load customer data when Dashboard mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
      fetchOrders();
      fetchNotifications();
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/auth/addresses');
      if (response.addresses) {
        setAddresses(response.addresses);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/history');
      if (response.orders) {
        setOrders(response.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/auth/notifications');
      if (response.success && response.notifications) {
        setNotifications(response.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressError(null);
    try {
      await api.post('/auth/addresses', addressForm);
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
    } catch (err) {
      setAddressError(err.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/auth/addresses/${id}`);
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    clearCart();
    navigate('/');
  };

  const handleAddToCart = (id) => {
    setAddedItems(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const getInitials = (name) => {
    if (!name) return 'SF';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex flex-col items-center justify-center pt-20 text-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <GiSun className="text-[#C68A2B] text-5xl animate-spin-slow" />
          <span className="font-serif text-sm font-semibold text-[#2F3B0C] uppercase tracking-widest animate-pulse">Verifying Premium Membership Session...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Tabs layout mappings
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: FiSliders },
    { id: 'orders', label: 'My Shipments', icon: FiShoppingBag, badge: orders.length },
    { id: 'wishlist', label: 'Wishlist', icon: FiHeart, badge: wishlistItems.length },
    { id: 'addresses', label: 'Saved Coordinates', icon: FiMapPin },
    { id: 'notifications', label: 'Notifications', icon: FiBell, badge: notifications.filter(n => !n.isRead).length || undefined },
    { id: 'viewed', label: 'Recently Browsed', icon: FiClock },
    { id: 'settings', label: 'Preferences', icon: FiSettings },
    { id: 'help', label: 'Support Center', icon: FiHelpCircle }
  ];

  return (
    <div className="min-h-screen bg-[#F9F6F0] pt-28 pb-16 px-4 md:px-8 relative overflow-x-hidden text-[#1E1E1E]">
      
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

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 items-start">
        
        {/* Sticky Left Navigation Sidebar with Premium Glassmorphism */}
        <aside className="w-full lg:w-[300px] bg-white border border-[#EAE4D8] rounded-[32px] p-4 lg:p-6 shrink-0 lg:sticky lg:top-28 shadow-sm text-left">
          {/* Avatar Section */}
          <div className="flex lg:flex-col items-center justify-between lg:justify-center text-center pb-4 lg:pb-6 border-b border-[#EAE4D8] mb-4 lg:mb-6 w-full">
            <div className="flex items-center lg:flex-col gap-3 lg:gap-0">
              <div className="relative w-12 h-12 lg:w-20 lg:h-20 rounded-full bg-gradient-to-tr from-[#2F3B0C] to-[#4E641A] flex items-center justify-center text-[#F9F6F0] text-sm lg:text-2xl font-bold shadow-md border-2 lg:border-4 border-white overflow-hidden group shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition duration-300" />
                ) : (
                  <span className="relative z-10 group-hover:scale-105 transition duration-300">{getInitials(user.name || '')}</span>
                )}
                <div className="absolute inset-0 bg-[#C68A2B]/10 opacity-30 blur-sm" />
              </div>
              <div className="text-left lg:text-center">
                <h3 className="font-serif text-sm lg:text-lg font-extrabold text-[#2F3B0C] leading-snug truncate max-w-[150px] sm:max-w-xs">
                  {user.name || 'Premium Member'}
                </h3>
                <p className="text-[8px] lg:text-[10px] tracking-widest uppercase font-extrabold text-[#C68A2B] mt-0.5 lg:mt-1.5 flex items-center bg-[#C68A2B]/5 px-2 py-0.5 rounded-full border border-[#C68A2B]/10 w-fit">
                  Gold Sprout 🌿
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-row overflow-x-auto no-scrollbar scroll-smooth gap-2 pb-2 lg:flex-col lg:overflow-x-visible lg:gap-1.5 w-full">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-between font-sans text-xs font-bold py-2.5 lg:py-3.5 px-3 lg:px-4 rounded-2xl transition-all duration-300 cursor-pointer relative group shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#4E641A] text-white shadow-sm'
                      : 'text-stone-600 hover:bg-[#F9F6F0] hover:text-[#2F3B0C]'
                  }`}
                >
                  <div className="flex items-center gap-2 lg:gap-3.5">
                    <item.icon className={`w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-[#C68A2B]' : 'text-stone-400 group-hover:text-[#4E641A]'
                    }`} />
                    <span className="tracking-wider uppercase text-[8px] lg:text-[9px]">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ml-1.5 ${
                      isActive ? 'bg-[#C68A2B] text-[#2F3B0C]' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#C68A2B] rounded-r-full hidden lg:block" />
                  )}
                </button>
              );
            })}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 lg:gap-3.5 font-sans text-xs font-extrabold py-2.5 lg:py-3.5 px-3 lg:px-4 rounded-2xl text-red-650 hover:bg-red-50 transition duration-300 lg:mt-6 cursor-pointer border border-transparent hover:border-red-100 shrink-0 whitespace-nowrap"
            >
              <FiLogOut className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" />
              <span className="tracking-wider uppercase text-[8px] lg:text-[9px]">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Right Side Content Panel */}
        <div className="flex-grow w-full min-h-[500px] text-left">
          
          {/* TAB 1: OVERVIEW / DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-10">
              
              {/* Premium Welcome Banner */}
              <div className="relative bg-gradient-to-r from-[#2F3B0C] to-[#4E641A] rounded-[32px] p-6 md:p-10 text-[#F9F6F0] overflow-hidden border border-[#EAE4D8] shadow-md">
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#C68A2B]/20 blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-3.5 max-w-xl">
                    <span className="inline-flex items-center font-sans text-[9px] font-extrabold tracking-widest uppercase text-[#C68A2B] bg-[#C68A2B]/10 px-3.5 py-1.5 rounded-full border border-[#C68A2B]/20">
                      🌿 Sustainable E-Commerce Member
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight text-white">
                      Namaste, {user.name?.split(' ')[0] || 'Premium Member'}
                    </h2>
                    <p className="text-xs md:text-sm text-stone-300 font-medium leading-relaxed">
                      Thank you for putting Soil First. Discover premium native staples, cold-pressed oils, and raw forest honey directly from sustainable local farms.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 min-w-[220px] shrink-0 text-left shadow-sm">
                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                      <span className="text-[9px] font-extrabold tracking-widest uppercase text-stone-200">MEMBERSHIP TIER</span>
                      <SparklesIcon className="w-4 h-4 text-[#C68A2B]" />
                    </div>
                    <span className="text-3xl font-serif font-extrabold text-white block leading-none">Gold Sprout</span>
                    <span className="text-[9px] text-[#C68A2B] font-extrabold uppercase tracking-widest block mt-2">Premium Member • Since 2026</span>
                  </div>
                </div>
              </div>

              {/* Stats Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { label: 'Total Shipments', value: orders.length, detail: 'Farm deliveries', icon: FiShoppingBag, color: 'from-[#4E641A]/5 to-[#EAE4D8]/10' },
                  { label: 'Wishlist Crops', value: wishlistItems.length, detail: 'Saved harvests', icon: FiHeart, color: 'from-[#EAE4D8]/20 to-[#C68A2B]/5' },
                  { label: 'Saved Coordinates', value: addresses.length, detail: 'Delivery points', icon: FiMapPin, color: 'from-[#4E641A]/5 to-[#EAE4D8]/15' }
                ].map((card, idx) => (
                  <div key={idx} className={`bg-gradient-to-br ${card.color} border border-[#EAE4D8] rounded-[24px] p-5 flex flex-col justify-between h-[135px] shadow-xxs hover:shadow-md transition duration-300`}>
                    <div className="flex items-center justify-between text-stone-500">
                      <span className="text-[9px] font-extrabold tracking-wider uppercase text-stone-400">{card.label}</span>
                      <card.icon className="w-5 h-5 text-[#4E641A]" />
                    </div>
                    <div className="text-left mt-3">
                      <span className="font-serif text-3xl font-bold text-[#2F3B0C] block leading-none">{card.value}</span>
                      <span className="text-[9px] text-stone-400 block font-semibold mt-1">{card.detail}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stepper active order tracker */}
              {orders.length > 0 ? (
                <div className="bg-white border border-[#EAE4D8] rounded-[32px] p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
                  
                  {/* Floating Gold Sprout Particles for DELIVERED Success State */}
                  {currentOrder?.status === 'DELIVERED' && (
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
                      <FiTruck className="w-5 h-5 mr-2 text-[#C68A2B] animate-pulse" />
                      Live Delivery Tracker
                    </h4>
                    
                    <div className="flex items-center space-x-2">
                      {currentOrder?.status === 'OUT_FOR_DELIVERY' && (
                        <span className="text-[9px] font-extrabold tracking-widest text-[#C68A2B] uppercase bg-[#C68A2B]/10 border border-[#C68A2B]/20 px-2.5 py-1 rounded-full animate-pulse">
                          🛵 Out for Delivery
                        </span>
                      )}
                      {currentOrder?.status === 'DELIVERED' && (
                        <span className="text-[9px] font-extrabold tracking-widest text-green-700 uppercase bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                          🌿 Delivered Successfully
                        </span>
                      )}
                      {currentOrder?.status === 'CANCELLED' && (
                        <span className="text-[9px] font-extrabold tracking-widest text-red-600 uppercase bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                          ❌ Cancelled
                        </span>
                      )}
                      <span className={`text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full border ${
                        currentOrder?.status === 'DELIVERED' 
                          ? 'bg-green-700 text-white border-green-700' 
                          : currentOrder?.status === 'CANCELLED'
                            ? 'bg-red-600 text-white border-red-600'
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
                        <div className="sm:text-right space-y-1 font-sans">
                          <span className="text-[9px] font-extrabold tracking-widest text-stone-400 uppercase block">
                            {currentStepNum < 3 ? "SHIPMENT STATUS" : "ESTIMATED HARVEST DELIVERY"}
                          </span>
                          <span className="font-sans text-xs font-bold text-[#4E641A] flex items-center sm:justify-end gap-1.5 font-semibold">
                            {!isCancelled && currentStepNum >= 3 && currentStepNum < stepsList.length - 1 && (
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block shrink-0" />
                            )}
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
                            animate={{ width: isCancelled ? "0%" : `calc(${(currentStepNum / (stepsList.length - 1 || 1)) * 100}% - 12px)` }}
                            transition={{ type: "spring", stiffness: 40, damping: 12 }}
                          />

                          {/* Moving Truck along the active path */}
                          {!isCancelled && currentStepNum > 0 && currentStepNum < stepsList.length - 1 && (
                            <motion.div
                              className="absolute top-[28px] z-20 text-[#4E641A] bg-white p-1 rounded-full border border-[#EAE4D8] shadow-md flex items-center justify-center cursor-default"
                              initial={{ left: "6%" }}
                              animate={{ 
                                left: `calc(6% + ${(currentStepNum / (stepsList.length - 1 || 1)) * 88}% - 14px)`,
                                y: ["-50%", "-60%", "-50%"]
                              }}
                              transition={{ 
                                left: { type: "spring", stiffness: 40, damping: 12 },
                                y: { repeat: Infinity, duration: 1.6, ease: "easeInOut" }
                              }}
                            >
                              <FiTruck className="w-3.5 h-3.5 text-[#C68A2B]" />
                            </motion.div>
                          )}

                          {/* Step Nodes Loop */}
                          {stepsList.map((stop, sIdx) => {
                            const isDone = !isCancelled && currentStepNum >= sIdx;
                            const isCurrent = !isCancelled && currentStepNum === sIdx;
                            const StepIcon = stop.icon;
                            
                            return (
                              <div 
                                key={sIdx} 
                                className="absolute top-[28px] -translate-y-1/2 flex flex-col items-center select-none"
                                style={{ left: `calc(6% + ${(sIdx / (stepsList.length - 1 || 1)) * 88}%)`, transform: "translate(-50%, -50%)" }}
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
                                    isCancelled
                                      ? 'bg-stone-100 border-stone-200 text-stone-400'
                                      : isDone 
                                        ? 'bg-[#4E641A] border-[#4E641A] text-white shadow-sm' 
                                        : isCurrent 
                                          ? 'bg-white border-[#C68A2B] text-[#C68A2B] ring-2 ring-[#C68A2B]/10 font-bold' 
                                          : 'bg-white border-[#EAE4D8] text-stone-400'
                                  }`}
                                  whileHover={isCancelled ? {} : { scale: 1.05 }}
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
                                    isCancelled
                                      ? 'text-stone-400'
                                      : isCurrent ? 'text-[#C68A2B]' : isDone ? 'text-[#2F3B0C]' : 'text-stone-400'
                                  }`}>
                                    {stop.label}
                                  </span>
                                  {getStepTimestamp(currentOrder, sIdx, stepsList) && (
                                    <span className="text-[8px] font-extrabold text-stone-400 block tracking-tight">
                                      {getStepTimestamp(currentOrder, sIdx, stepsList)}
                                    </span>
                                  )}
                                </div>

                              </div>
                            );
                          })}

                        </div>
                      </div>

                      {/* Premium DELIVERED Success Card */}
                      {currentOrder.status === 'DELIVERED' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 15, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 100, damping: 15 }}
                          className="mt-14 bg-gradient-to-r from-[#4E641A]/5 via-[#C68A2B]/10 to-[#4E641A]/5 border border-[#C68A2B]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
                        >
                          <div className="flex items-center space-x-3.5 text-left">
                            <div className="w-10 h-10 rounded-full bg-[#C68A2B]/15 text-[#C68A2B] flex items-center justify-center shrink-0 shadow-sm animate-bounce">
                              <FiAward className="w-5 h-5 text-[#C68A2B]" />
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

                      {/* Shipment Tracking Details or Placeholder */}
                      {isCancelled ? (
                        /* Cancelled order display placeholder card */
                        <div className="mt-8 bg-red-50/30 border border-red-200/50 rounded-2xl p-6 text-center flex flex-col items-center gap-3 shadow-xxs">
                          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-lg border border-red-100">
                            <span className="font-extrabold text-sm">✕</span>
                          </div>
                          <div className="space-y-1">
                            <h5 className="font-serif text-sm font-bold text-red-800">Order Cancelled</h5>
                            <p className="text-[10px] text-stone-500 font-medium leading-relaxed">This order has been cancelled and will not be shipped.</p>
                          </div>
                        </div>
                      ) : !['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(currentOrder.status) ? (
                        /* Placeholder section for before dispatch */
                        <div className="mt-8 bg-[#FDFBF9] border border-[#EAE4D8]/80 rounded-2xl p-6 text-center flex flex-col items-center gap-3 shadow-xxs">
                          <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center text-[#B8833E]/60 text-lg border border-stone-200/50">
                            <FiClock className="animate-pulse" />
                          </div>
                          <div className="space-y-1">
                            <h5 className="font-serif text-sm font-bold text-[#2F3B0C]">Shipment Tracking</h5>
                            <p className="text-[10px] text-stone-500 font-medium leading-relaxed">Tracking details will be available after dispatch.</p>
                          </div>
                        </div>
                      ) : (
                        /* Dispatched Active Shipment Tracking Layout */
                        <div className="mt-8 bg-white border border-[#EAE4D8] rounded-[24px] p-5 md:p-6 text-left space-y-5 shadow-xxs">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                            <div className="flex items-center gap-3">
                              {/* Dynamic Company Logo/Icon */}
                              <div className="w-10 h-10 rounded-xl bg-[#4E641A]/5 border border-[#4E641A]/10 flex items-center justify-center text-lg text-[#4E641A] font-serif font-extrabold shadow-sm shrink-0">
                                {currentOrder.logistics?.courierName ? currentOrder.logistics.courierName.charAt(0).toUpperCase() : '📦'}
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 block">Courier Partner</span>
                                <h5 className="font-serif text-sm font-extrabold text-[#2F3B0C]">{currentOrder.logistics?.courierName || 'Standard Logistics'}</h5>
                              </div>
                            </div>
                            
                            {/* Shipment Status Badge */}
                            <span className="bg-[#4E641A]/10 text-[#4E641A] border border-[#4E641A]/20 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-widest text-[9px] shrink-0">
                              {currentOrder.logistics?.status || currentOrder.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-stone-600 font-sans">
                            {/* Tracking Number / AWB */}
                            <div className="space-y-1 text-left">
                              <span className="text-[9px] font-extrabold tracking-wider uppercase text-stone-400 block">Tracking Number / AWB</span>
                              <span className="font-mono font-bold text-stone-850 text-[11px] bg-stone-50 border border-stone-200/50 px-2.5 py-1 rounded-md inline-block">
                                {currentOrder.logistics?.trackingNumber || 'Not Provided'}
                              </span>
                            </div>

                            {/* Dispatch Date */}
                            <div className="space-y-1 text-left">
                              <span className="text-[9px] font-extrabold tracking-wider uppercase text-stone-400 block">Dispatch Date</span>
                              <span className="font-bold text-stone-850 block">
                                {currentOrder.logistics?.dispatchDate ? new Date(currentOrder.logistics.dispatchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending Dispatch'}
                              </span>
                            </div>

                            {/* Estimated Delivery Date */}
                            <div className="space-y-1 text-left">
                              <span className="text-[9px] font-extrabold tracking-wider uppercase text-stone-400 block">Estimated Delivery Date</span>
                              <span className="font-bold text-stone-850 block">
                                {currentOrder.logistics?.estimatedDeliveryDate ? new Date(currentOrder.logistics.estimatedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (currentOrder.estimatedDelivery ? new Date(currentOrder.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Calculating...')}
                              </span>
                            </div>
                          </div>

                          {/* Action Tracking CTA Button */}
                          {currentOrder.logistics?.trackingUrl && (
                            <div className="pt-3 border-t border-stone-100 flex justify-end">
                              <a
                                href={currentOrder.logistics.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto px-6 py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition duration-300 shadow-sm text-center flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <FiArrowUpRight className="w-4 h-4 text-[#C68A2B]" /> Track Shipment
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Premium empty state card when there are no deliveries active */
                <div className="bg-white border border-[#EAE4D8] rounded-[32px] p-8 md:p-12 text-center flex flex-col items-center gap-6 shadow-sm my-2 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#C68A2B]/5 blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#4E641A]/5 blur-2xl pointer-events-none" />
                  
                  <div className="w-20 h-20 rounded-full bg-[#C68A2B]/5 border border-[#C68A2B]/10 flex items-center justify-center text-4xl shadow-inner shrink-0 relative">
                    <FiShoppingBag className="text-[#C68A2B]" />
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <h4 className="font-serif text-lg md:text-xl font-bold text-[#2F3B0C] leading-snug">No Active Deliveries</h4>
                    <p className="text-stone-500 font-sans text-xs font-medium leading-relaxed">
                      You do not have any active shipments running. Buy unrefined oils, organic honey, and native grains to start your sustainable diet journey!
                    </p>
                  </div>
                  <button onClick={() => navigate('/products')} className="px-6 py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer border-none scale-100 hover:scale-[1.02] active:scale-[0.98]">
                    <span>Start Shopping</span>
                  </button>
                </div>
              )}


            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-1.5">
                <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Your Direct Farm Shipments 📦</h3>
                <p className="text-xs text-stone-600 font-medium">Track your active delivery timelines and download receipt invoices.</p>
              </div>

              {orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const firstItem = order.orderItems?.[0];
                    const product = firstItem?.product;
                    const productImg = product?.images?.[0]?.url || product?.hoverImage || product?.image;
                    const totalItems = order.orderItems?.length || 0;
                    
                    const histStepsList = getTimelineSteps(order);
                    const histStep = getCurrentStepIndex(order, histStepsList);
                    const isCancelled = order.status === 'CANCELLED';
                    
                    const progressPercent = isCancelled ? 0 : (histStep / (histStepsList.length - 1)) * 100;

                    return (
                      <div key={order.id} className="bg-white border border-[#EAE4D8] rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-5 items-center justify-between text-left">
                        
                        {/* Left: Product Thumbnail & Name Info */}
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F9F6F0] border border-[#EAE4D8] flex items-center justify-center shrink-0 shadow-xxs">
                            {productImg ? (
                              <img src={productImg} alt={product?.name || 'Product'} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl">🌱</span>
                            )}
                          </div>
                          
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="font-mono text-[10px] font-bold text-stone-500 bg-stone-50 border border-stone-200/50 px-2 py-0.5 rounded">
                                {order.orderNumber}
                              </span>
                              <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                                order.status === 'DELIVERED'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : isCancelled
                                    ? 'bg-red-50 text-red-650 border-red-200'
                                    : 'bg-[#C68A2B]/10 text-[#C68A2B] border-[#C68A2B]/20'
                              }`}>
                                {order.status}
                              </span>
                            </div>

                            <h4 className="font-serif text-sm font-bold text-[#2F3B0C] truncate max-w-xs md:max-w-md">
                              {product?.name || 'Organic Harvest'}
                              {totalItems > 1 && (
                                <span className="text-stone-400 font-sans text-xs font-semibold ml-1">
                                  + {totalItems - 1} more item{totalItems > 2 ? 's' : ''}
                                </span>
                              )}
                            </h4>
                            
                            <p className="text-[10px] text-stone-400 font-semibold flex items-center gap-1.5 flex-wrap">
                              <span>Placed: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                              <span>•</span>
                              <span className="text-[#4E641A] font-bold">{getETA(order)}</span>
                            </p>
                          </div>
                        </div>

                        {/* Right: Progress, Pricing & CTA Actions */}
                        <div className="flex flex-col md:items-end justify-between gap-4 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-stone-100">
                          <div className="flex items-center justify-between md:justify-end gap-6 w-full">
                            {/* Tiny progress journey tracker */}
                            <div className="flex flex-col gap-1 w-24 md:w-32">
                              <div className="flex justify-between text-[8px] font-extrabold text-stone-400 uppercase tracking-widest">
                                <span>Journey</span>
                                <span>{isCancelled ? 'Cancelled' : `${Math.round(progressPercent)}%`}</span>
                              </div>
                              <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden border border-stone-200/20">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isCancelled ? 'bg-red-500' : 'bg-[#4E641A]'
                                  }`} 
                                  style={{ width: `${progressPercent}%` }} 
                                />
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <span className="font-serif text-lg font-extrabold text-[#4E641A] block">
                                ₹{order.totalAmount}
                              </span>
                            </div>
                          </div>

                          {/* Quick Actions Buttons */}
                          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                            <button 
                              onClick={() => navigate(`/profile/shipments/${order.id}`)}
                              className="px-3.5 py-2 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
                            >
                              View Details
                            </button>
                            <button 
                              onClick={() => setActiveInvoice(order)} 
                              className="px-3.5 py-2 border border-[#EAE4D8] text-stone-700 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-stone-50 transition cursor-pointer flex items-center gap-1"
                            >
                              <FiDownload /> Invoice
                            </button>
                            <button 
                              onClick={async () => {
                                for (const item of order.orderItems || []) {
                                  await addItem(item.productId, item.variantId || null, item.quantity);
                                }
                                navigate('/cart');
                              }}
                              className="px-3.5 py-2 border border-[#EAE4D8] text-[#4E641A] text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#4E641A]/5 transition cursor-pointer flex items-center gap-1"
                            >
                              <FiRefreshCw /> Reorder
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Premium empty state card */
                <div className="bg-white border border-[#EAE4D8] rounded-[32px] py-16 px-6 text-center flex flex-col items-center gap-6 shadow-sm max-w-xl mx-auto my-6 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#C68A2B]/5 blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#4E641A]/5 blur-2xl pointer-events-none" />
                  
                  <div className="w-20 h-20 rounded-full bg-[#4E641A]/5 border border-[#4E641A]/10 flex items-center justify-center text-4xl shadow-inner shrink-0 relative">
                    <FiShoppingBag className="text-[#4E641A]" />
                  </div>
                  <div className="space-y-2 max-w-xs mx-auto">
                    <h3 className="font-serif text-xl font-bold text-[#2F3B0C]">No orders yet</h3>
                    <p className="text-stone-500 font-sans text-xs leading-relaxed">
                      You haven't ordered any organic harvest items yet. Direct farm unrefined staples await your kitchen!
                    </p>
                  </div>
                  <button onClick={() => navigate('/products')} className="px-6 py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer border-none scale-100 hover:scale-[1.02] active:scale-[0.98]">
                    <span>Start Shopping</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Wishlist Bookmarks ❤️</h3>
              {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {wishlistItems.map((item) => {
                    const product = item.product;
                    if (!product) return null;
                    const productImg = product.images?.length > 0 ? product.images[0].url : product.image;
                    return (
                      <div key={item.id} className="bg-white border border-[#EAE4D8] rounded-[24px] p-5 flex justify-between gap-4 shadow-xxs">
                        <div className="flex gap-4 items-center text-left">
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center bg-stone-50 border border-[#EAE4D8] shrink-0">
                            {productImg ? (
                              <img src={productImg} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl">🌱</span>
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-serif font-bold text-[#2F3B0C] block leading-none">{product.name}</span>
                            <span className="text-[9px] text-stone-400 font-bold block uppercase mt-1">{product.weight || '500 ml'}</span>
                            <span className="font-extrabold text-[#4E641A] block pt-1">₹{product.price}</span>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between items-end shrink-0">
                          <button onClick={() => toggleWishlist(product.id)} className="text-stone-400 hover:text-red-650 cursor-pointer"><FiTrash2 size={16} /></button>
                          <button onClick={() => {
                            addItem(product.id, null, 1);
                            setAddedItems(prev => ({ ...prev, [product.id]: true }));
                            setTimeout(() => {
                              setAddedItems(prev => ({ ...prev, [product.id]: false }));
                            }, 2000);
                          }} className="px-3 py-1.5 bg-[#4E641A] text-white text-[9px] font-bold uppercase rounded-lg cursor-pointer">
                            {addedItems[product.id] ? 'Added ✓' : 'Add To Cart'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Premium empty state card */
                <div className="bg-white border border-[#EAE4D8] rounded-[32px] py-16 px-6 text-center flex flex-col items-center gap-6 shadow-sm max-w-xl mx-auto my-6 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#C68A2B]/5 blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#4E641A]/5 blur-2xl pointer-events-none" />
                  
                  <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-inner shrink-0 relative animate-pulse">
                    <FiHeart />
                  </div>
                  <div className="space-y-2 max-w-xs mx-auto">
                    <h3 className="font-serif text-xl font-bold text-[#2F3B0C]">Your wishlist is empty</h3>
                    <p className="text-stone-500 font-sans text-xs leading-relaxed">
                      Save native Staples and restorative oils to your wishlist while browsing our catalog.
                    </p>
                  </div>
                  <button onClick={() => navigate('/products')} className="px-6 py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer border-none scale-100 hover:scale-[1.02] active:scale-[0.98]">
                    <span>Browse Products</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Saved Coordinates 📍</h3>
                  <p className="text-xs text-stone-600 font-medium">Manage coordinates for fast shipping logs routing.</p>
                </div>
                {!showAddressForm && (
                  <button onClick={() => setShowAddressForm(true)} className="px-5 py-3 bg-[#4E641A] text-white text-xs font-bold uppercase rounded-2xl flex items-center gap-1.5 cursor-pointer"><FiPlus />Add Coordinates</button>
                )}
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addressError && <div className="col-span-2 text-xs text-red-600">{addressError}</div>}
                  <input type="text" placeholder="Coordinates Label" value={addressForm.title} onChange={e => setAddressForm({ ...addressForm, title: e.target.value })} className="w-full bg-[#F9F6F0] border rounded-xl py-3 px-4 text-xs font-sans" required />
                  <input type="text" placeholder="Recipient Name" value={addressForm.recipientName} onChange={e => setAddressForm({ ...addressForm, recipientName: e.target.value })} className="w-full bg-[#F9F6F0] border rounded-xl py-3 px-4 text-xs font-sans" required />
                  <input type="tel" placeholder="Mobile Number" value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full bg-[#F9F6F0] border rounded-xl py-3 px-4 text-xs font-sans" required />
                  <input type="text" placeholder="Street Details" value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} className="w-full bg-[#F9F6F0] border rounded-xl py-3 px-4 text-xs font-sans col-span-2" required />
                  <input type="text" placeholder="City" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full bg-[#F9F6F0] border rounded-xl py-3 px-4 text-xs font-sans" required />
                  <input type="text" placeholder="State" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className="w-full bg-[#F9F6F0] border rounded-xl py-3 px-4 text-xs font-sans" required />
                  <input type="text" placeholder="PIN Code" value={addressForm.postalCode} onChange={e => setAddressForm({ ...addressForm, postalCode: e.target.value })} className="w-full bg-[#F9F6F0] border rounded-xl py-3 px-4 text-xs font-sans" required />
                  <div className="col-span-2 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 border rounded-xl font-sans text-xs">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-[#4E641A] text-white rounded-xl font-sans text-xs">Save coordinates</button>
                  </div>
                </form>
              )}

              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="bg-white border border-[#EAE4D8] rounded-[24px] p-6 flex flex-col justify-between min-h-[160px] shadow-xxs">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-base font-extrabold text-[#2F3B0C]">{addr.title}</span>
                          {addr.isDefault && <span className="text-[8px] font-bold bg-[#4E641A]/10 text-[#4E641A] px-2 py-0.5 rounded-full">Primary</span>}
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed font-medium">
                          <strong>{addr.recipientName}</strong> • {addr.phone} <br />
                          {addr.street}, {addr.city}, {addr.state} – {addr.postalCode}
                        </p>
                      </div>
                      <div className="flex justify-end pt-4 border-t mt-4 border-stone-100">
                        <button onClick={() => handleDeleteAddress(addr.id)} className="text-stone-400 hover:text-red-650 cursor-pointer"><FiTrash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !showAddressForm && (
                  /* Premium empty state card */
                  <div className="bg-white border border-[#EAE4D8] rounded-[32px] py-16 px-6 text-center flex flex-col items-center gap-6 shadow-sm max-w-xl mx-auto my-6 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#C68A2B]/5 blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#4E641A]/5 blur-2xl pointer-events-none" />
                    
                    <div className="w-20 h-20 rounded-full bg-[#4E641A]/5 border border-[#4E641A]/10 flex items-center justify-center text-4xl shadow-inner shrink-0 relative">
                      <FiMapPin className="text-[#4E641A]" />
                    </div>
                    <div className="space-y-2 max-w-xs mx-auto">
                      <h3 className="font-serif text-xl font-bold text-[#2F3B0C]">No saved addresses</h3>
                      <p className="text-stone-500 font-sans text-xs leading-relaxed">
                        Add your shipping coordinates to enjoy fast and hassle-free native harvest deliveries.
                      </p>
                    </div>
                    <button onClick={() => setShowAddressForm(true)} className="px-6 py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer border-none scale-100 hover:scale-[1.02] active:scale-[0.98]">
                      <span>Add Address</span>
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 text-left">
              <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Messages & Announcements 🔔</h3>
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((n) => (
                    <div key={n.id} className="bg-white border border-[#EAE4D8] rounded-2xl p-5 flex gap-4 items-start shadow-xxs">
                      <FiBell className="text-[#C68A2B] text-xl shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-serif font-extrabold text-stone-700 block">{n.title}</span>
                        <p className="text-xs text-stone-600 leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-stone-400 font-bold block pt-1">
                          {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Premium empty state card */
                <div className="bg-white border border-[#EAE4D8] rounded-[32px] py-16 px-6 text-center flex flex-col items-center gap-6 shadow-sm max-w-xl mx-auto my-6 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#C68A2B]/5 blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#4E641A]/5 blur-2xl pointer-events-none" />
                  
                  <div className="w-20 h-20 rounded-full bg-[#C68A2B]/5 border border-[#C68A2B]/10 flex items-center justify-center text-4xl shadow-inner shrink-0 relative">
                    <FiBell className="text-[#C68A2B]" />
                  </div>
                  <div className="space-y-2 max-w-xs mx-auto">
                    <h3 className="font-serif text-xl font-bold text-[#2F3B0C]">No notifications yet</h3>
                    <p className="text-stone-500 font-sans text-xs leading-relaxed">
                      You are up to date! Any announcements or order notifications will be listed here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: RECENTLY BROWSED */}
          {activeTab === 'viewed' && (
            <div className="space-y-6 text-left">
              <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Recently Browsed Harvests 🌾</h3>
              {recentlyViewed.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {recentlyViewed.map((item) => (
                    <div key={item.id} className="bg-white border border-[#EAE4D8] rounded-[24px] p-5 flex flex-col gap-4 shadow-xxs group">
                      <div className={`w-full h-32 rounded-xl bg-gradient-to-tr ${item.imageColor || 'from-stone-100 to-stone-50'} overflow-hidden flex items-center justify-center text-3xl group-hover:scale-105 transition duration-300`}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{item.emoji || '🌱'}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-[#2F3B0C] leading-snug truncate">{item.name}</h4>
                        <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">{item.weight}</p>
                        <span className="text-sm font-extrabold text-[#4E641A] block pt-1">₹{item.price}</span>
                      </div>
                      <button onClick={() => {
                        addItem(item.id, null, 1);
                        setAddedItems(prev => ({ ...prev, [item.id]: true }));
                        setTimeout(() => {
                          setAddedItems(prev => ({ ...prev, [item.id]: false }));
                        }, 2000);
                      }} className="w-full py-2.5 bg-[#F9F6F0] hover:bg-[#4E641A] hover:text-white text-xs font-bold uppercase border rounded-xl transition cursor-pointer">
                        {addedItems[item.id] ? 'Added ✓' : 'Add to Cart'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                /* Premium empty state card */
                <div className="bg-white border border-[#EAE4D8] rounded-[32px] py-16 px-6 text-center flex flex-col items-center gap-6 shadow-sm max-w-xl mx-auto my-6 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#C68A2B]/5 blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#4E641A]/5 blur-2xl pointer-events-none" />
                  
                  <div className="w-20 h-20 rounded-full bg-[#4E641A]/5 border border-[#4E641A]/10 flex items-center justify-center text-4xl shadow-inner shrink-0 relative">
                    <FiClock className="text-[#4E641A]" />
                  </div>
                  <div className="space-y-2 max-w-xs mx-auto">
                    <h3 className="font-serif text-xl font-bold text-[#2F3B0C]">No recently viewed items</h3>
                    <p className="text-stone-500 font-sans text-xs leading-relaxed">
                      Items you view while exploring our marketplace will show up here for quick access.
                    </p>
                  </div>
                  <button onClick={() => navigate('/products')} className="px-6 py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer border-none scale-100 hover:scale-[1.02] active:scale-[0.98]">
                    <span>Browse Catalog</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: PREFERENCES / SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 text-left">
              <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Account Preferences ⚙️</h3>
              <div className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 md:p-8 shadow-sm">
                <form onSubmit={handleSavePreferences} className="space-y-6">
                  {settingsMessage && (
                    <div className={`p-3.5 rounded-xl text-center text-xs font-bold ${
                      settingsMessage.includes('successfully') ? 'bg-[#4E641A]/10 text-[#4E641A] border border-[#4E641A]/20' : 'bg-red-50 text-red-655 border border-red-100'
                    }`}>
                      {settingsMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-extrabold uppercase text-stone-400 tracking-wider mb-2">Registered Email Address</label>
                        <div className="flex items-center bg-stone-50 border rounded-xl py-3 px-4 text-stone-500 font-bold text-xs"><FiMail className="mr-2" />{user.email}</div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-extrabold uppercase text-[#2F3B0C] tracking-wider mb-2">Member Name</label>
                        <input 
                          type="text" 
                          value={profileName} 
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full bg-[#F9F6F0] border rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none" 
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <UnifiedUploader
                        value={profileAvatar}
                        onChange={(url) => setProfileAvatar(url)}
                        label="Profile Photo (Avatar)"
                        aspectRatio={1}
                        folder="avatars"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <button 
                      type="submit" 
                      disabled={isSavingSettings}
                      className="px-5 py-3 bg-[#4E641A] text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#2F3B0C] transition cursor-pointer shadow-sm border-none disabled:opacity-50"
                    >
                      {isSavingSettings ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 9: SUPPORT CENTER */}
          {activeTab === 'help' && (
            <div className="space-y-6 text-left">
              <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Suryodaya Support Center 🌾</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 space-y-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#2F3B0C] pb-2 border-b border-stone-100">Direct Farm Support</h4>
                    <p className="text-xs text-stone-600 leading-relaxed font-medium">Chat directly with a support farmer for any order or logistics logs questions.</p>
                  </div>
                  <button className="w-full py-3 bg-[#4E641A] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#2F3B0C] transition shadow-sm cursor-pointer mt-4">WhatsApp Farmer Helpdesk</button>
                </div>
                <div className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 space-y-4 shadow-sm">
                  <h4 className="font-serif text-base font-bold text-[#2F3B0C] pb-2 border-b border-stone-100">Quick FAQ Records</h4>
                  <div className="space-y-3 text-xs leading-relaxed font-medium text-stone-600">
                    <div><span className="font-bold text-[#2F3B0C] block">Q: How are unrefined oils shipped?</span><span>A: Decanted in food-grade tin canisters and dispatched via express vans.</span></div>
                    <div><span className="font-bold text-[#2F3B0C] block">Q: How does the Gold Sprout tier benefit me?</span><span>A: Enjoy exclusive native vouchers, early harvest access, and direct support.</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Invoice receipt modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setActiveInvoice(null)} className="absolute inset-0 bg-[#2F3B0C]/40 backdrop-blur-md" />
          <div className="relative bg-white border border-[#EAE4D8] rounded-[28px] p-6 md:p-8 w-full max-w-lg shadow-2xl z-10 text-left space-y-6">
            <div className="flex items-center justify-between border-b pb-4"><div className="flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-[#C68A2B]" /><span className="font-serif text-base font-bold text-[#2F3B0C]">Receipt Receipt</span></div><button onClick={() => setActiveInvoice(null)} className="text-stone-400 font-extrabold cursor-pointer">✕</button></div>
            <div className="space-y-4 text-xs font-medium text-stone-600">
              <div className="flex justify-between border-b pb-2"><span>Order reference</span><span className="font-mono font-bold text-stone-850">{activeInvoice.orderNumber}</span></div>
              <div className="flex justify-between border-b pb-2"><span>Authorized Date</span><span className="text-stone-850 font-bold">{new Date(activeInvoice.createdAt).toLocaleDateString()}</span></div>
              <div className="flex justify-between border-b pb-2"><span>Gateway Status</span><span className="text-stone-850 font-bold">{activeInvoice.paymentMethod} • {activeInvoice.paymentStatus}</span></div>
              <div className="space-y-2 pt-2">
                <span className="text-[9px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">SHIPPED HARVESTS</span>
                {activeInvoice.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#F9F6F0] p-3 rounded-xl border border-[#EAE4D8] gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg shrink-0">🌱</span>
                      <span className="font-semibold">{item.product?.name} {item.variant ? `(${item.variant.name})` : `(${item.product?.weight || '500 ml'})`} x{item.quantity}</span>
                    </div>
                    <span className="font-bold text-[#2F3B0C] shrink-0">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 flex justify-between items-center text-sm border-t"><span className="font-serif font-bold text-[#2F3B0C]">Total Investment</span><span className="font-extrabold text-[#4E641A] text-base">₹{activeInvoice.totalAmount}</span></div>
            </div>
            <button onClick={() => { modal.alert('Receipt Downloaded', 'Compiling receipt download log has completed.', 'success'); setActiveInvoice(null); }} className="w-full py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-sm cursor-pointer">Download Receipt PDF</button>
          </div>
        </div>
      )}

    </div>
  );
}

// ----------------------------------------------------------------------
// Simple Helper Icons
// ----------------------------------------------------------------------
function SparklesIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.188.904z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.071 4.929l-.353 1.768-1.768.353 1.768.353.353 1.768.353-1.768 1.768-.353-1.768-.353-.353-1.768z"
      />
    </svg>
  );
}
