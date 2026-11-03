import '@mantine/core/styles.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
// Arabic glyphs, which Inter and Plus Jakarta Sans don't have. Their
// unicode-range means they only download on pages with Arabic text.
import '@fontsource-variable/noto-sans-arabic';
import '@fontsource-variable/noto-kufi-arabic';
import './theme/global.css';

import { DirectionProvider, MantineProvider } from '@mantine/core';
import { useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { LanguageSuggestion } from './components/layout/LanguageSuggestion';
import { metaForPath, type Locale } from './lib/content';
import { LocaleProvider, localeInfo, useLocale, useT } from './lib/i18n';
import { ContentPage, NotFound } from './pages/pages';
import { cssVariablesResolver, theme } from './theme/theme';

/** Keeps <title>/description in sync and scrolls on client-side navigation. */
function useRouteEffects() {
  const { pathname, hash } = useLocation();
  const locale = useLocale();
  useEffect(() => {
    const meta = metaForPath(pathname, locale);
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description ?? '');
    if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash, locale]);
}

function Layout() {
  useRouteEffects();
  const t = useT();
  return (
    <>
      <a href="#main" className="skip-link">
        {t('skipToContent')}
      </a>
      <LanguageSuggestion />
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export function App({ locale }: { locale: Locale }) {
  return (
    <LocaleProvider value={locale}>
      <DirectionProvider initialDirection={localeInfo(locale).dir} detectDirection={false}>
        <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} forceColorScheme="light">
          <Routes>
            <Route element={<Layout />}>
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<ContentPage />} />
            </Route>
          </Routes>
        </MantineProvider>
      </DirectionProvider>
    </LocaleProvider>
  );
}
