import { NextRequest, NextResponse } from 'next/server';
import { dbAll, dbRun } from '@/lib/db';
import { requirePermission } from '@/lib/auth';

interface AdminOrderRow {
  id: string;
  userId: number | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: string | Array<Record<string, unknown>>;
  totalAmount: number | string;
  status: string;
  createdAt: string;
}

// GET /api/admin/orders — ต้องมีสิทธิ์ order:manage (staff, admin)
export async function GET(request: NextRequest) {
  const { error } = await requirePermission(request, 'order:manage');
  if (error) return error;

  try {
    const orders = await dbAll<AdminOrderRow>('SELECT * FROM orders ORDER BY createdAt DESC');
    const parsed = orders.map((o) => ({
      ...o,
      totalAmount: Number(o.totalAmount || 0),
      items:
        Array.isArray(o.items)
          ? o.items
          : typeof o.items === 'string' && o.items.trim()
          ? JSON.parse(o.items)
          : [],
    }));
    return NextResponse.json({ success: true, orders: parsed });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

// PUT /api/admin/orders — ต้องมีสิทธิ์ order:manage (staff, admin)
export async function PUT(request: NextRequest) {
  const { error } = await requirePermission(request, 'order:manage');
  if (error) return error;

  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'Missing id or status' }, { status: 400 });
    }
    await dbRun('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return NextResponse.json({ success: true, status: 'ok', message: 'อัปเดตสถานะออเดอร์เรียบร้อย' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
