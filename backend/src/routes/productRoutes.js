import express from 'express';
import prisma from '../utils/db.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 1. LIST PRODUCTS (SEARCH, FILTER, SORT, PAGINATE)
router.get('/', async (req, res, next) => {
  const { search, category, sort, page = 1, limit, isFeatured, isTrending, isBestseller, isNewLaunch } = req.query;

  try {
    const skip = limit ? (parseInt(page, 10) - 1) * parseInt(limit, 10) : undefined;
    const take = limit ? parseInt(limit, 10) : undefined;

    // Build filter query object
    const filter = {
      isVisible: true
    };

    if (search) {
      filter.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'All') {
      filter.categories = {
        some: {
          OR: [
            { id: category },
            { slug: category }
          ]
        }
      };
    }

    if (isFeatured === 'true') {
      filter.isFeatured = true;
    }
    if (isTrending === 'true') {
      filter.isTrending = true;
    }
    if (isBestseller === 'true') {
      filter.isBestseller = true;
    }
    if (isNewLaunch === 'true') {
      filter.isNewLaunch = true;
    }

    // Sort mappings
    let orderBy = { createdAt: 'desc' }; // default
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'name-asc') {
      orderBy = { name: 'asc' };
    } else if (sort === 'rating') {
      orderBy = { createdAt: 'desc' };
    }

    // Fetch products
    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where: filter,
        include: {
          images: true,
          variants: true,
          categories: true,
          reviews: {
            where: { status: 'APPROVED' },
            select: { rating: true }
          }
        },
        orderBy,
        skip,
        take,
      }),
      prisma.product.count({ where: filter }),
    ]);

    // Calculate rating averages
    const productsWithRatings = products.map((prod) => {
      const totalReviews = prod.reviews.length;
      const averageRating = totalReviews > 0
        ? parseFloat((prod.reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews).toFixed(1))
        : 0; // default to 0 (no reviews)

      return {
        ...prod,
        averageRating,
        totalReviews,
        galleryImage: prod.hoverImage || null,
        galleryImages: prod.hoverImage ? [prod.hoverImage] : []
      };
    });

    res.status(200).json({
      success: true,
      count: productsWithRatings.length,
      totalCount,
      totalPages: take ? Math.ceil(totalCount / take) : 1,
      currentPage: parseInt(page, 10),
      products: productsWithRatings,
    });
  } catch (error) {
    next(error);
  }
});

// 2. FETCH ALL CATEGORIES
// GET /api/products/categories
// (We map it relative to /api/categories or inside productRoutes. We will mount both).
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        slug: { not: 'uncategorized' }
      },
      include: {
        _count: { select: { products: true } }
      },
      orderBy: { name: 'asc' },
    });
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
});

// FETCH SINGLE CATEGORY DETAILS BY SLUG
// GET /api/products/categories/:slug
router.get('/categories/:slug', async (req, res, next) => {
  const { slug } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { slug }
    });
    if (!category || slug === 'uncategorized') {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
});

// 3. FETCH SINGLE PRODUCT DETAILS BY SLUG
// GET /api/products/:slug
router.get('/:slug', async (req, res, next) => {
  const { slug } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        variants: true,
        categories: true,
        reviews: {
          where: { status: 'APPROVED' },
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Average ratings calculations
    const totalReviews = product.reviews.length;
    const averageRating = totalReviews > 0
      ? parseFloat((product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews).toFixed(1))
      : 0; // default to 0 (no reviews)

    res.status(200).json({
      success: true,
      product: {
        ...product,
        averageRating,
        totalReviews,
        galleryImage: product.hoverImage || null,
        galleryImages: product.hoverImage ? [product.hoverImage] : []
      }
    });
  } catch (error) {
    next(error);
  }
});

// ================= REVIEWS OPERATIONS =================

// 4. SUBMIT PRODUCT REVIEW
// POST /api/products/:productId/reviews
router.post('/:productId/reviews', protect, async (req, res, next) => {
  const { productId } = req.params;
  const { rating, comment, title, reviewTitle, reviewText, reviewImages, customerName } = req.body;

  try {
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5.' });
    }

    const productExists = await prisma.product.findUnique({ where: { id: productId } });
    if (!productExists) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Optional Toggle check: Reviews Require Purchase
    const purchaseSetting = await prisma.websiteSetting.findUnique({
      where: { key: 'reviews_require_purchase' }
    });
    const requirePurchase = purchaseSetting ? purchaseSetting.value === 'true' : false;

    if (requirePurchase) {
      const purchased = await prisma.order.findFirst({
        where: {
          userId: req.user.id,
          status: { not: 'CANCELLED' },
          orderItems: {
            some: {
              productId: productId
            }
          }
        }
      });

      if (!purchased) {
        return res.status(403).json({
          success: false,
          message: 'Only verified buyers can review this product.'
        });
      }
    }

    const finalTitle = reviewTitle || title || '';
    const finalComment = reviewText || comment || '';
    const finalImages = Array.isArray(reviewImages) ? reviewImages : [];
    const finalCustomerName = customerName || req.user.name || 'Anonymous';

    // Check if user already reviewed this product
    const alreadyReviewed = await prisma.review.findFirst({
      where: { productId, userId: req.user.id }
    });

    let review;
    if (alreadyReviewed) {
      // Update review
      review = await prisma.review.update({
        where: { id: alreadyReviewed.id },
        data: {
          rating: parseInt(rating, 10),
          reviewTitle: finalTitle,
          reviewText: finalComment,
          reviewImages: finalImages,
          customerName: finalCustomerName,
          status: 'PENDING' // Edited reviews go back to pending
        },
      });
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          userId: req.user.id,
          productId,
          rating: parseInt(rating, 10),
          reviewTitle: finalTitle,
          reviewText: finalComment,
          reviewImages: finalImages,
          customerName: finalCustomerName,
          status: 'PENDING'
        },
      });
    }

    res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
});

// 5. DELETE REVIEW
// DELETE /api/products/reviews/:reviewId
router.delete('/reviews/:reviewId', protect, async (req, res, next) => {
  const { reviewId } = req.params;

  try {
    const review = await prisma.review.findFirst({
      where: { id: reviewId, userId: req.user.id }
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found or unauthorized.' });
    }

    await prisma.review.delete({ where: { id: reviewId } });

    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
