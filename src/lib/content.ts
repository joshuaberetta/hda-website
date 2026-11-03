import YAML from 'yaml';
import type { Member, NewsItem, Page, SiteSettings } from './types';

// Every file under /content is bundled at build time, so editing a file and
// pushing is all it takes to publish a change. The format is in
// content/README.md.
const pageFiles = import.meta.glob<string>('/content/pages/*.md', { query: '?raw', import: 'default', eager: true });
const memberFiles = import.meta.glob<string>('/content/members/*.md', { query: '?raw', import: 'default', eager: true });
const newsFiles = import.meta.glob<string>('/content/news/*.md', { query: '?raw', import: 'default', eager: true });
const siteFile = import.meta.glob<string>('/content/settings/site.yml', { query: '?raw', import: 'default', eager: true });

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parseMarkdown(text: string): Record<string, unknown> {
  const match = FRONT_MATTER.exec(text);
  return match ? ((YAML.parse(match[1]) as Record<string, unknown>) ?? {}) : {};
}

const slugOf = (path: string) => path.split('/').pop()!.replace(/\.md$/, '');

function collection<T>(files: Record<string, string>) {
  return Object.entries(files).map(([path, text]) => ({ ...parseMarkdown(text), slug: slugOf(path) }) as T);
}

export const site = YAML.parse(Object.values(siteFile)[0]) as SiteSettings;

const pages = new Map(collection<Page>(pageFiles).map((p) => [p.slug, p]));

export const members = collection<Member>(memberFiles).sort((a, b) => a.order - b.order);
const membersBySlug = new Map(members.map((m) => [m.slug, m]));

export const news = collection<NewsItem>(newsFiles).sort((a, b) => b.date.localeCompare(a.date));

export function getMember(slug: string): Member | undefined {
  return membersBySlug.get(slug);
}

/** `/` is `home.md`, `/members` is `members.md`, and so on. */
export function pageForPath(pathname: string): Page | undefined {
  const slug = pathname.replace(/^\/+|\/+$/g, '') || 'home';
  return pages.get(slug);
}

/** Every route the prerenderer writes. */
export function allRoutes(): string[] {
  return [...pages.keys()].map((slug) => (slug === 'home' ? '/' : `/${slug}`));
}

export function metaForPath(pathname: string) {
  const page = pageForPath(pathname);
  if (!page) return { title: `Page not found · ${site.name}`, description: site.description };
  return {
    title: page.slug === 'home' ? site.name : `${page.title} · ${site.name}`,
    description: page.description ?? site.description,
  };
}
