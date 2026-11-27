'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { products as initialProducts, type Product } from '@/data/products';
import ProductCard from '@/components/store/ProductCard';
import AnimatedTabs from '@/components/ui/AnimatedTabs';
import BlurFade from '@/components/ui/BlurFade';

const SHOWCASE_TABS = [
  { id: 'featured', label: 'คัดสรรแนะนำ' },
  { id: 'whey', label: 'เวย์โปรตีน' },
  { id: 'plant-protein', label: 'โปรตีนพืช' },
  { id: 'creatine', label: 'ครีเอทีน' },
  { id: 'vitamin', label: 'วิตามิน & โอเมก้า' },
];

const FEATURED_IDS = [
  'prod-on-gold-whey',
  'prod-dymatize-iso100',
  'prod-plantae-complete',
  'prod-baam-creatine-5000',
];

/**
 * 21st.dev Minimal Curated Storefront Collection
 * Underline sliding tabs + 4-column museum gallery grid
 */
export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab] = useState('featured');

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

  const displayedProducts = (() => {
    if (activeTab === 'featured') {
      const list = FEATURED_IDS.map((id) => products.find((p) => p.id === id)).filter(
        (p): p is Product => Boolean(p)
      );
      return list.length > 0 ? list : products.slice(0, 4);
    }
    if (activeTab === 'vitamin') {
      return products
        .filter((p) => p.category === 'vitamin-zinc' || p.category === 'fish-oil')
        .slice(0, 4);
    }
    return products.filter((p) => p.category === activeTab).slice(0, 4);
  })();

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
        {/* Editorial Numbered Heading + Minimal Underline Tabs */}
        <BlurFade>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border pb-4">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold block">
                01 / CURATED COLLECTION
              </span>
              <h2 className="text-2xl sm:text-4xl font-semibold text-textPrimary tracking-tight">
                ผลิตภัณฑ์แท้มีเลข อย.
              </h2>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-6">
              <AnimatedTabs
                layoutId="home-store-underline-tabs"
                variant="underline"
                tabs={SHOWCASE_TABS}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
            </div>
          </div>
        </BlurFade>

        {/* Gallery Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10"
          >
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Minimal Footer Link */}
        <div className="pt-4 flex justify-end">
          <Link
            href={
              activeTab === 'featured' || activeTab === 'vitamin'
                ? '/store'
                : `/store?category=${activeTab}`
            }
            className="inline-flex items-center gap-1.5 text-xs font-medium text-textPrimary hover:text-primary transition-colors border-b border-textPrimary hover:border-primary pb-0.5"
          >
            <span>ดูคอลเลกชันทั้งหมด ({products.length} รายการ)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
