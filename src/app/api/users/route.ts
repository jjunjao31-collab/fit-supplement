import { NextRequest, NextResponse } from 'next/server';
import { pool, ensureDatabaseTables } from '@/lib/db';
import { requirePermission } from '@/lib/auth';

// GET /api/users — รายชื่อผู้ใช้ทั้งหมด ต้องมีสิทธิ์ user:manage (เฉพาะ admin) (Melivecode DIT205 บทที่ 6)
export async function GET(request: NextRequest) {
  const { error } = await requirePermission(request, 'user:manage');
  if (error) return error;

  try {
    await ensureDatabaseTables();
    // เลือกเฉพาะคอลัมน์ที่จำเป็น ห้ามส่ง password (bcrypt hash) ออกไปถึงหน้าเว็บ
    const [rows] = await pool.query(
      'SELECT id, email, username, fullname, role, phone, points, created_at FROM users ORDER BY id ASC'
    );
    return NextResponse.json(rows);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ status: 'error', message: msg }, { status: 500 });
  }
}
