import { cn } from '@/lib/utils';

interface SafetyWarningProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'warning' | 'danger' | 'info';
  className?: string;
}

export default function SafetyWarning({
  title = 'ข้อควรระวังสำคัญ',
  children,
  variant = 'warning',
  className,
}: SafetyWarningProps) {
  const styles = {
    warning: {
      bar: 'border-l-2 border-primary bg-secondary/60',
      label: 'text-primary',
      code: 'CLINICAL CAUTION',
    },
    danger: {
      bar: 'border-l-2 border-red-600 bg-red-50/40',
      label: 'text-red-700',
      code: 'MEDICAL WARNING',
    },
    info: {
      bar: 'border-l-2 border-textPrimary bg-secondary/50',
      label: 'text-textPrimary',
      code: 'NOTE',
    },
  }[variant];

  return (
    <div
      role="alert"
      className={cn(
        'border border-border p-5 sm:p-6 space-y-2',
        styles.bar,
        className
      )}
    >
      <span className={cn('text-[10px] font-mono uppercase tracking-[0.2em] font-semibold block', styles.label)}>
        {styles.code}
      </span>
      {title && (
        <h4 className="font-semibold text-sm text-textPrimary">{title}</h4>
      )}
      <div className="text-xs sm:text-[13px] text-textSecondary leading-relaxed">
        {children}
      </div>
    </div>
  );
}
