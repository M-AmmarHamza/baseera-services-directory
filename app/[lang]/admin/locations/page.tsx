'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Globe,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Building,
  RefreshCw,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { COUNTRIES, CITIES } from '@/lib/db';
import { generateEnglishSlug } from '@/lib/transliterate';

interface CountryItem {
  id?: number | string;
  name: string;
  code: string;
  currency?: string;
  flag?: string;
}

interface CityItem {
  id?: number | string;
  name: string;
  slug: string;
  countryCode: string;
  country_code?: string;
  is_active?: boolean;
}

export default function AdminLocationsPage() {
  const [activeTab, setActiveTab] = useState<'cities' | 'countries'>('cities');
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [citySearch, setCitySearch] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('all');
  const [countrySearch, setCountrySearch] = useState('');

  // Add City Modal State (Includes DEPENDENT DROPDOWN to accurately assign new cities)
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newCitySlug, setNewCitySlug] = useState('');
  const [newCityCountryCode, setNewCityCountryCode] = useState('pk');
  const [isSubmittingCity, setIsSubmittingCity] = useState(false);

  // Add Country Modal State
  const [showAddCountryModal, setShowAddCountryModal] = useState(false);
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('');
  const [newCountryFlag, setNewCountryFlag] = useState('🌐');
  const [newCountryCurrency, setNewCountryCurrency] = useState('USD');
  const [isSubmittingCountry, setIsSubmittingCountry] = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/locations');
      if (res.ok) {
        const data = await res.json();
        setCountries(data.countries || COUNTRIES);
        setCities(data.cities || CITIES);
      }
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // 1. ADD CITY (WITH DEPENDENT DROPDOWN)
  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim() || !newCityCountryCode.trim()) return;

    setIsSubmittingCity(true);
    try {
      const slug = newCitySlug.trim() || generateEnglishSlug(newCityName);
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'city',
          name: newCityName.trim(),
          slug,
          country_code: newCityCountryCode.trim(),
          is_active: true,
        }),
      });

      if (res.ok) {
        setShowAddCityModal(false);
        setNewCityName('');
        setNewCitySlug('');
        fetchLocations();
      }
    } catch (err) {
      console.error('City creation error:', err);
    } finally {
      setIsSubmittingCity(false);
    }
  };

  // 2. ADD COUNTRY
  const handleCreateCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryName.trim() || !newCountryCode.trim()) return;

    setIsSubmittingCountry(true);
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'country',
          name: newCountryName.trim(),
          code: newCountryCode.trim().toLowerCase(),
          flag: newCountryFlag.trim() || '🌐',
          currency: newCountryCurrency.trim() || 'USD',
        }),
      });

      if (res.ok) {
        setShowAddCountryModal(false);
        setNewCountryName('');
        setNewCountryCode('');
        fetchLocations();
      }
    } catch (err) {
      console.error('Country creation error:', err);
    } finally {
      setIsSubmittingCountry(false);
    }
  };

  // 3. DELETE CITY
  const handleDeleteCity = async (slug: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the city "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/locations?type=city&id=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCities((prev) => prev.filter((c) => c.slug !== slug));
      }
    } catch (err) {
      console.error('Delete city error:', err);
    }
  };

  // 4. DELETE COUNTRY
  const handleDeleteCountry = async (code: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" and all its associations?`)) return;
    try {
      const res = await fetch(`/api/admin/locations?type=country&id=${encodeURIComponent(code)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCountries((prev) => prev.filter((c) => c.code !== code));
      }
    } catch (err) {
      console.error('Delete country error:', err);
    }
  };

  // Filtered Cities list
  const filteredCities = cities.filter((c) => {
    const code = c.countryCode || c.country_code || '';
    const matchCountry = selectedCountryFilter === 'all' || code.toLowerCase() === selectedCountryFilter.toLowerCase();
    const matchSearch =
      !citySearch ||
      c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
      c.slug.toLowerCase().includes(citySearch.toLowerCase());
    return matchCountry && matchSearch;
  });

  // Filtered Countries list
  const filteredCountries = countries.filter((c) => {
    return (
      !countrySearch ||
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Locations & Global Directory Network
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage supported countries, regional currency mappings, and active operating cities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'cities' ? (
            <button
              type="button"
              onClick={() => setShowAddCityModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New City</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddCountryModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Country</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('cities')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'cities'
              ? 'border-[#006948] text-[#006948]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Operating Cities ({cities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('countries')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'countries'
              ? 'border-[#006948] text-[#006948]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Supported Countries ({countries.length})</span>
        </button>
      </div>

      {/* CITIES TAB CONTENT */}
      {activeTab === 'cities' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="Filter by city name or slug..."
                className="w-full ps-10 pe-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#006948]"
              />
            </div>

            {/* Country Dependent Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                Filter by Country:
              </span>
              <select
                value={selectedCountryFilter}
                onChange={(e) => setSelectedCountryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#006948] cursor-pointer"
              >
                <option value="all">All Countries ({countries.length})</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag || '🌐'} {c.name} ({c.code.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cities Table */}
          <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-start text-xs">
                <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-xs border-b border-gray-100 z-10 text-gray-500 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-4 text-start">City Name</th>
                    <th className="py-3 px-4 text-start">SEO URL Slug</th>
                    <th className="py-3 px-4 text-start">Parent Country</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCities.map((city, idx) => {
                    const countryCode = (city.countryCode || city.country_code || '').toLowerCase();
                    const parentCountry = countries.find((c) => c.code.toLowerCase() === countryCode);

                    return (
                      <tr key={city.slug || idx} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-900">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-[#006948] shrink-0" />
                            <span>{city.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500 text-[11px]">
                          /{city.slug}/
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 text-[11px] font-semibold">
                            <span>{parentCountry?.flag || '🌐'}</span>
                            <span>{parentCountry?.name || countryCode.toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteCity(city.slug, city.name)}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete City"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-gray-100 text-[11px] text-gray-400 text-center">
              Displaying {filteredCities.length} of {cities.length} total cities
            </div>
          </div>
        </div>
      )}

      {/* COUNTRIES TAB CONTENT */}
      {activeTab === 'countries' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search countries by name or code..."
                className="w-full ps-10 pe-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#006948]"
              />
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {filteredCountries.length} Countries Total
            </span>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-start text-xs">
                <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-xs border-b border-gray-100 z-10 text-gray-500 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-4 text-start">Country</th>
                    <th className="py-3 px-4 text-start">2-Letter ISO Code</th>
                    <th className="py-3 px-4 text-start">Default Currency</th>
                    <th className="py-3 px-4 text-center">Linked Cities</th>
                    <th className="py-3 px-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCountries.map((c) => {
                    const linkedCount = cities.filter(
                      (city) => (city.countryCode || city.country_code || '').toLowerCase() === c.code.toLowerCase()
                    ).length;

                    return (
                      <tr key={c.code} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-900">
                          <span className="me-2 text-base">{c.flag || '🌐'}</span>
                          <span>{c.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-700 font-bold uppercase text-[11px]">
                          {c.code}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-600">
                          {c.currency || 'USD'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006948] font-bold text-[11px]">
                            {linkedCount} cities
                          </span>
                        </td>
                        <td className="py-3 px-4 text-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteCountry(c.code, c.name)}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Country"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CITY (WITH DEPENDENT DROPDOWN) */}
      {showAddCityModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-200 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add Operating City</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Link a new programmatic city route to a country
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCityModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCity} className="space-y-4">
              {/* 1. DEPENDENT COUNTRY DROPDOWN (Requirement 3) */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Assign to Country (Dependent Dropdown) *
                </label>
                <select
                  required
                  value={newCityCountryCode}
                  onChange={(e) => setNewCityCountryCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#006948] bg-white cursor-pointer font-medium"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag || '🌐'} {c.name} ({c.code.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* City Name */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  City Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCityName}
                  onChange={(e) => {
                    setNewCityName(e.target.value);
                    if (!newCitySlug || newCitySlug === generateEnglishSlug(newCityName)) {
                      setNewCitySlug(generateEnglishSlug(e.target.value));
                    }
                  }}
                  placeholder="e.g. Faisalabad or Abu Dhabi"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#006948]"
                />
              </div>

              {/* SEO Slug */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  SEO URL Slug (e.g. /faisalabad/)
                </label>
                <input
                  type="text"
                  value={newCitySlug}
                  onChange={(e) => setNewCitySlug(e.target.value)}
                  placeholder="auto-generated from city name"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#006948] font-mono text-[11px]"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCityModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCity}
                  className="px-4 py-2 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-semibold shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCity ? 'Saving...' : 'Add City'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD COUNTRY */}
      {showAddCountryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-200 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New Country</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Expand directory into a new international market
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCountryModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCountry} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Country Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCountryName}
                  onChange={(e) => setNewCountryName(e.target.value)}
                  placeholder="e.g. Switzerland"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#006948]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    ISO Code (2-Letters) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={newCountryCode}
                    onChange={(e) => setNewCountryCode(e.target.value.toLowerCase())}
                    placeholder="e.g. ch"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#006948] uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Flag Emoji
                  </label>
                  <input
                    type="text"
                    value={newCountryFlag}
                    onChange={(e) => setNewCountryFlag(e.target.value)}
                    placeholder="e.g. 🇨🇭"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#006948]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Default Currency (ISO 3-Letters)
                </label>
                <input
                  type="text"
                  value={newCountryCurrency}
                  onChange={(e) => setNewCountryCurrency(e.target.value.toUpperCase())}
                  placeholder="e.g. CHF or USD"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#006948] uppercase font-mono"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCountryModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCountry}
                  className="px-4 py-2 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-semibold shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCountry ? 'Saving...' : 'Add Country'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
