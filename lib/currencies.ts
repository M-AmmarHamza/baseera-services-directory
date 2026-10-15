// Centralized Currency & Visiting Charges Localization System
// Accurately maps each country to its official currency code, symbol, and standard visiting fee.

export interface CountryCurrency {
  countryCode: string;
  currencyCode: string;
  symbol: string;
  name: string;
  defaultFee: number;
}

export const COUNTRY_CURRENCIES: Record<string, CountryCurrency> = {
  // South Asia
  pk: { countryCode: 'pk', currencyCode: 'PKR', symbol: 'Rs.', name: 'Pakistani Rupee', defaultFee: 500 },
  in: { countryCode: 'in', currencyCode: 'INR', symbol: '₹', name: 'Indian Rupee', defaultFee: 400 },
  bd: { countryCode: 'bd', currencyCode: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', defaultFee: 500 },

  // Middle East (GCC & MENA)
  ae: { countryCode: 'ae', currencyCode: 'AED', symbol: 'AED', name: 'UAE Dirham', defaultFee: 100 },
  sa: { countryCode: 'sa', currencyCode: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', defaultFee: 100 },
  qa: { countryCode: 'qa', currencyCode: 'QAR', symbol: 'QAR', name: 'Qatari Riyal', defaultFee: 100 },
  kw: { countryCode: 'kw', currencyCode: 'KWD', symbol: 'KWD', name: 'Kuwaiti Dinar', defaultFee: 10 },
  bh: { countryCode: 'bh', currencyCode: 'BHD', symbol: 'BHD', name: 'Bahraini Dinar', defaultFee: 10 },
  om: { countryCode: 'om', currencyCode: 'OMR', symbol: 'OMR', name: 'Omani Rial', defaultFee: 10 },
  tr: { countryCode: 'tr', currencyCode: 'TRY', symbol: '₺', name: 'Turkish Lira', defaultFee: 300 },
  eg: { countryCode: 'eg', currencyCode: 'EGP', symbol: 'E£', name: 'Egyptian Pound', defaultFee: 250 },

  // Americas
  us: { countryCode: 'us', currencyCode: 'USD', symbol: '$', name: 'US Dollar', defaultFee: 50 },
  ca: { countryCode: 'ca', currencyCode: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', defaultFee: 60 },
  mx: { countryCode: 'mx', currencyCode: 'MXN', symbol: 'MX$', name: 'Mexican Peso', defaultFee: 300 },
  br: { countryCode: 'br', currencyCode: 'BRL', symbol: 'R$', name: 'Brazilian Real', defaultFee: 100 },

  // Europe
  gb: { countryCode: 'gb', currencyCode: 'GBP', symbol: '£', name: 'British Pound', defaultFee: 40 },
  de: { countryCode: 'de', currencyCode: 'EUR', symbol: '€', name: 'Euro', defaultFee: 45 },
  fr: { countryCode: 'fr', currencyCode: 'EUR', symbol: '€', name: 'Euro', defaultFee: 45 },
  it: { countryCode: 'it', currencyCode: 'EUR', symbol: '€', name: 'Euro', defaultFee: 45 },
  es: { countryCode: 'es', currencyCode: 'EUR', symbol: '€', name: 'Euro', defaultFee: 45 },
  nl: { countryCode: 'nl', currencyCode: 'EUR', symbol: '€', name: 'Euro', defaultFee: 50 },
  ie: { countryCode: 'ie', currencyCode: 'EUR', symbol: '€', name: 'Euro', defaultFee: 50 },
  ch: { countryCode: 'ch', currencyCode: 'CHF', symbol: 'CHF', name: 'Swiss Franc', defaultFee: 80 },

  // Asia Pacific & Oceania
  au: { countryCode: 'au', currencyCode: 'AUD', symbol: 'A$', name: 'Australian Dollar', defaultFee: 70 },
  nz: { countryCode: 'nz', currencyCode: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', defaultFee: 75 },
  my: { countryCode: 'my', currencyCode: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', defaultFee: 60 },
  sg: { countryCode: 'sg', currencyCode: 'SGD', symbol: 'S$', name: 'Singapore Dollar', defaultFee: 50 },
  id: { countryCode: 'id', currencyCode: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', defaultFee: 100000 },
  jp: { countryCode: 'jp', currencyCode: 'JPY', symbol: '¥', name: 'Japanese Yen', defaultFee: 5000 },

  // Africa
  za: { countryCode: 'za', currencyCode: 'ZAR', symbol: 'R', name: 'South African Rand', defaultFee: 350 },
  ng: { countryCode: 'ng', currencyCode: 'NGN', symbol: '₦', name: 'Nigerian Naira', defaultFee: 5000 },
  ke: { countryCode: 'ke', currencyCode: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', defaultFee: 1500 },
};

export const DEFAULT_CURRENCY: CountryCurrency = {
  countryCode: 'pk',
  currencyCode: 'PKR',
  symbol: 'Rs.',
  name: 'Pakistani Rupee',
  defaultFee: 500,
};

/**
 * Returns the currency configuration for a specific country code.
 */
export function getCountryCurrency(countryCode?: string): CountryCurrency {
  if (!countryCode) return DEFAULT_CURRENCY;
  const key = countryCode.toLowerCase().trim();
  return COUNTRY_CURRENCIES[key] || DEFAULT_CURRENCY;
}

/**
 * Formats a numeric price according to the country's official currency symbol.
 * e.g. (50, 'us') -> "$50"
 * e.g. (100, 'ae') -> "AED 100"
 * e.g. (800, 'pk') -> "Rs. 800"
 * e.g. (40, 'gb') -> "£40"
 * e.g. (45, 'de') -> "€45"
 */
export function formatVisitingPrice(price: number | string | undefined | null, countryCode?: string): string {
  const currency = getCountryCurrency(countryCode);
  const num = typeof price === 'number' ? price : Number(String(price || '').replace(/[^0-9.]/g, ''));
  const validNum = !isNaN(num) && num > 0 ? num : currency.defaultFee;

  // Symbols that conventionally appear right before the number without space: $, £, €, ¥, ₹, ₺
  const compactSymbols = ['$', '£', '€', '¥', '₹', '₺'];
  if (compactSymbols.includes(currency.symbol)) {
    return `${currency.symbol}${validNum}`;
  }

  // Other currencies with a clean space: Rs. 800, AED 100, SAR 100, CA$ 60, A$ 70
  return `${currency.symbol} ${validNum}`;
}

/**
 * Cleans user string input (e.g. "Rs. 800" or "$50" or "AED 100") into a clean number.
 */
export function cleanNumericPrice(input: string | number | undefined | null, defaultFee: number = 500): number {
  if (typeof input === 'number') {
    return isNaN(input) || input <= 0 ? defaultFee : input;
  }
  if (!input) return defaultFee;
  const cleaned = String(input).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) || parsed <= 0 ? defaultFee : parsed;
}
