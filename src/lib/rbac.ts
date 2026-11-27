// RBAC Permission Map (ตามมาตรฐาน Melivecode DIT205 บทที่ 6)
// รวมสิทธิ์ของทุก role ไว้ที่ไฟล์นี้ที่เดียว ตรวจสิทธิ์ด้วย can(role, permission)
// ไฟล์นี้ไม่มีข้อมูลลับและไม่เชื่อมฐานข้อมูล จึงใช้ได้ทั้งฝั่ง Server (API, proxy.ts) และ Client (Role-Based UI)

export const PERMISSIONS = {
  member: [
    'product:read',
    'profile:read',
    'profile:update',
    'order:create',
    'order:read',
  ],
  staff: [
    'product:read',
    'product:create',
    'product:update',
    'profile:read',
    'profile:update',
    'order:create',
    'order:read',
    'order:manage',
    'admin:access',
  ],
  admin: [
    'product:read',
    'product:create',
    'product:update',
    'product:delete',
    'profile:read',
    'profile:update',
    'order:create',
    'order:read',
    'order:manage',
    'user:manage',
    'admin:access',
    'database:view',
  ],
} as const;

export type Role = keyof typeof PERMISSIONS;

export const ROLE_LABELS: Record<Role, string> = {
  member: 'สมาชิกทั่วไป (Member)',
  staff: 'เจ้าหน้าที่ (Staff)',
  admin: 'ผู้ดูแลระบบ (Admin)',
};

// ตรวจว่า role นี้มี permission ที่ระบุหรือไม่
export function can(role: string | null | undefined, permission: string): boolean {
  if (!role) return false;
  const normalized = role === 'superadmin' ? 'admin' : role;
  return (PERMISSIONS as Record<string, readonly string[]>)[normalized]?.includes(permission) ?? false;
}
