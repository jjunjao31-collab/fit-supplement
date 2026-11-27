import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { pool, ensureDatabaseTables } from '@/lib/db';

interface UserProfileRow extends RowDataPacket {
  id: number;
  email: string;
  username: string | null;
  fullname: string;
  phone: string | null;
  address: string | null;
  points: number | null;
  created_at: string | null;
}

// GET /api/auth/me — คืนข้อมูลผู้ใช้ที่ Login อยู่จาก JWT Cookie หรือ 401 (Melivecode DIT205 บทที่ 4 & 6)
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyToken(getTokenFromRequest(request));

    if (!payload) {
      return NextResponse.json(
        { status: 'error', authenticated: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await ensureDatabaseTables();
    // ดึงข้อมูลเสริม (phone, address, points) โดยไม่ส่งคอลัมน์ password ออกไปเด็ดขาด
    const [rows] = await pool.query<UserProfileRow[]>(
      'SELECT id, email, username, fullname, phone, address, points, created_at FROM users WHERE id = ? LIMIT 1',
      [payload.id]
    );
    const dbUser = rows[0];

    const fullname = dbUser?.fullname || payload.fullname;
    const userData = {
      id: payload.id,
      email: dbUser?.email || payload.email,
      username: dbUser?.username || payload.username || payload.email,
      fullname,
      fullName: fullname,
      role: payload.role,
      phone: dbUser?.phone || '',
      address: dbUser?.address || '',
      points: dbUser?.points ?? 150,
      created_at: dbUser?.created_at || null,
    };

    return NextResponse.json({
      status: 'ok',
      authenticated: true,
      ...userData,
      user: userData,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { status: 'error', authenticated: false, message: msg },
      { status: 500 }
    );
  }
}
