'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { PERMISSIONS, ROLE_LABELS, type Role } from '@/lib/rbac';

const ROLES = Object.keys(PERMISSIONS) as Role[];

interface UserRow {
  id: number;
  email: string;
  username?: string;
  fullname: string;
  role: string;
  phone?: string;
  points?: number;
  created_at?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [currentUser, setCurrentUser] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [meRes, usersRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/users'),
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user || meData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      } else {
        const err = await usersRes.json();
        setMessage({
          type: 'error',
          text: err.message || 'ไม่มีสิทธิ์เข้าถึงข้อมูลผู้ใช้',
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการโหลดรายชื่อผู้ใช้' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (id: number, role: string) => {
    setMessage(null);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `เปลี่ยนบทบาทผู้ใช้ #${id} เป็น "${role}" เรียบร้อยแล้ว (ผู้ใช้ต้อง Login ใหม่เพื่อให้ Token อัปเดต)`,
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'ไม่สามารถเปลี่ยนสิทธิ์ได้' });
      }
      await loadData();
    } catch {
      setMessage({ type: 'error', text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' });
    }
  };

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
              <span>BACKOFFICE / RBAC USERS</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-semibold text-textPrimary tracking-tight">
              จัดการสิทธิ์และบทบาทผู้ใช้
            </h1>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border text-xs font-medium text-textPrimary hover:border-textPrimary transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </button>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10 space-y-10">
        {/* 3-Column RBAC Permission Matrix */}
        <section className="border border-border bg-white grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {ROLES.map((role) => (
            <div key={role} className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                  ROLE · {role}
                </span>
                <span className="text-[10px] font-mono text-textSecondary">
                  {PERMISSIONS[role].length} perms
                </span>
              </div>
              <div className="text-sm font-semibold text-textPrimary">
                {ROLE_LABELS[role]}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PERMISSIONS[role].map((perm) => (
                  <span
                    key={perm}
                    className="text-[11px] font-mono px-2 py-0.5 bg-secondary border border-border text-textSecondary"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>

        {message && (
          <div
            className={`p-4 border-l-2 text-xs ${
              message.type === 'success'
                ? 'border-primary bg-secondary text-primary font-medium'
                : 'border-red-600 bg-red-50/50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Users Table */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-textPrimary">
              บัญชีทั้งหมดใน MySQL ({users.length} บัญชี)
            </h2>
            <span className="text-xs text-textSecondary">
              ระบบป้องกันไม่ให้ Admin ลดสิทธิ์ของบัญชีตัวเอง
            </span>
          </div>

          <div className="border border-border bg-white overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-[10px] font-mono uppercase tracking-wider text-textSecondary">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                  <th className="py-3 px-4">อีเมล</th>
                  <th className="py-3 px-4">เบอร์โทร</th>
                  <th className="py-3 px-4">บทบาท (Role)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {users.map((u) => {
                  const isSelf =
                    currentUser && Number(currentUser.id) === Number(u.id);
                  return (
                    <tr key={u.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-textSecondary">#{u.id}</td>
                      <td className="py-3.5 px-4 font-medium text-textPrimary">
                        <div className="flex items-center gap-2">
                          <span>{u.fullname}</span>
                          {isSelf && (
                            <span className="text-[10px] font-mono text-primary">
                              (คุณ)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-textSecondary">{u.email}</td>
                      <td className="py-3.5 px-4 font-mono text-textSecondary">
                        {u.phone || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={u.role === 'superadmin' ? 'admin' : u.role}
                          onChange={(event) =>
                            handleRoleChange(u.id, event.target.value)
                          }
                          aria-label={`เปลี่ยนสิทธิ์ของ ${u.fullname}`}
                          className="px-3 py-1.5 bg-white border border-border focus:border-textPrimary focus:outline-none text-xs font-medium text-textPrimary cursor-pointer"
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role} — {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-textSecondary">
                      ไม่พบข้อมูลผู้ใช้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
