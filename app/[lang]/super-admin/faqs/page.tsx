'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  HelpCircle,
  Search,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  Lock,
  ArrowUp,
  ArrowDown,
  Globe,
  Layers,
  Check,
  Filter,
} from 'lucide-react';
import { FaqItemRecord, CategoryItem } from '@/lib/taxonomy-db';

export default function FaqsManagerPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';

  const [faqs, setFaqs] = useState<FaqItemRecord[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [scopeFilter, setScopeFilter] = useState<'all' | 'GLOBAL' | 'CATEGORY'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Authentication
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);
  const isSuperAdmin = currentUser?.role?.toUpperCase() === 'SUPER_ADMIN' || currentUser?.role?.toUpperCase() === 'ADMIN';

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FaqItemRecord>({
    id: '',
    scope: 'GLOBAL',
    categoryId: null,
    question_en: '',
    answer_en: '',
    question_ur: '',
    answer_ur: '',
    sortOrder: 1,
    isActive: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<FaqItemRecord | null>(null);
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

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (scopeFilter !== 'all') q.set('scope', scopeFilter);
      if (categoryFilter !== 'all') q.set('categoryId', categoryFilter);

      const [faqsRes, catsRes] = await Promise.all([
        fetch(`/api/super-admin/faqs?${q.toString()}`),
        fetch('/api/super-admin/categories'),
      ]);

      if (faqsRes.ok) {
        const data = await faqsRes.json();
        if (Array.isArray(data.faqs)) setFaqs(data.faqs);
      }
      if (catsRes.ok) {
        const data = await catsRes.json();
        if (Array.isArray(data.categories)) setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to load FAQs:', err);
      showToast('Error loading FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [scopeFilter, categoryFilter]);

  // Quick Toggle Active Status
  const handleToggleActive = async (faq: FaqItemRecord) => {
    const updated = !faq.isActive;
    setFaqs((prev) =>
      prev.map((f) => (f.id === faq.id ? { ...f, isActive: updated } : f))
    );

    try {
      await fetch('/api/super-admin/faqs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: faq.id, isActive: updated }),
      });
      showToast('FAQ active status updated');
    } catch {
      fetchFaqs();
    }
  };

  // Reorder Item
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const newList = [...faqs];
    const [moved] = newList.splice(index, 1);
    newList.splice(targetIndex, 0, moved);

    setFaqs(newList);

    try {
      const orderedIds = newList.map((f) => f.id);
      await fetch('/api/super-admin/faqs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
      showToast('FAQ sort order updated');
    } catch (err) {
      console.error('Reorder error:', err);
      fetchFaqs();
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      scope: scopeFilter === 'CATEGORY' ? 'CATEGORY' : 'GLOBAL',
      categoryId: categoryFilter !== 'all' ? categoryFilter : categories[0]?.id || null,
      question_en: '',
      answer_en: '',
      question_ur: '',
      answer_ur: '',
      sortOrder: faqs.length + 1,
      isActive: true,
    });
    setFormError(null);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: FaqItemRecord) => {
    setIsEditing(true);
    setFormData({
      id: item.id,
      scope: item.scope,
      categoryId: item.categoryId || null,
      question_en: item.question_en,
      answer_en: item.answer_en,
      question_ur: item.question_ur || '',
      answer_ur: item.answer_ur || '',
      sortOrder: item.sortOrder || 1,
      isActive: item.isActive,
    });
    setFormError(null);
    setModalOpen(true);
  };

  // Submit FAQ
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    const payload = {
      ...formData,
      categoryId: formData.scope === 'CATEGORY' ? formData.categoryId : null,
    };

    try {
      const res = await fetch('/api/super-admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('FAQ saved successfully.');
        setModalOpen(false);
        fetchFaqs();
      } else {
        setFormError(data.error || 'Failed to save FAQ');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Network error saving FAQ');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!faqToDelete) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/super-admin/faqs?id=${faqToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('FAQ deleted.');
        setDeleteModalOpen(false);
        setFaqToDelete(null);
        fetchFaqs();
      } else {
        showToast(data.error || 'Failed to delete FAQ');
      }
    } catch {
      showToast('Error deleting FAQ');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredFaqs = faqs.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.question_en.toLowerCase().includes(q) ||
      f.answer_en.toLowerCase().includes(q) ||
      (f.question_ur && f.question_ur.toLowerCase().includes(q)) ||
      (f.answer_ur && f.answer_ur.toLowerCase().includes(q)) ||
      (f.categoryId && f.categoryId.toLowerCase().includes(q))
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
              Bilingual FAQs Knowledgebase CMS
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Phase 2 CMS
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage Global platform disclaimers and Category-specific Q&A pairs with automatic Google FAQPage JSON-LD schema sync.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchFaqs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-lg shadow-md shadow-emerald-500/20 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Add FAQ</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search FAQs by question or answer (English or Urdu)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        {/* Scope Filter */}
        <div className="w-full sm:w-44">
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Scopes</option>
            <option value="GLOBAL">Global FAQs</option>
            <option value="CATEGORY">Category FAQs</option>
          </select>
        </div>

        {/* Category Filter */}
        {scopeFilter === 'CATEGORY' && (
          <div className="w-full sm:w-52">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_en}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* FAQs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-3 text-center w-12">#Order</th>
                <th className="py-3.5 px-4 w-28">Scope</th>
                <th className="py-3.5 px-4">English Question & Answer</th>
                <th className="py-3.5 px-4">Urdu Translation (اردو)</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
                    <span className="text-xs">Loading FAQ knowledgebase...</span>
                  </td>
                </tr>
              ) : filteredFaqs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto text-amber-400 mb-2" />
                    <span className="text-xs">No FAQs found matching your filters.</span>
                  </td>
                </tr>
              ) : (
                filteredFaqs.map((faq, index) => (
                  <tr key={faq.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Order Controls */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <span className="font-mono text-slate-400 text-xs font-semibold mr-1">
                          {faq.sortOrder || index + 1}
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
                            disabled={index === filteredFaqs.length - 1}
                            className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Scope Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {faq.scope === 'GLOBAL' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 uppercase">
                          <Globe className="w-2.5 h-2.5" />
                          <span>GLOBAL</span>
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 uppercase">
                            <Layers className="w-2.5 h-2.5" />
                            <span>CATEGORY</span>
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {faq.categoryId || 'All'}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* English Question & Answer */}
                    <td className="py-3 px-4 max-w-xs sm:max-w-md">
                      <div className="space-y-1">
                        <p className="font-bold text-white text-xs leading-snug">
                          {faq.question_en}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {faq.answer_en}
                        </p>
                      </div>
                    </td>

                    {/* Urdu Translation */}
                    <td className="py-3 px-4 max-w-xs sm:max-w-md" dir="rtl">
                      {faq.question_ur ? (
                        <div className="space-y-1 font-sans">
                          <p className="font-bold text-slate-200 text-xs leading-snug">
                            {faq.question_ur}
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {faq.answer_ur}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs italic">ترجمہ موجود نہیں (No Urdu)</span>
                      )}
                    </td>

                    {/* Active Toggle */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(faq)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                          faq.isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {faq.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>{faq.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(faq)}
                          className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                          title="Edit FAQ"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {isSuperAdmin ? (
                          <button
                            onClick={() => {
                              setFaqToDelete(faq);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                            title="Delete FAQ"
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
      {/* ADD / EDIT FAQ MODAL                                       */}
      {/* ========================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {isEditing ? 'Edit Bilingual FAQ' : 'Add New FAQ Item'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                  {formError}
                </div>
              )}

              {/* Scope & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    FAQ Scope <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="GLOBAL">Global (Homepage & /faq page)</option>
                    <option value="CATEGORY">Category Specific (Directory Hubs)</option>
                  </select>
                </div>

                {formData.scope === 'CATEGORY' ? (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Target Category <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formData.categoryId || ''}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name_en}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      Display Scope
                    </label>
                    <div className="bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400">
                      Appears sitewide across all cities
                    </div>
                  </div>
                )}
              </div>

              {/* English Question */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Question (English) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Do I pay Baseera or the electrician directly?"
                  value={formData.question_en}
                  onChange={(e) => setFormData({ ...formData, question_en: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* English Answer */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Answer (English) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. You pay the specialist directly upon completion. Baseera takes 0% commission..."
                  value={formData.answer_en}
                  onChange={(e) => setFormData({ ...formData, answer_en: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Urdu Question */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Urdu Question (اردو سوال)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثلاً: کیا رقم بصیرہ کو ادا کرنی ہوگی یا کاریگر کو؟"
                  value={formData.question_ur || ''}
                  onChange={(e) => setFormData({ ...formData, question_ur: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Urdu Answer */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Urdu Answer (اردو جواب)
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  placeholder="مثلاً: آپ رقم براہِ راست کاریگر کو ادا کریں گے، بصیرہ کوئی کمیشن نہیں لیتی..."
                  value={formData.answer_ur || ''}
                  onChange={(e) => setFormData({ ...formData, answer_ur: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
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
                  <span>Active in JSON-LD FAQ schema & frontend</span>
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
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  {formSubmitting && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>Save FAQ Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* DELETE CONFIRMATION MODAL                                  */}
      {/* ========================================================== */}
      {deleteModalOpen && faqToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete FAQ?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Are you sure you want to remove this question from the public knowledgebase?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800 font-medium">
              "{faqToDelete.question_en}"
            </p>

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
