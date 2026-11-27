import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Goal } from '@/types';
import GoalIcon from '@/components/ui/GoalIcon';
import { cn } from '@/lib/utils';

interface GoalCardProps {
  goal: Goal;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
}

export default function GoalCard({
  goal,
  isSelected = false,
  onSelect,
  className,
}: GoalCardProps) {
  const CardContent = (
    <div
      className={cn(
        'group relative p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between text-left cursor-pointer h-full',
        isSelected
          ? 'bg-card border-primary ring-2 ring-primary/20 shadow-xl shadow-primary/10 -translate-y-1'
          : 'bg-card hover:bg-card-hover border-border hover:border-primary/40 hover:-translate-y-1 shadow-md hover:shadow-xl',
        className
      )}
    >
      {/* Glow highlight */}
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10 blur-xl pointer-events-none group-hover:opacity-25 transition-opacity bg-primary"
      />

      <div className="space-y-4">
        {/* Icon & Count */}
        <div className="flex items-center justify-between">
          <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary shadow-inner group-hover:scale-105 transition-transform">
            <GoalIcon slug={goal.slug} size="lg" />
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-secondary border border-border text-textSecondary">
            {goal.relatedSupplements?.length || 0} อาหารเสริม
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-textPrimary group-hover:text-primary transition-colors">
            {goal.nameTH}
          </h3>
          <p className="text-xs sm:text-sm text-textSecondary line-clamp-3 leading-relaxed">
            {goal.description}
          </p>
        </div>
      </div>

      {/* Footer Link / Indicator */}
      <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold">
        <span className={cn(isSelected ? 'text-primary' : 'text-textSecondary group-hover:text-textPrimary')}>
          {isSelected ? 'กำลังดูรายละเอียด' : 'ดูคำแนะนำโภชนาการ'}
        </span>
        <ArrowRight
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isSelected
              ? 'text-primary translate-x-1'
              : 'text-textSecondary group-hover:text-primary group-hover:translate-x-1'
          )}
        />
      </div>
    </div>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
      >
        {CardContent}
      </button>
    );
  }

  return (
    <Link
      href={`/goals#${goal.slug}`}
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
    >
      {CardContent}
    </Link>
  );
}