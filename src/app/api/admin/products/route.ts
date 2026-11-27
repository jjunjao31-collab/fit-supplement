import { NextRequest, NextResponse } from 'next/server';
import { dbAll, dbRun } from '@/lib/db';
import { requirePermission } from '@/lib/auth';

interface AdminProductRow {
  id: string;
  name: string;
  nameTH: string;
  brand: string;
  category: string;
  subCategory: string | null;
  price: number | string;
  originalPrice: number | string | null;
  stock: number | null;
  detail: string | null;
  fdaNumber: string;
  rating: number | string | null;
  reviewsCount: number | null;
  servings: string | null;
  size: string | null;
  suitableFor: string | null;
  howToUse: string | null;
  goal: string | null;
  badge: string | null;
  inStock: number | boolean;
  imageUrl: string | null;
  features: string | string[] | null;
}

// GET /api/admin/products — ต้องมีสิทธิ์ admin:access (staff, admin)
export async function GET(request: NextRequest) {
  const { error } = await requirePermission(request, 'admin:access');
  if (error) return error;

  try {
    const products = await dbAll<AdminProductRow>('SELECT * FROM products ORDER BY brand ASC, name ASC');
    const parsed = products.map((p) => ({
      ...p,
      price: Number(p.price),
      originalPrice: Number(p.originalPrice ?? p.price),
      stock: Number(p.stock ?? (p.inStock ? 50 : 0)),
      inStock: Boolean(p.inStock),
      features:
        Array.isArray(p.features)
          ? p.features
          : typeof p.features === 'string' && p.features.trim()
          ? JSON.parse(p.features)
          : [],
    }));
    return NextResponse.json({ success: true, products: parsed });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

// POST /api/admin/products — ต้องมีสิทธิ์ product:create (staff, admin)
export async function POST(request: NextRequest) {
  const { error } = await requirePermission(request, 'product:create');
  if (error) return error;

  try {
    const body = await request.json();
    const {
      name,
      nameTH,
      brand,
      category,
      subCategory,
      price,
      originalPrice,
      stock,
      fdaNumber,
      servings,
      size,
      suitableFor,
      howToUse,
      goal,
      badge,
      inStock,
      imageUrl,
      features,
    } = body;

    if (!name || price == null) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุชื่อสินค้าและราคา' }, { status: 400 });
    }

    const id = `prod-${Date.now()}`;
    const stockCount = stock !== undefined ? Number(stock) : inStock !== false ? 50 : 0;

    await dbRun(
      `INSERT INTO products (
        id, name, nameTH, brand, category, subCategory, price, originalPrice,
        stock, detail, fdaNumber, rating, reviewsCount, servings, size, suitableFor, howToUse,
        goal, badge, inStock, imageUrl, features
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        nameTH || name,
        brand || 'FIT SUPPLEMENT',
        category || 'whey',
        subCategory || '',
        Number(price),
        Number(originalPrice) || Number(price),
        stockCount,
        suitableFor || '',
        fdaNumber || 'รอเลข อย.',
        5.0,
        0,
        servings || '',
        size || '',
        suitableFor || '',
        howToUse || '',
        goal || 'muscle-gain',
        badge || 'สินค้าใหม่',
        stockCount > 0 ? 1 : 0,
        imageUrl || '/images/products/baam-my-whey.webp',
        JSON.stringify(features || []),
      ]
    );

    return NextResponse.json({ success: true, status: 'ok', message: 'เพิ่มสินค้าสำเร็จ', id }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

// PUT /api/admin/products — ต้องมีสิทธิ์ product:update (staff, admin)
export async function PUT(request: NextRequest) {
  const { error } = await requirePermission(request, 'product:update');
  if (error) return error;

  try {
    const body = await request.json();
    const { id, name, nameTH, price, inStock, stock, detail, suitableFor } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing product ID' }, { status: 400 });
    }

    if (name !== undefined && price !== undefined) {
      const nextStock = stock !== undefined ? Math.max(0, Number(stock)) : inStock === false ? 0 : 50;
      const nextDetail = detail !== undefined ? detail : suitableFor;
      await dbRun(
        `UPDATE products
         SET name = ?,
             nameTH = COALESCE(?, nameTH),
             price = ?,
             stock = ?,
             inStock = ?,
             detail = COALESCE(?, detail),
             suitableFor = COALESCE(?, suitableFor)
         WHERE id = ?`,
        [
          String(name).trim(),
          nameTH !== undefined ? String(nameTH).trim() : null,
          Number(price),
          nextStock,
          nextStock > 0 ? 1 : 0,
          nextDetail !== undefined ? String(nextDetail).trim() : null,
          nextDetail !== undefined ? String(nextDetail).trim() : null,
          id,
        ]
      );
    } else {
      if (price !== undefined) {
        await dbRun('UPDATE products SET price = ? WHERE id = ?', [Number(price), id]);
      }
      if (stock !== undefined) {
        const nextStock = Math.max(0, Number(stock));
        await dbRun('UPDATE products SET stock = ?, inStock = ? WHERE id = ?', [
          nextStock,
          nextStock > 0 ? 1 : 0,
          id,
        ]);
      } else if (inStock !== undefined) {
        await dbRun('UPDATE products SET inStock = ?, stock = ? WHERE id = ?', [
          inStock ? 1 : 0,
          inStock ? 50 : 0,
          id,
        ]);
      }
    }

    return NextResponse.json({ success: true, status: 'ok', message: 'อัปเดตสินค้าเรียบร้อย' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

// DELETE /api/admin/products — ต้องมีสิทธิ์ product:delete (เฉพาะ admin เท่านั้น!)
export async function DELETE(request: NextRequest) {
  const { error } = await requirePermission(request, 'product:delete');
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing product ID' }, { status: 400 });
    }
    await dbRun('DELETE FROM products WHERE id = ?', [id]);
    return NextResponse.json({ success: true, status: 'ok', message: 'ลบสินค้าเรียบร้อย' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
