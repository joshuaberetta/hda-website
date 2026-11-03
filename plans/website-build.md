# Plan: build the HDA website

Status: steps 1–6 built on branch `website-build` (3 Nov 2026), not yet merged or deployed. See *Progress* at the end.

## Decisions so far

| | Choice |
|---|---|
| Design | **Theme G, Unified** (`site/themes/unified/`), with its paper/stone surfaces, pastel member tints, mono data labels, contour textures and the layer stack |
| Logo | **Convergence (1)**, the four pins. Unified currently pairs with Convergence II, so this is a deliberate swap. It's one setting, so it's easy to change back |
| Stack | React 19, Mantine 9, React Router 8, Vite 8 and TypeScript, prerendered to static HTML. Same as `../kobo.ngo` |
| Scope | Revised home one-pager, plus `/members`, `/what-we-do` and `/commitments` detail pages |
| Content | The kobo.ngo model: copy lives in `content/*.md` (YAML front matter) and is drawn by a section renderer. English only, but structured so that Sveltia CMS and FR/ES/AR can be added later without restructuring |
| Contact form | The real form UI. On submit it opens a `mailto:` to a shared address (TBC). A form service can be swapped in later |
| Routing | `hda.kobolabs.dev/` serves the new site. The current review site moves to `/designs/` |

## 1. Repo restructure

```
hda-website/
  content/               copy (pages, members, settings)
  src/                   React app (mirrors kobo.ngo layout)
    components/{layout,sections,brand}/
    lib/                 content loader, types, icons
    theme/               theme.ts, global.css
    entry-client.tsx, entry-server.tsx, App.tsx
  public/
    designs/             ← today's site/, moved with git mv (history kept)
    images/
  scripts/
    prerender.mjs        from kobo.ngo, minus i18n
    validate-content.mjs
    shot.sh              updated to point at the Vite dev/preview server
  docs/  plans/
  DESIGN.md  AGENTS.md  CLAUDE.md  README.md
  index.html  vite.config.ts  tsconfig.json  postcss.config.cjs  package.json
```

**The review site at `/designs/`**
- `git mv site public/designs`. Vite copies `public/` to `dist/` unchanged, so the review site keeps working with no build step. It already uses relative paths only, which I've checked.
- The results parser matches `/themes/<id>/` anywhere in the path, so `/designs/themes/...` links tally correctly with no changes. I'll update the example URLs and the README to the `/designs/` paths.
- `/designs/` pages keep `noindex`.

**Old links keep working.** Reviewers have pasted links like `hda.kobolabs.dev/themes/relief/index.html?logo=summits` into the voting doc. `404.html` (the host's error document) gets a small inline script: if the path starts with `/themes/`, `/logos/`, `/palettes/`, `/results/` or `/assets/`, it redirects to the same path under `/designs/`, keeping the query string. The React `NotFound` page does the same on client-side navigation.

## 2. Design system (`DESIGN.md` + `src/theme/theme.ts`)

This follows kobo.ngo's structure and principles. The tokens come from Unified.

- **Tokens → Mantine.** Turn `unified/tokens.css` into Mantine scales: `navy` (#0E2A47), `red` (#C8363B, the call-to-action colour, used sparingly), `blue` (#1A72BF), `teal` (#22857A) and `ochre` (#B97D16). Paper (#FDFBF7), stone (#F4F0E7), mist (#EAF2FA) and the four member tints become `--hda-*` CSS variables via `cssVariablesResolver`. Components use theme colours, never hex values.
- **Type.** Plus Jakarta Sans for headings, Inter for body text and IBM Plex Mono for data labels (layer IDs, coordinates, stat sources). Self-hosted with `@fontsource`.
- **Layouts carried over from kobo.ngo:**
  - *Bands* (`SectionShell`): `paper`, `stone`, `mist`, `dark` (navy, at most one CTA band per page).
  - *Panels*: the showcase panel with accent tint, 32px radius.
  - *Cards*: flat, borderless tiles with no shadow. Accent rotates by position across the member colours.
  - `SectionHeading` (eyebrow, h2, intro), the stats row with rules, the CTA row, the arrow link, and ↗ on off-site links.
  - The header with a hover bar and a scroll shadow, and a mobile drawer.
  - Footer.
- **What Unified adds on top of kobo.ngo:**
  - contour textures behind the hero, lifecycle and quote bands;
  - the interactive **layer stack** for services;
  - mono "map label" pins on the hero map;
  - pastel member tints for member panels;
  - stat bars.
- **Brand components** (`src/components/brand/`), ported from `site/assets/`:
  - `Logo` (horizontal / stacked / mark). Convergence only, drawn as React SVG with the same `--logo-*` variables.
  - `WorldMap`, `Contours`, `LayerStack` and `MiniStack`, ported from `graphics.js` to React. They're deterministic (seeded), so they're SSR-safe. Interaction (layer toggles) is wired up in effects/state.
- **Rules as in kobo.ngo:** WCAG AA everywhere, with a contrast table in `DESIGN.md`. Logical CSS properties (ready for Arabic later). Small motion (0.2s; arrows slide 6px) that respects `prefers-reduced-motion`. SSR-safe code.

## 3. Content model

```
content/settings/site.yml     nav, footer, contact email, HILA link, member socials
content/pages/home.md         sections: [...]
content/pages/members.md
content/pages/what-we-do.md
content/pages/commitments.md
content/members/{immap,cartong,hot,kobo}.md   name, url, colour, intro, skills[], focal point {name, role, photo}, socials, example
content/news/*.md             (just the three existing items to start)
```

**Section types**, reusing kobo.ngo's shapes where they fit:

| Type | Source | Notes |
|---|---|---|
| `hero` | new | With the world map and mono label pins |
| `split` | kobo.ngo | Text with a photo or graphic |
| `stats` | kobo.ngo | With the Unified bars |
| `showcase` | kobo.ngo | |
| `cards` | kobo.ngo | |
| `cta` | kobo.ngo | |
| `members` | new | Grid or detailed variant |
| `examples` | new | One per org |
| `layers` | new | Interactive services stack |
| `lifecycle` | new | |
| `commitments` | new | |
| `quote` | new | |
| `news` | new | |
| `contact` | new | |

Changing the shape of the content means updating `types.ts`, the section component, `SectionRenderer`, `validate-content.mjs` and `docs/CONTENT_MODEL.md`. There's no CMS config yet.

## 4. Pages, and how the 27 Oct feedback (Martin) maps onto them

### `/`: home one-pager
The mock-up's order is kept, and each section links to its detail page.

1. **Hero / About.** Keep the intro and the map. Members strip.
2. **About → four examples.** A new `examples` section: one piece of work picked by each org, with a photo, place, org and one line. *Needs content from each org.* Until then I'll use clearly marked placeholders.
3. **Members.** The four tiles (as in Unified), then "Read more about our members" → `/members`.
4. **What we do.** Keep the interactive layer stack. Add "See all services" → `/what-we-do`.
5. **Lifecycle.** As in Unified.
6. **Commitments.** Rewritten from the MoU values (short form), with a link to `/commitments`.
7. **Quote.** "People will always come before data."
8. **Combined reach.** The model allows **several figures per org**, so each member can give the one or two that matter most to them. The current four stay, marked TBC, until the re-ask comes back.
9. **HILA.** A short callout band (what HILA is, plus a link). It also stays as the webinar news item. *Needs a HILA description and URL.*
10. **News & events.** HDA items only for now. A "Latest from our members" slot is designed but hidden (see phase 2).
11. **Work with us.** Keep the form: name, organisation, email, message. It opens a `mailto:` to the shared address from `site.yml`.
12. **Footer.** Remove LinkedIn and Newsletter, and add each member's social links.

### `/members`
One section per org, in a member tint:
- intro;
- a summary of skills (a checklist);
- the focal point's photo, name and role;
- website and social links.

*Needs from each org:* intro, skills list, focal point photo, name and role.

### `/what-we-do`
Built on the **Service Catalogue (June 2026 draft, Google Sheet)**:
- the layer stack as an overview;
- then services grouped by area: data collection, mapping and geospatial, IM and analysis, capacity strengthening;
- each service shows which members provide it, and at which stage of the crisis lifecycle.

*Needs:* a CSV export of the catalogue. It isn't in the repo.

### `/commitments`
The full values section from the **final MoU (28 Sept 2026)**, with the six launch commitments as the summary at the top. *Needs:* the MoU values text. Only the launch-comms version is in `docs/` today.

### `/404`
Includes the legacy-link redirect (§1).

**Photos.** The feedback asks for more photos so the site doesn't feel "standard". Every `split`, `examples`, `members` and `showcase` slot takes a photo. Until photos arrive, the procedural graphics fill in. I'll ask each org for 3–5 field photos with credits and consent.

## 5. Deployment

The DigitalOcean App Platform app `hda-website` is currently a static site with output `site` and no build command. It needs to change to:

```yaml
static_sites:
  - name: site
    environment_slug: node-js
    build_command: npm run lint:content && npm run build
    output_dir: dist
    error_document: 404.html
    envs:
      - { key: SITE_URL, value: https://hda.kobolabs.dev, scope: BUILD_TIME }
      - { key: NOINDEX,  value: "true",                   scope: BUILD_TIME }
```

- I'll add this as `.do/app.yaml` (as in kobo.ngo). **Applying it (`doctl apps update`) changes the live app, so I'll ask before doing that.** Every push to `main` deploys, so the build happens on a branch, and the spec change and the merge go out together.
- The whole site keeps `noindex` until launch.

## 6. Build order

1. Scaffold: Vite, React, Mantine and the router, prerender and the content loader (copied from kobo.ngo and trimmed). Move `site/` → `public/designs/`. Add the legacy redirect.
2. Theme and `DESIGN.md`: Unified tokens, typography, `SectionShell` / `SectionHeading` / cards / buttons, header and footer.
3. Brand components: Convergence `Logo`, then `WorldMap`, `Contours`, `LayerStack` and `MiniStack`.
4. Home page, all sections, with the current copy plus the feedback changes.
5. `/members`, `/what-we-do` and `/commitments`, with the content available now and marked placeholders for the rest.
6. Checks:
   - `lint:content` and `build`;
   - screenshots of every route at 1440 and 390 wide;
   - the AA contrast table;
   - keyboard and no-JS pass (prerendered HTML);
   - `/designs/` and old `/themes/...` links checked.
7. README, AGENTS.md / CLAUDE.md, `.do/app.yaml`. Then a PR for review before anything touches `main`.

## Content needed from the team

- [ ] Each org: one example (photo, place, one line), intro, skills list, focal point photo, name and role, social links, 3–5 photos
- [ ] Each org: the one or two "combined reach" figures that matter most to them
- [ ] Final MoU values text
- [ ] Service catalogue export (CSV)
- [ ] HILA description and URL
- [ ] Shared contact address (and later, how messages get to the four focal points)

## Phase 2 (not in this build)

- ~~**Translations**~~: done, brought forward on 3 Nov 2026 (see `LOCALISATION.md`). Machine drafts for FR/ES/AR are awaiting review: CartONG for French and Spanish, iMMAP for Arabic.
- ~~**Sveltia CMS** for editors~~: done on 3 Nov 2026, at `/admin/` (see `EDITING.md`). GitHub sign-in reuses kobo.ngo's DigitalOcean Function, once `hda.kobolabs.dev` is in its allowed domains.
- **"Latest from our members"**: pull each member's RSS/JSON feed at build time if all four have one. To check per site.
- **"They trust us"** partner logos page, a projects map (data formats differ between members), and job openings.
- **Form routing** via a form service once the address and the CC rules are agreed.

## Progress

**Done on `website-build`:**
- Scaffold: Vite, React, Mantine and the router, prerender, the content loader and `validate-content`.
- `site/` → `public/designs/`, with the legacy-link redirect. Checked: an old `/themes/relief/index.html?logo=summits` link lands on the Relief theme under `/designs/`.
- Theme and `DESIGN.md`, brand components, every section type, and the four pages.
- Checks:
  - `lint:content` and `build`;
  - screenshots at 1440 wide and at 375 (in an iframe);
  - the AA table (Data Blue darkened to #186CB6);
  - `.do/app.yaml` mirrors the live spec and validates.

**To go live**, in this order, together:
1. Merge `website-build` to `main`.
2. `doctl apps update 5796283e-d7c4-4797-8a11-2ab53ba2a9ae --spec .do/app.yaml`. The live spec still points at `source_dir: site`, which no longer exists after the merge.

**Known gaps:**
- The JS bundle is ~720 kB (~220 kB gzipped). YAML parsing and react-markdown are bundled. They could be precompiled at build time later.
- Social links for iMMAP, CartONG and HOT are their LinkedIn company pages, and still need confirming.
- The service-to-member mapping on `/what-we-do` is illustrative until the catalogue export arrives.
