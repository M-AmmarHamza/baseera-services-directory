import { z } from 'zod';

export const MAX_SERVICE_AREAS = 3;
export const MAX_BIO_LENGTH = 150;

/**
 * Regex for Arabic and Urdu letters:
 * Includes standard Arabic alphabet (\u0621-\u064A) and Urdu/Persian extensions
 * (\u0671-\u06D3, \u06D5, \u06EE-\u06EF, \u06FA-\u06FC, \u06FF, \u0750-\u077F, \u08A0-\u08FF, \uFB50-\uFDFF, \uFE70-\uFEFC).
 * Specifically avoids digits (0-9, \u0660-\u0669, \u06F0-\u06F9) and punctuation so numbers are not miscounted as letters.
 */
export const ARABIC_LETTERS_REGEX =
  /[\u0621-\u064A\u0671-\u06D3\u06D5\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFC]/g;

/**
 * Regex for Latin alphabet characters:
 * Includes standard ASCII letters [a-zA-Z] and accented Latin extensions [\u00C0-\u024F].
 */
export const LATIN_LETTERS_REGEX = /[a-zA-Z\u00C0-\u024F]/g;

/**
 * Validates that an input's primary script matches the current locale.
 * - For 'ar' (Arabic) and 'ur' (Urdu): The text must primarily consist of Arabic/Urdu script (>= 50% of all letters).
 *   Numbers (0-9, ٠-٩) and common English technical terms/abbreviations (e.g. "AC", "UPS", "CCTV") are allowed.
 * - For 'en' (English): The text must primarily consist of Latin script (>= 50% of all letters).
 *
 * @param text The input string to test
 * @param lang Current locale ('en', 'ar', 'ur')
 * @param requireLetters When true, fails if the string has 0 letters (e.g. only numbers or punctuation)
 */
export function validateScript(
  text: string | undefined | null,
  lang: string = 'en',
  requireLetters = false
): boolean {
  if (!text || !text.trim()) return !requireLetters;
  const clean = text.trim();

  const arabicMatches = clean.match(ARABIC_LETTERS_REGEX) || [];
  const latinMatches = clean.match(LATIN_LETTERS_REGEX) || [];
  const arabicCount = arabicMatches.length;
  const latinCount = latinMatches.length;
  const totalLetters = arabicCount + latinCount;

  if (totalLetters === 0) {
    return !requireLetters;
  }

  if (lang === 'ar' || lang === 'ur') {
    return arabicCount > 0 && arabicCount / totalLetters >= 0.5;
  }

  if (lang === 'en') {
    return latinCount > 0 && latinCount / totalLetters >= 0.5;
  }

  return true;
}

/**
 * Localized error messages for language script validation failures.
 */
export function getScriptErrorMessage(
  lang: string = 'en',
  field?: 'name' | 'trade_title' | 'short_bio'
): string {
  if (lang === 'ar') {
    if (field === 'name') return 'يرجى إدخال الاسم باللغة العربية';
    if (field === 'trade_title') return 'يرجى إدخال المسمى المهني باللغة العربية';
    if (field === 'short_bio') return 'يرجى إدخال النبذة باللغة العربية';
    return 'يرجى إدخال النص باللغة العربية';
  }
  if (lang === 'ur') {
    if (field === 'name') return 'براہ کرم نام اردو میں درج کریں';
    if (field === 'trade_title') return 'براہ کرم ٹریڈ ٹائٹل اردو میں درج کریں';
    if (field === 'short_bio') return 'براہ کرم مختصر تعارف اردو میں درج کریں';
    return 'براہ کرم اردو میں ٹائپ کریں';
  }
  if (field === 'name') return 'Please enter your name in English.';
  if (field === 'trade_title') return 'Please enter trade title in English.';
  if (field === 'short_bio') return 'Please enter your bio in English.';
  return 'Please enter text in English.';
}

export function createProviderRegistrationSchema(lang: string = 'en') {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, {
        message:
          lang === 'ur'
            ? 'نام کم از کم 2 حروف پر مشتمل ہونا چاہیے۔'
            : lang === 'ar'
            ? 'يجب أن يتكون الاسم من حرفين على الأقل.'
            : 'Name must be at least 2 characters.',
      })
      .refine((val) => validateScript(val, lang, true), {
        message: getScriptErrorMessage(lang, 'name'),
      }),
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
    trade_title: z
      .string()
      .trim()
      .max(120, { message: 'Trade title must be 120 characters or fewer.' })
      .refine((val) => validateScript(val, lang, false), {
        message: getScriptErrorMessage(lang, 'trade_title'),
      })
      .optional(),
    short_bio: z
      .string()
      .trim()
      .max(MAX_BIO_LENGTH, { message: `Short bio must not exceed ${MAX_BIO_LENGTH} characters.` })
      .refine((val) => validateScript(val, lang, false), {
        message: getScriptErrorMessage(lang, 'short_bio'),
      })
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
}

export const providerRegistrationSchema = createProviderRegistrationSchema('en');

export type ProviderRegistrationInput = z.infer<typeof providerRegistrationSchema>;
