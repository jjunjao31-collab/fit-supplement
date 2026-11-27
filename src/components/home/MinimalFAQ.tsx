'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ArrowUpRight } from 'lucide-react';
import BlurFade from '@/components/ui/BlurFade';

const FAQ_ITEMS = [
  {
    q: 'สินค้าทุกรายการในร้านมีเลข อย. ไทยรับรองจริงหรือไม่?',
    a: 'สินค้าทุกรายการใน FIT SUPPLEMENT นำเข้าและจัดจำหน่ายจากตัวแทนทางการ มีฉลากภาษาไทยและเลขสารบบอาหาร อย. ระบุชัดเจนบนหน้าสินค้าแต่ละชิ้น สามารถนำไปตรวจสอบกับฐานข้อมูล อย. ไทยได้โดยตรง',
  },
  {
    q: 'มือใหม่เริ่มเล่นเวท ควรเลือกเวย์โปรตีนหรือครีเอทีนก่อน?',
    a: 'หากยังรับประทานโปรตีนจากอาหารหลักไม่ถึงเป้าหมาย (ประมาณ 1.6-2.0 กรัมต่อน้ำหนักตัว 1 กก.) แนะนำเริ่มจากโปรตีนเสริมก่อน ส่วน Creatine Monohydrate (3-5 กรัม/วัน) เป็นตัวเสริมอันดับถัดมาที่มีงานวิจัย AIS Group A รองรับเรื่องแรงยกและมวลกล้ามเนื้อชัดเจนที่สุด',
  },
  {
    q: 'ผู้ที่มีโรคประจำตัว เช่น โรคไตหรือโรคตับ ทานอาหารเสริมได้ไหม?',
    a: 'ข้อมูลบนเว็บไซต์นี้จัดทำขึ้นเพื่อการศึกษาสำหรับผู้ที่มีสุขภาพแข็งแรง หากคุณมีภาวะไตเสื่อม โรคตับ ความดันโลหิตสูง หรือทานยาประจำตัว ควรปรึกษาแพทย์หรือเภสัชกรก่อนปรับปริมาณโปรตีนหรือใช้ผลิตภัณฑ์เสริมอาหารทุกชนิด',
  },
  {
    q: 'เงื่อนไขการจัดส่งฟรีและแต้มสะสม FIT Points เป็นอย่างไร?',
    a: 'จัดส่งฟรีทั่วประเทศเมื่อมียอดสั่งซื้อครบ 1,500 บาท และสมาชิกที่เข้าสู่ระบบจะได้รับคะแนนสะสม FIT Points อัตโนมัติ 5% จากยอดสั่งซื้อจริงในทุกคำสั่งซื้อ',
  },
];

/**
 * 21st.dev Minimalist Motion Accordion FAQ
 * Clean hairline rows with smooth Framer Motion height expansion
 */
export default function MinimalFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 sm:py-28 bg-secondary">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Editorial Intro */}
          <BlurFade className="lg:col-span-5 space-y-5">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold block">
              05 / SAFETY & FAQ
            </span>
            <h2 className="text-2xl sm:text-4xl font-semibold text-textPrimary tracking-tight leading-tight">
              คำถามที่พบบ่อยและมาตรฐานความปลอดภัย
            </h2>
            <p className="text-sm text-textSecondary leading-relaxed max-w-md">
              เรายึดความโปร่งใสเป็นหลัก ทั้งการตรวจฉลาก อย. ข้อควรระวังทางการแพทย์ และหลักฐานงานวิจัยที่ตรวจสอบได้
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-6">
              <Link
                href="/safety"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-textPrimary hover:text-primary transition-colors border-b border-textPrimary hover:border-primary pb-0.5"
              >
                <span>อ่านคู่มือความปลอดภัย</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/store"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-textSecondary hover:text-primary transition-colors"
              >
                <span>ไปหน้าร้านค้า</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </BlurFade>

          {/* Right Smooth Hairline Accordion */}
          <BlurFade delay={0.08} className="lg:col-span-7 border-y border-border divide-y divide-border bg-white px-6 sm:px-8">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 text-left cursor-pointer group"
                  >
                    <span className="text-sm sm:text-[15px] font-medium text-textPrimary group-hover:text-primary transition-colors">
                      {item.q}
                    </span>
                    <span className="text-textSecondary group-hover:text-primary shrink-0 transition-colors">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pt-3.5 text-xs sm:text-[13px] text-textSecondary leading-relaxed pr-8">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
