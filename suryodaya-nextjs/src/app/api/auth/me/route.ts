import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No active session.' },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET || 'suryodaya_sacred_jwt_key_2026_nature_otp';
    let decoded: any;

    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired session token.' },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, message: 'Malformed session token.' },
        { status: 401 }
      );
    }

    // Retrieve full profile from Prisma
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User profile not found.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error: any) {
    console.error('[GET Me API Error]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
