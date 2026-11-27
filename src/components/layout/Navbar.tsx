'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Menu,
  X,
  ShieldCheck,
  ShoppingBag,
  User,
  ArrowUpRight,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { can } from '@/lib/rbac';

const NAV_LINKS = [
  { label: 'ร้านค้า', href: '/store' },
  { label: 'สารานุกรม', href: '/supplements' },
  { label: 'เป้าหมาย', href: '/goals' },
  { label: 'เปรียบเทียบ', href: '/compare' },
  { label: 'บทความ', href: '/articles' },
  { label: 'ความปลอดภัย', href: '/safety' },
];

interface AuthUser {
  id: number;
  email: string;
  username?: string | null;
  fullname?: string;
  fullName?: string;
  role: string;
}

/**
 * 21st.dev Minimal Editorial Navbar
 * Pure hairline borders, pure wordmark, sliding underline indicator, zero box clutter
 */
export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<AuthUser | null>(null);
  const { totalCount, openCart } = useCart();

  // โหลดสถานะผู้ใช้จาก GET /api/auth/me (HttpOnly Cookie JWT)
  useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        const u = data?.user || data;
        if (u && u.id) {
          if (can(u.role, 'admin:access')) {
            setCurrentAdmin(u);
            setCurrentUser(null);
          } else {
            setCurrentUser(u);
            setCurrentAdmin(null);
          }
        } else {
          setCurrentAdmin(null);
          setCurrentUser(null);
        }
      })
      .catch(() => {
        if (!active) return;
        setCurrentAdmin(null);
        setCurrentUser(null);
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  const handleLogout = async (redirectPath: string) => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('fitsupp_admin');
    localStorage.removeItem('fitsupp_user');
    setCurrentAdmin(null);
    setCurrentUser(null);
    setMobileOpen(false);
    window.location.href = redirectPath;
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/88 backdrop-blur-xl border-b border-border/90">
        {/* Subtle Admin / Staff Bar when logged in as staff/admin */}
        {currentAdmin && (
          <div className="bg-secondary border-b border-border text-textPrimary text-[11px] px-4 sm:px-8 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="truncate text-textSecondary">
                Backoffice ({currentAdmin.role}):{' '}
                <strong className="text-textPrimary">
                  {currentAdmin.fullname || currentAdmin.fullName || currentAdmin.username}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Link
                href="/admin"
                className={cn(
                  'hover:text-primary transition-colors',
                  pathname === '/admin' ? 'text-primary font-semibold' : 'text-textSecondary'
                )}
              >
                แดชบอร์ด
              </Link>
              {can(currentAdmin.role, 'user:manage') && (
                <Link
                  href="/admin/users"
                  className={cn(
                    'hover:text-primary transition-colors',
                    pathname === '/admin/users' ? 'text-primary font-semibold' : 'text-textSecondary'
                  )}
                >
                  จัดการผู้ใช้
                </Link>
              )}
              {can(currentAdmin.role, 'database:view') && (
                <Link
                  href="/sql"
                  className={cn(
                    'hover:text-primary transition-colors',
                    pathname === '/sql' ? 'text-primary font-semibold' : 'text-textSecondary'
                  )}
                >
                  ฐานข้อมูล SQL
                </Link>
              )}
              <button
                type="button"
                onClick={() => handleLogout('/admin/login')}
                className="text-textSecondary hover:text-red-600 transition-colors cursor-pointer"
              >
                ออก
              </button>
            </div>
          </div>
        )}

        {/* Main Single-Row Architectural Bar */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Pure Minimalist Wordmark */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none shrink-0"
            >
              <span className="text-[15px] font-semibold tracking-[0.2em] text-textPrimary uppercase">
                FIT<span className="text-primary font-bold">·</span>SUPPLEMENT
              </span>
            </Link>

            {/* Center Minimalist Nav with Sliding Hairline Underline */}
            <nav
              className="hidden lg:flex items-center gap-6"
              onMouseLeave={() => setHoveredHref(null)}
            >
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                const showUnderline = hoveredHref ? hoveredHref === link.href : active;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={() => setHoveredHref(link.href)}
                    className={cn(
                      'relative py-5 text-[13px] transition-colors duration-200 whitespace-nowrap',
                      active
                        ? 'text-textPrimary font-medium'
                        : 'text-textSecondary hover:text-textPrimary font-normal'
                    )}
                  >
                    {link.label}
                    {showUnderline && (
                      <motion.span
                        layoutId="minimal-nav-underline"
                        transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                        className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-primary"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Minimal Actions */}
            <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
              {/* 21st.dev Minimal Command Palette Trigger (Ctrl+K) */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
                aria-label="เปิดค้นหาด่วน (Ctrl+K)"
                className="inline-flex items-center gap-2 px-2.5 py-1.5 border border-border bg-secondary/60 hover:bg-white hover:border-textPrimary text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-xs">ค้นหา</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-border text-textSecondary">
                  Ctrl K
                </kbd>
              </button>

              {/* Calculator Minimal Link */}
              <Link
                href="/calculator/protein"
                className={cn(
                  'hidden md:inline-flex items-center gap-1 text-[13px] transition-colors whitespace-nowrap',
                  isActive('/calculator')
                    ? 'text-primary font-medium'
                    : 'text-textSecondary hover:text-primary'
                )}
              >
                <span>คำนวณโปรตีน</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              <span className="hidden md:block w-px h-4 bg-border" />

              {/* Account */}
              {currentAdmin ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-[13px] text-primary font-medium hover:opacity-80 transition-opacity"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">แอดมิน</span>
                </Link>
              ) : currentUser ? (
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 text-[13px] text-textPrimary hover:text-primary transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-secondary border border-border text-[11px] font-semibold flex items-center justify-center text-textPrimary">
                    {(currentUser.fullname || currentUser.fullName || 'U')[0]}
                  </span>
                  <span className="hidden sm:inline font-medium">โปรไฟล์</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-[13px] text-textSecondary hover:text-textPrimary transition-colors whitespace-nowrap"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">เข้าสู่ระบบ</span>
                </Link>
              )}

              {/* Minimal Cart Trigger */}
              <button
                type="button"
                onClick={openCart}
                aria-label="เปิดตะกร้าสินค้า"
                className="relative inline-flex items-center gap-1.5 text-[13px] text-textPrimary hover:text-primary transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
                <span className="font-mono text-xs font-medium">
                  ({totalCount})
                </span>
              </button>

              {/* Mobile Menu Trigger */}
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
                className="lg:hidden p-1.5 text-textPrimary hover:text-primary transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Full-Height Minimal Sheet */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white border-l border-border p-7 flex flex-col justify-between transform transition-transform duration-300 ease-out lg:hidden overflow-y-auto',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-textPrimary">
              FIT<span className="text-primary">·</span>SUPPLEMENT
            </span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1 text-textSecondary hover:text-textPrimary"
              aria-label="ปิดเมนู"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col divide-y divide-border/70">
            {[
              { href: '/', label: 'หน้าแรก' },
              { href: '/store', label: 'ร้านค้าทางการ' },
              { href: '/supplements', label: 'สารานุกรมอาหารเสริม' },
              { href: '/goals', label: 'ค้นหาตามเป้าหมาย' },
              { href: '/calculator/protein', label: 'คำนวณโปรตีนต่อวัน' },
              { href: '/compare', label: 'เปรียบเทียบอาหารเสริม' },
              { href: '/articles', label: 'บทความวิชาการ' },
              { href: '/safety', label: 'ความปลอดภัย & อย.' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'py-3.5 text-sm transition-colors flex items-center justify-between',
                  isActive(item.href)
                    ? 'text-primary font-semibold'
                    : 'text-textPrimary hover:text-primary'
                )}
              >
                <span>{item.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-textSecondary" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="pt-6 border-t border-border space-y-3">
          {currentAdmin ? (
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex-1 py-2.5 text-center rounded-full bg-textPrimary text-white text-xs font-medium"
              >
                แดชบอร์ดหลังบ้าน
              </Link>
              <button
                type="button"
                onClick={() => handleLogout('/admin/login')}
                className="px-4 py-2.5 rounded-full border border-border text-xs text-textSecondary"
              >
                ออก
              </button>
            </div>
          ) : currentUser ? (
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="block w-full py-2.5 text-center rounded-full border border-border text-xs font-medium text-textPrimary"
            >
              โปรไฟล์ของฉัน
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block w-full py-2.5 text-center rounded-full bg-textPrimary text-white text-xs font-medium"
            >
              เข้าสู่ระบบ / สมัครสมาชิก
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
