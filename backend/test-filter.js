import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Fetch categories as they are returned by /api/public/homepage
  const homepageCategories = await prisma.category.findMany({
    where: { promoVisible: true, isVisible: true },
    orderBy: { position: 'asc' }
  });

  // 2. Fetch products as they are returned by /api/products?limit=100
  const products = await prisma.product.findMany({
    where: { isVisible: true },
    include: {
      images: true,
      variants: true,
      categories: true,
      reviews: {
        select: { rating: true }
      }
    }
  });

  // 3. Map products like in Home.jsx fetchProducts
  const productsList = products.map(p => ({
    id: p.id || p._id,
    name: p.name,
    price: p.price,
    categories: p.categories || [],
    categoryId: p.categories?.[0]?.id || '',
    category: p.categories?.[0]?.name || 'Organic',
    isBestseller: !!p.isBestseller
  }));

  console.log("Total products fetched:", productsList.length);

  // 4. Test filtering for each category
  for (const activeCategory of homepageCategories) {
    const filteredProducts = productsList.filter(p => {
      if (activeCategory === 'All' || activeCategory?.id === 'All') {
        return p.isBestseller;
      }
      return p.categories?.some(cat => cat.id === activeCategory.id) || p.categoryId === activeCategory.id;
    });

    console.log(`Category: "${activeCategory.name}" (ID: ${activeCategory.id})`);
    console.log(` -> Matched products count: ${filteredProducts.length}`);
    if (filteredProducts.length > 0) {
      console.log(`    Matched:`, filteredProducts.map(p => p.name));
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
