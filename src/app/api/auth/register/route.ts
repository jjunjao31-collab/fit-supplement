import { NextResponse } from 'next/server';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool, ensureDatabaseTables } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// POST /api/auth/register — สมัครสมาชิกใหม่ (บทที่ 4 & 6: แฮชด้วย bcrypt และตั้ง role เริ่มต้นเป็น member ตามหลัก Least Privilege)
export async function POST(request: Request) {
  try {
    await ensureDatabaseTables();
    const { email, password, fullname, fullName, username, phone, address } = await request.json();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanFullname = (fullname || fullName || '').trim();
    const cleanUsername = (username || cleanEmail.split('@')[0] || '').trim();

    if (!cleanEmail || !password || !cleanFullname) {
      return NextResponse.json(
        { status: 'error', success: false, message: 'กรุณากรอกชื่อ-นามสกุล อีเมล และรหัสผ่านให้ครบถ้วน' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { status: 'error', success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' },
        { status: 400 }
      );
    }

    // ปฏิเสธอีเมลที่สมัครไว้แล้ว
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [cleanEmail]
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { status: 'error', success: false, message: 'อีเมลนี้ถูกลงทะเบียนไว้ในระบบแล้ว' },
        { status: 409 }
      );
    }

    // ห้ามเก็บรหัสผ่านจริง เก็บเฉพาะ bcrypt hash
    const hash = await hashPassword(password);

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (email, password, fullname, role, username, phone, address, points)
       VALUES (?, ?, ?, 'member', ?, ?, ?, 150)`,
      [
        cleanEmail,
        hash,
        cleanFullname,
        cleanUsername,
        (phone || '').trim(),
        (address || '').trim(),
      ]
    );

    return NextResponse.json(
      {
        status: 'ok',
        success: true,
        id: result.insertId,
        message: 'สมัครสมาชิกสำเร็จ สามารถเข้าสู่ระบบได้ทันที',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { status: 'error', success: false, message: msg },
      { status: 500 }
    );
  }
}
