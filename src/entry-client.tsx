import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import { registerTranslations } from './lib/content';
import { localeInfo, localePrefix, splitLocale } from './lib/i18n';
import { translationChunks } from './lib/translations';

// /fr/members is the French /members: the language prefix becomes part of the
// router's basename, so every in-site link stays in that language. Switching
// language is a full page load (see LanguageMenu in Header.tsx).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const { locale } = splitLocale(window.location.pathname.slice(base.length));
const { dir } = localeInfo(locale);
// Prerendered pages already carry these; the dev server's shell doesn't.
document.documentElement.lang = locale;
document.documentElement.dir = dir;

async function start() {
  // Only this visitor's language is downloaded; it must be in place before
  // hydrating so the first render matches the prerendered HTML.
  const chunk = translationChunks[locale as keyof typeof translationChunks];
  if (chunk) registerTranslations(locale, (await chunk()).default);

  const container = document.getElementById('root')!;
  const app = (
    <StrictMode>
      <BrowserRouter basename={`${base}${localePrefix(locale)}` || '/'}>
        <App locale={locale} />
      </BrowserRouter>
    </StrictMode>
  );

  // Production pages are prerendered to HTML (scripts/prerender.mjs), so hydrate
  // them; the dev server serves an empty shell, so render from scratch.
  if (container.hasChildNodes()) hydrateRoot(container, app);
  else createRoot(container).render(app);
}

void start();
