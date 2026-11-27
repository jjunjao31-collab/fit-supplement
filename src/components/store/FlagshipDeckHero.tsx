'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ShoppingBag,
  Check,
  ShieldCheck,
  Star,
  MoveHorizontal,
} from 'lucide-react';
import type { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import TextShimmer from '@/components/ui/TextShimmer';
import TextScramble from '@/components/ui/TextScramble';
import SlidingNumber from '@/components/ui/SlidingNumber';

interface FlagshipDeckHeroProps {
  products: Product[];
}

const FLAGSHIP_IDS = [
  'prod-baam-iso-zero',
  'prod-on-gold-whey',
  'prod-dymatize-iso100',
  'prod-vx-iso-pro',
  'prod-plantae-complete',
];

/**
 * 21st.dev Interactive 3D Stacked Card Carousel (inspired by ShadcnSpace / Ruixen & Card Fan)
 * Draggable fanned product deck synced live with an editorial flagship dossier
 */
export default function FlagshipDeckHero({ products }: FlagshipDeckHeroProps) {
  const { addToCart } = useCart();
  const [activeIndex, setActiveIndex] = useState(0);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const deck = useMemo(() => {
    const picked = FLAGSHIP_IDS.map((id) => products.find((p) => p.id === id)).filter(
      (p): p is Product => Boolean(p)
    );
    return picked.length >= 3 ? picked : products.slice(0, 5);
  }, [products]);

  const safeIndex = deck.length > 0 ? activeIndex % deck.length : 0;
  const activeProduct = deck[safeIndex];

  const handleNext = () => {
    if (deck.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % deck.length);
  };

  const handlePrev = () => {
    if (deck.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + deck.length) % deck.length);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -65 || info.velocity.x < -300) {
      handleNext();
    } else if (info.offset.x > 65 || info.velocity.x > 300) {
      handlePrev();
    }
  };

  const handleQuickAdd = (product: Product) => {
    const out = !product.inStock || (typeof product.stock === 'number' && product.stock <= 0);
    if (out) return;
    addToCart(product, 1);
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1400);
  };

  if (!activeProduct) return null;

  const isOutOfStock =
    !activeProduct.inStock ||
    (typeof activeProduct.stock === 'number' && activeProduct.stock <= 0);
  const discount =
    activeProduct.originalPrice > activeProduct.price
      ? Math.round(
          ((activeProduct.originalPrice - activeProduct.price) / activeProduct.originalPrice) * 100
        )
      : 0;
  const features = Array.isArray(activeProduct.features) ? activeProduct.features.slice(0, 3) : [];

  return (
    <section className="relative overflow-hidden bg-white border-b border-border">
      {/* Subtle 64px Editorial Grid Mask */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-editorial-grid"
        style={{
          maskImage:
            'radial-gradient(ellipse 80% 70% at 72% 45%, black 15%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 72% 45%, black 15%, transparent 78%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-14 sm:pt-14 sm:pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* LEFT: Monumental Storefront Header + Live Synced Flagship Dossier (6 cols) */}
          <div className="lg:col-span-6 space-y-7">
            {/* Breadcrumb & Shimmer Eyebrow */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-mono uppercase tracking-[0.22em] text-textSecondary">
                <Link href="/" className="hover:text-textPrimary transition-colors">
                  HOME
                </Link>
                <span>/</span>
                <TextShimmer baseColor="#0E0E10" shimmerColor="#9A6E1C" duration={2.8} className="font-semibold">
                  {`OFFICIAL STORE · ${products.length} VERIFIED SKUS`}
                </TextShimmer>
              </div>
              <h1 className="text-3xl sm:text-5xl font-semibold text-textPrimary tracking-[-0.03em] leading-[1.08]">
                คอลเลกชันอาหารเสริม
              </h1>
              <p className="text-xs sm:text-sm text-textSecondary leading-relaxed max-w-lg">
                คัดเฉพาะผลิตภัณฑ์แท้ 100% มีเลข อย. ไทยรับรองครบทุกรายการ · ส่งฟรีเมื่อครบ ฿1,500 · สะสมแต้ม FIT Points 5%
              </p>
            </div>

            {/* Live Active Flagship Dossier Card */}
            <div className="border-t border-border pt-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-[0.2em]">
                  <span className="px-2 py-0.5 bg-textPrimary text-white font-semibold">
                    FLAGSHIP {String(safeIndex + 1).padStart(2, '0')} / {String(deck.length).padStart(2, '0')}
                  </span>
                  <TextScramble
                    text={activeProduct.subCategory || activeProduct.brand}
                    className="text-primary font-semibold"
                  />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-textSecondary">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  อย. {activeProduct.fdaNumber}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProduct.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-textSecondary">
                      {activeProduct.brand} · {activeProduct.size}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-textPrimary tracking-tight leading-snug">
                      {activeProduct.name}
                    </h2>
                    <p className="text-xs text-textSecondary">{activeProduct.nameTH}</p>
                  </div>

                  {/* Key Clinical Bullets */}
                  {features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] border border-border bg-secondary/70 text-textPrimary"
                        >
                          <Check className="w-3 h-3 text-primary shrink-0" />
                          <span>{feat}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price + Rating Row */}
                  <div className="flex flex-wrap items-baseline justify-between gap-4 pt-1">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-3xl font-light font-mono text-textPrimary tracking-tight">
                        ฿<SlidingNumber value={activeProduct.price} />
                      </span>
                      {activeProduct.originalPrice > activeProduct.price && (
                        <span className="text-sm font-mono text-textSecondary line-through">
                          ฿{activeProduct.originalPrice.toLocaleString()}
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-mono font-semibold border border-primary/40 bg-primary/10 text-primary">
                          ประหยัด {discount}%
                        </span>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-textPrimary">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      <span className="font-semibold">{activeProduct.rating.toFixed(1)}</span>
                      <span className="text-textSecondary">
                        ({activeProduct.reviewsCount.toLocaleString()} รีวิว)
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Action Row + Deck Step Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => handleQuickAdd(activeProduct)}
                    className={`px-6 py-3 text-xs font-medium tracking-wide inline-flex items-center gap-2 transition-colors ${
                      isOutOfStock
                        ? 'bg-secondary text-textSecondary cursor-not-allowed'
                        : justAddedId === activeProduct.id
                        ? 'bg-primary text-white cursor-pointer'
                        : 'bg-textPrimary text-white hover:bg-primary cursor-pointer'
                    }`}
                  >
                    {justAddedId === activeProduct.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>เพิ่มลงตะกร้าแล้ว</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{isOutOfStock ? 'สินค้าหมดชั่วคราว' : 'เพิ่มลงตะกร้า'}</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/store/${activeProduct.id}`}
                    className="px-4 py-3 border border-border bg-white hover:border-textPrimary text-xs font-medium text-textPrimary inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>ดูรายละเอียด</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                  </Link>
                </div>

                {/* Tactile Prev / Next Deck Switcher */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="สินค้าเด่นก่อนหน้า"
                    className="w-9 h-9 border border-border bg-white hover:border-textPrimary hover:bg-secondary text-textPrimary flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="สินค้าเด่นถัดไป"
                    className="w-9 h-9 border border-border bg-white hover:border-textPrimary hover:bg-secondary text-textPrimary flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Minimal Hairline Progress Index */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                {deck.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`เลือกดู ${item.name}`}
                    className="group py-2 text-left cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`h-[2px] w-full transition-colors duration-300 ${
                        idx === safeIndex
                          ? 'bg-primary'
                          : 'bg-border group-hover:bg-textPrimary/40'
                      }`}
                    />
                    <span
                      className={`block mt-1.5 text-[9px] font-mono truncate transition-colors ${
                        idx === safeIndex
                          ? 'text-textPrimary font-semibold'
                          : 'text-textSecondary/70 group-hover:text-textPrimary'
                      }`}
                    >
                      0{idx + 1} · {item.brand.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Interactive 3D Fanned Stacked Card Deck (6 cols) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] h-[390px] sm:h-[430px] flex items-center justify-center select-none">
              {/* Soft Architectural Halo Ring behind Deck */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute w-[320px] h-[320px] sm:w-[360px] sm:h-[360px] rounded-full border border-border/80 bg-secondary/45"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute w-[250px] h-[250px] sm:w-[280px] sm:h-[280px] rounded-full border border-primary/20"
              />

              {/* Stacked Cards */}
              {deck.map((cardProduct, idx) => {
                const offset = (idx - safeIndex + deck.length) % deck.length;
                const isFront = offset === 0;
                const isVisible = offset <= 3;

                if (!isVisible) return null;

                // Fanned 3D positions for cards behind the active card
                const fanConfigs = [
                  { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 30 },
                  { x: 34, y: 12, rotate: 6, scale: 0.93, opacity: 0.92, zIndex: 20 },
                  { x: -30, y: 20, rotate: -5.5, scale: 0.87, opacity: 0.8, zIndex: 10 },
                  { x: 54, y: 28, rotate: 10, scale: 0.81, opacity: 0.55, zIndex: 5 },
                ];
                const cfg = fanConfigs[offset] || fanConfigs[3];

                return (
                  <motion.div
                    key={cardProduct.id}
                    drag={isFront ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.45}
                    onDragEnd={isFront ? handleDragEnd : undefined}
                    onClick={() => {
                      if (!isFront) setActiveIndex(idx);
                    }}
                    animate={{
                      x: cfg.x,
                      y: cfg.y,
                      rotate: cfg.rotate,
                      scale: cfg.scale,
                      opacity: cfg.opacity,
                    }}
                    whileHover={
                      isFront
                        ? { y: -4 }
                        : { scale: cfg.scale + 0.02, y: cfg.y - 4 }
                    }
                    whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
                    transition={{
                      type: 'spring',
                      stiffness: 320,
                      damping: 28,
                    }}
                    style={{ zIndex: cfg.zIndex }}
                    className={`absolute w-[275px] sm:w-[310px] h-[345px] sm:h-[380px] bg-white border p-5 sm:p-6 flex flex-col justify-between transition-shadow ${
                      isFront
                        ? 'border-textPrimary/25 shadow-[0_24px_60px_-15px_rgba(14,14,16,0.16)] cursor-grab active:cursor-grabbing'
                        : 'border-border shadow-[0_14px_30px_-12px_rgba(14,14,16,0.08)] cursor-pointer'
                    }`}
                  >
                    {/* Top Card Index */}
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em]">
                      <span className="text-primary font-semibold">
                        0{idx + 1} · {cardProduct.brand.split(' ')[0]}
                      </span>
                      <span className="text-textSecondary">{cardProduct.size}</span>
                    </div>

                    {/* Pure White Studio Product Image */}
                    <div className="flex-1 flex items-center justify-center my-3 pointer-events-none">
                      <img
                        src={cardProduct.imageUrl}
                        alt={cardProduct.name}
                        draggable={false}
                        className="max-h-[205px] sm:max-h-[230px] max-w-[88%] object-contain drop-shadow-[0_12px_18px_rgba(14,14,16,0.08)]"
                      />
                    </div>

                    {/* Bottom Strip */}
                    <div className="pt-3 border-t border-border/80 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-textPrimary truncate">
                          {cardProduct.name}
                        </div>
                        <div className="text-[10px] font-mono text-textSecondary">
                          {cardProduct.badge}
                        </div>
                      </div>
                      <div className="text-sm font-mono font-semibold text-textPrimary shrink-0">
                        ฿{cardProduct.price.toLocaleString()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Subtle Drag Hint */}
            <div className="mt-2 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary">
              <MoveHorizontal className="w-3.5 h-3.5 text-primary" />
              <span>ลากการ์ดซ้าย-ขวา หรือคลิกการ์ดด้านหลังเพื่อสลับ</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
