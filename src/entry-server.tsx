import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './App';
import { allRoutes, metaForPath } from './lib/content';

export { allRoutes, metaForPath };

/** Used by scripts/prerender.mjs to write one HTML file per route. */
export function render(route: string) {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={route}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  return { html, meta: metaForPath(route) };
}
