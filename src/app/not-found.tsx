import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] bg-white flex items-center justify-center px-5 py-20">
      <div className="max-w-md w-full border border-border p-10 text-center space-y-6">
        <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-primary font-semibold block">
          ERROR 404
        </span>
        <h1 className="text-3xl font-semibold text-textPrimary tracking-tight">
          ไม่พบหน้าที่คุณต้องการ
        </h1>
        <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
          ลิงก์นี้อาจถูกย้าย ลบออก หรือพิมพ์ URL ไม่ถูกต้อง คุณสามารถกลับไปสำรวจสินค้าและสารานุกรมอาหารเสริมได้ด้านล่าง
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-textPrimary text-white hover:bg-primary text-xs font-medium transition-colors"
          >
            กลับหน้าแรก
          </Link>
          <Link
            href="/store"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3 border border-border text-textPrimary hover:border-textPrimary text-xs font-medium transition-colors"
          >
            <span>ไปหน้าร้านค้า</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
