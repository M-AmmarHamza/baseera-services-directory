// Baseera Internationalization - Server Dictionary Loader
export type Locale = 'en' | 'ur' | 'ar';

const dictionaries = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  ur: () => import('../dictionaries/ur.json').then((module) => module.default),
  ar: () => import('../dictionaries/ar.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  const langKey = (['en', 'ur', 'ar'].includes(locale) ? locale : 'en') as Locale;
  return dictionaries[langKey]();
};
