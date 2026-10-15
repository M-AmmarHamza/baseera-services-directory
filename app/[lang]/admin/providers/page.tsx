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
} from 'lucide-react';
import { WhatsAppIcon, CategoryIcon } from '@/components/Icons';
import { CATEGORIES, CITIES } from '@/lib/db';

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
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_verified: boolean;
  is_featured: boolean;
  avatar_url?: string;
  starting_price?: number;
  rating?: number;
  total_leads?: number;
  created_at: string;
}

function AdminProvidersContent() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const searchParams = useSearchParams();

  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
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

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: String(currentPage),
        limit: '10',
        status: statusFilter,
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
      }
    } catch (err) {
      console.error('Failed to load providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [currentPage, statusFilter, categoryFilter, cityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProviders();
  };

  // 1. STATUS TOGGLE (Pending, Approved, Rejected, Suspended)
  const handleStatusChange = async (providerId: string, newStatus: string) => {
    setUpdatingId(providerId);
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
        setProviders((prev) =>
          prev.map((p) =>
            p.id === providerId
              ? {
                  ...p,
                  status: newStatus as any,
                  is_verified: newStatus === 'approved',
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Status change error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // 2. FEATURED / VERIFIED TOGGLE
  const handleToggleFeatured = async (providerId: string, currentFeatured: boolean) => {
    setUpdatingId(providerId);
    const nextVal = !currentFeatured;
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: providerId,
          is_featured: nextVal,
        }),
      });

      if (res.ok) {
        setProviders((prev) =>
          prev.map((p) => (p.id === providerId ? { ...p, is_featured: nextVal } : p))
        );
      }
    } catch (err) {
      console.error('Featured toggle error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // 3. DELETE PROVIDER
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
        setProviders((prev) => prev.filter((p) => p.id !== providerId));
        setTotalCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // 4. ADD NEW PROVIDER MANUALLY
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
        fetchProviders();
      }
    } catch (err) {
      console.error('Provider creation error:', err);
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Approved</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
      case 'suspended':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <ShieldAlert className="w-3 h-3 text-gray-500" />
            <span>Suspended</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Provider Moderation & Directory Roster
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review new specialist submissions, toggle approval status, and curate featured listings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Provider</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2">
            <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone (+92...), category..."
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
              <option value="pending">Status: Pending Review</option>
              <option value="approved">Status: Approved (Live)</option>
              <option value="rejected">Status: Rejected</option>
              <option value="suspended">Status: Suspended</option>
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

      {/* Paginated Providers Moderation Table */}
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
                  <th className="py-3 px-4 text-start">Phone / WhatsApp</th>
                  <th className="py-3 px-4 text-start">Category</th>
                  <th className="py-3 px-4 text-start">Operating City</th>
                  <th className="py-3 px-4 text-start">Status Moderation</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {providers.map((p) => {
                  const publicProfileUrl = `/${lang}/${p.country_code || 'pk'}/${p.city_slug || 'karachi'}/${p.category_id}/${p.slug}`;
                  const isUpdating = updatingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-gray-50/60 transition-colors ${
                        p.status === 'pending' ? 'bg-amber-50/20' : ''
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
                              ID: {p.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-800">
                        <div className="flex items-center gap-1.5">
                          <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 fill-current shrink-0" />
                          <span>{p.whatsapp_number}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006948] font-bold text-[11px] capitalize whitespace-nowrap">
                          {p.category_id}
                        </span>
                      </td>

                      {/* City */}
                      <td className="py-3 px-4 text-gray-700 font-medium">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>{p.cityName || p.city_slug}</span>
                        </div>
                      </td>

                      {/* Status Dropdown Toggle */}
                      <td className="py-3 px-4">
                        <select
                          value={p.status || (p.is_verified ? 'approved' : 'pending')}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(p.id, e.target.value)}
                          className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer transition-all ${
                            p.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : p.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : p.status === 'rejected'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          <option value="approved">Approved</option>
                          <option value="pending">Pending</option>
                          <option value="rejected">Rejected</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleFeatured(p.id, p.is_featured)}
                          title="Toggle Featured Provider on Homepage"
                          className={`w-7 h-7 rounded-full inline-flex items-center justify-center transition-all cursor-pointer ${
                            p.is_featured
                              ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                              : 'bg-gray-100 text-gray-300 hover:text-amber-500'
                          }`}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${p.is_featured ? 'fill-amber-500' : ''}`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
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
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1"
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
                className="text-gray-400 hover:text-gray-600 p-1"
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

