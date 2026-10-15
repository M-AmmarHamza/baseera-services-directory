import { NextRequest, NextResponse } from 'next/server';
import { POST as trackLeadPOST } from '@/app/api/track-lead/route';

export async function POST(req: NextRequest) {
  return trackLeadPOST(req);
}
