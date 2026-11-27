'use client';

import { motion } from 'framer-motion';

interface TextEffectProps {
  segments: { text: string; accent?: boolean }[];
  className?: string;
  delay?: number;
}

/**
 * 21st.dev-inspired TextEffect (Soft Blur-In Keynote Reveal)
 * Animates Thai/English headline segments smoothly without breaking Thai word spacing
 */
export default function TextEffect({
  segments,
  className = '',
  delay = 0,
}: TextEffectProps) {
  return (
    <span className={className}>
      {segments.map((seg, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            delay: delay + idx * 0.11,
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`inline-block ${seg.accent ? 'text-primary' : ''}`}
        >
          {seg.text}
        </motion.span>
      ))}
    </span>
  );
}
