import Link from 'next/link';
import CompareTable from '@/components/compare/CompareTable';
import Disclaimer from '@/components/ui/Disclaimer';
import { supplements } from '@/data/supplements';

export const metadata = {
  title: 'เปรียบเทียบอาหารเสริม (Supplement Comparison)',
  description:
    'เปรียบเทียบคุณสมบัติ ประโยชน์ วิธีรับประทาน และระดับหลักฐานทางวิทยาศาสตร์ระหว่างอาหารเสริม 2 ชนิด',
};

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Editorial Header */}
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-editorial-grid"
          style={{
            maskImage:
              'radial-gradient(ellipse 75% 65% at 75% 10%, black 5%, transparent 72%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 75% 65% at 75% 10%, black 5%, transparent 72%)',
          }}
        />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-10 sm:pt-16 sm:pb-12 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-[0.22em] text-textSecondary">
              <Link href="/" className="hover:text-primary transition-colors">
                HOME
              </Link>
              <span>/</span>
              <span className="text-primary font-semibold">CLINICAL COMPARISON</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-semibold text-textPrimary tracking-[-0.03em] leading-[1.08]">
              เปรียบเทียบอาหารเสริม 1 ต่อ 1
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
              เลือกอาหารเสริม 2 ชนิดเพื่อเปรียบเทียบกลไก ประโยชน์ ขนาดโดส ผลข้างเคียง และความจำเป็นตามหลักฐานวิทยาศาสตร์
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-12 space-y-16">
        <CompareTable supplements={supplements} />
        <Disclaimer />
      </main>
    </div>
  );
}
