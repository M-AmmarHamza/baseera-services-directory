import React from 'react';
import Link from 'next/link';
import { Layers, ArrowLeft, Clock, ShieldCheck } from 'lucide-react';

export default function CategoriesPlaceholderPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
        <Layers className="w-8 h-8" />
      </div>
      <div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
          Phase 2 Roadmap
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-3">
          Category Hierarchy & Service Taxonomy
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto mt-2 text-sm leading-relaxed">
          Dynamic category creation, custom icon assignment, SEO breadcrumbs hierarchy, and multilingual meta tags management will be unlocked in Phase 2.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left max-w-lg mx-auto">
        <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Planned Phase 2 Features:
        </h3>
        <ul className="mt-3 space-y-2 text-xs text-slate-400 list-disc list-inside">
          <li>Dynamic parent-child category tree editor</li>
          <li>Custom Lucide & SVG icon mapper</li>
          <li>Urdu, Arabic, and English taxonomy slug builder</li>
          <li>Category-level default price limits & pricing units</li>
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
