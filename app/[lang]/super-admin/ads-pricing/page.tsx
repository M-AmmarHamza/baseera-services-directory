import React from 'react';
import Link from 'next/link';
import { DollarSign, ArrowLeft, Clock } from 'lucide-react';

export default function AdsPricingPlaceholderPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
        <DollarSign className="w-8 h-8" />
      </div>
      <div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          Phase 3 Roadmap
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-3">
          Ad Placements & Premium Monetization
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto mt-2 text-sm leading-relaxed">
          Manage homepage banners, category sponsored top-listings, subscription tiers, and provider verification badge pricing.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left max-w-lg mx-auto">
        <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Planned Phase 3 Features:
        </h3>
        <ul className="mt-3 space-y-2 text-xs text-slate-400 list-disc list-inside">
          <li>Custom banner slot management with impression tracking</li>
          <li>Sponsored category top-rank bidding and bidding duration</li>
          <li>Stripe & local payment gateway integration for monthly subscriptions</li>
          <li>Automated invoice generation and payment receipts</li>
        </ul>
      </div>

      <div>
        <Link
          href="."
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Executive Overview</span>
        </Link>
      </div>
    </div>
  );
}
