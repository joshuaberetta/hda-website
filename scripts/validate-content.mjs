// Checks everything in content/ against the content model (content/README.md)
// so a typo fails the build instead of breaking a page. Run: npm run lint:content
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { TRANSLATIONS, localeOf, mismatches, readEntry, sourceFiles, translatableShape, translationOf } from './i18n.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const content = path.join(root, 'content');
const errors = [];
const fail = (file, msg) => errors.push(`${path.relative(root, file)}: ${msg}`);

function frontMatter(file) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(fs.readFileSync(file, 'utf8'));
  if (!match) return fail(file, 'missing front matter (--- … ---)'), {};
  try {
    return YAML.parse(match[1]) ?? {};
  } catch (e) {
    return fail(file, `invalid YAML: ${e.message}`), {};
  }
}
const files = (dir) =>
  fs.existsSync(path.join(content, dir))
    ? fs
        .readdirSync(path.join(content, dir))
        .filter((f) => f.endsWith('.md') && !localeOf(f))
        .map((f) => path.join(content, dir, f))
    : [];

// Keep in step with src/lib/icons.tsx and src/lib/types.ts.
const icons = fs.readFileSync(path.join(root, 'src/lib/icons.tsx'), 'utf8');
const ICONS = new Set([...icons.slice(icons.indexOf('const ICONS'), icons.indexOf('const SOCIAL')).matchAll(/^\s+'?([\w-]+)'?:/gm)].map((m) => m[1]));
const SOCIALS = new Set([...icons.slice(icons.indexOf('const SOCIAL')).matchAll(/^\s+(\w+):/gm)].map((m) => m[1]));
const COLOURS = new Set(['red', 'teal', 'ochre', 'blue']);
const BACKGROUNDS = new Set(['paper', 'stone', 'mist', 'dark']);
const VARIANTS = new Set(['filled', 'outline', 'arrow']);

// What each section type needs: required fields, and lists whose items need fields.
const SECTIONS = {
  hero: { required: ['title', 'subtitle'], lists: { pins: ['title', 'body', 'label'] } },
  members: {},
  examples: { required: ['items'], lists: { items: ['member', 'title', 'place', 'body'] } },
  layers: { required: ['items'], lists: { items: ['title', 'body', 'icon', 'label'] } },
  lifecycle: { required: ['items'], lists: { items: ['phase', 'title', 'body'] } },
  commitments: { required: ['items'], lists: { items: ['title', 'body', 'icon'] } },
  quote: { required: ['quote'] },
  stats: { required: ['items'], lists: { items: ['member', 'value', 'label'] } },
  split: { required: ['body'] },
  news: {},
  services: { required: ['groups'], lists: { groups: ['title', 'icon', 'body', 'services'] } },
  text: { required: ['body'] },
  cta: { required: ['items'], lists: { items: ['title', 'body', 'links'] } },
  contact: { required: ['title'] },
};

const memberSlugs = new Set(files('members').map((f) => path.basename(f, '.md')));
const pageSlugs = new Set(files('pages').map((f) => path.basename(f, '.md')));

function checkLinks(file, where, links) {
  if (links === undefined) return;
  if (!Array.isArray(links)) return fail(file, `${where}: links must be a list`);
  links.forEach((l, i) => {
    if (!l?.label || !l?.href) fail(file, `${where}: link ${i + 1} needs a label and an href`);
    if (l?.variant && !VARIANTS.has(l.variant)) fail(file, `${where}: unknown link variant "${l.variant}"`);
    // Internal page links must point at a page that exists.
    const route = /^\/([\w-]*)(?:[#?].*)?$/.exec(l?.href ?? '');
    if (route && route[1] && !pageSlugs.has(route[1])) fail(file, `${where}: link to "${l.href}", but there is no content/pages/${route[1]}.md`);
  });
}

function checkMember(file, where, slug) {
  if (slug !== undefined && !memberSlugs.has(slug)) fail(file, `${where}: unknown member "${slug}" (expected one of ${[...memberSlugs].join(', ')})`);
}

for (const file of files('pages')) {
  const page = frontMatter(file);
  if (!page.title) fail(file, 'missing title');
  if (!page.description) fail(file, 'missing description (used for search results and link previews)');
  if (!Array.isArray(page.sections)) {
    fail(file, 'sections must be a list');
    continue;
  }
  page.sections.forEach((section, i) => {
    const where = `section ${i + 1} (${section?.type ?? 'no type'})`;
    const spec = SECTIONS[section?.type];
    if (!spec) return fail(file, `${where}: unknown type (expected one of ${Object.keys(SECTIONS).join(', ')})`);
    for (const key of spec.required ?? []) if (section[key] === undefined || section[key] === '') fail(file, `${where}: missing "${key}"`);
    for (const [list, keys] of Object.entries(spec.lists ?? {})) {
      if (section[list] === undefined) continue;
      if (!Array.isArray(section[list])) {
        fail(file, `${where}: "${list}" must be a list`);
        continue;
      }
      section[list].forEach((item, j) => {
        for (const key of keys) if (item?.[key] === undefined) fail(file, `${where}, ${list} ${j + 1}: missing "${key}"`);
        if (item?.icon && !ICONS.has(item.icon)) fail(file, `${where}, ${list} ${j + 1}: unknown icon "${item.icon}" (register it in src/lib/icons.tsx)`);
        checkMember(file, `${where}, ${list} ${j + 1}`, item?.member);
        if (item?.links) checkLinks(file, `${where}, ${list} ${j + 1}`, item.links);
        for (const s of item?.services ?? []) {
          for (const key of ['name', 'body', 'members']) if (s?.[key] === undefined) fail(file, `${where}, service "${s?.name ?? '?'}": missing "${key}"`);
          for (const m of s?.members ?? []) checkMember(file, `${where}, service "${s.name}"`, m);
        }
      });
    }
    if (section.background && !BACKGROUNDS.has(section.background)) fail(file, `${where}: unknown background "${section.background}"`);
    checkLinks(file, where, section.links);
  });
}

for (const file of files('members')) {
  const m = frontMatter(file);
  for (const key of ['name', 'fullName', 'order', 'colour', 'focus', 'url', 'summary', 'intro', 'skills']) if (m[key] === undefined) fail(file, `missing "${key}"`);
  if (m.colour && !COLOURS.has(m.colour)) fail(file, `unknown colour "${m.colour}" (expected ${[...COLOURS].join(', ')})`);
  for (const s of m.socials ?? []) if (!SOCIALS.has(s.network)) fail(file, `unknown social network "${s.network}" (register it in src/lib/icons.tsx)`);
}

for (const file of files('news')) {
  const n = frontMatter(file);
  for (const key of ['title', 'date', 'dateLabel', 'tag', 'summary']) if (n[key] === undefined) fail(file, `missing "${key}"`);
  if (n.date && !/^\d{4}-\d{2}-\d{2}$/.test(String(n.date))) fail(file, `date must be YYYY-MM-DD, got "${n.date}"`);
  if (n.tone && !COLOURS.has(n.tone)) fail(file, `unknown tone "${n.tone}"`);
}

const siteFile = path.join(content, 'settings/site.yml');
const site = YAML.parse(fs.readFileSync(siteFile, 'utf8'));
for (const key of ['name', 'description', 'email', 'nav', 'cta', 'footer']) if (site[key] === undefined) fail(siteFile, `missing "${key}"`);
checkLinks(siteFile, 'nav', site.nav);
checkLinks(siteFile, 'cta', site.cta ? [site.cta] : []);
for (const col of site.footer?.columns ?? []) checkLinks(siteFile, `footer "${col.title}"`, col.links);

if (!pageSlugs.has('home')) fail(path.join(content, 'pages'), 'there must be a home.md');

// Translations (LOCALISATION.md): each must parse, carry a known status, and
// keep the English layout. Where the layout differs, the site shows English
// at that spot, so this is a warning to fix, not a broken page.
const STATUSES = new Set(['machine', 'reviewed', 'outdated', 'retranslate']);
let translationCount = 0;
const warnings = [];
for (const file of sourceFiles()) {
  const en = readEntry(file);
  for (const locale of TRANSLATIONS) {
    const target = translationOf(file, locale);
    const abs = path.join(content, target);
    if (!fs.existsSync(abs)) continue;
    translationCount++;
    let loc;
    try {
      loc = readEntry(target);
    } catch (e) {
      fail(abs, `invalid YAML: ${e.message.split('\n')[0]}`);
      continue;
    }
    const status = loc.data.translation?.status;
    if (status && !STATUSES.has(status)) fail(abs, `unknown translation status "${status}" (expected ${[...STATUSES].join(', ')})`);
    for (const at of mismatches(file, translatableShape(file, en.data), loc.data))
      warnings.push(`${target}: layout differs from English at ${at}; English shows there until it's retranslated`);
  }
}
if (warnings.length) console.warn(`Translation warnings (${warnings.length}):\n  ${warnings.join('\n  ')}`);

if (errors.length) {
  console.error(`Content problems (${errors.length}):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(
  `Content OK: ${pageSlugs.size} pages, ${memberSlugs.size} members, ${files('news').length} news items, ${translationCount} translations.`,
);
