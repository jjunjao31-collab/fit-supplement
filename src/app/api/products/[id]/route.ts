import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { pool, ensureDatabaseTables } from '@/lib/db';
import { requirePermission } from '@/lib/auth';

// GET /api/products/{id} — อ่านข้อมูลสินค้าชิ้นเดียวจาก MySQL (บทที่ 3)
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseTables();
    const { id } = await context.params;
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Product not found' },
        { status: 404 }
      );
    }

    const row = rows[0] as Record<string, unknown>;
    let features: string[] = [];
    if (Array.isArray(row.features)) {
      features = row.features.map(String);
    } else if (typeof row.features === 'string' && row.features.trim()) {
      try {
        features = JSON.parse(row.features);
      } catch {
        features = [];
      }
    }

    return NextResponse.json({
      ...row,
      price: Number(row.price),
      originalPrice: Number(row.originalPrice ?? row.price),
      rating: Number(row.rating ?? 5.0),
      reviewsCount: Number(row.reviewsCount ?? 0),
      stock: Number(row.stock ?? (row.inStock ? 50 : 0)),
      inStock: Boolean(row.inStock),
      features,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json(
      { status: 'error', message: msg },
      { status: 500 }
    );
  }
}

// PUT /api/products/{id} — แก้ไขข้อมูลสินค้าใน MySQL ต้องมีสิทธิ์ product:update (บทที่ 3 & 6)
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission(request, 'product:update');
  if (error) return error;

  try {
    await ensureDatabaseTables();
    const { id } = await context.params;
    const body = await request.json();
    const { name, nameTH, price, stock, detail, inStock } = body;

    if (name !== undefined && price !== undefined) {
      const nextStock = stock !== undefined ? Number(stock) : 50;
      await pool.query(
        'UPDATE products SET name = ?, nameTH = ?, price = ?, stock = ?, detail = ?, inStock = ? WHERE id = ?',
        [name, nameTH || name, Number(price), nextStock, detail ?? '', nextStock > 0 ? 1 : 0, id]
      );
    } else {
      if (price !== undefined) {
        await pool.query('UPDATE products SET price = ? WHERE id = ?', [Number(price), id]);
      }
      if (stock !== undefined) {
        await pool.query('UPDATE products SET stock = ?, inStock = ? WHERE id = ?', [
          Number(stock),
          Number(stock) > 0 ? 1 : 0,
          id,
        ]);
      } else if (inStock !== undefined) {
        await pool.query('UPDATE products SET inStock = ?, stock = ? WHERE id = ?', [
          inStock ? 1 : 0,
          inStock ? 50 : 0,
          id,
        ]);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json(
      { status: 'error', message: msg },
      { status: 500 }
    );
  }
}

// DELETE /api/products/{id} — ลบสินค้าออกจาก MySQL ต้องมีสิทธิ์ product:delete (บทที่ 3 & 6)
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission(request, 'product:delete');
  if (error) return error;

  try {
    await ensureDatabaseTables();
    const { id } = await context.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return NextResponse.json({ status: 'ok' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json(
      { status: 'error', message: msg },
      { status: 500 }
    );
  }
}
