import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { articles } from '@/data/articles';
import ReferenceList from '@/components/ui/ReferenceList';
import Disclaimer from '@/components/ui/Disclaimer';
import ArticleCard from '@/components/articles/ArticleCard';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return { title: 'ไม่พบบทความ' };
  return {
    title: `${article.title} | FIT SUPPLEMENT`,
    description: article.excerpt,
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-textPrimary font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-3" />;

      if (trimmed.startsWith('### ')) {
        return (
          <h3
            key={idx}
            className="text-lg sm:text-xl font-semibold text-textPrimary mt-10 mb-3 tracking-tight"
          >
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      if (trimmed.startsWith('## ')) {
        return (
          <h2
            key={idx}
            className="text-xl sm:text-2xl font-semibold text-textPrimary mt-12 mb-4 pb-2 border-b border-border tracking-tight"
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div
            key={idx}
            className="flex items-start gap-3 text-sm sm:text-[15px] text-textSecondary leading-relaxed my-2"
          >
            <span className="text-primary font-mono shrink-0 mt-0.5">—</span>
            <span>{renderFormattedText(trimmed.substring(2))}</span>
          </div>
        );
      }

      if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s(.*)$/);
        return (
          <div
            key={idx}
            className="flex items-start gap-3 text-sm sm:text-[15px] text-textSecondary leading-relaxed my-2"
          >
            <span className="text-primary font-mono text-xs pt-1 shrink-0">
              {match ? match[1].padStart(2, '0') : '01'}
            </span>
            <span>{renderFormattedText(match ? match[2] : trimmed)}</span>
          </div>
        );
      }

      return (
        <p
          key={idx}
          className="text-sm sm:text-[15px] text-textSecondary leading-[1.85] my-3.5"
        >
          {renderFormattedText(trimmed)}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Editorial Article Header */}
      <header className="border-b border-border bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-12 pb-10 sm:pt-16 sm:pb-12 space-y-6">
          <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-mono uppercase tracking-[0.2em] text-textSecondary">
            <Link href="/articles" className="hover:text-primary transition-colors">
              JOURNAL
            </Link>
            <span>/</span>
            <span className="text-primary font-semibold">{article.category}</span>
            <span>·</span>
            <span>{article.readingTime} MIN READ</span>
            <span>·</span>
            <span>{article.publishedAt}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[2.65rem] font-semibold text-textPrimary tracking-[-0.025em] leading-[1.15]">
            {article.title}
          </h1>

          <p className="text-sm sm:text-base text-textSecondary leading-relaxed border-l-2 border-primary pl-4">
            {article.excerpt}
          </p>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-textSecondary">
              {article.tags.map((tag, i) => (
                <span key={i}>#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Clean Focused Reading Column */}
      <article className="max-w-3xl mx-auto px-5 sm:px-8 py-12 space-y-12">
        <div>{renderContent(article.content)}</div>

        {article.references && article.references.length > 0 && (
          <div className="pt-8 border-t border-border">
            <ReferenceList
              references={article.references}
              title="เอกสารอ้างอิงทางวิชาการ"
            />
          </div>
        )}

        <Disclaimer />

        <div className="pt-4">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-xs font-medium text-textPrimary hover:text-primary border-b border-textPrimary hover:border-primary pb-0.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับไปหน้ารวมบทความ</span>
          </Link>
        </div>
      </article>

      {/* Related Articles Architectural Grid */}
      {related.length > 0 && (
        <section className="border-t border-border bg-secondary/35 py-16">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-8">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                CONTINUE READING
              </span>
              <h2 className="text-xl font-semibold text-textPrimary">บทความอื่นที่น่าสนใจ</h2>
            </div>
            <div className="border-t border-l border-border bg-white grid grid-cols-1 md:grid-cols-3">
              {related.map((art, i) => (
                <ArticleCard key={art.slug} article={art} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
