import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminToken, ADMIN_COOKIE_NAME, isSuperAdmin } from '@/lib/admin-auth';
import { recordAuditLog } from '@/lib/audit';
import {
  getAdSettings,
  updateAdSettings,
  savePrivateSponsor,
  deletePrivateSponsor,
} from '@/lib/settings-db';
import {
  AdSettingsSchema,
  PrivateSponsorSchema,
} from '@/lib/super-admin-schemas';

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
    const settings = await getAdSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch ad settings' },
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
    const action = body.action;

    // 1. Update AdSense Publisher ID & Placement Toggles
    if (action === 'UPDATE_SETTINGS') {
      const parsed = AdSettingsSchema.safeParse(body.settings || body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0]?.message || 'Invalid ad settings data' },
          { status: 400 }
        );
      }

      const updated = await updateAdSettings({
        adsense_publisher_id: parsed.data.adsense_publisher_id,
        placements: parsed.data.placements,
      });

      await recordAuditLog({
        adminId: session.userId || session.email,
        adminEmail: session.email,
        action: 'UPDATE_AD_SETTINGS',
        entityType: 'ADS_SETTINGS',
        entityId: 'ad_settings',
        details: {
          adsense_publisher_id: updated.adsense_publisher_id,
          placements: updated.placements,
        },
      });

      try {
        revalidatePath('/', 'layout');
      } catch (e) {
        // Safe fallback
      }

      return NextResponse.json({
        success: true,
        message: 'Ad placements and publisher configuration saved.',
        settings: updated,
      });
    }

    // 2. Add / Edit Private Sponsor Banner
    if (action === 'SAVE_SPONSOR') {
      const parsed = PrivateSponsorSchema.safeParse(body.sponsor || body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0]?.message || 'Invalid sponsor banner data' },
          { status: 400 }
        );
      }

      const saved = await savePrivateSponsor(parsed.data);

      await recordAuditLog({
        adminId: session.userId || session.email,
        adminEmail: session.email,
        action: parsed.data.id ? 'UPDATE_SPONSOR_BANNER' : 'CREATE_SPONSOR_BANNER',
        entityType: 'PRIVATE_SPONSOR',
        entityId: saved.id,
        details: {
          title: saved.title,
          slot: saved.slot,
          destinationUrl: saved.destinationUrl,
          isActive: saved.isActive,
        },
      });

      try {
        revalidatePath('/', 'layout');
      } catch (e) {
        // Safe fallback
      }

      return NextResponse.json({
        success: true,
        message: 'Private sponsor banner saved successfully.',
        sponsor: saved,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action specified' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update ads configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);

  if (!valid || !isSuperAdmin(session)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Super Admin privileges strictly required.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Sponsor banner ID is required for deletion' },
      { status: 400 }
    );
  }

  try {
    await deletePrivateSponsor(id);

    await recordAuditLog({
      adminId: session.userId || session.email,
      adminEmail: session.email,
      action: 'DELETE_SPONSOR_BANNER',
      entityType: 'PRIVATE_SPONSOR',
      entityId: id,
      details: { deletedAt: new Date().toISOString() },
    });

    try {
      revalidatePath('/', 'layout');
    } catch (e) {
      // Safe fallback
    }

    return NextResponse.json({
      success: true,
      message: 'Private sponsor banner deleted.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to delete sponsor banner' },
      { status: 500 }
    );
  }
}
