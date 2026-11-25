import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminToken, ADMIN_COOKIE_NAME, isModeratorOrAbove, canDelete } from '@/lib/admin-auth';
import { recordAuditLog } from '@/lib/audit';
import {
  getCountries,
  saveCountry,
  getCities,
  saveCity,
  deleteCity,
} from '@/lib/taxonomy-db';
import { CountryMutationSchema, CityMutationSchema } from '@/lib/super-admin-schemas';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);
  if (!valid || !isModeratorOrAbove(session)) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin or Moderator access required.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const countryCode = searchParams.get('countryCode') || undefined;

  try {
    const countries = await getCountries();
    const cities = await getCities({ countryCode });
    return NextResponse.json({ success: true, countries, cities });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch locations' }, { status: 500 });
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
    const entity = rawBody.entity || (rawBody.countryCode && rawBody.targetAreas ? 'city' : 'country');

    if (entity === 'country') {
      const parseResult = CountryMutationSchema.safeParse(rawBody);
      if (!parseResult.success) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: parseResult.error.format() },
          { status: 400 }
        );
      }

      const country = await saveCountry(parseResult.data);

      await recordAuditLog({
        adminId: session.email,
        adminEmail: session.email,
        action: 'SAVE_COUNTRY',
        entityType: 'LOCATION_COUNTRY',
        entityId: country.code,
        details: {
          name_en: country.name_en,
          currency: country.currency,
          premiumPrice: country.premiumPrice,
          isActive: country.isActive,
        },
      });

      try {
        revalidatePath('/[lang]/super-admin/locations', 'page');
        revalidatePath('/[lang]', 'page');
      } catch {
        // ignore
      }

      return NextResponse.json({ success: true, message: 'Country saved successfully', country });
    }

    if (entity === 'city') {
      const parseResult = CityMutationSchema.safeParse(rawBody);
      if (!parseResult.success) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: parseResult.error.format() },
          { status: 400 }
        );
      }

      const city = await saveCity(parseResult.data);

      await recordAuditLog({
        adminId: session.email,
        adminEmail: session.email,
        action: 'SAVE_CITY',
        entityType: 'LOCATION_CITY',
        entityId: city.slug,
        details: {
          name_en: city.name_en,
          countryCode: city.countryCode,
          targetAreasCount: city.targetAreas.length,
          isActive: city.isActive,
        },
      });

      try {
        revalidatePath('/[lang]/super-admin/locations', 'page');
        revalidatePath('/[lang]', 'page');
      } catch {
        // ignore
      }

      return NextResponse.json({ success: true, message: 'City saved successfully', city });
    }

    return NextResponse.json({ error: 'Invalid entity specified (expected country or city)' }, { status: 400 });
  } catch (err: any) {
    console.error('Save location error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to save location' }, { status: 500 });
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
  const entity = searchParams.get('entity');
  const idOrSlug = searchParams.get('id') || searchParams.get('slug');

  if (!idOrSlug) {
    return NextResponse.json({ error: 'Identifier (id or slug) is required' }, { status: 400 });
  }

  try {
    if (entity === 'city') {
      await deleteCity(idOrSlug);
      await recordAuditLog({
        adminId: session.email,
        adminEmail: session.email,
        action: 'DELETE_CITY',
        entityType: 'LOCATION_CITY',
        entityId: idOrSlug,
      });
      revalidatePath('/[lang]/super-admin/locations', 'page');
      return NextResponse.json({ success: true, message: 'City deleted successfully' });
    }

    return NextResponse.json({ error: 'Invalid entity specified for deletion' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete location' }, { status: 500 });
  }
}
