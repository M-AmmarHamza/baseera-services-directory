'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin,
  Globe2,
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
  Tag,
  DollarSign,
  Flag,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { CountryItem, CityItem } from '@/lib/taxonomy-db';

const POPULAR_DISTRICT_SUGGESTIONS: Record<string, string[]> = {
  karachi: ['PECHS', 'Clifton', 'DHA Phase 1-8', 'Gulshan-e-Iqbal', 'North Nazimabad', 'Bahadurabad', 'Tariq Road', 'Gulistan-e-Jauhar', 'Malir Cantt', 'Korangi', 'Federal B Area', 'Nazimabad'],
  lahore: ['Gulberg', 'DHA Phases 1-9', 'Model Town', 'Johar Town', 'Cantt', 'Bahria Town', 'Faisal Town', 'Garden Town', 'Wapda Town', 'Shadman', 'Allama Iqbal Town'],
  islamabad: ['F-6', 'F-7', 'F-8', 'F-10', 'F-11', 'G-9', 'G-10', 'G-11', 'DHA Phase 2', 'Bahria Town Phase 1-8', 'E-11', 'I-8'],
  rawalpindi: ['Saddar', 'Bahria Town Rawalpindi', 'Chaklala Scheme 3', 'Westridge', 'Satellite Town', 'Adyala Road', 'Gulraiz Housing', 'Peshawar Road'],
  dubai: ['Downtown Dubai', 'Dubai Marina', 'Business Bay', 'Jumeirah', 'Palm Jumeirah', 'Deira', 'Bur Dubai', 'Al Barsha', 'JVC', 'Mirdif', 'Silicon Oasis'],
  riyadh: ['Al-Olaya', 'Al-Malaz', 'Al-Sulaimaniyah', 'Al-Nakheel', 'Al-Mohammadiyyah', 'Al-Yasmin', 'Al-Narjis', 'Al-Murabba'],
};

export default function LocationsManagerPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';

  const [activeTab, setActiveTab] = useState<'countries' | 'cities'>('countries');
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [countryFilter, setCountryFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Authentication
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);
  const isSuperAdmin = currentUser?.role?.toUpperCase() === 'SUPER_ADMIN' || currentUser?.role?.toUpperCase() === 'ADMIN';

  // Country Modal State
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [countryForm, setCountryForm] = useState<CountryItem>({
    id: '',
    name_en: '',
    name_ur: '',
    slug: '',
    code: '',
    currency: 'PKR',
    premiumPrice: 2500,
    isActive: true,
  });
  const [countrySubmitting, setCountrySubmitting] = useState(false);
  const [countryError, setCountryError] = useState<string | null>(null);

  // City Modal State
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [isCityEditing, setIsCityEditing] = useState(false);
  const [cityForm, setCityForm] = useState<CityItem>({
    id: '',
    countryCode: 'pk',
    name_en: '',
    name_ur: '',
    slug: '',
    targetAreas: [],
    isActive: true,
  });
  const [newAreaTag, setNewAreaTag] = useState('');
  const [citySubmitting, setCitySubmitting] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState<CityItem | null>(null);
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

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/locations');
      if (res.ok) {
        const data = await res.json();
        if (data.countries) setCountries(data.countries);
        if (data.cities) setCities(data.cities);
      }
    } catch (err) {
      console.error('Failed to load locations:', err);
      showToast('Error loading locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Quick Toggle Country
  const handleToggleCountry = async (country: CountryItem) => {
    const updated = !country.isActive;
    setCountries((prev) =>
      prev.map((c) => (c.code === country.code ? { ...c, isActive: updated } : c))
    );
    try {
      await fetch('/api/super-admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'country', ...country, isActive: updated }),
      });
      showToast(`${country.name_en}: Status updated`);
    } catch {
      fetchLocations();
    }
  };

  // Quick Toggle City
  const handleToggleCity = async (city: CityItem) => {
    const updated = !city.isActive;
    setCities((prev) =>
      prev.map((c) => (c.slug === city.slug ? { ...c, isActive: updated } : c))
    );
    try {
      await fetch('/api/super-admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'city', ...city, isActive: updated }),
      });
      showToast(`${city.name_en}: Status updated`);
    } catch {
      fetchLocations();
    }
  };

  // Submit Country Form
  const handleCountrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCountrySubmitting(true);
    setCountryError(null);

    try {
      const res = await fetch('/api/super-admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'country',
          ...countryForm,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Country '${data.country.name_en}' saved successfully.`);
        setCountryModalOpen(false);
        fetchLocations();
      } else {
        setCountryError(data.error || 'Failed to save country');
      }
    } catch (err: any) {
      setCountryError(err?.message || 'Network error saving country');
    } finally {
      setCountrySubmitting(false);
    }
  };

  // City Target Areas Handlers
  const handleAddAreaTag = () => {
    const trimmed = newAreaTag.trim();
    if (!trimmed) return;
    if (cityForm.targetAreas.includes(trimmed)) {
      setNewAreaTag('');
      return;
    }
    setCityForm({
      ...cityForm,
      targetAreas: [...cityForm.targetAreas, trimmed],
    });
    setNewAreaTag('');
  };

  const handleRemoveAreaTag = (tag: string) => {
    setCityForm({
      ...cityForm,
      targetAreas: cityForm.targetAreas.filter((t) => t !== tag),
    });
  };

  const handleQuickAddSuggestion = (tag: string) => {
    if (!cityForm.targetAreas.includes(tag)) {
      setCityForm({
        ...cityForm,
        targetAreas: [...cityForm.targetAreas, tag],
      });
    }
  };

  // Open City Modal
  const handleOpenCityCreate = () => {
    setIsCityEditing(false);
    setCityForm({
      id: '',
      countryCode: countryFilter !== 'all' ? countryFilter : 'pk',
      name_en: '',
      name_ur: '',
      slug: '',
      targetAreas: ['City Center'],
      isActive: true,
    });
    setNewAreaTag('');
    setCityError(null);
    setCityModalOpen(true);
  };

  const handleOpenCityEdit = (item: CityItem) => {
    setIsCityEditing(true);
    setCityForm({
      id: item.id,
      countryCode: item.countryCode,
      name_en: item.name_en,
      name_ur: item.name_ur || '',
      slug: item.slug,
      targetAreas: [...item.targetAreas],
      isActive: item.isActive,
    });
    setNewAreaTag('');
    setCityError(null);
    setCityModalOpen(true);
  };

  // Submit City Form
  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCitySubmitting(true);
    setCityError(null);

    try {
      const res = await fetch('/api/super-admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'city',
          ...cityForm,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`City '${data.city.name_en}' saved successfully.`);
        setCityModalOpen(false);
        fetchLocations();
      } else {
        setCityError(data.error || 'Failed to save city');
      }
    } catch (err: any) {
      setCityError(err?.message || 'Network error saving city');
    } finally {
      setCitySubmitting(false);
    }
  };

  // Delete City
  const handleDeleteCityConfirm = async () => {
    if (!cityToDelete) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/super-admin/locations?entity=city&slug=${cityToDelete.slug}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`City ${cityToDelete.name_en} deleted.`);
        setDeleteModalOpen(false);
        setCityToDelete(null);
        fetchLocations();
      } else {
        showToast(data.error || 'Failed to delete city');
      }
    } catch {
      showToast('Error deleting city');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCountries = countries.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name_en.toLowerCase().includes(q) ||
      c.name_ur.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.currency.toLowerCase().includes(q)
    );
  });

  const filteredCities = cities.filter((c) => {
    if (countryFilter !== 'all' && c.countryCode.toLowerCase() !== countryFilter.toLowerCase()) {
      return false;
    }
    const q = search.toLowerCase();
    return (
      c.name_en.toLowerCase().includes(q) ||
      c.name_ur.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      c.targetAreas.some((t) => t.toLowerCase().includes(q))
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
              Geographic Hierarchy & Locations
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Phase 2 CMS
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage international countries, local currency pricing, regional cities, and hyper-local target area tags.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchLocations}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
            <span>Refresh</span>
          </button>

          {activeTab === 'countries' ? (
            <button
              onClick={() => {
                setCountryForm({
                  id: '',
                  name_en: '',
                  name_ur: '',
                  slug: '',
                  code: '',
                  currency: 'PKR',
                  premiumPrice: 2500,
                  isActive: true,
                });
                setCountryError(null);
                setCountryModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-lg shadow-md shadow-emerald-500/20 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Add Country</span>
            </button>
          ) : (
            <button
              onClick={handleOpenCityCreate}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-lg shadow-md shadow-emerald-500/20 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Add City</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => {
            setActiveTab('countries');
            setSearch('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'countries'
              ? 'border-teal-400 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>Countries ({countries.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('cities');
            setSearch('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'cities'
              ? 'border-teal-400 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Regional Cities ({cities.length})</span>
        </button>
      </div>

      {/* Search & Country Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'countries'
                ? 'Search countries by name, ISO code, or currency...'
                : 'Search cities by name, slug, or target areas (e.g. DHA, Korangi, Gulshan)...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 font-medium"
          />
        </div>

        {activeTab === 'cities' && (
          <div className="w-full sm:w-56">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Countries ({countries.length})</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag || '🌐'} {c.name_en} ({c.code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* TAB 1: COUNTRIES TABLE                                     */}
      {/* ========================================================== */}
      {activeTab === 'countries' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Flag & Country Name</th>
                  <th className="py-3.5 px-4">Urdu Name</th>
                  <th className="py-3.5 px-4">ISO Code & Slug</th>
                  <th className="py-3.5 px-4">Currency</th>
                  <th className="py-3.5 px-4">Monthly Premium Price</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-400 mb-2" />
                      <span className="text-xs">Loading countries database...</span>
                    </td>
                  </tr>
                ) : filteredCountries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <AlertCircle className="w-6 h-6 mx-auto text-amber-400 mb-2" />
                      <span className="text-xs">No countries match your search query.</span>
                    </td>
                  </tr>
                ) : (
                  filteredCountries.map((c) => (
                    <tr key={c.code} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5 font-bold text-white">
                          <span className="text-base">{c.flag || '🌐'}</span>
                          <span>{c.name_en}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-200 text-sm" dir="rtl">
                        {c.name_ur || '—'}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 uppercase font-bold text-emerald-400">
                          {c.code}
                        </span>{' '}
                        <span className="text-slate-500">/{c.slug}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-amber-400 font-bold">
                        {c.currency}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-white">
                        {c.currency} {c.premiumPrice?.toLocaleString()} / mo
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleCountry(c)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                            c.isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {c.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>{c.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setCountryForm({ ...c });
                            setCountryError(null);
                            setCountryModalOpen(true);
                          }}
                          className="p-1.5 text-slate-300 hover:text-teal-400 hover:bg-slate-800 rounded transition-colors"
                          title="Edit Country & Pricing"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: CITIES TABLE                                        */}
      {/* ========================================================== */}
      {activeTab === 'cities' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">City Name</th>
                  <th className="py-3.5 px-4">Urdu Name</th>
                  <th className="py-3.5 px-4">Country</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Hyper-Local Target Areas</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-400 mb-2" />
                      <span className="text-xs">Loading regional cities...</span>
                    </td>
                  </tr>
                ) : filteredCities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <AlertCircle className="w-6 h-6 mx-auto text-amber-400 mb-2" />
                      <span className="text-xs">No cities match your filter criteria.</span>
                    </td>
                  </tr>
                ) : (
                  filteredCities.map((city) => (
                    <tr key={city.slug} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white text-xs">
                        {city.name_en}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-200 text-sm" dir="rtl">
                        {city.name_ur || '—'}
                      </td>

                      <td className="py-3 px-4 font-mono uppercase text-[11px] text-teal-400 font-bold">
                        {city.countryCode}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          /{city.slug}
                        </span>
                      </td>

                      {/* Target Areas Tag Chips */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {city.targetAreas && city.targetAreas.length > 0 ? (
                            city.targetAreas.slice(0, 5).map((area) => (
                              <span
                                key={area}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-950 text-slate-300 border border-slate-800"
                              >
                                {area}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-[11px]">No target areas assigned</span>
                          )}
                          {city.targetAreas && city.targetAreas.length > 5 && (
                            <span className="text-[10px] text-teal-400 font-mono font-bold self-center">
                              +{city.targetAreas.length - 5} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleCity(city)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                            city.isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {city.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>{city.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenCityEdit(city)}
                            className="p-1.5 text-slate-300 hover:text-teal-400 hover:bg-slate-800 rounded transition-colors"
                            title="Edit City & Target Areas"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {isSuperAdmin ? (
                            <button
                              onClick={() => {
                                setCityToDelete(city);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                              title="Delete City"
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
      )}

      {/* ========================================================== */}
      {/* COUNTRY MODAL (Pricing, Currency, Bilingual Names)         */}
      {/* ========================================================== */}
      {countryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">Configure Country & Pricing</h3>
              </div>
              <button onClick={() => setCountryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCountrySubmit} className="space-y-3.5">
              {countryError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                  {countryError}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Country Name (English) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Pakistan"
                  value={countryForm.name_en}
                  onChange={(e) => setCountryForm({ ...countryForm, name_en: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Urdu Name (اردو نام)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="پاکستان"
                  value={countryForm.name_ur}
                  onChange={(e) => setCountryForm({ ...countryForm, name_ur: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    ISO 2-Letter Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="PK"
                    value={countryForm.code}
                    onChange={(e) =>
                      setCountryForm({
                        ...countryForm,
                        code: e.target.value.toLowerCase(),
                        slug: countryForm.slug || e.target.value.toLowerCase(),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Currency Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="PKR"
                    value={countryForm.currency}
                    onChange={(e) => setCountryForm({ ...countryForm, currency: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Monthly Premium Provider Price <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  placeholder="2500"
                  value={countryForm.premiumPrice}
                  onChange={(e) => setCountryForm({ ...countryForm, premiumPrice: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCountryModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={countrySubmitting}
                  className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  {countrySubmitting && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>Save Country</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* CITY MODAL WITH TARGET AREAS TAG EDITOR                    */}
      {/* ========================================================== */}
      {cityModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">
                  {isCityEditing ? `Edit City: ${cityForm.name_en}` : 'Create New City'}
                </h3>
              </div>
              <button onClick={() => setCityModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCitySubmit} className="space-y-4">
              {cityError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                  {cityError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Country <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={cityForm.countryCode}
                    onChange={(e) => setCityForm({ ...cityForm, countryCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag || '🌐'} {c.name_en} ({c.code.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    City Name (English) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karachi"
                    value={cityForm.name_en}
                    onChange={(e) => setCityForm({ ...cityForm, name_en: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Urdu Name (اردو نام)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="مثلاً: کراچی"
                    value={cityForm.name_ur}
                    onChange={(e) => setCityForm({ ...cityForm, name_ur: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    URL Slug <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isCityEditing}
                    placeholder="e.g. karachi"
                    value={cityForm.slug}
                    onChange={(e) =>
                      setCityForm({
                        ...cityForm,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* TARGET AREAS TAG CHIP EDITOR */}
              <div className="pt-2 border-t border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-teal-400" />
                    <span>Hyper-Local Target Areas ({cityForm.targetAreas.length})</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Used for search & filters</span>
                </div>

                {/* Add Tag Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type neighborhood name (e.g. Gulshan, DHA, Korangi)..."
                    value={newAreaTag}
                    onChange={(e) => setNewAreaTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAreaTag();
                      }
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAreaTag}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-bold rounded-lg transition-colors shrink-0"
                  >
                    Add Tag
                  </button>
                </div>

                {/* Tag Chips Container */}
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 min-h-20 max-h-36 overflow-y-auto flex flex-wrap gap-1.5">
                  {cityForm.targetAreas.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 border border-slate-700 text-slate-200 group"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAreaTag(tag)}
                        className="text-slate-400 hover:text-rose-400 focus:outline-none"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {cityForm.targetAreas.length === 0 && (
                    <span className="text-xs text-slate-500 italic p-1">
                      No target areas added yet. Enter a neighborhood name above.
                    </span>
                  )}
                </div>

                {/* Suggestions for this city */}
                {POPULAR_DISTRICT_SUGGESTIONS[cityForm.slug.toLowerCase()] && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Quick Suggestions:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {POPULAR_DISTRICT_SUGGESTIONS[cityForm.slug.toLowerCase()].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleQuickAddSuggestion(suggestion)}
                          className="text-[10px] bg-slate-950 hover:bg-teal-950/60 text-slate-400 hover:text-teal-300 border border-slate-800 hover:border-teal-500/40 px-2 py-0.5 rounded transition-colors"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCityModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={citySubmitting}
                  className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  {citySubmitting && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>{isCityEditing ? 'Save Changes' : 'Create City'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* DELETE CONFIRMATION MODAL                                  */}
      {/* ========================================================== */}
      {deleteModalOpen && cityToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete City Record?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Are you sure you want to remove <strong className="text-white">{cityToDelete.name_en}</strong>?
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
                onClick={handleDeleteCityConfirm}
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
