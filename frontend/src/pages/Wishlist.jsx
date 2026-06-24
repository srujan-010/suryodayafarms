import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { getOptimizedImageUrl, getImageSrcSet } from '../utils/imageOptimizer';

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlistItems, toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [loadedImages, setLoadedImages] = useState({});

  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      useAuthStore.getState().setLoginRequiredModalOpen(true);
      return;
    }
    try {
      // Add the default product to cart (quantity = 1, default variant if present)
      await addToCart(product.id, null, 1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-cream-bg pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Title */}
        <div className="flex flex-col gap-3 mb-10 text-left">
          <span className="font-sans text-[10px] font-bold tracking-[0.3em] uppercase text-sunrise-gold">
            Your Premium Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-dark-olive leading-tight">
            My Favorites
          </h1>
          <div className="w-16 h-[1.5px] bg-sunrise-gold" />
        </div>

        {!isAuthenticated ? (
          /* Authentication prompt empty state */
          <div className="bg-light-beige/20 border border-light-beige rounded-[32px] py-20 px-6 text-center max-w-2xl mx-auto flex flex-col items-center gap-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green">
              <FiHeart className="text-3xl animate-pulse" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-serif text-2xl font-bold text-dark-olive">Authentication Required</h2>
              <p className="font-sans text-xs md:text-sm text-dark-text/70 leading-relaxed font-light max-w-sm">
                Sign in to your Suryodaya Farms account to save and synchronize your favorited crops and organic staples.
              </p>
            </div>
            <button
              onClick={() => {
                useAuthStore.getState().setAuthModalTab('login');
                useAuthStore.getState().setAuthModalOpen(true);
              }}
              className="font-sans text-xs font-semibold tracking-widest uppercase bg-primary-green text-white px-8 py-4 rounded-xl shadow-md hover:bg-dark-olive transition-all duration-300 border-none cursor-pointer"
            >
              Sign In to Account
            </button>
          </div>
        ) : wishlistItems.length === 0 ? (
          /* Empty state */
          <div className="bg-light-beige/20 border border-light-beige rounded-[32px] py-20 px-6 text-center max-w-2xl mx-auto flex flex-col items-center gap-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green">
              <FiHeart className="text-3xl" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-serif text-2xl font-bold text-dark-olive">Your wishlist is empty</h2>
              <p className="font-sans text-xs md:text-sm text-dark-text/70 leading-relaxed font-light max-w-sm">
                Save the organic staples that caught your eye by clicking the heart button on our catalog pages.
              </p>
            </div>
            <Link
              to="/products"
              className="font-sans text-xs font-semibold tracking-widest uppercase bg-primary-green text-white px-8 py-4 rounded-xl shadow-md hover:bg-dark-olive transition-all duration-300"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistItems.map((item) => {
              const product = item.product;
              const productPrice = product.price;
              const productImg = product.images?.length > 0 ? product.images[0].url : product.image;
              
              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden border border-light-beige hover:shadow-lg transition-all duration-300 flex flex-col justify-between group h-full shadow-sm text-left"
                >
                  <div className="relative aspect-square bg-transparent overflow-hidden flex items-center justify-center">
                    {!loadedImages[item.id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-transparent">
                        <div className="w-12 h-12 rounded-full bg-light-beige/30 animate-pulse" />
                      </div>
                    )}
                    <img
                      src={getOptimizedImageUrl(productImg, { width: 800, cropMode: 'limit' })}
                      srcSet={getImageSrcSet(productImg, { widths: [400, 800], cropMode: 'limit' })}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      alt={product.name}
                      onLoad={() => handleImageLoad(item.id)}
                      className={`w-full h-full object-contain p-3.5 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-all duration-500 ${
                        loadedImages[item.id] ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    
                    {/* Delete trigger overlay */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-4 right-4 bg-white/90 text-red-500 border border-light-beige hover:bg-red-50 hover:text-red-600 p-2.5 rounded-full transition-all shadow-md z-20"
                      title="Remove Bookmark"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col gap-4 flex-grow justify-between">
                    <div className="flex flex-col gap-2">
                      <span className="font-sans text-[8px] font-bold text-sunrise-gold uppercase tracking-[0.25em]">
                        Organic Crop
                      </span>
                      <Link 
                        to={`/products/${product.slug}`} 
                        className="font-serif text-lg font-bold text-dark-olive hover:text-primary-green transition-colors leading-tight"
                      >
                        {product.name}
                      </Link>
                      
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-serif text-base font-bold text-primary-green">
                          ₹{productPrice}
                        </span>
                        {product.compareAtPrice && (
                          <span className="font-sans text-xs text-dark-text/40 line-through">
                            ₹{product.compareAtPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full font-sans text-xs font-semibold tracking-widest uppercase bg-primary-green hover:bg-dark-olive text-white py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      <FiShoppingBag size={13} />
                      <span>Add to Cart</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
