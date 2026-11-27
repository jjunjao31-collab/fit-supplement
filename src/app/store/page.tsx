'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, LayoutGroup } from 'framer-motion';
import {
  Search,
  X,
  RotateCcw,
  ArrowUpRight,
  LayoutGrid,
  Rows2,
  Sparkles,
} from 'lucide-react';
import { products as initialProducts, type Product } from '@/data/products';
import ProductCard from '@/components/store/ProductCard';
import FlagshipDeckHero from '@/components/store/FlagshipDeckHero';
import AnimatedTabs from '@/components/ui/AnimatedTabs';
import FluidSwitch from '@/components/ui/FluidSwitch';
import SegmentedControl from '@/components/ui/SegmentedControl';

const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'whey', label: 'เวย์โปรตีน' },
  { id: 'plant-protein', label: 'โปรตีนพืช' },
  { id: 'creatine', label: 'ครีเอทีน' },
  { id: 'pre-workout', label: 'พรีเวิร์กเอาต์' },
  { id: 'vitamin-zinc', label: 'วิตามิน & ซิงค์' },
  { id: 'fish-oil', label: 'น้ำมันปลา' },
];

const GOALS = [
  { id: 'all', label: 'ทุกเป้าหมาย' },
  { id: 'muscle-gain', label: 'เพิ่มกล้ามเนื้อ' },
  { id: 'fat-loss', label: 'ลดไขมัน / ลีนหุ่น' },
  { id: 'strength', label: 'เพิ่มพละกำลังยกหนัก' },
  { id: 'endurance', label: 'ความอึด / พลังงานซ้อม' },
  { id: 'recovery', label: 'ฟื้นฟูกล้ามเนื้อ' },
  { id: 'general-health', label: 'สุขภาพโดยรวม & ข้อต่อ' },
];

const VALID_CATEGORIES = new Set(CATEGORIES.map((c) => c.id));
const VALID_GOALS = new Set(GOALS.map((g) => g.id));
const MAX_PRICE_CEILING = 5500;

/**
 * 21st.dev Flagship Interactive Storefront
 * 3D Stacked Card Carousel Hero + 3D Tilt Spotlight Product Cards + Price Slider + Dual Gallery/Editorial Layout
 */
function StoreContent() {
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get('category') || 'all';
  const initialGoalParam = searchParams.get('goal') || 'all';
  const initialSearchParam = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState(initialSearchParam);
  const [selectedCategory, setSelectedCategory] = useState(
    VALID_CATEGORIES.has(initialCategoryParam) ? initialCategoryParam : 'all'
  );
  const [selectedBrand, setSelectedBrand] = useState('ทั้งหมด');
  const [selectedGoal, setSelectedGoal] = useState(
    VALID_GOALS.has(initialGoalParam) ? initialGoalParam : 'all'
  );
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(MAX_PRICE_CEILING);
  const [viewMode, setViewMode] = useState<'gallery' | 'editorial'>('gallery');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'discount'>('popular');

  useEffect(() => {
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => {
        // คงข้อมูลเริ่มต้นไว้
      });
  }, []);

  const brandOptions = useMemo(() => {
    const uniqueBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
    return ['ทั้งหมด', ...uniqueBrands];
  }, [products]);

  const categoryTabsWithCount = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      id: cat.id,
      label: cat.label,
      count:
        cat.id === 'all'
          ? products.length
          : products.filter((p) => p.category === cat.id).length,
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (onlyInStock) {
          const out =
            !product.inStock ||
            (typeof product.stock === 'number' && product.stock <= 0);
          if (out) return false;
        }

        if (maxPrice < MAX_PRICE_CEILING && product.price > maxPrice) {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = product.name.toLowerCase().includes(q);
          const matchNameTH = product.nameTH.toLowerCase().includes(q);
          const matchBrand = product.brand.toLowerCase().includes(q);
          const matchFDA = product.fdaNumber.toLowerCase().includes(q);
          const matchFeatures = (product.features || []).some((f) =>
            f.toLowerCase().includes(q)
          );
          if (!matchName && !matchNameTH && !matchBrand && !matchFDA && !matchFeatures) {
            return false;
          }
        }

        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
          return false;
        }

        if (selectedBrand !== 'ทั้งหมด' && product.brand !== selectedBrand) {
          return false;
        }

        if (selectedGoal !== 'all' && product.goal !== selectedGoal) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'discount') {
          const discA = a.originalPrice > a.price ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const discB = b.originalPrice > b.price ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return discB - discA;
        }
        return b.rating * b.reviewsCount - a.rating * a.reviewsCount;
      });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedGoal,
    onlyInStock,
    maxPrice,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    selectedBrand !== 'ทั้งหมด' ||
    selectedGoal !== 'all' ||
    onlyInStock ||
    maxPrice < MAX_PRICE_CEILING;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrand('ทั้งหมด');
    setSelectedGoal('all');
    setOnlyInStock(false);
    setMaxPrice(MAX_PRICE_CEILING);
    setSortBy('popular');
  };

  return (
    <div className="min-h-screen bg-white text-textPrimary">
      {/* 1. 21st.dev INTERACTIVE 3D STACKED CARD CAROUSEL FLAGSHIP STAGE */}
      <FlagshipDeckHero products={products} />

      {/* 2. STICKY MINIMAL HAIRLINE FILTER & VIEW STUDIO */}
      <div className="sticky top-16 z-30 bg-white/94 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Row 1: Underline Category Tabs + Inline Hairline Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/60">
            <div className="overflow-x-auto scrollbar-none -mx-2 px-2">
              <AnimatedTabs
                layoutId="store-minimal-category-tab"
                variant="underline"
                tabs={categoryTabsWithCount}
                activeTab={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>

            <div className="flex items-center gap-3 pb-2.5 md:pb-0">
              <div className="relative flex items-center border-b border-textPrimary/25 focus-within:border-textPrimary transition-colors pb-1 w-full md:w-60">
                <Search className="w-3.5 h-3.5 text-textSecondary shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อ, แบรนด์, เลข อย."
                  className="w-full bg-transparent text-xs text-textPrimary placeholder:text-textSecondary/60 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-textSecondary hover:text-textPrimary cursor-pointer ml-1.5"
                    aria-label="ล้างคำค้นหา"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ล้าง</span>
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Brand, Goal, Price Slider, Stock FluidSwitch, View Switcher & Sort */}
          <div className="py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                aria-label="กรองตามแบรนด์"
                className={`bg-transparent focus:outline-none cursor-pointer transition-colors ${
                  selectedBrand !== 'ทั้งหมด'
                    ? 'text-primary font-semibold'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                {brandOptions.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand === 'ทั้งหมด' ? 'แบรนด์: ทั้งหมด' : brand}
                  </option>
                ))}
              </select>

              <span className="hidden sm:block w-px h-3.5 bg-border" />

              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                aria-label="กรองตามเป้าหมาย"
                className={`bg-transparent focus:outline-none cursor-pointer transition-colors ${
                  selectedGoal !== 'all'
                    ? 'text-primary font-semibold'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                {GOALS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.id === 'all' ? 'เป้าหมาย: ทั้งหมด' : g.label}
                  </option>
                ))}
              </select>

              <span className="hidden sm:block w-px h-3.5 bg-border" />

              {/* Interactive Budget Price Slider */}
              <div className="inline-flex items-center gap-2.5">
                <span className="text-textSecondary whitespace-nowrap">
                  งบ:{' '}
                  <strong
                    className={`font-mono ${
                      maxPrice < MAX_PRICE_CEILING ? 'text-primary' : 'text-textPrimary'
                    }`}
                  >
                    {maxPrice >= MAX_PRICE_CEILING
                      ? 'ทั้งหมด'
                      : `≤ ฿${maxPrice.toLocaleString()}`}
                  </strong>
                </span>
                <input
                  type="range"
                  min={400}
                  max={MAX_PRICE_CEILING}
                  step={100}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  aria-label="กำหนดงบประมาณสูงสุด"
                  className="w-24 sm:w-28 h-1 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>

              <span className="hidden sm:block w-px h-3.5 bg-border" />

              <FluidSwitch
                checked={onlyInStock}
                onChange={setOnlyInStock}
                label="เฉพาะพร้อมส่ง"
                tone="gold"
                size="sm"
              />
            </div>

            <div className="flex items-center gap-3.5 ml-auto">
              <span className="text-textSecondary font-mono text-[11px] hidden lg:inline">
                {filteredProducts.length} ITEMS
              </span>

              {/* 21st.dev Dual View Mode SegmentedControl */}
              <SegmentedControl
                layoutId="store-view-mode"
                variant="sharp"
                size="xs"
                ariaLabel="เลือกมุมมองแสดงสินค้า"
                options={[
                  { id: 'gallery', label: 'Gallery', icon: <LayoutGrid className="w-3 h-3" /> },
                  { id: 'editorial', label: 'Editorial', icon: <Rows2 className="w-3 h-3" /> },
                ]}
                value={viewMode}
                onChange={setViewMode}
              />

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as 'popular' | 'price-asc' | 'price-desc' | 'discount'
                  )
                }
                aria-label="จัดเรียงสินค้า"
                className="bg-transparent text-textPrimary font-medium focus:outline-none cursor-pointer"
              >
                <option value="popular">เรียง: ยอดนิยม</option>
                <option value="price-asc">ราคา: ต่ำไปสูง</option>
                <option value="price-desc">ราคา: สูงไปต่ำ</option>
                <option value="discount">ส่วนลดสูงสุด</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FLUID ANIMATED 3D TILT CATALOG GRID */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16 space-y-20">
        {filteredProducts.length > 0 ? (
          <LayoutGroup id="store-catalog-layout">
            <motion.div
              layout
              className={
                viewMode === 'editorial'
                  ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8'
                  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12'
              }
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant={viewMode}
                />
              ))}
            </motion.div>
          </LayoutGroup>
        ) : (
          <div className="py-24 text-center border border-border bg-secondary/40 space-y-4">
            <h2 className="text-lg font-semibold text-textPrimary">
              ไม่พบสินค้าที่ตรงกับเงื่อนไข
            </h2>
            <p className="text-xs text-textSecondary">
              ลองเพิ่มงบประมาณ ล้างตัวกรอง หรือให้ผู้ช่วย AI ช่วยเลือกสูตรที่เหมาะกับคุณ
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2.5 bg-textPrimary text-white text-xs font-medium hover:bg-primary transition-colors cursor-pointer"
              >
                ล้างตัวกรองทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-fit-ai'))}
                className="px-5 py-2.5 border border-border bg-white text-textPrimary hover:border-textPrimary text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>ถามผู้ช่วยจัดเซต AI</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. MINIMAL EDITORIAL GUIDANCE STRIP */}
        <section className="border-t border-border pt-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold">
              CLINICAL GUIDANCE
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold text-textPrimary tracking-tight">
              ไม่แน่ใจว่าควรเลือกสูตรไหน?
            </h2>
            <p className="text-xs sm:text-sm text-textSecondary">
              ลองถามผู้ช่วย AI ให้คัดเซตตามงบประมาณ หรือคำนวณปริมาณโปรตีนที่เหมาะกับสรีระก่อนสั่งซื้อ
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5 shrink-0">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-fit-ai'))}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-textPrimary text-white hover:bg-primary text-xs font-medium transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>ให้ AI จัดเซตให้</span>
            </button>
            <Link
              href="/calculator/protein"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-textPrimary hover:text-primary transition-colors border-b border-textPrimary hover:border-primary pb-0.5"
            >
              <span>คำนวณโปรตีนต่อวัน</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-textSecondary hover:text-primary transition-colors"
            >
              <span>เปรียบเทียบสารเสริม</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function StoreContentWrapper() {
  const searchParams = useSearchParams();
  return <StoreContent key={searchParams.toString()} />;
}

export default function StorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center text-xs font-mono text-textSecondary">
          LOADING COLLECTION...
        </div>
      }
    >
      <StoreContentWrapper />
    </Suspense>
  );
}
