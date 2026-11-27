import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { supplements } from '@/data/supplements';
import EvidenceBadge from '@/components/ui/EvidenceBadge';
import ReferenceList from '@/components/ui/ReferenceList';
import Disclaimer from '@/components/ui/Disclaimer';
import SafetyWarning from '@/components/ui/SafetyWarning';
import SupplementCard from '@/components/supplements/SupplementCard';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return supplements.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supplement = supplements.find((s) => s.slug === slug);
  if (!supplement) return { title: 'ไม่พบอาหารเสริม' };
  return {
    title: `${supplement.nameTH} (${supplement.nameEN}) — ประโยชน์ วิธีรับประทาน และงานวิจัย`,
    description: supplement.shortDescription,
  };
}

const SEVERITY_LABEL: Record<'mild' | 'moderate' | 'severe', string> = {
  mild: 'เล็กน้อย (MILD)',
  moderate: 'ปานกลาง (MODERATE)',
  severe: 'ต้องระวัง (SEVERE)',
};

export default async function SupplementDetailPage({ params }: Props) {
  const { slug } = await params;
  const supplement = supplements.find((s) => s.slug === slug);
  if (!supplement) notFound();

  const related = supplements
    .filter(
      (s) =>
        s.slug !== supplement.slug &&
        s.goals.some((g) => supplement.goals.includes(g))
    )
    .slice(0, 3);

  const tocItems = [
    { id: 'overview', num: '01', label: 'ข้อมูลทั่วไปและกลไก' },
    { id: 'benefits', num: '02', label: 'ประโยชน์และข้อจำกัด' },
    { id: 'suitable', num: '03', label: 'เหมาะกับใคร' },
    { id: 'dosage', num: '04', label: 'ปริมาณและวิธีรับประทาน' },
    { id: 'side-effects', num: '05', label: 'ผลข้างเคียงและข้อควรระวัง' },
    { id: 'references', num: '06', label: 'เอกสารงานวิจัยอ้างอิง' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 1. MONUMENTAL MINIMAL CLINICAL MONOGRAPH HEADER */}
      <header className="relative overflow-hidden border-b border-border bg-white">
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

        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-10 sm:pt-16 sm:pb-12 relative z-10 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-[0.22em] text-textSecondary">
              <Link href="/" className="hover:text-primary transition-colors">
                HOME
              </Link>
              <span>/</span>
              <Link href="/supplements" className="hover:text-primary transition-colors">
                ENCYCLOPEDIA
              </Link>
              <span>/</span>
              <span className="text-primary font-semibold">{supplement.nameEN}</span>
            </div>
            <EvidenceBadge level={supplement.evidenceLevel} size="sm" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-3xl sm:text-5xl font-semibold text-textPrimary tracking-[-0.03em] leading-[1.08]">
                {supplement.nameTH}
              </h1>
              <p className="text-sm sm:text-base font-mono text-primary">
                {supplement.nameEN}
              </p>
              <p className="text-sm sm:text-base text-textSecondary leading-relaxed pt-1">
                {supplement.shortDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/store"
                className="inline-flex items-center gap-2 px-6 py-3 bg-textPrimary text-white hover:bg-primary text-xs font-medium transition-colors"
              >
                <span>ดูสินค้าที่เกี่ยวข้องในร้านค้า</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center gap-1.5 px-5 py-3 border border-border text-xs font-medium text-textPrimary hover:border-textPrimary transition-colors"
              >
                <span>เปรียบเทียบสูตร</span>
              </Link>
            </div>
          </div>

          {/* 4-Column Quick Spec Strip */}
          <div className="border border-border bg-white grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-border text-xs">
            <div className="p-4 sm:p-5 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary">
                DOSAGE
              </div>
              <div className="font-medium text-textPrimary leading-snug">
                {supplement.usage.dosage}
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary">
                TIMING
              </div>
              <div className="font-medium text-textPrimary leading-snug">
                {supplement.usage.timing}
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary">
                PROTOCOL
              </div>
              <div className="font-medium text-textPrimary leading-snug">
                {supplement.usage.dailyRequired ? 'รับประทานต่อเนื่องทุกวัน' : 'ใช้ตามวันฝึกซ้อม'}
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary">
                CITATIONS &amp; REVIEW
              </div>
              <div className="font-mono font-medium text-textPrimary">
                {supplement.references.length} วิจัย · {supplement.lastReviewed}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. STICKY SIDEBAR TOC + EDITORIAL CLINICAL BODY */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Minimal Sticky TOC */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold block pb-3 border-b border-border">
                CONTENTS
              </span>
              <nav className="flex flex-col divide-y divide-border/60">
                {tocItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="py-2.5 text-xs text-textSecondary hover:text-primary transition-colors flex items-center gap-2.5"
                  >
                    <span className="font-mono text-[10px] text-primary">{item.num}</span>
                    <span>{item.label}</span>
                  </a>
                ))}
              </nav>
            </div>

            <Link
              href="/supplements"
              className="inline-flex items-center gap-1.5 text-xs text-textSecondary hover:text-textPrimary transition-colors pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับหน้าสารานุกรม</span>
            </Link>
          </aside>

          {/* Right Clinical Sections */}
          <div className="lg:col-span-9 space-y-14">
            {/* 01 Overview & Mechanism */}
            <section id="overview" className="space-y-6 scroll-mt-24">
              <div className="space-y-1 border-b border-border pb-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                  01 / OVERVIEW &amp; MECHANISM
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-textPrimary">
                  ข้อมูลทั่วไปและกลไกการออกฤทธิ์
                </h2>
              </div>
              <div className="space-y-4 text-sm sm:text-[15px] text-textSecondary leading-[1.8]">
                <p>{supplement.fullDescription}</p>
                <div className="p-6 bg-secondary/50 border-l-2 border-primary space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary font-semibold block">
                    HOW IT WORKS
                  </span>
                  <p className="text-xs sm:text-sm text-textPrimary leading-relaxed">
                    {supplement.howItWorks}
                  </p>
                </div>
                {supplement.evidenceSummary && (
                  <p className="text-xs sm:text-sm text-textSecondary">
                    <strong className="text-textPrimary font-medium">สรุปภาพรวมหลักฐาน: </strong>
                    {supplement.evidenceSummary}
                  </p>
                )}
              </div>
            </section>

            {/* 02 Benefits & Limitations */}
            <section id="benefits" className="space-y-6 scroll-mt-24">
              <div className="space-y-1 border-b border-border pb-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                  02 / BENEFITS &amp; LIMITATIONS
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-textPrimary">
                  ประโยชน์ที่มีหลักฐานรองรับและข้อจำกัด
                </h2>
              </div>

              <div className="border border-border bg-white grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="p-6 sm:p-7 space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary font-semibold block">
                    CONFIRMED BENEFITS
                  </span>
                  <ul className="space-y-4 text-xs sm:text-[13px] text-textSecondary">
                    {supplement.benefits.map((b, i) => (
                      <li key={i} className="space-y-1 leading-relaxed">
                        <strong className="text-textPrimary font-medium block">
                          0{i + 1}. {b.title}
                        </strong>
                        <span>{b.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 sm:p-7 bg-secondary/35 space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary font-semibold block">
                    LIMITATIONS
                  </span>
                  <ul className="space-y-3 text-xs sm:text-[13px] text-textSecondary">
                    {supplement.limitations.map((lim, i) => (
                      <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="text-primary font-mono shrink-0">—</span>
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* 03 Suitable & Not Necessary */}
            <section id="suitable" className="space-y-6 scroll-mt-24">
              <div className="space-y-1 border-b border-border pb-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                  03 / AUDIENCE FIT
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-textPrimary">
                  เหมาะกับใคร และใครอาจไม่จำเป็น
                </h2>
              </div>

              <div className="border border-border bg-white grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="p-6 sm:p-7 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary font-semibold block">
                    SUITABLE FOR
                  </span>
                  <ul className="space-y-2.5 text-xs sm:text-[13px] text-textSecondary">
                    {supplement.suitableFor.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="text-primary font-mono shrink-0">+</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 sm:p-7 bg-secondary/35 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary font-semibold block">
                    NOT NECESSARY FOR
                  </span>
                  <ul className="space-y-2.5 text-xs sm:text-[13px] text-textSecondary">
                    {supplement.notNecessaryFor.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="text-textSecondary font-mono shrink-0">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* 04 Dosage & Usage */}
            <section id="dosage" className="space-y-6 scroll-mt-24">
              <div className="space-y-1 border-b border-border pb-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                  04 / USAGE PROTOCOL
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-textPrimary">
                  ปริมาณและวิธีรับประทานตามงานวิจัย
                </h2>
              </div>

              <div className="border border-border divide-y divide-border bg-white text-xs sm:text-sm">
                <div className="p-5 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-textSecondary">
                    ปริมาณแนะนำ
                  </span>
                  <span className="sm:col-span-3 font-medium text-textPrimary">
                    {supplement.usage.dosage}
                  </span>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-textSecondary">
                    ช่วงเวลาทาน
                  </span>
                  <span className="sm:col-span-3 font-medium text-textPrimary">
                    {supplement.usage.timing}
                  </span>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-textSecondary">
                    วิธีการทาน
                  </span>
                  <span className="sm:col-span-3 text-textSecondary leading-relaxed">
                    {supplement.usage.method}
                  </span>
                </div>
                {supplement.usage.notes && (
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-4 gap-2 bg-secondary/45">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-semibold">
                      หมายเหตุ
                    </span>
                    <span className="sm:col-span-3 text-textSecondary leading-relaxed">
                      {supplement.usage.notes}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* 05 Side Effects & Precautions */}
            <section id="side-effects" className="space-y-6 scroll-mt-24">
              <div className="space-y-1 border-b border-border pb-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                  05 / SAFETY PROFILE
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-textPrimary">
                  ผลข้างเคียงและข้อควรระวังทางการแพทย์
                </h2>
              </div>

              {supplement.sideEffects.length > 0 && (
                <div className="border border-border divide-y divide-border bg-white">
                  {supplement.sideEffects.map((se, i) => (
                    <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-textPrimary">{se.name}</h3>
                        <p className="text-xs text-textSecondary leading-relaxed">{se.description}</p>
                      </div>
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider shrink-0 font-semibold ${
                          se.severity === 'severe'
                            ? 'text-red-600'
                            : se.severity === 'moderate'
                            ? 'text-primary'
                            : 'text-textSecondary'
                        }`}
                      >
                        {SEVERITY_LABEL[se.severity]}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {supplement.precautions.length > 0 && (
                <SafetyWarning title="ข้อควรระวังก่อนรับประทาน" variant="warning">
                  <ul className="space-y-1.5 mt-1">
                    {supplement.precautions.map((p, i) => (
                      <li key={i}>— {p}</li>
                    ))}
                  </ul>
                </SafetyWarning>
              )}

              {supplement.interactions.length > 0 && (
                <SafetyWarning title="ปฏิกิริยากับยาหรือสารอื่น (Interactions)" variant="info">
                  <ul className="space-y-1.5 mt-1">
                    {supplement.interactions.map((inter, i) => (
                      <li key={i}>— {inter}</li>
                    ))}
                  </ul>
                </SafetyWarning>
              )}
            </section>

            {/* 06 References */}
            <section id="references" className="scroll-mt-24">
              <ReferenceList references={supplement.references} />
            </section>

            <Disclaimer />
          </div>
        </div>

        {/* Related Supplements */}
        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-border space-y-8">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                RELATED COMPOUNDS
              </span>
              <h2 className="text-xl font-semibold text-textPrimary">
                สารเสริมอื่นที่มีเป้าหมายใกล้เคียงกัน
              </h2>
            </div>
            <div className="border-t border-l border-border bg-white grid grid-cols-1 md:grid-cols-3">
              {related.map((item, idx) => (
                <SupplementCard key={item.slug} supplement={item} index={idx} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
