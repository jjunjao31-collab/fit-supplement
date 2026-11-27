'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
  RefreshCw,
  Clock,
  Layers,
  PackageCheck,
  Sparkles,
} from 'lucide-react';
import SlidingNumber from '@/components/ui/SlidingNumber';
import FluidSwitch from '@/components/ui/FluidSwitch';
import SegmentedControl from '@/components/ui/SegmentedControl';

export interface AnalyticsProduct {
  id: string;
  name: string;
  nameTH: string;
  brand: string;
  category: string;
  subCategory?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  detail?: string;
  suitableFor?: string;
  fdaNumber: string;
  inStock: boolean;
  imageUrl?: string;
}

export interface AnalyticsOrderItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
}

export interface AnalyticsOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: AnalyticsOrderItem[];
  totalAmount: number;
  status: string;
  createdAt?: string;
}

interface AdminAnalyticsSuiteProps {
  products: AnalyticsProduct[];
  orders: AnalyticsOrder[];
  canRestock: boolean;
  onQuickRestock: (product: AnalyticsProduct, addAmount: number) => Promise<void>;
  onJumpToOrders: () => void;
  onJumpToProducts: () => void;
}

interface CustomTooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string;
  payload?: Record<string, unknown>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayloadItem[];
  label?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  whey: 'เวย์โปรตีน',
  'plant-protein': 'โปรตีนพืช',
  creatine: 'ครีเอทีน',
  'pre-workout': 'พรีเวิร์กเอาต์',
  'vitamin-zinc': 'วิตามิน & ซิงค์',
  'fish-oil': 'น้ำมันปลา',
};

const STATUS_META: Record<string, { label: string; color: string; pillClass: string }> = {
  completed: {
    label: 'จัดส่งสำเร็จ',
    color: '#0E0E10',
    pillClass: 'border-textPrimary/30 bg-textPrimary text-white',
  },
  paid: {
    label: 'ชำระเงินแล้ว',
    color: '#9A6E1C',
    pillClass: 'border-primary/40 bg-primary/10 text-primary-dark',
  },
  shipping: {
    label: 'กำลังจัดส่ง',
    color: '#C8A252',
    pillClass: 'border-amber-400/50 bg-amber-50 text-amber-800',
  },
  pending: {
    label: 'รอชำระเงิน',
    color: '#8C887E',
    pillClass: 'border-border bg-secondary text-textSecondary',
  },
  cancelled: {
    label: 'ยกเลิก',
    color: '#B91C1C',
    pillClass: 'border-red-200 bg-red-50 text-red-700',
  },
};

const EDITORIAL_PALETTE = [
  '#9A6E1C',
  '#0E0E10',
  '#C8A252',
  '#686660',
  '#B89E68',
  '#A8A29E',
];

const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function parseOrderDate(raw?: string): Date | null {
  if (!raw) return null;
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatShortThaiDate(d: Date): string {
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]}`;
}

function formatRelativeThaiTime(raw?: string): string {
  const d = parseOrderDate(raw);
  if (!d) return 'ล่าสุด';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} · ${hh}:${mm}`;
}

function MiniSparkline({
  values,
  stroke = '#9A6E1C',
}: {
  values: number[];
  stroke?: string;
}) {
  const points = useMemo(() => {
    const safe = values.length >= 2 ? values : [0, values[0] || 1, values[0] || 1];
    const min = Math.min(...safe);
    const max = Math.max(...safe);
    const span = max - min || 1;
    const width = 92;
    const height = 28;
    const pad = 3;
    return safe.map((v, i) => {
      const x = pad + (i / (safe.length - 1)) * (width - pad * 2);
      const y = height - pad - ((v - min) / span) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
  }, [values]);

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L 89,28 L 3,28 Z`;

  return (
    <svg
      viewBox="0 0 92 28"
      className="w-[92px] h-7 overflow-visible shrink-0"
      aria-hidden="true"
    >
      <path d={areaD} fill={stroke} fillOpacity={0.08} />
      <path
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RevenueTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload as
    | { revenue?: number; orders?: number; avgOrder?: number }
    | undefined;
  const revenue = Number(point?.revenue ?? 0);
  const ordersCount = Number(point?.orders ?? 0);
  const avg = ordersCount > 0 ? Math.round(revenue / ordersCount) : 0;

  return (
    <div className="bg-white/95 backdrop-blur-md border border-border shadow-xl px-4 py-3 text-xs min-w-[180px] space-y-2">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary">
          {label}
        </span>
        <span className="font-mono text-[10px] text-primary font-semibold">
          {ordersCount} ออเดอร์
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-textSecondary text-[11px]">ยอดขายรวม</span>
        <span className="font-mono font-semibold text-sm text-textPrimary">
          ฿{revenue.toLocaleString()}
        </span>
      </div>
      {ordersCount > 0 && (
        <div className="flex items-baseline justify-between gap-4 text-[11px]">
          <span className="text-textSecondary">เฉลี่ยต่อบิล</span>
          <span className="font-mono text-textPrimary">฿{avg.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

function RankingTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0]?.payload as
    | { fullName?: string; value?: number; secondary?: string }
    | undefined;
  if (!item) return null;

  return (
    <div className="bg-white/95 backdrop-blur-md border border-border shadow-xl px-3.5 py-2.5 text-xs max-w-[240px] space-y-1">
      <div className="font-semibold text-textPrimary leading-snug">{item.fullName}</div>
      <div className="flex items-center justify-between gap-4 pt-1 border-t border-border/70">
        <span className="font-mono font-semibold text-primary">
          ฿{Number(item.value ?? 0).toLocaleString()}
        </span>
        {item.secondary && (
          <span className="font-mono text-[10px] text-textSecondary">{item.secondary}</span>
        )}
      </div>
    </div>
  );
}

export function AdminKpiStrip({
  products,
  orders,
}: {
  products: AnalyticsProduct[];
  orders: AnalyticsOrder[];
}) {
  const stats = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const avgOrderValue =
      validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
    const inventoryValue = products.reduce(
      (s, p) => s + (Number(p.price) || 0) * Math.max(0, Number(p.stock) || 0),
      0
    );
    const totalUnits = products.reduce((s, p) => s + Math.max(0, Number(p.stock) || 0), 0);
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 15).length;
    const outOfStockCount = products.filter((p) => !p.inStock || p.stock <= 0).length;
    const uniqueBrands = new Set(products.map((p) => p.brand)).size;

    // Sparkline arrays derived directly from sorted live MySQL orders & category stocks
    const chronoOrders = [...validOrders].sort((a, b) => {
      const da = parseOrderDate(a.createdAt)?.getTime() ?? 0;
      const db = parseOrderDate(b.createdAt)?.getTime() ?? 0;
      return da - db;
    });
    const revSpark = chronoOrders.slice(-8).map((o) => o.totalAmount);
    const ordSpark = chronoOrders.slice(-8).map((o) =>
      (o.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0)
    );
    const invSpark = products.slice(0, 8).map((p) => p.price * Math.max(1, p.stock));
    const stockSpark = products
      .slice()
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 8)
      .map((p) => p.stock);

    return {
      totalRevenue,
      avgOrderValue,
      totalOrders: orders.length,
      paidOrDone: orders.filter((o) => o.status === 'paid' || o.status === 'completed' || o.status === 'shipping').length,
      inventoryValue,
      totalUnits,
      lowStockCount,
      outOfStockCount,
      uniqueBrands,
      revSpark,
      ordSpark,
      invSpark,
      stockSpark,
    };
  }, [products, orders]);

  return (
    <div className="border border-border bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
      {/* KPI 1: Total Revenue */}
      <div className="p-6 flex flex-col justify-between gap-4 hover:bg-secondary/40 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold block">
              TOTAL REVENUE
            </span>
            <div className="text-2xl sm:text-3xl font-light font-mono text-textPrimary tracking-tight">
              ฿<SlidingNumber value={stats.totalRevenue} />
            </div>
          </div>
          <MiniSparkline values={stats.revSpark} stroke="#9A6E1C" />
        </div>
        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/60">
          <span className="text-textSecondary">เฉลี่ย ฿{stats.avgOrderValue.toLocaleString()} / บิล</span>
          <span className="inline-flex items-center gap-0.5 font-mono text-[10px] text-primary font-semibold">
            <TrendingUp className="w-3 h-3" />
            LIVE SQL
          </span>
        </div>
      </div>

      {/* KPI 2: Orders Volume */}
      <div className="p-6 flex flex-col justify-between gap-4 hover:bg-secondary/40 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-textSecondary block">
              ORDERS PIPELINE
            </span>
            <div className="text-2xl sm:text-3xl font-light font-mono text-textPrimary tracking-tight">
              <SlidingNumber value={stats.totalOrders} />
            </div>
          </div>
          <MiniSparkline values={stats.ordSpark} stroke="#0E0E10" />
        </div>
        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/60">
          <span className="text-textSecondary">ชำระ/จัดส่งแล้ว {stats.paidOrDone} บิล</span>
          <span className="font-mono text-[10px] text-textPrimary font-semibold">
            {stats.totalOrders > 0 ? Math.round((stats.paidOrDone / stats.totalOrders) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* KPI 3: Inventory Value */}
      <div className="p-6 flex flex-col justify-between gap-4 hover:bg-secondary/40 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-textSecondary block">
              INVENTORY VALUE
            </span>
            <div className="text-2xl sm:text-3xl font-light font-mono text-textPrimary tracking-tight">
              ฿<SlidingNumber value={stats.inventoryValue} />
            </div>
          </div>
          <MiniSparkline values={stats.invSpark} stroke="#C8A252" />
        </div>
        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/60">
          <span className="text-textSecondary">
            {products.length} รายการ · {stats.uniqueBrands} แบรนด์
          </span>
          <span className="font-mono text-[10px] text-textSecondary">
            {stats.totalUnits.toLocaleString()} ชิ้น
          </span>
        </div>
      </div>

      {/* KPI 4: Stock Health */}
      <div className="p-6 flex flex-col justify-between gap-4 hover:bg-secondary/40 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-textSecondary block">
              STOCK ALERTS
            </span>
            <div
              className={`text-2xl sm:text-3xl font-light font-mono tracking-tight ${
                stats.outOfStockCount > 0
                  ? 'text-red-600'
                  : stats.lowStockCount > 0
                  ? 'text-primary'
                  : 'text-textPrimary'
              }`}
            >
              <SlidingNumber value={stats.lowStockCount + stats.outOfStockCount} />
            </div>
          </div>
          <MiniSparkline
            values={stats.stockSpark}
            stroke={stats.outOfStockCount > 0 ? '#B91C1C' : '#9A6E1C'}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/60">
          <span className="text-textSecondary">
            {stats.outOfStockCount > 0
              ? `หมดคลัง ${stats.outOfStockCount} · ใกล้หมด ${stats.lowStockCount}`
              : stats.lowStockCount > 0
              ? `ใกล้หมดสต็อก (≤15 ชิ้น) ${stats.lowStockCount} รายการ`
              : 'คลังสินค้าพร้อมส่งครบทุกรายการ'}
          </span>
          <span className="font-mono text-[10px] text-primary font-semibold">RADAR</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsSuite({
  products,
  orders,
  canRestock,
  onQuickRestock,
  onJumpToOrders,
  onJumpToProducts,
}: AdminAnalyticsSuiteProps) {
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showOrderOverlay, setShowOrderOverlay] = useState(true);
  const [donutMode, setDonutMode] = useState<'status' | 'category'>('status');
  const [activeDonutIdx, setActiveDonutIdx] = useState<number | null>(null);
  const [barMode, setBarMode] = useState<'top-products' | 'category-value' | 'brands'>('top-products');
  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(null);
  const [restockingId, setRestockingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Anchor timeline to latest order date in MySQL (deterministic for Next.js 16 prerender — never calls new Date() during render)
  const latestOrderDate = useMemo(() => {
    let maxMs = 0;
    for (const o of orders) {
      const d = parseOrderDate(o.createdAt);
      if (d && d.getTime() > maxMs) maxMs = d.getTime();
    }
    return maxMs > 0 ? new Date(maxMs) : null;
  }, [orders]);

  // 1. Revenue & Orders Area Chart Series
  const trendData = useMemo(() => {
    if (!latestOrderDate) return [];
    const activeOrders = orders.filter((o) => o.status !== 'cancelled');

    if (timeframe === 'daily') {
      const days: Array<{ key: string; label: string; revenue: number; orders: number }> = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(latestOrderDate);
        d.setDate(d.getDate() - i);
        days.push({
          key: formatDateKey(d),
          label: formatShortThaiDate(d),
          revenue: 0,
          orders: 0,
        });
      }
      const map = new Map(days.map((x) => [x.key, x]));
      for (const o of activeOrders) {
        const d = parseOrderDate(o.createdAt);
        if (!d) continue;
        const bucket = map.get(formatDateKey(d));
        if (bucket) {
          bucket.revenue += o.totalAmount || 0;
          bucket.orders += 1;
        }
      }
      return days;
    }

    if (timeframe === 'weekly') {
      const weeks: Array<{ label: string; startMs: number; endMs: number; revenue: number; orders: number }> = [];
      for (let w = 3; w >= 0; w--) {
        const end = new Date(latestOrderDate);
        end.setHours(23, 59, 59, 999);
        end.setDate(end.getDate() - w * 7);
        const start = new Date(end);
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - 6);
        weeks.push({
          label: `${start.getDate()}-${end.getDate()} ${THAI_MONTHS[end.getMonth()]}`,
          startMs: start.getTime(),
          endMs: end.getTime(),
          revenue: 0,
          orders: 0,
        });
      }
      for (const o of activeOrders) {
        const d = parseOrderDate(o.createdAt);
        if (!d) continue;
        const ms = d.getTime();
        for (const wk of weeks) {
          if (ms >= wk.startMs && ms <= wk.endMs) {
            wk.revenue += o.totalAmount || 0;
            wk.orders += 1;
            break;
          }
        }
      }
      return weeks.map(({ label, revenue, orders: count }) => ({ label, revenue, orders: count }));
    }

    // Monthly (last 6 months ending at latestOrderDate)
    const months: Array<{ key: string; label: string; revenue: number; orders: number }> = [];
    for (let m = 5; m >= 0; m--) {
      const d = new Date(latestOrderDate.getFullYear(), latestOrderDate.getMonth() - m, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        key,
        label: `${THAI_MONTHS[d.getMonth()]} ${String(d.getFullYear() + 543).slice(-2)}`,
        revenue: 0,
        orders: 0,
      });
    }
    const map = new Map(months.map((x) => [x.key, x]));
    for (const o of activeOrders) {
      const d = parseOrderDate(o.createdAt);
      if (!d) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const bucket = map.get(key);
      if (bucket) {
        bucket.revenue += o.totalAmount || 0;
        bucket.orders += 1;
      }
    }
    return months;
  }, [orders, timeframe, latestOrderDate]);

  const trendSummary = useMemo(() => {
    const periodRevenue = trendData.reduce((s, d) => s + d.revenue, 0);
    const periodOrders = trendData.reduce((s, d) => s + d.orders, 0);
    const peakPoint = trendData.reduce(
      (best, cur) => (cur.revenue > best.revenue ? cur : best),
      trendData[0] || { label: '-', revenue: 0, orders: 0 }
    );
    return { periodRevenue, periodOrders, peakPoint };
  }, [trendData]);

  // 2. Donut Chart Data (Order Status vs Category Share)
  const donutData = useMemo(() => {
    if (donutMode === 'status') {
      const counts = new Map<string, { count: number; amount: number }>();
      for (const o of orders) {
        const key = o.status || 'pending';
        const cur = counts.get(key) || { count: 0, amount: 0 };
        cur.count += 1;
        cur.amount += o.totalAmount || 0;
        counts.set(key, cur);
      }
      return Array.from(counts.entries())
        .map(([key, val]) => ({
          key,
          name: STATUS_META[key]?.label || key,
          value: val.count,
          subValue: `฿${val.amount.toLocaleString()}`,
          color: STATUS_META[key]?.color || '#686660',
        }))
        .sort((a, b) => b.value - a.value);
    }

    const catMap = new Map<string, { count: number; units: number }>();
    for (const p of products) {
      const key = p.category || 'whey';
      const cur = catMap.get(key) || { count: 0, units: 0 };
      cur.count += 1;
      cur.units += Math.max(0, p.stock || 0);
      catMap.set(key, cur);
    }
    return Array.from(catMap.entries())
      .map(([key, val], idx) => ({
        key,
        name: CATEGORY_LABELS[key] || key,
        value: val.count,
        subValue: `${val.units.toLocaleString()} ชิ้น`,
        color: EDITORIAL_PALETTE[idx % EDITORIAL_PALETTE.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [donutMode, orders, products]);

  const donutTotal = useMemo(
    () => donutData.reduce((s, d) => s + d.value, 0),
    [donutData]
  );

  const activeDonutItem =
    activeDonutIdx !== null && donutData[activeDonutIdx]
      ? donutData[activeDonutIdx]
      : null;

  // 3. Bar Chart Data (Top Selling Products / Category Inventory Value / Brand Value)
  const rankingData = useMemo(() => {
    if (barMode === 'top-products') {
      const map = new Map<string, { fullName: string; revenue: number; qty: number }>();
      for (const o of orders) {
        if (o.status === 'cancelled') continue;
        for (const item of o.items || []) {
          const key = item.name.trim();
          const cur = map.get(key) || { fullName: key, revenue: 0, qty: 0 };
          cur.revenue += (Number(item.price) || 0) * (Number(item.quantity) || 1);
          cur.qty += Number(item.quantity) || 1;
          map.set(key, cur);
        }
      }
      return Array.from(map.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6)
        .map((row) => ({
          shortLabel:
            row.fullName.length > 22 ? `${row.fullName.slice(0, 22)}...` : row.fullName,
          fullName: row.fullName,
          value: row.revenue,
          secondary: `ขายแล้ว ${row.qty} ชิ้น`,
        }));
    }

    if (barMode === 'category-value') {
      const map = new Map<string, { fullName: string; value: number; skus: number }>();
      for (const p of products) {
        const label = CATEGORY_LABELS[p.category] || p.category;
        const cur = map.get(label) || { fullName: label, value: 0, skus: 0 };
        cur.value += (Number(p.price) || 0) * Math.max(0, Number(p.stock) || 0);
        cur.skus += 1;
        map.set(label, cur);
      }
      return Array.from(map.values())
        .sort((a, b) => b.value - a.value)
        .map((row) => ({
          shortLabel: row.fullName,
          fullName: row.fullName,
          value: row.value,
          secondary: `${row.skus} รายการ`,
        }));
    }

    // Top 6 Brands by inventory value
    const map = new Map<string, { fullName: string; value: number; skus: number }>();
    for (const p of products) {
      const brand = p.brand || 'อื่นๆ';
      const cur = map.get(brand) || { fullName: brand, value: 0, skus: 0 };
      cur.value += (Number(p.price) || 0) * Math.max(0, Number(p.stock) || 0);
      cur.skus += 1;
      map.set(brand, cur);
    }
    return Array.from(map.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map((row) => ({
        shortLabel: row.fullName.replace(' (Fitwhey)', ''),
        fullName: row.fullName,
        value: row.value,
        secondary: `${row.skus} รายการ`,
      }));
  }, [barMode, orders, products]);

  // 4. Low Stock Radar & Recent Activity
  const lowStockProducts = useMemo(
    () =>
      products
        .filter((p) => !p.inStock || p.stock <= 15)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5),
    [products]
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => {
          const da = parseOrderDate(a.createdAt)?.getTime() ?? 0;
          const db = parseOrderDate(b.createdAt)?.getTime() ?? 0;
          return db - da;
        })
        .slice(0, 5),
    [orders]
  );

  const handleQuickRestockClick = async (product: AnalyticsProduct) => {
    setRestockingId(product.id);
    try {
      await onQuickRestock(product, 30);
    } finally {
      setRestockingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ROW 1: 8-COL REVENUE AREA CHART + 4-COL INTERACTIVE DONUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 01 / REVENUE & ORDERS AREA CHART */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-8 border border-border bg-white p-6 sm:p-7 flex flex-col justify-between gap-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/80 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em]">
                <span className="text-primary font-semibold">01 / REVENUE TRAJECTORY</span>
                <span className="text-border">|</span>
                <span className="text-textSecondary">AREA &amp; TREND</span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-textPrimary tracking-tight">
                แนวโน้มยอดขายและจำนวนคำสั่งซื้อ
              </h2>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-1 text-xs">
                <span className="text-textSecondary">
                  รวมช่วงเวลานี้:{' '}
                  <strong className="font-mono text-textPrimary font-semibold">
                    ฿{trendSummary.periodRevenue.toLocaleString()}
                  </strong>
                </span>
                <span className="text-textSecondary">
                  ออเดอร์:{' '}
                  <strong className="font-mono text-textPrimary font-semibold">
                    {trendSummary.periodOrders} บิล
                  </strong>
                </span>
                <span className="text-textSecondary">
                  จุดสูงสุด:{' '}
                  <strong className="font-mono text-primary font-semibold">
                    {trendSummary.peakPoint.label} (฿{trendSummary.peakPoint.revenue.toLocaleString()})
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex border border-border bg-secondary p-0.5 text-[11px]">
                {(
                  [
                    { id: 'daily', label: '7 วัน' },
                    { id: 'weekly', label: '4 สัปดาห์' },
                    { id: 'monthly', label: '6 เดือน' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTimeframe(item.id)}
                    className={`relative px-3 py-1 font-medium transition-colors cursor-pointer ${
                      timeframe === item.id
                        ? 'text-white'
                        : 'text-textSecondary hover:text-textPrimary'
                    }`}
                  >
                    {timeframe === item.id && (
                      <motion.span
                        layoutId="analytics-timeframe-pill"
                        transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                        className="absolute inset-0 bg-textPrimary"
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </button>
                ))}
              </div>

              <FluidSwitch
                checked={showOrderOverlay}
                onChange={setShowOrderOverlay}
                label="เส้นออเดอร์"
                tone="obsidian"
                size="sm"
              />
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-[275px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={trendData}
                  margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fitGoldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9A6E1C" stopOpacity={0.28} />
                      <stop offset="70%" stopColor="#9A6E1C" stopOpacity={0.05} />
                      <stop offset="100%" stopColor="#9A6E1C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="#EAE7E0"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={{ stroke: '#EAE7E0' }}
                    tickLine={false}
                    tick={{ fill: '#686660', fontSize: 11 }}
                    dy={8}
                  />
                  <YAxis
                    yAxisId="rev"
                    axisLine={false}
                    tickLine={false}
                    width={54}
                    tick={{ fill: '#686660', fontSize: 11 }}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `฿${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `฿${v}`
                    }
                  />
                  {showOrderOverlay && (
                    <YAxis
                      yAxisId="ord"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      width={28}
                      allowDecimals={false}
                      tick={{ fill: '#0E0E10', fontSize: 10 }}
                    />
                  )}
                  <Tooltip
                    content={<RevenueTooltip />}
                    cursor={{ stroke: '#9A6E1C', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area
                    yAxisId="rev"
                    type="monotone"
                    dataKey="revenue"
                    name="ยอดขาย"
                    stroke="#9A6E1C"
                    strokeWidth={2.2}
                    fill="url(#fitGoldAreaGrad)"
                    activeDot={{
                      r: 5,
                      fill: '#9A6E1C',
                      stroke: '#FFFFFF',
                      strokeWidth: 2,
                    }}
                    animationDuration={650}
                  />
                  {showOrderOverlay && (
                    <Line
                      yAxisId="ord"
                      type="monotone"
                      dataKey="orders"
                      name="จำนวนออเดอร์"
                      stroke="#0E0E10"
                      strokeWidth={1.6}
                      strokeDasharray="4 3"
                      dot={{ r: 3, fill: '#FFFFFF', stroke: '#0E0E10', strokeWidth: 1.5 }}
                      activeDot={{ r: 5, fill: '#0E0E10', stroke: '#FFFFFF', strokeWidth: 2 }}
                      animationDuration={750}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-secondary/40 animate-pulse border border-border/50" />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60 text-[11px] text-textSecondary">
            <div className="flex items-center gap-5">
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-0.5 bg-primary inline-block" />
                ยอดขายรวม (บาท)
              </span>
              {showOrderOverlay && (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 border-t border-dashed border-textPrimary inline-block" />
                  จำนวนคำสั่งซื้อ (บิล)
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
              MYSQL LIVE AGGREGATION
            </span>
          </div>
        </motion.section>

        {/* 02 / INTERACTIVE PADDED DONUT CHART */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-4 border border-border bg-white p-6 sm:p-7 flex flex-col justify-between gap-5"
        >
          <div className="space-y-3 border-b border-border/80 pb-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                02 / DISTRIBUTION
              </span>
              <SegmentedControl
                layoutId="analytics-donut-mode"
                variant="sharp"
                size="xs"
                ariaLabel="เลือกข้อมูลกราฟโดนัท"
                options={[
                  { id: 'status', label: 'สถานะบิล' },
                  { id: 'category', label: 'หมวดคลัง' },
                ]}
                value={donutMode}
                onChange={(val) => {
                  setDonutMode(val);
                  setActiveDonutIdx(null);
                }}
              />
            </div>
            <h2 className="text-lg font-semibold text-textPrimary tracking-tight">
              {donutMode === 'status' ? 'สัดส่วนสถานะคำสั่งซื้อ' : 'สัดส่วนหมวดหมู่สินค้า'}
            </h2>
          </div>

          {/* Donut + Center Dynamic Readout */}
          <div className="relative h-[200px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="64%"
                    outerRadius="88%"
                    paddingAngle={4}
                    cornerRadius={2}
                    stroke="none"
                    onMouseEnter={(_, idx) => setActiveDonutIdx(idx)}
                    onMouseLeave={() => setActiveDonutIdx(null)}
                    animationDuration={650}
                  >
                    {donutData.map((entry, idx) => (
                      <Cell
                        key={entry.key}
                        fill={entry.color}
                        fillOpacity={
                          activeDonutIdx === null || activeDonutIdx === idx ? 1 : 0.25
                        }
                        style={{
                          transition: 'fill-opacity 220ms ease, transform 220ms ease',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-secondary/40 animate-pulse" />
            )}

            {/* Dynamic Center Hub */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDonutItem ? activeDonutItem.key : `total-${donutMode}`}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.16 }}
                  className="space-y-0.5"
                >
                  <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-textSecondary truncate max-w-[110px]">
                    {activeDonutItem
                      ? activeDonutItem.name
                      : donutMode === 'status'
                      ? 'ALL ORDERS'
                      : 'CATALOG SKUS'}
                  </div>
                  <div className="text-2xl font-light font-mono text-textPrimary">
                    {activeDonutItem
                      ? `${donutTotal > 0 ? Math.round((activeDonutItem.value / donutTotal) * 100) : 0}%`
                      : donutTotal}
                  </div>
                  <div className="text-[10px] font-mono text-primary font-semibold">
                    {activeDonutItem
                      ? `${activeDonutItem.value} · ${activeDonutItem.subValue}`
                      : donutMode === 'status'
                      ? 'บิลทั้งหมด'
                      : 'รายการในคลัง'}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Interactive Hairline Legend */}
          <div className="divide-y divide-border/70 border-t border-border/70">
            {donutData.map((item, idx) => {
              const pct = donutTotal > 0 ? Math.round((item.value / donutTotal) * 100) : 0;
              const isHighlighted = activeDonutIdx === idx;
              return (
                <div
                  key={item.key}
                  onMouseEnter={() => setActiveDonutIdx(idx)}
                  onMouseLeave={() => setActiveDonutIdx(null)}
                  className={`py-2 flex items-center justify-between gap-2 text-xs transition-colors cursor-default ${
                    isHighlighted ? 'bg-secondary/70 px-2 -mx-2' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-textPrimary font-medium truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 font-mono text-[11px]">
                    <span className="text-textSecondary">{item.subValue}</span>
                    <span className="font-semibold text-textPrimary w-9 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      </div>

      {/* ROW 2: 7-COL PERFORMANCE RANKING BAR CHART + 5-COL LIVE OPERATIONS RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 03 / REVENUE & INVENTORY RANKING BAR CHART */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 border border-border bg-white p-6 sm:p-7 flex flex-col justify-between gap-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em]">
                <span className="text-primary font-semibold">03 / PERFORMANCE LEADERBOARD</span>
                <span className="text-border">|</span>
                <span className="text-textSecondary">BAR ANALYTICS</span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-textPrimary tracking-tight">
                {barMode === 'top-products'
                  ? 'อันดับสินค้าขายดีสูงสุด (ยอดขายจริง)'
                  : barMode === 'category-value'
                  ? 'มูลค่าคลังสินค้าแยกตามหมวดหมู่'
                  : 'มูลค่าคลังสินค้าแยกตามแบรนด์ (Top 6)'}
              </h2>
            </div>

            <div className="inline-flex border border-border bg-secondary p-0.5 text-[11px] self-start sm:self-auto">
              {(
                [
                  { id: 'top-products', label: 'สินค้าขายดี' },
                  { id: 'category-value', label: 'หมวดหมู่' },
                  { id: 'brands', label: 'แบรนด์' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setBarMode(tab.id);
                    setHoveredBarIdx(null);
                  }}
                  className={`relative px-3 py-1 font-medium transition-colors cursor-pointer ${
                    barMode === tab.id
                      ? 'text-white'
                      : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  {barMode === tab.id && (
                    <motion.span
                      layoutId="analytics-barmode-pill"
                      transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                      className="absolute inset-0 bg-textPrimary"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                {barMode === 'top-products' ? (
                  <BarChart
                    data={rankingData}
                    layout="vertical"
                    margin={{ top: 4, right: 20, left: 6, bottom: 4 }}
                  >
                    <CartesianGrid
                      stroke="#EAE7E0"
                      strokeDasharray="3 3"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#686660', fontSize: 11 }}
                      tickFormatter={(v: number) =>
                        v >= 1000 ? `฿${(v / 1000).toFixed(0)}k` : `฿${v}`
                      }
                    />
                    <YAxis
                      type="category"
                      dataKey="shortLabel"
                      width={158}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#0E0E10', fontSize: 11 }}
                    />
                    <Tooltip
                      content={<RankingTooltip />}
                      cursor={{ fill: '#F8F7F4' }}
                    />
                    <Bar
                      dataKey="value"
                      barSize={22}
                      radius={[0, 3, 3, 0]}
                      onMouseEnter={(_, idx) => setHoveredBarIdx(idx)}
                      onMouseLeave={() => setHoveredBarIdx(null)}
                      animationDuration={650}
                    >
                      {rankingData.map((entry, idx) => (
                        <Cell
                          key={entry.fullName}
                          fill={idx === 0 ? '#9A6E1C' : '#0E0E10'}
                          fillOpacity={
                            hoveredBarIdx === null || hoveredBarIdx === idx
                              ? idx === 0
                                ? 1
                                : 0.85
                              : 0.25
                          }
                          style={{ transition: 'fill-opacity 200ms ease', cursor: 'pointer' }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <BarChart
                    data={rankingData}
                    margin={{ top: 10, right: 12, left: 4, bottom: 10 }}
                  >
                    <CartesianGrid
                      stroke="#EAE7E0"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="shortLabel"
                      axisLine={{ stroke: '#EAE7E0' }}
                      tickLine={false}
                      tick={{ fill: '#686660', fontSize: 11 }}
                      interval={0}
                      dy={6}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={56}
                      tick={{ fill: '#686660', fontSize: 11 }}
                      tickFormatter={(v: number) =>
                        v >= 1000000
                          ? `฿${(v / 1000000).toFixed(1)}M`
                          : v >= 1000
                          ? `฿${(v / 1000).toFixed(0)}k`
                          : `฿${v}`
                      }
                    />
                    <Tooltip
                      content={<RankingTooltip />}
                      cursor={{ fill: '#F8F7F4' }}
                    />
                    <Bar
                      dataKey="value"
                      barSize={36}
                      radius={[3, 3, 0, 0]}
                      onMouseEnter={(_, idx) => setHoveredBarIdx(idx)}
                      onMouseLeave={() => setHoveredBarIdx(null)}
                      animationDuration={650}
                    >
                      {rankingData.map((entry, idx) => (
                        <Cell
                          key={entry.fullName}
                          fill={idx === 0 ? '#9A6E1C' : idx === 1 ? '#C8A252' : '#0E0E10'}
                          fillOpacity={
                            hoveredBarIdx === null || hoveredBarIdx === idx ? 0.92 : 0.25
                          }
                          style={{ transition: 'fill-opacity 200ms ease', cursor: 'pointer' }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-secondary/40 animate-pulse" />
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[11px] text-textSecondary">
            <span className="inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              อันดับ 1 ไฮไลต์สีทอง · ชี้เมาส์เพื่อดูรายละเอียด
            </span>
            <button
              type="button"
              onClick={onJumpToProducts}
              className="inline-flex items-center gap-1 text-textPrimary hover:text-primary font-medium transition-colors cursor-pointer"
            >
              <span>จัดการคลังทั้งหมด</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.section>

        {/* 04 / LOW STOCK RADAR + RECENT ORDER ACTIVITY FEED */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 border border-border bg-white divide-y divide-border flex flex-col justify-between"
        >
          {/* TOP HALF: LOW STOCK RADAR */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold block">
                  04 / LOW STOCK RADAR
                </span>
                <h3 className="text-base font-semibold text-textPrimary tracking-tight">
                  แจ้งเตือนสินค้าใกล้หมดคลัง
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 text-[10px] font-mono font-semibold border ${
                  lowStockProducts.length > 0
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-primary/30 bg-secondary text-primary'
                }`}
              >
                {lowStockProducts.length > 0
                  ? `${lowStockProducts.length} ALERT`
                  : 'ALL CLEAR'}
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-4 border border-border bg-secondary/50 flex items-center gap-3 text-xs text-textSecondary">
                <PackageCheck className="w-4 h-4 text-primary shrink-0" />
                <span>สินค้าทุกรายการมีสต็อกคงเหลือมากกว่า 15 ชิ้น พร้อมจัดส่ง</span>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((p) => {
                  const pct = Math.min(100, Math.round((Math.max(0, p.stock) / 50) * 100));
                  const isCritical = p.stock <= 5;
                  return (
                    <div
                      key={p.id}
                      className="p-3 border border-border bg-secondary/35 hover:border-primary/40 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {p.imageUrl && (
                            <div className="w-9 h-9 bg-white border border-border p-1 shrink-0 flex items-center justify-center">
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-textPrimary truncate">
                              {p.name}
                            </div>
                            <div className="text-[10px] font-mono text-textSecondary">
                              {p.brand} · ฿{p.price.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[11px] font-mono font-semibold inline-flex items-center gap-1 ${
                              isCritical ? 'text-red-600' : 'text-primary'
                            }`}
                          >
                            {isCritical && <AlertTriangle className="w-3 h-3" />}
                            เหลือ {p.stock}
                          </span>
                          {canRestock && (
                            <button
                              type="button"
                              disabled={restockingId === p.id}
                              onClick={() => handleQuickRestockClick(p)}
                              className="px-2.5 py-1 text-[10px] font-mono font-semibold border border-textPrimary bg-textPrimary text-white hover:bg-primary hover:border-primary transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                              title="เติมสต็อกด่วน +30 ชิ้นลง MySQL"
                            >
                              {restockingId === p.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <>+30</>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="h-1 w-full bg-border/70 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(4, pct)}%` }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className={`h-full ${isCritical ? 'bg-red-600' : 'bg-primary'}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* BOTTOM HALF: RECENT ACTIVITY FEED */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-textSecondary block">
                  LIVE ORDER STREAM
                </span>
                <h3 className="text-base font-semibold text-textPrimary tracking-tight flex items-center gap-2">
                  <span>ความเคลื่อนไหวล่าสุด</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={onJumpToOrders}
                className="inline-flex items-center gap-1 text-[11px] text-textPrimary hover:text-primary font-medium transition-colors cursor-pointer"
              >
                <span>ดูทั้งหมด</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-border/70">
              {recentOrders.map((order, idx) => {
                const statusMeta = STATUS_META[order.status] || STATUS_META.pending;
                const firstItem = order.items?.[0]?.name || 'คำสั่งซื้อสินค้า';
                const extraCount = (order.items?.length || 1) - 1;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-semibold text-primary">
                          {order.id}
                        </span>
                        <span className="text-xs font-semibold text-textPrimary truncate">
                          {order.customerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-textSecondary">
                        <span className="truncate max-w-[175px]">
                          {firstItem}
                          {extraCount > 0 ? ` +${extraCount}` : ''}
                        </span>
                        <span className="text-border">·</span>
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] shrink-0">
                          <Clock className="w-2.5 h-2.5" />
                          {formatRelativeThaiTime(order.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <div className="font-mono text-xs font-semibold text-textPrimary">
                        ฿{order.totalAmount.toLocaleString()}
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 text-[9px] font-mono border ${statusMeta.pillClass}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {recentOrders.length === 0 && (
              <div className="text-xs text-textSecondary py-4 text-center flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>ยังไม่มีคำสั่งซื้อในระบบ</span>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
