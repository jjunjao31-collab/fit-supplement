'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LogOut,
  ArrowUpRight,
  Edit3,
  X,
  Save,
} from 'lucide-react';
import { can, ROLE_LABELS, type Role } from '@/lib/rbac';
import SlidingNumber from '@/components/ui/SlidingNumber';

interface MemberUser {
  id: number;
  email: string;
  username?: string | null;
  fullname?: string;
  fullName?: string;
  role: string;
  phone?: string | null;
  address?: string | null;
  points?: number | null;
}

interface OrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
}

interface MemberOrder {
  id: string;
  userId?: number | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function MemberProfilePage() {
  const [user, setUser] = useState<MemberUser | null>(null);
  const [orders, setOrders] = useState<MemberOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const u = data?.user || data;
        if (!u || !u.id) {
          window.location.href = '/login';
          return;
        }
        setUser(u);
        setEditFullName(u.fullname || u.fullName || '');
        setEditPhone(u.phone || '');
        setEditAddress(u.address || '');
        loadUserOrders(u.id);
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);

  const loadUserOrders = async (userId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaveErrorMsg('');
    if (!editAddress.trim()) {
      setSaveErrorMsg('กรุณากรอกที่อยู่จัดส่งให้ครบถ้วน');
      return;
    }

    setSavingAddress(true);
    setSaveSuccessMsg('');

    try {
      const res = await fetch('/api/user/address', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          username: user.username,
          fullName: editFullName,
          phone: editPhone,
          address: editAddress,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setSaveSuccessMsg('อัปเดตที่อยู่จัดส่งในฐานข้อมูล SQL สำเร็จแล้ว');
        setTimeout(() => {
          setIsEditingAddress(false);
          setSaveSuccessMsg('');
        }, 1200);
      } else {
        setSaveErrorMsg(data.message || 'เกิดข้อผิดพลาดในการบันทึกที่อยู่');
      }
    } catch {
      setSaveErrorMsg('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ฐานข้อมูลได้');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('fitsupp_user');
    localStorage.removeItem('fitsupp_admin');
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] bg-white flex items-center justify-center text-xs font-mono text-textSecondary">
        LOADING MEMBER PROFILE...
      </div>
    );
  }

  const displayName = user.fullname || user.fullName || 'สมาชิก';

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <section className="border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 pb-10 sm:pt-14 sm:pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-[0.22em] text-textSecondary">
                <Link href="/" className="hover:text-primary transition-colors">
                  HOME
                </Link>
                <span>/</span>
                <span className="text-primary font-semibold">
                  ACCOUNT · {ROLE_LABELS[user.role as Role] || user.role}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-textPrimary tracking-tight">
                {displayName}
              </h1>
              <p className="text-xs font-mono text-textSecondary">{user.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {can(user.role, 'admin:access') && (
                <Link
                  href="/admin"
                  className="px-4 py-2.5 border border-primary/40 text-primary hover:bg-primary hover:text-white text-xs font-medium transition-colors"
                >
                  แดชบอร์ดหลังบ้าน
                </Link>
              )}
              {can(user.role, 'user:manage') && (
                <Link
                  href="/admin/users"
                  className="px-4 py-2.5 border border-border text-textPrimary hover:border-textPrimary text-xs font-medium transition-colors"
                >
                  จัดการผู้ใช้
                </Link>
              )}
              <Link
                href="/store"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-textPrimary text-white hover:bg-primary text-xs font-medium transition-colors"
              >
                <span>สั่งซื้อสินค้าเพิ่ม</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-border text-textSecondary hover:text-red-600 hover:border-red-300 text-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออก</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-12 space-y-14">
        {/* 3-Column Architectural Account Metrics */}
        <section className="border border-border bg-white grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="p-6 sm:p-7 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold block">
              FIT POINTS BALANCE
            </span>
            <div className="flex items-baseline gap-2">
              <SlidingNumber
                value={Number(user.points || 0)}
                className="text-4xl font-light font-mono text-textPrimary"
              />
              <span className="text-xs text-textSecondary">แต้ม</span>
            </div>
            <p className="text-[11px] text-textSecondary">
              รับอัตโนมัติ 5% จากทุกยอดสั่งซื้อ
            </p>
          </div>

          <div className="p-6 sm:p-7 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-textSecondary font-semibold block">
              CONTACT DETAILS
            </span>
            <div className="text-sm font-medium text-textPrimary truncate">{user.email}</div>
            <div className="text-xs font-mono text-textSecondary">
              {user.phone || 'ยังไม่ระบุเบอร์โทรศัพท์'}
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-textSecondary font-semibold">
                SHIPPING ADDRESS
              </span>
              <button
                type="button"
                onClick={() => setIsEditingAddress(true)}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>แก้ไข</span>
              </button>
            </div>
            <p className="text-xs text-textSecondary leading-relaxed line-clamp-3">
              {user.address || 'ยังไม่ได้ระบุที่อยู่จัดส่ง'}
            </p>
          </div>
        </section>

        {/* Order History Ledger */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-border pb-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold block">
                ORDER HISTORY
              </span>
              <h2 className="text-xl font-semibold text-textPrimary">ประวัติคำสั่งซื้อของฉัน</h2>
            </div>
            <span className="text-[11px] font-mono text-textSecondary">
              {orders.length} ORDERS
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-textSecondary">
              LOADING ORDERS...
            </div>
          ) : orders.length > 0 ? (
            <div className="border-y border-border divide-y divide-border bg-white">
              {orders.map((o) => (
                <div key={o.id} className="py-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="font-semibold text-primary">{o.id}</span>
                      <span className="text-textSecondary">{o.createdAt}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 border border-border bg-secondary text-textPrimary">
                      {o.status === 'completed'
                        ? 'จัดส่งสำเร็จ'
                        : o.status === 'shipping'
                        ? 'กำลังจัดส่ง'
                        : 'ชำระเงินแล้ว'}
                    </span>
                  </div>

                  <div className="text-xs text-textSecondary">
                    <strong className="text-textPrimary font-medium">จัดส่งถึง: </strong>
                    {o.customerName} ({o.customerPhone}) — {o.customerAddress}
                  </div>

                  <div className="space-y-1.5 border-y border-border/60 py-3">
                    {o.items?.map((item: OrderItem, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-textPrimary">
                          {item.name}{' '}
                          <span className="font-mono text-textSecondary">x{item.quantity}</span>
                        </span>
                        <span className="font-mono font-medium text-textPrimary">
                          ฿{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textSecondary">ยอดชำระสุทธิ</span>
                    <span className="text-base font-mono font-semibold text-textPrimary">
                      ฿{Number(o.totalAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border border-border bg-secondary/40 text-xs text-textSecondary">
              ยังไม่มีประวัติคำสั่งซื้อ
            </div>
          )}
        </section>
      </main>

      {/* Minimal Edit Address Modal */}
      {isEditingAddress && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => {
            setIsEditingAddress(false);
            setSaveErrorMsg('');
          }}
        >
          <div
            className="bg-white border border-border shadow-2xl max-w-lg w-full p-7 space-y-6 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold block">
                  UPDATE SHIPPING
                </span>
                <h3 className="text-lg font-semibold text-textPrimary">แก้ไขที่อยู่จัดส่งพัสดุ</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditingAddress(false);
                  setSaveErrorMsg('');
                }}
                className="p-1 text-textSecondary hover:text-textPrimary cursor-pointer"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveErrorMsg && (
              <div className="p-3 border-l-2 border-red-600 bg-red-50/50 text-red-700 text-xs">
                {saveErrorMsg}
              </div>
            )}

            {saveSuccessMsg && (
              <div className="p-3 border-l-2 border-primary bg-secondary text-primary text-xs font-medium">
                {saveSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-textSecondary block">
                  ชื่อ-นามสกุล ผู้รับ
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full py-2 bg-transparent border-b border-border focus:border-textPrimary text-sm text-textPrimary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-textSecondary block">
                  เบอร์โทรศัพท์ติดต่อ
                </label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full py-2 bg-transparent border-b border-border focus:border-textPrimary text-sm font-mono text-textPrimary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-textSecondary block">
                  ที่อยู่จัดส่งเต็ม
                </label>
                <textarea
                  required
                  rows={3}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="บ้านเลขที่, อาคาร/หมู่บ้าน, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"
                  className="w-full p-3 bg-secondary/40 border border-border focus:border-textPrimary text-xs text-textPrimary focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="px-4 py-2.5 border border-border text-xs text-textSecondary hover:text-textPrimary cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="px-5 py-2.5 bg-textPrimary hover:bg-primary text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingAddress ? 'กำลังบันทึก...' : 'บันทึกที่อยู่'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
