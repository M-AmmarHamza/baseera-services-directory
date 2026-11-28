import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  Clock,
  User,
  Calendar,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Share2,
  BookOpen,
} from 'lucide-react';
import { getSiteUrl } from '@/lib/site-url';
import { buildLanguageAlternates } from '@/lib/seo/alternates';
import { isValidLocale } from '@/lib/routing/validate-route';
import { getBlogPosts, getBlogPostBySlug, BlogPost } from '@/lib/blog-data';
import { getAuthorBySlug, getLocalizedAuthorRole } from '@/lib/authors-data';
import BlogServiceCTA from '@/components/BlogServiceCTA';
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
  const posts = await getBlogPosts();
  return posts.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isValidLocale(lang)) notFound();

  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const title = `${post.title} | Baseera Journal`;
  const description = post.excerpt;
  const alternates = buildLanguageAlternates(`/blog/${post.slug}`, lang);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [`${DOMAIN}/${lang}/authors/${post.authorSlug}`],
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [post.image],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isValidLocale(lang)) notFound();

  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const author = await getAuthorBySlug(post.authorSlug);
  const authorName = author ? author.name : post.authorName;
  const authorRole = author ? getLocalizedAuthorRole(author, lang) : 'Technical Contributor';
  const authorUrl = `/${lang}/authors/${post.authorSlug}`;

  const allPosts = await getBlogPosts();
  const relatedStories = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  // Structured Data: Article / BlogPosting Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${DOMAIN}/${lang}/blog/${post.slug}`,
    },
    author: {
      '@type': 'Person',
      name: authorName,
      url: `${DOMAIN}/${lang}/authors/${post.authorSlug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Baseera',
      url: DOMAIN,
      logo: {
        '@type': 'ImageObject',
        url: `${DOMAIN}/icon.png`,
      },
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
        name: lang === 'ur' ? 'بلاگ اور گائیڈز' : lang === 'ar' ? 'المقالات' : 'Blog',
        item: `${DOMAIN}/${lang}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${DOMAIN}/${lang}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <article className="min-h-screen bg-white text-neutral-900 pb-20 font-sans">
      <JsonLd data={articleSchema} />
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
              <Link href={`/${lang}/blog`} className="hover:text-emerald-700 transition-colors">
                {lang === 'ur' ? 'جرنل و گائیڈز' : lang === 'ar' ? 'الدليل والمقالات' : 'Journal & Guides'}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3 h-3 text-gray-400 rtl:rotate-180" />
            </li>
            <li className="text-gray-900 font-medium truncate max-w-[240px]">
              {post.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* Main Article Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Category Badge & Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
          <span className="px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
            {post.category}
          </span>
          <span className="text-gray-400">•</span>
          <span className="inline-flex items-center gap-1 text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readTime}</span>
          </span>
          <span className="text-gray-400">•</span>
          <span className="inline-flex items-center gap-1 text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{post.date}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight mb-6">
          {post.title}
        </h1>

        {/* Author Byline Bar (Linking directly to Author Profile) */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200/90 bg-gray-50/70 mb-8">
          <div className="flex items-center gap-3.5">
            {author?.avatarUrl ? (
              <img
                src={author.avatarUrl}
                alt={authorName}
                className="w-11 h-11 rounded-full object-cover border border-emerald-600/30"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                {authorName.charAt(0)}
              </div>
            )}
            <div>
              <Link
                href={authorUrl}
                className="text-sm font-bold text-neutral-900 hover:text-[#059669] transition-colors inline-flex items-center gap-1"
              >
                <span>{authorName}</span>
                <span className="text-xs font-normal text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                  {lang === 'ur' ? 'مصنف' : lang === 'ar' ? 'الكاتب' : 'Author'}
                </span>
              </Link>
              <p className="text-xs text-gray-500 mt-0.5">
                {authorRole}
              </p>
            </div>
          </div>

          <Link
            href={authorUrl}
            className="text-xs font-semibold text-[#059669] hover:text-[#047857] inline-flex items-center gap-1 shrink-0 ps-3"
          >
            <span>{lang === 'ur' ? 'پروفائل دیکھیں' : lang === 'ar' ? 'عرض الملف' : 'View Profile'}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>

        {/* Lead Image */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-gray-100 border border-gray-200">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body */}
        <div
          className="prose prose-neutral max-w-none text-base sm:text-lg leading-relaxed text-gray-800 space-y-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* HIGH-INTENT SERVICE CTA CARD: Connects Informational Post to Commercial Money Pages */}
        <BlogServiceCTA
          relatedCategorySlugs={post.relatedCategorySlugs}
          featuredCitySlugs={post.featuredCitySlugs}
          lang={lang}
        />

        {/* About the Author Card */}
        {author && (
          <div className="p-6 rounded-2xl border border-gray-200 bg-white mt-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {author.avatarUrl && (
                <img
                  src={author.avatarUrl}
                  alt={author.name}
                  className="w-16 h-16 rounded-full object-cover border border-emerald-500/30 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  {lang === 'ur' ? 'مصنف کے بارے میں' : lang === 'ar' ? 'عن الكاتب' : 'About the Author'}
                </span>
                <h4 className="text-base font-bold text-gray-900 mt-0.5">
                  <Link href={authorUrl} className="hover:text-[#059669] transition-colors">
                    {author.name}
                  </Link>
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                  {lang === 'ur' ? author.bio_ur : lang === 'ar' ? author.bio_ar : author.bio_en}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Related Guides Grid */}
        {relatedStories.length > 0 && (
          <div className="mt-14 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              {lang === 'ur' ? 'مزید متعلقہ گائیڈز' : lang === 'ar' ? 'مقالات ذات صلة' : 'Related Technical Guides'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedStories.map((story) => (
                <Link
                  key={story.id}
                  href={`/${lang}/blog/${story.slug}`}
                  className="group block p-4 rounded-xl border border-gray-200 hover:border-emerald-500/50 bg-white transition-all shadow-2xs"
                >
                  <span className="text-xs text-[#059669] font-bold block mb-1">
                    {story.category}
                  </span>
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#059669] transition-colors line-clamp-2 leading-snug">
                    {story.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {story.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </article>
  );
}
