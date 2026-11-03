// Writes a static HTML file for every route in every language, so the static
// host serves real content (good for SEO, link previews and no-JS visitors),
// then hydrates. Adapted from kobo.ngo's scripts/prerender.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const { render, allRoutes, metaForPath, locales, defaultLocale } = await import(
  pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href
);
const siteUrl = (process.env.SITE_URL ?? 'https://hda.kobolabs.dev').replace(/\/$/, '');
// NOINDEX=true keeps search engines out while the site is a draft.
const noindex = process.env.NOINDEX === 'true';

const escape = (s = '') =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Links shared before the design review moved to /designs/ (the voting doc is
// full of them) land on the 404 page. This sends them on, query string and all,
// before anything else loads. pages.tsx does the same for the dev server.
const legacyRedirect = `<script>(function(l){if(/^\\/(themes|logos|palettes|results|assets)\\//.test(l.pathname))l.replace('/designs'+l.pathname+l.search+l.hash)})(location)</script>`;

function write(route, html) {
  const file = route === '/404' ? path.join(dist, '404.html') : path.join(dist, route, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

// Every route exists in every language: /members, /fr/members, /es/members, /ar/members.
// A page with no translation yet still renders (in English, with a note), so
// links never break, but it points search engines at the English original.
// Each language's text is its own chunk (src/lib/translations/). Preloading it
// lets the browser fetch it alongside the main script instead of after it.
const manifest = JSON.parse(fs.readFileSync(path.join(dist, '.vite/manifest.json'), 'utf8'));
const chunkFor = (code) => manifest[`src/lib/translations/${code}.ts`]?.file;
const localised = (prefix, route) => (prefix && route === '/' ? prefix : `${prefix}${route}`);
const translatedIn = (route) =>
  locales.filter((l) => l.code === defaultLocale || metaForPath(route, l.code).translation !== 'missing');

const routes = allRoutes();
for (const route of [...routes, '/404']) {
  const alternates = route === '/404' ? [] : translatedIn(route);
  for (const locale of locales) {
    // There's one 404 page for the whole site (the host's error document), in English.
    if (route === '/404' && locale.code !== defaultLocale) continue;
    const { html, meta, dir } = render(route, locale.code);
    const url = localised(locale.prefix, route);
    const canonical = meta.translation === 'missing' ? route : url;
    const head = [
      route === '/404' && legacyRedirect,
      `<title>${escape(meta.title)}</title>`,
      `<meta name="description" content="${escape(meta.description)}" />`,
      `<meta property="og:title" content="${escape(meta.title)}" />`,
      `<meta property="og:description" content="${escape(meta.description)}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:locale" content="${locale.code}" />`,
      chunkFor(locale.code) && `<link rel="modulepreload" href="/${chunkFor(locale.code)}" />`,
      route !== '/404' && `<link rel="canonical" href="${siteUrl}${canonical}" />`,
      ...alternates.map(
        (l) => `<link rel="alternate" hreflang="${l.code}" href="${siteUrl}${localised(l.prefix, route)}" />`,
      ),
      alternates.length > 1 && `<link rel="alternate" hreflang="x-default" href="${siteUrl}${route}" />`,
      noindex && '<meta name="robots" content="noindex" />',
    ]
      .filter(Boolean)
      .join('\n    ');
    const page = template
      .replace('<html lang="en">', `<html lang="${locale.code}" dir="${dir}">`)
      .replace('<!--app-head-->', head)
      .replace('<!--app-html-->', html);
    write(url, page);
  }
}

const sitemap = routes
  .flatMap((route) => translatedIn(route).map((l) => `  <url><loc>${siteUrl}${localised(l.prefix, route)}</loc></url>`))
  .join('\n');
fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`,
);
fs.writeFileSync(
  path.join(dist, 'robots.txt'),
  noindex ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /designs/\nDisallow: /admin/\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
);
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
fs.rmSync(path.join(dist, '.vite'), { recursive: true, force: true });
console.log(`Prerendered ${routes.length} pages in ${locales.length} languages, and the 404 page.`);
