# AGENTS.md

The Humanitarian Data Alliance website (hda.kobolabs.dev). It uses React 19, Mantine 9, React Router 8 and Vite 8, prerenders to static HTML, and deploys to DigitalOcean App Platform (`.do/app.yaml`). The structure follows `../kobo.ngo`. The design review site lives unchanged in `public/designs/` (plain HTML/JS, no build) and is served at `/designs/`.

- **Copy lives only in `content/`**, never in components. The format is in `content/README.md`. Non-developers edit it through Sveltia CMS at `/admin/` (`EDITING.md`). Any content-shape change must update all of these:
  - `src/lib/types.ts`
  - the section component, plus `SectionRenderer.tsx`
  - `scripts/validate-content.mjs`
  - `public/admin/config.yml` (`lint:content` fails on fields, section types or icons the editor doesn't know)
  - `content/README.md`
- **Design system:** see `DESIGN.md`. It is Theme G, Unified, from the review, with logo 1, Convergence. Tokens are in `src/theme/theme.ts`.
  - Use theme colours (`navy`, `red`, `blue`, `teal`, `ochre`, `gray`), `var(--hda-*)` or the member-colour variables (`data-colour` → `--member-tint/-dot/-strong`), not hex values.
  - Use `Eyebrow`, `Kicker`, `CardTitle` and `Tbc` from `src/components/Typography.tsx`, and `SectionShell`/`SectionHeading` for bands.
  - Keep text at WCAG AA contrast, and add new pairs to the table in `DESIGN.md`.
- **Localisation** (`LOCALISATION.md`): the site is in en/fr/es/ar, with Arabic right-to-left. It works like kobo.ngo's.
  - Interface text goes in `content/settings/ui.yml` and is read with `useT()`. Add each new key to `ui.fr/es/ar.yml` too (or run `npm run translate`), and to the *Interface text* file in `public/admin/config.yml`.
  - Read content with `useContent()` from `src/lib/i18n.tsx`, not module-level imports, so it's in the visitor's language.
  - A new text field must be added to `translatableKeys` in `src/lib/i18n.json`, and get `i18n: true` in the CMS config. Layout fields get `i18n: duplicate`.
  - Use logical CSS properties (`inset-inline-start`, `padding-inline-end`), not `left`/`right`.
- **Placeholders:** mark anything waiting on the team (`placeholder: true`, `tbc: true`, `<Tbc>`). Never present invented facts (names, figures, service providers, URLs) as real.
- **Component styles** go in CSS modules next to the component. Mantine breakpoints are available as `$mantine-breakpoint-*`. To colour a Mantine `Anchor` from a module, pass `c="var(--x)"` and set `--x` in CSS.
- **Code must be SSR-safe**, because `scripts/prerender.mjs` renders every route with `renderToString`. Don't touch `window`/`document` outside effects. Graphics in `src/lib/graphics.ts` must stay deterministic (seeded).
- **Icons:** content refers to icons by name through `src/lib/icons.tsx`. Register new ones there, and add them to the `&icon` options in `public/admin/config.yml`.
- **Don't edit `public/designs/`** for website work: it's the record of the design review. Old review links (`/themes/…` etc.) are forwarded by the 404 page (`scripts/prerender.mjs`) and `NotFound` (`src/pages/pages.tsx`).
- **Deploys:** every push to `main` deploys. Work on a branch. Changing `.do/app.yaml` does nothing until it's applied with `doctl`, and applying it replaces the live spec.
- **Before finishing:** run `npm run lint:content` and `npm run build`.
- **Mantine 9 API notes:** `Grid` uses `gap`, not `gutter`. Polymorphic `component` props are spread via `linkProps()` from `SmartLink.tsx`.
