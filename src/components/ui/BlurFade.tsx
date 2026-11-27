'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface BlurFadeProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  inView?: boolean;
}

/**
 * 21st.dev-inspired BlurFade (by Dillion Verma pattern)
 * Smooth blur-to-sharp entrance with minimal vertical travel
 */
export default function BlurFade({
  children,
  className,
  delay = 0,
  duration = 0.5,
  yOffset = 12,
  inView = true,
}: BlurFadeProps) {
  const variants = {
    hidden: { opacity: 0, y: yOffset, filter: 'blur(6px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  };

  if (inView) {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={variants}
        transition={{
          delay,
          duration,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{
        delay,
        duration,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
