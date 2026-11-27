import Link from 'next/link';
import { ShieldAlert, CheckCircle, ArrowRight, AlertTriangle, ExternalLink } from 'lucide-react';

export default function SafetyBanner() {
  return (
    <section className="py-20 border-t border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-amber-50/70 via-card to-secondary border border-primary/30 p-8 sm:p-12 shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>มาตรฐานความปลอดภัยสูงสุด</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
                ความปลอดภัยต้องมาก่อนผลลัพธ์เสมอ
              </h2>

              <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                อาหารเสริมมีทั้งประโยชน์และความเสี่ยง การรับประทานเกินขนาด การผสมหลายชนิดที่มีสารกระตุ้นซ้ำซ้อน หรือการไม่ตรวจสอบเลข อย. อาจก่อให้เกิดอันตรายต่อระบบหัวใจ ตับ และไต
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-textSecondary">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>ตรวจสอบเลขสารบบ อย. 13 หลักเสมอ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>ระวังการสะสมคาเฟอีนเกิน 400 มก./วัน</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>ผู้มีโรคประจำตัวควรปรึกษาแพทย์ก่อน</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>อาหารเสริมแทนอาหารธรรมชาติไม่ได้</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto flex-shrink-0">
              <Link
                href="/safety"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors shadow-md shadow-primary/20 text-center"
              >
                <span>อ่านคู่มือความปลอดภัยฉบับเต็ม</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://www.fda.moph.go.th/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card hover:bg-secondary border border-border text-xs text-textSecondary hover:text-textPrimary transition-colors text-center font-semibold"
              >
                <span>ตรวจเลข อย. ที่เว็บไซต์ทางการ</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
