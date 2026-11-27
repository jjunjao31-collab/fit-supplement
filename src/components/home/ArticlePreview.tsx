import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Article } from '@/types';
import ArticleCard from '@/components/articles/ArticleCard';

interface ArticlePreviewProps {
  articles: Article[];
}

export default function ArticlePreview({ articles }: ArticlePreviewProps) {
  // Take top 3 articles
  const featured = articles.slice(0, 3);

  return (
    <section className="py-20 bg-secondary/30 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>บทความและงานวิจัย</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
              ความรู้ที่ถูกต้องจากวิทยาศาสตร์การกีฬา
            </h2>
            <p className="text-sm text-textSecondary">
              เจาะลึกกลไก ข้อเท็จจริง และไขความเชื่อผิดๆ เพื่อให้คุณเลือกทานอาหารเสริมได้อย่างปลอดภัยและคุ้มค่า
            </p>
          </div>

          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline self-start md:self-auto"
          >
            <span>ดูบทความทั้งหมด ({articles.length} เรื่อง)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((art) => (
            <ArticleCard key={art.slug} article={art} />
          ))}
        </div>
      </div>
    </section>
  );
}
