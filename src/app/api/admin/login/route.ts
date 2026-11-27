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
  role: string;
}

// POST /api/admin/login — ตรวจบัญชีผู้ดูแล/เจ้าหน้าที่จากตาราง users (RBAC) แล้วตั้ง HttpOnly cookie token
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

    if (!user || !(await comparePassword(password, user.password))) {
      return NextResponse.json(
        { status: 'error', success: false, message: 'อีเมล/ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    const role = user.role === 'superadmin' ? 'admin' : (user.role || 'member');

    // ตรวจสิทธิ์ admin:access (อนุญาตเฉพาะ staff และ admin)
    if (!can(role, 'admin:access')) {
      return NextResponse.json(
        { status: 'error', success: false, message: 'บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบจัดการหลังบ้าน (403 Forbidden)' },
        { status: 403 }
      );
    }

    const fullname = user.fullname || user.username || user.email;
    const token = await signToken({
      id: user.id,
      email: user.email,
      username: user.username || user.email,
      fullname,
      role,
    });

    const response = NextResponse.json({
      status: 'ok',
      success: true,
      admin: {
        id: user.id,
        email: user.email,
        username: user.username || user.email,
        fullname,
        fullName: fullname,
        role,
      },
      message: 'เข้าสู่ระบบหลังบ้านสำเร็จ',
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60,
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
