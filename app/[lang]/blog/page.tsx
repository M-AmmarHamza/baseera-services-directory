import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock, User, Calendar, BookOpen } from 'lucide-react';
import { getSiteUrl } from '@/lib/site-url';
import { buildLanguageAlternates } from '@/lib/seo/alternates';
import { isValidLocale } from '@/lib/routing/validate-route';
import { getBlogPosts } from '@/lib/blog-data';

export const revalidate = 3600; // 1 hour ISR CDN caching

interface Props {
  params: Promise<{
    lang: string;
  }>;
}

const DOMAIN = getSiteUrl();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  return {
    title: 'Baseera Editorial | Guides, Maintenance Tips & Trade Stories',
    description:
      'Practical home maintenance guides, electrician hiring safety, plumbing DIY checklists, and verified local stories across Pakistan and the Middle East.',
    alternates: buildLanguageAlternates('/blog', lang),
  };
}

export default async function BlogPage({ params }: Props) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  const posts = await getBlogPosts();
  const featuredArticle = posts[0];
  const stories = posts.slice(1);

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-20 font-sans">
      {/* Editorial Header */}
      <section className="border-b border-gray-200 bg-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                {lang === 'ur' ? 'بصیرہ اداریہ' : lang === 'ar' ? 'افتتاحية بصيرة' : 'Baseera Editorial'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-neutral-900">
              {lang === 'ur' ? 'بصیرہ ٹیکنیکل جرنل' : lang === 'ar' ? 'مجلة بصيرة الفنية' : 'Baseera Journal'}
            </h1>
            <p className="text-base text-gray-600 mt-2 font-normal leading-relaxed">
              {lang === 'ur'
                ? 'تکنیکی گائیڈز، تصدیق شدہ کاریگروں کے مشورے اور فیلڈ ٹربل شوٹنگ کے اہم رہنما اصول۔'
                : lang === 'ar'
                ? 'أدلة فنية متخصصة وإرشادات صيانة منزلية من خبراء وحرفيين معتمدين.'
                : 'Technical trade guides, troubleshooting advice from master karigars, and transparent local service insights.'}
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-16">
        {/* 1. LARGE FEATURED ARTICLE (SPLIT 50/50) */}
        {featuredArticle && (
          <section className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left: High-Quality Image */}
              <div className="relative min-h-[300px] sm:min-h-[420px] lg:min-h-full bg-gray-100">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right: Solid Dark Emerald Green Background (#059669) */}
              <div className="bg-[#059669] text-white p-5 sm:p-10 lg:p-12 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 mb-4 backdrop-blur-sm">
                    <span>{featuredArticle.category}</span>
                    <span className="w-1 h-1 rounded-full bg-white" />
                    <span>{featuredArticle.readTime}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mb-3 sm:mb-4 leading-snug">
                    <Link
                      href={`/${lang}/blog/${featuredArticle.slug}`}
                      className="hover:underline"
                    >
                      {featuredArticle.title}
                    </Link>
                  </h2>

                  <p className="text-base text-emerald-100 font-normal leading-relaxed mb-6">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="pt-5 sm:pt-6 border-t border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-emerald-100">
                    <User className="w-4 h-4 text-emerald-200" />
                    <Link
                      href={`/${lang}/authors/${featuredArticle.authorSlug}`}
                      className="font-semibold text-white hover:underline"
                    >
                      {featuredArticle.authorName}
                    </Link>
                    <span>•</span>
                    <span>{featuredArticle.date}</span>
                  </div>

                  <Link
                    href={`/${lang}/blog/${featuredArticle.slug}`}
                    className="bg-white hover:bg-emerald-50 text-[#059669] font-semibold text-sm px-4 py-2 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 self-start sm:self-auto shadow-2xs"
                  >
                    <span>{lang === 'ur' ? 'مکمل مضمون پڑھیں' : lang === 'ar' ? 'اقرأ المقال' : 'Read Story'}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. 3-COLUMN GRID: LATEST STORIES */}
        <section>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 leading-snug">
                {lang === 'ur' ? 'تازہ ترین مضامین' : lang === 'ar' ? 'أحدث المقالات' : 'Latest Stories'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {lang === 'ur'
                  ? 'گھریلو مرمت اور دیکھ بھال کے بارے میں ہفتہ وار تکنیکی مضامین'
                  : lang === 'ar'
                  ? 'أدلة صيانة وإرشادات مهنية متجددة أسبوعياً'
                  : 'Expert maintenance and trade breakdowns updated weekly'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <article
                key={story.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-gray-300 transition-colors shadow-2xs"
              >
                <div>
                  {/* Article Thumbnail */}
                  <div className="relative aspect-[16/10] bg-gray-100 border-b border-gray-200">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-5">
                    {/* Category Tag */}
                    <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-2.5">
                      {story.category}
                    </span>

                    {/* Bold Title */}
                    <h3 className="text-lg font-semibold text-neutral-900 tracking-tight leading-snug mb-2">
                      <Link
                        href={`/${lang}/blog/${story.slug}`}
                        className="hover:text-[#059669] transition-colors"
                      >
                        {story.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                      {story.excerpt}
                    </p>

                    {/* Author Byline */}
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 pt-2">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <Link
                        href={`/${lang}/authors/${story.authorSlug}`}
                        className="font-medium text-gray-700 hover:text-[#059669] transition-colors hover:underline"
                      >
                        {story.authorName}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Footer: Read More Link */}
                <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    {story.readTime}
                  </span>

                  <Link
                    href={`/${lang}/blog/${story.slug}`}
                    className="text-sm font-semibold text-[#059669] hover:text-[#047857] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>{lang === 'ur' ? 'مزید پڑھیں' : lang === 'ar' ? 'اقرأ المزيد' : 'Read More'}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
