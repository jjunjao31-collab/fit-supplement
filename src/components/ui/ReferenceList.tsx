import { ArrowUpRight } from 'lucide-react';
import type { Reference } from '@/types';
import { cn } from '@/lib/utils';

interface ReferenceListProps {
  references: Reference[];
  className?: string;
  title?: string;
}

export default function ReferenceList({
  references,
  className,
  title = 'เอกสารและงานวิจัยอ้างอิงทางวิทยาศาสตร์',
}: ReferenceListProps) {
  if (!references || references.length === 0) {
    return (
      <div className={cn('p-4 border border-border bg-secondary/40 text-xs text-textSecondary', className)}>
        ไม่มีรายการเอกสารอ้างอิงที่ระบุ
      </div>
    );
  }

  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold block">
            SCIENTIFIC CITATIONS
          </span>
          <h3 className="text-base sm:text-lg font-semibold text-textPrimary">
            {title}
          </h3>
        </div>
        <span className="text-[11px] font-mono text-textSecondary shrink-0">
          {references.length} SOURCES
        </span>
      </div>

      <div className="border-y border-border divide-y divide-border bg-white">
        {references.map((ref, idx) => (
          <div
            key={ref.id || idx}
            className="group py-4 px-2 -mx-2 flex items-start justify-between gap-4 hover:bg-secondary/45 transition-colors"
          >
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <span className="text-[11px] font-mono text-primary font-semibold pt-0.5 shrink-0">
                [{String(idx + 1).padStart(2, '0')}]
              </span>
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-medium text-textPrimary leading-snug">
                  {ref.title}
                </h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-mono text-textSecondary">
                  <span>{ref.source}</span>
                  <span>·</span>
                  <span>{ref.year}</span>
                  {ref.accessed && (
                    <>
                      <span>·</span>
                      <span>Accessed {ref.accessed}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {ref.url && (
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-textSecondary hover:text-primary transition-colors shrink-0"
                title="เปิดแหล่งข้อมูลต้นฉบับ"
                aria-label={`เปิดดูแหล่งข้อมูล ${ref.title}`}
              >
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
