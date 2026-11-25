import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminToken, ADMIN_COOKIE_NAME, isSuperAdmin } from '@/lib/admin-auth';
import { recordAuditLog } from '@/lib/audit';
import {
  getGeneralSettings,
  updateGeneralSettings,
} from '@/lib/settings-db';
import { GeneralSettingsSchema } from '@/lib/super-admin-schemas';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);

  if (!valid || !isSuperAdmin(session)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Super Admin privileges strictly required.' },
      { status: 403 }
    );
  }

  try {
    const settings = await getGeneralSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);

  if (!valid || !isSuperAdmin(session)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Super Admin privileges strictly required.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = GeneralSettingsSchema.safeParse(body.settings || body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid settings payload' },
        { status: 400 }
      );
    }

    const updated = await updateGeneralSettings(parsed.data);

    await recordAuditLog({
      adminId: session.userId || session.email,
      adminEmail: session.email,
      action: 'UPDATE_GENERAL_SETTINGS',
      entityType: 'SITE_SETTINGS',
      entityId: 'general_settings',
      details: {
        brandName: updated.brandName,
        supportWhatsapp: updated.supportWhatsapp,
        linksCount: updated.footerLinks.length,
      },
    });

    try {
      revalidatePath('/', 'layout');
    } catch (e) {
      // Safe fallback
    }

    return NextResponse.json({
      success: true,
      message: 'General site settings saved.',
      settings: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save site settings' },
      { status: 500 }
    );
  }
}
