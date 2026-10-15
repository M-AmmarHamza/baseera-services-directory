import {
  parsePhoneNumberFromString,
  AsYouType,
  CountryCode,
  getCountryCallingCode,
} from 'libphonenumber-js';

export interface PhoneValidationResult {
  isValid: boolean;
  e164: string;
  formattedInternational: string;
  formattedNational: string;
  countryCallingCode: string;
  error?: string;
}

/**
 * Safely retrieves calling code for a given 2-letter ISO country code.
 * E.g., 'pk' -> '92', 'ae' -> '971'
 */
export function getCountryCallingCodeSafe(countryCode?: string): string {
  if (!countryCode) return '';
  try {
    const code = countryCode.trim().toUpperCase() as CountryCode;
    return getCountryCallingCode(code);
  } catch {
    return '';
  }
}

/**
 * Validates and formats a phone number into strict E.164 format using libphonenumber-js.
 * @param phone Raw phone string entered by user
 * @param defaultCountryCode Optional 2-letter ISO country code (e.g. 'PK', 'AE', 'US')
 */
export function validateAndFormatE164(
  phone: string,
  defaultCountryCode?: string
): PhoneValidationResult {
  const trimmed = (phone || '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      e164: '',
      formattedInternational: '',
      formattedNational: '',
      countryCallingCode: '',
      error: 'Phone number cannot be empty.',
    };
  }

  const country = (defaultCountryCode || '').trim().toUpperCase() as CountryCode;

  // 1. First attempt parsing directly with given default country
  let parsed = country ? parsePhoneNumberFromString(trimmed, country) : parsePhoneNumberFromString(trimmed);

  // 2. If invalid and doesn't start with +, try prepending + in case user typed country calling code directly
  if ((!parsed || !parsed.isValid()) && !trimmed.startsWith('+')) {
    const withPlus = `+${trimmed.replace(/^00/, '')}`;
    const parsedWithPlus = parsePhoneNumberFromString(withPlus);
    if (parsedWithPlus && parsedWithPlus.isValid()) {
      parsed = parsedWithPlus;
    }
  }

  // 3. If still invalid and country code is known, try stripping any redundant leading zeros
  if ((!parsed || !parsed.isValid()) && country) {
    const callingCode = getCountryCallingCodeSafe(country);
    const digitsOnly = trimmed.replace(/[^0-9]/g, '');
    if (callingCode && digitsOnly.startsWith(callingCode)) {
      const parsedWithCountryCode = parsePhoneNumberFromString(`+${digitsOnly}`);
      if (parsedWithCountryCode && parsedWithCountryCode.isValid()) {
        parsed = parsedWithCountryCode;
      }
    }
  }

  if (parsed && parsed.isValid()) {
    const e164 = parsed.format('E.164');
    return {
      isValid: true,
      e164,
      formattedInternational: parsed.formatInternational(),
      formattedNational: parsed.formatNational(),
      countryCallingCode: parsed.countryCallingCode || '',
    };
  }

  return {
    isValid: false,
    e164: '',
    formattedInternational: '',
    formattedNational: '',
    countryCallingCode: getCountryCallingCodeSafe(country),
    error: 'Please enter a valid phone number for the selected country.',
  };
}

/**
 * Live formats user input as they type according to the selected country's conventions.
 */
export function formatAsYouType(input: string, countryCode?: string): string {
  if (!input) return '';
  const country = (countryCode || '').trim().toUpperCase() as CountryCode;
  try {
    const formatter = country ? new AsYouType(country) : new AsYouType();
    return formatter.input(input);
  } catch {
    return input;
  }
}

/**
 * Extracts clean digits for wa.me/ link.
 * WhatsApp requires absolute digits without '+', spaces, dashes, or brackets.
 * E.g., '+92 300 123-4567' -> '923001234567'
 */
export function getCleanWhatsAppDigits(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Dynamically generates a clean, valid https://wa.me/ URL.
 * Strips all non-digit characters (+, -, spaces, parentheses, etc.).
 * Appends URL-encoded message query parameter if provided.
 */
export function getCleanWhatsAppUrl(phone: string, message?: string): string {
  const digits = getCleanWhatsAppDigits(phone);
  if (!digits) return '';
  const baseUrl = `https://wa.me/${digits}`;
  if (message && message.trim().length > 0) {
    return `${baseUrl}?text=${encodeURIComponent(message.trim())}`;
  }
  return baseUrl;
}

/**
 * Clean direct dial URL for tel: links.
 */
export function getCleanTelUrl(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.trim().replace(/[\s\-\(\)]/g, '');
  return `tel:${cleaned}`;
}
