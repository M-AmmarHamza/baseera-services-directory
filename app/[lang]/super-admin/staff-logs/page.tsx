'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Shield,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Search,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Lock,
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  adminId: string;
  adminEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  createdAt?: string;
}

export default function StaffLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/logs?limit=100');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      (log.adminEmail || log.adminId).toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q)
    );
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('DELETE')) return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    if (action.includes('CREATE')) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (action.includes('BULK')) return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    if (action.includes('LOGIN')) return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Staff RBAC & Audit Logs
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Immutable Trail
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time activity logging and role-based permissions matrix for Baseera platform staff.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* RBAC Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SUPER_ADMIN Card */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                SUPER_ADMIN
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
                  ROOT
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Total System Authority</p>
            </div>
          </div>
          <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
            <li className="flex items-center gap-1.5 text-emerald-400">
              <span>✓</span> Full CRUD across all directory entities
            </li>
            <li className="flex items-center gap-1.5 text-emerald-400">
              <span>✓</span> Permanent Hard Delete privileges
            </li>
            <li className="flex items-center gap-1.5 text-emerald-400">
              <span>✓</span> Platform configurations & GA4 telemetry
            </li>
            <li className="flex items-center gap-1.5 text-emerald-400">
              <span>✓</span> Bulk publish, index, suspend, and delete
            </li>
          </ul>
        </div>

        {/* MODERATOR Card */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                MODERATOR
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-mono">
                  STAFF
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Listing Curation & Verification</p>
            </div>
          </div>
          <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
            <li className="flex items-center gap-1.5 text-emerald-400">
              <span>✓</span> Review pending provider registrations
            </li>
            <li className="flex items-center gap-1.5 text-emerald-400">
              <span>✓</span> Edit provider details & quick toggles
            </li>
            <li className="flex items-center gap-1.5 text-emerald-400">
              <span>✓</span> Bulk publish and suspend actions
            </li>
            <li className="flex items-center gap-1.5 text-rose-400">
              <span>✗</span> Hard deletes blocked (403 Forbidden)
            </li>
          </ul>
        </div>

        {/* PROVIDER Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                PROVIDER
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                  USER
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Directory Profile Owner</p>
            </div>
          </div>
          <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
            <li className="flex items-center gap-1.5 text-emerald-400">
              <span>✓</span> Edit personal profile & gallery
            </li>
            <li className="flex items-center gap-1.5 text-emerald-400">
              <span>✓</span> View own WhatsApp leads analytics
            </li>
            <li className="flex items-center gap-1.5 text-rose-400">
              <span>✗</span> Super admin panel access blocked
            </li>
            <li className="flex items-center gap-1.5 text-rose-400">
              <span>✗</span> Cannot view or edit other providers
            </li>
          </ul>
        </div>
      </div>

      {/* Audit Logs Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Administrative Audit Log Trail
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredLogs.length} of {logs.length} logged mutations.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by action, admin, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No audit records matched your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Admin User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4 text-right">Payload Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-slate-200 font-semibold">
                          {log.adminEmail || log.adminId}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getActionBadgeColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-medium">
                          {log.entityType}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          #{log.entityId.slice(0, 10)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {log.details && Object.keys(log.details).length > 0 ? (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : log.id)}
                              className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-semibold"
                            >
                              <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                              {isExpanded ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                            </button>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>

                      {isExpanded && log.details && (
                        <tr className="bg-slate-950/80">
                          <td colSpan={6} className="p-4 border-y border-slate-800 font-mono text-[11px]">
                            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 overflow-x-auto text-emerald-400">
                              <pre>{JSON.stringify(log.details, null, 2)}</pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
