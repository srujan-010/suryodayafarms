import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
  FiMessageSquare,
  FiPackage,
  FiShield,
  FiCompass,
  FiAward,
  FiSearch,
  FiArrowRight,
  FiArrowLeft
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const location = useLocation();
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

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReply, setTicketReply] = useState('');
  const [ticketReplyImage, setTicketReplyImage] = useState(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Dashboard Redesign & Review form states
  const [isReorderingRecent, setIsReorderingRecent] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    show: false,
    productId: '',
    rating: 5,
    reviewTitle: '',
    reviewText: '',
    orderId: '',
    error: null,
    success: false
  });

  const handleBuyAgain = async (ord) => {
    if (!ord || !ord.orderItems) return;
    setIsReorderingRecent(true);
    try {
      for (const item of ord.orderItems) {
        await addItem(item.productId, item.variantId || null, item.quantity);
      }
      navigate('/cart');
    } catch (err) {
      console.error('Buy Again failed:', err);
    } finally {
      setIsReorderingRecent(false);
    }
  };

  const handleOpenReviewModal = (ord) => {
    const firstItem = ord.orderItems?.[0];
    if (!firstItem) return;
    setReviewForm({
      show: true,
      productId: firstItem.productId,
      rating: 5,
      reviewTitle: '',
      reviewText: '',
      orderId: ord.id,
      error: null,
      success: false
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.productId) {
      setReviewForm(prev => ({ ...prev, error: 'Product selection is required.' }));
      return;
    }
    if (!reviewForm.reviewText.trim()) {
      setReviewForm(prev => ({ ...prev, error: 'Please enter review content.' }));
      return;
    }

    try {
      const response = await api.post(`/products/${reviewForm.productId}/reviews`, {
        rating: reviewForm.rating,
        reviewTitle: reviewForm.reviewTitle || 'Verified Purchase',
        reviewText: reviewForm.reviewText
      });

      if (response.success) {
        setReviewForm(prev => ({ ...prev, success: true, error: null }));
        setTimeout(() => {
          setReviewForm(prev => ({ ...prev, show: false, success: false }));
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewForm(prev => ({ ...prev, error: err.message || 'Error submitting review.' }));
    }
  };

  const fetchSupportTickets = async () => {
    try {
      const response = await api.get('/support/tickets');
      if (response.success && response.tickets) {
        setSupportTickets(response.tickets);
      }
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
    }
  };

  const fetchTicketDetails = async (ticketId, isSilent = false) => {
    try {
      const response = await api.get(`/support/tickets/${ticketId}`);
      if (response.success && response.ticket) {
        setSelectedTicket(response.ticket);
      }
    } catch (err) {
      console.error('Failed to fetch ticket details:', err);
    }
  };

  const handleReplyImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setReplyError('Please upload an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setReplyError('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTicketReplyImage(reader.result);
      setReplyError(null);
    };
    reader.onerror = () => {
      setReplyError('Failed to read file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!ticketReply.trim() && !ticketReplyImage) return;

    setIsSubmittingReply(true);
    setReplyError(null);

    try {
      let finalImageUrl = null;
      if (ticketReplyImage) {
        const uploadRes = await api.post('/auth/upload-cloudinary', {
          image: ticketReplyImage,
          folder: 'tickets'
        });
        if (uploadRes.success && uploadRes.url) {
          finalImageUrl = uploadRes.url;
        } else {
          throw new Error(uploadRes.message || 'Image upload failed');
        }
      }

      const response = await api.post(`/support/tickets/${selectedTicket.id}/messages`, {
        message: ticketReply,
        imageUrl: finalImageUrl
      });

      if (response.success) {
        setTicketReply('');
        setTicketReplyImage(null);
        await fetchTicketDetails(selectedTicket.id);
        fetchSupportTickets();
      } else {
        throw new Error(response.message || 'Failed to submit reply');
      }
    } catch (err) {
      setReplyError(err.message || 'Failed to send reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };


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
    id: '',
    title: 'Home', // Home, Work, Other
    recipientName: '',
    phone: '',
    altPhone: '',
    houseFlat: '',
    areaLandmark: '',
    city: '',
    district: '',
    state: '',
    postalCode: '',
    isDefault: false
  });

  const parseStreet = (streetStr) => {
    if (!streetStr) return { houseFlat: '', areaLandmark: '', altPhone: '' };
    const parts = streetStr.split(' | ');
    return {
      houseFlat: parts[0] || '',
      areaLandmark: parts[1] || '',
      altPhone: parts[2] ? parts[2].replace('Alt: ', '') : ''
    };
  };

  const parseCity = (cityStr) => {
    if (!cityStr) return { city: '', district: '' };
    const parts = cityStr.split(' | ');
    return {
      city: parts[0] || '',
      district: parts[1] || ''
    };
  };

  const [addressError, setAddressError] = useState(null);
  const [activeInvoice, setActiveInvoice] = useState(null);

  useEffect(() => {
    if (location.state?.selectTab) {
      setActiveTab(location.state.selectTab);
    } else if (tab) {
      if (tab === 'saved-coordinates' || tab === 'addresses') {
        setActiveTab('addresses');
      } else {
        setActiveTab(tab);
      }
    } else {
      const searchParams = new URLSearchParams(location.search);
      const tabParam = searchParams.get('tab');
      if (tabParam) {
        if (tabParam === 'saved-coordinates' || tabParam === 'addresses') {
          setActiveTab('addresses');
        } else {
          setActiveTab(tabParam);
        }
      }
    }
  }, [tab, location.search, location.state]);

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
      fetchSupportTickets();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'tickets') {
      fetchSupportTickets();
    }
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    let interval = null;
    if (selectedTicket && activeTab === 'tickets') {
      interval = setInterval(() => {
        fetchTicketDetails(selectedTicket.id, true);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedTicket, activeTab]);

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

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressError(null);
    try {
      const street = `${addressForm.houseFlat} | ${addressForm.areaLandmark} | ${addressForm.altPhone ? 'Alt: ' + addressForm.altPhone : ''}`;
      const city = `${addressForm.city} | ${addressForm.district || ''}`;
      
      const payload = {
        title: addressForm.title,
        recipientName: addressForm.recipientName,
        phone: addressForm.phone,
        street,
        city,
        state: addressForm.state,
        postalCode: addressForm.postalCode,
        isDefault: addressForm.isDefault
      };

      if (addressForm.id) {
        await api.put(`/auth/addresses/${addressForm.id}`, payload);
      } else {
        await api.post('/auth/addresses', payload);
      }

      setShowAddressForm(false);
      setAddressForm({
        id: '',
        title: 'Home',
        recipientName: '',
        phone: '',
        altPhone: '',
        houseFlat: '',
        areaLandmark: '',
        city: '',
        district: '',
        state: '',
        postalCode: '',
        isDefault: false
      });
      fetchAddresses();

      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('from') === 'checkout') {
        navigate('/checkout');
      }
    } catch (err) {
      setAddressError(err.message);
    }
  };

  const populateAddressFormForEdit = (addr) => {
    const pStreet = parseStreet(addr.street);
    const pCity = parseCity(addr.city);
    setAddressForm({
      id: addr.id,
      title: addr.title || 'Home',
      recipientName: addr.recipientName || '',
      phone: addr.phone || '',
      altPhone: pStreet.altPhone || '',
      houseFlat: pStreet.houseFlat || '',
      areaLandmark: pStreet.areaLandmark || '',
      city: pCity.city || '',
      district: pCity.district || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      isDefault: addr.isDefault || false
    });
    setShowAddressForm(true);
  };

  const handleSetAddressDefault = async (addr) => {
    try {
      await api.put(`/auth/addresses/${addr.id}`, {
        title: addr.title,
        recipientName: addr.recipientName,
        phone: addr.phone,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        isDefault: true
      });
      fetchAddresses();
    } catch (err) {
      console.error('Failed to set default address:', err);
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
    { id: 'tickets', label: 'Support Tickets', icon: FiMessageSquare, badge: supportTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length || undefined },
    { id: 'help', label: 'Support Center', icon: FiHelpCircle }
  ];

  return (
    <div className="min-h-screen bg-[#F9F6F0] pt-32 md:pt-36 lg:pt-40 pb-20 px-4 md:px-8 relative overflow-x-hidden text-[#1E1E1E]">
      
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
        
        {/* Sticky Left Navigation Sidebar with Premium Glassmorphism - Hidden on mobile */}
        <aside className="hidden lg:block w-[300px] bg-white border border-[#EAE4D8] rounded-[32px] p-6 shrink-0 lg:sticky lg:top-28 shadow-sm text-left">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center text-center pb-6 border-b border-[#EAE4D8] mb-6 w-full">
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#2F3B0C] to-[#4E641A] flex items-center justify-center text-[#F9F6F0] text-2xl font-bold shadow-md border-4 border-white overflow-hidden group shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition duration-300" />
                ) : (
                  <span className="relative z-10 group-hover:scale-105 transition duration-300">{getInitials(user.name || '')}</span>
                )}
                <div className="absolute inset-0 bg-[#C68A2B]/10 opacity-30 blur-sm" />
              </div>
              <div className="text-center mt-2">
                <h3 className="font-serif text-lg font-extrabold text-[#2F3B0C] leading-snug truncate max-w-[220px]">
                  {user.name || 'Premium Member'}
                </h3>
                <p className="text-[10px] tracking-widest uppercase font-extrabold text-[#C68A2B] mt-1.5 flex items-center bg-[#C68A2B]/5 px-2.5 py-0.5 rounded-full border border-[#C68A2B]/10 w-fit mx-auto">
                  Gold Sprout 🌿
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1.5 w-full">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-between font-sans text-xs font-bold py-3.5 px-4 rounded-2xl transition-all duration-300 cursor-pointer relative group shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#4E641A] text-white shadow-sm'
                      : 'text-stone-600 hover:bg-[#F9F6F0] hover:text-[#2F3B0C]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <item.icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-[#C68A2B]' : 'text-stone-400 group-hover:text-[#4E641A]'
                    }`} />
                    <span className="tracking-wider uppercase text-[9px]">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ml-1.5 ${
                      isActive ? 'bg-[#C68A2B] text-[#2F3B0C]' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#C68A2B] rounded-r-full" />
                  )}
                </button>
              );
            })}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3.5 font-sans text-xs font-extrabold py-3.5 px-4 rounded-2xl text-red-650 hover:bg-red-50 transition duration-300 mt-6 cursor-pointer border border-transparent hover:border-red-100 shrink-0 whitespace-nowrap"
            >
              <FiLogOut className="w-5 h-5 text-red-400" />
              <span className="tracking-wider uppercase text-[9px]">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Right Side Content Panel */}
        <div className="flex-grow w-full min-h-[500px] text-left text-[#1E1E1E]">
          
          {/* Mobile Header & Horizontal Tabs (lg:hidden) */}
          <div className="w-full lg:hidden flex flex-col gap-4 mb-6 text-left">
            {/* Compact User Header */}
            <div className="flex items-center justify-between bg-white border border-[#EAE4D8] rounded-2xl p-4 shadow-sm text-left">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-[#2F3B0C] to-[#4E641A] flex items-center justify-center text-[#F9F6F0] text-xs font-bold shadow-sm border border-white overflow-hidden shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(user.name || '')}</span>
                  )}
                </div>
                <div className="text-left leading-tight">
                  <h3 className="font-serif text-sm font-extrabold text-[#2F3B0C] truncate max-w-[150px] sm:max-w-xs">
                    {user.name || 'Premium Member'}
                  </h3>
                  <span className="text-[8px] text-[#C68A2B] font-extrabold uppercase tracking-widest block mt-0.5">Gold Sprout 🌿</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 border border-red-150 text-red-650 text-[9px] font-bold uppercase rounded-lg hover:bg-red-50 transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>

            {/* Swipeable Tabs Bar */}
            <div className="flex flex-row overflow-x-auto no-scrollbar scroll-smooth gap-2 pb-1 border-b border-[#EAE4D8] w-full">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center justify-center gap-1.5 font-sans text-[9px] font-bold py-2 px-3 rounded-full transition-all duration-300 cursor-pointer shrink-0 whitespace-nowrap border ${
                      isActive
                        ? 'bg-[#4E641A] text-white border-transparent shadow-xs'
                        : 'bg-white text-stone-600 border-[#EAE4D8] hover:bg-stone-50'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span className="tracking-wider uppercase">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-extrabold ${
                        isActive ? 'bg-[#C68A2B] text-[#2F3B0C]' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* A. Welcome & Loyalty Section */}
                  <div className="relative bg-gradient-to-r from-[#2F3B0C] to-[#4E641A] rounded-2xl p-6 text-[#F9F6F0] overflow-hidden border border-[#EAE4D8] shadow-sm">
                    <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#C68A2B]/10 blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2 text-left">
                        <span className="inline-flex items-center text-[9px] font-extrabold tracking-widest uppercase text-[#C68A2B] bg-[#C68A2B]/15 px-2.5 py-1 rounded-full border border-[#C68A2B]/20">
                          🌿 Sustainable Sprout
                        </span>
                        <h2 className="font-serif text-2xl md:text-3xl font-semibold leading-tight text-white">
                          Namaste, {user.name?.split(' ')[0] || 'Premium Member'}
                        </h2>
                        <p className="text-xs text-stone-300 font-medium">
                          Putting Soil First with premium native harvests, cold-pressed oils, and raw forest honey.
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 min-w-[180px] shrink-0 text-left">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[8px] font-extrabold tracking-widest text-stone-200 uppercase">TIER LEVEL</span>
                          <SparklesIcon className="w-3.5 h-3.5 text-[#C68A2B]" />
                        </div>
                        <span className="text-xl font-serif font-extrabold text-white block">Gold Sprout Tier 🌿</span>
                        <span className="text-[8px] text-[#C68A2B] font-extrabold uppercase tracking-widest block mt-1">Premium Member Since 2026</span>
                      </div>
                    </div>
                  </div>

                  {/* B. Statistics Cards (6-card compact grid) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Total Shipments', value: orders.length, detail: 'Farm deliveries', icon: FiShoppingBag, color: 'from-[#4E641A]/5 to-[#EAE4D8]/10' },
                      { label: 'Wishlist Crops', value: wishlistItems.length, detail: 'Saved harvests', icon: FiHeart, color: 'from-[#EAE4D8]/20 to-[#C68A2B]/5' },
                      { label: 'Saved Coordinates', value: addresses.length, detail: 'Delivery points', icon: FiMapPin, color: 'from-[#4E641A]/5 to-[#EAE4D8]/15' },
                      { label: 'Active Coupons', value: 2, detail: 'Vouchers available', icon: FiTag, color: 'from-[#C68A2B]/10 to-[#EAE4D8]/20' },
                      { label: 'Support Tickets', value: supportTickets.length, detail: 'Open help cases', icon: FiMessageSquare, color: 'from-[#4E641A]/5 to-[#EAE4D8]/10' }
                    ].map((card, idx) => (
                      <div key={idx} className={`bg-gradient-to-br ${card.color} border border-[#EAE4D8] rounded-xl p-4 flex flex-col justify-between h-[115px] shadow-sm hover:shadow-md transition duration-300`}>
                        <div className="flex items-center justify-between text-stone-500">
                          <span className="text-[8px] font-extrabold tracking-wider uppercase text-stone-400">{card.label}</span>
                          <card.icon className="w-4 h-4 text-[#4E641A]" />
                        </div>
                        <div className="text-left mt-2">
                          <span className="font-serif text-2xl font-bold text-[#2F3B0C] block leading-none">{card.value}</span>
                          <span className="text-[8px] text-stone-400 block font-semibold mt-0.5">{card.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* C. Quick Actions Row */}
                  <div className="bg-white border border-[#EAE4D8] rounded-xl p-4 shadow-sm">
                    <h4 className="text-[9px] font-extrabold tracking-widest text-[#C68A2B] uppercase mb-3 text-left">Quick Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => {
                          setActiveTab('addresses');
                          setShowAddressForm(true);
                        }}
                        className="px-3.5 py-2 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-[9px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <FiPlus className="w-3 h-3 text-[#C68A2B]" /> Add Coordinates
                      </button>
                      <button 
                        onClick={() => navigate('/products')}
                        className="px-3.5 py-2 border border-[#EAE4D8] text-stone-700 hover:bg-stone-50 text-[9px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <FiShoppingBag className="w-3 h-3 text-[#C68A2B]" /> Continue Shopping
                      </button>
                      <button 
                        onClick={() => setActiveTab('orders')}
                        className="px-3.5 py-2 border border-[#EAE4D8] text-[#4E641A] hover:bg-[#4E641A]/5 text-[9px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <FiTruck className="w-3 h-3" /> My Shipments
                      </button>
                      <button 
                        onClick={() => setActiveTab('wishlist')}
                        className="px-3.5 py-2 border border-[#EAE4D8] text-stone-700 hover:bg-stone-50 text-[9px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <FiHeart className="w-3 h-3 text-red-500" /> Wishlist
                      </button>
                      <button 
                        onClick={() => setActiveTab('tickets')}
                        className="px-3.5 py-2 border border-[#EAE4D8] text-stone-700 hover:bg-stone-50 text-[9px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <FiMessageSquare className="w-3 h-3 text-[#C68A2B]" /> Helpdesk Support
                      </button>
                    </div>
                  </div>

                  {/* D. Recent Orders Summary */}
                  <div className="bg-white border border-[#EAE4D8] rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                      <h4 className="font-serif text-sm font-bold text-[#2F3B0C] flex items-center gap-2">
                        <FiShoppingBag className="text-[#C68A2B]" /> Recent Orders
                      </h4>
                      <button 
                        onClick={() => setActiveTab('orders')} 
                        className="text-[9px] font-extrabold uppercase text-[#4E641A] hover:text-[#2F3B0C] flex items-center gap-1 cursor-pointer"
                      >
                        All Orders <FiArrowRight />
                      </button>
                    </div>
                    
                    {orders.length > 0 ? (
                      <div className="space-y-3 text-left">
                        {orders.slice(0, 2).map((order) => {
                          const firstItem = order.orderItems?.[0];
                          const product = firstItem?.product;
                          const productImg = product?.images?.[0]?.url || product?.hoverImage || product?.image;
                          const totalItems = order.orderItems?.length || 0;
                          const isActive = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PREPARED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes((order.status || '').toUpperCase().trim());
                          
                          return (
                            <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-[#F9F6F0]/40 border border-[#EAE4D8]/60 rounded-xl hover:bg-[#F9F6F0]/80 transition duration-200">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-[#EAE4D8] flex items-center justify-center shrink-0 shadow-xxs">
                                  {productImg ? (
                                    <img src={productImg} alt={product?.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-lg">🌾</span>
                                  )}
                                </div>
                                <div className="text-left space-y-0.5">
                                  <span className="font-mono text-[9px] text-stone-500 font-bold block">{order.orderNumber}</span>
                                  <h5 className="font-serif text-xs font-bold text-[#2F3B0C] line-clamp-1">
                                    {product?.name || 'Organic Harvest'} {totalItems > 1 && `+ ${totalItems - 1} more`}
                                  </h5>
                                  <span className="text-[8px] text-stone-400 block font-semibold">
                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • ₹{order.totalAmount}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                                <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-widest ${
                                  order.status === 'DELIVERED'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : order.status === 'CANCELLED'
                                      ? 'bg-red-50 text-red-650 border-red-200'
                                      : 'bg-[#C68A2B]/10 text-[#C68A2B] border-[#C68A2B]/20'
                                }`}>
                                  {order.status}
                                </span>
                                <button
                                  onClick={() => navigate(`/profile/shipments/${order.id}`)}
                                  className="px-3 py-1.5 bg-[#4E641A]/5 hover:bg-[#4E641A] hover:text-white text-[#4E641A] text-[9px] font-bold uppercase rounded-lg transition cursor-pointer"
                                >
                                  {isActive ? 'Track Journey' : 'View Details'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500 text-center py-4 font-medium">No recent orders yet.</p>
                    )}
                  </div>
                </div>

                {/* Right column (1/3 width) */}
                <div className="lg:col-span-1 space-y-6 w-full text-left">
                  
                  {/* E. Live Status Card */}
                  {(() => {
                    if (orders.length === 0) {
                      return (
                        <div className="bg-white border border-[#EAE4D8] rounded-2xl p-5 text-center flex flex-col items-center gap-4 shadow-sm relative overflow-hidden">
                          <div className="w-12 h-12 rounded-full bg-[#C68A2B]/5 border border-[#C68A2B]/10 flex items-center justify-center text-2xl shadow-inner relative animate-pulse">
                            <FiShoppingBag className="text-[#C68A2B] w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-serif text-sm font-bold text-[#2F3B0C]">First Harvest Awaits</h4>
                            <p className="text-stone-500 font-sans text-[11px] leading-relaxed font-medium">
                              Try our unrefined cold-pressed oils, native grains, and pure raw honey.
                            </p>
                          </div>
                          <button onClick={() => navigate('/products')} className="w-full py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-sm transition duration-350 cursor-pointer border-none">
                            Browse Products
                          </button>
                        </div>
                      );
                    }

                    const latestOrder = orders[0];
                    const status = (latestOrder?.status || '').toUpperCase().trim();
                    const isActive = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PREPARED', 'SHIPPED', 'IN_TRANSIT', 'IN TRANSIT', 'TRANSIT', 'OUT_FOR_DELIVERY'].includes(status);

                    if (isActive) {
                      const displayStatus = latestOrder.status === 'OUT_FOR_DELIVERY' ? '🛵 Out for Delivery' : `🚚 ${latestOrder.status}`;
                      return (
                        <div className="bg-white border border-[#EAE4D8] rounded-2xl p-5 shadow-sm space-y-4 text-left border-l-4 border-l-[#C68A2B]">
                          <div className="space-y-1">
                            <span className="text-[8px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Active Delivery Tracker</span>
                            <span className="font-mono text-xs font-bold text-[#2F3B0C] block">{latestOrder.orderNumber}</span>
                          </div>

                          <div className="bg-[#F9F6F0] p-3.5 rounded-xl border border-[#EAE4D8]/60 space-y-2">
                            <span className="text-[9px] font-extrabold text-[#4E641A] uppercase tracking-wider block bg-[#4E641A]/5 border border-[#4E641A]/10 px-2 py-0.5 rounded w-fit">
                              {displayStatus}
                            </span>
                            <p className="text-[10px] text-stone-600 font-semibold leading-normal">
                              {getETA(latestOrder)}
                            </p>
                          </div>

                          <button 
                            onClick={() => navigate(`/profile/shipments/${latestOrder.id}`)}
                            className="w-full py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            Track Journey <FiArrowRight className="w-3.5 h-3.5 text-[#C68A2B]" />
                          </button>
                        </div>
                      );
                    }

                    if (status === 'DELIVERED') {
                      const firstItem = latestOrder.orderItems?.[0];
                      const product = firstItem?.product;
                      const productImg = product?.images?.[0]?.url || product?.hoverImage || product?.image;
                      
                      return (
                        <div className="bg-white border border-[#EAE4D8] rounded-2xl p-5 shadow-sm space-y-4 text-left">
                          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <FiCheck className="text-green-700 w-4 h-4" />
                            <h4 className="font-serif text-xs font-bold text-[#2F3B0C] uppercase tracking-wider">Latest Delivery</h4>
                          </div>

                          <div className="flex gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F9F6F0] border border-[#EAE4D8] flex items-center justify-center shrink-0">
                              {productImg ? (
                                <img src={productImg} alt={product?.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xl">🌱</span>
                              )}
                            </div>
                            <div className="space-y-0.5 text-left">
                              <h5 className="font-serif text-xs font-bold text-[#2F3B0C] line-clamp-1">{product?.name || 'Organic Harvest'}</h5>
                              <p className="text-[8px] text-stone-400 font-bold uppercase">
                                Delivered: {new Date(latestOrder.updatedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <button 
                              onClick={() => handleBuyAgain(latestOrder)}
                              disabled={isReorderingRecent}
                              className="py-2 px-3 border border-[#EAE4D8] text-[#4E641A] hover:bg-[#4E641A]/5 text-[9px] font-bold uppercase rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              <FiRefreshCw className={isReorderingRecent ? 'animate-spin' : ''} /> Buy Again
                            </button>
                            <button 
                              onClick={() => handleOpenReviewModal(latestOrder)}
                              className="py-2 px-3 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-[9px] font-bold uppercase rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              <FiStar className="text-[#C68A2B] fill-[#C68A2B] w-3 h-3" /> Review
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Fallback (e.g. Cancelled)
                    return (
                      <div className="bg-white border border-[#EAE4D8] rounded-2xl p-5 text-center flex flex-col items-center gap-3 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-550 text-sm border border-red-155">✕</div>
                        <h4 className="font-serif text-xs font-bold text-red-800">Order Cancelled</h4>
                        <p className="text-stone-500 text-[10px] font-medium leading-relaxed">
                          This shipment has been cancelled. If this is an error, please reach out to customer support.
                        </p>
                      </div>
                    );
                  })()}

                  {/* F. Delivery Benefits Widget */}
                  <div className="bg-gradient-to-br from-[#FDFBF7] to-[#EAE4D8]/20 border border-[#EAE4D8] rounded-2xl p-5 shadow-sm space-y-4 text-left">
                    <h4 className="font-serif text-xs font-bold text-[#2F3B0C] pb-2 border-b border-[#EAE4D8] uppercase tracking-wider">
                      Premium Dispatch Benefits 🌾
                    </h4>
                    <div className="space-y-3">
                      {[
                        { emoji: '🚚', title: 'Free delivery above 2kg', desc: 'Sourced directly and shipped for free when buying bulk staples.' },
                        { emoji: '⚡', title: 'Telangana & Andhra Pradesh', desc: 'Fully operational express shipping routes to all major sectors.' },
                        { emoji: '🌾', title: 'Estimated dispatch', desc: 'Harvested fresh and shipped within 3–5 working days.' }
                      ].map((benefit, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2.5">
                          <span className="text-sm shrink-0 mt-0.5">{benefit.emoji}</span>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-[#2F3B0C] block leading-none">{benefit.title}</span>
                            <p className="text-[9px] text-stone-500 font-medium leading-relaxed">{benefit.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>


            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-1.5">
                <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Your Direct Farm Shipments 📦</h3>
                <p className="text-xs text-stone-600 font-medium">Click any shipment card to expand details, live tracking status, and invoices.</p>
              </div>

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const firstItem = order.orderItems?.[0];
                    const product = firstItem?.product;
                    const productImg = product?.images?.[0]?.url || product?.hoverImage || product?.image;
                    const totalItems = order.orderItems?.length || 0;
                    
                    const histStepsList = getTimelineSteps(order);
                    const histStep = getCurrentStepIndex(order, histStepsList);
                    const isCancelled = order.status === 'CANCELLED';
                    
                    const isExpanded = expandedOrderId === order.id;

                    return (
                      <div 
                        key={order.id} 
                        className="bg-white border border-[#EAE4D8] rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col text-left"
                      >
                        {/* Accordion Header (always visible, clickable) */}
                        <div 
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FDFBF7] select-none"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-grow">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F9F6F0] border border-[#EAE4D8] flex items-center justify-center shrink-0 shadow-xxs">
                              {productImg ? (
                                <img src={productImg} alt={product?.name || 'Product'} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-2xl">🌱</span>
                              )}
                            </div>
                            
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center flex-wrap gap-2">
                                <span className="font-mono text-[9px] font-bold text-stone-500 bg-stone-50 border border-stone-200/50 px-2 py-0.5 rounded">
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

                              <h4 className="font-serif text-xs sm:text-sm font-bold text-[#2F3B0C] truncate max-w-xs md:max-w-md">
                                {product?.name || 'Organic Harvest'}
                                {totalItems > 1 && (
                                  <span className="text-stone-400 font-sans text-[10px] sm:text-xs font-semibold ml-1">
                                    + {totalItems - 1} more item{totalItems > 2 ? 's' : ''}
                                  </span>
                                )}
                              </h4>
                              
                              <p className="text-[10px] text-stone-400 font-semibold flex items-center gap-1.5 flex-wrap leading-none">
                                <span>Placed: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                <span>•</span>
                                <span className="text-primary-green font-bold">₹{order.totalAmount}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-stone-400 font-sans font-bold uppercase tracking-wider hidden sm:inline">
                              {isExpanded ? 'Hide Details' : 'View Details'}
                            </span>
                            <span className="text-stone-400 text-sm font-bold">
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          </div>
                        </div>

                        {/* Accordion Body (collapsible content) */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-3 border-t border-stone-100 flex flex-col gap-5 bg-stone-50/25 animate-fade-in">
                            
                            {/* Order Items Detailed List */}
                            <div className="flex flex-col gap-3">
                              <span className="text-[9px] font-extrabold tracking-widest text-stone-400 uppercase">Items Checklist</span>
                              <div className="flex flex-col gap-2 bg-white border border-[#EAE4D8]/50 rounded-2xl p-4.5">
                                {order.orderItems?.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between gap-4 py-2 border-b border-stone-100 last:border-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#F9F6F0] border border-[#EAE4D8]/40 flex items-center justify-center shrink-0">
                                        <img src={item.product?.images?.[0]?.url || item.product?.image} alt={item.product?.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="min-w-0 text-left">
                                        <span className="block font-serif text-xs font-bold text-dark-olive truncate">{item.product?.name}</span>
                                        <span className="block font-sans text-[9px] text-stone-400 uppercase font-bold mt-0.5">Qty: {item.quantity} {item.variantName ? `• ${item.variantName}` : ''}</span>
                                      </div>
                                    </div>
                                    <span className="font-serif text-xs font-bold text-primary-green shrink-0">₹{item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Live Delivery Journey Timeline */}
                            <div className="bg-[#FDFBF7] border border-[#EAE4D8] rounded-2xl p-4.5 flex flex-col gap-4 text-left">
                              <span className="text-[9px] font-extrabold tracking-widest text-[#C68A2B] uppercase">Live Journey Tracker</span>
                              
                              {isCancelled ? (
                                <div className="text-xs font-semibold text-red-500">
                                  This shipment was cancelled.
                                </div>
                              ) : (
                                <div className="relative flex justify-between items-center w-full pt-2">
                                  {/* Connecting Line */}
                                  <div className="absolute top-4 left-[5%] right-[5%] h-[2px] bg-stone-200 z-0">
                                    <div
                                      className="h-full bg-[#4E641A] transition-all duration-500"
                                      style={{ width: `${histStep * 100 / (histStepsList.length - 1)}%` }}
                                    />
                                  </div>
                                  
                                  {/* Steps */}
                                  {histStepsList.map((step, idx) => {
                                    const StepIcon = step.icon;
                                    const isDone = idx <= histStep;
                                    const isCurrent = idx === histStep;
                                    
                                    return (
                                      <div key={idx} className="relative z-10 flex flex-col items-center gap-1 shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                          isDone
                                            ? 'bg-[#4E641A] border-[#4E641A] text-white shadow-sm'
                                            : 'bg-white border-[#EAE4D8] text-stone-300'
                                        } ${isCurrent ? 'ring-4 ring-[#4E641A]/20' : ''}`}>
                                          <StepIcon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className={`text-[7px] font-extrabold uppercase tracking-wider hidden sm:block ${
                                          isDone ? 'text-[#2F3B0C]' : 'text-stone-400'
                                        }`}>{step.label}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              
                              <div className="text-xs text-stone-600 font-medium pt-2 border-t border-stone-200/40 mt-1">
                                ETA Status: <strong className="text-[#4E641A] font-bold">{getETA(order)}</strong>
                              </div>
                            </div>

                            {/* Quick Actions Buttons */}
                            <div className="flex flex-wrap gap-2 w-full justify-end pt-2">
                              <button 
                                onClick={() => navigate(`/profile/shipments/${order.id}`)}
                                className="px-4 py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
                              >
                                View Detailed Timelines
                              </button>
                              <button 
                                onClick={() => setActiveInvoice(order)} 
                                className="px-4 py-2.5 border border-[#EAE4D8] bg-white text-stone-700 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-stone-50 transition cursor-pointer flex items-center gap-1"
                              >
                                <FiDownload /> Invoice Receipt
                              </button>
                              <button 
                                onClick={async () => {
                                  for (const item of order.orderItems || []) {
                                    await addItem(item.productId, item.variantId || null, item.quantity);
                                  }
                                  navigate('/cart');
                                }}
                                className="px-4 py-2.5 border border-[#EAE4D8] bg-white text-[#4E641A] text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#4E641A]/5 transition cursor-pointer flex items-center gap-1"
                              >
                                <FiRefreshCw /> Reorder Staples
                              </button>
                            </div>

                          </div>
                        )}

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
          {activeTab === 'addresses' && (
            <div className="space-y-6 w-full text-left">
              <div className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-[#EDE7D9]">
                <div className="flex flex-col gap-1">
                  <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Saved Coordinates 📍</h3>
                  <p className="text-xs text-stone-600 font-medium">Manage coordinates for fast shipping logs routing.</p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  {new URLSearchParams(location.search).get('from') === 'checkout' && (
                    <button 
                      onClick={() => navigate('/checkout')} 
                      className="px-5 py-3 border border-[#4E641A] text-[#4E641A] hover:bg-[#4E641A]/5 text-xs font-bold uppercase rounded-2xl flex items-center gap-1.5 cursor-pointer transition duration-300 font-sans select-none"
                    >
                      Return to Checkout
                    </button>
                  )}
                  {!showAddressForm && (
                    <button 
                      onClick={() => {
                        setAddressForm({
                          id: '',
                          title: 'Home',
                          recipientName: '',
                          phone: '',
                          altPhone: '',
                          houseFlat: '',
                          areaLandmark: '',
                          city: '',
                          district: '',
                          state: '',
                          postalCode: '',
                          isDefault: false
                        });
                        setShowAddressForm(true);
                      }} 
                      className="px-5 py-3 bg-[#4E641A] hover:bg-[#37411A] text-white text-xs font-bold uppercase rounded-2xl flex items-center gap-1.5 cursor-pointer font-sans transition select-none shadow-xxs border-none"
                    >
                      <FiPlus />Add Coordinates
                    </button>
                  )}
                </div>
              </div>

              {/* Two Column Grid layout to reduce empty whitespace and organize content */}
              <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
                
                {/* Left Side: Dynamic Form or Saved Cards */}
                <div className="flex-grow w-full space-y-6">
                  {showAddressForm && (
                    <form onSubmit={handleSaveAddress} className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 shadow-xxs flex flex-col gap-5">
                      <div className="border-b pb-2 border-stone-100 flex justify-between items-center">
                        <h4 className="font-serif text-base font-bold text-[#2F3B0C]">
                          {addressForm.id ? 'Modify Shipping Address' : 'Register Delivery Coordinates'}
                        </h4>
                        <span className="text-[8px] font-extrabold uppercase bg-[#4E641A]/10 text-[#4E641A] px-2.5 py-0.5 rounded-full">
                          Indian Standards
                        </span>
                      </div>

                      {addressError && (
                        <div className="text-xs font-bold text-red-655 bg-red-50 border border-red-200/50 rounded-xl p-3 select-none">
                          ⚠️ {addressError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {/* Recipient Name */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Recipient Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Srujan Reddy" 
                            value={addressForm.recipientName} 
                            onChange={e => setAddressForm({ ...addressForm, recipientName: e.target.value })} 
                            className="w-full bg-[#FDFBF7] border border-[#EAE4D8] focus:border-[#4E641A] rounded-xl py-3 px-4 text-xs font-sans focus:outline-none text-[#37411A]" 
                            required 
                          />
                        </div>

                        {/* Mobile Number */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Primary Mobile</label>
                          <input 
                            type="tel" 
                            placeholder="e.g. 9876543210" 
                            value={addressForm.phone} 
                            onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} 
                            className="w-full bg-[#FDFBF7] border border-[#EAE4D8] focus:border-[#4E641A] rounded-xl py-3 px-4 text-xs font-sans focus:outline-none text-[#37411A]" 
                            required 
                          />
                        </div>

                        {/* Alternate Mobile */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Alternate Mobile (Optional)</label>
                          <input 
                            type="tel" 
                            placeholder="Alternative phone contact" 
                            value={addressForm.altPhone} 
                            onChange={e => setAddressForm({ ...addressForm, altPhone: e.target.value })} 
                            className="w-full bg-[#FDFBF7] border border-[#EAE4D8] focus:border-[#4E641A] rounded-xl py-3 px-4 text-xs font-sans focus:outline-none text-[#37411A]" 
                          />
                        </div>

                        {/* PIN Code */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">PIN Code</label>
                          <input 
                            type="text" 
                            placeholder="6-digit PIN code" 
                            value={addressForm.postalCode} 
                            onChange={e => setAddressForm({ ...addressForm, postalCode: e.target.value })} 
                            className="w-full bg-[#FDFBF7] border border-[#EAE4D8] focus:border-[#4E641A] rounded-xl py-3 px-4 text-xs font-sans focus:outline-none text-[#37411A]" 
                            required 
                          />
                        </div>

                        {/* House/Flat No */}
                        <div className="flex flex-col gap-1 col-span-1 sm:col-span-2">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">House / Flat / Plot Number</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Flat 302, Sunrise Towers, Block A" 
                            value={addressForm.houseFlat} 
                            onChange={e => setAddressForm({ ...addressForm, houseFlat: e.target.value })} 
                            className="w-full bg-[#FDFBF7] border border-[#EAE4D8] focus:border-[#4E641A] rounded-xl py-3 px-4 text-xs font-sans focus:outline-none text-[#37411A]" 
                            required 
                          />
                        </div>

                        {/* Street details & landmarks */}
                        <div className="flex flex-col gap-1 col-span-1 sm:col-span-2">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Street / Area / Landmark</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Near Jubilee Hills Public School, Road No 5" 
                            value={addressForm.areaLandmark} 
                            onChange={e => setAddressForm({ ...addressForm, areaLandmark: e.target.value })} 
                            className="w-full bg-[#FDFBF7] border border-[#EAE4D8] focus:border-[#4E641A] rounded-xl py-3 px-4 text-xs font-sans focus:outline-none text-[#37411A]" 
                            required 
                          />
                        </div>

                        {/* City */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">City</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Hyderabad" 
                            value={addressForm.city} 
                            onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} 
                            className="w-full bg-[#FDFBF7] border border-[#EAE4D8] focus:border-[#4E641A] rounded-xl py-3 px-4 text-xs font-sans focus:outline-none text-[#37411A]" 
                            required 
                          />
                        </div>

                        {/* District */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">District</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Rangareddy" 
                            value={addressForm.district} 
                            onChange={e => setAddressForm({ ...addressForm, district: e.target.value })} 
                            className="w-full bg-[#FDFBF7] border border-[#EAE4D8] focus:border-[#4E641A] rounded-xl py-3 px-4 text-xs font-sans focus:outline-none text-[#37411A]" 
                            required 
                          />
                        </div>

                        {/* State Selection */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">State (Serviceable Areas Only)</label>
                          <select 
                            value={addressForm.state} 
                            onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} 
                            className="w-full bg-[#FDFBF7] border border-[#EAE4D8] focus:border-[#4E641A] rounded-xl py-3 px-4 text-xs font-sans focus:outline-none text-[#37411A] font-medium cursor-pointer"
                            required
                          >
                            <option value="">-- Choose State --</option>
                            <option value="Telangana">Telangana</option>
                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                          </select>
                        </div>

                        {/* Address Type pills */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Address Label</label>
                          <div className="flex gap-2">
                            {['Home', 'Work', 'Other'].map(type => {
                              const isSelected = addressForm.title === type;
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setAddressForm({ ...addressForm, title: type })}
                                  className={`flex-1 py-3 px-2 text-[9px] font-extrabold uppercase tracking-wider rounded-xl border transition-all duration-300 cursor-pointer select-none ${
                                    isSelected 
                                      ? 'bg-[#4E641A] border-[#4E641A] text-white shadow-xxs' 
                                      : 'bg-white border-[#EAE4D8] text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                                  }`}
                                >
                                  {type}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Default Checkbox */}
                        <div className="flex items-center gap-2.5 col-span-1 sm:col-span-2 pt-2 select-none cursor-pointer">
                          <input 
                            type="checkbox" 
                            id="addr-isDefault" 
                            checked={addressForm.isDefault} 
                            onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} 
                            className="w-4 h-4 text-[#4E641A] border-[#EAE4D8] rounded focus:ring-[#4E641A] cursor-pointer accent-[#4E641A]" 
                          />
                          <label htmlFor="addr-isDefault" className="text-[9px] font-extrabold uppercase tracking-wider text-[#37411A] cursor-pointer">
                            Mark this as my primary default delivery address
                          </label>
                        </div>
                      </div>

                      <div className="border-t pt-4 mt-2 flex justify-end gap-3">
                        <button 
                          type="button" 
                          onClick={() => setShowAddressForm(false)} 
                          className="px-5 py-3 border border-stone-200 text-stone-450 hover:bg-stone-50 text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer select-none bg-white"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-6 py-3 bg-[#4E641A] hover:bg-[#37411A] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer select-none border-none shadow-xxs"
                        >
                          Save Address
                        </button>
                      </div>
                    </form>
                  )}

                  {addresses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                      {addresses.map((addr) => {
                        const sParsed = parseStreet(addr.street);
                        const cParsed = parseCity(addr.city);
                        
                        // Human-readable formatted details with commas
                        const displayStreet = `${sParsed.houseFlat}, ${sParsed.areaLandmark}`;
                        const displayCity = `${cParsed.city}${cParsed.district ? ', ' + cParsed.district : ''}`;

                        return (
                          <div 
                            key={addr.id} 
                            className={`bg-white border rounded-[24px] p-5 flex flex-col justify-between min-h-[190px] shadow-xxs transition duration-300 text-left relative overflow-hidden ${
                              addr.isDefault ? 'border-[#4E641A] ring-1 ring-[#4E641A]/20' : 'border-[#EAE4D8] hover:border-[#EDE7D9]'
                            }`}
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="font-serif text-sm font-extrabold text-[#2F3B0C] flex items-center gap-1.5">
                                  <span>📍</span>
                                  <span>{addr.title || 'Delivery Address'}</span>
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {addr.isDefault && (
                                    <span className="text-[7px] font-extrabold bg-[#4E641A]/10 text-[#4E641A] border border-[#4E641A]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-xs text-stone-600 space-y-1.5 leading-relaxed">
                                <p className="font-bold text-[#37411A] text-xs leading-none">
                                  {addr.recipientName}
                                </p>
                                <p className="font-light text-stone-500">
                                  {displayStreet} <br />
                                  {displayCity}, {addr.state} – <span className="font-mono">{addr.postalCode}</span>
                                </p>
                                <p className="text-[10px] text-[#B8833E] font-medium flex items-center gap-3">
                                  <span>📞 {addr.phone}</span>
                                  {sParsed.altPhone && <span>📞 Alt: {sParsed.altPhone}</span>}
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t mt-4 border-stone-100 text-[8.5px] font-extrabold uppercase tracking-widest text-stone-500">
                              {/* Left Actions */}
                              <div className="flex items-center gap-3.5">
                                <button 
                                  onClick={() => populateAddressFormForEdit(addr)} 
                                  className="text-stone-400 hover:text-[#4E641A] transition cursor-pointer bg-transparent border-none p-0 font-extrabold text-[8.5px] uppercase tracking-widest select-none"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteAddress(addr.id)} 
                                  className="text-stone-400 hover:text-red-655 transition cursor-pointer bg-transparent border-none p-0 font-extrabold text-[8.5px] uppercase tracking-widest select-none"
                                >
                                  Delete
                                </button>
                              </div>

                              {/* Right context actions */}
                              <div className="flex items-center gap-2">
                                {!addr.isDefault && (
                                  <button
                                    onClick={() => handleSetAddressDefault(addr)}
                                    className="px-2.5 py-1 bg-stone-50 hover:bg-[#EDE7D9] text-[#2F3B0C] border border-[#EAE4D8] rounded-lg transition cursor-pointer select-none"
                                  >
                                    Set Default
                                  </button>
                                )}
                                {new URLSearchParams(location.search).get('from') === 'checkout' && (
                                  <button
                                    onClick={async () => {
                                      if (!addr.isDefault) {
                                        await handleSetAddressDefault(addr);
                                      }
                                      navigate('/checkout');
                                    }}
                                    className="px-2.5 py-1 bg-[#4E641A] hover:bg-[#37411A] text-white rounded-lg transition cursor-pointer shadow-xxs border-none select-none"
                                  >
                                    Select & Deliver
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    !showAddressForm && (
                      /* Premium empty state card */
                      <div className="bg-white border border-[#EAE4D8] rounded-[32px] py-16 px-6 text-center flex flex-col items-center gap-6 shadow-sm w-full mx-auto relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#C68A2B]/5 blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#4E641A]/5 blur-2xl pointer-events-none" />
                        
                        <div className="w-20 h-20 rounded-full bg-[#4E641A]/5 border border-[#4E641A]/10 flex items-center justify-center text-4xl shadow-inner shrink-0 relative">
                          <FiMapPin className="text-[#4E641A]" />
                        </div>
                        <div className="space-y-2 max-w-xs mx-auto">
                          <h3 className="font-serif text-xl font-bold text-[#2F3B0C]">No saved addresses</h3>
                          <p className="text-stone-500 font-sans text-xs leading-relaxed font-light">
                            Add your shipping coordinates to enjoy fast and hassle-free native harvest deliveries.
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setAddressForm({
                              id: '',
                              title: 'Home',
                              recipientName: '',
                              phone: '',
                              altPhone: '',
                              houseFlat: '',
                              areaLandmark: '',
                              city: '',
                              district: '',
                              state: '',
                              postalCode: '',
                              isDefault: false
                            });
                            setShowAddressForm(true);
                          }} 
                          className="px-6 py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer border-none scale-100 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span>Add Address</span>
                        </button>
                      </div>
                    )
                  )}
                </div>

                {/* Right Side: Delivery policy trust card */}
                <div className="w-full lg:w-[280px] shrink-0">
                  <div className="bg-[#FAF7F2] border border-[#EDE7D9] rounded-3xl p-5 space-y-4 text-left font-sans shadow-xxs sticky top-28">
                    <h4 className="font-serif text-xs font-extrabold uppercase text-[#2F3B0C] border-b pb-2 border-[#EDE7D9] tracking-wider">
                      Delivery Policy 🌾
                    </h4>
                    <div className="space-y-3.5 text-xs text-stone-600 leading-normal">
                      <div className="flex items-start gap-3">
                        <span className="text-base shrink-0 mt-0.5">🚚</span>
                        <div className="leading-tight">
                          <strong className="block text-[#37411A] text-[9px] font-extrabold uppercase tracking-wider">Fast Shipping</strong>
                          <span className="text-[8px] text-stone-500 font-light block mt-0.5">Estimated transit: 3–5 business days.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-base shrink-0 mt-0.5">📦</span>
                        <div className="leading-tight">
                          <strong className="block text-[#37411A] text-[9px] font-extrabold uppercase tracking-wider">Free Delivery</strong>
                          <span className="text-[8px] text-stone-500 font-light block mt-0.5">Unlocked automatically for total order weights of 2 KG or above.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-base shrink-0 mt-0.5">📍</span>
                        <div className="leading-tight">
                          <strong className="block text-[#37411A] text-[9px] font-extrabold uppercase tracking-wider">Serviceable States</strong>
                          <span className="text-[8px] text-stone-500 font-light block mt-0.5">Currently serving Telangana and Andhra Pradesh locations.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
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
                      <div 
                        onClick={() => { if (item.slug) navigate(`/products/${item.slug}`); }}
                        className={`w-full h-32 rounded-xl bg-gradient-to-tr ${item.imageColor || 'from-stone-100 to-stone-50'} overflow-hidden flex items-center justify-center text-3xl group-hover:scale-105 transition duration-300 cursor-pointer`}
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{item.emoji || '🌱'}</span>
                        )}
                      </div>
                      <div>
                        <h4 
                          onClick={() => { if (item.slug) navigate(`/products/${item.slug}`); }}
                          className="font-serif text-sm font-bold text-[#2F3B0C] leading-snug truncate hover:text-[#4E641A] transition-colors cursor-pointer"
                        >
                          {item.name}
                        </h4>
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

          {/* TAB 8.5: SUPPORT TICKETS */}
          {activeTab === 'tickets' && (
            <div className="space-y-6 text-left animate-fade-in">
              {selectedTicket ? (
                // TICKET CONVERSATION TIMELINE VIEW
                <div className="space-y-6">
                  {/* Header & Back Button */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#EAE4D8] rounded-[24px] p-5 shadow-sm">
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setSelectedTicket(null);
                          setTicketReply('');
                          setTicketReplyImage(null);
                          setReplyError(null);
                        }}
                        className="flex items-center gap-1 text-stone-500 hover:text-[#4E641A] font-sans text-xs font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer bg-transparent border-none p-0 mb-1 group"
                      >
                        <FiArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                        Back to Ticket List
                      </button>
                      <h3 className="font-serif text-lg font-bold text-[#2F3B0C] flex items-center gap-2">
                        <span className="text-[#C68A2B]">{selectedTicket.ticketNumber}</span>: {selectedTicket.subject}
                      </h3>
                      {selectedTicket.order && (
                        <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                          Linked Shipment: Order #{selectedTicket.order.orderNumber}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <span className={`text-[9px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-full border ${
                        selectedTicket.status === 'RESOLVED'
                          ? 'bg-green-700 text-white border-green-700'
                          : selectedTicket.status === 'CLOSED'
                          ? 'bg-stone-500 text-white border-stone-500'
                          : selectedTicket.status === 'IN_PROGRESS'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-[#C68A2B] text-white border-[#C68A2B]'
                      }`}>
                        Status: {selectedTicket.status.replace('_', ' ')}
                      </span>
                      <span className={`text-[9px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-full border ${
                        selectedTicket.priority === 'URGENT'
                          ? 'bg-red-655 text-white border-red-655'
                          : selectedTicket.priority === 'HIGH'
                          ? 'bg-orange-500 text-white border-orange-500'
                          : selectedTicket.priority === 'MEDIUM'
                          ? 'bg-[#4E641A] text-white border-[#4E641A]'
                          : 'bg-stone-400 text-white border-stone-400'
                      }`}>
                        Priority: {selectedTicket.priority}
                      </span>
                    </div>
                  </div>

                  {/* Conversation Timeline Chat Box */}
                  <div className="bg-white border border-[#EAE4D8] rounded-[32px] p-6 shadow-sm flex flex-col h-[400px]">
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                      {selectedTicket.messages?.map((msg, idx) => {
                        const isAdmin = msg.role === 'ADMIN';
                        return (
                          <div
                            key={idx}
                            className={`flex ${isAdmin ? 'justify-start' : 'justify-end'} w-full`}
                          >
                            <div className={`max-w-[80%] space-y-1 ${isAdmin ? 'text-left' : 'text-right'}`}>
                              <span className="text-[8px] font-extrabold uppercase tracking-widest text-stone-400 block px-1">
                                {isAdmin ? 'Suryodaya Support' : 'You'} • {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div className={`p-4 rounded-[20px] shadow-xxs ${
                                isAdmin
                                  ? 'bg-[#F9F6F0] border border-[#EAE4D8] text-stone-850 rounded-tl-none'
                                  : 'bg-[#4E641A] text-white rounded-tr-none'
                              }`}>
                                <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                {msg.imageUrl && (
                                  <div className="mt-2 rounded-lg overflow-hidden border max-w-xs cursor-zoom-in" onClick={() => window.open(msg.imageUrl, '_blank')}>
                                    <img src={msg.imageUrl} alt="Attached screenshot" className="max-h-40 object-cover w-full" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reply Form */}
                  {selectedTicket.status !== 'CLOSED' ? (
                    <form onSubmit={handleSendReply} className="bg-white border border-[#EAE4D8] rounded-[24px] p-5 shadow-sm space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#C68A2B] block">Write a reply</label>
                        <textarea
                          value={ticketReply}
                          onChange={(e) => setTicketReply(e.target.value)}
                          placeholder="Type your message here to reply to the helpdesk..."
                          rows={3}
                          required={!ticketReplyImage}
                          className="w-full p-3 border border-[#EAE4D8] rounded-xl text-stone-700 font-sans focus:outline-none focus:ring-1 focus:ring-[#4E641A]"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-[#EAE4D8] hover:border-[#4E641A] rounded-xl cursor-pointer text-stone-600 transition shrink-0">
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#4E641A]">Add Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleReplyImageChange}
                              className="hidden"
                            />
                          </label>
                          {ticketReplyImage && (
                            <div className="relative w-12 h-12 rounded-lg border border-[#EAE4D8] overflow-hidden shrink-0">
                              <img src={ticketReplyImage} alt="Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setTicketReplyImage(null)}
                                className="absolute -top-1 -right-1 bg-red-650 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-extrabold cursor-pointer border-none"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>

                        {replyError && (
                          <div className="text-[10px] text-red-655 font-semibold bg-red-50 p-2 rounded-lg border border-red-100 max-w-xs">
                            {replyError}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmittingReply}
                          className="w-full sm:w-auto px-6 py-3 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition duration-300 border-none cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {isSubmittingReply ? 'Sending...' : 'Send Message'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-stone-100 border border-stone-200 rounded-[24px] p-5 text-center text-stone-500 font-semibold text-xs">
                      🔒 This ticket has been marked Closed. If you need further assistance, please create a new support ticket.
                    </div>
                  )}
                </div>
              ) : (
                // TICKETS LIST VIEW
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">My Support Tickets 🎫</h3>
                  </div>

                  {supportTickets.length === 0 ? (
                    <div className="bg-white border border-[#EAE4D8] rounded-[32px] p-8 text-center space-y-4 shadow-sm py-16">
                      <span className="text-4xl block">🎫</span>
                      <h4 className="font-serif text-base font-bold text-[#2F3B0C]">No Support Tickets Found</h4>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed font-medium">
                        Need assistance with a shipment? Select any active or past shipment under the <strong>My Shipments</strong> tab, and click <strong>Create Support Ticket</strong>.
                      </p>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="px-6 py-3 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition duration-300 border-none cursor-pointer"
                      >
                        View My Shipments
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {supportTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-300 gap-4"
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-xs font-extrabold text-[#C68A2B] bg-[#C68A2B]/10 px-2 py-0.5 rounded">
                                {ticket.ticketNumber}
                              </span>
                              <div className="flex gap-1.5">
                                <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                  ticket.status === 'RESOLVED'
                                    ? 'bg-green-100 text-green-755 border-green-200'
                                    : ticket.status === 'CLOSED'
                                    ? 'bg-stone-100 text-stone-600 border-stone-200'
                                    : ticket.status === 'IN_PROGRESS'
                                    ? 'bg-amber-100 text-amber-600 border-amber-200'
                                    : 'bg-gold-50 text-[#C68A2B] border-gold-200'
                                }`}>
                                  {ticket.status.replace('_', ' ')}
                                </span>
                                <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                  ticket.priority === 'URGENT'
                                    ? 'bg-red-50 text-red-655 border-red-100'
                                    : ticket.priority === 'HIGH'
                                    ? 'bg-orange-50 text-orange-600 border-orange-100'
                                    : ticket.priority === 'MEDIUM'
                                    ? 'bg-green-50 text-[#4E641A] border-green-150'
                                    : 'bg-stone-50 text-stone-500 border-stone-200'
                                }`}>
                                  {ticket.priority}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-serif text-sm font-bold text-[#2F3B0C] line-clamp-1">
                                {ticket.subject}
                              </h4>
                              {ticket.order && (
                                <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                                  Order Reference: #{ticket.order.orderNumber}
                                </p>
                              )}
                              <p className="text-[10px] text-stone-500 font-medium">
                                Created on {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              fetchTicketDetails(ticket.id);
                            }}
                            className="w-full py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition duration-300 border-none cursor-pointer"
                          >
                            Open Conversation Feed
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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

      {/* Product Review Modal */}
      {reviewForm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setReviewForm(prev => ({ ...prev, show: false }))} className="absolute inset-0 bg-[#2F3B0C]/40 backdrop-blur-md" />
          <form onSubmit={handleSubmitReview} className="relative bg-white border border-[#EAE4D8] rounded-[28px] p-6 md:p-8 w-full max-w-md shadow-2xl z-10 text-left space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FiStar className="w-5 h-5 text-[#C68A2B]" />
                <span className="font-serif text-base font-bold text-[#2F3B0C]">Write a Harvest Review</span>
              </div>
              <button 
                type="button"
                onClick={() => setReviewForm(prev => ({ ...prev, show: false }))} 
                className="text-stone-400 font-extrabold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {reviewForm.error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-650 text-xs rounded-xl font-medium">
                {reviewForm.error}
              </div>
            )}

            {reviewForm.success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl font-medium">
                Review submitted successfully! Thank you for your feedback.
              </div>
            )}

            {/* Product selection dropdown if order has multiple items */}
            {(() => {
              const currentOrd = orders.find(o => o.id === reviewForm.orderId);
              if (!currentOrd) return null;
              
              if (currentOrd.orderItems?.length > 1) {
                return (
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-[#C68A2B] uppercase tracking-wider block">Select Harvest Item</label>
                    <select
                      value={reviewForm.productId}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, productId: e.target.value }))}
                      className="w-full bg-[#F9F6F0] border border-[#EAE4D8] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#4E641A] cursor-pointer"
                    >
                      {currentOrd.orderItems.map((item) => (
                        <option key={item.productId} value={item.productId}>
                          {item.product?.name || 'Organic Harvest'}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              } else {
                const firstItem = currentOrd.orderItems?.[0];
                return (
                  <div className="space-y-1 bg-[#F9F6F0] p-3 rounded-xl border border-[#EAE4D8]/60">
                    <span className="text-[8px] font-extrabold text-[#C68A2B] uppercase tracking-wider block">Harvest Item</span>
                    <span className="text-xs font-bold text-[#2F3B0C]">{firstItem?.product?.name || 'Organic Harvest'}</span>
                  </div>
                );
              }
            })()}

            {/* Rating Stars Selection */}
            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-[#C68A2B] uppercase tracking-wider block">Overall Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                    className="p-1 cursor-pointer transition transform hover:scale-110 active:scale-95 bg-transparent border-none"
                  >
                    <FiStar 
                      className={`w-6 h-6 ${
                        star <= reviewForm.rating 
                          ? 'text-[#C68A2B] fill-[#C68A2B]' 
                          : 'text-stone-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Title */}
            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-[#C68A2B] uppercase tracking-wider block font-sans">Review Title</label>
              <input
                type="text"
                placeholder="e.g. Excellent quality & prompt delivery!"
                value={reviewForm.reviewTitle}
                onChange={(e) => setReviewForm(prev => ({ ...prev, reviewTitle: e.target.value }))}
                className="w-full bg-[#F9F6F0] border border-[#EAE4D8] rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#4E641A]"
              />
            </div>

            {/* Review Text */}
            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-[#C68A2B] uppercase tracking-wider block font-sans font-sans">Review Comments</label>
              <textarea
                rows={4}
                placeholder="What did you think of this fresh farm harvest? How did it taste or perform?"
                value={reviewForm.reviewText}
                onChange={(e) => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
                required
                className="w-full bg-[#F9F6F0] border border-[#EAE4D8] rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#4E641A] resize-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-sm transition duration-300 cursor-pointer text-center border-none"
            >
              Submit Verified Review
            </button>
          </form>
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
