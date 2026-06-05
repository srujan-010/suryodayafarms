import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const settings = await prisma.websiteSetting.findMany();
    const settingsObj = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const fallbacks = {
      companyName: 'Suryodaya Farms',
      brandName: 'Suryodaya Farms & Organics',
      email: 'care@suryodayafarms.com',
      phone: '+91 9100422140',
      address: 'Plot No-20 NP, Kuruma Nagar, Peerzadiguda Mandal, Medchal (Malkajgiri), Telangana – 500039',
      websiteUrl: 'https://suryodayafarms.com',
      gstNumber: '36AAAAA0000A1Z5',
      registrationDetails: 'FSSAI Licence No: 11524999000342 | Soil Bio-Dynamic System ISO 14001',
      socialTwitter: 'https://twitter.com/suryodayafarms',
      socialFacebook: 'https://facebook.com/suryodayafarms',
      socialInstagram: 'https://instagram.com/suryodayafarms',
      socialYoutube: 'https://youtube.com/suryodayafarms'
    };

    return NextResponse.json({
      success: true,
      settings: { ...fallbacks, ...settingsObj }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const newSettings = await request.json();
    const promises = Object.entries(newSettings).map(([key, value]) => {
      return prisma.websiteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    });
    await Promise.all(promises);
    return NextResponse.json({ success: true, message: 'Settings updated successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
