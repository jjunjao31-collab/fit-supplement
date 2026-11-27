import type { EvidenceLevel } from '@/types';
import { cn } from '@/lib/utils';

interface EvidenceBadgeProps {
  level: EvidenceLevel;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const config: Record<
  EvidenceLevel,
  { label: string; shortLabel: string; dot: string; text: string; border: string }
> = {
  strong: {
    label: 'AIS GROUP A · หลักฐานแข็งแกร่ง',
    shortLabel: 'AIS A · แข็งแกร่ง',
    dot: 'bg-primary',
    text: 'text-primary',
    border: 'border-primary/35 bg-white',
  },
  moderate: {
    label: 'MODERATE · หลักฐานปานกลาง',
    shortLabel: 'ปานกลาง',
    dot: 'bg-textPrimary/60',
    text: 'text-textPrimary',
    border: 'border-border bg-secondary/60',
  },
  limited: {
    label: 'LIMITED · หลักฐานจำกัด',
    shortLabel: 'จำกัด',
    dot: 'bg-textSecondary/50',
    text: 'text-textSecondary',
    border: 'border-border bg-secondary/40',
  },
  insufficient: {
    label: 'INSUFFICIENT · ยังไม่เพียงพอ',
    shortLabel: 'ยังไม่เพียงพอ',
    dot: 'bg-red-600',
    text: 'text-red-700',
    border: 'border-red-200 bg-red-50/40',
  },
};

export default function EvidenceBadge({
  level,
  className,
  size = 'md',
}: EvidenceBadgeProps) {
  const item = config[level] || config.moderate;

  const sizeClasses = {
    sm: 'text-[10px] px-2.5 py-1 gap-1.5',
    md: 'text-[11px] px-3 py-1 gap-2',
    lg: 'text-xs px-3.5 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-semibold uppercase tracking-[0.12em] border whitespace-nowrap',
        item.border,
        item.text,
        sizeClasses,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', item.dot)} />
      <span>{size === 'sm' ? item.shortLabel : item.label}</span>
    </span>
  );
}
