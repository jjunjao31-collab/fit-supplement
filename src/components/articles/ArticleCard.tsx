'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Article } from '@/types';
import SpotlightCard from '@/components/ui/SpotlightCard';

interface ArticleCardProps {
  article: Article;
  index?: number;
}

export default function ArticleCard({ article, index }: ArticleCardProps) {
  const numStr = index !== undefined ? String(index + 1).padStart(2, '0') : null;

  return (
    <SpotlightCard
      sharp
      className="h-full p-6 sm:p-7 border-r border-b border-border hover:bg-secondary/35 transition-colors duration-300"
    >
      <Link
        href={`/articles/${article.slug}`}
        className="group flex flex-col justify-between h-full gap-6"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.18em]">
            <span className="text-primary font-semibold">
              {numStr ? `${numStr} / ` : ''}
              {article.category}
            </span>
            <span className="text-textSecondary">{article.readingTime} นาที</span>
          </div>

          <h3 className="text-lg font-semibold text-textPrimary group-hover:text-primary transition-colors leading-snug">
            {article.title}
          </h3>

          <p className="text-xs sm:text-[13px] text-textSecondary leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>
        </div>

        <div className="pt-4 border-t border-border/70 flex items-center justify-between gap-3 text-xs">
          <span className="font-mono text-[11px] text-textSecondary">
            {article.publishedAt}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-textPrimary group-hover:text-primary transition-colors">
            <span>อ่านบทความ</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </SpotlightCard>
  );
}
