'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Plus, Check } from 'lucide-react';
import { products as staticProducts, type Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import TextEffect from '@/components/ui/TextEffect';
import TextShimmer from '@/components/ui/TextShimmer';
import WordRotate from '@/components/ui/WordRotate';
import TextScramble from '@/components/ui/TextScramble';
import BlurFade from '@/components/ui/BlurFade';

const LOOKBOOK_SLOTS = [
  { id: 'prod-on-gold-whey', index: '01', categoryLabel: 'WHEY STANDARD' },
  { id: 'prod-dymatize-iso100', index: '02', categoryLabel: 'HYDROLYZED ISOLATE' },
  { id: 'prod-plantae-complete', index: '03', categoryLabel: 'PLANT COMPLETE' },
];

/**
 * 21st.dev Hero Minimalism
 * Monumental restrained typography + architectural hairline lookbook of real flagship products
 */
export default function HeroSection() {
  const { addToCart } = useCart();
  const [liveProducts, setLiveProducts] = useState<Product[]>(staticProducts);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLiveProducts(data);
        }
      })
      .catch(() => {
        // คงข้อมูลเริ่มต้นไว้
      });
  }, []);

  const lookbookItems = LOOKBOOK_SLOTS.map((slot) => ({
    ...slot,
    product: liveProducts.find((p) => p.id === slot.id),
  })).filter((item): item is typeof item & { product: Product } => Boolean(item.product));

  const handleQuickAdd = (product: Product) => {
    const out =
      !product.inStock || (typeof product.stock === 'number' && product.stock <= 0);
    if (out) return;
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <section className="relative overflow-hidden hero-gradient border-b border-border">
      {/* Subtle 64px Architectural Grid Fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-editorial-grid"
        style={{
          maskImage:
            'radial-gradient(ellipse 75% 55% at 50% 15%, black 10%, transparent 72%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 75% 55% at 50% 15%, black 10%, transparent 72%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-16 sm:pt-24 sm:pb-24 relative z-10">
        {/* Centered Monumental Minimalist Headline */}
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <BlurFade inView={false} delay={0}>
            <div className="inline-flex items-center justify-center text-[11px] font-semibold uppercase tracking-[0.24em]">
              <TextShimmer baseColor="#0E0E10" shimmerColor="#8F8C84" duration={3}>
                CLINICAL SPORTS NUTRITION · AIS · ISSN · อย. ไทย
              </TextShimmer>
            </div>
          </BlurFade>

          <h1 className="text-4xl sm:text-6xl lg:text-[4.25rem] font-semibold tracking-[-0.03em] text-textPrimary leading-[1.12]">
            <TextEffect
              delay={0.05}
              segments={[
                { text: 'โภชนาการกีฬา.' },
              ]}
              className="block"
            />
            <span className="inline-flex flex-wrap items-baseline justify-center gap-x-2 mt-1">
              <TextEffect
                delay={0.16}
                segments={[{ text: 'เลือกด้วย' }]}
                className="inline-block"
              />
              <WordRotate
                words={[
                  'วิทยาศาสตร์จริง',
                  'หลักฐานงานวิจัย',
                  'มาตรฐาน อย. ไทย',
                  'ปริมาณที่แม่นยำ',
                ]}
                duration={2800}
                className="text-textPrimary"
              />
            </span>
          </h1>

          <BlurFade inView={false} delay={0.28}>
            <p className="text-sm sm:text-base text-textPrimary/80 leading-relaxed max-w-xl mx-auto font-normal">
              ร้านค้าทางการและสารานุกรมอาหารเสริมที่คัดเฉพาะผลิตภัณฑ์แท้มีเลข อย. อธิบายชัดทั้งประโยชน์ ข้อจำกัด และปริมาณที่เหมาะสมตามสรีระของคุณ
            </p>
          </BlurFade>

          <BlurFade inView={false} delay={0.36}>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/store"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-textPrimary hover:bg-primary text-white text-xs sm:text-[13px] font-medium tracking-wide transition-colors duration-250"
              >
                <span>เข้าชมคอลเลกชันสินค้า</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/calculator/protein"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-secondary border border-border hover:border-textPrimary/30 text-textPrimary text-xs sm:text-[13px] font-medium transition-colors duration-250"
              >
                <span>คำนวณโปรตีนต่อวัน</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
              </Link>
            </div>
          </BlurFade>
        </div>

        {/* Architectural 3-Column Museum Lookbook Strip */}
        <BlurFade inView={false} delay={0.44} className="mt-14 sm:mt-20">
          <div className="border border-border bg-white grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {lookbookItems.map(({ index, categoryLabel, product }) => {
              const isAdded = addedId === product.id;
              return (
                <div
                  key={product.id}
                  className="group relative p-6 sm:p-8 flex flex-col justify-between bg-white hover:bg-secondary/45 transition-colors duration-300"
                >
                  {/* Top Editorial Index */}
                  <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.2em] uppercase text-textSecondary">
                    <TextScramble text={`${index} / ${categoryLabel}`} />
                    <span className="text-primary">อย. {product.fdaNumber}</span>
                  </div>

                  {/* Pure White Studio Product Image */}
                  <Link
                    href={`/store/${product.id}`}
                    className="my-7 h-52 sm:h-56 flex items-center justify-center"
                    aria-label={`ดูรายละเอียด ${product.name}`}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="max-h-full max-w-[78%] object-contain transition-transform duration-500 ease-out group-hover:scale-106"
                    />
                  </Link>

                  {/* Bottom Minimalist Info + Direct Add */}
                  <div className="pt-4 border-t border-border/80 flex items-end justify-between gap-4">
                    <Link href={`/store/${product.id}`} className="min-w-0 space-y-0.5">
                      <div className="text-[11px] text-textSecondary font-medium truncate">
                        {product.brand} · {product.size}
                      </div>
                      <div className="text-sm font-semibold text-textPrimary group-hover:text-primary transition-colors truncate">
                        {product.name}
                      </div>
                      <div className="text-sm font-mono font-semibold text-textPrimary pt-0.5">
                        ฿{Number(product.price).toLocaleString()}
                      </div>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleQuickAdd(product)}
                      aria-label={`เพิ่ม ${product.name} ลงตะกร้า`}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${
                        isAdded
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-border text-textPrimary hover:bg-textPrimary hover:text-white hover:border-textPrimary'
                      }`}
                    >
                      {isAdded ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
