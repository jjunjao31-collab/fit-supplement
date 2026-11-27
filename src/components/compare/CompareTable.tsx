'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, ArrowUpRight } from 'lucide-react';
import type { Supplement, EvidenceLevel } from '@/types';
import AnimatedTabs from '@/components/ui/AnimatedTabs';

interface CompareTableProps {
  supplements: Supplement[];
  initialSlug1?: string;
  initialSlug2?: string;
}

const PRESETS = [
  { id: 'whey-mass', label: 'เวย์ vs Mass Gainer', s1: 'whey-protein', s2: 'mass-gainer' },
  { id: 'creatine-beta', label: 'ครีเอทีน vs เบต้า-อะลานีน', s1: 'creatine-monohydrate', s2: 'beta-alanine' },
  { id: 'bcaa-whey', label: 'BCAA vs เวย์โปรตีน', s1: 'bcaa', s2: 'whey-protein' },
  { id: 'caffeine-pre', label: 'คาเฟอีน vs พรีเวิร์กเอาต์', s1: 'caffeine', s2: 'pre-workout' },
];

const EVIDENCE_TEXT: Record<EvidenceLevel, { label: string; accent: boolean }> = {
  strong: { label: 'AIS GROUP A · หลักฐานแข็งแกร่ง', accent: true },
  moderate: { label: 'MODERATE · หลักฐานปานกลาง', accent: false },
  limited: { label: 'LIMITED · เฉพาะบางกลุ่ม', accent: false },
  insufficient: { label: 'INSUFFICIENT · ยังไม่เพียงพอ', accent: false },
};

/**
 * 21st.dev Minimal Architectural 1px-Hairline Comparison Matrix
 */
export default function CompareTable({
  supplements,
  initialSlug1 = 'whey-protein',
  initialSlug2 = 'mass-gainer',
}: CompareTableProps) {
  const [slug1, setSlug1] = useState<string>(initialSlug1);
  const [slug2, setSlug2] = useState<string>(initialSlug2);

  const supp1 = supplements.find((s) => s.slug === slug1) || supplements[0];
  const supp2 = supplements.find((s) => s.slug === slug2) || supplements[1] || supplements[0];

  const activePreset =
    PRESETS.find((p) => p.s1 === slug1 && p.s2 === slug2)?.id || '';

  const handleSwap = () => {
    setSlug1(slug2);
    setSlug2(slug1);
  };

  const renderDashList = (items: string[] | undefined, emptyText = 'ไม่มีข้อมูลระบุ') => {
    if (!items || items.length === 0) {
      return <span className="text-xs text-textSecondary/70">{emptyText}</span>;
    }
    return (
      <ul className="space-y-2 text-xs sm:text-[13px] text-textSecondary">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
            <span className="text-primary font-mono shrink-0">—</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  const ev1 = EVIDENCE_TEXT[supp1.evidenceLevel] || EVIDENCE_TEXT.moderate;
  const ev2 = EVIDENCE_TEXT[supp2.evidenceLevel] || EVIDENCE_TEXT.moderate;

  return (
    <div className="w-full space-y-10">
      {/* Quick Presets Underline Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-textSecondary">
          POPULAR PRESETS
        </span>
        <AnimatedTabs
          layoutId="compare-preset-tab"
          variant="underline"
          tabs={PRESETS.map((p) => ({ id: p.id, label: p.label }))}
          activeTab={activePreset}
          onChange={(id) => {
            const preset = PRESETS.find((p) => p.id === id);
            if (preset) {
              setSlug1(preset.s1);
              setSlug2(preset.s2);
            }
          }}
        />
      </div>

      {/* Minimal Architectural Selector Bar */}
      <div className="border border-border bg-white grid grid-cols-1 md:grid-cols-11 divide-y md:divide-y-0 md:divide-x divide-border">
        <div className="md:col-span-5 p-5 sm:p-6 space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold block">
            COMPOUND 01
          </label>
          <select
            value={slug1}
            onChange={(e) => setSlug1(e.target.value)}
            aria-label="เลือกอาหารเสริมตัวที่ 1"
            className="w-full bg-transparent text-textPrimary font-semibold text-base focus:outline-none cursor-pointer border-b border-border focus:border-textPrimary pb-2 transition-colors"
          >
            {supplements.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.nameTH} ({s.nameEN})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1 flex items-center justify-center p-3 bg-secondary/40">
          <button
            type="button"
            onClick={handleSwap}
            title="สลับตำแหน่งเปรียบเทียบ"
            aria-label="สลับตำแหน่งเปรียบเทียบ"
            className="p-2.5 rounded-full border border-border bg-white hover:bg-textPrimary hover:text-white hover:border-textPrimary text-textPrimary transition-colors cursor-pointer group"
          >
            <ArrowLeftRight className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>

        <div className="md:col-span-5 p-5 sm:p-6 space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold block">
            COMPOUND 02
          </label>
          <select
            value={slug2}
            onChange={(e) => setSlug2(e.target.value)}
            aria-label="เลือกอาหารเสริมตัวที่ 2"
            className="w-full bg-transparent text-textPrimary font-semibold text-base focus:outline-none cursor-pointer border-b border-border focus:border-textPrimary pb-2 transition-colors"
          >
            {supplements.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.nameTH} ({s.nameEN})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Architectural 1px-Hairline Matrix Table */}
      <div className="border border-border bg-white divide-y divide-border">
        {/* Header Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          {[
            { supp: supp1, ev: ev1, num: '01' },
            { supp: supp2, ev: ev2, num: '02' },
          ].map(({ supp, ev, num }) => (
            <div key={num} className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.18em]">
                <span className="text-textSecondary">SUBJECT {num}</span>
                <span className={ev.accent ? 'text-primary font-semibold' : 'text-textSecondary'}>
                  {ev.label}
                </span>
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-semibold text-textPrimary">
                  {supp.nameTH}
                </h2>
                <p className="text-xs font-mono text-textSecondary">{supp.nameEN}</p>
              </div>
              <p className="text-xs sm:text-[13px] text-textSecondary leading-relaxed">
                {supp.shortDescription}
              </p>
              <Link
                href={`/supplements/${supp.slug}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-textPrimary hover:text-primary border-b border-textPrimary hover:border-primary pb-0.5 transition-colors"
              >
                <span>อ่านงานวิจัยฉบับเต็ม ({supp.references.length} ฉบับ)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Row 01: Benefits */}
        <div>
          <div className="px-6 sm:px-8 py-3 bg-secondary/60 border-b border-border text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
            01 / ประโยชน์หลักที่มีหลักฐานรองรับ
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {[supp1, supp2].map((s, idx) => (
              <div key={idx} className="p-6 sm:p-8 space-y-3">
                <div className="text-xs font-semibold text-textPrimary md:hidden">{s.nameTH}</div>
                <ul className="space-y-3 text-xs sm:text-[13px] text-textSecondary">
                  {s.benefits.map((b, i) => (
                    <li key={i} className="leading-relaxed">
                      <strong className="text-textPrimary font-medium block">{b.title}</strong>
                      <span>{b.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Row 02: Mechanism */}
        <div>
          <div className="px-6 sm:px-8 py-3 bg-secondary/60 border-b border-border text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
            02 / กลไกการออกฤทธิ์
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {[supp1, supp2].map((s, idx) => (
              <div key={idx} className="p-6 sm:p-8 space-y-2">
                <div className="text-xs font-semibold text-textPrimary md:hidden">{s.nameTH}</div>
                <p className="text-xs sm:text-[13px] text-textSecondary leading-relaxed">
                  {s.howItWorks}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Row 03: Suitable For */}
        <div>
          <div className="px-6 sm:px-8 py-3 bg-secondary/60 border-b border-border text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
            03 / เหมาะสำหรับใคร
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {[supp1, supp2].map((s, idx) => (
              <div key={idx} className="p-6 sm:p-8 space-y-2">
                <div className="text-xs font-semibold text-textPrimary md:hidden">{s.nameTH}</div>
                {renderDashList(s.suitableFor)}
              </div>
            ))}
          </div>
        </div>

        {/* Row 04: Not Necessary For */}
        <div>
          <div className="px-6 sm:px-8 py-3 bg-secondary/60 border-b border-border text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
            04 / กรณีที่อาจไม่จำเป็น
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {[supp1, supp2].map((s, idx) => (
              <div key={idx} className="p-6 sm:p-8 space-y-2">
                <div className="text-xs font-semibold text-textPrimary md:hidden">{s.nameTH}</div>
                {renderDashList(s.notNecessaryFor)}
              </div>
            ))}
          </div>
        </div>

        {/* Row 05: Dosage & Timing */}
        <div>
          <div className="px-6 sm:px-8 py-3 bg-secondary/60 border-b border-border text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
            05 / ปริมาณและช่วงเวลาการรับประทาน
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {[supp1, supp2].map((s, idx) => (
              <div key={idx} className="p-6 sm:p-8 space-y-4 text-xs sm:text-[13px]">
                <div className="text-xs font-semibold text-textPrimary md:hidden">{s.nameTH}</div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-textSecondary block">
                    DOSAGE
                  </span>
                  <span className="font-medium text-textPrimary">{s.usage.dosage}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-textSecondary block">
                    TIMING
                  </span>
                  <span className="font-medium text-textPrimary">{s.usage.timing}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-textSecondary block">
                    PROTOCOL
                  </span>
                  <span className="text-textSecondary">
                    {s.usage.dailyRequired
                      ? 'ควรรับประทานต่อเนื่องทุกวันเพื่อสะสมระดับในกล้ามเนื้อ'
                      : 'รับประทานเฉพาะวันฝึกซ้อมหรือเมื่อต้องการ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 06: Side Effects & Precautions */}
        <div>
          <div className="px-6 sm:px-8 py-3 bg-secondary/60 border-b border-border text-[10px] font-mono uppercase tracking-[0.2em] text-textPrimary font-semibold">
            06 / ผลข้างเคียงและข้อควรระวัง
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {[supp1, supp2].map((s, idx) => (
              <div key={idx} className="p-6 sm:p-8 space-y-4">
                <div className="text-xs font-semibold text-textPrimary md:hidden">{s.nameTH}</div>
                {s.sideEffects.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold block">
                      ผลข้างเคียงที่อาจพบ
                    </span>
                    {s.sideEffects.map((se, i) => (
                      <p key={i} className="text-xs text-textSecondary leading-relaxed">
                        <strong className="text-textPrimary font-medium">{se.name}:</strong>{' '}
                        {se.description}
                      </p>
                    ))}
                  </div>
                )}
                <div className="space-y-1.5 pt-2 border-t border-border/70">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-textSecondary font-semibold block">
                    ข้อควรระวัง
                  </span>
                  {renderDashList(s.precautions)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
