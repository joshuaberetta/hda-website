// Shared by translate.mjs and validate-content.mjs. The rules for which fields
// are text (and so translated) live in src/lib/i18n.json, which the site's
// loader (src/lib/content.ts) reads too, so both sides always agree.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const content = path.join(root, 'content');
export const config = JSON.parse(fs.readFileSync(path.join(root, 'src/lib/i18n.json'), 'utf8'));
export const TRANSLATIONS = config.locales.map((l) => l.code).filter((c) => c !== config.defaultLocale);

const KEYS = new Set(config.translatableKeys);
const LISTS = new Set(config.translatableLists);
const ASSETS = new Set(config.localisableKeys);
const LOCALE_SUFFIX = new RegExp(`\\.(${TRANSLATIONS.join('|')})\\.(md|yml)$`);

/** `pages/about.es.md` -> 'es'; English files return undefined. */
export const localeOf = (file) => LOCALE_SUFFIX.exec(file)?.[1];
export const sourceOf = (file) => file.replace(LOCALE_SUFFIX, '.$2');
export const translationOf = (file, locale) => file.replace(/\.(md|yml)$/, `.${locale}.$1`);

/** Every English content file (relative to content/) that can be translated. Docs (README.md) aren't. */
export function sourceFiles() {
  return fs
    .readdirSync(content, { recursive: true })
    .map((f) => f.split(path.sep).join('/'))
    .filter((f) => /\.(md|yml)$/.test(f) && !localeOf(f) && f !== 'settings/translation.yml' && !/(^|\/)[A-Z]+\.md$/.test(f))
    .sort();
}

/** ui.yml is nothing but interface text, so every string in it is translated. */
const allText = (file) => file === 'settings/ui.yml';

export function readEntry(file) {
  const raw = fs.readFileSync(path.join(content, file), 'utf8');
  if (file.endsWith('.yml')) return { data: YAML.parse(raw) ?? {}, body: '' };
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, body: raw.trim() };
  return { data: YAML.parse(match[1]) ?? {}, body: match[2].trim() };
}

export function writeEntry(file, data, body) {
  const yaml = YAML.stringify(data, { lineWidth: 0 });
  const out = file.endsWith('.yml') ? yaml : `---\n${yaml}---\n${body ? `\n${body}\n` : ''}`;
  fs.writeFileSync(path.join(content, file), out);
}

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

/**
 * Every translatable string in an entry, as [path, text] pairs. The body is
 * the path "body". Paths look like `sections.2.items.0.title`.
 */
export function strings(file, data, body) {
  const out = [];
  const all = allText(file);
  const walk = (value, at, key, inList) => {
    if (typeof value === 'string') {
      if (value.trim() && (all || inList || KEYS.has(key))) out.push([at.join('.'), value]);
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, [...at, i], key, LISTS.has(key) && typeof v === 'string'));
    } else if (isObject(value)) {
      for (const [k, v] of Object.entries(value)) if (k !== 'translation') walk(v, [...at, k], k, false);
    }
  };
  walk(data, [], '', false);
  if (body) out.push(['body', body]);
  return out;
}

/** Short fingerprint of an English entry's text, so we can tell when a translation is out of date. */
export function sourceHash(file, data, body) {
  return crypto.createHash('sha256').update(JSON.stringify(strings(file, data, body))).digest('hex').slice(0, 12);
}

/**
 * The part of an English entry a translation file stores: only the top-level
 * fields that hold text, kept whole (links, images and types included) so the
 * file mirrors the English layout. Structure always comes from English at
 * build time; see localise() in src/lib/content.ts.
 */
export function translatableShape(file, data) {
  const keep = new Set(strings(file, data, '').map(([p]) => p.split('.')[0]));
  return Object.fromEntries(Object.entries(data).filter(([k]) => keep.has(k)));
}

/** Write translated strings back into a copy of `data` at their paths. */
export function applyStrings(data, body, translated) {
  const copy = structuredClone(data);
  let newBody = body;
  for (const [p, text] of Object.entries(translated)) {
    if (p === 'body') {
      newBody = text;
      continue;
    }
    const parts = p.split('.');
    let node = copy;
    for (const part of parts.slice(0, -1)) node = node?.[part];
    if (node && typeof node[parts.at(-1)] === 'string') node[parts.at(-1)] = text;
  }
  return { data: copy, body: newBody };
}

/**
 * Paths where a translation's layout no longer matches English (a section
 * added, removed or reordered, a link changed). The site shows English at
 * those places until the translation is redone. Mirrors localise() in
 * src/lib/content.ts: extra keys in the translation are ignored.
 */
export function mismatches(file, en, loc) {
  const all = allText(file);
  const out = [];
  const walk = (a, b, at, key, inList) => {
    if (b === undefined) return;
    if (typeof a === 'string' && (all || inList || KEYS.has(key) || ASSETS.has(key))) return;
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || b.length !== a.length) return out.push(at.join('.') || '(root)');
      return a.forEach((x, i) => walk(x, b[i], [...at, i], key, LISTS.has(key) && typeof x === 'string'));
    }
    if (isObject(a)) {
      if (!isObject(b)) return out.push(at.join('.'));
      return Object.entries(a).forEach(([k, x]) => walk(x, b[k], [...at, k], k, false));
    }
    if (String(a) !== String(b)) out.push(at.join('.'));
  };
  walk(en, loc, [], '', false);
  return out;
}
