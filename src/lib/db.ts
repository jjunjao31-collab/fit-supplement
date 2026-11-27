import mysql, { type Pool as MysqlPool, type RowDataPacket, type ResultSetHeader } from 'mysql2/promise';
import { Pool as PgPool, type PoolClient as PgPoolClient } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import bcrypt from 'bcryptjs';
import { products as defaultProducts } from '@/data/products';

export type SqlParam = string | number | boolean | null | Date;

export interface DbExecResult {
  insertId: number;
  affectedRows: number;
}

export interface UnifiedConnection {
  beginTransaction: () => Promise<void>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
  release: () => void;
  query: <T = RowDataPacket[]>(sql: string, params?: SqlParam[]) => Promise<[T, unknown]>;
}

export interface UnifiedPool {
  query: <T = RowDataPacket[]>(sql: string, params?: SqlParam[]) => Promise<[T, unknown]>;
  getConnection: () => Promise<UnifiedConnection>;
}

const PG_CAMEL_COLUMNS = new Set([
  'nameTH',
  'subCategory',
  'originalPrice',
  'fdaNumber',
  'reviewsCount',
  'suitableFor',
  'howToUse',
  'inStock',
  'imageUrl',
  'userId',
  'customerName',
  'customerPhone',
  'customerAddress',
  'totalAmount',
  'createdAt',
]);

const PG_CAMEL_REGEX = new RegExp(`\\b(${Array.from(PG_CAMEL_COLUMNS).join('|')})\\b`, 'g');

export function isPostgresMode(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

export function getDatabaseEngineLabel(): string {
  return isPostgresMode() ? 'Neon Cloud PostgreSQL' : 'MySQL';
}

export function toPgSql(sql: string): string {
  let paramIndex = 0;
  let result = '';
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];

    // Preserve single-quoted string literals verbatim
    if (ch === "'") {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") {
          j += 2;
          continue;
        }
        if (sql[j] === "'") {
          j += 1;
          break;
        }
        j += 1;
      }
      result += sql.slice(i, j);
      i = j;
      continue;
    }

    // Preserve already double-quoted identifiers verbatim
    if (ch === '"') {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === '"') {
          j += 1;
          break;
        }
        j += 1;
      }
      result += sql.slice(i, j);
      i = j;
      continue;
    }

    // Collect non-quoted SQL chunk until next quote
    let j = i;
    while (j < sql.length && sql[j] !== "'" && sql[j] !== '"') {
      j += 1;
    }
    const chunk = sql.slice(i, j);
    const converted = chunk
      .replace(/\?/g, () => `$${++paramIndex}`)
      .replace(PG_CAMEL_REGEX, '"$1"');
    result += converted;
    i = j;
  }

  const trimmed = result.trim();
  if (/^INSERT\s+INTO\s+users\b/i.test(trimmed) && !/\bRETURNING\b/i.test(trimmed)) {
    return `${trimmed} RETURNING id`;
  }

  return result;
}

function isSelectLike(sql: string): boolean {
  return /^\s*(SELECT|WITH|SHOW|EXPLAIN)\b/i.test(sql);
}

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: MysqlPool | undefined;
  // eslint-disable-next-line no-var
  var __pgPool: PgPool | undefined;
}

function getPgPool(): PgPool {
  if (!global.__pgPool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }
    const pgPool = new PgPool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 20000,
      connectionTimeoutMillis: 10000,
    });
    try {
      attachDatabasePool(pgPool);
    } catch {
      // Safe fallback when running outside Vercel Fluid Compute
    }
    global.__pgPool = pgPool;
  }
  return global.__pgPool;
}

function getMysqlPool(): MysqlPool {
  if (!global.__mysqlPool) {
    const dbConfig: mysql.PoolOptions = {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'fitsupp',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl:
        process.env.DB_SSL === 'true'
          ? { minVersion: 'TLSv1.2', rejectUnauthorized: true }
          : undefined,
    };
    global.__mysqlPool = mysql.createPool(dbConfig);
  }
  return global.__mysqlPool;
}

async function execPgQuery<T>(
  runner: PgPool | PgPoolClient,
  sql: string,
  params: SqlParam[] = []
): Promise<[T, unknown]> {
  const pgSql = toPgSql(sql);
  const res = await runner.query(pgSql, params);
  if (isSelectLike(sql)) {
    return [res.rows as unknown as T, res.fields];
  }
  const firstRow = res.rows[0] as { id?: number } | undefined;
  const header: DbExecResult = {
    insertId: Number(firstRow?.id ?? 0),
    affectedRows: res.rowCount ?? 0,
  };
  return [header as unknown as T, res.fields];
}

export const pool: UnifiedPool = {
  async query<T = RowDataPacket[]>(sql: string, params: SqlParam[] = []): Promise<[T, unknown]> {
    if (isPostgresMode()) {
      return execPgQuery<T>(getPgPool(), sql, params);
    }
    const [rows, fields] = await getMysqlPool().query(sql, params);
    return [rows as unknown as T, fields];
  },

  async getConnection(): Promise<UnifiedConnection> {
    if (isPostgresMode()) {
      const client = await getPgPool().connect();
      return {
        beginTransaction: async () => {
          await client.query('BEGIN');
        },
        commit: async () => {
          await client.query('COMMIT');
        },
        rollback: async () => {
          await client.query('ROLLBACK');
        },
        release: () => {
          client.release();
        },
        query: <T = RowDataPacket[]>(sql: string, params: SqlParam[] = []) =>
          execPgQuery<T>(client, sql, params),
      };
    }

    const conn = await getMysqlPool().getConnection();
    return {
      beginTransaction: () => conn.beginTransaction(),
      commit: () => conn.commit(),
      rollback: () => conn.rollback(),
      release: () => conn.release(),
      query: async <T = RowDataPacket[]>(sql: string, params: SqlParam[] = []) => {
        const [rows, fields] = await conn.query(sql, params);
        return [rows as unknown as T, fields];
      },
    };
  },
};

let isInitialized = false;
let initPromise: Promise<void> | null = null;

async function createTablesPostgres(pgPool: PgPool) {
  await pgPool.query(`
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
  `);

  await pgPool.query(`
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
  `);

  await pgPool.query(`
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
    );
  `);
}

async function createTablesMysql(mysqlPool: MysqlPool) {
  await mysqlPool.query(`
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await mysqlPool.query(`
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await mysqlPool.query(`
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

// สร้างตารางอัตโนมัติหากยังไม่มี (รองรับทั้ง Neon Cloud PostgreSQL และ MySQL / TiDB Cloud)
export async function ensureDatabaseTables(): Promise<void> {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      if (isPostgresMode()) {
        await createTablesPostgres(getPgPool());
      } else {
        await createTablesMysql(getMysqlPool());
      }

      // Seed บัญชีเริ่มต้น 3 บทบาท (member, staff, admin) ด้วย bcrypt hash หากยังไม่มี
      const [userRows] = await pool.query<Array<RowDataPacket & { count: number | string }>>(
        'SELECT COUNT(*) as count FROM users'
      );
      if (Number(userRows[0]?.count ?? 0) === 0) {
        const [userHash, staffHash, adminHash] = await Promise.all([
          bcrypt.hash('user1234', 10),
          bcrypt.hash('staff1234', 10),
          bcrypt.hash('admin1234', 10),
        ]);

        const seedUsers = [
          [
            'user',
            'somchai@example.com',
            userHash,
            'คุณสมชาย ใจดี (สมาชิกทั่วไป)',
            'member',
            '089-123-4567',
            '999/123 อาคาร สยามพารากอน ชั้น 4 ถนนพระราม 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330',
            250,
          ],
          [
            'staff',
            'staff@fitsupp.com',
            staffHash,
            'คุณสมศรี พนักงานคลังสินค้า (Staff)',
            'staff',
            '081-234-5678',
            'คลังสินค้า FIT SUPPLEMENT กรุงเทพฯ',
            500,
          ],
          [
            'admin',
            'admin@fitsupp.com',
            adminHash,
            'ผู้ดูแลระบบ FIT SUPPLEMENT (Admin)',
            'admin',
            '02-123-4567',
            'สำนักงานใหญ่ FIT SUPPLEMENT กรุงเทพฯ',
            999,
          ],
        ];

        for (const u of seedUsers) {
          await pool.query(
            `INSERT INTO users (username, email, password, fullname, role, phone, address, points)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            u
          );
        }
      }

      // Seed สินค้าเริ่มต้นหากตาราง products ว่าง
      const [prodRows] = await pool.query<Array<RowDataPacket & { count: number | string }>>(
        'SELECT COUNT(*) as count FROM products'
      );
      if (Number(prodRows[0]?.count ?? 0) === 0) {
        for (const p of defaultProducts) {
          await pool.query(
            `INSERT INTO products (
              id, name, nameTH, brand, category, subCategory, price, originalPrice,
              stock, detail, fdaNumber, rating, reviewsCount, servings, size, suitableFor, howToUse,
              goal, badge, inStock, imageUrl, features
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              p.id,
              p.name,
              p.nameTH,
              p.brand,
              p.category,
              p.subCategory || '',
              p.price,
              p.originalPrice || p.price,
              p.inStock ? 50 : 0,
              p.suitableFor || '',
              p.fdaNumber,
              p.rating,
              p.reviewsCount,
              p.servings,
              p.size,
              p.suitableFor,
              p.howToUse,
              p.goal,
              p.badge,
              p.inStock ? 1 : 0,
              p.imageUrl,
              JSON.stringify(p.features || []),
            ]
          );
        }
      }

      isInitialized = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[Database Initialization Notice]:', msg);
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

export async function dbAll<T = Record<string, unknown>>(sql: string, params: SqlParam[] = []): Promise<T[]> {
  await ensureDatabaseTables();
  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return rows as unknown as T[];
}

export async function dbGet<T = Record<string, unknown>>(sql: string, params: SqlParam[] = []): Promise<T | null> {
  await ensureDatabaseTables();
  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0] as unknown as T;
  }
  return null;
}

export async function dbRun(
  sql: string,
  params: SqlParam[] = []
): Promise<{ id?: number | string; changes: number }> {
  await ensureDatabaseTables();
  const [result] = await pool.query<ResultSetHeader>(sql, params);
  return {
    id: result?.insertId,
    changes: result?.affectedRows || 0,
  };
}

export function getDatabase() {
  return pool;
}
