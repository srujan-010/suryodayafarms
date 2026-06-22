import express from 'express';
import prisma from '../utils/db.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { mapOrderLogistics } from './orderRoutes.js';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

// Apply auth protection to all administrative endpoints
router.use(protect);
router.use(adminOnly);

// ================= 1. DASHBOARD ANALYTICS =================
// GET /api/admin/analytics
router.get('/analytics', async (req, res, next) => {
  try {
    // Execute multiple aggregates concurrently
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      orders,
      categories,
      contactSubmissionsCount
    ] = await prisma.$transaction([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.order.findMany({
        where: {
          OR: [
            { paymentStatus: 'COMPLETED' },
            { paymentMethod: 'COD' }
          ]
        },
        select: { totalAmount: true }
      }),
      prisma.category.findMany({
        include: {
          _count: { select: { products: true } }
        }
      }),
      prisma.contactMessage.count()
    ]);

    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Fetch recent 5 orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        contactSubmissionsCount,
        recentOrders,
        categoryChart: categories.map(cat => ({
          name: cat.name,
          value: cat._count.products
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// ================= 2. PRODUCTS CRUD =================

// CREATE PRODUCT
// POST /api/admin/products
router.post('/products', async (req, res, next) => {
  const {
    name, categoryId, categoryIds, description, shortDescription, brand, productType,
    price, compareAtPrice, mrp, discountPercent, taxPercent, stockStatus,
    sku, inventory, hoverImage, mobileBanner,
    isFeatured, isTrending, isBestseller, isNewLaunch, isVisible, isComingSoon,
    nutrients, origin, shelfLife, deliveryEta, codAvailable, returnEligible, weight,
    seoTitle, seoDescription, seoKeywords, image, variants
  } = req.body;

  try {
    const idsToConnect = categoryIds || (categoryId ? [categoryId] : []);
    if (!name || idsToConnect.length === 0 || !price || !sku) {
      return res.status(400).json({ success: false, message: 'Name, Category, Price, and SKU are required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categories: {
          connect: idsToConnect.map(id => ({ id }))
        },
        description: description || '',
        shortDescription: shortDescription || '',
        brand: brand || 'Suryodaya Farms',
        productType: productType || '',
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        mrp: mrp ? parseFloat(mrp) : null,
        discountPercent: discountPercent ? parseFloat(discountPercent) : 0,
        taxPercent: taxPercent ? parseFloat(taxPercent) : 0,
        stockStatus: stockStatus || 'IN_STOCK',
        sku,
        inventory: parseInt(inventory, 10) || 0,
        hoverImage: hoverImage || '',
        mobileBanner: mobileBanner || '',
        isFeatured: !!isFeatured,
        isTrending: !!isTrending,
        isBestseller: !!isBestseller,
        isNewLaunch: !!isNewLaunch,
        isVisible: isVisible !== undefined ? !!isVisible : true,
        isComingSoon: !!isComingSoon,
        nutrients: nutrients || '',
        origin: origin || '',
        shelfLife: shelfLife || '',
        deliveryEta: deliveryEta || '2-3 Days',
        codAvailable: codAvailable !== undefined ? !!codAvailable : true,
        returnEligible: !!returnEligible,
        weight: weight || '',
        seoTitle: seoTitle || '',
        seoDescription: seoDescription || '',
        seoKeywords: seoKeywords || '',
        images: {
          create: image ? [{ url: image, isFeatured: true }] : []
        },
        variants: {
          create: (variants && Array.isArray(variants)) ? variants.map(v => ({
            name: v.name,
            price: parseFloat(v.price),
            mrp: v.mrp ? parseFloat(v.mrp) : null,
            sku: v.sku || null,
            inventory: parseInt(v.inventory, 10) || 0
          })) : []
        }
      },
      include: { images: true, variants: true }
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

// UPDATE PRODUCT
// PUT /api/admin/products/:id
router.put('/products/:id', async (req, res, next) => {
  const { id } = req.params;
  const {
    name, categoryId, categoryIds, description, shortDescription, brand, productType,
    price, compareAtPrice, mrp, discountPercent, taxPercent, stockStatus,
    sku, inventory, hoverImage, mobileBanner,
    isFeatured, isTrending, isBestseller, isNewLaunch, isVisible, isComingSoon,
    nutrients, origin, shelfLife, deliveryEta, codAvailable, returnEligible, weight,
    seoTitle, seoDescription, seoKeywords, image, variants
  } = req.body;

  try {
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const updatedData = {
      name,
      description,
      shortDescription,
      brand,
      productType,
      price: price !== undefined ? parseFloat(price) : undefined,
      compareAtPrice: compareAtPrice !== undefined ? (compareAtPrice ? parseFloat(compareAtPrice) : null) : undefined,
      mrp: mrp !== undefined ? (mrp ? parseFloat(mrp) : null) : undefined,
      discountPercent: discountPercent !== undefined ? parseFloat(discountPercent) : undefined,
      taxPercent: taxPercent !== undefined ? parseFloat(taxPercent) : undefined,
      stockStatus,
      sku,
      inventory: inventory !== undefined ? parseInt(inventory, 10) : undefined,
      hoverImage,
      mobileBanner,
      isFeatured: isFeatured !== undefined ? !!isFeatured : undefined,
      isTrending: isTrending !== undefined ? !!isTrending : undefined,
      isBestseller: isBestseller !== undefined ? !!isBestseller : undefined,
      isNewLaunch: isNewLaunch !== undefined ? !!isNewLaunch : undefined,
      isVisible: isVisible !== undefined ? !!isVisible : undefined,
      isComingSoon: isComingSoon !== undefined ? !!isComingSoon : undefined,
      nutrients,
      origin,
      shelfLife,
      deliveryEta,
      codAvailable: codAvailable !== undefined ? !!codAvailable : undefined,
      returnEligible: returnEligible !== undefined ? !!returnEligible : undefined,
      weight,
      seoTitle,
      seoDescription,
      seoKeywords,
    };

    if (categoryIds || categoryId) {
      const idsToConnect = categoryIds || (categoryId ? [categoryId] : []);
      updatedData.categories = {
        set: idsToConnect.map(id => ({ id }))
      };
    }

    if (name) {
      updatedData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const product = await prisma.product.update({
      where: { id },
      data: updatedData,
      include: { images: true, variants: true }
    });

    // If an image URL is sent, overwrite images
    if (image) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.create({
        data: { productId: id, url: image, isFeatured: true }
      });
    }

    // Sync product variants
    if (variants && Array.isArray(variants)) {
      const currentVariants = await prisma.productVariant.findMany({
        where: { productId: id }
      });
      const currentIds = currentVariants.map(v => v.id);

      const incomingIds = variants.filter(v => v.id).map(v => v.id);
      const deletedIds = currentIds.filter(vId => !incomingIds.includes(vId));

      if (deletedIds.length > 0) {
        await prisma.productVariant.deleteMany({
          where: {
            id: { in: deletedIds },
            productId: id
          }
        });
      }

      for (const v of variants) {
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              name: v.name,
              price: parseFloat(v.price),
              mrp: v.mrp ? parseFloat(v.mrp) : null,
              sku: v.sku || null,
              inventory: parseInt(v.inventory, 10) || 0
            }
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: id,
              name: v.name,
              price: parseFloat(v.price),
              mrp: v.mrp ? parseFloat(v.mrp) : null,
              sku: v.sku || null,
              inventory: parseInt(v.inventory, 10) || 0
            }
          });
        }
      }
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

// DELETE PRODUCT
// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await prisma.product.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Product deleted from catalog.' });
  } catch (error) {
    next(error);
  }
});

// ================= 3. CATEGORIES CRUD =================

// FETCH ALL PRODUCTS (FOR ADMIN BINDINGS)
// GET /api/admin/products
router.get('/products', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        categories: true,
        variants: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
});

// CREATE CATEGORY
// POST /api/admin/categories
router.post('/categories', async (req, res, next) => {
  const { name, description, image, seoTitle, seoDescription } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = await prisma.category.create({
      data: { 
        name, 
        slug, 
        description, 
        image,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null
      },
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
});

// UPDATE CATEGORY
// PUT /api/admin/categories/:id
router.put('/categories/:id', async (req, res, next) => {
  const { id } = req.params;
  const { name, description, image, seoTitle, seoDescription } = req.body;

  try {
    const exists = await prisma.category.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const updatedData = {
      name,
      description,
      image,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null
    };

    if (name) {
      updatedData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const category = await prisma.category.update({
      where: { id },
      data: updatedData
    });

    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
});

// GET CATEGORY BY ID (WITH PRODUCTS)
// GET /api/admin/categories/:id
router.get('/categories/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          include: { images: true },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
});

// DELETE CATEGORY (SAFE DELETION REASSIGNING PRODUCTS TO FALLBACK)
// DELETE /api/admin/categories/:id
router.delete('/categories/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (category.slug === 'uncategorized') {
      return res.status(400).json({ success: false, message: 'The fallback Uncategorized category cannot be deleted.' });
    }

    // Upsert the fallback Uncategorized category
    const uncategorizedCategory = await prisma.category.upsert({
      where: { slug: 'uncategorized' },
      update: {},
      create: {
        name: 'Uncategorized',
        slug: 'uncategorized',
        description: 'Default category for items without a specific category assignment.'
      }
    });

    // Reassign linked products for many-to-many
    const linkedProducts = await prisma.product.findMany({
      where: {
        categories: {
          some: { id }
        }
      },
      include: { categories: true }
    });

    for (const prod of linkedProducts) {
      const otherCategories = prod.categories.filter(c => c.id !== id);
      if (otherCategories.length === 0) {
        await prisma.product.update({
          where: { id: prod.id },
          data: {
            categories: {
              set: [{ id: uncategorizedCategory.id }]
            }
          }
        });
      } else {
        await prisma.product.update({
          where: { id: prod.id },
          data: {
            categories: {
              disconnect: { id }
            }
          }
        });
      }
    }

    // Delete category
    await prisma.category.delete({ where: { id } });

    res.status(200).json({ 
      success: true, 
      message: 'Category successfully deleted. Linked products were reassigned to Uncategorized.' 
    });
  } catch (error) {
    next(error);
  }
});

// BULK ASSIGN PRODUCTS TO CATEGORY
// POST /api/admin/categories/:id/assign
router.post('/categories/:id/assign', async (req, res, next) => {
  const { id } = req.params;
  const { productIds } = req.body;

  try {
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ success: false, message: 'productIds must be an array.' });
    }

    const categoryExists = await prisma.category.findUnique({ where: { id } });
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Execute all updates in a transaction
    const updates = productIds.map(prodId =>
      prisma.product.update({
        where: { id: prodId },
        data: {
          categories: {
            connect: { id }
          }
        }
      })
    );

    await prisma.$transaction(updates);
    res.status(200).json({ success: true, message: 'Products successfully assigned.' });
  } catch (error) {
    next(error);
  }
});

// REMOVE PRODUCT FROM CATEGORY (REASSIGN TO UNCATEGORIZED)
// POST /api/admin/categories/:id/remove
router.post('/categories/:id/remove', async (req, res, next) => {
  const { productId } = req.body;

  try {
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required.' });
    }

    // Upsert the fallback Uncategorized category
    const uncategorizedCategory = await prisma.category.upsert({
      where: { slug: 'uncategorized' },
      update: {},
      create: {
        name: 'Uncategorized',
        slug: 'uncategorized',
        description: 'Default category for items without a specific category assignment.'
      }
    });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { categories: true }
    });

    const otherCategories = product.categories.filter(c => c.id !== id);
    let updatedProduct;
    if (otherCategories.length === 0) {
      updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          categories: {
            set: [{ id: uncategorizedCategory.id }]
          }
        }
      });
    } else {
      updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          categories: {
            disconnect: { id }
          }
        }
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Product removed from category and reassigned to Uncategorized.', 
      product: updatedProduct 
    });
  } catch (error) {
    next(error);
  }
});

// ================= 4. ORDERS CRUD =================

// GET ALL ORDERS WITH USER DETAILS
// GET /api/admin/orders
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        orderItems: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: orders.length, orders: orders.map(mapOrderLogistics) });
  } catch (error) {
    next(error);
  }
});

// UPDATE ORDER STATUS (PENDING -> SHIPPED -> DELIVERED)
// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', async (req, res, next) => {
  const { id } = req.params;
  const { status, paymentStatus, estimatedDelivery } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order records not found.' });
    }

    const currentLogistics = order.logistics || {};
    const updatedLogistics = {
      status: status,
      courierName: currentLogistics.courierName || '',
      trackingNumber: currentLogistics.trackingNumber || '',
      trackingUrl: currentLogistics.trackingUrl || '',
      dispatchDate: currentLogistics.dispatchDate || '',
      estimatedDeliveryDate: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : (currentLogistics.estimatedDeliveryDate || '')
    };

    const updatedData = {
      status,
      paymentStatus,
      logistics: updatedLogistics
    };

    if (estimatedDelivery !== undefined) {
      updatedData.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : null;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updatedData
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: `Order Updated: ${status}`,
        message: `Your order ${order.orderNumber} status label was updated to ${status}.`,
      }
    });

    res.status(200).json({ success: true, order: mapOrderLogistics(updated) });
  } catch (error) {
    next(error);
  }
});

// UPDATE SHIPMENT DETAILS
// PUT /api/admin/orders/:id/shipment
router.put('/orders/:id/shipment', async (req, res, next) => {
  const { id } = req.params;
  const { courierName, trackingNumber, trackingUrl, dispatchDate, estimatedDelivery, shipmentStatus } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order records not found.' });
    }

    // Validation: Tracking URL must be a valid URL
    if (trackingUrl) {
      try {
        new URL(trackingUrl);
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Tracking URL must be a valid URL (including http:// or https://).' });
      }
    }

    // Validation: Dispatch date cannot be future
    let dDate = null;
    if (dispatchDate) {
      dDate = new Date(dispatchDate);
      if (isNaN(dDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Dispatch date format is invalid.' });
      }
      if (dDate > new Date()) {
        return res.status(400).json({ success: false, message: 'Dispatch date cannot be in the future.' });
      }
    }

    // Validation: Estimated delivery date must be after dispatch date
    let eDate = null;
    if (estimatedDelivery) {
      eDate = new Date(estimatedDelivery);
      if (isNaN(eDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Estimated delivery date format is invalid.' });
      }
      if (dDate && eDate < dDate) {
        return res.status(400).json({ success: false, message: 'Estimated delivery date must be after the dispatch date.' });
      }
    }

    const finalStatus = shipmentStatus || order.status || 'PENDING';

    const updatedData = {
      status: finalStatus,
      estimatedDelivery: eDate,
      logistics: {
        status: finalStatus,
        courierName: courierName || '',
        trackingNumber: trackingNumber || '',
        trackingUrl: trackingUrl || '',
        dispatchDate: dDate ? dDate.toISOString() : '',
        estimatedDeliveryDate: eDate ? eDate.toISOString() : ''
      }
    };

    const updated = await prisma.order.update({
      where: { id },
      data: updatedData,
      include: {
        user: { select: { name: true, email: true } },
        orderItems: { include: { product: true } }
      }
    });

    res.status(200).json({ success: true, order: mapOrderLogistics(updated) });
  } catch (error) {
    next(error);
  }
});


// ================= 5. COUPONS CRUD =================

// LIST ALL PROMOTIONS
// GET /api/admin/coupons
router.get('/coupons', async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      include: {
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
});

// CREATE PROMOTION
// POST /api/admin/coupons
router.post('/coupons', async (req, res, next) => {
  const { code, discountType, discountValue, minOrderValue, expiryDate, usageLimit, isActive } = req.body;

  try {
    if (!code || !discountValue || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Code, value, and expiry parameters are required.' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue) || 0,
        expiryDate: new Date(expiryDate),
        usageLimit: usageLimit !== undefined && usageLimit !== null ? parseInt(usageLimit, 10) : -1,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      }
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
});

// UPDATE PROMOTION
// PUT /api/admin/coupons/:id
router.put('/coupons/:id', async (req, res, next) => {
  const { id } = req.params;
  const { code, discountType, discountValue, minOrderValue, expiryDate, usageLimit, isActive } = req.body;

  try {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    const updateData = {};
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = parseFloat(discountValue);
    if (minOrderValue !== undefined) updateData.minOrderValue = parseFloat(minOrderValue);
    if (expiryDate !== undefined) updateData.expiryDate = new Date(expiryDate);
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit !== null ? parseInt(usageLimit, 10) : -1;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
});

// DELETE PROMOTION
// DELETE /api/admin/coupons/:id
router.delete('/coupons/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    await prisma.coupon.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// ================= 6. JOURNAL (BLOG) CRUD =================

// CREATE BLOG ARTICLE
// POST /api/admin/blogs
router.post('/blogs', async (req, res, next) => {
  const { title, content, summary, image, category, author, readTime } = req.body;

  try {
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        summary: summary || '',
        image: image || 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=800',
        category: category || 'Sustainable Agriculture',
        author: author || 'Suryodaya Agronomy Team',
        readTime: readTime || '4 min read',
      }
    });

    res.status(201).json({ success: true, blog });
  } catch (error) {
    next(error);
  }
});

// DELETE BLOG ARTICLE
// DELETE /api/admin/blogs/:id
router.delete('/blogs/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    await prisma.blog.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Article deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// ================= 7. CUSTOMERS LIST =================
// GET /api/admin/customers
router.get('/customers', async (req, res, next) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: customers.length, customers });
  } catch (error) {
    next(error);
  }
});

// ================= 8. HOMEPAGE & CAMPAIGN MANAGEMENT CMS =================

// 8.1 COLLECTIONS CRUD
// GET /api/admin/homepage/collections
router.get('/homepage/collections', async (req, res, next) => {
  try {
    const collections = await prisma.homepageCollection.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.status(200).json({ success: true, collections });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/homepage/collections
router.post('/homepage/collections', async (req, res, next) => {
  const {
    title, badge, description, image, ctaText, categorySlug, sortOrder, isActive
  } = req.body;

  try {
    if (!title || !image) {
      return res.status(400).json({ success: false, message: 'Title and Image are required.' });
    }

    const collection = await prisma.homepageCollection.create({
      data: {
        title,
        badge: badge || null,
        description: description || '',
        image,
        ctaText: ctaText || 'Browse Collection',
        categorySlug: categorySlug || 'all',
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) || 0 : 0,
        isActive: isActive !== undefined ? !!isActive : true
      }
    });

    res.status(201).json({ success: true, collection });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/homepage/collections/reorder
router.put('/homepage/collections/reorder', async (req, res, next) => {
  const { order } = req.body;

  try {
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: 'Invalid order structure.' });
    }

    const updates = order.map(item =>
      prisma.homepageCollection.update({
        where: { id: item.id },
        data: { sortOrder: parseInt(item.sortOrder, 10) }
      })
    );

    await prisma.$transaction(updates);
    res.status(200).json({ success: true, message: 'Collection order updated successfully.' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/homepage/collections/:id
router.put('/homepage/collections/:id', async (req, res, next) => {
  const { id } = req.params;
  const {
    title, badge, description, image, ctaText, categorySlug, sortOrder, isActive
  } = req.body;

  try {
    const exists = await prisma.homepageCollection.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    const collection = await prisma.homepageCollection.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        badge: badge !== undefined ? badge : undefined,
        description: description !== undefined ? description : undefined,
        image: image !== undefined ? image : undefined,
        ctaText: ctaText !== undefined ? ctaText : undefined,
        categorySlug: categorySlug !== undefined ? categorySlug : undefined,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : undefined,
        isActive: isActive !== undefined ? !!isActive : undefined
      }
    });

    res.status(200).json({ success: true, collection });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/homepage/collections/:id
router.delete('/homepage/collections/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const exists = await prisma.homepageCollection.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    await prisma.homepageCollection.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Collection deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/homepage/collections/:id/toggle-active
router.put('/homepage/collections/:id/toggle-active', async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const exists = await prisma.homepageCollection.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    const collection = await prisma.homepageCollection.update({
      where: { id },
      data: { isActive: !!isActive }
    });

    res.status(200).json({ success: true, collection });
  } catch (error) {
    next(error);
  }
});

// 8.2 HOMEPAGE CATEGORIES
// GET /api/admin/homepage/categories
router.get('/homepage/categories', async (req, res, next) => {
  try {
    const homepageCategories = await prisma.category.findMany({
      where: { promoVisible: true },
      orderBy: { position: 'asc' }
    });
    res.status(200).json({ success: true, categories: homepageCategories });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/homepage/categories
router.post('/homepage/categories', async (req, res, next) => {
  const { categoryId, id, position, isVisible } = req.body;
  const targetId = categoryId || id;

  try {
    if (!targetId) {
      return res.status(400).json({ success: false, message: 'Category ID is required.' });
    }

    const category = await prisma.category.update({
      where: { id: targetId },
      data: {
        promoVisible: true,
        homepageVisible: true,
        position: position ? parseInt(position, 10) : 0,
        isVisible: isVisible !== undefined ? !!isVisible : true
      }
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/homepage/categories/:id
router.put('/homepage/categories/:id', async (req, res, next) => {
  const { id } = req.params;
  const { position, isVisible, homepageVisible, promoVisible } = req.body;

  try {
    const exists = await prisma.category.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        position: position !== undefined ? parseInt(position, 10) : undefined,
        isVisible: isVisible !== undefined ? !!isVisible : undefined,
        homepageVisible: homepageVisible !== undefined ? !!homepageVisible : undefined,
        promoVisible: promoVisible !== undefined ? !!promoVisible : undefined
      }
    });

    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/homepage/categories/:id
router.delete('/homepage/categories/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const exists = await prisma.category.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { promoVisible: false, homepageVisible: false }
    });

    res.status(200).json({ success: true, message: 'Homepage Category visibility disabled successfully.', category });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/homepage/categories/reorder
router.put('/homepage/categories/reorder', async (req, res, next) => {
  const { order } = req.body; // Array of { id, position }

  try {
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: 'Invalid order structure.' });
    }

    // Execute bulk updates in transaction
    const updates = order.map(item => 
      prisma.category.update({
        where: { id: item.id },
        data: { position: item.position }
      })
    );

    await prisma.$transaction(updates);
    res.status(200).json({ success: true, message: 'Category order updated successfully.' });
  } catch (error) {
    next(error);
  }
});

// 8.3 SECTION ORDERING
// GET /api/admin/homepage/sections
router.get('/homepage/sections', async (req, res, next) => {
  try {
    const setting = await prisma.websiteSetting.findUnique({
      where: { key: 'homepage_section_order' }
    });

    const defaultOrder = 'categories,hero,best-sellers,trust,collections,benefits,reviews,footer-banner';
    res.status(200).json({
      success: true,
      order: setting ? setting.value : defaultOrder
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/homepage/sections
router.put('/homepage/sections', async (req, res, next) => {
  const { order } = req.body; // e.g. "categories,hero,best-sellers..."

  try {
    if (!order) {
      return res.status(400).json({ success: false, message: 'Order is required.' });
    }

    const setting = await prisma.websiteSetting.upsert({
      where: { key: 'homepage_section_order' },
      update: { value: order },
      create: { key: 'homepage_section_order', value: order }
    });

    res.status(200).json({ success: true, order: setting.value });
  } catch (error) {
    next(error);
  }
});

// ================= 8.4 HOMEPAGE HERO CMS =================
// GET /api/admin/homepage/hero
router.get('/homepage/hero', async (req, res, next) => {
  try {
    const heroes = await prisma.homepageHero.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    res.status(200).json({ success: true, heroes });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/homepage/upload-cloudinary
router.post('/homepage/upload-cloudinary', async (req, res, next) => {
  const { image } = req.body;
  try {
    if (!image) {
      return res.status(400).json({ success: false, message: 'Image data is required.' });
    }
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'homepage_hero',
      resource_type: 'auto'
    });
    res.status(200).json({
      success: true,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      width: uploadResponse.width,
      height: uploadResponse.height
    });
  } catch (error) {
    console.error('[Cloudinary Upload Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to upload image to Cloudinary.' });
  }
});

// POST /api/admin/homepage/hero
router.post('/homepage/hero', async (req, res, next) => {
  const {
    trustBadgeText, headingLine1, headingHighlight, headingLine2,
    description, bulletOne, bulletTwo, bulletThree, bulletFour,
    primaryButtonText, primaryButtonLink, secondaryButtonText, secondaryButtonLink,
    promoText, heroImage, featuredProductId, offerBadgeText,
    floatingBadgeTitle, floatingBadgeSubtitle, isActive,
    slideOrder, isFeatured,
    cropX, cropY, cropWidth, cropHeight, zoom, aspectRatio
  } = req.body;

  try {
    const hero = await prisma.homepageHero.create({
      data: {
        trustBadgeText: trustBadgeText || '',
        headingLine1: headingLine1 || '',
        headingHighlight: headingHighlight || '',
        headingLine2: headingLine2 || '',
        description: description || '',
        bulletOne: bulletOne || '',
        bulletTwo: bulletTwo || '',
        bulletThree: bulletThree || '',
        bulletFour: bulletFour || '',
        primaryButtonText: primaryButtonText || '',
        primaryButtonLink: primaryButtonLink || '',
        secondaryButtonText: secondaryButtonText || '',
        secondaryButtonLink: secondaryButtonLink || '',
        promoText: promoText || '',
        heroImage: heroImage || '',
        featuredProductId: featuredProductId || null,
        offerBadgeText: offerBadgeText || '',
        floatingBadgeTitle: floatingBadgeTitle || '',
        floatingBadgeSubtitle: floatingBadgeSubtitle || '',
        slideOrder: slideOrder !== undefined ? parseInt(slideOrder, 10) || 0 : 0,
        isFeatured: !!isFeatured,
        isActive: !!isActive,
        cropX: cropX !== undefined && cropX !== null ? parseFloat(cropX) : null,
        cropY: cropY !== undefined && cropY !== null ? parseFloat(cropY) : null,
        cropWidth: cropWidth !== undefined && cropWidth !== null ? parseFloat(cropWidth) : null,
        cropHeight: cropHeight !== undefined && cropHeight !== null ? parseFloat(cropHeight) : null,
        zoom: zoom !== undefined && zoom !== null ? parseFloat(zoom) : null,
        aspectRatio: aspectRatio || null
      }
    });

    res.status(201).json({ success: true, hero });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/homepage/hero/:id
router.put('/homepage/hero/:id', async (req, res, next) => {
  const { id } = req.params;
  const {
    trustBadgeText, headingLine1, headingHighlight, headingLine2,
    description, bulletOne, bulletTwo, bulletThree, bulletFour,
    primaryButtonText, primaryButtonLink, secondaryButtonText, secondaryButtonLink,
    promoText, heroImage, featuredProductId, offerBadgeText,
    floatingBadgeTitle, floatingBadgeSubtitle, isActive,
    slideOrder, isFeatured,
    cropX, cropY, cropWidth, cropHeight, zoom, aspectRatio
  } = req.body;

  try {
    const exists = await prisma.homepageHero.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Hero configuration not found.' });
    }

    const hero = await prisma.homepageHero.update({
      where: { id },
      data: {
        trustBadgeText,
        headingLine1,
        headingHighlight,
        headingLine2,
        description,
        bulletOne,
        bulletTwo,
        bulletThree,
        bulletFour,
        primaryButtonText,
        primaryButtonLink,
        secondaryButtonText,
        secondaryButtonLink,
        promoText,
        heroImage,
        featuredProductId: featuredProductId || null,
        offerBadgeText,
        floatingBadgeTitle,
        floatingBadgeSubtitle,
        slideOrder: slideOrder !== undefined ? parseInt(slideOrder, 10) : undefined,
        isFeatured: isFeatured !== undefined ? !!isFeatured : undefined,
        isActive: isActive !== undefined ? !!isActive : undefined,
        cropX: cropX !== undefined && cropX !== null ? parseFloat(cropX) : null,
        cropY: cropY !== undefined && cropY !== null ? parseFloat(cropY) : null,
        cropWidth: cropWidth !== undefined && cropWidth !== null ? parseFloat(cropWidth) : null,
        cropHeight: cropHeight !== undefined && cropHeight !== null ? parseFloat(cropHeight) : null,
        zoom: zoom !== undefined && zoom !== null ? parseFloat(zoom) : null,
        aspectRatio: aspectRatio || null
      }
    });

    res.status(200).json({ success: true, hero });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/homepage/hero/:id
router.delete('/homepage/hero/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const exists = await prisma.homepageHero.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Hero configuration not found.' });
    }

    await prisma.homepageHero.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Hero configuration deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/homepage/hero/:id/toggle-active
router.put('/homepage/hero/:id/toggle-active', async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const exists = await prisma.homepageHero.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Hero configuration not found.' });
    }

    const hero = await prisma.homepageHero.update({
      where: { id },
      data: { isActive: !!isActive }
    });

    res.status(200).json({ success: true, hero });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/settings
router.get('/settings', async (req, res, next) => {
  try {
    const settings = await prisma.websiteSetting.findMany();
    const settingsObj = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    const fallbacks = {
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
    };

    res.status(200).json({
      success: true,
      settings: { ...fallbacks, ...settingsObj }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/settings
router.put('/settings', async (req, res, next) => {
  const newSettings = req.body;
  try {
    const promises = Object.entries(newSettings).map(([key, value]) => {
      return prisma.websiteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    });
    await Promise.all(promises);
    res.status(200).json({ success: true, message: 'Settings updated successfully.' });
  } catch (error) {
    next(error);
  }
});

// ================= REVIEWS MODERATION =================

// GET /api/admin/reviews/products-summary
router.get('/reviews/products-summary', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        categories: true,
        reviews: true
      }
    });

    const summary = products.map(prod => {
      const allReviews = prod.reviews;
      const approvedReviews = allReviews.filter(r => r.status === 'APPROVED');
      const pendingReviews = allReviews.filter(r => r.status === 'PENDING');
      const totalReviews = allReviews.length;
      
      const averageRating = approvedReviews.length > 0
        ? parseFloat((approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1))
        : 0;

      return {
        id: prod.id,
        name: prod.name,
        image: prod.images?.[0]?.url || '',
        category: prod.categories?.[0]?.name || 'Staples',
        averageRating,
        totalReviews,
        pendingReviews: pendingReviews.length,
        approvedReviews: approvedReviews.length
      };
    });

    res.status(200).json({ success: true, products: summary });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/reviews/product/:productId
router.get('/reviews/product/:productId', async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        categories: true,
        reviews: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const allReviews = product.reviews;
    const approvedReviews = allReviews.filter(r => r.status === 'APPROVED');
    const pendingReviews = allReviews.filter(r => r.status === 'PENDING');
    const rejectedReviews = allReviews.filter(r => r.status === 'REJECTED');
    const totalReviews = allReviews.length;

    const averageRating = approvedReviews.length > 0
      ? parseFloat((approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1))
      : 0;

    res.status(200).json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        image: product.images?.[0]?.url || '',
        category: product.categories?.[0]?.name || 'Staples',
        averageRating,
        totalReviews,
        approvedReviews: approvedReviews.length,
        pendingReviews: pendingReviews.length,
        rejectedReviews: rejectedReviews.length
      },
      reviews: allReviews
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/reviews
router.get('/reviews', async (req, res, next) => {
  const { status, search, productId } = req.query;
  try {
    const filter = {};
    if (status && status !== 'ALL' && status !== 'All') {
      filter.status = status.toUpperCase();
    }
    if (productId) {
      filter.productId = productId;
    }
    if (search) {
      filter.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    const reviews = await prisma.review.findMany({
      where: filter,
      include: {
        product: {
          select: { name: true, image: true, images: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/reviews/:id
router.put('/reviews/:id', async (req, res, next) => {
  const { id } = req.params;
  const { status, rating, reviewTitle, reviewText, customerName } = req.body;
  try {
    const exists = await prisma.review.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    const data = {};
    if (status) data.status = status.toUpperCase();
    if (rating !== undefined) data.rating = parseInt(rating, 10);
    if (reviewTitle !== undefined) data.reviewTitle = reviewTitle;
    if (reviewText !== undefined) data.reviewText = reviewText;
    if (customerName !== undefined) data.customerName = customerName;

    const review = await prisma.review.update({
      where: { id },
      data,
      include: { product: { select: { name: true } } }
    });
    res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const exists = await prisma.review.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    await prisma.review.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/reviews/:id/promote
router.post('/reviews/:id/promote', async (req, res, next) => {
  const { id } = req.params;
  const { location } = req.body;
  try {
    const review = await prisma.review.findUnique({
      where: { id },
      include: { product: true }
    });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    if (review.status !== 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Only approved reviews can be promoted.' });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        customerName: review.customerName || 'Anonymous',
        location: location || 'Verified Family Member',
        testimonialText: review.reviewText || '',
        rating: review.rating,
        customerPhoto: review.reviewImages?.[0] || 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=200',
        productPurchased: review.product?.name || 'Organic Staples',
        featuredToggle: true,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Promoted to Testimonial successfully.',
      testimonial
    });
  } catch (error) {
    next(error);
  }
});

// ================= TESTIMONIALS CRUD =================

// GET /api/admin/testimonials
router.get('/testimonials', async (req, res, next) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, count: testimonials.length, testimonials });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/testimonials
router.post('/testimonials', async (req, res, next) => {
  const { customerName, location, testimonialText, rating, customerPhoto, productPurchased, featuredToggle, isActive } = req.body;
  try {
    if (!customerName || !testimonialText) {
      return res.status(400).json({ success: false, message: 'Customer Name and Testimonial Text are required.' });
    }
    const testimonial = await prisma.testimonial.create({
      data: {
        customerName,
        location: location || '',
        testimonialText,
        rating: rating !== undefined ? parseInt(rating, 10) : 5,
        customerPhoto: customerPhoto || '',
        productPurchased: productPurchased || '',
        featuredToggle: featuredToggle !== undefined ? !!featuredToggle : false,
        isActive: isActive !== undefined ? !!isActive : true
      }
    });
    res.status(201).json({ success: true, testimonial });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/testimonials/:id
router.put('/testimonials/:id', async (req, res, next) => {
  const { id } = req.params;
  const { customerName, location, testimonialText, rating, customerPhoto, productPurchased, featuredToggle, isActive } = req.body;
  try {
    const exists = await prisma.testimonial.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        customerName: customerName !== undefined ? customerName : undefined,
        location: location !== undefined ? location : undefined,
        testimonialText: testimonialText !== undefined ? testimonialText : undefined,
        rating: rating !== undefined ? parseInt(rating, 10) : undefined,
        customerPhoto: customerPhoto !== undefined ? customerPhoto : undefined,
        productPurchased: productPurchased !== undefined ? productPurchased : undefined,
        featuredToggle: featuredToggle !== undefined ? !!featuredToggle : undefined,
        isActive: isActive !== undefined ? !!isActive : undefined
      }
    });
    res.status(200).json({ success: true, testimonial });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/testimonials/:id
router.delete('/testimonials/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const exists = await prisma.testimonial.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }
    await prisma.testimonial.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Testimonial deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
