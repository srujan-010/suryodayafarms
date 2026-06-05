import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      categories: true
    }
  });
  console.log("Count of products:", products.length);
  console.dir(products.map(p => ({ 
    id: p.id, 
    name: p.name, 
    slug: p.slug, 
    weight: p.weight, 
    price: p.price, 
    variants: p.variants.map(v => ({ id: v.id, name: v.name, price: v.price, mrp: v.mrp, sku: v.sku, inventory: v.inventory }))
  })), { depth: null });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
