import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

/**
 * 21st.dev Minimal Editorial Footer
 * Clean hairline architecture, generous negative space, whisper-quiet brand mark
 */
export default function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-20 pb-10">
        {/* Top 4-Column Architectural Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-border">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-5">
            <Link
              href="/"
              className="inline-block text-sm font-semibold tracking-[0.22em] uppercase text-textPrimary"
            >
              FIT<span className="text-primary font-bold">·</span>SUPPLEMENT
            </Link>
            <p className="text-sm text-textSecondary leading-relaxed max-w-sm">
              แพลตฟอร์มความรู้และร้านค้าอาหารเสริมกีฬามาตรฐานคลินิกสำหรับคนไทย อ้างอิงหลักฐานทางวิทยาศาสตร์ โปร่งใส ตรวจสอบเลข อย. ได้ทุกรายการ
            </p>
            <p className="text-xs text-textSecondary/80 leading-relaxed max-w-sm pt-2 border-t border-border/70">
              ข้อมูลบนเว็บไซต์มีวัตถุประสงค์เพื่อการศึกษา ไม่ใช่คำแนะนำทางการแพทย์ ผู้มีโรคประจำตัวควรปรึกษาแพทย์ก่อนใช้ผลิตภัณฑ์เสริมอาหาร
            </p>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
              สำรวจ
            </h3>
            <ul className="space-y-2.5 text-[13px] text-textPrimary">
              <li>
                <Link href="/store" className="hover:text-primary transition-colors">
                  ร้านค้าทางการ
                </Link>
              </li>
              <li>
                <Link href="/supplements" className="hover:text-primary transition-colors">
                  สารานุกรมอาหารเสริม
                </Link>
              </li>
              <li>
                <Link href="/calculator/protein" className="hover:text-primary transition-colors">
                  คำนวณโปรตีน
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-primary transition-colors">
                  เปรียบเทียบสูตร
                </Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-primary transition-colors">
                  บทความวิชาการ
                </Link>
              </li>
            </ul>
          </div>

          {/* Goals */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
              เป้าหมาย
            </h3>
            <ul className="space-y-2.5 text-[13px] text-textPrimary">
              <li>
                <Link href="/store?goal=muscle-gain" className="hover:text-primary transition-colors">
                  เพิ่มกล้ามเนื้อ
                </Link>
              </li>
              <li>
                <Link href="/store?goal=fat-loss" className="hover:text-primary transition-colors">
                  ลดไขมัน / ลีนหุ่น
                </Link>
              </li>
              <li>
                <Link href="/store?goal=strength" className="hover:text-primary transition-colors">
                  เพิ่มพละกำลัง
                </Link>
              </li>
              <li>
                <Link href="/store?goal=recovery" className="hover:text-primary transition-colors">
                  ฟื้นฟูร่างกาย
                </Link>
              </li>
              <li>
                <Link href="/store?goal=general-health" className="hover:text-primary transition-colors">
                  สุขภาพโดยรวม
                </Link>
              </li>
            </ul>
          </div>

          {/* References */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
              มาตรฐานอ้างอิง
            </h3>
            <ul className="space-y-2.5 text-[13px] text-textPrimary">
              {[
                { label: 'NIH Office of Dietary Supplements', href: 'https://ods.od.nih.gov/' },
                { label: 'AIS Sports Nutrition', href: 'https://www.ausport.gov.au/ais/nutrition/supplements' },
                { label: 'ISSN Position Stands', href: 'https://jissn.biomedcentral.com/' },
                { label: 'สำนักงานคณะกรรมการอาหารและยา (อย.)', href: 'https://www.fda.moph.go.th/' },
              ].map((ref) => (
                <li key={ref.label}>
                  <a
                    href={ref.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <span>{ref.label}</span>
                    <ArrowUpRight className="w-3 h-3 text-textSecondary" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Hairline Meta + Subtle Editorial Wordmark */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-textSecondary">
          <p>&copy; 2026 FIT SUPPLEMENT. สงวนลิขสิทธิ์</p>
          <div className="flex items-center gap-6">
            <Link href="/safety" className="hover:text-textPrimary transition-colors">
              คู่มือความปลอดภัย
            </Link>
            <Link href="/about" className="hover:text-textPrimary transition-colors">
              เกี่ยวกับเรา
            </Link>
            <Link href="/login" className="hover:text-textPrimary transition-colors">
              บัญชีสมาชิก
            </Link>
            <Link href="/admin/login" className="hover:text-textPrimary transition-colors">
              ผู้ดูแลระบบ
            </Link>
          </div>
        </div>

        {/* Signature 21st.dev Minimal Oversized Ghost Wordmark */}
        <div
          aria-hidden="true"
          className="pt-10 select-none overflow-hidden text-center"
        >
          <span className="block text-[clamp(2.4rem,9vw,7.5rem)] font-bold tracking-[0.14em] leading-none text-secondary uppercase">
            FIT SUPPLEMENT
          </span>
        </div>
      </div>
    </footer>
  );
}
