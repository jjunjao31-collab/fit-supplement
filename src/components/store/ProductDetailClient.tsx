'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from 'framer-motion';
import {
  ShieldCheck,
  Star,
  Check,
  ShoppingBag,
  Minus,
  Plus,
  Package,
  Truck,
  ArrowLeft,
  ArrowUpRight,
  ZoomIn,
  X,
  Copy,
  Sparkles,
  Award,
  BookOpen,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { products as staticProducts, type Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import SupplementIcon from '@/components/ui/SupplementIcon';
import ProductCard from '@/components/store/ProductCard';
import SlidingNumber from '@/components/ui/SlidingNumber';
import AnimatedTabs from '@/components/ui/AnimatedTabs';
import SegmentedControl from '@/components/ui/SegmentedControl';
import TextShimmer from '@/components/ui/TextShimmer';
import TextScramble from '@/components/ui/TextScramble';
import BlurFade from '@/components/ui/BlurFade';

interface RawDbProduct {
  id: string;
  name: string;
  nameTH: string;
  brand: string;
  category: Product['category'];
  subCategory?: string;
  price: number | string;
  originalPrice?: number | string | null;
  stock?: number | string | null;
  detail?: string | null;
  fdaNumber: string;
  rating?: number | string;
  reviewsCount?: number | string;
  servings?: string;
  size?: string;
  suitableFor?: string;
  howToUse?: string;
  goal?: Product['goal'];
  badge?: string;
  inStock?: boolean | number;
  imageUrl?: string;
  features?: string[] | string | null;
}

const CATEGORY_TO_ENCYCLOPEDIA: Partial<Record<Product['category'], { slug: string; label: string }>> = {
  whey: { slug: 'whey-protein', label: 'อ่านสารานุกรม Whey Protein (AIS Group A)' },
  'plant-protein': { slug: 'whey-protein', label: 'อ่านสารานุกรมโปรตีนเสริม (ISSN)' },
  creatine: { slug: 'creatine-monohydrate', label: 'อ่านสารานุกรม Creatine Monohydrate (AIS Group A)' },
  'pre-workout': { slug: 'pre-workout', label: 'อ่านสารานุกรม Pre-Workout และคาเฟอีน' },
};

function normalizeProduct(raw: RawDbProduct, fallback?: Product): Product {
  let parsedFeatures: string[] = fallback?.features || [];
  if (Array.isArray(raw.features)) {
    parsedFeatures = raw.features;
  } else if (typeof raw.features === 'string') {
    try {
      const parsed = JSON.parse(raw.features);
      if (Array.isArray(parsed)) parsedFeatures = parsed;
    } catch {
      // keep fallback features
    }
  }

  return {
    id: raw.id,
    name: raw.name,
    nameTH: raw.nameTH || raw.name,
    brand: raw.brand,
    category: raw.category || fallback?.category || 'whey',
    subCategory: raw.subCategory || fallback?.subCategory || '',
    price: Number(raw.price),
    originalPrice: Number(raw.originalPrice ?? raw.price),
    stock: raw.stock !== undefined && raw.stock !== null ? Number(raw.stock) : undefined,
    detail: raw.detail || fallback?.detail || '',
    fdaNumber: raw.fdaNumber || fallback?.fdaNumber || '-',
    rating: Number(raw.rating ?? fallback?.rating ?? 5),
    reviewsCount: Number(raw.reviewsCount ?? fallback?.reviewsCount ?? 0),
    servings: raw.servings || fallback?.servings || '-',
    size: raw.size || fallback?.size || '-',
    suitableFor: raw.suitableFor || fallback?.suitableFor || '',
    howToUse: raw.howToUse || fallback?.howToUse || '',
    goal: raw.goal || fallback?.goal || 'muscle-gain',
    badge: raw.badge || fallback?.badge || '',
    inStock: Boolean(raw.inStock),
    imageUrl: raw.imageUrl || fallback?.imageUrl || '',
    features: parsedFeatures,
  };
}

function parseServingCount(servingsStr?: string): number | null {
  if (!servingsStr) return null;
  const match = servingsStr.match(/(\d+)/);
  if (!match) return null;
  const n = Number(match[1]);
  return n > 0 ? n : null;
}

interface ProductDetailClientProps {
  productId: string;
  initialProduct: Product | null;
}

/**
 * 21st.dev Flagship Interactive Product Studio
 * 3D Perspective Tilt Pedestal + Lightbox Zoom + Live Cost-Per-Serving + Free-Shipping Meter + Clinical Dossier Tabs
 */
export default function ProductDetailClient({
  productId,
  initialProduct,
}: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [qty, setQty] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState<'highlights' | 'dosage' | 'safety'>('highlights');
  const [justAdded, setJustAdded] = useState(false);
  const [copiedFda, setCopiedFda] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isHoveringStage, setIsHoveringStage] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);

  // 21st.dev 3D Tilt + Cursor Spotlight on Pedestal Stage
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const spotX = useMotionValue(220);
  const spotY = useMotionValue(220);

  const rotateX = useSpring(rawRotateX, { stiffness: 220, damping: 24 });
  const rotateY = useSpring(rawRotateY, { stiffness: 220, damping: 24 });
  const spotlightBg = useMotionTemplate`radial-gradient(360px circle at ${spotX}px ${spotY}px, rgba(154, 110, 28, 0.085), transparent 72%)`;

  useEffect(() => {
    let active = true;
    fetch(`/api/products/${encodeURIComponent(productId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: RawDbProduct | null) => {
        if (!active) return;
        if (data && data.id) {
          setProduct(normalizeProduct(data, initialProduct || undefined));
        }
      })
      .catch(() => {
        // คงข้อมูลเริ่มต้นไว้
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId, initialProduct]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen]);

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;
    rawRotateX.set(py * -7);
    rawRotateY.set(px * 7);
    spotX.set(x);
    spotY.set(y);
  };

  const handleStageMouseLeave = () => {
    setIsHoveringStage(false);
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs font-mono text-textSecondary">
        LOADING PRODUCT SPECIFICATION...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold text-textPrimary">ไม่พบสินค้าที่ต้องการ</h1>
        <p className="text-sm text-textSecondary">สินค้านี้อาจถูกลบหรือไม่มีอยู่ในระบบแล้ว</p>
        <Link
          href="/store"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-textPrimary text-white text-xs font-medium hover:bg-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้าร้านค้า</span>
        </Link>
      </div>
    );
  }

  const stockCount = typeof product.stock === 'number' ? product.stock : undefined;
  const isOutOfStock = !product.inStock || (stockCount !== undefined && stockCount <= 0);
  const isLowStock = !isOutOfStock && stockCount !== undefined && stockCount <= 15;
  const maxAllowedQty = stockCount !== undefined && stockCount > 0 ? stockCount : 10;

  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;
  const savingsAmount = Math.max(0, (product.originalPrice - product.price) * qty);
  const totalPrice = Number(product.price) * qty;
  const fitPointsEarned = Math.max(10, Math.floor(totalPrice * 0.05));

  const freeShippingThreshold = 1500;
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - totalPrice);
  const freeShipPct = Math.min(100, Math.round((totalPrice / freeShippingThreshold) * 100));

  const servingNum = parseServingCount(product.servings);
  const costPerServing =
    servingNum && servingNum > 0 ? Math.round(product.price / servingNum) : null;

  const relatedProducts = staticProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const encyclopediaRef = CATEGORY_TO_ENCYCLOPEDIA[product.category];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleCopyFda = async () => {
    try {
      await navigator.clipboard.writeText(product.fdaNumber);
      setCopiedFda(true);
      setTimeout(() => setCopiedFda(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const qtyPreset = qty === 1 ? '1' : qty === 2 ? '2' : qty === 3 ? '3' : 'custom';

  return (
    <div className="min-h-screen bg-white text-textPrimary">
      {/* Subtle Top Architectural Bar */}
      <div className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary">
            <Link href="/" className="hover:text-textPrimary transition-colors">
              HOME
            </Link>
            <span>/</span>
            <Link href="/store" className="hover:text-textPrimary transition-colors">
              STORE
            </Link>
            <span>/</span>
            <Link
              href={`/store?category=${product.category}`}
              className="hover:text-textPrimary transition-colors"
            >
              {product.category}
            </Link>
            <span>/</span>
            <TextShimmer baseColor="#0E0E10" shimmerColor="#9A6E1C" className="font-semibold">
              {product.brand}
            </TextShimmer>
          </div>

          <Link
            href="/store"
            className="inline-flex items-center gap-1.5 text-xs text-textSecondary hover:text-textPrimary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับไปคอลเลกชันทั้งหมด</span>
          </Link>
        </div>
      </div>

      {/* Main Studio Container */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 lg:py-14 space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT: STICKY 3D TILT PEDESTAL & ARCHITECTURAL SPEC GRID (6 cols) */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
            <BlurFade inView={false}>
              <div style={{ perspective: 1100 }}>
                <motion.div
                  ref={stageRef}
                  onMouseMove={handleStageMouseMove}
                  onMouseEnter={() => setIsHoveringStage(true)}
                  onMouseLeave={handleStageMouseLeave}
                  style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                  className="relative aspect-[4/3.8] sm:aspect-square bg-white border border-border hover:border-textPrimary/35 hover:shadow-[0_28px_60px_-20px_rgba(14,14,16,0.14)] transition-shadow transition-colors duration-300 flex items-center justify-center p-10 sm:p-14 overflow-hidden group"
                >
                  {/* Subtle Corner Architectural Grid Frame */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-editorial-grid opacity-55"
                    style={{
                      maskImage:
                        'radial-gradient(circle at 50% 50%, transparent 48%, black 100%)',
                      WebkitMaskImage:
                        'radial-gradient(circle at 50% 50%, transparent 48%, black 100%)',
                    }}
                  />

                  {/* Cursor Champagne Gold Spotlight */}
                  <motion.div
                    aria-hidden="true"
                    style={{ background: spotlightBg }}
                    className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 ${
                      isHoveringStage ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Top-Left Scramble Brand Tag */}
                  <div className="absolute top-5 left-5 z-20 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em]">
                    <span className="px-2 py-0.5 bg-textPrimary text-white font-semibold">
                      AUTHENTIC
                    </span>
                    <TextScramble
                      text={product.brand}
                      className="text-textSecondary font-semibold"
                    />
                  </div>

                  {/* Top-Right Discount / Stock Status */}
                  <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
                    {isOutOfStock ? (
                      <span className="px-2.5 py-1 text-[10px] font-mono uppercase border border-red-200 bg-red-50 text-red-600 font-semibold">
                        OUT OF STOCK
                      </span>
                    ) : discountPercent > 0 ? (
                      <span className="px-2.5 py-1 text-[11px] font-mono border border-primary/35 bg-secondary text-primary font-semibold">
                        SAVE {discountPercent}%
                      </span>
                    ) : null}
                  </div>

                  {/* Pure White Studio Product Visual */}
                  <button
                    type="button"
                    onClick={() => product.imageUrl && !imageError && setLightboxOpen(true)}
                    className="relative z-10 w-full h-full flex items-center justify-center cursor-zoom-in focus:outline-none"
                    aria-label="ขยายดูรูปสินค้าขนาดใหญ่"
                  >
                    {product.imageUrl && !imageError ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={`max-h-[82%] max-w-[84%] object-contain transition-all duration-500 ease-out ${
                          isOutOfStock
                            ? 'opacity-45 grayscale'
                            : 'group-hover:scale-106 drop-shadow-[0_18px_28px_rgba(14,14,16,0.1)]'
                        }`}
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <SupplementIcon name={product.category} size="lg" />
                    )}
                  </button>

                  {/* Bottom-Left Badge & Bottom-Right Zoom Trigger */}
                  <div className="absolute inset-x-5 bottom-4 z-20 flex items-center justify-between gap-2">
                    {product.badge ? (
                      <span className="px-2.5 py-1 text-[10px] font-medium bg-white/90 backdrop-blur-xs border border-border text-textPrimary">
                        {product.badge}
                      </span>
                    ) : (
                      <span />
                    )}
                    {product.imageUrl && !imageError && (
                      <button
                        type="button"
                        onClick={() => setLightboxOpen(true)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono bg-white/95 border border-border hover:border-textPrimary text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
                      >
                        <ZoomIn className="w-3 h-3" />
                        <span>ขยายดูฉลาก</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>
            </BlurFade>

            {/* 4-Cell Architectural Bento Spec Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border border-border bg-white divide-y sm:divide-y-0 divide-x divide-border text-xs">
              <div className="p-3.5 space-y-1">
                <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-textSecondary">
                  ขนาดบรรจุ
                </div>
                <div className="font-mono font-semibold text-textPrimary truncate">
                  {product.size}
                </div>
              </div>
              <div className="p-3.5 space-y-1">
                <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-textSecondary">
                  จำนวนเสิร์ฟ
                </div>
                <div className="font-semibold text-textPrimary truncate">
                  {product.servings}
                </div>
              </div>
              <div className="p-3.5 space-y-1">
                <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-textSecondary">
                  เฉลี่ยต่อหน่วย
                </div>
                <div className="font-mono font-semibold text-primary">
                  {costPerServing ? `~฿${costPerServing} / เสิร์ฟ` : 'คุ้มค่า'}
                </div>
              </div>
              <div className="p-3.5 space-y-1">
                <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-textSecondary">
                  สถานะคลัง SQL
                </div>
                <div
                  className={`font-mono font-semibold ${
                    isOutOfStock
                      ? 'text-red-600'
                      : isLowStock
                      ? 'text-red-600'
                      : 'text-textPrimary'
                  }`}
                >
                  {isOutOfStock
                    ? 'สินค้าหมด'
                    : stockCount !== undefined
                    ? `${stockCount} ชิ้น`
                    : 'พร้อมส่ง'}
                </div>
              </div>
            </div>

            {/* Trust Assurance Strip */}
            <div className="border border-border bg-secondary/45 px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-textSecondary">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>นำเข้าถูกต้อง ฉลาก อย. แท้</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>รับ +{fitPointsEarned} FIT Points</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>ส่งฟรีทั่วไทยครบ ฿1,500</span>
              </div>
            </div>
          </div>

          {/* RIGHT: FLAGSHIP PURCHASE & CLINICAL DOSSIER STUDIO (6 cols) */}
          <div className="lg:col-span-6 space-y-7">
            {/* Editorial Title Block */}
            <BlurFade inView={false} delay={0.05}>
              <div className="space-y-3 pb-6 border-b border-border">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold">
                    {product.brand}
                    {product.subCategory ? ` · ${product.subCategory}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyFda}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-border bg-secondary/70 hover:border-textPrimary text-[10px] font-mono text-textPrimary transition-colors cursor-pointer"
                    title="คลิกเพื่อคัดลอกเลข อย."
                  >
                    {copiedFda ? (
                      <>
                        <Check className="w-3 h-3 text-primary" />
                        <span className="text-primary font-semibold">คัดลอกเลข อย. แล้ว</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3 h-3 text-primary" />
                        <span>อย. {product.fdaNumber}</span>
                        <Copy className="w-2.5 h-2.5 text-textSecondary" />
                      </>
                    )}
                  </button>
                </div>

                <h1 className="text-2xl sm:text-4xl font-semibold text-textPrimary tracking-[-0.025em] leading-[1.14]">
                  {product.name}
                </h1>
                <p className="text-sm text-textSecondary">{product.nameTH}</p>

                {/* Rating & Low Stock Indicator */}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                  <div className="inline-flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= Math.round(product.rating)
                              ? 'fill-primary text-primary'
                              : 'text-border'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-mono font-semibold text-textPrimary">
                      {Number(product.rating).toFixed(1)}
                    </span>
                    <span className="text-textSecondary">
                      ({product.reviewsCount.toLocaleString()} รีวิว)
                    </span>
                  </div>

                  {isLowStock && (
                    <>
                      <span className="text-border">|</span>
                      <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        เหลือเพียง {stockCount} ชิ้นในคลัง
                      </span>
                    </>
                  )}
                </div>
              </div>
            </BlurFade>

            {/* Live Pricing & Pack Selector Box */}
            <div className="border border-border bg-white p-6 space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary block">
                    ราคารวม ({qty} ชิ้น)
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-light font-mono text-textPrimary tracking-tight">
                      ฿<SlidingNumber value={totalPrice} />
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-base font-mono text-textSecondary line-through">
                        ฿{(Number(product.originalPrice) * qty).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  {savingsAmount > 0 && (
                    <div className="text-[11px] font-mono font-semibold text-primary">
                      ประหยัดทันที ฿{savingsAmount.toLocaleString()}
                    </div>
                  )}
                  <div className="text-[11px] font-mono text-textSecondary">
                    รับแต้มสะสม +{fitPointsEarned} FIT Points
                  </div>
                </div>
              </div>

              {/* Quick Pack Segmented Control (1 / 2 / 3 ชิ้น) */}
              {!isOutOfStock && maxAllowedQty >= 2 && (
                <div className="space-y-2 pt-3 border-t border-border/70">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary block">
                    เลือกจำนวนด่วน (QUICK PACK)
                  </span>
                  <SegmentedControl
                    layoutId="product-detail-pack-qty"
                    variant="sharp"
                    size="sm"
                    fullWidth
                    ariaLabel="เลือกจำนวนแพ็กด่วน"
                    options={[
                      { id: '1', label: '1 ชิ้น (มาตรฐาน)' },
                      ...(maxAllowedQty >= 2 ? [{ id: '2', label: '2 ชิ้น (คุ้มค่า)' }] : []),
                      ...(maxAllowedQty >= 3 ? [{ id: '3', label: '3 ชิ้น (สต็อกยาว)' }] : []),
                    ]}
                    value={qtyPreset === 'custom' ? '1' : qtyPreset}
                    onChange={(val) => setQty(Number(val))}
                  />
                </div>
              )}

              {/* Quantity Stepper + Primary Add CTA */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-1">
                {!isOutOfStock && (
                  <div className="inline-flex items-center justify-between border border-border bg-secondary/40">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="px-3.5 py-3 text-textPrimary hover:text-primary transition-colors cursor-pointer"
                      aria-label="ลดจำนวน"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-11 text-center text-sm font-mono font-semibold text-textPrimary">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(maxAllowedQty, q + 1))}
                      className="px-3.5 py-3 text-textPrimary hover:text-primary transition-colors cursor-pointer"
                      aria-label="เพิ่มจำนวน"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <motion.button
                  type="button"
                  whileTap={isOutOfStock ? undefined : { scale: 0.99 }}
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 px-6 text-xs sm:text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-colors ${
                    isOutOfStock
                      ? 'bg-secondary text-textSecondary cursor-not-allowed'
                      : justAdded
                      ? 'bg-primary text-white cursor-pointer'
                      : 'bg-textPrimary text-white hover:bg-primary cursor-pointer'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>เพิ่มลงตะกร้าเรียบร้อยแล้ว</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {isOutOfStock
                          ? 'สินค้าหมดชั่วคราว'
                          : `เพิ่มลงตะกร้า · ฿${totalPrice.toLocaleString()}`}
                      </span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Live Free-Shipping Progress Bar */}
              <div className="pt-3 border-t border-border/70 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1.5 text-textPrimary font-medium">
                    <Truck className="w-3.5 h-3.5 text-primary" />
                    {remainingForFreeShip === 0 ? (
                      <span className="text-primary font-semibold">
                        ออเดอร์นี้ได้รับสิทธิ์จัดส่งฟรีทันที
                      </span>
                    ) : (
                      <span>
                        เพิ่มอีก{' '}
                        <strong className="font-mono text-primary">
                          ฿{remainingForFreeShip.toLocaleString()}
                        </strong>{' '}
                        เพื่อรับสิทธิ์จัดส่งฟรี
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[10px] text-textSecondary">
                    {freeShipPct}%
                  </span>
                </div>
                <div className="h-1 w-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShipPct}%` }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>

              {/* Secondary AI Consultation Trigger */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-fit-ai'))}
                className="w-full py-2.5 px-4 border border-border bg-secondary/50 hover:bg-white hover:border-textPrimary text-xs font-medium text-textPrimary inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>ไม่แน่ใจว่าเหมาะกับเป้าหมายไหม? ถามผู้ช่วยจัดเซต AI</span>
              </button>
            </div>

            {/* Interactive 21st.dev Clinical Dossier Tabs */}
            <div className="border border-border bg-white">
              <div className="border-b border-border px-4">
                <AnimatedTabs
                  layoutId="product-detail-clinical-tabs"
                  variant="underline"
                  tabs={[
                    { id: 'highlights', label: 'จุดเด่น & สรรพคุณ' },
                    { id: 'dosage', label: 'วิธีรับประทาน' },
                    { id: 'safety', label: 'ความปลอดภัย & อย.' },
                  ]}
                  activeTab={activeTab}
                  onChange={(id) => setActiveTab(id as 'highlights' | 'dosage' | 'safety')}
                />
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'highlights' && (
                    <motion.div
                      key="highlights"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      {product.features.length > 0 && (
                        <div className="space-y-2.5">
                          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-textSecondary block">
                            CLINICAL HIGHLIGHTS
                          </span>
                          <div className="divide-y divide-border/70 border-y border-border/70">
                            {product.features.map((feat, idx) => (
                              <div
                                key={idx}
                                className="py-3 flex items-start gap-3 text-xs sm:text-[13px] text-textPrimary"
                              >
                                <span className="font-mono text-[10px] text-primary font-semibold pt-0.5 shrink-0">
                                  0{idx + 1}
                                </span>
                                <span className="leading-relaxed">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-secondary/60 border-l-2 border-primary space-y-1 text-xs">
                        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary font-semibold block">
                          เหมาะสำหรับใคร
                        </span>
                        <p className="text-textPrimary leading-relaxed">
                          {product.suitableFor || product.detail}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'dosage' && (
                    <motion.div
                      key="dosage"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5 text-xs"
                    >
                      <div className="flex items-start gap-3 p-4 border border-border bg-secondary/40">
                        <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary font-semibold block">
                            คำแนะนำการรับประทาน
                          </span>
                          <p className="text-textPrimary leading-relaxed text-[13px]">
                            {product.howToUse}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-1">
                        <Link
                          href="/calculator/protein"
                          className="inline-flex items-center gap-1.5 font-medium text-textPrimary hover:text-primary border-b border-textPrimary hover:border-primary pb-0.5 transition-colors"
                        >
                          <span>คำนวณปริมาณโปรตีนตามน้ำหนักและส่วนสูง</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>

                        {encyclopediaRef && (
                          <Link
                            href={`/supplements/${encyclopediaRef.slug}`}
                            className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{encyclopediaRef.label}</span>
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'safety' && (
                    <motion.div
                      key="safety"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 text-xs"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 border border-border divide-y sm:divide-y-0 sm:divide-x divide-border">
                        <div className="p-3.5 space-y-1">
                          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-textSecondary block">
                            เลขสารบบอาหาร (อย. ไทย)
                          </span>
                          <span className="font-mono font-semibold text-sm text-textPrimary">
                            {product.fdaNumber}
                          </span>
                        </div>
                        <div className="p-3.5 space-y-1">
                          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-textSecondary block">
                            การเก็บรักษา
                          </span>
                          <span className="text-textPrimary font-medium">
                            เก็บในที่แห้ง อุณหภูมิต่ำกว่า 30°C พ้นแสงแดด
                          </span>
                        </div>
                      </div>

                      <p className="text-textSecondary leading-relaxed">
                        ผลิตภัณฑ์เสริมอาหารไม่มีผลในการป้องกันหรือรักษาโรค ควรรับประทานอาหารหลักให้หลากหลายครบ 5 หมู่ และหากมีโรคประจำตัว ตั้งครรภ์ หรือใช้ยาประจำ ควรปรึกษาแพทย์ก่อนรับประทาน
                      </p>

                      <Link
                        href="/safety"
                        className="inline-flex items-center gap-1.5 font-medium text-textPrimary hover:text-primary border-b border-textPrimary hover:border-primary pb-0.5 transition-colors"
                      >
                        <Package className="w-3.5 h-3.5 text-primary" />
                        <span>อ่านคู่มือความปลอดภัยและข้อห้ามใช้ฉบับเต็ม</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products (4-Col 3D Tilt Cards) */}
        {relatedProducts.length > 0 && (
          <section className="pt-12 border-t border-border space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold block">
                  CURATED COMPANIONS
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-textPrimary tracking-tight">
                  สินค้าใกล้เคียงในหมวดเดียวกัน
                </h2>
              </div>
              <Link
                href={`/store?category=${product.category}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-textPrimary hover:text-primary border-b border-textPrimary hover:border-primary pb-0.5 transition-colors"
              >
                <span>ดูทั้งหมดในหมวดนี้</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* High-Res Label Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && product.imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white border border-border shadow-2xl max-w-3xl w-full p-6 sm:p-10 space-y-4"
            >
              <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary font-semibold block">
                    {product.brand} · อย. {product.fdaNumber}
                  </span>
                  <h3 className="text-sm font-semibold text-textPrimary truncate">
                    {product.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="p-1.5 border border-border text-textSecondary hover:text-textPrimary cursor-pointer"
                  aria-label="ปิดภาพขยาย"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="h-[60vh] bg-white flex items-center justify-center p-4">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
