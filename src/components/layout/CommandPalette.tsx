'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Sparkles,
  Calculator,
  Scale,
  Store,
  ShieldAlert,
  BookOpen,
  FileText,
  ArrowRight,
  ShoppingBag,
  CornerDownLeft,
} from 'lucide-react';
import { products as fallbackProducts, type Product } from '@/data/products';
import { supplements } from '@/data/supplements';
import { articles } from '@/data/articles';
import { useCart } from '@/context/CartContext';

interface CommandItem {
  id: string;
  group: 'actions' | 'products' | 'supplements' | 'articles';
  title: string;
  subtitle: string;
  badge?: string;
  price?: number;
  imageUrl?: string;
  product?: Product;
  href?: string;
  action?: () => void;
}

const EVIDENCE_LABEL: Record<string, string> = {
  strong: 'หลักฐานดีมาก',
  moderate: 'หลักฐานปานกลาง',
  limited: 'หลักฐานจำกัด',
  insufficient: 'หลักฐานไม่เพียงพอ',
};

export default function CommandPalette() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [liveProducts, setLiveProducts] = useState<Product[]>(fallbackProducts);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut Ctrl+K / Cmd+K + custom Navbar trigger event
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) {
            setQuery('');
            setActiveIndex(0);
          }
          return next;
        });
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    const onCustomOpen = () => {
      setQuery('');
      setActiveIndex(0);
      setIsOpen(true);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('open-command-palette', onCustomOpen);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('open-command-palette', onCustomOpen);
    };
  }, []);

  // Hydrate live MySQL product list when opened
  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => inputRef.current?.focus(), 60);

    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLiveProducts(data);
        }
      })
      .catch(() => {
        // keep fallback
      });
  }, [isOpen]);

  const items = useMemo<CommandItem[]>(() => {
    const q = query.trim().toLowerCase();

    const quickActions: CommandItem[] = [
      {
        id: 'act-ai',
        group: 'actions',
        title: 'เปิดผู้ช่วยจัดเซตอาหารเสริม AI',
        subtitle: 'วิเคราะห์เป้าหมาย งบประมาณ และข้อจำกัดจากคลัง 34 รายการ',
        badge: 'FIT AI',
        action: () => {
          setIsOpen(false);
          window.dispatchEvent(new CustomEvent('open-fit-ai'));
        },
      },
      {
        id: 'act-calc',
        group: 'actions',
        title: 'คำนวณโปรตีนต่อวัน (Protein Calculator)',
        subtitle: 'คำนวณปริมาณโปรตีนตามน้ำหนักตัวและเป้าหมายฝึกซ้อม',
        badge: 'เครื่องมือ',
        href: '/calculator/protein',
      },
      {
        id: 'act-compare',
        group: 'actions',
        title: 'เปรียบเทียบอาหารเสริมแบบตาราง',
        subtitle: 'เทียบความคุ้มค่า ประสิทธิภาพ และงานวิจัยเคียงข้างกัน',
        badge: 'เครื่องมือ',
        href: '/compare',
      },
      {
        id: 'act-store',
        group: 'actions',
        title: 'ร้านค้าอาหารเสริมทางการทั้งหมด',
        subtitle: `ดูสินค้าแท้มีเลข อย. ครบทั้ง ${liveProducts.length} รายการ`,
        badge: 'ร้านค้า',
        href: '/store',
      },
      {
        id: 'act-safety',
        group: 'actions',
        title: 'ความปลอดภัยและข้อควรระวัง',
        subtitle: 'เช็กข้อห้าม กลุ่มเสี่ยง และแนวทางการใช้ที่ปลอดภัย',
        badge: 'คลินิก',
        href: '/safety',
      },
    ];

    const matchedActions = q
      ? quickActions.filter(
          (a) =>
            a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
        )
      : quickActions.slice(0, 4);

    const matchedProducts: CommandItem[] = (
      q
        ? liveProducts.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.nameTH.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              p.fdaNumber.toLowerCase().includes(q)
          )
        : liveProducts.slice(0, 5)
    )
      .slice(0, q ? 8 : 5)
      .map((p) => ({
        id: `prod-${p.id}`,
        group: 'products',
        title: p.name,
        subtitle: `${p.brand} · ${p.size} · อย. ${p.fdaNumber}`,
        price: p.price,
        imageUrl: p.imageUrl,
        product: p,
        href: `/store/${p.id}`,
      }));

    const matchedSupplements: CommandItem[] = (
      q
        ? supplements.filter(
            (s) =>
              s.nameTH.toLowerCase().includes(q) ||
              s.nameEN.toLowerCase().includes(q) ||
              s.shortDescription.toLowerCase().includes(q)
          )
        : supplements.slice(0, 3)
    )
      .slice(0, q ? 5 : 3)
      .map((s) => ({
        id: `supp-${s.slug}`,
        group: 'supplements',
        title: `${s.nameTH} (${s.nameEN})`,
        subtitle: s.shortDescription,
        badge: EVIDENCE_LABEL[s.evidenceLevel] || s.evidenceLevel,
        href: `/supplements/${s.slug}`,
      }));

    const matchedArticles: CommandItem[] = (
      q
        ? articles.filter(
            (a) =>
              a.title.toLowerCase().includes(q) ||
              a.excerpt.toLowerCase().includes(q) ||
              a.category.toLowerCase().includes(q)
          )
        : []
    )
      .slice(0, 4)
      .map((a) => ({
        id: `art-${a.slug}`,
        group: 'articles',
        title: a.title,
        subtitle: `${a.category} · อ่าน ${a.readingTime} นาที`,
        badge: 'บทความ',
        href: `/articles/${a.slug}`,
      }));

    return [
      ...matchedActions,
      ...matchedProducts,
      ...matchedSupplements,
      ...matchedArticles,
    ];
  }, [query, liveProducts]);

  const clampedActiveIndex = items.length > 0 ? Math.min(activeIndex, items.length - 1) : 0;

  const executeItem = (item: CommandItem) => {
    if (item.action) {
      item.action();
      return;
    }
    if (item.href) {
      setIsOpen(false);
      router.push(item.href);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (items.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = items[clampedActiveIndex];
      if (target) executeItem(target);
    }
  };

  const groups: Array<{ key: CommandItem['group']; label: string }> = [
    { key: 'actions', label: 'คำสั่งด่วน · QUICK ACTIONS' },
    { key: 'products', label: `สินค้าในคลัง · STORE (${liveProducts.length} SKUS)` },
    { key: 'supplements', label: 'สารานุกรมวิทยาศาสตร์ · ENCYCLOPEDIA' },
    { key: 'articles', label: 'บทความโภชนาการ · ARTICLES' },
  ];

  const getActionIcon = (id: string) => {
    if (id === 'act-ai') return <Sparkles className="w-4 h-4 text-primary" />;
    if (id === 'act-calc') return <Calculator className="w-4 h-4 text-textSecondary" />;
    if (id === 'act-compare') return <Scale className="w-4 h-4 text-textSecondary" />;
    if (id === 'act-store') return <Store className="w-4 h-4 text-textSecondary" />;
    return <ShieldAlert className="w-4 h-4 text-textSecondary" />;
  };

  let runningIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-label="ค้นหาด่วนทั้งเว็บไซต์"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/45 backdrop-blur-sm"
          />

          {/* Command Dialog */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-2xl bg-white border border-border shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
          >
            {/* Search Input Header */}
            <div className="px-5 py-4 border-b border-border flex items-center gap-3">
              <Search className="w-4 h-4 text-primary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="ค้นหาสินค้า 34 รายการ, แบรนด์, เลข อย., สารานุกรม หรือบทความ..."
                className="flex-1 bg-transparent text-sm text-textPrimary placeholder:text-textSecondary/70 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-textSecondary hover:text-textPrimary cursor-pointer p-1"
                  aria-label="ล้างคำค้นหา"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2 py-0.5 border border-border bg-secondary text-[10px] font-mono text-textSecondary hover:text-textPrimary cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/70">
              {items.length === 0 ? (
                <div className="py-12 px-6 text-center space-y-3">
                  <p className="text-sm text-textPrimary font-medium">
                    ไม่พบรายการที่ตรงกับ &ldquo;{query}&rdquo;
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      window.dispatchEvent(new CustomEvent('open-fit-ai'));
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-textPrimary text-white hover:bg-primary text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ลองถามผู้ช่วยจัดเซต AI แทน</span>
                  </button>
                </div>
              ) : (
                groups.map((grp) => {
                  const groupItems = items.filter((it) => it.group === grp.key);
                  if (groupItems.length === 0) return null;

                  return (
                    <div key={grp.key} className="py-2.5">
                      <div className="px-5 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary">
                        {grp.label}
                      </div>
                      <div className="px-2 space-y-0.5">
                        {groupItems.map((item) => {
                          runningIndex += 1;
                          const itemIdx = runningIndex;
                          const isActive = itemIdx === clampedActiveIndex;

                          return (
                            <div
                              key={item.id}
                              onMouseEnter={() => setActiveIndex(itemIdx)}
                              onClick={() => executeItem(item)}
                              className={`px-3 py-2.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                                isActive
                                  ? 'bg-secondary border-l-2 border-primary'
                                  : 'border-l-2 border-transparent hover:bg-secondary/60'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {item.imageUrl ? (
                                  <div className="w-9 h-9 bg-white border border-border p-1 shrink-0 flex items-center justify-center">
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-9 h-9 bg-white border border-border shrink-0 flex items-center justify-center">
                                    {item.group === 'actions' ? (
                                      getActionIcon(item.id)
                                    ) : item.group === 'supplements' ? (
                                      <BookOpen className="w-4 h-4 text-primary" />
                                    ) : (
                                      <FileText className="w-4 h-4 text-textSecondary" />
                                    )}
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="text-xs sm:text-[13px] font-semibold text-textPrimary truncate">
                                    {item.title}
                                  </div>
                                  <div className="text-[11px] text-textSecondary truncate">
                                    {item.subtitle}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {typeof item.price === 'number' && (
                                  <span className="font-mono text-xs font-semibold text-textPrimary">
                                    ฿{item.price.toLocaleString()}
                                  </span>
                                )}
                                {item.badge && (
                                  <span className="px-2 py-0.5 text-[10px] font-mono border border-border bg-white text-primary">
                                    {item.badge}
                                  </span>
                                )}
                                {item.product && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (item.product) {
                                        addToCart(item.product, 1);
                                        setIsOpen(false);
                                      }
                                    }}
                                    className="p-1.5 border border-border bg-white text-textPrimary hover:bg-textPrimary hover:text-white transition-colors cursor-pointer"
                                    title="เพิ่มลงตะกร้าทันที"
                                    aria-label={`เพิ่ม ${item.title} ลงตะกร้า`}
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <ArrowRight
                                  className={`w-3.5 h-3.5 transition-transform ${
                                    isActive
                                      ? 'text-primary translate-x-0.5'
                                      : 'text-textSecondary/40'
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Architectural Keyboard Footer */}
            <div className="px-5 py-2.5 border-t border-border bg-secondary/60 flex items-center justify-between text-[10px] font-mono text-textSecondary">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-border text-textPrimary">
                    ↑↓
                  </kbd>
                  เลือก
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-border text-textPrimary inline-flex items-center">
                    <CornerDownLeft className="w-2.5 h-2.5" />
                  </kbd>
                  เปิดหน้า
                </span>
              </div>
              <span className="uppercase tracking-[0.16em] text-primary font-semibold">
                FIT COMMAND · CTRL+K
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
