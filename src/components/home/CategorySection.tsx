import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';
import SupplementIcon from '@/components/ui/SupplementIcon';

const categories = [
  {
    key: 'protein',
    nameTH: 'โปรตีน (Protein)',
    iconName: 'whey-protein',
    desc: 'เสริมสร้างและซ่อมแซมเส้นใยกล้ามเนื้อ เหมาะสำหรับผู้ที่ต้องการโปรตีนเพิ่ม',
    count: 'เวย์โปรตีน, ซอย, ไอโซเลท',
  },
  {
    key: 'creatine',
    nameTH: 'ครีเอทีน (Creatine)',
    iconName: 'creatine',
    desc: 'เพิ่มพลังงาน ATP และแรงระเบิดกล้ามเนื้อ ได้รับการวิจัยมากที่สุดในโลก (5 สูตร)',
    count: 'โมโนไฮเดรต, HCL, Creapure',
  },
  {
    key: 'stimulant',
    nameTH: 'สารกระตุ้น (Stimulants)',
    iconName: 'caffeine',
    desc: 'เพิ่มความตื่นตัว ลดความเหนื่อยล้า และเพิ่มประสิทธิภาพการออกกำลังกาย',
    count: 'คาเฟอีน แอนไฮดรัส',
  },
  {
    key: 'pre-workout',
    nameTH: 'พรีเวิร์กเอาต์ (Pre-Workout)',
    iconName: 'pre-workout',
    desc: 'สูตรผสมสารอาหารหลากหลาย 4 กลุ่มหลัก บูสต์พลังงาน โฟกัส และการสูบฉีดเลือด',
    count: 'High Stim, Stim-Free, Pump',
  },
  {
    key: 'amino-acid',
    nameTH: 'กรดอะมิโน (Amino Acids)',
    iconName: 'bcaa',
    desc: 'กรดอะมิโนจำเป็นและกิ่ง BCAA ช่วยกระตุ้นการสังเคราะห์โปรตีน',
    count: 'BCAA 2:1:1, EAA',
  },
  {
    key: 'electrolyte',
    nameTH: 'เกลือแร่ (Electrolytes)',
    iconName: 'electrolytes',
    desc: 'รักษาสมดุลของเหลวในเซลล์ ป้องกันตะคริวในการออกกำลังกายที่เหงื่อออกมาก',
    count: 'โซเดียม, โพแทสเซียม, แมกนีเซียม',
  },
  {
    key: 'mass-gainer',
    nameTH: 'เพิ่มน้ำหนัก (Mass Gainer)',
    iconName: 'mass-gainer',
    desc: 'ให้แคลอรีสูงสำหรับผู้ที่มีน้ำหนักขึ้นยากและไม่สามารถทานอาหารหลักได้พอ',
    count: 'คาร์บ + โปรตีนสูง',
  },
  {
    key: 'other',
    nameTH: 'สารชะลอการล้า (Beta-Alanine)',
    iconName: 'beta-alanine',
    desc: 'ช่วยบัฟเฟอร์กรดคาร์โนซีนในกล้ามเนื้อ ยืดระยะเวลาในการออกแรงเข้มข้นสูง',
    count: 'เบต้า-อะลานีน',
  },
];

export default function CategorySection() {
  return (
    <section className="py-20 bg-secondary/40 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>หมวดหมู่อาหารเสริม</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
              ค้นหาตามประเภทของอาหารเสริม
            </h2>
            <p className="text-sm text-textSecondary">
              จำแนกตามกลไกและรูปแบบสารอาหาร เพื่อให้คุณเข้าใจความแตกต่างก่อนตัดสินใจ
            </p>
          </div>

          <Link
            href="/supplements"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline self-start md:self-auto"
          >
            <span>ดูทั้งหมด 8 ชนิด</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={`/supplements?category=${cat.key}`}
              className="group p-5 rounded-2xl bg-card hover:bg-card-hover border border-border hover:border-primary/40 transition-all duration-300 flex flex-col justify-between space-y-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-secondary border border-border text-primary group-hover:scale-110 group-hover:border-primary/40 transition-all">
                  <SupplementIcon name={cat.iconName} size="md" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-textPrimary group-hover:text-primary transition-colors">
                    {cat.nameTH}
                  </h3>
                  <span className="text-[11px] text-textSecondary font-mono">
                    {cat.count}
                  </span>
                </div>
              </div>

              <p className="text-xs text-textSecondary line-clamp-2 leading-relaxed">
                {cat.desc}
              </p>

              <div className="pt-2 flex items-center justify-between text-[11px] font-semibold text-textSecondary group-hover:text-primary transition-colors border-t border-border/40">
                <span>เลือกดูในหมวดนี้</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}