'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AnimatedTabItem {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface AnimatedTabsProps {
  tabs: AnimatedTabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  layoutId: string;
  variant?: 'underline' | 'pill';
  className?: string;
}

/**
 * 21st.dev-inspired Animated Sliding Tabs
 * Supports minimal editorial hairline underline (default) and pill variants
 */
export default function AnimatedTabs({
  tabs,
  activeTab,
  onChange,
  layoutId,
  variant = 'underline',
  className,
}: AnimatedTabsProps) {
  if (variant === 'underline') {
    return (
      <div
        role="tablist"
        className={cn(
          'inline-flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none max-w-full',
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative px-3 py-2.5 text-xs sm:text-[13px] whitespace-nowrap transition-colors duration-200 cursor-pointer flex items-center gap-1.5 select-none',
                isActive
                  ? 'text-textPrimary font-semibold'
                  : 'text-textSecondary hover:text-textPrimary font-normal'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'text-[10px] font-mono',
                    isActive ? 'text-primary font-semibold' : 'text-textSecondary/70'
                  )}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <motion.span
                  layoutId={layoutId}
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="absolute left-2 right-2 bottom-0 h-[2px] bg-primary rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-full bg-secondary border border-border overflow-x-auto scrollbar-none max-w-full',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer flex items-center gap-1.5 select-none',
              isActive
                ? 'text-white font-semibold'
                : 'text-textSecondary hover:text-textPrimary'
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                className="absolute inset-0 rounded-full bg-textPrimary"
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'text-[10px] font-mono',
                    isActive ? 'text-white/80' : 'text-textSecondary'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
