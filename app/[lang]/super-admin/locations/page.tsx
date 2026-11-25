import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowLeft, Clock } from 'lucide-react';

export default function LocationsPlaceholderPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
        <MapPin className="w-8 h-8" />
      </div>
      <div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/15 text-teal-400 border border-teal-500/30">
          Phase 2 Roadmap
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-3">
          Geographic Hierarchy & District Management
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto mt-2 text-sm leading-relaxed">
          Country hubs, primary city mappings, neighborhood district polygon definitions, and auto-geo redirect configuration will be unlocked in Phase 2.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left max-w-lg mx-auto">
        <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Planned Phase 2 Features:
        </h3>
        <ul className="mt-3 space-y-2 text-xs text-slate-400 list-disc list-inside">
          <li>Interactive map boundary selector for local districts</li>
          <li>Country-level currency and ISO code config</li>
          <li>Default primary city per country switcher</li>
          <li>Localized transliteration dictionary for neighborhood names</li>
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
