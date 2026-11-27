import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Disclaimer from '@/components/ui/Disclaimer';

export const metadata = {
  title: 'เกี่ยวกับเรา (About FIT SUPPLEMENT)',
  description:
    'พันธกิจ แนวคิด วัตถุประสงค์ และมาตรฐานความน่าเชื่อถือทางวิทยาศาสตร์ของ FIT SUPPLEMENT',
};

const PILLARS = [
  {
    num: '01',
    code: 'EVIDENCE-FIRST',
    title: 'วิทยาศาสตร์เป็นที่ตั้ง',
    body: 'ทุกข้อมูลอ้างอิงจากงานวิจัยทางคลินิก (RCT) และแนวทางขององค์กรกีฬาระดับโลก เช่น AIS, NIH ODS และ ISSN ไม่แต่งเติมตัวเลข',
  },
  {
    num: '02',
    code: 'TRANSPARENCY',
    title: 'โปร่งใสและตรวจสอบ อย. ได้จริง',
    body: 'สินค้าทุกรายการในร้านค้าระบุเลขสารบบอาหาร อย. ไทย วิธีทาน และข้อจำกัดอย่างตรงไปตรงมา ไม่โฆษณาเกินสรรพคุณจริง',
  },
  {
    num: '03',
    code: 'WHOLE FOODS FIRST',
    title: 'อาหารหลักและความปลอดภัยมาก่อน',
    body: 'ย้ำเรื่องอาหารธรรมชาติเป็นฐานเสมอ แสดงผลข้างเคียง ข้อควรระวัง และกรณีที่ไม่จำเป็นต้องทานอย่างซื่อสัตย์',
  },
];

const STANDARDS = [
  {
    num: '01',
    name: 'NIH Office of Dietary Supplements (USA)',
    desc: 'สถาบันสุขภาพแห่งชาติสหรัฐอเมริกา แหล่งข้อมูลวิชาการด้านผลิตภัณฑ์เสริมอาหารที่ได้รับการอ้างอิงทั่วโลก',
  },
  {
    num: '02',
    name: 'Australian Institute of Sport (AIS)',
    desc: 'ระบบจัดกลุ่มอาหารเสริมกีฬา Group A–D ที่ใช้เป็นมาตรฐานในหมู่นักกีฬาอาชีพและโอลิมปิก',
  },
  {
    num: '03',
    name: 'International Society of Sports Nutrition (ISSN)',
    desc: 'แถลงการณ์จุดยืนทางวิชาการ (Position Stands) ด้านโปรตีน ครีเอทีน และสารอาหารกีฬาที่มีหลักฐานคลินิกสูงสุด',
  },
  {
    num: '04',
    name: 'สำนักงานคณะกรรมการอาหารและยา (อย. ไทย)',
    desc: 'กฎหมาย มาตรฐานความปลอดภัย และระบบตรวจสอบเลขสารบบผลิตภัณฑ์สุขภาพของประเทศไทย',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
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
              <span className="text-primary font-semibold">ABOUT US</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-semibold text-textPrimary tracking-[-0.03em] leading-[1.08]">
              เกี่ยวกับ FIT SUPPLEMENT
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
              ยกระดับมาตรฐานความรู้ ความโปร่งใส และการเลือกใช้อาหารเสริมกีฬาสำหรับคนไทยด้วยหลักฐานทางวิทยาศาสตร์
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16 space-y-16">
        {/* 3 Core Pillars */}
        <section className="border-t border-l border-border bg-white grid grid-cols-1 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.num} className="p-7 sm:p-9 border-r border-b border-border space-y-4">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em]">
                <span className="text-primary font-semibold">{p.num}</span>
                <span className="text-textSecondary">{p.code}</span>
              </div>
              <h2 className="text-lg font-semibold text-textPrimary">{p.title}</h2>
              <p className="text-xs sm:text-[13px] text-textSecondary leading-relaxed">{p.body}</p>
            </div>
          ))}
        </section>

        {/* Philosophy & Standards Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold">
              PHILOSOPHY
            </span>
            <h2 className="text-2xl font-semibold text-textPrimary tracking-tight">
              แนวคิดและเป้าหมายของเรา
            </h2>
            <p className="text-sm text-textSecondary leading-relaxed">
              ในยุคที่การตลาดอาหารเสริมเต็มไปด้วยคำโฆษณาเกินจริง ผู้บริโภคจำนวนมากเสียเงินกับสินค้าที่ไม่จำเป็นหรือใช้ผิดวิธีจนเกิดผลข้างเคียง
            </p>
            <p className="text-sm text-textSecondary leading-relaxed">
              <strong className="text-textPrimary font-medium">FIT SUPPLEMENT</strong> ถูกสร้างขึ้นเพื่อรวม “สารานุกรมงานวิจัยภาษาไทย” เข้ากับ “ร้านค้าสินค้าแท้ที่มีเลข อย.” เพื่อให้ทุกคนเลือกซื้อและรับประทานได้อย่างคุ้มค่า ปลอดภัย และตรงเป้าหมายจริง
            </p>
            <div className="pt-3 flex items-center gap-6">
              <Link
                href="/supplements"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-textPrimary hover:text-primary border-b border-textPrimary hover:border-primary pb-0.5 transition-colors"
              >
                <span>เปิดสารานุกรม</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/store"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-textSecondary hover:text-primary transition-colors"
              >
                <span>เข้าชมร้านค้า</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 border-y border-border divide-y divide-border">
            {STANDARDS.map((s) => (
              <div key={s.num} className="py-5 flex items-start gap-5">
                <span className="text-xs font-mono text-primary font-semibold pt-0.5 shrink-0">
                  {s.num}
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-textPrimary">{s.name}</h3>
                  <p className="text-xs text-textSecondary leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Disclaimer />
      </main>
    </div>
  );
}
