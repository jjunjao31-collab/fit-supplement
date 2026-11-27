'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  variant?: 'pill' | 'sharp';
  size?: 'xs' | 'sm' | 'md';
  fullWidth?: boolean;
  ariaLabel?: string;
  className?: string;
}

/**
 * 21st.dev Spring Segmented Control (inspired by @ddoemonn & @pmalay694)
 * Tactile spring-physics sliding thumb with press feedback and radiogroup semantics
 */
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  variant = 'sharp',
  size = 'sm',
  fullWidth = false,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  const containerRadius = variant === 'pill' ? 'rounded-full' : 'rounded-none';
  const thumbRadius = variant === 'pill' ? 'rounded-full' : 'rounded-none';

  const padClass =
    size === 'xs'
      ? 'px-2.5 py-1 text-[10px]'
      : size === 'md'
      ? 'px-4 py-2 text-xs'
      : 'px-3 py-1.5 text-xs';

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center border border-border bg-secondary p-0.5',
        containerRadius,
        fullWidth && 'w-full flex',
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <motion.button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(opt.id)}
            className={cn(
              'relative inline-flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer select-none whitespace-nowrap',
              padClass,
              thumbRadius,
              fullWidth && 'flex-1',
              active
                ? 'text-white'
                : 'text-textSecondary hover:text-textPrimary'
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                className={cn('absolute inset-0 bg-textPrimary', thumbRadius)}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {opt.icon}
              <span>{opt.label}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
