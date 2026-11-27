'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import BlurFade from '@/components/ui/BlurFade';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.removeItem('fitsupp_admin');
        localStorage.removeItem('fitsupp_user');
        window.location.href = '/admin';
      } else {
        setError(data.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-[85vh] bg-white relative overflow-hidden flex items-center justify-center py-14 px-5 sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-editorial-grid"
        style={{
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 30%, black 10%, transparent 72%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 30%, black 10%, transparent 72%)',
        }}
      />

      <BlurFade inView={false} className="w-full max-w-md relative z-10">
        <div className="border border-border bg-white p-8 sm:p-10 space-y-8">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold block">
              BACKOFFICE · RBAC ACCESS
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-textPrimary tracking-tight">
              ผู้ดูแลระบบ / เจ้าหน้าที่
            </h1>
            <p className="text-xs text-textSecondary">
              จัดการคลังสินค้า คำสั่งซื้อ สิทธิ์ผู้ใช้งาน และฐานข้อมูล MySQL
            </p>
          </div>

          {error && (
            <div className="p-3.5 border-l-2 border-red-600 bg-red-50/50 text-red-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary block">
                อีเมล หรือ ชื่อผู้ใช้
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@fitsupp.com"
                className="w-full py-2.5 bg-transparent border-b border-border focus:border-textPrimary text-sm text-textPrimary focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary block">
                รหัสผ่าน (PASSWORD)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ระบุรหัสผ่าน"
                className="w-full py-2.5 bg-transparent border-b border-border focus:border-textPrimary text-sm text-textPrimary focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-textPrimary hover:bg-primary text-white text-xs sm:text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบจัดการ'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-6 border-t border-border space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@fitsupp.com', 'admin1234')}
                className="py-2 px-3 border border-border hover:border-primary text-xs font-medium text-textPrimary hover:text-primary transition-colors cursor-pointer"
              >
                Admin (สิทธิ์เต็ม)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('staff@fitsupp.com', 'staff1234')}
                className="py-2 px-3 border border-border hover:border-primary text-xs font-medium text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
              >
                Staff (สินค้า)
              </button>
            </div>
            <div className="text-center">
              <Link
                href="/"
                className="text-xs text-textSecondary hover:text-textPrimary transition-colors"
              >
                &larr; กลับสู่หน้าหลัก
              </Link>
            </div>
          </div>
        </div>
      </BlurFade>
    </div>
  );
}
