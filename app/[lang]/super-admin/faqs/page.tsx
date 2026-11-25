import React from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowLeft, Clock } from 'lucide-react';

export default function FaqsPlaceholderPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
        <HelpCircle className="w-8 h-8" />
      </div>
      <div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
          Phase 2 Roadmap
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-3">
          FAQ Knowledgebase & Structured Schema
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto mt-2 text-sm leading-relaxed">
          Dynamic FAQ management for city and category pages with automatic JSON-LD FAQPage rich snippets generation.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left max-w-lg mx-auto">
        <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Planned Phase 2 Features:
        </h3>
        <ul className="mt-3 space-y-2 text-xs text-slate-400 list-disc list-inside">
          <li>Category-specific dynamic FAQ builder</li>
          <li>Rich text & markdown support with DOMPurify sanitization</li>
          <li>Urdu, English, and Arabic question-answer pairs</li>
          <li>Automated Google Rich Results schema previewer</li>
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
