import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';
import { CATEGORIES, CategoryDef } from '@/lib/db';
import { generateEnglishSlug } from '@/lib/transliterate';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let localCategories: CategoryDef[] = [...CATEGORIES];

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid } = await verifyAdminToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let dbCategories: any[] = [];
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && Array.isArray(data) && data.length > 0) {
        dbCategories = data;
      }
    } catch (err) {
      console.warn('DB categories fetch notice:', err);
    }
  }

  const finalCategories = dbCategories.length > 0 ? dbCategories : localCategories;

  return NextResponse.json({
    categories: finalCategories,
    total: finalCategories.length,
  });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid } = await verifyAdminToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, slug, icon = 'Wrench', count = '10' } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const cleanSlug = (slug || generateEnglishSlug(name)).toLowerCase().trim();
    const cleanId = cleanSlug;

    const newCategory: CategoryDef = {
      id: cleanId,
      slug: cleanSlug,
      aliases: [],
      name: name.trim(),
      group: 'General Services',
      icon: icon.trim() || 'Wrench',
      count: Number(count) || 15,
    };

    localCategories.unshift(newCategory);

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        await supabase.from('categories').insert({
          id: newCategory.id,
          name: newCategory.name,
          slug: newCategory.slug,
          icon: newCategory.icon,
        });
      } catch (err) {
        console.warn('DB category insert notice:', err);
      }
    }

    return NextResponse.json({ success: true, category: newCategory });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid } = await verifyAdminToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, name, slug, icon, count } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    localCategories = localCategories.map((c) => {
      if (c.id === id || c.slug === id) {
        return {
          ...c,
          name: name ?? c.name,
          slug: slug ?? c.slug,
          icon: icon ?? c.icon,
          count: count ?? c.count,
        };
      }
      return c;
    });

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        await supabase
          .from('categories')
          .update({
            ...(name ? { name } : {}),
            ...(slug ? { slug } : {}),
            ...(icon ? { icon } : {}),
          })
          .eq('id', id);
      } catch (err) {
        console.warn('DB category update notice:', err);
      }
    }

    return NextResponse.json({ success: true, message: 'Category updated' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid } = await verifyAdminToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
  }

  localCategories = localCategories.filter((c) => c.id !== id && c.slug !== id);

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('categories').delete().or(`id.eq.${id},slug.eq.${id}`);
    } catch (err) {
      console.warn('DB category delete notice:', err);
    }
  }

  return NextResponse.json({ success: true, message: 'Category deleted' });
}
