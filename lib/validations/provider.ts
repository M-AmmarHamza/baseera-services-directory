import { z } from 'zod';

export const MAX_SERVICE_AREAS = 3;
export const MAX_BIO_LENGTH = 150;

export const providerRegistrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters.' }),
  whatsapp_number: z.string().optional(),
  phone_number: z.string().optional(),
  telegram_handle: z.string().optional(),
  preferred_contact: z.enum(['whatsapp', 'phone', 'telegram', 'both']).default('whatsapp'),
  country_code: z
    .string()
    .trim()
    .min(2, { message: 'Valid country code is required.' }),
  city_name: z
    .string()
    .trim()
    .min(1, { message: 'City is required.' }),
  category_id: z
    .string()
    .trim()
    .min(1, { message: 'Service category is required.' }),
  trade_title: z.string().trim().max(120, { message: 'Trade title must be 120 characters or fewer.' }).optional(),
  short_bio: z
    .string()
    .trim()
    .max(MAX_BIO_LENGTH, { message: `Short bio must not exceed ${MAX_BIO_LENGTH} characters.` })
    .optional(),
  service_area: z
    .union([
      z.array(z.string().trim().min(1)),
      z.string().transform((val) =>
        val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      ),
    ])
    .pipe(
      z.array(z.string().trim()).max(MAX_SERVICE_AREAS, { message: `Maximum ${MAX_SERVICE_AREAS} service areas allowed.` })
    )
    .optional()
    .default([]),
  starting_price: z.coerce.number().min(0).optional(),
  profile_type: z.enum(['individual', 'shop']).default('individual'),
  avatar_url: z.string().optional(),
  cover_url: z.string().optional(),
  lang: z.string().default('en'),
});

export type ProviderRegistrationInput = z.infer<typeof providerRegistrationSchema>;
