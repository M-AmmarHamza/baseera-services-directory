'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Lock,
  ChevronDown,
  ChevronRight,
  Filter,
  CheckCircle,
  Clock,
  ArrowRight,
  X,
  UserX,
  Key,
} from 'lucide-react';

interface StaffMember {
  id: string;
  email: string;
  name?: string;
  role: 'SUPER_ADMIN' | 'MODERATOR' | 'PROVIDER';
  createdAt: string;
}

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

export default function SuperAdminStaffPage() {
  const [activeTab, setActiveTab] = useState<'staff' | 'logs'>('staff');
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdminRole, setIsSuperAdminRole] = useState(true);

  // Staff search & filters
  const [staffSearch, setStaffSearch] = useState('');
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<'SUPER_ADMIN' | 'MODERATOR'>('MODERATOR');
  const [formPassword, setFormPassword] = useState('');
  const [savingStaff, setSavingStaff] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);

  // Logs search & filter
  const [logsSearch, setLogsSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [logPage, setLogPage] = useState(1);
  const LOGS_PER_PAGE = 25;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/staff');
      if (res.status === 403) {
        setIsSuperAdminRole(false);
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.staff)) {
          setStaffList(data.staff);
        }
        if (Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      }
    } catch (err) {
      console.error('Failed to load staff and audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Create Staff / Moderator
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStaff(true);
    setStaffError(null);

    if (!formEmail.trim()) {
      setStaffError('Valid email is required');
      setSavingStaff(false);
      return;
    }

    try {
      const res = await fetch('/api/super-admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'INVITE_STAFF',
          staff: {
            email: formEmail.trim().toLowerCase(),
            name: formName.trim() || undefined,
            role: formRole,
            password: formPassword.trim() || undefined,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStaffModalOpen(false);
        setFormEmail('');
        setFormName('');
        setFormPassword('');
        fetchData();
      } else {
        setStaffError(data.error || 'Failed to create staff member');
      }
    } catch (err: any) {
      setStaffError(err?.message || 'Network error saving staff');
    } finally {
      setSavingStaff(false);
    }
  };

  // 2. Change Role
  const handleChangeRole = async (id: string, currentRole: string) => {
    const nextRole = currentRole === 'SUPER_ADMIN' ? 'MODERATOR' : 'SUPER_ADMIN';
    if (!confirm(`Change role of this staff member to ${nextRole}?`)) return;

    try {
      const res = await fetch('/api/super-admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ROLE',
          id,
          role: nextRole,
        }),
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update role');
      }
    } catch {
      alert('Network error updating role');
    }
  };

  // 3. Revoke Staff Access
  const handleRevokeAccess = async (id: string, email: string) => {
    if (!confirm(`Revoke admin privileges for ${email}? This user will no longer be able to log in to the admin panel.`)) return;

    try {
      const res = await fetch(`/api/super-admin/staff?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to revoke staff access');
      }
    } catch {
      alert('Network error revoking access');
    }
  };

  // Filtered staff list
  const filteredStaff = staffList.filter((m) => {
    const q = staffSearch.toLowerCase();
    return m.email.toLowerCase().includes(q) || (m.name && m.name.toLowerCase().includes(q));
  });

  // Filtered audit logs
  const filteredLogs = logs.filter((log) => {
    const q = logsSearch.toLowerCase();
    const matchSearch =
      (log.adminEmail && log.adminEmail.toLowerCase().includes(q)) ||
      log.action.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q);

    const matchEntity =
      entityFilter === 'ALL' || log.entityType.toUpperCase() === entityFilter.toUpperCase();

    return matchSearch && matchEntity;
  });

  const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE) || 1;
  const paginatedLogs = filteredLogs.slice(
    (logPage - 1) * LOGS_PER_PAGE,
    logPage * LOGS_PER_PAGE
  );

  if (!isSuperAdminRole) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <p className="text-slate-400 mt-2 text-sm leading-relaxed">
          Staff Management and Full Audit Logs are strictly restricted to <span className="text-white font-semibold">SUPER_ADMIN</span> accounts.
        </p>
        <div className="mt-6">
          <Link
            href="./"
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            Back to Executive Overview
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              Phase 3 Live
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Super Admin Strictly
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            Staff Management & Security Audit Logs
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Manage moderator team permissions, RBAC privilege levels, and inspect immutable audit trail logs.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="self-start sm:self-center p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'staff'
              ? 'border-cyan-500 text-cyan-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff & Moderators ({staffList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-cyan-500 text-cyan-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Security Audit Trail ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: STAFF & MODERATOR ACCOUNTS */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder="Search staff by email or name..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                setStaffError(null);
                setStaffModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-cyan-600/20 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Moderator</span>
            </button>
          </div>

          {/* Staff Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 font-bold select-none">
                  <tr>
                    <th className="px-6 py-3.5">Staff Member</th>
                    <th className="px-6 py-3.5">Assigned Role</th>
                    <th className="px-6 py-3.5">Access Scope</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                        Loading staff roster...
                      </td>
                    </tr>
                  ) : filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-500">
                        No staff accounts found.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => (
                      <tr key={staff.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                              staff.role === 'SUPER_ADMIN'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}>
                              {staff.name ? staff.name.charAt(0).toUpperCase() : staff.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white font-semibold">{staff.name || 'Staff Member'}</div>
                              <div className="text-slate-400 text-[11px] font-mono">{staff.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            staff.role === 'SUPER_ADMIN'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {staff.role === 'SUPER_ADMIN' ? (
                              <>
                                <ShieldCheck className="w-3 h-3 text-amber-400" />
                                Super Admin
                              </>
                            ) : (
                              <>
                                <Shield className="w-3 h-3 text-cyan-400" />
                                Moderator
                              </>
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-400 text-[11px]">
                          {staff.role === 'SUPER_ADMIN'
                            ? 'Full Platform Access (Hard Deletes, SEO, Monetization, Staff)'
                            : 'Operational Scope (Review Providers, Taxonomy, Global FAQs)'}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleChangeRole(staff.id, staff.role)}
                              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title="Toggle between SUPER_ADMIN and MODERATOR"
                            >
                              {staff.role === 'SUPER_ADMIN' ? 'Demote to Moderator' : 'Promote to Super Admin'}
                            </button>
                            <button
                              onClick={() => handleRevokeAccess(staff.id, staff.email)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10"
                              title="Revoke Admin Access"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MODAL: INVITE STAFF */}
          {staffModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-cyan-400" />
                    Invite Moderator / Staff Account
                  </h3>
                  <button
                    onClick={() => setStaffModalOpen(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
                  {staffError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                      {staffError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Staff Member Name
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Asad Siddiqui"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="moderator@baseera.com"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Privilege Role <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="MODERATOR">MODERATOR (Review Providers, Taxonomy & FAQs)</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Authority)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Temporary Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setStaffModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingStaff}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all active:scale-95"
                    >
                      {savingStaff ? 'Saving...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUDIT LOG VIEWER */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={logsSearch}
                onChange={(e) => {
                  setLogsSearch(e.target.value);
                  setLogPage(1);
                }}
                placeholder="Search action, email, or entity ID..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Entity Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={entityFilter}
                onChange={(e) => {
                  setEntityFilter(e.target.value);
                  setLogPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Entities ({logs.length})</option>
                <option value="PROVIDER">Providers</option>
                <option value="CATEGORY">Categories</option>
                <option value="LOCATION">Locations</option>
                <option value="FAQ">FAQs</option>
                <option value="SEO_SETTINGS">SEO Settings</option>
                <option value="REDIRECT_RULE">Redirect Rules</option>
                <option value="ADS_SETTINGS">Ad Settings</option>
                <option value="PRIVATE_SPONSOR">Private Sponsors</option>
                <option value="SITE_SETTINGS">Site Settings</option>
                <option value="STAFF">Staff & RBAC</option>
                <option value="AUTH">Authentication</option>
              </select>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 font-bold select-none">
                  <tr>
                    <th className="px-6 py-3.5">Timestamp</th>
                    <th className="px-6 py-3.5">Admin Email</th>
                    <th className="px-6 py-3.5">Action Executed</th>
                    <th className="px-6 py-3.5">Entity / Target</th>
                    <th className="px-6 py-3.5 text-right">Payload Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                        Loading security audit logs...
                      </td>
                    </tr>
                  ) : paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        No audit log entries found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => {
                      const isExpanded = expandedLogId === log.id;
                      return (
                        <React.Fragment key={log.id}>
                          <tr
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                          >
                            <td className="px-6 py-3.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Recent'}
                            </td>

                            <td className="px-6 py-3.5 text-slate-200 font-mono text-[11px]">
                              {log.adminEmail || 'admin@baseera.com'}
                            </td>

                            <td className="px-6 py-3.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                                {log.action}
                              </span>
                            </td>

                            <td className="px-6 py-3.5">
                              <span className="text-slate-300 font-medium">{log.entityType}:</span>{' '}
                              <span className="text-slate-500 font-mono text-[11px]">{log.entityId}</span>
                            </td>

                            <td className="px-6 py-3.5 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedLogId(isExpanded ? null : log.id);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                              >
                                {isExpanded ? 'Hide' : 'Inspect'}
                                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded JSON details row */}
                          {isExpanded && (
                            <tr className="bg-slate-950/90 border-b border-slate-800">
                              <td colSpan={5} className="px-6 py-4">
                                <div className="text-[11px] font-mono text-cyan-300 bg-slate-900 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-60">
                                  <pre>{JSON.stringify(log.details || {}, null, 2)}</pre>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
              <div>
                Showing {(logPage - 1) * LOGS_PER_PAGE + 1} -{' '}
                {Math.min(logPage * LOGS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length} audit logs
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={logPage <= 1}
                  onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold"
                >
                  Previous
                </button>
                <span className="font-semibold text-slate-300">
                  {logPage} / {totalPages}
                </span>
                <button
                  disabled={logPage >= totalPages}
                  onClick={() => setLogPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
