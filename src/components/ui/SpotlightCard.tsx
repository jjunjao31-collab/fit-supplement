'use client';

import type { MouseEvent, ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  sharp?: boolean;
}

export default function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(154, 110, 28, 0.08)',
  sharp = false,
}: SpotlightCardProps) {
  const mouseX = useMotionValue(-300);
  const mouseY = useMotionValue(-300);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  function handleMouseLeave() {
    mouseX.set(-300);
    mouseY.set(-300);
  }

  const background = useMotionTemplate`radial-gradient(380px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 75%)`;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group/spotlight relative bg-white transition-colors duration-300 overflow-hidden',
        sharp
          ? 'rounded-none'
          : 'rounded-3xl border border-border hover:border-primary/45',
        className
      )}
    >
      <motion.div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100',
          sharp ? 'rounded-none' : 'rounded-3xl'
        )}
        style={{ background }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
