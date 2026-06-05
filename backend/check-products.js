import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: {
      categories: true
    }
  });
  console.log(products.map(p => ({
    name: p.name,
    id: p.id,
    categories: p.categories.map(c => c.name)
  })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
