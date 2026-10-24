import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 24 hours

export async function GET() {
  try {
    const siteUrl = getSiteUrl();
    const filePath = path.join(process.cwd(), 'public', 'llms.txt');
    let content = fs.readFileSync(filePath, 'utf8');

    // Dynamically synchronize all domain references to the active environment URL
    content = content.replace(/https:\/\/baseera-services-directory\.vercel\.app/g, siteUrl);

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err: any) {
    const siteUrl = getSiteUrl();
    return new NextResponse(
      `# Baseera - Global Local Services Directory\n\n> Baseera is a zero-commission platform connecting users directly to verified local service specialists via direct WhatsApp inquiries. No middlemen.\n\nPrimary Domain: ${siteUrl}`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    );
  }
}
