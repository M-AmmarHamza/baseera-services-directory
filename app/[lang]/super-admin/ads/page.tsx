'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Sparkles,
  Save,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Lock,
  Layers,
  Settings,
  Image as ImageIcon,
  Check,
  X,
  Phone,
  Layout,
  Sliders,
} from 'lucide-react';

interface PrivateSponsor {
  id: string;
  slot: 'top_banner' | 'in_feed' | 'profile_sidebar' | 'mobile_sticky';
  title: string;
  imageUrl: string;
  destinationUrl: string;
  isActive: boolean;
  impressions?: number;
  clicks?: number;
}

interface AdSettings {
  adsense_publisher_id: string;
  placements: {
    top_banner: boolean;
    in_feed: boolean;
    profile_sidebar: boolean;
    mobile_sticky: boolean;
  };
  sponsors: PrivateSponsor[];
}

interface FooterLinkItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

interface GeneralSettings {
  brandName: string;
  logoUrl: string;
  supportWhatsapp: string;
  footerLinks: FooterLinkItem[];
}

export default function SuperAdminAdsPage() {
  const [activeTab, setActiveTab] = useState<'adsense' | 'sponsors' | 'general'>('adsense');
  const [loading, setLoading] = useState(true);
  const [isSuperAdminRole, setIsSuperAdminRole] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // AdSense & Placements state
  const [publisherId, setPublisherId] = useState('');
  const [placements, setPlacements] = useState({
    top_banner: true,
    in_feed: true,
    profile_sidebar: true,
    mobile_sticky: false,
  });
  const [savingAds, setSavingAds] = useState(false);

  // Private Sponsors state
  const [sponsors, setSponsors] = useState<PrivateSponsor[]>([]);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<PrivateSponsor | null>(null);
  const [sponsorTitle, setSponsorTitle] = useState('');
  const [sponsorSlot, setSponsorSlot] = useState<'top_banner' | 'in_feed' | 'profile_sidebar' | 'mobile_sticky'>('top_banner');
  const [sponsorImageUrl, setSponsorImageUrl] = useState('');
  const [sponsorDestination, setSponsorDestination] = useState('');
  const [sponsorIsActive, setSponsorIsActive] = useState(true);
  const [savingSponsor, setSavingSponsor] = useState(false);
  const [sponsorError, setSponsorError] = useState<string | null>(null);

  // General Settings state
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    brandName: 'Baseera',
    logoUrl: '',
    supportWhatsapp: '+923001234567',
    footerLinks: [],
  });
  const [savingGeneral, setSavingGeneral] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [adsRes, genRes] = await Promise.all([
        fetch('/api/super-admin/ads'),
        fetch('/api/super-admin/settings'),
      ]);

      if (adsRes.status === 403 || genRes.status === 403) {
        setIsSuperAdminRole(false);
        setLoading(false);
        return;
      }

      if (adsRes.ok) {
        const adsData = await adsRes.json();
        if (adsData.settings) {
          setPublisherId(adsData.settings.adsense_publisher_id || '');
          setPlacements(adsData.settings.placements || placements);
          setSponsors(adsData.settings.sponsors || []);
        }
      }

      if (genRes.ok) {
        const genData = await genRes.json();
        if (genData.settings) {
          setGeneralSettings(genData.settings);
        }
      }
    } catch (err) {
      console.error('Failed to load ads and site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const triggerFeedback = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // 1. Save AdSense & Placements
  const handleSaveAdSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAds(true);
    try {
      const res = await fetch('/api/super-admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SETTINGS',
          settings: {
            adsense_publisher_id: publisherId.trim(),
            placements,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerFeedback('AdSense configuration and slot placement rules successfully saved.');
      } else {
        alert(data.error || 'Failed to save ad settings');
      }
    } catch {
      alert('Network error saving ad settings');
    } finally {
      setSavingAds(false);
    }
  };

  // 2. Open Add Sponsor Modal
  const handleOpenAddSponsor = () => {
    setEditingSponsor(null);
    setSponsorTitle('');
    setSponsorSlot('top_banner');
    setSponsorImageUrl('');
    setSponsorDestination('');
    setSponsorIsActive(true);
    setSponsorError(null);
    setSponsorModalOpen(true);
  };

  // Open Edit Sponsor Modal
  const handleOpenEditSponsor = (s: PrivateSponsor) => {
    setEditingSponsor(s);
    setSponsorTitle(s.title);
    setSponsorSlot(s.slot);
    setSponsorImageUrl(s.imageUrl);
    setSponsorDestination(s.destinationUrl);
    setSponsorIsActive(s.isActive);
    setSponsorError(null);
    setSponsorModalOpen(true);
  };

  // Save Sponsor
  const handleSaveSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSponsor(true);
    setSponsorError(null);

    if (!sponsorTitle.trim() || !sponsorImageUrl.trim() || !sponsorDestination.trim()) {
      setSponsorError('Please fill out all required fields.');
      setSavingSponsor(false);
      return;
    }

    try {
      const res = await fetch('/api/super-admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_SPONSOR',
          sponsor: {
            id: editingSponsor?.id,
            title: sponsorTitle.trim(),
            slot: sponsorSlot,
            imageUrl: sponsorImageUrl.trim(),
            destinationUrl: sponsorDestination.trim(),
            isActive: sponsorIsActive,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSponsorModalOpen(false);
        triggerFeedback('Private sponsor banner saved.');
        fetchAllData();
      } else {
        setSponsorError(data.error || 'Failed to save sponsor banner');
      }
    } catch (err: any) {
      setSponsorError(err?.message || 'Network error saving sponsor banner');
    } finally {
      setSavingSponsor(false);
    }
  };

  // Toggle Sponsor Active Inline
  const handleToggleSponsorActive = async (s: PrivateSponsor) => {
    try {
      const res = await fetch('/api/super-admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_SPONSOR',
          sponsor: {
            ...s,
            isActive: !s.isActive,
          },
        }),
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error('Failed to toggle sponsor:', err);
    }
  };

  // Delete Sponsor
  const handleDeleteSponsor = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the sponsor banner "${title}"?`)) return;

    try {
      const res = await fetch(`/api/super-admin/ads?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        triggerFeedback('Private sponsor banner deleted.');
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete sponsor');
      }
    } catch {
      alert('Network error deleting sponsor banner');
    }
  };

  // 3. Save General Settings
  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGeneral(true);
    try {
      const res = await fetch('/api/super-admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: generalSettings }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerFeedback('Global site brand identity and footer settings updated.');
      } else {
        alert(data.error || 'Failed to save general settings');
      }
    } catch {
      alert('Network error saving site settings');
    } finally {
      setSavingGeneral(false);
    }
  };

  // Add / Remove Footer Link
  const handleAddFooterLink = () => {
    setGeneralSettings({
      ...generalSettings,
      footerLinks: [...generalSettings.footerLinks, { label: 'New Link', href: '/' }],
    });
  };

  const handleRemoveFooterLink = (idx: number) => {
    const updated = generalSettings.footerLinks.filter((_, i) => i !== idx);
    setGeneralSettings({ ...generalSettings, footerLinks: updated });
  };

  const handleUpdateFooterLink = (idx: number, field: string, val: any) => {
    const updated = [...generalSettings.footerLinks];
    updated[idx] = { ...updated[idx], [field]: val };
    setGeneralSettings({ ...generalSettings, footerLinks: updated });
  };

  if (!isSuperAdminRole) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <p className="text-slate-400 mt-2 text-sm leading-relaxed">
          Ads Management, Private Sponsors, and Site Settings are strictly restricted to <span className="text-white font-semibold">SUPER_ADMIN</span> accounts.
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Phase 3 Live
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Super Admin Strictly
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            Ads, Monetization & Site Settings
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Configure Google AdSense publisher keys, placement slots, private sponsor campaigns, and platform branding.
          </p>
        </div>

        <button
          onClick={fetchAllData}
          disabled={loading}
          className="self-start sm:self-center p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Floating Success Feedback */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-between shadow-lg shadow-emerald-950/50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('adsense')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'adsense'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Google AdSense & Placements</span>
        </button>
        <button
          onClick={() => setActiveTab('sponsors')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'sponsors'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Private Sponsors Manager ({sponsors.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'general'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>General Site Settings</span>
        </button>
      </div>

      {/* TAB 1: ADSENSE & PLACEMENTS */}
      {activeTab === 'adsense' && (
        <form onSubmit={handleSaveAdSettings} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Google AdSense Publisher Identity
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Enter your Google AdSense client/publisher ID. When enabled, valid responsive ad scripts are automatically injected into the page without cumulative layout shifts (CLS).
              </p>
            </div>

            <div className="max-w-md">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                AdSense Publisher ID (`adsense_publisher_id`)
              </label>
              <input
                type="text"
                value={publisherId}
                onChange={(e) => setPublisherId(e.target.value)}
                placeholder="ca-pub-1234567890123456"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Found in your Google AdSense Dashboard &gt; Settings &gt; Account Information.
              </span>
            </div>

            <div className="border-t border-slate-800/80 pt-6">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Individual Ad Placement Slot Controls
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Toggle individual placement slots ON or OFF across the platform. When a slot is OFF, layout space is collapsed with zero CLS.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                {/* 1. Top Banner */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Top Header Banner (`top_banner`)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Leaderboard above main categories hub</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlacements({ ...placements, top_banner: !placements.top_banner })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                      placements.top_banner
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {placements.top_banner ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* 2. In-Feed Native Ads */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">In-Feed Native Ads (`in_feed`)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Inserted after every 6th provider card</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlacements({ ...placements, in_feed: !placements.in_feed })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                      placements.in_feed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {placements.in_feed ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* 3. Profile Sidebar */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Profile Sidebar (`profile_sidebar`)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Desktop sticky unit on provider profile</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlacements({ ...placements, profile_sidebar: !placements.profile_sidebar })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                      placements.profile_sidebar
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {placements.profile_sidebar ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* 4. Mobile Sticky Footer */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Mobile Sticky (`mobile_sticky`)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Anchor banner for smartphone screens</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlacements({ ...placements, mobile_sticky: !placements.mobile_sticky })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                      placements.mobile_sticky
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {placements.mobile_sticky ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-end">
              <button
                type="submit"
                disabled={savingAds}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{savingAds ? 'Saving Changes...' : 'Save Ad Configuration'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: PRIVATE SPONSORS MANAGER */}
      {activeTab === 'sponsors' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Private Sponsor Campaigns
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload direct brand partnerships (e.g. tool manufacturers, solar distributors). Active sponsor banners take priority over AdSense.
              </p>
            </div>

            <button
              onClick={handleOpenAddSponsor}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Sponsor Banner</span>
            </button>
          </div>

          {/* Sponsors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsors.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
                <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-400">No private sponsor banners configured</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click &quot;New Sponsor Banner&quot; to upload promotional partnerships and affiliate links.
                </p>
              </div>
            ) : (
              sponsors.map((s) => (
                <div
                  key={s.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
                >
                  <div>
                    {/* Banner Image Preview */}
                    <div className="h-36 bg-slate-950 relative overflow-hidden flex items-center justify-center border-b border-slate-800">
                      {s.imageUrl ? (
                        <img
                          src={s.imageUrl}
                          alt={s.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-slate-600 text-xs">No image provided</div>
                      )}
                      <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        s.isActive
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {s.isActive ? 'Active' : 'Paused'}
                      </span>
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/70 text-slate-200">
                        Slot: {s.slot}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-bold text-white line-clamp-1">{s.title}</h3>
                      <a
                        href={s.destinationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 line-clamp-1 font-mono"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span>{s.destinationUrl}</span>
                      </a>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-800/80 mt-2 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleSponsorActive(s)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        s.isActive ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {s.isActive ? 'Pause Banner' : 'Activate Banner'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditSponsor(s)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                        title="Edit Banner"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSponsor(s.id, s.title)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* MODAL: ADD / EDIT SPONSOR */}
          {sponsorModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    {editingSponsor ? 'Edit Private Sponsor' : 'Add Private Sponsor Campaign'}
                  </h3>
                  <button
                    onClick={() => setSponsorModalOpen(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveSponsor} className="p-6 space-y-4">
                  {sponsorError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                      {sponsorError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Campaign Title / Sponsor Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={sponsorTitle}
                      onChange={(e) => setSponsorTitle(e.target.value)}
                      placeholder="Orient Solar Inverters Promotion"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Placement Slot <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={sponsorSlot}
                        onChange={(e) => setSponsorSlot(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="top_banner">Top Header Banner</option>
                        <option value="in_feed">In-Feed Native Ad</option>
                        <option value="profile_sidebar">Profile Sticky Sidebar</option>
                        <option value="mobile_sticky">Mobile Sticky Footer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Campaign Status
                      </label>
                      <button
                        type="button"
                        onClick={() => setSponsorIsActive(!sponsorIsActive)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
                          sponsorIsActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {sponsorIsActive ? 'Campaign Active' : 'Campaign Paused'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Banner Image URL <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={sponsorImageUrl}
                      onChange={(e) => setSponsorImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Destination Target URL (WhatsApp or Landing Page) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={sponsorDestination}
                      onChange={(e) => setSponsorDestination(e.target.value)}
                      placeholder="https://wa.me/923001234567 or https://sponsor.com"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setSponsorModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingSponsor}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                    >
                      {savingSponsor ? 'Saving...' : editingSponsor ? 'Update Campaign' : 'Publish Campaign'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GENERAL SITE SETTINGS */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-400" />
                Global Brand Identity & Support Settings
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Customize platform brand typography, logo imagery, direct customer support channel, and footer links.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Platform Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={generalSettings.brandName}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, brandName: e.target.value })
                  }
                  placeholder="Baseera"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Support WhatsApp Number (International format)
                </label>
                <input
                  type="text"
                  required
                  value={generalSettings.supportWhatsapp}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, supportWhatsapp: e.target.value })
                  }
                  placeholder="+923001234567"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Custom Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={generalSettings.logoUrl}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, logoUrl: e.target.value })
                  }
                  placeholder="https://example.com/logo.svg"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Dynamic Footer Links */}
            <div className="border-t border-slate-800/80 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Dynamic Global Footer Links</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage navigation and legal policy links displayed in the unified footer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFooterLink}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Link</span>
                </button>
              </div>

              <div className="space-y-3 max-w-3xl">
                {generalSettings.footerLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => handleUpdateFooterLink(idx, 'label', e.target.value)}
                      placeholder="Label (e.g. Terms)"
                      className="w-40 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={link.href}
                      onChange={(e) => handleUpdateFooterLink(idx, 'href', e.target.value)}
                      placeholder="URL (/terms)"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFooterLink(idx)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg"
                      title="Remove Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-end">
              <button
                type="submit"
                disabled={savingGeneral}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{savingGeneral ? 'Saving Settings...' : 'Save Site Settings'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
