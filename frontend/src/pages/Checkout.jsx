import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useModalStore } from '../store/useModalStore';
import { useFeedbackStore } from '../store/useFeedbackStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { FiMapPin, FiCreditCard, FiTag, FiShoppingBag, FiCheckCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { GiSun } from 'react-icons/gi';
import api from '../utils/api';
import { parseWeightToKG } from '../utils/weightParser';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAuthChecked } = useAuthStore();
  const { cartItems, subtotal, coupon, applyCoupon, removeCoupon, clearCart } = useCartStore();
  const modal = useModalStore();
  const { settings, fetchSettings } = useSettingsStore();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Checkout flow states
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccessDetails, setOrderSuccessDetails] = useState(null);
  const [activeCoupons, setActiveCoupons] = useState([]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!isAuthChecked) return; // Wait until initial session check completes!

    if (!isAuthenticated) {
      useAuthStore.getState().setCheckoutResumeRedirect('/checkout');
      useAuthStore.getState().setLoginRequiredModalOpen(true);
      navigate('/');
    } else {
      fetchAddresses();
      fetchActiveCoupons();
    }
  }, [isAuthenticated, isAuthChecked, navigate]);

  const fetchActiveCoupons = async () => {
    try {
      const response = await api.get('/orders/coupons/active');
      setActiveCoupons(response.coupons || []);
    } catch (err) {
      console.error('Failed to fetch active coupons:', err);
    }
  };

  // Load coupon from sessionStorage if applied on the Cart page
  useEffect(() => {
    const stored = sessionStorage.getItem('appliedCoupon');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.code) {
          setCouponCode(parsed.code);
          applyCoupon(parsed.code)
            .then(() => setCouponSuccess(true))
            .catch(() => {});
        }
      } catch (e) {
        console.error('Failed to parse pre-applied coupon:', e);
      }
    }
  }, [applyCoupon]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/auth/addresses');
      const addrList = response.addresses || [];
      setAddresses(addrList);
      
      // Pre-select default address
      const defaultAddr = addrList.find(a => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (addrList.length > 0) {
        setSelectedAddressId(addrList[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    setCouponError(null);
    setCouponSuccess(false);
    try {
      await applyCoupon(couponCode);
      setCouponSuccess(true);
      // Synchronize in sessionStorage
      if (coupon) {
        sessionStorage.setItem('appliedCoupon', JSON.stringify(coupon));
      }
    } catch (err) {
      setCouponError(err.message);
      removeCoupon();
      sessionStorage.removeItem('appliedCoupon');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      useFeedbackStore.getState().showToast('⚠️ Please select a shipping address before completing your purchase.', 'warning');
      return;
    }

    // Validate if the selected address is in a serviceable state
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    if (!selectedAddress) {
      useFeedbackStore.getState().showToast('⚠️ Selected address not found.', 'warning');
      return;
    }

    const serviceableList = (settings.serviceableStates || 'Telangana, Andhra Pradesh')
      .split(',')
      .map(s => s.trim().toLowerCase());
    const selectedState = (selectedAddress.state || '').trim().toLowerCase();

    if (!serviceableList.includes(selectedState)) {
      useFeedbackStore.getState().showToast(
        `❌ Suryodaya Farms only services locations in: ${settings.serviceableStates || 'Telangana, Andhra Pradesh'}. Selected state "${selectedAddress.state}" is not serviceable.`,
        'error'
      );
      return;
    }

    setIsProcessing(true);
    useFeedbackStore.getState().showLoader('Processing checkout...');
    try {
      const response = await api.post('/orders/checkout', {
        addressId: selectedAddressId,
        couponCode: coupon ? coupon.code : null,
        paymentMethod
      });

      if (paymentMethod === 'COD') {
        // Cash on delivery processed instantly
        setOrderSuccessDetails(response.order);
        clearCart();
        sessionStorage.removeItem('appliedCoupon');
        setIsProcessing(false);
        useFeedbackStore.getState().hideLoader();
        useFeedbackStore.getState().showToast('✅ Order placed successfully', 'success');
      } else {
        // Razorpay Payment Simulation sandbox trigger
        simulateRazorpaySandbox(response);
        setIsProcessing(false);
        useFeedbackStore.getState().hideLoader();
      }
    } catch (err) {
      useFeedbackStore.getState().showToast(`❌ Checkout failed: ${err.message}`, 'error');
      setIsProcessing(false);
      useFeedbackStore.getState().hideLoader();
    }
  };

  const simulateRazorpaySandbox = (checkoutResponse) => {
    // We launch a customized premium modal to simulate sandbox payments
    setOrderSuccessDetails({
      ...checkoutResponse.order,
      isRazorpayMock: true,
      razorpayOrderId: checkoutResponse.razorpayOrderId
    });
  };

  const handleVerifyRazorpaySandboxPayment = async () => {
    setIsProcessing(true);
    useFeedbackStore.getState().showLoader('Verifying gateway signature...');
    try {
      await api.post('/orders/verify-payment', {
        razorpayOrderId: orderSuccessDetails.razorpayOrderId,
        razorpayPaymentId: `pay_mock_${Date.now()}`
      });

      setOrderSuccessDetails(prev => ({
        ...prev,
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
        isRazorpayMock: false
      }));

      clearCart();
      sessionStorage.removeItem('appliedCoupon');
      setIsProcessing(false);
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast('✅ Order placed successfully', 'success');
    } catch (err) {
      useFeedbackStore.getState().showToast(`❌ Payment verification failed: ${err.message}`, 'error');
      setIsProcessing(false);
      useFeedbackStore.getState().hideLoader();
    }
  };

  // Dynamic weight and shipping math
  const freeDeliveryThreshold = parseFloat(settings.freeDeliveryThreshold || '2');
  const shippingCharge = parseFloat(settings.shippingCharge || '80');

  const totalWeight = cartItems.reduce((acc, item) => {
    const weightStr = item.variant ? item.variant.name : item.product.weight;
    return acc + parseWeightToKG(weightStr) * item.quantity;
  }, 0);

  const discountAmount = coupon
    ? coupon.discountType === 'PERCENTAGE'
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue
    : 0;

  const isFreeDelivery = totalWeight >= freeDeliveryThreshold;
  const shipping = isFreeDelivery ? 0 : shippingCharge;
  const grandTotal = Math.max(subtotal - discountAmount + shipping, 0);

  const renderCouponForm = () => {
    return (
      <div className="flex flex-col gap-3">
        <span className="font-serif text-xs font-bold text-dark-olive flex items-center gap-1.5">
          <FiTag className="text-sunrise-gold" />
          <span>Apply Promotion Code</span>
        </span>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="SOILFIRST15, VEDICGIFT"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-grow bg-cream-bg border border-light-beige rounded-xl py-2.5 px-4 font-sans text-xs focus:outline-none focus:border-sunrise-gold uppercase h-11"
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            className="bg-primary-green hover:bg-dark-olive text-white px-5 rounded-xl font-sans text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer h-11"
          >
            Apply
          </button>
        </div>

        {activeCoupons.length > 0 && (
          <div className="flex flex-col gap-1.5 text-left mt-1">
            <span className="text-[9px] font-extrabold tracking-wider uppercase text-stone-400">Available Coupons</span>
            <div className="flex flex-wrap gap-1.5">
              {activeCoupons.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={async () => {
                    setCouponCode(c.code);
                    setCouponError(null);
                    setCouponSuccess(false);
                    try {
                      await applyCoupon(c.code);
                      setCouponSuccess(true);
                      sessionStorage.setItem('appliedCoupon', JSON.stringify({
                        id: c.id,
                        code: c.code,
                        discountType: c.discountType,
                        discountValue: c.discountValue
                      }));
                    } catch (err) {
                      setCouponError(err.message);
                      removeCoupon();
                      sessionStorage.removeItem('appliedCoupon');
                    }
                  }}
                  className="bg-primary-green/5 border border-primary-green/20 hover:border-primary-green/50 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-primary-green transition flex items-center gap-1 cursor-pointer select-none active:scale-95 border-solid h-7"
                >
                  <FiTag className="text-[9px]" />
                  <span>{c.code}</span>
                  <span className="opacity-60">•</span>
                  <span>{c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {couponError && <span className="text-[10px] text-red-650 font-semibold">{couponError}</span>}
        {couponSuccess && coupon && (
          <div className="flex justify-between items-center bg-primary-green/10 border border-primary-green/20 rounded-xl p-2.5 mt-1 text-[10px] text-primary-green">
            <span>Code Applied: <strong>{coupon.code}</strong> (-{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`})</span>
            <button type="button" onClick={() => { removeCoupon(); setCouponCode(''); setCouponSuccess(false); sessionStorage.removeItem('appliedCoupon'); }} className="underline font-semibold cursor-pointer">Remove</button>
          </div>
        )}
      </div>
    );
  };

  // If order placed successfully, show glorious receipt screen
  if (orderSuccessDetails && !orderSuccessDetails.isRazorpayMock) {
    return (
      <div className="min-h-screen bg-cream-bg pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-xl w-full bg-light-beige/35 border border-light-beige rounded-[36px] p-8 md:p-12 text-center flex flex-col items-center gap-6 animate-scale-up shadow-sm">
          <FiCheckCircle className="text-primary-green text-6xl animate-pulse-slow" />
          <h2 className="font-serif text-3xl font-bold text-dark-olive">Order Placed Successfully!</h2>
          <p className="font-sans text-xs md:text-sm text-dark-text/75 leading-relaxed font-light">
            Namaste! Your order <strong className="text-primary-green">{orderSuccessDetails.orderNumber}</strong> has been received by Suryodaya Farms homestead. We are preparing your fresh organic staples harvest.
          </p>

          <div className="w-full bg-cream-bg border border-light-beige rounded-2xl p-6 text-left flex flex-col gap-3 my-2">
            <span className="font-serif text-sm font-bold text-dark-olive">Receipt Details</span>
            <div className="flex justify-between text-xs font-sans text-dark-text/75">
              <span>Order Number</span>
              <strong className="text-dark-olive">{orderSuccessDetails.orderNumber}</strong>
            </div>
            <div className="flex justify-between text-xs font-sans text-dark-text/75">
              <span>Total Paid</span>
              <strong className="text-primary-green">₹{orderSuccessDetails.totalAmount}</strong>
            </div>
            <div className="flex justify-between text-xs font-sans text-dark-text/75">
              <span>Payment Type</span>
              <strong>{orderSuccessDetails.paymentMethod}</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            <button
              onClick={() => navigate('/profile')}
              className="flex-1 font-sans text-xs font-semibold tracking-widest uppercase bg-primary-green text-white py-4 rounded-xl hover:bg-dark-olive transition-colors cursor-pointer"
            >
              Go To Dashboard
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex-1 font-sans text-xs font-semibold tracking-widest uppercase border border-light-beige text-dark-text py-4 rounded-xl hover:bg-light-beige transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If Razorpay Sandbox payment simulation is pending
  if (orderSuccessDetails && orderSuccessDetails.isRazorpayMock) {
    return (
      <div className="min-h-screen bg-cream-bg pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-light-beige border-2 border-sunrise-gold rounded-[32px] p-8 text-center flex flex-col gap-6 animate-scale-up shadow-lg">
          <FiCreditCard className="text-sunrise-gold text-5xl mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-dark-olive">Razorpay Sandbox Gateway</h3>
          <p className="font-sans text-xs text-dark-text/75 leading-relaxed font-light">
            You are simulating online card/UPI checkouts. Click below to verify mock payment signature credentials and process order.
          </p>

          <div className="bg-cream-bg border border-light-beige rounded-xl p-4 text-xs font-sans text-left flex flex-col gap-2">
            <div>Order Number: <strong className="text-dark-olive">{orderSuccessDetails.orderNumber}</strong></div>
            <div>Transaction Amount: <strong className="text-primary-green">₹{orderSuccessDetails.totalAmount}</strong></div>
          </div>

          <button
            onClick={handleVerifyRazorpaySandboxPayment}
            disabled={isProcessing}
            className="w-full font-sans text-xs font-semibold tracking-widest uppercase bg-[#C68A2B] text-dark-olive py-4 rounded-xl hover:bg-dark-olive hover:text-white transition-all shadow-md cursor-pointer"
          >
            {isProcessing ? 'Processing...' : 'Authorize Sandbox Payment'}
          </button>
        </div>
      </div>
    );
  }
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-cream-bg flex items-center justify-center pt-20">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <GiSun className="text-sunrise-gold text-4xl animate-spin-slow" />
          <span className="font-sans text-xs font-semibold text-dark-olive uppercase tracking-widest">Verifying Checkout Session...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-cream-bg pt-28 pb-16 px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Side: Address & Payment configs */}
        <div className="w-full lg:flex-grow flex flex-col gap-8 text-left">
          <div className="flex flex-col gap-2">
            <span className="font-sans text-[10px] font-bold tracking-widest uppercase text-sunrise-gold">
              E-Commerce Checkout
            </span>
            <h2 className="font-serif text-3xl font-bold text-dark-olive">
              Confirm Order Specifications
            </h2>
          </div>

          {/* Mobile Collapsible Order Summary Accordion (Shopify style, visible only on mobile < lg) */}
          <div className="w-full lg:hidden bg-light-beige/30 border border-light-beige rounded-2xl overflow-hidden mt-1 select-none">
            <button
              type="button"
              onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              className="w-full px-5 py-4 flex items-center justify-between font-sans text-xs font-bold text-dark-olive bg-light-beige/45 focus:outline-none cursor-pointer border-none"
            >
              <div className="flex items-center gap-2">
                <FiShoppingBag className="text-primary-green text-sm" />
                <span>{isSummaryExpanded ? 'Hide Order Summary' : 'Show Order Summary'}</span>
                <span className="text-[10px] text-stone-400">▼</span>
              </div>
              <span className="text-sm font-extrabold text-primary-green">₹{grandTotal}</span>
            </button>
            
            {isSummaryExpanded && (
              <div className="p-5 border-t border-light-beige/50 bg-white/50 flex flex-col gap-4 text-left animate-fade-in">
                {/* Items checklist */}
                <div className="flex flex-col gap-3">
                  <span className="text-[9px] font-extrabold tracking-wider uppercase text-stone-400">Items List</span>
                  <div className="flex flex-col gap-2.5 max-h-[180px] overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3 justify-between items-center text-xs font-sans text-dark-text/75 font-light">
                        <span className="truncate max-w-[200px]">
                          {item.product.name} {item.variant ? `(${item.variant.name})` : ''} <strong className="text-primary-green">x{item.quantity}</strong>
                        </span>
                        <span className="font-semibold text-dark-olive">
                          ₹{(item.variant ? item.variant.price : item.product.price) * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coupon apply box (reused) */}
                <div className="border-t border-b border-light-beige/40 py-4 my-1">
                  {renderCouponForm()}
                </div>

                {/* Financial summary calculations */}
                <div className="flex flex-col gap-2 text-xs font-sans text-dark-text/75 font-light border-b border-light-beige/40 pb-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <strong className="text-dark-olive">₹{subtotal}</strong>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-primary-green font-semibold">
                      <span>Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <strong className="text-dark-olive">{shipping === 0 ? 'FREE' : `₹${shipping}`}</strong>
                  </div>
                </div>

                <div className="flex justify-between items-baseline font-serif text-sm font-bold text-dark-olive">
                  <span>Total Due</span>
                  <span className="text-primary-green text-base">₹{grandTotal}</span>
                </div>
              </div>
            )}
          </div>

          {/* 1. SHIPPING ADDRESS SECTION */}
          <div className="bg-light-beige/25 border border-light-beige rounded-[32px] p-6 md:p-8 flex flex-col gap-5">
            <div className="flex justify-between items-center w-full">
              <span className="font-serif text-lg font-bold text-dark-olive flex items-center gap-2">
                <FiMapPin className="text-sunrise-gold" />
                <span>Select Shipping Address</span>
              </span>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigate('/profile?tab=saved-coordinates&from=checkout')}
                  className="font-sans text-[10px] font-bold text-primary-green hover:underline uppercase tracking-wider cursor-pointer"
                >
                  Manage Coordinates
                </button>
              )}
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="font-sans text-xs text-dark-text/60">No saved addresses found. Please go to your Dashboard to save coordinates.</p>
                <button
                  onClick={() => navigate('/profile?tab=saved-coordinates&from=checkout')}
                  className="mt-3 font-sans text-[10px] font-bold tracking-widest uppercase bg-primary-green text-white px-5 py-2.5 rounded-full cursor-pointer"
                >
                  Manage Saved Addresses
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {addresses.map((addr) => {
                  const serviceableList = (settings.serviceableStates || 'Telangana, Andhra Pradesh')
                    .split(',')
                    .map(s => s.trim().toLowerCase());
                  const isAddrServiceable = serviceableList.includes((addr.state || '').trim().toLowerCase());
                  
                  return (
                    <label
                      key={addr.id}
                      className={`flex gap-4 items-start p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                        selectedAddressId === addr.id
                          ? isAddrServiceable
                            ? 'bg-cream-bg border-primary-green/60 shadow-sm border-primary-green'
                            : 'bg-red-50/20 border-red-200 shadow-sm'
                          : 'bg-transparent border-light-beige hover:bg-light-beige/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingAddress"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1.5 w-4 h-4 accent-primary-green shrink-0 cursor-pointer"
                      />
                      <div className="flex flex-col text-xs font-sans text-dark-text/75 leading-relaxed font-light flex-grow">
                        <div className="flex justify-between items-center w-full">
                          <strong className="font-serif text-sm text-dark-olive">{addr.title} ({addr.recipientName})</strong>
                          {!isAddrServiceable && (
                            <span className="text-[9px] font-bold text-red-500 uppercase bg-red-100 px-2 py-0.5 rounded border border-red-200">
                              Non-Serviceable
                            </span>
                          )}
                        </div>
                        <span>{addr.phone}</span>
                        <span>{addr.street ? addr.street.replace(/\s*\|\s*/g, ', ') : ''}, {addr.city ? addr.city.replace(/\s*\|\s*/g, ', ') : ''}, {addr.state} – {addr.postalCode}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. PAYMENT METHODS SECTION */}
          <div className="bg-light-beige/25 border border-light-beige rounded-[32px] p-6 md:p-8 flex flex-col gap-5">
            <span className="font-serif text-lg font-bold text-dark-olive flex items-center gap-2">
              <FiCreditCard className="text-sunrise-gold" />
              <span>Select Payment Option</span>
            </span>

            <div className="flex flex-col gap-4">
              {[
                { id: 'COD', title: 'Cash On Delivery', desc: 'Pay with physical cash upon fresh doorstep arrivals.' },
                { id: 'RAZORPAY', title: 'Online Credit/UPI (Razorpay)', desc: 'Secure instantaneous payments via Card, NetBanking, or UPI.' }
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col gap-2 ${
                    paymentMethod === opt.id
                      ? 'bg-cream-bg border-primary-green shadow-sm'
                      : 'bg-transparent border-light-beige hover:bg-light-beige/20'
                  }`}
                >
                  <strong className="font-serif text-sm text-dark-olive">{opt.title}</strong>
                  <span className="font-sans text-xs text-dark-text/60 font-light leading-relaxed">{opt.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Confirm Purchase Button */}
          <div className="w-full lg:hidden mt-2">
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing || cartItems.length === 0}
              className="w-full h-12 bg-primary-green hover:bg-dark-olive disabled:bg-primary-green/55 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-colors duration-300 shadow-md text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? 'Processing...' : `Confirm Purchase (₹${grandTotal})`}
            </button>
          </div>
        </div>

        {/* Right Side: Order Summaries & Checkout totals (Visible only on desktop lg+) */}
        <div className="hidden lg:flex lg:w-[400px] bg-light-beige/25 border border-light-beige rounded-[36px] p-6 md:p-8 shrink-0 text-left flex-col gap-6">
          <span className="font-serif text-lg font-bold text-dark-olive border-b border-light-beige pb-3 flex items-center gap-2">
            <FiShoppingBag className="text-sunrise-gold" />
            <span>Order Checklist</span>
          </span>

          {/* Item lists */}
          <div className="flex flex-col gap-4 max-h-[220px] overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-3 justify-between items-center text-xs font-sans text-dark-text/75 font-light">
                <span className="truncate max-w-[200px]">
                  {item.product.name} {item.variant ? `(${item.variant.name})` : ''} <strong className="text-primary-green">x{item.quantity}</strong>
                </span>
                <span className="font-semibold text-dark-olive">
                  ₹{(item.variant ? item.variant.price : item.product.price) * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Coupon apply box */}
          <div className="border-t border-b border-light-beige/60 py-4 my-2">
            {renderCouponForm()}
          </div>

          {/* Financial summary calculations */}
          <div className="flex flex-col gap-3 text-xs font-sans text-dark-text/75 font-light border-b border-light-beige pb-4 mb-2">
            <div className="flex justify-between">
              <span>Cart Subtotal</span>
              <strong className="text-dark-olive">₹{subtotal}</strong>
            </div>
            {coupon && (
              <div className="flex justify-between text-primary-green font-semibold">
                <span>Discount Applied</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Charges</span>
              <strong className="text-dark-olive">{shipping === 0 ? 'FREE' : `₹${shipping}`}</strong>
            </div>
          </div>

          <div className="flex justify-between items-baseline font-serif text-lg font-bold text-dark-olive">
            <span>Total Payable</span>
            <span className="text-primary-green text-xl">₹{grandTotal}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing || cartItems.length === 0}
            className="w-full bg-primary-green hover:bg-dark-olive disabled:bg-primary-green/55 text-white font-sans text-xs font-semibold uppercase tracking-widest py-4 rounded-xl transition-colors duration-300 shadow-md text-center flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {isProcessing ? 'Processing...' : `Confirm Purchase (₹${grandTotal})`}
          </button>
        </div>

      </div>
    </div>
  );
}
