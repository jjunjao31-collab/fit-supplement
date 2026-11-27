'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from 'framer-motion';
import {
  ShoppingBag,
  ShieldCheck,
  Check,
  Star,
  Eye,
  X,
  Minus,
  Plus,
  ArrowUpRight,
  Package,
} from 'lucide-react';
import type { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import SupplementIcon from '@/components/ui/SupplementIcon';

interface ProductCardProps {
  product: Product;
  variant?: 'gallery' | 'editorial';
}

/**
 * 21st.dev 3D Perspective Tilt + Cursor Spotlight Product Card (inspired by @tom_ui Tilt Card)
 * Supports both 4-column Gallery mode and 2-column Editorial Luxury mode
 */
export default function ProductCard({
  product,
  variant = 'gallery',
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickQty, setQuickQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);

  // 21st.dev 3D Tilt & Cursor Spotlight Motion Values
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const spotX = useMotionValue(140);
  const spotY = useMotionValue(140);

  const rotateX = useSpring(rawRotateX, { stiffness: 260, damping: 24 });
  const rotateY = useSpring(rawRotateY, { stiffness: 260, damping: 24 });

  const spotlightBg = useMotionTemplate`radial-gradient(260px circle at ${spotX}px ${spotY}px, rgba(154, 110, 28, 0.09), transparent 72%)`;

  const stockCount = typeof product.stock === 'number' ? product.stock : undefined;
  const isOutOfStock = !product.inStock || (stockCount !== undefined && stockCount <= 0);
  const isLowStock = !isOutOfStock && stockCount !== undefined && stockCount <= 15;
  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  useEffect(() => {
    if (!quickViewOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickViewOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [quickViewOpen]);

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;

    rawRotateX.set(py * -9);
    rawRotateY.set(px * 9);
    spotX.set(x);
    spotY.set(y);
  };

  const handleStageMouseLeave = () => {
    setIsHovering(false);
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  const handleQuickAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleModalAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, quickQty);
    setQuickViewOpen(false);
    setQuickQty(1);
  };

  const features = Array.isArray(product.features) ? product.features : [];

  return (
    <>
      {variant === 'editorial' ? (
        /* ==================== 2-COL EDITORIAL MAGAZINE CARD ==================== */
        <motion.article
          layout
          onMouseMove={handleStageMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={handleStageMouseLeave}
          ref={stageRef}
          style={{
            perspective: 1000,
          }}
          className="group relative border border-border hover:border-textPrimary/40 bg-white transition-all duration-300 hover:shadow-[0_20px_48px_-18px_rgba(14,14,16,0.12)] grid grid-cols-1 sm:grid-cols-12 overflow-hidden"
        >
          {/* Cursor Spotlight Layer */}
          <motion.div
            aria-hidden="true"
            style={{ background: spotlightBg }}
            className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 ${
              isHovering ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Left: Pure White 3D Tilt Studio Stage */}
          <div className="sm:col-span-5 relative bg-white sm:border-r border-b sm:border-b-0 border-border p-6 flex items-center justify-center min-h-[240px]">
            <span className="absolute top-3.5 left-4 text-[10px] font-mono uppercase tracking-[0.16em] text-textSecondary truncate max-w-[70%]">
              {product.brand}
            </span>
            {isOutOfStock ? (
              <span className="absolute top-3.5 right-4 text-[10px] font-mono text-red-600 font-semibold">
                หมดชั่วคราว
              </span>
            ) : discountPercent > 0 ? (
              <span className="absolute top-3.5 right-4 text-[10px] font-mono text-primary font-semibold">
                -{discountPercent}%
              </span>
            ) : null}

            <Link
              href={`/store/${product.id}`}
              className="w-full h-full flex items-center justify-center"
              aria-label={`ดูรายละเอียด ${product.name}`}
            >
              <motion.div
                style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                className="w-full h-full flex items-center justify-center"
              >
                {product.imageUrl && !imageError ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className={`max-h-[185px] max-w-[85%] object-contain transition-transform duration-500 ease-out ${
                      isOutOfStock
                        ? 'opacity-40 grayscale'
                        : 'group-hover:scale-108 drop-shadow-[0_12px_20px_rgba(14,14,16,0.08)]'
                    }`}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <SupplementIcon name={product.category} size="lg" />
                )}
              </motion.div>
            </Link>
          </div>

          {/* Right: Editorial Clinical Dossier & Direct Actions */}
          <div className="sm:col-span-7 p-6 flex flex-col justify-between gap-4 relative z-20">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-textSecondary">
                <span className="text-primary font-semibold uppercase tracking-[0.14em] truncate">
                  {product.subCategory || product.category}
                </span>
                <span className="shrink-0">อย. {product.fdaNumber}</span>
              </div>

              <Link href={`/store/${product.id}`} className="block space-y-1">
                <h3 className="text-base sm:text-lg font-semibold text-textPrimary group-hover:text-primary transition-colors leading-snug line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-xs text-textSecondary line-clamp-1">{product.nameTH}</p>
              </Link>

              {features.length > 0 && (
                <ul className="space-y-1 pt-1">
                  {features.slice(0, 2).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-textPrimary">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{feat}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pt-3 border-t border-border space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-mono font-semibold text-textPrimary">
                    ฿{Number(product.price).toLocaleString()}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-xs font-mono text-textSecondary/70 line-through">
                      ฿{Number(product.originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-textSecondary">
                  <span>{product.size}</span>
                  <span className="inline-flex items-center gap-0.5 text-textPrimary">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    {Number(product.rating).toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleQuickAdd}
                  className={`flex-1 py-2.5 px-4 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    isOutOfStock
                      ? 'bg-secondary text-textSecondary cursor-not-allowed'
                      : justAdded
                      ? 'bg-primary text-white cursor-pointer'
                      : 'bg-textPrimary text-white hover:bg-primary cursor-pointer'
                  }`}
                >
                  {isOutOfStock ? (
                    <span>สินค้าหมด</span>
                  ) : justAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>เพิ่มแล้ว</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>เพิ่มลงตะกร้า</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickQty(1);
                    setQuickViewOpen(true);
                  }}
                  aria-label={`ดูด่วน ${product.name}`}
                  className="px-3 py-2.5 border border-border bg-white hover:border-textPrimary text-xs text-textPrimary inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>ดูด่วน</span>
                </button>
              </div>
            </div>
          </div>
        </motion.article>
      ) : (
        /* ==================== 4-COL 3D TILT SPOTLIGHT GALLERY CARD ==================== */
        <motion.article layout className="group flex flex-col">
          {/* 3D Perspective Tilt Wrapper */}
          <div style={{ perspective: 900 }}>
            <motion.div
              ref={stageRef}
              onMouseMove={handleStageMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={handleStageMouseLeave}
              style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }}
              className="relative aspect-[4/4.35] bg-white border border-border group-hover:border-textPrimary/40 group-hover:shadow-[0_22px_48px_-18px_rgba(14,14,16,0.14)] transition-shadow transition-colors duration-300 flex items-center justify-center p-7 overflow-hidden"
            >
              {/* Cursor-Tracking Champagne Gold Spotlight */}
              <motion.div
                aria-hidden="true"
                style={{ background: spotlightBg }}
                className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 ${
                  isHovering ? 'opacity-100' : 'opacity-0'
                }`}
              />

              <Link
                href={`/store/${product.id}`}
                className="w-full h-full flex items-center justify-center relative z-10"
                aria-label={`ดูรายละเอียด ${product.name}`}
              >
                {product.imageUrl && !imageError ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className={`max-h-[82%] max-w-[82%] object-contain transition-all duration-500 ease-out ${
                      isOutOfStock
                        ? 'opacity-40 grayscale'
                        : 'group-hover:scale-108 group-hover:-translate-y-2 drop-shadow-[0_10px_18px_rgba(14,14,16,0.06)] group-hover:drop-shadow-[0_18px_24px_rgba(14,14,16,0.12)]'
                    }`}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <SupplementIcon name={product.category} size="lg" />
                )}
              </Link>

              {/* Quiet Editorial Brand Top-Left */}
              <span className="absolute top-3.5 left-4 z-20 text-[10px] font-mono uppercase tracking-[0.16em] text-textSecondary/85 max-w-[65%] truncate">
                {product.brand}
              </span>

              {/* Quiet Status Top-Right */}
              {isOutOfStock ? (
                <span className="absolute top-3.5 right-4 z-20 text-[10px] font-mono uppercase tracking-wider text-red-600 font-semibold">
                  หมดชั่วคราว
                </span>
              ) : discountPercent > 0 ? (
                <span className="absolute top-3.5 right-4 z-20 px-1.5 py-0.5 text-[10px] font-mono text-primary bg-secondary border border-primary/25 font-semibold">
                  -{discountPercent}%
                </span>
              ) : null}

              {/* Sliding Hover Clinical Spec + Quick-Action Drawer */}
              <div className="absolute inset-x-0 bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-border translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                {features[0] && (
                  <div className="px-3 py-1.5 border-b border-border/70 bg-secondary/60 flex items-center justify-between gap-2 text-[10px]">
                    <span className="text-textPrimary font-medium truncate">
                      {features[0]}
                    </span>
                    <span className="font-mono text-textSecondary shrink-0">
                      อย. {product.fdaNumber.slice(-4)}
                    </span>
                  </div>
                )}

                <div className="p-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleQuickAdd}
                    className={`flex-1 py-2 px-3 text-[11px] font-medium tracking-wide flex items-center justify-center gap-1.5 transition-colors ${
                      isOutOfStock
                        ? 'bg-secondary text-textSecondary cursor-not-allowed'
                        : justAdded
                        ? 'bg-primary text-white cursor-pointer'
                        : 'bg-textPrimary text-white hover:bg-primary cursor-pointer'
                    }`}
                  >
                    {isOutOfStock ? (
                      <span>สินค้าหมด</span>
                    ) : justAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>เพิ่มแล้ว</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>เพิ่มลงตะกร้า</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuickQty(1);
                      setQuickViewOpen(true);
                    }}
                    aria-label={`ดูด่วน ${product.name}`}
                    title="ดูข้อมูลและวิธีรับประทาน"
                    className="p-2 border border-border bg-white hover:border-textPrimary text-textPrimary transition-colors cursor-pointer shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Floating Minimalist Editorial Metadata Below Image */}
          <div className="pt-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/store/${product.id}`} className="min-w-0 space-y-0.5 flex-1">
                <h3 className="text-sm font-medium text-textPrimary group-hover:text-primary transition-colors leading-snug line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-textSecondary line-clamp-1">
                  {product.nameTH}
                </p>
              </Link>

              <div className="text-right shrink-0">
                <div className="text-sm font-mono font-semibold text-textPrimary">
                  ฿{Number(product.price).toLocaleString()}
                </div>
                {product.originalPrice > product.price && (
                  <div className="text-[11px] font-mono text-textSecondary/70 line-through leading-none mt-0.5">
                    ฿{Number(product.originalPrice).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-1.5 border-t border-border/70 flex items-center justify-between gap-2 text-[11px] text-textSecondary">
              <div className="flex items-center gap-2 min-w-0 font-mono">
                <span className="truncate">{product.size}</span>
                <span className="text-border">·</span>
                <span className="inline-flex items-center gap-0.5 text-textPrimary shrink-0">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <span>{Number(product.rating).toFixed(1)}</span>
                </span>
                {isLowStock && (
                  <span className="text-[10px] text-red-600 font-sans font-medium">
                    (เหลือ {stockCount})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setQuickQty(1);
                    setQuickViewOpen(true);
                  }}
                  className="text-[11px] text-textSecondary hover:text-primary transition-colors cursor-pointer sm:hidden"
                >
                  ดูด่วน
                </button>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleQuickAdd}
                  aria-label={`เพิ่ม ${product.name} ลงตะกร้า`}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                    isOutOfStock
                      ? 'border-border text-textSecondary/40 cursor-not-allowed'
                      : justAdded
                      ? 'bg-primary border-primary text-white cursor-pointer'
                      : 'border-border text-textPrimary hover:bg-textPrimary hover:text-white hover:border-textPrimary cursor-pointer'
                  }`}
                >
                  {justAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </motion.article>
      )}

      {/* Minimal Quick-View Modal */}
      {quickViewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setQuickViewOpen(false)}
        >
          <div
            className="bg-white border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                  {product.brand} · อย. {product.fdaNumber}
                </span>
                <h2 className="text-lg sm:text-xl font-semibold text-textPrimary leading-snug">
                  {product.name}
                </h2>
                <p className="text-xs text-textSecondary">{product.nameTH}</p>
              </div>
              <button
                type="button"
                onClick={() => setQuickViewOpen(false)}
                className="p-1.5 text-textSecondary hover:text-textPrimary cursor-pointer shrink-0"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-7">
              <div className="sm:col-span-5 space-y-4">
                <div className="aspect-square bg-white border border-border flex items-center justify-center p-5">
                  {product.imageUrl && !imageError ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <SupplementIcon name={product.category} size="lg" />
                  )}
                </div>

                <div className="grid grid-cols-2 border border-border divide-x divide-border text-xs">
                  <div className="p-3">
                    <div className="text-[10px] font-mono uppercase text-textSecondary">ขนาด</div>
                    <div className="font-mono font-medium text-textPrimary mt-0.5">{product.size}</div>
                  </div>
                  <div className="p-3">
                    <div className="text-[10px] font-mono uppercase text-textSecondary">เสิร์ฟ</div>
                    <div className="font-medium text-textPrimary mt-0.5">{product.servings}</div>
                  </div>
                </div>

                {stockCount !== undefined && (
                  <div className="flex items-center gap-2 text-xs text-textSecondary">
                    <Package className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {isOutOfStock ? 'สินค้าหมดชั่วคราว' : `สต็อกพร้อมส่ง ${stockCount} ชิ้น`}
                    </span>
                  </div>
                )}
              </div>

              <div className="sm:col-span-7 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-mono font-semibold text-textPrimary">
                      ฿{Number(product.price).toLocaleString()}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm font-mono text-textSecondary line-through">
                        ฿{Number(product.originalPrice).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {features.length > 0 && (
                    <ul className="space-y-1.5 border-y border-border py-3.5">
                      {features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-textPrimary">
                          <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-primary font-semibold block mb-1">
                        เหมาะสำหรับ
                      </span>
                      <p className="text-textSecondary leading-relaxed">{product.suitableFor}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-primary font-semibold block mb-1">
                        วิธีรับประทาน
                      </span>
                      <p className="text-textSecondary leading-relaxed">{product.howToUse}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-3">
                    {!isOutOfStock && (
                      <div className="inline-flex items-center border border-border">
                        <button
                          type="button"
                          onClick={() => setQuickQty((q) => Math.max(1, q - 1))}
                          className="p-2.5 text-textPrimary hover:text-primary cursor-pointer"
                          aria-label="ลดจำนวน"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-xs font-mono font-semibold text-textPrimary">
                          {quickQty}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuickQty((q) =>
                              stockCount !== undefined ? Math.min(stockCount, q + 1) : q + 1
                            )
                          }
                          className="p-2.5 text-textPrimary hover:text-primary cursor-pointer"
                          aria-label="เพิ่มจำนวน"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={handleModalAdd}
                      className={`flex-1 py-2.5 px-5 text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-colors ${
                        isOutOfStock
                          ? 'bg-secondary text-textSecondary cursor-not-allowed'
                          : 'bg-textPrimary text-white hover:bg-primary cursor-pointer'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? 'สินค้าหมดชั่วคราว' : 'เพิ่มลงตะกร้า'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="inline-flex items-center gap-1.5 text-textSecondary">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      <span>รับประกันของแท้ 100%</span>
                    </span>
                    <Link
                      href={`/store/${product.id}`}
                      onClick={() => setQuickViewOpen(false)}
                      className="inline-flex items-center gap-1 font-medium text-textPrimary hover:text-primary transition-colors"
                    >
                      <span>ดูหน้าสินค้าเต็ม</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
