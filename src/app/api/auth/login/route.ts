import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { pool, ensureDatabaseTables } from '@/lib/db';
import { signToken, comparePassword } from '@/lib/auth';
import { can } from '@/lib/rbac';

interface UserAuthRow extends RowDataPacket {
  id: number;
  email: string;
  username: string | null;
  password: string;
  fullname: string;
  phone: string | null;
  address: string | null;
  points: number | null;
  role: string;
}

// POST /api/auth/login — ตรวจรหัสผ่านกับ bcrypt hash ในตาราง users แล้วตั้ง HttpOnly cookie token (Melivecode DIT205 บทที่ 4 & 6)
export async function POST(request: Request) {
  try {
    await ensureDatabaseTables();
    const { username, email, password } = await request.json();
    const identifier = (email || username || '').trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { status: 'error', success: false, message: 'กรุณากรอกอีเมลหรือชื่อผู้ใช้ และรหัสผ่าน' },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<UserAuthRow[]>(
      'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1',
      [identifier, identifier]
    );
    const user = rows[0];

    // ใช้ข้อความเดียวกันทั้งกรณีไม่พบอีเมลและรหัสผ่านผิด เพื่อไม่ให้เดาบัญชีที่มีในระบบได้ (บทที่ 4)
    if (!user || !(await comparePassword(password, user.password))) {
      return NextResponse.json(
        { status: 'error', success: false, message: 'อีเมล/ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    const role = user.role === 'superadmin' ? 'admin' : (user.role || 'member');
    const fullname = user.fullname || user.username || user.email;

    // ใส่ role ใน JWT payload เพื่อใช้ตรวจสิทธิ์ใน proxy.ts และ requirePermission (บทที่ 6)
    const token = await signToken({
      id: user.id,
      email: user.email,
      username: user.username || user.email,
      fullname,
      role,
    });

    const redirectTo = can(role, 'admin:access') ? '/admin' : '/profile';

    const response = NextResponse.json({
      status: 'ok',
      success: true,
      role,
      user: {
        id: user.id,
        email: user.email,
        username: user.username || user.email,
        fullname,
        fullName: fullname,
        phone: user.phone || '',
        address: user.address || '',
        points: user.points || 150,
        role,
      },
      redirectTo,
      message: 'เข้าสู่ระบบสำเร็จ',
    });

    // httpOnly: JavaScript บนหน้าเว็บอ่าน cookie นี้ไม่ได้ (บทที่ 4)
    response.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60, // 1 ชั่วโมง เท่ากับอายุของ token
    });

    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { status: 'error', success: false, message: msg },
      { status: 500 }
    );
  }
}
