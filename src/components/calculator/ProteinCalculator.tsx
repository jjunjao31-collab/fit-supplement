'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Minus, Plus, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import SlidingNumber from '@/components/ui/SlidingNumber';
import SpotlightCard from '@/components/ui/SpotlightCard';
import SegmentedControl from '@/components/ui/SegmentedControl';

type Gender = 'male' | 'female';
type Goal = 'muscle' | 'fatloss' | 'maintain' | 'endurance';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'heavy';

interface GoalOption {
  id: Goal;
  title: string;
  desc: string;
  multiplier: number;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'muscle',
    title: 'สร้างกล้ามเนื้อ',
    desc: 'ฝึกเวทเทรนนิ่ง เพิ่มขนาดและความแข็งแรง',
    multiplier: 1.8,
  },
  {
    id: 'fatloss',
    title: 'ลดไขมัน / ลีนหุ่น',
    desc: 'โปรตีนสูงช่วยคงกล้ามเนื้อช่วงคุมแคลอรี',
    multiplier: 2.0,
  },
  {
    id: 'maintain',
    title: 'รักษารูปร่าง / สุขภาพ',
    desc: 'ออกกำลังกายทั่วไป รักษามวลกล้ามเนื้อ',
    multiplier: 1.5,
  },
  {
    id: 'endurance',
    title: 'กีฬาความทนทาน',
    desc: 'วิ่ง ปั่นจักรยาน ว่ายน้ำ ระยะไกล',
    multiplier: 1.3,
  },
];

const ACTIVITY_OPTIONS: {
  id: ActivityLevel;
  title: string;
  desc: string;
  factor: number;
}[] = [
  { id: 'sedentary', title: 'ไม่ออกกำลังกาย', desc: 'นั่งทำงานเป็นหลัก', factor: 1.2 },
  { id: 'light', title: '1–3 วัน / สัปดาห์', desc: 'เดินเร็ว โยคะ เวทเบา', factor: 1.375 },
  { id: 'moderate', title: '3–5 วัน / สัปดาห์', desc: 'เวทเทรนนิ่ง หรือคาร์ดิโอต่อเนื่อง', factor: 1.55 },
  { id: 'heavy', title: '6–7 วัน / สัปดาห์', desc: 'ฝึกซ้อมหนักระดับนักกีฬา', factor: 1.725 },
];

/**
 * 21st.dev Minimal Premium Protein & Body Metrics Studio
 */
export default function ProteinCalculator() {
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<number>(25);
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(65);
  const [goal, setGoal] = useState<Goal>('muscle');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');

  const currentGoalOption = GOAL_OPTIONS.find((g) => g.id === goal) || GOAL_OPTIONS[0];
  const multiplier = currentGoalOption.multiplier;

  // 1. BMI (Asian standard)
  const heightM = height / 100;
  const bmi = heightM > 0 ? parseFloat((weight / (heightM * heightM)).toFixed(1)) : 0;

  let bmiCategory = 'สมส่วน';
  let bmiTone = 'text-primary';
  if (bmi < 18.5) {
    bmiCategory = 'น้ำหนักน้อยกว่าเกณฑ์';
    bmiTone = 'text-textSecondary';
  } else if (bmi <= 22.9) {
    bmiCategory = 'สมส่วน (Healthy)';
    bmiTone = 'text-primary';
  } else if (bmi <= 24.9) {
    bmiCategory = 'น้ำหนักเกินเกณฑ์';
    bmiTone = 'text-textPrimary';
  } else {
    bmiCategory = 'ท้วม / โรคอ้วน';
    bmiTone = 'text-red-600';
  }

  const minIdealWeight = Math.round(18.5 * (heightM * heightM));
  const maxIdealWeight = Math.round(22.9 * (heightM * heightM));

  // 2. BMR & TDEE (Mifflin-St Jeor)
  const bmr =
    gender === 'male'
      ? Math.round(10 * weight + 6.25 * height - 5 * age + 5)
      : Math.round(10 * weight + 6.25 * height - 5 * age - 161);

  const currentActivityOption =
    ACTIVITY_OPTIONS.find((a) => a.id === activity) || ACTIVITY_OPTIONS[2];
  const tdee = Math.round(bmr * currentActivityOption.factor);

  // 3. Protein Calculations
  const dailyProteinTarget = Math.round(weight * multiplier);
  const minProteinRange = Math.round(weight * (multiplier - 0.2));
  const maxProteinRange = Math.round(weight * (multiplier + 0.2));
  const perMeal3 = Math.round(dailyProteinTarget / 3);
  const perMeal4 = Math.round(dailyProteinTarget / 4);

  const cookedChickenBreastG = Math.round((dailyProteinTarget / 31) * 100);
  const wholeEggs = Math.round(dailyProteinTarget / 6.5);
  const wheyScoopsNeeded = Math.min(
    2,
    Math.max(1, Math.round((dailyProteinTarget * 0.3) / 25))
  );

  const handleReset = () => {
    setGender('male');
    setAge(25);
    setHeight(170);
    setWeight(65);
    setGoal('muscle');
    setActivity('moderate');
  };

  return (
    <div className="border border-border bg-white grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border items-start">
      {/* LEFT: INPUT STUDIO (7 cols) */}
      <div className="lg:col-span-7 p-6 sm:p-9 lg:p-10 space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
              BODY PROFILE
            </span>
            <h2 className="text-lg font-semibold text-textPrimary">ข้อมูลสรีระร่างกาย</h2>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>รีเซ็ตค่า</span>
          </button>
        </div>

        {/* Gender & Age */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-textSecondary block">
              เพศ (GENDER)
            </label>
            <SegmentedControl
              layoutId="calc-gender-segment"
              variant="sharp"
              size="md"
              fullWidth
              ariaLabel="เลือกเพศ"
              options={[
                { id: 'male', label: 'ชาย' },
                { id: 'female', label: 'หญิง' },
              ]}
              value={gender}
              onChange={setGender}
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-textSecondary">
              <label>อายุ (AGE)</label>
              <span className="text-textPrimary font-semibold">{age} ปี</span>
            </div>
            <div className="flex items-center border border-border divide-x divide-border">
              <button
                type="button"
                onClick={() => setAge(Math.max(12, age - 1))}
                className="p-2.5 text-textPrimary hover:bg-secondary cursor-pointer"
                aria-label="ลดอายุ"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={12}
                max={90}
                value={age}
                onChange={(e) =>
                  setAge(Math.min(90, Math.max(12, parseInt(e.target.value) || 20)))
                }
                aria-label="อายุ"
                className="flex-1 py-2 text-center text-sm font-mono font-semibold text-textPrimary focus:outline-none bg-white"
              />
              <button
                type="button"
                onClick={() => setAge(Math.min(90, age + 1))}
                className="p-2.5 text-textPrimary hover:bg-secondary cursor-pointer"
                aria-label="เพิ่มอายุ"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Height */}
        <div className="space-y-3 pt-6 border-t border-border">
          <div className="flex items-baseline justify-between">
            <label className="text-[11px] font-mono uppercase tracking-wider text-textSecondary">
              ส่วนสูง (HEIGHT)
            </label>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-semibold text-textPrimary">
                {height}
              </span>
              <span className="text-xs text-textSecondary">ซม.</span>
            </div>
          </div>
          <input
            type="range"
            min={130}
            max={210}
            step={1}
            value={height}
            onChange={(e) => setHeight(parseInt(e.target.value) || 160)}
            aria-label="เลื่อนเพื่อปรับส่วนสูง"
            className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[155, 160, 165, 170, 175, 180, 185].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHeight(h)}
                  className={cn(
                    'px-2.5 py-1 text-[11px] font-mono border transition-colors cursor-pointer',
                    height === h
                      ? 'bg-textPrimary text-white border-textPrimary'
                      : 'bg-white text-textSecondary border-border hover:border-textPrimary/40'
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
            <input
              type="number"
              min={130}
              max={220}
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 160)}
              aria-label="กรอกส่วนสูง"
              className="w-16 px-2 py-1 border border-border text-xs font-mono font-semibold text-center text-textPrimary focus:border-textPrimary focus:outline-none"
            />
          </div>
        </div>

        {/* Weight */}
        <div className="space-y-3 pt-6 border-t border-border">
          <div className="flex items-baseline justify-between">
            <label className="text-[11px] font-mono uppercase tracking-wider text-textSecondary">
              น้ำหนักตัว (WEIGHT)
            </label>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-semibold text-textPrimary">
                {weight}
              </span>
              <span className="text-xs text-textSecondary">กก.</span>
            </div>
          </div>
          <input
            type="range"
            min={35}
            max={150}
            step={0.5}
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value) || 50)}
            aria-label="เลื่อนเพื่อปรับน้ำหนักตัว"
            className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[50, 55, 60, 65, 70, 75, 80, 85, 90].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeight(w)}
                  className={cn(
                    'px-2.5 py-1 text-[11px] font-mono border transition-colors cursor-pointer',
                    weight === w
                      ? 'bg-textPrimary text-white border-textPrimary'
                      : 'bg-white text-textSecondary border-border hover:border-textPrimary/40'
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
            <input
              type="number"
              min={30}
              max={180}
              step={0.5}
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 50)}
              aria-label="กรอกน้ำหนัก"
              className="w-16 px-2 py-1 border border-border text-xs font-mono font-semibold text-center text-textPrimary focus:border-textPrimary focus:outline-none"
            />
          </div>
        </div>

        {/* Fitness Goal */}
        <div className="space-y-3 pt-6 border-t border-border">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider">
            <span className="text-textSecondary">เป้าหมายการฝึก (GOAL)</span>
            <span className="text-primary font-semibold">{multiplier.toFixed(1)} g/kg</span>
          </div>
          <div className="border-t border-l border-border grid grid-cols-1 sm:grid-cols-2">
            {GOAL_OPTIONS.map((g) => {
              const isSelected = goal === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={cn(
                    'p-4 border-r border-b border-border text-left transition-colors cursor-pointer space-y-1',
                    isSelected
                      ? 'bg-secondary border-b-primary'
                      : 'bg-white hover:bg-secondary/45'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'text-xs font-semibold',
                        isSelected ? 'text-primary' : 'text-textPrimary'
                      )}
                    >
                      {g.title}
                    </span>
                    <span className="text-[10px] font-mono text-textSecondary">
                      {g.multiplier.toFixed(1)}x
                    </span>
                  </div>
                  <p className="text-[11px] text-textSecondary leading-relaxed">{g.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity Level */}
        <div className="space-y-3 pt-6 border-t border-border">
          <span className="text-[11px] font-mono uppercase tracking-wider text-textSecondary block">
            ความถี่การออกกำลังกาย (ACTIVITY)
          </span>
          <div className="border-t border-l border-border grid grid-cols-1 sm:grid-cols-2">
            {ACTIVITY_OPTIONS.map((a) => {
              const isSelected = activity === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setActivity(a.id)}
                  className={cn(
                    'p-3.5 border-r border-b border-border text-left transition-colors cursor-pointer space-y-0.5',
                    isSelected
                      ? 'bg-secondary'
                      : 'bg-white hover:bg-secondary/45'
                  )}
                >
                  <div
                    className={cn(
                      'text-xs font-semibold',
                      isSelected ? 'text-primary' : 'text-textPrimary'
                    )}
                  >
                    {a.title}
                  </div>
                  <p className="text-[11px] text-textSecondary truncate">{a.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: STICKY MINIMAL CLINICAL RESULT COLUMN (5 cols) */}
      <div className="lg:col-span-5 lg:sticky lg:top-20 divide-y divide-border bg-secondary/35">
        {/* Primary Protein Target */}
        <SpotlightCard sharp className="p-7 sm:p-9 bg-white">
          <div className="space-y-6">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em]">
              <span className="text-primary font-semibold">DAILY PROTEIN TARGET</span>
              <span className="text-textSecondary">ISSN STANDARD</span>
            </div>

            <div className="py-4 border-y border-border space-y-2">
              <div className="flex items-baseline gap-2.5">
                <SlidingNumber
                  value={dailyProteinTarget}
                  useLocale={false}
                  className="text-6xl sm:text-7xl font-light font-mono text-textPrimary tracking-tighter"
                />
                <span className="text-sm font-medium text-primary">กรัม / วัน</span>
              </div>
              <div className="text-xs text-textSecondary font-mono">
                ช่วงเหมาะสม: {minProteinRange}–{maxProteinRange} g/วัน ({weight} กก. &times;{' '}
                {multiplier.toFixed(1)})
              </div>
            </div>

            {/* Meal Split */}
            <div className="grid grid-cols-2 border border-border divide-x divide-border text-xs">
              <div className="p-3.5">
                <div className="text-[10px] font-mono uppercase text-textSecondary">แบ่ง 3 มื้อ</div>
                <div className="text-lg font-mono font-semibold text-textPrimary mt-0.5">
                  ~<SlidingNumber value={perMeal3} useLocale={false} /> g
                </div>
              </div>
              <div className="p-3.5">
                <div className="text-[10px] font-mono uppercase text-textSecondary">แบ่ง 4 มื้อ</div>
                <div className="text-lg font-mono font-semibold text-primary mt-0.5">
                  ~<SlidingNumber value={perMeal4} useLocale={false} /> g
                </div>
              </div>
            </div>

            {/* Food Equivalents */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-textSecondary block">
                เทียบเท่าอาหารธรรมชาติ
              </span>
              <div className="border-y border-border divide-y divide-border">
                <div className="py-2.5 flex justify-between">
                  <span className="text-textSecondary">อกไก่ปรุงสุก</span>
                  <span className="font-mono font-medium text-textPrimary">
                    ~{cookedChickenBreastG} กรัม
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-textSecondary">ไข่ไก่ต้ม (เบอร์ 0)</span>
                  <span className="font-mono font-medium text-textPrimary">
                    ~{wholeEggs} ฟอง
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-textSecondary">เวย์โปรตีนเสริมสะดวก</span>
                  <span className="font-mono font-medium text-primary">
                    {wheyScoopsNeeded} สกู๊ป (~{wheyScoopsNeeded * 25}g)
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/store?category=whey"
              className="w-full py-3.5 px-5 bg-textPrimary hover:bg-primary text-white text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-colors"
            >
              <span>เลือกซื้อเวย์โปรตีนที่เหมาะกับคุณ</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </SpotlightCard>

        {/* Body Metrics: BMI / BMR / TDEE */}
        <div className="p-7 sm:p-9 space-y-5">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-textSecondary font-semibold block">
            BODY METRICS &amp; ENERGY
          </span>

          <div className="flex items-baseline justify-between border-b border-border pb-4">
            <div className="space-y-0.5">
              <div className="text-xs text-textSecondary">ดัชนีมวลกาย (BMI)</div>
              <div className="text-[11px] font-mono text-textSecondary">
                น้ำหนักเหมาะสม: {minIdealWeight}–{maxIdealWeight} กก.
              </div>
            </div>
            <div className="text-right">
              <SlidingNumber
                value={bmi}
                decimals={1}
                useLocale={false}
                className="text-2xl font-mono font-semibold text-textPrimary block"
              />
              <span className={`text-[11px] font-medium ${bmiTone}`}>{bmiCategory}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 border border-border divide-x divide-border bg-white">
            <div className="p-4 space-y-0.5">
              <div className="text-[10px] font-mono uppercase text-textSecondary">
                BMR (พื้นฐาน)
              </div>
              <div className="text-xl font-mono font-semibold text-textPrimary">
                <SlidingNumber value={bmr} />
              </div>
              <div className="text-[10px] text-textSecondary">kcal / วัน</div>
            </div>
            <div className="p-4 space-y-0.5">
              <div className="text-[10px] font-mono uppercase text-primary">
                TDEE (รวมกิจกรรม)
              </div>
              <div className="text-xl font-mono font-semibold text-primary">
                <SlidingNumber value={tdee} />
              </div>
              <div className="text-[10px] text-textSecondary">kcal / วัน</div>
            </div>
          </div>

          <p className="text-xs text-textSecondary leading-relaxed border-l-2 border-primary pl-3.5">
            เพิ่มกล้ามเนื้อ: ประมาณ{' '}
            <strong className="text-textPrimary font-mono">
              {(tdee + 300).toLocaleString()}
            </strong>{' '}
            kcal/วัน · ลดไขมัน: ประมาณ{' '}
            <strong className="text-textPrimary font-mono">
              {(tdee - 400).toLocaleString()}
            </strong>{' '}
            kcal/วัน
          </p>
        </div>
      </div>
    </div>
  );
}
