import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import type { Supplement } from '@/types';
import SupplementCard from '@/components/supplements/SupplementCard';

interface PopularSupplementsProps {
  supplements: Supplement[];
}

export default function PopularSupplements({ supplements }: PopularSupplementsProps) {
  // Select top 4 popular ones: whey, creatine, caffeine, beta-alanine
  const popularSlugs = ['whey-protein', 'creatine-monohydrate', 'caffeine', 'beta-alanine'];
  const popularList = popularSlugs
    .map((slug) => supplements.find((s) => s.slug === slug))
    .filter((s): s is Supplement => s !== undefined);

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" />
              <span>อาหารเสริมยอดนิยม</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
              สารอาหารเสริมที่มีการศึกษาวิจัยมากที่สุด
            </h2>
            <p className="text-sm text-textSecondary">
              ตัวเลือกอันดับต้นๆ สำหรับนักกีฬาและผู้เล่นฟิตเนส พร้อมบทสรุปประโยชน์และวิธีใช้อย่างถูกต้อง
            </p>
          </div>

          <Link
            href="/supplements"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card hover:bg-card-hover border border-border hover:border-primary/40 text-xs sm:text-sm font-semibold text-primary transition-all duration-200 self-start md:self-auto"
          >
            <span>ดูอาหารเสริมทั้งหมด (8 รายการ)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularList.map((supp) => (
            <SupplementCard key={supp.slug} supplement={supp} />
          ))}
        </div>
      </div>
    </section>
  );
}
