import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    where: { promoVisible: true, isVisible: true },
    orderBy: { position: 'asc' }
  });
  console.log("Categories returned to homepage:", categories.map(c => ({ name: c.name, id: c.id, slug: c.slug })));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
