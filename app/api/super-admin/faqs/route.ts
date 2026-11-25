import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { verifyAdminToken, ADMIN_COOKIE_NAME, isModeratorOrAbove, canDelete } from '@/lib/admin-auth';
import { recordAuditLog } from '@/lib/audit';
import {
  getFaqs,
  saveFaq,
  deleteFaq,
  reorderFaqs,
} from '@/lib/taxonomy-db';
import { FaqMutationSchema, ReorderSchema } from '@/lib/super-admin-schemas';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);
  if (!valid || !isModeratorOrAbove(session)) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin or Moderator access required.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const scopeParam = searchParams.get('scope');
  const scope = scopeParam === 'GLOBAL' || scopeParam === 'CATEGORY' ? scopeParam : undefined;
  const categoryId = searchParams.get('categoryId') || undefined;
  const activeOnly = searchParams.get('activeOnly') === 'true';

  try {
    const faqs = await getFaqs({ scope, categoryId, activeOnly });
    return NextResponse.json({ success: true, faqs });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch FAQs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);
  if (!valid || !isModeratorOrAbove(session)) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin or Moderator access required.' }, { status: 401 });
  }

  try {
    const rawBody = await req.json();
    const parseResult = FaqMutationSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const faq = await saveFaq(data);

    await recordAuditLog({
      adminId: session.email,
      adminEmail: session.email,
      action: 'SAVE_FAQ',
      entityType: 'FAQ_ITEM',
      entityId: faq.id,
      details: {
        scope: faq.scope,
        categoryId: faq.categoryId,
        question_en: faq.question_en.slice(0, 80),
        isActive: faq.isActive,
      },
    });

    try {
      revalidatePath('/[lang]/super-admin/faqs', 'page');
      revalidatePath('/[lang]/faq', 'page');
      revalidatePath('/[lang]/[country]/[city]/[category]', 'page');
      revalidateTag('faqs', 'page');
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ item saved successfully',
      faq,
    });
  } catch (err: any) {
    console.error('Save FAQ error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to save FAQ' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);
  if (!valid || !isModeratorOrAbove(session)) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin or Moderator access required.' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 1. Reorder batch
    if (body.orderedIds) {
      const parseResult = ReorderSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json({ error: 'Invalid reorder payload' }, { status: 400 });
      }
      await reorderFaqs(parseResult.data.orderedIds);

      await recordAuditLog({
        adminId: session.email,
        adminEmail: session.email,
        action: 'REORDER_FAQS',
        entityType: 'FAQ_ITEM',
        entityId: 'MULTIPLE',
        details: { count: parseResult.data.orderedIds.length },
      });

      try {
        revalidatePath('/[lang]/super-admin/faqs', 'page');
        revalidatePath('/[lang]/faq', 'page');
      } catch {
        // ignore
      }

      return NextResponse.json({ success: true, message: 'FAQs reordered successfully' });
    }

    // 2. Quick toggle active status
    if (body.id && body.isActive !== undefined) {
      const faq = await saveFaq({ id: body.id, isActive: Boolean(body.isActive), question_en: '', answer_en: '' });

      await recordAuditLog({
        adminId: session.email,
        adminEmail: session.email,
        action: 'TOGGLE_FAQ_STATUS',
        entityType: 'FAQ_ITEM',
        entityId: body.id,
        details: { isActive: body.isActive },
      });

      try {
        revalidatePath('/[lang]/super-admin/faqs', 'page');
        revalidatePath('/[lang]/faq', 'page');
      } catch {
        // ignore
      }

      return NextResponse.json({ success: true, faq });
    }

    return NextResponse.json({ error: 'Invalid patch payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update FAQ' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);
  if (!valid || !isModeratorOrAbove(session)) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin or Moderator access required.' }, { status: 401 });
  }

  // Hard deletes strictly gated to SUPER_ADMIN
  if (!canDelete(session)) {
    return NextResponse.json(
      { error: 'Forbidden: Hard delete permissions are strictly restricted to SUPER_ADMIN role.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 });
  }

  try {
    await deleteFaq(id);

    await recordAuditLog({
      adminId: session.email,
      adminEmail: session.email,
      action: 'DELETE_FAQ',
      entityType: 'FAQ_ITEM',
      entityId: id,
    });

    try {
      revalidatePath('/[lang]/super-admin/faqs', 'page');
      revalidatePath('/[lang]/faq', 'page');
      revalidatePath('/[lang]/[country]/[city]/[category]', 'page');
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete FAQ' }, { status: 500 });
  }
}
