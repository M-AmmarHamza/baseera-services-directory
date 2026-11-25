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

export type ProviderCreateInput = z.infer<typeof ProviderCreateSchema>;
export type ProviderUpdateInput = z.infer<typeof ProviderUpdateSchema>;
export type ProviderBulkActionInput = z.infer<typeof ProviderBulkActionSchema>;
