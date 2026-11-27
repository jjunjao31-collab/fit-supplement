import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { can } from '@/lib/rbac';

// jose ต้องการ secret ในรูปแบบ bytes ไม่ใช่ string ธรรมดา (Melivecode DIT205 บทที่ 4)
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'melivecode-dit205-fitsupp-secret-jwt-key-2026'
);

export interface TokenPayload {
  id: number;
  email: string;
  username?: string;
  fullname: string;
  role: string;
  [key: string]: unknown;
}

// สร้าง JWT token ที่เซ็นแล้วด้วย HS256 (Melivecode DIT205 บทที่ 4 & 6)
export async function signToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

// คืน payload หาก token ถูกต้อง หากไม่ถูกต้องหรือหมดอายุคืน null
export async function verifyToken(token?: string | null): Promise<TokenPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// อ่าน token จาก Cookie (HttpOnly) หรือ Authorization Bearer Header
export function getTokenFromRequest(request: Request | NextRequest): string | undefined {
  if ('cookies' in request && typeof request.cookies?.get === 'function') {
    const cookieToken = request.cookies.get('token')?.value;
    if (cookieToken) return cookieToken;
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return undefined;
}

// ตรวจว่าผู้ใช้ Login แล้วหรือไม่ (คืน { user } หรือ { error: 401 })
export async function requireAuth(request: Request | NextRequest) {
  const user = await verifyToken(getTokenFromRequest(request));
  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { status: 'error', success: false, message: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }
  return { user, error: null };
}

// ใช้ใน API route: ตรวจ token แล้วตรวจ permission (Melivecode DIT205 บทที่ 6)
// ผ่าน: คืน { user }  ไม่ผ่าน: คืน { error } ที่เป็น response 401 หรือ 403
export async function requirePermission(request: Request | NextRequest, permission: string) {
  const user = await verifyToken(getTokenFromRequest(request));

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { status: 'error', success: false, message: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  if (!can(user.role, permission)) {
    return {
      user: null,
      error: NextResponse.json(
        { status: 'error', success: false, message: 'Forbidden' },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}

// แฮชรหัสผ่านด้วย bcryptjs (Melivecode DIT205 บทที่ 4: ห้ามเก็บรหัสผ่านจริง)
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// ตรวจรหัสผ่านกับ bcrypt hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  return await bcrypt.compare(password, hash);
}
