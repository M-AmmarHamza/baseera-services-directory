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
