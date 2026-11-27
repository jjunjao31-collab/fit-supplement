import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { pool, ensureDatabaseTables } from '@/lib/db';
import { requirePermission } from '@/lib/auth';

interface ProductDbRow extends RowDataPacket {
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

function normalizeProduct(p: ProductDbRow) {
  let features: string[] = [];
  if (Array.isArray(p.features)) {
    features = p.features;
  } else if (typeof p.features === 'string' && p.features.trim()) {
    try {
      features = JSON.parse(p.features);
    } catch {
      features = [];
    }
  }

  return {
    ...p,
    price: Number(p.price),
    originalPrice: Number(p.originalPrice ?? p.price),
    rating: Number(p.rating ?? 5.0),
    reviewsCount: Number(p.reviewsCount ?? 0),
    stock: Number(p.stock ?? (p.inStock ? 50 : 0)),
    inStock: Boolean(p.inStock),
    features,
  };
}

// GET /api/products — ดึงรายการสินค้าทั้งหมดจาก MySQL (Melivecode DIT205 บทที่ 3)
export async function GET() {
  try {
    await ensureDatabaseTables();
    const [rows] = await pool.query<ProductDbRow[]>('SELECT * FROM products ORDER BY brand ASC, name ASC');
    return NextResponse.json(rows.map(normalizeProduct));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { status: 'error', message: msg },
      { status: 500 }
    );
  }
}

// POST /api/products — เพิ่มสินค้าใหม่ลง MySQL ต้องมีสิทธิ์ product:create (บทที่ 3 & 6)
export async function POST(request: NextRequest) {
  const { error } = await requirePermission(request, 'product:create');
  if (error) return error;

  try {
    await ensureDatabaseTables();
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
      detail,
      fdaNumber,
      servings,
      size,
      suitableFor,
      howToUse,
      goal,
      badge,
      imageUrl,
      features,
    } = body;

    if (!name || price == null) {
      return NextResponse.json(
        { status: 'error', message: 'name and price are required' },
        { status: 400 }
      );
    }

    const id = body.id || `prod-${Date.now()}`;
    const stockNum = stock != null ? Number(stock) : 50;

    await pool.query(
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
        Number(originalPrice ?? price),
        stockNum,
        detail || suitableFor || '',
        fdaNumber || '10-1-00000-1-0000',
        5.0,
        0,
        servings || '30 เซิร์ฟวิ่ง',
        size || '2 lbs',
        suitableFor || detail || 'ผู้ที่ต้องการเสริมสารอาหารและออกกำลังกาย',
        howToUse || 'รับประทานตามคำแนะนำข้างบรรจุภัณฑ์',
        goal || 'muscle-gain',
        badge || 'สินค้าใหม่',
        stockNum > 0 ? 1 : 0,
        imageUrl || '/images/products/baam-my-whey.webp',
        JSON.stringify(features || ['สินค้าแท้ 100%', 'มาตรฐาน อย. ไทย']),
      ]
    );

    return NextResponse.json({ status: 'ok', id }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json(
      { status: 'error', message: msg },
      { status: 500 }
    );
  }
}
