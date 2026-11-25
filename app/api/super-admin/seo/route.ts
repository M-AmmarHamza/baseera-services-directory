import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminToken, ADMIN_COOKIE_NAME, isSuperAdmin } from '@/lib/admin-auth';
import { recordAuditLog } from '@/lib/audit';
import {
  getGlobalAllowIndexing,
  setGlobalAllowIndexing,
  getRedirectRules,
  saveRedirectRule,
  deleteRedirectRule,
} from '@/lib/settings-db';
import {
  MasterIndexingSchema,
  RedirectRuleSchema,
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

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;

  try {
    const [globalAllowIndexing, redirects] = await Promise.all([
      getGlobalAllowIndexing(),
      getRedirectRules({ search }),
    ]);

    return NextResponse.json({
      success: true,
      globalAllowIndexing,
      redirects,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch SEO settings' },
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

    // 1. Toggle Master Indexing Switch
    if (action === 'TOGGLE_INDEXING') {
      const parsed = MasterIndexingSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0]?.message || 'Invalid indexing data' },
          { status: 400 }
        );
      }

      const updated = await setGlobalAllowIndexing(parsed.data.global_allow_indexing);

      await recordAuditLog({
        adminId: session.userId || session.email,
        adminEmail: session.email,
        action: 'UPDATE_GLOBAL_INDEXING',
        entityType: 'SEO_SETTINGS',
        entityId: 'global_allow_indexing',
        details: { allowed: updated },
      });

      try {
        revalidatePath('/', 'layout');
      } catch (e) {
        // Safe fallback in route handlers
      }

      return NextResponse.json({
        success: true,
        message: updated
          ? 'Production indexing enabled. Spiders may index public provider profiles.'
          : 'Staging safe mode enabled. Entire site is set to noindex, nofollow.',
        globalAllowIndexing: updated,
      });
    }

    // 2. Save / Update 301 Redirect Rule
    if (action === 'SAVE_REDIRECT' || !action) {
      const parsed = RedirectRuleSchema.safeParse(body.rule || body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0]?.message || 'Invalid redirect rule data' },
          { status: 400 }
        );
      }

      const saved = await saveRedirectRule(parsed.data);

      await recordAuditLog({
        adminId: session.userId || session.email,
        adminEmail: session.email,
        action: parsed.data.id ? 'UPDATE_REDIRECT_RULE' : 'CREATE_REDIRECT_RULE',
        entityType: 'REDIRECT_RULE',
        entityId: saved.id,
        details: {
          sourcePath: saved.sourcePath,
          destinationPath: saved.destinationPath,
          statusCode: saved.statusCode,
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
        message: 'Redirect rule saved successfully.',
        rule: saved,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action specified' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to process SEO request' },
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
      { success: false, error: 'Redirect rule ID is required for deletion' },
      { status: 400 }
    );
  }

  try {
    await deleteRedirectRule(id);

    await recordAuditLog({
      adminId: session.userId || session.email,
      adminEmail: session.email,
      action: 'DELETE_REDIRECT_RULE',
      entityType: 'REDIRECT_RULE',
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
      message: 'Redirect rule deleted successfully.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to delete redirect rule' },
      { status: 500 }
    );
  }
}
