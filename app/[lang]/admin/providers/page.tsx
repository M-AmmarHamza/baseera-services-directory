'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Star,
  ExternalLink,
  Trash2,
  Plus,
  RefreshCw,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  BadgeCheck,
  UploadCloud,
  Globe,
  Globe2,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  AlertCircle,
} from 'lucide-react';
import { WhatsAppIcon, CategoryIcon } from '@/components/Icons';
import { CATEGORIES, CITIES } from '@/lib/db';
import { updateProviderAction } from './actions';

interface AdminProvider {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  city_slug: string;
  cityName: string;
  country_code: string;
  whatsapp_number: string;
  phone_number?: string;
  status: 'pending' | 'published' | 'suspended' | 'approved';
  seo_index: boolean;
  is_verified: boolean;
  is_featured: boolean;
  is_premium: boolean;
  avatar_url?: string;
  starting_price?: number;
  rating?: number;
  total_leads?: number;
  created_at: string;
}

interface ProviderStats {
  total: number;
  published: number;
  pending: number;
  suspended: number;
  seoIndexed: number;
  featured: number;
  verified: number;
}

function AdminProvidersContent() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const searchParams = useSearchParams();

  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [stats, setStats] = useState<ProviderStats>({
    total: 0,
    published: 0,
    pending: 0,
    suspended: 0,
    seoIndexed: 0,
    featured: 0,
    verified: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [seoFilter, setSeoFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // New Provider Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]?.id || 'electrician');
  const [newCity, setNewCity] = useState(CITIES[0]?.slug || 'karachi');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: String(currentPage),
        limit: '10',
        status: statusFilter,
        seo: seoFilter,
        featured: featuredFilter,
        search,
        category: categoryFilter,
        city: cityFilter,
      });

      const res = await fetch(`/api/admin/providers?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [currentPage, statusFilter, seoFilter, featuredFilter, categoryFilter, cityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProviders();
  };

  // 1. STATUS CHANGE HANDLER (Published, Pending, Suspended)
  const handleStatusChange = async (provider: AdminProvider, newStatus: 'pending' | 'published' | 'suspended') => {
    setUpdatingId(provider.id);
    // Optimistic update
    setProviders((prev) =>
      prev.map((p) => (p.id === provider.id ? { ...p, status: newStatus } : p))
    );

    try {
      const res = await updateProviderAction({
        id: provider.id,
        status: newStatus,
      });

      if (res.success) {
        showToast(`${provider.name}: Status updated to ${newStatus.toUpperCase()}`);
        fetchProviders();
      } else {
        // Fallback to client fetch
        const clientRes = await fetch('/api/admin/providers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: provider.id, status: newStatus }),
        });
        if (clientRes.ok) {
          showToast(`${provider.name}: Status updated to ${newStatus.toUpperCase()}`);
          fetchProviders();
        }
      }
    } catch (err) {
      console.error('Status change error:', err);
      showToast(`Error updating status for ${provider.name}`);
      fetchProviders();
    } finally {
      setUpdatingId(null);
    }
  };

  // 2. SEO INDEX TOGGLE (Boolean: Search engine & Sitemap indexing)
  const handleToggleSeo = async (provider: AdminProvider) => {
    const nextVal = !provider.seo_index;
    setUpdatingId(provider.id);

    // Optimistic update
    setProviders((prev) =>
      prev.map((p) => (p.id === provider.id ? { ...p, seo_index: nextVal } : p))
    );

    try {
      const res = await updateProviderAction({
        id: provider.id,
        seo_index: nextVal,
      });

      if (res.success) {
        showToast(
          nextVal
            ? `${provider.name}: SEO Index ENABLED (Index, Follow + Sitemap)`
            : `${provider.name}: SEO Index DISABLED (Noindex, Nofollow)`
        );
        fetchProviders();
      } else {
        const clientRes = await fetch('/api/admin/providers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: provider.id, seo_index: nextVal }),
        });
        if (clientRes.ok) {
          showToast(
            nextVal
              ? `${provider.name}: SEO Index ENABLED`
              : `${provider.name}: SEO Index DISABLED (Noindex)`
          );
          fetchProviders();
        }
      }
    } catch (err) {
      console.error('SEO toggle error:', err);
      fetchProviders();
    } finally {
      setUpdatingId(null);
    }
  };

  // 3. FEATURED TOGGLE (Boolean: Placement in Top Sliders)
  const handleToggleFeatured = async (provider: AdminProvider) => {
    const nextVal = !provider.is_featured;
    setUpdatingId(provider.id);

    // Optimistic update
    setProviders((prev) =>
      prev.map((p) => (p.id === provider.id ? { ...p, is_featured: nextVal } : p))
    );

    try {
      const res = await updateProviderAction({
        id: provider.id,
        is_featured: nextVal,
      });

      if (res.success) {
        showToast(
          nextVal
            ? `${provider.name}: Set as FEATURED in Top Sliders`
            : `${provider.name}: Removed from Featured Sliders`
        );
        fetchProviders();
      } else {
        const clientRes = await fetch('/api/admin/providers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: provider.id, is_featured: nextVal }),
        });
        if (clientRes.ok) {
          showToast(
            nextVal
              ? `${provider.name}: Set as FEATURED`
              : `${provider.name}: Removed from Featured`
          );
          fetchProviders();
        }
      }
    } catch (err) {
      console.error('Featured toggle error:', err);
      fetchProviders();
    } finally {
      setUpdatingId(null);
    }
  };

  // 4. VERIFIED TRUST BADGE TOGGLE (Boolean: Trust Badge Display)
  const handleToggleVerified = async (provider: AdminProvider) => {
    const nextVal = !provider.is_verified;
    setUpdatingId(provider.id);

    // Optimistic update
    setProviders((prev) =>
      prev.map((p) => (p.id === provider.id ? { ...p, is_verified: nextVal } : p))
    );

    try {
      const res = await updateProviderAction({
        id: provider.id,
        is_verified: nextVal,
      });

      if (res.success) {
        showToast(
          nextVal
            ? `${provider.name}: Verified Trust Badge ENABLED`
            : `${provider.name}: Verified Trust Badge REMOVED`
        );
        fetchProviders();
      } else {
        const clientRes = await fetch('/api/admin/providers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: provider.id, is_verified: nextVal }),
        });
        if (clientRes.ok) {
          showToast(
            nextVal
              ? `${provider.name}: Trust Badge ENABLED`
              : `${provider.name}: Trust Badge REMOVED`
          );
          fetchProviders();
        }
      }
    } catch (err) {
      console.error('Verified toggle error:', err);
      fetchProviders();
    } finally {
      setUpdatingId(null);
    }
  };

  // 5. FREEMIUM TIER TOGGLE (Free vs Premium)
  const handleTogglePremium = async (provider: AdminProvider) => {
    const nextVal = !provider.is_premium;
    setUpdatingId(provider.id);

    // Optimistic update
    setProviders((prev) =>
      prev.map((p) => (p.id === provider.id ? { ...p, is_premium: nextVal } : p))
    );

    try {
      const res = await updateProviderAction({
        id: provider.id,
        is_premium: nextVal,
      });

      if (res.success) {
        showToast(
          nextVal
            ? `${provider.name}: Upgraded to PREMIUM Tier (Unlocked Gallery, Map, Certs & Target Areas)`
            : `${provider.name}: Downgraded to FREE Tier (Strict 150-char bio & 1 photo)`
        );
        fetchProviders();
      } else {
        const clientRes = await fetch('/api/admin/providers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: provider.id, is_premium: nextVal }),
        });
        if (clientRes.ok) {
          showToast(
            nextVal
              ? `${provider.name}: Upgraded to PREMIUM Tier`
              : `${provider.name}: Set to FREE Tier`
          );
          fetchProviders();
        }
      }
    } catch (err) {
      console.error('Premium toggle error:', err);
      fetchProviders();
    } finally {
      setUpdatingId(null);
    }
  };

  // 5. DELETE PROVIDER
  const handleDeleteProvider = async (providerId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    setUpdatingId(providerId);
    try {
      const res = await fetch(`/api/admin/providers?id=${encodeURIComponent(providerId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(`Provider "${name}" deleted successfully.`);
        setProviders((prev) => prev.filter((p) => p.id !== providerId));
        setTotalCount((prev) => Math.max(0, prev - 1));
        fetchProviders();
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // 6. ADD NEW PROVIDER MANUALLY
  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    setIsSubmittingNew(true);
    try {
      const res = await fetch('/api/providers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          whatsapp_number: newPhone.trim(),
          category_id: newCategory,
          city_name: newCity,
          country_code: 'pk',
          preferred_contact: 'whatsapp',
          lang,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewName('');
        setNewPhone('');
        showToast('New provider registered and queued for review.');
        fetchProviders();
      }
    } catch (err) {
      console.error('Provider creation error:', err);
    } finally {
      setIsSubmittingNew(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 end-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-neutral-900 text-white rounded-2xl shadow-xl border border-neutral-800 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Provider Management & Controls
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Granular control over publishing status, search engine indexing (SEO), top slider placement, and verified trust badges.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/${lang}/admin/import`}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-gray-200/90 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-semibold text-xs transition-all shadow-2xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-[#006948]" />
            <span>Import CSV</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Provider</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Providers */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
            <Users className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-xl font-extrabold text-gray-900">{stats.total}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Directory Roster</div>
        </div>

        {/* Published */}
        <div
          onClick={() => {
            setStatusFilter('published');
            setCurrentPage(1);
          }}
          className={`bg-white border rounded-2xl p-3.5 shadow-2xs cursor-pointer transition-all ${
            statusFilter === 'published' ? 'border-[#006948] ring-2 ring-[#006948]/20 bg-emerald-50/20' : 'border-gray-200/90 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-700">{stats.published}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Public Live Profiles</div>
        </div>

        {/* Pending Review */}
        <div
          onClick={() => {
            setStatusFilter('pending');
            setCurrentPage(1);
          }}
          className={`bg-white border rounded-2xl p-3.5 shadow-2xs cursor-pointer transition-all ${
            statusFilter === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20' : 'border-gray-200/90 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-extrabold text-amber-700">{stats.pending}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Needs Approval</div>
        </div>

        {/* Suspended */}
        <div
          onClick={() => {
            setStatusFilter('suspended');
            setCurrentPage(1);
          }}
          className={`bg-white border rounded-2xl p-3.5 shadow-2xs cursor-pointer transition-all ${
            statusFilter === 'suspended' ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-gray-200/90 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-rose-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Suspended</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-extrabold text-rose-700">{stats.suspended}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Deactivated</div>
        </div>

        {/* SEO Indexed */}
        <div
          onClick={() => {
            setSeoFilter((prev) => (prev === 'indexed' ? 'all' : 'indexed'));
            setCurrentPage(1);
          }}
          className={`bg-white border rounded-2xl p-3.5 shadow-2xs cursor-pointer transition-all ${
            seoFilter === 'indexed' ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20' : 'border-gray-200/90 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">SEO Indexed</span>
            <Globe className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-blue-700">{stats.seoIndexed}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">In Sitemaps & Search</div>
        </div>

        {/* Featured */}
        <div
          onClick={() => {
            setFeaturedFilter((prev) => (prev === 'featured' ? 'all' : 'featured'));
            setCurrentPage(1);
          }}
          className={`bg-white border rounded-2xl p-3.5 shadow-2xs cursor-pointer transition-all ${
            featuredFilter === 'featured' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20' : 'border-gray-200/90 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Featured</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-amber-700">{stats.featured}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Top Sliders Active</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2">
            <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone (+92...), category, city..."
              className="w-full ps-10 pe-20 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948]"
            />
            <button
              type="submit"
              className="absolute end-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#006948] cursor-pointer"
            >
              <option value="all">Status: All Records ({totalCount})</option>
              <option value="published">Status: Published (Live)</option>
              <option value="pending">Status: Pending Review</option>
              <option value="suspended">Status: Suspended (Offline)</option>
            </select>
          </div>

          {/* SEO Index Filter */}
          <div>
            <select
              value={seoFilter}
              onChange={(e) => {
                setSeoFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#006948] cursor-pointer"
            >
              <option value="all">SEO: All Pages</option>
              <option value="indexed">SEO: Indexed Only (Google & Sitemap)</option>
              <option value="noindex">SEO: Noindex Only (Blocked)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#006948] cursor-pointer"
            >
              <option value="all">Category: All Trades</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Paginated Providers Moderation & Controls Table */}
      <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#006948]" />
            <span className="text-xs font-semibold">Loading Directory Providers...</span>
          </div>
        ) : providers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-800">No Providers Match the Query</p>
            <p className="text-xs text-gray-400 mt-0.5">Try clearing filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-3 px-4 text-start">Provider Details</th>
                  <th className="py-3 px-4 text-start">Contact / City</th>
                  <th className="py-3 px-4 text-start">1. Status</th>
                  <th className="py-3 px-4 text-center">2. SEO Index</th>
                  <th className="py-3 px-4 text-center">3. Top Slider</th>
                  <th className="py-3 px-4 text-center">4. Trust Badge</th>
                  <th className="py-3 px-4 text-center">5. Plan / Tier</th>
                  <th className="py-3 px-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {providers.map((p) => {
                  const isPublished = p.status === 'published' || (p.status as any) === 'approved';
                  const isPending = p.status === 'pending';
                  const isSuspended = p.status === 'suspended' || (p.status as any) === 'rejected';
                  const publicProfileUrl = `/${lang}/${p.country_code || 'pk'}/${p.city_slug || 'karachi'}/${p.category_id}/${p.slug}`;
                  const isUpdating = updatingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-gray-50/60 transition-colors ${
                        isPending ? 'bg-amber-50/20' : isSuspended ? 'bg-gray-50/40 opacity-80' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                            {p.avatar_url ? (
                              <img
                                src={p.avatar_url}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                                {p.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                              <span className="truncate">{p.name}</span>
                              {p.is_verified && (
                                <BadgeCheck className="w-3.5 h-3.5 text-[#006948] shrink-0" />
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 block truncate">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact & City */}
                      <td className="py-3 px-4 text-gray-700">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-800">
                            <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 fill-current shrink-0" />
                            <span>{p.whatsapp_number}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            <span>{p.cityName || p.city_slug}</span>
                            <span className="text-gray-300">•</span>
                            <span className="capitalize font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px]">
                              {p.category_id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CONTROL 1: STATUS DROPDOWN */}
                      <td className="py-3 px-4">
                        <div className="relative inline-block">
                          <select
                            value={isPublished ? 'published' : isSuspended ? 'suspended' : 'pending'}
                            disabled={isUpdating}
                            onChange={(e) =>
                              handleStatusChange(
                                p,
                                e.target.value as 'pending' | 'published' | 'suspended'
                              )
                            }
                            className={`text-xs font-bold px-2.5 py-1 rounded-xl border focus:outline-none cursor-pointer transition-all ${
                              isPublished
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : isPending
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            <option value="published">● Published</option>
                            <option value="pending">● Pending</option>
                            <option value="suspended">● Suspended</option>
                          </select>
                        </div>
                      </td>

                      {/* CONTROL 2: SEO INDEX TOGGLE */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleSeo(p)}
                          title={
                            p.seo_index
                              ? 'SEO Enabled: Search engines (Google/Bing/AI) can index profile and URL is in sitemap. Click to disable.'
                              : 'SEO Disabled: Injects noindex, nofollow and removes from sitemap. Click to enable.'
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            p.seo_index
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 shadow-2xs'
                              : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {p.seo_index ? (
                            <>
                              <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>Indexed</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>Noindex</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* CONTROL 3: FEATURED SLIDER TOGGLE */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleFeatured(p)}
                          title={
                            p.is_featured
                              ? 'Featured Provider: Promoted in top category sliders. Click to disable.'
                              : 'Standard Provider: Not featured in top sliders. Click to feature.'
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            p.is_featured
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 shadow-2xs'
                              : 'bg-gray-100 text-gray-400 border border-gray-200 hover:text-amber-600 hover:border-amber-200'
                          }`}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              p.is_featured ? 'fill-amber-500 text-amber-600' : 'text-gray-400'
                            }`}
                          />
                          <span>{p.is_featured ? 'Featured' : 'Standard'}</span>
                        </button>
                      </td>

                      {/* CONTROL 4: VERIFIED TRUST BADGE TOGGLE */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleVerified(p)}
                          title={
                            p.is_verified
                              ? 'Verified Badge Active: Green trust checkmark visible on profile and cards. Click to unverify.'
                              : 'Unverified: No badge shown. Click to verify.'
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            p.is_verified
                              ? 'bg-emerald-50 text-[#006948] border border-emerald-300 hover:bg-emerald-100 shadow-2xs'
                              : 'bg-gray-100 text-gray-400 border border-gray-200 hover:text-emerald-700 hover:border-emerald-200'
                          }`}
                        >
                          <BadgeCheck
                            className={`w-3.5 h-3.5 ${
                              p.is_verified ? 'text-[#006948]' : 'text-gray-400'
                            }`}
                          />
                          <span>{p.is_verified ? 'Verified' : 'Unverified'}</span>
                        </button>
                      </td>

                      {/* CONTROL 5: FREEMIUM TIER TOGGLE (Free vs Premium) */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleTogglePremium(p)}
                          title={
                            p.is_premium
                              ? 'Premium Tier Active: Unlocked Gallery, Google Maps, Certificates & SEO Target Areas. Click to downgrade to Free.'
                              : 'Free Tier Active: Limited to single photo, max 150-char bio, no gallery/map/certs/target-areas. Click to upgrade to Premium.'
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            p.is_premium
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 shadow-2xs font-bold'
                              : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-amber-50 hover:text-amber-800'
                          }`}
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${p.is_premium ? 'text-amber-600 fill-amber-500' : 'text-gray-400'}`} />
                          <span>{p.is_premium ? '★ Premium' : 'Free'}</span>
                        </button>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live public profile link */}
                          <Link
                            href={publicProfileUrl}
                            target="_blank"
                            title="View Public Profile Page"
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-[#006948] hover:border-[#006948] hover:bg-emerald-50 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleDeleteProvider(p.id, p.name)}
                            title="Delete Provider"
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Showing Page <span className="font-bold text-gray-900">{currentPage}</span> of{' '}
            <span className="font-bold text-gray-900">{totalPages}</span> ({totalCount} total
            providers)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* ADD PROVIDER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-200 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New Service Provider</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Direct registration into the global directory
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProvider} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Full Name / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Master Rashid AC Repair"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#006948]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Primary WhatsApp Number * (E.164)
                </label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +92 300 1234567"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#006948]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Service Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#006948] bg-white cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Operating City *
                  </label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#006948] bg-white cursor-pointer"
                  >
                    {CITIES.slice(0, 30).map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="px-4 py-2 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-semibold shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingNew ? 'Saving...' : 'Create Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProvidersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-xs">
          Loading Providers Management Table...
        </div>
      }
    >
      <AdminProvidersContent />
    </Suspense>
  );
}
