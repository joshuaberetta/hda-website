const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix site-relative asset paths (/images/…, /files/…) with the deploy base path. */
export function asset(path?: string): string | undefined {
  if (!path) return path;
  return path.startsWith('/') ? `${BASE}${path}` : path;
}

/** `/members/` -> `/members`, so links match whether or not the host adds a trailing slash. */
export const trimSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

export function isExternal(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
}

/** Files, the review site (/designs/) and the editor (/admin/) are plain <a> tags, not client-side routes. */
export function isRouterLink(href: string): boolean {
  return href.startsWith('/') && !/^\/(files|designs|admin|images)\//.test(href);
}
