import '@mantine/core/styles.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './theme/global.css';

import { MantineProvider } from '@mantine/core';
import { useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { metaForPath } from './lib/content';
import { ContentPage, NotFound } from './pages/pages';
import { cssVariablesResolver, theme } from './theme/theme';

/** Keeps <title>/description in sync and scrolls on client-side navigation. */
function useRouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const meta = metaForPath(pathname);
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description ?? '');
    if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
}

function Layout() {
  useRouteEffects();
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export function App() {
  return (
    <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} forceColorScheme="light">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<ContentPage />} />
        </Route>
      </Routes>
    </MantineProvider>
  );
}
