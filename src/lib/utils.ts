import { clsx, type ClassValue } from 'clsx';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format date to Thai locale
 */
export function formatDateTH(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Calculate estimated reading time (words per minute)
 */
export function calcReadingTime(content: string, wpm = 200): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wpm));
}

/**
 * Slugify a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Evidence level to Thai label
 */
export function evidenceLevelLabel(level: string): string {
  const map: Record<string, string> = {
    strong: 'หลักฐานแข็งแกร่ง',
    moderate: 'หลักฐานปานกลาง',
    limited: 'หลักฐานจำกัด',
    insufficient: 'หลักฐานไม่เพียงพอ',
  };
  return map[level] ?? level;
}

/**
 * Evidence level to color class
 */
export function evidenceLevelColor(level: string): string {
  const map: Record<string, string> = {
    strong: 'text-primary',
    moderate: 'text-yellow-400',
    limited: 'text-orange-400',
    insufficient: 'text-red-400',
  };
  return map[level] ?? 'text-textSecondary';
}
