'use client';

const BRAND_NAMES = [
  'BAAM!! FITWHEY',
  'VITAXTRONG',
  'FITWHEY SUPPLEMENTS',
  'OPTIMUM NUTRITION',
  'DYMATIZE ISO100',
  'PLANTAE',
  'MUSCLETECH',
  'CELLUCOR C4',
  'BLACKMORES',
  'MEGA WE CARE',
  'AIS GROUP A',
  'ISSN STANDARD',
  'NIH ODS',
];

export default function LogoMarquee() {
  const duplicated = [...BRAND_NAMES, ...BRAND_NAMES];

  return (
    <section
      aria-label="แบรนด์แท้และสถาบันวิจัยที่อ้างอิง"
      className="bg-white border-b border-border py-5 overflow-hidden"
    >
      <div
        className="marquee-wrapper relative overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <div className="animate-marquee items-center gap-10 pr-10">
          {duplicated.map((name, idx) => (
            <div
              key={`${name}-${idx}`}
              className="flex items-center gap-10 shrink-0 select-none"
            >
              <span className="text-xs sm:text-[13px] font-extrabold tracking-[0.2em] text-textSecondary/80 hover:text-primary transition-colors whitespace-nowrap">
                {name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/45 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
