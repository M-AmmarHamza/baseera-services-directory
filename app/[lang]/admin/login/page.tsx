'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '@/lib/admin-auth';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = (params?.lang as string) || 'en';

  const nextUrl = searchParams.get('next') || `/${lang}/admin`;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFillDemo = () => {
    setEmail(DEFAULT_ADMIN_EMAIL);
    setPassword(DEFAULT_ADMIN_PASSWORD);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to intended admin dashboard destination
        router.push(nextUrl);
        router.refresh();
      } else {
        setErrorMsg(data.error || 'Invalid credentials. Please verify email and password.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error during admin login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-neutral-900 flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <Link href={`/${lang}`} className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#006948] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            ب
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-neutral-900">
            Baseera<span className="text-[#006948]">.Admin</span>
          </span>
        </Link>
        <p className="text-xs text-gray-500 font-medium">
          Global Directory Operations & Moderation Hub
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Sign In</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter your credentials to manage the platform
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center border border-emerald-100">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@baseera.com"
                className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] transition-all bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                Security Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] transition-all bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#006948] hover:bg-[#00855d] active:scale-[0.99] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span>Verifying Session...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Fill Pill */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col items-center gap-2 text-center">
          <button
            type="button"
            onClick={handleFillDemo}
            className="inline-flex items-center gap-1.5 text-xs text-[#006948] bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#006948]" />
            <span>Use Default Master Credentials</span>
          </button>
          <span className="text-[11px] text-gray-400">
            Protected by HMAC-SHA256 session token middleware
          </span>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href={`/${lang}`}
          className="text-xs text-gray-500 hover:text-[#006948] transition-colors font-medium"
        >
          ← Return to Public Global Directory
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
          Loading Admin Security Portal...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}

