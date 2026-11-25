'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import Papa from 'papaparse';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  ExternalLink,
  Trash2,
  Plus,
  RefreshCw,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Globe2,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  AlertCircle,
  Edit3,
  X,
  FileSpreadsheet,
  Download,
  CheckSquare,
  Square,
  Lock,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/Icons';
import { CATEGORIES, CITIES } from '@/lib/db';

interface AdminProvider {
  id: string;
  publicId?: number;
  name: string;
  fullName?: string;
  slug: string;
  trade_title: string;
  category_id: string;
  categoryId?: string;
  city_slug: string;
  cityId?: string;
  cityName: string;
  country_code: string;
  district?: string;
  target_areas?: string[];
  service_area?: string[];
  whatsapp_number: string;
  whatsappNumber?: string;
  phone_number?: string;
  status: 'pending' | 'published' | 'suspended';
  seo_index: boolean;
  is_verified: boolean;
  is_featured: boolean;
  is_premium: boolean;
  avatar_url?: string;
  profile_picture?: string;
  bio?: string;
  short_bio?: string;
  starting_price?: number;
  visiting_charges?: number;
  experience?: string | number;
  response_time?: string;
  gallery_images?: string[];
  certificates?: string[];
  google_map_url?: string;
  rating?: number;
  total_leads?: number;
  profile_views?: number;
  whatsapp_clicks?: number;
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
  premium: number;
}

function SuperAdminProvidersContent() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const searchParams = useSearchParams();

  // Authentication & Current User
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);

  // Providers list & stats
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [stats, setStats] = useState<ProviderStats>({
    total: 0,
    published: 0,
    pending: 0,
    suspended: 0,
    seoIndexed: 0,
    featured: 0,
    verified: 0,
    premium: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [seoFilter, setSeoFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [premiumFilter, setPremiumFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Multi-select Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Drawer / Modal for Create & Edit
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    trade_title: '',
    whatsappNumber: '',
    phoneNumber: '',
    cityId: CITIES[0]?.slug || 'karachi',
    categoryId: CATEGORIES[0]?.id || 'electrician',
    bio: '',
    target_areas: '',
    visiting_charges: 800,
    experience: '5+ Years',
    response_time: '15 mins',
    profile_picture: '',
    gallery_images: '',
    certificates: '',
    google_map_url: '',
    status: 'published' as 'pending' | 'published' | 'suspended',
    is_verified: true,
    is_featured: false,
    is_premium: false,
    seo_index: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<AdminProvider | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Bulk CSV Upload Modal
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvRawText, setCsvRawText] = useState('');
  const [csvParsedRows, setCsvParsedRows] = useState<any[]>([]);
  const [csvPreviewRows, setCsvPreviewRows] = useState<any[]>([]);
  const [csvDefaultStatus, setCsvDefaultStatus] = useState<'pending' | 'published'>('pending');
  const [csvAutoVerify, setCsvAutoVerify] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState<any>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvActiveTab, setCsvActiveTab] = useState<'all' | 'failed' | 'skipped'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current user
  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch('/api/admin/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) setCurrentUser(data.user);
        }
      } catch (err) {
        console.warn('Failed to load user:', err);
      }
    }
    loadMe();
  }, []);

  const isSuperAdmin = currentUser?.role?.toUpperCase() === 'SUPER_ADMIN' || currentUser?.role?.toUpperCase() === 'ADMIN';

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
        limit: '15',
        status: statusFilter,
        seo: seoFilter,
        featured: featuredFilter,
        verified: verifiedFilter,
        premium: premiumFilter,
        search,
        category: categoryFilter,
        city: cityFilter,
      });

      const res = await fetch(`/api/super-admin/providers?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load providers:', err);
      showToast('Error loading providers list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [currentPage, statusFilter, seoFilter, featuredFilter, verifiedFilter, premiumFilter, categoryFilter, cityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProviders();
  };

  // Inline Quick Toggles
  const handleQuickToggle = async (
    provider: AdminProvider,
    field: 'status' | 'seo_index' | 'is_featured' | 'is_verified' | 'is_premium',
    newValue: any
  ) => {
    setUpdatingId(provider.id);

    // Optimistic UI update
    setProviders((prev) =>
      prev.map((p) => (p.id === provider.id ? { ...p, [field]: newValue } : p))
    );

    try {
      const res = await fetch('/api/super-admin/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: provider.id,
          [field]: newValue,
        }),
      });

      if (res.ok) {
        showToast(
          `${provider.name || provider.fullName}: ${field.replace('_', ' ').toUpperCase()} updated`
        );
        fetchProviders();
      } else {
        const data = await res.json();
        showToast(`Failed to update ${field}: ${data.error || 'Server error'}`);
        fetchProviders();
      }
    } catch (err) {
      console.error('Quick toggle error:', err);
      showToast('Network error updating attribute');
      fetchProviders();
    } finally {
      setUpdatingId(null);
    }
  };

  // Multi-Select Handlers
  const handleSelectAllOnPage = () => {
    if (selectedIds.length === providers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(providers.map((p) => p.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Action Execution
  const handleBulkAction = async (action: 'publish' | 'suspend' | 'index' | 'noindex' | 'delete') => {
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      if (!isSuperAdmin) {
        showToast('Bulk delete is strictly restricted to SUPER_ADMIN.');
        return;
      }
      if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} provider(s)?`)) {
        return;
      }
    }

    setBulkActionLoading(true);
    try {
      const res = await fetch('/api/super-admin/providers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ids: selectedIds,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Bulk action '${action.toUpperCase()}' completed for ${data.count} provider(s).`);
        setSelectedIds([]);
        fetchProviders();
      } else {
        showToast(data.error || 'Bulk action failed');
      }
    } catch (err) {
      console.error('Bulk action error:', err);
      showToast('Network error during bulk action');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Open Drawer for Create
  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      fullName: '',
      trade_title: '',
      whatsappNumber: '',
      phoneNumber: '',
      cityId: CITIES[0]?.slug || 'karachi',
      categoryId: CATEGORIES[0]?.id || 'electrician',
      bio: '',
      target_areas: '',
      visiting_charges: 800,
      experience: '5+ Years',
      response_time: '15 mins',
      profile_picture: '',
      gallery_images: '',
      certificates: '',
      google_map_url: '',
      status: 'published',
      is_verified: true,
      is_featured: false,
      is_premium: false,
      seo_index: true,
    });
    setFormError(null);
    setDrawerOpen(true);
  };

  // Open Drawer for Edit
  const handleOpenEdit = (provider: AdminProvider) => {
    setIsEditing(true);
    setEditingId(provider.id);
    setFormData({
      fullName: provider.fullName || provider.name || '',
      trade_title: provider.trade_title || '',
      whatsappNumber: provider.whatsappNumber || provider.whatsapp_number || '',
      phoneNumber: provider.phone_number || '',
      cityId: provider.cityId || provider.city_slug || 'karachi',
      categoryId: provider.categoryId || provider.category_id || 'electrician',
      bio: provider.bio || provider.short_bio || '',
      target_areas: Array.isArray(provider.target_areas)
        ? provider.target_areas.join(', ')
        : Array.isArray(provider.service_area)
        ? provider.service_area.join(', ')
        : '',
      visiting_charges: provider.visiting_charges || provider.starting_price || 800,
      experience: String(provider.experience || '5+ Years'),
      response_time: provider.response_time || '15 mins',
      profile_picture: provider.profile_picture || provider.avatar_url || '',
      gallery_images: Array.isArray(provider.gallery_images)
        ? provider.gallery_images.join('\n')
        : '',
      certificates: Array.isArray(provider.certificates)
        ? provider.certificates.join(', ')
        : '',
      google_map_url: provider.google_map_url || '',
      status: provider.status,
      is_verified: provider.is_verified,
      is_featured: provider.is_featured,
      is_premium: provider.is_premium,
      seo_index: provider.seo_index,
    });
    setFormError(null);
    setDrawerOpen(true);
  };

  // Submit Drawer Form (Create / Update)
  const handleDrawerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    const payload: any = {
      ...formData,
      target_areas: formData.target_areas
        ? formData.target_areas.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      certificates: formData.certificates
        ? formData.certificates.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      gallery_images: formData.gallery_images
        ? formData.gallery_images.split('\n').map((s) => s.trim()).filter(Boolean)
        : [],
    };

    try {
      if (isEditing && editingId) {
        payload.id = editingId;
        const res = await fetch('/api/super-admin/providers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('Provider profile updated successfully.');
          setDrawerOpen(false);
          fetchProviders();
        } else {
          setFormError(data.error || 'Failed to update provider');
        }
      } else {
        const res = await fetch('/api/super-admin/providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(`Provider #${data.provider?.publicId || 'New'} created successfully!`);
          setDrawerOpen(false);
          fetchProviders();
        } else {
          setFormError(data.error || 'Failed to create provider');
        }
      }
    } catch (err: any) {
      console.error('Drawer form submission error:', err);
      setFormError(err?.message || 'Network error submitting provider');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Provider Single
  const handleDeleteConfirm = async () => {
    if (!providerToDelete) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/super-admin/providers?id=${providerToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`Provider ${providerToDelete.name} permanently deleted.`);
        setDeleteModalOpen(false);
        setProviderToDelete(null);
        fetchProviders();
      } else {
        showToast(data.error || 'Failed to delete provider');
      }
    } catch (err) {
      console.error('Delete provider error:', err);
      showToast('Network error deleting provider');
    } finally {
      setDeleteLoading(false);
    }
  };

  // CSV Import Handlers
  const handleCsvFileProcess = (selectedFile: File) => {
    setCsvError(null);
    setCsvResult(null);

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setCsvError('Please upload a valid .csv file.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setCsvError(`File size exceeds 5MB limit (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB).`);
      return;
    }

    setCsvFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvRawText(content);
      Papa.parse(content, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (h) => h.trim(),
        complete: (results) => {
          const rows = results.data as any[];
          if (rows.length > 500) {
            setCsvError(`Maximum 500 rows per batch limit exceeded. Found: ${rows.length} rows.`);
            return;
          }
          setCsvParsedRows(rows);
          setCsvPreviewRows(rows.slice(0, 5));
        },
      });
    };
    reader.readAsText(selectedFile, 'utf-8');
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = [
      'fullName,whatsappNumber,categorySlug,citySlug,trade_title,target_areas,bio,starting_price,is_premium,status,profile_type,gallery_images,certificates,google_map_url',
      'Muhammad Tariq,+923001234567,electrician,karachi,Certified Master Electrician,Korangi|DHA|Clifton,15+ years experience in domestic and commercial electrical repairs.,800,false,pending,individual,,,',
      'Ahmed Al-Mansoor,+971501234567,ac-technician,dubai,Chiller & VRF Specialist,Business Bay|Downtown|Marina,24/7 emergency central and split AC repair across Dubai. Licensed master HVAC engineering contractor.,250,true,published,shop,https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800|https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800,HVAC Master License|DAIKIN Certified,https://maps.google.com/?q=25.2048,55.2708',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'baseera_providers_bulk_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadFailedCsv = () => {
    if (!csvResult) return;
    const allErrors = [
      ...(csvResult.failedRows || []).map((f: any) => ({
        ...f.rawRow,
        error_reason: f.reason,
        error_type: 'VALIDATION_FAILED',
      })),
      ...(csvResult.skippedRows || []).map((s: any) => ({
        ...s.rawRow,
        error_reason: s.reason,
        error_type: 'DUPLICATE_PHONE',
      })),
    ];
    if (allErrors.length === 0) return;
    const csvStr = Papa.unparse(allErrors);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'failed_providers_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvImportSubmit = async () => {
    if (!csvRawText.trim()) return;
    setCsvUploading(true);
    setCsvError(null);
    setCsvResult(null);

    try {
      const res = await fetch('/api/super-admin/providers/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvContent: csvRawText,
          defaultStatus: csvDefaultStatus,
          autoVerify: csvAutoVerify,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCsvResult(data);
        showToast(data.message || `Successfully imported ${data.importedCount} providers!`);
        fetchProviders();
      } else {
        setCsvError(data.error || 'Bulk upload failed. Please review your file.');
      }
    } catch (err: any) {
      setCsvError(err?.message || 'Network error during bulk CSV upload.');
    } finally {
      setCsvUploading(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Provider Directory Management
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              CRUD & RBAC
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Search, moderate, inspect Public IDs (1001+), toggle SEO indexing, and edit complete provider records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setCsvModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors shadow-sm"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
            <span>Bulk CSV Upload</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-lg shadow-md shadow-emerald-500/20 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Create Provider</span>
          </button>
        </div>
      </div>

      {/* Search & Dynamic Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          {/* Main Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by #Public ID (e.g. #1001), Name, WhatsApp, City, or Category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm"
          >
            Search
          </button>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
              setSeoFilter('all');
              setFeaturedFilter('all');
              setVerifiedFilter('all');
              setPremiumFilter('all');
              setCategoryFilter('all');
              setCityFilter('all');
              setCurrentPage(1);
            }}
            className="w-full md:w-auto px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
          >
            Reset
          </button>
        </form>

        {/* Filter Pills / Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
          {/* Status */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-1.5 text-xs text-slate-200 focus:border-emerald-500"
            >
              <option value="all">All Statuses ({stats.total})</option>
              <option value="published">Published ({stats.published})</option>
              <option value="pending">Pending ({stats.pending})</option>
              <option value="suspended">Suspended ({stats.suspended})</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              City
            </label>
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-1.5 text-xs text-slate-200 focus:border-emerald-500"
            >
              <option value="all">All Cities</option>
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-1.5 text-xs text-slate-200 focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* SEO Index */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              SEO Index
            </label>
            <select
              value={seoFilter}
              onChange={(e) => {
                setSeoFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-1.5 text-xs text-slate-200 focus:border-emerald-500"
            >
              <option value="all">All SEO</option>
              <option value="indexed">Indexed Only ({stats.seoIndexed})</option>
              <option value="noindex">No-Index</option>
            </select>
          </div>

          {/* Premium */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Premium Tier
            </label>
            <select
              value={premiumFilter}
              onChange={(e) => {
                setPremiumFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-1.5 text-xs text-slate-200 focus:border-emerald-500"
            >
              <option value="all">All Tiers</option>
              <option value="premium">Premium ({stats.premium})</option>
              <option value="standard">Standard</option>
            </select>
          </div>

          {/* Verified */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Verification
            </label>
            <select
              value={verifiedFilter}
              onChange={(e) => {
                setVerifiedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-1.5 text-xs text-slate-200 focus:border-emerald-500"
            >
              <option value="all">All</option>
              <option value="verified">Verified ({stats.verified})</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating / Sticky Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-16 z-30 bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 rounded-xl p-3 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-md text-xs border border-emerald-500/30">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs text-slate-300">
              Bulk actions for selected directory records:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleBulkAction('publish')}
              disabled={bulkActionLoading}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Publish Selected
            </button>
            <button
              onClick={() => handleBulkAction('suspend')}
              disabled={bulkActionLoading}
              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Suspend Selected
            </button>
            <button
              onClick={() => handleBulkAction('index')}
              disabled={bulkActionLoading}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Set Index
            </button>
            <button
              onClick={() => handleBulkAction('noindex')}
              disabled={bulkActionLoading}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Set No-Index
            </button>

            {isSuperAdmin ? (
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={bulkActionLoading}
                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Selected</span>
              </button>
            ) : (
              <span
                title="Super Admin role required for hard deletes"
                className="px-2.5 py-1.5 bg-slate-800/80 text-slate-400 rounded text-xs font-semibold cursor-not-allowed flex items-center gap-1 border border-slate-700/60"
              >
                <Lock className="w-3 h-3" />
                <span>Delete (Super Admin)</span>
              </span>
            )}

            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1.5 text-slate-400 hover:text-white text-xs font-medium ml-1"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Main Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-3 text-center w-10">
                  <button
                    onClick={handleSelectAllOnPage}
                    className="text-slate-400 hover:text-white focus:outline-none"
                    title="Select / Deselect All on page"
                  >
                    {selectedIds.length === providers.length && providers.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-3">#Public ID</th>
                <th className="py-3.5 px-3">Provider Profile</th>
                <th className="py-3.5 px-3">Category & City</th>
                <th className="py-3.5 px-3">Contact</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-center">Toggles (SEO / Tier / Badges)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                    <span className="text-xs">Loading verified providers database...</span>
                  </td>
                </tr>
              ) : providers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto text-amber-400 mb-2" />
                    <span className="text-xs">No providers found matching your filter criteria.</span>
                  </td>
                </tr>
              ) : (
                providers.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isBusy = updatingId === p.id;
                  const profileUrl = `/${lang}/${p.country_code || 'pk'}/${p.city_slug || 'karachi'}/${p.category_id || 'electrician'}/${p.slug}`;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(p.id)}
                          className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950 cursor-pointer"
                        />
                      </td>

                      {/* Public ID */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          #{p.publicId || '1001'}
                        </span>
                      </td>

                      {/* Provider Profile */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3 min-w-[180px]">
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                            {p.profile_picture || p.avatar_url ? (
                              <img
                                src={p.profile_picture || p.avatar_url}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                {p.name?.charAt(0) || 'P'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-xs truncate">
                                {p.name || p.fullName}
                              </span>
                              {p.is_verified && (
                                <span title="Verified Provider" className="inline-flex">
                                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                </span>
                              )}
                              {p.is_premium && (
                                <span title="Premium Tier" className="inline-flex">
                                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                              {p.trade_title || 'Service Specialist'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category & City */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60 uppercase">
                            {p.category_id || p.categoryId}
                          </span>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-slate-400" />
                            <span>{p.cityName || p.city_slug}</span>
                            <span className="uppercase text-[9px] text-slate-400 font-mono">
                              ({p.country_code || 'PK'})
                            </span>
                          </p>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <a
                            href={`https://wa.me/${p.whatsapp_number?.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <WhatsAppIcon className="w-3 h-3 fill-emerald-400" />
                            <span>{p.whatsapp_number || 'N/A'}</span>
                          </a>
                          {p.phone_number && p.phone_number !== p.whatsapp_number && (
                            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5 text-slate-400" />
                              <span>{p.phone_number}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <select
                          value={p.status}
                          disabled={isBusy}
                          onChange={(e) =>
                            handleQuickToggle(p, 'status', e.target.value as any)
                          }
                          className={`text-xs font-bold rounded px-2 py-1 border transition-colors cursor-pointer focus:outline-none ${
                            p.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : p.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          <option value="published" className="bg-slate-900 text-emerald-400">
                            PUBLISHED
                          </option>
                          <option value="pending" className="bg-slate-900 text-amber-400">
                            PENDING
                          </option>
                          <option value="suspended" className="bg-slate-900 text-rose-400">
                            SUSPENDED
                          </option>
                        </select>
                      </td>

                      {/* Quick Toggles */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                          {/* SEO Index Toggle */}
                          <button
                            onClick={() => handleQuickToggle(p, 'seo_index', !p.seo_index)}
                            disabled={isBusy}
                            title={p.seo_index ? 'Indexed in Google / Sitemap (Click to no-index)' : 'No-index (Click to index)'}
                            className={`p-1.5 rounded transition-colors ${
                              p.seo_index
                                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {p.seo_index ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          {/* Featured Toggle */}
                          <button
                            onClick={() => handleQuickToggle(p, 'is_featured', !p.is_featured)}
                            disabled={isBusy}
                            title={p.is_featured ? 'Featured on category page' : 'Set as Featured'}
                            className={`p-1.5 rounded transition-colors ${
                              p.is_featured
                                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>

                          {/* Verified Toggle */}
                          <button
                            onClick={() => handleQuickToggle(p, 'is_verified', !p.is_verified)}
                            disabled={isBusy}
                            title={p.is_verified ? 'Verified provider badge active' : 'Verify provider'}
                            className={`p-1.5 rounded transition-colors ${
                              p.is_verified
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Premium Toggle */}
                          <button
                            onClick={() => handleQuickToggle(p, 'is_premium', !p.is_premium)}
                            disabled={isBusy}
                            title={p.is_premium ? 'Premium Tier' : 'Upgrade to Premium'}
                            className={`p-1.5 rounded transition-colors ${
                              p.is_premium
                                ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Drawer Trigger */}
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                            title="Edit all provider fields"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Public View */}
                          <Link
                            href={profileUrl}
                            target="_blank"
                            className="p-1.5 text-slate-300 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                            title="View Public Profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Action (Gated to Super Admin) */}
                          {isSuperAdmin ? (
                            <button
                              onClick={() => {
                                setProviderToDelete(p);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                              title="Delete provider permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              disabled
                              title="Delete restricted to SUPER_ADMIN"
                              className="p-1.5 text-slate-400 opacity-40 cursor-not-allowed"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{providers.length}</span> of{' '}
            <span className="font-semibold text-slate-200">{totalCount}</span> providers across directory
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1 || loading}
              className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1 font-mono text-slate-300">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages || loading}
              className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* FULL CREATE / EDIT PROVIDER DRAWER (15 Fields)            */}
      {/* ========================================================== */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {isEditing ? `Edit Provider: ${formData.fullName}` : 'Create New Directory Provider'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full 15-field record with automated Public ID and Zod schema validation.
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Form Body */}
            <form onSubmit={handleDrawerSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Full Name & Trade Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Ahmad"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Trade / Professional Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Inverter AC Technician"
                    value={formData.trade_title}
                    onChange={(e) => setFormData({ ...formData, trade_title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* 2. WhatsApp Number & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    WhatsApp Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+923001234567"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Alternate Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="+923211234567"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* 3. City & Category Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Primary City <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.cityId}
                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CITIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name} ({c.countryCode.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Category Specialty <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Complete Bio */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Biography / Service Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail 10+ years experience, services covered, warranty policies..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* 5. Target Areas & Visiting Charges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Target Areas (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="PECHS, Clifton, DHA Phase 1-8"
                    value={formData.target_areas}
                    onChange={(e) => setFormData({ ...formData, target_areas: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Visiting / Call-Out Fee
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="800"
                    value={formData.visiting_charges}
                    onChange={(e) =>
                      setFormData({ ...formData, visiting_charges: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* 6. Experience & Response Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Experience Level
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8+ Years"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Average Response Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 mins"
                    value={formData.response_time}
                    onChange={(e) => setFormData({ ...formData, response_time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* 7. Profile Picture URL & Preview */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Profile Picture URL
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.profile_picture}
                    onChange={(e) => setFormData({ ...formData, profile_picture: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  {formData.profile_picture && (
                    <img
                      src={formData.profile_picture}
                      alt="Preview"
                      className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      onError={(e) => ((e.target as any).style.display = 'none')}
                    />
                  )}
                </div>
              </div>

              {/* 8. Gallery Images (One per line) */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Gallery Work Samples (One image URL per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="https://images.unsplash.com/photo-1&#10;https://images.unsplash.com/photo-2"
                  value={formData.gallery_images}
                  onChange={(e) => setFormData({ ...formData, gallery_images: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              {/* 9. Certificates & Google Map URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Certifications / Diplomas (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="DAE Electrical, NAVTTC Certified"
                    value={formData.certificates}
                    onChange={(e) => setFormData({ ...formData, certificates: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Google Maps / Shop URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://maps.google.com/?q=..."
                    value={formData.google_map_url}
                    onChange={(e) => setFormData({ ...formData, google_map_url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* 10. Lifecycle Status & Boolean Flags */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-200 block mb-2 uppercase tracking-wider">
                    Lifecycle Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['published', 'pending', 'suspended'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: s })}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                          formData.status === s
                            ? s === 'published'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                              : s === 'pending'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.seo_index}
                      onChange={(e) => setFormData({ ...formData, seo_index: e.target.checked })}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950"
                    />
                    <span>SEO Indexed</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_verified}
                      onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                      className="rounded border-slate-700 text-blue-500 focus:ring-0 bg-slate-950"
                    />
                    <span>Verified Badge</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-950"
                    />
                    <span>Featured</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_premium}
                      onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                      className="rounded border-slate-700 text-purple-500 focus:ring-0 bg-slate-950"
                    />
                    <span>Premium Tier</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isEditing ? 'Save Provider Changes' : 'Create & Publish Provider'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* BULK CSV UPLOAD MODAL (OWASP HARDENED & PRODUCTION READY)  */}
      {/* ========================================================== */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">Bulk CSV Provider Upload</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      OWASP Protected
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Batch ingest providers with sequential Public IDs (1001+), anti-macro injection defense, and E.164 normalization.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCsvModalOpen(false);
                  if (csvResult?.importedCount > 0) fetchProviders();
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {/* Template Download Toolbar */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Need the exact CSV header structure? Download our official pre-formatted template with sample rows.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 hover:border-emerald-500/40 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV Template</span>
                </button>
              </div>

              {/* POST-UPLOAD SUMMARY REPORT (If Upload Finished) */}
              {csvResult ? (
                <div className="space-y-5">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Total Rows</p>
                      <p className="text-xl font-extrabold text-white mt-0.5">{csvResult.totalRows}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                      <p className="text-[10px] font-bold uppercase text-emerald-400">Imported Successfully</p>
                      <p className="text-xl font-extrabold text-emerald-300 mt-0.5">{csvResult.importedCount}</p>
                      {csvResult.publicIdRange && (
                        <span className="text-[10px] font-mono font-bold text-emerald-400/90 block mt-0.5">
                          Public IDs: {csvResult.publicIdRange}
                        </span>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30">
                      <p className="text-[10px] font-bold uppercase text-amber-400">Skipped (Duplicate Phone)</p>
                      <p className="text-xl font-extrabold text-amber-300 mt-0.5">{csvResult.skippedCount || 0}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30">
                      <p className="text-[10px] font-bold uppercase text-rose-400">Validation Failures</p>
                      <p className="text-xl font-extrabold text-rose-300 mt-0.5">{csvResult.failedCount || 0}</p>
                    </div>
                  </div>

                  {/* Actions for Errors / Skipped */}
                  {((csvResult.failedRows && csvResult.failedRows.length > 0) ||
                    (csvResult.skippedRows && csvResult.skippedRows.length > 0)) && (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Issue Breakdown (
                            {(csvResult.failedRows?.length || 0) + (csvResult.skippedRows?.length || 0)} rows)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleDownloadFailedCsv}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Failed & Skipped Rows CSV</span>
                        </button>
                      </div>

                      {/* Error & Skipped Table */}
                      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden max-h-56 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase font-bold sticky top-0 border-b border-slate-800">
                            <tr>
                              <th className="px-3.5 py-2">Row</th>
                              <th className="px-3.5 py-2">Name</th>
                              <th className="px-3.5 py-2">WhatsApp</th>
                              <th className="px-3.5 py-2">Type</th>
                              <th className="px-3.5 py-2">Exact Error Reason</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-medium">
                            {/* Validation Failures */}
                            {csvResult.failedRows?.map((f: any, idx: number) => (
                              <tr key={`fail-${idx}`} className="hover:bg-rose-950/10 text-rose-200">
                                <td className="px-3.5 py-2 font-mono text-[11px] text-slate-400">#{f.rowNumber}</td>
                                <td className="px-3.5 py-2 font-semibold text-white">{f.name || 'Unnamed'}</td>
                                <td className="px-3.5 py-2 font-mono text-[11px] text-slate-400">{f.phone || '-'}</td>
                                <td className="px-3.5 py-2">
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                    Rejected
                                  </span>
                                </td>
                                <td className="px-3.5 py-2 text-rose-300 text-[11px]">{f.reason}</td>
                              </tr>
                            ))}
                            {/* Skipped Duplicate Phones */}
                            {csvResult.skippedRows?.map((s: any, idx: number) => (
                              <tr key={`skip-${idx}`} className="hover:bg-amber-950/10 text-amber-200">
                                <td className="px-3.5 py-2 font-mono text-[11px] text-slate-400">#{s.rowNumber}</td>
                                <td className="px-3.5 py-2 font-semibold text-white">{s.name || 'Unnamed'}</td>
                                <td className="px-3.5 py-2 font-mono text-[11px] text-slate-400">{s.phone}</td>
                                <td className="px-3.5 py-2">
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    Duplicate
                                  </span>
                                </td>
                                <td className="px-3.5 py-2 text-amber-300 text-[11px]">{s.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* PRE-UPLOAD FORM & PREVIEW */
                <div className="space-y-5">
                  {/* File Upload Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      csvFile
                        ? 'border-emerald-500/60 bg-emerald-950/10'
                        : 'border-slate-700 hover:border-emerald-500/60 bg-slate-950/40 hover:bg-slate-950/60'
                    }`}
                  >
                    <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-white">
                      {csvFile ? csvFile.name : 'Click to select CSV file from your computer'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {csvFile
                        ? `${(csvFile.size / 1024).toFixed(1)} KB • ${csvParsedRows.length} rows parsed`
                        : 'Maximum 5MB file size • Up to 500 providers per batch'}
                    </p>
                    <span className="inline-block mt-3 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                      {csvFile ? 'Click to change file' : 'Browse Local Files'}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleCsvFileProcess(f);
                      }}
                    />
                  </div>

                  {/* Batch Configuration Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Default Status (If omitted in CSV)
                      </label>
                      <select
                        value={csvDefaultStatus}
                        onChange={(e) => setCsvDefaultStatus(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="pending">pending (Requires admin review)</option>
                        <option value="published">published (Live in directory immediately)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        id="autoVerify"
                        checked={csvAutoVerify}
                        onChange={(e) => setCsvAutoVerify(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700"
                      />
                      <label htmlFor="autoVerify" className="text-xs text-slate-300 font-medium select-none cursor-pointer">
                        Mark all valid imported providers as <span className="font-bold text-white">Verified</span>
                      </label>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {csvError && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{csvError}</span>
                    </div>
                  )}

                  {/* Client-Side Preview Table (First 5 Rows) */}
                  {csvPreviewRows.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold uppercase tracking-wider text-slate-300 text-[10px] flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          Client-Side Preview (First {csvPreviewRows.length} of {csvParsedRows.length} rows)
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-400 font-mono">
                          {csvParsedRows.length} Total Rows Ready
                        </span>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden overflow-x-auto shadow-inner">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-900/80 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                            <tr>
                              <th className="px-3.5 py-2.5">#</th>
                              <th className="px-3.5 py-2.5">Full Name</th>
                              <th className="px-3.5 py-2.5">WhatsApp</th>
                              <th className="px-3.5 py-2.5">Category</th>
                              <th className="px-3.5 py-2.5">City</th>
                              <th className="px-3.5 py-2.5">Price</th>
                              <th className="px-3.5 py-2.5 text-center">Tier</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                            {csvPreviewRows.map((r, idx) => {
                              const isPrem =
                                r.is_premium === true ||
                                String(r.is_premium || '').toLowerCase() === 'true';
                              return (
                                <tr key={idx} className="hover:bg-slate-800/30">
                                  <td className="px-3.5 py-2 font-mono text-[11px] text-slate-400">
                                    {idx + 1}
                                  </td>
                                  <td className="px-3.5 py-2 font-semibold text-white">
                                    {r.fullName || r.full_name || r.name || 'N/A'}
                                  </td>
                                  <td className="px-3.5 py-2 font-mono text-[11px] text-slate-300">
                                    {r.whatsappNumber || r.whatsapp_number || r.phone || 'N/A'}
                                  </td>
                                  <td className="px-3.5 py-2">
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                                      {r.categorySlug || r.category_slug || r.category || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="px-3.5 py-2 text-slate-300">
                                    {r.citySlug || r.city_slug || r.city || 'N/A'}
                                  </td>
                                  <td className="px-3.5 py-2 font-mono text-emerald-400">
                                    {r.starting_price || r.startingPrice || 500}
                                  </td>
                                  <td className="px-3.5 py-2 text-center">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                        isPrem
                                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                          : 'bg-slate-800 text-slate-400'
                                      }`}
                                    >
                                      {isPrem ? 'Premium' : 'Free'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
              {csvResult ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setCsvResult(null);
                      setCsvFile(null);
                      setCsvRawText('');
                      setCsvParsedRows([]);
                      setCsvPreviewRows([]);
                    }}
                    className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Upload Another Batch
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCsvModalOpen(false);
                      fetchProviders();
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    Done & Refresh Providers
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setCsvModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleCsvImportSubmit}
                    disabled={!csvRawText.trim() || csvUploading}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {csvUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Validating & Ingesting ({csvParsedRows.length} rows)...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Execute Bulk Upload ({csvParsedRows.length || 0} rows)</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      {/* ========================================================== */}
      {/* DELETE CONFIRMATION MODAL (Strictly SUPER_ADMIN)           */}
      {/* ========================================================== */}
      {deleteModalOpen && providerToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Permanently Delete Provider?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Action requires SUPER_ADMIN authority and is recorded in the immutable audit log.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
              <p>
                <span className="text-slate-400">Name:</span>{' '}
                <strong className="text-white">{providerToDelete.name}</strong>
              </p>
              <p>
                <span className="text-slate-400">Public ID:</span>{' '}
                <span className="font-mono text-emerald-400">#{providerToDelete.publicId || '1001'}</span>
              </p>
              <p>
                <span className="text-slate-400">City / Category:</span>{' '}
                <span>
                  {providerToDelete.cityName} / {providerToDelete.category_id}
                </span>
              </p>
            </div>

            <p className="text-[11px] text-rose-400/90 leading-relaxed">
              Warning: Deleting this provider will remove it from all live directory search results, city hubs, and sitemaps immediately.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProviderToDelete(null);
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                {deleteLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Permanent Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuperAdminProvidersPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-slate-400 text-xs">
          Loading Super Admin Providers Control Center...
        </div>
      }
    >
      <SuperAdminProvidersContent />
    </Suspense>
  );
}
