'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Search,
  AlertCircle,
  Building,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jkdzlunnrtfdmhgsmxyu.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ZWex7txUSkCUoSmlDdDQvg__cT_i9gI';

// SPECIFIC AUTHORIZED ADMIN UUID
const AUTHORIZED_ADMIN_UUID = process.env.NEXT_PUBLIC_ADMIN_UUID || 'admin-super-uuid-baseera-master';

interface PendingProvider {
  id: string;
  name: string;
  business_name?: string;
  slug: string;
  city_slug?: string;
  category_id?: string;
  whatsapp_number: string;
  is_verified: boolean;
  short_bio?: string;
  created_at?: string;
}

export default function AdminApprovalDashboard() {
  const [adminKey, setAdminKey] = useState(AUTHORIZED_ADMIN_UUID);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [providers, setProviders] = useState<PendingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Initial Sample / Supabase Providers
  useEffect(() => {
    async function loadPending() {
      setLoading(true);
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data, error } = await supabase
          .from('providers')
          .select('id, name, business_name, slug, city_id, category_id, whatsapp_number, is_verified, short_bio, created_at')
          .eq('is_verified', false);

        if (!error && data && data.length > 0) {
          setProviders(data);
        } else {
          // Default mock pending providers for review preview
          setProviders([
            {
              id: 'p-pending-1',
              name: 'Irfan Wiring & DB Services',
              business_name: 'Irfan Wiring Works',
              slug: 'tariq-mahmood',
              city_slug: 'karachi',
              category_id: 'electrician',
              whatsapp_number: '+92 312 9845112',
              is_verified: false,
              short_bio: '12 years experience in 3-phase commercial wiring, DB panel load division and solar net metering installation.',
              created_at: '2 hours ago',
            },
            {
              id: 'p-pending-2',
              name: 'Gulf Aircon Cooling Works',
              business_name: 'Gulf Aircon Service',
              slug: 'kashif-ali',
              city_slug: 'dubai',
              category_id: 'ac',
              whatsapp_number: '+971 50 1234567',
              is_verified: false,
              short_bio: 'Certified Daikin and Gree inverter technician with genuine manifold pressure gauges and chemical jet washing equipment.',
              created_at: '5 hours ago',
            },
            {
              id: 'p-pending-3',
              name: 'Saleem Boring & Water Motors',
              business_name: 'Saleem Boring Services',
              slug: 'saleem-master-plumber',
              city_slug: 'karachi',
              category_id: 'plumbing',
              whatsapp_number: '+92 333 4567890',
              is_verified: false,
              short_bio: 'Underground sanitary fittings, PPRC water line repair and deep submersible motor bore hole installations.',
              created_at: '1 day ago',
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to load pending providers:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPending();
  }, []);

  // APPROVE PROFILE ACTION
  const handleApprove = async (providerId: string) => {
    setApprovingId(providerId);

    try {
      // Call backend approval API route
      await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: providerId }),
      });

      // Update local state instantly
      setProviders((prev) =>
        prev.map((p) => (p.id === providerId ? { ...p, is_verified: true } : p))
      );
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setApprovingId(null);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex items-center justify-center p-4">
        <div className="p-8 border border-gray-200 rounded-2xl max-w-md text-center bg-white">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Unauthorized Access</h1>
          <p className="text-xs text-gray-500 mb-6">
            This dashboard is restricted to authorized Baseera administration UUIDs only.
          </p>
          <Link
            href="/"
            className="inline-block bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl"
          >
            Return to Directory Home
          </Link>
        </div>
      </div>
    );
  }

  const pendingList = providers.filter((p) => !p.is_verified);
  const approvedList = providers.filter((p) => p.is_verified);

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Moderation Gate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-neutral-900">
              Provider Verification Queue
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Review new vendor submissions for spam prevention before publishing to the live directory.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-mono text-xs">
              UUID: {AUTHORIZED_ADMIN_UUID.slice(0, 14)}...
            </span>
          </div>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-5 border border-gray-200 rounded-xl bg-white flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Pending Approval
              </span>
              <span className="text-3xl font-black text-neutral-900">
                {pendingList.length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 border border-gray-200 rounded-xl bg-white flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Approved This Session
              </span>
              <span className="text-3xl font-black text-[#059669]">
                {approvedList.length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* PENDING PROVIDERS DATA TABLE */}
        <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Pending Submissions ({pendingList.length})
            </h2>
            <span className="text-xs text-gray-500">Fast 1-Click Verification</span>
          </div>

          {pendingList.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-[#059669] mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-900 mb-1">Queue Clean!</h3>
              <p className="text-xs text-gray-500">
                All submitted service providers have been approved and published to the live directory.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider bg-white">
                    <th className="py-3.5 px-6">Business Name</th>
                    <th className="py-3.5 px-6">City</th>
                    <th className="py-3.5 px-6">Phone / WhatsApp</th>
                    <th className="py-3.5 px-6">Inspection</th>
                    <th className="py-3.5 px-6 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {pendingList.map((item) => {
                    const city = item.city_slug || 'karachi';
                    const category = item.category_id || 'electrician';
                    const publicUrl = `/en/pk/${city}/${category}/${item.slug}`;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* Business Name */}
                        <td className="py-4 px-6 font-semibold text-neutral-900">
                          <div>
                            <span>{item.business_name || item.name}</span>
                            {item.short_bio && (
                              <p className="text-xs text-gray-400 font-normal line-clamp-1 mt-0.5">
                                {item.short_bio}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* City */}
                        <td className="py-4 px-6 text-xs text-gray-600 font-medium capitalize">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span>{city}</span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-4 px-6 text-xs text-gray-600 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{item.whatsapp_number}</span>
                          </div>
                        </td>

                        {/* View Public Profile Button */}
                        <td className="py-4 px-6">
                          <Link
                            href={publicUrl}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#059669] px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-[#059669] transition-colors"
                          >
                            <span>View Public Profile</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </td>

                        {/* Approve Profile Action Button */}
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            disabled={approvingId === item.id}
                            onClick={() => handleApprove(item.id)}
                            className="bg-[#059669] hover:bg-[#047857] disabled:bg-emerald-300 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              {approvingId === item.id ? 'Approving...' : 'Approve Profile'}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
