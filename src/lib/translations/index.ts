import type { Locale } from '../content';

/**
 * Translations load per language (registerTranslations in content.ts, called
 * from entry-client.tsx), so a visitor only downloads the one they're reading.
 * Adding a language means adding a file here like fr.ts and a line below.
 */
export const translationChunks: Record<Exclude<Locale, 'en'>, () => Promise<{ default: Record<string, string> }>> = {
  fr: () => import('./fr'),
  es: () => import('./es'),
  ar: () => import('./ar'),
};
