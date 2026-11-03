# Design system

The HDA website uses **Theme G, Unified**, from the design review (`public/designs/themes/unified/`), with **logo 1, Convergence**. Unified was merged from the team's round-one votes. It takes Confluence's structure, navy, red and type, Fieldwork's warm paper and pastel member colours, and Atlas's layer stack and mono data labels.

The page structure (bands, panels, cards, headings, link behaviour) follows kobo.ngo's design system (`../kobo.ngo/DESIGN.md`), so the two sites are built the same way.

- **Tokens** live in [`src/theme/theme.ts`](src/theme/theme.ts) (Mantine theme and `--hda-*` variables) and [`src/theme/global.css`](src/theme/global.css) (dark bands, member colours).
- **Shared primitives** live in [`Typography.tsx`](src/components/Typography.tsx), [`SmartLink.tsx`](src/components/SmartLink.tsx), [`SectionShell.tsx`](src/components/sections/SectionShell.tsx) and [`CheckList.tsx`](src/components/CheckList.tsx).
- **Brand components** live in [`src/components/brand/`](src/components/brand/): the logo and the procedural graphics. They're ported from the review site's `assets/logos.js` and `assets/graphics.js`, with the same geometry.

## Principles

1. **Unified's palette only.** Use theme colours (`red.6`, `var(--mantine-color-navy-8)`) or `var(--hda-*)`, never hex values in components. The exceptions are the graphics' own line colours in `Graphics.module.css`.
2. **Red is for action.** Response Red is the filled button, the arrow link, the eyebrow dot and the highlighted words in the hero. Don't use it for decoration.
3. **Plus Jakarta for voice, Inter for reading, Plex Mono for data.** Headings use Plus Jakarta Sans 750 with tight tracking. Body text uses Inter. Eyebrows, kickers, layer IDs, coordinates, tags and footer labels use IBM Plex Mono in uppercase.
4. **Flat tiles, not cards.** Content sits on borderless tiles with a flat fill: a member's pastel tint where the tile belongs to a member, otherwise `--tile-bg`. That's stone on paper bands, white on stone and mist, and lighter navy on dark. No borders, no shadows, no coloured top rules. Shadows are only for floating UI: the hero's map labels, dropdowns and the header once the page scrolls.
5. **AA everywhere.** Text meets WCAG AA (4.5:1, or 3:1 for large text). See [Contrast](#contrast-checked).
6. **Graphics are generated.** Maps, contours and stacks are seeded SVG, the same on every load and on the server. Placeholders use them until photos arrive. Photos are welcome and wanted (round-one feedback asked for more).

## Colour

| Scale | Key shades | Use |
|---|---|---|
| `navy` | `8` #0E2A47 Alliance Navy, `9` #0A2038, `0` #EAF2FA Mist | Headings, dark bands, footer (`9`), mist bands (`0`) |
| `red` | `6` #C8363B Response Red, `7` #A92C31, `8` #9E2A2E, `1` #F8E4E1 | Buttons and arrow links (`6`, hover `7`). Text on the red tint (`8`). iMMAP's tint (`1`) |
| `blue` | `7` #186CB6 Data Blue, `5` #2B8FE0, `3` #6CB6F5, `8` #1A4F86, `1` #E3ECF5 | Eyebrows, links, focus (`7`). On dark bands (`3`). Logo pin (`5`). Kobo's tint (`1`) |
| `teal` | `7` #22857A, `5` #2A9D8F, `8` #17665D, `1` #E0EFEC | Data points (`7`). Logo pin (`5`). CartONG's tint (`1`) |
| `ochre` | `7` #B97D16, `8` #8A5C0E, `1` #F6EBD6 | Decorative only at `7`. Text and the TBC marker at `8`. HOT's tint (`1`) |
| `gray` | `0` #FDFBF7 Paper, `1` #F4F0E7 Stone, `2` #E0DCD2 Line, `7` #3F5064 Ink 2 | Page and band backgrounds, rules, body text |

**Member colours.** Anything with `data-colour="red|teal|ochre|blue"` gets `--member-tint` (panels), `--member-dot` (decoration) and `--member-strong` (text on the tint). The assignment is iMMAP red, CartONG teal, HOT ochre and Kobo blue. It's set in each member's content file.

**Logo colours.** `--logo-a…d` are the four pins, `--logo-ink` is the wordmark and `--logo-bg` is the knock-out. `.hda-dark` switches them for navy backgrounds.

### Bands

| `background` | Colour | Use |
|---|---|---|
| `paper` (default) | gray.0 | Most sections |
| `stone` | gray.1 | The hero, the quote, the services stack. Contour textures sit on stone |
| `mist` | navy.0 | Callouts (HILA) |
| `dark` | navy.8 | The lifecycle and the contact form. Text, links and the logo flip |

Two bands of the same colour in a row merge: the second loses its top padding.

### Contrast (checked)

| Pair | Ratio |
|---|---|
| Ink 2 body on paper / stone / white | 8.0 / 7.3 / 8.3 |
| Navy headings on paper | 14.1 |
| White on red.6 button / red.7 hover | 5.2 / 6.8 |
| red.6 arrow link on paper / stone / mist | 5.0 / 4.6 / 4.6 |
| blue.7 eyebrow on paper / stone / mist / blue tint | 5.3 / 4.8 / 4.8 / 4.6 |
| blue.3 and #C3D0DF on navy.8 | 6.7 / 9.3 |
| #C3D0DF footer text on navy.9 | 10.5 |
| ochre.8 TBC marker on paper | 5.6 |
| Ink 2 on each member tint | 6.8–7.0 |
| Strong shade on its own tint: red / teal / ochre / blue | 6.1 / 5.7 / 4.9 / 7.0 |

## Typography

| Role | Font | Size / weight |
|---|---|---|
| h1 | Plus Jakarta Sans | 2.3–3.3rem fluid / 750 / 1.12, −0.02em |
| h2 | Plus Jakarta Sans | 1.8–2.5rem fluid / 750 / 1.12 |
| Card title (`CardTitle`) | Plus Jakarta Sans | 19px (22px `lg`) / 750 |
| Body | Inter | 16.5px / 400 / 1.65, Ink 2 |
| Section intro, hero lead | Inter | 18px |
| Eyebrow (`Eyebrow`) | IBM Plex Mono | 12px / 500 / uppercase / 0.1em, blue.7, red dot |
| Kicker (`Kicker`) | IBM Plex Mono | 11px / 500 / uppercase / 0.07em, Ink 2 |
| Stat figure | Plus Jakarta Sans | 38px / 800 |
| Nav item | Inter | 15px / 500, navy |

## Layout

- **Container:** 1200px for content, 1280px for the header and footer. Long text is 860px.
- **Band padding:** 64–104px (fluid).
- **Header:** 76px (60px below `md`), sticky, paper at 92% with a blur. A soft shadow fades in on scroll. The current and hovered nav items get a 3px red bar on the header's bottom edge, the same pattern as kobo.ngo's teal bar.
- **Radius:** `md` 10px for inputs, `lg` 12px for cards, `xl` 32px for panels (member panels, service areas). Buttons and tags are pills.
- **Section headings** (`SectionHeading`): eyebrow, h2, then an 18px intro. 720px wide and left-aligned, as in Unified. They can be centred.

### Patterns

| You want to… | Use |
|---|---|
| Open the home page | `hero` |
| Open a detail page | `hero` in the page's front matter (stone band with contours) |
| Show each member's work | `examples` |
| Introduce the members | `members` (`grid` on home, `detail` on the members page) |
| Show the services as one picture | `layers` |
| Group several items under a theme | `services` (tinted panels with white rows), or a member panel |
| Text beside a photo or graphic | `split` |
| Close a page with two next steps | `cta` (mist and stone cards) |
| Ask for contact | `contact` (dark band) |

## Components

- **Buttons** (`LinkButton`): `filled` is a red pill with →. `outline` is a 1.5px navy outline that fills navy on hover (white on dark bands). Off-site links show ↗.
- **Arrow link** (`ArrowLink`): 14px / 600, red. The arrow slides 6px on hover.
- **Tiles:** borderless, no shadow, 12px radius, 24px padding, filled with `--member-tint` or `--tile-bg` (set by `SectionShell`). Photo and texture areas sit flush at the top. Interactive tiles (the services layers) underline their title on hover.
- **Tags:** mono pills in the item's tint with a dot (`NewsSection`).
- **Checklists** (`CheckList`): a plain tick per line in `--check-color`.
- **TBC marker** (`Tbc`): a dashed ochre pill. Use it for anything waiting on the team.

## Motion

- Hovers take 0.15–0.25s, and arrows slide 6px.
- Stack layers lift on hover and fly off when switched off (0.45s).
- The map's arcs animate.
- `prefers-reduced-motion` turns all of this off (`global.css`).

## Deviations

| Unified (review site) | Here | Why |
|---|---|---|
| Data Blue #1A72BF | #186CB6 | 12px eyebrows were 4.4:1 on stone and mist; now 4.8:1 |
| White cards with a hairline border and soft shadow | Flat tiles (kobo.ngo's pattern) | Calmer, and less templated |
| Stat cards with bars of arbitrary length | Plain member-tint tiles | The bars implied a comparison between figures that measure different things |
| Logo 8, Convergence II, paired with Unified | Logo 1, Convergence | The team's choice for the build |
| Members-strip dot for HOT in navy | Ochre, HOT's member colour | One colour per member everywhere |

## Adding or changing styles

- Put styles in a CSS module next to the component. Reference tokens as `var(--mantine-color-*)`, `var(--mantine-spacing-*)`, `var(--mantine-radius-*)` or `var(--hda-*)`.
- Mantine components set some colours inline (`Anchor`'s `c`). To colour them from a CSS module, pass `c="var(--my-var)"` and set `--my-var` in the module, as `ArrowLink` and the footer do.
- Check any new text/background pair against AA, and add it to the contrast table.
- Code must be SSR-safe: anything that reads `window` goes in an effect.
