import { z } from 'zod';

export const ProviderCreateSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  trade_title: z.string().trim().min(2, 'Trade title must be at least 2 characters').max(120),
  whatsappNumber: z.string().trim().min(7, 'WhatsApp number is invalid').max(25),
  phoneNumber: z.string().trim().max(25).optional(),
  cityId: z.string().trim().min(1, 'City is required'),
  categoryId: z.string().trim().min(1, 'Category is required'),
  bio: z.string().trim().max(2500).optional(),
  target_areas: z.union([z.array(z.string()), z.string()]).optional(),
  visiting_charges: z.coerce.number().min(0).optional(),
  experience: z.union([z.string(), z.number()]).optional(),
  response_time: z.string().trim().max(50).optional(),
  profile_picture: z.string().trim().optional(),
  gallery_images: z.array(z.string()).optional(),
  certificates: z.union([z.array(z.string()), z.string()]).optional(),
  google_map_url: z.string().trim().optional(),
  status: z.enum(['pending', 'published', 'suspended']).default('published'),
  is_verified: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_premium: z.boolean().default(false),
  seo_index: z.boolean().default(true),
});

export const ProviderUpdateSchema = z.object({
  id: z.string().trim().min(1, 'Provider ID is required'),
  fullName: z.string().trim().min(2).max(100).optional(),
  trade_title: z.string().trim().min(2).max(120).optional(),
  whatsappNumber: z.string().trim().min(7).max(25).optional(),
  phoneNumber: z.string().trim().max(25).optional(),
  cityId: z.string().trim().min(1).optional(),
  categoryId: z.string().trim().min(1).optional(),
  bio: z.string().trim().max(2500).optional(),
  target_areas: z.union([z.array(z.string()), z.string()]).optional(),
  visiting_charges: z.coerce.number().min(0).optional(),
  experience: z.union([z.string(), z.number()]).optional(),
  response_time: z.string().trim().max(50).optional(),
  profile_picture: z.string().trim().optional(),
  gallery_images: z.array(z.string()).optional(),
  certificates: z.union([z.array(z.string()), z.string()]).optional(),
  google_map_url: z.string().trim().optional(),
  status: z.enum(['pending', 'published', 'suspended']).optional(),
  is_verified: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_premium: z.boolean().optional(),
  seo_index: z.boolean().optional(),
  is_available: z.boolean().optional(),
});

export const ProviderBulkActionSchema = z.object({
  action: z.enum(['publish', 'suspend', 'index', 'noindex', 'delete']),
  ids: z.array(z.string().trim().min(1)).min(1, 'At least one provider ID must be selected'),
});

// =========================================================================
// PHASE 2: TAXONOMY & FAQS SCHEMAS
// =========================================================================

export const CategoryMutationSchema = z.object({
  id: z.string().trim().min(2, 'Category ID is required').max(100),
  name_en: z.string().trim().min(2, 'English Name must be at least 2 characters').max(100),
  name_ur: z.string().trim().min(1, 'Urdu Name is required').max(100),
  slug_en: z.string().trim().min(2, 'English Slug is required').max(100),
  slug_ur: z.string().trim().min(2, 'Roman Urdu Slug is required').max(100),
  icon: z.string().trim().min(1, 'Icon key is required').max(50).default('Wrench'),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

export const CountryMutationSchema = z.object({
  code: z.string().trim().min(2, 'Country Code must be at least 2 chars').max(10),
  name_en: z.string().trim().min(2, 'Country Name is required').max(100),
  name_ur: z.string().trim().max(100).optional(),
  slug: z.string().trim().min(2).max(50),
  currency: z.string().trim().min(2, 'Currency code is required').max(10),
  premiumPrice: z.coerce.number().min(0, 'Premium Price must be positive'),
  isActive: z.boolean().default(true),
});

export const CityMutationSchema = z.object({
  countryCode: z.string().trim().min(2, 'Country code is required').max(10),
  name_en: z.string().trim().min(2, 'City name is required').max(100),
  name_ur: z.string().trim().max(100).optional(),
  slug: z.string().trim().min(2, 'City slug is required').max(100),
  targetAreas: z.array(z.string().trim()).default([]),
  isActive: z.boolean().default(true),
});

export const FaqMutationSchema = z.object({
  id: z.string().optional(),
  scope: z.enum(['GLOBAL', 'CATEGORY']).default('GLOBAL'),
  categoryId: z.string().trim().nullable().optional(),
  question_en: z.string().trim().min(5, 'English Question must be at least 5 characters').max(500),
  answer_en: z.string().trim().min(5, 'English Answer must be at least 5 characters').max(4000),
  question_ur: z.string().trim().max(500).nullable().optional(),
  answer_ur: z.string().trim().max(4000).nullable().optional(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

export const ReorderSchema = z.object({
  orderedIds: z.array(z.string().trim().min(1)).min(1),
});

export type ProviderCreateInput = z.infer<typeof ProviderCreateSchema>;
export type ProviderUpdateInput = z.infer<typeof ProviderUpdateSchema>;
export type ProviderBulkActionInput = z.infer<typeof ProviderBulkActionSchema>;
export type CategoryMutationInput = z.infer<typeof CategoryMutationSchema>;
export type CountryMutationInput = z.infer<typeof CountryMutationSchema>;
export type CityMutationInput = z.infer<typeof CityMutationSchema>;
export type FaqMutationInput = z.infer<typeof FaqMutationSchema>;

// =========================================================================
// PHASE 3: SEO, 301 REDIRECTS, ADS, SETTINGS & STAFF SCHEMAS
// =========================================================================

export const RedirectRuleSchema = z.object({
  id: z.string().optional(),
  sourcePath: z
    .string()
    .trim()
    .min(1, 'Source path is required')
    .refine((val) => val.startsWith('/') || val.startsWith('http'), {
      message: 'Source path must begin with / (e.g. /old-page)',
    }),
  destinationPath: z
    .string()
    .trim()
    .min(1, 'Destination path is required'),
  statusCode: z.coerce
    .number()
    .int()
    .refine((val) => [301, 302, 307, 308].includes(val), {
      message: 'Status code must be 301, 302, 307, or 308',
    })
    .default(301),
  isActive: z.boolean().default(true),
});

export const MasterIndexingSchema = z.object({
  global_allow_indexing: z.boolean(),
});

export const AdSettingsSchema = z.object({
  adsense_publisher_id: z.string().trim().default(''),
  placements: z.object({
    top_banner: z.boolean().default(true),
    in_feed: z.boolean().default(true),
    profile_sidebar: z.boolean().default(true),
    mobile_sticky: z.boolean().default(false),
  }),
});

export const PrivateSponsorSchema = z.object({
  id: z.string().optional(),
  slot: z.enum(['top_banner', 'in_feed', 'profile_sidebar', 'mobile_sticky']),
  title: z.string().trim().min(2, 'Sponsor title is required').max(100),
  imageUrl: z.string().trim().min(2, 'Banner image URL is required'),
  destinationUrl: z.string().trim().min(1, 'Destination URL is required'),
  isActive: z.boolean().default(true),
});

export const GeneralSettingsSchema = z.object({
  brandName: z.string().trim().min(1, 'Brand Name is required').max(60),
  logoUrl: z.string().trim().default(''),
  supportWhatsapp: z.string().trim().min(5, 'Support WhatsApp is required').max(30),
  footerLinks: z
    .array(
      z.object({
        label: z.string().trim().min(1, 'Label is required'),
        href: z.string().trim().min(1, 'URL is required'),
        isExternal: z.boolean().optional(),
      })
    )
    .default([]),
});

export const StaffMutationSchema = z.object({
  id: z.string().optional(),
  email: z.string().trim().email('A valid email address is required'),
  name: z.string().trim().min(2).max(100).optional(),
  role: z.enum(['SUPER_ADMIN', 'MODERATOR']),
  password: z.string().trim().min(6, 'Password must be at least 6 characters').optional(),
});

export const StaffRoleUpdateSchema = z.object({
  id: z.string().trim().min(1, 'Staff ID is required'),
  role: z.enum(['SUPER_ADMIN', 'MODERATOR', 'PROVIDER']),
});

export type RedirectRuleInput = z.infer<typeof RedirectRuleSchema>;
export type MasterIndexingInput = z.infer<typeof MasterIndexingSchema>;
export type AdSettingsInput = z.infer<typeof AdSettingsSchema>;
export type PrivateSponsorInput = z.infer<typeof PrivateSponsorSchema>;
export type GeneralSettingsInput = z.infer<typeof GeneralSettingsSchema>;
export type StaffMutationInput = z.infer<typeof StaffMutationSchema>;
export type StaffRoleUpdateInput = z.infer<typeof StaffRoleUpdateSchema>;

