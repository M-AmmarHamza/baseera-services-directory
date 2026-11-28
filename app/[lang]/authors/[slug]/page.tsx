import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  User,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Award,
  Globe2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { getSiteUrl } from '@/lib/site-url';
import { buildLanguageAlternates } from '@/lib/seo/alternates';
import { isValidLocale } from '@/lib/routing/validate-route';
import {
  getAuthors,
  getAuthorBySlug,
  getLocalizedAuthorRole,
  getLocalizedAuthorBio,
} from '@/lib/authors-data';
import { getBlogPostsByAuthorSlug } from '@/lib/blog-data';
import JsonLd from '@/components/JsonLd';

export const revalidate = 3600; // 1 hour ISR CDN caching

interface Props {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
}

const DOMAIN = getSiteUrl();

export async function generateStaticParams() {
  const authors = await getAuthors({ activeOnly: true });
  return authors.map((a) => ({
    slug: a.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isValidLocale(lang)) notFound();

  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const role = getLocalizedAuthorRole(author, lang);
  const bio = getLocalizedAuthorBio(author, lang);

  const title =
    lang === 'ur'
      ? `${author.name} — مصنف اور تکنیکی مشیر | بصیرہ`
      : lang === 'ar'
      ? `${author.name} — كاتب ومساهم فني | بصيرة`
      : `${author.name} — Technical Author & Contributor | Baseera`;

  const alternates = buildLanguageAlternates(`/authors/${author.slug}`, lang);

  return {
    title,
    description: bio.slice(0, 160),
    alternates,
    openGraph: {
      title,
      description: bio.slice(0, 160),
      url: alternates.canonical,
      siteName: 'Baseera',
      images: author.avatarUrl ? [{ url: author.avatarUrl }] : undefined,
    },
  };
}

export default async function AuthorDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isValidLocale(lang)) notFound();

  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const role = getLocalizedAuthorRole(author, lang);
  const bio = getLocalizedAuthorBio(author, lang);
  const posts = await getBlogPostsByAuthorSlug(author.slug);

  // E-E-A-T ProfilePage & Person Structured Data
  const profileSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: author.name,
      url: `${DOMAIN}/${lang}/authors/${author.slug}`,
      image: author.avatarUrl,
      jobTitle: role,
      description: bio,
      sameAs: author.sameAs && author.sameAs.length > 0 ? author.sameAs : undefined,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: lang === 'ur' ? 'ہوم' : lang === 'ar' ? 'الرئيسية' : 'Home',
        item: `${DOMAIN}/${lang}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: lang === 'ur' ? 'مصنفین' : lang === 'ar' ? 'الكتاب' : 'Authors',
        item: `${DOMAIN}/${lang}/authors`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: author.name,
        item: `${DOMAIN}/${lang}/authors/${author.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-20 font-sans">
      <JsonLd data={profileSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Breadcrumb Header */}
      <nav aria-label="Breadcrumb" className="border-b border-gray-100 bg-[#fbfbfe] py-3.5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ol className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <li>
              <Link href={`/${lang}`} className="hover:text-emerald-700 transition-colors">
                {lang === 'ur' ? 'ہوم' : lang === 'ar' ? 'الرئيسية' : 'Home'}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3 h-3 text-gray-400 rtl:rotate-180" />
            </li>
            <li>
              <Link href={`/${lang}/authors`} className="hover:text-emerald-700 transition-colors">
                {lang === 'ur' ? 'مصنفین' : lang === 'ar' ? 'الكتاب' : 'Authors'}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3 h-3 text-gray-400 rtl:rotate-180" />
            </li>
            <li className="text-gray-900 font-medium truncate">
              {author.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* Author Bio Profile Header */}
      <header className="border-b border-gray-200 bg-white py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {author.avatarUrl ? (
              <img
                src={author.avatarUrl}
                alt={author.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-emerald-500/20 shadow-md shrink-0"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-3xl shrink-0">
                {author.name.charAt(0)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'ur' ? 'تصدیق شدہ تکنیکی مصنف' : lang === 'ar' ? 'كاتب معتمد' : 'Verified Contributor'}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                {author.name}
              </h1>

              <p className="text-sm font-semibold text-emerald-700 mt-1">
                {role}
              </p>

              <p className="text-sm text-gray-600 mt-3 leading-relaxed max-w-2xl">
                {bio}
              </p>

              {/* Social / sameAs Links */}
              {author.sameAs && author.sameAs.length > 0 && (
                <div className="flex items-center gap-3 mt-4">
                  {author.sameAs.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-emerald-700 transition-colors"
                    >
                      <Globe2 className="w-3.5 h-3.5" />
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Published Articles by Author */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between pb-4 mb-8 border-b border-gray-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              {lang === 'ur'
                ? `${author.name} کے تحریر کردہ مضامین`
                : lang === 'ar'
                ? `مقالات بقلم ${author.name}`
                : `Articles by ${author.name}`}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {posts.length} {lang === 'ur' ? 'شائع شدہ گائیڈز' : lang === 'ar' ? 'أدلة منشورة' : 'published guides'}
            </p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            {lang === 'ur'
              ? 'اس مصنف کے ابھی کوئی مضامین دستیاب نہیں ہیں۔'
              : lang === 'ar'
              ? 'لا توجد مقالات منشورة لهذا الكاتب حالياً.'
              : 'No articles published by this author yet.'}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="p-5 sm:p-6 rounded-2xl border border-gray-200 bg-white hover:border-emerald-500/50 hover:shadow-sm transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="px-2 py-0.5 rounded font-semibold bg-emerald-50 text-[#059669]">
                      {post.category}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900 hover:text-[#059669] transition-colors leading-snug">
                    <Link href={`/${lang}/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <Link
                  href={`/${lang}/blog/${post.slug}`}
                  className="bg-emerald-50 hover:bg-emerald-100 text-[#059669] font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors inline-flex items-center gap-1 shrink-0 self-start sm:self-center"
                >
                  <span>{lang === 'ur' ? 'پڑھیں' : lang === 'ar' ? 'اقرأ' : 'Read Article'}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
