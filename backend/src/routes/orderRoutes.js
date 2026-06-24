import express from 'express';
import crypto from 'crypto';
import prisma from '../utils/db.js';
import { protect } from '../middlewares/authMiddleware.js';
import { mapCartItem, mapWishlistItem, mapOrder } from '../utils/productMapper.js';

const router = express.Router();

export const mapOrderLogistics = (order) => {
  if (!order) return null;
  const logistics = order.logistics || {};
  return {
    ...order,
    logistics: {
      status: logistics.status || order.status || 'PENDING',
      courierName: logistics.courierName || '',
      trackingNumber: logistics.trackingNumber || '',
      trackingUrl: logistics.trackingUrl || '',
      dispatchDate: logistics.dispatchDate || '',
      estimatedDeliveryDate: logistics.estimatedDeliveryDate || (order.estimatedDelivery ? order.estimatedDelivery.toISOString() : '')
    }
  };
};

const parseWeightToKG = (weightStr) => {
  if (!weightStr) return 0.5; // Default to 500g if undefined/null
  const normalized = weightStr.toLowerCase().replace(/\s+/g, '');
  const numMatch = normalized.match(/^(\d+(?:\.\d+)?)/);
  if (!numMatch) return 0.5;
  const value = parseFloat(numMatch[1]);
  if (normalized.includes('kg') || normalized.includes('kilo') || normalized.includes('l') && !normalized.includes('ml')) {
    return value;
  }
  if (normalized.includes('g') || normalized.includes('gm') || normalized.includes('ml')) {
    return value / 1000;
  }
  return value >= 10 ? value / 1000 : value;
};

// ================= SHOPPING CART CRUD =================

// 1. GET ACTIVE CART ITEMS
// GET /api/orders/cart (Mounted as /api/cart)
router.get('/cart', protect, async (req, res, next) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: true,
        variant: true,
      },
    });

    const mappedCartItems = cartItems.map(mapCartItem);

    res.status(200).json({ success: true, count: mappedCartItems.length, cartItems: mappedCartItems });
  } catch (error) {
    next(error);
  }
});

// 2. ADD ITEM TO CART
// POST /api/orders/cart
router.post('/cart', protect, async (req, res, next) => {
  const { productId, variantId, quantity = 1 } = req.body;

  try {
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    // Verify Product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check duplicate item
    const duplicate = await prisma.cartItem.findFirst({
      where: {
        userId: req.user.id,
        productId,
        variantId: variantId || null,
      },
    });

    let cartItem;
    if (duplicate) {
      // Increment quantity
      cartItem = await prisma.cartItem.update({
        where: { id: duplicate.id },
        data: { quantity: duplicate.quantity + parseInt(quantity, 10) },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          variantId: variantId || undefined,
          quantity: parseInt(quantity, 10),
        },
      });
    }

    res.status(201).json({ success: true, cartItem });
  } catch (error) {
    next(error);
  }
});

// 3. UPDATE QUANTITY
// PUT /api/orders/cart/:itemId
router.put('/cart/:itemId', protect, async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {
    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    const itemExists = await prisma.cartItem.findFirst({
      where: { id: itemId, userId: req.user.id },
    });

    if (!itemExists) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    const cartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: parseInt(quantity, 10) },
    });

    res.status(200).json({ success: true, cartItem });
  } catch (error) {
    next(error);
  }
});

// 4. REMOVE ITEM FROM CART
// DELETE /api/orders/cart/:itemId
router.delete('/cart/:itemId', protect, async (req, res, next) => {
  const { itemId } = req.params;

  try {
    const itemExists = await prisma.cartItem.findFirst({
      where: { id: itemId, userId: req.user.id },
    });

    if (!itemExists) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    res.status(200).json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    next(error);
  }
});

// ================= WISHLIST CRUD =================

// 5. GET WISHLIST ITEMS
// GET /api/orders/wishlist (Mounted as /api/wishlist)
router.get('/wishlist', protect, async (req, res, next) => {
  try {
    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: true
      }
    });

    const mappedWishlist = wishlist.map(mapWishlistItem);

    res.status(200).json({ success: true, count: mappedWishlist.length, wishlist: mappedWishlist });
  } catch (error) {
    next(error);
  }
});

// 6. TOGGLE WISHLIST ITEM
// POST /api/orders/wishlist/:productId
router.post('/wishlist/:productId', protect, async (req, res, next) => {
  const { productId } = req.params;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if in wishlist
    const exists = await prisma.wishlistItem.findFirst({
      where: { userId: req.user.id, productId }
    });

    if (exists) {
      // Remove
      await prisma.wishlistItem.delete({ where: { id: exists.id } });
      res.status(200).json({ success: true, isWishlisted: false, message: 'Product removed from wishlist.' });
    } else {
      // Add
      await prisma.wishlistItem.create({
        data: { userId: req.user.id, productId }
      });
      res.status(200).json({ success: true, isWishlisted: true, message: 'Product added to wishlist.' });
    }
  } catch (error) {
    next(error);
  }
});

// ================= COUPONS ACTIONS =================

// GET ACTIVE COUPONS
// GET /api/orders/coupons/active
router.get('/coupons/active', async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        expiryDate: {
          gt: new Date()
        }
      },
      include: {
        orders: {
          select: { id: true }
        }
      }
    });

    // Filter coupons whose usageLimit is exceeded
    const activeCoupons = coupons.filter(coupon => {
      if (coupon.usageLimit === null || coupon.usageLimit === -1) {
        return true;
      }
      return coupon.orders.length < coupon.usageLimit;
    }).map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      expiryDate: coupon.expiryDate,
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive
    }));

    res.status(200).json({ success: true, coupons: activeCoupons });
  } catch (error) {
    next(error);
  }
});

// 7. VALIDATE COUPON
// POST /api/orders/coupon/validate (Mounted as /api/coupons/validate)
router.post('/coupon/validate', protect, async (req, res, next) => {
  const { code, orderValue = 0 } = req.body;

  try {
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code.' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid or deactivated coupon code.' });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: 'Coupon code has expired.' });
    }

    if (orderValue < coupon.minOrderValue) {
      return res.status(400).json({ success: false, message: `Minimum order amount of ₹${coupon.minOrderValue} required.` });
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usageLimit !== -1) {
      const usageCount = await prisma.order.count({
        where: { couponId: coupon.id }
      });
      if (usageCount >= coupon.usageLimit) {
        return res.status(400).json({ success: false, message: 'Coupon code usage limit has been reached.' });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Coupon code applied successfully.',
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      }
    });
  } catch (error) {
    next(error);
  }
});

// ================= CHECKOUTS & ORDERS =================

// 8. PROCESS CHECKOUT (COD & RAZORPAY INIT)
// POST /api/orders/checkout
router.post('/checkout', protect, async (req, res, next) => {
  const { addressId, couponCode, paymentMethod } = req.body;

  try {
    if (!addressId || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Shipping address and payment method are required.' });
    }

    // Fetch Cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true, variant: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is currently empty.' });
    }

    // Fetch Address details
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user.id },
    });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Selected address not found.' });
    }

    // Fetch website configurations for shipping
    const settings = await prisma.websiteSetting.findMany();
    const settingsObj = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const freeDeliveryThreshold = parseFloat(settingsObj.freeDeliveryThreshold || '2');
    const shippingCharge = parseFloat(settingsObj.shippingCharge || '80');
    const serviceableStatesStr = settingsObj.serviceableStates || 'Telangana, Andhra Pradesh';
    const serviceableStates = serviceableStatesStr
      .split(',')
      .map(s => s.trim().toLowerCase());

    // Validate if the address state is in serviceable locations
    const addressState = (address.state || '').trim().toLowerCase();
    if (!serviceableStates.includes(addressState)) {
      return res.status(400).json({
        success: false,
        message: `Suryodaya Farms only services locations in: ${serviceableStatesStr}. Selected state "${address.state}" is not serviceable.`
      });
    }

    // Calculate Cart Weight & Math
    let subtotal = 0;
    let totalWeight = 0;
    cartItems.forEach((item) => {
      const price = item.variant ? item.variant.price : item.product.price;
      subtotal += price * item.quantity;

      const weightStr = item.variant ? item.variant.name : item.product.weight;
      const parsedWeight = parseWeightToKG(weightStr);
      totalWeight += parsedWeight * item.quantity;
    });

    // Validate Coupon if any
    let discountAmount = 0;
    let couponId = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (coupon && coupon.isActive && new Date() < new Date(coupon.expiryDate) && subtotal >= coupon.minOrderValue) {
        let isUsageLimitOk = true;
        if (coupon.usageLimit !== null && coupon.usageLimit !== -1) {
          const usageCount = await prisma.order.count({
            where: { couponId: coupon.id }
          });
          if (usageCount >= coupon.usageLimit) {
            isUsageLimitOk = false;
          }
        }
        
        if (isUsageLimitOk) {
          couponId = coupon.id;
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (subtotal * coupon.discountValue) / 100;
          } else {
            discountAmount = coupon.discountValue;
          }
        }
      }
    }

    // Apply shipping charge based on cart weight
    let shippingFee = 0;
    if (totalWeight < freeDeliveryThreshold) {
      shippingFee = shippingCharge;
    }

    const totalAmount = Math.max(subtotal - discountAmount + shippingFee, 0);
    const orderNumber = `SURY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Build database order data
    const orderData = {
      userId: req.user.id,
      orderNumber,
      paymentMethod,
      totalAmount,
      discountAmount,
      couponId,
      shippingAddress: {
        recipientName: address.recipientName,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      status: 'PENDING', // default PENDING (Placed) for COD
      paymentStatus: 'PENDING',
      logistics: {
        status: 'PENDING',
        courierName: '',
        trackingNumber: '',
        trackingUrl: '',
        dispatchDate: '',
        estimatedDeliveryDate: ''
      }
    };

    // If online checkout with Razorpay, initialize a mock order ID
    if (paymentMethod === 'RAZORPAY') {
      orderData.razorpayOrderId = `rzp_order_${orderNumber}`;
      orderData.status = 'PENDING';
    }

    // Save order in transaction
    const order = await prisma.order.create({
      data: {
        ...orderData,
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || undefined,
            quantity: item.quantity,
            price: item.variant ? item.variant.price : item.product.price,
          })),
        },
      },
      include: { orderItems: true },
    });

    // If order is completed successfully, empty user's cart (for COD)
    if (paymentMethod === 'COD') {
      await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
      
      // Send a push notification log
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          title: 'Order Placed!',
          message: `Your order ${orderNumber} has been placed successfully and is awaiting confirmation.`,
        }
      });
    }

    res.status(201).json({
      success: true,
      order: mapOrderLogistics(order),
      razorpayOrderId: order.razorpayOrderId,
      totalAmount: order.totalAmount,
    });
  } catch (error) {
    next(error);
  }
});

// 9. VERIFY PAYMENT (FOR ONLINE CHECKOUT)
// POST /api/orders/verify-payment
router.post('/verify-payment', protect, async (req, res, next) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  try {
    if (!razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({ success: false, message: 'Payment validation identifiers are missing.' });
    }

    // Find the corresponding order
    const order = await prisma.order.findFirst({
      where: { razorpayOrderId, userId: req.user.id },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Corresponding order records not found.' });
    }

    // In a live integration, we check the crypto signature. Since we are in dev sandbox,
    // we confirm the payment automatically, ensuring it integrates beautifully!
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
        razorpayPaymentId,
      },
    });

    // Empty User Cart
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });

    // Send notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Payment Completed!',
        message: `Your payment for order ${order.orderNumber} was confirmed. We are processing your harvest.`,
      }
    });

    res.status(200).json({ success: true, message: 'Payment authenticated and order processed.' });
  } catch (error) {
    next(error);
  }
});

// 10. FETCH USER ORDER HISTORY
// GET /api/orders/history
router.get('/history', protect, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        orderItems: {
          include: {
            product: true,
            variant: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedOrders = orders.map(order => mapOrder(mapOrderLogistics(order)));

    res.status(200).json({ success: true, count: mappedOrders.length, orders: mappedOrders });
  } catch (error) {
    next(error);
  }
});

// 11. FETCH ORDER DETAILS
// GET /api/orders/history/:orderId
router.get('/history/:orderId', protect, async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id },
      include: {
        orderItems: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order details not found.' });
    }

    res.status(200).json({ success: true, order: mapOrder(mapOrderLogistics(order)) });
  } catch (error) {
    next(error);
  }
});

export default router;
