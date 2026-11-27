import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { can } from '@/lib/rbac';

// หน้าที่ต้องมี permission เฉพาะ: path ที่ตรงกับ pattern ต้องมี permission ที่ระบุ (Melivecode DIT205 บทที่ 6)
const PAGE_RULES = [
  { pattern: /^\/admin\/users/, permission: 'user:manage' },
  { pattern: /^\/admin\/database/, permission: 'database:view' },
  { pattern: /^\/sql/, permission: 'database:view' },
  { pattern: /^\/admin(?!\/login)/, permission: 'admin:access' },
];

// ทำงานก่อนทุก request ที่ตรงกับ config.matcher (Next.js 16 proxy.ts)
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // เปิดให้เข้าหน้า /admin/login ได้โดยไม่ต้องมี token
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const user = await verifyToken(request.cookies.get('token')?.value);

  if (!user) {
    // ยังไม่ Login หรือ token หมดอายุ: ส่งไปหน้า login
    const loginPath = pathname.startsWith('/admin') || pathname.startsWith('/sql')
      ? '/admin/login'
      : '/login';
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  // Login แล้วแต่ role ไม่มีสิทธิ์เปิดหน้านี้: ส่งกลับไปหน้าโปรไฟล์
  const rule = PAGE_RULES.find((r) => r.pattern.test(pathname));
  if (rule && !can(user.role, rule.permission)) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

// ให้ proxy ทำงานเฉพาะพื้นที่สมาชิกและหลังบ้าน
export const config = {
  matcher: ['/profile/:path*', '/admin/:path*', '/sql/:path*'],
};
