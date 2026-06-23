import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clean() {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: 'uncategorized' }
    });
    if (category) {
      console.log(`Found category: ${category.name} (${category.id}). Cleaning up...`);
      // Disconnect from all products
      await prisma.category.update({
        where: { id: category.id },
        data: {
          products: {
            set: []
          }
        }
      });
      // Delete the category
      await prisma.category.delete({
        where: { id: category.id }
      });
      console.log('Uncategorized category deleted successfully.');
    } else {
      console.log('No Uncategorized category found.');
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clean();
