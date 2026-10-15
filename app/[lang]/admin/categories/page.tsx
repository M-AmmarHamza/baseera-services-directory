'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  ExternalLink,
  Wrench,
  Zap,
  BatteryCharging,
  Sun,
  Power,
  Gauge,
  ArrowDownToLine,
  Droplets,
  Wind,
  Snowflake,
  RotateCw,
  Flame,
  Hammer,
  Paintbrush,
  PanelRight,
  Sparkles,
  BrickWall,
  Bug,
  Brush,
  Cctv,
  Key,
  ChefHat,
  PenTool,
  Truck,
  LayoutGrid,
} from 'lucide-react';
import { CategoryIcon } from '@/components/Icons';
import { generateEnglishSlug } from '@/lib/transliterate';

// Standard available icons mapped to existing Lucide dictionary
const AVAILABLE_ICONS = [
  { name: 'Zap', label: 'Electric / Power', component: Zap },
  { name: 'BatteryCharging', label: 'Inverter / Battery', component: BatteryCharging },
  { name: 'Sun', label: 'Solar Energy', component: Sun },
  { name: 'Power', label: 'Generator', component: Power },
  { name: 'Wrench', label: 'Plumbing / Mechanic', component: Wrench },
  { name: 'Gauge', label: 'Water Pump', component: Gauge },
  { name: 'ArrowDownToLine', label: 'Water Boring', component: ArrowDownToLine },
  { name: 'Droplets', label: 'Tank Cleaning', component: Droplets },
  { name: 'Wind', label: 'AC / Cooling', component: Wind },
  { name: 'Snowflake', label: 'Refrigerator', component: Snowflake },
  { name: 'RotateCw', label: 'Washing Machine', component: RotateCw },
  { name: 'Flame', label: 'Geyser / Gas', component: Flame },
  { name: 'Hammer', label: 'Carpenter', component: Hammer },
  { name: 'Paintbrush', label: 'Painter', component: Paintbrush },
  { name: 'PanelRight', label: 'Aluminium / Glass', component: PanelRight },
  { name: 'Sparkles', label: 'Welding', component: Sparkles },
  { name: 'BrickWall', label: 'Mason / Tiles', component: BrickWall },
  { name: 'Bug', label: 'Pest Control', component: Bug },
  { name: 'Brush', label: 'Sofa / Carpet', component: Brush },
  { name: 'Cctv', label: 'CCTV Security', component: Cctv },
  { name: 'Key', label: 'Locksmith', component: Key },
  { name: 'ChefHat', label: 'Home Chef', component: ChefHat },
  { name: 'PenTool', label: 'Interior Design', component: PenTool },
  { name: 'Truck', label: 'Movers & Packers', component: Truck },
];

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  count?: number | string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Wrench');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const cleanSlug = slug.trim() || generateEnglishSlug(name);
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: cleanSlug,
          icon: selectedIcon,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setName('');
        setSlug('');
        setSelectedIcon('Wrench');
        fetchCategories();
      }
    } catch (err) {
      console.error('Category creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to remove the category "${catName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id && c.slug !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredCategories = categories.filter((c) => {
    return (
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Service Category Manager
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Configure primary trade specializations, SEO routing slugs, and Lucide visual icon mappings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setName('');
            setSlug('');
            setSelectedIcon('Wrench');
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by title or slug..."
            className="w-full ps-10 pe-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#006948]"
          />
        </div>
        <span className="text-xs font-semibold text-gray-500">
          {filteredCategories.length} Specialties
        </span>
      </div>

      {/* Categories Data Table */}
      <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3 px-4 text-start">Icon</th>
                <th className="py-3 px-4 text-start">Category Name</th>
                <th className="py-3 px-4 text-start">SEO URL Slug</th>
                <th className="py-3 px-4 text-start">Mapped Lucide Icon</th>
                <th className="py-3 px-4 text-center">Active Listings</th>
                <th className="py-3 px-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map((c) => (
                <tr key={c.id || c.slug} className="hover:bg-gray-50/60 transition-colors">
                  {/* Icon Preview */}
                  <td className="py-3 px-4">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center border border-emerald-100">
                      <CategoryIcon slug={c.slug} name={c.name} icon={c.icon} className="w-4 h-4" />
                    </div>
                  </td>

                  {/* Name */}
                  <td className="py-3 px-4 font-bold text-gray-900 text-xs">
                    {c.name}
                  </td>

                  {/* SEO Slug */}
                  <td className="py-3 px-4 font-mono text-[11px] text-[#006948] font-semibold">
                    /{c.slug}/
                  </td>

                  {/* Mapped Icon Name */}
                  <td className="py-3 px-4 font-mono text-gray-500 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                      {c.icon || 'Wrench'}
                    </span>
                  </td>

                  {/* Active Count */}
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006948] font-bold text-[11px]">
                      {c.count || '25'}+ active
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD NEW CATEGORY (Requirement 3: SEO Slug & Icon Selector) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-200 shadow-xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add Service Category</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Define SEO routing slug and visually select mapped Lucide icon
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug || slug === generateEnglishSlug(name)) {
                      setSlug(generateEnglishSlug(e.target.value));
                    }
                  }}
                  placeholder="e.g. Solar Inverter Specialist"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#006948]"
                />
              </div>

              {/* SEO Slug (Requirement 3) */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Programmatic SEO Slug * (e.g. /solar-inverter-specialist/)
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  placeholder="solar-inverter-specialist"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#006948] font-mono text-[11px]"
                />
              </div>

              {/* Icon Name Selector (Requirement 3) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Lucide Icon Selector *
                  </label>
                  <span className="text-[11px] text-[#006948] font-bold">
                    Selected: {selectedIcon}
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-2xl max-h-48 overflow-y-auto">
                  {AVAILABLE_ICONS.map((item) => {
                    const isSelected = selectedIcon.toLowerCase() === item.name.toLowerCase();
                    const IconComp = item.component;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setSelectedIcon(item.name)}
                        title={`${item.name} (${item.label})`}
                        className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#006948] text-white border-[#006948] shadow-xs scale-105'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        <span className="text-[9px] font-semibold truncate w-full text-center">
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-semibold shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
