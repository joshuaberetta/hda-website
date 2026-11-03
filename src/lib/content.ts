import YAML from 'yaml';
import i18n from './i18n.json';
import type { Member, NewsItem, Page, SiteSettings, TranslationStatus } from './types';

// Every file under /content is bundled at build time, so editing a file and
// pushing is all it takes to publish a change. The format is in
// content/README.md, and how translations work is in LOCALISATION.md.
// Translations sit beside the English file (home.md, home.fr.md, home.ar.md…)
// and are loaded separately, per language: see registerTranslations below.
// English file names never contain a dot, so `!**/*.*.md` skips translations.
const pageFiles = import.meta.glob<string>(['/content/pages/*.md', '!**/*.*.md'], {
  query: '?raw',
  import: 'default',
  eager: true,
});
const memberFiles = import.meta.glob<string>(['/content/members/*.md', '!**/*.*.md'], {
  query: '?raw',
  import: 'default',
  eager: true,
});
const newsFiles = import.meta.glob<string>(['/content/news/*.md', '!**/*.*.md'], {
  query: '?raw',
  import: 'default',
  eager: true,
});
const settingsFiles = import.meta.glob<string>('/content/settings/{site,ui}.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export type Locale = 'en' | 'fr' | 'es' | 'ar';
export const DEFAULT_LOCALE = i18n.defaultLocale as Locale;
export const LOCALES = i18n.locales as { code: Locale; name: string; dir: 'ltr' | 'rtl'; intl: string }[];

/** Interface text from content/settings/ui.yml: nested groups of strings. */
export type UiStrings = { [key: string]: string | UiStrings };

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parseMarkdown(raw: string): Record<string, unknown> {
  const match = FRONT_MATTER.exec(raw);
  return match ? ((YAML.parse(match[1]) as Record<string, unknown>) ?? {}) : {};
}

const slugOf = (path: string) => path.split('/').pop()!.replace(/\.md$/, '');

// ---------------------------------------------------------------------------
// Translations
//
// A translation file only supplies text. Everything else (section types,
// links, images, the order of things) always comes from the English file, so
// a translation can never break a layout. Where a translation's layout no
// longer lines up with English (a section was added or moved since it was
// made), English shows at that spot until it's retranslated.
// scripts/i18n.mjs mirrors these rules for the translation tools.
// ---------------------------------------------------------------------------

const TEXT_KEYS = new Set(i18n.translatableKeys);
const TEXT_LISTS = new Set(i18n.translatableLists);
// Images a translation may swap for a version in its language. Never machine-translated.
const ASSET_KEYS = new Set(i18n.localisableKeys);
const LOCALE_SUFFIX = new RegExp(`\\.(${LOCALES.map((l) => l.code).join('|')})\\.(md|yml)$`);

type Json = unknown;
const isObject = (v: Json): v is Record<string, Json> => Boolean(v) && typeof v === 'object' && !Array.isArray(v);

/** True when `loc` has the same layout as `en`: every non-text value matches. */
function sameLayout(en: Json, loc: Json, key: string, all: boolean, inList = false): boolean {
  if (loc === undefined) return true;
  if (typeof en === 'string' && (all || inList || TEXT_KEYS.has(key) || ASSET_KEYS.has(key))) return true;
  if (Array.isArray(en)) {
    return (
      Array.isArray(loc) &&
      loc.length === en.length &&
      en.every((x, i) => sameLayout(x, loc[i], key, all, TEXT_LISTS.has(key) && typeof x === 'string'))
    );
  }
  if (isObject(en)) return isObject(loc) && Object.entries(en).every(([k, x]) => sameLayout(x, loc[k], k, all));
  return String(en) === String(loc);
}

/** English `en` with the translated text from `loc` laid over it. */
function localise(en: Json, loc: Json, key: string, all: boolean, inList = false): Json {
  if (loc === undefined || loc === null) return en;
  if (typeof en === 'string') {
    const isText = all || inList || TEXT_KEYS.has(key) || ASSET_KEYS.has(key);
    return isText && typeof loc === 'string' && loc.trim() ? loc : en;
  }
  if (Array.isArray(en)) {
    if (!Array.isArray(loc) || loc.length !== en.length) return en;
    return en.map((item, i) => {
      const listText = TEXT_LISTS.has(key) && typeof item === 'string';
      return isObject(item) && !sameLayout(item, loc[i], key, all) ? item : localise(item, loc[i], key, all, listText);
    });
  }
  if (isObject(en)) {
    if (!isObject(loc)) return en;
    return Object.fromEntries(Object.entries(en).map(([k, v]) => [k, localise(v, loc[k], k, all)]));
  }
  return en;
}

/** Raw translation files per locale, keyed by their English file's path. */
const translations: Partial<Record<Locale, Record<string, string>>> = {};

/**
 * Makes a language's translations available. The prerenderer registers every
 * language up front; the browser loads just the visitor's language before the
 * page hydrates (entry-client.tsx).
 */
export function registerTranslations(locale: Locale, files: Record<string, string>) {
  translations[locale] = Object.fromEntries(
    Object.entries(files).map(([path, raw]) => [path.replace(LOCALE_SUFFIX, '.$2'), raw]),
  );
  cache.delete(locale);
}

function load<T>(files: Record<string, string>, locale: Locale): T[] {
  return Object.entries(files).map(([path, raw]) => {
    let data = parseMarkdown(raw);
    let translation: TranslationStatus = 'source';
    if (locale !== DEFAULT_LOCALE) {
      translation = 'missing';
      const localRaw = translations[locale]?.[path];
      if (localRaw) {
        const loc = parseMarkdown(localRaw);
        const meta = (loc.translation ?? {}) as { status?: TranslationStatus };
        data = localise(data, loc, '', false) as Record<string, unknown>;
        translation = meta.status ?? 'machine';
      }
    }
    return { sections: [], ...data, slug: slugOf(path), translation } as T;
  });
}

function loadSettings<T>(name: 'site' | 'ui', locale: Locale): T {
  const path = `/content/settings/${name}.yml`;
  const en = (YAML.parse(settingsFiles[path] ?? '') ?? {}) as Json;
  const localRaw = translations[locale]?.[path];
  if (locale === DEFAULT_LOCALE || !localRaw) return en as T;
  // Every string in ui.yml is interface text; site.yml follows the usual rules.
  return localise(en, YAML.parse(localRaw), '', name === 'ui') as T;
}

// ---------------------------------------------------------------------------
// All of the site's content in one language
// ---------------------------------------------------------------------------

function build(locale: Locale) {
  const site = loadSettings<SiteSettings>('site', locale);
  const ui = loadSettings<UiStrings>('ui', locale);
  const pages = load<Page>(pageFiles, locale);
  const members = load<Member>(memberFiles, locale).sort((a, b) => a.order - b.order);
  const news = load<NewsItem>(newsFiles, locale).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return {
    locale,
    site,
    ui,
    pages,
    members,
    news,
    getPage: (slug: string) => pages.find((p) => p.slug === slug),
    getMember: (slug: string) => members.find((m) => m.slug === slug),
  };
}

export type Content = ReturnType<typeof build>;

const cache = new Map<Locale, Content>();

/** The site's content in `locale`, with English wherever a translation is missing. */
export function getContent(locale: Locale = DEFAULT_LOCALE): Content {
  let content = cache.get(locale);
  if (!content) cache.set(locale, (content = build(locale)));
  return content;
}

/** English settings: the source of truth for routes and the site name. */
export const site = getContent().site;

/** `/` is `home.md`, `/members` is `members.md`, and so on. Paths have no language prefix. */
export function pageSlugFromPath(pathname: string): string {
  return pathname.replace(/^\/+|\/+$/g, '') || 'home';
}

/** Every URL (without a language prefix) the prerenderer writes. */
export function allRoutes(): string[] {
  return getContent().pages.map((p) => (p.slug === 'home' ? '/' : `/${p.slug}`));
}

/** Title, description and translation status for a URL, used by the prerenderer and on navigation. */
export function metaForPath(
  pathname: string,
  locale: Locale = DEFAULT_LOCALE,
): { title: string; description: string; translation?: TranslationStatus } {
  const { site, ui, getPage } = getContent(locale);
  const page = getPage(pageSlugFromPath(pathname));
  const notFound = (ui.notFound as UiStrings | undefined)?.pageTitle ?? 'Page not found';
  if (!page) return { title: `${notFound} · ${site.name}`, description: site.description };
  return {
    title: page.slug === 'home' ? site.name : `${page.title} · ${site.name}`,
    description: page.description ?? site.description,
    translation: page.translation,
  };
}
