'use client';

import Link from 'next/link';
import { useState, useId } from 'react';
import { Calculator, ArrowRight, Sparkles, Check } from 'lucide-react';

export default function ProteinCalculatorPreview() {
  const [weight, setWeight] = useState<number>(65);
  const [multiplier, setMultiplier] = useState<number>(1.6);
  const sliderId = useId();

  const totalProtein = Math.round(weight * multiplier);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-card via-secondary to-primary/5 border border-border rounded-3xl p-8 sm:p-12 shadow-lg relative">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Calculator className="w-3.5 h-3.5" />
                <span>เครื่องคำนวณอัจฉริยะ</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-textPrimary tracking-tight leading-tight">
                คุณต้องกินโปรตีนเท่าไหร่ <br />
                <span className="text-primary">ต่อวันสำหรับเป้าหมายของคุณ?</span>
              </h2>

              <p className="text-sm text-textSecondary leading-relaxed">
                การได้รับโปรตีนในปริมาณที่เหมาะสมคือกุญแจสำคัญในการรักษามวลกล้ามเนื้อและฟื้นฟูร่างกาย ทดลองคำนวณเบื้องต้นได้ทันที
              </p>

              <div className="pt-2">
                <Link
                  href="/calculator/protein"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all duration-200 shadow-md shadow-primary/20"
                >
                  <span>เปิดเครื่องคำนวณแบบเต็ม + คำแนะนำอาหาร</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Mini Interactive Widget */}
            <div className="lg:col-span-6 bg-card border border-border rounded-2xl p-6 sm:p-7 space-y-6 shadow-md">
              {/* Weight Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold text-textPrimary">
                  <label htmlFor={sliderId}>น้ำหนักตัวของคุณ:</label>
                  <span className="text-xl font-mono font-bold text-primary">
                    {weight} <span className="text-xs text-textSecondary font-sans font-normal">กก.</span>
                  </span>
                </div>
                <input
                  id={sliderId}
                  type="range"
                  min="40"
                  max="130"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                  aria-label="เลื่อนเพื่อปรับน้ำหนักตัว"
                />
              </div>

              {/* Multiplier buttons */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-textSecondary block">
                  ระดับการฝึกซ้อม:
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setMultiplier(1.4)}
                    className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                      multiplier === 1.4
                        ? 'bg-primary text-white border-primary font-bold'
                        : 'bg-secondary border-border text-textSecondary hover:text-textPrimary'
                    }`}
                  >
                    1.4 g (ทั่วไป)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMultiplier(1.6)}
                    className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                      multiplier === 1.6
                        ? 'bg-primary text-white border-primary font-bold'
                        : 'bg-secondary border-border text-textSecondary hover:text-textPrimary'
                    }`}
                  >
                    1.6 g (เวทเทรนนิ่ง)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMultiplier(2.0)}
                    className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                      multiplier === 2.0
                        ? 'bg-primary text-white border-primary font-bold'
                        : 'bg-secondary border-border text-textSecondary hover:text-textPrimary'
                    }`}
                  >
                    2.0 g (เพิ่มกล้ามเข้มข้น)
                  </button>
                </div>
              </div>

              {/* Result Preview Box */}
              <div className="p-4 rounded-xl bg-card border border-border/70 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-textSecondary block uppercase tracking-wider">
                    ปริมาณโปรตีนที่แนะนำ:
                  </span>
                  <div className="text-3xl font-extrabold font-mono text-primary pt-0.5">
                    {totalProtein} <span className="text-sm font-sans font-normal text-textSecondary">กรัม/วัน</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-textSecondary font-mono">
                  {weight} &times; {multiplier} = {totalProtein}g
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
