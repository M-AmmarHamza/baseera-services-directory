import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, ADMIN_COOKIE_NAME, isModeratorOrAbove } from '@/lib/admin-auth';
import { getAuditLogs } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);
  if (!valid || !isModeratorOrAbove(session)) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin or Moderator privileges required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    const logs = await getAuditLogs(Math.min(limit, 200));
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch audit logs' }, { status: 500 });
  }
}
