'use client';

import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'ค้นหาอาหารเสริม เช่น เวย์โปรตีน, ครีเอทีน...',
  className,
}: SearchBarProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textSecondary">
        <Search className="w-5 h-5 text-textSecondary/70" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-11 py-3.5 bg-card/90 border border-border rounded-2xl text-sm sm:text-base text-textPrimary placeholder-textSecondary/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-inner"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-textSecondary hover:text-textPrimary transition-colors"
          aria-label="ล้างคำค้นหา"
        >
          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center hover:bg-border">
            <X className="w-3.5 h-3.5" />
          </div>
        </button>
      )}
    </div>
  );
}
