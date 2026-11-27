'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { goals } from '@/data/goals';
import { supplements } from '@/data/supplements';
import Disclaimer from '@/components/ui/Disclaimer';
import BlurFade from '@/components/ui/BlurFade';
import TextEffect from '@/components/ui/TextEffect';
import type { EvidenceLevel } from '@/types';

const EVIDENCE_LABEL: Record<EvidenceLevel, { text: string; accent: boolean }> = {
  strong: { text: 'AIS A · แข็งแกร่ง', accent: true },
  moderate: { text: 'MODERATE · ปานกลาง', accent: false },
  limited: { text: 'LIMITED · เฉพาะกลุ่ม', accent: false },
  insufficient: { text: 'INSUFFICIENT', accent: false },
};

function GoalsContent() {
  const [selectedGoalSlug, setSelectedGoalSlug] = useState<string>('muscle-gain');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && goals.some((g) => g.slug === hash)) {
        setSelectedGoalSlug(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const selectedGoal = goals.find((g) => g.slug === selectedGoalSlug) || goals[0];

  const handleSelectGoal = (slug: string) => {
    setSelectedGoalSlug(slug);
    window.history.replaceState(null, '', `#${slug}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. MONUMENTAL MINIMAL HEADER */}
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
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-[0.22em] text-textSecondary">
              <Link href="/" className="hover:text-primary transition-colors">
                HOME
              </Link>
              <span>/</span>
              <span className="text-primary font-semibold">GOAL PROTOCOLS</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-semibold text-textPrimary tracking-[-0.03em] leading-[1.08]">
              <TextEffect segments={[{ text: 'เลือกตามเป้าหมายการฝึก' }]} />
            </h1>
            <BlurFade inView={false} delay={0.14}>
              <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                เลือกเป้าหมายของคุณเพื่อดูหลักโภชนาการพื้นฐานที่ต้องทำก่อน อาหารเสริมที่มีหลักฐานวิจัยรองรับ และข้อจำกัดที่ควรรู้
              </p>
            </BlurFade>
          </div>

          {/* 2. ARCHITECTURAL 1PX-HAIRLINE 6-GOAL MATRIX SELECTOR */}
          <BlurFade inView={false} delay={0.2}>
            <div className="border-t border-l border-border bg-white grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {goals.map((goal, idx) => {
                const isSelected = selectedGoal.slug === goal.slug;
                const shortName = goal.nameTH.split('(')[0].trim();
                return (
                  <button
                    key={goal.slug}
                    type="button"
                    onClick={() => handleSelectGoal(goal.slug)}
                    className={`relative p-4 sm:p-5 border-r border-b border-border text-left transition-colors cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-secondary'
                        : 'bg-white hover:bg-secondary/45'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={isSelected ? 'text-primary font-semibold' : 'text-textSecondary'}>
                        0{idx + 1}
                      </span>
                      <span className="text-textSecondary/70">
                        {goal.relatedSupplements.length} ตัว
                      </span>
                    </div>
                    <div
                      className={`text-xs sm:text-[13px] leading-snug ${
                        isSelected
                          ? 'text-textPrimary font-semibold'
                          : 'text-textSecondary font-normal'
                      }`}
                    >
                      {shortName}
                    </div>
                    {isSelected && (
                      <motion.span
                        layoutId="goal-active-indicator"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        className="absolute inset-x-0 bottom-0 h-[2px] bg-primary"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </BlurFade>
        </div>
      </section>

      {/* 3. ANIMATED GOAL PROTOCOL DOSSIER */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16 space-y-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedGoal.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="space-y-10"
          >
            {/* Protocol Overview Row */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-border">
              <div className="space-y-2.5 max-w-2xl">
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold">
                  GOAL PROTOCOL · {selectedGoal.slug.toUpperCase()}
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold text-textPrimary tracking-tight">
                  {selectedGoal.nameTH}
                </h2>
                <p className="text-sm text-textSecondary leading-relaxed">
                  {selectedGoal.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 shrink-0">
                <Link
                  href={`/store?goal=${selectedGoal.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-textPrimary text-white hover:bg-primary text-xs font-medium transition-colors"
                >
                  <span>ดูสินค้าสำหรับเป้าหมายนี้</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/calculator/protein"
                  className="inline-flex items-center gap-1.5 px-5 py-3 border border-border text-xs font-medium text-textPrimary hover:border-textPrimary transition-colors"
                >
                  <span>คำนวณโปรตีน</span>
                </Link>
              </div>
            </div>

            {/* 1px-Divided 2-Column Clinical Layout */}
            <div className="border border-border bg-white grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
              {/* Left: Nutrition Basics + Warnings (5 cols) */}
              <div className="lg:col-span-5 divide-y divide-border">
                <div className="p-7 sm:p-9 space-y-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                      01 / FOUNDATION FIRST
                    </span>
                    <h3 className="text-lg font-semibold text-textPrimary">
                      โภชนาการพื้นฐานที่ต้องทำก่อน
                    </h3>
                  </div>

                  <ol className="space-y-4">
                    {selectedGoal.nutritionBasics.map((item, i) => (
                      <li key={i} className="flex items-start gap-3.5 text-xs sm:text-[13px] text-textSecondary leading-relaxed">
                        <span className="font-mono text-[11px] text-primary font-semibold pt-0.5 shrink-0">
                          0{i + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="p-7 sm:p-9 bg-secondary/45 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-textSecondary font-semibold">
                      03 / CLINICAL CAUTIONS
                    </span>
                    <h3 className="text-base font-semibold text-textPrimary">
                      ข้อควรระวังและข้อเท็จจริง
                    </h3>
                  </div>

                  <ul className="space-y-3 text-xs sm:text-[13px] text-textSecondary leading-relaxed">
                    {selectedGoal.warnings.map((w, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-primary font-mono shrink-0">—</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: Evidence-Backed Supplements List (7 cols) */}
              <div className="lg:col-span-7 p-7 sm:p-9 space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                    02 / EVIDENCE-BACKED SUPPLEMENTS
                  </span>
                  <h3 className="text-lg font-semibold text-textPrimary">
                    อาหารเสริมที่มีงานวิจัยรองรับ ({selectedGoal.supplementReasons.length} ชนิด)
                  </h3>
                </div>

                <div className="border-y border-border divide-y divide-border">
                  {selectedGoal.supplementReasons.map((rec, idx) => {
                    const supp = supplements.find((s) => s.slug === rec.slug);
                    if (!supp) return null;
                    const ev = EVIDENCE_LABEL[supp.evidenceLevel] || EVIDENCE_LABEL.moderate;
                    return (
                      <Link
                        key={rec.slug}
                        href={`/supplements/${supp.slug}`}
                        className="group py-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-secondary/45 -mx-3 px-3 transition-colors"
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-[11px] font-mono text-textSecondary">
                              0{idx + 1}
                            </span>
                            <span className="text-base font-semibold text-textPrimary group-hover:text-primary transition-colors">
                              {supp.nameTH}
                            </span>
                            <span className="text-xs font-mono text-textSecondary">
                              {supp.nameEN}
                            </span>
                          </div>
                          <p className="text-xs sm:text-[13px] text-textSecondary leading-relaxed">
                            {rec.reason}
                          </p>
                          <div className="pt-1 flex flex-wrap items-center gap-4 text-[11px] font-mono text-textSecondary">
                            <span className={ev.accent ? 'text-primary font-semibold' : ''}>
                              {ev.text}
                            </span>
                            <span>·</span>
                            <span>โดส: {supp.usage.dosage.split('(')[0].trim()}</span>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-medium text-textPrimary group-hover:text-primary shrink-0 self-start pt-1">
                          <span>เจาะลึก</span>
                          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <Disclaimer />
      </main>
    </div>
  );
}

export default function GoalsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center text-xs font-mono text-textSecondary">
          LOADING PROTOCOLS...
        </div>
      }
    >
      <GoalsContent />
    </Suspense>
  );
}
