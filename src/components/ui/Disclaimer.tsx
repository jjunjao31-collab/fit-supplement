import { cn } from '@/lib/utils';

interface DisclaimerProps {
  className?: string;
  variant?: 'full' | 'compact';
}

export default function Disclaimer({ className, variant = 'full' }: DisclaimerProps) {
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'py-3.5 px-4 border-l-2 border-primary bg-secondary/60 text-xs text-textSecondary leading-relaxed',
          className
        )}
      >
        ข้อมูลนี้จัดทำขึ้นเพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำทางการแพทย์ ผู้มีโรคประจำตัวควรปรึกษาแพทย์ก่อนเริ่มรับประทานอาหารเสริม
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-y border-border bg-secondary/45 py-7 px-6 sm:px-8',
        className
      )}
    >
      <div className="max-w-4xl space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary font-semibold block">
          MEDICAL DISCLAIMER
        </span>
        <h4 className="text-sm font-semibold text-textPrimary">
          ข้อสงวนสิทธิ์ทางการแพทย์และการใช้ข้อมูล
        </h4>
        <p className="text-xs sm:text-[13px] text-textSecondary leading-relaxed">
          เนื้อหาและข้อมูลทั้งหมดบน <strong className="text-textPrimary font-medium">FIT SUPPLEMENT</strong> มีวัตถุประสงค์เพื่อให้ความรู้ด้านโภชนาการการกีฬาตามหลักฐานทางวิทยาศาสตร์เท่านั้น <strong className="text-textPrimary font-medium">ห้ามนำไปใช้เพื่อวินิจฉัย บำบัด รักษา หรือป้องกันโรคใดๆ</strong> หากคุณตั้งครรภ์ มีโรคประจำตัว (โดยเฉพาะโรคไต โรคตับ โรคหัวใจ หรือความดันโลหิต) หรือใช้ยาตามใบสั่งแพทย์ กรุณาปรึกษาแพทย์หรือเภสัชกรก่อนเริ่มใช้อาหารเสริมทุกชนิด
        </p>
      </div>
    </div>
  );
}
