'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Supplement, EvidenceLevel } from '@/types';
import SpotlightCard from '@/components/ui/SpotlightCard';

interface SupplementCardProps {
  supplement: Supplement;
  index?: number;
  onQuickInspect?: (supplement: Supplement) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  protein: 'PROTEIN',
  creatine: 'CREATINE',
  stimulant: 'STIMULANT',
  'pre-workout': 'PRE-WORKOUT',
  'amino-acid': 'AMINO ACID',
  electrolyte: 'ELECTROLYTE',
  'mass-gainer': 'MASS GAINER',
  other: 'BUFFER / ERGOGENIC',
};

const EVIDENCE_META: Record<EvidenceLevel, { label: string; dotClass: string; textClass: string }> = {
  strong: {
    label: 'AIS A · แข็งแกร่ง',
    dotClass: 'bg-primary',
    textClass: 'text-primary',
  },
  moderate: {
    label: 'MODERATE · ปานกลาง',
    dotClass: 'bg-textPrimary/55',
    textClass: 'text-textPrimary',
  },
  limited: {
    label: 'LIMITED · เฉพาะกลุ่ม',
    dotClass: 'bg-textSecondary/45',
    textClass: 'text-textSecondary',
  },
  insufficient: {
    label: 'INSUFFICIENT · ยังไม่พอ',
    dotClass: 'bg-border',
    textClass: 'text-textSecondary',
  },
};

function getShortDose(dosage: string): string {
  const firstClause = dosage.split('(')[0]?.split('หรือ')[0]?.trim() || dosage;
  return firstClause.length > 26 ? `${firstClause.slice(0, 26)}...` : firstClause;
}

/**
 * 21st.dev Minimal Architectural Clinical Cell
 * Zero drop-shadow boxes, zero beige gradient headers, zero bulky yellow pills
 */
export default function SupplementCard({
  supplement,
  index,
  onQuickInspect,
}: SupplementCardProps) {
  const evidence = EVIDENCE_META[supplement.evidenceLevel] || EVIDENCE_META.moderate;
  const catCode = CATEGORY_LABELS[supplement.category] || 'SUPPLEMENT';
  const numStr = index !== undefined ? String(index + 1).padStart(2, '0') : null;

  return (
    <SpotlightCard
      sharp
      className="h-full flex flex-col justify-between p-6 sm:p-7 border-r border-b border-border hover:bg-secondary/35 transition-colors duration-300"
    >
      <div className="flex flex-col justify-between h-full gap-6">
        {/* Top Content */}
        <div className="space-y-5">
          {/* Quiet Top Index + Evidence Dot */}
          <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.16em]">
            <span className="text-textSecondary truncate">
              {numStr ? `${numStr} / ` : ''}
              {catCode}
            </span>
            <span className={`inline-flex items-center gap-1.5 font-semibold shrink-0 ${evidence.textClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${evidence.dotClass}`} />
              <span>{evidence.label}</span>
            </span>
          </div>

          {/* Editorial Title & Description */}
          <Link href={`/supplements/${supplement.slug}`} className="group block space-y-1.5">
            <h3 className="text-lg sm:text-xl font-semibold text-textPrimary group-hover:text-primary transition-colors leading-snug">
              {supplement.nameTH}
            </h3>
            <p className="text-xs font-mono text-textSecondary">
              {supplement.nameEN}
            </p>
            <p className="pt-2 text-xs sm:text-[13px] text-textSecondary leading-relaxed line-clamp-2">
              {supplement.shortDescription}
            </p>
          </Link>

          {/* Architectural 1px-Divided Clinical Spec Strip */}
          <div className="grid grid-cols-2 border-y border-border/80 divide-x divide-border/80 py-3">
            <div className="pr-3 space-y-0.5 min-w-0">
              <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-textSecondary">
                DOSAGE
              </div>
              <div className="text-xs font-medium text-textPrimary truncate" title={supplement.usage.dosage}>
                {getShortDose(supplement.usage.dosage)}
              </div>
            </div>
            <div className="pl-3 space-y-0.5 min-w-0">
              <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-textSecondary">
                PROTOCOL
              </div>
              <div className="text-xs font-medium text-textPrimary truncate">
                {supplement.usage.dailyRequired ? 'ทานต่อเนื่องทุกวัน' : 'ใช้ตามวันฝึกซ้อม'}
              </div>
            </div>
          </div>

          {/* Minimal Em-Dash Benefits + Audience */}
          <div className="space-y-2 text-xs text-textSecondary">
            {supplement.benefits.slice(0, 2).map((b, i) => (
              <div key={i} className="flex items-start gap-2 leading-relaxed">
                <span className="text-primary font-mono shrink-0">—</span>
                <span className="text-textPrimary/85 line-clamp-1">{b.title}</span>
              </div>
            ))}
            {supplement.suitableFor[0] && (
              <p className="pt-1 text-[11px] text-textSecondary/90 line-clamp-1">
                เหมาะกับ: {supplement.suitableFor[0]}
              </p>
            )}
          </div>
        </div>

        {/* Minimal Footer Actions */}
        <div className="pt-4 border-t border-border/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-textSecondary">
              {supplement.references.length} วิจัย
            </span>
            {onQuickInspect && (
              <>
                <span className="w-px h-3 bg-border" />
                <button
                  type="button"
                  onClick={() => onQuickInspect(supplement)}
                  className="text-xs text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
                >
                  สรุปเร็ว
                </button>
              </>
            )}
          </div>

          <Link
            href={`/supplements/${supplement.slug}`}
            className="group/link inline-flex items-center gap-1 text-xs font-medium text-textPrimary hover:text-primary transition-colors"
          >
            <span>อ่านฉบับเต็ม</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </SpotlightCard>
  );
}
