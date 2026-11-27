import {
  isValidLocale,
  resolveCountry,
  resolveCity,
  resolveCategory,
  resolveProvider,
  getResolvedCountryName,
  getResolvedCityName,
  getResolvedCategoryName,
  VALID_LOCALES,
  ValidLocale,
} from './resolve-entities';

export {
  isValidLocale,
  VALID_LOCALES,
  type ValidLocale,
  resolveCountry,
  resolveCity,
  resolveCategory,
  resolveProvider,
  getResolvedCountryName,
  getResolvedCityName,
  getResolvedCategoryName,
  // Backward-compatible alias exports:
  resolveCountry as getValidCountry,
  resolveCity as getValidCity,
  resolveCategory as getValidCategory,
  resolveProvider as getValidProvider,
};
