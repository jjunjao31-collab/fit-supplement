'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Supplement } from '@/types';
import SlidingNumber from '@/components/ui/SlidingNumber';
import BlurFade from '@/components/ui/BlurFade';
import SegmentedControl from '@/components/ui/SegmentedControl';

interface MinimalArchitectureSectionProps {
  supplements: Supplement[];
}

const GOAL_MULTIPLIERS = [
  { id: 'muscle', label: 'สร้างกล้ามเนื้อ', mult: 1.8 },
  { id: 'cut', label: 'ลดไขมัน / ลีน', mult: 2.0 },
  { id: 'health', label: 'สุขภาพทั่วไป', mult: 1.4 },
] as const;

/**
 * 21st.dev Architectural 1px-Hairline Split Showcase
 * Left: Live Minimal Protein Studio (SlidingNumber)
 * Right: Interactive Clinical Evidence Dossier
 */
export default function MinimalArchitectureSection({
  supplements,
}: MinimalArchitectureSectionProps) {
  const [weight, setWeight] = useState(68);
  const [height, setHeight] = useState(172);
  const [goalId, setGoalId] = useState<'muscle' | 'cut' | 'health'>('muscle');

  const topSupplements = supplements.slice(0, 4);
  const [activeSlug, setActiveSlug] = useState(topSupplements[0]?.slug || '');
  const activeSupp =
    topSupplements.find((s) => s.slug === activeSlug) || topSupplements[0];

  const activeGoal =
    GOAL_MULTIPLIERS.find((g) => g.id === goalId) || GOAL_MULTIPLIERS[0];

  // Height-based BMI (Asian standard) & clinical adjusted weight when BMI > 25
  const heightM = height / 100;
  const bmi = heightM > 0 ? weight / (heightM * heightM) : 0;
  const minIdealWeight = Math.round(18.5 * heightM * heightM);
  const maxIdealWeight = Math.round(22.9 * heightM * heightM);
  const isAdjusted = bmi > 25;
  const effectiveWeight = isAdjusted
    ? maxIdealWeight + (weight - maxIdealWeight) * 0.4
    : weight;

  let bmiLabel = 'สมส่วน';
  let bmiColor = 'text-primary';
  if (bmi < 18.5) {
    bmiLabel = 'น้ำหนักน้อย';
    bmiColor = 'text-textSecondary';
  } else if (bmi <= 22.9) {
    bmiLabel = 'สมส่วน';
    bmiColor = 'text-primary';
  } else if (bmi <= 24.9) {
    bmiLabel = 'เกินเกณฑ์เล็กน้อย';
    bmiColor = 'text-textPrimary';
  } else {
    bmiLabel = 'ท้วม / ปรับฐานตามส่วนสูง';
    bmiColor = 'text-red-600';
  }

  const dailyProtein = Math.round(effectiveWeight * activeGoal.mult);
  const perMeal = Math.round(dailyProtein / 4);

  return (
    <section className="py-20 sm:py-28 bg-secondary border-b border-border">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <BlurFade>
          <div className="border border-border bg-white grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* LEFT: Live Minimal Protein Studio (5 cols) */}
            <div className="lg:col-span-5 p-8 sm:p-10 lg:p-12 flex flex-col justify-between space-y-10">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold">
                  02 / PROTEIN STUDIO
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold text-textPrimary tracking-tight">
                  โปรตีนที่ร่างกายต้องการต่อวัน
                </h2>
                <p className="text-xs sm:text-sm text-textSecondary">
                  เลื่อนปรับน้ำหนัก ส่วนสูง และเป้าหมายเพื่อประเมินโปรตีนและ BMI ทันทีตามเกณฑ์ ISSN
                </p>
              </div>

              {/* Monumental Sliding Number Display */}
              <div className="py-5 border-y border-border space-y-4">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2.5">
                    <SlidingNumber
                      value={dailyProtein}
                      useLocale={false}
                      className="text-6xl sm:text-7xl font-light font-mono text-textPrimary tracking-tighter"
                    />
                    <span className="text-sm font-medium text-primary">กรัม / วัน</span>
                  </div>
                  <div className="text-xs text-textSecondary font-mono">
                    ~{perMeal}g ต่อมื้อ (4 มื้อ) · ตัวคูณ {activeGoal.mult.toFixed(1)} g/kg
                    {isAdjusted ? ' (ปรับฐานตามส่วนสูง)' : ''}
                  </div>
                </div>

                {/* Live Height-Driven BMI & Ideal Weight Strip */}
                <div className="pt-3 border-t border-border/70 grid grid-cols-2 divide-x divide-border text-xs">
                  <div className="pr-3 space-y-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-textSecondary block">
                      BMI (เอเชีย)
                    </span>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-mono font-semibold text-sm text-textPrimary">
                        {bmi.toFixed(1)}
                      </span>
                      <span className={`text-[11px] font-medium ${bmiColor}`}>
                        {bmiLabel}
                      </span>
                    </div>
                  </div>
                  <div className="pl-3 space-y-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-textSecondary block">
                      น้ำหนักเหมาะสม
                    </span>
                    <div className="font-mono font-semibold text-sm text-textPrimary">
                      {minIdealWeight}–{maxIdealWeight}{' '}
                      <span className="text-[11px] font-normal text-textSecondary">กก.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimal Controls */}
              <div className="space-y-5">
                {/* 21st.dev Spring Segmented Goal Control */}
                <SegmentedControl
                  layoutId="home-protein-goal-segment"
                  variant="pill"
                  size="sm"
                  fullWidth
                  ariaLabel="เลือกเป้าหมายการคำนวณโปรตีน"
                  options={GOAL_MULTIPLIERS.map((g) => ({ id: g.id, label: g.label }))}
                  value={goalId}
                  onChange={setGoalId}
                />

                {/* Hairline Weight Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textSecondary">น้ำหนักตัวของคุณ</span>
                    <span className="font-mono font-semibold text-textPrimary">
                      {weight} กก.
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={120}
                    step={1}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    aria-label="เลื่อนปรับน้ำหนักตัว"
                    className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Hairline Height Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textSecondary">ส่วนสูงของคุณ</span>
                    <span className="font-mono font-semibold text-textPrimary">
                      {height} ซม.
                    </span>
                  </div>
                  <input
                    type="range"
                    min={140}
                    max={210}
                    step={1}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    aria-label="เลื่อนปรับส่วนสูง"
                    className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/calculator/protein"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-textPrimary hover:text-primary transition-colors border-b border-textPrimary hover:border-primary pb-0.5"
                >
                  <span>เปิดเครื่องคำนวณ BMI, BMR และ TDEE ฉบับเต็ม</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* RIGHT: Interactive Clinical Evidence Index (7 cols) */}
            <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-between space-y-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold">
                    03 / CLINICAL EVIDENCE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-textPrimary tracking-tight">
                    หลักฐานทางวิทยาศาสตร์รายตัว
                  </h2>
                </div>
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-1 text-xs font-medium text-textSecondary hover:text-primary transition-colors"
                >
                  <span>เปรียบเทียบทั้งหมด</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Clean Horizontal Hairline Selector */}
              <div className="flex items-center gap-5 border-b border-border overflow-x-auto scrollbar-none">
                {topSupplements.map((item, idx) => {
                  const selected = item.slug === activeSupp?.slug;
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => setActiveSlug(item.slug)}
                      className={`relative pb-3 text-xs sm:text-[13px] whitespace-nowrap transition-colors cursor-pointer ${
                        selected
                          ? 'text-textPrimary font-semibold'
                          : 'text-textSecondary hover:text-textPrimary'
                      }`}
                    >
                      <span className="font-mono text-[10px] text-primary mr-1.5">
                        0{idx + 1}
                      </span>
                      <span>{item.nameTH}</span>
                      {selected && (
                        <motion.span
                          layoutId="minimal-evidence-tab"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                          className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-primary"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Animated Clinical Dossier Content */}
              {activeSupp && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSupp.slug}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6 flex-1 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-xl font-semibold text-textPrimary">
                          {activeSupp.nameEN}
                        </h3>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
                          หลักฐานระดับ:{' '}
                          {activeSupp.evidenceLevel === 'strong'
                            ? 'แข็งแกร่ง (AIS A)'
                            : activeSupp.evidenceLevel === 'moderate'
                            ? 'ปานกลาง'
                            : 'จำกัด'}
                        </span>
                      </div>

                      <p className="text-sm text-textSecondary leading-relaxed">
                        {activeSupp.evidenceSummary || activeSupp.shortDescription}
                      </p>

                      {/* Architectural 2-Column Spec Table */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 border-y border-border divide-y sm:divide-y-0 sm:divide-x divide-border">
                        <div className="py-4 sm:pr-5 space-y-1">
                          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary">
                            ขนาดที่แนะนำ (Dosage)
                          </div>
                          <div className="text-xs sm:text-[13px] font-medium text-textPrimary leading-relaxed">
                            {activeSupp.usage.dosage}
                          </div>
                        </div>
                        <div className="py-4 sm:pl-5 space-y-1">
                          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary">
                            ช่วงเวลา (Timing)
                          </div>
                          <div className="text-xs sm:text-[13px] font-medium text-textPrimary leading-relaxed">
                            {activeSupp.usage.timing}
                          </div>
                        </div>
                      </div>

                      {/* Key Point + Limitation */}
                      <div className="space-y-2 text-xs text-textSecondary">
                        {activeSupp.benefits[0] && (
                          <p>
                            <strong className="text-textPrimary font-semibold">
                              จุดเด่นวิจัย:{' '}
                            </strong>
                            {activeSupp.benefits[0].title} —{' '}
                            {activeSupp.benefits[0].description}
                          </p>
                        )}
                        {activeSupp.limitations[0] && (
                          <p>
                            <strong className="text-textPrimary font-semibold">
                              ข้อจำกัด:{' '}
                            </strong>
                            {activeSupp.limitations[0]}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-4">
                      <span className="text-xs font-mono text-textSecondary">
                        อ้างอิงเอกสารวิจัย {activeSupp.references.length} ฉบับ
                      </span>
                      <Link
                        href={`/supplements/${activeSupp.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-textPrimary hover:text-primary transition-colors border-b border-textPrimary hover:border-primary pb-0.5"
                      >
                        <span>อ่านข้อมูลฉบับเต็ม</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
