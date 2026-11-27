import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import ProteinCalculator from '@/components/calculator/ProteinCalculator';
import Disclaimer from '@/components/ui/Disclaimer';

export const metadata = {
  title: 'เครื่องคำนวณโปรตีนต่อวัน (Protein Intake Calculator)',
  description:
    'คำนวณปริมาณโปรตีนที่เหมาะสมต่อวันตามน้ำหนักตัว ส่วนสูง และระดับการออกกำลังกาย พร้อมวิเคราะห์ BMI, BMR และ TDEE',
};

export default function ProteinCalculatorPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Editorial Header */}
      <section className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-10 sm:pt-16 sm:pb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-[0.22em] text-textSecondary">
              <Link href="/" className="hover:text-primary transition-colors">
                HOME
              </Link>
              <span>/</span>
              <span className="text-primary font-semibold">PROTEIN STUDIO</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-semibold text-textPrimary tracking-[-0.03em] leading-[1.08]">
              เครื่องคำนวณโปรตีนและดัชนีร่างกาย
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
              คำนวณปริมาณโปรตีนต่อวันตามมาตรฐาน ISSN &amp; ACSM พร้อมวิเคราะห์ส่วนสูง น้ำหนัก ดัชนีมวลกาย (BMI) และพลังงานที่เผาผลาญ (BMR / TDEE)
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 space-y-16">
        {/* Interactive Calculator */}
        <ProteinCalculator />

        {/* Architectural 2-Column Reference Guide */}
        <section className="border border-border bg-white grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="p-7 sm:p-9 space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
              01 / DISTRIBUTION
            </span>
            <h2 className="text-lg font-semibold text-textPrimary">
              เทคนิคการกระจายมื้อโปรตีน
            </h2>
            <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
              งานวิจัยแนะนำให้แบ่งโปรตีนเป็น <strong className="text-textPrimary">3 - 5 มื้อต่อวัน</strong> มื้อละประมาณ <strong className="text-textPrimary">20 - 40 กรัม</strong> เพื่อกระตุ้นการสังเคราะห์โปรตีนกล้ามเนื้อ (MPS) อย่างต่อเนื่องตลอดวัน
            </p>
            <ul className="space-y-2 text-xs text-textSecondary pt-2 border-t border-border">
              <li><strong className="text-textPrimary">มื้อเช้า:</strong> 25 - 30 กรัม (ไข่ 2 ฟอง + นมถั่วเหลืองหรือกรีกโยเกิร์ต)</li>
              <li><strong className="text-textPrimary">มื้อกลางวัน:</strong> 30 - 35 กรัม (ข้าวกล้อง + อกไก่หรือปลา 100-120 กรัม)</li>
              <li><strong className="text-textPrimary">หลังซ้อม / บ่าย:</strong> 25 - 30 กรัม (เวย์โปรตีน 1 สกู๊ป หรือทูน่า)</li>
              <li><strong className="text-textPrimary">มื้อเย็น:</strong> 30 - 35 กรัม (สเต๊กสันในหมู เต้าหู้ หรือปลา)</li>
            </ul>
          </div>

          <div className="p-7 sm:p-9 space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
              02 / WHOLE FOODS
            </span>
            <h2 className="text-lg font-semibold text-textPrimary">
              ปริมาณโปรตีนในอาหารธรรมชาติ
            </h2>
            <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
              อาหารหลักควรเป็นแหล่งโปรตีนอันดับหนึ่งเสมอ เพราะให้วิตามินและแร่ธาตุครบถ้วนกว่าอาหารเสริม
            </p>
            <div className="grid grid-cols-2 border border-border divide-x divide-y divide-border text-xs pt-0">
              {[
                { name: 'อกไก่ปรุงสุก (100g)', val: '~31g' },
                { name: 'ไข่ไก่เบอร์ 0 (1 ฟอง)', val: '~6-7g' },
                { name: 'ปลาแซลมอน/กะพง (100g)', val: '~22-25g' },
                { name: 'เต้าหู้ขาวแข็ง (100g)', val: '~15-17g' },
                { name: 'สันในวัวไม่ติดมัน (100g)', val: '~28g' },
                { name: 'กรีกโยเกิร์ตแท้ (100g)', val: '~10g' },
              ].map((food) => (
                <div key={food.name} className="p-3 bg-secondary/40">
                  <div className="font-medium text-textPrimary">{food.name}</div>
                  <div className="font-mono font-semibold text-primary mt-0.5">{food.val}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Minimal Related Reading Link */}
        <div className="border-y border-border py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-textSecondary">
            อยากรู้เจาะลึกว่าเวย์โปรตีนจำเป็นสำหรับคุณจริงหรือไม่?
          </p>
          <Link
            href="/articles/whey-protein-necessary"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-textPrimary hover:text-primary border-b border-textPrimary hover:border-primary pb-0.5 self-start sm:self-auto"
          >
            <span>อ่านบทความ &ldquo;Whey Protein จำเป็นหรือไม่?&rdquo;</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <Disclaimer />
      </div>
    </div>
  );
}
