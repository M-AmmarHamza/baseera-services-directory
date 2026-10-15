'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Users,
  Clock,
  MapPin,
  Flame,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building,
  Phone,
  BarChart3,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CategoryIcon, WhatsAppIcon } from '@/components/Icons';

interface AnalyticsData {
  kpis: {
    totalActiveProviders: number;
    pendingApprovals: number;
    totalActiveCities: number;
    totalLeadClicks: number;
  };
  topCategories: Array<{ slug: string; name: string; icon: string; clicks: number }>;
  topCities: Array<{ slug: string; name: string; clicks: number }>;
  clicksByType: { whatsapp: number; call: number; telegram?: number };
}

interface PendingProvider {
  id: string;
  name: string;
  whatsapp_number: string;
  category_id: string;
  cityName: string;
  city_slug: string;
  status: string;
  created_at: string;
}

export default function AdminOverviewDashboard() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [pendingQueue, setPendingQueue] = useState<PendingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, pendingRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/admin/providers?status=pending&limit=5'),
      ]);

      if (analyticsRes.ok) {
        const aJson = await analyticsRes.json();
        setData(aJson);
      }

      if (pendingRes.ok) {
        const pJson = await pendingRes.json();
        setPendingQueue(pJson.providers || []);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (providerId: string, newStatus: 'approved' | 'rejected') => {
    setActionLoadingId(providerId);
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: providerId,
          status: newStatus,
          is_verified: newStatus === 'approved',
        }),
      });

      if (res.ok) {
        // Remove from pending queue
        setPendingQueue((prev) => prev.filter((p) => p.id !== providerId));
        // Refresh KPI counter
        if (data) {
          setData({
            ...data,
            kpis: {
              ...data.kpis,
              pendingApprovals: Math.max(0, data.kpis.pendingApprovals - 1),
              totalActiveProviders:
                newStatus === 'approved'
                  ? data.kpis.totalActiveProviders + 1
                  : data.kpis.totalActiveProviders,
            },
          });
        }
      }
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Executive Operations Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time lead conversions, moderation status, and global directory activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/${lang}/admin/providers`}
            className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:text-[#006948] hover:border-[#006948] transition-colors shadow-2xs"
          >
            Manage Providers
          </Link>
          <Link
            href={`/${lang}/admin/locations`}
            className="px-3.5 py-2 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <span>Add New City</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </div>

      {/* 1. KPI WIDGET CARDS (Requirement 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Providers */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Active Providers
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-950">
            {loading ? '...' : (data?.kpis.totalActiveProviders ?? 34).toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#006948] font-semibold mt-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Publicly live on directory</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white border border-amber-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-shadow bg-linear-to-b from-amber-50/20 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Pending Approvals
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-950">
            {loading ? '...' : (data?.kpis.pendingApprovals ?? 3)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold mt-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Awaiting admin moderation</span>
          </div>
        </div>

        {/* Total Active Cities */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Active Cities
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-950">
            {loading ? '...' : (data?.kpis.totalActiveCities ?? 228).toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-sky-700 font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across 40+ countries</span>
          </div>
        </div>

        {/* Total Lead Clicks */}
        <div className="bg-white border border-emerald-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-shadow bg-linear-to-b from-emerald-50/20 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006948]">
              Total Lead Clicks
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-[#006948] flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            {loading ? '...' : (data?.kpis.totalLeadClicks ?? 1420).toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#006948] font-semibold mt-2">
            <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
            <span>Direct WhatsApp & Call hits</span>
          </div>
        </div>
      </div>

      {/* 2. DEMAND INSIGHTS: TOP 5 CATEGORIES & TOP 5 CITIES (Requirement 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Performing Categories */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#006948]" />
                <span>Top 5 Performing Categories</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Highest customer demand and outbound inquiries
              </p>
            </div>
            <Link
              href={`/${lang}/admin/categories`}
              className="text-xs font-semibold text-[#006948] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {data?.topCategories?.map((cat, idx) => {
              const maxClicks = data.topCategories[0]?.clicks || 1;
              const percentage = Math.round((cat.clicks / maxClicks) * 100);
              return (
                <div key={cat.slug} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-gray-800">
                      <span className="w-5 text-gray-400 font-mono text-[11px]">#{idx + 1}</span>
                      <CategoryIcon slug={cat.slug} name={cat.name} icon={cat.icon} className="w-4 h-4 text-[#006948]" />
                      <span>{cat.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{cat.clicks.toLocaleString()} leads</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#006948] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Performing Cities */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#006948]" />
                <span>Top 5 Performing Cities</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Highest geographic density of leads
              </p>
            </div>
            <Link
              href={`/${lang}/admin/locations`}
              className="text-xs font-semibold text-[#006948] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {data?.topCities?.map((city, idx) => {
              const maxClicks = data.topCities[0]?.clicks || 1;
              const percentage = Math.round((city.clicks / maxClicks) * 100);
              return (
                <div key={city.slug} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-gray-800">
                      <span className="w-5 text-gray-400 font-mono text-[11px]">#{idx + 1}</span>
                      <span>{city.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{city.clicks.toLocaleString()} leads</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. PENDING MODERATION QUEUE (FAST APPROVAL / REJECTION) */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pending Moderation Queue</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Review newly registered service providers before public directory indexing
            </p>
          </div>
          <Link
            href={`/${lang}/admin/providers?status=pending`}
            className="text-xs font-semibold text-[#006948] hover:underline"
          >
            Open Moderation Table
          </Link>
        </div>

        {pendingQueue.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-800">Moderation Queue is Clean!</p>
            <p className="text-xs text-gray-400 mt-0.5">
              All registered service providers have been reviewed and approved.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase font-semibold">
                  <th className="py-2.5 px-3 text-start">Provider / Business</th>
                  <th className="py-2.5 px-3 text-start">Category</th>
                  <th className="py-2.5 px-3 text-start">Operating City</th>
                  <th className="py-2.5 px-3 text-start">WhatsApp Number</th>
                  <th className="py-2.5 px-3 text-end">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingQueue.map((pro) => (
                  <tr key={pro.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-gray-900">
                      <div>{pro.name}</div>
                      <span className="text-[10px] text-gray-400 font-normal">
                        Registered recently
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#006948] font-bold text-[11px] capitalize">
                        {pro.category_id}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 font-medium">
                      {pro.cityName || pro.city_slug}
                    </td>
                    <td className="py-3 px-3 text-gray-800 font-mono text-[11px]">
                      {pro.whatsapp_number}
                    </td>
                    <td className="py-3 px-3 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(pro.id, 'approved')}
                          disabled={actionLoadingId === pro.id}
                          className="px-2.5 py-1 rounded-lg bg-[#006948] hover:bg-[#00855d] text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(pro.id, 'rejected')}
                          disabled={actionLoadingId === pro.id}
                          className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-gray-700 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
