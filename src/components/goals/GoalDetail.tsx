import Link from 'next/link';
import { ArrowRight, AlertTriangle, ShieldCheck, CheckCircle2, Info, Dumbbell, Sparkles } from 'lucide-react';
import type { Goal, Supplement } from '@/types';
import EvidenceBadge from '@/components/ui/EvidenceBadge';
import GoalIcon from '@/components/ui/GoalIcon';
import SupplementIcon from '@/components/ui/SupplementIcon';
import { cn } from '@/lib/utils';

interface GoalDetailProps {
  goal: Goal;
  supplements: Supplement[];
}

export default function GoalDetail({ goal, supplements }: GoalDetailProps) {
  // Find related supplement objects
  const relatedSupps = goal.relatedSupplements
    .map((slug) => {
      const supp = supplements.find((s) => s.slug === slug);
      const reasonObj = goal.supplementReasons.find((r) => r.slug === slug);
      return {
        supplement: supp,
        reason: reasonObj?.reason,
      };
    })
    .filter((item): item is { supplement: Supplement; reason: string | undefined } => item.supplement !== undefined);

  return (
    <div className="w-full space-y-10 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-card via-secondary to-primary/5 border border-border shadow-2xl relative overflow-hidden">
        <div
          className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none bg-primary"
        />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-secondary border border-border shadow-inner text-primary">
              <GoalIcon slug={goal.slug} size="xl" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                เป้าหมายการออกกำลังกาย
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
                {goal.nameTH}
              </h2>
            </div>
          </div>

          <p className="text-sm sm:text-base text-textSecondary leading-relaxed pt-2">
            {goal.description}
          </p>
        </div>
      </div>

      {/* Section 1: Nutrition Basics (Foundation First) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-textPrimary">
              1. โภชนาการอาหารหลัก (Food First)
            </h3>
            <p className="text-xs text-textSecondary">
              รากฐานที่สำคัญที่สุดที่ต้องทำให้ได้ก่อนพิจารณาอาหารเสริม
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {goal.nutritionBasics.map((basic, i) => (
            <li
              key={i}
              className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/60 border border-border/70 text-xs sm:text-sm text-textSecondary"
            >
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="leading-relaxed">{basic}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Section 2: Supplements That May Help */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-textPrimary">
              2. อาหารเสริมที่มีงานวิจัยรองรับ
            </h3>
            <p className="text-xs sm:text-sm text-textSecondary mt-1">
              อาหารเสริมที่ช่วยสนับสนุนเป้าหมายนี้ พร้อมระดับหลักฐานวิทยาศาสตร์
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {relatedSupps.map(({ supplement, reason }) => (
            <div
              key={supplement.id}
              className="p-6 rounded-3xl bg-card border border-border hover:border-primary/40 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary">
                      <SupplementIcon name={supplement.icon} size="md" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-textPrimary">
                        {supplement.nameTH}
                      </h4>
                      <span className="text-xs text-textSecondary font-medium">
                        {supplement.nameEN}
                      </span>
                    </div>
                  </div>
                  <EvidenceBadge level={supplement.evidenceLevel} size="sm" />
                </div>

                {reason && (
                  <p className="text-xs sm:text-sm text-textSecondary/90 leading-relaxed bg-secondary/40 p-3 rounded-xl border border-border/40">
                    <strong className="text-textPrimary font-medium">ทำไมถึงช่วย: </strong>
                    {reason}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs text-textSecondary font-mono">
                  อ้างอิงงานวิจัย {supplement.references?.length || 0} ฉบับ
                </span>
                <Link
                  href={`/supplements/${supplement.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <span>อ่านผลวิจัยฉบับเต็ม</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Warnings and Pitfalls */}
      <div className="p-6 sm:p-8 rounded-3xl bg-red-950/10 border border-red-900/30 space-y-4">
        <div className="flex items-center gap-2.5 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <h4 className="font-bold text-base text-textPrimary">
            ข้อควรระวังและความเข้าใจผิดที่พบบ่อย
          </h4>
        </div>
        <ul className="space-y-2.5 pt-1">
          {goal.warnings.map((warning, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-textSecondary">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
              <span className="leading-relaxed">{warning}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}