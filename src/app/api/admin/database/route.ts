import { NextRequest, NextResponse } from 'next/server';
import { dbAll, isPostgresMode } from '@/lib/db';
import { requirePermission } from '@/lib/auth';

// GET /api/admin/database — ดูข้อมูลและโครงสร้างฐานข้อมูล SQL ต้องมีสิทธิ์ database:view (เฉพาะ admin)
export async function GET(request: NextRequest) {
  const { error } = await requirePermission(request, 'database:view');
  if (error) return error;

  try {
    const products = await dbAll<Record<string, unknown>>('SELECT * FROM products ORDER BY name ASC');
    const orders = await dbAll<Record<string, unknown>>('SELECT * FROM orders ORDER BY id DESC');
    const users = await dbAll<{
      id: number;
      email: string;
      username: string | null;
      fullname: string;
      role: string;
      phone: string | null;
      address: string | null;
      points: number | null;
      created_at: string | null;
    }>(
      'SELECT id, email, username, fullname, role, phone, address, points, created_at FROM users ORDER BY id ASC'
    );
    const admins = users.filter((u) => u.role === 'admin' || u.role === 'staff');
    const isPg = isPostgresMode();
    const databaseName = isPg
      ? process.env.PGDATABASE || process.env.POSTGRES_DATABASE || 'neondb'
      : process.env.DB_DATABASE || 'fitsupp';

    const schemaDDL = isPg
      ? `-- FIT SUPPLEMENT SQL DDL (Neon Cloud PostgreSQL — Vercel Production)
-- Database: ${databaseName} (Region: sin1 / Singapore)

-- 1. ตารางผู้ใช้ทั้งหมด (รวมทุกบทบาท member / staff / admin + รหัสผ่าน bcrypt hash)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  username VARCHAR(100),
  phone VARCHAR(50),
  address TEXT,
  points INT DEFAULT 150,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางสินค้าอาหารเสริม (CRUD บทที่ 3)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  "nameTH" VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  "subCategory" VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  "originalPrice" DECIMAL(10, 2),
  stock INT DEFAULT 50,
  detail TEXT,
  "fdaNumber" VARCHAR(100) NOT NULL,
  rating DECIMAL(3, 1) DEFAULT 5.0,
  "reviewsCount" INT DEFAULT 0,
  servings VARCHAR(100),
  size VARCHAR(100),
  "suitableFor" TEXT,
  "howToUse" TEXT,
  goal VARCHAR(100),
  badge VARCHAR(100),
  "inStock" INT DEFAULT 1,
  "imageUrl" VARCHAR(255),
  features JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. ตารางคำสั่งซื้อและที่อยู่จัดส่ง
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  "userId" INT,
  "customerName" VARCHAR(255) NOT NULL,
  "customerPhone" VARCHAR(50) NOT NULL,
  "customerAddress" TEXT NOT NULL,
  items JSONB NOT NULL,
  "totalAmount" DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);`
      : `-- FIT SUPPLEMENT SQL DDL (MySQL / TiDB Cloud — มาตรฐาน Melivecode DIT205)
-- Database: ${databaseName}

-- 1. ตารางผู้ใช้ทั้งหมด (รวมทุกบทบาท member / staff / admin + รหัสผ่าน bcrypt hash)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  username VARCHAR(100),
  phone VARCHAR(50),
  address TEXT,
  points INT DEFAULT 150,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางสินค้าอาหารเสริม (CRUD บทที่ 3)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  nameTH VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subCategory VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  originalPrice DECIMAL(10, 2),
  stock INT DEFAULT 50,
  detail TEXT,
  fdaNumber VARCHAR(100) NOT NULL,
  rating DECIMAL(3, 1) DEFAULT 5.0,
  reviewsCount INT DEFAULT 0,
  servings VARCHAR(100),
  size VARCHAR(100),
  suitableFor TEXT,
  howToUse TEXT,
  goal VARCHAR(100),
  badge VARCHAR(100),
  inStock INT DEFAULT 1,
  imageUrl VARCHAR(255),
  features JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ตารางคำสั่งซื้อและที่อยู่จัดส่ง
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  userId INT,
  customerName VARCHAR(255) NOT NULL,
  customerPhone VARCHAR(50) NOT NULL,
  customerAddress TEXT NOT NULL,
  items JSON NOT NULL,
  totalAmount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

    const pgHost = process.env.PGHOST || process.env.POSTGRES_HOST || 'neon.tech';

    return NextResponse.json({
      success: true,
      meta: {
        engine: isPg ? 'PostgreSQL 17 (Neon Cloud)' : 'MySQL 127.0.0.1:3306',
        charset: isPg ? 'UTF-8 · Serverless Pool (sin1)' : 'utf8mb4_unicode_ci',
        databaseName,
        host: isPg
          ? `${pgHost} (Neon TLS 1.2)`
          : `${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || '3306'} (MySQL Connection Pool - SSL: ${process.env.DB_SSL === 'true' ? 'TLS 1.2' : 'Local'})`,
        status: 'Connected & Live',
        sqlDumpPath: isPg ? 'Neon Cloud (fitsupp-db)' : 'data/fitsupp.sql',
        sqlDumpNote: isPg ? 'สำรองข้อมูลอัตโนมัติบน Cloud' : 'พร้อมนำเข้า phpMyAdmin',
        mysqlDataPath: isPg ? 'Vercel Marketplace · Neon' : 'C:\\xampp\\mysql\\data\\fitsupp',
        consoleLabel: isPg ? 'Neon Console' : 'phpMyAdmin',
        phpMyAdminUrl: isPg
          ? 'https://vercel.com/d/dashboard/integrations/neon/icfg_q18ybJ2M4LrGnoLsG9Jx0ERU/resources/store_NTi5ZUIwPJ6wsP2s'
          : 'http://localhost/phpmyadmin/index.php?route=/database/structure&db=fitsupp',
      },
      counts: {
        products: products.length,
        orders: orders.length,
        users: users.length,
        admins: admins.length,
      },
      tables: {
        products,
        orders,
        users,
        admins,
      },
      schemaDDL,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
