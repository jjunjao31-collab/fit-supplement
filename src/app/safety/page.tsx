import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Accordion, { type AccordionItem } from '@/components/ui/Accordion';
import Disclaimer from '@/components/ui/Disclaimer';

export const metadata = {
  title: 'คู่มือความปลอดภัยในการใช้อาหารเสริม (Supplement Safety Guide)',
  description:
    'คำแนะนำการใช้อาหารเสริมอย่างปลอดภัย การตรวจสอบฉลากและเลข อย. การระวังสารอันตราย และคำถามที่พบบ่อย',
};

const SAFETY_TOPICS = [
  {
    num: '01',
    code: 'SIDE EFFECTS',
    title: 'ผลข้างเคียงที่อาจเกิดขึ้นได้',
    body: 'อาหารเสริมไม่ใช่ยา แต่มีฤทธิ์ต่อระบบชีวเคมีของร่างกาย เช่น เวย์โปรตีนอาจทำให้ท้องอืดในผู้ที่ย่อยแลคโตสไม่ดี, ครีเอทีนอาจทำให้ไม่สบายท้องหากทานขนาดสูงในครั้งเดียว, เบต้า-อะลานีนทำให้คันยิบตามผิวหนัง (Paresthesia), และคาเฟอีนทำให้ใจสั่นและนอนไม่หลับ',
  },
  {
    num: '02',
    code: 'OVERDOSE RISK',
    title: 'ความเสี่ยงจากการรับประทานเกินปริมาณ',
    body: 'ความเชื่อที่ว่า “ยิ่งกินเยอะ ยิ่งได้ผลเร็ว” เป็นอันตราย การกินโปรตีนเกินความต้องการไม่ได้ช่วยสร้างกล้ามเนื้อเพิ่มขึ้นแต่กลายเป็นพลังงานส่วนเกิน และการได้รับคาเฟอีนเกิน 400 มก./วัน อาจทำให้หัวใจเต้นผิดจังหวะหรือความดันโลหิตสูงเฉียบพลัน',
  },
  {
    num: '03',
    code: 'STACKING',
    title: 'การรับประทานหลายชนิดร่วมกัน',
    body: 'การทานอาหารเสริมพร้อมกัน 3–5 ชนิดโดยไม่เช็กฉลากเสี่ยงต่อการได้รับสารซ้ำซ้อน โดยเฉพาะสารกระตุ้น (คาเฟอีน ซิเนฟรีน) วิตามินละลายในไขมัน (A, D, E) หรือแร่ธาตุที่สะสมเกินขนาดจนเป็นภาระต่อตับและไต',
  },
  {
    num: '04',
    code: 'LABEL READING',
    title: 'การอ่านฉลากและส่วนประกอบ',
    body: 'ตรวจสอบรายการส่วนประกอบที่เรียงจากมากไปน้อย หลีกเลี่ยงสูตร “Proprietary Blend” ที่ไม่แจกแจงปริมาณสารแต่ละชนิด และตรวจดูวันหมดอายุ (EXP) รวมถึงฉลากภาษาไทยที่ถูกต้องทุกครั้ง',
  },
  {
    num: '05',
    code: 'SMART PURCHASING',
    title: 'การเลือกซื้อผลิตภัณฑ์อย่างปลอดภัย',
    body: 'เลือกซื้อจากตัวแทนทางการที่ตรวจสอบที่มาได้ หลีกเลี่ยงสินค้าราคาถูกผิดปกติจากแหล่งไม่ระบุตัวตน และมองหาตรารับรองมาตรฐานระดับสากล เช่น NSF Certified for Sport หรือ Informed-Choice',
  },
  {
    num: '06',
    code: 'MEDICAL CONSULTATION',
    title: 'กลุ่มคนที่ควรปรึกษาแพทย์ก่อนใช้',
    body: 'ผู้มีโรคไตวายเรื้อรัง โรคตับ โรคหัวใจ ความดันโลหิตสูง สตรีมีครรภ์ หญิงให้นมบุตร เยาวชนต่ำกว่า 18 ปี และผู้ที่ใช้ยาตามใบสั่งแพทย์ ต้องขอคำแนะนำจากแพทย์ก่อนเริ่มรับประทานอาหารเสริมทุกชนิด',
  },
];

const faqs: AccordionItem[] = [
  {
    id: 'faq-1',
    title: 'อาหารเสริมมีความจำเป็นสำหรับทุกคนที่ออกกำลังกายหรือไม่?',
    content: (
      <p>
        <strong className="text-textPrimary font-medium">ไม่จำเป็นสำหรับทุกคน:</strong> อาหารเสริมถูกออกแบบมาเพื่อเติมเต็มสารอาหารในกรณีที่อาหารหลักไม่เพียงพอ หากคุณรับประทานอาหารครบ 5 หมู่ ได้รับโปรตีนและพลังงานครบตามเป้าหมายแล้ว ร่างกายสามารถสร้างกล้ามเนื้อและมีสุขภาพที่ดีได้โดยไม่ต้องพึ่งพาอาหารเสริม
      </p>
    ),
  },
  {
    id: 'faq-2',
    title: 'ทำไมต้องตรวจสอบเลขสารบบอาหารของ อย. และตรวจอย่างไร?',
    content: (
      <div className="space-y-2">
        <p>
          อาหารเสริมที่วางจำหน่ายอย่างถูกกฎหมายในประเทศไทยต้องขึ้นทะเบียนกับ <strong className="text-textPrimary font-medium">สำนักงานคณะกรรมการอาหารและยา (อย.)</strong> มีเลขสารบบ 13 หลักในกรอบเครื่องหมาย อย.
        </p>
        <p>
          ตรวจสอบได้ที่ <span className="font-mono text-textPrimary">fda.moph.go.th</span> เมนู “ตรวจสอบการอนุญาตผลิตภัณฑ์” แล้วกรอกเลข 13 หลักเพื่อตรวจชื่อผลิตภัณฑ์ ผู้ผลิต และสถานะ “คงอยู่”
        </p>
      </div>
    ),
  },
  {
    id: 'faq-3',
    title: 'การกินอาหารเสริมหลายชนิดพร้อมกัน (Stacking) มีอันตรายหรือไม่?',
    content: (
      <p>
        อาจเกิดอันตรายจากการได้รับสารชนิดเดียวกันซ้ำซ้อน เช่น ดื่มกาแฟร่วมกับ Pre-workout ทำให้ได้รับคาเฟอีนเกิน 400 มก./วัน นำไปสู่อาการใจสั่น ความดันสูง และนอนไม่หลับ ควรตรวจสอบปริมาณส่วนผสมรวมทุกตัวก่อนทานร่วมกัน
      </p>
    ),
  },
  {
    id: 'faq-4',
    title: 'คนที่มีโรคไตหรือโรคตับ สามารถทานเวย์โปรตีนหรือครีเอทีนได้ไหม?',
    content: (
      <p>
        <strong className="text-textPrimary font-medium">ควรปรึกษาแพทย์เฉพาะทางอย่างเคร่งครัด:</strong> สำหรับผู้ที่มีโรคไตเรื้อรัง (CKD) หรือโรคตับ ความสามารถในการกรองของเสียจะลดลง การทานโปรตีนสูงหรือครีเอทีนอาจเพิ่มภาระให้ไต
      </p>
    ),
  },
  {
    id: 'faq-5',
    title: 'เด็กและเยาวชนอายุต่ำกว่า 18 ปี ควรทานอาหารเสริมฟิตเนสหรือไม่?',
    content: (
      <p>
        เยาวชนควรเน้นสารอาหารจากอาหารธรรมชาติเป็นหลัก อาหารเสริมกลุ่มที่มีสารกระตุ้น เช่น Pre-workout หรือคาเฟอีนขนาดสูง ไม่แนะนำสำหรับเด็กและวัยรุ่น
      </p>
    ),
  },
  {
    id: 'faq-6',
    title: 'สตรีมีครรภ์หรือกำลังให้นมบุตร ทานอาหารเสริมออกกำลังกายได้หรือไม่?',
    content: (
      <p>
        <strong className="text-textPrimary font-medium">ควรหลีกเลี่ยง:</strong> อาหารเสริมกีฬาเกือบทั้งหมดไม่มีข้อมูลความปลอดภัยรับรองในหญิงตั้งครรภ์และให้นมบุตร ควรรับประทานเฉพาะวิตามินและแร่ธาตุที่สูตินรีแพทย์สั่งจ่าย
      </p>
    ),
  },
  {
    id: 'faq-7',
    title: 'จะสังเกตได้อย่างไรว่าอาหารเสริมอาจปนเปื้อนสารอันตราย?',
    content: (
      <ul className="space-y-1.5">
        <li>— โฆษณาสรรพคุณเกินจริง เช่น “ลดไขมัน 5 กก. ใน 7 วัน” หรือ “กล้ามโตทันที”</li>
        <li>— ไม่มีเลขสารบบ อย. หรือชื่อผลิตภัณฑ์ไม่ตรงกับฐานข้อมูล อย.</li>
        <li>— ปกปิดสัดส่วนจริงด้วยคำว่า Proprietary Blend</li>
        <li>— มีอาการใจสั่น คอแห้งผิดปกติ ปวดศีรษะรุนแรงหลังรับประทาน</li>
      </ul>
    ),
  },
  {
    id: 'faq-8',
    title: 'ระดับ Group A ของสถาบัน AIS หมายความว่าทุกคนควรทานใช่หรือไม่?',
    content: (
      <p>
        <strong className="text-textPrimary font-medium">ไม่ใช่:</strong> การจัดระดับ Group A ของ Australian Institute of Sport (AIS) หมายถึง “มีหลักฐานทางวิทยาศาสตร์หนักแน่นว่ามีประโยชน์ในบริบทกีฬาที่เฉพาะเจาะจง” ไม่ได้แปลว่าทุกคนจำเป็นต้องรับประทานตลอดเวลา
      </p>
    ),
  },
];

export default function SafetyPage() {
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
              <span className="text-primary font-semibold">SAFETY &amp; HARM REDUCTION</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-semibold text-textPrimary tracking-[-0.03em] leading-[1.08]">
              คู่มือความปลอดภัยอาหารเสริม
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
              หลักการใช้อาหารเสริมอย่างปลอดภัย วิธีตรวจเลขสารบบ อย. ไทย การหลีกเลี่ยงสารซ้ำซ้อน และกลุ่มเสี่ยงที่ควรปรึกษาแพทย์
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16 space-y-16">
        {/* 6 Core Safety Principles in Architectural 1px Grid */}
        <section className="border-t border-l border-border bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {SAFETY_TOPICS.map((topic) => (
            <div
              key={topic.num}
              className="p-7 sm:p-8 border-r border-b border-border space-y-4 hover:bg-secondary/35 transition-colors"
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em]">
                <span className="text-primary font-semibold">{topic.num}</span>
                <span className="text-textSecondary">{topic.code}</span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-textPrimary leading-snug">
                {topic.title}
              </h2>
              <p className="text-xs sm:text-[13px] text-textSecondary leading-relaxed">
                {topic.body}
              </p>
            </div>
          ))}
        </section>

        {/* Thai FDA Verification 3-Step Strip */}
        <section className="border border-border bg-secondary/45">
          <div className="p-7 sm:p-9 border-b border-border flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold">
                THAI FDA VERIFICATION
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold text-textPrimary">
                ขั้นตอนตรวจสอบเลข อย. 13 หลักด้วยตนเอง
              </h2>
              <p className="text-xs sm:text-sm text-textSecondary">
                ผลิตภัณฑ์เสริมอาหารที่ถูกกฎหมายในไทยต้องมีเลขสารบบในรูปแบบ{' '}
                <code className="font-mono text-textPrimary">XX-X-XXXXX-X-XXXX</code>
              </p>
            </div>
            <a
              href="https://www.fda.moph.go.th/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-textPrimary text-white hover:bg-primary text-xs font-medium transition-colors self-start md:self-auto shrink-0"
            >
              <span>เปิดเว็บไซต์ อย. ไทย</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border bg-white">
            {[
              {
                step: 'STEP 01',
                title: 'เข้าเว็บไซต์หรือแอป อย.',
                desc: 'ไปที่ fda.moph.go.th หรือเปิดแอปพลิเคชัน Oryor Smart App บนมือถือ',
              },
              {
                step: 'STEP 02',
                title: 'กรอกเลขสารบบ 13 หลัก',
                desc: 'เลือกเมนู “ตรวจเลขผลิตภัณฑ์สุขภาพ” แล้วกรอกเลข 13 หลักตามฉลากสินค้า',
              },
              {
                step: 'STEP 03',
                title: 'ยืนยันชื่อและสถานะ “คงอยู่”',
                desc: 'ตรวจให้ชื่อผลิตภัณฑ์และผู้ผลิตตรงกับกล่อง และสถานะต้องเป็น “คงอยู่” เท่านั้น',
              },
            ].map((s) => (
              <div key={s.step} className="p-6 sm:p-7 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                  {s.step}
                </span>
                <h3 className="text-sm font-semibold text-textPrimary">{s.title}</h3>
                <p className="text-xs text-textSecondary leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold">
              FREQUENTLY ASKED
            </span>
            <h2 className="text-2xl font-semibold text-textPrimary tracking-tight">
              คำถามยอดฮิตด้านความปลอดภัย
            </h2>
            <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
              คำตอบตรงไปตรงมาตามหลักเวชศาสตร์การกีฬาและมาตรฐาน อย. ไทย
            </p>
          </div>
          <div className="lg:col-span-8">
            <Accordion items={faqs} allowMultiple defaultOpenId="faq-1" />
          </div>
        </section>

        <Disclaimer />
      </main>
    </div>
  );
}
