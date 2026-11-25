import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// =========================================================================
// TYPES & INTERFACES
// =========================================================================

export interface RedirectRuleItem {
  id: string;
  sourcePath: string;
  destinationPath: string;
  statusCode: number; // 301, 302, 307, 308
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrivateSponsor {
  id: string;
  slot: 'top_banner' | 'in_feed' | 'profile_sidebar' | 'mobile_sticky';
  title: string;
  imageUrl: string;
  destinationUrl: string;
  isActive: boolean;
  impressions?: number;
  clicks?: number;
  createdAt?: string;
}

export interface AdSettings {
  adsense_publisher_id: string;
  placements: {
    top_banner: boolean;
    in_feed: boolean;
    profile_sidebar: boolean;
    mobile_sticky: boolean;
  };
  sponsors: PrivateSponsor[];
}

export interface FooterLinkItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface GeneralSettings {
  brandName: string;
  logoUrl: string;
  supportWhatsapp: string;
  footerLinks: FooterLinkItem[];
}

export interface StaffMember {
  id: string;
  email: string;
  name?: string;
  role: 'SUPER_ADMIN' | 'MODERATOR' | 'PROVIDER';
  createdAt: string;
  updatedAt?: string;
}

// =========================================================================
// IN-MEMORY RESILIENT STATE STORES
// =========================================================================

// Master indexing toggle: defaults to true (or NEXT_PUBLIC_ALLOW_INDEXING)
let localGlobalAllowIndexing: boolean =
  process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'false' ? false : true;

// Initial 301 Redirect Rules Seed
export const localRedirectRules: Map<string, RedirectRuleItem> = new Map([
  [
    '/join',
    {
      id: 'rule-seed-1',
      sourcePath: '/join',
      destinationPath: '/en/list-service',
      statusCode: 301,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    '/vendors',
    {
      id: 'rule-seed-2',
      sourcePath: '/vendors',
      destinationPath: '/en',
      statusCode: 301,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    '/old-services',
    {
      id: 'rule-seed-3',
      sourcePath: '/old-services',
      destinationPath: '/en/services',
      statusCode: 301,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    '/tariq-electric',
    {
      id: 'rule-seed-4',
      sourcePath: '/tariq-electric',
      destinationPath: '/en/pk/karachi/electrician/tariq-mahmood',
      statusCode: 301,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
]);

// Initial Ad & Monetization Settings Seed
export let localAdSettings: AdSettings = {
  adsense_publisher_id: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-1234567890123456',
  placements: {
    top_banner: true,
    in_feed: true,
    profile_sidebar: true,
    mobile_sticky: false,
  },
  sponsors: [
    {
      id: 'sponsor-1',
      slot: 'top_banner',
      title: 'Orient Energy Solutions - Solar Inverter Promo',
      imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&auto=format&fit=crop&q=80',
      destinationUrl: 'https://wa.me/923001234567?text=Hi%2C%20I%20saw%20your%20Baseera%20Solar%20Banner',
      isActive: false, // Inactive by default so AdSense takes precedence unless activated
      impressions: 1420,
      clicks: 85,
      createdAt: new Date().toISOString(),
    },
  ],
};

// Initial General Site Settings Seed
export let localGeneralSettings: GeneralSettings = {
  brandName: 'Baseera',
  logoUrl: '',
  supportWhatsapp: '+923001234567',
  footerLinks: [
    { label: 'About Us', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

// Initial Staff Accounts Seed
export const localStaffMembers: Map<string, StaffMember> = new Map([
  [
    'admin@baseera.com',
    {
      id: 'staff-root-super-admin',
      email: 'admin@baseera.com',
      name: 'System Super Admin',
      role: 'SUPER_ADMIN',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  [
    'moderator@baseera.com',
    {
      id: 'staff-default-moderator',
      email: 'moderator@baseera.com',
      name: 'Content Operations Moderator',
      role: 'MODERATOR',
      createdAt: '2026-01-15T00:00:00.000Z',
    },
  ],
]);

// =========================================================================
// 1. MASTER INDEXING SWITCH LOGIC
// =========================================================================

export function getGlobalAllowIndexingSync(): boolean {
  return localGlobalAllowIndexing;
}

export async function getGlobalAllowIndexing(): Promise<boolean> {
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'global_allow_indexing')
        .single();

      if (!error && data?.value !== undefined) {
        localGlobalAllowIndexing = Boolean(data.value);
        return localGlobalAllowIndexing;
      }
    } catch (err) {
      console.warn('Failed to load global_allow_indexing from Supabase:', err);
    }
  }
  return localGlobalAllowIndexing;
}

export async function setGlobalAllowIndexing(allowed: boolean): Promise<boolean> {
  localGlobalAllowIndexing = Boolean(allowed);

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('site_settings').upsert({
        key: 'global_allow_indexing',
        value: localGlobalAllowIndexing,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to save global_allow_indexing to Supabase:', err);
    }
  }
  return localGlobalAllowIndexing;
}

// =========================================================================
// 2. 301 REDIRECT ENGINE & MIDDLEWARE LOOKUP
// =========================================================================

/**
 * Fast O(1) in-memory lookup for middleware to intercept and execute 301/302 redirects.
 */
export function lookupRedirect(pathname: string): { destinationPath: string; statusCode: number } | null {
  if (!pathname) return null;

  const normalized = pathname.trim().toLowerCase();
  const withoutTrailingSlash = normalized.length > 1 && normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;

  // Direct exact match
  const directMatch = localRedirectRules.get(withoutTrailingSlash);
  if (directMatch && directMatch.isActive) {
    return { destinationPath: directMatch.destinationPath, statusCode: directMatch.statusCode };
  }

  // Check without /en, /ur, /ar locale prefix
  const matchLocale = withoutTrailingSlash.match(/^\/(en|ur|ar)(\/.*)?$/);
  if (matchLocale) {
    const unlocalizedPath = matchLocale[2] || '/';
    const strippedMatch = localRedirectRules.get(unlocalizedPath);
    if (strippedMatch && strippedMatch.isActive) {
      return { destinationPath: strippedMatch.destinationPath, statusCode: strippedMatch.statusCode };
    }
  }

  return null;
}

export async function getRedirectRules(options?: {
  search?: string;
  isActive?: boolean;
}): Promise<RedirectRuleItem[]> {
  let list = Array.from(localRedirectRules.values());

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await supabase
        .from('redirect_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        list = data.map((row) => ({
          id: row.id,
          sourcePath: row.source_path,
          destinationPath: row.destination_path,
          statusCode: row.status_code || 301,
          isActive: row.is_active !== false,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
        // Synchronize in-memory cache
        localRedirectRules.clear();
        for (const item of list) {
          localRedirectRules.set(item.sourcePath.toLowerCase(), item);
        }
      }
    } catch (err) {
      console.warn('getRedirectRules Supabase notice:', err);
    }
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (r) => r.sourcePath.toLowerCase().includes(q) || r.destinationPath.toLowerCase().includes(q)
    );
  }

  if (options?.isActive !== undefined) {
    list = list.filter((r) => r.isActive === options.isActive);
  }

  return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export async function saveRedirectRule(rule: Partial<RedirectRuleItem>): Promise<RedirectRuleItem> {
  const cleanSource = (rule.sourcePath || '').trim();
  const normalizedSource = cleanSource.startsWith('/') ? cleanSource : `/${cleanSource}`;

  const item: RedirectRuleItem = {
    id: rule.id || crypto.randomUUID(),
    sourcePath: normalizedSource,
    destinationPath: (rule.destinationPath || '').trim(),
    statusCode: rule.statusCode || 301,
    isActive: rule.isActive !== false,
    createdAt: rule.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Update in-memory
  localRedirectRules.set(item.sourcePath.toLowerCase(), item);

  // Sync to Supabase
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('redirect_rules').upsert({
        id: item.id,
        source_path: item.sourcePath,
        destination_path: item.destinationPath,
        status_code: item.statusCode,
        is_active: item.isActive,
        updated_at: item.updatedAt,
      });
    } catch (err) {
      console.warn('saveRedirectRule Supabase error:', err);
    }
  }

  return item;
}

export async function deleteRedirectRule(id: string): Promise<boolean> {
  // Find key to delete from in-memory
  for (const [key, rule] of localRedirectRules.entries()) {
    if (rule.id === id) {
      localRedirectRules.delete(key);
      break;
    }
  }

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('redirect_rules').delete().eq('id', id);
    } catch (err) {
      console.warn('deleteRedirectRule Supabase error:', err);
    }
  }

  return true;
}

// =========================================================================
// 3. ADS & PRIVATE SPONSORS CONFIGURATION
// =========================================================================

export async function getAdSettings(): Promise<AdSettings> {
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'ad_settings')
        .single();

      if (!error && data?.value) {
        localAdSettings = {
          adsense_publisher_id: data.value.adsense_publisher_id ?? localAdSettings.adsense_publisher_id,
          placements: {
            ...localAdSettings.placements,
            ...(data.value.placements || {}),
          },
          sponsors: Array.isArray(data.value.sponsors) ? data.value.sponsors : localAdSettings.sponsors,
        };
      }
    } catch (err) {
      console.warn('getAdSettings Supabase note:', err);
    }
  }
  return localAdSettings;
}

export async function updateAdSettings(partial: Partial<AdSettings>): Promise<AdSettings> {
  localAdSettings = {
    adsense_publisher_id: partial.adsense_publisher_id ?? localAdSettings.adsense_publisher_id,
    placements: {
      ...localAdSettings.placements,
      ...(partial.placements || {}),
    },
    sponsors: partial.sponsors ?? localAdSettings.sponsors,
  };

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('site_settings').upsert({
        key: 'ad_settings',
        value: localAdSettings,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('updateAdSettings Supabase error:', err);
    }
  }

  return localAdSettings;
}

export async function savePrivateSponsor(sponsor: Partial<PrivateSponsor>): Promise<PrivateSponsor> {
  const currentSettings = await getAdSettings();
  const existingIdx = currentSettings.sponsors.findIndex((s) => s.id === sponsor.id);

  const updatedSponsor: PrivateSponsor = {
    id: sponsor.id || crypto.randomUUID(),
    slot: sponsor.slot || 'top_banner',
    title: (sponsor.title || 'Sponsored Banner').trim(),
    imageUrl: (sponsor.imageUrl || '').trim(),
    destinationUrl: (sponsor.destinationUrl || '').trim(),
    isActive: sponsor.isActive !== false,
    impressions: sponsor.impressions || 0,
    clicks: sponsor.clicks || 0,
    createdAt: sponsor.createdAt || new Date().toISOString(),
  };

  const newSponsors = [...currentSettings.sponsors];
  if (existingIdx >= 0) {
    newSponsors[existingIdx] = { ...newSponsors[existingIdx], ...updatedSponsor };
  } else {
    newSponsors.unshift(updatedSponsor);
  }

  await updateAdSettings({ sponsors: newSponsors });
  return updatedSponsor;
}

export async function deletePrivateSponsor(id: string): Promise<boolean> {
  const currentSettings = await getAdSettings();
  const filtered = currentSettings.sponsors.filter((s) => s.id !== id);
  await updateAdSettings({ sponsors: filtered });
  return true;
}

export async function getActiveSponsorForSlot(slot: string): Promise<PrivateSponsor | null> {
  const settings = await getAdSettings();
  const normalizedSlot = slot.replace(/-/g, '_');
  const activeSponsor = settings.sponsors.find((s) => s.slot === normalizedSlot && s.isActive);
  return activeSponsor || null;
}

// =========================================================================
// 4. GENERAL SITE SETTINGS
// =========================================================================

export async function getGeneralSettings(): Promise<GeneralSettings> {
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'general_settings')
        .single();

      if (!error && data?.value) {
        localGeneralSettings = {
          brandName: data.value.brandName || localGeneralSettings.brandName,
          logoUrl: data.value.logoUrl ?? localGeneralSettings.logoUrl,
          supportWhatsapp: data.value.supportWhatsapp || localGeneralSettings.supportWhatsapp,
          footerLinks: Array.isArray(data.value.footerLinks)
            ? data.value.footerLinks
            : localGeneralSettings.footerLinks,
        };
      }
    } catch (err) {
      console.warn('getGeneralSettings Supabase note:', err);
    }
  }
  return localGeneralSettings;
}

export async function updateGeneralSettings(partial: Partial<GeneralSettings>): Promise<GeneralSettings> {
  localGeneralSettings = {
    brandName: partial.brandName ?? localGeneralSettings.brandName,
    logoUrl: partial.logoUrl ?? localGeneralSettings.logoUrl,
    supportWhatsapp: partial.supportWhatsapp ?? localGeneralSettings.supportWhatsapp,
    footerLinks: partial.footerLinks ?? localGeneralSettings.footerLinks,
  };

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('site_settings').upsert({
        key: 'general_settings',
        value: localGeneralSettings,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('updateGeneralSettings Supabase error:', err);
    }
  }

  return localGeneralSettings;
}

// =========================================================================
// 5. STAFF & MODERATOR ACCOUNTS MANAGEMENT
// =========================================================================

export async function getStaffMembers(search?: string): Promise<StaffMember[]> {
  let list = Array.from(localStaffMembers.values());

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role, created_at, updated_at')
        .in('role', ['SUPER_ADMIN', 'MODERATOR', 'admin', 'moderator'])
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        list = data.map((row) => ({
          id: row.id,
          email: row.email,
          name: row.name,
          role: (row.role?.toUpperCase() === 'SUPER_ADMIN' || row.role?.toUpperCase() === 'ADMIN'
            ? 'SUPER_ADMIN'
            : 'MODERATOR') as 'SUPER_ADMIN' | 'MODERATOR',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
        // Sync in-memory map
        for (const item of list) {
          localStaffMembers.set(item.email.toLowerCase(), item);
        }
      }
    } catch (err) {
      console.warn('getStaffMembers Supabase notice:', err);
    }
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (m) => m.email.toLowerCase().includes(q) || (m.name && m.name.toLowerCase().includes(q))
    );
  }

  return list;
}

export async function saveStaffMember(data: {
  email: string;
  name?: string;
  role: 'SUPER_ADMIN' | 'MODERATOR';
  password?: string;
}): Promise<StaffMember> {
  const cleanEmail = data.email.trim().toLowerCase();
  const existing = localStaffMembers.get(cleanEmail);

  const member: StaffMember = {
    id: existing?.id || crypto.randomUUID(),
    email: cleanEmail,
    name: data.name?.trim() || cleanEmail.split('@')[0],
    role: data.role,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  localStaffMembers.set(cleanEmail, member);

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('users').upsert({
        id: member.id,
        email: member.email,
        name: member.name,
        role: member.role,
        updated_at: member.updatedAt,
      });
    } catch (err) {
      console.warn('saveStaffMember Supabase error:', err);
    }
  }

  return member;
}

export async function updateStaffRole(
  id: string,
  role: 'SUPER_ADMIN' | 'MODERATOR' | 'PROVIDER'
): Promise<StaffMember | null> {
  let targetEmail: string | null = null;
  for (const [email, staff] of localStaffMembers.entries()) {
    if (staff.id === id) {
      targetEmail = email;
      staff.role = role;
      staff.updatedAt = new Date().toISOString();
      break;
    }
  }

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (err) {
      console.warn('updateStaffRole Supabase error:', err);
    }
  }

  return targetEmail ? localStaffMembers.get(targetEmail) || null : null;
}

export async function revokeStaffAccess(id: string): Promise<boolean> {
  for (const [email, staff] of localStaffMembers.entries()) {
    if (staff.id === id) {
      localStaffMembers.delete(email);
      break;
    }
  }

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('users').delete().eq('id', id);
    } catch (err) {
      console.warn('revokeStaffAccess Supabase error:', err);
    }
  }

  return true;
}
