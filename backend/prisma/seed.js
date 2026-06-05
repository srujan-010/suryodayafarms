import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear Existing Data (in reverse order of relations)
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.gallery.deleteMany({});
  await prisma.contactMessage.deleteMany({});
  await prisma.sEOSetting.deleteMany({});
  await prisma.websiteSetting.deleteMany({});

  // 2. Hash Default Passwords
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('adminpassword', salt);

  // 3. Create Default Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'Aditya Suryodaya',
      email: 'admin@suryodaya.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  console.log('✅ Created Default Master Admin User (admin@suryodaya.com)');

  // 3.5 Create Premium Production-Ready Categories (Real Active Categories, No Dummy Content)
  await prisma.category.createMany({
    data: [
      {
        name: 'Cold Pressed Oils',
        slug: 'cold-pressed-oils',
        description: 'Slow-pressed wood ghani unrefined premium oils.',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800',
        isVisible: true,
        homepageVisible: true,
        promoVisible: true,
        position: 1,
      },
      {
        name: 'A2 Ghee',
        slug: 'a2-ghee',
        description: 'Traditional slow curd-churned A2 Gir cow ghee.',
        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800',
        isVisible: true,
        homepageVisible: true,
        promoVisible: true,
        position: 2,
      },
      {
        name: 'Organic Grains',
        slug: 'organic-grains',
        description: 'Premium sun-dried native basmati and rice grains.',
        image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=800',
        isVisible: true,
        homepageVisible: true,
        promoVisible: true,
        position: 3,
      },
      {
        name: 'Ancient Millets',
        slug: 'ancient-millets',
        description: 'Ancient, organic, and fiber-rich dryland millet grains.',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
        isVisible: true,
        homepageVisible: true,
        promoVisible: true,
        position: 4,
      },
      {
        name: 'Stone-Ground Spices',
        slug: 'stone-ground-spices',
        description: 'Pure native farm-grown stone-ground raw spices.',
        image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=800',
        isVisible: true,
        homepageVisible: true,
        promoVisible: true,
        position: 5,
      },
      {
        name: 'Raw Honey & Sweeteners',
        slug: 'raw-honey-sweeteners',
        description: 'Chemical-free natural forest sweeteners and honey.',
        image: 'https://images.unsplash.com/photo-1608408881648-a1c97a5ee2e3?auto=format&fit=crop&q=80&w=800',
        isVisible: true,
        homepageVisible: true,
        promoVisible: true,
        position: 6,
      }
    ]
  });

  console.log('✅ Seeded 6 Real Premium Organic Categories');

  // 4. Create Website Settings & SEO Defaults
  await prisma.sEOSetting.createMany({
    data: [
      { page: 'home', title: 'Suryodaya Farms | Premium Organic Agriculture', description: 'Vedic, chemical-free organic farm-to-home products.', keywords: 'organic, ghee, millets, oils' },
      { page: 'products', title: 'Organic Marketplace | Suryodaya Farms', description: 'Buy wood-pressed oils, stone-ground millets, A2 ghee.', keywords: 'market, shop, bajra, mustard' }
    ]
  });

  await prisma.websiteSetting.createMany({
    data: [
      { key: 'companyName', value: 'Suryodaya Farms' },
      { key: 'brandName', value: 'Suryodaya Farms & Organics' },
      { key: 'email', value: 'care@suryodayafarms.com' },
      { key: 'phone', value: '+91 9100422140' },
      { key: 'address', value: 'Plot No-20 NP, Kuruma Nagar, Peerzadiguda Mandal, Medchal (Malkajgiri), Telangana – 500039' },
      { key: 'websiteUrl', value: 'https://suryodayafarms.com' },
      { key: 'gstNumber', value: '36AAAAA0000A1Z5' },
      { key: 'registrationDetails', value: 'FSSAI Licence No: 11524999000342 | Soil Bio-Dynamic System ISO 14001' },
      { key: 'socialTwitter', value: 'https://twitter.com/suryodayafarms' },
      { key: 'socialFacebook', value: 'https://facebook.com/suryodayafarms' },
      { key: 'socialInstagram', value: 'https://instagram.com/suryodayafarms' },
      { key: 'socialYoutube', value: 'https://youtube.com/suryodayafarms' }
    ]
  });

  console.log('✅ Created Site Configurations & SEO Tables');
  console.log('🌱 Database cleared and base admin/configurations initialized successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
