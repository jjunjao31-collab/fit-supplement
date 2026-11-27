import { NextResponse } from 'next/server';

// POST /api/auth/logout — ลบ cookie token (Melivecode DIT205 บทที่ 4)
export async function POST() {
  const response = NextResponse.json({ status: 'ok', success: true, message: 'ออกจากระบบสำเร็จ' });
  response.cookies.delete('token');
  return response;
}
