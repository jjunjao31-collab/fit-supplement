import React from 'react';
import {
  Layers,
  Dumbbell,
  Zap,
  Coffee,
  Flame,
  Droplets,
  Gauge,
  TrendingUp,
  FlaskConical,
  Activity,
  Heart,
  Timer,
  RefreshCw,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SupplementIconProps {
  name: string; // slug or icon name
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'whey-protein': FlaskConical,
  'protein': FlaskConical,
  'creatine-monohydrate': Dumbbell,
  'creatine': Dumbbell,
  'bcaa': Zap,
  'amino-acid': Zap,
  'caffeine': Coffee,
  'stimulant': Coffee,
  'beta-alanine': Flame,
  'other': Flame,
  'electrolytes': Droplets,
  'electrolyte': Droplets,
  'pre-workout': Gauge,
  'mass-gainer': TrendingUp,
};

export default function SupplementIcon({
  name,
  className,
  size = 'md',
}: SupplementIconProps) {
  const IconComponent = iconMap[name.toLowerCase()] || iconMap[name.replace(/[^\w-]/g, '').toLowerCase()] || Layers;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  }[size];

  return <IconComponent className={cn(sizeClasses, className)} />;
}
