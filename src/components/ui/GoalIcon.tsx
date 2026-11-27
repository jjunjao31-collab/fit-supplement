import React from 'react';
import {
  Dumbbell,
  Flame,
  Shield,
  Timer,
  HeartPulse,
  Heart,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalIconProps {
  slug: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const goalIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'muscle-gain': Dumbbell,
  'fat-loss': Flame,
  'strength': Shield,
  'endurance': Timer,
  'recovery': HeartPulse,
  'general-health': Heart,
};

export default function GoalIcon({ slug, className, size = 'md' }: GoalIconProps) {
  const IconComponent = goalIconMap[slug.toLowerCase()] || Target;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  }[size];

  return <IconComponent className={cn(sizeClasses, className)} />;
}
