import { NextRequest, NextResponse } from 'next/server';
import { pool, ensureDatabaseTables } from '@/lib/db';
import { requirePermission } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/rbac';

// PUT /api/users/{id} — เปลี่ยน role ของผู้ใช้ ต้องมีสิทธิ์ user:manage (Melivecode DIT205 บทที่ 6)
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { user, error } = await requirePermission(request, 'user:manage');
  if (error) return error;

  try {
    await ensureDatabaseTables();
    const { id } = await context.params;
    const targetId = Number(id);
    const { role } = await request.json();

    if (!Number.isInteger(targetId) || targetId <= 0) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // รับเฉพาะ role ที่มีอยู่ใน PERMISSIONS
    if (!Object.keys(PERMISSIONS).includes(role)) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid role' },
        { status: 400 }
      );
    }

    // กัน admin ลดสิทธิ์ตัวเองจนไม่มี admin เหลือในระบบ (บทที่ 6)
    if (targetId === Number(user?.id)) {
      return NextResponse.json(
        { status: 'error', message: 'ไม่สามารถเปลี่ยนสิทธิ์ของบัญชีตัวเองได้ (You cannot change your own role)' },
        { status: 400 }
      );
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, targetId]);
    return NextResponse.json({ status: 'ok', message: 'อัปเดตบทบาทผู้ใช้เรียบร้อยแล้ว' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ status: 'error', message: msg }, { status: 500 });
  }
}
