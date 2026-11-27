'use client';

import { useEffect, useState } from 'react';
import { useSpring } from 'framer-motion';

interface SlidingNumberProps {
  value: number;
  decimals?: number;
  useLocale?: boolean;
  className?: string;
}

export default function SlidingNumber({
  value,
  decimals = 0,
  useLocale = true,
  className = '',
}: SlidingNumberProps) {
  const spring = useSpring(value, {
    stiffness: 180,
    damping: 26,
    mass: 0.6,
  });

  const [display, setDisplay] = useState<string>(() => formatVal(value, decimals, useLocale));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplay(formatVal(latest, decimals, useLocale));
    });
    return () => unsubscribe();
  }, [spring, decimals, useLocale]);

  return <span className={`tabular-nums ${className}`}>{display}</span>;
}

function formatVal(num: number, decimals: number, useLocale: boolean): string {
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(num * factor) / factor;
  if (useLocale) {
    return rounded.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return decimals > 0 ? rounded.toFixed(decimals) : String(Math.round(rounded));
}
