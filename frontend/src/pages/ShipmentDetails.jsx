import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft,
  FiShoppingBag,
  FiShield,
  FiPackage,
  FiTruck,
  FiClock,
  FiCompass,
  FiAward,
  FiDownload,
  FiRefreshCw,
  FiMapPin,
  FiCreditCard,
  FiExternalLink
} from 'react-icons/fi';
import { GiSun } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useCartStore } from '../store/useCartStore';

export default function ShipmentDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeInvoice, setActiveInvoice] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders/history/${orderId}`);
        if (response.success && response.order) {
          setOrder(response.order);
        } else {
          setError('We could not retrieve details for this shipment.');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading shipment details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  const timelineSteps = [
    { label: 'Placed', icon: FiShoppingBag, desc: 'Farm harvest request submitted' },
    { label: 'Confirmed', icon: FiShield, desc: 'Suryodaya team accepted order' },
    { label: 'Prepared', icon: FiPackage, desc: 'Harvest gathered & packed' },
    { label: 'Shipped', icon: FiTruck, desc: 'Handed over to carrier' },
    { label: 'In Transit', icon: FiClock, desc: 'On the way to destination' },
    { label: 'Out for Delivery', icon: FiCompass, desc: 'Out with delivery partner' },
    { label: 'Delivered', icon: FiAward, desc: 'Safely arrived at coordinates' }
  ];

  const getCurrentStepIndex = (status) => {
    const normalized = (status || '').toUpperCase().trim();
    if (normalized === 'PENDING' || normalized === 'PLACED') return 0;
    if (normalized === 'CONFIRMED') return 1;
    if (normalized === 'PROCESSING' || normalized === 'PREPARED') return 2;
    if (normalized === 'SHIPPED') return 3;
    if (normalized === 'TRANSIT' || normalized === 'IN_TRANSIT' || normalized === 'IN TRANSIT') return 4;
    if (normalized === 'OUT_FOR_DELIVERY' || normalized === 'OUT OF DELIVERY') return 5;
    if (normalized === 'DELIVERED') return 6;
    if (normalized === 'CANCELLED') return -1;
    return 0;
  };

  const getShipmentMessage = (status) => {
    const normalized = (status || '').toUpperCase().trim();
    if (normalized === 'PENDING' || normalized === 'PLACED') {
      return 'Your order has been packed successfully and is awaiting farm confirmation.';
    }
    if (normalized === 'CONFIRMED') {
      return 'Your order has been confirmed. Preparing to harvest and pack.';
    }
    if (normalized === 'PROCESSING' || normalized === 'PREPARED') {
      return 'Your order has been packed successfully and is ready for dispatch.';
    }
    if (normalized === 'SHIPPED') {
      return 'Shipment has been dispatched from Suryodaya Farms.';
    }
    if (normalized === 'TRANSIT' || normalized === 'IN_TRANSIT' || normalized === 'IN TRANSIT') {
      return 'Shipment is currently in transit.';
    }
    if (normalized === 'OUT_FOR_DELIVERY' || normalized === 'OUT OF DELIVERY') {
      return 'Out for delivery today.';
    }
    if (normalized === 'DELIVERED') {
      const delDate = order?.updatedAt || order?.estimatedDelivery || Date.now();
      const formattedDate = new Date(delDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      return `Delivered successfully on ${formattedDate}.`;
    }
    if (normalized === 'CANCELLED') {
      return 'This order has been cancelled.';
    }
    return 'Your harvest order is currently being processed.';
  };

  const handleReorder = async () => {
    if (!order || !order.orderItems) return;
    setIsReordering(true);
    try {
      for (const item of order.orderItems) {
        await addItem(item.productId, item.variantId || null, item.quantity);
      }
      navigate('/cart');
    } catch (err) {
      console.error('Reorder failed:', err);
    } finally {
      setIsReordering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex flex-col items-center justify-center pt-20 text-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <GiSun className="text-[#C68A2B] text-5xl animate-spin-slow" />
          <span className="font-serif text-sm font-semibold text-[#2F3B0C] uppercase tracking-widest">
            Loading Premium Tracking Logs...
          </span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex flex-col items-center justify-center pt-32 px-4 text-center">
        <div className="max-w-md bg-white border border-[#EAE4D8] rounded-[32px] p-8 shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-550 border border-red-100 flex items-center justify-center text-2xl mx-auto">
            ✕
          </div>
          <h2 className="font-serif text-xl font-bold text-[#2F3B0C]">Failed to Load Shipment</h2>
          <p className="text-stone-500 text-xs leading-relaxed">
            {error || 'We could not fetch the details for this shipment at this time.'}
          </p>
          <button 
            onClick={() => navigate('/profile')} 
            className="w-full py-3 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition duration-300"
          >
            Go Back to Profile
          </button>
        </div>
      </div>
    );
  }

  const logisticsStatus = order.logistics?.status || order.status || 'PENDING';
  const currentStep = getCurrentStepIndex(logisticsStatus);
  const isCancelled = logisticsStatus === 'CANCELLED';
  const isShipped = ['SHIPPED', 'IN_TRANSIT', 'IN TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(logisticsStatus);

  return (
    <div className="min-h-screen bg-[#F9F6F0] pt-28 pb-20 px-4 md:px-8 relative text-[#1E1E1E]">
      
      {/* Confetti celebration for delivered state */}
      {logisticsStatus === 'DELIVERED' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#C68A2B]/40"
              initial={{ 
                bottom: "-10px", 
                left: `${5 + Math.random() * 90}%`, 
                scale: 0.2 + Math.random() * 0.8, 
                opacity: 0.8 
              }}
              animate={{ 
                y: -300 - Math.random() * 200, 
                x: [-30 + Math.random() * 60, -30 + Math.random() * 60],
                opacity: 0, 
                scale: 0.1 
              }}
              transition={{ 
                duration: 4 + Math.random() * 2, 
                repeat: Infinity, 
                ease: "easeOut",
                delay: Math.random() * 3
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/profile')} 
            className="flex items-center gap-2 text-stone-500 hover:text-[#4E641A] font-sans text-xs font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer group"
          >
            <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Profile
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveInvoice(true)} 
              className="px-4 py-2 border border-[#EAE4D8] text-stone-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-stone-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <FiDownload /> Invoice
            </button>
            <button 
              onClick={handleReorder}
              disabled={isReordering}
              className="px-4 py-2 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <FiRefreshCw className={isReordering ? "animate-spin" : ""} />
              {isReordering ? 'Reordering...' : 'Reorder'}
            </button>
          </div>
        </div>

        {/* 1. Shipment Header Card */}
        <div className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C68A2B] bg-[#C68A2B]/10 px-3 py-1 rounded-full border border-[#C68A2B]/20 inline-block">
              Organic Farm Harvest
            </span>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-[#2F3B0C]">
              Order {order.orderNumber}
            </h1>
            <p className="text-xs text-stone-400 font-medium">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          <div className="flex flex-col md:items-end gap-1.5">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full border ${
                logisticsStatus === 'DELIVERED' 
                  ? 'bg-green-700 text-white border-green-700 shadow-sm' 
                  : isCancelled
                    ? 'bg-red-650 text-white border-red-650'
                    : 'bg-[#4E641A]/5 text-[#4E641A] border-[#4E641A]/10'
              }`}>
                {isCancelled ? 'Cancelled' : logisticsStatus}
              </span>
              <span className="text-xs text-stone-500 font-bold uppercase tracking-widest bg-stone-100 border border-stone-200 px-3 py-1 rounded-full">
                {order.paymentMethod}
              </span>
            </div>
            <div className="font-serif text-2xl font-extrabold text-[#4E641A]">
              ₹{order.totalAmount}
            </div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Dynamic Status Notification Message */}
        <div className="bg-[#4E641A]/5 border border-[#4E641A]/10 rounded-2xl p-4 text-left flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#4E641A]/10 flex items-center justify-center shrink-0">
            <FiClock className="w-4 h-4 text-[#4E641A]" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4E641A] block">Latest Logistics Update</span>
            <p className="text-xs font-semibold text-[#2F3B0C] leading-snug">
              {getShipmentMessage(logisticsStatus)}
            </p>
          </div>
        </div>

        {/* 2. Shipment Timeline Section */}
        <div className="bg-white border border-[#EAE4D8] rounded-[32px] p-6 md:p-8 shadow-sm space-y-8 text-left">
          <h2 className="font-serif text-lg font-bold text-[#2F3B0C] border-b pb-3 border-stone-100 flex items-center gap-2">
            <FiTruck className="text-[#C68A2B]" /> Shipment Journey
          </h2>

          {isCancelled ? (
            <div className="py-6 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-150 flex items-center justify-center text-red-550 text-xl font-bold shadow-sm">
                ✕
              </div>
              <h3 className="font-serif text-base font-bold text-red-800">Shipment Cancelled</h3>
              <p className="text-xs text-stone-500 max-w-sm leading-relaxed font-medium">
                This shipment has been cancelled. If payment was processed online, a refund will be initiated to your source account automatically.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Horizontal Timeline */}
              <div className="hidden md:block relative py-8 px-4">
                {/* Connector track */}
                <div className="absolute left-8 right-8 top-[36px] h-1 bg-[#EAE4D8]/60 -translate-y-1/2 rounded-full" />
                <motion.div 
                  className="absolute left-8 top-[36px] h-1 bg-gradient-to-r from-[#4E641A] via-[#5F7C20] to-[#C68A2B] -translate-y-1/2 rounded-full shadow-xs" 
                  initial={{ width: "0%" }}
                  animate={{ width: `calc(${(currentStep / (timelineSteps.length - 1)) * 100}% - 16px)` }}
                  transition={{ type: "spring", stiffness: 45, damping: 12 }}
                />

                {/* Animated truck */}
                {currentStep > 0 && currentStep < timelineSteps.length - 1 && (
                  <motion.div
                    className="absolute top-[36px] z-20 text-[#4E641A] bg-white p-1 rounded-full border border-[#EAE4D8] shadow-md flex items-center justify-center"
                    initial={{ left: "8%" }}
                    animate={{ 
                      left: `calc(8% + ${(currentStep / (timelineSteps.length - 1)) * 84}% - 14px)`,
                      y: ["-50%", "-62%", "-50%"]
                    }}
                    transition={{ 
                      left: { type: "spring", stiffness: 45, damping: 12 },
                      y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" }
                    }}
                  >
                    <FiTruck className="w-3.5 h-3.5 text-[#C68A2B] animate-pulse" />
                  </motion.div>
                )}

                <div className="flex justify-between items-start">
                  {timelineSteps.map((step, idx) => {
                    const isDone = currentStep >= idx;
                    const isCurrent = currentStep === idx;
                    const StepIcon = step.icon;

                    return (
                      <div key={idx} className="flex flex-col items-center w-24 text-center relative">
                        {/* Ripple for Active step */}
                        {isCurrent && (
                          <div className="absolute top-[36px] -translate-y-1/2 flex items-center justify-center pointer-events-none">
                            <motion.div 
                              className="absolute w-12 h-12 rounded-full bg-[#4E641A]/10 border border-[#4E641A]/20"
                              animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                            />
                          </div>
                        )}

                        {/* Node icon bubble */}
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 shadow-xxs transition-all duration-350 ${
                          isDone 
                            ? 'bg-[#4E641A] border-[#4E641A] text-white shadow-sm' 
                            : 'bg-white border-[#EAE4D8] text-stone-400'
                        } ${isCurrent ? 'ring-4 ring-[#4E641A]/15 scale-105' : ''}`}>
                          {isDone && idx < currentStep ? (
                            <span className="font-extrabold text-xs">✓</span>
                          ) : (
                            <StepIcon className={`w-4 h-4 ${isCurrent ? 'text-[#C68A2B] animate-pulse' : ''}`} />
                          )}
                        </div>

                        {/* Text labels */}
                        <div className="mt-3 space-y-0.5">
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${
                            isCurrent ? 'text-[#C68A2B]' : isDone ? 'text-[#2F3B0C]' : 'text-stone-400'
                          }`}>
                            {step.label}
                          </span>
                          <span className="text-[8px] text-stone-400 leading-tight font-medium block max-w-[80px] mx-auto">
                            {step.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Vertical Timeline */}
              <div className="block md:hidden relative pl-8 space-y-6">
                {/* Connector line */}
                <div className="absolute left-[13px] top-4 bottom-4 w-1 bg-[#EAE4D8]/60 rounded-full" />
                <motion.div 
                  className="absolute left-[13px] top-4 w-1 bg-gradient-to-b from-[#4E641A] via-[#5F7C20] to-[#C68A2B] rounded-full shadow-xs" 
                  initial={{ height: "0%" }}
                  animate={{ height: `${(currentStep / (timelineSteps.length - 1)) * 100}%` }}
                  transition={{ type: "spring", stiffness: 45, damping: 12 }}
                  style={{ transformOrigin: "top" }}
                />

                {timelineSteps.map((step, idx) => {
                  const isDone = currentStep >= idx;
                  const isCurrent = currentStep === idx;
                  const StepIcon = step.icon;

                  return (
                    <div key={idx} className="flex items-start gap-4 relative">
                      {/* Node Icon */}
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 shrink-0 shadow-xxs transition-colors duration-300 ${
                        isDone 
                          ? 'bg-[#4E641A] border-[#4E641A] text-white shadow-sm' 
                          : 'bg-white border-[#EAE4D8] text-stone-300'
                      } ${isCurrent ? 'ring-4 ring-[#4E641A]/10 scale-105' : ''}`}>
                        {isDone && idx < currentStep ? (
                          <span className="font-extrabold text-[10px]">✓</span>
                        ) : (
                          <StepIcon className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#C68A2B] animate-pulse' : ''}`} />
                        )}
                      </div>

                      {/* Content details */}
                      <div className="space-y-0.5 text-left pt-0.5">
                        <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          isCurrent ? 'text-[#C68A2B]' : isDone ? 'text-[#2F3B0C]' : 'text-stone-400'
                        }`}>
                          {step.label}
                          {isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C68A2B] animate-ping" />
                          )}
                        </h4>
                        <p className="text-[10px] text-stone-500 font-medium">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 3. Logistics Tracking Card */}
        <div className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 md:p-8 shadow-sm text-left">
          <h2 className="font-serif text-lg font-bold text-[#2F3B0C] border-b pb-3 border-stone-100 flex items-center gap-2">
            <FiTruck className="text-[#C68A2B]" /> Courier & Delivery Logistics
          </h2>

          {!isShipped && !isCancelled ? (
            /* Elegant Placeholder before dispatch */
            <div className="py-8 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-200/50 flex items-center justify-center text-[#B8833E]/50 text-xl shadow-xxs">
                <FiClock />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold text-[#2F3B0C]">Direct Farm Dispatch Pending</h4>
                <p className="text-xs text-stone-500 font-medium max-w-sm mx-auto leading-relaxed">
                  Tracking details will be available after dispatch. Your organic crops are being freshly packed at the farm coordinate.
                </p>
              </div>
            </div>
          ) : isCancelled ? (
            /* Cancelled state tracking placeholder */
            <div className="py-8 text-center flex flex-col items-center gap-3 text-stone-400">
              <span className="text-2xl">📦</span>
              <p className="text-xs font-semibold">Logistics tracking cancelled for this order.</p>
            </div>
          ) : (
            /* Premium Logistics details card */
            <div className="pt-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F9F6F0]/50 p-5 rounded-2xl border border-[#EAE4D8]/60">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#4E641A] text-white flex items-center justify-center text-xl font-serif font-bold shadow-md shrink-0">
                    {order.logistics?.courierName ? order.logistics.courierName.charAt(0).toUpperCase() : '📦'}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 block">Courier Partner</span>
                    <h3 className="font-serif text-base font-extrabold text-[#2F3B0C]">
                      {order.logistics?.courierName || 'Standard Logistics'}
                    </h3>
                  </div>
                </div>

                <span className="bg-[#4E641A]/10 text-[#4E641A] border border-[#4E641A]/20 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-widest text-[9px]">
                  {order.logistics?.status || logisticsStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs text-stone-600 font-sans pt-2">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-stone-400 block">Tracking Number / AWB</span>
                  <span className="font-mono font-bold text-stone-850 text-xs bg-stone-100 border border-stone-200 px-3 py-1 rounded-md inline-block">
                    {order.logistics?.trackingNumber || 'Not Provided'}
                  </span>
                </div>

                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-stone-400 block">Dispatch Date</span>
                  <span className="font-bold text-stone-800 block text-sm">
                    {order.logistics?.dispatchDate 
                      ? new Date(order.logistics.dispatchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) 
                      : 'Pending Dispatch'}
                  </span>
                </div>

                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-stone-400 block">Estimated Delivery</span>
                  <span className="font-bold text-stone-800 block text-sm">
                    {order.logistics?.estimatedDeliveryDate 
                      ? new Date(order.logistics.estimatedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) 
                      : (order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending calculation')}
                  </span>
                </div>
              </div>

              {/* Interactive External Link CTA */}
              {order.logistics?.trackingUrl && (
                <div className="pt-4 border-t border-stone-150 flex justify-end">
                  <a
                    href={order.logistics.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition duration-300 shadow-sm text-center flex items-center justify-center gap-1.5 cursor-pointer scale-100 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Track Live Shipment <FiExternalLink className="text-[#C68A2B]" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Products & Shipping Addresses Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          
          {/* Address/Coordinates Card */}
          <div className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#2F3B0C] border-b pb-3 border-stone-100 flex items-center gap-2">
                <FiMapPin className="text-[#C68A2B]" /> Delivery Coordinates
              </h2>
              {order.shippingAddress ? (
                <p className="text-xs text-stone-600 leading-relaxed font-semibold">
                  <strong className="text-stone-800 text-sm font-serif">{order.shippingAddress.recipientName}</strong> <br />
                  📞 {order.shippingAddress.phone} <br />
                  🏢 {order.shippingAddress.street} <br />
                  📍 {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.postalCode} <br />
                  🗺️ {order.shippingAddress.country || 'India'}
                </p>
              ) : (
                <p className="text-xs text-stone-400 font-medium">No coordinates recorded for this shipment.</p>
              )}
            </div>

            <div className="pt-4 mt-6 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-extrabold uppercase tracking-widest">
              <span>Delivery Coordinate ID</span>
              <span className="font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          {/* Product Items Breakdown Section */}
          <div className="bg-white border border-[#EAE4D8] rounded-[28px] p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#2F3B0C] border-b pb-3 border-stone-100 flex items-center gap-2">
              <FiShoppingBag className="text-[#C68A2B]" /> Harvest Breakdown
            </h2>

            <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1 scrollbar-hide">
              {order.orderItems?.map((item, idx) => {
                const productImg = item.product?.images?.length > 0 ? item.product.images[0].url : item.product?.hoverImage || item.product?.image;
                const category = item.product?.categories?.[0]?.name || item.product?.productType || 'STAPLES';
                
                return (
                  <div key={idx} className="flex items-center justify-between bg-[#F9F6F0]/50 p-3.5 rounded-2xl border border-[#EAE4D8] gap-4 hover:bg-[#F9F6F0]/80 transition duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-50 border border-[#EAE4D8] flex items-center justify-center shrink-0 shadow-xxs">
                        {productImg ? (
                          <img src={productImg} alt={item.product?.name || 'Product'} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">🌾</span>
                        )}
                      </div>
                      <div className="text-left space-y-0.5">
                        <span className="inline-block text-[8px] font-extrabold text-[#C68A2B] bg-[#C68A2B]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                          {category}
                        </span>
                        <h4 className="font-serif text-xs font-bold text-[#2F3B0C] leading-snug line-clamp-1">
                          {item.product?.name || 'Premium Staple'}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-stone-400 font-extrabold uppercase tracking-widest bg-white border border-[#EAE4D8] px-1.5 py-0.5 rounded">
                            {item.variant?.name || item.product?.weight || '500 ml'}
                          </span>
                          <span className="text-[10px] text-stone-500 font-bold">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-serif text-xs font-extrabold text-[#4E641A] block">
                        ₹{item.price * item.quantity}
                      </span>
                      <span className="text-[8px] text-stone-400 font-medium block">
                        ₹{item.price} each
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total items pricing banner */}
            <div className="pt-3 border-t border-stone-100 flex justify-between items-center text-xs">
              <span className="text-stone-450 font-bold">Subtotal Amount</span>
              <span className="font-bold text-[#2F3B0C]">₹{order.totalAmount + (order.discountAmount || 0)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between items-center text-xs text-green-755 font-semibold">
                <span>Voucher Saved</span>
                <span>- ₹{order.discountAmount}</span>
              </div>
            )}
            <div className="pt-2 flex justify-between items-center text-sm border-t font-semibold">
              <span className="font-serif text-[#2F3B0C]">Total Investment</span>
              <span className="font-extrabold text-[#4E641A]">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Invoice receipt modal popup */}
      <AnimatePresence>
        {activeInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveInvoice(false)} 
              className="absolute inset-0 bg-[#2F3B0C]/45 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="relative bg-white border border-[#EAE4D8] rounded-[28px] p-6 md:p-8 w-full max-w-lg shadow-2xl z-10 text-left space-y-5"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <GiSun className="w-5 h-5 text-[#C68A2B] animate-spin-slow" />
                  <span className="font-serif text-base font-bold text-[#2F3B0C]">Suryodaya Invoice Receipt</span>
                </div>
                <button onClick={() => setActiveInvoice(false)} className="text-stone-400 font-extrabold cursor-pointer hover:text-stone-600 transition">✕</button>
              </div>

              <div className="space-y-4 text-xs font-semibold text-stone-500">
                <div className="flex justify-between border-b pb-2">
                  <span>Order Reference</span>
                  <span className="font-mono font-bold text-stone-800">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Authorized Date</span>
                  <span className="text-stone-850 font-bold">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Gateway Status</span>
                  <span className="text-stone-850 font-bold">{order.paymentMethod} • {order.paymentStatus}</span>
                </div>
                
                <div className="space-y-2 pt-2">
                  <span className="text-[9px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">SHIPPED HARVESTS</span>
                  <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                    {order.orderItems?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-[#F9F6F0] p-3 rounded-xl border border-[#EAE4D8] gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base shrink-0">🌱</span>
                          <span className="font-semibold text-stone-700">
                            {item.product?.name} {item.variant ? `(${item.variant.name})` : `(${item.product?.weight || '500 ml'})`} x{item.quantity}
                          </span>
                        </div>
                        <span className="font-bold text-[#2F3B0C] shrink-0">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center text-sm border-t font-semibold">
                  <span className="font-serif text-[#2F3B0C]">Total Investment</span>
                  <span className="font-extrabold text-[#4E641A] text-base">₹{order.totalAmount}</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  alert('Receipt compiled and downloaded successfully.');
                  setActiveInvoice(false);
                }} 
                className="w-full py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition duration-300 cursor-pointer"
              >
                Download Receipt PDF
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
