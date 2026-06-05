import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("=== Homepage Collections ===");
  const collections = await prisma.homepageCollection.findMany();
  console.log(JSON.stringify(collections, null, 2));

  console.log("\n=== Categories ===");
  const categories = await prisma.category.findMany();
  console.log(JSON.stringify(categories, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
