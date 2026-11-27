'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, ArrowUpRight } from 'lucide-react';
import BlurFade from '@/components/ui/BlurFade';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identifier,
          username: identifier,
          password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.removeItem('fitsupp_user');
        localStorage.removeItem('fitsupp_admin');
        window.location.href = data.redirectTo || '/profile';
      } else {
        setError(data.message || 'อีเมล/ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
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
              MEMBER ACCESS
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-textPrimary tracking-tight">
              เข้าสู่ระบบสมาชิก
            </h1>
            <p className="text-xs text-textSecondary">
              ดูประวัติคำสั่งซื้อ ที่อยู่จัดส่ง และคะแนนสะสม FIT Points ของคุณ
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
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="somchai@example.com"
                className="w-full py-2.5 bg-transparent border-b border-border focus:border-textPrimary text-sm text-textPrimary focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary block">
                รหัสผ่าน (PASSWORD)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full py-2.5 pr-9 bg-transparent border-b border-border focus:border-textPrimary text-sm text-textPrimary focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-textSecondary hover:text-textPrimary cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-textPrimary hover:bg-primary text-white text-xs sm:text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-textSecondary">
              ยังไม่มีบัญชี?{' '}
              <Link href="/register" className="text-primary font-medium hover:underline">
                สมัครสมาชิก
              </Link>
            </span>
            <Link
              href="/store"
              className="inline-flex items-center gap-1 text-textSecondary hover:text-textPrimary transition-colors"
            >
              <span>ไปหน้าร้านค้า</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </BlurFade>
    </div>
  );
}
