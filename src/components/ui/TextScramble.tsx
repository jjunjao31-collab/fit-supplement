'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·';

interface TextScrambleProps {
  text: string;
  className?: string;
  speedMs?: number;
}

/**
 * 21st.dev Text Scramble / Hyper Text (inspired by Julien Thibeaut)
 * Crisp hover-triggered monospace character scramble for technical index tags
 */
export default function TextScramble({
  text,
  className,
  speedMs = 28,
}: TextScrambleProps) {
  const [display, setDisplay] = useState(text);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, []);

  const triggerScramble = () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    let step = 0;
    const total = text.length;

    timerRef.current = window.setInterval(() => {
      step += 0.6;
      const next = text
        .split('')
        .map((char, idx) => {
          if (char === ' ') return ' ';
          if (idx < Math.floor(step)) return char;
          return SCRAMBLE_CHARS[(idx * 7 + Math.floor(step * 5)) % SCRAMBLE_CHARS.length];
        })
        .join('');

      setDisplay(next);

      if (step >= total) {
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setDisplay(text);
      }
    }, speedMs);
  };

  return (
    <span
      onMouseEnter={triggerScramble}
      className={cn('inline-block cursor-default', className)}
    >
      {display}
    </span>
  );
}
