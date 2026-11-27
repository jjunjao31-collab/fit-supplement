'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { Search, X, ArrowUpRight, RotateCcw } from 'lucide-react';
import { articles } from '@/data/articles';
import ArticleCard from '@/components/articles/ArticleCard';
import Disclaimer from '@/components/ui/Disclaimer';
import AnimatedTabs from '@/components/ui/AnimatedTabs';
import BlurFade from '@/components/ui/BlurFade';
import TextEffect from '@/components/ui/TextEffect';

const CATEGORIES = [
  'ทั้งหมด',
  'เริ่มต้นเข้ายิม',
  'โปรตีน',
  'ครีเอทีน',
  'กรดอะมิโน',
  'การเลือกซื้อ',
  'โภชนาการ',
  'ข้อเท็จจริง',
];

function ArticlesContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');

  const filteredArticles = useMemo(() => {
    let result = [...articles];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== 'ทั้งหมด') {
      result = result.filter((a) => a.category === selectedCategory);
    }
    return result;
  }, [searchQuery, selectedCategory]);

  const leadArticle =
    !searchQuery && selectedCategory === 'ทั้งหมด' ? filteredArticles[0] : null;
  const remainingArticles = leadArticle
    ? filteredArticles.slice(1)
    : filteredArticles;

  const isFiltered = searchQuery !== '' || selectedCategory !== 'ทั้งหมด';

  return (
    <div className="min-h-screen bg-white">
      {/* 1. MONUMENTAL MINIMAL JOURNAL HEADER */}
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-editorial-grid"
          style={{
            maskImage:
              'radial-gradient(ellipse 75% 65% at 75% 10%, black 5%, transparent 72%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 75% 65% at 75% 10%, black 5%, transparent 72%)',
          }}
        />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-10 sm:pt-16 sm:pb-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-[0.22em] text-textSecondary">
                <Link href="/" className="hover:text-primary transition-colors">
                  HOME
                </Link>
                <span>/</span>
                <span className="text-primary font-semibold">RESEARCH JOURNAL</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-semibold text-textPrimary tracking-[-0.03em] leading-[1.08]">
                <TextEffect segments={[{ text: 'บทความและงานวิจัย' }]} />
              </h1>
              <BlurFade inView={false} delay={0.14}>
                <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                  ย่อยงานวิจัยวิทยาศาสตร์การกีฬาให้อ่านง่าย แยกข้อเท็จจริงออกจากการตลาด และชี้ให้เห็นสิ่งที่คุ้มค่าจริง
                </p>
              </BlurFade>
            </div>

            <BlurFade inView={false} delay={0.18} className="w-full lg:w-80">
              <div className="relative flex items-center border-b border-textPrimary/25 focus-within:border-textPrimary transition-colors pb-2">
                <Search className="w-4 h-4 text-textSecondary shrink-0 mr-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาบทความ เช่น เวย์, ครีเอทีน..."
                  className="w-full bg-transparent text-sm text-textPrimary placeholder:text-textSecondary/60 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-textSecondary hover:text-textPrimary cursor-pointer ml-2"
                    aria-label="ล้างคำค้นหา"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* 2. STICKY UNDERLINE CATEGORY TABS */}
      <div className="sticky top-16 z-30 bg-white/92 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">
          <div className="overflow-x-auto scrollbar-none -mx-2 px-2">
            <AnimatedTabs
              layoutId="articles-category-tab"
              variant="underline"
              tabs={CATEGORIES.map((c) => ({ id: c, label: c }))}
              activeTab={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {isFiltered && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ทั้งหมด');
                }}
                className="hidden sm:inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>ล้าง</span>
              </button>
            )}
            <span className="text-[11px] font-mono text-textSecondary hidden sm:inline">
              {filteredArticles.length} ARTICLES
            </span>
          </div>
        </div>
      </div>

      {/* 3. FEATURED LEAD STORY + ARCHITECTURAL JOURNAL GRID */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16 space-y-14">
        {leadArticle && (
          <BlurFade>
            <Link
              href={`/articles/${leadArticle.slug}`}
              className="group block border border-border bg-secondary/45 hover:bg-secondary/80 transition-colors p-8 sm:p-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em]">
                    <span className="text-primary font-semibold">FEATURED ESSAY</span>
                    <span className="text-border">·</span>
                    <span className="text-textSecondary">{leadArticle.category}</span>
                    <span className="text-border">·</span>
                    <span className="text-textSecondary">{leadArticle.readingTime} นาที</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-semibold text-textPrimary group-hover:text-primary transition-colors tracking-tight leading-snug">
                    {leadArticle.title}
                  </h2>
                  <p className="text-sm sm:text-base text-textSecondary leading-relaxed max-w-2xl">
                    {leadArticle.excerpt}
                  </p>
                </div>
                <div className="lg:col-span-4 flex lg:justify-end">
                  <span className="inline-flex items-center gap-2 px-6 py-3 bg-textPrimary text-white group-hover:bg-primary text-xs font-medium transition-colors">
                    <span>อ่านบทความแนะนำ</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          </BlurFade>
        )}

        {remainingArticles.length > 0 ? (
          <div className="border-t border-l border-border bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {remainingArticles.map((art, idx) => (
              <ArticleCard
                key={art.slug}
                article={art}
                index={leadArticle ? idx + 1 : idx}
              />
            ))}
          </div>
        ) : !leadArticle ? (
          <div className="py-20 text-center border border-border bg-secondary/40 space-y-3">
            <p className="text-sm font-semibold text-textPrimary">
              ไม่พบบทความที่ตรงกับเงื่อนไขการค้นหา
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ทั้งหมด');
              }}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : null}

        <Disclaimer />
      </main>
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center text-xs font-mono text-textSecondary">
          LOADING JOURNAL...
        </div>
      }
    >
      <ArticlesContent />
    </Suspense>
  );
}
