import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './App';
import { DEFAULT_LOCALE, LOCALES, allRoutes, metaForPath, registerTranslations, type Locale } from './lib/content';
import { localeInfo, localePrefix } from './lib/i18n';
import ar from './lib/translations/ar';
import es from './lib/translations/es';
import fr from './lib/translations/fr';

// The prerenderer writes every language, so it needs every translation.
registerTranslations('fr', fr);
registerTranslations('es', es);
registerTranslations('ar', ar);

export { allRoutes, metaForPath };
export const locales = LOCALES.map((l) => ({ code: l.code, dir: l.dir, prefix: localePrefix(l.code) }));
export const defaultLocale = DEFAULT_LOCALE;

/** Used by scripts/prerender.mjs to write one HTML file per route and language. */
export function render(route: string, locale: Locale = DEFAULT_LOCALE) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const prefix = localePrefix(locale);
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={`${base}${prefix}${route === '/' && prefix ? '' : route}`} basename={`${base}${prefix}` || '/'}>
        <App locale={locale} />
      </StaticRouter>
    </StrictMode>,
  );
  return { html, meta: metaForPath(route, locale), dir: localeInfo(locale).dir };
}
