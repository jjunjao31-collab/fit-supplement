'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  RefreshCw,
  Search,
  Copy,
  Check,
} from 'lucide-react';
import AnimatedTabs from '@/components/ui/AnimatedTabs';

type TableKey = 'orders' | 'products' | 'users' | 'schema';

interface DatabaseMeta {
  engine?: string;
  charset?: string;
  databaseName: string;
  host: string;
  status: string;
  sqlDumpPath: string;
  sqlDumpNote?: string;
  mysqlDataPath: string;
  consoleLabel?: string;
  phpMyAdminUrl: string;
}

interface DatabaseResponse {
  success: boolean;
  meta?: DatabaseMeta;
  counts?: {
    products: number;
    orders: number;
    users: number;
  };
  tables?: {
    products: Record<string, unknown>[];
    orders: Record<string, unknown>[];
    users: Record<string, unknown>[];
  };
  schemaDDL?: string;
}

export default function SqlDatabasePage() {
  const [data, setData] = useState<DatabaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableKey>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchDatabaseInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/database');
      const json: DatabaseResponse = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const handleCopySchema = () => {
    if (data?.schemaDDL) {
      navigator.clipboard.writeText(data.schemaDDL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTableRows = (): Record<string, unknown>[] => {
    if (!data?.tables || selectedTable === 'schema') return [];
    const rows = data.tables[selectedTable] || [];
    if (!searchTerm.trim()) return rows;
    return rows.filter((r) =>
      JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const rows = getTableRows();

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Linear-Style Header */}
      <section className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-textSecondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>BACKOFFICE / SQL INSPECTOR</span>
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-semibold text-textPrimary tracking-tight">
                ฐานข้อมูล SQL ({data?.meta?.databaseName || 'fitsupp'})
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-primary font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>LIVE POOL</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={fetchDatabaseInfo}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-border text-xs font-medium text-textPrimary hover:border-textPrimary transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>รีเฟรช</span>
            </button>
            <a
              href={data?.meta?.phpMyAdminUrl || 'http://localhost/phpmyadmin/index.php?route=/database/structure&db=fitsupp'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-textPrimary text-white hover:bg-primary text-xs font-medium transition-colors"
            >
              <span>{data?.meta?.consoleLabel || 'phpMyAdmin'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10 space-y-8">
        {/* 4-Column Architectural Meta Bar */}
        <div className="border border-border bg-white grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-border text-xs">
          <div className="p-5 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-textSecondary">
              DATABASE
            </div>
            <div className="font-mono font-semibold text-textPrimary text-sm">
              {data?.meta?.databaseName || 'fitsupp'}
            </div>
            <div className="text-[11px] text-textSecondary">
              {data?.meta?.charset || 'utf8mb4_unicode_ci'}
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-textSecondary">
              ENGINE
            </div>
            <div className="font-mono font-semibold text-textPrimary text-sm truncate">
              {data?.meta?.engine || 'MySQL 127.0.0.1:3306'}
            </div>
            <div className="text-[11px] text-textSecondary truncate">
              {data?.meta?.host || 'Cloud TLS Ready'}
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-textSecondary">
              STORAGE / BACKUP
            </div>
            <div className="font-mono font-semibold text-textPrimary text-sm truncate">
              {data?.meta?.sqlDumpPath || 'data/fitsupp.sql'}
            </div>
            <div className="text-[11px] text-textSecondary">
              {data?.meta?.sqlDumpNote || 'พร้อมนำเข้า phpMyAdmin'}
            </div>
          </div>
          <div className="p-5 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-textSecondary">
              TABLES
            </div>
            <div className="font-mono font-semibold text-primary text-sm">3 ตารางหลัก</div>
            <div className="text-[11px] font-mono text-textSecondary">users · products · orders</div>
          </div>
        </div>

        {/* Underline Table Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-1">
          <AnimatedTabs
            layoutId="sql-table-tab"
            variant="underline"
            tabs={[
              { id: 'orders', label: 'orders', count: data?.counts?.orders || 0 },
              { id: 'products', label: 'products', count: data?.counts?.products || 0 },
              { id: 'users', label: 'users', count: data?.counts?.users || 0 },
              { id: 'schema', label: 'DDL Schema' },
            ]}
            activeTab={selectedTable}
            onChange={(id) => {
              setSelectedTable(id as TableKey);
              setSearchTerm('');
            }}
          />

          {selectedTable !== 'schema' && (
            <div className="relative flex items-center border-b border-border focus-within:border-textPrimary pb-1.5 w-full sm:w-64 mb-1">
              <Search className="w-3.5 h-3.5 text-textSecondary mr-2 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาแถวในตาราง..."
                className="w-full bg-transparent text-xs text-textPrimary focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Table or Schema Panel */}
        {selectedTable !== 'schema' ? (
          <div className="border border-border bg-white overflow-x-auto">
            {rows.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-textSecondary font-mono text-[10px] uppercase tracking-wider">
                    {Object.keys(rows[0] || {}).map((col) => (
                      <th key={col} className="py-3 px-4">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-secondary/40 transition-colors">
                      {Object.entries(row).map(([col, val], cIdx) => (
                        <td
                          key={cIdx}
                          className="py-3 px-4 max-w-xs truncate font-mono text-[11px]"
                        >
                          {typeof val === 'object' && val !== null ? (
                            <span className="text-textSecondary">{JSON.stringify(val)}</span>
                          ) : col === 'id' ? (
                            <span className="font-semibold text-primary">{String(val)}</span>
                          ) : col === 'price' || col === 'totalAmount' ? (
                            <span className="font-semibold text-textPrimary">
                              ฿{Number(val).toLocaleString()}
                            </span>
                          ) : (
                            String(val ?? '-')
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-14 text-center text-xs text-textSecondary">
                ไม่พบข้อมูลแถวในตารางนี้
              </div>
            )}
          </div>
        ) : (
          <div className="border border-border bg-white">
            <div className="px-5 py-3.5 border-b border-border bg-secondary/40 flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-textSecondary">
                {data?.meta?.engine ? `${data.meta.engine} DDL` : 'SQL SCHEMA DDL'}
              </span>
              <button
                type="button"
                onClick={handleCopySchema}
                className="inline-flex items-center gap-1.5 text-xs text-textPrimary hover:text-primary cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก SQL'}</span>
              </button>
            </div>
            <pre className="p-6 text-xs font-mono text-textPrimary overflow-x-auto leading-relaxed bg-white">
              {data?.schemaDDL}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
