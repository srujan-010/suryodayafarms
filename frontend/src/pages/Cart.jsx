import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiTrash2, FiPlus, FiMinus, FiArrowRight, FiPercent } from 'react-icons/fi';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import api from '../utils/api';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, subtotal, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Validate coupon code directly with the API
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponError('');
    setCouponSuccess('');
    setIsValidating(true);

    try {
      if (!isAuthenticated) {
        setCouponError('Please sign in to apply coupon codes.');
        setIsValidating(false);
        return;
      }

      const response = await api.post('/orders/coupon/validate', {
        code: couponCode.trim(),
        orderValue: subtotal,
      });

      if (response.success && response.coupon) {
        setAppliedCoupon(response.coupon);
        setCouponSuccess(`Coupon "${response.coupon.code}" applied successfully!`);
        // Save applied coupon in sessionStorage to persist it to the checkout page!
        sessionStorage.setItem('appliedCoupon', JSON.stringify(response.coupon));
      } else {
        setCouponError('Could not validate coupon.');
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code or minimum purchase value not met.');
      setAppliedCoupon(null);
      sessionStorage.removeItem('appliedCoupon');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
    sessionStorage.removeItem('appliedCoupon');
  };

  // Calculate discount math
  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      return (subtotal * appliedCoupon.discountValue) / 100;
    }
    return appliedCoupon.discountValue;
  };

  const discountAmount = getDiscountAmount();
  const finalTotal = Math.max(subtotal - discountAmount, 0);

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      useAuthStore.getState().setCheckoutResumeRedirect('/checkout');
      useAuthStore.getState().setLoginRequiredModalOpen(true);
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-cream-bg pt-28 pb-20 px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Context */}
        <div className="flex flex-col gap-3 mb-10 text-left">
          <span className="font-sans text-[10px] font-bold tracking-[0.3em] uppercase text-sunrise-gold">
            E-Commerce checkout drawer
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-dark-olive leading-tight">
            Shopping Cart
          </h1>
          <div className="w-16 h-[1.5px] bg-sunrise-gold" />
        </div>

        {cartItems.length === 0 ? (
          /* Empty state */
          <div className="bg-light-beige/20 border border-light-beige rounded-[32px] py-20 px-6 text-center max-w-2xl mx-auto flex flex-col items-center gap-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green">
              <FiShoppingBag className="text-3xl" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-serif text-2xl font-bold text-dark-olive">Your Cart is Empty</h2>
              <p className="font-sans text-xs md:text-sm text-dark-text/70 leading-relaxed font-light max-w-sm">
                Explore our catalog of wood-pressed oils, bilona churned A2 ghee, and native heirloom millets to bless your family's health.
              </p>
            </div>
            <Link
              to="/products"
              className="font-sans text-xs font-semibold tracking-widest uppercase bg-primary-green text-white px-8 py-4 rounded-xl shadow-md hover:bg-dark-olive transition-all duration-300"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          /* Cart contents */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Left Column: Cart items table list */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-white rounded-[32px] border border-light-beige shadow-sm p-6 sm:p-8 flex flex-col gap-6">
                
                {cartItems.map((item) => {
                  const itemPrice = item.variant ? item.variant.price : item.product.price;
                  const itemImg = item.product.images?.length > 0 ? item.product.images[0].url : item.product.image;
                  
                  return (
                    <div 
                      key={item.id} 
                      className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center border-b border-light-beige/50 pb-6 last:border-b-0 last:pb-0"
                    >
                      <div className="flex gap-4 items-center text-left">
                        <img
                          src={itemImg}
                          alt={item.product.name}
                          className="w-20 h-20 rounded-2xl object-cover border border-light-beige bg-light-beige shrink-0 shadow-sm"
                        />
                        <div className="flex flex-col gap-1.5">
                          <span className="font-serif text-base font-bold text-dark-olive leading-tight">
                            {item.product.name}
                          </span>
                          {item.variant && (
                            <span className="font-sans text-[10px] text-sunrise-gold uppercase tracking-wider font-semibold">
                              Size: {item.variant.name}
                            </span>
                          )}
                          <span className="font-serif text-sm font-semibold text-primary-green">
                            ₹{itemPrice} / Unit
                          </span>
                        </div>
                      </div>

                      {/* Interactive Quantities & Subtotal controls */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-8 pl-0 sm:pl-4 border-t border-light-beige/30 pt-4 sm:border-0 sm:pt-0">
                        <div className="flex items-center border border-light-beige rounded-xl bg-cream-bg px-1">
                          <button
                            onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                            className="p-2 text-dark-olive hover:text-primary-green transition-colors"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="font-sans text-sm font-semibold px-3 text-dark-olive min-w-[24px] text-center select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-dark-olive hover:text-primary-green transition-colors"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>

                        <div className="flex items-center gap-6 shrink-0">
                          <span className="font-serif text-base font-bold text-primary-green min-w-[70px] text-right">
                            ₹{itemPrice * item.quantity}
                          </span>
                          
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:bg-red-500/10 p-2.5 rounded-xl transition-colors shadow-sm border border-red-500/10 bg-red-50/50"
                            title="Remove Product"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}

              </div>
              
              <div className="flex justify-start">
                <Link
                  to="/products"
                  className="font-sans text-xs font-semibold tracking-widest uppercase border border-light-beige hover:bg-light-beige text-dark-text py-4 px-6 rounded-xl transition-colors duration-300 shadow-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right Column: Calculations & Coupon summary card */}
            <div className="flex flex-col gap-6">
              
              {/* Coupon validator card */}
              <div className="bg-white rounded-[32px] border border-light-beige shadow-sm p-6 text-left flex flex-col gap-4">
                <span className="font-serif text-base font-bold text-dark-olive flex items-center gap-2">
                  <FiPercent className="text-primary-green" />
                  <span>Promotional Coupon</span>
                </span>
                
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-primary-green/5 border border-primary-green/20 rounded-2xl p-4">
                    <div className="flex flex-col">
                      <span className="font-sans text-xs font-semibold text-primary-green uppercase tracking-wide">
                        Coupon "{appliedCoupon.code}" Active
                      </span>
                      <span className="font-sans text-[10px] text-dark-text/60 mt-0.5">
                        {appliedCoupon.discountType === 'PERCENTAGE' 
                          ? `${appliedCoupon.discountValue}% Off applied` 
                          : `₹${appliedCoupon.discountValue} Flat deduction applied`}
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="font-sans text-[10px] font-bold text-red-500 hover:underline uppercase tracking-wider pl-4"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. SOILFIRST15"
                      className="flex-grow bg-cream-bg border border-light-beige rounded-xl py-3 px-4 font-sans text-xs uppercase focus:outline-none focus:border-primary-green"
                    />
                    <button
                      type="submit"
                      disabled={isValidating || !couponCode.trim()}
                      className="bg-primary-green text-white px-5 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider hover:bg-dark-olive disabled:opacity-40 transition-colors"
                    >
                      {isValidating ? '...' : 'Apply'}
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="font-sans text-[10px] font-semibold text-red-500 leading-normal pl-1">
                    {couponError}
                  </p>
                )}
                {couponSuccess && (
                  <p className="font-sans text-[10px] font-semibold text-primary-green leading-normal pl-1">
                    {couponSuccess}
                  </p>
                )}
              </div>

              {/* Total breakdown card */}
              <div className="bg-white rounded-[32px] border border-light-beige shadow-sm p-6 sm:p-8 text-left flex flex-col gap-6">
                <span className="font-serif text-lg font-bold text-dark-olive pb-4 border-b border-light-beige/50 block">
                  Order Summary
                </span>

                <div className="flex flex-col gap-3 font-sans text-xs text-dark-text/75">
                  <div className="flex justify-between">
                    <span>Subtotal Basket:</span>
                    <span className="font-semibold text-dark-olive">₹{subtotal}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-primary-green font-medium">
                      <span>Discount Received:</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping Logistics:</span>
                    <span className="text-primary-green font-semibold uppercase tracking-wider text-[9px] bg-primary-green/5 px-2 py-0.5 rounded">
                      FREE DELIVERY
                    </span>
                  </div>
                </div>

                <div className="border-t border-light-beige/50 pt-4 flex justify-between items-baseline font-serif text-lg font-bold text-dark-olive">
                  <span>Grand Total:</span>
                  <span className="text-primary-green text-2xl">₹{finalTotal}</span>
                </div>

                <p className="font-sans text-[10px] text-dark-text/50 font-light italic leading-normal">
                  All local taxes, agricultural cess, and standard protective compost packaging variables are inclusive in the summary.
                </p>

                <button
                  onClick={handleCheckoutClick}
                  className="w-full group font-sans text-xs font-semibold tracking-widest uppercase bg-primary-green text-white py-4 rounded-xl hover:bg-dark-olive transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
