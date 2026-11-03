import { createContext, useContext } from 'react';
import { DEFAULT_LOCALE, LOCALES, getContent, type Locale, type UiStrings } from './content';

// English lives at the root (/members); other languages under a prefix
// (/fr/members). The router's basename carries the prefix, so components keep
// linking to "/members" and stay in the visitor's language.

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);
export const LocaleProvider = LocaleContext.Provider;

export const useLocale = () => useContext(LocaleContext);
export const useContent = () => getContent(useLocale());

export const localeInfo = (locale: Locale) => LOCALES.find((l) => l.code === locale)!;

/** The language prefix for a locale: '' for English, '/fr' for French. */
export const localePrefix = (locale: Locale) => (locale === DEFAULT_LOCALE ? '' : `/${locale}`);

/** `/fr/members` -> { locale: 'fr', path: '/members' }. Expects a path without the deploy base. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [, first, ...rest] = pathname.split('/');
  const match = LOCALES.find((l) => l.code === first && l.code !== DEFAULT_LOCALE);
  if (!match) return { locale: DEFAULT_LOCALE, path: pathname || '/' };
  return { locale: match.code, path: `/${rest.join('/')}` };
}

function lookup(strings: UiStrings, key: string): string | undefined {
  let node: string | UiStrings | undefined = strings;
  for (const part of key.split('.')) node = typeof node === 'object' ? node[part] : undefined;
  return typeof node === 'string' ? node : undefined;
}

export type Translate = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Interface text from content/settings/ui.yml, e.g. t('header.openMenu') or
 * t('members.brings', { name }). Falls back to English, then to the key.
 */
export function translator(locale: Locale): Translate {
  const ui = getContent(locale).ui;
  const english = getContent(DEFAULT_LOCALE).ui;
  return (key, vars) => {
    const text = lookup(ui, key) ?? lookup(english, key) ?? key;
    return vars ? text.replace(/\{(\w+)\}/g, (m, name: string) => String(vars[name] ?? m)) : text;
  };
}

export const useT = () => translator(useLocale());
