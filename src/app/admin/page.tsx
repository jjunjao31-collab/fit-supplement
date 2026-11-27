'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  Database,
  Users,
  Plus,
  Trash2,
  X,
  RefreshCw,
  LogOut,
  ExternalLink,
  Search,
  Pencil,
  CheckCircle2,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { can, ROLE_LABELS, type Role } from '@/lib/rbac';
import AnimatedTabs from '@/components/ui/AnimatedTabs';
import FluidSwitch from '@/components/ui/FluidSwitch';
import AdminAnalyticsSuite, {
  AdminKpiStrip,
  type AnalyticsProduct,
  type AnalyticsOrder,
} from '@/components/admin/AdminAnalyticsSuite';

interface AdminUser {
  id: number;
  email: string;
  username?: string;
  fullname: string;
  fullName?: string;
  role: string;
}

type AdminProduct = AnalyticsProduct;
type AdminOrder = AnalyticsOrder;

interface ToastState {
  type: 'success' | 'error';
  message: string;
}

export default function AdminDashboardPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders'>('analytics');

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);

  // Add Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    nameTH: '',
    brand: 'Baam!! (Fitwhey)',
    category: 'whey',
    price: '',
    originalPrice: '',
    stock: '50',
    fdaNumber: '',
    size: '5 lbs',
    suitableFor: '',
    howToUse: '',
  });

  // Edit Product Modal
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    nameTH: '',
    price: '',
    stock: '',
    detail: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation Modal
  const [deletingProduct, setDeletingProduct] = useState<AdminProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/orders'),
      ]);
      const prodData = await prodRes.json();
      const orderData = await orderRes.json();
      if (prodData.success) setProducts(prodData.products);
      if (orderData.success) setOrders(orderData.orders);
    } catch {
      showToast('error', 'ไม่สามารถโหลดข้อมูลจากฐานข้อมูล SQL ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const u: AdminUser | null = data?.user || data;
        if (!u || !can(u.role, 'admin:access')) {
          window.location.href = '/admin/login';
          return;
        }
        setAdminUser(u);
        loadData();
      })
      .catch(() => {
        window.location.href = '/admin/login';
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('fitsupp_admin');
    localStorage.removeItem('fitsupp_user');
    window.location.href = '/admin/login';
  };

  const toggleStock = async (product: AdminProduct) => {
    const updatedInStock = !product.inStock;
    const nextStock = updatedInStock ? Math.max(product.stock || 0, 50) : 0;
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, stock: nextStock, inStock: updatedInStock }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.message || 'ไม่สามารถอัปเดตสต็อกได้');
        return;
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: updatedInStock, stock: nextStock } : p))
      );
      showToast('success', `อัปเดตสถานะ "${product.name}" เรียบร้อยแล้ว`);
    } catch {
      showToast('error', 'เกิดข้อผิดพลาดในการอัปเดตสต็อก');
    }
  };

  const handleQuickRestock = async (product: AdminProduct, addAmount: number) => {
    const nextStock = Math.max(0, (product.stock || 0) + addAmount);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, stock: nextStock, inStock: nextStock > 0 }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.message || 'ไม่สามารถเติมสต็อกได้');
        return;
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: nextStock, inStock: nextStock > 0 } : p))
      );
      showToast('success', `เติมสต็อก "${product.name}" +${addAmount} ชิ้น (รวม ${nextStock} ชิ้น) ลงฐานข้อมูล SQL แล้ว`);
    } catch {
      showToast('error', 'เกิดข้อผิดพลาดในการเติมสต็อก');
    }
  };

  const openEditModal = (product: AdminProduct) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      nameTH: product.nameTH,
      price: String(product.price),
      stock: String(product.stock ?? (product.inStock ? 50 : 0)),
      detail: product.detail || product.suitableFor || '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingEdit(true);
    try {
      const priceNum = Number(editForm.price);
      const stockNum = Math.max(0, Number(editForm.stock));
      if (isNaN(priceNum) || priceNum <= 0) {
        showToast('error', 'กรุณาระบุราคาที่มากกว่า 0 บาท');
        return;
      }

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          name: editForm.name,
          nameTH: editForm.nameTH,
          price: priceNum,
          stock: stockNum,
          detail: editForm.detail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.message || 'ไม่สามารถบันทึกการแก้ไขได้');
        return;
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: editForm.name.trim(),
                nameTH: editForm.nameTH.trim(),
                price: priceNum,
                stock: stockNum,
                inStock: stockNum > 0,
                detail: editForm.detail.trim(),
                suitableFor: editForm.detail.trim(),
              }
            : p
        )
      );
      setEditingProduct(null);
      showToast('success', `บันทึกการแก้ไขสินค้า "${editForm.name}" ลงฐานข้อมูล SQL แล้ว`);
    } catch {
      showToast('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(deletingProduct.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.message || 'คุณไม่มีสิทธิ์ลบสินค้า (403 Forbidden)');
        setDeletingProduct(null);
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      showToast('success', `ลบสินค้า "${deletingProduct.name}" ออกจากฐานข้อมูล SQL แล้ว`);
      setDeletingProduct(null);
    } catch {
      showToast('error', 'เกิดข้อผิดพลาดในการลบสินค้า');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stockNum = Math.max(0, Number(newProd.stock) || 50);
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProd,
          price: Number(newProd.price),
          originalPrice: Number(newProd.originalPrice || newProd.price),
          stock: stockNum,
          inStock: stockNum > 0,
          features: ['สินค้าแท้ 100%', 'มาตรฐาน อย. ไทย'],
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddModal(false);
        setNewProd({
          name: '',
          nameTH: '',
          brand: 'Baam!! (Fitwhey)',
          category: 'whey',
          price: '',
          originalPrice: '',
          stock: '50',
          fdaNumber: '',
          size: '5 lbs',
          suitableFor: '',
          howToUse: '',
        });
        showToast('success', 'เพิ่มสินค้าใหม่ลงฐานข้อมูล SQL เรียบร้อยแล้ว');
        loadData();
      } else {
        showToast('error', data.message || 'ไม่สามารถเพิ่มสินค้าได้');
      }
    } catch {
      showToast('error', 'เกิดข้อผิดพลาดในการเพิ่มสินค้า');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.message || 'ไม่สามารถอัปเดตสถานะได้');
        return;
      }
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      showToast('success', `อัปเดตสถานะออเดอร์ ${orderId} เรียบร้อยแล้ว`);
    } catch {
      showToast('error', 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nameTH.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.fdaNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-textPrimary">
      {/* Minimal Linear-Style Backoffice Header */}
      <section className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-mono uppercase tracking-[0.22em]">
              <span className="text-primary font-semibold">CLOUD SQL · EXECUTIVE ANALYTICS</span>
              {adminUser?.role && (
                <>
                  <span className="text-border">|</span>
                  <span className="text-textSecondary">
                    ROLE: {ROLE_LABELS[adminUser.role as Role] || adminUser.role}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-textPrimary tracking-tight">
              แดชบอร์ดจัดการร้านค้า ({adminUser?.fullname || adminUser?.fullName || 'Backoffice'})
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-border text-textSecondary hover:text-textPrimary hover:border-textPrimary transition-colors cursor-pointer"
              title="รีเฟรชข้อมูลสดจากฐานข้อมูล SQL"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>ซิงก์ SQL</span>
            </button>

            {can(adminUser?.role, 'user:manage') && (
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-primary/40 text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span>จัดการสิทธิ์ผู้ใช้</span>
              </Link>
            )}

            {can(adminUser?.role, 'database:view') && (
              <Link
                href="/sql"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-border text-textPrimary hover:border-textPrimary transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-primary" />
                <span>ฐานข้อมูล SQL</span>
              </Link>
            )}

            <Link
              href="/store"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-border text-textSecondary hover:text-textPrimary transition-colors"
            >
              <span>หน้าร้าน</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-border text-textSecondary hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออก</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-9 space-y-8">
        {/* Inline Toast Banner */}
        {toast && (
          <div
            role="status"
            className={`p-4 border-l-2 text-xs flex items-center justify-between gap-3 ${
              toast.type === 'success'
                ? 'border-primary bg-secondary text-primary font-medium'
                : 'border-red-600 bg-red-50/50 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="p-1 hover:opacity-70 cursor-pointer"
              aria-label="ปิดการแจ้งเตือน"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1px-Hairline Architectural KPI Strip with Live Sparklines */}
        <AdminKpiStrip products={products} orders={orders} />

        {/* Animated Underline Tab Navigation */}
        <div className="border-b border-border flex flex-wrap items-center justify-between gap-4">
          <AnimatedTabs
            layoutId="admin-main-tab"
            variant="underline"
            tabs={[
              {
                id: 'analytics',
                label: 'ภาพรวมวิเคราะห์',
                icon: <BarChart3 className="w-3.5 h-3.5" />,
              },
              {
                id: 'products',
                label: 'คลังสินค้าใน SQL',
                count: products.length,
                icon: <Package className="w-3.5 h-3.5" />,
              },
              {
                id: 'orders',
                label: 'รายการคำสั่งซื้อ',
                count: orders.length,
                icon: <ShoppingBag className="w-3.5 h-3.5" />,
              },
            ]}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as 'analytics' | 'products' | 'orders')}
          />

          {can(adminUser?.role, 'product:create') && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mb-2 inline-flex items-center gap-1.5 px-4 py-2 bg-textPrimary text-white hover:bg-primary text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มสินค้าใหม่ลง SQL</span>
            </button>
          )}
        </div>

        {/* TAB 0: 21st.dev EXECUTIVE ANALYTICS SUITE */}
        {activeTab === 'analytics' && (
          <AdminAnalyticsSuite
            products={products}
            orders={orders}
            canRestock={can(adminUser?.role, 'product:update')}
            onQuickRestock={handleQuickRestock}
            onJumpToOrders={() => setActiveTab('orders')}
            onJumpToProducts={() => setActiveTab('products')}
          />
        )}

        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="bg-white border border-border p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
              <div className="relative flex-1 max-w-md border-b border-textPrimary/25 focus-within:border-textPrimary transition-colors pb-1.5">
                <Search className="w-4 h-4 absolute left-0 top-1/2 -translate-y-1/2 text-textSecondary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาชื่อสินค้า, แบรนด์, เลข อย."
                  className="w-full pl-7 pr-4 py-1 bg-transparent focus:outline-none text-xs text-textPrimary"
                />
              </div>

              <div className="text-[11px] font-mono text-textSecondary">
                แสดง {filteredProducts.length} จาก {products.length} รายการในฐานข้อมูล SQL
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-textSecondary uppercase font-mono text-[10px] tracking-[0.14em]">
                    <th className="py-3 px-4">สินค้า</th>
                    <th className="py-3 px-4">แบรนด์ / หมวดหมู่</th>
                    <th className="py-3 px-4">เลข อย.</th>
                    <th className="py-3 px-4">ราคา (บาท)</th>
                    <th className="py-3 px-4 text-center">คงเหลือ / สถานะ</th>
                    <th className="py-3 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/80">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/45 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {p.imageUrl && (
                            <div className="w-10 h-10 bg-white border border-border p-1 shrink-0 flex items-center justify-center">
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-textPrimary text-xs sm:text-sm truncate max-w-[260px]">
                              {p.name}
                            </div>
                            <div className="text-textSecondary text-[11px] truncate max-w-[260px]">
                              {p.nameTH}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium px-2 py-0.5 bg-secondary border border-border text-primary font-mono text-[10px]">
                          {p.brand}
                        </span>
                        <div className="text-textSecondary text-[11px] mt-1">
                          {p.subCategory || p.category}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-textSecondary">
                        {p.fdaNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold font-mono text-textPrimary">
                        ฿{p.price.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-2.5">
                          <FluidSwitch
                            checked={p.inStock && p.stock > 0}
                            onChange={() => can(adminUser?.role, 'product:update') && toggleStock(p)}
                            disabled={!can(adminUser?.role, 'product:update')}
                            tone="gold"
                            size="sm"
                            ariaLabel={`สลับสถานะสต็อก ${p.name}`}
                          />
                          <span
                            className={`text-[10px] font-mono font-semibold w-20 text-left ${
                              p.inStock && p.stock > 15
                                ? 'text-textPrimary'
                                : p.inStock && p.stock > 0
                                ? 'text-primary'
                                : 'text-red-600'
                            }`}
                          >
                            {p.inStock && p.stock > 0
                              ? p.stock <= 15
                                ? `ใกล้หมด (${p.stock})`
                                : `พร้อมส่ง (${p.stock})`
                              : 'สินค้าหมด (0)'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {can(adminUser?.role, 'product:update') && (
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-border text-textPrimary hover:border-textPrimary transition-colors cursor-pointer font-medium"
                              title="แก้ไขชื่อ ราคา และสต็อก"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>แก้ไข</span>
                            </button>
                          )}
                          {can(adminUser?.role, 'product:delete') ? (
                            <button
                              type="button"
                              onClick={() => setDeletingProduct(p)}
                              className="p-1.5 border border-transparent text-textSecondary hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                              title="ลบออกจาก SQL"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-textSecondary/60 pl-1">
                              ADMIN ONLY
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-border p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold block">
                  SQL ORDERS TABLE
                </span>
                <h2 className="text-base font-semibold text-textPrimary">
                  รายการคำสั่งซื้อทั้งหมด ({orders.length} บิล)
                </h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-textSecondary uppercase font-mono text-[10px] tracking-[0.14em]">
                    <th className="py-3 px-4">รหัสออเดอร์</th>
                    <th className="py-3 px-4">ลูกค้า / เบอร์โทร</th>
                    <th className="py-3 px-4">ที่อยู่จัดส่ง</th>
                    <th className="py-3 px-4">รายการสินค้า</th>
                    <th className="py-3 px-4">ยอดรวม</th>
                    <th className="py-3 px-4">สถานะจัดส่ง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/80">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-secondary/45 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-primary">
                        {o.id}
                        <div className="text-[10px] text-textSecondary font-normal mt-0.5">
                          {o.createdAt}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-textPrimary">{o.customerName}</div>
                        <div className="text-textSecondary font-mono text-[11px]">
                          {o.customerPhone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-textSecondary max-w-xs truncate">
                        {o.customerAddress}
                      </td>
                      <td className="py-3.5 px-4 space-y-1">
                        {o.items?.map((item, idx) => (
                          <div key={idx} className="text-[11px]">
                            • {item.name} x{item.quantity} (฿{item.price.toLocaleString()})
                          </div>
                        ))}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-textPrimary font-mono">
                        ฿{o.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="bg-secondary border border-border px-2.5 py-1.5 text-xs font-medium text-textPrimary whitespace-nowrap min-w-[138px] focus:outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="pending">รอชำระเงิน</option>
                          <option value="paid">ชำระเงินแล้ว</option>
                          <option value="shipping">กำลังจัดส่ง</option>
                          <option value="completed">จัดส่งสำเร็จ</option>
                          <option value="cancelled">ยกเลิก</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg border border-border p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold block">
                  NEW CATALOG ENTRY
                </span>
                <h3 className="font-semibold text-base text-textPrimary">
                  เพิ่มสินค้าใหม่เข้าสู่ระบบ SQL
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-textSecondary hover:text-textPrimary cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-textPrimary block mb-1">ชื่อภาษาอังกฤษ</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="เช่น Baam!! 100% My Whey"
                  className="w-full px-3 py-2 bg-secondary border border-border text-textPrimary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-textPrimary block mb-1">ชื่อภาษาไทย</label>
                <input
                  type="text"
                  required
                  value={newProd.nameTH}
                  onChange={(e) => setNewProd({ ...newProd, nameTH: e.target.value })}
                  placeholder="เช่น แบม 100% มาย เวย์โปรตีน"
                  className="w-full px-3 py-2 bg-secondary border border-border text-textPrimary focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-textPrimary block mb-1">แบรนด์</label>
                  <input
                    type="text"
                    required
                    value={newProd.brand}
                    onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-border text-textPrimary focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-textPrimary block mb-1">หมวดหมู่</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-border text-textPrimary focus:border-primary focus:outline-none"
                  >
                    <option value="whey">เวย์โปรตีน</option>
                    <option value="plant-protein">โปรตีนพืช</option>
                    <option value="creatine">ครีเอทีน</option>
                    <option value="pre-workout">พรีเวิร์กเอาต์</option>
                    <option value="vitamin-zinc">วิตามิน &amp; ซิงค์</option>
                    <option value="fish-oil">น้ำมันปลา</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-textPrimary block mb-1">ราคาขาย (บาท)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    placeholder="1650"
                    className="w-full px-3 py-2 bg-secondary border border-border text-textPrimary font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-textPrimary block mb-1">จำนวนสต็อก</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    placeholder="50"
                    className="w-full px-3 py-2 bg-secondary border border-border text-textPrimary font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-textPrimary block mb-1">เลข อย. แท้</label>
                  <input
                    type="text"
                    required
                    value={newProd.fdaNumber}
                    onChange={(e) => setNewProd({ ...newProd, fdaNumber: e.target.value })}
                    placeholder="11-1-08463-5-0114"
                    className="w-full px-3 py-2 bg-secondary border border-border text-textPrimary font-mono focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-textPrimary block mb-1">
                  เหมาะสำหรับใคร / รายละเอียด
                </label>
                <input
                  type="text"
                  value={newProd.suitableFor}
                  onChange={(e) => setNewProd({ ...newProd, suitableFor: e.target.value })}
                  placeholder="เช่น ผู้ต้องการเพิ่มมวลกล้ามเนื้อ"
                  className="w-full px-3 py-2 bg-secondary border border-border text-textPrimary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-textPrimary block mb-1">วิธีรับประทาน</label>
                <input
                  type="text"
                  value={newProd.howToUse}
                  onChange={(e) => setNewProd({ ...newProd, howToUse: e.target.value })}
                  placeholder="เช่น ผสม 1 ช้อนตวงกับน้ำเย็นหลังซ้อม"
                  className="w-full px-3 py-2 bg-secondary border border-border text-textPrimary focus:border-primary focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white border border-border text-textSecondary hover:text-textPrimary font-medium cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-textPrimary text-white hover:bg-primary font-medium transition-colors cursor-pointer"
                >
                  บันทึกลงฐานข้อมูล SQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg border border-border p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-base text-textPrimary">
                  แก้ไขข้อมูลสินค้าในฐานข้อมูล SQL
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-textSecondary hover:text-textPrimary cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-textPrimary block mb-1">
                  ชื่อภาษาอังกฤษ (name)
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-secondary border border-border text-textPrimary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-textPrimary block mb-1">
                  ชื่อภาษาไทย (nameTH)
                </label>
                <input
                  type="text"
                  required
                  value={editForm.nameTH}
                  onChange={(e) => setEditForm({ ...editForm, nameTH: e.target.value })}
                  className="w-full px-3 py-2.5 bg-secondary border border-border text-textPrimary focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-textPrimary block mb-1">
                    ราคาขาย (บาท)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-3 py-2.5 bg-secondary border border-border text-textPrimary font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-textPrimary block mb-1">
                    จำนวนสต็อกคงเหลือ (ชิ้น)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    className="w-full px-3 py-2.5 bg-secondary border border-border text-textPrimary font-mono focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-textPrimary block mb-1">
                  รายละเอียด / เหมาะสำหรับใคร (detail)
                </label>
                <textarea
                  rows={3}
                  value={editForm.detail}
                  onChange={(e) => setEditForm({ ...editForm, detail: e.target.value })}
                  className="w-full px-3 py-2.5 bg-secondary border border-border text-textPrimary focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-white border border-border text-textSecondary hover:text-textPrimary font-medium cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-textPrimary text-white hover:bg-primary font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md border border-border p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-textPrimary">ยืนยันการลบสินค้า</h3>
                <p className="text-xs text-textSecondary leading-relaxed">
                  คุณต้องการลบ <strong className="text-textPrimary">{deletingProduct.name}</strong>{' '}
                  ออกจากฐานข้อมูล SQL ใช่หรือไม่ การดำเนินการนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 bg-white border border-border text-xs font-medium text-textSecondary hover:text-textPrimary cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteProduct}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
