'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WordRotateProps {
  words: string[];
  duration?: number;
  className?: string;
}

/**
 * 21st.dev Word Rotate (inspired by Magic UI / Dillion Verma)
 * Smooth vertical blur-slide kinetic text rotator tuned for Thai diacritics
 */
export default function WordRotate({
  words,
  duration = 2800,
  className,
}: WordRotateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, duration);
    return () => window.clearInterval(timer);
  }, [words.length, duration]);

  return (
    <span className="inline-flex align-baseline overflow-hidden py-1 -my-1">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className={cn('inline-block', className)}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
