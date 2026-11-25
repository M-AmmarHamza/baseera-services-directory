import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import {
  verifyAdminToken,
  ADMIN_COOKIE_NAME,
  isModeratorOrAbove,
  isSuperAdmin,
  canDelete,
} from '@/lib/admin-auth';
import { localProvidersOverrides, localImportedProviders } from '@/lib/db';
import { recordAuditLog } from '@/lib/audit';
import { ProviderBulkActionSchema } from '@/lib/super-admin-schemas';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);

  if (!valid || !isModeratorOrAbove(session)) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin or Moderator access required.' }, { status: 401 });
  }

  try {
    const rawBody = await req.json();
    const parseResult = ProviderBulkActionSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid bulk action payload', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { action, ids } = parseResult.data;

    // RBAC: Bulk delete is strictly restricted to SUPER_ADMIN
    if (action === 'delete' && !canDelete(session)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Bulk delete operations are strictly restricted to SUPER_ADMIN role.',
        },
        { status: 403 }
      );
    }

    if (action === 'delete') {
      for (const id of ids) {
        localProvidersOverrides.set(id, {
          _deleted: true,
          status: 'suspended',
          is_available: false,
        } as any);

        const idx = localImportedProviders.findIndex((p) => p.id === id);
        if (idx !== -1) {
          localImportedProviders.splice(idx, 1);
        }
      }

      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
          await supabase.from('providers').delete().in('id', ids);
        } catch (err) {
          console.warn('Supabase bulk delete note:', err);
        }
      }
    } else {
      const updates: Record<string, any> = {};
      if (action === 'publish') {
        updates.status = 'published';
        updates.is_available = true;
      } else if (action === 'suspend') {
        updates.status = 'suspended';
        updates.is_available = false;
      } else if (action === 'index') {
        updates.seo_index = true;
      } else if (action === 'noindex') {
        updates.seo_index = false;
      }

      for (const id of ids) {
        const existing = localProvidersOverrides.get(id) || {};
        localProvidersOverrides.set(id, { ...existing, ...updates });

        const found = localImportedProviders.find((p) => p.id === id);
        if (found) {
          Object.assign(found, updates);
        }
      }

      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
          await supabase
            .from('providers')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .in('id', ids);
        } catch (err) {
          console.warn('Supabase bulk update note:', err);
        }
      }
    }

    // Record Audit Log
    await recordAuditLog({
      adminId: session.email,
      adminEmail: session.email,
      action: `BULK_${action.toUpperCase()}`,
      entityType: 'PROVIDER',
      entityId: 'MULTIPLE',
      details: {
        action,
        count: ids.length,
        ids,
        role: session.role,
      },
    });

    revalidatePath('/[lang]/super-admin/providers', 'page');
    revalidatePath('/[lang]/admin/providers', 'page');

    return NextResponse.json({
      success: true,
      message: `Bulk action '${action}' completed for ${ids.length} provider(s).`,
      count: ids.length,
      action,
    });
  } catch (err: any) {
    console.error('Bulk provider action error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to execute bulk action' }, { status: 500 });
  }
}
