import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting to add categories and products...');

  // 1. Fetch existing categories
  const categories = await prisma.category.findMany();
  
  // Create mapping
  const categoryMap = {};
  categories.forEach(c => {
    categoryMap[c.name] = c.id;
  });

  // 2. Ensure Pickles and Pulses categories exist
  if (!categoryMap['Pickles']) {
    const pickles = await prisma.category.create({
      data: {
        name: 'Pickles',
        slug: 'pickles',
        description: 'Authentic traditional homemade pickles.',
        image: 'https://images.unsplash.com/photo-1626200419188-341a13b6f958?auto=format&fit=crop&q=80&w=800',
        isVisible: true,
        homepageVisible: true,
        promoVisible: true,
        position: 7,
      }
    });
    categoryMap['Pickles'] = pickles.id;
    console.log('✅ Created Pickles category');
  }

  if (!categoryMap['Pulses']) {
    const pulses = await prisma.category.create({
      data: {
        name: 'Pulses',
        slug: 'pulses',
        description: 'Unpolished and natural farm fresh pulses.',
        image: 'https://images.unsplash.com/photo-1585959957388-7557d1894dce?auto=format&fit=crop&q=80&w=800',
        isVisible: true,
        homepageVisible: true,
        promoVisible: true,
        position: 8,
      }
    });
    categoryMap['Pulses'] = pulses.id;
    console.log('✅ Created Pulses category');
  }

  // 3. Define products
  const productsToAdd = [
    // GHEE
    {
      name: 'A2 Bilona Cow Ghee – 500ml',
      slug: 'a2-bilona-cow-ghee-500ml',
      categoryId: categoryMap['A2 Ghee'],
      description: 'Traditional bilona churned A2 cow ghee with rich aroma and authentic homemade taste.',
      shortDescription: 'Traditional bilona churned A2 cow ghee with rich aroma and authentic homemade taste.',
      price: 950,
      compareAtPrice: 1100,
      mrp: 1100,
      discountPercent: 14,
      inventory: 40,
      stockStatus: 'IN_STOCK',
      weight: '500ml',
      sku: 'GHEE-500ML',
    },
    {
      name: 'A2 Bilona Cow Ghee – 1L',
      slug: 'a2-bilona-cow-ghee-1l',
      categoryId: categoryMap['A2 Ghee'],
      description: 'Pure wood-fired A2 cow ghee prepared using traditional slow churn methods.',
      shortDescription: 'Pure wood-fired A2 cow ghee prepared using traditional slow churn methods.',
      price: 1850,
      compareAtPrice: 2100,
      mrp: 2100,
      discountPercent: 12,
      inventory: 30,
      stockStatus: 'IN_STOCK',
      weight: '1 Litre',
      sku: 'GHEE-1L',
    },
    // PICKLES
    {
      name: 'Traditional Mango Pickle',
      slug: 'traditional-mango-pickle',
      categoryId: categoryMap['Pickles'],
      description: 'Authentic homemade mango pickle made with natural spices and cold pressed oil.',
      shortDescription: 'Authentic homemade mango pickle made with natural spices and cold pressed oil.',
      price: 299,
      compareAtPrice: 350,
      mrp: 350,
      discountPercent: 15,
      inventory: 60,
      stockStatus: 'IN_STOCK',
      weight: '500g',
      sku: 'PICKLE-MANGO-500G',
    },
    {
      name: 'Gongura Pickle',
      slug: 'gongura-pickle',
      categoryId: categoryMap['Pickles'],
      description: 'Spicy traditional Andhra style gongura pickle full of rich flavor and freshness.',
      shortDescription: 'Spicy traditional Andhra style gongura pickle full of rich flavor and freshness.',
      price: 340,
      compareAtPrice: 400,
      mrp: 400,
      discountPercent: 15,
      inventory: 50,
      stockStatus: 'IN_STOCK',
      weight: '500g',
      sku: 'PICKLE-GONGURA-500G',
    },
    // PULSES
    {
      name: 'Premium Toor Dal',
      slug: 'premium-toor-dal',
      categoryId: categoryMap['Pulses'],
      description: 'Naturally grown unpolished toor dal rich in protein and authentic taste.',
      shortDescription: 'Naturally grown unpolished toor dal rich in protein and authentic taste.',
      price: 190,
      compareAtPrice: 220,
      mrp: 220,
      discountPercent: 14,
      inventory: 100,
      stockStatus: 'IN_STOCK',
      weight: '1kg',
      sku: 'PULSE-TOOR-1KG',
    },
    {
      name: 'Organic Moong Dal',
      slug: 'organic-moong-dal',
      categoryId: categoryMap['Pulses'],
      description: 'Healthy farm fresh moong dal packed with nutrition and freshness.',
      shortDescription: 'Healthy farm fresh moong dal packed with nutrition and freshness.',
      price: 210,
      compareAtPrice: 240,
      mrp: 240,
      discountPercent: 12,
      inventory: 90,
      stockStatus: 'IN_STOCK',
      weight: '1kg',
      sku: 'PULSE-MOONG-1KG',
    },
    // RICE & GRAINS
    {
      name: 'Sona Masuri Rice',
      slug: 'sona-masuri-rice',
      categoryId: categoryMap['Organic Grains'],
      description: 'Lightweight premium rice variety ideal for daily healthy meals.',
      shortDescription: 'Lightweight premium rice variety ideal for daily healthy meals.',
      price: 760,
      compareAtPrice: 850,
      mrp: 850,
      discountPercent: 11,
      inventory: 70,
      stockStatus: 'IN_STOCK',
      weight: '5kg',
      sku: 'RICE-SONA-5KG',
    },
    {
      name: 'Foxtail Millet',
      slug: 'foxtail-millet',
      categoryId: categoryMap['Organic Grains'],
      description: 'Traditional healthy millet rich in fiber and essential nutrients.',
      shortDescription: 'Traditional healthy millet rich in fiber and essential nutrients.',
      price: 150,
      compareAtPrice: 180,
      mrp: 180,
      discountPercent: 16,
      inventory: 80,
      stockStatus: 'IN_STOCK',
      weight: '1kg',
      sku: 'MILLET-FOXTAIL-1KG',
    },
    // SPICES
    {
      name: 'Natural Turmeric Powder',
      slug: 'natural-turmeric-powder',
      categoryId: categoryMap['Stone-Ground Spices'],
      description: 'Pure turmeric powder with natural aroma and rich color without chemicals.',
      shortDescription: 'Pure turmeric powder with natural aroma and rich color without chemicals.',
      price: 150,
      compareAtPrice: 180,
      mrp: 180,
      discountPercent: 16,
      inventory: 120,
      stockStatus: 'IN_STOCK',
      weight: '500g',
      sku: 'SPICE-TURMERIC-500G',
    },
    {
      name: 'Red Chilli Powder',
      slug: 'red-chilli-powder',
      categoryId: categoryMap['Stone-Ground Spices'],
      description: 'Freshly processed red chilli powder with authentic spicy flavor.',
      shortDescription: 'Freshly processed red chilli powder with authentic spicy flavor.',
      price: 190,
      compareAtPrice: 220,
      mrp: 220,
      discountPercent: 14,
      inventory: 100,
      stockStatus: 'IN_STOCK',
      weight: '500g',
      sku: 'SPICE-CHILLI-500G',
    }
  ];

  for (const productData of productsToAdd) {
    const { categoryId, ...rest } = productData;
    // Check if product exists by slug
    const existing = await prisma.product.findUnique({
      where: { slug: productData.slug },
      include: { categories: true }
    });

    if (existing) {
      await prisma.product.update({
        where: { slug: productData.slug },
        data: {
          ...rest,
          categories: categoryId ? { set: [{ id: categoryId }] } : undefined
        }
      });
      console.log(`✅ Updated product: ${productData.name}`);
    } else {
      await prisma.product.create({
        data: {
          ...rest,
          categories: categoryId ? { connect: [{ id: categoryId }] } : undefined
        }
      });
      console.log(`✅ Created product: ${productData.name}`);
    }
  }

  console.log('🎉 Finished adding products successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
