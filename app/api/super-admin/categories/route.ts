import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { verifyAdminToken, ADMIN_COOKIE_NAME, isModeratorOrAbove, canDelete } from '@/lib/admin-auth';
import { recordAuditLog } from '@/lib/audit';
import {
  getCategories,
  saveCategory,
  deleteCategory,
  reorderCategories,
} from '@/lib/taxonomy-db';
import { CategoryMutationSchema, ReorderSchema } from '@/lib/super-admin-schemas';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);
  if (!valid || !isModeratorOrAbove(session)) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin or Moderator access required.' }, { status: 401 });
  }

  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch categories' }, { status: 500 });
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
    const parseResult = CategoryMutationSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const category = await saveCategory(data);

    await recordAuditLog({
      adminId: session.email,
      adminEmail: session.email,
      action: 'SAVE_CATEGORY',
      entityType: 'CATEGORY',
      entityId: category.id,
      details: {
        name_en: category.name_en,
        slug_en: category.slug_en,
        slug_ur: category.slug_ur,
        isActive: category.isActive,
      },
    });

    try {
      revalidatePath('/[lang]/super-admin/categories', 'page');
      revalidatePath('/[lang]', 'page');
      revalidateTag('categories', 'page');
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: 'Category saved successfully',
      category,
    });
  } catch (err: any) {
    console.error('Save category error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to save category' }, { status: 500 });
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
      await reorderCategories(parseResult.data.orderedIds);

      await recordAuditLog({
        adminId: session.email,
        adminEmail: session.email,
        action: 'REORDER_CATEGORIES',
        entityType: 'CATEGORY',
        entityId: 'MULTIPLE',
        details: { count: parseResult.data.orderedIds.length },
      });

      return NextResponse.json({ success: true, message: 'Categories reordered successfully' });
    }

    // 2. Quick toggle active status
    if (body.id && body.isActive !== undefined) {
      const category = await saveCategory({ id: body.id, isActive: Boolean(body.isActive) });

      await recordAuditLog({
        adminId: session.email,
        adminEmail: session.email,
        action: 'TOGGLE_CATEGORY_STATUS',
        entityType: 'CATEGORY',
        entityId: body.id,
        details: { isActive: body.isActive },
      });

      return NextResponse.json({ success: true, category });
    }

    return NextResponse.json({ error: 'Invalid patch payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);
  if (!valid || !isModeratorOrAbove(session)) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin or Moderator access required.' }, { status: 401 });
  }

  // Strictly gate hard delete to SUPER_ADMIN
  if (!canDelete(session)) {
    return NextResponse.json(
      { error: 'Forbidden: Hard delete permissions are strictly restricted to SUPER_ADMIN role.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
  }

  try {
    await deleteCategory(id);

    await recordAuditLog({
      adminId: session.email,
      adminEmail: session.email,
      action: 'DELETE_CATEGORY',
      entityType: 'CATEGORY',
      entityId: id,
    });

    try {
      revalidatePath('/[lang]/super-admin/categories', 'page');
      revalidatePath('/[lang]', 'page');
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete category' }, { status: 500 });
  }
}
