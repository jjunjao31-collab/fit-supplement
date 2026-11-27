'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import BlurFade from '@/components/ui/BlurFade';

export default function RegisterPage() {
  const router = useRouter();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, phone, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess('สมัครสมาชิกเรียบร้อยแล้ว กำลังพาไปหน้าเข้าสู่ระบบ...');
        setTimeout(() => {
          router.push('/login');
        }, 900);
      } else {
        setError(data.message || 'ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่');
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
              CREATE ACCOUNT
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-textPrimary tracking-tight">
              สมัครสมาชิกใหม่
            </h1>
            <p className="text-xs text-textSecondary">
              สะสมแต้ม FIT Points 5% ทุกคำสั่งซื้อ และบันทึกที่อยู่จัดส่งอัตโนมัติ
            </p>
          </div>

          {error && (
            <div className="p-3.5 border-l-2 border-red-600 bg-red-50/50 text-red-700 text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 border-l-2 border-primary bg-secondary text-primary text-xs font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary block">
                ชื่อ-นามสกุล (FULL NAME)
              </label>
              <input
                type="text"
                required
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="เช่น สมหญิง รักสุขภาพ"
                className="w-full py-2.5 bg-transparent border-b border-border focus:border-textPrimary text-sm text-textPrimary focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary block">
                อีเมล (EMAIL)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full py-2.5 bg-transparent border-b border-border focus:border-textPrimary text-sm text-textPrimary focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary block">
                เบอร์โทรศัพท์ (ไม่บังคับ)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08x-xxx-xxxx"
                className="w-full py-2.5 bg-transparent border-b border-border focus:border-textPrimary text-sm text-textPrimary font-mono focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary block">
                รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษร"
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
              <span>{loading ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชีสมาชิก'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-6 border-t border-border text-center text-xs text-textSecondary">
            มีบัญชีสมาชิกอยู่แล้ว?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </BlurFade>
    </div>
  );
}
