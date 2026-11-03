const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix site-relative asset paths (/images/…, /files/…) with the deploy base path. */
export function asset(path?: string): string | undefined {
  if (!path) return path;
  return path.startsWith('/') ? `${BASE}${path}` : path;
}

export function isExternal(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
}

/** Files and the review site (/designs/) are plain <a> tags, not client-side routes. */
export function isRouterLink(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('/files/') && !href.startsWith('/designs/');
}
