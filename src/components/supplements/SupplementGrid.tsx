'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ArrowUpRight } from 'lucide-react';
import type { Supplement, EvidenceLevel } from '@/types';
import SupplementCard from './SupplementCard';

interface SupplementGridProps {
  supplements: Supplement[];
  emptyMessage?: string;
  viewMode?: 'grid' | 'index';
  onQuickInspect?: (supplement: Supplement) => void;
}

const EVIDENCE_SHORT: Record<EvidenceLevel, string> = {
  strong: 'AIS A · แข็งแกร่ง',
  moderate: 'MODERATE · ปานกลาง',
  limited: 'LIMITED · เฉพาะกลุ่ม',
  insufficient: 'INSUFFICIENT',
};

export default function SupplementGrid({
  supplements,
  emptyMessage = 'ไม่พบข้อมูลอาหารเสริมที่ค้นหา',
  viewMode = 'grid',
  onQuickInspect,
}: SupplementGridProps) {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(
    supplements[0]?.slug || null
  );

  if (supplements.length === 0) {
    return (
      <div className="w-full py-24 px-6 border border-border bg-secondary/40 text-center space-y-2">
        <h3 className="text-base font-semibold text-textPrimary">{emptyMessage}</h3>
        <p className="text-xs text-textSecondary">
          ลองปรับเปลี่ยนคำค้นหา หรือล้างตัวกรองเพื่อดูรายการอาหารเสริมทั้งหมด
        </p>
      </div>
    );
  }

  // 21st.dev Minimal Expandable Clinical Ledger (Index View)
  if (viewMode === 'index') {
    return (
      <div className="border-y border-border divide-y divide-border bg-white">
        {supplements.map((supp, idx) => {
          const isOpen = expandedSlug === supp.slug;
          return (
            <div key={supp.slug} className="transition-colors hover:bg-secondary/35">
              <div className="py-5 px-2 sm:px-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setExpandedSlug(isOpen ? null : supp.slug)}
                  className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-left cursor-pointer min-w-0"
                >
                  <span className="text-xs font-mono text-textSecondary w-8 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0 md:w-64 shrink-0">
                    <div className="text-sm sm:text-base font-semibold text-textPrimary truncate">
                      {supp.nameTH}
                    </div>
                    <div className="text-xs font-mono text-textSecondary truncate">
                      {supp.nameEN}
                    </div>
                  </div>

                  <p className="hidden lg:block text-xs text-textSecondary truncate flex-1">
                    {supp.shortDescription}
                  </p>

                  <span
                    className={`text-[10px] font-mono uppercase tracking-[0.15em] font-semibold shrink-0 ${
                      supp.evidenceLevel === 'strong' ? 'text-primary' : 'text-textSecondary'
                    }`}
                  >
                    {EVIDENCE_SHORT[supp.evidenceLevel]}
                  </span>
                </button>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/supplements/${supp.slug}`}
                    className="p-2 text-textSecondary hover:text-primary transition-colors"
                    aria-label={`เปิดหน้า ${supp.nameTH}`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setExpandedSlug(isOpen ? null : supp.slug)}
                    className="p-2 text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
                    aria-label={isOpen ? 'ซ่อนรายละเอียด' : 'ขยายรายละเอียด'}
                  >
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-14 pb-7 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-6 border-t border-border/60 bg-secondary/40">
                      <div className="lg:col-span-5 space-y-2">
                        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary font-semibold">
                          CLINICAL SUMMARY
                        </div>
                        <p className="text-xs sm:text-[13px] text-textSecondary leading-relaxed">
                          {supp.evidenceSummary || supp.fullDescription}
                        </p>
                      </div>

                      <div className="lg:col-span-4 space-y-3 text-xs">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-textSecondary block">
                            ขนาดที่แนะนำ
                          </span>
                          <span className="font-medium text-textPrimary">{supp.usage.dosage}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-textSecondary block">
                            ช่วงเวลาที่เหมาะสม
                          </span>
                          <span className="font-medium text-textPrimary">{supp.usage.timing}</span>
                        </div>
                      </div>

                      <div className="lg:col-span-3 flex flex-col justify-between items-start lg:items-end gap-4">
                        <div className="text-xs text-textSecondary font-mono">
                          อ้างอิงวิจัย {supp.references.length} ฉบับ
                        </div>
                        <div className="flex items-center gap-3">
                          {onQuickInspect && (
                            <button
                              type="button"
                              onClick={() => onQuickInspect(supp)}
                              className="text-xs text-textSecondary hover:text-textPrimary cursor-pointer"
                            >
                              ดูกลไกเต็ม
                            </button>
                          )}
                          <Link
                            href={`/supplements/${supp.slug}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-textPrimary text-white hover:bg-primary text-xs font-medium transition-colors"
                          >
                            <span>อ่านฉบับเต็ม</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  }

  // Default: 21st.dev 1px-Hairline Architectural Clinical Matrix Grid
  return (
    <div className="border-t border-l border-border bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {supplements.map((supp, idx) => (
        <SupplementCard
          key={supp.id || supp.slug}
          supplement={supp}
          index={idx}
          onQuickInspect={onQuickInspect}
        />
      ))}
    </div>
  );
}
