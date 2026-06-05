import express from 'express';
import prisma from '../utils/db.js';

const router = express.Router();

// 1. FETCH ALL BLOG ARTICLES
// GET /api/public/blogs
router.get('/blogs', async (req, res, next) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, count: blogs.length, blogs });
  } catch (error) {
    next(error);
  }
});

// 2. FETCH SINGLE BLOG ARTICLE BY SLUG
// GET /api/public/blogs/:slug
router.get('/blogs/:slug', async (req, res, next) => {
  const { slug } = req.params;

  try {
    const blog = await prisma.blog.findUnique({
      where: { slug },
    });

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    res.status(200).json({ success: true, blog });
  } catch (error) {
    next(error);
  }
});

// 3. FETCH GALLERY CHRONICLES
// GET /api/public/gallery
router.get('/gallery', async (req, res, next) => {
  try {
    // If database is empty, return initial mock items directly.
    let gallery = await prisma.gallery.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (gallery.length === 0) {
      // Return beautiful default records
      const mockGallery = [
        { id: '1', title: 'Golden Hour Sowing', category: 'Fields', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200', description: 'Our expansive biodiverse fields at the break of dawn, prepared with natural microorganisms.' },
        { id: '2', title: 'Handpicked Organic Carrots', category: 'Harvest', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=1200', description: 'Freshly harvested heirloom orange carrots covered in nutritious, pesticide-free soil.' },
        { id: '3', title: 'Preserving Traditional Wisom', category: 'Farmers', image: 'https://images.unsplash.com/photo-1592890278983-18616401d4ed?auto=format&fit=crop&q=80&w=1200', description: 'Suryodaya\'s proud local farmers inspecting native millet grains prior to sorting.' },
        { id: '4', title: 'Sprouting Bajra Seedlings', category: 'Crops', image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200', description: 'Tender pearl millet shoots rising gracefully from enriched, chemical-free soils.' },
        { id: '5', title: 'Cold Churning A2 Ghee', category: 'Harvest', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=1200', description: 'Clarifying organic butter over a slow wooden-fueled fire inside our Vedic kitchens.' },
        { id: '6', title: 'Sun-Drying Heirloom Millets', category: 'Crops', image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=1200', description: 'Ragi and bajra grains spread across natural cotton sheets for gentle solar drying.' },
        { id: '7', title: 'Nurturing the Soil', category: 'Farmers', image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=1200', description: 'Farmers preparing Panchagavya, a sacred organic blend of cow dung, urine, milk, curd, and ghee.' },
        { id: '8', title: 'Misty Sunrise Orchards', category: 'Fields', image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1200', description: 'Our mango and coconut trees shrouded in organic morning mist, drinking natural groundwater.' }
      ];
      return res.status(200).json({ success: true, count: mockGallery.length, gallery: mockGallery });
    }

    res.status(200).json({ success: true, count: gallery.length, gallery });
  } catch (error) {
    next(error);
  }
});

// 4. FETCH TESTIMONIALS
// GET /api/public/testimonials
router.get('/testimonials', async (req, res, next) => {
  try {
    let testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    if (testimonials.length === 0) {
      const mockTestimonials = [
        { 
          id: '1', 
          customerName: 'Dr. Ananya R. Deshmukh', 
          location: 'Integrative Pediatrician', 
          testimonialText: 'The Bilona Ghee and Ragi millet from Suryodaya Farms are absolute revelations. The quality, texture, and aroma are identical to the traditional farm staples my grandmother used to make. True medicine.', 
          customerPhoto: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=200', 
          rating: 5, 
          productPurchased: 'Verified Consumer',
          featuredToggle: true,
          isActive: true
        },
        { 
          id: '2', 
          customerName: 'Ramdas Balaji Jadhav', 
          location: 'Cooperative Farmer, Wardha', 
          testimonialText: 'Suryodaya saved my family from the debt traps of chemical farming. They educated us on preparing Jeevamrutham and pay us premium prices for our millets. Today we work with absolute pride.', 
          customerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', 
          rating: 5, 
          productPurchased: 'Cooperative Farmer',
          featuredToggle: true,
          isActive: true
        },
        { 
          id: '3', 
          customerName: 'Vikramjit Singh', 
          location: 'Founder, Modern Vedic Kitchens', 
          testimonialText: 'In the premium restaurant business, flavor is everything, but nutrition builds loyalty. The cold-pressed mustard oil and sun-dried basmati rice from Suryodaya Farms carry a pristine character.', 
          customerPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', 
          rating: 5, 
          productPurchased: 'Commercial Partner',
          featuredToggle: true,
          isActive: true
        }
      ];
      return res.status(200).json({ success: true, count: mockTestimonials.length, testimonials: mockTestimonials });
    }

    res.status(200).json({ success: true, count: testimonials.length, testimonials });
  } catch (error) {
    next(error);
  }
});

// 5. DISPATCH CONTACT MESSAGE
// POST /api/public/contact
router.post('/contact', async (req, res, next) => {
  const { name, email, phone, type, message } = req.body;

  try {
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, phone, and message are required.' });
    }

    const contact = await prisma.contactMessage.create({
      data: { name, email, phone, type: type || 'Millets & Grains', message },
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry successfully received. We will contact you soon.',
      contact
    });
  } catch (error) {
    next(error);
  }
});

// 6. FETCH HOMEPAGE CONFIGURATION
// GET /api/public/homepage
router.get('/homepage', async (req, res, next) => {
  try {
    const now = new Date();

    // 1. Fetch active campaigns matching date filters
    const activeCampaigns = await prisma.homepageCampaign.findMany({
      where: {
        isActive: true,
        OR: [
          {
            startDate: null,
            endDate: null
          },
          {
            startDate: { lte: now },
            endDate: null
          },
          {
            startDate: null,
            endDate: { gte: now }
          },
          {
            startDate: { lte: now },
            endDate: { gte: now }
          }
        ]
      },
      orderBy: { updatedAt: 'desc' }
    });

    let campaign = activeCampaigns[0] || null;

    // 2. Fetch featured product details if defined in active campaign
    if (campaign && campaign.featuredProductId) {
      const product = await prisma.product.findUnique({
        where: { id: campaign.featuredProductId },
        include: { images: true, variants: true }
      });
      if (product) {
        campaign = {
          ...campaign,
          featuredProduct: product
        };
      }
    }

    // 2.5 Fetch active homepage hero configurations
    let activeHeroes = await prisma.homepageHero.findMany({
      where: { isActive: true },
      orderBy: [
        { isFeatured: 'desc' },
        { slideOrder: 'asc' },
        { updatedAt: 'desc' }
      ]
    });

    // Populate featured products for each active hero configuration
    for (let i = 0; i < activeHeroes.length; i++) {
      if (activeHeroes[i].featuredProductId) {
        const product = await prisma.product.findUnique({
          where: { id: activeHeroes[i].featuredProductId },
          include: { images: true, variants: true }
        });
        if (product) {
          activeHeroes[i] = {
            ...activeHeroes[i],
            featuredProduct: product
          };
        }
      }
    }

    // Establish pre-seeded gorgeous fallback hero if none exists in DB
    const defaultHero = {
      id: "default",
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
      featuredProductId: null,
      offerBadgeText: "15% OFF",
      floatingBadgeTitle: "100% Heirloom",
      floatingBadgeSubtitle: "Non-Hybrid seeds",
      isActive: true,
      slideOrder: 0,
      isFeatured: false
    };

    if (activeHeroes.length === 0) {
      const firstProduct = await prisma.product.findFirst({
        include: { images: true, variants: true }
      });
      if (firstProduct) {
        defaultHero.featuredProductId = firstProduct.id;
        defaultHero.featuredProduct = firstProduct;
      }
      activeHeroes = [defaultHero];
    }

    // 2.6 Fetch slider global configurations
    const autoRotateSetting = await prisma.websiteSetting.findUnique({
      where: { key: 'homepage_hero_auto_rotate' }
    });
    const durationSetting = await prisma.websiteSetting.findUnique({
      where: { key: 'homepage_hero_slide_duration' }
    });

    const autoRotate = autoRotateSetting ? autoRotateSetting.value === 'true' : true;
    const slideDuration = durationSetting ? parseInt(durationSetting.value, 10) || 5 : 5;

    // 3. Fetch active homepage categories sorted by position
    const categories = await prisma.category.findMany({
      where: { promoVisible: true, isVisible: true },
      orderBy: { position: 'asc' }
    });

    // 3.5 Fetch active homepage collections sorted by sortOrder
    const collections = await prisma.homepageCollection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    // 4. Fetch custom homepage section ordering
    const sectionOrderSetting = await prisma.websiteSetting.findUnique({
      where: { key: 'homepage_section_order' }
    });

    res.status(200).json({
      success: true,
      campaign,
      hero: activeHeroes[0] || defaultHero,
      heroes: activeHeroes,
      autoRotate,
      slideDuration,
      categories,
      collections,
      sectionOrder: sectionOrderSetting ? sectionOrderSetting.value : null
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/public/settings
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

export default router;
