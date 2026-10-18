import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight, Clock, User, Calendar, BookOpen } from 'lucide-react';

interface Props {
  params: Promise<{
    lang: string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: 'Baseera Editorial | Guides, Maintenance Tips & Trade Stories',
    description: 'Practical home maintenance guides, electrician hiring safety, plumbing DIY checklists, and verified local stories across Pakistan and the Middle East.',
    alternates: {
      canonical: `${DOMAIN}/${lang}/blog`,
      languages: {
        en: `${DOMAIN}/en/blog`,
        ur: `${DOMAIN}/ur/blog`,
        ar: `${DOMAIN}/ar/blog`,
        'x-default': `${DOMAIN}/en/blog`,
      },
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { lang } = await params;

  const featuredArticle = {
    title: 'How to Prevent AC Inverter PCB Short Circuits in Summer Heatwaves',
    excerpt: 'Surge voltages, high ambient temperatures, and improper neutral grounding destroy thousands of inverter cards every June. Here is the technician-approved checklist to safeguard your cooling units.',
    category: 'AC Maintenance',
    author: 'Engr. Tariq Mahmood',
    date: 'October 12, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    slug: 'ac-inverter-pcb-short-circuit-prevention',
  };

  const stories = [
    {
      id: '1',
      title: 'Underground Water Line Leak Detection Without Breaking Tiles',
      excerpt: 'Modern acoustic detectors and thermal sensors allow master plumbers to pinpoint hidden pipe fractures before demolishing costly bathroom floors.',
      category: 'Plumbing Guide',
      author: 'Saleem Akhtar',
      date: 'October 08, 2026',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      slug: 'underground-water-leak-detection',
    },
    {
      id: '2',
      title: 'Solar Inverter DB Breaker Sizing: Single Phase vs 3-Phase',
      excerpt: 'Avoid nuisance breaker tripping during high solar generation peaks by correctly balancing loads across dedicated distribution panels.',
      category: 'Solar & Electrical',
      author: 'Asif Electric Works',
      date: 'October 04, 2026',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
      slug: 'solar-inverter-db-breaker-sizing',
    },
    {
      id: '3',
      title: 'Top 5 Questions to Ask Any Karigar Before Work Commences',
      excerpt: 'A practical framework for homeowners: validating parts warranties, establishing visiting fees, and testing safety switches on-site.',
      category: 'Consumer Advice',
      author: 'Baseera Editorial',
      date: 'September 28, 2026',
      readTime: '3 min read',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
      slug: 'questions-to-ask-any-karigar',
    },
    {
      id: '4',
      title: 'Gas Generator vs UPS Hybrid Inverter: Real Running Costs Compared',
      excerpt: 'With fuel price fluctuations, calculate the true hourly cost per kilowatt hour between battery storage systems and portable gas gensets.',
      category: 'Power Backup',
      author: 'Farhan Generator Care',
      date: 'September 21, 2026',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      slug: 'generator-vs-ups-running-cost',
    },
    {
      id: '5',
      title: 'Preventing Damp Walls and Paint Peeling After Monsoon Rains',
      excerpt: 'Why standard emulsion paint fails on damp boundary walls, and how multi-coat polymer elastomeric sealers preserve interior aesthetics.',
      category: 'Home Renovation',
      author: 'Master Polish Co.',
      date: 'September 15, 2026',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
      slug: 'preventing-damp-walls-after-monsoon',
    },
    {
      id: '6',
      title: 'CCTV IP Camera Setup: Avoiding Cloud Subscription Traps',
      excerpt: 'How local NVR storage combined with end-to-end encrypted mobile apps saves thousands in monthly cloud storage fees.',
      category: 'Security Tech',
      author: 'SecureVision Team',
      date: 'September 10, 2026',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
      slug: 'cctv-ip-camera-local-storage-guide',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-20 font-sans">
      {/* Editorial Header */}
      <section className="border-b border-gray-200 bg-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>PakMarket Editorial Style</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-neutral-900">
              Baseera Journal
            </h1>
            <p className="text-base text-gray-600 mt-2 font-normal leading-relaxed">
              Technical trade guides, troubleshooting advice from master karigars, and transparent local service insights.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-16">
        {/* 1. LARGE FEATURED ARTICLE (SPLIT 50/50) */}
        <section className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
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
                  {featuredArticle.title}
                </h2>

                <p className="text-base text-emerald-100 font-normal leading-relaxed mb-6">
                  {featuredArticle.excerpt}
                </p>
              </div>

              <div className="pt-5 sm:pt-6 border-t border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-emerald-100">
                  <User className="w-4 h-4 text-emerald-200" />
                  <span className="font-semibold text-white">{featuredArticle.author}</span>
                  <span>•</span>
                  <span>{featuredArticle.date}</span>
                </div>

                <Link
                  href={`/${lang}/blog/${featuredArticle.slug}`}
                  className="bg-white hover:bg-emerald-50 text-[#059669] font-semibold text-sm px-4 py-2 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 self-start sm:self-auto shadow-2xs"
                >
                  <span>Read Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 3-COLUMN GRID: LATEST STORIES */}
        <section>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 leading-snug">
                Latest Stories
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Expert maintenance and trade breakdowns updated weekly
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
                    {/* Light Green Category Tag */}
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

                    {/* 2-line gray excerpt */}
                    <p className="text-base text-gray-600 line-clamp-2 leading-relaxed">
                      {story.excerpt}
                    </p>
                  </div>
                </div>

                {/* Footer: Read More Link in Emerald Green */}
                <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    {story.readTime}
                  </span>

                  <Link
                    href={`/${lang}/blog/${story.slug}`}
                    className="text-sm font-semibold text-[#059669] hover:text-[#047857] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
