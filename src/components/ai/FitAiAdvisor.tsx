'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ShoppingBag,
  Check,
  ArrowUpRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { products as fallbackProducts, type Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import TextShimmer from '@/components/ui/TextShimmer';

interface AdvisorMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  evidenceNote?: string;
  recommendedProducts?: Product[];
  supplementLink?: { label: string; href: string };
}

const QUICK_PROMPTS = [
  'งบ 2,000 เพิ่มกล้ามเนื้อ',
  'แพ้นมวัว อยากลีนไขมัน',
  'ซ้อมรอบค่ำ ไม่อยากใจสั่น',
  'คนผอมมาก อยากเพิ่มน้ำหนัก',
  'ปวดข้อต่อ หลับไม่สนิท',
  'ครีเอทีนกินยังไง ปลอดภัยไหม',
];

const INITIAL_MESSAGE: AdvisorMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'สวัสดีครับ ผมคือผู้ช่วยจัดเซตอาหารเสริมอิงหลักฐานทางวิทยาศาสตร์ (AIS / ISSN) บอกเป้าหมาย งบประมาณ หรือข้อจำกัด เช่น แพ้นมวัว ซ้อมตอนค่ำ ได้เลยครับ ผมจะคัดสินค้าแท้ที่มีเลข อย. จากคลัง 34 รายการให้ตรงจุดที่สุด',
  evidenceNote: 'อ้างอิงหลักฐาน AIS Group A & ISSN — อาหารหลักและการพักผ่อนยังคงเป็นพื้นฐานสำคัญที่สุด',
};

function parseBudget(query: string): number | null {
  const normalized = query.replace(/,/g, '');
  const match = normalized.match(/(?:งบ|ไม่เกิน|ต่ำกว่า|ราคาไม่เกิน|budget|under|<)\s*(\d{3,5})/i);
  if (match) return Number(match[1]);
  const bahtMatch = normalized.match(/(\d{3,5})\s*(?:บาท|฿|thb)/i);
  if (bahtMatch) return Number(bahtMatch[1]);
  return null;
}

function buildAdvisorResponse(rawQuery: string, catalog: Product[]): Omit<AdvisorMessage, 'id' | 'role'> {
  const q = rawQuery.toLowerCase().trim();
  const budget = parseBudget(rawQuery);
  const inStockCatalog = catalog.filter(
    (p) => p.inStock && (typeof p.stock !== 'number' || p.stock > 0)
  );
  const pool = inStockCatalog.length > 0 ? inStockCatalog : catalog;

  const filterBudget = (list: Product[]): Product[] => {
    if (!budget) return list;
    const within = list.filter((p) => p.price <= budget);
    return within.length > 0 ? within : list.slice().sort((a, b) => a.price - b.price);
  };

  // 1. Lactose-free / Vegan / Plant / Soy-free
  if (/(แพ้นม|แลคโตส|lactose|วีแกน|vegan|มังสวิรัติ|เจ|โปรตีนพืช|plant|สิว|ถั่วเหลือง|ถั่วลันเตา)/i.test(q)) {
    const soyFree = /(แพ้ถั่วเหลือง|ไม่เอาถั่วเหลือง|ไม่มีถั่วเหลือง|ถั่วลันเตา|pea)/i.test(q);
    const wantsGain = /(เพิ่มน้ำหนัก|ผอม|mass|เกนเนอร์)/i.test(q);

    let candidates = pool.filter((p) => p.category === 'plant-protein');
    if (soyFree) {
      candidates = candidates.filter((p) => p.id === 'prod-baam-iso-pea' || p.id === 'prod-plantae-complete');
    } else if (wantsGain) {
      candidates = candidates.sort((a, b) => (a.id === 'prod-baam-mass-soy' ? -1 : b.id === 'prod-baam-mass-soy' ? 1 : 0));
    } else if (/(ลีน|ลดไขมัน|fat)/i.test(q)) {
      const isoDairyFree = pool.filter(
        (p) => p.id === 'prod-baam-iso-pea' || p.id === 'prod-baam-my-isosoy' || p.id === 'prod-dymatize-iso100'
      );
      candidates = isoDairyFree;
    }

    const picked = filterBudget(candidates).slice(0, 3);
    return {
      text: soyFree
        ? 'สำหรับผู้ที่แพ้ทั้งนมวัวและถั่วเหลือง แนะนำโปรตีนถั่วลันเตาไอโซเลท (Pea Protein Isolate) หรือโปรตีนพืชหลายชนิดครับ ย่อยง่าย ไม่กระตุ้นสิวจากแลคโตส และให้กรดอะมิโนครบถ้วน'
        : 'สำหรับผู้ที่แพ้นมวัวหรือกังวลเรื่องแลคโตส แนะนำกลุ่มโปรตีนพืชไอโซเลท (Soy / Pea / Multi-Plant) หรือ Hydrolyzed Isolate ไร้แลคโตสครับ ให้โปรตีนสูง 25-31g ต่อช้อนโดยไม่ทำให้ท้องอืด',
      evidenceNote: 'ISSN ยืนยันว่าโปรตีนพืชในปริมาณรวมเท่ากัน (1.6-2.2g/กก.) สร้างกล้ามเนื้อได้เทียบเท่าเวย์',
      recommendedProducts: picked,
      supplementLink: { label: 'อ่านสารานุกรมโปรตีน', href: '/supplements/whey-protein' },
    };
  }

  // 2. Evening workout / Stim-free / No caffeine
  if (/(รอบค่ำ|ตอนค่ำ|ตอนเย็น|ตอนดึก|ใจสั่น|คาเฟอีน|stim-free|นอนไม่หลับ|หลับไม่สนิท|พักผ่อน)/i.test(q)) {
    const wantsSleep = /(หลับ|นอน|พักผ่อน|ฟื้นฟู|ข้อต่อ)/i.test(q);
    const wantsPre = /(ซ้อม|แรง|ปั๊ม|พรีเวิร์ก|ใจสั่น|คาเฟอีน|ค่ำ|เย็น)/i.test(q);
    const picked: Product[] = [];

    if (wantsPre) {
      const stimFree = pool.find((p) => p.id === 'prod-evogen-stimfree');
      const intra = pool.find((p) => p.id === 'prod-baam-intra-juice');
      if (stimFree) picked.push(stimFree);
      if (intra) picked.push(intra);
    }
    if (wantsSleep || picked.length < 2) {
      const zma = pool.find((p) => p.id === 'prod-baam-zma');
      const omega = pool.find((p) => p.id === 'prod-vx-omeflame') || pool.find((p) => p.id === 'prod-fw-super-omega3');
      if (zma) picked.push(zma);
      if (wantsSleep && omega) picked.push(omega);
    }

    const finalPicked = filterBudget(picked).slice(0, 3);
    return {
      text: wantsPre
        ? 'ถ้าซ้อมช่วงค่ำหรือไวต่อคาเฟอีน ควรเลี่ยงพรีเวิร์กเอาต์ที่มีคาเฟอีนก่อนนอนอย่างน้อย 6 ชั่วโมงครับ แนะนำสูตร Stim-Free (ไร้คาเฟอีน เน้น L-Citrulline ปั๊มกล้าม) คู่กับ BCAA + เกลือแร่ระหว่างซ้อม หรือเสริม ZMA ก่อนนอนเพื่อช่วยการพักผ่อน'
        : 'สำหรับการฟื้นฟูร่างกายและการนอนหลับลึกหลังซ้อมหนัก แนะนำ ZMA (Zinc + Magnesium + B6) ทานก่อนนอนขณะท้องว่าง คู่กับ Omega-3 เข้มข้นเพื่อลดการอักเสบของกล้ามเนื้อและข้อต่อครับ',
      evidenceNote: 'การนอนหลับ 7-9 ชั่วโมงมีผลต่อการสังเคราะห์กล้ามเนื้อและฮอร์โมนมากกว่าอาหารเสริมทุกชนิด',
      recommendedProducts: finalPicked,
      supplementLink: { label: 'ดูข้อมูลความปลอดภัยและข้อควรระวัง', href: '/safety' },
    };
  }

  // 3. Creatine & Kidney / Dosage / Strength
  if (/(ครีเอทีน|creatine|ไต|ยกหนัก|แรงยก|1rm|พละกำลัง|โหลด)/i.test(q)) {
    const creatines = filterBudget(pool.filter((p) => p.category === 'creatine')).slice(0, 3);
    return {
      text: 'Creatine Monohydrate คืออาหารเสริมที่มีหลักฐานวิจัยแข็งแกร่งที่สุดในโลก (AIS Group A) ทานวันละ 3-5 กรัม เวลาไหนก็ได้ทุกวันอย่างต่อเนื่อง ไม่จำเป็นต้องทำ Loading Phase และงานวิจัยระยะยาวกว่า 30 ปียืนยันว่าปลอดภัยต่อไตในผู้ที่มีสุขภาพไตปกติครับ',
      evidenceNote: 'AIS Group A & ISSN Position Stand — เพิ่มแรงยกและมวลกล้ามเนื้อได้จริงใน 2-4 สัปดาห์',
      recommendedProducts: creatines,
      supplementLink: { label: 'อ่านสารานุกรม Creatine ฉบับเต็ม', href: '/supplements/creatine-monohydrate' },
    };
  }

  // 4. Mass Gainer / Skinny / Hardgainer
  if (/(ผอม|เพิ่มน้ำหนัก|mass|gainer|เกนเนอร์|แคลอรี|bulk)/i.test(q)) {
    const gainers = pool.filter(
      (p) =>
        p.subCategory.toLowerCase().includes('mass') ||
        p.name.toLowerCase().includes('mass')
    );
    const picked = filterBudget(gainers).slice(0, 3);
    return {
      text: 'สำหรับคนผอมที่กินอาหารมื้อหลักได้น้อยและน้ำหนักขึ้นยาก (Hardgainer) แนะนำ Mass Gainer ที่ให้พลังงานและโปรตีนสูงควบคู่กับการฝึกเวทเทรนนิ่งครับ เพื่อให้ได้ภาวะพลังงานเกิน (Caloric Surplus) อย่างสม่ำเสมอ หากแพ้นมวัวสามารถเลือก Baam!! Mass Soy XXXXL ได้เลยครับ',
      evidenceNote: 'แนะนำแบ่งชงครึ่งเสิร์ฟวันละ 2 ครั้งหลังซ้อมและระหว่างมื้อ เพื่อลดอาการอิ่มแน่นท้อง',
      recommendedProducts: picked,
      supplementLink: { label: 'คำนวณโปรตีนเป้าหมายต่อวัน', href: '/calculator/protein' },
    };
  }

  // 5. Fat Loss / Cutting / Lean
  if (/(ลดไขมัน|ลีน|cutting|ไดเอท|ลดความอ้วน|น้ำตาล 0|isolate|ไอโซเลท)/i.test(q)) {
    const isolates = pool.filter(
      (p) =>
        p.goal === 'fat-loss' ||
        p.subCategory.toLowerCase().includes('isolate') ||
        p.name.toLowerCase().includes('iso')
    );
    const picked = filterBudget(isolates).slice(0, 3);
    return {
      text: 'ช่วงลีนลดไขมันหัวใจสำคัญคือการคุมแคลอรีติดลบ (Caloric Deficit) พร้อมรักษาปริมาณโปรตีนให้สูง 1.8-2.2g/กก. เพื่อไม่ให้เสียกล้ามเนื้อ แนะนำเวย์ไอโซเลทหรือโปรตีนพืชไอโซเลทที่น้ำตาล 0g และไขมันต่ำมากครับ',
      evidenceNote: 'โปรตีนสูงช่วยเพิ่มความอิ่มและรักษามวลกล้ามเนื้อระหว่างช่วงลดไขมันได้อย่างมีนัยสำคัญ',
      recommendedProducts: picked,
      supplementLink: { label: 'เปรียบเทียบเวย์แต่ละสูตร', href: '/compare' },
    };
  }

  // 6. Joints / Fish Oil / Omega-3 / Inflammation
  if (/(ข้อต่อ|ปวดข้อ|เข่า|ไหล่|น้ำมันปลา|โอเมก้า|omega|fish oil|อักเสบ)/i.test(q)) {
    const fishOils = filterBudget(pool.filter((p) => p.category === 'fish-oil')).slice(0, 3);
    return {
      text: 'สำหรับอาการปวดล้าข้อต่อจากการยกเวทหนัก แนะนำน้ำมันปลา Omega-3 สูตรเข้มข้นที่เน้น EPA + DHA สูงครับ ช่วยลดการอักเสบเรื้อรัง ดูแลระบบหลอดเลือด และสูตรกลิ่นเลมอนหรือ Enteric-Coated จะช่วยลดกลิ่นคาวปลาไม่ตีขึ้นคอ',
      evidenceNote: 'แนะนำทาน EPA + DHA รวม 1,000-2,000 มก./วัน พร้อมมื้ออาหารที่มีไขมันดี',
      recommendedProducts: fishOils,
      supplementLink: { label: 'ดูน้ำมันปลาโอเมก้า-3 ทั้งหมดในร้าน', href: '/store?category=fish-oil' },
    };
  }

  // 7. Pre-workout / Energy / Endurance / BCAA
  if (/(พรีเวิร์ก|pre-workout|preworkout|ง่วง|หมดแรง|โฟกัส|ปั๊ม|bcaa|ระหว่างซ้อม|อึด|วิ่ง)/i.test(q)) {
    const pres = filterBudget(pool.filter((p) => p.category === 'pre-workout')).slice(0, 3);
    return {
      text: 'หากต้องการความตื่นตัวและแรงยกก่อนเข้ายิม แนะนำพรีเวิร์กเอาต์ที่มี Caffeine + Beta-Alanine + Citrulline ดื่มก่อนซ้อม 20-30 นาที หรือถ้าซ้อมนานเสียเหงื่อมากแนะนำ Intra Juice (BCAA + Electrolytes) จิบระหว่างซ้อมครับ',
      evidenceNote: 'ปริมาณคาเฟอีนที่วิจัยรับรองคือ 3-6 มก./กก. น้ำหนักตัว และไม่ควรเกิน 400 มก./วัน',
      recommendedProducts: pres,
      supplementLink: { label: 'อ่านสารานุกรมคาเฟอีน', href: '/supplements/caffeine' },
    };
  }

  // 8. Vitamins / Zinc / Immunity / Skin
  if (/(วิตามิน|ซิงค์|zinc|zma|ภูมิคุ้มกัน|ผิว|แอสตา|astaxanthin|วิตามินซี)/i.test(q)) {
    const vits = filterBudget(pool.filter((p) => p.category === 'vitamin-zinc')).slice(0, 3);
    return {
      text: 'กลุ่มสารอาหารรอง (Micronutrients) สำคัญมากสำหรับคนที่ซ้อมหนักและพักผ่อนน้อยครับ แนะนำ Zinc + B3 หรือ Blackmores Bio Zinc เสริมภูมิคุ้มกันและผิวพรรณ, Vitamin C 500mg ทานทุกวัน หรือ Astaxanthin + CoQ10 ต้านอนุมูลอิสระระดับเซลล์',
      evidenceNote: 'ควรทานวิตามินรวมและแร่ธาตุพร้อมมื้ออาหารเพื่อเพิ่มการดูดซึมและลดการระคายเคืองกระเพาะ',
      recommendedProducts: vits,
      supplementLink: { label: 'ดูหมวดวิตามินทั้งหมดในร้าน', href: '/store?category=vitamin-zinc' },
    };
  }

  // 9. Direct Brand / Product name lookup
  const directMatches = pool.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.nameTH.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.subCategory.toLowerCase().includes(q)
  );
  if (directMatches.length > 0) {
    const picked = filterBudget(directMatches).slice(0, 3);
    return {
      text: `พบสินค้าตรงกับคำค้นหา "${rawQuery}" ในคลัง FIT SUPPLEMENT ทั้งหมด ${directMatches.length} รายการครับ คัดตัวเด่นที่พร้อมส่งและมีเลข อย. แท้มาให้ด้านล่าง สามารถกดดูรายละเอียดหรือเพิ่มลงตะกร้าได้เลย`,
      evidenceNote: 'สินค้าทุกรายการผ่านการตรวจสอบเลข อย. ไทย 100%',
      recommendedProducts: picked,
      supplementLink: { label: 'ค้นหาเพิ่มเติมในหน้าร้านค้า', href: `/store?q=${encodeURIComponent(rawQuery)}` },
    };
  }

  // 10. Default / Muscle Gain / Beginner / Budget Stack
  const wheyCandidates = pool
    .filter((p) => p.category === 'whey' && !p.subCategory.toLowerCase().includes('mass'))
    .sort((a, b) => a.price - b.price);
  const creatineCandidates = pool
    .filter((p) => p.category === 'creatine')
    .sort((a, b) => a.price - b.price);

  const stack: Product[] = [];
  if (budget) {
    // Try fitting best Whey + Creatine combo within user's exact budget!
    const cheapCreatine = creatineCandidates[0];
    const affordableWhey =
      wheyCandidates.find((w) => w.price + (cheapCreatine?.price || 0) <= budget) ||
      wheyCandidates.find((w) => w.price <= budget);

    if (affordableWhey) stack.push(affordableWhey);
    if (cheapCreatine && (affordableWhey ? affordableWhey.price + cheapCreatine.price <= budget : cheapCreatine.price <= budget)) {
      stack.push(cheapCreatine);
    }
    if (stack.length === 0) {
      const underBudget = pool.filter((p) => p.price <= budget).sort((a, b) => b.price - a.price);
      stack.push(...underBudget.slice(0, 2));
    }
  } else {
    const baamWhey = pool.find((p) => p.id === 'prod-baam-my-whey') || wheyCandidates[0];
    const vxCreatine = pool.find((p) => p.id === 'prod-vx-pure-creatine') || creatineCandidates[0];
    const omega = pool.find((p) => p.id === 'prod-fw-super-omega3');
    if (baamWhey) stack.push(baamWhey);
    if (vxCreatine) stack.push(vxCreatine);
    if (omega) stack.push(omega);
  }

  const stackTotal = stack.reduce((s, p) => s + p.price, 0);

  return {
    text: budget
      ? `จัดเซตสร้างกล้ามเนื้อคุ้มค่าภายในงบ ฿${budget.toLocaleString()} ให้แล้วครับ (ยอดรวมเซต ฿${stackTotal.toLocaleString()}) เน้นตัวที่มีหลักฐานวิทยาศาสตร์รองรับระดับสูงสุดคือ โปรตีนเสริม + ครีเอทีน โมโนไฮเดรต ครับ`
      : 'สำหรับเซตพื้นฐานสร้างกล้ามเนื้อที่คุ้มค่าและอิงหลักฐานวิจัยระดับ AIS Group A แนะนำเริ่มจาก เวย์โปรตีน (เสริมให้ครบ 1.6-2.2g/กก.) คู่กับ ครีเอทีน โมโนไฮเดรต 5g/วัน และเสริมน้ำมันปลาเพื่อดูแลข้อต่อครับ',
    evidenceNote: 'เซตพื้นฐาน Whey + Creatine คือสูตรที่คุ้มค่าและมีงานวิจัยรับรองมากที่สุดในวงการฟิตเนส',
    recommendedProducts: stack.slice(0, 3),
    supplementLink: { label: 'ลองคำนวณโปรตีนเฉพาะตัวคุณ', href: '/calculator/protein' },
  };
}

export default function FitAiAdvisor() {
  const pathname = usePathname();
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [catalog, setCatalog] = useState<Product[]>(fallbackProducts);
  const [messages, setMessages] = useState<AdvisorMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgSeqRef = useRef(1);

  // Hide floating widget on admin / sql backoffice pages so it never blocks tables or modals
  const isBackoffice = pathname.startsWith('/admin') || pathname.startsWith('/sql');

  // Hydrate live 34-product catalog from MySQL once opened
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCatalog(data);
        }
      })
      .catch(() => {
        // fallback already loaded
      });
  }, [isOpen]);

  // Listen for custom open trigger from Command Palette (Ctrl+K)
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-fit-ai', handler);
    return () => window.removeEventListener('open-fit-ai', handler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 180);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isThinking]);

  if (isBackoffice) return null;

  const sendPrompt = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    msgSeqRef.current += 1;
    const userMsg: AdvisorMessage = {
      id: `user-${msgSeqRef.current}`,
      role: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      const reply = buildAdvisorResponse(trimmed, catalog);
      msgSeqRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${msgSeqRef.current}`,
          role: 'assistant',
          ...reply,
        },
      ]);
      setIsThinking(false);
    }, 480);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendPrompt(input);
  };

  const handleQuickAdd = (product: Product) => {
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[420px] h-[590px] max-h-[80vh] bg-white border border-border shadow-2xl flex flex-col overflow-hidden"
            role="dialog"
            aria-label="ผู้ช่วยจัดเซตอาหารเสริมอัจฉริยะ"
          >
            {/* Architectural Minimal Header */}
            <div className="px-5 py-4 border-b border-border bg-white flex items-center justify-between gap-3 shrink-0">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  <span className="text-primary font-semibold">FIT CLINICAL AI</span>
                  <span className="text-border">|</span>
                  <span className="text-textSecondary">{catalog.length} SKUS LIVE</span>
                </div>
                <h2 className="text-sm font-semibold text-textPrimary tracking-tight truncate">
                  ผู้ช่วยจัดเซตอาหารเสริมอัจฉริยะ
                </h2>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
                  title="เริ่มบทสนทนาใหม่"
                  aria-label="เริ่มบทสนทนาใหม่"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
                  aria-label="ปิดหน้าต่างผู้ช่วย"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Message Stream */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-secondary/35"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[92%] px-4 py-3 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-textPrimary text-white'
                        : 'bg-white border border-border text-textPrimary'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {msg.evidenceNote && (
                      <div className="mt-2.5 pt-2 border-t border-border/70 flex items-start gap-1.5 text-[10px] text-textSecondary">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{msg.evidenceNote}</span>
                      </div>
                    )}
                  </div>

                  {/* In-Chat Live Product Recommendation Cards */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="mt-2.5 w-full space-y-2">
                      {msg.recommendedProducts.map((product) => {
                        const isAdded = Boolean(addedIds[product.id]);
                        return (
                          <div
                            key={product.id}
                            className="bg-white border border-border hover:border-primary/50 transition-colors p-3 flex items-center gap-3"
                          >
                            <Link
                              href={`/store/${product.id}`}
                              onClick={() => setIsOpen(false)}
                              className="w-12 h-12 bg-white border border-border p-1 shrink-0 flex items-center justify-center"
                            >
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-contain"
                              />
                            </Link>

                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="text-[10px] font-mono text-primary uppercase tracking-wider truncate">
                                {product.brand}
                              </div>
                              <Link
                                href={`/store/${product.id}`}
                                onClick={() => setIsOpen(false)}
                                className="block text-xs font-semibold text-textPrimary hover:text-primary transition-colors truncate"
                              >
                                {product.name}
                              </Link>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-textSecondary">
                                <span className="font-semibold text-textPrimary text-xs">
                                  ฿{product.price.toLocaleString()}
                                </span>
                                <span>·</span>
                                <span className="truncate">{product.size}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleQuickAdd(product)}
                              className={`shrink-0 px-2.5 py-2 text-[10px] font-medium border transition-colors cursor-pointer inline-flex items-center gap-1 ${
                                isAdded
                                  ? 'border-primary bg-primary text-white'
                                  : 'border-textPrimary bg-textPrimary text-white hover:bg-primary hover:border-primary'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>เพิ่มแล้ว</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3 h-3" />
                                  <span>ใส่ตะกร้า</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {msg.supplementLink && (
                    <Link
                      href={msg.supplementLink.href}
                      onClick={() => setIsOpen(false)}
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{msg.supplementLink.label}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  )}
                </motion.div>
              ))}

              {/* Animated Thinking State */}
              {isThinking && (
                <div className="flex items-start">
                  <div className="bg-white border border-border px-4 py-3 text-xs text-textSecondary flex items-center gap-2.5">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.2s]" />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.1s]" />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    </span>
                    <TextShimmer
                      baseColor="#686660"
                      shimmerColor="#0E0E10"
                      duration={1.5}
                      className="font-mono text-[10px] tracking-wider uppercase font-semibold"
                    >
                      {`กำลังคัดสูตรจากคลัง ${catalog.length} รายการ...`}
                    </TextShimmer>
                  </div>
                </div>
              )}

              {/* Quick Suggestion Chips */}
              {messages.length <= 2 && !isThinking && (
                <div className="pt-2 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-textSecondary block">
                    คำถามยอดนิยม
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => sendPrompt(prompt)}
                        className="px-2.5 py-1.5 text-[11px] bg-white border border-border text-textPrimary hover:border-primary hover:text-primary transition-colors cursor-pointer text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Minimal Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-border bg-white flex items-center gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="พิมพ์เป้าหมาย งบ หรือข้อจำกัด เช่น แพ้นม งบ 1500..."
                className="flex-1 bg-secondary border border-border px-3 py-2 text-xs text-textPrimary placeholder:text-textSecondary/70 focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className="px-3.5 py-2 bg-textPrimary text-white hover:bg-primary disabled:opacity-40 transition-colors cursor-pointer shrink-0 inline-flex items-center justify-center"
                aria-label="ส่งข้อความ"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Minimal Luxury Launcher Pill */}
      <motion.button
        type="button"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'ปิดผู้ช่วยจัดเซต AI' : 'เปิดผู้ช่วยจัดเซต AI'}
        className={`h-11 px-4 border shadow-xl flex items-center gap-2.5 text-xs font-medium transition-colors cursor-pointer ${
          isOpen
            ? 'bg-white text-textPrimary border-border hover:border-textPrimary'
            : 'bg-textPrimary text-white border-textPrimary hover:bg-primary hover:border-primary'
        }`}
      >
        {isOpen ? (
          <>
            <X className="w-4 h-4" />
            <span>ปิดผู้ช่วย</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ผู้ช่วยจัดเซต AI</span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-80" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
          </>
        )}
      </motion.button>
    </div>
  );
}
