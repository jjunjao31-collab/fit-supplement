'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  RotateCcw,
  LayoutGrid,
  List,
  ArrowUpRight,
  Scale,
} from 'lucide-react';
import { supplements } from '@/data/supplements';
import SupplementGrid from '@/components/supplements/SupplementGrid';
import Disclaimer from '@/components/ui/Disclaimer';
import AnimatedTabs from '@/components/ui/AnimatedTabs';
import BlurFade from '@/components/ui/BlurFade';
import TextEffect from '@/components/ui/TextEffect';
import type { Supplement, GoalType, EvidenceLevel } from '@/types';

const CATEGORY_TABS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'protein', label: 'โปรตีน' },
  { id: 'creatine', label: 'ครีเอทีน' },
  { id: 'stimulant', label: 'สารกระตุ้น' },
  { id: 'pre-workout', label: 'พรีเวิร์กเอาต์' },
  { id: 'amino-acid', label: 'กรดอะมิโน' },
  { id: 'electrolyte', label: 'เกลือแร่' },
  { id: 'mass-gainer', label: 'เพิ่มน้ำหนัก' },
  { id: 'other', label: 'ชะลอการล้า' },
];

const GOAL_FILTERS = [
  { key: 'all', label: 'เป้าหมาย: ทั้งหมด' },
  { key: 'muscle-gain', label: 'เพิ่มกล้ามเนื้อ' },
  { key: 'fat-loss', label: 'ลดไขมัน' },
  { key: 'strength', label: 'เพิ่มความแข็งแรง' },
  { key: 'endurance', label: 'เพิ่มความอึด' },
  { key: 'recovery', label: 'การฟื้นฟู' },
  { key: 'general-health', label: 'สุขภาพทั่วไป' },
];

const EVIDENCE_TIERS: { id: 'all' | EvidenceLevel; code: string; label: string }[] = [
  { id: 'all', code: 'ALL', label: 'ทุกระดับหลักฐาน' },
  { id: 'strong', code: 'AIS GROUP A', label: 'หลักฐานแข็งแกร่ง' },
  { id: 'moderate', code: 'MODERATE', label: 'หลักฐานปานกลาง' },
  { id: 'limited', code: 'LIMITED', label: 'เฉพาะบางกลุ่ม' },
];

function SupplementsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedEvidence, setSelectedEvidence] = useState<'all' | EvidenceLevel>('all');
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'name-asc' | 'evidence'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'index'>('grid');
  const [inspected, setInspected] = useState<Supplement | null>(null);

  useEffect(() => {
    if (!inspected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInspected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inspected]);

  const evidenceCounts = useMemo(() => {
    return {
      all: supplements.length,
      strong: supplements.filter((s) => s.evidenceLevel === 'strong').length,
      moderate: supplements.filter((s) => s.evidenceLevel === 'moderate').length,
      limited: supplements.filter((s) => s.evidenceLevel === 'limited').length,
      insufficient: supplements.filter((s) => s.evidenceLevel === 'insufficient').length,
    };
  }, []);

  const filteredSupplements = useMemo(() => {
    let result = [...supplements];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.nameTH.toLowerCase().includes(q) ||
          s.nameEN.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((s) => s.category === selectedCategory);
    }

    if (selectedEvidence !== 'all') {
      result = result.filter((s) => s.evidenceLevel === selectedEvidence);
    }

    if (selectedGoal !== 'all') {
      result = result.filter((s) => s.goals.includes(selectedGoal as GoalType));
    }

    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.nameTH.localeCompare(b.nameTH, 'th'));
    } else if (sortBy === 'evidence') {
      const rank: Record<EvidenceLevel, number> = {
        strong: 4,
        moderate: 3,
        limited: 2,
        insufficient: 1,
      };
      result.sort((a, b) => (rank[b.evidenceLevel] || 0) - (rank[a.evidenceLevel] || 0));
    }

    return result;
  }, [searchQuery, selectedCategory, selectedEvidence, selectedGoal, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedEvidence('all');
    setSelectedGoal('all');
    setSortBy('default');
  };

  const isFiltered =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    selectedEvidence !== 'all' ||
    selectedGoal !== 'all';

  return (
    <>
      {/* 1. MONUMENTAL MINIMAL EDITORIAL HEADER */}
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

        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-10 sm:pt-16 sm:pb-12 relative z-10 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-[0.22em] text-textSecondary">
                <Link href="/" className="hover:text-primary transition-colors">
                  HOME
                </Link>
                <span>/</span>
                <span className="text-primary font-semibold">CLINICAL ENCYCLOPEDIA</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-semibold text-textPrimary tracking-[-0.03em] leading-[1.08]">
                <TextEffect segments={[{ text: 'สารานุกรมอาหารเสริม' }]} />
              </h1>
              <BlurFade inView={false} delay={0.14}>
                <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                  ฐานข้อมูลอาหารเสริมกีฬาอ้างอิงมาตรฐาน AIS &amp; ISSN แยกชัดเจนทั้งระดับหลักฐาน กลไกการออกฤทธิ์ ขนาดโดส และข้อจำกัดที่ควรรู้
                </p>
              </BlurFade>
            </div>

            {/* Minimal Bottom-Border Search Input */}
            <BlurFade inView={false} delay={0.18} className="w-full lg:w-80">
              <div className="relative flex items-center border-b border-textPrimary/25 focus-within:border-textPrimary transition-colors pb-2">
                <Search className="w-4 h-4 text-textSecondary shrink-0 mr-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาสารเสริม เช่น เวย์, Creatine..."
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

          {/* 2. INTERACTIVE 1PX-HAIRLINE EVIDENCE TIER SELECTOR */}
          <BlurFade inView={false} delay={0.22}>
            <div className="border border-border bg-white grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-border">
              {EVIDENCE_TIERS.map((tier) => {
                const active = selectedEvidence === tier.id;
                const count = evidenceCounts[tier.id];
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedEvidence(tier.id)}
                    className={`group p-4 sm:p-5 text-left transition-colors cursor-pointer flex items-end justify-between gap-3 ${
                      active
                        ? 'bg-secondary'
                        : 'bg-white hover:bg-secondary/50'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div
                        className={`text-[10px] font-mono uppercase tracking-[0.18em] font-semibold ${
                          active ? 'text-primary' : 'text-textSecondary'
                        }`}
                      >
                        {tier.code}
                      </div>
                      <div className="text-xs sm:text-[13px] font-medium text-textPrimary truncate">
                        {tier.label}
                      </div>
                    </div>
                    <span
                      className={`text-xl sm:text-2xl font-mono font-light leading-none shrink-0 ${
                        active ? 'text-primary font-semibold' : 'text-textSecondary/70'
                      }`}
                    >
                      {String(count).padStart(2, '0')}
                    </span>
                  </button>
                );
              })}
            </div>
          </BlurFade>
        </div>
      </section>

      {/* 3. STICKY MINIMAL HAIRLINE FILTER & VIEW MODE BAR */}
      <div className="sticky top-16 z-30 bg-white/92 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Underline Category Tabs */}
          <div className="flex items-center justify-between gap-4 border-b border-border/60">
            <div className="overflow-x-auto scrollbar-none -mx-2 px-2">
              <AnimatedTabs
                layoutId="supplements-minimal-category-tab"
                variant="underline"
                tabs={CATEGORY_TABS}
                activeTab={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="hidden md:inline-flex items-center gap-1.5 text-xs text-primary hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>ล้างตัวกรอง</span>
              </button>
            )}
          </div>

          {/* Inline Goal, Sort, Count & Grid/Index View Switcher */}
          <div className="py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                aria-label="กรองตามเป้าหมาย"
                className={`bg-transparent focus:outline-none cursor-pointer ${
                  selectedGoal !== 'all'
                    ? 'text-primary font-semibold'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                {GOAL_FILTERS.map((g) => (
                  <option key={g.key} value={g.key}>
                    {g.label}
                  </option>
                ))}
              </select>

              <span className="hidden sm:block w-px h-3.5 bg-border" />

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'default' | 'name-asc' | 'evidence')
                }
                aria-label="เรียงลำดับ"
                className="bg-transparent text-textPrimary font-medium focus:outline-none cursor-pointer"
              >
                <option value="default">เรียง: ค่าเริ่มต้น</option>
                <option value="evidence">ระดับหลักฐานงานวิจัย</option>
                <option value="name-asc">ชื่อ (ก-ฮ)</option>
              </select>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <span className="text-textSecondary font-mono text-[11px] hidden sm:inline">
                {filteredSupplements.length} ENTRIES
              </span>

              <span className="hidden sm:block w-px h-3.5 bg-border" />

              {/* 21st.dev View Mode Switcher (Matrix Grid vs Expandable Ledger) */}
              <div className="inline-flex items-center border border-border p-0.5 bg-secondary/70">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`relative px-2.5 py-1 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                    viewMode === 'grid' ? 'text-white' : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  {viewMode === 'grid' && (
                    <motion.span
                      layoutId="supplements-view-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="absolute inset-0 bg-textPrimary"
                    />
                  )}
                  <LayoutGrid className="w-3 h-3 relative z-10" />
                  <span className="relative z-10">ตาราง</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('index')}
                  className={`relative px-2.5 py-1 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                    viewMode === 'index' ? 'text-white' : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  {viewMode === 'index' && (
                    <motion.span
                      layoutId="supplements-view-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="absolute inset-0 bg-textPrimary"
                    />
                  )}
                  <List className="w-3 h-3 relative z-10" />
                  <span className="relative z-10">สารบัญ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ARCHITECTURAL CLINICAL MATRIX / EXPANDABLE LEDGER */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16 space-y-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${selectedCategory}-${selectedEvidence}-${selectedGoal}-${sortBy}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            <SupplementGrid
              supplements={filteredSupplements}
              viewMode={viewMode}
              onQuickInspect={setInspected}
              emptyMessage={
                searchQuery
                  ? `ไม่พบอาหารเสริมที่ตรงกับ "${searchQuery}" กรุณาลองค้นหาคำอื่น`
                  : 'ไม่พบรายการอาหารเสริมที่ตรงกับตัวกรองนี้'
              }
            />
          </motion.div>
        </AnimatePresence>

        {/* Minimal Compare Guidance Row */}
        <section className="border-t border-border pt-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold">
              SIDE-BY-SIDE COMPARISON
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold text-textPrimary tracking-tight">
              เทียบประสิทธิภาพและข้อจำกัดแบบ 1 ต่อ 1
            </h2>
            <p className="text-xs sm:text-sm text-textSecondary">
              เปรียบเทียบระดับหลักฐาน ขนาดโดส และความคุ้มค่าระหว่างอาหารเสริมแต่ละชนิดได้ทันที
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 shrink-0">
            <Link
              href="/compare"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-textPrimary hover:text-primary border-b border-textPrimary hover:border-primary pb-0.5 transition-colors"
            >
              <Scale className="w-3.5 h-3.5 text-primary" />
              <span>เปิดหน้าเปรียบเทียบ</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/store"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-textSecondary hover:text-primary transition-colors"
            >
              <span>ไปหน้าร้านค้าทางการ</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        <Disclaimer />
      </main>

      {/* 5. 21ST.DEV SLIDE-OVER CLINICAL DOSSIER SHEET */}
      <AnimatePresence>
        {inspected && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspected(null)}
              className="fixed inset-0 bg-black/35 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 36 }}
              className="relative z-10 w-full max-w-lg bg-white border-l border-border h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between gap-8 shadow-2xl"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-start justify-between gap-4 pb-5 border-b border-border">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                      CLINICAL DOSSIER · {inspected.nameEN}
                    </span>
                    <h2 className="text-2xl font-semibold text-textPrimary leading-tight">
                      {inspected.nameTH}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspected(null)}
                    className="p-1.5 text-textSecondary hover:text-textPrimary cursor-pointer shrink-0"
                    aria-label="ปิดหน้าต่าง"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Summary & Mechanism */}
                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary font-semibold">
                    กลไกการทำงาน (MECHANISM)
                  </div>
                  <p className="text-xs sm:text-[13px] text-textSecondary leading-relaxed">
                    {inspected.howItWorks}
                  </p>
                </div>

                {/* Usage Grid */}
                <div className="border-y border-border divide-y divide-border text-xs">
                  <div className="py-3.5 grid grid-cols-3 gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-textSecondary">
                      ขนาดแนะนำ
                    </span>
                    <span className="col-span-2 font-medium text-textPrimary">
                      {inspected.usage.dosage}
                    </span>
                  </div>
                  <div className="py-3.5 grid grid-cols-3 gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-textSecondary">
                      เวลาทาน
                    </span>
                    <span className="col-span-2 font-medium text-textPrimary">
                      {inspected.usage.timing}
                    </span>
                  </div>
                  <div className="py-3.5 grid grid-cols-3 gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-textSecondary">
                      วิธีทาน
                    </span>
                    <span className="col-span-2 text-textSecondary leading-relaxed">
                      {inspected.usage.method}
                    </span>
                  </div>
                </div>

                {/* Key Benefits */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary font-semibold">
                    ประโยชน์ที่มีหลักฐานรองรับ
                  </div>
                  <ul className="space-y-2 text-xs text-textSecondary">
                    {inspected.benefits.map((b, i) => (
                      <li key={i} className="leading-relaxed">
                        <strong className="text-textPrimary font-medium">{b.title}:</strong>{' '}
                        {b.description}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary font-semibold">
                    ข้อจำกัดและข้อควรระวัง
                  </div>
                  <ul className="space-y-1.5 text-xs text-textSecondary">
                    {inspected.limitations.map((lim, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-primary font-mono">—</span>
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Drawer Footer CTA */}
              <div className="pt-5 border-t border-border flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-textSecondary">
                  อ้างอิง {inspected.references.length} งานวิจัย
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href="/store"
                    onClick={() => setInspected(null)}
                    className="px-4 py-2.5 border border-border text-xs font-medium text-textPrimary hover:border-textPrimary transition-colors"
                  >
                    ดูในร้านค้า
                  </Link>
                  <Link
                    href={`/supplements/${inspected.slug}`}
                    onClick={() => setInspected(null)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-textPrimary text-white hover:bg-primary text-xs font-medium transition-colors"
                  >
                    <span>อ่านฉบับเต็ม</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function SupplementsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense
        fallback={
          <div className="min-h-screen bg-white flex items-center justify-center text-xs font-mono text-textSecondary">
            LOADING ENCYCLOPEDIA...
          </div>
        }
      >
        <SupplementsContent />
      </Suspense>
    </div>
  );
}
