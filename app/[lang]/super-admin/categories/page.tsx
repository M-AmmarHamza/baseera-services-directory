'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Layers,
  Search,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  X,
  AlertCircle,
  Lock,
  Sparkles,
  Zap,
  BatteryCharging,
  Sun,
  Power,
  Wrench,
  Gauge,
  ArrowDownToLine,
  Droplets,
  Wind,
  Flame,
  Hammer,
  Paintbrush,
  BrickWall,
  Cctv,
  ChefHat,
  Truck,
  Key,
  Shield,
  Home,
  Check,
} from 'lucide-react';
import { CategoryItem } from '@/lib/taxonomy-db';
import { CategoryIcon } from '@/components/Icons';

const ICON_CHOICES = [
  { name: 'Wrench', icon: Wrench, label: 'Plumbing / Mechanics' },
  { name: 'Zap', icon: Zap, label: 'Electrician' },
  { name: 'BatteryCharging', icon: BatteryCharging, label: 'UPS & Inverter' },
  { name: 'Sun', icon: Sun, label: 'Solar Energy' },
  { name: 'Power', icon: Power, label: 'Generator' },
  { name: 'Wind', icon: Wind, label: 'AC Technician' },
  { name: 'Droplets', icon: Droplets, label: 'Tank Cleaning' },
  { name: 'Flame', icon: Flame, label: 'Geyser Repair' },
  { name: 'Hammer', icon: Hammer, label: 'Carpentry' },
  { name: 'BrickWall', icon: BrickWall, label: 'Mason / Raj Mistri' },
  { name: 'Paintbrush', icon: Paintbrush, label: 'Painter' },
  { name: 'Cctv', icon: Cctv, label: 'Security & CCTV' },
  { name: 'Gauge', icon: Gauge, label: 'Water Pump' },
  { name: 'ArrowDownToLine', icon: ArrowDownToLine, label: 'Water Boring' },
  { name: 'ChefHat', icon: ChefHat, label: 'Catering / Chef' },
  { name: 'Truck', icon: Truck, label: 'Movers & Packers' },
  { name: 'Key', icon: Key, label: 'Locksmith' },
  { name: 'Sparkles', icon: Sparkles, label: 'Cleaning Services' },
  { name: 'Shield', icon: Shield, label: 'Security' },
  { name: 'Home', icon: Home, label: 'Interior / Home' },
];

export default function CategoriesManagerPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);
  const isSuperAdmin = currentUser?.role?.toUpperCase() === 'SUPER_ADMIN' || currentUser?.role?.toUpperCase() === 'ADMIN';

  // Drawer / Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CategoryItem>({
    id: '',
    name_en: '',
    name_ur: '',
    slug_en: '',
    slug_ur: '',
    icon: 'Wrench',
    sortOrder: 1,
    isActive: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
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
    loadUser();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/categories');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      showToast('Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Quick Toggle Active Status
  const handleToggleActive = async (category: CategoryItem) => {
    const newStatus = !category.isActive;
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? { ...c, isActive: newStatus } : c))
    );

    try {
      const res = await fetch('/api/super-admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: category.id, isActive: newStatus }),
      });
      if (res.ok) {
        showToast(`${category.name_en}: Status updated to ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);
      } else {
        fetchCategories();
      }
    } catch {
      fetchCategories();
    }
  };

  // Reorder Item (Move Up or Down)
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newList = [...categories];
    const [moved] = newList.splice(index, 1);
    newList.splice(targetIndex, 0, moved);

    setCategories(newList);

    try {
      const orderedIds = newList.map((c) => c.id);
      await fetch('/api/super-admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
      showToast('Category sort order updated');
    } catch (err) {
      console.error('Reorder error:', err);
      fetchCategories();
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      name_en: '',
      name_ur: '',
      slug_en: '',
      slug_ur: '',
      icon: 'Wrench',
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setFormError(null);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: CategoryItem) => {
    setIsEditing(true);
    setFormData({
      id: item.id,
      name_en: item.name_en,
      name_ur: item.name_ur || '',
      slug_en: item.slug_en || item.id,
      slug_ur: item.slug_ur || '',
      icon: item.icon || 'Wrench',
      sortOrder: item.sortOrder || 1,
      isActive: item.isActive,
    });
    setFormError(null);
    setModalOpen(true);
  };

  // Submit Category
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/super-admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`Category '${data.category.name_en}' saved successfully.`);
        setModalOpen(false);
        fetchCategories();
      } else {
        setFormError(data.error || 'Failed to save category');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Network error saving category');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/super-admin/categories?id=${categoryToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`Category ${categoryToDelete.name_en} deleted.`);
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        fetchCategories();
      } else {
        showToast(data.error || 'Failed to delete category');
      }
    } catch {
      showToast('Error deleting category');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name_en.toLowerCase().includes(q) ||
      c.name_ur.toLowerCase().includes(q) ||
      c.slug_en.toLowerCase().includes(q) ||
      c.slug_ur.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Service Taxonomy & Categories
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Phase 2 CMS
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage the 24+ professional trades, English/Urdu titles, bilingual SEO slugs, and Lucide icon mappings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-lg shadow-md shadow-emerald-500/20 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories by English name, Urdu name, or slug (e.g. Mason, راج مستری, bijli-mistri)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-3 text-center w-12">#Order</th>
                <th className="py-3.5 px-4">Icon & Specialty</th>
                <th className="py-3.5 px-4">Urdu Name</th>
                <th className="py-3.5 px-4">English Slug (Canonical)</th>
                <th className="py-3.5 px-4">Roman Urdu Slug</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400 mb-2" />
                    <span className="text-xs">Loading categories taxonomy...</span>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto text-amber-400 mb-2" />
                    <span className="text-xs">No categories match your search query.</span>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Sort Order Controls */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <span className="font-mono text-slate-400 text-xs font-semibold mr-1">
                          {item.sortOrder || index + 1}
                        </span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMoveOrder(index, 'up')}
                            disabled={index === 0}
                            className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(index, 'down')}
                            disabled={index === filteredCategories.length - 1}
                            className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Icon & English Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                          <CategoryIcon name={item.icon || item.id} className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{item.name_en}</div>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Urdu Name */}
                    <td className="py-3 px-4 font-semibold text-slate-200 text-sm font-sans" dir="rtl">
                      {item.name_ur}
                    </td>

                    {/* English Slug */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        /{item.slug_en || item.id}
                      </span>
                    </td>

                    {/* Roman Urdu Slug */}
                    <td className="py-3 px-4 font-mono text-[11px] text-emerald-400">
                      <span className="bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                        /{item.slug_ur || `${item.id}-mistri`}
                      </span>
                    </td>

                    {/* Active Toggle */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                          item.isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {item.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>{item.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-300 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                          title="Edit Category Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {isSuperAdmin ? (
                          <button
                            onClick={() => {
                              setCategoryToDelete(item);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            disabled
                            title="Requires Super Admin role"
                            className="p-1.5 text-slate-400 opacity-30 cursor-not-allowed"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================== */}
      {/* CREATE / EDIT CATEGORY MODAL                               */}
      {/* ========================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isEditing ? `Edit Category: ${formData.name_en}` : 'Create New Service Category'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure bilingual identifiers and SEO taxonomy slugs</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* ID & English Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Unique Category ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    placeholder="e.g. mason"
                    value={formData.id}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setFormData({
                        ...formData,
                        id: val,
                        slug_en: formData.slug_en || val,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-mono disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    English Display Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mason / Bricklayer"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Urdu Name & Roman Urdu Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Urdu Name (اردو نام) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    placeholder="مثلاً: راج مستری"
                    value={formData.name_ur}
                    onChange={(e) => setFormData({ ...formData, name_ur: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Roman Urdu Slug <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. raj-mistri"
                    value={formData.slug_ur}
                    onChange={(e) => setFormData({ ...formData, slug_ur: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* English Canonical Slug */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  English Canonical URL Slug <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mason"
                  value={formData.slug_en}
                  onChange={(e) => setFormData({ ...formData, slug_en: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Icon Selector Grid */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Select Lucide Icon Key ({formData.icon})
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
                  {ICON_CHOICES.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = formData.icon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: item.name })}
                        title={`${item.name} - ${item.label}`}
                        className={`p-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status and Sort Order */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950"
                  />
                  <span>Active in directory & homepage</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Sort Order:</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white text-center"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {formSubmitting && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>{isEditing ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* DELETE CONFIRMATION MODAL                                  */}
      {/* ========================================================== */}
      {deleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Category?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Are you sure you want to remove <strong className="text-white">{categoryToDelete.name_en}</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
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
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
