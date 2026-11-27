'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Clock,
  Pill,
  CheckCircle2,
  AlertCircle,
  Scale,
} from 'lucide-react';
import type { Supplement } from '@/types';
import SupplementIcon from '@/components/ui/SupplementIcon';
import EvidenceBadge from '@/components/ui/EvidenceBadge';
import SpotlightCard from '@/components/ui/SpotlightCard';

interface EvidenceExplorerProps {
  supplements: Supplement[];
}

export default function EvidenceExplorer({ supplements }: EvidenceExplorerProps) {
  const featured = supplements.slice(0, 5);
  const [activeSlug, setActiveSlug] = useState<string>(featured[0]?.slug || '');
  const activeSupp = featured.find((s) => s.slug === activeSlug) || featured[0];

  if (!activeSupp) return null;

  return (
    <section className="py-16 sm:py-22 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Editorial Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block">
              CLINICAL EVIDENCE DOSSIER
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-textPrimary tracking-tight">
              เจาะลึกหลักฐานงานวิจัยรายตัว
            </h2>
            <p className="text-sm text-textSecondary">
              คลิกเลือกสารเสริมด้านซ้ายเพื่อดูระดับหลักฐาน โดสที่แนะนำ เวลาทาน และข้อจำกัดที่ควรรู้ก่อนซื้อ
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link
              href="/compare"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary hover:bg-amber-50 border border-border hover:border-primary/40 text-xs font-bold text-textPrimary transition-colors"
            >
              <Scale className="w-3.5 h-3.5 text-primary" />
              <span>เปรียบเทียบ 1 ต่อ 1</span>
            </Link>
            <Link
              href="/supplements"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <span>ดูทั้งหมด ({supplements.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 21st.dev Split Vertical Interactive Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Vertical Selector Tabs (5 cols) */}
          <div className="lg:col-span-5 space-y-2">
            {featured.map((item, index) => {
              const selected = item.slug === activeSupp.slug;
              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => setActiveSlug(item.slug)}
                  className={`relative w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    selected
                      ? 'bg-secondary border-primary/50 shadow-xs'
                      : 'bg-white border-border/80 hover:bg-secondary/60 hover:border-border'
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="evidence-active-bar"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary"
                    />
                  )}

                  <div className="flex items-center gap-3.5 min-w-0 pl-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                        selected
                          ? 'bg-primary text-white border-primary'
                          : 'bg-secondary text-primary border-border'
                      }`}
                    >
                      <SupplementIcon name={item.icon} size="sm" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-textSecondary">
                          0{index + 1}
                        </span>
                        <span
                          className={`text-sm font-extrabold truncate ${
                            selected ? 'text-primary' : 'text-textPrimary'
                          }`}
                        >
                          {item.nameTH}
                        </span>
                      </div>
                      <div className="text-xs text-textSecondary font-mono truncate">
                        {item.nameEN}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 border ${
                      selected
                        ? 'bg-white text-primary border-primary/30'
                        : 'bg-secondary text-textSecondary border-border'
                    }`}
                  >
                    {item.references.length} วิจัย
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Animated Clinical Dossier (7 cols) */}
          <div className="lg:col-span-7">
            <SpotlightCard className="p-6 sm:p-8 shadow-sm min-h-[420px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSupp.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  {/* Top Title + Evidence Badge */}
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-border">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold">
                        {activeSupp.nameEN}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-textPrimary">
                        {activeSupp.nameTH}
                      </h3>
                    </div>
                    <EvidenceBadge level={activeSupp.evidenceLevel} size="sm" />
                  </div>

                  {/* Clinical Summary */}
                  <p className="text-sm text-textSecondary leading-relaxed">
                    {activeSupp.evidenceSummary || activeSupp.shortDescription}
                  </p>

                  {/* Dosage & Timing Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-secondary border border-border space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                        <Pill className="w-3.5 h-3.5" />
                        <span>ขนาดที่งานวิจัยแนะนำ</span>
                      </div>
                      <p className="text-xs text-textPrimary font-semibold leading-relaxed">
                        {activeSupp.usage.dosage}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-secondary border border-border space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ช่วงเวลาที่เหมาะสม</span>
                      </div>
                      <p className="text-xs text-textPrimary font-semibold leading-relaxed">
                        {activeSupp.usage.timing}
                      </p>
                    </div>
                  </div>

                  {/* Key Benefits + Caution */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-textPrimary flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        <span>ประโยชน์ที่มีหลักฐานรองรับ</span>
                      </div>
                      <ul className="space-y-1.5">
                        {activeSupp.benefits.slice(0, 3).map((b, i) => (
                          <li key={i} className="text-xs text-textSecondary leading-relaxed">
                            <strong className="text-textPrimary">{b.title}:</strong>{' '}
                            {b.description}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-textPrimary flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-primary" />
                        <span>ข้อจำกัดที่ควรรู้</span>
                      </div>
                      <ul className="space-y-1.5">
                        {activeSupp.limitations.slice(0, 3).map((lim, i) => (
                          <li key={i} className="text-xs text-textSecondary leading-relaxed">
                            • {lim}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom CTA */}
                  <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-textSecondary">
                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                      <span>อ้างอิงเอกสารวิชาการ {activeSupp.references.length} ฉบับ</span>
                    </span>
                    <Link
                      href={`/supplements/${activeSupp.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white hover:bg-primary-dark text-xs font-bold transition-colors shadow-xs"
                    >
                      <span>อ่านข้อมูลและงานวิจัยฉบับเต็ม</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}
