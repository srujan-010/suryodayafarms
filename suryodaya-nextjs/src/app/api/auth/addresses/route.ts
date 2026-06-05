import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'suryodaya_sacred_jwt_key_2026_nature_otp';

// Utility helper to authenticate session
async function getAuthenticatedUserId() {
  const cookieStore = cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded?.id || null;
  } catch (err) {
    return null;
  }
}

// 1. GET Address list
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    console.error('[GET Addresses API Error]', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// 2. POST Add new address
export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { title, recipientName, phone, street, city, state, postalCode, country, isDefault } = await request.json();

    if (!title || !recipientName || !phone || !street || !city || !state || !postalCode) {
      return NextResponse.json({ success: false, message: 'Required fields are missing.' }, { status: 400 });
    }

    // If marked default, unset old defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        title,
        recipientName,
        phone,
        street,
        city,
        state,
        postalCode,
        country: country || 'India',
        isDefault: !!isDefault,
      },
    });

    return NextResponse.json({ success: true, address: newAddress });
  } catch (error: any) {
    console.error('[POST Addresses API Error]', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// 3. DELETE Address
export async function DELETE(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return NextResponse.json({ success: false, message: 'Address ID parameter is required.' }, { status: 400 });
    }

    // Verify ownership before deleting
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      return NextResponse.json({ success: false, message: 'Address not found or access denied.' }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    // If we deleted a default address, make another address default if available
    if (address.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { userId },
      });
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Address deleted successfully.' });
  } catch (error: any) {
    console.error('[DELETE Addresses API Error]', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
