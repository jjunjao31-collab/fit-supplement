'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Article } from '@/types';
import BlurFade from '@/components/ui/BlurFade';

interface EditorialJournalProps {
  articles: Article[];
}

/**
 * 21st.dev Minimalist Editorial Reading Index
 * Replaces heavy stacked article cards with clean Kinfolk/Linear-style hairline rows
 */
export default function EditorialJournal({ articles }: EditorialJournalProps) {
  const featured = articles.slice(0, 4);

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
        <BlurFade>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold">
                04 / RESEARCH JOURNAL
              </span>
              <h2 className="text-2xl sm:text-4xl font-semibold text-textPrimary tracking-tight">
                บทความวิทยาศาสตร์การกีฬา
              </h2>
            </div>
            <Link
              href="/articles"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-textPrimary hover:text-primary transition-colors border-b border-textPrimary hover:border-primary pb-0.5 self-start sm:self-auto"
            >
              <span>อ่านบทความทั้งหมด ({articles.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </BlurFade>

        <div className="border-y border-border divide-y divide-border">
          {featured.map((article, idx) => (
            <BlurFade key={article.slug} delay={idx * 0.06}>
              <Link
                href={`/articles/${article.slug}`}
                className="group py-6 sm:py-7 px-2 sm:px-4 -mx-2 sm:-mx-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-secondary/70 transition-colors duration-200"
              >
                <div className="flex items-start md:items-center gap-5 sm:gap-8 min-w-0">
                  <span className="text-xs font-mono text-textSecondary/80 shrink-0 pt-1 md:pt-0">
                    0{idx + 1}
                  </span>
                  <div className="space-y-1 min-w-0">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-primary">
                      {article.category}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-textPrimary group-hover:text-primary transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-textSecondary line-clamp-1 max-w-2xl">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5 pl-10 md:pl-0 shrink-0 text-xs text-textSecondary">
                  <span className="font-mono whitespace-nowrap">
                    {article.readingTime} นาที
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-textSecondary group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </Link>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
