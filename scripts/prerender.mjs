// Writes a static HTML file for every route so the static host serves real
// content (good for SEO, link previews and no-JS visitors), then hydrates.
// Adapted from kobo.ngo's scripts/prerender.mjs (English only, no CMS).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const { render, allRoutes } = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);
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

const routes = allRoutes();
for (const route of [...routes, '/404']) {
  const { html, meta } = render(route);
  const head = [
    route === '/404' && legacyRedirect,
    `<title>${escape(meta.title)}</title>`,
    `<meta name="description" content="${escape(meta.description)}" />`,
    `<meta property="og:title" content="${escape(meta.title)}" />`,
    `<meta property="og:description" content="${escape(meta.description)}" />`,
    `<meta property="og:type" content="website" />`,
    route !== '/404' && `<link rel="canonical" href="${siteUrl}${route}" />`,
    noindex && '<meta name="robots" content="noindex" />',
  ]
    .filter(Boolean)
    .join('\n    ');
  write(route, template.replace('<!--app-head-->', head).replace('<!--app-html-->', html));
}

const sitemap = routes.map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`).join('\n');
fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`,
);
fs.writeFileSync(
  path.join(dist, 'robots.txt'),
  noindex ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /designs/\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
);
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`Prerendered ${routes.length} pages and the 404 page.`);
