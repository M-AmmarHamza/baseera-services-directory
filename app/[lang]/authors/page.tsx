import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Users, ChevronRight, ArrowRight, BookOpen, Award, ExternalLink } from 'lucide-react';
import { getSiteUrl } from '@/lib/site-url';
import { buildLanguageAlternates } from '@/lib/seo/alternates';
import { isValidLocale } from '@/lib/routing/validate-route';
import { getAuthors, getLocalizedAuthorRole, getLocalizedAuthorBio } from '@/lib/authors-data';
import { getBlogPostsByAuthorSlug } from '@/lib/blog-data';
import JsonLd from '@/components/JsonLd';

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

  const title =
    lang === 'ur'
      ? 'اداریاتی مصنفین اور تکنیکی ماہرین | بصیرہ جرنل'
      : lang === 'ar'
      ? 'فريق التحرير والخبراء الفنيين | مجلة بصيرة'
      : 'Editorial Authors & Technical Contributors | Baseera Journal';

  const description =
    lang === 'ur'
      ? 'بصیرہ ڈائریکٹری کے مستند مصنفین، فیلڈ انجینئرز اور ماہر کاریگروں سے ملیں جو گھریلو اور تکنیکی رہنمائی فراہم کرتے ہیں۔'
      : lang === 'ar'
      ? 'تعرف على الكتاب المعتمدين والمهندسين والخبراء المهنيين وراء أدلة وإرشادات دليل بصيرة.'
      : 'Meet the certified engineers, master trade specialists, and technical editors authoring verified maintenance guides on Baseera.';

  return {
    title,
    description,
    alternates: buildLanguageAlternates('/authors', lang),
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/${lang}/authors`,
      siteName: 'Baseera',
    },
  };
}

export default async function AuthorsIndexPage({ params }: Props) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  const authors = await getAuthors({ activeOnly: true });

  const authorsWithPosts = await Promise.all(
    authors.map(async (author) => {
      const posts = await getBlogPostsByAuthorSlug(author.slug);
      return { author, posts };
    })
  );

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Baseera Editorial Authors & Contributors',
    itemListElement: authors.map((a, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Person',
        name: a.name,
        url: `${DOMAIN}/${lang}/authors/${a.slug}`,
        jobTitle: a.role_en,
        description: a.bio_en,
      },
    })),
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
    ],
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-20 font-sans">
      <JsonLd data={itemListSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Breadcrumb Header */}
      <nav aria-label="Breadcrumb" className="border-b border-gray-100 bg-[#fbfbfe] py-3.5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ol className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <li>
              <Link href={`/${lang}`} className="hover:text-emerald-700 transition-colors">
                {lang === 'ur' ? 'ہوم' : lang === 'ar' ? 'الرئيسية' : 'Home'}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3 h-3 text-gray-400 rtl:rotate-180" />
            </li>
            <li className="text-gray-900 font-medium">
              {lang === 'ur' ? 'مصنفین اور ماہرین' : lang === 'ar' ? 'الكتاب والمساهمون' : 'Authors & Contributors'}
            </li>
          </ol>
        </div>
      </nav>

      {/* Page Hero */}
      <section className="border-b border-gray-200 bg-white py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>{lang === 'ur' ? 'تصدیق شدہ مہارت' : lang === 'ar' ? 'خبرة معتمدة' : 'Verified E-E-A-T Expertise'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
              {lang === 'ur'
                ? 'ہمارے اداریاتی ماہرین اور مصنفین'
                : lang === 'ar'
                ? 'فريق التحرير والخبراء الفنيين'
                : 'Our Editorial Team & Technical Authors'}
            </h1>
            <p className="text-base text-gray-600 mt-2.5 leading-relaxed">
              {lang === 'ur'
                ? 'بصیرہ پر شائع ہونے والا ہر آرٹیکل تجربہ کار فیلڈ کاریگروں اور مصدقہ انجینئرز کے عملی تجزیے پر مبنی ہوتا ہے۔'
                : lang === 'ar'
                ? 'جميع أدلتنا الفنية تُكتب وتُراجع بواسطة مهندسين وفنيين ميدانيين متمرسين لضمان أعلى معايير الدقة.'
                : 'Every technical manual and guide on Baseera is researched, drafted, and verified by certified field practitioners with decades of hands-on experience.'}
            </p>
          </div>
        </div>
      </section>

      {/* Authors Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {authorsWithPosts.map(({ author, posts }) => {
            const role = getLocalizedAuthorRole(author, lang);
            const bio = getLocalizedAuthorBio(author, lang);
            const authorHref = `/${lang}/authors/${author.slug}`;

            return (
              <div
                key={author.id}
                className="flex flex-col justify-between p-6 rounded-2xl border border-gray-200 bg-white hover:border-emerald-500/50 hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    {author.avatarUrl ? (
                      <img
                        src={author.avatarUrl}
                        alt={author.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/30 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shrink-0">
                        {author.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-gray-900 hover:text-[#059669] transition-colors truncate">
                        <Link href={authorHref}>
                          {author.name}
                        </Link>
                      </h2>
                      <p className="text-xs text-emerald-700 font-semibold mt-0.5 line-clamp-1">
                        {role}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {bio}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    {posts.length} {lang === 'ur' ? 'مضامین' : lang === 'ar' ? 'مقالات' : 'articles'}
                  </span>

                  <Link
                    href={authorHref}
                    className="text-xs font-semibold text-[#059669] hover:text-[#047857] inline-flex items-center gap-1"
                  >
                    <span>{lang === 'ur' ? 'پروفائل دیکھیں' : lang === 'ar' ? 'عرض الملف' : 'View Profile'}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
