import { NextRequest, NextResponse } from 'next/server';
import { GET as seoGET, POST as seoPOST, DELETE as seoDELETE } from '../seo/route';

export async function GET(req: NextRequest) {
  return seoGET(req);
}

export async function POST(req: NextRequest) {
  return seoPOST(req);
}

export async function DELETE(req: NextRequest) {
  return seoDELETE(req);
}
