import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const backupPath = 'C:\\Users\\91789\\.gemini\\antigravity-ide\\brain\\8f68f549-6f94-4193-9122-764c41c9414b\\homepage_cms_backup.json';

async function main() {
  console.log('Initiating homepage CMS backup...');
  try {
    const heroes = await prisma.homepageHero.findMany();
    const collections = await prisma.homepageCollection.findMany();
    const campaigns = await prisma.homepageCampaign.findMany();
    const settings = await prisma.websiteSetting.findMany({
      where: {
        key: {
          in: [
            'homepage_section_order',
            'homepage_hero_auto_rotate',
            'homepage_hero_slide_duration'
          ]
        }
      }
    });

    const snapshot = {
      timestamp: new Date().toISOString(),
      heroes,
      collections,
      campaigns,
      settings
    };

    fs.writeFileSync(backupPath, JSON.stringify(snapshot, null, 2));
    console.log(`Backup completed successfully! Saved to: ${backupPath}`);
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
