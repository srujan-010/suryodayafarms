import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Updating products for homepage visibility...');

  const slugsToUpdate = [
    'a2-bilona-cow-ghee-500ml',
    'a2-bilona-cow-ghee-1l',
    'traditional-mango-pickle',
    'gongura-pickle',
    'premium-toor-dal',
    'organic-moong-dal',
    'sona-masuri-rice',
    'foxtail-millet',
    'natural-turmeric-powder',
    'red-chilli-powder'
  ];

  for (const slug of slugsToUpdate) {
    await prisma.product.updateMany({
      where: { slug: slug },
      data: { isBestseller: true, isFeatured: true }
    });
    console.log(`✅ Updated ${slug} to be a bestseller and featured`);
  }

  console.log('🎉 Finished updating products successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
