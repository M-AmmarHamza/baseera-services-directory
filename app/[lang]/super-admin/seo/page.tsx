'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  Plus,
  Search,
  Trash2,
  Edit2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Power,
  ShieldCheck,
  ShieldAlert,
  Globe,
  ExternalLink,
  Info,
  Check,
  X,
  Lock,
} from 'lucide-react';

interface RedirectRule {
  id: string;
  sourcePath: string;
  destinationPath: string;
  statusCode: number;
  isActive: boolean;
  createdAt?: string;
}

export default function SuperAdminSeoPage() {
  const [globalAllowIndexing, setGlobalAllowIndexing] = useState<boolean>(true);
  const [redirects, setRedirects] = useState<RedirectRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingIndexing, setUpdatingIndexing] = useState(false);
  const [search, setSearch] = useState('');
  const [isSuperAdminRole, setIsSuperAdminRole] = useState(true);

  // Modal State for Adding/Editing Redirect Rule
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RedirectRule | null>(null);
  const [formSource, setFormSource] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formStatusCode, setFormStatusCode] = useState<number>(301);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [savingRule, setSavingRule] = useState(false);
  const [ruleError, setRuleError] = useState<string | null>(null);

  // Live test input
  const [testPath, setTestPath] = useState('');
  const [testResult, setTestResult] = useState<{ destination: string; status: number } | null>(null);

  const fetchSeoData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/seo');
      if (res.status === 403) {
        setIsSuperAdminRole(false);
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setGlobalAllowIndexing(Boolean(data.globalAllowIndexing));
        if (Array.isArray(data.redirects)) {
          setRedirects(data.redirects);
        }
      }
    } catch (err) {
      console.error('Failed to load SEO configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoData();
  }, []);

  // Master Indexing Switch Handler
  const handleToggleIndexing = async () => {
    const nextVal = !globalAllowIndexing;
    const confirmMsg = nextVal
      ? 'Enable search engine indexing for Baseera? All search engine spiders will be allowed to crawl and index public directory pages.'
      : 'Activate Staging / Safeguard Mode? The entire site will output "noindex, nofollow" and robots.txt will disallow all crawlers.';

    if (!confirm(confirmMsg)) return;

    setUpdatingIndexing(true);
    try {
      const res = await fetch('/api/super-admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_INDEXING',
          global_allow_indexing: nextVal,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGlobalAllowIndexing(data.globalAllowIndexing);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update master indexing switch');
      }
    } catch (err) {
      alert('Network error updating master indexing switch');
    } finally {
      setUpdatingIndexing(false);
    }
  };

  // Open modal for new rule
  const handleOpenAdd = () => {
    setEditingRule(null);
    setFormSource('');
    setFormDestination('');
    setFormStatusCode(301);
    setFormIsActive(true);
    setRuleError(null);
    setModalOpen(true);
  };

  // Open modal to edit existing rule
  const handleOpenEdit = (rule: RedirectRule) => {
    setEditingRule(rule);
    setFormSource(rule.sourcePath);
    setFormDestination(rule.destinationPath);
    setFormStatusCode(rule.statusCode);
    setFormIsActive(rule.isActive);
    setRuleError(null);
    setModalOpen(true);
  };

  // Save Redirect Rule
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRule(true);
    setRuleError(null);

    const cleanSource = formSource.trim();
    const cleanDestination = formDestination.trim();

    if (!cleanSource || !cleanDestination) {
      setRuleError('Both source and destination paths are required.');
      setSavingRule(false);
      return;
    }

    try {
      const res = await fetch('/api/super-admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_REDIRECT',
          rule: {
            id: editingRule?.id,
            sourcePath: cleanSource.startsWith('/') ? cleanSource : `/${cleanSource}`,
            destinationPath: cleanDestination,
            statusCode: formStatusCode,
            isActive: formIsActive,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setModalOpen(false);
        fetchSeoData();
      } else {
        setRuleError(data.error || 'Failed to save redirect rule');
      }
    } catch (err: any) {
      setRuleError(err?.message || 'Network error saving redirect rule');
    } finally {
      setSavingRule(false);
    }
  };

  // Inline toggle active status
  const handleToggleRuleActive = async (rule: RedirectRule) => {
    try {
      const res = await fetch('/api/super-admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_REDIRECT',
          rule: {
            ...rule,
            isActive: !rule.isActive,
          },
        }),
      });
      if (res.ok) {
        fetchSeoData();
      }
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  // Delete Redirect Rule
  const handleDeleteRule = async (id: string, sourcePath: string) => {
    if (!confirm(`Are you sure you want to permanently delete redirect rule for "${sourcePath}"?`)) return;

    try {
      const res = await fetch(`/api/super-admin/seo?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchSeoData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete redirect rule');
      }
    } catch (err) {
      alert('Network error deleting redirect rule');
    }
  };

  // Quick live test simulation
  const handleTestRedirect = () => {
    const cleanTest = testPath.trim().toLowerCase();
    const matched = redirects.find(
      (r) =>
        r.isActive &&
        (r.sourcePath.toLowerCase() === cleanTest ||
          r.sourcePath.toLowerCase() === `/${cleanTest}`)
    );
    if (matched) {
      setTestResult({ destination: matched.destinationPath, status: matched.statusCode });
    } else {
      setTestResult(null);
    }
  };

  const filteredRules = redirects.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.sourcePath.toLowerCase().includes(q) ||
      r.destinationPath.toLowerCase().includes(q)
    );
  });

  if (!isSuperAdminRole) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <p className="text-slate-400 mt-2 text-sm leading-relaxed">
          The SEO Controls & 301 Redirects Engine is strictly restricted to <span className="text-white font-semibold">SUPER_ADMIN</span> accounts. Your moderator role has read-only or restricted privileges.
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
            SEO Indexing & 301 Redirects Hub
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Master search engine crawl switch, canonical 301 URL redirects engine, and search indexing policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSeoData}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add 301 Redirect</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: MASTER INDEXING SWITCH */}
      <div className={`p-6 rounded-2xl border transition-all ${
        globalAllowIndexing
          ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30'
          : 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/30'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                globalAllowIndexing ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {globalAllowIndexing ? <Globe className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Master Search Indexing Switch (`global_allow_indexing`)
                  </h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    globalAllowIndexing
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {globalAllowIndexing ? 'Production Live (Indexing Allowed)' : 'Staging / Safeguard Mode (Noindex All)'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mt-0.5">
                  {globalAllowIndexing
                    ? 'Search engine crawlers (Googlebot, Bingbot) are permitted. Public categories, hubs, and individual verified providers with seo_index=true will be indexed.'
                    : 'SAFEGUARD ACTIVE: The entire website outputs <meta name="robots" content="noindex, nofollow" /> and robots.txt blocks all crawlers. Real data entered on staging will never cause duplicate content penalties.'}
                </p>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={handleToggleIndexing}
              disabled={updatingIndexing}
              className={`inline-flex items-center gap-2 text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 ${
                globalAllowIndexing
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              }`}
            >
              <Power className={`w-4 h-4 ${updatingIndexing ? 'animate-spin' : ''}`} />
              <span>
                {globalAllowIndexing ? 'Switch to Staging (Noindex All)' : 'Activate Production Indexing'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: LIVE REDIRECT TESTER & SEARCH BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick URL Tester Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            Live Redirect Match Tester
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Test how a legacy URL or old provider slug resolves in the Next.js routing/middleware engine.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={testPath}
              onChange={(e) => {
                setTestPath(e.target.value);
                setTestResult(null);
              }}
              placeholder="/join or /tariq-electric"
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={handleTestRedirect}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-2 rounded-xl text-xs font-semibold"
            >
              Test
            </button>
          </div>

          {testResult ? (
            <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl text-xs text-cyan-300 flex items-center justify-between">
              <div>
                <span className="font-bold text-[10px] uppercase bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-400 mr-2">
                  {testResult.status} Found
                </span>
                <span className="font-mono">{testResult.destination}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            </div>
          ) : testPath && (
            <div className="text-[11px] text-slate-500 italic">
              No custom redirect matched. Request passes to dynamic locale/city route handlers.
            </div>
          )}
        </div>

        {/* Search & Rules Count */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Active 301/302 Redirect Rules ({redirects.length})
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Evaluated in Next.js Edge Middleware with zero database overhead.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search source or target..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {redirects.filter((r) => r.isActive).length} Active Rules
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              {redirects.filter((r) => !r.isActive).length} Paused Rules
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: 301 REDIRECTS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 font-bold select-none">
              <tr>
                <th className="px-6 py-3.5">Source Path (Old URL)</th>
                <th className="px-6 py-3.5">Target Destination</th>
                <th className="px-4 py-3.5 text-center">Status Code</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                    Loading dynamic redirect rules...
                  </td>
                </tr>
              ) : filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No redirect rules match your search query.
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Source Path */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-cyan-300 font-semibold bg-cyan-950/40 px-2 py-1 rounded border border-cyan-800/40">
                        {rule.sourcePath}
                      </span>
                    </td>

                    {/* Destination Path */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-slate-200">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="line-clamp-1">{rule.destinationPath}</span>
                      </div>
                    </td>

                    {/* Status Code */}
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rule.statusCode === 301
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {rule.statusCode} {rule.statusCode === 301 ? 'Permanent' : 'Temporary'}
                      </span>
                    </td>

                    {/* Active Toggle */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggleRuleActive(rule)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          rule.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {rule.isActive ? 'Active' : 'Paused'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(rule)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                          title="Edit Rule"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id, rule.sourcePath)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-colors"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* MODAL: ADD / EDIT REDIRECT RULE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                {editingRule ? 'Edit 301 Redirect Rule' : 'Create 301 Permanent Redirect'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="p-6 space-y-4">
              {ruleError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {ruleError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Source Path (Legacy URL to match) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  placeholder="/old-page or /join"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Must start with / (e.g. <code>/join</code> or <code>/services/electrician</code>)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Destination Path (New Target URL) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formDestination}
                  onChange={(e) => setFormDestination(e.target.value)}
                  placeholder="/en/list-service or https://..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    HTTP Status Code
                  </label>
                  <select
                    value={formStatusCode}
                    onChange={(e) => setFormStatusCode(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value={301}>301 Permanent</option>
                    <option value={302}>302 Found (Temporary)</option>
                    <option value={307}>307 Temporary Redirect</option>
                    <option value={308}>308 Permanent Redirect</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Active Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
                      formIsActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {formIsActive ? 'Rule Active' : 'Rule Paused'}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRule}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all active:scale-95"
                >
                  {savingRule ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
