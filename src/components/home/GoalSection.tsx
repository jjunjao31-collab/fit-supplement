import Link from 'next/link';
import { ArrowRight, Target, Dumbbell } from 'lucide-react';
import type { Goal } from '@/types';
import GoalCard from '@/components/goals/GoalCard';

interface GoalSectionProps {
  goals: Goal[];
}

export default function GoalSection({ goals }: GoalSectionProps) {
  return (
    <section className="py-20 bg-secondary/30 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              <span>แนะนำตามเป้าหมาย</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
              เลือกตามเป้าหมายการออกกำลังกายของคุณ
            </h2>
            <p className="text-sm text-textSecondary">
              เข้าใจหลักการโภชนาการที่แท้จริงก่อน แล้วจึงพิจารณาว่าอาหารเสริมใดตอบโจทย์เป้าหมายของคุณ
            </p>
          </div>

          <Link
            href="/goals"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline self-start md:self-auto"
          >
            <span>ดูคำแนะนำทุกเป้าหมาย</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6 Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard key={goal.slug} goal={goal} />
          ))}
        </div>
      </div>
    </section>
  );
}
