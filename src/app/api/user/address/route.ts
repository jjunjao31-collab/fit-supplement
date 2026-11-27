import { NextRequest, NextResponse } from 'next/server';
import { dbRun, dbGet } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { can } from '@/lib/rbac';

// PUT /api/user/address — อัปเดตที่อยู่จัดส่ง (ต้อง Login และแก้ได้เฉพาะบัญชีตัวเอง เว้นแต่มีสิทธิ์ user:manage)
export async function PUT(request: NextRequest) {
  const { user: authUser, error } = await requireAuth(request);
  if (error || !authUser) return error;

  try {
    const body = await request.json();
    const { id, fullName, fullname, phone, address } = body;

    if (!address || !address.trim()) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุที่อยู่จัดส่ง' },
        { status: 400 }
      );
    }

    // Ownership check: หากไม่ใช่ admin จะแก้ได้เฉพาะบัญชีตัวเองเท่านั้น
    const targetId = id && can(authUser.role, 'user:manage') ? Number(id) : Number(authUser.id);
    const nextName = (fullname || fullName || '').trim() || null;

    await dbRun(
      `UPDATE users
       SET address = ?,
           fullname = COALESCE(?, fullname),
           phone = COALESCE(?, phone)
       WHERE id = ?`,
      [address.trim(), nextName, phone?.trim() || null, targetId]
    );

    interface UpdatedUserRow {
      id: number;
      email: string;
      username: string | null;
      fullname: string;
      phone: string | null;
      address: string | null;
      role: string;
      points: number | null;
      created_at: string | null;
    }

    const updatedUser = await dbGet<UpdatedUserRow>(
      'SELECT id, email, username, fullname, phone, address, role, points, created_at FROM users WHERE id = ?',
      [targetId]
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'ไม่พบผู้ใช้ในระบบ' }, { status: 404 });
    }

    const returnUser = {
      ...updatedUser,
      fullName: updatedUser.fullname || updatedUser.username,
    };

    return NextResponse.json({
      success: true,
      message: 'อัปเดตที่อยู่จัดส่งเรียบร้อยแล้ว',
      user: returnUser,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
