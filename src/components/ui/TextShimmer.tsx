'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextShimmerProps {
  children: string;
  className?: string;
  duration?: number;
  baseColor?: string;
  shimmerColor?: string;
}

/**
 * 21st.dev Text Shimmer (inspired by ibelick / Motion Primitives)
 * Sweeping metallic light highlight across crisp monochrome text
 */
export default function TextShimmer({
  children,
  className,
  duration = 2.6,
  baseColor = '#0E0E10',
  shimmerColor = '#A5A196',
}: TextShimmerProps) {
  return (
    <motion.span
      initial={{ backgroundPosition: '120% center' }}
      animate={{ backgroundPosition: '-20% center' }}
      transition={{
        repeat: Infinity,
        duration,
        ease: 'linear',
      }}
      style={{
        backgroundImage: `linear-gradient(110deg, ${baseColor} 38%, ${shimmerColor} 50%, ${baseColor} 62%)`,
        backgroundSize: '240% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.span>
  );
}
