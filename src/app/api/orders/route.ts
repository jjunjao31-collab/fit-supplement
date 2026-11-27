import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { pool, dbAll, ensureDatabaseTables } from '@/lib/db';
import { verifyToken, getTokenFromRequest, requireAuth } from '@/lib/auth';
import { can } from '@/lib/rbac';

interface IncomingOrderItem {
  id: string;
  name?: string;
  brand?: string;
  size?: string;
  quantity: number;
}

interface VerifiedOrderItem {
  id: string;
  name: string;
  brand: string;
  size: string;
  price: number;
  quantity: number;
}

interface ProductDbRow extends RowDataPacket {
  id: string;
  name: string;
  brand: string;
  size: string | null;
  price: string | number;
  stock: number;
  inStock: number;
}

interface OrderDbRow extends RowDataPacket {
  id: string;
  userId: number | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: string | VerifiedOrderItem[];
  totalAmount: string | number;
  status: string;
  createdAt: string;
}

// GET /api/orders — ดึงประวัติคำสั่งซื้อ (สมาชิกเห็นเฉพาะของตัวเอง, staff/admin เห็นทั้งหมด)
export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error || !user) return error;

  try {
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');

    let sql = 'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC';
    let params: Array<number | string> = [user.id];

    if (can(user.role, 'order:manage')) {
      if (requestedUserId) {
        sql = 'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC';
        params = [Number(requestedUserId)];
      } else {
        sql = 'SELECT * FROM orders ORDER BY createdAt DESC';
        params = [];
      }
    }

    const rows = await dbAll<OrderDbRow>(sql, params);
    const orders = rows.map((o) => ({
      ...o,
      totalAmount: Number(o.totalAmount || 0),
      items: typeof o.items === 'string' ? JSON.parse(o.items || '[]') : o.items || [],
    }));

    return NextResponse.json({ success: true, orders });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

// POST /api/orders — คำนวณราคาจาก MySQL ฝั่งเซิร์ฟเวอร์ + ตรวจสอบและตัดสต็อกใน Transaction จริง
export async function POST(request: NextRequest) {
  await ensureDatabaseTables();
  const conn = await pool.getConnection();

  try {
    const authUser = await verifyToken(getTokenFromRequest(request));
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerAddress,
      items,
      paymentMethod = 'promptpay',
      notes = '',
    } = body as {
      customerName?: string;
      customerPhone?: string;
      customerAddress?: string;
      items?: IncomingOrderItem[];
      paymentMethod?: string;
      notes?: string;
    };

    if (!customerName?.trim() || !customerPhone?.trim() || !customerAddress?.trim()) {
      conn.release();
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณากรอกข้อมูลชื่อ เบอร์โทรศัพท์ และที่อยู่จัดส่งให้ครบถ้วน',
        },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      conn.release();
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบรายการสินค้าในคำสั่งซื้อ',
        },
        { status: 400 }
      );
    }

    await conn.beginTransaction();

    const verifiedItems: VerifiedOrderItem[] = [];
    let serverTotalAmount = 0;

    for (const reqItem of items) {
      const qty = Math.floor(Number(reqItem.quantity));
      if (!reqItem.id || isNaN(qty) || qty < 1) {
        await conn.rollback();
        conn.release();
        return NextResponse.json(
          { success: false, message: 'จำนวนสินค้าหรือรหัสสินค้าไม่ถูกต้อง' },
          { status: 400 }
        );
      }

      // ล็อกแถวสินค้าเพื่อตรวจสอบราคาจริงและสต็อกล่าสุดจาก MySQL (ป้องกันปลอมราคาจากฝั่ง Client)
      const [prodRows] = await conn.query<ProductDbRow[]>(
        'SELECT id, name, brand, size, price, stock, inStock FROM products WHERE id = ? FOR UPDATE',
        [reqItem.id]
      );

      if (prodRows.length === 0) {
        await conn.rollback();
        conn.release();
        return NextResponse.json(
          { success: false, message: `ไม่พบสินค้า "${reqItem.name || reqItem.id}" ในฐานข้อมูล` },
          { status: 404 }
        );
      }

      const dbProd = prodRows[0];
      const currentStock = Number(dbProd.stock ?? 0);
      if (!dbProd.inStock || currentStock < qty) {
        await conn.rollback();
        conn.release();
        return NextResponse.json(
          {
            success: false,
            message: `สินค้า "${dbProd.name}" คงเหลือไม่เพียงพอ (เหลือ ${currentStock} ชิ้น)`,
          },
          { status: 400 }
        );
      }

      const unitPrice = Number(dbProd.price);
      serverTotalAmount += unitPrice * qty;

      // ตัดสต็อกสินค้าจริงใน MySQL
      const remainingStock = currentStock - qty;
      await conn.query(
        'UPDATE products SET stock = ?, inStock = ? WHERE id = ?',
        [remainingStock, remainingStock > 0 ? 1 : 0, dbProd.id]
      );

      verifiedItems.push({
        id: dbProd.id,
        name: dbProd.name,
        brand: dbProd.brand,
        size: dbProd.size || reqItem.size || '',
        price: unitPrice,
        quantity: qty,
      });
    }

    const userId = authUser ? Number(authUser.id) : null;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const orderId = `ORD-2026-${Date.now().toString().slice(-4)}${randomSuffix}`;
    const orderStatus = paymentMethod === 'cod' ? 'pending' : 'paid';

    await conn.query(
      `INSERT INTO orders (id, userId, customerName, customerPhone, customerAddress, items, totalAmount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        userId,
        customerName.trim(),
        customerPhone.trim(),
        customerAddress.trim(),
        JSON.stringify(verifiedItems),
        serverTotalAmount,
        orderStatus,
      ]
    );

    let updatedPoints = 0;
    if (userId) {
      const pointsEarned = Math.max(10, Math.floor(serverTotalAmount * 0.05));
      await conn.query('UPDATE users SET points = points + ? WHERE id = ?', [pointsEarned, userId]);
      const [uRows] = await conn.query<RowDataPacket[]>('SELECT points FROM users WHERE id = ?', [userId]);
      if (uRows.length > 0) {
        updatedPoints = Number(uRows[0].points || 0);
      }
    }

    await conn.commit();
    conn.release();

    return NextResponse.json(
      {
        success: true,
        orderId,
        message: 'บันทึกคำสั่งซื้อและตัดสต็อกในฐานข้อมูล SQL เรียบร้อยแล้ว',
        order: {
          id: orderId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: customerAddress.trim(),
          items: verifiedItems,
          totalAmount: serverTotalAmount,
          paymentMethod,
          notes,
          status: orderStatus,
        },
        updatedPoints,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    try {
      await conn.rollback();
    } catch {
      // ignore rollback error
    }
    conn.release();
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
