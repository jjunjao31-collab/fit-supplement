'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FluidSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  ariaLabel?: string;
  size?: 'sm' | 'md';
  tone?: 'obsidian' | 'gold';
  disabled?: boolean;
  className?: string;
}

/**
 * 21st.dev Fluid Switch (inspired by @micka_design Switch)
 * Pill-morphing thumb on press + spring slide physics + full switch accessibility
 */
export default function FluidSwitch({
  checked,
  onChange,
  label,
  ariaLabel,
  size = 'sm',
  tone = 'obsidian',
  disabled = false,
  className,
}: FluidSwitchProps) {
  const [pressed, setPressed] = useState(false);

  const trackW = size === 'md' ? 44 : 36;
  const trackH = size === 'md' ? 24 : 20;
  const thumbBase = size === 'md' ? 18 : 14;
  const pad = 3;
  const thumbW = pressed ? thumbBase + 4 : thumbBase;
  const xPos = checked ? trackW - pad - thumbW : pad;

  const activeTrackClass =
    tone === 'gold'
      ? 'bg-primary border-primary'
      : 'bg-textPrimary border-textPrimary';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel || label || 'สลับสถานะ'}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className={cn(
        'inline-flex items-center gap-2.5 group select-none focus:outline-none disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer',
        className
      )}
    >
      <span
        style={{ width: trackW, height: trackH }}
        className={cn(
          'relative inline-flex items-center rounded-full border transition-colors duration-250 shrink-0',
          checked
            ? activeTrackClass
            : 'bg-secondary border-border group-hover:border-textPrimary/40'
        )}
      >
        <motion.span
          animate={{
            x: xPos,
            width: thumbW,
          }}
          transition={{
            type: 'spring',
            stiffness: 560,
            damping: 32,
          }}
          style={{ height: thumbBase }}
          className={cn(
            'rounded-full block shadow-xs',
            checked ? 'bg-white' : 'bg-textPrimary/75 group-hover:bg-textPrimary'
          )}
        />
      </span>

      {label && (
        <span
          className={cn(
            'text-xs transition-colors whitespace-nowrap',
            checked
              ? 'text-textPrimary font-semibold'
              : 'text-textSecondary group-hover:text-textPrimary'
          )}
        >
          {label}
        </span>
      )}
    </button>
  );
}
