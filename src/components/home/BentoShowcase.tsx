'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Target,
  Calculator,
  ShieldCheck,
  Scale,
  ArrowRight,
  Layers,
  Dumbbell,
  Flame,
  Zap,
  HeartPulse,
  RefreshCw,
  Award,
} from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';
import SlidingNumber from '@/components/ui/SlidingNumber';
import SupplementIcon from '@/components/ui/SupplementIcon';

const QUICK_GOALS = [
  { id: 'muscle-gain', label: 'เพิ่มกล้ามเนื้อ', sub: 'Whey + Creatine', icon: Dumbbell },
  { id: 'fat-loss', label: 'ลดไขมัน / ลีนหุ่น', sub: 'Isolate + Plant', icon: Flame },
  { id: 'strength', label: 'เพิ่มแรงยก 1RM', sub: 'Creatine 5g/วัน', icon: Zap },
  { id: 'endurance', label: 'ความอึด / คาร์ดิโอ', sub: 'Pre-Workout', icon: HeartPulse },
  { id: 'recovery', label: 'ฟื้นฟูและพักผ่อน', sub: 'ZMA + Protein', icon: RefreshCw },
  { id: 'general-health', label: 'สุขภาพและข้อต่อ', sub: 'Omega-3 + Multi', icon: Award },
];

const QUICK_CATEGORIES = [
  { id: 'whey', label: 'เวย์โปรตีน', sub: 'WPC / Isolate', icon: 'whey-protein' },
  { id: 'plant-protein', label: 'โปรตีนพืช', sub: 'Soy / Plantae', icon: 'plant-protein' },
  { id: 'creatine', label: 'ครีเอทีน', sub: 'Monohydrate', icon: 'creatine' },
  { id: 'pre-workout', label: 'พรีเวิร์กเอาต์', sub: 'Energy & Pump', icon: 'pre-workout' },
  { id: 'vitamin-zinc', label: 'วิตามิน & ซิงค์', sub: 'ZMA / Multi', icon: 'zinc' },
  { id: 'fish-oil', label: 'น้ำมันปลา', sub: 'EPA / DHA', icon: 'fish-oil' },
];

export default function BentoShowcase() {
  const [quickWeight, setQuickWeight] = useState<number>(68);
  const dailyProtein = Math.round(quickWeight * 1.8);
  const perMeal = Math.round(dailyProtein / 4);

  return (
    <section className="py-16 sm:py-22 bg-secondary border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Layers className="w-3.5 h-3.5" />
              <span>เครื่องมือและทางลัดเลือกอาหารเสริม</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight">
              เลือกอย่างมีเหตุผล ครบในหน้าเดียว
            </h2>
            <p className="text-sm text-textSecondary">
              ค้นหาตามเป้าหมาย ลองคำนวณโปรตีนเบื้องต้น หรือเทียบงานวิจัยก่อนตัดสินใจซื้อ
            </p>
          </div>
          <Link
            href="/goals"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline self-start md:self-auto"
          >
            <span>ดูคู่มือทุกเป้าหมาย</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Asymmetric 12-Col Luxury Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Tile 1: Goal Finder (7 cols) */}
          <SpotlightCard className="lg:col-span-7 p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col justify-between h-full space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Target className="w-4 h-4" />
                    <span>เลือกตามเป้าหมายการฝึก</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-textPrimary">
                    เป้าหมายของคุณตอนนี้คืออะไร?
                  </h3>
                </div>
                <Link
                  href="/goals"
                  className="text-xs font-bold text-primary hover:underline shrink-0"
                >
                  ทั้งหมด &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {QUICK_GOALS.map((g) => {
                  const Icon = g.icon;
                  return (
                    <Link
                      key={g.id}
                      href={`/store?goal=${g.id}`}
                      className="group/tile p-3.5 rounded-2xl bg-secondary/80 hover:bg-amber-50/70 border border-border hover:border-primary/40 transition-all space-y-2"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white border border-border flex items-center justify-center text-primary shadow-xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-textPrimary group-hover/tile:text-primary transition-colors">
                          {g.label}
                        </div>
                        <div className="text-[11px] text-textSecondary font-mono">{g.sub}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </SpotlightCard>

          {/* Tile 2: Live Interactive Mini Protein Calculator (5 cols) */}
          <SpotlightCard className="lg:col-span-5 p-6 sm:p-7 shadow-xs bg-gradient-to-br from-card via-card to-amber-50/40">
            <div className="flex flex-col justify-between h-full space-y-5">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Calculator className="w-4 h-4" />
                  <span>ทดลองคำนวณโปรตีนทันที</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-primary border border-primary/25">
                  1.8 g/kg (ISSN)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/80 border border-border text-center space-y-1">
                <div className="text-[11px] text-textSecondary font-medium">
                  เป้าหมายโปรตีนสำหรับสายสร้างกล้ามเนื้อ
                </div>
                <div className="inline-flex items-baseline gap-1.5">
                  <SlidingNumber
                    value={dailyProtein}
                    className="text-5xl font-black font-mono text-primary tracking-tight"
                  />
                  <span className="text-sm font-bold text-textPrimary">กรัม / วัน</span>
                </div>
                <div className="text-[11px] text-textSecondary">
                  เฉลี่ย ~<strong className="text-textPrimary font-mono">{perMeal}g</strong> ต่อมื้อ (4 มื้อ/วัน)
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-textSecondary font-medium">เลื่อนปรับน้ำหนักตัว:</span>
                  <span className="font-mono font-black text-textPrimary">{quickWeight} กก.</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={120}
                  step={1}
                  value={quickWeight}
                  onChange={(e) => setQuickWeight(Number(e.target.value))}
                  aria-label="เลื่อนปรับน้ำหนักตัวเพื่อทดลองคำนวณโปรตีน"
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <Link
                href="/calculator/protein"
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-white hover:bg-primary-dark font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>คำนวณแบบละเอียด (BMI / BMR / TDEE)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </SpotlightCard>

          {/* Tile 3: Science & Safety Verification (5 cols) */}
          <SpotlightCard className="lg:col-span-5 p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col justify-between h-full space-y-5">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                  <ShieldCheck className="w-4 h-4" />
                  <span>ความโปร่งใสและมาตรฐาน อย.</span>
                </div>
                <h3 className="text-lg font-extrabold text-textPrimary">
                  เทียบหลักฐานงานวิจัยก่อนซื้อจริง
                </h3>
                <p className="text-xs text-textSecondary leading-relaxed">
                  ตรวจสอบเลขสารบบอาหาร อย. ไทย และเปรียบเทียบประสิทธิภาพ ความปลอดภัย และขนาดโดสของสารเสริมแต่ละชนิดแบบเคียงข้างกัน
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/compare"
                  className="p-3.5 rounded-2xl bg-secondary/80 hover:bg-amber-50/70 border border-border hover:border-primary/40 transition-all space-y-1.5"
                >
                  <Scale className="w-4 h-4 text-primary" />
                  <div className="text-xs font-bold text-textPrimary">เปรียบเทียบสูตร</div>
                  <div className="text-[11px] text-textSecondary">เทียบงานวิจัย 1 ต่อ 1</div>
                </Link>
                <Link
                  href="/safety"
                  className="p-3.5 rounded-2xl bg-secondary/80 hover:bg-amber-50/70 border border-border hover:border-primary/40 transition-all space-y-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <div className="text-xs font-bold text-textPrimary">คู่มือความปลอดภัย</div>
                  <div className="text-[11px] text-textSecondary">วิธีตรวจฉลาก อย.</div>
                </Link>
              </div>
            </div>
          </SpotlightCard>

          {/* Tile 4: Category Quick Browse (7 cols) */}
          <SpotlightCard className="lg:col-span-7 p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col justify-between h-full space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Layers className="w-4 h-4" />
                    <span>หมวดหมู่ยอดนิยมในร้านค้า</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-textPrimary">
                    กรองดูสินค้าตามประเภทได้ทันที
                  </h3>
                </div>
                <Link
                  href="/store"
                  className="text-xs font-bold text-primary hover:underline shrink-0"
                >
                  ไปหน้าร้าน &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {QUICK_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/store?category=${cat.id}`}
                    className="group/cat flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/80 hover:bg-amber-50/70 border border-border hover:border-primary/40 transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center text-primary shadow-xs shrink-0">
                      <SupplementIcon name={cat.icon} size="sm" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-textPrimary group-hover/cat:text-primary transition-colors truncate">
                        {cat.label}
                      </div>
                      <div className="text-[11px] text-textSecondary font-mono truncate">
                        {cat.sub}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
