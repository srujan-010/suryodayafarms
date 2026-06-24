import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../store/useAdminAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useModalStore } from '../store/useModalStore';
import { useFeedbackStore } from '../store/useFeedbackStore';
import EmptyState from '../components/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiShoppingBag, 
  FiTruck, 
  FiUsers,
  FiUser, 
  FiTag, 
  FiBarChart2, 
  FiSettings, 
  FiLogOut, 
  FiPlus, 
  FiTrash2, 
  FiEdit2, 
  FiCheckCircle, 
  FiActivity, 
  FiSearch, 
  FiImage, 
  FiLayers, 
  FiEye,
  FiEyeOff,
  FiFileText,
  FiLayout,
  FiArrowUp,
  FiArrowDown,
  FiStar,
  FiMessageSquare,
  FiBell,
  FiAlertCircle,
  FiClock,
  FiTrendingUp,
  FiChevronDown,
  FiChevronUp,
  FiMoreVertical,
  FiArrowLeft
} from 'react-icons/fi';
import { GiSun } from 'react-icons/gi';
import api from '../utils/api';
import ImageCropper from './components/ImageCropper';
import UnifiedUploader from '../components/UnifiedUploader';

const getCloudinaryCroppedUrl = (url, crop) => {
  if (!url || !crop || crop.cropX === undefined || crop.cropX === null || !crop.cropWidth) return url;
  if (url.includes('res.cloudinary.com')) {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const prefix = url.substring(0, uploadIndex + 8);
      const suffix = url.substring(uploadIndex + 8);
      return `${prefix}c_crop,x_${crop.cropX},y_${crop.cropY},w_${crop.cropWidth},h_${crop.cropHeight}/${suffix}`;
    }
  }
  return url;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Isolated Admin store bindings
  const { adminUser, isAdminAuthenticated, isAdminAuthChecked, checkAdminAuth, adminLogout } = useAdminAuthStore();

  // Website Settings store and form bindings
  const { settings, fetchSettings, updateSettings } = useSettingsStore();

  // Custom promise-based Modal
  const modal = useModalStore();

  // Helper for Indian Standard Time (IST) operations
  const getISTDate = (dateInput) => {
    if (!dateInput) return new Date();
    const date = new Date(dateInput);
    const localOffset = date.getTimezoneOffset();
    return new Date(date.getTime() + (330 + localOffset) * 60000);
  };

  const getISTTodayStart = () => {
    const nowIST = getISTDate(new Date());
    return new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate());
  };

  // Global feedback loading state
  const { isLoading: isGlobalLoading } = useFeedbackStore();

  // Form errors for custom inline validations
  const [productFormErrors, setProductFormErrors] = useState({});
  const [categoryFormErrors, setCategoryFormErrors] = useState({});
  const [heroFormErrors, setHeroFormErrors] = useState({});
  const [collectionFormErrors, setCollectionFormErrors] = useState({});
  const [hpCatFormErrors, setHpCatFormErrors] = useState({});
  const [couponFormErrors, setCouponFormErrors] = useState({});
  const [shipmentDrafts, setShipmentDrafts] = useState({});
  const [shipmentErrors, setShipmentErrors] = useState({});
  const [isSavingShipment, setIsSavingShipment] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});

  // CRM Module States
  const [crmSearchQuery, setCrmSearchQuery] = useState('');
  const [crmFilterSegment, setCrmFilterSegment] = useState('all');
  const [crmViewMode, setCrmViewMode] = useState('card');
  const [selectedCrmCustomer, setSelectedCrmCustomer] = useState(null);
  const [isCrmDrawerOpen, setIsCrmDrawerOpen] = useState(false);

  const [settingsForm, setSettingsForm] = useState({
    companyName: '',
    brandName: '',
    email: '',
    phone: '',
    address: '',
    websiteUrl: '',
    gstNumber: '',
    registrationDetails: '',
    socialTwitter: '',
    socialFacebook: '',
    socialInstagram: '',
    socialYoutube: '',
    freeDeliveryThreshold: '',
    shippingCharge: '',
    serviceableStates: ''
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [adminNameForm, setAdminNameForm] = useState('');
  const [adminAvatarForm, setAdminAvatarForm] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  // Tab mapping state dynamically mapped to location path
  const [activeTab, setActiveTab] = useState('overview');

  // Interactive Sidebar states for premium collapsible groups & mobile responsiveness
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({
    core: false,
    marketing: false,
    content: false,
    config: false,
    support: false
  });

  // Support Tickets Admin CRM States
  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedSupportTicket, setSelectedSupportTicket] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminReplyImage, setAdminReplyImage] = useState(null);
  const [isSubmittingAdminReply, setIsSubmittingAdminReply] = useState(false);
  const [adminReplyError, setAdminReplyError] = useState(null);
  const [supportSearchQuery, setSupportSearchQuery] = useState('');
  const [supportStatusFilter, setSupportStatusFilter] = useState('ALL');
  const [supportPriorityFilter, setSupportPriorityFilter] = useState('ALL');

  // Orders tab search and filter states for enterprise logistics panel
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderLogisticsFilter, setOrderLogisticsFilter] = useState('ALL');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('ALL');

  // Reviews Moderation & Testimonials CMS States
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('ALL');
  const [reviewSearch, setReviewSearch] = useState('');
  const filteredReviews = reviewsList.filter((rev) => {
    if (reviewFilter !== 'ALL' && rev.status !== reviewFilter) {
      return false;
    }
    if (reviewSearch) {
      const query = reviewSearch.toLowerCase();
      const nameMatch = (rev.customerName || '').toLowerCase().includes(query);
      const textMatch = (rev.reviewText || rev.comment || '').toLowerCase().includes(query);
      const titleMatch = (rev.reviewTitle || '').toLowerCase().includes(query);
      return nameMatch || textMatch || titleMatch;
    }
    return true;
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    id: '',
    customerName: '',
    rating: 5,
    reviewTitle: '',
    reviewText: '',
    status: 'PENDING'
  });

  const [testimonialsList, setTestimonialsList] = useState([]);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    id: '',
    customerName: '',
    location: '',
    testimonialText: '',
    rating: 5,
    customerPhoto: '',
    productPurchased: '',
    featuredToggle: false,
    isActive: true
  });

  const [productSpecificReviews, setProductSpecificReviews] = useState([]);
  const [productModalTab, setProductModalTab] = useState('general');

  // New states for independent review management
  const [selectedReviewProductId, setSelectedReviewProductId] = useState(null);
  const [productsReviewSummary, setProductsReviewSummary] = useState([]);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  const fetchProductsReviewSummary = async () => {
    try {
      const response = await api.get('/admin/reviews/products-summary');
      if (response.success) {
        setProductsReviewSummary(response.products);
      }
    } catch (err) {
      console.error('Failed to fetch reviews summary:', err);
    }
  };

  const fetchProductSpecificDetailReviews = async (productId) => {
    try {
      const response = await api.get(`/admin/reviews/product/${productId}`);
      if (response.success) {
        setSelectedProductDetails(response.product);
        setReviewsList(response.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch product reviews:', err);
    }
  };

  const fetchAdminReviews = async () => {
    try {
      const response = await api.get(`/admin/reviews?status=${reviewFilter}&search=${reviewSearch}`);
      if (response.success) {
        setReviewsList(response.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const fetchAdminTestimonials = async () => {
    try {
      const response = await api.get('/admin/testimonials');
      if (response.success) {
        setTestimonialsList(response.testimonials);
      }
    } catch (err) {
      console.error('Failed to fetch testimonials:', err);
    }
  };

  const fetchProductSpecificReviews = async (productId) => {
    try {
      const response = await api.get(`/admin/reviews?productId=${productId}`);
      if (response.success) {
        setProductSpecificReviews(response.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch product-specific reviews:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchProductsReviewSummary();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'reviews-detail' && selectedReviewProductId) {
      fetchProductSpecificDetailReviews(selectedReviewProductId);
    }
  }, [activeTab, selectedReviewProductId]);

  useEffect(() => {
    if (activeTab === 'testimonials') {
      fetchAdminTestimonials();
    }
  }, [activeTab]);

  const handleApproveReview = async (id) => {
    try {
      const response = await api.put(`/admin/reviews/${id}`, { status: 'APPROVED' });
      if (response.success) {
        modal.alert('Approved', 'Review has been approved and published to the storefront.', 'success');
        if (selectedReviewProductId) {
          fetchProductSpecificDetailReviews(selectedReviewProductId);
        } else {
          fetchAdminReviews();
        }
        fetchProductsReviewSummary();
        if (productForm.id) {
          fetchProductSpecificReviews(productForm.id);
        }
      }
    } catch (err) {
      modal.alert('Error', err.message, 'error');
    }
  };

  const handleRejectReview = async (id) => {
    try {
      const response = await api.put(`/admin/reviews/${id}`, { status: 'REJECTED' });
      if (response.success) {
        modal.alert('Rejected', 'Review has been rejected and hidden from the storefront.', 'success');
        if (selectedReviewProductId) {
          fetchProductSpecificDetailReviews(selectedReviewProductId);
        } else {
          fetchAdminReviews();
        }
        fetchProductsReviewSummary();
        if (productForm.id) {
          fetchProductSpecificReviews(productForm.id);
        }
      }
    } catch (err) {
      modal.alert('Error', err.message, 'error');
    }
  };

  const handleDeleteReview = async (id) => {
    const confirm = await modal.confirm('Delete Review', 'Are you sure you want to permanently delete this review?', 'warning');
    if (!confirm) return;
    try {
      const response = await api.delete(`/admin/reviews/${id}`);
      if (response.success) {
        modal.alert('Deleted', 'Review deleted successfully.', 'success');
        if (selectedReviewProductId) {
          fetchProductSpecificDetailReviews(selectedReviewProductId);
        } else {
          fetchAdminReviews();
        }
        fetchProductsReviewSummary();
        if (productForm.id) {
          fetchProductSpecificReviews(productForm.id);
        }
      }
    } catch (err) {
      modal.alert('Error', err.message, 'error');
    }
  };

  // Support Tickets Admin CRM Helpers
  const fetchAdminSupportTickets = async () => {
    try {
      const response = await api.get(`/support/admin/tickets?status=${supportStatusFilter}&priority=${supportPriorityFilter}&search=${supportSearchQuery}`);
      if (response.success && response.tickets) {
        setSupportTickets(response.tickets);
      }
    } catch (err) {
      console.error('Failed to fetch admin support tickets:', err);
    }
  };

  const fetchAdminTicketDetails = async (ticketId, isSilent = false) => {
    try {
      const response = await api.get(`/support/admin/tickets/${ticketId}`);
      if (response.success && response.ticket) {
        setSelectedSupportTicket(response.ticket);
      }
    } catch (err) {
      console.error('Failed to fetch admin ticket details:', err);
    }
  };

  const handleUpdateTicketStatusOrPriority = async (ticketId, status, priority) => {
    try {
      const response = await api.put(`/support/admin/tickets/${ticketId}`, { status, priority });
      if (response.success) {
        await fetchAdminTicketDetails(ticketId);
        fetchAdminSupportTickets();
      }
    } catch (err) {
      console.error('Failed to update ticket status/priority:', err);
    }
  };

  const handleAdminSendReply = async (e) => {
    e.preventDefault();
    if (!adminReplyText.trim() && !adminReplyImage) return;

    setIsSubmittingAdminReply(true);
    setAdminReplyError(null);

    try {
      let finalImageUrl = null;
      if (adminReplyImage) {
        const uploadRes = await api.post('/auth/upload-cloudinary', {
          image: adminReplyImage,
          folder: 'tickets'
        });
        if (uploadRes.success && uploadRes.url) {
          finalImageUrl = uploadRes.url;
        } else {
          throw new Error(uploadRes.message || 'Image upload failed');
        }
      }

      const response = await api.post(`/support/admin/tickets/${selectedSupportTicket.id}/messages`, {
        message: adminReplyText,
        imageUrl: finalImageUrl
      });

      if (response.success) {
        setAdminReplyText('');
        setAdminReplyImage(null);
        await fetchAdminTicketDetails(selectedSupportTicket.id);
        fetchAdminSupportTickets();
      } else {
        throw new Error(response.message || 'Failed to send admin reply');
      }
    } catch (err) {
      setAdminReplyError(err.message || 'Failed to send reply.');
    } finally {
      setIsSubmittingAdminReply(false);
    }
  };

  const handleAdminReplyImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAdminReplyError('Please upload an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAdminReplyError('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAdminReplyImage(reader.result);
      setAdminReplyError(null);
    };
    reader.onerror = () => {
      setAdminReplyError('Failed to read file.');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (activeTab === 'support-tickets') {
      fetchAdminSupportTickets();
    }
  }, [activeTab, supportStatusFilter, supportPriorityFilter, supportSearchQuery]);

  useEffect(() => {
    let interval = null;
    if (selectedSupportTicket && activeTab === 'support-tickets') {
      interval = setInterval(() => {
        fetchAdminTicketDetails(selectedSupportTicket.id, true);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedSupportTicket, activeTab]);

  const handlePromoteReview = async (review) => {
    const confirm = await modal.confirm(
      'Promote to Testimonial',
      `Promoting review by ${review.customerName} to Testimonial. It will be shown in the homepage slider. Proceed?`,
      'info'
    );
    if (!confirm) return;
    try {
      const response = await api.post(`/admin/reviews/${review.id}/promote`, { location: 'Verified Family Member' });
      if (response.success) {
        modal.alert('Promoted', 'Review successfully promoted to a testimonial!', 'success');
        fetchAdminTestimonials();
      }
    } catch (err) {
      modal.alert('Error', err.message, 'error');
    }
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/admin/reviews/${reviewForm.id}`, {
        rating: reviewForm.rating,
        reviewTitle: reviewForm.reviewTitle,
        reviewText: reviewForm.reviewText,
        customerName: reviewForm.customerName,
        status: reviewForm.status
      });
      if (response.success) {
        modal.alert('Updated', 'Review details updated successfully.', 'success');
        setShowReviewModal(false);
        if (selectedReviewProductId) {
          fetchProductSpecificDetailReviews(selectedReviewProductId);
        } else {
          fetchAdminReviews();
        }
        fetchProductsReviewSummary();
        if (productForm.id) {
          fetchProductSpecificReviews(productForm.id);
        }
      }
    } catch (err) {
      modal.alert('Error', err.message, 'error');
    }
  };

  const handleToggleTestimonialActive = async (testimonial) => {
    try {
      const response = await api.put(`/admin/testimonials/${testimonial.id}`, { isActive: !testimonial.isActive });
      if (response.success) {
        fetchAdminTestimonials();
      }
    } catch (err) {
      modal.alert('Error', err.message, 'error');
    }
  };

  const handleToggleTestimonialFeatured = async (testimonial) => {
    try {
      const response = await api.put(`/admin/testimonials/${testimonial.id}`, { featuredToggle: !testimonial.featuredToggle });
      if (response.success) {
        fetchAdminTestimonials();
      }
    } catch (err) {
      modal.alert('Error', err.message, 'error');
    }
  };

  const handleDeleteTestimonial = async (id) => {
    const confirm = await modal.confirm('Delete Testimonial', 'Are you sure you want to permanently delete this testimonial?', 'warning');
    if (!confirm) return;
    try {
      const response = await api.delete(`/admin/testimonials/${id}`);
      if (response.success) {
        modal.alert('Deleted', 'Testimonial deleted successfully.', 'success');
        fetchAdminTestimonials();
      }
    } catch (err) {
      modal.alert('Error', err.message, 'error');
    }
  };

  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    try {
      let response;
      const data = {
        customerName: testimonialForm.customerName,
        location: testimonialForm.location,
        testimonialText: testimonialForm.testimonialText,
        rating: parseInt(testimonialForm.rating, 10),
        customerPhoto: testimonialForm.customerPhoto,
        productPurchased: testimonialForm.productPurchased,
        featuredToggle: testimonialForm.featuredToggle,
        isActive: testimonialForm.isActive
      };
      if (testimonialForm.id) {
        response = await api.put(`/admin/testimonials/${testimonialForm.id}`, data);
      } else {
        response = await api.post('/admin/testimonials', data);
      }
      if (response.success) {
        modal.alert('Success', testimonialForm.id ? 'Testimonial updated successfully.' : 'Testimonial created successfully.', 'success');
        setShowTestimonialModal(false);
        fetchAdminTestimonials();
      }
    } catch (err) {
      modal.alert('Error', err.message, 'error');
    }
  };

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        companyName: settings.companyName || '',
        brandName: settings.brandName || '',
        email: settings.email || '',
        phone: settings.phone || '',
        address: settings.address || '',
        websiteUrl: settings.websiteUrl || '',
        gstNumber: settings.gstNumber || '',
        registrationDetails: settings.registrationDetails || '',
        socialTwitter: settings.socialTwitter || '',
        socialFacebook: settings.socialFacebook || '',
        socialInstagram: settings.socialInstagram || '',
        socialYoutube: settings.socialYoutube || '',
        freeDeliveryThreshold: settings.freeDeliveryThreshold || '2',
        shippingCharge: settings.shippingCharge || '80',
        serviceableStates: settings.serviceableStates || 'Telangana, Andhra Pradesh'
      });
    }
  }, [settings]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsMessage('');
    useFeedbackStore.getState().showLoader('Saving settings...');
    try {
      const success = await updateSettings(settingsForm);
      useFeedbackStore.getState().hideLoader();
      if (success) {
        setSettingsMessage('Settings updated successfully!');
        setTimeout(() => setSettingsMessage(''), 3000);
        useFeedbackStore.getState().showToast('✅ Settings saved successfully', 'success');
      } else {
        setSettingsMessage('Failed to update settings.');
        useFeedbackStore.getState().showToast('❌ Failed to save settings', 'error');
      }
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      setSettingsMessage(`Error: ${err.message}`);
      useFeedbackStore.getState().showToast(`❌ Failed to save settings: ${err.message}`, 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Operational states
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState({});

  const toggleOrderExpand = (id) => {
    setExpandedOrderIds(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponSearchQuery, setCouponSearchQuery] = useState('');
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '0',
    expiryDate: '',
    usageLimit: '-1',
    isActive: true
  });

  // Homepage Hero & Campaign CMS states
  const [homepageHeroes, setHomepageHeroes] = useState([]);
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [cropTarget, setCropTarget] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [heroForm, setHeroForm] = useState({
    id: '',
    trustBadgeText: '',
    headingLine1: '',
    headingHighlight: '',
    headingLine2: '',
    description: '',
    bulletOne: '',
    bulletTwo: '',
    bulletThree: '',
    bulletFour: '',
    primaryButtonText: '',
    primaryButtonLink: '',
    secondaryButtonText: '',
    secondaryButtonLink: '',
    promoText: '',
    heroImage: '',
    featuredProductId: '',
    offerBadgeText: '',
    floatingBadgeTitle: '',
    floatingBadgeSubtitle: '',
    slideOrder: 0,
    isFeatured: false,
    isActive: true,
    cropX: null,
    cropY: null,
    cropWidth: null,
    cropHeight: null,
    zoom: 1,
    aspectRatio: ''
  });

  const [homepageCollections, setHomepageCollections] = useState([]);
  const [homepageCategories, setHomepageCategories] = useState([]);
  const [sectionOrder, setSectionOrder] = useState('categories,hero,best-sellers,trust,collections,benefits,reviews,footer-banner');
  const [selectedSubTab, setSelectedSubTab] = useState('hero'); // hero, collections, categories, sections
  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const [isEditingHPCat, setIsEditingHPCat] = useState(false);
  
  const [collectionForm, setCollectionForm] = useState({
    id: '',
    title: '',
    badge: '',
    description: '',
    image: '',
    ctaText: 'Browse Collection',
    categorySlug: 'all',
    sortOrder: 0,
    isActive: true
  });

  const [hpCatForm, setHpCatForm] = useState({
    id: '',
    title: '',
    subtitle: '',
    image: '',
    mobileImage: '',
    ctaText: 'Browse Collection',
    categorySlug: '',
    overlayPosition: 'bottom-left',
    overlayDarkness: 0.5,
    textColorTheme: 'light',
    sortOrder: 0,
    isActive: true,
    isFeatured: false,
    imageFocalPoint: 'center',
    hoverZoom: true,
    ctaStyle: 'arrow',
    cornerRadius: '3xl'
  });
  const [previewDeviceMode, setPreviewDeviceMode] = useState('desktop');
  const [selectedCategoryAssistId, setSelectedCategoryAssistId] = useState('');

  const [expandedSection, setExpandedSection] = useState(null);
  const [sectionTitleInput, setSectionTitleInput] = useState('');
  const [sectionSubtitleInput, setSectionSubtitleInput] = useState('');
  const [sectionBadgeInput, setSectionBadgeInput] = useState('');

  const handleCategoryAssistChange = (catId) => {
    setSelectedCategoryAssistId(catId);
    if (!catId) return;

    const cat = categories.find(c => c.id === catId);
    if (!cat) return;

    if (selectedSubTab === 'collections') {
      setCollectionForm(prev => ({
        ...prev,
        title: prev.title || cat.name,
        badge: prev.badge || cat.name.toUpperCase(),
        description: prev.description || cat.description || '',
        image: prev.image || cat.image || '',
        categorySlug: prev.categorySlug === 'all' || !prev.categorySlug ? cat.slug : prev.categorySlug
      }));
    } else if (selectedSubTab === 'categories') {
      setHpCatForm(prev => ({
        ...prev,
        title: prev.title || cat.name,
        subtitle: prev.subtitle || cat.description || '',
        categorySlug: prev.categorySlug || cat.slug,
        image: prev.image || cat.image || '',
        mobileImage: prev.mobileImage || cat.image || ''
      }));
    }
  };

  const handleSyncFromCategory = () => {
    if (!selectedCategoryAssistId) return;
    const cat = categories.find(c => c.id === selectedCategoryAssistId);
    if (!cat) return;

    if (selectedSubTab === 'collections') {
      setCollectionForm(prev => ({
        ...prev,
        title: cat.name,
        badge: cat.name.toUpperCase(),
        description: cat.description || '',
        image: cat.image || '',
        categorySlug: cat.slug
      }));
      modal.alert('Synced Details', `Filled collection details with values from category: ${cat.name}`, 'success');
    } else if (selectedSubTab === 'categories') {
      setHpCatForm(prev => ({
        ...prev,
        title: cat.name,
        subtitle: cat.description || '',
        categorySlug: cat.slug,
        image: cat.image || '',
        mobileImage: cat.image || ''
      }));
      modal.alert('Synced Details', `Filled category showcase details with values from category: ${cat.name}`, 'success');
    }
  };

  const resetHPCatForm = () => {
    setHpCatForm({
      id: '',
      title: '',
      subtitle: '',
      image: '',
      mobileImage: '',
      ctaText: 'Browse Collection',
      categorySlug: '',
      overlayPosition: 'bottom-left',
      overlayDarkness: 0.5,
      textColorTheme: 'light',
      sortOrder: 0,
      isActive: true,
      isFeatured: false,
      imageFocalPoint: 'center',
      hoverZoom: true,
      ctaStyle: 'arrow',
      cornerRadius: '3xl'
    });
    setHpCatFormErrors({});
    setSelectedCategoryAssistId('');
  };

  // Search and Filter parameters
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for Products and Categories CRUD
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    categoryId: '',
    categoryIds: [],
    description: '',
    shortDescription: '',
    brand: 'Suryodaya Farms',
    productType: '',
    price: '',
    compareAtPrice: '',
    mrp: '',
    discountPercent: 0,
    taxPercent: 0,
    stockStatus: 'IN_STOCK',
    sku: '',
    inventory: '',
    hoverImage: '',
    mobileBanner: '',
    isFeatured: false,
    isTrending: false,
    isBestseller: false,
    isNewLaunch: false,
    isVisible: true,
    isComingSoon: false,
    nutrients: '',
    origin: '',
    shelfLife: '',
    deliveryEta: '2-3 Days',
    codAvailable: true,
    returnEligible: false,
    weight: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    image: '',
    images: ['', '', '', ''],
    variants: []
  });

  const calculateDiscount = (orig, sale) => {
    const origPrice = parseFloat(orig);
    const salePrice = parseFloat(sale);
    if (!isNaN(origPrice) && !isNaN(salePrice) && origPrice > 0 && origPrice > salePrice) {
      return Math.round(((origPrice - salePrice) / origPrice) * 100);
    }
    return 0;
  };

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    image: '',
    seoTitle: '',
    seoDescription: '',
    isVisible: true,
    homepageVisible: true,
    isFeatured: false
  });

  const [catSearchQuery, setCatSearchQuery] = useState('');
  const [catHomepageFilter, setCatHomepageFilter] = useState('all'); // all, visible, hidden
  const [catSizeFilter, setCatSizeFilter] = useState('all'); // all, empty, active
  const [catSortBy, setCatSortBy] = useState('name-asc'); // name-asc, name-desc, products-desc, products-asc, updated-desc, updated-asc

  const [activeAnalyticsCategory, setActiveAnalyticsCategory] = useState(null);
  const [activePreviewCategory, setActivePreviewCategory] = useState(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allAdminProducts, setAllAdminProducts] = useState([]);
  const [selectedProductIdsToAssign, setSelectedProductIdsToAssign] = useState([]);
  const [assignSearchQuery, setAssignSearchQuery] = useState('');
  const [categoryProductSearchQuery, setCategoryProductSearchQuery] = useState('');

  const scrollToTop = () => {
    const mainEl = document.getElementById('admin-main-content');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Verify auth session on mount
  useEffect(() => {
    checkAdminAuth();
  }, []);

  // Sync admin user form fields on auth changes
  useEffect(() => {
    if (adminUser) {
      setAdminNameForm(adminUser.name || '');
      setAdminAvatarForm(adminUser.avatarUrl || '');
    }
  }, [adminUser]);

  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    useFeedbackStore.getState().showLoader('Saving profile...');
    try {
      const response = await api.put('/auth/profile', {
        name: adminNameForm,
        avatarUrl: adminAvatarForm
      });
      useFeedbackStore.getState().hideLoader();
      if (response.success) {
        setProfileMessage('Profile updated successfully.');
        useFeedbackStore.getState().showToast('✅ Profile updated successfully', 'success');
        await checkAdminAuth();
      } else {
        setProfileMessage('Failed to update profile.');
        useFeedbackStore.getState().showToast('❌ Failed to update profile', 'error');
      }
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      setProfileMessage(err.message || 'Failed to update profile.');
      useFeedbackStore.getState().showToast(`❌ Failed to update profile: ${err.message}`, 'error');
    }
  };

  // Sync active tab to url path dynamically
  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/dashboard')) setActiveTab('overview');
    else if (path.endsWith('/products')) setActiveTab('products');
    else if (path.endsWith('/orders')) setActiveTab('orders');
    else if (path.endsWith('/customers')) setActiveTab('customers');
    else if (path.endsWith('/categories')) setActiveTab('categories');
    else if (path.endsWith('/analytics')) setActiveTab('analytics');
    else if (path.endsWith('/settings')) setActiveTab('settings');
    else if (path.endsWith('/homepage')) setActiveTab('homepage');
    else if (path.endsWith('/coupons')) setActiveTab('coupons');
    else if (path.endsWith('/reviews')) {
      setActiveTab('reviews');
      setSelectedReviewProductId(null);
    } else if (path.includes('/reviews/')) {
      setActiveTab('reviews-detail');
      const parts = path.split('/');
      setSelectedReviewProductId(parts[parts.length - 1]);
    } else if (path.endsWith('/testimonials')) {
      setActiveTab('testimonials');
    } else if (path.endsWith('/support-tickets')) {
      setActiveTab('support-tickets');
      setSelectedSupportTicket(null);
    } else if (path.includes('/support-tickets/')) {
      setActiveTab('support-tickets');
      const parts = path.split('/');
      const ticketId = parts[parts.length - 1];
      fetchAdminTicketDetails(ticketId);
    }
  }, [location.pathname]);

  // Authorization Redirect Protection Guard
  useEffect(() => {
    if (isAdminAuthChecked && !isAdminAuthenticated) {
      navigate('/admin');
    } else if (isAdminAuthenticated) {
      loadDashboardData();
    }
  }, [isAdminAuthenticated, isAdminAuthChecked, navigate]);

  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      await Promise.all([
        fetchAnalytics(),
        fetchProducts(),
        fetchCategories(),
        fetchOrders(),
        fetchCustomers(),
        fetchCoupons(),
        fetchHomepageCMSData(),
        fetchSettings()
      ]);
    } catch (err) {
      console.error("Dashboard fetching logs exception:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchHomepageCMSData = async () => {
    try {
      const heroResponse = await api.get('/admin/homepage/hero');
      const fetchedHeroes = heroResponse.heroes || [];
      setHomepageHeroes(fetchedHeroes);

      if (fetchedHeroes.length > 0 && (!heroForm.id || !isEditingHero)) {
        const hr = fetchedHeroes[0];
        setHeroForm({
          id: hr.id,
          trustBadgeText: hr.trustBadgeText || '',
          headingLine1: hr.headingLine1 || '',
          headingHighlight: hr.headingHighlight || '',
          headingLine2: hr.headingLine2 || '',
          description: hr.description || '',
          bulletOne: hr.bulletOne || '',
          bulletTwo: hr.bulletTwo || '',
          bulletThree: hr.bulletThree || '',
          bulletFour: hr.bulletFour || '',
          primaryButtonText: hr.primaryButtonText || '',
          primaryButtonLink: hr.primaryButtonLink || '',
          secondaryButtonText: hr.secondaryButtonText || '',
          secondaryButtonLink: hr.secondaryButtonLink || '',
          promoText: hr.promoText || '',
          heroImage: hr.heroImage || '',
          featuredProductId: hr.featuredProductId || '',
          offerBadgeText: hr.offerBadgeText || '',
          floatingBadgeTitle: hr.floatingBadgeTitle || '',
          floatingBadgeSubtitle: hr.floatingBadgeSubtitle || '',
          slideOrder: hr.slideOrder || 0,
          isFeatured: !!hr.isFeatured,
          isActive: hr.isActive,
          cropX: hr.cropX,
          cropY: hr.cropY,
          cropWidth: hr.cropWidth,
          cropHeight: hr.cropHeight,
          zoom: hr.zoom || 1,
          aspectRatio: hr.aspectRatio || ''
        });
      }

      const collResponse = await api.get('/admin/homepage/collections');
      const allColls = collResponse.collections || [];

      setHomepageCollections(allColls);

      // Differentiate categories inside homepageCollections by isPromoCategory
      const promoCats = allColls.filter(c => {
        if (c.description && c.description.startsWith('{')) {
          try {
            const parsed = JSON.parse(c.description);
            return !!parsed.isPromoCategory;
          } catch(e) {}
        }
        return false;
      });
      setHomepageCategories(promoCats);

      const sectResponse = await api.get('/admin/homepage/sections');
      setSectionOrder(sectResponse.order || 'categories,hero,best-sellers,trust,collections,benefits,reviews,footer-banner');
    } catch (err) {
      console.error("Homepage CMS fetch failed:", err);
    }
  };

  const handleSaveHero = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!heroForm.headingLine1) errors.headingLine1 = 'Main Heading Line 1 is required';
    if (Object.keys(errors).length > 0) {
      setHeroFormErrors(errors);
      return;
    }
    setHeroFormErrors({});

    useFeedbackStore.getState().showLoader('Saving hero layout...');
    try {
      if (heroForm.id) {
        await api.put(`/admin/homepage/hero/${heroForm.id}`, heroForm);
      } else {
        await api.post('/admin/homepage/hero', heroForm);
      }
      setIsEditingHero(false);
      resetHeroForm();
      fetchHomepageCMSData();
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast('✅ Hero banner saved successfully', 'success');
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast(`❌ Failed to save hero layout: ${err.message}`, 'error');
    }
  };

  const handleDeleteHero = async (id) => {
    const confirmed = await modal.confirm(
      'Delete Hero Layout?',
      'Delete this homepage hero configuration? This action cannot be undone.',
      'warning',
      'Delete',
      'Cancel'
    );
    if (confirmed) {
      useFeedbackStore.getState().showLoader('Deleting hero layout...');
      try {
        await api.delete(`/admin/homepage/hero/${id}`);
        fetchHomepageCMSData();
        useFeedbackStore.getState().hideLoader();
        useFeedbackStore.getState().showToast('✅ Hero banner deleted successfully', 'success');
      } catch (err) {
        useFeedbackStore.getState().hideLoader();
        useFeedbackStore.getState().showToast(`❌ Failed to delete hero layout: ${err.message}`, 'error');
      }
    }
  };

  const handleToggleHeroActive = async (id, currentStatus) => {
    try {
      await api.put(`/admin/homepage/hero/${id}/toggle-active`, { isActive: !currentStatus });
      fetchHomepageCMSData();
      modal.alert('Status Updated', `Hero layout is now ${!currentStatus ? 'Active' : 'Inactive'}.`, 'success');
    } catch (err) {
      modal.alert('Action Failed', err.message, 'error');
    }
  };

  const resetHeroForm = () => {
    setHeroForm({
      id: '',
      trustBadgeText: '',
      headingLine1: '',
      headingHighlight: '',
      headingLine2: '',
      description: '',
      bulletOne: '',
      bulletTwo: '',
      bulletThree: '',
      bulletFour: '',
      primaryButtonText: '',
      primaryButtonLink: '',
      secondaryButtonText: '',
      secondaryButtonLink: '',
      promoText: '',
      heroImage: '',
      featuredProductId: '',
      offerBadgeText: '',
      floatingBadgeTitle: '',
      floatingBadgeSubtitle: '',
      slideOrder: 0,
      isFeatured: false,
      isActive: true,
      cropX: null,
      cropY: null,
      cropWidth: null,
      cropHeight: null,
      zoom: 1,
      aspectRatio: ''
    });
  };

  const loadHeroTemplate = (templateType) => {
    const templates = {
      default: {
        trustBadgeText: "Loved by 12,000+ Indian Families (4.9★)",
        headingLine1: "Pristine Vedic Staples",
        headingHighlight: "Hand-Extracted",
        headingLine2: "",
        description: "We preserve heirloom seeds, practice strictly chemical-free cultivation in Wardha, and slowly process harvests under 35°C to preserve deep mineral enzymes, natural flavor, and life force.",
        bulletOne: "Chemical-Free Soil",
        bulletTwo: "Vedic Bilona Churned",
        bulletThree: "Wood Pressed Ghanis",
        bulletFour: "No Added Preservatives",
        primaryButtonText: "Shop Now",
        primaryButtonLink: "/",
        secondaryButtonText: "Explore Collections",
        secondaryButtonLink: "/",
        promoText: "Use Code: SURYODAYA10 to get 10% Extra Soil Credits",
        heroImage: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800",
        featuredProductId: "",
        offerBadgeText: "15% OFF",
        floatingBadgeTitle: "100% Heirloom",
        floatingBadgeSubtitle: "Non-Hybrid seeds"
      },
      premium: {
        trustBadgeText: "Pure Direct Farm-to-Table Standard",
        headingLine1: "Cold Pressed Wellness Oils",
        headingHighlight: "Earthy Aromas",
        headingLine2: "Straight From the Soil",
        description: "Traditional Vagai wood press extraction at low temperatures under 35°C. Pure cold-extracted native nutrients with zero refining chemicals.",
        bulletOne: "Wood Pressed Ghanis",
        bulletTwo: "Zero Chemical Bleach",
        bulletThree: "Direct Wardha Sourcing",
        bulletFour: "Native Micro-Nutrients",
        primaryButtonText: "Browse Pure Oils",
        primaryButtonLink: "/products",
        secondaryButtonText: "About Our Farm",
        secondaryButtonLink: "/about",
        promoText: "PROMOCODE: COLDSOIL to get a free sample bottle!",
        heroImage: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800",
        featuredProductId: "",
        offerBadgeText: "FREE SAMPLE",
        floatingBadgeTitle: "Wood Ghani",
        floatingBadgeSubtitle: "Cold pressed extraction"
      }
    };
    const t = templates[templateType];
    if (t) {
      setHeroForm({
        ...heroForm,
        ...t
      });
    }
  };

  const handleSaveCollection = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!collectionForm.title) errors.title = 'Collection Title is required';
    if (!collectionForm.image) errors.image = 'Collection Image URL is required';
    if (Object.keys(errors).length > 0) {
      setCollectionFormErrors(errors);
      return;
    }
    setCollectionFormErrors({});

    useFeedbackStore.getState().showLoader('Saving collection...');
    try {
      if (collectionForm.id) {
        await api.put(`/admin/homepage/collections/${collectionForm.id}`, collectionForm);
      } else {
        await api.post('/admin/homepage/collections', {
          ...collectionForm,
          sortOrder: homepageCollections.length
        });
      }
      setIsEditingCollection(false);
      resetCollectionForm();
      fetchHomepageCMSData();
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast('✅ Changes published successfully', 'success');
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast(`❌ Failed to save collection: ${err.message}`, 'error');
    }
  };

  const handleDeleteCollection = async (id) => {
    const confirmed = await modal.confirm(
      'Delete Collection Card?',
      'Delete this collection card? This action is permanent.',
      'warning',
      'Delete',
      'Cancel'
    );
    if (confirmed) {
      useFeedbackStore.getState().showLoader('Deleting collection...');
      try {
        await api.delete(`/admin/homepage/collections/${id}`);
        fetchHomepageCMSData();
        useFeedbackStore.getState().hideLoader();
        useFeedbackStore.getState().showToast('✅ Collection deleted successfully', 'success');
      } catch (err) {
        useFeedbackStore.getState().hideLoader();
        useFeedbackStore.getState().showToast(`❌ Failed to delete collection: ${err.message}`, 'error');
      }
    }
  };

  const handleToggleCollectionActive = async (id, currentStatus) => {
    try {
      await api.put(`/admin/homepage/collections/${id}/toggle-active`, { isActive: !currentStatus });
      fetchHomepageCMSData();
      modal.alert('Status Updated', `Collection card is now ${!currentStatus ? 'Active' : 'Inactive'}.`, 'success');
    } catch (err) {
      modal.alert('Action Failed', err.message, 'error');
    }
  };

  const handleMoveCollection = async (index, direction) => {
    // index is the index inside the signatureCollections list
    const sigIndices = [];
    const sigItems = [];
    homepageCollections.forEach((item, idx) => {
      let isPromo = false;
      if (item.description && item.description.startsWith('{')) {
        try {
          const parsed = JSON.parse(item.description);
          isPromo = !!parsed.isPromoCategory;
        } catch(e) {}
      }
      if (!isPromo) {
        sigIndices.push(idx);
        sigItems.push(item);
      }
    });

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sigItems.length) return;

    const temp = sigItems[index];
    sigItems[index] = sigItems[targetIndex];
    sigItems[targetIndex] = temp;

    const updatedList = [...homepageCollections];
    sigItems.forEach((item, idx) => {
      const origIdx = sigIndices[idx];
      updatedList[origIdx] = {
        ...item,
        sortOrder: idx
      };
    });

    setHomepageCollections(updatedList);

    try {
      const orderPayload = updatedList.map((item, idx) => ({
        id: item.id,
        sortOrder: idx
      }));
      await api.put('/admin/homepage/collections/reorder', { order: orderPayload });
      fetchHomepageCMSData();
    } catch (err) {
      modal.alert('Reorder Failed', err.message, 'error');
    }
  };

  const handleSaveHPCat = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!hpCatForm.title) errors.title = 'Category Name is required';
    if (!hpCatForm.image) errors.image = 'Desktop Banner URL is required';
    if (!hpCatForm.categorySlug) errors.categorySlug = 'Category Slug/Link is required';
    if (Object.keys(errors).length > 0) {
      setHpCatFormErrors(errors);
      return;
    }
    setHpCatFormErrors({});

    const description = JSON.stringify({
      subtitle: hpCatForm.subtitle,
      mobileImage: hpCatForm.mobileImage,
      overlayPosition: hpCatForm.overlayPosition,
      overlayDarkness: parseFloat(hpCatForm.overlayDarkness),
      textColorTheme: hpCatForm.textColorTheme,
      isFeatured: hpCatForm.isFeatured,
      imageFocalPoint: hpCatForm.imageFocalPoint,
      hoverZoom: hpCatForm.hoverZoom,
      ctaStyle: hpCatForm.ctaStyle,
      cornerRadius: hpCatForm.cornerRadius,
      isPromoCategory: true
    });

    const payload = {
      title: hpCatForm.title,
      badge: hpCatForm.subtitle,
      description,
      image: hpCatForm.image,
      ctaText: hpCatForm.ctaText,
      categorySlug: hpCatForm.categorySlug,
      isActive: hpCatForm.isActive,
      sortOrder: parseInt(hpCatForm.sortOrder)
    };

    useFeedbackStore.getState().showLoader('Saving cinematic category...');
    try {
      if (hpCatForm.id) {
        await api.put(`/admin/homepage/collections/${hpCatForm.id}`, payload);
      } else {
        await api.post('/admin/homepage/collections', {
          ...payload,
          sortOrder: homepageCollections.length
        });
      }
      setIsEditingHPCat(false);
      resetHPCatForm();
      fetchHomepageCMSData();
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast('✅ Changes published successfully', 'success');
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast(`❌ Failed to save cinematic category: ${err.message}`, 'error');
    }
  };

  const handleDeleteHPCat = async (id) => {
    const confirmed = await modal.confirm(
      'Delete Cinematic Category?',
      'Delete this cinematic category card? This action is permanent.',
      'warning',
      'Delete',
      'Cancel'
    );
    if (confirmed) {
      useFeedbackStore.getState().showLoader('Deleting cinematic category...');
      try {
        await api.delete(`/admin/homepage/collections/${id}`);
        fetchHomepageCMSData();
        useFeedbackStore.getState().hideLoader();
        useFeedbackStore.getState().showToast('✅ Cinematic category deleted successfully', 'success');
      } catch (err) {
        useFeedbackStore.getState().hideLoader();
        useFeedbackStore.getState().showToast(`❌ Failed to delete cinematic category: ${err.message}`, 'error');
      }
    }
  };

  const handleSeedPromoCategories = async () => {
    const confirmed = await modal.confirm(
      'Seed Vedic Category Presets?',
      'This will populate your homepage categories strip with the 6 default luxury cinematic showcases (Ghee, Oils, Spices, Grains, Millets, Honey). Continue?',
      'question',
      'Seed Presets',
      'Cancel'
    );
    if (!confirmed) return;

    try {
      const presets = [
        {
          title: "A2 Ghee",
          subtitle: "Traditional slow curd-churned Bilona Ghee",
          image: "https://res.cloudinary.com/dixbhnqnf/image/upload/v1780167272/WhatsApp_Image_2026-05-30_at_9.07.15_PM_yifcop.jpg",
          mobileImage: "https://res.cloudinary.com/dixbhnqnf/image/upload/v1780167272/WhatsApp_Image_2026-05-30_at_9.07.15_PM_yifcop.jpg",
          ctaText: "Shop Collection",
          categorySlug: "a2-ghee",
          overlayPosition: "bottom-left",
          overlayDarkness: 0.5,
          textColorTheme: "light",
          isFeatured: true,
          imageFocalPoint: "center",
          hoverZoom: true,
          ctaStyle: "arrow",
          cornerRadius: "3xl"
        },
        {
          title: "Cold Pressed Oils",
          subtitle: "Slow wood-pressed ghani unrefined oils",
          image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800",
          mobileImage: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800",
          ctaText: "Shop Collection",
          categorySlug: "cold-pressed-oils",
          overlayPosition: "bottom-left",
          overlayDarkness: 0.55,
          textColorTheme: "light",
          isFeatured: false,
          imageFocalPoint: "center",
          hoverZoom: true,
          ctaStyle: "arrow",
          cornerRadius: "3xl"
        },
        {
          title: "Stone Ground Spices",
          subtitle: "Pure native farm-grown raw spices",
          image: "https://res.cloudinary.com/dixbhnqnf/image/upload/v1780212274/ChatGPT_Image_May_31_2026_12_54_22_PM_wx85ub.png",
          mobileImage: "https://res.cloudinary.com/dixbhnqnf/image/upload/v1780212274/ChatGPT_Image_May_31_2026_12_54_22_PM_wx85ub.png",
          ctaText: "Shop Collection",
          categorySlug: "stone-ground-spices",
          overlayPosition: "bottom-left",
          overlayDarkness: 0.5,
          textColorTheme: "light",
          isFeatured: true,
          imageFocalPoint: "center",
          hoverZoom: true,
          ctaStyle: "arrow",
          cornerRadius: "3xl"
        },
        {
          title: "Organic Grains",
          subtitle: "Premium sun-dried native grains",
          image: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=800",
          mobileImage: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=800",
          ctaText: "Shop Collection",
          categorySlug: "organic-grains",
          overlayPosition: "bottom-left",
          overlayDarkness: 0.5,
          textColorTheme: "light",
          isFeatured: false,
          imageFocalPoint: "center",
          hoverZoom: true,
          ctaStyle: "arrow",
          cornerRadius: "3xl"
        },
        {
          title: "Ancient Millets",
          subtitle: "Ancient, organic, and fiber-rich millet grains",
          image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
          mobileImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
          ctaText: "Shop Collection",
          categorySlug: "ancient-millets",
          overlayPosition: "bottom-left",
          overlayDarkness: 0.6,
          textColorTheme: "light",
          isFeatured: false,
          imageFocalPoint: "center",
          hoverZoom: true,
          ctaStyle: "arrow",
          cornerRadius: "3xl"
        },
        {
          title: "Raw Honey & Sweeteners",
          subtitle: "Chemical-free natural forest sweeteners",
          image: "https://images.unsplash.com/photo-1608408881648-a1c97a5ee2e3?auto=format&fit=crop&q=80&w=800",
          mobileImage: "https://images.unsplash.com/photo-1608408881648-a1c97a5ee2e3?auto=format&fit=crop&q=80&w=800",
          ctaText: "Shop Collection",
          categorySlug: "raw-honey-sweeteners",
          overlayPosition: "bottom-left",
          overlayDarkness: 0.5,
          textColorTheme: "light",
          isFeatured: false,
          imageFocalPoint: "center",
          hoverZoom: true,
          ctaStyle: "arrow",
          cornerRadius: "3xl"
        }
      ];

      for (let i = 0; i < presets.length; i++) {
        const p = presets[i];
        const description = JSON.stringify({
          subtitle: p.subtitle,
          mobileImage: p.mobileImage,
          overlayPosition: p.overlayPosition,
          overlayDarkness: p.overlayDarkness,
          textColorTheme: p.textColorTheme,
          isFeatured: p.isFeatured,
          imageFocalPoint: p.imageFocalPoint,
          hoverZoom: p.hoverZoom,
          ctaStyle: p.ctaStyle,
          cornerRadius: p.cornerRadius,
          isPromoCategory: true
        });
        await api.post('/admin/homepage/collections', {
          title: p.title,
          badge: p.subtitle,
          description,
          image: p.image,
          ctaText: p.ctaText,
          categorySlug: p.categorySlug,
          isActive: true,
          sortOrder: homepageCollections.length + i
        });
      }
      fetchHomepageCMSData();
      modal.alert('Presets Loaded', 'Dynamic category showcases initialized in database!', 'success');
    } catch (err) {
      modal.alert('Seed Failed', err.message, 'error');
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (sourceIndex === targetIndex) return;

    // Filter promo categories indices
    const promoIndices = [];
    const promoItems = [];
    homepageCollections.forEach((item, idx) => {
      let isPromo = false;
      if (item.description && item.description.startsWith('{')) {
        try {
          const parsed = JSON.parse(item.description);
          isPromo = !!parsed.isPromoCategory;
        } catch(e) {}
      }
      if (isPromo) {
        promoIndices.push(idx);
        promoItems.push(item);
      }
    });

    // Reorder
    const [draggedItem] = promoItems.splice(sourceIndex, 1);
    promoItems.splice(targetIndex, 0, draggedItem);

    // Apply back
    const updatedList = [...homepageCollections];
    promoItems.forEach((item, idx) => {
      const origIdx = promoIndices[idx];
      updatedList[origIdx] = {
        ...item,
        sortOrder: idx
      };
    });

    setHomepageCollections(updatedList);

    try {
      const orderPayload = updatedList.map((item, idx) => ({
        id: item.id,
        sortOrder: idx
      }));
      await api.put('/admin/homepage/collections/reorder', { order: orderPayload });
      fetchHomepageCMSData();
    } catch (err) {
      modal.alert('Reorder Failed', err.message, 'error');
    }
  };

  const handleMoveSection = async (index, direction) => {
    const list = sectionOrder.split(',');
    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }
    const newOrder = list.join(',');
    setSectionOrder(newOrder);
    try {
      await api.put('/admin/homepage/sections', { order: newOrder });
    } catch (err) {
      modal.alert('Action Failed', err.message, 'error');
    }
  };

  const handleExpandSection = (sectName) => {
    if (expandedSection === sectName) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectName);
      setSectionTitleInput(settings[`homepage_section_title_${sectName}`] || '');
      setSectionSubtitleInput(settings[`homepage_section_subtitle_${sectName}`] || '');
      setSectionBadgeInput(settings[`homepage_section_badge_${sectName}`] || '');
    }
  };

  const handleSaveSectionTexts = async (sectName) => {
    try {
      const payload = {
        [`homepage_section_title_${sectName}`]: sectionTitleInput,
        [`homepage_section_subtitle_${sectName}`]: sectionSubtitleInput,
        [`homepage_section_badge_${sectName}`]: sectionBadgeInput
      };
      await updateSettings(payload);
      modal.alert('Success', 'Section content overrides saved successfully.', 'success');
      setExpandedSection(null);
    } catch (err) {
      modal.alert('Save Failed', err.message, 'error');
    }
  };

  const handleToggleSectionVisibility = async (sectName, currentVisible) => {
    try {
      const newVal = currentVisible ? 'false' : 'true';
      await updateSettings({
        [`homepage_section_visible_${sectName}`]: newVal
      });
    } catch (err) {
      modal.alert('Update Failed', err.message, 'error');
    }
  };

  const resetCollectionForm = () => {
    setCollectionForm({
      id: '',
      title: '',
      badge: '',
      description: '',
      image: '',
      ctaText: 'Browse Collection',
      categorySlug: 'all',
      sortOrder: homepageCollections.length,
      isActive: true
    });
    setCollectionFormErrors({});
    setSelectedCategoryAssistId('');
  };

  const loadCollectionTemplate = (templateType) => {
    const templates = {
      ghee: {
        title: "Traditional Village Ghee",
        badge: "BILONA CHURNED",
        description: "Slowly melted over firewood logs from organic hand-churned butter of grass-fed desi Gir Cows.",
        image: "https://res.cloudinary.com/dixbhnqnf/image/upload/v1780167272/WhatsApp_Image_2026-05-30_at_9.07.15_PM_yifcop.jpg",
        ctaText: "Explore Ghee Collection",
        categorySlug: "a2-ghee",
        isActive: true
      },
      oils: {
        title: "Pure Wood Pressed Oils",
        badge: "WOOD GHANIS",
        description: "Extracted under low heat using slow mechanical Vagai wood press logs. Zero refinement chemicals or bleaching agents.",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800",
        ctaText: "Browse Oils Collection",
        categorySlug: "cold-pressed-oils",
        isActive: true
      },
      spices: {
        title: "Stone Ground Spices",
        badge: "STONE GROUND",
        description: "Pure native farm-grown spices, stone-ground at low temperatures to preserve natural essential oils and intense aroma.",
        image: "https://res.cloudinary.com/dixbhnqnf/image/upload/v1780212274/ChatGPT_Image_May_31_2026_12_54_22_PM_wx85ub.png",
        ctaText: "Discover Spices",
        categorySlug: "stone-ground-spices",
        isActive: true
      }
    };

    const t = templates[templateType];
    if (t) {
      setCollectionForm({
        ...collectionForm,
        ...t
      });
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      setAnalytics(response.analytics);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      const fetchedProducts = response.products || [];
      setProducts(fetchedProducts);
      console.log(`[Admin Product Logs] Total products in database: ${fetchedProducts.length}`);
      console.log(`[Admin Product Logs] Total products returned by API: ${fetchedProducts.length}`);
      console.log(`[Admin Product Logs] Total products rendered on screen: ${fetchedProducts.length}`);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.orders || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/admin/customers');
      setCustomers(response.customers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await api.get('/admin/coupons');
      setCoupons(response.coupons || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!couponForm.code) errors.code = 'Coupon code is required';
    if (!couponForm.discountValue) errors.discountValue = 'Discount value is required';
    if (!couponForm.expiryDate) errors.expiryDate = 'Expiry date is required';
    
    if (Object.keys(errors).length > 0) {
      setCouponFormErrors(errors);
      return;
    }

    setCouponFormErrors({});
    try {
      const payload = {
        code: couponForm.code,
        discountType: couponForm.discountType,
        discountValue: parseFloat(couponForm.discountValue),
        minOrderValue: parseFloat(couponForm.minOrderValue) || 0,
        expiryDate: new Date(couponForm.expiryDate).toISOString(),
        usageLimit: couponForm.usageLimit ? parseInt(couponForm.usageLimit, 10) : -1,
        isActive: couponForm.isActive
      };

      if (couponForm.id) {
        await api.put(`/admin/coupons/${couponForm.id}`, payload);
        modal.alert('Promotion Synced', 'Coupon updated successfully.', 'success');
      } else {
        await api.post('/admin/coupons', payload);
        modal.alert('Promotion Published', 'Coupon created successfully.', 'success');
      }

      setShowCouponModal(false);
      setCouponForm({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderValue: '0',
        expiryDate: '',
        usageLimit: '-1',
        isActive: true
      });
      fetchCoupons();
    } catch (err) {
      modal.alert('Operation Failed', err.response?.data?.message || err.message, 'error');
    }
  };

  const handleDeleteCoupon = async (id) => {
    const confirm = await modal.confirm(
      'Acknowledge Promotion Voiding',
      'Are you sure you want to permanently delete this coupon campaign? This cannot be undone.',
      'warning'
    );
    if (!confirm) return;

    try {
      await api.delete(`/admin/coupons/${id}`);
      modal.alert('Campaign Terminated', 'Coupon deleted successfully.', 'success');
      fetchCoupons();
    } catch (err) {
      modal.alert('Operation Failed', err.message, 'error');
    }
  };

  const handleToggleCouponStatus = async (coupon) => {
    try {
      await api.put(`/admin/coupons/${coupon.id}`, {
        isActive: !coupon.isActive
      });
      fetchCoupons();
    } catch (err) {
      modal.alert('Status Sync Failed', err.message, 'error');
    }
  };

  // ================= CRUD TRIGGERS =================

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!productForm.name) errors.name = 'Product name is required';
    if (!productForm.price || isNaN(productForm.price)) errors.price = 'Valid product price is required';
    if (productForm.inventory === undefined || productForm.inventory === '') errors.inventory = 'Stock quantity is required';
    if (!productForm.categoryIds || productForm.categoryIds.length === 0) errors.categoryIds = 'Please select at least one category';
    if (!productForm.images?.[0] && !productForm.image) errors.images = 'Main product image is required';

    if (Object.keys(errors).length > 0) {
      setProductFormErrors(errors);
      return;
    }
    setProductFormErrors({});

    const isUpdating = !!productForm.id;
    useFeedbackStore.getState().showLoader(isUpdating ? 'Saving product...' : 'Saving product...');
    try {
      if (productForm.id) {
        await api.put(`/admin/products/${productForm.id}`, productForm);
      } else {
        await api.post('/admin/products', productForm);
      }
      setShowProductModal(false);
      resetProductForm();
      fetchProducts();
      fetchAnalytics();
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast('✅ Product saved successfully', 'success');
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast(`❌ Failed to save product: ${err.message}`, 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirmed = await modal.confirm(
      'Delete Product?',
      'Delete this product from active storefront catalog? This action is permanent.',
      'warning',
      'Delete Product',
      'Cancel'
    );
    if (confirmed) {
      useFeedbackStore.getState().showLoader('Deleting product...');
      try {
        await api.delete(`/admin/products/${id}`);
        fetchProducts();
        fetchAnalytics();
        useFeedbackStore.getState().hideLoader();
        useFeedbackStore.getState().showToast('✅ Product deleted successfully', 'success');
      } catch (err) {
        useFeedbackStore.getState().hideLoader();
        useFeedbackStore.getState().showToast(`❌ Failed to delete product: ${err.message}`, 'error');
      }
    }
  };

  const fetchCategoryDetails = async (id) => {
    try {
      const response = await api.get(`/admin/categories/${id}`);
      setCategoryDetails(response.category);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllAdminProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      setAllAdminProducts(response.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedCategoryId) {
      fetchCategoryDetails(selectedCategoryId);
    } else {
      setCategoryDetails(null);
    }
  }, [selectedCategoryId]);

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!categoryForm.name) errors.name = 'Category name is required';
    if (categoryForm.name.toLowerCase().trim() === 'uncategorized') {
      errors.name = 'The category name "Uncategorized" is reserved.';
    }

    if (Object.keys(errors).length > 0) {
      setCategoryFormErrors(errors);
      return;
    }
    setCategoryFormErrors({});

    const isUpdating = !!categoryForm.id;
    useFeedbackStore.getState().showLoader(isUpdating ? 'Saving category...' : 'Saving category...');
    try {
      if (categoryForm.id) {
        await api.put(`/admin/categories/${categoryForm.id}`, categoryForm);
      } else {
        await api.post('/admin/categories', categoryForm);
      }
      setShowCategoryModal(false);
      setCategoryForm({ id: '', name: '', description: '', image: '', seoTitle: '', seoDescription: '', isVisible: true, homepageVisible: true, isFeatured: false });
      fetchCategories();
      fetchAnalytics();
      if (selectedCategoryId) {
        fetchCategoryDetails(selectedCategoryId);
      }
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast(isUpdating ? '✅ Category saved successfully' : '✅ Category created successfully', 'success');
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast(`❌ Failed to save category: ${err.message}`, 'error');
    }
  };

  const handleToggleHomepageVisible = async (cat) => {
    try {
      useFeedbackStore.getState().showLoader('Updating visibility...');
      await api.put(`/admin/categories/${cat.id}`, {
        ...cat,
        homepageVisible: !cat.homepageVisible
      });
      fetchCategories();
      fetchAnalytics();
      if (selectedCategoryId === cat.id) {
        fetchCategoryDetails(cat.id);
      }
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast('✅ Visibility updated', 'success');
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast(`❌ Failed to update visibility: ${err.message}`, 'error');
    }
  };

  const handleAssignProducts = async () => {
    useFeedbackStore.getState().showLoader('Assigning products...');
    try {
      await api.post(`/admin/categories/${selectedCategoryId}/assign`, {
        productIds: selectedProductIdsToAssign
      });
      setShowAssignModal(false);
      setSelectedProductIdsToAssign([]);
      fetchCategoryDetails(selectedCategoryId);
      fetchCategories();
      fetchAnalytics();
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast('✅ Products assigned successfully', 'success');
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast(`❌ Action Failed: ${err.message}`, 'error');
    }
  };

  const handleRemoveProductFromCategory = async (productId) => {
    const confirmed = await modal.confirm(
      'Remove Product?',
      "Are you sure you want to remove this product from this category?",
      'warning',
      'Remove',
      'Cancel'
    );
    if (!confirmed) {
      return;
    }
    useFeedbackStore.getState().showLoader('Removing product from category...');
    try {
      await api.post(`/admin/categories/${selectedCategoryId}/remove`, { productId });
      fetchCategoryDetails(selectedCategoryId);
      fetchCategories();
      fetchAnalytics();
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast('✅ Product removed from category', 'success');
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast(`❌ Action Failed: ${err.message}`, 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    const confirmed = await modal.confirm(
      'Delete Category?',
      "Are you sure you want to delete this category? Linked products will be disconnected from it.",
      'warning',
      'Delete Category',
      'Cancel'
    );
    if (!confirmed) {
      return;
    }
    useFeedbackStore.getState().showLoader('Deleting category...');
    try {
      await api.delete(`/admin/categories/${id}`);
      setSelectedCategoryId(null);
      fetchCategories();
      fetchAnalytics();
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast('✅ Category deleted successfully', 'success');
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast(`❌ Failed to delete category: ${err.message}`, 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status, paymentStatus, estimatedDelivery) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status, paymentStatus, estimatedDelivery });
      fetchOrders();
      fetchAnalytics();
      modal.alert('Order Updated', 'The order has been updated successfully.', 'success');
    } catch (err) {
      modal.alert('Action Failed', err.message, 'error');
    }
  };

  const updateDraftField = (orderId, field, value) => {
    setShipmentDrafts(prev => {
      const order = orders.find(o => o.id === orderId) || {};
      const logObj = order.logistics || {};
      const currentDraft = prev[orderId] || {
        courierName: logObj.courierName || '',
        trackingNumber: logObj.trackingNumber || '',
        trackingUrl: logObj.trackingUrl || '',
        dispatchDate: logObj.dispatchDate ? new Date(logObj.dispatchDate).toISOString().split('T')[0] : '',
        estimatedDelivery: logObj.estimatedDeliveryDate ? new Date(logObj.estimatedDeliveryDate).toISOString().split('T')[0] : '',
        shipmentStatus: logObj.status || order.status || ''
      };
      return {
        ...prev,
        [orderId]: {
          ...currentDraft,
          [field]: value
        }
      };
    });
  };

  const handleSaveShipmentDetails = async (orderId) => {
    const order = orders.find(o => o.id === orderId) || {};
    const logObj = order.logistics || {};
    const draft = shipmentDrafts[orderId] || {
      courierName: logObj.courierName || '',
      trackingNumber: logObj.trackingNumber || '',
      trackingUrl: logObj.trackingUrl || '',
      dispatchDate: logObj.dispatchDate ? new Date(logObj.dispatchDate).toISOString().split('T')[0] : '',
      estimatedDelivery: logObj.estimatedDeliveryDate ? new Date(logObj.estimatedDeliveryDate).toISOString().split('T')[0] : '',
      shipmentStatus: logObj.status || order.status || ''
    };

    // Validation
    const errors = {};
    if (draft.trackingUrl) {
      try {
        new URL(draft.trackingUrl);
      } catch (err) {
        errors.trackingUrl = 'Tracking URL must be a valid URL (e.g. https://example.com)';
      }
    }

    if (draft.dispatchDate) {
      const dDate = new Date(draft.dispatchDate);
      if (dDate > new Date()) {
        errors.dispatchDate = 'Dispatch date cannot be in the future';
      }
    }

    if (draft.dispatchDate && draft.estimatedDelivery) {
      const dDate = new Date(draft.dispatchDate);
      const eDate = new Date(draft.estimatedDelivery);
      if (eDate < dDate) {
        errors.estimatedDelivery = 'Estimated delivery date must be after dispatch date';
      }
    }

    if (Object.keys(errors).length > 0) {
      setShipmentErrors(prev => ({ ...prev, [orderId]: errors }));
      modal.alert('Validation Error', Object.values(errors).join('\n'), 'error');
      return;
    }

    // Clear errors for this order
    setShipmentErrors(prev => {
      const copy = { ...prev };
      delete copy[orderId];
      return copy;
    });

    setIsSavingShipment(prev => ({ ...prev, [orderId]: true }));

    try {
      await api.put(`/admin/orders/${orderId}/shipment`, draft);
      fetchOrders();
      fetchAnalytics();
      modal.alert('Shipment Saved', 'The shipment details have been updated successfully.', 'success');
    } catch (err) {
      modal.alert('Action Failed', err.message, 'error');
    } finally {
      setIsSavingShipment(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const resetProductForm = () => {
    setProductModalTab('general');
    setProductSpecificReviews([]);
    setProductForm({
      id: '',
      name: '',
      categoryId: '',
      categoryIds: [],
      description: '',
      shortDescription: '',
      brand: 'Suryodaya Farms',
      productType: '',
      price: '',
      compareAtPrice: '',
      mrp: '',
      discountPercent: 0,
      taxPercent: 0,
      stockStatus: 'IN_STOCK',
      sku: '',
      inventory: '',
      hoverImage: '',
      mobileBanner: '',
      isFeatured: false,
      isTrending: false,
      isBestseller: false,
      isNewLaunch: false,
      isVisible: true,
      isComingSoon: false,
      nutrients: '',
      origin: '',
      shelfLife: '',
      deliveryEta: '2-3 Days',
      codAvailable: true,
      returnEligible: false,
      weight: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      image: '',
      images: ['', '', '', ''],
      variants: []
    });
  };

  const resetCouponForm = () => {
    setCouponForm({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderValue: '0',
      expiryDate: '',
      usageLimit: '-1',
      isActive: true
    });
    setCouponFormErrors({});
  };

  const openEditProduct = (prod) => {
    setProductModalTab('general');
    setProductSpecificReviews([]);
    if (prod.id) {
      fetchProductSpecificReviews(prod.id);
    }
    setProductForm({
      id: prod.id,
      name: prod.name,
      categoryId: prod.categories?.[0]?.id || '',
      categoryIds: prod.categories?.map(c => c.id) || [],
      description: prod.description || '',
      shortDescription: prod.shortDescription || '',
      brand: prod.brand || 'Suryodaya Farms',
      productType: prod.productType || '',
      price: prod.price,
      compareAtPrice: prod.compareAtPrice || '',
      mrp: prod.mrp || '',
      discountPercent: prod.discountPercent || 0,
      taxPercent: prod.taxPercent || 0,
      stockStatus: prod.stockStatus || 'IN_STOCK',
      sku: prod.sku,
      inventory: prod.inventory,
      hoverImage: prod.hoverImage || '',
      mobileBanner: prod.mobileBanner || '',
      isFeatured: !!prod.isFeatured,
      isTrending: !!prod.isTrending,
      isBestseller: !!prod.isBestseller,
      isNewLaunch: !!prod.isNewLaunch,
      isVisible: prod.isVisible !== undefined ? !!prod.isVisible : true,
      isComingSoon: !!prod.isComingSoon,
      nutrients: prod.nutrients || '',
      origin: prod.origin || '',
      shelfLife: prod.shelfLife || '',
      deliveryEta: prod.deliveryEta || '2-3 Days',
      codAvailable: prod.codAvailable !== undefined ? !!prod.codAvailable : true,
      returnEligible: !!prod.returnEligible,
      weight: prod.weight || '',
      seoTitle: prod.seoTitle || '',
      seoDescription: prod.seoDescription || '',
      seoKeywords: prod.seoKeywords || '',
      image: prod.images?.length > 0 ? prod.images[0].url : prod.image || '',
      images: prod.images && prod.images.length > 0
        ? [
            prod.images[0]?.url || '',
            prod.images[1]?.url || '',
            prod.images[2]?.url || '',
            prod.images[3]?.url || ''
          ]
        : [
            prod.image || '',
            prod.hoverImage || '',
            '',
            ''
          ],
      variants: prod.variants || []
    });
    setShowProductModal(true);
  };

  const handleTabChange = (tabId) => {
    const routeMap = {
      overview: 'dashboard',
      products: 'products',
      orders: 'orders',
      customers: 'customers',
      categories: 'categories',
      homepage: 'homepage',
      analytics: 'analytics',
      settings: 'settings',
      coupons: 'coupons',
      reviews: 'reviews',
      testimonials: 'testimonials',
      'support-tickets': 'support-tickets'
    };
    setIsMobileSidebarOpen(false);
    navigate(`/admin/${routeMap[tabId]}`);
  };

  const handleAdminSignOut = () => {
    adminLogout();
    navigate('/admin');
  };

    const handlePrintBill = (o) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Pop-up blocker is preventing print preview. Please allow popups.');
      return;
    }

    const itemsRows = (o.orderItems || []).map((item, idx) => `
      <tr style="border-b: 1px solid #EDE7D9;">
        <td style="padding: 10px; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px; font-weight: bold; text-align: left;">
          ${item.product?.name || 'Organic staple'}
          <span style="font-size: 10px; font-weight: normal; color: #666; display: block;">
            (${item.variant?.name || item.product?.weight || '500g'})
          </span>
        </td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right;">₹${item.price}</td>
        <td style="padding: 10px; text-align: right; font-weight: bold;">₹${item.price * item.quantity}</td>
      </tr>
    `).join('');

    let addr = o.shippingAddress;
    if (typeof addr === 'string') {
      try {
        addr = JSON.parse(addr);
      } catch (e) {}
    }
    const formattedAddress = typeof addr === 'object' && addr ? `
      <strong>Recipient:</strong> ${addr.recipientName || o.user?.name || ''}<br/>
      <strong>Street:</strong> ${addr.street || ''}<br/>
      <strong>City:</strong> ${addr.city || ''}, ${addr.state || ''} – ${addr.postalCode || ''}<br/>
      <strong>Phone:</strong> ${addr.phone || o.user?.phone || 'N/A'}<br/>
      <strong>Country:</strong> ${addr.country || 'India'}
    ` : o.shippingAddress || o.address || 'Address not logged';

    // Assuming GST is 5% inclusive for organic staples (2.5% CGST + 2.5% SGST)
    const gstRate = 0.05;
    const total = o.totalAmount;
    const subtotal = Number((total / (1 + gstRate)).toFixed(2));
    const totalGst = Number((total - subtotal).toFixed(2));
    const cgst = Number((totalGst / 2).toFixed(2));
    const sgst = Number((totalGst - cgst).toFixed(2));

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Suryodaya Farms - Invoice #${o.orderNumber}</title>
        <style>
          body {
            font-family: 'Poppins', 'Helvetica Neue', Arial, sans-serif;
            color: #333;
            background: #fff;
            margin: 0;
            padding: 40px;
            font-size: 13px;
            line-height: 1.5;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            border: 1px solid #EDE7D9;
            padding: 30px;
            border-radius: 12px;
            background: #FDFBF7;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #4E641A;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo-container {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .logo-container img {
            width: 55px;
            height: 55px;
            object-fit: contain;
          }
          .logo-container h1 {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 24px;
            color: #2F3B0C;
            margin: 0;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .logo-container span {
            font-size: 9px;
            letter-spacing: 2.5px;
            color: #B8833E;
            text-transform: uppercase;
            font-weight: bold;
          }
          .title-block {
            text-align: right;
          }
          .title-block h2 {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            color: #4E641A;
            margin: 0 0 5px 0;
            text-transform: uppercase;
          }
          .title-block p {
            margin: 2px 0;
            color: #666;
            font-size: 11px;
          }
          .addresses {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
          }
          .address-card {
            background: #fff;
            border: 1px solid #EDE7D9;
            padding: 15px;
            border-radius: 8px;
          }
          .address-card h3 {
            margin-top: 0;
            border-bottom: 1px solid #EDE7D9;
            padding-bottom: 6px;
            color: #4E641A;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background: #4E641A;
            color: #fff;
            padding: 10px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #EDE7D9;
          }
          .totals-table {
            width: 300px;
            margin-left: auto;
            margin-bottom: 30px;
          }
          .totals-table td {
            padding: 8px 10px;
            border: none;
          }
          .totals-table tr.grand-total {
            border-top: 1.5px solid #4E641A;
            font-size: 15px;
            font-weight: bold;
            color: #2F3B0C;
          }
          .footer {
            border-top: 1px solid #EDE7D9;
            padding-top: 20px;
            margin-top: 50px;
            text-align: center;
            color: #888;
            font-size: 11px;
          }
          .footer p {
            margin: 4px 0;
          }
          .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 0 10px;
          }
          .sign-box {
            text-align: center;
            width: 180px;
          }
          .sign-line {
            border-bottom: 1px solid #666;
            margin-bottom: 6px;
            height: 40px;
          }
          @media print {
            body {
              padding: 0;
              background: #fff;
            }
            .invoice-box {
              border: none;
              padding: 0;
              background: #fff;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="logo-container">
              <img src="https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png" alt="Suryodaya Logo"/>
              <div>
                <h1>Suryodaya Farms</h1>
                <span>Regenerative Vedic Agriculture</span>
              </div>
            </div>
            <div class="title-block">
              <h2>TAX INVOICE</h2>
              <p><strong>Invoice No:</strong> INV-${o.orderNumber}</p>
              <p><strong>Date Placed:</strong> ${new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              <p><strong>Payment Status:</strong> ${o.paymentStatus}</p>
            </div>
          </div>

          <div class="addresses">
            <div class="address-card">
              <h3>Seller (Billing From)</h3>
              <strong>Suryodaya Farms Private Limited</strong><br/>
              Plot No-20 NP, Kuruma Nagar, Peerzadiguda Mandal,<br/>
              Medchal (Malkajgiri), Telangana – 500039<br/>
              <strong>GSTIN:</strong> 36AAGCS8294K1Z2 (Fictional)<br/>
              <strong>Email:</strong> orders@suryodayafarms.com
            </div>
            <div class="address-card">
              <h3>Buyer (Billing To)</h3>
              ${formattedAddress}
            </div>
            <div class="address-card">
              <h3>Buyer (Shipping To)</h3>
              ${formattedAddress}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">S.No</th>
                <th style="text-align: left;">Product Description</th>
                <th style="width: 80px; text-align: center;">Qty</th>
                <th style="width: 100px; text-align: right;">Unit Price</th>
                <th style="width: 100px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="font-size: 11px; color: #666; max-width: 320px; text-align: left;">
              <strong>Terms & Conditions:</strong><br/>
              1. Goods once sold are not returnable except as specified in storefront policy.<br/>
              2. This is a computer-generated tax invoice and requires no physical signature.<br/>
              3. Payment Method: <strong>${o.paymentMethod || 'COD'}</strong>
            </div>
            <table class="totals-table">
              <tr>
                <td style="text-align: left; font-weight: 500;">Subtotal:</td>
                <td style="text-align: right; font-weight: bold;">₹${subtotal}</td>
              </tr>
              <tr>
                <td style="text-align: left; font-weight: 500;">CGST (2.5%):</td>
                <td style="text-align: right;">₹${cgst}</td>
              </tr>
              <tr>
                <td style="text-align: left; font-weight: 500;">SGST (2.5%):</td>
                <td style="text-align: right;">₹${sgst}</td>
              </tr>
              <tr class="grand-total">
                <td style="text-align: left;">Grand Total:</td>
                <td style="text-align: right; color: #4E641A;">₹${total}</td>
              </tr>
            </table>
          </div>

          <div class="signature-section">
            <div class="sign-box">
              <div class="sign-line"></div>
              <span style="font-size: 10px; color: #666;">Customer Signature</span>
            </div>
            <div class="sign-box">
              <div class="sign-line" style="background: url('https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png') no-repeat center; background-size: contain;"></div>
              <span style="font-size: 10px; color: #666; font-weight: bold;">Authorized Signatory</span>
            </div>
          </div>

          <div class="footer">
            <p><strong>Thank you for choosing luxury, healthy Vedic staples! 🌿</strong></p>
            <p>Suryodaya Farms • www.suryodayafarms.com</p>
          </div>
        </div>

        <div class="no-print" style="margin-top: 30px; text-align: center; display: flex; justify-content: center; gap: 12px;">
          <button onclick="window.print()" style="padding: 10px 25px; background: #4E641A; color: #fff; border: none; font-size: 12px; font-weight: bold; border-radius: 6px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">
            Print Invoice
          </button>
          <button onclick="window.close()" style="padding: 10px 25px; background: #fff; color: #333; border: 1px solid #ccc; font-size: 12px; font-weight: bold; border-radius: 6px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">
            Close Window
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handlePrintLabel = (o) => {
    const printWindow = window.open('', '_blank', 'width=500,height=700');
    if (!printWindow) {
      alert('Pop-up blocker is preventing label print preview. Please allow popups.');
      return;
    }

    let addr = o.shippingAddress;
    if (typeof addr === 'string') {
      try {
        addr = JSON.parse(addr);
      } catch (e) {}
    }
    const formattedAddress = typeof addr === 'object' && addr ? `
      <strong>${addr.recipientName || o.user?.name || ''}</strong><br/>
      ${addr.street || ''}<br/>
      ${addr.city || ''}, ${addr.state || ''}<br/>
      <strong>Pincode: ${addr.postalCode || ''}</strong><br/>
      <strong>Phone: ${addr.phone || o.user?.phone || 'N/A'}</strong>
    ` : o.shippingAddress || o.address || 'Address details missing';

    const courier = o.logistics?.courierName || 'Standard Partner';
    const trackingNo = o.logistics?.trackingNumber || 'AWB-PENDING';
    const paymentType = (o.paymentMethod || 'COD').toUpperCase();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Suryodaya Farms - Label #${o.orderNumber}</title>
        <style>
          body {
            font-family: 'Poppins', 'Helvetica Neue', Arial, sans-serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 20px;
            font-size: 12px;
            line-height: 1.4;
          }
          .label-container {
            max-width: 400px;
            margin: auto;
            border: 3px solid #000;
            padding: 15px;
            background: #fff;
            border-radius: 4px;
            box-sizing: border-box;
          }
          .row-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 12px;
          }
          .row-top img {
            height: 38px;
            object-fit: contain;
          }
          .row-top-info {
            text-align: right;
          }
          .row-top-info h1 {
            margin: 0;
            font-size: 16px;
            font-family: 'Playfair Display', serif;
            font-weight: bold;
          }
          .row-top-info p {
            margin: 2px 0 0 0;
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 0.5px;
          }
          .deliver-to {
            border: 2px solid #000;
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 12px;
            background: #fafafa;
          }
          .deliver-to h2 {
            margin: 0 0 6px 0;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1px;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
            padding-bottom: 4px;
          }
          .deliver-to p {
            margin: 0;
            font-size: 11.5px;
            line-height: 1.5;
          }
          .row-courier {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border: 2px solid #000;
            border-radius: 4px;
            margin-bottom: 12px;
            text-align: center;
          }
          .courier-box {
            padding: 8px;
            border-right: 2px solid #000;
          }
          .courier-box:last-child {
            border-right: none;
          }
          .courier-box span {
            font-size: 8px;
            text-transform: uppercase;
            font-weight: bold;
            display: block;
            margin-bottom: 2px;
            color: #555;
          }
          .courier-box strong {
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 0.5px;
          }
          .tracking-container {
            border: 2px solid #000;
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }
          .barcode-box {
            flex: 2;
            text-align: center;
            border-right: 2px solid #000;
            padding-right: 10px;
          }
          .barcode-line {
            display: inline-block;
            background: repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 5px);
            width: 90%;
            height: 40px;
            margin-bottom: 4px;
          }
          .barcode-text {
            font-family: monospace;
            font-size: 9px;
            font-weight: bold;
          }
          .qr-box {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .qr-placeholder {
            width: 45px;
            height: 45px;
            border: 2px solid #000;
            padding: 2px;
            position: relative;
            background: #fff;
            display: flex;
            flex-wrap: wrap;
          }
          .qr-finder {
            width: 12px;
            height: 12px;
            border: 3px solid #000;
            box-sizing: border-box;
            position: absolute;
          }
          .qr-t-l { top: 2px; left: 2px; }
          .qr-t-r { top: 2px; right: 2px; }
          .qr-b-l { bottom: 2px; left: 2px; }
          .qr-center {
            width: 5px;
            height: 5px;
            background: #000;
            position: absolute;
            top: 20px;
            left: 20px;
          }
          .qr-dot1 {
            width: 3px;
            height: 3px;
            background: #000;
            position: absolute;
            top: 8px;
            left: 22px;
          }
          .qr-dot2 {
            width: 3px;
            height: 3px;
            background: #000;
            position: absolute;
            bottom: 8px;
            right: 8px;
          }
          .handle-with-care {
            text-align: center;
            border-top: 1px solid #000;
            padding-top: 8px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            .label-container {
              border: 2px solid #000;
              width: 100%;
              max-width: 100%;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="label-container">
          <div class="row-top">
            <img src="https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png" alt="Suryodaya Logo"/>
            <div class="row-top-info">
              <h1>Suryodaya Farms</h1>
              <p>Order: ${o.orderNumber}</p>
              <p>Date: ${new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          <div class="deliver-to">
            <h2>DELIVER TO:</h2>
            <p>${formattedAddress}</p>
          </div>

          <div class="row-courier">
            <div class="courier-box">
              <span>Carrier partner</span>
              <strong>${courier}</strong>
            </div>
            <div class="courier-box">
              <span>Payment Type</span>
              <strong style="${paymentType === 'COD' ? 'color: red;' : ''}">${paymentType}</strong>
            </div>
          </div>

          <div class="tracking-container">
            <div class="barcode-box">
              <div class="barcode-line"></div>
              <div class="barcode-text">AWB: ${trackingNo}</div>
            </div>
            <div class="qr-box">
              <div class="qr-placeholder">
                <div class="qr-finder qr-t-l"></div>
                <div class="qr-finder qr-t-r"></div>
                <div class="qr-finder qr-b-l"></div>
                <div class="qr-center"></div>
                <div class="qr-dot1"></div>
                <div class="qr-dot2"></div>
              </div>
              <span style="font-size: 7px; font-weight: bold; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px;">Routing QR</span>
            </div>
          </div>

          <div class="handle-with-care">
            ⚠️ Handle With Care • Premium Organic Vedic Crops 🌾
          </div>
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center; display: flex; justify-content: center; gap: 10px;">
          <button onclick="window.print()" style="padding: 10px 25px; background: #000; color: #fff; border: none; font-size: 11px; font-weight: bold; border-radius: 4px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">
            Print Label
          </button>
          <button onclick="window.close()" style="padding: 10px 25px; background: #fff; color: #000; border: 1px solid #000; font-size: 11px; font-weight: bold; border-radius: 4px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">
            Close Window
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Gating layout displays
  if (!isAdminAuthChecked) {
    return (
      <div className="min-h-screen bg-[#F7F4ED] text-[#37411A] flex flex-col items-center justify-center text-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <GiSun className="text-[#B8833E] text-5xl animate-spin-slow" />
          <span className="font-sans text-xs font-bold text-[#B8833E] uppercase tracking-[0.25em]">Verifying Security Access...</span>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) return null;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#F7F4ED] text-[#37411A] flex flex-col lg:flex-row relative font-sans selection:bg-[#B8833E] selection:text-[#F7F4ED] admin-dashboard-container">
      
      {/* Dynamic scrollbars style */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #EDE7D9; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #B8833E; }
      `}} />

      {/* Backdrop for mobile drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-[#2F3B0C]/40 backdrop-blur-xs z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Top Navigation Bar */}
      <header className="lg:hidden w-full bg-[#F3EFE6] border-b border-[#EDE7D9] h-16 px-4 flex items-center justify-between sticky top-0 z-30 shrink-0 select-none">
        <div className="flex items-center space-x-3">
          <img 
            src="https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png" 
            alt="Suryodaya Farms Logo" 
            className="w-10 h-10 object-contain"
          />
          <div className="flex flex-col text-left">
            <span className="font-serif text-xs font-bold tracking-widest text-[#37411A] uppercase leading-none">
              Suryodaya
            </span>
            <span className="font-sans text-[7px] font-extrabold tracking-widest text-[#B8833E] uppercase mt-0.5 leading-none">
              ADMIN PORTAL
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 rounded-xl bg-white hover:bg-stone-50 border border-[#EDE7D9] text-[#4E641A] transition-all cursor-pointer flex items-center justify-center shadow-xxs"
        >
          {/* Hamburger Icon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* 1. LIGHT EARTHY SIDEBAR (Drawer on mobile, static sidebar on desktop) */}
      <aside className={`fixed top-0 bottom-0 left-0 w-[280px] bg-[#F3EFE6] border-r border-[#EDE7D9] flex flex-col shrink-0 p-6 z-50 transition-transform duration-300 ease-in-out ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:w-[260px] lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto lg:overflow-x-hidden custom-scroll shadow-2xl lg:shadow-none`}>
        
        {/* Logo Branding & Drawer Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EDE7D9] mb-4">
          <div className="flex items-center space-x-3">
            <img 
              src="https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png" 
              alt="Suryodaya Farms Logo" 
              className="w-12 h-12 object-contain"
            />
            <div className="flex flex-col text-left">
              <span className="font-serif text-xs font-bold tracking-widest text-[#37411A] uppercase leading-none">
                Suryodaya
              </span>
              <span className="font-sans text-[7px] font-extrabold tracking-widest text-[#B8833E] uppercase mt-0.5 leading-none">
                ADMIN PORTAL
              </span>
            </div>
          </div>

          {/* Close button for drawer (mobile only) */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl bg-white hover:bg-stone-50 border border-[#EDE7D9] text-[#4E641A] transition-all cursor-pointer flex items-center justify-center shadow-xxs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation & Logout Container */}
        <div className="flex flex-col justify-between flex-grow mt-4 overflow-y-auto no-scrollbar relative">
          
          <div className="space-y-6 text-left">
            
            {/* Core Operations Group */}
            <div>
              <button
                onClick={() => setCollapsedGroups(prev => ({ ...prev, core: !prev.core }))}
                className="w-full flex items-center justify-between text-[8px] font-extrabold tracking-widest text-[#B8833E]/70 uppercase mb-2 px-1 bg-transparent border-none cursor-pointer hover:text-[#4E641A] transition select-none"
              >
                <span>Core Operations</span>
                {collapsedGroups.core ? <FiChevronDown className="w-2.5 h-2.5" /> : <FiChevronUp className="w-2.5 h-2.5" />}
              </button>
              
              {!collapsedGroups.core && (
                <nav className="space-y-1 animate-fade-in">
                  {[
                    { id: 'overview', label: 'Dashboard', icon: FiHome },
                    { id: 'products', label: 'Products', icon: FiShoppingBag },
                    { id: 'orders', label: 'Orders', icon: FiTruck },
                    { id: 'customers', label: 'Customers', icon: FiUsers },
                    { id: 'categories', label: 'Categories', icon: FiLayers },
                    { id: 'homepage', label: 'Homepage CMS', icon: FiLayout },
                    { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
                  ].map((tab) => {
                    const isTabActive = activeTab === tab.id;
                    
                    const getTabBadge = () => {
                      if (tab.id === 'orders') {
                        const count = orders.filter(o => o.status === 'PENDING').length;
                        if (count > 0) return count;
                      }
                      return null;
                    };
                    const badgeCount = getTabBadge();

                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center justify-between font-sans text-xs font-bold py-2.5 px-4 rounded-xl transition duration-350 relative group cursor-pointer border-none text-left ${
                          isTabActive
                            ? 'bg-[#4E641A] text-white shadow-md shadow-[#4E641A]/10 ring-1 ring-white/10'
                            : 'text-stone-600 hover:bg-[#EDE7D9]/50 hover:text-[#37411A] bg-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <tab.icon className={`w-4.5 h-4.5 ${isTabActive ? 'text-[#B8833E]' : 'text-stone-400 group-hover:text-[#4E641A]'}`} />
                          <span className="tracking-wider uppercase text-[9px]">{tab.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {badgeCount && (
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${isTabActive ? 'bg-[#B8833E] text-white' : 'bg-[#EDE7D9] text-[#4E641A]'}`}>
                              {badgeCount}
                            </span>
                          )}
                          {isTabActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B8833E] shadow-lg animate-pulse" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Marketing & Promotions Group */}
            <div>
              <button
                onClick={() => setCollapsedGroups(prev => ({ ...prev, marketing: !prev.marketing }))}
                className="w-full flex items-center justify-between text-[8px] font-extrabold tracking-widest text-[#B8833E]/70 uppercase mb-2 px-1 bg-transparent border-none cursor-pointer hover:text-[#4E641A] transition select-none"
              >
                <span>Marketing & Promotions</span>
                {collapsedGroups.marketing ? <FiChevronDown className="w-2.5 h-2.5" /> : <FiChevronUp className="w-2.5 h-2.5" />}
              </button>
              
              {!collapsedGroups.marketing && (
                <nav className="space-y-1 animate-fade-in">
                  {[
                    { id: 'coupons', label: 'Vouchers & Coupons', icon: FiTag },
                  ].map((tab) => {
                    const isTabActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center justify-between font-sans text-xs font-bold py-2.5 px-4 rounded-xl transition duration-350 relative group cursor-pointer border-none text-left ${
                          isTabActive
                            ? 'bg-[#4E641A] text-white shadow-md shadow-[#4E641A]/10 ring-1 ring-white/10'
                            : 'text-stone-600 hover:bg-[#EDE7D9]/50 hover:text-[#37411A] bg-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <tab.icon className={`w-4.5 h-4.5 ${isTabActive ? 'text-[#B8833E]' : 'text-stone-400 group-hover:text-[#4E641A]'}`} />
                          <span className="tracking-wider uppercase text-[9px]">{tab.label}</span>
                        </div>
                        {isTabActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B8833E] shadow-lg animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Content Management Group */}
            <div>
              <button
                onClick={() => setCollapsedGroups(prev => ({ ...prev, content: !prev.content }))}
                className="w-full flex items-center justify-between text-[8px] font-extrabold tracking-widest text-[#B8833E]/70 uppercase mb-2 px-1 bg-transparent border-none cursor-pointer hover:text-[#4E641A] transition select-none"
              >
                <span>Content Management</span>
                {collapsedGroups.content ? <FiChevronDown className="w-2.5 h-2.5" /> : <FiChevronUp className="w-2.5 h-2.5" />}
              </button>
              
              {!collapsedGroups.content && (
                <nav className="space-y-1 animate-fade-in">
                  {[
                    { id: 'reviews', label: 'Product Reviews', icon: FiStar },
                  ].map((tab) => {
                    const isTabActive = activeTab === tab.id || (tab.id === 'reviews' && activeTab === 'reviews-detail');
                    
                    const getTabBadge = () => {
                      if (tab.id === 'reviews') {
                        const count = reviewsList.filter(r => r.status === 'PENDING').length;
                        if (count > 0) return count;
                      }
                      return null;
                    };
                    const badgeCount = getTabBadge();

                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center justify-between font-sans text-xs font-bold py-2.5 px-4 rounded-xl transition duration-350 relative group cursor-pointer border-none text-left ${
                          isTabActive
                            ? 'bg-[#4E641A] text-white shadow-md shadow-[#4E641A]/10 ring-1 ring-white/10'
                            : 'text-stone-600 hover:bg-[#EDE7D9]/50 hover:text-[#37411A] bg-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <tab.icon className={`w-4.5 h-4.5 ${isTabActive ? 'text-[#B8833E]' : 'text-stone-400 group-hover:text-[#4E641A]'}`} />
                          <span className="tracking-wider uppercase text-[9px]">{tab.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {badgeCount && (
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${isTabActive ? 'bg-[#B8833E] text-white' : 'bg-[#EDE7D9] text-[#4E641A]'}`}>
                              {badgeCount}
                            </span>
                          )}
                          {isTabActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B8833E] shadow-lg animate-pulse" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Configuration Group */}
            <div>
              <button
                onClick={() => setCollapsedGroups(prev => ({ ...prev, config: !prev.config }))}
                className="w-full flex items-center justify-between text-[8px] font-extrabold tracking-widest text-[#B8833E]/70 uppercase mb-2 px-1 bg-transparent border-none cursor-pointer hover:text-[#4E641A] transition select-none"
              >
                <span>Configuration</span>
                {collapsedGroups.config ? <FiChevronDown className="w-2.5 h-2.5" /> : <FiChevronUp className="w-2.5 h-2.5" />}
              </button>
              
              {!collapsedGroups.config && (
                <nav className="space-y-1 animate-fade-in">
                  {[
                    { id: 'settings', label: 'Settings', icon: FiSettings },
                  ].map((tab) => {
                    const isTabActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center justify-between font-sans text-xs font-bold py-2.5 px-4 rounded-xl transition duration-350 relative group cursor-pointer border-none text-left ${
                          isTabActive
                            ? 'bg-[#4E641A] text-white shadow-sm'
                            : 'text-stone-600 hover:bg-[#EDE7D9]/50 hover:text-[#37411A] bg-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <tab.icon className={`w-4.5 h-4.5 ${isTabActive ? 'text-[#B8833E]' : 'text-stone-400 group-hover:text-[#4E641A]'}`} />
                          <span className="tracking-wider uppercase text-[9px]">{tab.label}</span>
                        </div>
                        {isTabActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B8833E] shadow-lg" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Customer Support Group */}
            <div>
              <button
                type="button"
                onClick={() => setCollapsedGroups(prev => ({ ...prev, support: !prev.support }))}
                className="w-full flex items-center justify-between text-[8px] font-extrabold tracking-widest text-[#B8833E]/70 uppercase mb-2 px-1 bg-transparent border-none cursor-pointer hover:text-[#4E641A] transition select-none"
              >
                <span>Customer Support</span>
                {collapsedGroups.support ? <FiChevronDown className="w-2.5 h-2.5" /> : <FiChevronUp className="w-2.5 h-2.5" />}
              </button>
              
              {!collapsedGroups.support && (
                <nav className="space-y-1 animate-fade-in">
                  {[
                    { id: 'support-tickets', label: 'Support Tickets', icon: FiMessageSquare },
                  ].map((tab) => {
                    const isTabActive = activeTab === tab.id;
                    
                    const getTabBadge = () => {
                      const count = supportTickets.filter(t => t.status === 'OPEN').length;
                      if (count > 0) return count;
                      return null;
                    };
                    const badgeCount = getTabBadge();

                    return (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center justify-between font-sans text-xs font-bold py-2.5 px-4 rounded-xl transition duration-350 relative group cursor-pointer border-none text-left ${
                          isTabActive
                            ? 'bg-[#4E641A] text-white shadow-md shadow-[#4E641A]/10 ring-1 ring-white/10'
                            : 'text-stone-600 hover:bg-[#EDE7D9]/50 hover:text-[#37411A] bg-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <tab.icon className={`w-4.5 h-4.5 ${isTabActive ? 'text-[#B8833E]' : 'text-stone-400 group-hover:text-[#4E641A]'}`} />
                          <span className="tracking-wider uppercase text-[9px]">{tab.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {badgeCount && (
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${isTabActive ? 'bg-[#B8833E] text-white' : 'bg-[#EDE7D9] text-[#4E641A]'}`}>
                              {badgeCount}
                            </span>
                          )}
                          {isTabActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B8833E] shadow-lg animate-pulse" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>

          </div>

          {/* Admin User info footer & Logout */}
          <div className="pt-4 border-t border-[#EDE7D9] space-y-4 text-left mt-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#4E641A]/10 border border-[#EDE7D9] flex items-center justify-center font-serif font-bold text-xs text-[#4E641A] overflow-hidden shrink-0">
                {adminUser?.avatarUrl ? (
                  <img src={adminUser.avatarUrl} alt="Admin avatar" className="w-full h-full object-cover" />
                ) : (
                  adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold truncate text-[#37411A]">{adminUser?.name || 'Administrator'}</span>
                <span className="text-[8px] font-extrabold tracking-widest text-[#B8833E] uppercase">MASTER ROOT</span>
              </div>
            </div>

            <button
              onClick={handleAdminSignOut}
              className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-red-50 text-red-655 hover:bg-red-100 border border-red-200 transition cursor-pointer text-left font-sans text-xs font-bold select-none"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="tracking-wider uppercase text-[9px]">Secure Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. DYNAMIC WORKSPACE PANEL */}
      <main id="admin-main-content" className="flex-grow bg-[#F7F4ED] p-5 md:p-8 z-10 flex flex-col justify-start lg:h-screen lg:overflow-y-auto lg:overflow-x-hidden custom-scroll text-left">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (() => {
          // Timezone and date helpers for Indian Standard Time (IST)
          const nowIST = getISTDate(new Date());
          const startOfTodayIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate());
          const startOfSevenDaysAgoIST = new Date(startOfTodayIST.getTime() - 7 * 24 * 60 * 60 * 1000);
          const startOfFourteenDaysAgoIST = new Date(startOfTodayIST.getTime() - 14 * 24 * 60 * 60 * 1000);

          // Calculations
          const totalRevenue = orders.reduce((sum, o) => o.status !== 'CANCELLED' ? sum + Number(o.totalAmount || 0) : sum, 0);
          const pendingShipments = orders.filter(o => o.status === 'PENDING').length;
          const totalCustomers = customers.length;
          const activeProducts = products.length;
          const codOrders = orders.filter(o => (o.paymentMethod || '').toUpperCase() === 'COD').length;
          const lowStockCount = products.filter(p => p.inventory <= 5 && p.inventory > 0).length;
          
          // COD Revenue
          const codRevenue = orders.reduce((sum, o) => (o.status !== 'CANCELLED' && (o.paymentMethod || '').toUpperCase() === 'COD') ? sum + Number(o.totalAmount || 0) : sum, 0);
          const codRatio = orders.length > 0 ? Math.round((codOrders / orders.length) * 100) : 0;

          // Real-time Trend calculations based on IST
          const thisWeekRevenue = orders.reduce((sum, o) => {
            if (o.status === 'CANCELLED') return sum;
            const oIST = getISTDate(o.createdAt);
            return oIST >= startOfSevenDaysAgoIST ? sum + Number(o.totalAmount || 0) : sum;
          }, 0);

          const prevWeekRevenue = orders.reduce((sum, o) => {
            if (o.status === 'CANCELLED') return sum;
            const oIST = getISTDate(o.createdAt);
            return (oIST >= startOfFourteenDaysAgoIST && oIST < startOfSevenDaysAgoIST) ? sum + Number(o.totalAmount || 0) : sum;
          }, 0);

          const getSalesTrendLabel = () => {
            if (prevWeekRevenue === 0) {
              if (thisWeekRevenue === 0) return 'No sales this week';
              return `↑ 100% this week`;
            }
            const pct = Math.round(((thisWeekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100);
            if (pct >= 0) return `↑ ${pct}% this week`;
            return `↓ ${Math.abs(pct)}% this week`;
          };

          const ordersToday = orders.filter(o => {
            const oIST = getISTDate(o.createdAt);
            return oIST >= startOfTodayIST;
          }).length;

          const customersToday = customers.filter(c => {
            const cIST = getISTDate(c.createdAt);
            return cIST >= startOfTodayIST;
          }).length;
          
          // Greeting using IST hours
          const getGreeting = () => {
            const hrs = nowIST.getHours();
            const adminName = adminUser?.name || 'Aditya';
            if (hrs < 12) return `Good Morning, ${adminName} 🌱`;
            if (hrs < 17) return `Good Afternoon, ${adminName} 🌱`;
            return `Good Evening, ${adminName} 🌱`;
          };

          // Last 6 Months Revenue for Line Chart
          const months = [];
          const revenueByMonth = {};
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = d.toLocaleString('en-IN', { month: 'short' });
            months.push(monthName);
            revenueByMonth[monthName] = 0;
          }
          orders.forEach((o) => {
            if (o.status !== 'CANCELLED') {
              const mName = new Date(o.createdAt).toLocaleString('en-IN', { month: 'short' });
              if (revenueByMonth[mName] !== undefined) {
                revenueByMonth[mName] += Number(o.totalAmount || 0);
              }
            }
          });
          const revenueData = months.map((m) => ({ month: m, amount: revenueByMonth[m] }));
          const maxRev = Math.max(...revenueData.map(d => d.amount), 1000);
          const chartHeight = 150;
          const chartWidth = 500;
          const chartPoints = revenueData.map((d, i) => {
            const x = (i / 5) * (chartWidth - 40) + 20;
            const y = chartHeight - (d.amount / maxRev) * (chartHeight - 40) - 20;
            return { x, y, month: d.month, amount: d.amount };
          });
          const chartPathD = `M ${chartPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
          const chartAreaD = `${chartPathD} L ${chartPoints[chartPoints.length - 1].x},${chartHeight - 20} L ${chartPoints[0].x},${chartHeight - 20} Z`;

          // Category Performance
          const breakdown = {};
          products.forEach((p) => {
            const catName = p.categories?.[0]?.name || p.category || 'Organic';
            breakdown[catName] = (breakdown[catName] || 0) + 1;
          });
          const categoryBreakdown = Object.entries(breakdown).map(([name, count]) => ({ name, count }));
          const maxCategoryCount = Math.max(...categoryBreakdown.map(c => c.count), 1);

          // Pending Actions List
          const pendingActions = [];
          if (pendingShipments > 0) {
            pendingActions.push({
              id: 'dispatch',
              title: 'Orders awaiting dispatch',
              desc: `${pendingShipments} customer orders need logistics coordination.`,
              badge: 'High Priority',
              badgeColor: 'bg-red-50 text-red-700 border-red-200',
              actionText: 'Dispatch now',
              onClick: () => handleTabChange('orders')
            });
          }
          if (lowStockCount > 0) {
            pendingActions.push({
              id: 'low_stock',
              title: 'Low inventory items alert',
              desc: `${lowStockCount} organic staples are running low on stock.`,
              badge: 'Medium Priority',
              badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
              actionText: 'Restock inventory',
              onClick: () => handleTabChange('products')
            });
          }
          const pendingReviewsCount = reviewsList.filter(r => r.status === 'PENDING').length;
          if (pendingReviewsCount > 0) {
            pendingActions.push({
              id: 'reviews',
              title: 'Pending customer reviews',
              desc: `${pendingReviewsCount} new reviews are awaiting moderation.`,
              badge: 'Low Priority',
              badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
              actionText: 'Moderate reviews',
              onClick: () => handleTabChange('reviews')
            });
          }
          if (orders.filter(o => o.status === 'CANCELLED').length > 0) {
            pendingActions.push({
              id: 'cancelled',
              title: 'Failed/Cancelled Orders Logs',
              desc: `${orders.filter(o => o.status === 'CANCELLED').length} orders were cancelled or failed delivery.`,
              badge: 'Audit Log',
              badgeColor: 'bg-stone-50 text-stone-700 border-stone-200',
              actionText: 'Review cancelled logs',
              onClick: () => handleTabChange('orders')
            });
          }

          // Live Activity Feed
          const feed = [];
          orders.slice(0, 5).forEach(o => {
            feed.push({
              id: `order-${o.id}`,
              icon: '🛒',
              title: `Order Placed`,
              desc: `Order ${o.orderNumber} for ₹${o.totalAmount} by ${o.user?.name || 'Customer'}`,
              time: new Date(o.createdAt),
              color: o.status === 'PENDING' ? 'text-amber-500 bg-amber-50 border border-amber-200' : o.status === 'DELIVERED' ? 'text-green-500 bg-green-50 border border-green-200' : 'text-blue-500 bg-blue-50 border border-blue-200'
            });
          });
          reviewsList.slice(0, 5).forEach(r => {
            feed.push({
              id: `review-${r.id}`,
              icon: '⭐',
              title: `Review Submitted`,
              desc: `${r.customerName || 'Anonymous'} rated ${r.rating} stars: "${r.reviewTitle || 'Feedback'}"`,
              time: new Date(r.createdAt || Date.now()),
              color: r.status === 'PENDING' ? 'text-amber-500 bg-amber-50 border border-amber-200' : 'text-green-500 bg-green-50 border border-green-200'
            });
          });
          products.filter(p => p.inventory <= 5 && p.inventory > 0).slice(0, 3).forEach(p => {
            feed.push({
              id: `stock-${p.id}`,
              icon: '⚠️',
              title: `Low Stock Alert`,
              desc: `"${p.name}" has only ${p.inventory} units left in stock.`,
              time: new Date(),
              color: 'text-red-500 bg-red-50 border border-red-200'
            });
          });
          const sortedFeed = feed.sort((a, b) => b.time - a.time).slice(0, 5);

          // Best selling products (by calculating real-time ordered quantities)
          const salesMap = {};
          // Initialize sales count for all products in catalog
          products.forEach(p => {
            salesMap[p.id] = {
              product: p,
              salesCount: 0
            };
          });

          // Iterate through all orders that are not CANCELLED to sum quantities
          orders.forEach(o => {
            if (o.status === 'CANCELLED') return;
            const items = o.orderItems || [];
            items.forEach(item => {
              const productId = item.productId || item.product?.id;
              if (productId) {
                if (!salesMap[productId]) {
                  salesMap[productId] = {
                    product: item.product || { id: productId, name: item.productName || 'Unknown Product' },
                    salesCount: 0
                  };
                }
                salesMap[productId].salesCount += (item.quantity || 0);
              }
            });
          });

          const bestSellers = Object.values(salesMap).map(({ product, salesCount }) => ({
            ...product,
            salesCount
          }));
          const sortedBestSellers = bestSellers.sort((a, b) => b.salesCount - a.salesCount).slice(0, 4);

          // Quick actions tab navigation
          const handleQuickAction = (action) => {
            if (action === 'add_product') {
              resetProductForm();
              setShowProductModal(true);
              handleTabChange('products');
            } else if (action === 'dispatch_orders') {
              handleTabChange('orders');
            } else if (action === 'create_coupon') {
              setShowCouponModal(true);
              handleTabChange('coupons');
            } else if (action === 'settings') {
              handleTabChange('settings');
            }
          };

          return (
            <div className="space-y-8 animate-fade-in w-full text-left">
              
              {/* Contextual Greeting & Quick Action Toolbar */}
              <div className="bg-[#FAF7F2] border border-[#EAE4D8] rounded-[28px] p-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm text-left relative overflow-hidden group">
                <div className="space-y-1.5 relative z-10">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C]">{getGreeting()}</h2>
                  <p className="font-sans text-xs text-stone-500 font-light leading-relaxed">
                    Welcome to your operational command center. 
                    {pendingShipments > 0 ? (
                      <span className="text-[#B8833E] font-bold"> {pendingShipments} order(s) are awaiting dispatch today.</span>
                    ) : (
                      <span> All orders are currently processed and dispatched.</span>
                    )}
                    {lowStockCount > 0 && (
                      <span className="text-red-500 font-bold"> {lowStockCount} items are running low on stock.</span>
                    )}
                  </p>
                </div>

                {/* Quick Actions Toolbar */}
                <div className="flex flex-wrap gap-2.5 relative z-10 select-none">
                  <button 
                    onClick={() => handleQuickAction('add_product')}
                    className="px-4 py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition shadow-sm border-none cursor-pointer flex items-center gap-1.5"
                  >
                    <FiPlus className="w-3.5 h-3.5 text-[#B8833E]" />
                    <span>Add Product</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('dispatch_orders')}
                    className="px-4 py-2.5 bg-white hover:bg-stone-50 border border-[#EAE4D8] text-[#2F3B0C] text-[10px] font-bold uppercase tracking-widest rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <FiTruck className="w-3.5 h-3.5 text-[#4E641A]" />
                    <span>Dispatch Queue</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('create_coupon')}
                    className="px-4 py-2.5 bg-white hover:bg-stone-50 border border-[#EAE4D8] text-[#2F3B0C] text-[10px] font-bold uppercase tracking-widest rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <FiTag className="w-3.5 h-3.5 text-[#C68A2B]" />
                    <span>Create Coupon</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('settings')}
                    className="px-4 py-2.5 bg-white hover:bg-stone-50 border border-[#EAE4D8] text-[#2F3B0C] text-[10px] font-bold uppercase tracking-widest rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <FiSettings className="w-3.5 h-3.5 text-stone-500" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>

              {/*                 <div className="bg-white border border-[#EDE7D9] rounded-2xl p-4 flex flex-col justify-between h-[130px] shadow-sm hover:shadow-md hover:border-[#4E641A]/20 transition-all duration-300">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-[8px] font-extrabold tracking-widest uppercase text-stone-400">Total Sales</span>
                    <FiTrendingUp className="w-4 h-4 text-[#4E641A]" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-serif font-extrabold block text-[#2F3B0C]">₹{totalRevenue}</span>
                    <span className="text-[8px] font-bold text-[#4E641A] uppercase tracking-widest block mt-1">{getSalesTrendLabel()}</span>
                  </div>
                  <svg className="w-full h-8 text-[#4E641A] opacity-60 mt-1" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M 0 25 Q 20 15 40 22 T 80 5 T 100 12" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>

                <div className="bg-white border border-[#EDE7D9] rounded-2xl p-4 flex flex-col justify-between h-[130px] shadow-sm hover:shadow-md hover:border-[#4E641A]/20 transition-all duration-300">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-[8px] font-extrabold tracking-widest uppercase text-stone-400">Order Logs</span>
                    <FiTruck className="w-4 h-4 text-[#B8833E]" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-serif font-extrabold block text-[#2F3B0C]">{orders.length}</span>
                    <span className="text-[8px] font-bold text-[#B8833E] uppercase tracking-widest block mt-1">+{ordersToday} new today</span>
                  </div>
                  <svg className="w-full h-8 text-[#B8833E] opacity-60 mt-1" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M 0 20 Q 20 10 40 18 T 80 8 T 100 22" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>

                <div className="bg-white border border-[#EDE7D9] rounded-2xl p-4 flex flex-col justify-between h-[130px] shadow-sm hover:shadow-md hover:border-[#4E641A]/20 transition-all duration-300">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-[8px] font-extrabold tracking-widest uppercase text-stone-400">Awaiting Dispatch</span>
                    <FiAlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-serif font-extrabold block text-[#2F3B0C]">{pendingShipments}</span>
                    <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest block mt-1">↓ {pendingShipments === 0 ? 'All clear' : 'Needs attention'}</span>
                  </div>
                  <svg className="w-full h-8 text-red-455 opacity-60 mt-1" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M 0 12 L 20 12 Q 40 8 60 22 T 100 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>

                <div className="bg-white border border-[#EDE7D9] rounded-2xl p-4 flex flex-col justify-between h-[130px] shadow-sm hover:shadow-md hover:border-[#4E641A]/20 transition-all duration-300">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-[8px] font-extrabold tracking-widest uppercase text-stone-400">Customers</span>
                    <FiUsers className="w-4 h-4 text-[#4E641A]" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-serif font-extrabold block text-[#2F3B0C]">{totalCustomers}</span>
                    <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest block mt-1">+{customersToday} new today</span>
                  </div>
                  <svg className="w-full h-8 text-[#4E641A] opacity-60 mt-1" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M 0 25 Q 20 22 40 18 T 80 10 T 100 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>

                <div className="bg-white border border-[#EDE7D9] rounded-2xl p-4 flex flex-col justify-between h-[130px] shadow-sm hover:shadow-md hover:border-[#4E641A]/20 transition-all duration-300">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-[8px] font-extrabold tracking-widest uppercase text-stone-400">Staples in Catalog</span>
                    <FiShoppingBag className="w-4 h-4 text-[#4E641A]" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-serif font-extrabold block text-[#2F3B0C]">{activeProducts}</span>
                    <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest block mt-1">{lowStockCount > 0 ? `${lowStockCount} running low` : 'All items in stock'}</span>
                  </div>
                  <svg className="w-full h-8 text-stone-400 opacity-40 mt-1" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M 0 15 L 20 15 L 40 15 L 60 15 L 80 15 L 100 15" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>

                <div className="bg-white border border-[#EDE7D9] rounded-2xl p-4 flex flex-col justify-between h-[130px] shadow-sm hover:shadow-md hover:border-[#4E641A]/20 transition-all duration-300">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-[8px] font-extrabold tracking-widest uppercase text-stone-400">COD Ratio</span>
                    <FiTag className="w-4 h-4 text-[#B8833E]" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-serif font-extrabold block text-[#2F3B0C]">{codRatio}%</span>
                    <span className="text-[8px] font-bold text-[#B8833E] uppercase tracking-widest block mt-1">Value: ₹{codRevenue}</span>
                  </div>
                  <svg className="w-full h-8 text-[#B8833E] opacity-60 mt-1" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M 0 25 Q 30 18 60 22 T 100 15" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>

              </div>

              {/* Middle Section: Recent Orders Log & Pending Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Expandable Orders Table */}
                <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-sm col-span-1 lg:col-span-2 text-left flex flex-col">
                  <div className="flex justify-between items-center pb-4 border-b border-stone-100 mb-6 select-none">
                    <span className="font-serif text-base font-bold text-[#2F3B0C]">
                      Live Dispatch & Order Command
                    </span>
                    <button 
                      onClick={() => handleTabChange('orders')}
                      className="text-xs font-bold text-[#4E641A] hover:underline bg-transparent border-none cursor-pointer"
                    >
                      View All Orders ({orders.length})
                    </button>
                  </div>
                  
                  {orders.length === 0 ? (
                    <div className="py-16 text-center text-stone-400 font-light text-xs flex flex-col items-center justify-center gap-2 flex-grow">
                      <span>🌱</span>
                      <span>No recent order logs found</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto no-scrollbar flex-grow">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-stone-100 pb-3 text-stone-400 uppercase tracking-wider text-[10px] font-bold select-none">
                            <th className="py-2.5">Customer</th>
                            <th className="py-2.5">Order</th>
                            <th className="py-2.5">Date</th>
                            <th className="py-2.5 text-right">Amount</th>
                            <th className="py-2.5 text-center">Status</th>
                            <th className="py-2.5 text-center">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 6).map((o) => {
                            const isExpanded = !!expandedOrderIds[o.id];
                            return (
                              <React.Fragment key={o.id}>
                                <tr 
                                  onClick={() => toggleOrderExpand(o.id)}
                                  className="border-b border-stone-50 hover:bg-stone-50/50 transition duration-150 cursor-pointer"
                                >
                                  <td className="py-3 sm:py-3.5 flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-[#4E641A]/10 text-[#4E641A] flex items-center justify-center font-bold font-serif shrink-0">
                                      {o.user?.name ? o.user.name.charAt(0) : 'C'}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-stone-700">{o.user?.name || 'Guest'}</span>
                                      <span className="text-[9px] text-stone-450 font-light">{o.user?.phone || 'No phone'}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 sm:py-3.5 font-bold text-stone-600">{o.orderNumber}</td>
                                  <td className="py-3 sm:py-3.5 text-stone-450">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                                  <td className="py-3 sm:py-3.5 text-right font-serif font-bold text-[#4E641A]">₹{o.totalAmount}</td>
                                  <td className="py-3 sm:py-3.5 text-center">
                                    <span className={`text-[8px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full select-none ${
                                      o.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                      o.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                      o.status === 'PROCESSING' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                      o.status === 'SHIPPED' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                                      o.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border border-green-200' :
                                      'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                      {o.status}
                                    </span>
                                  </td>
                                  <td className="py-3 sm:py-3.5 text-center text-stone-400">
                                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                  </td>
                                </tr>
                                
                                {/* Expanded items preview & quick actions */}
                                {isExpanded && (
                                  <tr className="bg-stone-50/40">
                                    <td colSpan="6" className="py-4 px-5 border-b border-stone-100">
                                      <div className="flex flex-col sm:flex-row gap-6 justify-between items-start text-xs text-stone-600">
                                        <div className="space-y-1.5 text-left">
                                          <strong className="text-stone-400 uppercase tracking-widest text-[8px] block">Products Ordered</strong>
                                          <div className="space-y-1 font-medium">
                                            {o.orderItems?.map((item, idx) => (
                                              <div key={idx} className="flex gap-2">
                                                <span>• {item.productName || item.product?.name}</span>
                                                <span className="text-stone-400 font-light">({item.quantity} x {item.weight || item.variant?.name || '500g'})</span>
                                              </div>
                                            ))}
                                            {(!o.orderItems || o.orderItems.length === 0) && (
                                              <span className="italic text-stone-400 font-light">Standard Organic Staples</span>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-1.5 text-left">
                                          <strong className="text-stone-400 uppercase tracking-widest text-[8px] block">Coordinates</strong>
                                          <span className="text-stone-600 max-w-xs block leading-relaxed font-light">
                                            {(() => {
                                              const addr = o.shippingAddress || o.address;
                                              if (!addr) return 'Address logged in details';
                                              if (typeof addr === 'string') return addr;
                                              if (typeof addr === 'object') {
                                                const parts = [
                                                  addr.recipientName,
                                                  addr.street,
                                                  addr.city,
                                                  addr.state,
                                                  addr.postalCode ? `${addr.state} - ${addr.postalCode}` : addr.state,
                                                  addr.country
                                                ].filter(Boolean);
                                                return parts.join(', ') || 'Address logged in details';
                                              }
                                              return 'Address logged in details';
                                            })()}
                                          </span>
                                        </div>

                                        <div className="space-y-2 text-left">
                                          <strong className="text-stone-400 uppercase tracking-widest text-[8px] block">Logistics Link</strong>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); handleTabChange('orders'); }}
                                            className="px-3 py-1.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white rounded-lg text-[9px] font-bold uppercase transition border-none shadow-sm cursor-pointer"
                                          >
                                            Process Dispatch
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Pending Actions Panel */}
                <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-sm flex flex-col justify-between text-left">
                  <div className="space-y-6">
                    <div className="pb-4 border-b border-stone-100 select-none">
                      <span className="font-serif text-base font-bold text-[#2F3B0C]">
                        Pending Action Center 🔔
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {pendingActions.map((act) => (
                        <div key={act.id} className="border border-stone-100 rounded-xl p-4 flex flex-col gap-2 hover:border-[#4E641A]/20 transition bg-[#FAF7F2]/40">
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-bold text-xs text-stone-700">{act.title}</span>
                            <span className={`text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border select-none ${act.badgeColor}`}>
                              {act.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 font-light leading-relaxed">{act.desc}</p>
                          <button
                            onClick={act.onClick}
                            className="text-left text-[9px] font-bold uppercase tracking-wider text-[#4E641A] hover:underline bg-transparent border-none mt-1 p-0 cursor-pointer"
                          >
                            {act.actionText} →
                          </button>
                        </div>
                      ))}

                      {pendingActions.length === 0 && (
                        <div className="py-12 text-center text-stone-400 font-light text-xs flex flex-col items-center justify-center gap-1.5">
                          <span>🌿</span>
                          <span>No pending alerts or anomalies. All operations clear!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Section: Analytics & Intelligence (SVG Line Chart, Donut/Breakdowns, Live Feed) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Revenue trends chart */}
                <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-sm col-span-1 lg:col-span-2 text-left flex flex-col justify-between">
                  <div className="pb-4 border-b border-stone-100 mb-6 select-none">
                    <span className="font-serif text-base font-bold text-[#2F3B0C]">
                      Revenue Analytics Trends (Last 6 Months)
                    </span>
                  </div>

                  <div className="w-full overflow-hidden select-none">
                    <svg className="w-full h-44 text-[#4E641A]" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4E641A" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#4E641A" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="20" y1="20" x2="480" y2="20" stroke="#EAE4D8" strokeDasharray="3 3" />
                      <line x1="20" y1="65" x2="480" y2="65" stroke="#EAE4D8" strokeDasharray="3 3" />
                      <line x1="20" y1="110" x2="480" y2="110" stroke="#EAE4D8" strokeDasharray="3 3" />
                      <line x1="20" y1="130" x2="480" y2="130" stroke="#EDE7D9" strokeWidth="1" />

                      <path d={chartAreaD} fill="url(#chartGrad)" />
                      <path d={chartPathD} fill="none" stroke="#4E641A" strokeWidth="2.5" strokeLinecap="round" />

                      {chartPoints.map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="4" fill="#B8833E" stroke="white" strokeWidth="1.5" />
                          <text x={pt.x} y={pt.y - 8} textAnchor="middle" className="font-bold fill-stone-700" style={{ fontSize: '8px', fontFamily: 'sans-serif' }}>
                            ₹{pt.amount}
                          </text>
                          <text x={pt.x} y={chartHeight - 4} textAnchor="middle" className="font-bold fill-stone-400" style={{ fontSize: '9px', fontFamily: 'sans-serif' }}>
                            {pt.month}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-stone-100 pt-4 mt-6 text-center select-none">
                    <div>
                      <span className="text-[8px] font-extrabold uppercase tracking-widest text-stone-400">Total Sales</span>
                      <strong className="block text-sm font-serif font-bold text-[#4E641A] mt-0.5">₹{totalRevenue}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] font-extrabold uppercase tracking-widest text-stone-400">Average Order</span>
                      <strong className="block text-sm font-serif font-bold text-[#2F3B0C] mt-0.5">₹{orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] font-extrabold uppercase tracking-widest text-stone-400">Dispatched Rate</span>
                      <strong className="block text-sm font-serif font-bold text-[#B8833E] mt-0.5">
                        {orders.length > 0 ? Math.round((orders.filter(o => o.status === 'DELIVERED' || o.status === 'SHIPPED').length / orders.length) * 100) : 100}%
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Category share segment */}
                <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-sm text-left flex flex-col justify-between">
                  <div>
                    <div className="pb-4 border-b border-stone-100 mb-6 select-none">
                      <span className="font-serif text-base font-bold text-[#2F3B0C]">
                        Category Density (Catalog)
                      </span>
                    </div>

                    <div className="space-y-4">
                      {categoryBreakdown.slice(0, 5).map((cat, i) => {
                        const pct = Math.round((cat.count / products.length) * 100);
                        return (
                          <div key={i} className="space-y-1 font-sans">
                            <div className="flex justify-between items-center text-xs font-semibold text-stone-600">
                              <span className="flex items-center gap-1.5 select-none">
                                <span className="w-2 h-2 rounded-full bg-[#B8833E]" />
                                {cat.name}
                              </span>
                              <span>{cat.count} items ({pct}%)</span>
                            </div>
                            <div className="w-full bg-[#FAF7F2] border border-[#EAE4D8]/60 rounded-full h-1.5">
                              <div 
                                className="bg-[#4E641A] h-full rounded-full transition-all duration-500" 
                                style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }} 
                              />
                            </div>
                          </div>
                        );
                      })}

                      {categoryBreakdown.length === 0 && (
                        <div className="py-12 text-center text-stone-400 font-light text-xs">
                          No category density calculated yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#FAF7F2] border border-[#EAE4D8] rounded-2xl p-4 mt-6">
                    <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#B8833E]/90 block">Top Selling Grains</span>
                    <div className="mt-2 space-y-1.5 font-sans text-xs">
                      {sortedBestSellers.map((item, idx) => (
                        <div key={idx} className="flex justify-between font-medium text-stone-700">
                          <span className="truncate max-w-[150px]">{item.name}</span>
                          <span className="text-[#4E641A] font-bold">{item.salesCount} dispatches</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Real-time Activity Feed & Inventory Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Real-time Activity Feed */}
                <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-sm col-span-1 lg:col-span-2 text-left">
                  <div className="pb-4 border-b border-stone-100 mb-6 select-none">
                    <span className="font-serif text-base font-bold text-[#2F3B0C]">
                      Real-Time Operational Feed
                    </span>
                  </div>

                  <div className="space-y-4">
                    {sortedFeed.map((act) => (
                      <div key={act.id} className="flex gap-4 items-start text-xs border-b border-stone-100 pb-3 last:border-none last:pb-0 font-sans">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 select-none ${act.color}`}>
                          {act.icon}
                        </div>
                        <div className="flex-grow space-y-0.5 text-left">
                          <strong className="text-stone-750 font-bold block">{act.title}</strong>
                          <p className="text-stone-500 font-light leading-relaxed">{act.desc}</p>
                          <span className="text-[8px] text-stone-400 font-bold block pt-0.5">
                            <FiClock className="inline mr-1 text-[9px]" />
                            {new Date(act.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}

                    {sortedFeed.length === 0 && (
                      <div className="py-12 text-center text-stone-400 font-light text-xs">
                        No recent operations activity logged.
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock health card */}
                <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-sm text-left flex flex-col justify-between">
                  <div>
                    <div className="pb-4 border-b border-stone-100 mb-6 select-none">
                      <span className="font-serif text-base font-bold text-[#2F3B0C]">
                        Critical Inventory Stock Alerts
                      </span>
                    </div>

                    <div className="space-y-4">
                      {products.filter(p => p.inventory <= 5).slice(0, 4).map((p) => {
                        const isOut = p.inventory <= 0 || p.stockStatus === 'OUT_OF_STOCK';
                        return (
                          <div key={p.id} className="flex justify-between items-center text-xs font-sans border-b border-stone-50 pb-3.5 last:border-none last:pb-0">
                            <div className="text-left space-y-0.5">
                              <strong className="text-stone-750 font-bold leading-tight block truncate max-w-[150px]">{p.name}</strong>
                              <span className="text-[9px] text-stone-400 font-light block">SKU: {p.sku || 'N/A'}</span>
                            </div>
                            <div className="text-right">
                              <span className={`text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border select-none ${
                                isOut 
                                  ? 'bg-red-50 text-red-700 border-red-200' 
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {isOut ? 'OUT OF STOCK' : `${p.inventory} UNITS LEFT`}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {products.filter(p => p.inventory <= 5).length === 0 && (
                        <div className="py-12 text-center text-stone-450 font-light text-xs flex flex-col items-center justify-center gap-1.5">
                          <span>🌾</span>
                          <span>All products are sufficiently stocked.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleTabChange('products')}
                    className="w-full mt-6 py-3 border border-[#EAE4D8] hover:bg-stone-50 text-dark-olive text-[10px] font-bold uppercase tracking-widest rounded-xl transition shadow-xxs cursor-pointer block text-center"
                  >
                    Manage Catalog Stock
                  </button>
                </div>

              </div>

            </div>
          );
        })()}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-8 animate-fade-in w-full text-left">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EDE7D9]">
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#B8833E]">CMS CATALOG</span>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#37411A]">Storefront Products</h1>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { resetProductForm(); setShowProductModal(true); }}
                  className="px-5 py-3 bg-[#4E641A] hover:bg-[#37411A] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center space-x-1.5 shadow border-none cursor-pointer"
                >
                  <FiPlus />
                  <span>Publish Item</span>
                </button>
              </div>
            </div>

            {showProductModal && (
              <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-md animate-scale-up space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-[#EDE7D9]">
                  <h3 className="font-serif text-lg font-bold text-[#B8833E]">
                    {productForm.id ? 'Modify Staple Details' : 'Publish New Staple'}
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => { setShowProductModal(false); resetProductForm(); }}
                    className="text-stone-400 hover:text-stone-600 border-none bg-transparent text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {productForm.id && (
                  <div className="flex border-b border-[#EDE7D9] gap-4 mb-4 select-none">
                    <button
                      type="button"
                      onClick={() => setProductModalTab('general')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                        productModalTab === 'general'
                          ? 'border-[#4E641A] text-[#4E641A]'
                          : 'border-transparent text-stone-400 hover:text-stone-600'
                      } bg-transparent cursor-pointer`}
                    >
                      General Info
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductModalTab('reviews')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                        productModalTab === 'reviews'
                          ? 'border-[#4E641A] text-[#4E641A]'
                          : 'border-transparent text-stone-400 hover:text-stone-600'
                      } bg-transparent cursor-pointer`}
                    >
                      Reviews ({productSpecificReviews.length})
                    </button>
                  </div>
                )}

                {productModalTab === 'general' ? (
                  <form noValidate onSubmit={handleSaveProduct} className="space-y-6 text-xs text-stone-600 max-h-[70vh] overflow-y-auto custom-scroll pr-2">
                  
                  {/* SECTION 1: BASIC INFO */}
                  <div className="bg-white border border-stone-200 rounded-xl p-5 md:p-6 shadow-xs space-y-5 text-left">
                    <h4 className="text-sm font-semibold text-stone-900 border-b border-stone-100 pb-2">1. Basic Info</h4>
                    <div className="grid grid-cols-1 gap-5">
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-semibold text-stone-700 tracking-wide mb-1">Product Name *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. A2 Bilona Churned Ghee" 
                          value={productForm.name}
                          onChange={(e) => {
                            const newName = e.target.value;
                            const newSku = newName.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '') + '-' + Math.floor(100 + Math.random() * 900);
                            setProductForm({ ...productForm, name: newName, sku: productForm.id ? productForm.sku : newSku });
                          }}
                          className="bg-white border border-stone-300 rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] focus:ring-4 focus:ring-[#4E641A]/10 text-stone-900 placeholder-stone-400 text-sm transition-all"
                          required
                        />
                        {productFormErrors.name && (
                          <span className="text-[10px] text-red-650 font-bold block mt-1 select-none">
                            ⚠️ {productFormErrors.name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-xs font-semibold text-stone-700 tracking-wide mb-1">Categories (Select one or multiple) *</label>
                        <div className="grid grid-cols-2 gap-3 bg-stone-50 border border-stone-200 rounded-xl p-4 max-h-40 overflow-y-auto">
                          {categories.map(cat => {
                            const isChecked = (productForm.categoryIds || []).includes(cat.id);
                            return (
                              <label key={cat.id} className="flex items-center gap-2 font-sans text-xs text-stone-700 cursor-pointer hover:text-[#4E641A] transition">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const currentIds = productForm.categoryIds || [];
                                    let newIds;
                                    if (e.target.checked) {
                                      newIds = [...currentIds, cat.id];
                                    } else {
                                      newIds = currentIds.filter(id => id !== cat.id);
                                    }
                                    setProductForm({ 
                                      ...productForm, 
                                      categoryIds: newIds,
                                      categoryId: newIds[0] || '' // Fallback for legacy compatibility
                                    });
                                  }}
                                  className="accent-[#4E641A]"
                                />
                                <span className="select-none">{cat.name}</span>
                              </label>
                            );
                          })}
                        </div>
                        {productFormErrors.categoryIds && (
                          <span className="text-[10px] text-red-650 font-bold block mt-1 select-none">
                            ⚠️ {productFormErrors.categoryIds}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-semibold text-stone-700 tracking-wide mb-1">Short Description</label>
                        <textarea 
                          placeholder="A brief punchy summary of the staple's unique features..." 
                          value={productForm.shortDescription}
                          onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                          className="bg-white border border-stone-300 rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] focus:ring-4 focus:ring-[#4E641A]/10 h-24 resize-none font-sans text-stone-900 placeholder-stone-400 text-sm transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: PRICING & INVENTORY */}
                  <div className="bg-white border border-stone-200 rounded-xl p-5 md:p-6 shadow-xs space-y-5 text-left">
                    <h4 className="text-sm font-semibold text-stone-900 border-b border-stone-100 pb-2">2. Pricing & Inventory</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-semibold text-stone-700 tracking-wide mb-1">Original Price (₹)</label>
                        <input 
                          type="number" 
                          placeholder="1100" 
                          value={productForm.compareAtPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProductForm(prev => ({
                              ...prev,
                              compareAtPrice: val,
                              discountPercent: calculateDiscount(val, prev.price)
                            }));
                          }}
                          className="bg-white border border-stone-300 rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] focus:ring-4 focus:ring-[#4E641A]/10 text-stone-900 placeholder-stone-400 text-sm transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-semibold text-stone-700 tracking-wide mb-1">Sale Price (₹) *</label>
                        <input 
                          type="number" 
                          placeholder="950" 
                          value={productForm.price}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProductForm(prev => ({
                              ...prev,
                              price: val,
                              discountPercent: calculateDiscount(prev.compareAtPrice, val)
                            }));
                          }}
                          className="bg-white border border-stone-300 rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] focus:ring-4 focus:ring-[#4E641A]/10 text-stone-900 placeholder-stone-400 text-sm transition-all"
                          required
                        />
                        {productFormErrors.price && (
                          <span className="text-[10px] text-red-650 font-bold block mt-1 select-none">
                            ⚠️ {productFormErrors.price}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-semibold text-stone-700 tracking-wide mb-1">Stock Quantity *</label>
                        <input 
                          type="number" 
                          placeholder="40" 
                          value={productForm.inventory}
                          onChange={(e) => setProductForm({ ...productForm, inventory: e.target.value })}
                          className="bg-white border border-stone-300 rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] focus:ring-4 focus:ring-[#4E641A]/10 text-stone-900 placeholder-stone-400 text-sm transition-all"
                          required
                        />
                        {productFormErrors.inventory && (
                          <span className="text-[10px] text-red-650 font-bold block mt-1 select-none">
                            ⚠️ {productFormErrors.inventory}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-semibold text-stone-700 tracking-wide mb-1">Stock Status</label>
                        <select
                          value={productForm.stockStatus}
                          onChange={(e) => setProductForm({ ...productForm, stockStatus: e.target.value })}
                          className="bg-white border border-stone-300 rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] focus:ring-4 focus:ring-[#4E641A]/10 text-stone-900 cursor-pointer text-sm transition-all"
                        >
                          <option value="IN_STOCK">IN STOCK</option>
                          <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-semibold text-stone-700 tracking-wide mb-1">Weight / Size</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 500 g / 1 Litre" 
                          value={productForm.weight}
                          onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                          className="bg-white border border-stone-300 rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] focus:ring-4 focus:ring-[#4E641A]/10 text-stone-900 placeholder-stone-400 text-sm transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-semibold text-stone-700 tracking-wide mb-1">Discount Badge (%)</label>
                        <input 
                          type="number" 
                          placeholder="15" 
                          value={productForm.discountPercent}
                          onChange={(e) => setProductForm({ ...productForm, discountPercent: e.target.value })}
                          className="bg-white border border-stone-300 rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] focus:ring-4 focus:ring-[#4E641A]/10 text-stone-900 placeholder-stone-400 text-sm transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2.5: PRODUCT VARIANTS */}
                  <div className="bg-white border border-stone-200 rounded-xl p-5 md:p-6 shadow-xs space-y-5 text-left">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <h4 className="text-sm font-semibold text-stone-900">2.5 Product Variants</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const currentVariants = productForm.variants || [];
                          const sizeCount = currentVariants.length;
                          const defaultSizes = ["250g", "500g", "1kg"];
                          const defaultSizeName = defaultSizes[sizeCount] || `${(sizeCount + 1) * 250}g`;
                          const parentName = productForm.name || "PRODUCT";
                          const defaultSku = `${parentName.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '')}-${defaultSizeName.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
                          
                          setProductForm({
                            ...productForm,
                            variants: [
                              ...currentVariants,
                              {
                                id: '',
                                name: defaultSizeName,
                                price: productForm.price || '',
                                mrp: productForm.mrp || '',
                                sku: defaultSku,
                                inventory: productForm.inventory || 0
                              }
                            ]
                          });
                        }}
                        className="px-3.5 py-2 bg-[#4E641A] hover:bg-[#37411A] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition border-none cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <FiPlus className="w-3 h-3 text-[#B8833E]" />
                        <span>Add Variant</span>
                      </button>
                    </div>

                    {(productForm.variants && productForm.variants.length > 0) ? (
                      <div className="space-y-4 bg-stone-50 border border-stone-200 p-4 rounded-xl">
                        {productForm.variants.map((variant, index) => (
                          <div key={index} className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-white border border-stone-200 rounded-xl relative hover:border-stone-300 transition-colors shadow-xxs">
                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-[10px] font-semibold text-stone-700 tracking-wide">Size *</label>
                              <input
                                type="text"
                                value={variant.name}
                                onChange={(e) => {
                                  const updated = [...productForm.variants];
                                  updated[index].name = e.target.value;
                                  setProductForm({ ...productForm, variants: updated });
                                }}
                                placeholder="e.g. 500g"
                                className="bg-white border border-stone-300 rounded-lg py-2 px-2.5 focus:outline-none focus:border-[#4E641A] focus:ring-4 focus:ring-[#4E641A]/10 text-stone-900 text-xs transition-all w-full"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-[10px] font-semibold text-stone-700 tracking-wide">Price (₹) *</label>
                              <input
                                type="number"
                                value={variant.price}
                                onChange={(e) => {
                                  const updated = [...productForm.variants];
                                  updated[index].price = e.target.value;
                                  setProductForm({ ...productForm, variants: updated });
                                }}
                                placeholder="Price"
                                className="bg-white border border-stone-300 rounded-lg py-2 px-2.5 focus:outline-none focus:border-[#4E641A] focus:ring-4 focus:ring-[#4E641A]/10 text-stone-900 text-xs transition-all w-full"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-[10px] font-semibold text-stone-700 tracking-wide">MRP (₹)</label>
                              <input
                                type="number"
                                value={variant.mrp}
                                onChange={(e) => {
                                  const updated = [...productForm.variants];
                                  updated[index].mrp = e.target.value;
                                  setProductForm({ ...productForm, variants: updated });
                                }}
                                placeholder="MRP"
                                className="bg-white border border-stone-300 rounded-lg py-2 px-2.5 focus:outline-none focus:border-[#4E641A] focus:ring-4 focus:ring-[#4E641A]/10 text-stone-900 text-xs transition-all w-full"
                              />
                            </div>
                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-[10px] font-semibold text-stone-700 tracking-wide">Stock Qty *</label>
                              <input
                                type="number"
                                value={variant.inventory}
                                onChange={(e) => {
                                  const updated = [...productForm.variants];
                                  updated[index].inventory = e.target.value;
                                  setProductForm({ ...productForm, variants: updated });
                                }}
                                placeholder="Stock"
                                className="bg-white border border-stone-300 rounded-lg py-2 px-2.5 focus:outline-none focus:border-[#4E641A] focus:ring-4 focus:ring-[#4E641A]/10 text-stone-900 text-xs transition-all w-full"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1 text-left pr-6">
                              <label className="text-[10px] font-semibold text-stone-700 tracking-wide">SKU</label>
                              <input
                                type="text"
                                value={variant.sku}
                                onChange={(e) => {
                                  const updated = [...productForm.variants];
                                  updated[index].sku = e.target.value;
                                  setProductForm({ ...productForm, variants: updated });
                                }}
                                placeholder="SKU"
                                className="bg-white border border-stone-300 rounded-lg py-2 px-2.5 focus:outline-none focus:border-[#4E641A] focus:ring-4 focus:ring-[#4E641A]/10 text-stone-900 text-xs transition-all w-full"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (productForm.variants || []).filter((_, i) => i !== index);
                                setProductForm({ ...productForm, variants: updated });
                              }}
                              className="absolute top-2.5 right-2.5 text-stone-400 hover:text-red-500 bg-transparent border-none cursor-pointer transition-colors"
                              title="Delete Variant"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-400 italic text-left bg-stone-50 border border-stone-200 p-4 rounded-xl">No variants added yet. Parent product details will be used by default if no variants are specified.</p>
                    )}
                  </div>

                  {/* SECTION 3: MEDIA UPLOAD */}
                  <div className="bg-white border border-stone-200 rounded-xl p-5 md:p-6 shadow-xs space-y-5 text-left">
                    <h4 className="text-sm font-semibold text-stone-900 border-b border-stone-100 pb-2">3. Media Assets</h4>
                    
                    {productFormErrors.images && (
                      <span className="text-[10px] text-red-650 font-bold block mb-2 select-none">
                        ⚠️ {productFormErrors.images}
                      </span>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <UnifiedUploader
                        value={productForm.images?.[0] || ''}
                        onChange={(url) => {
                          const newImages = [...(productForm.images || ['', '', '', ''])];
                          newImages[0] = url;
                          setProductForm({ ...productForm, images: newImages, image: url });
                        }}
                        label="Main Product Image *"
                        aspectRatio={1}
                        folder="products"
                      />

                      <UnifiedUploader
                        value={productForm.images?.[1] || ''}
                        onChange={(url) => {
                          const newImages = [...(productForm.images || ['', '', '', ''])];
                          newImages[1] = url;
                          setProductForm({ ...productForm, images: newImages, hoverImage: url });
                        }}
                        label="Gallery Image 1"
                        aspectRatio={1}
                        folder="products"
                      />

                      <UnifiedUploader
                        value={productForm.images?.[2] || ''}
                        onChange={(url) => {
                          const newImages = [...(productForm.images || ['', '', '', ''])];
                          newImages[2] = url;
                          setProductForm({ ...productForm, images: newImages });
                        }}
                        label="Gallery Image 2"
                        aspectRatio={1}
                        folder="products"
                      />

                      <UnifiedUploader
                        value={productForm.images?.[3] || ''}
                        onChange={(url) => {
                          const newImages = [...(productForm.images || ['', '', '', ''])];
                          newImages[3] = url;
                          setProductForm({ ...productForm, images: newImages });
                        }}
                        label="Gallery Image 3"
                        aspectRatio={1}
                        folder="products"
                      />
                    </div>
                  </div>

                  {/* SECTION 4: STOREFRONT */}
                  <div className="bg-white border border-stone-200 rounded-xl p-5 md:p-6 shadow-xs space-y-5 text-left">
                    <h4 className="text-sm font-semibold text-stone-900 border-b border-stone-100 pb-2">4. Storefront Flags</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-50 border border-stone-200 p-5 rounded-xl">
                      
                      <label className="flex items-center space-x-3 cursor-pointer select-none hover:opacity-85 transition">
                        <input 
                          type="checkbox"
                          checked={productForm.isFeatured}
                          onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                          className="w-5 h-5 rounded border-stone-300 text-[#4E641A] focus:ring-[#4E641A] cursor-pointer accent-[#4E641A]"
                        />
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-xs text-stone-800">Featured</span>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 cursor-pointer select-none hover:opacity-85 transition">
                        <input 
                          type="checkbox"
                          checked={productForm.isBestseller}
                          onChange={(e) => setProductForm({ ...productForm, isBestseller: e.target.checked })}
                          className="w-5 h-5 rounded border-stone-300 text-[#4E641A] focus:ring-[#4E641A] cursor-pointer accent-[#4E641A]"
                        />
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-xs text-stone-800">Bestseller</span>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 cursor-pointer select-none hover:opacity-85 transition">
                        <input 
                          type="checkbox"
                          checked={productForm.isNewLaunch}
                          onChange={(e) => setProductForm({ ...productForm, isNewLaunch: e.target.checked })}
                          className="w-5 h-5 rounded border-stone-300 text-[#4E641A] focus:ring-[#4E641A] cursor-pointer accent-[#4E641A]"
                        />
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-xs text-stone-800">New Arrival</span>
                        </div>
                      </label>

                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="border-t border-stone-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-0 bg-white pb-4">
                    <span className="text-[10px] text-stone-400 font-semibold italic">Draft autosaves locally</span>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => { setShowProductModal(false); resetProductForm(); }}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 hover:text-stone-800 uppercase font-bold tracking-wider cursor-pointer transition active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isGlobalLoading}
                        className="w-full sm:w-auto px-8 py-3.5 bg-[#4E641A] hover:bg-[#37411A] disabled:bg-stone-300 text-white rounded-xl uppercase font-extrabold tracking-widest cursor-pointer border-none shadow-md transition transform active:scale-95"
                      >
                        {isGlobalLoading 
                          ? (productForm.id ? 'Saving...' : 'Publishing...') 
                          : (productForm.id ? 'Save Product' : 'Quick Publish ⚡')}
                      </button>
                    </div>
                  </div>

                </form>
              ) : (
                <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scroll pr-2 text-stone-600">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl p-4 text-center">
                      <span className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400 font-sans">Average Rating</span>
                      <div className="text-xl font-bold text-[#37411A] mt-1 font-serif">
                        ⭐ {productSpecificReviews.length > 0 ? parseFloat(productSpecificReviews.reduce((acc, r) => acc + r.rating, 0) / productSpecificReviews.length).toFixed(1) : '0.0'} / 5
                      </div>
                    </div>
                    <div className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl p-4 text-center">
                      <span className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400 font-sans font-sans">Total Reviews</span>
                      <div className="text-xl font-bold text-[#37411A] mt-1 font-serif">{productSpecificReviews.length}</div>
                    </div>
                    <div className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl p-4 text-center">
                      <span className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400 font-sans font-sans">Approved Reviews</span>
                      <div className="text-xl font-bold text-[#4E641A] mt-1 font-serif">
                        {productSpecificReviews.filter(r => r.status === 'APPROVED').length}
                      </div>
                    </div>
                    <div className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl p-4 text-center">
                      <span className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400 font-sans font-sans font-sans">Pending Reviews</span>
                      <div className="text-xl font-bold text-amber-600 mt-1 font-serif">
                        {productSpecificReviews.filter(r => r.status === 'PENDING').length}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-left">
                    <h4 className="font-serif text-sm font-bold text-[#4E641A] border-b border-[#EDE7D9] pb-2 uppercase tracking-wider">Review Listings</h4>
                    {productSpecificReviews.length === 0 ? (
                      <div className="text-center py-8 text-stone-400 text-xs italic font-sans font-sans">
                        No reviews submitted yet for this product.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {productSpecificReviews.map((rev) => (
                          <div key={rev.id} className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl p-4 space-y-2 text-left">
                            <div className="flex justify-between items-baseline gap-2">
                              <div>
                                <span className="font-bold text-xs text-[#37411A]">{rev.customerName || 'Anonymous'}</span>
                                <span className="text-[9px] text-stone-400 ml-2 font-medium font-sans font-sans">({new Date(rev.createdAt).toLocaleDateString()})</span>
                              </div>
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full font-sans uppercase tracking-wider font-sans font-sans font-sans ${
                                rev.status === 'APPROVED'
                                  ? 'bg-green-50 text-[#4E641A] border border-green-200'
                                  : rev.status === 'REJECTED'
                                    ? 'bg-red-50 text-red-500 border border-red-200'
                                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                              }`}>
                                {rev.status}
                              </span>
                            </div>
                            <div className="flex text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <FiStar key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-stone-200'}`} />
                              ))}
                            </div>
                            {rev.reviewTitle && (
                              <h6 className="font-serif font-bold text-xs text-[#37411A] leading-tight font-sans font-sans">{rev.reviewTitle}</h6>
                            )}
                            <p className="text-[11px] text-stone-500 leading-relaxed font-light font-sans font-sans font-sans">{rev.reviewText || rev.comment}</p>
                            
                            {rev.reviewImages && rev.reviewImages.length > 0 && (
                              <div className="flex gap-1.5 mt-1">
                                {rev.reviewImages.map((img, idx) => (
                                  <img key={idx} src={img} alt="review" className="w-10 h-10 object-cover rounded-lg border border-stone-200" />
                                ))}
                              </div>
                            )}

                            <div className="flex gap-2 justify-end pt-2 border-t border-stone-100">
                              {rev.status !== 'APPROVED' && (
                                <button
                                  type="button"
                                  onClick={() => handleApproveReview(rev.id)}
                                  className="px-3 py-1 bg-[#4E641A] hover:bg-[#37411A] text-white text-[9px] font-bold uppercase rounded-lg border-none cursor-pointer tracking-wider transition shadow-sm font-sans font-sans font-sans"
                                >
                                  Approve
                                </button>
                              )}
                              {rev.status !== 'REJECTED' && (
                                <button
                                  type="button"
                                  onClick={() => handleRejectReview(rev.id)}
                                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-bold uppercase rounded-lg border-none cursor-pointer tracking-wider transition shadow-sm font-sans font-sans font-sans"
                                >
                                  Reject
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(rev.id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-650 text-white text-[9px] font-bold uppercase rounded-lg border-none cursor-pointer tracking-wider transition shadow-sm font-sans font-sans font-sans"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              </div>
            )}

            {/* Products grid lists */}
            {products.length === 0 ? (
              <EmptyState
                title="📦 No Products Yet"
                description="Your storefront is ready, but no products have been published yet. Start by creating your first product and showcase it on your website."
                illustration="📦"
                actionLabel="Publish First Product"
                onAction={() => { resetProductForm(); setShowProductModal(true); }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
                {products.map((prod) => (
                  <div key={prod.id} className="bg-white border border-[#EDE7D9] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm hover:border-[#B8833E]/20 transition group text-left admin-product-card">
                    <div className="flex gap-4 items-center min-w-0">
                      <img 
                        src={prod.images?.length > 0 ? prod.images[0].url : prod.image} 
                        alt={prod.name} 
                        className="w-14 h-14 object-cover rounded-xl border border-[#EDE7D9] bg-stone-50 shrink-0"
                      />
                      <div className="flex flex-col text-left min-w-0">
                        <h4 className="font-serif text-sm font-bold truncate text-[#37411A] group-hover:text-[#B8833E] transition admin-product-name">{prod.name}</h4>
                        <p className="text-[10px] text-stone-400 font-semibold mt-0.5">
                          SKU: {prod.sku} • Stock: <span className={prod.inventory > 0 ? 'text-[#4E641A] font-bold' : 'text-red-500 font-bold'}>{prod.inventory} units</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <strong className="text-[#4E641A] font-serif text-sm font-bold admin-product-price">₹{prod.price}</strong>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => openEditProduct(prod)}
                          className="p-2 text-[#4E641A] hover:bg-[#4E641A]/10 rounded-lg transition cursor-pointer bg-transparent border-none"
                          title="Edit Details"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer bg-transparent border-none"
                          title="Delete Staple"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-fade-in w-full text-left">
            
            <div className="pb-6 border-b border-[#EDE7D9] text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#B8833E]">DISPATCH COORDINATION</span>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#37411A]">Incoming Shipments</h1>
              </div>
              <span className="text-[10px] text-stone-400 font-semibold italic bg-white border border-[#EDE7D9] px-3.5 py-1.5 rounded-full shadow-xxs">
                Logged in as: {adminUser?.name || 'Administrator'} 🌿
              </span>
            </div>

            {/* Admin Shipment KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Pending Shipments', value: orders.filter(o => o.status === 'PENDING').length, color: 'bg-amber-50 text-amber-700 border-amber-250', iconColor: 'text-amber-500' },
                { label: 'In Transit Orders', value: orders.filter(o => ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.status)).length, color: 'bg-cyan-50 text-cyan-700 border-cyan-250', iconColor: 'text-cyan-500' },
                { label: 'Delivered Today', value: orders.filter(o => o.status === 'DELIVERED' && getISTDate(o.updatedAt || o.createdAt) >= getISTTodayStart()).length, color: 'bg-green-50 text-green-700 border-green-250', iconColor: 'text-green-500' },
                { label: 'Cancelled Orders', value: orders.filter(o => o.status === 'CANCELLED').length, color: 'bg-red-50 text-red-700 border-red-250', iconColor: 'text-red-500' },
                { label: 'COD Orders Base', value: orders.filter(o => o.paymentMethod === 'COD').length, color: 'bg-[#4E641A]/5 text-[#4E641A] border-[#4E641A]/20', iconColor: 'text-[#4E641A]' }
              ].map((kpi, idx) => (
                <div key={idx} className={`p-4 border rounded-2xl flex flex-col justify-between shadow-xxs ${kpi.color}`}>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest block opacity-85 leading-tight">{kpi.label}</span>
                  <div className="flex items-baseline justify-between mt-3">
                    <span className="text-xl md:text-2xl font-bold font-serif">{kpi.value}</span>
                    <span className="text-lg">📦</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Search and Filters Toolbar */}
            <div className="bg-white border border-[#EDE7D9] rounded-[24px] p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                
                {/* Search Bar */}
                <div className="relative flex-grow max-w-md">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search Order Number, Customer, Phone..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EDE7D9] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#37411A] placeholder-stone-400 focus:outline-none focus:border-[#4E641A] font-medium"
                  />
                  {orderSearchQuery && (
                    <button 
                      onClick={() => setOrderSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 bg-transparent border-none text-[10px] cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Clear Filters Button */}
                {(orderSearchQuery || orderLogisticsFilter !== 'ALL' || orderPaymentFilter !== 'ALL') && (
                  <button
                    onClick={() => {
                      setOrderSearchQuery('');
                      setOrderLogisticsFilter('ALL');
                      setOrderPaymentFilter('ALL');
                    }}
                    className="text-[#4E641A] hover:underline bg-transparent border-none text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Status Segment Filters */}
              <div className="flex flex-col gap-3 pt-2 border-t border-stone-100 text-xs">
                
                {/* Logistics filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 w-24 shrink-0">Logistics:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'ALL', label: 'All Shipments' },
                      { id: 'PENDING', label: 'Pending' },
                      { id: 'CONFIRMED', label: 'Confirmed' },
                      { id: 'PROCESSING', label: 'Processing' },
                      { id: 'SHIPPED', label: 'Shipped' },
                      { id: 'DELIVERED', label: 'Delivered' },
                      { id: 'CANCELLED', label: 'Cancelled' }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setOrderLogisticsFilter(btn.id)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition cursor-pointer select-none ${
                          orderLogisticsFilter === btn.id
                            ? 'bg-[#4E641A] text-white border-[#4E641A] shadow-xxs'
                            : 'bg-stone-50 text-stone-600 border-[#EDE7D9] hover:bg-stone-100'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment status filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 w-24 shrink-0">Payment:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'ALL', label: 'All Payments' },
                      { id: 'PENDING', label: 'Pending' },
                      { id: 'COMPLETED', label: 'Completed' },
                      { id: 'FAILED', label: 'Failed' }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setOrderPaymentFilter(btn.id)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition cursor-pointer select-none ${
                          orderPaymentFilter === btn.id
                            ? 'bg-[#4E641A] text-white border-[#4E641A] shadow-xxs'
                            : 'bg-stone-50 text-stone-600 border-[#EDE7D9] hover:bg-stone-100'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Order Listings Grid */}
            <div className="space-y-6">
              {(() => {
                const filteredOrders = orders.filter((o) => {
                  const query = orderSearchQuery.toLowerCase().trim();
                  const matchesSearch = !query || 
                    (o.orderNumber || '').toLowerCase().includes(query) || 
                    (o.user?.name || '').toLowerCase().includes(query) || 
                    (o.shippingAddress?.phone || '').toLowerCase().includes(query);
                    
                  const logisticsStatus = o.logistics?.status || o.status || 'PENDING';
                  let matchesLogistics = true;
                  if (orderLogisticsFilter !== 'ALL') {
                    if (orderLogisticsFilter === 'TRANSIT') {
                      matchesLogistics = ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(logisticsStatus);
                    } else {
                      matchesLogistics = logisticsStatus === orderLogisticsFilter;
                    }
                  }
                  
                  let matchesPayment = true;
                  if (orderPaymentFilter !== 'ALL') {
                    matchesPayment = o.paymentStatus === orderPaymentFilter;
                  }
                  
                  return matchesSearch && matchesLogistics && matchesPayment;
                });

                if (filteredOrders.length === 0) {
                  return (
                    <EmptyState
                      title="🛒 No Matching Orders"
                      description="Try adjusting your filters or search terms to find other shipments."
                      illustration="🔍"
                    />
                  );
                }

                return filteredOrders.map((o) => {
                  const logisticsStatus = o.logistics?.status || o.status || 'PENDING';
                  const isCancelled = logisticsStatus === 'CANCELLED';
                  
                  // Helper function to color coordinate badges
                  const getStatusColorClasses = (status) => {
                    const norm = (status || '').toUpperCase().trim();
                    switch (norm) {
                      case 'PENDING': return 'bg-amber-55 text-amber-800 border-amber-300';
                      case 'CONFIRMED': return 'bg-blue-50 text-blue-705 border-blue-200';
                      case 'PROCESSING': return 'bg-purple-50 text-purple-700 border-purple-250';
                      case 'SHIPPED': return 'bg-teal-50 text-teal-705 border-teal-250';
                      case 'IN_TRANSIT':
                      case 'IN TRANSIT':
                        return 'bg-cyan-50 text-cyan-705 border-cyan-250';
                      case 'OUT_FOR_DELIVERY': return 'bg-orange-50 text-orange-705 border-orange-250';
                      case 'DELIVERED': return 'bg-green-50 text-green-705 border-green-250';
                      case 'CANCELLED': return 'bg-red-55 text-red-800 border-red-300';
                      default: return 'bg-stone-50 text-stone-705 border-stone-250';
                    }
                  };

                  const getAdminStepIndex = (status) => {
                    const norm = (status || '').toUpperCase().trim();
                    if (norm === 'PENDING' || norm === 'PLACED') return 0;
                    if (norm === 'CONFIRMED') return 1;
                    if (norm === 'PROCESSING' || norm === 'PREPARED') return 2;
                    if (norm === 'SHIPPED') return 3;
                    if (norm === 'TRANSIT' || norm === 'IN_TRANSIT' || norm === 'IN TRANSIT') return 4;
                    if (norm === 'OUT_FOR_DELIVERY') return 5;
                    if (norm === 'DELIVERED') return 6;
                    if (norm === 'CANCELLED') return -1;
                    return 0;
                  };

                  const adminTimelineSteps = [
                    { label: 'Placed', icon: () => <span className="text-[10px]">🛒</span>, desc: 'Placed' },
                    { label: 'Confirmed', icon: () => <span className="text-[10px]">✓</span>, desc: 'Confirmed' },
                    { label: 'Prepared', icon: () => <span className="text-[10px]">📦</span>, desc: 'Processing' },
                    { label: 'Shipped', icon: () => <span className="text-[10px]">🚚</span>, desc: 'Shipped' },
                    { label: 'Transit', icon: () => <span className="text-[10px]">🕒</span>, desc: 'In Transit' },
                    { label: 'Out', icon: () => <span className="text-[10px]">🛵</span>, desc: 'Out For Delivery' },
                    { label: 'Delivered', icon: () => <span className="text-[10px]">🌿</span>, desc: 'Delivered' }
                  ];

                  const currentStep = getAdminStepIndex(logisticsStatus);

                  const getActivityLogs = () => {
                    const logs = [];
                    const createdDate = new Date(o.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                    
                    logs.push({ text: 'Order Placed & Shipment Log Created', time: createdDate, badge: 'Placed' });
                    
                    if (['CONFIRMED', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(logisticsStatus)) {
                      logs.push({ text: 'Order Confirmed by Admin', time: new Date(new Date(o.createdAt).getTime() + 5 * 60 * 1000).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), badge: 'Confirmed' });
                    }
                    if (['PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(logisticsStatus)) {
                      logs.push({ text: 'Harvest gathered & packed at farm coordinate', time: new Date(new Date(o.createdAt).getTime() + 15 * 60 * 1000).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), badge: 'Prepared' });
                    }
                    if (['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(logisticsStatus) && o.logistics?.dispatchDate) {
                      logs.push({ text: `Tracking registered and shipped via ${o.logistics.courierName || 'Standard Partner'}`, time: new Date(o.logistics.dispatchDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), badge: 'Shipped' });
                    }
                    if (['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(logisticsStatus)) {
                      logs.push({ text: 'Carrier departed, shipment in transit', time: new Date(o.updatedAt || Date.now()).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), badge: 'Transit' });
                    }
                    if (['OUT_FOR_DELIVERY', 'DELIVERED'].includes(logisticsStatus)) {
                      logs.push({ text: 'Out for delivery with courier partner', time: new Date(o.updatedAt || Date.now()).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), badge: 'Out for Delivery' });
                    }
                    if (logisticsStatus === 'DELIVERED') {
                      logs.push({ text: 'Delivered successfully & customer notified', time: new Date(o.updatedAt || Date.now()).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), badge: 'Delivered' });
                    }
                    if (logisticsStatus === 'CANCELLED') {
                      logs.push({ text: 'Order cancelled, delivery aborted', time: new Date(o.updatedAt || Date.now()).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), badge: 'Cancelled' });
                    }
                    return logs.reverse();
                  };

                  const logs = getActivityLogs();

                  const courierPresets = [
                    { name: 'Delhivery', trackingUrl: 'https://track.delhivery.com/awb/', logo: '🚚' },
                    { name: 'BlueDart', trackingUrl: 'https://www.bluedart.com/tracking?awb=', logo: '📦' },
                    { name: 'DTDC', trackingUrl: 'https://www.dtdc.in/tracking/tracking.asp?awb=', logo: '✈️' },
                    { name: 'XpressBees', trackingUrl: 'https://www.xpressbees.com/track?awb=', logo: '🐝' },
                    { name: 'India Post', trackingUrl: 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?awb=', logo: '📮' }
                  ];

                  const isExpanded = !!expandedOrders[o.id] || (orderSearchQuery && filteredOrders.length === 1 && filteredOrders[0].id === o.id);

                  return (
                    <div key={o.id} className="bg-white border border-[#EDE7D9] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col text-left">
                      
                      {/* HEADER SECTION */}
                      <div 
                        onClick={() => setExpandedOrders(prev => ({ ...prev, [o.id]: !isExpanded }))}
                        className={`bg-[#FDFBF7] p-5 cursor-pointer hover:bg-[#FAF7F2] transition-colors duration-250 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 select-none ${
                          isExpanded ? 'border-b border-[#EDE7D9]' : ''
                        }`}
                      >
                        
                        {/* LEFT COLUMN: Order Identification */}
                        <div className="flex-1 min-w-0 space-y-1.5 text-left">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[#4E641A] text-xs">📦</span>
                            <h3 className="font-serif text-base font-extrabold text-[#37411A] leading-none">{o.orderNumber}</h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(o.orderNumber);
                                alert('Order ID copied to clipboard.');
                              }}
                              className="text-stone-400 hover:text-[#4E641A] transition text-[8px] uppercase font-extrabold tracking-widest bg-white border border-[#EDE7D9] px-2 py-0.5 rounded cursor-pointer select-none"
                              title="Copy Order ID"
                            >
                              Copy
                            </button>
                          </div>
                          
                          <div className="text-[10px] text-stone-500 font-semibold tracking-wider space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[#37411A] font-bold">Buyer: {o.user?.name || 'Guest'}</span>
                              <span className="text-stone-300">•</span>
                              <span>Placed: {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="text-stone-400 font-medium truncate max-w-sm sm:max-w-md" title={o.orderItems?.map(item => `${item.product?.name} (x${item.quantity})`).join(', ')}>
                              <span className="text-[#B8833E]">Items: </span>
                              {o.orderItems?.map(item => `${item.product?.name} (x${item.quantity})`).join(', ') || 'Standard Staples'}
                            </div>
                          </div>
                        </div>

                        {/* CENTER COLUMN: Status Badges & Mini Progress Indicator */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:justify-center">
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border select-none ${getStatusColorClasses(logisticsStatus)}`}>
                              {logisticsStatus}
                            </span>
                            <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border select-none ${
                              o.paymentStatus === 'COMPLETED'
                                ? 'bg-green-55 text-green-800 border-green-300'
                                : o.paymentStatus === 'FAILED'
                                  ? 'bg-red-55 text-red-800 border-red-300'
                                  : 'bg-amber-55 text-amber-800 border-amber-300'
                            }`}>
                              Payment: {o.paymentStatus}
                            </span>
                          </div>

                          {/* Mini Shipment Progress Tracker (Hidden on Mobile) */}
                          <div className="hidden sm:flex flex-col items-start gap-1">
                            <div className="w-24 bg-stone-150 h-1.5 rounded-full overflow-hidden border border-stone-200">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  logisticsStatus === 'CANCELLED' ? 'bg-red-500' : 'bg-[#4E641A]'
                                }`} 
                                style={{ 
                                  width: `${
                                    logisticsStatus === 'CANCELLED' 
                                      ? 100 
                                      : ((currentStep) / (adminTimelineSteps.length - 1)) * 100
                                  }%` 
                                }} 
                              />
                            </div>
                            <span className="text-[7.5px] font-extrabold text-stone-400 uppercase tracking-widest block pl-0.5">
                              {logisticsStatus === 'CANCELLED' ? 'Cancelled' : `Stage ${currentStep + 1} of 7`}
                            </span>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Amount & Control Toggles */}
                        <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-none pt-3 lg:pt-0">
                          <div className="text-right">
                            <span className="text-[7.5px] font-extrabold text-stone-400 uppercase tracking-widest block mb-0.5">Grand Total</span>
                            <span className="font-serif text-base font-extrabold text-[#4E641A]">₹{o.totalAmount}</span>
                          </div>

                          <div className="flex items-center gap-2 select-none" onClick={(e) => e.stopPropagation()}>
                            {/* Quick Actions trigger based on current status */}
                            {logisticsStatus === 'PENDING' && (
                              <button
                                onClick={() => {
                                  setExpandedOrders(prev => ({ ...prev, [o.id]: true }));
                                }}
                                className="px-2.5 py-1.5 bg-[#4E641A]/10 hover:bg-[#4E641A] text-[#4E641A] hover:text-white rounded-lg text-[9px] font-bold uppercase transition border border-[#4E641A]/20 cursor-pointer shadow-xxs"
                              >
                                Dispatch
                              </button>
                            )}

                            {/* Chevron collapse arrow toggle */}
                            <button
                              onClick={() => setExpandedOrders(prev => ({ ...prev, [o.id]: !isExpanded }))}
                              className="p-2 border border-[#EDE7D9] text-[#37411A] rounded-xl hover:bg-stone-50 cursor-pointer transition select-none flex items-center justify-center bg-white shadow-xxs"
                            >
                              <FiChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#B8833E]' : 'text-stone-500'}`} />
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* COLLAPSIBLE STRUCTURED BODY */}
                      <div 
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${
                          isExpanded 
                            ? 'max-h-[3000px] opacity-100 border-t border-[#EDE7D9] p-5 md:p-6' 
                            : 'max-h-0 opacity-0 p-0 pointer-events-none'
                        }`}
                      >
                        {isExpanded && (
                          <div className="space-y-6 animate-fade-in">
                          
                          {/* 3-Section Split Columns Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            
                            {/* SECTION A: ORDER INFORMATION (Span 4) */}
                            <div className="md:col-span-4 bg-[#FDFBF7]/40 border border-[#EDE7D9]/70 rounded-[20px] p-5 space-y-4 flex flex-col justify-between self-stretch">
                              <div className="space-y-4">
                                <h4 className="font-serif text-xs font-bold text-[#37411A] border-b pb-2 border-[#EDE7D9] uppercase tracking-wider flex items-center gap-1.5">
                                  <span>🌱</span> Order Information
                                </h4>
                                
                                <div className="space-y-2 text-xs">
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-stone-400 font-semibold">Buyer Name:</span>
                                    <span className="font-bold text-[#37411A]">{o.user.name}</span>
                                  </div>
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-stone-400 font-semibold">Contact Phone:</span>
                                    <span className="font-bold text-[#37411A]">{o.shippingAddress?.phone || 'Not Provided'}</span>
                                  </div>
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-stone-400 font-semibold">Method:</span>
                                    <span className="font-bold text-[#4E641A]">{o.paymentMethod}</span>
                                  </div>
                                  <div className="flex flex-col gap-0.5 text-left pt-1 border-t border-stone-100">
                                    <span className="text-stone-400 font-semibold">Delivery Address:</span>
                                    <span className="font-medium text-stone-700 block leading-relaxed">
                                      {o.shippingAddress?.recipientName && <strong>{o.shippingAddress.recipientName}<br /></strong>}
                                      {o.shippingAddress?.street}, {o.shippingAddress?.city}, {o.shippingAddress?.state} – {o.shippingAddress?.postalCode}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2.5 pt-2 border-t border-stone-100">
                                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 block">Ordered Products</span>
                                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                                    {o.orderItems?.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-[11px] bg-white border border-[#EDE7D9]/80 p-2 rounded-xl">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="text-sm shrink-0">🌾</span>
                                          <div className="min-w-0 text-left">
                                            <span className="font-bold text-[#37411A] block truncate">{item.product?.name}</span>
                                            <span className="text-[9px] text-stone-400 font-semibold">Qty: {item.quantity} • {item.variant?.name || item.product?.weight || '500 ml'}</span>
                                          </div>
                                        </div>
                                        <span className="font-extrabold text-[#4E641A] shrink-0">₹{item.price * item.quantity}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                                <span className="text-stone-400 font-bold text-xs">Total Amount</span>
                                <span className="font-serif text-[#4E641A] text-base font-extrabold">₹{o.totalAmount}</span>
                              </div>

                              {/* Document Print Operations */}
                              <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-2 select-none">
                                <button
                                  type="button"
                                  onClick={() => handlePrintBill(o)}
                                  className="w-full py-2.5 px-3 bg-white hover:bg-stone-50 border border-[#EDE7D9] text-[#37411A] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition text-[9px] uppercase tracking-wider font-extrabold shadow-xxs hover:border-[#4E641A]/30 active:scale-95"
                                >
                                  <FiFileText className="w-3.5 h-3.5 text-[#4E641A]" />
                                  <span>Print Bill</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePrintLabel(o)}
                                  className="w-full py-2.5 px-3 bg-white hover:bg-stone-50 border border-[#EDE7D9] text-[#37411A] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition text-[9px] uppercase tracking-wider font-extrabold shadow-xxs hover:border-[#4E641A]/30 active:scale-95"
                                >
                                  <FiShoppingBag className="w-3.5 h-3.5 text-[#B8833E]" />
                                  <span>Print Label</span>
                                </button>
                              </div>
                            </div>

                            {/* SECTION B: LOGISTICS MANAGEMENT (Span 5) */}
                            <div className="md:col-span-5 bg-white border border-[#EDE7D9] rounded-[20px] p-5 space-y-4 self-stretch">
                              <h4 className="font-serif text-xs font-bold text-[#37411A] border-b pb-2 border-[#EDE7D9] uppercase tracking-wider flex items-center gap-1.5">
                                <span>🚚</span> Logistics Management
                              </h4>

                              {/* Courier Partner Logos / Auto-suggest list */}
                              <div className="space-y-1.5 text-left">
                                <span className="text-[8px] font-extrabold uppercase tracking-widest text-stone-400 block">Quick Partner Select Autocomplete</span>
                                <div className="flex flex-wrap gap-1">
                                  {courierPresets.map((preset) => (
                                    <button
                                      key={preset.name}
                                      type="button"
                                      onClick={() => {
                                        updateDraftField(o.id, 'courierName', preset.name);
                                        const tNum = shipmentDrafts[o.id]?.trackingNumber !== undefined
                                          ? shipmentDrafts[o.id].trackingNumber
                                          : o.logistics?.trackingNumber || '';
                                        if (tNum) {
                                          updateDraftField(o.id, 'trackingUrl', preset.trackingUrl + tNum);
                                        } else {
                                          updateDraftField(o.id, 'trackingUrl', preset.trackingUrl);
                                        }
                                      }}
                                      className="px-2 py-1 bg-stone-50 hover:bg-[#4E641A]/5 border border-[#EDE7D9] rounded-lg text-[9px] font-bold text-stone-600 hover:text-[#4E641A] transition cursor-pointer flex items-center gap-1 select-none"
                                    >
                                      <span>{preset.logo}</span>
                                      <span>{preset.name}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Logistics Fields Responsive Grid Form */}
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                
                                <div className="flex flex-col gap-1 text-left">
                                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Courier Partner</label>
                                  <input
                                    type="text"
                                    value={
                                      shipmentDrafts[o.id]?.courierName !== undefined
                                        ? shipmentDrafts[o.id].courierName
                                        : o.logistics?.courierName || ''
                                    }
                                    onChange={(e) => updateDraftField(o.id, 'courierName', e.target.value)}
                                    placeholder="e.g. Delhivery"
                                    className="bg-[#FDFBF7] border border-[#EDE7D9] text-[#37411A] rounded-xl py-2 px-3 focus:outline-none focus:border-[#4E641A] font-medium"
                                  />
                                </div>

                                <div className="flex flex-col gap-1 text-left">
                                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400 flex items-center justify-between">
                                    <span>Tracking Number / AWB</span>
                                    {(shipmentDrafts[o.id]?.trackingNumber || o.logistics?.trackingNumber) && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const num = shipmentDrafts[o.id]?.trackingNumber || o.logistics?.trackingNumber;
                                          navigator.clipboard.writeText(num);
                                          alert('Tracking number copied.');
                                        }}
                                        className="text-[#4E641A] hover:underline bg-transparent border-none text-[8px] font-extrabold uppercase tracking-widest cursor-pointer select-none"
                                      >
                                        Copy
                                      </button>
                                    )}
                                  </label>
                                  <input
                                    type="text"
                                    value={
                                      shipmentDrafts[o.id]?.trackingNumber !== undefined
                                        ? shipmentDrafts[o.id].trackingNumber
                                        : o.logistics?.trackingNumber || ''
                                    }
                                    onChange={(e) => {
                                      const num = e.target.value;
                                      updateDraftField(o.id, 'trackingNumber', num);
                                      // Auto-template the URL if courier is selected
                                      const courier = shipmentDrafts[o.id]?.courierName || o.logistics?.courierName || '';
                                      const matchingPreset = courierPresets.find(p => p.name.toLowerCase() === courier.toLowerCase());
                                      if (matchingPreset) {
                                        updateDraftField(o.id, 'trackingUrl', matchingPreset.trackingUrl + num);
                                      }
                                    }}
                                    placeholder="e.g. AWB1829472"
                                    className="bg-[#FDFBF7] border border-[#EDE7D9] text-[#37411A] rounded-xl py-2 px-3 focus:outline-none focus:border-[#4E641A] font-medium"
                                  />
                                </div>

                                <div className="flex flex-col gap-1 text-left">
                                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Dispatch Date</label>
                                  <input
                                    type="date"
                                    value={
                                      shipmentDrafts[o.id]?.dispatchDate !== undefined
                                        ? shipmentDrafts[o.id].dispatchDate
                                        : o.logistics?.dispatchDate ? new Date(o.logistics.dispatchDate).toISOString().split('T')[0] : ''
                                    }
                                    onChange={(e) => updateDraftField(o.id, 'dispatchDate', e.target.value)}
                                    className="bg-[#FDFBF7] border border-[#EDE7D9] text-[#37411A] rounded-xl py-2 px-3 focus:outline-none focus:border-[#4E641A] font-medium"
                                  />
                                </div>

                                <div className="flex flex-col gap-1 text-left">
                                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Estimated Delivery (ETA)</label>
                                  <input
                                    type="date"
                                    value={
                                      shipmentDrafts[o.id]?.estimatedDelivery !== undefined
                                        ? shipmentDrafts[o.id].estimatedDelivery
                                        : o.logistics?.estimatedDeliveryDate ? new Date(o.logistics.estimatedDeliveryDate).toISOString().split('T')[0] : ''
                                    }
                                    onChange={(e) => updateDraftField(o.id, 'estimatedDelivery', e.target.value)}
                                    className="bg-[#FDFBF7] border border-[#EDE7D9] text-[#37411A] rounded-xl py-2 px-3 focus:outline-none focus:border-[#4E641A] font-medium"
                                  />
                                </div>

                                <div className="flex flex-col gap-1 text-left col-span-2">
                                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400 flex items-center justify-between">
                                    <span>Tracking Web Link URL</span>
                                    {(shipmentDrafts[o.id]?.trackingUrl || o.logistics?.trackingUrl) && (
                                      <a
                                        href={shipmentDrafts[o.id]?.trackingUrl || o.logistics?.trackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#C68A2B] hover:underline text-[8px] font-extrabold uppercase tracking-widest flex items-center gap-0.5"
                                      >
                                        Test Link ↗
                                      </a>
                                    )}
                                  </label>
                                  <input
                                    type="url"
                                    value={
                                      shipmentDrafts[o.id]?.trackingUrl !== undefined
                                        ? shipmentDrafts[o.id].trackingUrl
                                        : o.logistics?.trackingUrl || ''
                                    }
                                    onChange={(e) => updateDraftField(o.id, 'trackingUrl', e.target.value)}
                                    placeholder="https://..."
                                    className="bg-[#FDFBF7] border border-[#EDE7D9] text-[#37411A] rounded-xl py-2 px-3 focus:outline-none focus:border-[#4E641A] font-medium"
                                  />
                                </div>

                                <div className="flex flex-col gap-1 text-left col-span-2">
                                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Current Logistics status</label>
                                  <input
                                    type="text"
                                    value={
                                      shipmentDrafts[o.id]?.shipmentStatus !== undefined
                                        ? shipmentDrafts[o.id].shipmentStatus
                                        : o.logistics?.status || ''
                                    }
                                    onChange={(e) => updateDraftField(o.id, 'shipmentStatus', e.target.value)}
                                    placeholder="e.g. Dispatched, In Transit"
                                    className="bg-[#FDFBF7] border border-[#EDE7D9] text-[#37411A] rounded-xl py-2 px-3 focus:outline-none focus:border-[#4E641A] font-medium"
                                  />
                                </div>

                              </div>

                              {/* Form submit/save */}
                              <div className="flex justify-end pt-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveShipmentDetails(o.id)}
                                  disabled={isSavingShipment[o.id]}
                                  className="w-full bg-[#4E641A] hover:bg-[#37411A] text-white text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border-none"
                                >
                                  {isSavingShipment[o.id] ? 'Saving Logistics...' : 'Save Logistics Record'}
                                </button>
                              </div>
                            </div>

                            {/* SECTION C: VISUAL TIMELINE & LOGS (Span 3) */}
                            <div className="md:col-span-3 bg-[#FDFBF7]/30 border border-[#EDE7D9]/60 rounded-[20px] p-5 space-y-4 self-stretch flex flex-col justify-between">
                              <div className="space-y-4">
                                <h4 className="font-serif text-xs font-bold text-[#37411A] border-b pb-2 border-[#EDE7D9] uppercase tracking-wider flex items-center gap-1.5">
                                  <span>🕒</span> Journey Milestones
                                </h4>

                                {isCancelled ? (
                                  <div className="text-center py-4 bg-red-50 rounded-xl border border-red-100 space-y-1">
                                    <span className="text-red-500 font-bold text-sm block">✕ Cancelled</span>
                                    <p className="text-[10px] text-stone-500 font-medium">Order was cancelled and aborted.</p>
                                  </div>
                                ) : (
                                  /* Mini Timeline track */
                                  <div className="space-y-3.5 pl-4 relative border-l border-stone-200 text-xs">
                                    {adminTimelineSteps.map((step, sIdx) => {
                                      const isDone = currentStep >= sIdx;
                                      const isCurrent = currentStep === sIdx;
                                      
                                      return (
                                        <div key={sIdx} className="relative text-left">
                                          {/* Node Dot */}
                                          <div className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full border flex items-center justify-center transition-colors duration-300 ${
                                            isDone ? 'bg-[#4E641A] border-[#4E641A]' : 'bg-white border-stone-300'
                                          } ${isCurrent ? 'ring-2 ring-[#4E641A]/20 scale-110' : ''}`}>
                                            {isCurrent && (
                                              <span className="w-1 h-1 bg-[#C68A2B] rounded-full animate-ping" />
                                            )}
                                          </div>
                                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                                            isCurrent ? 'text-[#C68A2B]' : isDone ? 'text-[#2F3B0C]' : 'text-stone-400'
                                          }`}>
                                            {step.label}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Admin Activity Log timestamps */}
                                <div className="space-y-2 pt-2 border-t border-stone-100 text-left">
                                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 block">Activity Log Records</span>
                                  <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                                    {logs.map((log, lIdx) => (
                                      <div key={lIdx} className="text-[10px] leading-tight space-y-0.5">
                                        <div className="flex justify-between items-baseline gap-2">
                                          <span className="font-bold text-[#37411A] text-[10px] leading-snug">{log.text}</span>
                                          <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-[#4E641A] bg-[#4E641A]/10 px-1 rounded shrink-0">{log.badge}</span>
                                        </div>
                                        <span className="text-[8px] text-stone-400 font-bold block">{log.time}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Customer Communication Panel */}
                              <div className="pt-3 border-t border-stone-100 space-y-2.5 text-left">
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 block">Customer Contacts</span>
                                <div className="space-y-1 text-[10px] text-stone-500 font-medium">
                                  <div className="truncate">Email: <strong className="text-stone-700">{o.user.email}</strong></div>
                                  <div>Phone: <strong className="text-stone-700">{o.shippingAddress?.phone || 'Not provided'}</strong></div>
                                  <div>Latest Alert: <span className="text-[#4E641A] font-bold bg-[#4E641A]/5 border border-[#4E641A]/10 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider inline-block mt-1">Alert Sent ✓</span></div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    alert(`Logistics notification update dispatched to customer via email (${o.user.email}) & SMS Widget.`);
                                  }}
                                  className="w-full py-2 bg-[#EDE7D9] hover:bg-[#EDE7D9]/80 text-[#37411A] text-[9px] font-bold uppercase tracking-widest rounded-lg cursor-pointer transition select-none text-center border-none"
                                >
                                  Send Shipment Update
                                </button>
                              </div>

                            </div>

                          </div>

                          {/* Quick Controls Section Footer */}
                          <div className="border-t border-[#EDE7D9] pt-4 mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            
                            {/* Unified quick status selectors */}
                            <div className="flex flex-wrap gap-4 text-xs font-semibold">
                              <div className="flex items-center gap-2">
                                <span className="text-stone-400 font-semibold text-[10px] uppercase tracking-wider">Logistics:</span>
                                <select
                                  value={o.status}
                                  onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value, o.paymentStatus, o.estimatedDelivery)}
                                  className={`border rounded-xl py-1.5 px-3 focus:outline-none cursor-pointer text-[10.5px] font-bold transition duration-300 ${
                                    o.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                                    o.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                                    o.status === 'PROCESSING' ? 'bg-purple-50 text-purple-700 border-purple-300' :
                                    o.status === 'SHIPPED' ? 'bg-teal-50 text-teal-700 border-teal-300' :
                                    o.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-300' :
                                    o.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-300' :
                                    'bg-cyan-50 text-cyan-700 border-cyan-300'
                                  }`}
                                >
                                  <option value="PENDING">PENDING</option>
                                  <option value="CONFIRMED">CONFIRMED</option>
                                  <option value="PROCESSING">PROCESSING</option>
                                  <option value="SHIPPED">SHIPPED</option>
                                  <option value="IN_TRANSIT">IN TRANSIT</option>
                                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                                  <option value="DELIVERED">DELIVERED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-stone-400 font-semibold text-[10px] uppercase tracking-wider">Payment:</span>
                                <select
                                  value={o.paymentStatus}
                                  onChange={(e) => handleUpdateOrderStatus(o.id, o.status, e.target.value, o.estimatedDelivery)}
                                  className={`border rounded-xl py-1.5 px-3 focus:outline-none cursor-pointer text-[10.5px] font-bold transition duration-300 ${
                                    o.paymentStatus === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-300' :
                                    o.paymentStatus === 'FAILED' ? 'bg-red-50 text-red-700 border-red-300' :
                                    'bg-amber-50 text-amber-700 border-amber-300'
                                  }`}
                                >
                                  <option value="PENDING">PENDING</option>
                                  <option value="COMPLETED">COMPLETED</option>
                                  <option value="FAILED">FAILED</option>
                                  <option value="REFUNDED">REFUNDED</option>
                                </select>
                              </div>
                            </div>

                            {/* Print Invoice, Notify & Quick Complete Actions */}
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                                                            <button
                                type="button"
                                onClick={() => handlePrintBill(o)}
                                className="px-3 py-2 border border-[#EDE7D9] text-stone-650 hover:bg-stone-50 hover:border-[#4E641A]/30 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5 select-none active:scale-95 shadow-xxs"
                              >
                                <FiFileText className="w-3.5 h-3.5 text-[#4E641A]" />
                                <span>Print Bill</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePrintLabel(o)}
                                className="px-3 py-2 border border-[#EDE7D9] text-stone-650 hover:bg-stone-55 hover:border-[#B8833E]/30 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5 select-none active:scale-95 shadow-xxs"
                              >
                                <FiShoppingBag className="w-3.5 h-3.5 text-[#B8833E]" />
                                <span>Print Label</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  alert(`Custom shipment updates alert queued for ${o.user.email}.`);
                                }}
                                className="px-3.5 py-2 border border-[#EDE7D9] text-stone-650 hover:bg-stone-55 text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1 select-none"
                              >
                                🔔 Notify Buyer
                              </button>
                              {logisticsStatus !== 'DELIVERED' && !isCancelled && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await api.put(`/admin/orders/${o.id}/status`, { 
                                        status: 'DELIVERED', 
                                        paymentStatus: 'COMPLETED', 
                                        estimatedDelivery: o.estimatedDelivery 
                                      });
                                      fetchOrders();
                                      fetchAnalytics();
                                      modal.alert('Order Completed', 'Order status marked as DELIVERED.', 'success');
                                    } catch (err) {
                                      modal.alert('Failed', err.message, 'error');
                                    }
                                  }}
                                  className="px-4 py-2 bg-[#4E641A] hover:bg-[#37411A] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1 shadow-sm border-none"
                                >
                                  ✓ Mark Delivered
                                </button>
                              )}
                            </div>

                          </div>
                        </div>
                        )}
                      </div>
                      
                    </div>
                  );
                })
              })()}
            </div>

          </div>
        )}

        {/* TAB 4: CUSTOMERS */}
        {activeTab === 'customers' && (() => {
          // Helper: Compute statistics across all customers
          const getCrmStats = () => {
            let totalCustomers = customers.length;
            let activeCustomers = 0;
            let totalOrders = 0;
            let totalRevenue = 0;

            customers.forEach(c => {
              const ordersCount = c.orders?.length || 0;
              if (ordersCount > 0) activeCustomers++;
              totalOrders += ordersCount;

              const spent = c.orders?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0;
              totalRevenue += spent;
            });

            return { totalCustomers, activeCustomers, totalOrders, totalRevenue };
          };

          // Helper: Get customer segment
          const getCustomerSegment = (c) => {
            const ordersCount = c.orders?.length || 0;
            const totalSpend = c.orders?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0;
            const daysSinceReg = (new Date() - new Date(c.createdAt)) / (1000 * 60 * 60 * 24);

            if (ordersCount >= 5) return 'Loyal';
            if (totalSpend >= 5000) return 'High-Value';
            if (daysSinceReg <= 14) return 'New';
            if (daysSinceReg > 30 && ordersCount === 0) return 'Inactive';
            return 'Standard';
          };

          // Helper: Get segment CSS styles
          const getSegmentStyle = (segment) => {
            switch (segment) {
              case 'Loyal':
                return 'bg-emerald-50 text-emerald-700 border-emerald-250';
              case 'High-Value':
                return 'bg-amber-50 text-amber-700 border-amber-250';
              case 'New':
                return 'bg-blue-50 text-blue-700 border-blue-250';
              case 'Inactive':
                return 'bg-rose-50 text-rose-700 border-rose-250';
              default:
                return 'bg-stone-50 text-stone-600 border-stone-250';
            }
          };

          const stats = getCrmStats();
          
          // Segment counts mapping
          const segmentCounts = {
            all: customers.length,
            new: 0,
            loyal: 0,
            'high-value': 0,
            inactive: 0
          };
          
          customers.forEach(c => {
            const seg = getCustomerSegment(c).toLowerCase();
            if (seg in segmentCounts) {
              segmentCounts[seg]++;
            }
          });

          // Perform filtering & searching
          const filtered = customers.filter(c => {
            const query = crmSearchQuery.toLowerCase().trim();
            const phone = c.addresses?.find(a => a.phone)?.phone || '';
            const matchesSearch = 
              (c.name || '').toLowerCase().includes(query) ||
              (c.email || '').toLowerCase().includes(query) ||
              phone.toLowerCase().includes(query);

            if (!matchesSearch) return false;

            const segment = getCustomerSegment(c).toLowerCase();
            if (crmFilterSegment === 'all') return true;
            return segment === crmFilterSegment;
          });

          return (
            <div className="space-y-8 animate-fade-in w-full text-left relative">
              
              {/* Header section */}
              <div className="pb-6 border-b border-[#EDE7D9] text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#B8833E]">RELATIONSHIP MANAGEMENT</span>
                  <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#37411A]">Customer CRM Panel</h1>
                </div>
                <span className="text-[10px] text-stone-400 font-semibold italic bg-white border border-[#EDE7D9] px-3.5 py-1.5 rounded-full shadow-xxs select-none">
                  Real-time Customer Insights 🌾
                </span>
              </div>

              {/* 1. Summary Analytics cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Customers', value: stats.totalCustomers, icon: '👥', color: 'bg-[#4E641A]/5 text-[#4E641A] border-[#4E641A]/10' },
                  { label: 'Active Customers', value: stats.activeCustomers, icon: '🛒', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { label: 'Revenue Generated', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: '💰', color: 'bg-amber-50 text-amber-700 border-amber-200' }
                ].map((stat, idx) => (
                  <div key={idx} className={`p-5 border rounded-[22px] flex flex-col justify-between shadow-xxs ${stat.color}`}>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest block opacity-85 leading-tight">{stat.label}</span>
                    <div className="flex items-baseline justify-between mt-4">
                      <span className="text-xl md:text-2xl font-bold font-serif">{stat.value}</span>
                      <span className="text-lg select-none">{stat.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. Control Toolbar */}
              <div className="bg-white border border-[#EDE7D9] rounded-[24px] p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                  
                  {/* Search query input */}
                  <div className="relative flex-grow max-w-md">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search Name, Email, or Phone..."
                      value={crmSearchQuery}
                      onChange={(e) => setCrmSearchQuery(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EDE7D9] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#37411A] placeholder-stone-400 focus:outline-none focus:border-[#4E641A] font-medium font-sans"
                    />
                    {crmSearchQuery && (
                      <button 
                        onClick={() => setCrmSearchQuery('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 bg-transparent border-none text-[10px] cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* View Toggles */}
                  <div className="flex items-center gap-1.5 border border-[#EDE7D9] rounded-xl p-1 bg-[#FAF7F2] self-start md:self-auto font-sans">
                    <button
                      onClick={() => setCrmViewMode('card')}
                      className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer select-none ${
                        crmViewMode === 'card' 
                          ? 'bg-[#4E641A] text-white shadow-sm' 
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Card View
                    </button>
                    <button
                      onClick={() => setCrmViewMode('table')}
                      className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer select-none ${
                        crmViewMode === 'table' 
                          ? 'bg-[#4E641A] text-white shadow-sm' 
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Table View
                    </button>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col gap-2 pt-3 border-t border-stone-100 text-xs font-sans">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 w-24 text-left">Segment Filter:</span>
                    {[
                      { id: 'all', label: 'All Customers', count: segmentCounts.all },
                      { id: 'new', label: 'New customers', count: segmentCounts.new },
                      { id: 'loyal', label: 'Loyal customers', count: segmentCounts.loyal },
                      { id: 'high-value', label: 'High-value spenders', count: segmentCounts['high-value'] },
                      { id: 'inactive', label: 'Inactive buyers', count: segmentCounts.inactive }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setCrmFilterSegment(btn.id)}
                        className={`px-3.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition cursor-pointer select-none ${
                          crmFilterSegment === btn.id
                            ? 'bg-[#4E641A] border-[#4E641A] text-white shadow-sm'
                            : 'bg-white border-[#EDE7D9] text-stone-600 hover:bg-[#FAF7F2]'
                        }`}
                      >
                        {btn.label} ({btn.count})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Customer Data Presentation */}
              {filtered.length === 0 ? (
                <EmptyState
                  title="👥 No Matching Customers"
                  description="Try modifying your search or filter segment selection."
                  illustration="👥"
                />
              ) : crmViewMode === 'card' ? (
                /* Card View - Responsive Grid layout */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filtered.map((c) => {
                    const segment = getCustomerSegment(c);
                    const phone = c.addresses?.find(a => a.phone)?.phone || 'No Phone';
                    const ordersCount = c.orders?.length || 0;
                    const totalSpend = c.orders?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0;
                    const lastOrder = c.orders?.[0];
                    const initials = c.name ? c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'SF';

                    return (
                      <div 
                        key={c.id}
                        onClick={() => { setSelectedCrmCustomer(c); setIsCrmDrawerOpen(true); }}
                        className="bg-white border border-[#EDE7D9] rounded-[24px] p-5 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between gap-5 cursor-pointer relative overflow-hidden group text-left"
                      >
                        <div className="space-y-4">
                          {/* Top row: Avatar & Segment badge */}
                          <div className="flex justify-between items-center">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#2F3B0C] to-[#4E641A] flex items-center justify-center text-white font-bold text-xs shadow-sm overflow-hidden shrink-0">
                              {c.avatarUrl ? (
                                <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{initials}</span>
                              )}
                            </div>
                            <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${getSegmentStyle(segment)}`}>
                              {segment}
                            </span>
                          </div>

                          {/* Profile Data */}
                          <div className="space-y-1">
                            <h4 className="font-serif text-sm font-extrabold text-[#37411A] group-hover:text-[#4E641A] transition truncate">{c.name || 'Anonymous User'}</h4>
                            <p className="text-[10px] text-stone-500 font-medium truncate font-sans">{c.email}</p>
                            <p className="text-[10px] text-stone-400 font-sans">{phone}</p>
                          </div>

                          {/* Metrics stats row */}
                          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-stone-100 font-sans">
                            <div className="text-left">
                              <span className="text-[8px] text-stone-400 font-extrabold uppercase tracking-wider block">Orders</span>
                              <strong className="text-xs text-stone-700 font-bold">{ordersCount} Placed</strong>
                            </div>
                            <div className="text-left">
                              <span className="text-[8px] text-stone-400 font-extrabold uppercase tracking-wider block">Total Spend</span>
                              <strong className="text-xs text-primary-green font-bold">₹{totalSpend.toLocaleString('en-IN')}</strong>
                            </div>
                          </div>

                          {/* Dates row */}
                          <div className="text-[9px] font-sans text-stone-400 space-y-0.5 pt-2">
                            <div>Registered: {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                            {lastOrder && (
                              <div className="truncate">Last Order: {new Date(lastOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ({lastOrder.orderNumber})</div>
                            )}
                          </div>
                        </div>

                        {/* Quick actions panel */}
                        <div className="flex gap-1.5 border-t border-stone-100 pt-3.5 mt-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => { setSelectedCrmCustomer(c); setIsCrmDrawerOpen(true); }}
                            className="flex-1 py-2 bg-[#FAF7F2] hover:bg-[#4E641A]/5 text-stone-600 hover:text-[#4E641A] text-[9px] font-bold uppercase tracking-wider rounded-lg transition border border-[#EDE7D9] cursor-pointer"
                          >
                            Profile
                          </button>
                          <button 
                            onClick={() => { setOrderSearchQuery(c.email); setActiveTab('orders'); }}
                            className="flex-1 py-2 bg-[#FAF7F2] hover:bg-[#4E641A]/5 text-stone-600 hover:text-[#4E641A] text-[9px] font-bold uppercase tracking-wider rounded-lg transition border border-[#EDE7D9] cursor-pointer"
                          >
                            Orders
                          </button>
                          {phone !== 'No Phone' && (
                            <>
                              <a 
                                href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg flex items-center justify-center border border-green-200 transition cursor-pointer select-none"
                                title="WhatsApp Customer"
                              >
                                💬
                              </a>
                              <a 
                                href={`tel:${phone}`}
                                className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center border border-blue-200 transition cursor-pointer select-none"
                                title="Call Customer"
                              >
                                📞
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Table View layout */
                <div className="bg-white border border-[#EDE7D9] rounded-[24px] overflow-hidden shadow-sm font-sans text-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#FAF7F2] border-b border-[#EDE7D9] text-stone-400 text-[9px] font-extrabold uppercase tracking-wider">
                          <th className="p-4 pl-6">Customer</th>
                          <th className="p-4">Contact Info</th>
                          <th className="p-4">Registered Date</th>
                          <th className="p-4">Orders Placed</th>
                          <th className="p-4">Total Spend</th>
                          <th className="p-4">Last Order</th>
                          <th className="p-4">Segment</th>
                          <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-600 font-medium">
                        {filtered.map((c) => {
                          const segment = getCustomerSegment(c);
                          const phone = c.addresses?.find(a => a.phone)?.phone || '—';
                          const ordersCount = c.orders?.length || 0;
                          const totalSpend = c.orders?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0;
                          const lastOrder = c.orders?.[0];
                          const initials = c.name ? c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'SF';

                          return (
                            <tr 
                              key={c.id} 
                              className="hover:bg-stone-50/50 cursor-pointer transition"
                              onClick={() => { setSelectedCrmCustomer(c); setIsCrmDrawerOpen(true); }}
                            >
                              <td className="p-4 pl-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2F3B0C] to-[#4E641A] flex items-center justify-center text-white font-bold text-[10px] shadow-sm overflow-hidden shrink-0">
                                  {c.avatarUrl ? (
                                    <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{initials}</span>
                                  )}
                                </div>
                                <span className="font-serif text-stone-850 font-bold hover:text-[#4E641A] transition">{c.name || 'Anonymous User'}</span>
                              </td>
                              <td className="p-4 font-sans text-[11px]">
                                <div className="text-stone-700">{c.email}</div>
                                <div className="text-stone-400 font-normal">{phone}</div>
                              </td>
                              <td className="p-4 text-stone-450 font-normal">
                                {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="p-4 text-stone-700 font-bold">{ordersCount} orders</td>
                              <td className="p-4 text-primary-green font-bold">₹{totalSpend.toLocaleString('en-IN')}</td>
                              <td className="p-4 font-normal text-[11px]">
                                {lastOrder ? (
                                  <div>
                                    <div className="text-stone-750 font-bold">{lastOrder.orderNumber}</div>
                                    <div className="text-stone-400">{new Date(lastOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                                  </div>
                                ) : '—'}
                              </td>
                              <td className="p-4">
                                <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${getSegmentStyle(segment)}`}>
                                  {segment}
                                </span>
                              </td>
                              <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button 
                                    onClick={() => { setSelectedCrmCustomer(c); setIsCrmDrawerOpen(true); }}
                                    className="px-2.5 py-1.5 bg-[#FAF7F2] hover:bg-[#4E641A]/5 text-stone-600 hover:text-[#4E641A] text-[9px] font-bold uppercase tracking-wider rounded border border-[#EDE7D9] transition cursor-pointer select-none"
                                  >
                                    View
                                  </button>
                                  <button 
                                    onClick={() => { setOrderSearchQuery(c.email); setActiveTab('orders'); }}
                                    className="px-2.5 py-1.5 bg-[#FAF7F2] hover:bg-[#4E641A]/5 text-stone-600 hover:text-[#4E641A] text-[9px] font-bold uppercase tracking-wider rounded border border-[#EDE7D9] transition cursor-pointer select-none"
                                  >
                                    Orders
                                  </button>
                                  {phone !== '—' && (
                                    <>
                                      <a 
                                        href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-7 h-7 bg-green-50 hover:bg-green-100 text-green-700 rounded flex items-center justify-center border border-green-200 transition cursor-pointer select-none"
                                        title="WhatsApp Customer"
                                      >
                                        💬
                                      </a>
                                      <a 
                                        href={`tel:${phone}`}
                                        className="w-7 h-7 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded flex items-center justify-center border border-blue-200 transition cursor-pointer select-none"
                                        title="Call Customer"
                                      >
                                        📞
                                      </a>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Side Drawer Overlay for Detailed CRM User Profile */}
              <AnimatePresence>
                {isCrmDrawerOpen && selectedCrmCustomer && (() => {
                  const c = selectedCrmCustomer;
                  const segment = getCustomerSegment(c);
                  const ordersCount = c.orders?.length || 0;
                  const totalSpend = c.orders?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0;
                  const avgOrderValue = ordersCount > 0 ? (totalSpend / ordersCount) : 0;
                  const revenueContribution = stats.totalRevenue > 0 ? ((totalSpend / stats.totalRevenue) * 100) : 0;
                  const phone = c.addresses?.find(a => a.phone)?.phone || 'No Phone';
                  const initials = c.name ? c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'SF';

                  // Timeline events calculation
                  const timeline = [
                    {
                      type: 'registration',
                      title: 'Customer Registered',
                      description: 'Account created in Suryodaya Farms database.',
                      date: new Date(c.createdAt)
                    },
                    ...(c.orders || []).map(o => ({
                      type: 'order',
                      title: `Order Placed: ${o.orderNumber}`,
                      description: `Ordered native staples worth ₹${o.totalAmount.toLocaleString('en-IN')}. Status: ${o.status}.`,
                      date: new Date(o.createdAt)
                    }))
                  ].sort((a, b) => b.date - a.date);

                  return (
                    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end font-sans">
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCrmDrawerOpen(false)}
                        className="absolute inset-0 bg-stone-900/50 cursor-pointer"
                      />

                      {/* Drawer Panel */}
                      <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-lg bg-[#FAF7F2] border-l border-[#EDE7D9] h-full shadow-2xl p-6 overflow-y-auto flex flex-col gap-6"
                      >
                        {/* Drawer Close & Header */}
                        <div className="flex justify-between items-start border-b border-[#EDE7D9] pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#2F3B0C] to-[#4E641A] flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden shrink-0">
                              {c.avatarUrl ? (
                                <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{initials}</span>
                              )}
                            </div>
                            <div>
                              <h3 className="font-serif text-base font-extrabold text-[#2F3B0C] flex items-center gap-2">
                                <span>{c.name || 'Anonymous User'}</span>
                                <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded border ${getSegmentStyle(segment)}`}>
                                  {segment}
                                </span>
                              </h3>
                              <p className="text-[10px] text-stone-500 font-medium font-sans mt-0.5">{c.email}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setIsCrmDrawerOpen(false)}
                            className="p-1.5 hover:bg-stone-200/50 text-stone-400 hover:text-stone-700 rounded-lg transition border-none bg-transparent cursor-pointer font-bold text-sm"
                          >
                            ✕
                          </button>
                        </div>

                        {/* General Coordinates */}
                        <div className="space-y-2">
                          <span className="text-[8px] font-extrabold text-[#B8833E] tracking-widest uppercase block">Personal Profile</span>
                          <div className="grid grid-cols-2 gap-4 bg-white border border-[#EDE7D9] rounded-2xl p-4 shadow-xxs text-xs">
                            <div className="space-y-0.5">
                              <span className="text-[8px] text-stone-400 uppercase block font-extrabold">Registered On</span>
                              <strong className="text-stone-750 font-bold">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[8px] text-stone-400 uppercase block font-extrabold">Primary Mobile</span>
                              <strong className="text-stone-750 font-bold">{phone}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Financial Contributions */}
                        <div className="space-y-2">
                          <span className="text-[8px] font-extrabold text-[#B8833E] tracking-widest uppercase block">Financial Contribution</span>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-[#4E641A]/5 border border-[#4E641A]/10 rounded-2xl p-3.5 text-center">
                              <span className="text-[7.5px] text-stone-400 uppercase block font-extrabold tracking-wider leading-none">Total Spend</span>
                              <strong className="text-base text-primary-green font-bold block mt-1.5">₹{totalSpend.toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="bg-[#4E641A]/5 border border-[#4E641A]/10 rounded-2xl p-3.5 text-center">
                              <span className="text-[7.5px] text-stone-400 uppercase block font-extrabold tracking-wider leading-none">Avg Order Val</span>
                              <strong className="text-base text-stone-800 font-bold block mt-1.5">₹{Math.round(avgOrderValue).toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="bg-[#4E641A]/5 border border-[#4E641A]/10 rounded-2xl p-3.5 text-center">
                              <span className="text-[7.5px] text-stone-400 uppercase block font-extrabold tracking-wider leading-none">Revenue Portion</span>
                              <strong className="text-base text-[#B8833E] font-bold block mt-1.5">{revenueContribution.toFixed(1)}%</strong>
                            </div>
                          </div>
                        </div>

                        {/* Saved Addresses list */}
                        <div className="space-y-2">
                          <span className="text-[8px] font-extrabold text-[#B8833E] tracking-widest uppercase block">Registered Addresses ({c.addresses?.length || 0})</span>
                          {c.addresses && c.addresses.length > 0 ? (
                            <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto no-scrollbar">
                              {c.addresses.map((addr) => (
                                <div key={addr.id} className="bg-white border border-[#EDE7D9] rounded-xl p-3 flex flex-col gap-1 shadow-xxs text-[11px]">
                                  <div className="flex items-center gap-1.5">
                                    <strong className="font-serif text-stone-750 font-bold">{addr.title}</strong>
                                    {addr.isDefault && <span className="text-[7px] font-extrabold bg-[#4E641A]/10 text-[#4E641A] px-1.5 py-0.5 rounded">Primary</span>}
                                  </div>
                                  <p className="text-stone-600 leading-relaxed font-light font-sans text-[10px]">
                                    {addr.recipientName} • {addr.phone} <br />
                                    {addr.street}, {addr.city}, {addr.state} – {addr.postalCode}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-stone-400 italic">No coordinates saved.</p>
                          )}
                        </div>

                        {/* Order Logs */}
                        <div className="space-y-2">
                          <span className="text-[8px] font-extrabold text-[#B8833E] tracking-widest uppercase block">Complete Purchase Logs ({ordersCount})</span>
                          {c.orders && c.orders.length > 0 ? (
                            <div className="flex flex-col gap-2.5 max-h-[180px] overflow-y-auto pr-1">
                              {c.orders.map((o) => (
                                <div key={o.id} className="bg-white border border-[#EDE7D9] rounded-xl p-3.5 shadow-xxs flex flex-col gap-2.5 text-[11px] font-sans">
                                  <div className="flex justify-between items-center pb-1.5 border-b border-stone-100">
                                    <div>
                                      <strong className="text-stone-850 font-serif font-bold text-xs">{o.orderNumber}</strong>
                                      <span className="text-[8.5px] text-stone-400 font-light block mt-0.5">
                                        {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </span>
                                    </div>
                                    <span className={`text-[7.5px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${
                                      o.status === 'DELIVERED' 
                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                        : o.status === 'CANCELLED' 
                                          ? 'bg-red-50 text-red-750 border-red-200' 
                                          : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                      {o.status}
                                    </span>
                                  </div>
                                  
                                  {/* Order Items */}
                                  <div className="flex flex-col gap-1 pl-0.5 text-[10px] font-light text-stone-500">
                                    {o.orderItems?.map(item => (
                                      <div key={item.id} className="flex justify-between">
                                        <span>{item.product?.name} {item.variant ? `(${item.variant.name})` : ''} <strong className="text-stone-700 font-bold">x{item.quantity}</strong></span>
                                        <span className="font-medium text-stone-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="flex justify-between items-center pt-1.5 border-t border-stone-100">
                                    <span className="text-[8.5px] font-bold text-stone-400 uppercase tracking-wide">Paid Amount</span>
                                    <strong className="text-[11px] text-primary-green font-bold">₹{o.totalAmount.toLocaleString('en-IN')}</strong>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-stone-400 italic">No shipments logs recorded.</p>
                          )}
                        </div>

                        {/* CRM Activity logs timeline */}
                        <div className="space-y-2">
                          <span className="text-[8px] font-extrabold text-[#B8833E] tracking-widest uppercase block">CRM Activity Log</span>
                          <div className="border-l border-stone-200 pl-4 space-y-3.5 text-left pt-1">
                            {timeline.map((event, idx) => (
                              <div key={idx} className="relative">
                                <div className={`absolute -left-[20.5px] top-0.5 w-3 h-3 rounded-full border bg-white flex items-center justify-center shrink-0 ${
                                  event.type === 'registration' 
                                    ? 'border-blue-500 text-blue-500' 
                                    : 'border-green-600 text-green-600'
                                }`}>
                                  <span className="text-[5px]">●</span>
                                </div>
                                <div className="space-y-0.5 pl-0.5 text-[11px]">
                                  <strong className="text-[10px] text-stone-850 font-bold block leading-none">{event.title}</strong>
                                  <p className="text-[9.5px] text-stone-500 font-light leading-relaxed">{event.description}</p>
                                  <span className="text-[8px] text-stone-400 font-light block pt-0.5">
                                    {event.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at {event.date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </motion.div>
                    </div>
                  );
                })()}
              </AnimatePresence>

            </div>
          );
        })()}

        {/* TAB 5: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-8 animate-fade-in w-full text-left">
            
            {/* Category creation / edit form (Rendered globally inside categories tab) */}
            {showCategoryModal && (
              <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-md animate-scale-up">
                <h3 className="font-serif text-lg font-bold text-[#B8833E] mb-5">{categoryForm.id ? 'Modify Category Details' : 'Create New Category'}</h3>
                <form noValidate onSubmit={handleSaveCategory} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-500">
                  
                  <div className="flex flex-col gap-1 text-left col-span-2 sm:col-span-1">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Category Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Traditional Wellness" 
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                      required
                    />
                    {categoryFormErrors.name && (
                      <span className="text-[10px] text-red-650 font-bold block mt-1 select-none">
                        ⚠️ {categoryFormErrors.name}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 text-left col-span-2 sm:col-span-1">
                    <UnifiedUploader
                      value={categoryForm.image}
                      onChange={(url) => setCategoryForm({ ...categoryForm, image: url })}
                      label="Banner Image"
                      aspectRatio={4/3}
                      folder="categories"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left col-span-2 sm:col-span-1">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">SEO Title Tag</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Traditional Gir Cow Desi Ghee | Suryodaya Farms" 
                      value={categoryForm.seoTitle || ''}
                      onChange={(e) => setCategoryForm({ ...categoryForm, seoTitle: e.target.value })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left col-span-2 sm:col-span-1">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">SEO Meta Description</label>
                    <input 
                      type="text" 
                      placeholder="Traditional, wood-fired slow churned ghee..." 
                      value={categoryForm.seoDescription || ''}
                      onChange={(e) => setCategoryForm({ ...categoryForm, seoDescription: e.target.value })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                    />
                  </div>

                  <div className="col-span-2 flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Description</label>
                    <textarea 
                      placeholder="Describe this product collection parameters..." 
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] h-16 resize-none font-sans text-[#37411A]"
                    />
                  </div>

                  {/* Visibility & Showcase Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-2 bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl p-4 shadow-xxs text-left font-sans text-stone-500">
                    <div className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        id="cat-isVisible"
                        checked={categoryForm.isVisible}
                        onChange={(e) => setCategoryForm({ ...categoryForm, isVisible: e.target.checked })}
                        className="w-4 h-4 mt-0.5 text-[#4E641A] border-[#EDE7D9] rounded focus:ring-[#4E641A] cursor-pointer accent-[#4E641A]"
                      />
                      <div className="flex flex-col leading-tight">
                        <label htmlFor="cat-isVisible" className="text-[9px] font-extrabold uppercase text-[#37411A] tracking-wider cursor-pointer">Visible in Catalog</label>
                        <span className="text-[8px] text-stone-400 mt-0.5">Show this collection in listings.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        id="cat-homepageVisible"
                        checked={categoryForm.homepageVisible}
                        onChange={(e) => setCategoryForm({ ...categoryForm, homepageVisible: e.target.checked })}
                        className="w-4 h-4 mt-0.5 text-[#4E641A] border-[#EDE7D9] rounded focus:ring-[#4E641A] cursor-pointer accent-[#4E641A]"
                      />
                      <div className="flex flex-col leading-tight">
                        <label htmlFor="cat-homepageVisible" className="text-[9px] font-extrabold uppercase text-[#37411A] tracking-wider cursor-pointer">Show on Homepage</label>
                        <span className="text-[8px] text-stone-400 mt-0.5">Display on homepage showcase.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        id="cat-isFeatured"
                        checked={categoryForm.isFeatured}
                        onChange={(e) => setCategoryForm({ ...categoryForm, isFeatured: e.target.checked })}
                        className="w-4 h-4 mt-0.5 text-[#4E641A] border-[#EDE7D9] rounded focus:ring-[#4E641A] cursor-pointer accent-[#4E641A]"
                      />
                      <div className="flex flex-col leading-tight">
                        <label htmlFor="cat-isFeatured" className="text-[9px] font-extrabold uppercase text-[#37411A] tracking-wider cursor-pointer">Featured Category</label>
                        <span className="text-[8px] text-stone-400 mt-0.5">Flag with custom badge identifier.</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => { setShowCategoryModal(false); setCategoryForm({ id: '', name: '', description: '', image: '', seoTitle: '', seoDescription: '', isVisible: true, homepageVisible: true, isFeatured: false }); }}
                      className="px-5 py-3 rounded-xl border border-stone-200 text-stone-400 hover:bg-stone-50 uppercase font-bold tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isGlobalLoading}
                      className="px-6 py-3 bg-[#4E641A] hover:bg-[#37411A] disabled:bg-stone-300 text-white rounded-xl uppercase font-bold tracking-wider cursor-pointer border-none"
                    >
                      {isGlobalLoading ? 'Saving...' : 'Save Category'}
                    </button>
                  </div>

                </form>
              </div>
            )}

            {selectedCategoryId && categoryDetails ? (
              // CATEGORY DETAIL PAGE VIEW
              <div className="space-y-8 animate-scale-up text-left">
                {/* 1. Header with Breadcrumbs and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EDE7D9]">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-[9px] font-extrabold tracking-widest uppercase text-stone-400">
                      <span className="cursor-pointer hover:text-[#4E641A]" onClick={() => setSelectedCategoryId(null)}>CATEGORIES</span>
                      <span>/</span>
                      <span className="text-[#B8833E]">{categoryDetails.name}</span>
                    </div>
                    <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#37411A] flex items-center space-x-2">
                      <span>{categoryDetails.name}</span>
                      <span className="text-xs bg-[#4E641A]/10 text-[#4E641A] border border-[#4E641A]/20 px-2 py-0.5 rounded-full font-sans font-bold">
                        {categoryDetails.products?.length || 0} Products
                      </span>
                    </h1>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleDeleteCategory(categoryDetails.id)}
                      className="px-4 py-2 border border-red-200 text-red-650 hover:bg-red-50 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center space-x-1.5 cursor-pointer bg-white"
                    >
                      <FiTrash2 size={12} className="text-red-500" />
                      <span className="text-red-600">Delete</span>
                    </button>

                    <button
                      onClick={() => {
                        setCategoryForm({
                          id: categoryDetails.id,
                          name: categoryDetails.name,
                          description: categoryDetails.description || '',
                          image: categoryDetails.image || '',
                          seoTitle: categoryDetails.seoTitle || '',
                          seoDescription: categoryDetails.seoDescription || '',
                          isVisible: categoryDetails.isVisible !== undefined ? categoryDetails.isVisible : true,
                          homepageVisible: categoryDetails.homepageVisible !== undefined ? categoryDetails.homepageVisible : true,
                          isFeatured: categoryDetails.isFeatured !== undefined ? categoryDetails.isFeatured : false
                        });
                        setShowCategoryModal(true);
                        scrollToTop();
                      }}
                      className="px-4 py-2 border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center space-x-1.5 cursor-pointer bg-white"
                    >
                      <FiEdit2 size={12} />
                      <span>Edit Category</span>
                    </button>

                    <button
                      onClick={() => {
                        fetchAllAdminProducts();
                        setSelectedProductIdsToAssign([]);
                        setShowAssignModal(true);
                      }}
                      className="px-5 py-2.5 bg-[#4E641A] hover:bg-[#37411A] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center space-x-1.5 shadow border-none cursor-pointer"
                    >
                      <FiPlus />
                      <span>Assign Products</span>
                    </button>

                    <button
                      onClick={() => setSelectedCategoryId(null)}
                      className="px-4 py-2 border border-stone-200 text-stone-500 hover:bg-stone-50 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer bg-white"
                    >
                      Back
                    </button>
                  </div>
                </div>

                {/* 2. Banner & SEO Settings Cards */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Banner */}
                  <div className="md:col-span-8 relative h-48 rounded-[28px] overflow-hidden border border-[#EDE7D9] bg-gradient-to-br from-[#EDE7D9]/60 to-[#FDFBF7]">
                    {categoryDetails.image ? (
                      <img src={categoryDetails.image} alt={categoryDetails.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-6">
                      <div className="text-white space-y-1">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/70">Category Banner & Slug</span>
                        <p className="text-sm font-semibold tracking-wider">slug: {categoryDetails.slug}</p>
                      </div>
                    </div>
                  </div>

                  {/* SEO Card */}
                  <div className="md:col-span-4 bg-white border border-[#EDE7D9] rounded-[28px] p-5 flex flex-col justify-between shadow-sm">
                    <div className="space-y-2">
                      <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#B8833E]">SEO Search Metadata</span>
                      <h4 className="font-serif text-sm font-bold text-[#37411A] truncate">
                        {categoryDetails.seoTitle || `${categoryDetails.name} | Suryodaya Farms`}
                      </h4>
                      <p className="text-[10px] text-stone-400 leading-normal line-clamp-3">
                        {categoryDetails.seoDescription || categoryDetails.description || 'Provide a compelling meta description to rank higher in searches.'}
                      </p>
                    </div>
                    <div className="text-[8px] font-extrabold tracking-widest uppercase text-stone-400 pt-3 border-t border-stone-100 mt-2">
                      Dynamic Meta Config
                    </div>
                  </div>
                </div>

                {/* 3. Description Block */}
                <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-sm">
                  <span className="text-[9px] font-extrabold tracking-widest uppercase text-stone-400 block mb-1">Collection Bio</span>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans font-light">
                    {categoryDetails.description || "Describe this product collection's traditional harvesting, processing parameters, and farm origin details."}
                  </p>
                </div>

                {/* 4. Products Search Filter */}
                <div className="flex justify-between items-center bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl px-4 py-2 max-w-md">
                  <FiSearch className="text-stone-450 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search assigned products by title or SKU..."
                    value={categoryProductSearchQuery}
                    onChange={(e) => setCategoryProductSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none text-xs text-[#37411A] placeholder-stone-400 py-1.5"
                  />
                </div>

                {/* 5. Assigned Products Grid */}
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#37411A]">Products Linked to Category</h3>
                  
                  {categoryDetails.products && categoryDetails.products.filter(prod => {
                    const term = categoryProductSearchQuery.toLowerCase();
                    return prod.name.toLowerCase().includes(term) || (prod.sku && prod.sku.toLowerCase().includes(term));
                  }).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {categoryDetails.products.filter(prod => {
                        const term = categoryProductSearchQuery.toLowerCase();
                        return prod.name.toLowerCase().includes(term) || (prod.sku && prod.sku.toLowerCase().includes(term));
                      }).map((prod) => (
                        <div key={prod.id} className="bg-white border border-[#EDE7D9] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm hover:border-[#B8833E]/20 transition group">
                          <div className="flex gap-4 items-center min-w-0">
                            <img 
                              src={prod.images?.length > 0 ? prod.images[0].url : prod.image} 
                              alt={prod.name} 
                              className="w-14 h-14 object-cover rounded-xl border border-[#EDE7D9] bg-stone-50 shrink-0"
                            />
                            <div className="flex flex-col text-left min-w-0">
                              <h4 className="font-serif text-sm font-bold truncate text-[#37411A] group-hover:text-[#B8833E] transition">{prod.name}</h4>
                              <p className="text-[10px] text-stone-400 font-semibold mt-0.5 flex items-center space-x-1.5">
                                <span>SKU: {prod.sku}</span>
                                <span>•</span>
                                <span>Stock: <span className={prod.inventory > 0 ? 'text-[#4E641A] font-bold' : 'text-red-500 font-bold'}>{prod.inventory} units</span></span>
                                {prod.isFeatured && (
                                  <>
                                    <span>•</span>
                                    <span className="bg-[#B8833E]/10 text-[#B8833E] border border-[#B8833E]/20 px-1.5 py-0.5 rounded text-[8px] font-bold">FEATURED</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <strong className="text-[#4E641A] font-serif text-sm font-bold">₹{prod.price}</strong>
                            <button
                              onClick={() => handleRemoveProductFromCategory(prod.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer bg-transparent border-none flex items-center justify-center"
                              title="Remove Product"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // EMPTY STATE
                    <div className="h-64 bg-white border border-[#EDE7D9] rounded-[28px] flex flex-col items-center justify-center p-6 text-center space-y-4 shadow-sm">
                      <div className="w-16 h-16 rounded-full bg-[#FDFBF7] border border-[#EDE7D9] flex items-center justify-center text-2xl shadow-inner">
                        🚜
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif text-sm font-bold text-[#37411A]">No products linked yet</h4>
                        <p className="text-[11px] text-stone-400 font-light max-w-xs leading-normal">
                          This collection page is empty on the storefront. Assign dynamic products to populate this category.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          fetchAllAdminProducts();
                          setSelectedProductIdsToAssign([]);
                          setShowAssignModal(true);
                        }}
                        className="px-5 py-2.5 bg-[#4E641A] hover:bg-[#37411A] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition shadow border-none cursor-pointer select-none"
                      >
                        Assign Products
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // GENERAL CATEGORIES LIST VIEW
              <div className="space-y-8 animate-fade-in w-full text-left">
                
                {/* Header Block */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EDE7D9]">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#B8833E]">COLLECTIONS SETTINGS</span>
                    <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#37411A]">Homepage Categories</h1>
                  </div>
                  <button
                    onClick={() => {
                      setCategoryForm({ id: '', name: '', description: '', image: '', seoTitle: '', seoDescription: '', isVisible: true, homepageVisible: true, isFeatured: false });
                      setShowCategoryModal(true);
                      scrollToTop();
                    }}
                    className="px-5 py-3 bg-[#4E641A] hover:bg-[#37411A] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center space-x-1.5 shadow border-none cursor-pointer select-none"
                  >
                    <FiPlus />
                    <span>Create Category</span>
                  </button>
                </div>

                {/* 1. Analytics Cards Panel */}
                {(() => {
                  const totalCategoriesCount = categories.length;
                  const totalProductsCount = products.length;
                  
                  let largestCollectionName = 'None';
                  let largestCollectionCount = 0;
                  categories.forEach(c => {
                    const count = c._count?.products || 0;
                    if (count > largestCollectionCount) {
                      largestCollectionCount = count;
                      largestCollectionName = c.name;
                    }
                  });
                  const largestCollectionDisplay = largestCollectionCount > 0 
                    ? `${largestCollectionName} (${largestCollectionCount} Items)`
                    : 'None';
                    
                  const homepageActiveCollectionsCount = categories.filter(c => c.homepageVisible).length;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      <div className="bg-[#FAF7F2] border border-[#EDE7D9] rounded-2xl p-5 flex items-center gap-4 shadow-xxs">
                        <div className="w-12 h-12 rounded-xl bg-[#4E641A]/10 flex items-center justify-center text-[#4E641A] text-xl">
                          🏷️
                        </div>
                        <div className="text-left">
                          <span className="block text-[8px] font-extrabold uppercase tracking-widest text-[#B8833E]">Total Categories</span>
                          <span className="font-serif text-xl font-extrabold text-[#2F3B0C] leading-tight block mt-1">{totalCategoriesCount}</span>
                        </div>
                      </div>
                      
                      <div className="bg-[#FAF7F2] border border-[#EDE7D9] rounded-2xl p-5 flex items-center gap-4 shadow-xxs">
                        <div className="w-12 h-12 rounded-xl bg-[#4E641A]/10 flex items-center justify-center text-[#4E641A] text-xl">
                          🌾
                        </div>
                        <div className="text-left">
                          <span className="block text-[8px] font-extrabold uppercase tracking-widest text-[#B8833E]">Catalog Products</span>
                          <span className="font-serif text-xl font-extrabold text-[#2F3B0C] leading-tight block mt-1">{totalProductsCount}</span>
                        </div>
                      </div>

                      <div className="bg-[#FAF7F2] border border-[#EDE7D9] rounded-2xl p-5 flex items-center gap-4 shadow-xxs col-span-1">
                        <div className="w-12 h-12 rounded-xl bg-[#4E641A]/10 flex items-center justify-center text-[#4E641A] text-xl">
                          📈
                        </div>
                        <div className="text-left min-w-0">
                          <span className="block text-[8px] font-extrabold uppercase tracking-widest text-[#B8833E]">Largest Collection</span>
                          <span className="font-serif text-xs font-extrabold text-[#2F3B0C] truncate leading-tight block mt-1.5" title={largestCollectionDisplay}>
                            {largestCollectionDisplay}
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#FAF7F2] border border-[#EDE7D9] rounded-2xl p-5 flex items-center gap-4 shadow-xxs">
                        <div className="w-12 h-12 rounded-xl bg-[#4E641A]/10 flex items-center justify-center text-[#4E641A] text-xl">
                          🏠
                        </div>
                        <div className="text-left">
                          <span className="block text-[8px] font-extrabold uppercase tracking-widest text-[#B8833E]">Homepage Active</span>
                          <span className="font-serif text-xl font-extrabold text-[#2F3B0C] leading-tight block mt-1">{homepageActiveCollectionsCount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Search, Filter & Sort Controls Panel */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch bg-white border border-[#EDE7D9] p-4 rounded-2xl shadow-xxs">
                  <div className="flex items-center bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl px-4 py-2 flex-1 min-w-[280px]">
                    <FiSearch className="text-stone-400 mr-2.5 shrink-0" size={14} />
                    <input
                      type="text"
                      placeholder="Search collections by name or description..."
                      value={catSearchQuery}
                      onChange={(e) => setCatSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-none focus:outline-none text-xs text-[#37411A] placeholder-stone-400 py-1"
                    />
                    {catSearchQuery && (
                      <button onClick={() => setCatSearchQuery('')} className="text-stone-400 hover:text-stone-700 font-bold text-xs bg-transparent border-none cursor-pointer">✕</button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-col gap-0.5 text-left">
                      <label className="text-[7.5px] font-extrabold uppercase tracking-wider text-stone-400 px-1">Homepage Showcase</label>
                      <select
                        value={catHomepageFilter}
                        onChange={(e) => setCatHomepageFilter(e.target.value)}
                        className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-2 px-3 text-xs text-[#37411A] font-semibold focus:outline-none focus:border-[#4E641A] cursor-pointer"
                      >
                        <option value="all">All Visibility</option>
                        <option value="visible">Active on Home</option>
                        <option value="hidden">Hidden from Home</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-0.5 text-left">
                      <label className="text-[7.5px] font-extrabold uppercase tracking-wider text-stone-400 px-1">Collection Size</label>
                      <select
                        value={catSizeFilter}
                        onChange={(e) => setCatSizeFilter(e.target.value)}
                        className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-2 px-3 text-xs text-[#37411A] font-semibold focus:outline-none focus:border-[#4E641A] cursor-pointer"
                      >
                        <option value="all">All Sizes</option>
                        <option value="active">Active (1+ Items)</option>
                        <option value="empty">Empty Collections</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-0.5 text-left">
                      <label className="text-[7.5px] font-extrabold uppercase tracking-wider text-stone-400 px-1">Sort By</label>
                      <select
                        value={catSortBy}
                        onChange={(e) => setCatSortBy(e.target.value)}
                        className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-2 px-3 text-xs text-[#37411A] font-semibold focus:outline-none focus:border-[#4E641A] cursor-pointer"
                      >
                        <option value="name-asc">Name: A-Z</option>
                        <option value="name-desc">Name: Z-A</option>
                        <option value="products-desc">Size: High to Low</option>
                        <option value="products-asc">Size: Low to High</option>
                        <option value="updated-desc">Recently Updated</option>
                        <option value="updated-asc">Oldest Updated</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Collection Showcase Cards Grid */}
                {(() => {
                  const filteredCategories = categories
                    .filter(c => c.slug?.toLowerCase() !== 'uncategorized' && c.name?.toLowerCase() !== 'uncategorized')
                    .filter(c => {
                      const query = catSearchQuery.toLowerCase();
                      const nameMatch = c.name?.toLowerCase().includes(query);
                      const descMatch = c.description?.toLowerCase().includes(query);
                      if (!nameMatch && !descMatch) return false;
                      
                      if (catHomepageFilter === 'visible' && !c.homepageVisible) return false;
                      if (catHomepageFilter === 'hidden' && c.homepageVisible) return false;
                      
                      const size = c._count?.products || 0;
                      if (catSizeFilter === 'active' && size === 0) return false;
                      if (catSizeFilter === 'empty' && size > 0) return false;
                      
                      return true;
                    })
                    .sort((a, b) => {
                      if (catSortBy === 'name-asc') return a.name.localeCompare(b.name);
                      if (catSortBy === 'name-desc') return b.name.localeCompare(a.name);
                      if (catSortBy === 'products-desc') return (b._count?.products || 0) - (a._count?.products || 0);
                      if (catSortBy === 'products-asc') return (a._count?.products || 0) - (b._count?.products || 0);
                      if (catSortBy === 'updated-desc') return new Date(b.updatedAt) - new Date(a.updatedAt);
                      if (catSortBy === 'updated-asc') return new Date(a.updatedAt) - new Date(b.updatedAt);
                      return 0;
                    });

                  if (filteredCategories.length === 0) {
                    return (
                      <EmptyState
                        title="🏷️ No Matching Collections Found"
                        description="Try refining your search queries or filter selections."
                        illustration="🏷️"
                        actionLabel="Clear Search"
                        onAction={() => {
                          setCatSearchQuery('');
                          setCatHomepageFilter('all');
                          setCatSizeFilter('all');
                          setCatSortBy('name-asc');
                        }}
                      />
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left">
                      {filteredCategories.map((cat) => {
                        const productCount = cat._count?.products || 0;
                        const formattedDate = new Date(cat.updatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        });

                        return (
                          <div 
                            key={cat.id} 
                            className="bg-[#FAF7F2] border border-[#EDE7D9] rounded-2xl overflow-hidden shadow-xxs hover:shadow-sm hover:border-[#4E641A]/30 transition duration-300 flex flex-col group"
                          >
                            {/* Card Poster Image Banner */}
                            <div 
                              onClick={() => setSelectedCategoryId(cat.id)}
                              className="h-44 w-full relative overflow-hidden bg-gradient-to-br from-[#EDE7D9]/60 to-[#FDFBF7] cursor-pointer select-none"
                            >
                              {cat.image ? (
                                <img 
                                  src={cat.image} 
                                  alt={cat.name} 
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-tr from-[#2F3B0C]/10 to-[#4E641A]/10 text-[#4E641A]">🌿</div>
                              )}
                              {/* Overlay darkness gradient */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                              
                              {/* Left Badge: Homepage Showcase inline Toggle */}
                              <div className="absolute top-3.5 left-3.5 z-20">
                                {cat.homepageVisible ? (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleToggleHomepageVisible(cat); }}
                                    className="bg-[#4E641A] hover:bg-[#37411A] text-white border border-[#4E641A]/30 text-[8px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full cursor-pointer transition select-none flex items-center gap-1 shadow-sm leading-none"
                                    title="Click to hide from Homepage"
                                  >
                                    <span>🏠 Active Home</span>
                                  </button>
                                ) : (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleToggleHomepageVisible(cat); }}
                                    className="bg-stone-700/80 hover:bg-stone-850 text-white border border-stone-600/30 text-[8px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full cursor-pointer transition select-none flex items-center gap-1 shadow-sm leading-none"
                                    title="Click to showcase on Homepage"
                                  >
                                    <span>✕ Hidden Home</span>
                                  </button>
                                )}
                              </div>

                              {/* Right Badge: General Visibility Icon */}
                              <div className="absolute top-3.5 right-3.5 z-20 flex gap-1.5">
                                {cat.isFeatured && (
                                  <span className="bg-[#B8833E] text-white text-[7.5px] font-extrabold uppercase tracking-widest px-2 py-1 rounded shadow-sm leading-none">
                                    ★ Featured
                                  </span>
                                )}
                                {cat.isVisible ? (
                                  <span 
                                    className="bg-white/85 text-[#4E641A] p-1.5 rounded-lg border border-[#EDE7D9] flex items-center justify-center shadow-sm" 
                                    title="Visible in Catalog"
                                  >
                                    <FiEye size={12} />
                                  </span>
                                ) : (
                                  <span 
                                    className="bg-red-50/90 text-red-655 p-1.5 rounded-lg border border-red-200/50 flex items-center justify-center shadow-sm" 
                                    title="Hidden from Catalog"
                                  >
                                    <FiEyeOff size={12} />
                                  </span>
                                )}
                              </div>

                              {/* Items Count overlay bottom right */}
                              <div className="absolute bottom-3 right-3 z-20">
                                <span className="bg-white/90 backdrop-blur-xxs text-[#37411A] text-[8px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg shadow-xxs border border-[#EDE7D9]/50">
                                  {productCount} linked {productCount === 1 ? 'item' : 'items'}
                                </span>
                              </div>
                            </div>

                            {/* Card Details Body */}
                            <div className="p-4.5 flex-grow flex flex-col justify-between gap-3 text-left border-x border-b border-[#EDE7D9] bg-white rounded-b-2xl">
                              <div className="space-y-1">
                                <h3 
                                  onClick={() => setSelectedCategoryId(cat.id)}
                                  className="font-serif text-base font-extrabold text-[#2F3B0C] hover:text-[#4E641A] cursor-pointer transition truncate leading-snug"
                                >
                                  {cat.name}
                                </h3>
                                <p className="text-[10px] text-stone-500 font-sans line-clamp-2 leading-relaxed min-h-[30px] font-light">
                                  {cat.description || 'Harvested directly from chemical-free organic farming soils.'}
                                </p>
                              </div>

                              {/* Footer Meta info */}
                              <div className="flex justify-between items-center pt-2.5 border-t border-[#EDE7D9]/50 text-[9px] text-stone-400 font-sans font-medium">
                                <span>Slug: <span className="font-mono text-stone-650">{cat.slug}</span></span>
                                <span>Updated: {formattedDate}</span>
                              </div>

                              {/* Action buttons list */}
                              <div className="grid grid-cols-5 gap-1.5 pt-1.5 text-[8.5px] font-extrabold uppercase tracking-wider">
                                <button
                                  onClick={() => {
                                    setCategoryForm({
                                      id: cat.id,
                                      name: cat.name,
                                      description: cat.description || '',
                                      image: cat.image || '',
                                      seoTitle: cat.seoTitle || '',
                                      seoDescription: cat.seoDescription || '',
                                      isVisible: cat.isVisible !== undefined ? cat.isVisible : true,
                                      homepageVisible: cat.homepageVisible !== undefined ? cat.homepageVisible : true,
                                      isFeatured: cat.isFeatured !== undefined ? cat.isFeatured : false
                                    });
                                    setShowCategoryModal(true);
                                    scrollToTop();
                                  }}
                                  className="py-1.5 bg-[#FAF7F2] hover:bg-[#EDE7D9] text-[#2F3B0C] border border-[#EDE7D9] rounded-lg transition cursor-pointer select-none"
                                  title="Edit Collection"
                                >
                                  Edit
                                </button>
                                
                                <button
                                  onClick={() => setActivePreviewCategory(cat)}
                                  className="py-1.5 bg-[#FAF7F2] hover:bg-[#EDE7D9] text-[#2F3B0C] border border-[#EDE7D9] rounded-lg transition cursor-pointer select-none"
                                  title="Preview Collection Page"
                                >
                                  Preview
                                </button>

                                <button
                                  onClick={() => setSelectedCategoryId(cat.id)}
                                  className="py-1.5 bg-[#FAF7F2] hover:bg-[#EDE7D9] text-[#2F3B0C] border border-[#EDE7D9] rounded-lg transition cursor-pointer select-none col-span-1"
                                  title="View Assigned Products"
                                >
                                  Products
                                </button>

                                <button
                                  onClick={() => setActiveAnalyticsCategory(cat)}
                                  className="py-1.5 bg-[#FAF7F2] hover:bg-[#EDE7D9] text-[#B8833E] border border-[#EDE7D9] rounded-lg transition cursor-pointer select-none"
                                  title="Performance Analytics"
                                >
                                  Stats
                                </button>

                                <button
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="py-1.5 bg-red-50 hover:bg-red-100 text-red-655 border border-red-200/50 rounded-lg transition cursor-pointer select-none"
                                  title="Delete Collection"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Category Mock Preview Modal */}
                {activePreviewCategory && (() => {
                  const cat = activePreviewCategory;
                  
                  // Dynamically extract products belonging to this category in global products array
                  const linkedProducts = products.filter(p => 
                    p.categories?.some(c => c.id === cat.id || c.slug === cat.slug)
                  );

                  return (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto font-sans">
                      <div className="bg-[#FAF7F2] border border-[#EDE7D9] rounded-[28px] max-w-4xl w-full shadow-2xl p-6 relative animate-scale-up space-y-6 max-h-[90vh] overflow-y-auto text-stone-700">
                        <button 
                          onClick={() => setActivePreviewCategory(null)}
                          className="absolute top-4 right-4 p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full border-none cursor-pointer text-sm font-bold w-8 h-8 flex items-center justify-center shadow-md"
                          style={{ zIndex: 9999 }}
                        >
                          ✕
                        </button>
                        
                        {/* Banner Mockup */}
                        <div className="relative h-56 rounded-2xl overflow-hidden border border-[#EDE7D9] shadow-sm bg-stone-100 text-left">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#2F3B0C] to-[#4E641A] flex items-center justify-center text-stone-200 font-bold text-lg font-serif">
                              🌿 {cat.name} Collection
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/35 z-10" />
                          <div className="absolute bottom-5 left-6 right-6 text-white z-20 space-y-2">
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#B8833E] bg-[#FDFBF7] py-0.5 px-2.5 rounded-full inline-block">
                              Storefront Live Simulator
                            </span>
                            <h2 className="font-serif text-2xl font-bold tracking-tight">{cat.name}</h2>
                            <p className="text-[11px] text-stone-200 leading-relaxed font-light max-w-xl line-clamp-2">{cat.description || 'Harvested directly from chemical-free organic farming soils.'}</p>
                          </div>
                        </div>

                        {/* Product Grid Mockup */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b pb-2 border-[#EDE7D9]">
                            <h4 className="font-serif text-xs font-bold text-[#37411A]">{linkedProducts.length} Items Available</h4>
                            <span className="text-[9px] text-[#B8833E] font-extrabold uppercase tracking-widest">Suryodaya Farms Catalog</span>
                          </div>

                          {linkedProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
                              {linkedProducts.map(p => (
                                <div key={p.id} className="bg-white border border-[#EDE7D9] rounded-xl p-3 shadow-xxs space-y-2.5 flex flex-col justify-between">
                                  <div className="aspect-square rounded-lg overflow-hidden bg-stone-50 border border-[#EDE7D9] relative shrink-0">
                                    <img src={p.images?.[0]?.url || p.image} alt={p.name} className="w-full h-full object-cover" />
                                    {p.isFeatured && (
                                      <span className="absolute top-2 left-2 bg-[#B8833E] text-white text-[7px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm">
                                        Featured
                                      </span>
                                    )}
                                  </div>
                                  <div className="space-y-1 mt-2">
                                    <h5 className="font-serif text-xs font-bold text-[#37411A] truncate leading-tight">{p.name}</h5>
                                    <div className="flex justify-between items-center">
                                      <strong className="text-xs text-[#4E641A] font-bold">₹{p.price}</strong>
                                      <span className="text-[8px] text-stone-400 font-mono">SKU: {p.sku || 'N/A'}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-12 bg-white border border-[#EDE7D9] rounded-xl text-center text-stone-400 text-xs font-light">
                              This collection currently has no linked products. Close this and click "Products" to assign items.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Category Performance Analytics Modal */}
                {activeAnalyticsCategory && (() => {
                  const cat = activeAnalyticsCategory;
                  
                  // Calculate dynamic statistics
                  const linkedProducts = products.filter(p => 
                    p.categories?.some(c => c.id === cat.id || c.slug === cat.slug)
                  );
                  
                  const totalProducts = linkedProducts.length;
                  const totalStock = linkedProducts.reduce((sum, p) => sum + (p.inventory || 0), 0);
                  const outOfStockCount = linkedProducts.filter(p => (p.inventory || 0) <= 0).length;
                  const averagePrice = totalProducts > 0 
                    ? linkedProducts.reduce((sum, p) => sum + p.price, 0) / totalProducts
                    : 0;
                    
                  let minPrice = 0;
                  let maxPrice = 0;
                  if (totalProducts > 0) {
                    const prices = linkedProducts.map(p => p.price);
                    minPrice = Math.min(...prices);
                    maxPrice = Math.max(...prices);
                  }
                  
                  const totalValue = linkedProducts.reduce((sum, p) => sum + (p.price * (p.inventory || 0)), 0);

                  return (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
                      <div className="bg-[#FAF7F2] border border-[#EDE7D9] rounded-[28px] max-w-xl w-full shadow-2xl p-6 relative animate-scale-up space-y-6 text-stone-700">
                        <button 
                          onClick={() => setActiveAnalyticsCategory(null)}
                          className="absolute top-4 right-4 p-2 bg-stone-200/50 hover:bg-stone-300 text-stone-600 rounded-full border-none cursor-pointer text-sm font-bold w-8 h-8 flex items-center justify-center"
                        >
                          ✕
                        </button>

                        <div className="border-b pb-3 border-stone-200 text-left">
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#B8833E]">Collection Performance Analytics</span>
                          <h3 className="font-serif text-lg font-bold text-[#2F3B0C] mt-0.5">{cat.name}</h3>
                        </div>

                        {/* Stats Widgets */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-white border border-[#EDE7D9] p-3.5 rounded-2xl text-center">
                            <span className="text-[7.5px] text-stone-400 font-extrabold uppercase tracking-wider block">Linked items</span>
                            <strong className="text-[#2F3B0C] text-base font-bold block mt-1.5">{totalProducts}</strong>
                          </div>
                          <div className="bg-white border border-[#EDE7D9] p-3.5 rounded-2xl text-center">
                            <span className="text-[7.5px] text-stone-400 font-extrabold uppercase tracking-wider block">Total stock</span>
                            <strong className="text-[#2F3B0C] text-base font-bold block mt-1.5">{totalStock} units</strong>
                          </div>
                          <div className="bg-white border border-[#EDE7D9] p-3.5 rounded-2xl text-center">
                            <span className="text-[7.5px] text-stone-400 font-extrabold uppercase tracking-wider block">Out of Stock</span>
                            <strong className={`text-base font-bold block mt-1.5 ${outOfStockCount > 0 ? 'text-red-500' : 'text-[#4E641A]'}`}>{outOfStockCount}</strong>
                          </div>
                          <div className="bg-white border border-[#EDE7D9] p-3.5 rounded-2xl text-center">
                            <span className="text-[7.5px] text-stone-400 font-extrabold uppercase tracking-wider block">Stock Value</span>
                            <strong className="text-[#4E641A] text-base font-bold block mt-1.5">₹{totalValue.toLocaleString('en-IN')}</strong>
                          </div>
                        </div>

                        {/* Pricing details */}
                        <div className="bg-white border border-[#EDE7D9] rounded-2xl p-4.5 space-y-3.5 text-left text-xs">
                          <span className="text-[8px] font-extrabold text-[#B8833E] uppercase tracking-widest block">Collection Price Spectrum</span>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-0.5">
                              <span className="text-[8px] text-stone-400 uppercase font-semibold">Average Price</span>
                              <strong className="block text-sm text-stone-800 font-bold">₹{Math.round(averagePrice)}</strong>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[8px] text-stone-400 uppercase font-semibold">Min Price</span>
                              <strong className="block text-sm text-stone-800 font-bold">₹{minPrice}</strong>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[8px] text-stone-400 uppercase font-semibold">Max Price</span>
                              <strong className="block text-sm text-stone-800 font-bold">₹{maxPrice}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Advice box */}
                        <div className="bg-[#4E641A]/5 border border-[#4E641A]/10 rounded-2xl p-4 text-left text-xs text-stone-600 space-y-1.5">
                          <span className="text-[8px] font-extrabold text-[#4E641A] uppercase tracking-widest block">Collection Performance Insights</span>
                          {totalProducts === 0 ? (
                            <p className="leading-relaxed font-light">⚠️ This collection has zero products assigned. We recommend linking organic harvest staples to display this collection on your storefront.</p>
                          ) : outOfStockCount > 0 ? (
                            <p className="leading-relaxed font-light">🚨 Some items in this collection are out of stock. We recommend replenishing inventories of the affected products to prevent lost customer checkouts.</p>
                          ) : (
                            <p className="leading-relaxed font-light">✨ All products in this collection are currently in stock! The collection is optimized for customer sales and promotional campaigns.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>
            )}

            {/* "+ Assign Products" drawer/modal */}
            {showAssignModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white border border-[#EDE7D9] rounded-[28px] max-w-4xl w-full p-6 shadow-2xl animate-scale-up space-y-5 flex flex-col max-h-[85vh]">
                  
                  <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                    <div className="text-left">
                      <h3 className="font-serif text-lg font-bold text-[#37411A]">+ Assign Products</h3>
                      <p className="text-[10px] text-stone-400 font-light mt-0.5">Select and assign multiple products to {categoryDetails.name} instantly.</p>
                    </div>
                    <button
                      onClick={() => setShowAssignModal(false)}
                      className="p-1.5 text-stone-450 hover:bg-stone-50 rounded-lg transition border-none bg-transparent cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Search filter in checklist */}
                  <div className="flex justify-between items-center bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl px-4 py-2">
                    <FiSearch className="text-stone-450 mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search store products by name, SKU or category..."
                      value={assignSearchQuery}
                      onChange={(e) => setAssignSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-none focus:outline-none text-xs text-[#37411A] placeholder-stone-400 py-1"
                    />
                  </div>

                  {/* Checklist items list */}
                  <div className="overflow-y-auto flex-1 pr-1 space-y-3 min-h-[250px]">
                    {allAdminProducts.filter(prod => {
                      // Filter out products already in the category
                      if (prod.categories?.some(cat => cat.id === selectedCategoryId) || prod.categoryId === selectedCategoryId) return false;
                      const term = assignSearchQuery.toLowerCase();
                      return prod.name.toLowerCase().includes(term) || (prod.sku && prod.sku.toLowerCase().includes(term)) || (prod.categories?.some(cat => cat.name.toLowerCase().includes(term)));
                    }).length > 0 ? (
                      allAdminProducts.filter(prod => {
                        if (prod.categories?.some(cat => cat.id === selectedCategoryId) || prod.categoryId === selectedCategoryId) return false;
                        const term = assignSearchQuery.toLowerCase();
                        return prod.name.toLowerCase().includes(term) || (prod.sku && prod.sku.toLowerCase().includes(term)) || (prod.categories?.some(cat => cat.name.toLowerCase().includes(term)));
                      }).map((prod) => {
                        const isChecked = selectedProductIdsToAssign.includes(prod.id);
                        return (
                          <div 
                            key={prod.id} 
                            onClick={() => {
                              if (isChecked) {
                                setSelectedProductIdsToAssign(selectedProductIdsToAssign.filter(id => id !== prod.id));
                              } else {
                                setSelectedProductIdsToAssign([...selectedProductIdsToAssign, prod.id]);
                              }
                            }}
                            className={`border rounded-2xl p-3 flex items-center justify-between gap-4 transition duration-200 cursor-pointer ${
                              isChecked ? 'bg-[#4E641A]/5 border-[#4E641A]/30' : 'bg-[#FDFBF7] border-[#EDE7D9] hover:bg-stone-50'
                            }`}
                          >
                            <div className="flex gap-3 items-center min-w-0 text-left">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // handled by row click
                                className="w-4 h-4 rounded text-[#4E641A] focus:ring-[#4E641A] cursor-pointer"
                              />
                              <img 
                                src={prod.images?.length > 0 ? prod.images[0].url : prod.image} 
                                alt={prod.name} 
                                className="w-10 h-10 object-cover rounded-lg border border-[#EDE7D9] bg-stone-50 shrink-0"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold truncate text-[#37411A]">{prod.name}</span>
                                <span className="text-[9px] text-stone-400 font-semibold mt-0.5">
                                  SKU: {prod.sku} • Stock: {prod.inventory} • Current: {prod.categories?.map(c => c.name).join(', ') || 'No Category'}
                                </span>
                              </div>
                            </div>
                            <strong className="text-xs text-[#4E641A] font-bold shrink-0 pr-2">₹{prod.price}</strong>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-48 flex items-center justify-center text-stone-400 font-sans text-xs uppercase tracking-widest">
                        No Assignable Products Found
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="border-t border-stone-100 pt-4 flex justify-between items-center text-xs">
                    <span className="text-stone-400 font-medium">
                      {selectedProductIdsToAssign.length} products selected to re-assign
                    </span>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowAssignModal(false)}
                        className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-455 hover:bg-stone-50 uppercase font-bold tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAssignProducts}
                        disabled={selectedProductIdsToAssign.length === 0}
                        className={`px-5 py-2.5 rounded-xl uppercase font-bold tracking-wider cursor-pointer border-none text-white transition ${
                          selectedProductIdsToAssign.length > 0 ? 'bg-[#4E641A] hover:bg-[#37411A]' : 'bg-stone-300 cursor-not-allowed'
                        }`}
                      >
                        Save Instantly
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in w-full text-left">
            
            <div className="pb-6 border-b border-[#EDE7D9] text-left">
              <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#B8833E]">METRICS DEEP INSIGHTS</span>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#37411A]">Analytics Panel</h1>
            </div>

            {/* Distribution metrics */}
            {products.length === 0 || orders.length === 0 ? (
              <EmptyState
                title="📈 Analytics Coming Soon"
                description="Analytics data will be displayed after products, visitors, and orders are generated."
                illustration="📈"
              />
            ) : analytics ? (
              <div className="space-y-6">
                
                {/* Total revenues parameters logs */}
                <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-serif text-base font-bold text-[#B8833E]">Nature Preservation Revenues</h3>
                    <span className="text-stone-400 font-sans text-xs">Accumulated value</span>
                  </div>
                  <div className="text-left">
                    <span className="text-4xl font-serif font-extrabold text-[#37411A]">₹{analytics.totalRevenue}</span>
                    <p className="text-[10px] text-stone-500 font-light mt-1">
                      Calculated from successful Razorpay triggers and verified COD homestead deliveries.
                    </p>
                  </div>
                </div>

                {/* Categories share logs */}
                <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 space-y-5 shadow-sm">
                  <h3 className="font-serif text-base font-bold text-[#B8833E]">Catalog Diversity Share</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans text-xs">
                    {analytics.categoryChart.map((cat, i) => (
                      <div key={i} className="space-y-2 bg-[#FDFBF7] border border-[#EDE7D9] p-4 rounded-xl">
                        <div className="flex justify-between font-bold text-[#37411A]">
                          <span>{cat.name}</span>
                          <span>{cat.value} items</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-1.5">
                          <div 
                            className="bg-[#4E641A] h-1.5 rounded-full" 
                            style={{ width: `${Math.min(cat.value * 25, 100)}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-64 bg-white border border-[#EDE7D9] rounded-2xl flex items-center justify-center animate-pulse">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Compiling Analytics Data...</span>
              </div>
            )}

          </div>
        )}

        {/* TAB 6.5: CUSTOMER SUPPORT CRM */}
        {activeTab === 'support-tickets' && (
          <div className="space-y-8 animate-fade-in w-full text-left font-sans">
            <div className="pb-6 border-b border-[#EDE7D9] text-left">
              <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#B8833E]">SUPPORT CRM DESK</span>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#37411A]">Customer Support Tickets</h1>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Open Tickets', count: supportTickets.filter(t => t.status === 'OPEN').length, color: 'bg-gold-50 text-[#C68A2B] border-gold-200' },
                { label: 'In Progress', count: supportTickets.filter(t => t.status === 'IN_PROGRESS').length, color: 'bg-amber-50 text-amber-600 border-amber-200' },
                { label: 'Resolved', count: supportTickets.filter(t => t.status === 'RESOLVED').length, color: 'bg-green-50 text-green-755 border-green-200' },
                { label: 'Closed', count: supportTickets.filter(t => t.status === 'CLOSED').length, color: 'bg-stone-50 text-stone-600 border-stone-200' }
              ].map((m, i) => (
                <div key={i} className={`p-4 rounded-2xl border text-center ${m.color} bg-white shadow-xxs flex flex-col justify-center items-center gap-1.5`}>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">{m.label}</span>
                  <span className="text-2xl font-serif font-extrabold">{m.count}</span>
                </div>
              ))}
            </div>

            {selectedSupportTicket ? (
              // DETAIL WORKSPACE
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left side: Context details (order, shipment, customer) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Back button */}
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/admin/support-tickets');
                      setAdminReplyText('');
                      setAdminReplyImage(null);
                      setAdminReplyError(null);
                    }}
                    className="flex items-center gap-1.5 text-stone-500 hover:text-[#4E641A] font-sans text-xs font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer bg-transparent border-none p-0 group"
                  >
                    <FiArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                    Back to Tickets list
                  </button>

                  {/* Customer details card */}
                  <div className="bg-white border border-[#EDE7D9] rounded-[24px] p-5 space-y-4 shadow-sm">
                    <h3 className="font-serif text-sm font-bold text-[#2F3B0C] border-b pb-2 border-stone-100 flex items-center gap-2">
                      <FiUser className="text-[#C68A2B]" /> Customer Profile
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#4E641A]/10 text-[#4E641A] flex items-center justify-center font-serif font-bold text-sm overflow-hidden shrink-0">
                        {selectedSupportTicket.user.avatarUrl ? (
                          <img src={selectedSupportTicket.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          selectedSupportTicket.user.name?.charAt(0).toUpperCase() || 'C'
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <h4 className="font-sans text-xs font-bold text-stone-850 truncate">{selectedSupportTicket.user.name || 'Member'}</h4>
                        <p className="text-[10px] text-stone-400 font-semibold truncate">{selectedSupportTicket.user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Shipment & Order details card */}
                  {selectedSupportTicket.order ? (
                    <div className="bg-white border border-[#EDE7D9] rounded-[24px] p-5 space-y-4 shadow-sm">
                      <h3 className="font-serif text-sm font-bold text-[#2F3B0C] border-b pb-2 border-stone-100 flex items-center gap-2">
                        <FiShoppingBag className="text-[#C68A2B]" /> Shipment Order Info
                      </h3>
                      <div className="space-y-3.5 text-xs text-stone-600 font-medium">
                        <div className="flex justify-between">
                          <span>Order Reference:</span>
                          <span className="font-mono font-bold text-stone-800">#{selectedSupportTicket.order.orderNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Order Date:</span>
                          <span className="font-bold text-stone-800">
                            {new Date(selectedSupportTicket.order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Amount:</span>
                          <span className="font-bold text-[#4E641A]">₹{selectedSupportTicket.order.totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipment Status:</span>
                          <span className="bg-[#4E641A]/10 text-[#4E641A] px-2 py-0.5 rounded-full font-bold uppercase text-[8px]">
                            {selectedSupportTicket.order.status}
                          </span>
                        </div>
                      </div>

                      {/* Address coordinates details */}
                      {selectedSupportTicket.order.shippingAddress && (
                        <div className="pt-3 border-t border-stone-100 text-[10px] text-stone-500 space-y-1">
                          <span className="font-extrabold uppercase tracking-wider text-[#C68A2B] block">Delivery Coordinates</span>
                          <div className="leading-relaxed font-semibold bg-[#FDFBF7] p-2.5 rounded-xl border border-[#EDE7D9]/60">
                            <strong>{selectedSupportTicket.order.shippingAddress.recipientName}</strong> • {selectedSupportTicket.order.shippingAddress.phone} <br />
                            {selectedSupportTicket.order.shippingAddress.street}, {selectedSupportTicket.order.shippingAddress.city}, {selectedSupportTicket.order.shippingAddress.state} – {selectedSupportTicket.order.shippingAddress.postalCode}
                          </div>
                        </div>
                      )}

                      {/* Items breakdown */}
                      <div className="pt-3 border-t border-stone-100 space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C68A2B] block">Harvest Items</span>
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 no-scrollbar text-stone-605">
                          {selectedSupportTicket.order.orderItems?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-[#F9F6F0] p-2 rounded-xl border border-[#EAE4D8] gap-3 text-[10px] font-semibold">
                              <span className="truncate">{item.product?.name} x{item.quantity}</span>
                              <span className="font-bold text-[#2F3B0C] shrink-0">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-[#EDE7D9] rounded-[24px] p-5 text-center text-stone-400 text-xs shadow-sm">
                      No order details linked to this ticket.
                    </div>
                  )}

                  {/* Settings / Controls */}
                  <div className="bg-white border border-[#EDE7D9] rounded-[24px] p-5 space-y-4 shadow-sm">
                    <h3 className="font-serif text-sm font-bold text-[#2F3B0C] border-b pb-2 border-stone-100 flex items-center gap-2">
                      <FiSettings className="text-[#C68A2B]" /> Ticket Controls
                    </h3>
                    <div className="space-y-4 text-xs font-semibold text-stone-605">
                      <div className="space-y-1">
                        <label className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400">Change Status</label>
                        <select
                          value={selectedSupportTicket.status}
                          onChange={(e) => handleUpdateTicketStatusOrPriority(selectedSupportTicket.id, e.target.value, null)}
                          className="w-full p-2.5 bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl text-stone-650 focus:outline-none focus:border-[#4E641A]"
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400">Set Priority</label>
                        <select
                          value={selectedSupportTicket.priority}
                          onChange={(e) => handleUpdateTicketStatusOrPriority(selectedSupportTicket.id, null, e.target.value)}
                          className="w-full p-2.5 bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl text-stone-650 focus:outline-none focus:border-[#4E641A]"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Conversation timeline & editor */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Timeline conversation card */}
                  <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-sm flex flex-col h-[450px]">
                    <div className="border-b pb-3 border-stone-100 flex justify-between items-baseline mb-4">
                      <h3 className="font-serif text-base font-bold text-[#2F3B0C]">
                        Conversation Timeline
                      </h3>
                      <span className="text-[9px] font-extrabold text-[#C68A2B] uppercase tracking-wider">
                        {selectedSupportTicket.ticketNumber}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                      {selectedSupportTicket.messages?.map((msg, idx) => {
                        const isCustomer = msg.role === 'CUSTOMER';
                        return (
                          <div
                            key={idx}
                            className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} w-full`}
                          >
                            <div className={`max-w-[80%] space-y-1 ${isCustomer ? 'text-left' : 'text-right'}`}>
                              <span className="text-[8px] font-extrabold uppercase tracking-widest text-stone-400 block px-1">
                                {isCustomer ? 'Customer' : 'Staff Admin'} • {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div className={`p-4 rounded-[20px] shadow-xxs ${
                                isCustomer
                                  ? 'bg-[#F9F6F0] border border-[#EAE4D8] text-stone-850 rounded-tl-none'
                                  : 'bg-[#4E641A] text-white rounded-tr-none'
                              }`}>
                                <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                {msg.imageUrl && (
                                  <div className="mt-2 rounded-lg overflow-hidden border max-w-xs cursor-zoom-in inline-block" onClick={() => window.open(msg.imageUrl, '_blank')}>
                                    <img src={msg.imageUrl} alt="Customer attachment" className="max-h-40 object-cover w-full" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Staff reply box */}
                  <form onSubmit={handleAdminSendReply} className="bg-white border border-[#EDE7D9] rounded-[24px] p-5 shadow-sm space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#B8833E] block">Write response to customer</label>
                      <textarea
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        placeholder="Type response details here..."
                        rows={3}
                        required={!adminReplyImage}
                        className="w-full p-3 border border-[#EAE4D8] rounded-xl text-stone-700 font-sans focus:outline-none focus:ring-1 focus:ring-[#4E641A]"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-[#EDE7D9] hover:border-[#4E641A] rounded-xl cursor-pointer text-stone-600 transition shrink-0">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#4E641A]">Add Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAdminReplyImageChange}
                            className="hidden"
                          />
                        </label>
                        {adminReplyImage && (
                          <div className="relative w-12 h-12 rounded-lg border border-[#EDE7D9] overflow-hidden shrink-0">
                            <img src={adminReplyImage} alt="Reply preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setAdminReplyImage(null)}
                              className="absolute -top-1 -right-1 bg-red-655 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-extrabold cursor-pointer border-none"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      {adminReplyError && (
                        <div className="text-[10px] text-red-655 font-semibold bg-red-50 p-2 rounded-lg border border-red-100 max-w-xs">
                          {adminReplyError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmittingAdminReply}
                        className="w-full sm:w-auto px-6 py-3 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition duration-300 border-none cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isSubmittingAdminReply ? 'Sending response...' : 'Save & Send Reply'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              // TICKET MANAGEMENT LISTING & SEARCH FILTERS
              <div className="space-y-6">
                {/* Search & filters bar */}
                <div className="bg-white border border-[#EDE7D9] rounded-[24px] p-5 shadow-sm space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    
                    {/* Search query */}
                    <div className="sm:col-span-6 relative">
                      <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                      <input
                        type="text"
                        placeholder="Search support tickets by ID, subject, customer name/email..."
                        value={supportSearchQuery}
                        onChange={(e) => setSupportSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl text-xs font-semibold text-stone-700 placeholder-stone-400 focus:outline-none focus:border-[#4E641A]"
                      />
                    </div>

                    {/* Status filter */}
                    <div className="sm:col-span-3">
                      <select
                        value={supportStatusFilter}
                        onChange={(e) => setSupportStatusFilter(e.target.value)}
                        className="w-full p-3 bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl text-xs font-semibold text-stone-605 focus:outline-none focus:border-[#4E641A]"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>

                    {/* Priority filter */}
                    <div className="sm:col-span-3">
                      <select
                        value={supportPriorityFilter}
                        onChange={(e) => setSupportPriorityFilter(e.target.value)}
                        className="w-full p-3 bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl text-xs font-semibold text-stone-650 focus:outline-none focus:border-[#4E641A]"
                      >
                        <option value="ALL">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* Tickets grid layout */}
                {supportTickets.length === 0 ? (
                  <EmptyState
                    title="🎫 No Support Tickets Found"
                    description="No tickets match the selected filters or search parameters."
                    illustration="🎫"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {supportTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-white border border-[#EDE7D9] rounded-[24px] p-5 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between gap-4 text-left font-sans"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[10px] font-extrabold text-[#B8833E] bg-[#B8833E]/10 px-2 py-0.5 rounded border border-[#B8833E]/20">
                              {ticket.ticketNumber}
                            </span>
                            <div className="flex gap-1.5">
                              <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                ticket.status === 'RESOLVED'
                                  ? 'bg-green-50 text-green-755 border-green-200'
                                  : ticket.status === 'CLOSED'
                                  ? 'bg-stone-50 text-stone-600 border-stone-200'
                                  : ticket.status === 'IN_PROGRESS'
                                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                                  : 'bg-gold-50 text-[#C68A2B] border-gold-200'
                              }`}>
                                {ticket.status.replace('_', ' ')}
                              </span>
                              <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                ticket.priority === 'URGENT'
                                  ? 'bg-red-50 text-red-655 border-red-100 animate-pulse'
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

                          <div className="space-y-1.5 text-left">
                            <h4 className="font-serif text-sm font-bold text-[#37411A] line-clamp-1">{ticket.subject}</h4>
                            <div className="text-[10px] text-stone-500 leading-normal font-semibold space-y-0.5">
                              <p>Customer: <strong className="text-stone-700">{ticket.user?.name || 'Member'}</strong> ({ticket.user?.email})</p>
                              {ticket.order && <p>Order Ref: <strong className="text-stone-700">#{ticket.order.orderNumber}</strong></p>}
                              <p className="text-[9px] text-stone-400 mt-1 font-medium">Created on {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            navigate(`/admin/support-tickets/${ticket.id}`);
                          }}
                          className="w-full py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition duration-300 border-none cursor-pointer"
                        >
                          Manage Ticket Feed
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fade-in w-full text-left">
            
            <div className="pb-6 border-b border-[#EDE7D9] text-left">
              <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#B8833E]">ADMIN SYSTEM CONFIGURATION</span>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#37411A]">Campaigns & Settings</h1>
            </div>

            <div className="max-w-4xl mx-auto w-full">
              
              {/* Admin Profile settings card */}
              <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 mb-6 space-y-5 shadow-sm">
                <div className="flex justify-between items-baseline border-b border-stone-100 pb-3">
                  <h3 className="font-serif text-base font-bold text-[#B8833E]">Administrator Profile</h3>
                  <span className="text-[9px] font-bold text-stone-400 uppercase font-sans">Personal Identity</span>
                </div>
                
                <form onSubmit={handleSaveAdminProfile} className="space-y-4 text-xs text-stone-500">
                  {profileMessage && (
                    <div className={`p-3 rounded-lg text-center font-bold ${
                      profileMessage.includes('successfully') ? 'bg-[#4E641A]/10 text-[#4E641A]' : 'bg-red-50 text-red-655'
                    }`}>
                      {profileMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                    <div className="space-y-1 flex flex-col text-left">
                      <label className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400">Admin Name</label>
                      <input 
                        type="text" 
                        value={adminNameForm} 
                        onChange={(e) => setAdminNameForm(e.target.value)}
                        className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-2.5 text-stone-600 focus:outline-none focus:border-[#4E641A] font-sans" 
                        required
                      />
                    </div>
                    
                    <div className="space-y-1 flex flex-col text-left">
                      <UnifiedUploader
                        value={adminAvatarForm}
                        onChange={(url) => setAdminAvatarForm(url)}
                        label="Admin Avatar (Profile Picture)"
                        aspectRatio={1}
                        folder="avatars"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <button
                      type="submit"
                      disabled={isGlobalLoading}
                      className="px-5 py-3 bg-[#4E641A] hover:bg-[#2F3B0C] disabled:bg-stone-300 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition cursor-pointer shadow-sm border-none"
                    >
                      {isGlobalLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Centralized Settings Form */}
              <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 space-y-5 shadow-sm">
                <div className="flex justify-between items-baseline border-b border-stone-100 pb-3">
                  <h3 className="font-serif text-base font-bold text-[#B8833E]">Website Settings</h3>
                  <span className="text-[9px] font-bold text-stone-400 uppercase font-sans">SEO & Profile</span>
                </div>
                
                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs text-stone-500">
                  {settingsMessage && (
                    <div className={`p-3 rounded-lg text-center font-bold ${
                      settingsMessage.includes('successfully') ? 'bg-[#4E641A]/10 text-[#4E641A]' : 'bg-red-50 text-red-650'
                    }`}>
                      {settingsMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 flex flex-col text-left">
                      <label className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400">Company Name</label>
                      <input 
                        type="text" 
                        value={settingsForm.companyName} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                        className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-2.5 text-stone-600 focus:outline-none focus:border-[#4E641A] font-sans" 
                      />
                    </div>
                    
                    <div className="space-y-1 flex flex-col text-left">
                      <label className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400">Brand Name</label>
                      <input 
                        type="text" 
                        value={settingsForm.brandName} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                        className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-2.5 text-stone-600 focus:outline-none focus:border-[#4E641A] font-sans" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 flex flex-col text-left">
                      <label className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400">Support Email</label>
                      <input 
                        type="email" 
                        value={settingsForm.email} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-2.5 text-stone-600 focus:outline-none focus:border-[#4E641A] font-sans" 
                      />
                    </div>
                    
                    <div className="space-y-1 flex flex-col text-left">
                      <label className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400">Mobile Number</label>
                      <input 
                        type="text" 
                        value={settingsForm.phone} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-2.5 text-stone-600 focus:outline-none focus:border-[#4E641A] font-sans" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1 flex flex-col text-left">
                    <label className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400">Official Address</label>
                    <textarea 
                      value={settingsForm.address} 
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      rows={2}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-2.5 text-stone-600 focus:outline-none focus:border-[#4E641A] font-sans resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 flex flex-col text-left">
                      <label className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400">Website URL</label>
                      <input 
                        type="text" 
                        value={settingsForm.websiteUrl} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, websiteUrl: e.target.value })}
                        className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-2.5 text-stone-600 focus:outline-none focus:border-[#4E641A] font-sans" 
                      />
                    </div>
                    
                    <div className="space-y-1 flex flex-col text-left">
                      <label className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400">GST Number</label>
                      <input 
                        type="text" 
                        value={settingsForm.gstNumber} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, gstNumber: e.target.value })}
                        className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-2.5 text-stone-600 focus:outline-none focus:border-[#4E641A] font-sans" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1 flex flex-col text-left">
                    <label className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400">Registration Details</label>
                    <input 
                      type="text" 
                      value={settingsForm.registrationDetails} 
                      onChange={(e) => setSettingsForm({ ...settingsForm, registrationDetails: e.target.value })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-2.5 text-stone-600 focus:outline-none focus:border-[#4E641A] font-sans" 
                    />
                  </div>

                  <div className="border-t border-[#EDE7D9] pt-3">
                    <span className="text-[8px] font-extrabold tracking-wider text-stone-400 uppercase block mb-2 font-sans">Social Media Links</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1 flex flex-col text-left">
                        <label className="text-[7px] font-extrabold text-stone-400">Instagram</label>
                        <input 
                          type="text" 
                          value={settingsForm.socialInstagram} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, socialInstagram: e.target.value })}
                          className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-2 text-stone-600 focus:outline-none focus:border-[#4E641A] font-sans" 
                        />
                      </div>
                      <div className="space-y-1 flex flex-col text-left">
                        <label className="text-[7px] font-extrabold text-stone-400">Facebook</label>
                        <input 
                          type="text" 
                          value={settingsForm.socialFacebook} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, socialFacebook: e.target.value })}
                          className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-2 text-stone-600 focus:outline-none focus:border-[#4E641A] font-sans" 
                        />
                      </div>
                      <div className="space-y-1 flex flex-col text-left">
                        <label className="text-[7px] font-extrabold text-stone-400">Twitter</label>
                        <input 
                          type="text" 
                          value={settingsForm.socialTwitter} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, socialTwitter: e.target.value })}
                          className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-2 text-stone-600 focus:outline-none focus:border-[#4E641A] font-sans" 
                        />
                      </div>
                      <div className="space-y-1 flex flex-col text-left">
                        <label className="text-[7px] font-extrabold text-stone-400">Youtube</label>
                        <input 
                          type="text" 
                          value={settingsForm.socialYoutube} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, socialYoutube: e.target.value })}
                          className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-2 text-stone-600 focus:outline-none focus:border-[#4E641A] font-sans" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping & Delivery Configuration */}
                  <div className="space-y-4 pt-4 border-t border-[#EDE7D9] mt-4">
                    <span className="font-serif text-xs font-bold text-stone-700 block text-left">Shipping & Delivery Configurations</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 flex flex-col text-left">
                        <label className="text-[7px] font-extrabold text-stone-400">Free Delivery Weight Threshold (in KG)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          min="0"
                          value={settingsForm.freeDeliveryThreshold} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: e.target.value })}
                          className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-2 text-stone-600 focus:outline-none focus:border-[#4E641A] font-sans" 
                          required
                        />
                      </div>
                      <div className="space-y-1 flex flex-col text-left">
                        <label className="text-[7px] font-extrabold text-stone-400">Standard Shipping Charge (in ₹)</label>
                        <input 
                          type="number" 
                          min="0"
                          value={settingsForm.shippingCharge} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, shippingCharge: e.target.value })}
                          className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-2 text-stone-600 focus:outline-none focus:border-[#4E641A] font-sans" 
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1 flex flex-col text-left">
                      <label className="text-[7px] font-extrabold text-stone-400">Serviceable States (Comma-separated)</label>
                      <input 
                        type="text" 
                        value={settingsForm.serviceableStates} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, serviceableStates: e.target.value })}
                        className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-2 text-stone-600 focus:outline-none focus:border-[#4E641A] font-sans" 
                        placeholder="e.g. Telangana, Andhra Pradesh"
                        required
                      />
                      <span className="text-[7px] text-stone-400 font-sans italic">Separate multiple states with commas (e.g. Telangana, Andhra Pradesh).</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-left pt-3 border-t border-[#EDE7D9] mt-4 select-none">
                    <input
                      type="checkbox"
                      id="reviewsRequirePurchase"
                      checked={settingsForm.reviewsRequirePurchase}
                      onChange={(e) => setSettingsForm({ ...settingsForm, reviewsRequirePurchase: e.target.checked })}
                      className="h-4 w-4 rounded border-[#EDE7D9] text-[#4E641A] focus:ring-[#4E641A] cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <label htmlFor="reviewsRequirePurchase" className="text-[10px] font-bold uppercase tracking-wider text-stone-600 cursor-pointer">
                        Reviews Require Purchase
                      </label>
                      <span className="text-[8px] text-stone-400 font-light font-sans">
                        Only logged-in customers who have purchased the specific harvest can submit reviews.
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="w-full py-3 bg-[#4E641A] hover:bg-[#37411A] disabled:bg-stone-300 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition cursor-pointer border-none shadow font-sans"
                    >
                      {isSavingSettings ? 'Saving Changes...' : 'Update Preferences'}
                    </button>
                  </div>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* TAB 7.5: VOUCHERS & COUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-8 animate-fade-in w-full text-left">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EDE7D9]">
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#B8833E]">MARKETING & PROMOTIONS</span>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#37411A]">Vouchers & Coupons</h1>
              </div>
              <button 
                onClick={() => { resetCouponForm(); setShowCouponModal(true); }}
                className="px-5 py-3 bg-[#4E641A] hover:bg-[#37411A] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center space-x-2 shadow border-none cursor-pointer"
              >
                <FiPlus className="w-4 h-4 text-[#B8833E]" />
                <span>Create Voucher</span>
              </button>
            </div>

            {/* Modal for Create/Edit */}
            {showCouponModal && (
              <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-md animate-scale-up max-w-4xl mx-auto">
                <h3 className="font-serif text-lg font-bold text-[#B8833E] mb-5">
                  {couponForm.id ? 'Modify Voucher Details' : 'Create New Voucher Campaign'}
                </h3>
                <form noValidate onSubmit={handleSaveCoupon} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-500">
                  
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Coupon Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g. SOILFIRST15" 
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A] font-mono uppercase"
                      required
                      disabled={!!couponForm.id}
                    />
                    {couponFormErrors.code && (
                      <span className="text-[10px] text-red-655 font-bold block mt-1 select-none">
                        ⚠️ {couponFormErrors.code}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Discount Type</label>
                    <select
                      value={couponForm.discountType}
                      onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A] font-sans h-[42px]"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FLAT">Flat Rate (₹)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Discount Value</label>
                    <input 
                      type="number" 
                      placeholder={couponForm.discountType === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 200'} 
                      value={couponForm.discountValue}
                      onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                      required
                    />
                    {couponFormErrors.discountValue && (
                      <span className="text-[10px] text-red-655 font-bold block mt-1 select-none">
                        ⚠️ {couponFormErrors.discountValue}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Minimum Order Value (₹)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 1500" 
                      value={couponForm.minOrderValue}
                      onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: e.target.value })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Expiry Date</label>
                    <input 
                      type="date" 
                      value={couponForm.expiryDate ? couponForm.expiryDate.split('T')[0] : ''}
                      onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                      required
                    />
                    {couponFormErrors.expiryDate && (
                      <span className="text-[10px] text-red-655 font-bold block mt-1 select-none">
                        ⚠️ {couponFormErrors.expiryDate}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Usage Limit (-1 for unlimited)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 100" 
                      value={couponForm.usageLimit}
                      onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                    />
                  </div>

                  <div className="col-span-2 flex items-center gap-2 text-left py-2">
                    <input 
                      type="checkbox" 
                      id="isActive"
                      checked={couponForm.isActive}
                      onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                      className="w-4 h-4 accent-[#4E641A]"
                    />
                    <label htmlFor="isActive" className="text-stone-600 font-semibold select-none cursor-pointer">Enable this coupon immediately</label>
                  </div>

                  <div className="col-span-2 flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => { setShowCouponModal(false); resetCouponForm(); }}
                      className="px-5 py-3 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 uppercase font-bold tracking-wider cursor-pointer bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#4E641A] hover:bg-[#37411A] text-white rounded-xl uppercase font-bold tracking-wider cursor-pointer border-none"
                    >
                      Save Promotion
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* Coupons search filter */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border border-[#EDE7D9] p-4 rounded-2xl shadow-sm select-none mb-6">
              <div className="relative w-full sm:w-72">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search promo codes..."
                  value={couponSearchQuery}
                  onChange={(e) => setCouponSearchQuery(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-2 px-10 focus:outline-none focus:border-[#4E641A] text-xs text-[#37411A]"
                />
              </div>
            </div>

            {/* Coupons listing */}
            {coupons.length === 0 ? (
              <EmptyState
                title="No Coupons Configured"
                description="Launch new promotion codes to drive seasonal conversions and reward loyalty."
                illustration="🏷"
                actionLabel="Create Voucher"
                onAction={() => {
                  resetCouponForm();
                  setShowCouponModal(true);
                }}
              />
            ) : (
              <div className="space-y-4">
                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white border border-[#EDE7D9] rounded-[28px] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left font-sans text-xs">
                      <thead>
                        <tr className="bg-[#EDE7D9]/40 border-b border-[#EDE7D9] text-[#37411A] font-extrabold uppercase tracking-wider text-[9px]">
                          <th className="py-4 px-6">Voucher Code</th>
                          <th className="py-4 px-6">Discount Value</th>
                          <th className="py-4 px-6">Min Order</th>
                          <th className="py-4 px-6">Usage Progress</th>
                          <th className="py-4 px-6">Expiry</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDE7D9]/45 text-stone-600">
                        {coupons.filter(c => c.code.toLowerCase().includes(couponSearchQuery.toLowerCase())).map((c) => {
                          const isExpired = new Date() > new Date(c.expiryDate);
                          const usageCount = c._count?.orders || 0;
                          const limitText = c.usageLimit === -1 || c.usageLimit === null ? 'Unlimited' : `${usageCount} / ${c.usageLimit}`;
                          const isLimitReached = c.usageLimit !== -1 && c.usageLimit !== null && usageCount >= c.usageLimit;
                          
                          return (
                            <tr key={c.id} className="hover:bg-[#EDE7D9]/10 transition duration-150">
                              <td className="py-4 px-6 font-mono font-bold text-[#2F3B0C]">
                                <span className="bg-[#EDE7D9]/30 border border-[#EDE7D9] px-2.5 py-1 rounded-[6px]">
                                  {c.code}
                                </span>
                              </td>
                              <td className="py-4 px-6 font-bold text-[#37411A]">
                                {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat`}
                              </td>
                              <td className="py-4 px-6">
                                ₹{c.minOrderValue}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${isLimitReached ? 'bg-red-50 text-red-750 font-bold' : 'bg-[#EDE7D9]/40'}`}>
                                  {limitText}
                                </span>
                              </td>
                              <td className="py-4 px-6 font-medium">
                                {new Date(c.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {isExpired && <span className="text-[9px] font-bold text-red-650 ml-1.5 uppercase">Expired</span>}
                              </td>
                              <td className="py-4 px-6">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCouponStatus(c)}
                                  className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase cursor-pointer border transition-all ${
                                    c.isActive && !isExpired && !isLimitReached
                                      ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                                      : 'bg-red-50 text-red-655 border-red-200 hover:bg-red-100'
                                  }`}
                                >
                                  {c.isActive && !isExpired && !isLimitReached ? 'Active' : 'Disabled'}
                                </button>
                              </td>
                              <td className="py-4 px-6 text-right flex items-center justify-end gap-2.5">
                                <button
                                  onClick={() => {
                                    setCouponForm({
                                      id: c.id,
                                      code: c.code,
                                      discountType: c.discountType,
                                      discountValue: c.discountValue.toString(),
                                      minOrderValue: c.minOrderValue.toString(),
                                      expiryDate: c.expiryDate,
                                      usageLimit: c.usageLimit.toString(),
                                      isActive: c.isActive
                                    });
                                    setShowCouponModal(true);
                                  }}
                                  className="p-2 border border-stone-200 hover:border-[#4E641A]/30 text-stone-500 hover:text-[#4E641A] rounded-xl transition cursor-pointer bg-white"
                                  title="Edit Promotion"
                                >
                                  <FiEdit2 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(c.id)}
                                  className="p-2 border border-red-255 hover:bg-red-55 text-red-655 rounded-xl transition cursor-pointer bg-white"
                                  title="Delete Promotion"
                                >
                                  <FiTrash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card List View */}
                <div className="block lg:hidden space-y-4">
                  {coupons.filter(c => c.code.toLowerCase().includes(couponSearchQuery.toLowerCase())).map((c) => {
                    const isExpired = new Date() > new Date(c.expiryDate);
                    const usageCount = c._count?.orders || 0;
                    const limitText = c.usageLimit === -1 || c.usageLimit === null ? 'Unlimited' : `${usageCount} / ${c.usageLimit}`;
                    const isLimitReached = c.usageLimit !== -1 && c.usageLimit !== null && usageCount >= c.usageLimit;
                    
                    return (
                      <div key={c.id} className="bg-white border border-[#EDE7D9] rounded-2xl p-4.5 space-y-3.5 shadow-sm text-left relative">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-[#2F3B0C] bg-[#EDE7D9]/30 border border-[#EDE7D9] px-2.5 py-1 rounded-[6px] text-xs">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleCouponStatus(c)}
                            className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase cursor-pointer border transition-all ${
                              c.isActive && !isExpired && !isLimitReached
                                ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                                : 'bg-red-50 text-red-655 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {c.isActive && !isExpired && !isLimitReached ? 'Active' : 'Disabled'}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs font-sans text-stone-500">
                          <div className="space-y-0.5">
                            <span className="text-[8px] text-stone-400 font-extrabold uppercase tracking-wider block">Discount</span>
                            <strong className="text-stone-800 font-bold text-sm">
                              {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat`}
                            </strong>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[8px] text-stone-400 font-extrabold uppercase tracking-wider block">Min Order</span>
                            <strong className="text-stone-800 font-bold text-sm">₹{c.minOrderValue}</strong>
                          </div>
                          <div className="space-y-0.5 mt-1">
                            <span className="text-[8px] text-stone-400 font-extrabold uppercase tracking-wider block">Usage Limit</span>
                            <strong className={`text-[10px] font-bold inline-block px-1.5 py-0.5 rounded ${isLimitReached ? 'bg-red-50 text-red-755' : 'bg-[#EDE7D9]/40 text-stone-705'}`}>
                              {limitText}
                            </strong>
                          </div>
                          <div className="space-y-0.5 mt-1">
                            <span className="text-[8px] text-stone-400 font-extrabold uppercase tracking-wider block">Expiry Date</span>
                            <strong className="text-stone-750 font-semibold text-xs">
                              {new Date(c.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {isExpired && <span className="text-[8px] font-bold text-red-655 ml-1 block uppercase mt-0.5">Expired</span>}
                            </strong>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-3 border-t border-stone-100">
                          <button
                            onClick={() => {
                              setCouponForm({
                                  id: c.id,
                                  code: c.code,
                                  discountType: c.discountType,
                                  discountValue: c.discountValue.toString(),
                                  minOrderValue: c.minOrderValue.toString(),
                                  expiryDate: c.expiryDate,
                                  usageLimit: c.usageLimit.toString(),
                                  isActive: c.isActive
                              });
                              setShowCouponModal(true);
                            }}
                            className="p-2 border border-stone-200 hover:border-[#4E641A]/30 text-stone-500 hover:text-[#4E641A] rounded-xl transition cursor-pointer bg-white"
                            title="Edit Promotion"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="p-2 border border-red-250 hover:bg-red-55 text-red-655 rounded-xl transition cursor-pointer bg-white"
                            title="Delete Promotion"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7.6: PRODUCT REVIEWS SUMMARY DASHBOARD */}
        {activeTab === 'reviews' && (
          <div className="space-y-8 animate-fade-in w-full text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EDE7D9]">
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#B8833E]">CONTENT MODERATION</span>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#37411A]">Product Reviews</h1>
              </div>
            </div>

            {productsReviewSummary.length === 0 ? (
              <EmptyState
                title="📦 No Products Found"
                description="There are no products in the database to display reviews for."
                illustration="📦"
              />
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden lg:block bg-white border border-[#EDE7D9] rounded-[28px] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs text-stone-500 font-sans">
                      <thead className="bg-[#FDFBF7] border-b border-[#EDE7D9] text-[#B8833E]">
                        <tr>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none w-20">Product Image</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none">Product Name</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none">Category</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none">Average Rating</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none">Total Reviews</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none text-amber-600">Pending</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none text-[#4E641A]">Approved</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDE7D9]">
                        {productsReviewSummary.map((p) => (
                          <tr key={p.id} className="hover:bg-[#FDFBF7] transition">
                            <td className="py-4 px-6">
                              <img
                                src={p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'}
                                alt={p.name}
                                className="w-10 h-10 object-cover rounded-lg border border-[#EDE7D9] bg-stone-50"
                              />
                            </td>
                            <td className="py-4 px-6 font-serif text-[#37411A] font-bold text-sm">
                              {p.name}
                            </td>
                            <td className="py-4 px-6 font-bold text-[#37411A]">{p.category}</td>
                            <td className="py-4 px-6 font-sans">
                              <div className="flex items-center gap-1">
                                <div className="flex text-amber-500">
                                  {[...Array(5)].map((_, i) => (
                                    <FiStar key={i} className={`w-3.5 h-3.5 ${i < Math.round(p.averageRating) ? 'fill-current' : 'text-stone-200'}`} />
                                  ))}
                                </div>
                                <span className="font-bold text-stone-600 ml-1">{p.averageRating > 0 ? p.averageRating : '0.0'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 font-sans font-bold text-[#37411A]">{p.totalReviews} Reviews</td>
                            <td className="py-4 px-6 font-sans font-bold text-amber-600">{p.pendingReviews} Pending</td>
                            <td className="py-4 px-6 font-sans font-bold text-[#4E641A]">{p.approvedReviews} Approved</td>
                            <td className="py-4 px-6 text-right">
                              <button
                                type="button"
                                onClick={() => navigate(`/admin/reviews/${p.id}`)}
                                className="px-4 py-2 bg-[#4E641A] hover:bg-[#37411A] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center gap-1.5 ml-auto cursor-pointer border-none shadow-sm font-sans"
                              >
                                <span>Manage</span>
                                <span>→</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card List View */}
                <div className="block lg:hidden space-y-4">
                  {productsReviewSummary.map((p) => (
                    <div key={p.id} className="bg-white border border-[#EDE7D9] rounded-2xl p-4.5 space-y-3.5 shadow-sm text-left flex flex-col">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'}
                          alt={p.name}
                          className="w-16 h-16 object-cover rounded-xl border border-[#EDE7D9] bg-stone-50 shrink-0"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <span className="text-[10px] font-bold text-[#B8833E] uppercase tracking-wider block">{p.category}</span>
                          <h3 className="font-serif text-sm font-bold text-[#37411A] leading-snug truncate">{p.name}</h3>
                          <div className="flex items-center gap-1">
                            <div className="flex text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <FiStar key={i} className={`w-3 h-3 ${i < Math.round(p.averageRating) ? 'fill-current' : 'text-stone-200'}`} />
                              ))}
                            </div>
                            <span className="font-bold text-[11px] text-stone-500 ml-0.5">{p.averageRating > 0 ? p.averageRating : '0.0'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 bg-[#FDFBF7] border border-[#EDE7D9]/60 rounded-xl p-2.5 text-center text-xs font-sans">
                        <div>
                          <span className="text-[8px] text-stone-400 font-bold uppercase block">Total</span>
                          <span className="font-bold text-[#37411A] text-[11px]">{p.totalReviews}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-amber-500 font-bold uppercase block">Pending</span>
                          <span className="font-bold text-amber-600 text-[11px]">{p.pendingReviews}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-[#4E641A] font-bold uppercase block">Approved</span>
                          <span className="font-bold text-[#4E641A] text-[11px]">{p.approvedReviews}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-105">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/reviews/${p.id}`)}
                          className="w-full py-2.5 bg-[#4E641A] hover:bg-[#37411A] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-sm font-sans"
                        >
                          <span>Manage Reviews</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 7.6.5: PRODUCT-SPECIFIC REVIEW MANAGEMENT */}
        {activeTab === 'reviews-detail' && selectedProductDetails && (
          <div className="space-y-8 animate-fade-in w-full text-left">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EDE7D9]">
              <div className="space-y-1 text-left font-sans">
                <div className="flex items-center space-x-2 text-[9px] font-extrabold tracking-widest uppercase text-stone-400">
                  <button 
                    type="button"
                    onClick={() => navigate('/admin/reviews')}
                    className="cursor-pointer hover:text-[#4E641A] bg-transparent border-none p-0 font-extrabold tracking-widest uppercase text-stone-400"
                  >
                    Reviews Summary
                  </button>
                  <span>/</span>
                  <span className="text-[#B8833E]">{selectedProductDetails.name}</span>
                </div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#37411A] flex items-center gap-3 mt-1">
                  <span>Manage Reviews</span>
                  <span className="text-xs bg-[#4E641A]/10 text-[#4E641A] border border-[#4E641A]/20 px-2 py-0.5 rounded-full font-sans font-bold">
                    {selectedProductDetails.category}
                  </span>
                </h1>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/reviews')}
                className="px-4 py-2 border border-[#EDE7D9] text-[#37411A] hover:bg-[#EDE7D9]/50 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer bg-white"
              >
                ← Back to Dashboard
              </button>
            </div>

            {/* Product Information & Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Card Info */}
              <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-sm flex items-center gap-4 col-span-1">
                <img
                  src={selectedProductDetails.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150'}
                  alt={selectedProductDetails.name}
                  className="w-20 h-20 object-cover rounded-2xl border border-[#EDE7D9] bg-stone-50"
                />
                <div className="text-left space-y-1 min-w-0">
                  <h3 className="font-serif text-base font-bold text-[#37411A] leading-tight truncate">{selectedProductDetails.name}</h3>
                  <div className="flex items-center gap-1.5 font-sans">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={`w-3.5 h-3.5 ${i < Math.round(selectedProductDetails.averageRating) ? 'fill-current' : 'text-stone-200'}`} />
                      ))}
                    </div>
                    <span className="font-bold text-xs text-stone-600">{selectedProductDetails.averageRating > 0 ? selectedProductDetails.averageRating : '0.0'}</span>
                  </div>
                  <span className="font-sans text-[10px] text-stone-400 uppercase tracking-wider block mt-1">ID: {selectedProductDetails.id.substring(0, 8)}...</span>
                </div>
              </div>

              {/* Stats Columns */}
              <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-sm col-span-1 lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl p-4 text-center flex flex-col justify-center">
                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400 font-sans font-bold">Total Reviews</span>
                  <div className="text-xl font-bold text-[#37411A] mt-1 font-serif">{selectedProductDetails.totalReviews}</div>
                </div>
                <div className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl p-4 text-center flex flex-col justify-center">
                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400 font-sans text-amber-600 font-bold">Pending</span>
                  <div className="text-xl font-bold text-amber-655 mt-1 font-serif">{selectedProductDetails.pendingReviews}</div>
                </div>
                <div className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl p-4 text-center flex flex-col justify-center">
                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400 font-sans text-[#4E641A] font-bold">Approved</span>
                  <div className="text-xl font-bold text-[#4E641A] mt-1 font-serif">{selectedProductDetails.approvedReviews}</div>
                </div>
                <div className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl p-4 text-center flex flex-col justify-center">
                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400 font-sans text-red-500 font-bold">Rejected</span>
                  <div className="text-xl font-bold text-red-500 mt-1 font-serif">{selectedProductDetails.rejectedReviews}</div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border border-[#EDE7D9] p-4 rounded-2xl shadow-sm">
              <div className="flex flex-wrap gap-2 select-none">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setReviewFilter(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                      reviewFilter === f
                        ? 'bg-[#4E641A] text-white'
                        : 'bg-cream-bg border border-[#EDE7D9] text-stone-600 hover:bg-[#EDE7D9]/50'
                    } cursor-pointer border-none`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72 select-none">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search Review or Customer..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-2 px-10 focus:outline-none focus:border-[#4E641A] text-xs text-[#37411A]"
                />
              </div>
            </div>

            {/* Edit Review Modal */}
            {showReviewModal && (
              <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-md animate-scale-up max-w-xl mx-auto space-y-5">
                <h3 className="font-serif text-lg font-bold text-[#B8833E]">Edit Review Details</h3>
                <form noValidate onSubmit={handleSaveReview} className="space-y-4 text-xs text-stone-500">
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Customer Name</label>
                    <input
                      type="text"
                      value={reviewForm.customerName}
                      onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Rating (1 to 5)</label>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value, 10) })}
                        className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                      >
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Status</label>
                      <select
                        value={reviewForm.status}
                        onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                        className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Review Title</label>
                    <input
                      type="text"
                      value={reviewForm.reviewTitle}
                      onChange={(e) => setReviewForm({ ...reviewForm, reviewTitle: e.target.value })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Review Text</label>
                    <textarea
                      value={reviewForm.reviewText}
                      onChange={(e) => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
                      rows={4}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A] resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="px-5 py-3 border border-stone-200 text-stone-500 rounded-xl hover:bg-stone-50 uppercase font-bold tracking-wider cursor-pointer font-sans"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#4E641A] hover:bg-[#37411A] text-white rounded-xl uppercase font-extrabold tracking-wider border-none shadow cursor-pointer font-sans"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Reviews Table */}
            {filteredReviews.length === 0 ? (
              <EmptyState
                title="⭐ No Reviews Found"
                description="There are no reviews for this product matching your filters."
                illustration="⭐"
              />
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden lg:block bg-white border border-[#EDE7D9] rounded-[28px] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs text-stone-500 font-sans">
                      <thead className="bg-[#FDFBF7] border-b border-[#EDE7D9] text-[#B8833E]">
                        <tr>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none font-bold">Customer Name</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none w-24 font-bold">Rating</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none font-bold">Review Title</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none font-bold">Review Text</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none font-bold">Submitted Date</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none w-24 font-bold">Status</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none text-right font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDE7D9]">
                        {filteredReviews.map((rev) => (
                          <tr key={rev.id} className="hover:bg-[#FDFBF7] transition">
                            <td className="py-4 px-6 font-bold text-[#37411A]">{rev.customerName || 'Anonymous'}</td>
                            <td className="py-4 px-6 font-sans">
                              <div className="flex text-amber-500 font-sans">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-stone-200'}`} />
                                ))}
                              </div>
                            </td>
                            <td className="py-4 px-6 font-serif text-[#37411A] font-bold">{rev.reviewTitle || '-'}</td>
                            <td className="py-4 px-6 max-w-sm">
                              <div className="font-light text-stone-600 leading-relaxed font-sans">{rev.reviewText || rev.comment}</div>
                              {rev.reviewImages && rev.reviewImages.length > 0 && (
                                <div className="flex gap-1.5 mt-2">
                                  {rev.reviewImages.map((img, idx) => (
                                    <img key={idx} src={img} alt="review" className="w-10 h-10 object-cover rounded-lg border border-stone-200" />
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-6 font-sans text-stone-400">{new Date(rev.createdAt).toLocaleDateString()}</td>
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                rev.status === 'APPROVED'
                                  ? 'bg-green-50 text-[#4E641A] border border-green-200'
                                  : rev.status === 'REJECTED'
                                    ? 'bg-red-50 text-red-500 border border-red-200'
                                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                              }`}>
                                {rev.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex justify-end gap-1.5 select-none">
                                {rev.status !== 'APPROVED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleApproveReview(rev.id)}
                                    className="px-2 py-1 bg-green-50 text-[#4E641A] border border-green-200 hover:bg-[#4E641A] hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer transition shadow-sm font-sans"
                                    title="Approve Review"
                                  >
                                    Approve
                                  </button>
                                )}
                                {rev.status !== 'REJECTED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleRejectReview(rev.id)}
                                    className="px-2 py-1 bg-amber-50 text-amber-655 border border-amber-200 hover:bg-amber-600 hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer transition shadow-sm font-sans"
                                    title="Reject Review"
                                  >
                                    Reject
                                  </button>
                                )}
                                {rev.status === 'APPROVED' && (
                                  <button
                                    type="button"
                                    onClick={() => handlePromoteReview(rev)}
                                    className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer transition shadow-sm font-sans"
                                    title="Promote to Testimonial"
                                  >
                                    Promote
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReviewForm({
                                      id: rev.id,
                                      customerName: rev.customerName || '',
                                      rating: rev.rating,
                                      reviewTitle: rev.reviewTitle || '',
                                      reviewText: rev.reviewText || rev.comment || '',
                                      status: rev.status
                                    });
                                    setShowReviewModal(true);
                                  }}
                                  className="p-1.5 border border-[#EDE7D9] hover:border-[#4E641A]/30 text-stone-500 hover:text-[#4E641A] rounded-lg cursor-pointer bg-white"
                                  title="Edit"
                                >
                                  <FiEdit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(rev.id)}
                                  className="p-1.5 border border-red-200 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer bg-white"
                                  title="Delete"
                                >
                                  <FiTrash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card List View */}
                <div className="block lg:hidden space-y-4">
                  {filteredReviews.map((rev) => (
                    <div key={rev.id} className="bg-white border border-[#EDE7D9] rounded-2xl p-4.5 space-y-3 shadow-sm text-left flex flex-col">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <h4 className="font-serif font-bold text-sm text-[#37411A]">{rev.customerName || 'Anonymous'}</h4>
                          <span className="text-[10px] text-stone-400 block font-sans">
                            {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          rev.status === 'APPROVED'
                            ? 'bg-green-50 text-[#4E641A] border border-green-200'
                            : rev.status === 'REJECTED'
                              ? 'bg-red-50 text-red-500 border border-red-200'
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>
                          {rev.status}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-stone-200'}`} />
                          ))}
                        </div>
                        {rev.reviewTitle && (
                          <h5 className="font-serif text-xs font-bold text-[#37411A]">{rev.reviewTitle}</h5>
                        )}
                        <p className="font-light text-stone-600 leading-relaxed font-sans text-xs">{rev.reviewText || rev.comment}</p>
                        {rev.reviewImages && rev.reviewImages.length > 0 && (
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {rev.reviewImages.map((img, idx) => (
                              <img key={idx} src={img} alt="review" className="w-12 h-12 object-cover rounded-lg border border-stone-200" />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3.5 select-none">
                        {/* Primary Moderation Actions */}
                        <div className="flex gap-1.5 flex-wrap">
                          {rev.status !== 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => handleApproveReview(rev.id)}
                              className="px-2.5 py-1.5 bg-green-50 text-[#4E641A] border border-green-200 hover:bg-[#4E641A] hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition shadow-sm font-sans"
                            >
                              Approve
                            </button>
                          )}
                          {rev.status !== 'REJECTED' && (
                            <button
                              type="button"
                              onClick={() => handleRejectReview(rev.id)}
                              className="px-2.5 py-1.5 bg-amber-50 text-amber-655 border border-amber-200 hover:bg-amber-600 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition shadow-sm font-sans"
                            >
                              Reject
                            </button>
                          )}
                          {rev.status === 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => handlePromoteReview(rev)}
                              className="px-2.5 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition shadow-sm font-sans"
                            >
                              Promote
                            </button>
                          )}
                        </div>
                        
                        {/* Edit & Delete Actions */}
                        <div className="flex gap-2 ml-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setReviewForm({
                                id: rev.id,
                                customerName: rev.customerName || '',
                                rating: rev.rating,
                                reviewTitle: rev.reviewTitle || '',
                                reviewText: rev.reviewText || rev.comment || '',
                                status: rev.status
                              });
                              setShowReviewModal(true);
                            }}
                            className="p-2 border border-[#EDE7D9] hover:border-[#4E641A]/30 text-stone-500 hover:text-[#4E641A] rounded-lg cursor-pointer bg-white"
                            title="Edit"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-2 border border-red-200 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer bg-white"
                            title="Delete"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 7.7: TESTIMONIALS CMS */}
        {activeTab === 'testimonials' && (
          <div className="space-y-8 animate-fade-in w-full text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EDE7D9]">
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#B8833E]">CONTENT MANAGEMENT</span>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#37411A]">Testimonials CMS</h1>
              </div>
              <button
                onClick={() => {
                  setTestimonialForm({
                    id: '',
                    customerName: '',
                    location: '',
                    testimonialText: '',
                    rating: 5,
                    customerPhoto: '',
                    productPurchased: '',
                    featuredToggle: false,
                    isActive: true
                  });
                  setShowTestimonialModal(true);
                }}
                className="px-5 py-3 bg-[#4E641A] hover:bg-[#37411A] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center space-x-2 shadow border-none cursor-pointer"
              >
                <FiPlus className="w-4 h-4 text-[#B8833E]" />
                <span>Add Testimonial</span>
              </button>
            </div>

            {/* Create/Edit Testimonial Modal */}
            {showTestimonialModal && (
              <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-md animate-scale-up max-w-4xl mx-auto space-y-5">
                <h3 className="font-serif text-lg font-bold text-[#B8833E]">
                  {testimonialForm.id ? 'Modify Testimonial' : 'Add New Testimonial'}
                </h3>
                <form noValidate onSubmit={handleSaveTestimonial} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-500">
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Customer Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Radhika Deshmukh"
                      value={testimonialForm.customerName}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, customerName: e.target.value })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Location / Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Chennai or Mother & Yogi"
                      value={testimonialForm.location}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, location: e.target.value })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Rating (1 to 5)</label>
                    <select
                      value={testimonialForm.rating}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value, 10) })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A] h-[42px]"
                    >
                      {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Product Purchased / Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Traditional Village Ghee"
                      value={testimonialForm.productPurchased}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, productPurchased: e.target.value })}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left sm:col-span-2">
                    <UnifiedUploader
                      value={testimonialForm.customerPhoto}
                      onChange={(url) => setTestimonialForm({ ...testimonialForm, customerPhoto: url })}
                      label="Customer Photo"
                      aspectRatio={1}
                      folder="testimonials"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left sm:col-span-2">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Testimonial Text *</label>
                    <textarea
                      placeholder="What is their pure experience description..."
                      value={testimonialForm.testimonialText}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, testimonialText: e.target.value })}
                      rows={4}
                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A] resize-none"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-6 py-2 select-none sm:col-span-2">
                    <label className="flex items-center space-x-2 cursor-pointer font-sans font-bold">
                      <input
                        type="checkbox"
                        checked={testimonialForm.featuredToggle}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, featuredToggle: e.target.checked })}
                        className="h-4 w-4 rounded border-[#EDE7D9] text-[#4E641A] focus:ring-[#4E641A] cursor-pointer"
                      />
                      <span>Featured Slider</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer font-sans font-bold">
                      <input
                        type="checkbox"
                        checked={testimonialForm.isActive}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, isActive: e.target.checked })}
                        className="h-4 w-4 rounded border-[#EDE7D9] text-[#4E641A] focus:ring-[#4E641A] cursor-pointer"
                      />
                      <span>Published</span>
                    </label>
                  </div>

                  <div className="flex gap-3 justify-end sm:col-span-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowTestimonialModal(false)}
                      className="px-5 py-3 border border-stone-200 text-stone-500 rounded-xl hover:bg-stone-50 uppercase font-bold tracking-wider cursor-pointer font-sans"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#4E641A] hover:bg-[#37411A] text-white rounded-xl uppercase font-extrabold tracking-wider border-none shadow cursor-pointer font-sans"
                    >
                      Save Testimonial
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Testimonials List */}
            {testimonialsList.length === 0 ? (
              <EmptyState
                title="No Testimonials Yet"
                description="Create testimonials manually or promote approved reviews to testimonials to display them on the storefront."
                illustration="💬"
                actionLabel="Create Testimonial"
                onAction={() => setShowTestimonialModal(true)}
              />
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden lg:block bg-white border border-[#EDE7D9] rounded-[28px] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs text-stone-500 font-sans">
                      <thead className="bg-[#FDFBF7] border-b border-[#EDE7D9] text-[#B8833E]">
                        <tr>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none">Customer Name</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none w-24">Rating</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none">Testimonial Text</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none">Product</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none w-24">Status</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none w-28">Featured</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-wider select-none text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDE7D9]">
                        {testimonialsList.map((test) => (
                          <tr key={test.id} className="hover:bg-[#FDFBF7] transition">
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#4E641A]/10 border border-[#EDE7D9] flex items-center justify-center font-bold text-[#4E641A] font-serif overflow-hidden shrink-0">
                                  {test.customerPhoto && (test.customerPhoto.startsWith('http') || test.customerPhoto.includes('/')) ? (
                                    <img src={test.customerPhoto} alt={test.customerName} className="w-full h-full object-cover" />
                                  ) : (
                                    test.customerPhoto || (test.customerName ? test.customerName.charAt(0) : 'C')
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-[#37411A] font-serif">{test.customerName}</span>
                                  {test.location && <span className="text-[10px] text-stone-400 font-medium">{test.location}</span>}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 font-sans">
                              <div className="flex text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar key={i} className={`w-3.5 h-3.5 ${i < test.rating ? 'fill-current' : 'text-stone-200'}`} />
                                ))}
                              </div>
                            </td>
                            <td className="py-4 px-6 max-w-sm">
                              <p className="font-light text-stone-600 leading-relaxed font-sans italic">
                                "{test.testimonialText}"
                              </p>
                            </td>
                            <td className="py-4 px-6 font-medium text-[#37411A] font-sans">
                              {test.productPurchased || '-'}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                test.isActive
                                  ? 'bg-green-50 text-[#4E641A] border border-green-200'
                                  : 'bg-stone-50 text-stone-400 border border-stone-200'
                              }`}>
                                {test.isActive ? 'Active' : 'Draft'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                test.featuredToggle
                                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                  : 'bg-stone-50 text-stone-400 border border-stone-200'
                              }`}>
                                {test.featuredToggle ? 'Featured' : 'Standard'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right text-xs">
                              <div className="flex justify-end gap-1.5 select-none">
                                <button
                                  type="button"
                                  onClick={() => handleToggleTestimonialActive(test)}
                                  className={`px-2.5 py-1 border rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer transition shadow-sm font-sans ${
                                    test.isActive
                                      ? 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                                      : 'bg-green-50 text-[#4E641A] border-green-200 hover:bg-[#4E641A] hover:text-white'
                                  }`}
                                  title={test.isActive ? 'Unpublish Testimonial' : 'Publish Testimonial'}
                                >
                                  {test.isActive ? 'Unpublish' : 'Publish'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleTestimonialFeatured(test)}
                                  className={`px-2.5 py-1 border rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer transition shadow-sm font-sans ${
                                    test.featuredToggle
                                      ? 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                                      : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-600 hover:text-white'
                                  }`}
                                  title={test.featuredToggle ? 'Unfeature Testimonial' : 'Feature Testimonial'}
                                >
                                  {test.featuredToggle ? 'Unfeature' : 'Feature'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTestimonialForm({
                                      id: test.id,
                                      customerName: test.customerName,
                                      location: test.location || '',
                                      testimonialText: test.testimonialText,
                                      rating: test.rating,
                                      customerPhoto: test.customerPhoto || '',
                                      productPurchased: test.productPurchased || '',
                                      featuredToggle: test.featuredToggle,
                                      isActive: test.isActive
                                    });
                                    setShowTestimonialModal(true);
                                  }}
                                  className="p-1.5 border border-[#EDE7D9] hover:border-[#4E641A]/30 text-stone-500 hover:text-[#4E641A] rounded-lg cursor-pointer bg-white"
                                  title="Edit"
                                >
                                  <FiEdit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTestimonial(test.id)}
                                  className="p-1.5 border border-red-200 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer bg-white"
                                  title="Delete"
                                >
                                  <FiTrash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card List View */}
                <div className="block lg:hidden space-y-4">
                  {testimonialsList.map((test) => (
                    <div key={test.id} className="bg-white border border-[#EDE7D9] rounded-2xl p-4.5 space-y-3 shadow-sm text-left flex flex-col">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-full bg-[#4E641A]/10 border border-[#EDE7D9] flex items-center justify-center font-bold text-[#4E641A] font-serif overflow-hidden shrink-0">
                          {test.customerPhoto && (test.customerPhoto.startsWith('http') || test.customerPhoto.includes('/')) ? (
                            <img src={test.customerPhoto} alt={test.customerName} className="w-full h-full object-cover" />
                          ) : (
                            test.customerPhoto || (test.customerName ? test.customerName.charAt(0) : 'C')
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-bold text-sm text-[#37411A] font-serif truncate">{test.customerName}</span>
                          {test.location && <span className="text-[10px] text-stone-400 font-medium truncate">{test.location}</span>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} className={`w-3 h-3 ${i < test.rating ? 'fill-current' : 'text-stone-200'}`} />
                          ))}
                        </div>
                        {test.productPurchased && (
                          <span className="text-[9px] bg-stone-50 border border-stone-200/60 text-stone-500 px-2 py-0.5 rounded-full font-sans font-medium">
                            {test.productPurchased}
                          </span>
                        )}
                      </div>

                      <p className="font-light text-stone-600 leading-relaxed font-sans text-xs italic">
                        "{test.testimonialText}"
                      </p>

                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          test.isActive
                            ? 'bg-green-50 text-[#4E641A] border border-green-200'
                            : 'bg-stone-50 text-stone-400 border border-stone-200'
                        }`}>
                          {test.isActive ? 'Active' : 'Draft'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          test.featuredToggle
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-stone-50 text-stone-400 border border-[#EDE7D9]'
                        }`}>
                          {test.featuredToggle ? 'Featured' : 'Standard'}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex flex-col gap-2 select-none">
                        <div className="flex justify-between items-center w-full gap-2">
                          <div className="flex gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleToggleTestimonialActive(test)}
                              className={`px-2.5 py-1.5 border rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer transition shadow-sm font-sans ${
                                test.isActive
                                  ? 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                                  : 'bg-green-50 text-[#4E641A] border-green-200 hover:bg-[#4E641A] hover:text-white'
                              }`}
                            >
                              {test.isActive ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleTestimonialFeatured(test)}
                              className={`px-2.5 py-1.5 border rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer transition shadow-sm font-sans ${
                                test.featuredToggle
                                  ? 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                                  : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-600 hover:text-white'
                              }`}
                            >
                              {test.featuredToggle ? 'Unfeature' : 'Feature'}
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setTestimonialForm({
                                  id: test.id,
                                  customerName: test.customerName,
                                  location: test.location || '',
                                  testimonialText: test.testimonialText,
                                  rating: test.rating,
                                  customerPhoto: test.customerPhoto || '',
                                  productPurchased: test.productPurchased || '',
                                  featuredToggle: test.featuredToggle,
                                  isActive: test.isActive
                                });
                                setShowTestimonialModal(true);
                              }}
                              className="p-2 border border-[#EDE7D9] hover:border-[#4E641A]/30 text-stone-500 hover:text-[#4E641A] rounded-lg cursor-pointer bg-white"
                              title="Edit"
                            >
                              <FiEdit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTestimonial(test.id)}
                              className="p-2 border border-red-200 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer bg-white"
                              title="Delete"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 8: HOMEPAGE CAMPAIGN CMS */}
        {activeTab === 'homepage' && (
          <div className="space-y-8 animate-fade-in w-full text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EDE7D9]">
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#B8833E]">MARKETING CMS</span>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#37411A]">Homepage & Campaigns</h1>
              </div>
              {selectedSubTab === 'hero' && !isEditingHero && (
                <button
                  onClick={() => { resetHeroForm(); setIsEditingHero(true); }}
                  className="px-5 py-3 bg-[#4E641A] hover:bg-[#37411A] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center space-x-1.5 shadow border-none cursor-pointer"
                >
                  <FiPlus />
                  <span>Create Hero Layout</span>
                </button>
              )}
              {selectedSubTab === 'collections' && !isEditingCollection && (
                <button
                  onClick={() => { resetCollectionForm(); setIsEditingCollection(true); }}
                  className="px-5 py-3 bg-[#4E641A] hover:bg-[#37411A] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center space-x-1.5 shadow border-none cursor-pointer"
                >
                  <FiPlus />
                  <span>Create Collection</span>
                </button>
              )}
              {selectedSubTab === 'categories' && !isEditingHPCat && (
                <button
                  onClick={() => { resetHPCatForm(); setIsEditingHPCat(true); }}
                  className="px-5 py-3 bg-[#4E641A] hover:bg-[#37411A] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center space-x-1.5 shadow border-none cursor-pointer"
                >
                  <FiPlus />
                  <span>Add Homepage Category</span>
                </button>
              )}
            </div>

            {/* Sub-tab navigation */}
            <div className="flex space-x-6 border-b border-[#EDE7D9] pb-1 font-sans text-xs">
              {[
                { id: 'hero', label: 'Hero Section' },
                { id: 'collections', label: 'Signature Collections' },
                { id: 'categories', label: 'Promo Categories' },
                { id: 'sections', label: 'Section Ordering' }
              ].map((sub) => {
                const isActive = selectedSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => { setSelectedSubTab(sub.id); setIsEditingCollection(false); setIsEditingHPCat(false); setIsEditingHero(false); }}
                    className={`py-3 px-1 font-bold uppercase tracking-wider transition relative border-none bg-transparent cursor-pointer ${
                      isActive ? 'text-[#4E641A]' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <span>{sub.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4E641A]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Main content grid split */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* Left Editing Side */}
              <div className="xl:col-span-7 space-y-6">
                
                {/* SUBTAB 0: HERO SECTION EDITOR */}
                {selectedSubTab === 'hero' && (
                  <div className="space-y-6">
                    {isEditingHero ? (
                      <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-sm space-y-5">
                        <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                          <h3 className="font-serif text-base font-bold text-[#B8833E]">
                            {heroForm.id ? 'Edit Hero Section Layout' : 'Create Hero Section Copy'}
                          </h3>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => loadHeroTemplate('default')}
                              className="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded text-[9px] font-bold uppercase cursor-pointer"
                            >
                              🌿 Default Vaaradhi
                            </button>
                            <button
                              type="button"
                              onClick={() => loadHeroTemplate('premium')}
                              className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded text-[9px] font-bold uppercase cursor-pointer"
                            >
                              🛢️ Premium Oils
                            </button>
                          </div>
                        </div>

                        <form noValidate onSubmit={handleSaveHero} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600">
                          
                          {/* LEFT CONTENT */}
                          <div className="sm:col-span-2 border-b border-stone-100 pb-2">
                            <h4 className="font-serif text-xs font-bold text-[#4E641A] uppercase tracking-wider">Left Content Elements</h4>
                          </div>

                          <div className="flex flex-col gap-1 text-left sm:col-span-2">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Top Trust Badge Text</label>
                            <input
                              type="text"
                              value={heroForm.trustBadgeText}
                              onChange={(e) => setHeroForm({ ...heroForm, trustBadgeText: e.target.value })}
                              placeholder="e.g. Loved by 12,000+ Indian Families (4.9★)"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Main Heading Line 1 *</label>
                            <input
                              type="text"
                              value={heroForm.headingLine1}
                              onChange={(e) => setHeroForm({ ...heroForm, headingLine1: e.target.value })}
                              placeholder="e.g. Pristine Vedic Staples"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                              required
                            />
                            {heroFormErrors.headingLine1 && (
                              <span className="text-[10px] text-red-650 font-bold block mt-1 select-none">
                                ⚠️ {heroFormErrors.headingLine1}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Highlighted Italic Subtitle</label>
                            <input
                              type="text"
                              value={heroForm.headingHighlight}
                              onChange={(e) => setHeroForm({ ...heroForm, headingHighlight: e.target.value })}
                              placeholder="e.g. Hand-Extracted"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left sm:col-span-2">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Heading Line 2</label>
                            <input
                              type="text"
                              value={heroForm.headingLine2}
                              onChange={(e) => setHeroForm({ ...heroForm, headingLine2: e.target.value })}
                              placeholder="e.g. Direct From Wardha Valley"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left sm:col-span-2">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Description Paragraph</label>
                            <textarea
                              value={heroForm.description}
                              onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                              placeholder="We preserve heirloom seeds, practice strictly chemical-free cultivation..."
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] h-20 resize-none font-sans text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Bullet point 1</label>
                            <input
                              type="text"
                              value={heroForm.bulletOne}
                              onChange={(e) => setHeroForm({ ...heroForm, bulletOne: e.target.value })}
                              placeholder="Chemical-Free Soil"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Bullet point 2</label>
                            <input
                              type="text"
                              value={heroForm.bulletTwo}
                              onChange={(e) => setHeroForm({ ...heroForm, bulletTwo: e.target.value })}
                              placeholder="Vedic Bilona Churned"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Bullet point 3</label>
                            <input
                              type="text"
                              value={heroForm.bulletThree}
                              onChange={(e) => setHeroForm({ ...heroForm, bulletThree: e.target.value })}
                              placeholder="Wood Pressed Ghanis"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Bullet point 4</label>
                            <input
                              type="text"
                              value={heroForm.bulletFour}
                              onChange={(e) => setHeroForm({ ...heroForm, bulletFour: e.target.value })}
                              placeholder="No Added Preservatives"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">CTA Button 1 Text</label>
                            <input
                              type="text"
                              value={heroForm.primaryButtonText}
                              onChange={(e) => setHeroForm({ ...heroForm, primaryButtonText: e.target.value })}
                              placeholder="Shop Now"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">CTA Button 1 Link</label>
                            <input
                              type="text"
                              value={heroForm.primaryButtonLink}
                              onChange={(e) => setHeroForm({ ...heroForm, primaryButtonLink: e.target.value })}
                              placeholder="/"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">CTA Button 2 Text</label>
                            <input
                              type="text"
                              value={heroForm.secondaryButtonText}
                              onChange={(e) => setHeroForm({ ...heroForm, secondaryButtonText: e.target.value })}
                              placeholder="Explore Collections"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">CTA Button 2 Link</label>
                            <input
                              type="text"
                              value={heroForm.secondaryButtonLink}
                              onChange={(e) => setHeroForm({ ...heroForm, secondaryButtonLink: e.target.value })}
                              placeholder="/"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left sm:col-span-2">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Promo Coupon Bar Text (Empty hides promo bar)</label>
                            <input
                              type="text"
                              value={heroForm.promoText}
                              onChange={(e) => setHeroForm({ ...heroForm, promoText: e.target.value })}
                              placeholder="Use Code: SURYODAYA10 to get 10% Extra Soil Credits"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          {/* RIGHT PRODUCT CARD */}
                          <div className="sm:col-span-2 border-b border-stone-100 pb-2 mt-2">
                            <h4 className="font-serif text-xs font-bold text-[#4E641A] uppercase tracking-wider">Right Product Card Elements</h4>
                          </div>

                          <div className="flex flex-col gap-1 text-left sm:col-span-2">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Featured Product Connection (Auto-loads title, price, stock)</label>
                            <select
                              value={heroForm.featuredProductId}
                              onChange={(e) => {
                                const selectedId = e.target.value;
                                const prod = products.find(p => p.id === selectedId);
                                const imageSrc = prod ? (prod.images?.length > 0 ? prod.images[0].url : prod.image || heroForm.heroImage) : heroForm.heroImage;
                                setHeroForm({
                                  ...heroForm,
                                  featuredProductId: selectedId,
                                  heroImage: imageSrc
                                });
                              }}
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            >
                              <option value="">None (Static Card Visuals)</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5 text-left sm:col-span-2">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#4E641A]">Upload Showcase Image</label>
                            
                            <div className="flex flex-col sm:flex-row gap-4 items-center bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl p-4">
                              <div className="w-20 h-20 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 shrink-0 flex items-center justify-center relative">
                                {heroForm.heroImage ? (
                                  <img src={heroForm.heroImage} className="w-full h-full object-cover" alt="Showcase Thumbnail" />
                                ) : (
                                  <FiImage size={24} className="text-stone-300" />
                                )}
                              </div>

                              <div className="flex-1 w-full space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  <label className="px-4 py-2 bg-[#4E641A] hover:bg-[#37411A] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition select-none flex items-center gap-1.5 shadow-sm">
                                    <FiImage size={12} />
                                    {isUploading ? 'Uploading...' : heroForm.heroImage ? 'Change Image' : 'Upload Image'}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setIsUploading(true);
                                        const reader = new FileReader();
                                        reader.onload = async (event) => {
                                          const base64 = event.target.result;
                                          try {
                                            const response = await api.post('/admin/homepage/upload-cloudinary', { image: base64 });
                                            if (response.success && response.url) {
                                              setHeroForm((prev) => ({
                                                ...prev,
                                                heroImage: response.url,
                                                cropX: null,
                                                cropY: null,
                                                cropWidth: null,
                                                cropHeight: null,
                                                zoom: 1,
                                                aspectRatio: ''
                                              }));
                                              setCropTarget(response.url);
                                            }
                                          } catch (err) {
                                            modal.alert('Upload Failed', err.message, 'error');
                                          } finally {
                                            setIsUploading(false);
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }}
                                      className="hidden"
                                      disabled={isUploading}
                                    />
                                  </label>

                                  {heroForm.heroImage && (
                                    <button
                                      type="button"
                                      onClick={() => setCropTarget(heroForm.heroImage)}
                                      className="px-4 py-2 border border-stone-200 text-stone-600 hover:bg-stone-50 text-[10px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer"
                                    >
                                      Crop & Adjust Framing
                                    </button>
                                  )}

                                  {heroForm.heroImage && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setHeroForm((prev) => ({
                                          ...prev,
                                          heroImage: '',
                                          cropX: null,
                                          cropY: null,
                                          cropWidth: null,
                                          cropHeight: null,
                                          zoom: 1,
                                          aspectRatio: ''
                                        }));
                                      }}
                                      className="px-4 py-2 text-red-500 hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer border-none bg-transparent"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                                <p className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">
                                  {heroForm.cropWidth ? `✓ Crop & Adjust Applied (${heroForm.cropWidth}x${heroForm.cropHeight})` : '⚠ Image not yet cropped (Using default fit)'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 text-left sm:col-span-2">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Offer Badge Overlay Text</label>
                            <input
                              type="text"
                              value={heroForm.offerBadgeText}
                              onChange={(e) => setHeroForm({ ...heroForm, offerBadgeText: e.target.value })}
                              placeholder="e.g. 15% OFF"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Floating Badge Title</label>
                            <input
                              type="text"
                              value={heroForm.floatingBadgeTitle}
                              onChange={(e) => setHeroForm({ ...heroForm, floatingBadgeTitle: e.target.value })}
                              placeholder="e.g. 100% Heirloom"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Floating Badge Subtitle</label>
                            <input
                              type="text"
                              value={heroForm.floatingBadgeSubtitle}
                              onChange={(e) => setHeroForm({ ...heroForm, floatingBadgeSubtitle: e.target.value })}
                              placeholder="e.g. Non-Hybrid seeds"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Slide Order (Position)</label>
                            <input
                              type="number"
                              min="0"
                              value={heroForm.slideOrder}
                              onChange={(e) => setHeroForm({ ...heroForm, slideOrder: parseInt(e.target.value, 10) || 0 })}
                              placeholder="0"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-6 text-left">
                            <input
                              type="checkbox"
                              id="hero-featured"
                              checked={heroForm.isFeatured}
                              onChange={(e) => setHeroForm({ ...heroForm, isFeatured: e.target.checked })}
                              className="w-4 h-4 text-[#4E641A] border-[#EDE7D9] rounded focus:ring-[#4E641A] cursor-pointer"
                            />
                            <label htmlFor="hero-featured" className="text-[10px] font-bold uppercase tracking-wider text-stone-600 cursor-pointer">
                              Featured Slide (Highlighted)
                            </label>
                          </div>

                          <div className="flex items-center gap-2 sm:col-span-2 pt-2 text-left">
                            <input
                              type="checkbox"
                              id="hero-active"
                              checked={heroForm.isActive}
                              onChange={(e) => setHeroForm({ ...heroForm, isActive: e.target.checked })}
                              className="w-4 h-4 text-[#4E641A] border-[#EDE7D9] rounded focus:ring-[#4E641A] cursor-pointer"
                            />
                            <label htmlFor="hero-active" className="text-[10px] font-bold uppercase tracking-wider text-stone-600 cursor-pointer">
                              Publish & Activate Immediately
                            </label>
                          </div>

                          <div className="sm:col-span-2 flex justify-end gap-3 mt-4">
                            <button
                              type="button"
                              onClick={() => { setIsEditingHero(false); resetHeroForm(); }}
                              className="px-5 py-3 rounded-xl border border-stone-200 text-stone-400 hover:bg-stone-50 uppercase font-bold tracking-wider cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isGlobalLoading}
                              className="px-6 py-3 bg-[#4E641A] hover:bg-[#37411A] disabled:bg-stone-300 text-white rounded-xl uppercase font-bold tracking-wider cursor-pointer border-none"
                            >
                              {isGlobalLoading ? 'Saving...' : 'Save Layout'}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Global Campaign Slider Settings */}
                        <div className="bg-white border border-[#EDE7D9] rounded-[22px] p-5 shadow-sm space-y-4 text-left w-full">
                          <div className="flex items-center space-x-2 border-b border-stone-100 pb-2">
                            <span className="text-stone-700">🎛️</span>
                            <h4 className="font-serif text-sm font-bold text-[#4E641A] uppercase tracking-wider">Campaign Slider Settings</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="slider-auto-rotate"
                                checked={settings.homepage_hero_auto_rotate !== 'false'}
                                onChange={(e) => updateSettings({ homepage_hero_auto_rotate: String(e.target.checked) })}
                                className="w-4 h-4 text-[#4E641A] border-[#EDE7D9] rounded focus:ring-[#4E641A] cursor-pointer"
                              />
                              <label htmlFor="slider-auto-rotate" className="font-bold text-stone-600 cursor-pointer">
                                Auto Rotation Enabled
                              </label>
                            </div>
                            <div className="flex items-center gap-3">
                              <label htmlFor="slider-duration" className="font-bold text-stone-600">
                                Slide Rotation Interval:
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  id="slider-duration"
                                  min="1"
                                  max="60"
                                  value={settings.homepage_hero_slide_duration || '5'}
                                  onChange={(e) => updateSettings({ homepage_hero_slide_duration: String(parseInt(e.target.value, 10) || 5) })}
                                  className="w-16 bg-[#FDFBF7] border border-[#EDE7D9] rounded-lg py-1 px-2 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                                />
                                <span className="text-[10px] text-stone-450">seconds</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {homepageHeroes.length === 0 ? (
                          <div className="bg-white border border-[#EDE7D9] rounded-2xl p-8 text-center text-stone-400 space-y-3 shadow-sm text-xs">
                            <p>No custom hero layout records exist in the database.</p>
                            <button
                              onClick={() => { resetHeroForm(); loadHeroTemplate('default'); setIsEditingHero(true); }}
                              className="px-4 py-2 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer border-none"
                            >
                              Seed From Vaaradhi Default Template
                            </button>
                          </div>
                        ) : (
                          [...homepageHeroes].sort((a, b) => (a.slideOrder || 0) - (b.slideOrder || 0)).map((hr) => (
                            <div key={hr.id} className="bg-white border border-[#EDE7D9] rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:border-[#B8833E]/20 transition text-left w-full">
                              <div className="flex gap-4 items-start min-w-0">
                                <img
                                  src={hr.heroImage || 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=150'}
                                  alt={hr.headingLine1}
                                  className="w-16 h-16 object-cover rounded-xl border border-[#EDE7D9] bg-stone-50 shrink-0"
                                />
                                <div className="flex flex-col text-left min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-serif text-sm font-bold text-[#37411A] truncate">{hr.headingLine1}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase border ${
                                      hr.isActive 
                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                        : 'bg-stone-50 text-stone-450 border-stone-200'
                                    }`}>
                                      {hr.isActive ? 'Active Live' : 'Draft'}
                                    </span>
                                    {hr.isFeatured && (
                                      <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase border bg-amber-50 text-amber-700 border-amber-200">
                                        ★ Featured
                                      </span>
                                    )}
                                    <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase border bg-blue-50 text-blue-700 border-blue-200">
                                      Order: {hr.slideOrder || 0}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-stone-450 mt-1 italic">{hr.headingHighlight}</span>
                                  <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                                    Modified: {new Date(hr.updatedAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                                <button
                                  onClick={() => handleToggleHeroActive(hr.id, hr.isActive)}
                                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition cursor-pointer border ${
                                    hr.isActive
                                      ? 'bg-red-50 text-red-650 hover:bg-red-150 border-red-200'
                                      : 'bg-green-50 text-green-700 hover:bg-green-150 border-green-200'
                                  }`}
                                >
                                  {hr.isActive ? 'Unpublish' : 'Publish'}
                                </button>
                                <button
                                  onClick={() => {
                                    setHeroForm({
                                      id: hr.id,
                                      trustBadgeText: hr.trustBadgeText || '',
                                      headingLine1: hr.headingLine1 || '',
                                      headingHighlight: hr.headingHighlight || '',
                                      headingLine2: hr.headingLine2 || '',
                                      description: hr.description || '',
                                      bulletOne: hr.bulletOne || '',
                                      bulletTwo: hr.bulletTwo || '',
                                      bulletThree: hr.bulletThree || '',
                                      bulletFour: hr.bulletFour || '',
                                      primaryButtonText: hr.primaryButtonText || '',
                                      primaryButtonLink: hr.primaryButtonLink || '',
                                      secondaryButtonText: hr.secondaryButtonText || '',
                                      secondaryButtonLink: hr.secondaryButtonLink || '',
                                      promoText: hr.promoText || '',
                                      heroImage: hr.heroImage || '',
                                      featuredProductId: hr.featuredProductId || '',
                                      offerBadgeText: hr.offerBadgeText || '',
                                      floatingBadgeTitle: hr.floatingBadgeTitle || '',
                                      floatingBadgeSubtitle: hr.floatingBadgeSubtitle || '',
                                      slideOrder: hr.slideOrder || 0,
                                      isFeatured: !!hr.isFeatured,
                                      isActive: hr.isActive,
                                      cropX: hr.cropX,
                                      cropY: hr.cropY,
                                      cropWidth: hr.cropWidth,
                                      cropHeight: hr.cropHeight,
                                      zoom: hr.zoom || 1,
                                      aspectRatio: hr.aspectRatio || ''
                                    });
                                    setIsEditingHero(true);
                                  }}
                                  className="p-2 text-[#4E641A] hover:bg-[#4E641A]/10 rounded-lg transition cursor-pointer bg-transparent border-none"
                                >
                                  <FiEdit2 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteHero(hr.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer bg-transparent border-none"
                                >
                                  <FiTrash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB 1: SIGNATURE COLLECTIONS */}
                {selectedSubTab === 'collections' && (
                  <div className="space-y-6">
                    {isEditingCollection ? (
                      <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-sm space-y-5 text-left">
                        <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                          <h3 className="font-serif text-base font-bold text-[#B8833E]">
                            {collectionForm.id ? 'Edit Collection Card Details' : 'Create Farm Collection Card'}
                          </h3>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => loadCollectionTemplate('oils')}
                              className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded text-[9px] font-bold uppercase cursor-pointer"
                            >
                              🫒 Oils Collection
                            </button>
                            <button
                              type="button"
                              onClick={() => loadCollectionTemplate('ghee')}
                              className="px-2.5 py-1 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded text-[9px] font-bold uppercase cursor-pointer"
                            >
                              🥛 Ghee Collection
                            </button>
                            <button
                              type="button"
                              onClick={() => loadCollectionTemplate('spices')}
                              className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded text-[9px] font-bold uppercase cursor-pointer"
                            >
                              🌶️ Spices Collection
                            </button>
                          </div>
                        </div>

                        <form noValidate onSubmit={handleSaveCollection} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600">
                          {/* Dynamic Category Linkage & Autofill Assist */}
                          <div className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl p-4 space-y-3 sm:col-span-2 text-left">
                            <div className="flex flex-col gap-2.5">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Select Homepage Category (Autofill Assist)</label>
                                <select
                                  value={selectedCategoryAssistId}
                                  onChange={(e) => handleCategoryAssistChange(e.target.value)}
                                  className="bg-white border border-[#EDE7D9] rounded-xl py-2.5 px-3 text-xs text-[#37411A] font-semibold focus:outline-none focus:border-[#4E641A] cursor-pointer w-full"
                                >
                                  <option value="">-- Select Category to Autofill --</option>
                                  {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                  ))}
                                </select>
                              </div>
                              
                              {selectedCategoryAssistId && (
                                <button
                                  type="button"
                                  onClick={handleSyncFromCategory}
                                  className="w-full py-2.5 bg-[#4E641A] hover:bg-[#37411A] text-white text-[9px] font-extrabold uppercase tracking-widest rounded-xl transition cursor-pointer border-none shadow-xxs shrink-0"
                                >
                                  Sync Latest Category Details
                                </button>
                              )}
                            </div>

                            {/* Compact Preview Card Visual Assistance */}
                            {(() => {
                              const selectedCat = categories.find(c => c.id === selectedCategoryAssistId);
                              if (!selectedCat) return null;
                              return (
                                <div className="flex items-center gap-3 bg-white border border-[#EDE7D9] rounded-xl p-3 shadow-xxs">
                                  {selectedCat.image ? (
                                    <img src={selectedCat.image} alt={selectedCat.name} className="w-10 h-10 object-cover rounded-lg border border-[#EDE7D9]" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-stone-50 border border-[#EDE7D9] flex items-center justify-center font-bold text-[10px] text-[#4E641A]">🌿</div>
                                  )}
                                  <div className="text-left leading-tight">
                                    <span className="block text-[10px] font-bold text-[#37411A]">{selectedCat.name}</span>
                                    <span className="block text-[8px] text-[#B8833E] font-semibold mt-0.5">{selectedCat._count?.products || 0} Linked Products</span>
                                    <span className="block text-[8px] text-stone-400 font-mono mt-0.5">Slug: {selectedCat.slug}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          <div className="flex flex-col gap-1 text-left sm:col-span-2">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Collection Title *</label>
                            <input
                              type="text"
                              value={collectionForm.title}
                              onChange={(e) => setCollectionForm({ ...collectionForm, title: e.target.value })}
                              placeholder="e.g. Pure Wood Pressed Oils"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                              required
                            />
                            {collectionFormErrors.title && (
                              <span className="text-[10px] text-red-650 font-bold block mt-1 select-none">
                                ⚠️ {collectionFormErrors.title}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col gap-1 text-left sm:col-span-2">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Collection Subtitle / Badge</label>
                            <input
                              type="text"
                              value={collectionForm.badge}
                              onChange={(e) => setCollectionForm({ ...collectionForm, badge: e.target.value })}
                              placeholder="e.g. WOOD GHANIS, BILONA CHURNED, FARM FRESH, STONE GROUND"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left sm:col-span-2">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Short Marketing Description</label>
                            <textarea
                              value={collectionForm.description}
                              onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
                              placeholder="e.g. Extracted under low heat using slow mechanical Vagai wood press logs..."
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] h-20 resize-none font-sans text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left sm:col-span-2">
                            <UnifiedUploader
                              value={collectionForm.image}
                              onChange={(url) => setCollectionForm({ ...collectionForm, image: url })}
                              label="Collection Image *"
                              aspectRatio={16/9}
                              folder="collections"
                            />
                            {collectionFormErrors.image && (
                              <span className="text-[10px] text-red-655 font-bold block mt-1 select-none">
                                ⚠️ {collectionFormErrors.image}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">CTA Button Text</label>
                            <input
                              type="text"
                              value={collectionForm.ctaText}
                              onChange={(e) => setCollectionForm({ ...collectionForm, ctaText: e.target.value })}
                              placeholder="e.g. Browse Oils Collection"
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Target Category Filter</label>
                            <select
                              value={collectionForm.categorySlug}
                              onChange={(e) => setCollectionForm({ ...collectionForm, categorySlug: e.target.value })}
                              className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A] h-[42px]"
                            >
                              <option value="all">Shop All (all)</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.slug}>{cat.name} ({cat.slug})</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2 sm:col-span-2 pt-2 text-left">
                            <input
                              type="checkbox"
                              id="coll-active"
                              checked={collectionForm.isActive}
                              onChange={(e) => setCollectionForm({ ...collectionForm, isActive: e.target.checked })}
                              className="w-4 h-4 text-[#4E641A] border-[#EDE7D9] rounded focus:ring-[#4E641A] cursor-pointer"
                            />
                            <label htmlFor="coll-active" className="text-[10px] font-bold uppercase tracking-wider text-stone-600 cursor-pointer">
                              Show card on homepage (Active)
                            </label>
                          </div>

                          <div className="sm:col-span-2 flex justify-end gap-3 mt-4">
                            <button
                              type="button"
                              onClick={() => { setIsEditingCollection(false); resetCollectionForm(); }}
                              className="px-5 py-3 rounded-xl border border-stone-200 text-stone-400 hover:bg-stone-50 uppercase font-bold tracking-wider cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isGlobalLoading}
                              className="px-6 py-3 bg-[#4E641A] hover:bg-[#37411A] disabled:bg-stone-300 text-white rounded-xl uppercase font-bold tracking-wider cursor-pointer border-none"
                            >
                              {isGlobalLoading ? 'Saving...' : 'Save Collection'}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl p-4 text-[10px] text-stone-500 font-semibold flex items-center justify-between">
                          <span>💡 Drag & Drop cards vertically to change order, or click the arrows.</span>
                        </div>
                        {(() => {
                          const sigCollectionsOnly = homepageCollections.filter(c => {
                            if (c.description && c.description.startsWith('{')) {
                              try {
                                const parsed = JSON.parse(c.description);
                                return !parsed.isPromoCategory;
                              } catch(e) {}
                            }
                            return true;
                          });

                          if (sigCollectionsOnly.length === 0) {
                            return (
                              <div className="text-center py-12 bg-white border border-[#EDE7D9] rounded-[28px] text-stone-400">
                                <span className="text-2xl">📦</span>
                                <p className="text-xs mt-2 font-bold uppercase tracking-wider">No signature collections created yet.</p>
                              </div>
                            );
                          }

                          return sigCollectionsOnly.map((coll, index) => (
                            <div
                              key={coll.id}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData('text/plain', index)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={async (e) => {
                                e.preventDefault();
                                const dragIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                                if (dragIdx === index) return;
                                
                                const sigIndices = [];
                                const sigItems = [];
                                homepageCollections.forEach((item, idx) => {
                                  let isPromo = false;
                                  if (item.description && item.description.startsWith('{')) {
                                    try {
                                      const parsed = JSON.parse(item.description);
                                      isPromo = !!parsed.isPromoCategory;
                                    } catch(e) {}
                                  }
                                  if (!isPromo) {
                                    sigIndices.push(idx);
                                    sigItems.push(item);
                                  }
                                });

                                const [draggedItem] = sigItems.splice(dragIdx, 1);
                                sigItems.splice(index, 0, draggedItem);

                                const updated = [...homepageCollections];
                                sigItems.forEach((item, idx) => {
                                  const origIdx = sigIndices[idx];
                                  updated[origIdx] = {
                                    ...item,
                                    sortOrder: idx
                                  };
                                });

                                setHomepageCollections(updated);
                                try {
                                  const payload = updated.map((item, idx) => ({ id: item.id, sortOrder: idx }));
                                  await api.put('/admin/homepage/collections/reorder', { order: payload });
                                  fetchHomepageCMSData();
                                } catch (err) {
                                  modal.alert('Reorder Failed', err.message, 'error');
                                }
                              }}
                              className="bg-white border border-[#EDE7D9] rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:border-[#B8833E]/20 transition text-left w-full cursor-move group"
                            >
                              <div className="flex gap-4 items-center min-w-0">
                                <span className="text-stone-300 text-xs shrink-0 select-none hidden md:block">⋮⋮</span>
                                <img
                                  src={coll.image}
                                  alt={coll.title}
                                  className="w-16 h-16 object-cover rounded-xl border border-[#EDE7D9] bg-stone-50 shrink-0"
                                />
                                <div className="flex flex-col text-left min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-serif text-sm font-bold text-[#37411A] truncate">{coll.title}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase border ${
                                      coll.isActive 
                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                        : 'bg-stone-50 text-stone-450 border-stone-200'
                                    }`}>
                                      {coll.isActive ? 'Active' : 'Hidden'}
                                    </span>
                                    {coll.badge && (
                                      <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#C68A2B]/10 text-[#C68A2B] border border-[#C68A2B]/20">
                                        {coll.badge}
                                      </span>
                                    )}
                                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-stone-100 text-stone-500 border border-stone-200">
                                      🔗 {coll.categorySlug === 'all' ? 'Shop All' : coll.categorySlug.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-stone-500 mt-1 line-clamp-1">{coll.description}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                                <div className="flex gap-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleMoveCollection(index, 'up'); }}
                                    disabled={index === 0}
                                    className={`p-1.5 rounded border border-[#EDE7D9] bg-transparent cursor-pointer ${index === 0 ? 'text-stone-200 cursor-not-allowed border-stone-100' : 'text-stone-500 hover:bg-stone-50'}`}
                                  >
                                    ▲
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleMoveCollection(index, 'down'); }}
                                    disabled={index === sigCollectionsOnly.length - 1}
                                    className={`p-1.5 rounded border border-[#EDE7D9] bg-transparent cursor-pointer ${index === sigCollectionsOnly.length - 1 ? 'text-stone-200 cursor-not-allowed border-stone-100' : 'text-stone-500 hover:bg-stone-50'}`}
                                  >
                                    ▼
                                  </button>
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleToggleCollectionActive(coll.id, coll.isActive); }}
                                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition cursor-pointer border ${
                                    coll.isActive
                                      ? 'bg-red-50 text-red-650 hover:bg-red-150 border-red-200'
                                      : 'bg-green-50 text-green-750 hover:bg-green-150 border-green-200'
                                  }`}
                                >
                                  {coll.isActive ? 'Hide' : 'Show'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCollectionForm({
                                      id: coll.id,
                                      title: coll.title,
                                      badge: coll.badge || '',
                                      description: coll.description || '',
                                      image: coll.image,
                                      ctaText: coll.ctaText || 'Browse Collection',
                                      categorySlug: coll.categorySlug || 'all',
                                      sortOrder: coll.sortOrder || 0,
                                      isActive: coll.isActive
                                    });
                                    const associatedCat = categories.find(c => c.slug === (coll.categorySlug || 'all'));
                                    setSelectedCategoryAssistId(associatedCat ? associatedCat.id : '');
                                    setIsEditingCollection(true);
                                  }}
                                  className="p-2 text-[#4E641A] hover:bg-[#4E641A]/10 rounded-lg transition cursor-pointer bg-transparent border-none"
                                >
                                  <FiEdit2 size={13} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteCollection(coll.id); }}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer bg-transparent border-none"
                                >
                                  <FiTrash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                )}

                                                {/* SUBTAB 2: PROMO CATEGORIES */}
                {selectedSubTab === 'categories' && (
                  <div className="space-y-6">
                    {isEditingHPCat ? (
                      <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-sm space-y-6">
                        <div className="flex justify-between items-center border-b pb-3 border-stone-100">
                          <h3 className="font-serif text-base font-bold text-[#B8833E]">
                            {hpCatForm.id ? 'Edit Premium Category Showcase' : 'Add Premium Category Showcase'}
                          </h3>
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#4E641A] bg-[#4E641A]/10 px-2.5 py-1 rounded-full">
                            Shop By Category CMS
                          </span>
                        </div>

                        <form noValidate onSubmit={handleSaveHPCat} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-500">
                          
                          {/* Column Left: Content Settings */}
                          <div className="space-y-4 font-sans text-stone-600">
                            <h4 className="font-bold text-[#37411A] text-[10px] uppercase tracking-widest border-b pb-1">1. Content Details</h4>
                            {/* Dynamic Category Linkage & Autofill Assist */}
                            <div className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl p-4 space-y-3 text-left">
                              <div className="flex flex-col gap-2.5">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Select Homepage Category (Autofill Assist)</label>
                                  <select
                                    value={selectedCategoryAssistId}
                                    onChange={(e) => handleCategoryAssistChange(e.target.value)}
                                    className="bg-white border border-[#EDE7D9] rounded-xl py-2.5 px-3 text-xs text-[#37411A] font-semibold focus:outline-none focus:border-[#4E641A] cursor-pointer w-full"
                                  >
                                    <option value="">-- Select Category to Autofill --</option>
                                    {categories.map(cat => (
                                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                  </select>
                                </div>
                                
                                {selectedCategoryAssistId && (
                                  <button
                                    type="button"
                                    onClick={handleSyncFromCategory}
                                    className="w-full py-2.5 bg-[#4E641A] hover:bg-[#37411A] text-white text-[9px] font-extrabold uppercase tracking-widest rounded-xl transition cursor-pointer border-none shadow-xxs shrink-0"
                                  >
                                    Sync Latest Category Details
                                  </button>
                                )}
                              </div>

                              {/* Compact Preview Card Visual Assistance */}
                              {(() => {
                                const selectedCat = categories.find(c => c.id === selectedCategoryAssistId);
                                if (!selectedCat) return null;
                                return (
                                  <div className="flex items-center gap-3 bg-white border border-[#EDE7D9] rounded-xl p-3 shadow-xxs">
                                    {selectedCat.image ? (
                                      <img src={selectedCat.image} alt={selectedCat.name} className="w-10 h-10 object-cover rounded-lg border border-[#EDE7D9]" />
                                    ) : (
                                      <div className="w-10 h-10 rounded-lg bg-stone-50 border border-[#EDE7D9] flex items-center justify-center font-bold text-[10px] text-[#4E641A]">🌿</div>
                                    )}
                                    <div className="text-left leading-tight">
                                      <span className="block text-[10px] font-bold text-[#37411A]">{selectedCat.name}</span>
                                      <span className="block text-[8px] text-[#B8833E] font-semibold mt-0.5">{selectedCat._count?.products || 0} Linked Products</span>
                                      <span className="block text-[8px] text-stone-400 font-mono mt-0.5">Slug: {selectedCat.slug}</span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                            
                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Category Showcase Name</label>
                              <input
                                type="text"
                                value={hpCatForm.title}
                                onChange={(e) => setHpCatForm({ ...hpCatForm, title: e.target.value })}
                                placeholder="e.g. A2 Ghee"
                                className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                                required
                              />
                              {hpCatFormErrors.title && <span className="text-[9px] text-red-650 font-bold">⚠️ {hpCatFormErrors.title}</span>}
                            </div>

                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Editorial Subtitle</label>
                              <input
                                type="text"
                                value={hpCatForm.subtitle}
                                onChange={(e) => setHpCatForm({ ...hpCatForm, subtitle: e.target.value })}
                                placeholder="e.g. Traditional slow curd-churned Bilona Ghee"
                                className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                              />
                            </div>

                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Catalog Category Association (Slug Link)</label>
                              <select
                                value={hpCatForm.categorySlug}
                                onChange={(e) => setHpCatForm({ ...hpCatForm, categorySlug: e.target.value })}
                                className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A] font-medium"
                                required
                              >
                                <option value="">-- Associate Core Category --</option>
                                <option value="all">All Staples (all)</option>
                                {categories.map((c) => (
                                  <option key={c.id} value={c.slug}>{c.name} ({c.slug})</option>
                                ))}
                              </select>
                              {hpCatFormErrors.categorySlug && <span className="text-[9px] text-red-650 font-bold">⚠️ {hpCatFormErrors.categorySlug}</span>}
                            </div>

                            <div className="flex flex-col gap-1 text-left">
                              <UnifiedUploader
                                value={hpCatForm.image}
                                onChange={(url) => setHpCatForm({ ...hpCatForm, image: url })}
                                label="Desktop Banner Image"
                                aspectRatio={16/9}
                                folder="banners"
                              />
                              {hpCatFormErrors.image && <span className="text-[9px] text-red-655 font-bold">⚠️ {hpCatFormErrors.image}</span>}
                            </div>

                            <div className="flex flex-col gap-1 text-left">
                              <UnifiedUploader
                                value={hpCatForm.mobileImage}
                                onChange={(url) => setHpCatForm({ ...hpCatForm, mobileImage: url })}
                                label="Mobile Banner Image (Optional)"
                                aspectRatio={1}
                                folder="banners"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1 text-left">
                                <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">CTA Button Text</label>
                                <input
                                  type="text"
                                  value={hpCatForm.ctaText}
                                  onChange={(e) => setHpCatForm({ ...hpCatForm, ctaText: e.target.value })}
                                  placeholder="Browse Collection"
                                  className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                                />
                              </div>
                              <div className="flex flex-col gap-1 text-left">
                                <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Sort Weight Index</label>
                                <input
                                  type="number"
                                  value={hpCatForm.sortOrder}
                                  onChange={(e) => setHpCatForm({ ...hpCatForm, sortOrder: e.target.value })}
                                  className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 focus:outline-none focus:border-[#4E641A] text-[#37411A]"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Column Right: Cinematic Layout Controls */}
                          <div className="space-y-4">
                            <h4 className="font-bold text-[#37411A] text-[10px] uppercase tracking-widest border-b pb-1">2. Premium Design Parameters</h4>
                            
                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Text Overlay Alignment Position</label>
                              <div className="grid grid-cols-3 gap-2 mt-1">
                                {[
                                  { value: 'top-left', label: 'Top Left' },
                                  { value: 'center', label: 'Centered' },
                                  { value: 'top-right', label: 'Top Right' },
                                  { value: 'bottom-left', label: 'Bottom Left' },
                                  { value: 'bottom-right', label: 'Bottom Right' }
                                ].map((pos) => (
                                  <button
                                    key={pos.value}
                                    type="button"
                                    onClick={() => setHpCatForm({ ...hpCatForm, overlayPosition: pos.value })}
                                    className={`py-2 px-1 text-[9px] font-bold rounded-lg border uppercase tracking-wider transition cursor-pointer ${
                                      hpCatForm.overlayPosition === pos.value 
                                        ? 'bg-[#4E641A] text-white border-[#4E641A]'
                                        : 'bg-[#FDFBF7] text-stone-600 border-[#EDE7D9] hover:bg-stone-50'
                                    }`}
                                  >
                                    {pos.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 text-left">
                              <div className="flex justify-between items-baseline">
                                <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Overlay Gradient Darkness Opacity</label>
                                <span className="text-[10px] font-extrabold text-[#4E641A]">{hpCatForm.overlayDarkness}</span>
                              </div>
                              <input
                                type="range"
                                min="0.0"
                                max="0.9"
                                step="0.05"
                                value={hpCatForm.overlayDarkness}
                                onChange={(e) => setHpCatForm({ ...hpCatForm, overlayDarkness: parseFloat(e.target.value) })}
                                className="w-full h-1.5 bg-[#EDE7D9] rounded-lg appearance-none cursor-pointer accent-[#4E641A] mt-2"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1 text-left">
                                <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Text Contrast Theme</label>
                                <select
                                  value={hpCatForm.textColorTheme}
                                  onChange={(e) => setHpCatForm({ ...hpCatForm, textColorTheme: e.target.value })}
                                  className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 text-[#37411A] font-semibold cursor-pointer"
                                >
                                  <option value="light">Light Text (Default)</option>
                                  <option value="dark">Dark Vedic Forest Theme</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-1 text-left">
                                <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Image Focal Positioning</label>
                                <select
                                  value={hpCatForm.imageFocalPoint}
                                  onChange={(e) => setHpCatForm({ ...hpCatForm, imageFocalPoint: e.target.value })}
                                  className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 text-[#37411A] font-semibold cursor-pointer"
                                >
                                  <option value="center">Center Focus</option>
                                  <option value="top">Top Focus</option>
                                  <option value="bottom">Bottom Focus</option>
                                  <option value="left">Left Focus</option>
                                  <option value="right">Right Focus</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1 text-left">
                                <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Corner Rounding Style</label>
                                <select
                                  value={hpCatForm.cornerRadius}
                                  onChange={(e) => setHpCatForm({ ...hpCatForm, cornerRadius: e.target.value })}
                                  className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 text-[#37411A] font-semibold cursor-pointer"
                                >
                                  <option value="none">Sharp Corners (None)</option>
                                  <option value="md">Medium Rounded (md)</option>
                                  <option value="lg">Large Card (lg)</option>
                                  <option value="xl">Classic Card (xl)</option>
                                  <option value="2xl">Deep Rounding (2xl)</option>
                                  <option value="3xl">Cinematic Vedic Shape (3xl)</option>
                                  <option value="full">Luxury Organic Pill (full)</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-1 text-left">
                                <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">CTA Button Styling</label>
                                <select
                                  value={hpCatForm.ctaStyle}
                                  onChange={(e) => setHpCatForm({ ...hpCatForm, ctaStyle: e.target.value })}
                                  className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl py-3 px-4 text-[#37411A] font-semibold cursor-pointer"
                                >
                                  <option value="arrow">Micro Icon Arrow</option>
                                  <option value="button-outline">Vedic Outline Badge</option>
                                  <option value="button-solid">Vedic Solid Pill</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-2 text-left">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  id="hp-cat-active"
                                  checked={hpCatForm.isActive}
                                  onChange={(e) => setHpCatForm({ ...hpCatForm, isActive: e.target.checked })}
                                  className="w-4 h-4 text-[#4E641A] border-[#EDE7D9] rounded cursor-pointer"
                                />
                                <label htmlFor="hp-cat-active" className="text-[8px] font-extrabold uppercase tracking-wider text-stone-600 cursor-pointer">Visible</label>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  id="hp-cat-featured"
                                  checked={hpCatForm.isFeatured}
                                  onChange={(e) => setHpCatForm({ ...hpCatForm, isFeatured: e.target.checked })}
                                  className="w-4 h-4 text-[#4E641A] border-[#EDE7D9] rounded cursor-pointer"
                                />
                                <label htmlFor="hp-cat-featured" className="text-[8px] font-extrabold uppercase tracking-wider text-stone-600 cursor-pointer">Hero Card (Featured)</label>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  id="hp-cat-zoom"
                                  checked={hpCatForm.hoverZoom}
                                  onChange={(e) => setHpCatForm({ ...hpCatForm, hoverZoom: e.target.checked })}
                                  className="w-4 h-4 text-[#4E641A] border-[#EDE7D9] rounded cursor-pointer"
                                />
                                <label htmlFor="hp-cat-zoom" className="text-[8px] font-extrabold uppercase tracking-wider text-stone-600 cursor-pointer">Hover Zoom</label>
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t pt-4 border-stone-100">
                            <button
                              type="button"
                              onClick={() => { setIsEditingHPCat(false); resetHPCatForm(); }}
                              className="px-5 py-3 rounded-xl border border-stone-200 text-stone-400 hover:bg-stone-50 uppercase font-bold tracking-wider cursor-pointer text-[10px]"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isGlobalLoading}
                              className="px-6 py-3 bg-[#4E641A] hover:bg-[#37411A] disabled:bg-stone-300 text-white rounded-xl uppercase font-bold tracking-wider cursor-pointer border-none text-[10px]"
                            >
                              {isGlobalLoading ? 'Saving...' : 'Save Cinematic Category'}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[#FDFBF7] border border-[#EDE7D9] p-4 rounded-2xl text-left">
                          <div>
                            <h4 className="font-serif text-sm font-bold text-[#2F3B0C]">Dynamic "Shop By Category" Showcase CMS</h4>
                            <p className="text-[10px] text-stone-500 leading-relaxed mt-0.5 font-medium">
                              Drag and drop the category cards below to visually change their reorder placement in the homepage grid.
                            </p>
                          </div>
                          {homepageCategories.length === 0 && (
                            <button
                              onClick={handleSeedPromoCategories}
                              className="px-4 py-2 bg-[#B8833E] hover:bg-[#976a2e] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer border-none shrink-0"
                            >
                              Seed Vedic Presets
                            </button>
                          )}
                        </div>

                        {homepageCategories.length === 0 ? (
                          <div className="border border-dashed border-[#EDE7D9] py-12 rounded-[28px] text-center bg-white space-y-3 shadow-sm">
                            <div className="text-3xl text-stone-300">🌿</div>
                            <h4 className="font-serif text-sm font-bold text-[#37411A]">No Cinematic Categories Found</h4>
                            <p className="text-xs text-stone-400 max-w-sm mx-auto font-medium">
                              Initialize the premium showcases in your database by loading our custom templates.
                            </p>
                            <button
                              onClick={handleSeedPromoCategories}
                              className="px-5 py-2.5 bg-[#4E641A] hover:bg-[#37411A] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer border-none shadow-xxs font-semibold"
                            >
                              Load Vedic Presets
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full select-none">
                            {homepageCategories.map((cat, index) => {
                              let meta = { subtitle: '', isFeatured: false };
                              if (cat.description && cat.description.startsWith('{')) {
                                try { meta = JSON.parse(cat.description); } catch(e) {}
                              } else if (cat.description) {
                                meta.subtitle = cat.description;
                              }

                              return (
                                <div
                                  key={cat.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, index)}
                                  onDragOver={(e) => handleDragOver(e)}
                                  onDrop={(e) => handleDrop(e, index)}
                                  className="cursor-move bg-white border border-[#EDE7D9] rounded-2xl overflow-hidden shadow-sm hover:border-[#B8833E]/20 transition flex flex-col justify-between group active:opacity-75"
                                >
                                  <div className="p-4 flex gap-4 items-start min-w-0">
                                    <div className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-[#EDE7D9] bg-stone-50">
                                      <img
                                        src={cat.image}
                                        alt={cat.title}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute top-1 left-1 bg-black/60 text-white text-[7px] font-bold px-1.5 py-0.5 rounded">
                                        Idx: {index + 1}
                                      </div>
                                    </div>
                                    <div className="text-left min-w-0 flex-grow space-y-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <h4 className="font-serif text-sm font-bold text-[#37411A] truncate">{cat.title}</h4>
                                        <span className={`text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                          cat.isActive ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-400'
                                        }`}>
                                          {cat.isActive ? 'Visible' : 'Hidden'}
                                        </span>
                                        {meta.isFeatured && (
                                          <span className="bg-[#B8833E]/10 text-[#B8833E] text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                                            Featured
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-stone-400 line-clamp-1 italic font-medium leading-snug">
                                        {meta.subtitle || 'No subtitle description'}
                                      </p>
                                      <p className="text-[8px] font-extrabold text-stone-400 uppercase tracking-widest pt-1">
                                        Route: /products?category={cat.categorySlug}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-[#FDFBF7] border-t border-[#EDE7D9]/60 px-4 py-2.5 flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-stone-400 font-semibold border-none">
                                    <span>Drag Handle ☰</span>
                                    <div className="flex gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          let parsed = {};
                                          if (cat.description && cat.description.startsWith('{')) {
                                            try { parsed = JSON.parse(cat.description); } catch(e) {}
                                          }
                                          setHpCatForm({
                                            id: cat.id,
                                            title: cat.title,
                                            subtitle: parsed.subtitle || cat.badge || '',
                                            image: cat.image,
                                            mobileImage: parsed.mobileImage || '',
                                            ctaText: cat.ctaText || 'Browse Collection',
                                            categorySlug: cat.categorySlug || '',
                                            overlayPosition: parsed.overlayPosition || 'bottom-left',
                                            overlayDarkness: parsed.overlayDarkness !== undefined ? parsed.overlayDarkness : 0.5,
                                            textColorTheme: parsed.textColorTheme || 'light',
                                            sortOrder: cat.sortOrder || 0,
                                            isActive: cat.isActive,
                                            isFeatured: !!parsed.isFeatured,
                                            imageFocalPoint: parsed.imageFocalPoint || 'center',
                                            hoverZoom: parsed.hoverZoom !== undefined ? parsed.hoverZoom : true,
                                            ctaStyle: parsed.ctaStyle || 'arrow',
                                            cornerRadius: parsed.cornerRadius || '3xl'
                                          });
                                          const associatedCat = categories.find(c => c.slug === (cat.categorySlug || ''));
                                          setSelectedCategoryAssistId(associatedCat ? associatedCat.id : '');
                                          setIsEditingHPCat(true);
                                        }}
                                        className="py-1 px-2.5 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#4E641A]/30 text-[#4E641A] rounded-lg transition cursor-pointer font-bold uppercase select-none text-[8px]"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteHPCat(cat.id)}
                                        className="py-1 px-2.5 bg-white hover:bg-red-50 border border-stone-200 hover:border-red-300 text-red-500 rounded-lg transition cursor-pointer font-bold uppercase select-none text-[8px]"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}


                {selectedSubTab === 'sections' && (
                  <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-sm space-y-4 text-left">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#B8833E]">HOMEPAGE SECTIONS LAYOUT</span>
                    <p className="text-stone-500 text-[10px] leading-relaxed">
                      Configure visibility, reorder placement sequences, and edit dynamic section headers for the storefront. Section ordering changes are saved automatically.
                    </p>

                    <div className="space-y-3 pt-2">
                      {sectionOrder.split(',').map((sectName, index, arr) => {
                        const displayNameMap = {
                          'categories': '🌿 Category Quick Access Bar / Promo Categories',
                          'hero': '✨ Campaign Hero Banner',
                          'best-sellers': '🛍️ Best Sellers Catalog Grid',
                          'trust': '🛡️ Brand Purity Trust Indicators',
                          'collections': '📦 Signature Farm Collections',
                          'benefits': '❤️ Shop By Health Benefits',
                          'reviews': '💬 Customer Testimonials Feed',
                          'footer-banner': '🏞️ Join Journey Footer Banner'
                        };

                        const isVisible = settings[`homepage_section_visible_${sectName}`] !== 'false';
                        const isExpanded = expandedSection === sectName;

                        return (
                          <div key={sectName} className="border border-[#EDE7D9] rounded-2xl overflow-hidden bg-white shadow-sm hover:border-[#B8833E]/10 transition">
                            {/* Row Header */}
                            <div className="bg-[#FDFBF7] py-3.5 px-4 flex items-center justify-between text-xs font-semibold text-stone-700">
                              <div className="flex items-center space-x-3 min-w-0">
                                {/* Visibility Toggle */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleSectionVisibility(sectName, isVisible)}
                                  className={`px-2.5 py-1 rounded-md text-[8px] font-extrabold uppercase tracking-wider transition shrink-0 border cursor-pointer ${
                                    isVisible 
                                      ? 'bg-green-50 text-green-700 border-green-200' 
                                      : 'bg-stone-50 text-stone-450 border-stone-200'
                                  }`}
                                >
                                  {isVisible ? 'Visible' : 'Hidden'}
                                </button>
                                <span className="truncate">{displayNameMap[sectName] || sectName}</span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {/* Edit Overrides Button */}
                                <button
                                  type="button"
                                  onClick={() => handleExpandSection(sectName)}
                                  className="px-2.5 py-1 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded text-[9px] font-bold uppercase transition cursor-pointer"
                                >
                                  {isExpanded ? 'Collapse' : 'Edit Copy'}
                                </button>

                                {/* Move Up/Down Buttons */}
                                <button
                                  onClick={() => handleMoveSection(index, 'up')}
                                  disabled={index === 0}
                                  className={`p-1.5 rounded transition bg-transparent border border-[#EDE7D9] cursor-pointer ${
                                    index === 0 ? 'text-stone-300 border-stone-100 cursor-not-allowed' : 'text-[#4E641A] hover:bg-[#4E641A]/5'
                                  }`}
                                >
                                  <FiArrowUp size={11} />
                                </button>
                                <button
                                  onClick={() => handleMoveSection(index, 'down')}
                                  disabled={index === arr.length - 1}
                                  className={`p-1.5 rounded transition bg-transparent border border-[#EDE7D9] cursor-pointer ${
                                    index === arr.length - 1 ? 'text-stone-300 border-stone-100 cursor-not-allowed' : 'text-[#4E641A] hover:bg-[#4E641A]/5'
                                  }`}
                                >
                                  <FiArrowDown size={11} />
                                </button>
                              </div>
                            </div>

                            {/* Expanded Edit Form */}
                            {isExpanded && (
                              <div className="p-4 border-t border-stone-100 bg-white grid grid-cols-1 gap-3 text-stone-600 text-[11px] border-none">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400">Section Badge</label>
                                    <input
                                      type="text"
                                      value={sectionBadgeInput}
                                      onChange={(e) => setSectionBadgeInput(e.target.value)}
                                      placeholder="e.g. Customer Favorites"
                                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-lg py-2 px-3 focus:outline-none focus:border-[#4E641A]"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1 sm:col-span-2">
                                    <label className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400">Section Title</label>
                                    <input
                                      type="text"
                                      value={sectionTitleInput}
                                      onChange={(e) => setSectionTitleInput(e.target.value)}
                                      placeholder="e.g. Direct From Soil Best Sellers"
                                      className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-lg py-2 px-3 focus:outline-none focus:border-[#4E641A]"
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400">Section Subtitle / Description</label>
                                  <textarea
                                    value={sectionSubtitleInput}
                                    onChange={(e) => setSectionSubtitleInput(e.target.value)}
                                    placeholder="Enter section description paragraph..."
                                    className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-lg py-2 px-3 focus:outline-none focus:border-[#4E641A] h-14 resize-none font-sans"
                                  />
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-stone-50">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedSection(null)}
                                    className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-400 hover:bg-stone-50 font-bold uppercase text-[9px] cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveSectionTexts(sectName)}
                                    className="px-4 py-1.5 bg-[#4E641A] hover:bg-[#37411A] text-white rounded-lg font-bold uppercase text-[9px] cursor-pointer border-none"
                                  >
                                    Save Changes
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Visual Live Preview Pane */}
              <div className="xl:col-span-5 bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-sm sticky top-6 space-y-4">
                <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#B8833E]">LIVE PREVIEW DECK</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                    <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Active Simulator</span>
                  </div>
                </div>

                {/* Simulated Container */}
                <div className="border border-[#EDE7D9] rounded-2xl overflow-hidden shadow-inner bg-[#F9F6F0] relative min-h-[360px] flex flex-col justify-between p-5 text-left font-sans select-none scale-95 origin-top">
                  
                  {selectedSubTab === 'hero' && (() => {
                    const activePreviewHero = isEditingHero 
                      ? heroForm 
                      : ([...homepageHeroes].filter(h => h.isActive).sort((a, b) => (a.slideOrder || 0) - (b.slideOrder || 0))[0] || [...homepageHeroes].sort((a, b) => (a.slideOrder || 0) - (b.slideOrder || 0))[0] || heroForm);
                    
                    return (
                      <>
                        {/* Floating Trust Badge */}
                        {activePreviewHero.trustBadgeText?.trim() && (
                          <div className="self-start inline-flex items-center space-x-1.5 bg-white border border-[#EAE4D8] px-2.5 py-1 rounded-full shadow-sm text-[8px] font-bold text-stone-600">
                            <div className="flex text-amber-500">
                              {[...Array(5)].map((_, i) => <FiStar key={i} className="w-2.5 h-2.5 fill-current" />)}
                            </div>
                            <span>{activePreviewHero.trustBadgeText.trim()}</span>
                          </div>
                        )}

                        {/* Content block */}
                        <div className="my-4 space-y-2">
                          <h2 className="font-serif text-lg font-bold text-[#2F3B0C] leading-tight">
                            {activePreviewHero.headingLine1 || 'Pristine Vedic Staples'}
                            {activePreviewHero.headingHighlight && <span className="text-[#C68A2B] italic font-normal block">{activePreviewHero.headingHighlight}</span>}
                            {activePreviewHero.headingLine2 && <span className="block mt-0.5">{activePreviewHero.headingLine2}</span>}
                          </h2>
                          {activePreviewHero.description && (
                            <p className="text-[9px] text-stone-500 leading-relaxed line-clamp-3">
                              {activePreviewHero.description}
                            </p>
                          )}
                        </div>

                        {/* Bullets grid */}
                        <div className="grid grid-cols-2 gap-1.5 text-[8px] font-semibold text-[#2F3B0C]/80 mb-3">
                          {activePreviewHero.bulletOne?.trim() && <div className="flex items-center space-x-1"><span className="text-[#4E641A] font-bold">✓</span><span>{activePreviewHero.bulletOne.trim()}</span></div>}
                          {activePreviewHero.bulletTwo?.trim() && <div className="flex items-center space-x-1"><span className="text-[#4E641A] font-bold">✓</span><span>{activePreviewHero.bulletTwo.trim()}</span></div>}
                          {activePreviewHero.bulletThree?.trim() && <div className="flex items-center space-x-1"><span className="text-[#4E641A] font-bold">✓</span><span>{activePreviewHero.bulletThree.trim()}</span></div>}
                          {activePreviewHero.bulletFour?.trim() && <div className="flex items-center space-x-1"><span className="text-[#4E641A] font-bold">✓</span><span>{activePreviewHero.bulletFour.trim()}</span></div>}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex gap-2 mb-3">
                          {activePreviewHero.primaryButtonText && (
                            <button className="px-3 py-1.5 bg-[#4E641A] text-white text-[8px] font-bold uppercase tracking-wider rounded-lg border-none">
                              {activePreviewHero.primaryButtonText}
                            </button>
                          )}
                          {activePreviewHero.secondaryButtonText && (
                            <button className="px-3 py-1.5 bg-white text-[#4E641A] border border-[#EAE4D8] text-[8px] font-bold uppercase tracking-wider rounded-lg">
                              {activePreviewHero.secondaryButtonText}
                            </button>
                          )}
                        </div>

                        {/* Promo Code Text */}
                        {activePreviewHero.promoText && (
                          <div className="flex items-center space-x-1 text-[7px] font-bold uppercase text-[#C68A2B] bg-[#C68A2B]/5 p-1 rounded">
                            <span className="bg-[#C68A2B]/10 px-1 py-0.5 rounded text-[6px]">PROMO</span>
                            <span className="truncate">{activePreviewHero.promoText}</span>
                          </div>
                        )}

                        {/* Right Product Card Simulation */}
                        {activePreviewHero.featuredProductId ? (
                          <div className="border-t border-[#EDE7D9] pt-3 mt-3 flex items-center justify-between gap-3 text-left">
                            {(() => {
                              const featuredProd = products.find(p => p.id === activePreviewHero.featuredProductId);
                              if (!featuredProd) return null;
                              const titleVal = featuredProd.name;
                              const priceVal = featuredProd.price;
                              const compPriceVal = featuredProd.compareAtPrice || Math.round(featuredProd.price * 1.15);
                              const rawImageSrc = activePreviewHero.heroImage || (featuredProd.images?.length > 0 ? featuredProd.images[0].url : featuredProd.image);
                              const imageSrc = getCloudinaryCroppedUrl(rawImageSrc, activePreviewHero);
                              const hasStock = featuredProd.inventory > 0;

                              return (
                                <>
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img src={imageSrc} className="w-9 h-9 rounded object-cover border border-[#EDE7D9] shrink-0" />
                                    <div className="min-w-0">
                                      <span className="block text-[7px] font-bold text-stone-400 uppercase tracking-widest">Storefront visual card</span>
                                      <span className="block text-[9px] font-bold text-[#2F3B0C] truncate leading-tight">{titleVal}</span>
                                      <span className={`block text-[6px] font-extrabold uppercase mt-0.5 ${hasStock ? 'text-green-600' : 'text-red-500'}`}>
                                        {hasStock ? `In Stock (${featuredProd.inventory})` : 'Sold Out'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <div className="text-right">
                                      <span className="block text-[9px] font-bold text-[#4E641A]">₹{priceVal}</span>
                                      <span className="block text-[7px] line-through text-stone-455">₹{compPriceVal}</span>
                                    </div>
                                    {activePreviewHero.offerBadgeText?.trim() && (
                                      <span className="bg-[#C68A2B] text-white text-[7px] font-extrabold uppercase py-0.5 px-1.5 rounded-full shadow-sm leading-none shrink-0">
                                        {activePreviewHero.offerBadgeText.trim()}
                                      </span>
                                    )}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        ) : null}

                        {/* Simulated Floating Badge */}
                        {(activePreviewHero.floatingBadgeTitle?.trim() || activePreviewHero.floatingBadgeSubtitle?.trim()) && (
                          <div className="absolute top-4 right-4 bg-white/95 border border-[#EAE4D8] rounded-lg p-1.5 shadow-sm flex items-center space-x-1.5 z-20">
                            <span className="text-xs">🌾</span>
                            <div className="text-left leading-none font-sans">
                              {activePreviewHero.floatingBadgeTitle?.trim() && <span className="block text-[7px] font-bold text-[#2F3B0C]">{activePreviewHero.floatingBadgeTitle.trim()}</span>}
                              {activePreviewHero.floatingBadgeSubtitle?.trim() && <span className="block text-[6px] text-stone-450 uppercase tracking-wider font-semibold mt-0.5">{activePreviewHero.floatingBadgeSubtitle.trim()}</span>}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {selectedSubTab === 'collections' && (
                    <div className="w-full space-y-4">
                      <div className="text-center">
                        <span className="text-[9px] font-extrabold text-[#B8833E] tracking-widest uppercase">Visual Preview</span>
                        <h3 className="font-serif text-sm font-bold text-[#2F3B0C] mt-0.5">Signature Farm Collection Card</h3>
                      </div>
                      
                      <div className="relative h-64 rounded-2xl overflow-hidden border border-[#EAE4D8] shadow-md bg-stone-100 text-left">
                        {collectionForm.image ? (
                          <img 
                            src={collectionForm.image} 
                            alt={collectionForm.title} 
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-[#FDFBF7] flex items-center justify-center text-stone-300 font-sans text-xs">
                            Please provide an Image URL
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2F3B0C] via-[#2F3B0C]/40 to-transparent" />
                        
                        <div className="absolute bottom-5 left-5 right-5 text-white space-y-1 z-10">
                          {collectionForm.badge && (
                            <span className="text-[7px] font-bold uppercase tracking-widest text-[#C68A2B] bg-[#C68A2B]/20 border border-[#C68A2B]/30 px-2 py-0.5 rounded-full inline-block">
                              {collectionForm.badge}
                            </span>
                          )}
                          <h3 className="font-serif text-sm font-semibold truncate leading-tight">
                            {collectionForm.title || 'Collection Title Preview'}
                          </h3>
                          <p className="text-[9px] text-[#F9F6F0]/85 line-clamp-2 leading-relaxed font-light">
                            {collectionForm.description || 'Collection description will show here dynamically.'}
                          </p>
                          <span className="inline-flex items-center space-x-1 text-[8px] font-bold uppercase tracking-widest text-[#C68A2B] pt-1">
                            <span>{collectionForm.ctaText || 'Browse Collection'}</span>
                            <span>→</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedSubTab === 'categories' && (
                    <div className="w-full space-y-4">
                      <div className="flex justify-between items-center border-b pb-2 border-stone-150">
                        <div className="text-left">
                          <span className="text-[9px] font-extrabold text-[#B8833E] tracking-widest uppercase">Live Simulator</span>
                          <h3 className="font-serif text-sm font-bold text-[#2F3B0C] mt-0.5">Cinematic Category Grid</h3>
                        </div>
                        {/* Device Simulator Toggle */}
                        <div className="flex bg-[#FDFBF7] border border-[#EDE7D9] rounded-lg p-0.5 text-[8px] font-bold uppercase tracking-wider select-none">
                          {[
                            { mode: 'desktop', label: '🖥️ Desktop' },
                            { mode: 'tablet', label: '📱 Tablet' },
                            { mode: 'mobile', label: '📞 Mobile' }
                          ].map((dev) => (
                            <button
                              key={dev.mode}
                              type="button"
                              onClick={() => setPreviewDeviceMode(dev.mode)}
                              className={`px-2 py-1 rounded transition border-none cursor-pointer ${
                                previewDeviceMode === dev.mode 
                                  ? 'bg-[#4E641A] text-white shadow-xxs' 
                                  : 'text-stone-400 bg-transparent hover:text-stone-600'
                              }`}
                            >
                              {dev.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Responsive Frame */}
                      <div className="flex justify-center transition-all duration-300 w-full">
                        <div className={`w-full bg-[#FDFBF7] border border-[#EDE7D9] p-4 rounded-2xl shadow-inner transition-all duration-300 select-none text-left ${
                          previewDeviceMode === 'mobile' 
                            ? 'max-w-[280px]' 
                            : previewDeviceMode === 'tablet' 
                            ? 'max-w-[420px]' 
                            : 'max-w-full'
                        }`}>
                          
                          {/* Grid Simulation */}
                          <div className={`grid gap-3 ${
                            previewDeviceMode === 'mobile' 
                              ? 'grid-cols-1' 
                              : previewDeviceMode === 'tablet' 
                              ? 'grid-cols-2' 
                              : 'grid-cols-3'
                          }`}>
                            {(() => {
                              // If editing, show the card being edited. Otherwise show all categories.
                              const items = isEditingHPCat 
                                ? [{
                                    id: 'temp-editing',
                                    title: hpCatForm.title || 'Category Name',
                                    subtitle: hpCatForm.subtitle || 'Editorial subtitle description',
                                    image: hpCatForm.image || 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800',
                                    mobileImage: hpCatForm.mobileImage || hpCatForm.image,
                                    overlayPosition: hpCatForm.overlayPosition,
                                    overlayDarkness: hpCatForm.overlayDarkness,
                                    textColorTheme: hpCatForm.textColorTheme,
                                    isFeatured: hpCatForm.isFeatured,
                                    imageFocalPoint: hpCatForm.imageFocalPoint,
                                    hoverZoom: hpCatForm.hoverZoom,
                                    ctaStyle: hpCatForm.ctaStyle,
                                    cornerRadius: hpCatForm.cornerRadius,
                                    ctaText: hpCatForm.ctaText
                                  }]
                                : homepageCategories.map(c => {
                                    let meta = {
                                      subtitle: c.badge || '',
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
                                    if (c.description && c.description.startsWith('{')) {
                                      try { meta = { ...meta, ...JSON.parse(c.description) }; } catch(e) {}
                                    }
                                    return {
                                      id: c.id,
                                      title: c.title,
                                      subtitle: meta.subtitle,
                                      image: c.image,
                                      mobileImage: meta.mobileImage || c.image,
                                      overlayPosition: meta.overlayPosition,
                                      overlayDarkness: meta.overlayDarkness,
                                      textColorTheme: meta.textColorTheme,
                                      isFeatured: meta.isFeatured,
                                      imageFocalPoint: meta.imageFocalPoint,
                                      hoverZoom: meta.hoverZoom,
                                      ctaStyle: meta.ctaStyle,
                                      cornerRadius: meta.cornerRadius,
                                      ctaText: c.ctaText
                                    };
                                  });

                              if (items.length === 0) {
                                return (
                                  <div className="col-span-full py-8 text-center text-stone-300 text-[10px] font-bold uppercase tracking-wider">
                                    No Active Showcase Cards
                                  </div>
                                );
                              }

                              return items.map((item) => {
                                const isDark = item.textColorTheme === 'dark';
                                const dark = item.overlayDarkness !== undefined ? parseFloat(item.overlayDarkness) : 0.5;
                                const overlay = isDark 
                                  ? `linear-gradient(to top, rgba(253,251,247,${dark}) 0%, rgba(253,251,247,${dark*0.3}) 60%, transparent 100%)`
                                  : `linear-gradient(to top, rgba(0,0,0,${dark}) 0%, rgba(0,0,0,${dark*0.3}) 60%, transparent 100%)`;

                                // Positioning class
                                let alignClass = 'justify-end items-start text-left';
                                if (item.overlayPosition === 'center') alignClass = 'justify-center items-center text-center';
                                else if (item.overlayPosition === 'top-left') alignClass = 'justify-start items-start text-left';
                                else if (item.overlayPosition === 'top-right') alignClass = 'justify-start items-end text-right';
                                else if (item.overlayPosition === 'bottom-right') alignClass = 'justify-end items-end text-right';

                                // Corner rounding style
                                let roundClass = 'rounded-2xl';
                                if (item.cornerRadius === 'none') roundClass = 'rounded-none';
                                else if (item.cornerRadius === 'md') roundClass = 'rounded-md';
                                else if (item.cornerRadius === 'lg') roundClass = 'rounded-lg';
                                else if (item.cornerRadius === 'xl') roundClass = 'rounded-xl';
                                else if (item.cornerRadius === 'full') roundClass = 'rounded-3xl';

                                // Focal Point
                                let objectFocal = 'object-center';
                                if (item.imageFocalPoint === 'top') objectFocal = 'object-top';
                                else if (item.imageFocalPoint === 'bottom') objectFocal = 'object-bottom';
                                else if (item.imageFocalPoint === 'left') objectFocal = 'object-left';
                                else if (item.imageFocalPoint === 'right') objectFocal = 'object-right';

                                const spanClass = item.isFeatured && previewDeviceMode !== 'mobile'
                                  ? 'col-span-2 h-44'
                                  : 'col-span-1 h-36';

                                return (
                                  <div
                                    key={item.id || item.slug}
                                    className={`relative overflow-hidden group shadow-sm border border-[#EDE7D9]/50 transition bg-stone-50 ${spanClass} ${roundClass}`}
                                  >
                                    <img
                                      src={previewDeviceMode === 'mobile' && item.mobileImage ? item.mobileImage : item.image}
                                      alt={item.title}
                                      className={`absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105 ${objectFocal}`}
                                    />
                                    <div className="absolute inset-0 z-10" style={{ background: overlay }} />
                                    <div className={`absolute inset-0 z-20 flex flex-col p-3.5 text-white ${alignClass}`} style={{ color: isDark ? '#2F3B0C' : '#fff' }}>
                                      <h4 className="font-serif text-xs font-bold leading-tight truncate max-w-[90%]">{item.title}</h4>
                                      {item.subtitle && previewDeviceMode !== 'mobile' && (
                                        <p className="text-[7.5px] leading-relaxed line-clamp-2 max-w-[80%]" style={{ opacity: 0.8 }}>
                                          {item.subtitle}
                                        </p>
                                      )}
                                      
                                      {item.ctaStyle === 'arrow' ? (
                                        <div className="absolute bottom-2.5 right-2.5 w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-[9px] pointer-events-none">
                                          →
                                        </div>
                                      ) : item.ctaStyle === 'button-outline' ? (
                                        <div className="mt-1.5 text-[6.5px] font-bold uppercase tracking-wider px-2 py-0.5 border border-current rounded select-none">
                                          {item.ctaText || 'Explore'}
                                        </div>
                                      ) : (
                                        <div className="mt-1.5 text-[6.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded select-none shadow-xxs border-none animate-none" style={{ background: isDark ? '#4E641A' : '#fff', color: isDark ? '#fff' : '#37411A' }}>
                                          {item.ctaText || 'Explore'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>

                        </div>
                      </div>
                    </div>
                  )}


                  {selectedSubTab === 'sections' && (
                    <div className="w-full space-y-3">
                      <div className="text-center pb-1">
                        <span className="text-[9px] font-extrabold text-[#B8833E] tracking-widest uppercase">Simulated Layout</span>
                        <h3 className="font-serif text-sm font-bold text-[#2F3B0C] mt-0.5">Storefront Section Order</h3>
                      </div>
                      <div className="space-y-1.5 max-h-[250px] overflow-y-auto no-scrollbar font-mono text-[7px] font-bold uppercase tracking-widest">
                        {sectionOrder.split(',').map((sect, idx) => {
                          const isVisible = settings[`homepage_section_visible_${sect}`] !== 'false';
                          return (
                            <div key={sect} className={`bg-white border border-[#EDE7D9] rounded p-2 flex items-center justify-between shadow-sm border-l-2 ${
                              isVisible ? 'text-stone-700 border-l-[#4E641A]' : 'text-stone-300 border-l-stone-200 opacity-60'
                            }`}>
                              <span>{idx + 1}. {sect}</span>
                              <span className="text-[6px] uppercase tracking-wider">{isVisible ? 'Active' : 'Hidden'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>

                <div className="text-stone-400 text-[8px] text-center italic mt-2">
                  Preview renders dynamic CSS styles aligning to the Vaaradhi theme parameters.
                </div>
              </div>

            </div>
          </div>
        )}

        {cropTarget && (
          <ImageCropper
            imageSrc={cropTarget}
            targetAspect={4 / 3}
            onCropComplete={(cropData) => {
              setHeroForm((prev) => ({
                ...prev,
                ...cropData
              }));
              setCropTarget(null);
            }}
            onCancel={() => setCropTarget(null)}
          />
        )}

      </main>

    </div>
  );
}
