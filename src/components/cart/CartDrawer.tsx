'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  User,
  Sparkles,
  CreditCard,
  QrCode,
  Banknote,
  FileText,
  Award,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { products as catalogProducts, type Product } from '@/data/products';
import SupplementIcon from '@/components/ui/SupplementIcon';
import SlidingNumber from '@/components/ui/SlidingNumber';
import FluidSwitch from '@/components/ui/FluidSwitch';
import SegmentedControl from '@/components/ui/SegmentedControl';
import TextShimmer from '@/components/ui/TextShimmer';

type CheckoutStep = 'cart' | 'address' | 'success';
type PaymentMethod = 'promptpay' | 'cod' | 'card';

const FREE_SHIPPING_THRESHOLD = 1500;
const QUICK_PICK_IDS = [
  'prod-baam-my-whey',
  'prod-vx-pure-creatine',
  'prod-fw-super-omega3',
];

/**
 * 21st.dev Minimal Premium Slide-Over Cart & Checkout Studio
 * Spring slide-over sheet, animated free-shipping meter, quick-pick empty state, FluidSwitch & SegmentedControl checkout
 */
export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalCount,
  } = useCart();

  const [step, setStep] = useState<CheckoutStep>('cart');
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<{
    id: number;
    fullname?: string;
    fullName?: string;
    username?: string;
    phone?: string;
    address?: string;
  } | null>(null);
  const [createdOrder, setCreatedOrder] = useState<{
    id: string;
    customerName: string;
    customerPhone: string;
    fullAddress: string;
    notes?: string;
    totalAmount: number;
    paymentMethod: PaymentMethod;
  } | null>(null);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    houseNo: '',
    subdistrict: '',
    district: '',
    province: 'กรุงเทพมหานคร',
    postalCode: '',
    notes: '',
    paymentMethod: 'promptpay' as PaymentMethod,
    saveDefault: false,
  });

  const quickPicks = useMemo<Product[]>(() => {
    return QUICK_PICK_IDS.map((id) => catalogProducts.find((p) => p.id === id)).filter(
      (p): p is Product => Boolean(p)
    );
  }, []);

  // Load current user profile when cart opens
  useEffect(() => {
    if (!isCartOpen) return;
    let active = true;
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        const parsed = data?.user || data;
        if (parsed && parsed.id) {
          setLoggedInUser(parsed);
          setFormData((prev) =>
            prev.customerName
              ? prev
              : {
                  ...prev,
                  customerName: parsed.fullname || parsed.fullName || '',
                  customerPhone: parsed.phone || '',
                  houseNo: parsed.address || '',
                }
          );
        } else {
          setLoggedInUser(null);
        }
      })
      .catch(() => {
        if (active) setLoggedInUser(null);
      });
    return () => {
      active = false;
    };
  }, [isCartOpen]);

  // Escape key closes drawer
  useEffect(() => {
    if (!isCartOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCart();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCartOpen, closeCart]);

  const handleAutofillMember = () => {
    if (!loggedInUser) return;
    setFormData((prev) => ({
      ...prev,
      customerName: loggedInUser.fullname || loggedInUser.fullName || prev.customerName,
      customerPhone: loggedInUser.phone || prev.customerPhone,
      houseNo: loggedInUser.address || prev.houseNo,
    }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    if (!formData.customerName.trim() || !formData.customerPhone.trim() || !formData.houseNo.trim()) {
      setCheckoutError('กรุณากรอกชื่อ เบอร์โทรศัพท์ และที่อยู่จัดส่งให้ครบถ้วน');
      return;
    }

    setLoading(true);

    const fullAddress = [
      formData.houseNo,
      formData.subdistrict ? `ต./แขวง ${formData.subdistrict}` : '',
      formData.district ? `อ./เขต ${formData.district}` : '',
      formData.province ? `จ.${formData.province}` : '',
      formData.postalCode,
    ]
      .filter(Boolean)
      .join(' ');

    const orderPayload = {
      userId: loggedInUser ? loggedInUser.id : null,
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim(),
      customerAddress: fullAddress,
      items: cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        brand: item.product.brand,
        size: item.product.size,
        price: item.product.price,
        quantity: item.quantity,
      })),
      totalAmount: subtotal,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes.trim(),
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();

      if (data.success) {
        setCreatedOrder({
          id: data.orderId,
          customerName: data.order?.customerName || orderPayload.customerName,
          customerPhone: data.order?.customerPhone || orderPayload.customerPhone,
          totalAmount: Number(data.order?.totalAmount ?? orderPayload.totalAmount),
          paymentMethod: formData.paymentMethod,
          fullAddress,
          notes: formData.notes.trim() || undefined,
        });

        if (formData.saveDefault && loggedInUser) {
          fetch('/api/user/address', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: loggedInUser.id,
              username: loggedInUser.username,
              fullName: formData.customerName.trim(),
              phone: formData.customerPhone.trim(),
              address: fullAddress,
            }),
          })
            .then((r) => r.json())
            .then((resData) => {
              if (resData.success && resData.user) {
                setLoggedInUser(resData.user);
              }
            })
            .catch(() => {
              // ignore non-critical profile sync error
            });
        }

        clearCart();
        setStep('success');
      } else {
        setCheckoutError(data.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
      }
    } catch {
      setCheckoutError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ฐานข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAndReset = () => {
    closeCart();
    setTimeout(() => {
      setStep('cart');
      setCheckoutError('');
      setCreatedOrder(null);
    }, 280);
  };

  const remainingForFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShipPct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const pointsToEarn = subtotal > 0 ? Math.max(10, Math.floor(subtotal * 0.05)) : 0;

  const stepIndex = step === 'cart' ? 1 : step === 'address' ? 2 : 3;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="ตะกร้าสินค้า">
          {/* Animated Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={handleCloseAndReset}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs"
          />

          {/* Spring Slide-Over Architectural Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-12">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 34 }}
              className="w-screen max-w-[460px] bg-white border-l border-border text-textPrimary shadow-2xl flex flex-col justify-between"
            >
              {/* TOP ARCHITECTURAL HEADER */}
              <div className="border-b border-border bg-white shrink-0">
                <div className="px-6 py-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {step === 'address' && (
                      <button
                        type="button"
                        onClick={() => setStep('cart')}
                        className="w-8 h-8 border border-border bg-white hover:border-textPrimary text-textPrimary flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="ย้อนกลับไปตะกร้า"
                        aria-label="ย้อนกลับไปตะกร้า"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em]">
                        <TextShimmer baseColor="#0E0E10" shimmerColor="#9A6E1C" className="font-semibold">
                          {step === 'cart'
                            ? '01 / SHOPPING BAG'
                            : step === 'address'
                            ? '02 / SHIPPING & PAYMENT'
                            : '03 / ORDER CONFIRMED'}
                        </TextShimmer>
                      </div>
                      <h2 className="text-base font-semibold text-textPrimary tracking-tight truncate">
                        {step === 'cart' && `ตะกร้าสินค้าของคุณ (${totalCount})`}
                        {step === 'address' && 'ระบุที่อยู่จัดส่งและชำระเงิน'}
                        {step === 'success' && 'บันทึกคำสั่งซื้อเรียบร้อย'}
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseAndReset}
                    className="w-8 h-8 border border-border bg-white hover:border-textPrimary text-textSecondary hover:text-textPrimary flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    aria-label="ปิดตะกร้าสินค้า"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 3-Step Hairline Progress Indicator */}
                <div className="grid grid-cols-3 h-[2px] bg-border/60">
                  {[1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`transition-colors duration-300 ${
                        idx <= stepIndex ? 'bg-primary' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* ==================== STEP 1: CART ITEMS ==================== */}
              {step === 'cart' && (
                <>
                  {/* Live Free Shipping Meter (when cart has items) */}
                  {cart.length > 0 && (
                    <div className="px-6 py-3 border-b border-border bg-secondary/50 space-y-1.5 shrink-0">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="inline-flex items-center gap-1.5 text-textPrimary font-medium">
                          <Truck className="w-3.5 h-3.5 text-primary" />
                          {remainingForFreeShip === 0 ? (
                            <span className="text-primary font-semibold">
                              คุณได้รับสิทธิ์จัดส่งฟรีแล้ว
                            </span>
                          ) : (
                            <span>
                              เพิ่มอีก{' '}
                              <strong className="font-mono text-primary">
                                ฿{remainingForFreeShip.toLocaleString()}
                              </strong>{' '}
                              รับสิทธิ์จัดส่งฟรี
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-[10px] text-textSecondary">
                          {freeShipPct}%
                        </span>
                      </div>
                      <div className="h-1 w-full bg-border/70 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${freeShipPct}%` }}
                          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full bg-primary"
                        />
                      </div>
                    </div>
                  )}

                  {/* Scrollable Body */}
                  <div className="flex-1 overflow-y-auto">
                    {cart.length === 0 ? (
                      /* LUXURY MINIMAL EMPTY CART + CURATED QUICK-PICKS */
                      <div className="h-full flex flex-col justify-between">
                        <div className="relative px-6 py-12 text-center space-y-5 overflow-hidden border-b border-border">
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-editorial-grid opacity-70"
                            style={{
                              maskImage:
                                'radial-gradient(ellipse 75% 70% at 50% 45%, black 15%, transparent 78%)',
                              WebkitMaskImage:
                                'radial-gradient(ellipse 75% 70% at 50% 45%, black 15%, transparent 78%)',
                            }}
                          />
                          <div className="relative z-10 space-y-4">
                            <div className="w-14 h-14 mx-auto border border-border bg-white flex items-center justify-center text-textPrimary shadow-xs">
                              <ShoppingBag className="w-5 h-5 stroke-[1.6]" />
                            </div>
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold block">
                                YOUR BAG IS EMPTY
                              </span>
                              <h3 className="text-lg font-semibold text-textPrimary tracking-tight">
                                ยังไม่มีสินค้าในตะกร้า
                              </h3>
                              <p className="text-xs text-textSecondary max-w-xs mx-auto leading-relaxed">
                                เลือกช้อปเวย์โปรตีน ครีเอทีน หรือวิตามินแท้มีเลข อย. ครบ 34 รายการ หรือให้ผู้ช่วย AI ช่วยคัดสูตรให้
                              </p>
                            </div>
                            <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5">
                              <Link
                                href="/store"
                                onClick={handleCloseAndReset}
                                className="px-5 py-2.5 bg-textPrimary text-white hover:bg-primary text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                              >
                                <span>เข้าชมคอลเลกชัน</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  handleCloseAndReset();
                                  window.dispatchEvent(new CustomEvent('open-fit-ai'));
                                }}
                                className="px-4 py-2.5 border border-border bg-white hover:border-textPrimary text-textPrimary text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                <span>ให้ AI จัดเซตให้</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Curated Quick-Add Bestsellers Shelf */}
                        <div className="p-6 space-y-3.5 bg-secondary/35 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-textSecondary font-semibold">
                              CURATED BESTSELLERS · เพิ่มด่วน
                            </span>
                            <span className="text-[10px] font-mono text-primary">
                              AIS / อย. แท้
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {quickPicks.map((item) => (
                              <div
                                key={item.id}
                                className="p-3 bg-white border border-border hover:border-textPrimary/35 transition-colors flex items-center gap-3"
                              >
                                <Link
                                  href={`/store/${item.id}`}
                                  onClick={handleCloseAndReset}
                                  className="w-12 h-12 bg-white border border-border p-1 shrink-0 flex items-center justify-center"
                                >
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </Link>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <div className="text-[10px] font-mono text-primary uppercase truncate">
                                    {item.brand}
                                  </div>
                                  <Link
                                    href={`/store/${item.id}`}
                                    onClick={handleCloseAndReset}
                                    className="block text-xs font-semibold text-textPrimary hover:text-primary truncate transition-colors"
                                  >
                                    {item.name}
                                  </Link>
                                  <div className="text-[11px] font-mono text-textSecondary">
                                    ฿{item.price.toLocaleString()} · {item.size}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addToCart(item, 1)}
                                  className="px-2.5 py-1.5 bg-textPrimary text-white hover:bg-primary text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>เพิ่ม</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ANIMATED CART ITEMS LIST */
                      <div className="p-5 sm:p-6 space-y-3 bg-secondary/30 min-h-full">
                        <AnimatePresence initial={false}>
                          {cart.map((item) => (
                            <motion.div
                              key={item.product.id}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: 40 }}
                              transition={{ duration: 0.22 }}
                              className="p-4 bg-white border border-border hover:border-textPrimary/35 transition-colors flex items-start gap-4"
                            >
                              <Link
                                href={`/store/${item.product.id}`}
                                onClick={handleCloseAndReset}
                                className="w-16 h-16 bg-white border border-border flex items-center justify-center p-1.5 shrink-0"
                              >
                                {item.product.imageUrl ? (
                                  <img
                                    src={item.product.imageUrl}
                                    alt={item.product.name}
                                    className="max-h-full max-w-full object-contain"
                                  />
                                ) : (
                                  <SupplementIcon name={item.product.category} size="md" />
                                )}
                              </Link>

                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-start justify-between gap-2">
                                  <Link
                                    href={`/store/${item.product.id}`}
                                    onClick={handleCloseAndReset}
                                    className="text-xs sm:text-[13px] font-semibold text-textPrimary hover:text-primary line-clamp-1 transition-colors"
                                  >
                                    {item.product.name}
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(item.product.id)}
                                    className="text-textSecondary hover:text-red-600 transition-colors p-0.5 cursor-pointer shrink-0"
                                    title="ลบรายการ"
                                    aria-label={`ลบ ${item.product.name}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="text-[10px] text-textSecondary font-mono">
                                  {item.product.brand} · {item.product.size}
                                </div>

                                <div className="flex items-center justify-between pt-1.5">
                                  <div className="inline-flex items-center border border-border bg-secondary/60">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateQuantity(item.product.id, item.quantity - 1)
                                      }
                                      className="px-2 py-1 text-textSecondary hover:text-textPrimary cursor-pointer"
                                      aria-label="ลดจำนวน"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-mono font-semibold w-7 text-center text-textPrimary">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateQuantity(item.product.id, item.quantity + 1)
                                      }
                                      className="px-2 py-1 text-textSecondary hover:text-textPrimary cursor-pointer"
                                      aria-label="เพิ่มจำนวน"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <span className="text-sm font-mono font-semibold text-textPrimary">
                                    ฿{(item.product.price * item.quantity).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Sticky Cart Summary Footer */}
                  {cart.length > 0 && (
                    <div className="p-6 border-t border-border bg-white space-y-4 shrink-0">
                      <div className="flex items-center justify-between text-[11px] text-textSecondary">
                        <span className="inline-flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-primary" />
                          <span>
                            รับคะแนนสะสม{' '}
                            <strong className="font-mono text-textPrimary">
                              +{pointsToEarn} FIT Points
                            </strong>
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                          <span>ของแท้ 100%</span>
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between pt-2 border-t border-border/70">
                        <span className="text-xs text-textSecondary font-medium">
                          ยอดรวมสุทธิ ({totalCount} ชิ้น)
                        </span>
                        <span className="text-2xl font-light font-mono text-textPrimary tracking-tight">
                          ฿<SlidingNumber value={subtotal} />
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep('address')}
                        className="w-full py-3.5 bg-textPrimary text-white font-medium text-xs sm:text-sm tracking-wide hover:bg-primary transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>ระบุที่อยู่จัดส่งและชำระเงิน</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <p className="text-[10px] font-mono text-center text-textSecondary">
                        SERVER-VERIFIED PRICING · SQL ATOMIC STOCK
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ==================== STEP 2: ADDRESS & PAYMENT ==================== */}
              {step === 'address' && (
                <form
                  onSubmit={handleSubmitOrder}
                  className="flex-1 flex flex-col justify-between overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-secondary/35">
                    {checkoutError && (
                      <div className="p-3.5 border-l-2 border-red-600 bg-red-50/70 text-red-700 text-xs font-medium">
                        {checkoutError}
                      </div>
                    )}

                    {/* Quick Autofill from Profile when logged in */}
                    {loggedInUser && (
                      <div className="p-3.5 bg-white border border-border flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-textPrimary">
                          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>ใช้ข้อมูลที่อยู่จากโปรไฟล์ของคุณ</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAutofillMember}
                          className="px-3 py-1 bg-textPrimary text-white hover:bg-primary text-[11px] font-medium transition-colors cursor-pointer shrink-0"
                        >
                          ดึงข้อมูลอัตโนมัติ
                        </button>
                      </div>
                    )}

                    {/* 01 / Recipient Details */}
                    <div className="bg-white border border-border p-4 space-y-3.5">
                      <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>01 / ข้อมูลผู้รับสินค้า</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-textSecondary block">
                            ชื่อ-นามสกุล *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.customerName}
                            onChange={(e) =>
                              setFormData({ ...formData, customerName: e.target.value })
                            }
                            placeholder="ระบุชื่อผู้รับ"
                            className="w-full px-3 py-2 bg-secondary/60 border border-border text-xs text-textPrimary focus:border-textPrimary focus:bg-white focus:outline-none transition-colors"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-textSecondary block">
                            เบอร์โทรศัพท์ *
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.customerPhone}
                            onChange={(e) =>
                              setFormData({ ...formData, customerPhone: e.target.value })
                            }
                            placeholder="08X-XXX-XXXX"
                            className="w-full px-3 py-2 bg-secondary/60 border border-border text-xs text-textPrimary font-mono focus:border-textPrimary focus:bg-white focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 02 / Shipping Address */}
                    <div className="bg-white border border-border p-4 space-y-3.5">
                      <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>02 / ที่อยู่จัดส่งพัสดุ</span>
                      </h3>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-textSecondary block">
                          บ้านเลขที่, อาคาร/หมู่บ้าน, ซอย, ถนน *
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={formData.houseNo}
                          onChange={(e) =>
                            setFormData({ ...formData, houseNo: e.target.value })
                          }
                          placeholder="กรอกรายละเอียดที่อยู่จัดส่ง"
                          className="w-full px-3 py-2 bg-secondary/60 border border-border text-xs text-textPrimary focus:border-textPrimary focus:bg-white focus:outline-none resize-none transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-textSecondary block">
                            แขวง / ตำบล
                          </label>
                          <input
                            type="text"
                            value={formData.subdistrict}
                            onChange={(e) =>
                              setFormData({ ...formData, subdistrict: e.target.value })
                            }
                            placeholder="ระบุแขวง/ตำบล"
                            className="w-full px-3 py-2 bg-secondary/60 border border-border text-xs text-textPrimary focus:border-textPrimary focus:bg-white focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-textSecondary block">
                            เขต / อำเภอ
                          </label>
                          <input
                            type="text"
                            value={formData.district}
                            onChange={(e) =>
                              setFormData({ ...formData, district: e.target.value })
                            }
                            placeholder="ระบุเขต/อำเภอ"
                            className="w-full px-3 py-2 bg-secondary/60 border border-border text-xs text-textPrimary focus:border-textPrimary focus:bg-white focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-textSecondary block">
                            จังหวัด *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.province}
                            onChange={(e) =>
                              setFormData({ ...formData, province: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-secondary/60 border border-border text-xs text-textPrimary focus:border-textPrimary focus:bg-white focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-textSecondary block">
                            รหัสไปรษณีย์ *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.postalCode}
                            onChange={(e) =>
                              setFormData({ ...formData, postalCode: e.target.value })
                            }
                            placeholder="10110"
                            className="w-full px-3 py-2 bg-secondary/60 border border-border text-xs text-textPrimary font-mono focus:border-textPrimary focus:bg-white focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-textSecondary block">
                          หมายเหตุการจัดส่ง (ถ้ามี)
                        </label>
                        <input
                          type="text"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="เช่น ฝากที่นิติบุคคล, โทรแจ้งก่อนเข้าส่ง"
                          className="w-full px-3 py-2 bg-secondary/60 border border-border text-xs text-textPrimary focus:border-textPrimary focus:bg-white focus:outline-none transition-colors"
                        />
                      </div>

                      {loggedInUser && (
                        <div className="pt-2 border-t border-border/70">
                          <FluidSwitch
                            checked={formData.saveDefault}
                            onChange={(val) =>
                              setFormData({ ...formData, saveDefault: val })
                            }
                            label="บันทึกเป็นที่อยู่จัดส่งเริ่มต้นในโปรไฟล์"
                            tone="gold"
                            size="sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* 03 / Payment Method SegmentedControl */}
                    <div className="bg-white border border-border p-4 space-y-3">
                      <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>03 / ช่องทางชำระเงิน</span>
                      </h3>

                      <SegmentedControl<PaymentMethod>
                        layoutId="cart-payment-method-segment"
                        variant="sharp"
                        size="sm"
                        fullWidth
                        ariaLabel="เลือกช่องทางชำระเงิน"
                        options={[
                          {
                            id: 'promptpay',
                            label: 'พร้อมเพย์',
                            icon: <QrCode className="w-3.5 h-3.5" />,
                          },
                          {
                            id: 'cod',
                            label: 'ปลายทาง',
                            icon: <Banknote className="w-3.5 h-3.5" />,
                          },
                          {
                            id: 'card',
                            label: 'บัตรเครดิต',
                            icon: <CreditCard className="w-3.5 h-3.5" />,
                          },
                        ]}
                        value={formData.paymentMethod}
                        onChange={(method) =>
                          setFormData({ ...formData, paymentMethod: method })
                        }
                      />
                    </div>
                  </div>

                  {/* Sticky Checkout Submit Footer */}
                  <div className="p-6 border-t border-border bg-white space-y-3.5 shrink-0">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-textSecondary">
                        ยอดชำระสุทธิ ({totalCount} ชิ้น)
                      </span>
                      <span className="text-2xl font-light font-mono text-textPrimary">
                        ฿<SlidingNumber value={subtotal} />
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setStep('cart')}
                        className="py-3.5 px-4 border border-border bg-white hover:border-textPrimary text-textPrimary text-xs font-medium transition-colors cursor-pointer"
                      >
                        ย้อนกลับ
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3.5 bg-textPrimary text-white hover:bg-primary font-medium text-xs sm:text-sm tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        <span>
                          {loading ? 'กำลังบันทึกคำสั่งซื้อ...' : 'ยืนยันและสั่งซื้อสินค้า'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* ==================== STEP 3: ORDER CONFIRMED ==================== */}
              {step === 'success' && createdOrder && (
                <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 bg-white overflow-y-auto">
                  <div className="space-y-6 py-4">
                    <div className="text-center space-y-4">
                      <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                        className="w-16 h-16 border border-primary bg-secondary text-primary flex items-center justify-center mx-auto"
                      >
                        <Check className="w-7 h-7 stroke-[2.2]" />
                      </motion.div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold block">
                          SQL ORDER CONFIRMED
                        </span>
                        <h3 className="text-2xl font-semibold text-textPrimary tracking-tight">
                          สั่งซื้อสำเร็จเรียบร้อย
                        </h3>
                        <p className="text-xs text-textSecondary max-w-xs mx-auto leading-relaxed">
                          รหัสคำสั่งซื้อ{' '}
                          <strong className="text-textPrimary font-mono">{createdOrder.id}</strong>{' '}
                          คลังสินค้าพร้อมจัดส่งของแท้ภายใน 1–2 วันทำการ
                        </p>
                      </div>
                    </div>

                    {/* Crisp Architectural Receipt Box */}
                    <div className="border border-border bg-secondary/45 p-5 space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-border">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary">
                          DIGITAL RECEIPT
                        </span>
                        <span className="font-mono text-[11px] text-primary font-semibold">
                          {createdOrder.paymentMethod === 'cod'
                            ? 'เก็บเงินปลายทาง'
                            : 'ชำระเงินแล้ว'}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <span className="text-textSecondary">ผู้รับ: </span>
                          <strong className="text-textPrimary font-medium">
                            {createdOrder.customerName}
                          </strong>{' '}
                          <span className="font-mono text-textSecondary">
                            ({createdOrder.customerPhone})
                          </span>
                        </div>
                        <div>
                          <span className="text-textSecondary">ที่อยู่: </span>
                          <span className="text-textPrimary leading-relaxed">
                            {createdOrder.fullAddress}
                          </span>
                        </div>
                        {createdOrder.notes && (
                          <div>
                            <span className="text-textSecondary">หมายเหตุ: </span>
                            <span className="text-textSecondary">{createdOrder.notes}</span>
                          </div>
                        )}
                      </div>
                      <div className="pt-3 border-t border-border flex items-baseline justify-between">
                        <span className="text-textSecondary">ยอดชำระสุทธิ</span>
                        <span className="text-lg font-mono font-semibold text-textPrimary">
                          ฿{createdOrder.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border space-y-2.5">
                    <Link
                      href="/profile"
                      onClick={handleCloseAndReset}
                      className="w-full py-3.5 bg-textPrimary text-white hover:bg-primary font-medium text-xs sm:text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>ตรวจสอบคำสั่งซื้อในหน้าโปรไฟล์</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleCloseAndReset}
                      className="w-full py-3 border border-border bg-white hover:border-textPrimary text-textSecondary hover:text-textPrimary text-xs font-medium transition-colors cursor-pointer"
                    >
                      ปิดหน้าต่าง / เลือกซื้อสินค้าต่อ
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
