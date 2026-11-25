import { NextResponse } from 'next/server';
import { getAdSettings } from '@/lib/settings-db';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const settings = await getAdSettings();
    return NextResponse.json({
      success: true,
      adsense_publisher_id: settings.adsense_publisher_id,
      placements: settings.placements,
      // Only return active sponsors with public fields
      sponsors: settings.sponsors
        .filter((s) => s.isActive)
        .map((s) => ({
          id: s.id,
          slot: s.slot,
          title: s.title,
          imageUrl: s.imageUrl,
          destinationUrl: s.destinationUrl,
        })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ad settings' },
      { status: 500 }
    );
  }
}
