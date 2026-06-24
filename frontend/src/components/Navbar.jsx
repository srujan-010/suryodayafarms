import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiChevronRight, FiShoppingBag, FiUser, FiTrash2, FiPlus, FiMinus, FiHeart } from 'react-icons/fi';
import { GiSun } from 'react-icons/gi';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Global stores bindings
  const { user, isAuthenticated, setAuthModalOpen } = useAuthStore();
  const { cartItems, subtotal, updateQuantity, removeItem, fetchCart } = useCartStore();
  const wishlistItems = useWishlistStore(state => state.wishlistItems);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch cart on mount or when auth state updates
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Close overlays on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCartOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Products', path: '/products' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out px-3 sm:px-6 md:px-12 app-header-nav ${
          isScrolled || isCartOpen || isMobileMenuOpen
            ? 'bg-cream-bg/95 backdrop-blur-md shadow-md border-b border-light-beige py-2 lg:py-3'
            : 'bg-cream-bg/40 backdrop-blur-md border-b border-white/10 py-3.5 lg:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Reveal */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3.5 cursor-pointer group select-none text-left animate-fade-in"
          >
            <img 
              src="https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png" 
              alt="Suryodaya Farms Logo" 
              className="h-10 sm:h-12 md:h-16 lg:h-20 w-auto object-contain transition duration-500 group-hover:scale-105"
            />
            <div className="flex flex-col justify-center text-left">
              <span className="font-serif text-base sm:text-xl md:text-2xl font-bold tracking-wide text-dark-olive leading-none group-hover:text-primary-green transition-colors duration-300">
                SURYODAYA
              </span>
              <span className="font-sans text-[8px] sm:text-[9px] font-semibold tracking-[0.2em] sm:tracking-[0.25em] text-sunrise-gold leading-none mt-1 sm:mt-1.5 hidden min-[400px]:block">
                FARMS & ORGANICS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    relative font-sans text-sm font-medium tracking-wide py-2 transition-all duration-300 select-none
                    ${isActive 
                      ? 'text-primary-green' 
                      : isScrolled
                        ? 'text-dark-text/80 hover:text-primary-green'
                        : 'text-dark-olive/90 hover:text-primary-green'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary-green rounded-full transform origin-left transition-all duration-300" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Icons: Profile, Wishlist & Cart */}
            <div className="flex items-center gap-5 border-l border-light-beige pl-6">
              
              {/* Wishlist Heart Icon Button */}
              <Link
                to="/wishlist"
                className={`transition-colors duration-300 relative ${
                  isScrolled ? 'text-dark-olive hover:text-primary-green' : 'text-dark-olive hover:text-primary-green'
                }`}
                title="Wishlist"
              >
                <FiHeart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-primary-green text-white font-sans text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-sm">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Profile Icon Button */}
              <button
                onClick={handleProfileClick}
                className={`transition-colors duration-300 relative cursor-pointer ${
                  isScrolled ? 'text-dark-olive hover:text-primary-green' : 'text-dark-olive hover:text-primary-green'
                }`}
                title={isAuthenticated ? "Dashboard" : "Login"}
              >
                <FiUser size={20} />
                {isAuthenticated && (
                  <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-primary-green border border-white" />
                )}
              </button>

              {/* Cart Icon Button */}
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className={`transition-colors duration-300 relative cursor-pointer ${
                  isScrolled ? 'text-dark-olive hover:text-primary-green' : 'text-dark-olive hover:text-primary-green'
                }`}
                title="Cart Drawer"
              >
                <FiShoppingBag size={20} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-primary-green text-white font-sans text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-sm">
                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Hamburger + Cart/Wishlist/Profile icons */}
          <div className="lg:hidden flex items-center gap-1 sm:gap-2.5">
            
            <Link
              to="/wishlist"
              className="p-2 transition-colors relative text-dark-olive hover:text-primary-green"
              title="Wishlist"
            >
              <FiHeart size={20} className="stroke-[2px]" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-primary-green text-white font-sans text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <button
              onClick={handleProfileClick}
              className="p-2 transition-colors relative text-dark-olive hover:text-primary-green cursor-pointer"
              title={isAuthenticated ? "Dashboard" : "Login"}
            >
              <FiUser size={20} className="stroke-[2px]" />
              {isAuthenticated && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-green border border-white" />
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 focus:outline-none cursor-pointer text-dark-olive hover:text-primary-green"
              title="Cart Drawer"
            >
              <FiShoppingBag size={20} className="stroke-[2px]" />
              {cartItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-primary-green text-white font-sans text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg transition-colors focus:outline-none cursor-pointer text-dark-olive hover:text-primary-green"
              title="Toggle Menu"
            >
              {isMobileMenuOpen ? <FiX size={22} className="stroke-[2.5px]" /> : <FiMenu size={22} className="stroke-[2.5px]" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Cart Drawer Sliding Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-dark-olive/45 backdrop-blur-sm transition-opacity duration-500 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-md z-50 bg-cream-bg shadow-2xl border-l border-light-beige flex flex-col justify-between py-8 px-6 transition-transform duration-500 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden text-left">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-light-beige pb-6 shrink-0">
            <span className="font-serif text-xl font-bold text-dark-olive flex items-center gap-2">
              <FiShoppingBag className="text-primary-green" />
              <span>Shopping Cart</span>
            </span>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-dark-olive p-1 rounded-full bg-light-beige hover:bg-primary-green/10 cursor-pointer"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-grow overflow-y-auto py-6 flex flex-col gap-6 no-scrollbar">
            {cartItems.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center gap-4">
                <FiShoppingBag className="text-dark-olive/20 text-5xl" />
                <p className="font-serif text-base text-dark-olive font-semibold">Your cart is empty.</p>
                <p className="font-sans text-xs text-dark-text/60 max-w-[200px] mx-auto">Explore our premium selection and bring solar blessings to your home.</p>
                <Link
                  to="/products"
                  onClick={() => setIsCartOpen(false)}
                  className="font-sans text-xs font-semibold tracking-widest uppercase bg-primary-green text-white px-5 py-2.5 rounded-xl shadow block text-center mt-2"
                >
                  Shop Staples
                </Link>
              </div>
            ) : (
              cartItems.map((item) => {
                const itemPrice = item.variant ? item.variant.price : item.product.price;
                const itemImg = item.product.images?.length > 0 ? item.product.images[0].url : item.product.image;
                
                return (
                  <div key={item.id} className="flex gap-4 items-start border-b border-light-beige/50 pb-5 last:border-b-0">
                    <div className="w-16 h-16 bg-transparent shrink-0 flex items-center justify-center relative">
                      <img
                        src={getOptimizedImageUrl(itemImg, { width: 80, height: 80, cropMode: 'fit' })}
                        alt={item.product.name}
                        className="w-full h-full object-contain p-1 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
                      />
                    </div>
                    <div className="flex-grow flex flex-col gap-1">
                      <span className="font-serif text-sm font-bold text-dark-olive leading-tight">
                        {item.product.name}
                      </span>
                      {item.variant && (
                        <span className="font-sans text-[10px] text-sunrise-gold uppercase tracking-wider font-semibold">
                          Variant: {item.variant.name}
                        </span>
                      )}
                      
                      <div className="flex justify-between items-center mt-2.5">
                        {/* Quantity triggers */}
                        <div className="flex items-center border border-light-beige rounded-lg bg-cream-bg">
                          <button
                            onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                            className="p-1.5 text-dark-olive hover:text-primary-green"
                          >
                            <FiMinus size={10} />
                          </button>
                          <span className="font-sans text-xs font-semibold px-2.5 text-dark-olive select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-dark-olive hover:text-primary-green"
                          >
                            <FiPlus size={10} />
                          </button>
                        </div>

                        <span className="font-serif text-sm font-bold text-primary-green">
                          ₹{itemPrice * item.quantity}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                      title="Remove Item"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Subtotal & Checkout links */}
          {cartItems.length > 0 && (
            <div className="border-t border-light-beige pt-6 shrink-0 flex flex-col gap-4">
              <div className="flex justify-between items-baseline font-serif text-base font-bold text-dark-olive">
                <span>Subtotal Basket:</span>
                <span className="text-primary-green text-lg">₹{subtotal}</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    if (isAuthenticated) {
                      navigate('/checkout');
                    } else {
                      useAuthStore.getState().setCheckoutResumeRedirect('/checkout');
                      setAuthModalOpen(true);
                    }
                  }}
                  className="w-full font-sans text-xs font-semibold tracking-widest uppercase bg-primary-green text-white py-3.5 rounded-xl hover:bg-dark-olive transition-colors shadow-md text-center block cursor-pointer"
                >
                  Proceed to Checkout
                </button>
                <Link
                  to="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full font-sans text-xs font-semibold tracking-widest uppercase border border-light-beige text-dark-text py-3.5 rounded-xl hover:bg-light-beige transition-colors text-center block bg-white"
                >
                  View Full Cart
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Slide-In Nav Menu */}
      <div
        className={`fixed inset-0 z-40 bg-dark-olive/45 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[80%] max-w-sm z-50 bg-cream-bg shadow-2xl border-l border-light-beige flex flex-col justify-between py-8 px-6 transition-transform duration-500 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between border-b border-light-beige pb-6 text-left">
            <div className="flex items-center gap-3.5">
              <img 
                src="https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png" 
                alt="Suryodaya Farms Logo" 
                className="h-10 w-auto object-contain"
              />
              <div className="flex flex-col justify-center">
                <span className="font-serif text-lg font-bold text-dark-olive leading-none">
                  SURYODAYA
                </span>
                <span className="font-sans text-[8px] font-semibold tracking-[0.2em] text-sunrise-gold mt-1">
                  FARMS
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-dark-olive p-1 rounded-full bg-light-beige hover:bg-primary-green/10 cursor-pointer"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-8">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between font-sans text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-xl transition-all duration-300
                  ${isActive
                    ? 'bg-primary-green text-white shadow-sm font-bold'
                    : 'text-dark-text hover:bg-light-beige'
                  }
                `}
              >
                <span>{item.label}</span>
                <FiChevronRight size={12} />
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={handleProfileClick}
            className="w-full font-sans text-xs font-semibold tracking-widest uppercase bg-sunrise-gold text-dark-olive py-3.5 rounded-xl hover:bg-white hover:text-primary-green transition-colors duration-300 shadow-md cursor-pointer"
          >
            {isAuthenticated ? "My Account" : "Sign In / Login"}
          </button>
        </div>
      </div>
    </>
  );
}
