# Humanitarian Data Alliance: design options

A static review site for the HDA website and brand exploration: seven website themes (six from round one plus a merged Theme G), ten logo concepts, and a style guide and colour palette for each theme. It is live at **https://hda.kobolabs.dev**.

No build step and no dependencies. Plain HTML, CSS and JS in `site/`.

## Preview locally

```sh
cd site
python3 -m http.server 8787
# open http://localhost:8787
```

Any static server works. Pages use relative paths, so the site can also be hosted from a sub-path.

## What's in it

| Path | What |
|---|---|
| `site/index.html` | Review hub: brief, how to review, theme cards, logo overview, design principles |
| `site/themes/<id>/index.html` | Home page in each theme: `confluence` (A), `fieldwork` (B), `signal` (C), `commons` (D), `relief` (E), `atlas` (F), and the round-two merge `unified` (G) |
| `site/themes/<id>/style-guide.html` | Style guide for that theme: logo usage, colour and contrast, type, components, graphics, voice |
| `site/themes/<id>/collateral.html` | Collateral in that theme: DL tri-fold brochure (outside and inside) and A5 flyer, a 12-layout slide template in a carousel, three roll-up banners, a backdrop wall, a table front and a to-scale booth view, plus a name badge, social posts and an email signature |
| `site/logos/index.html` | All ten logo concepts with rationale, variants, theme colourways, co-branding and SVG download |
| `site/logos/contour-studio.html` | Contour studio: reshape logo 3 (rings, terrain, summit, line, colour, wordmark), preview it everywhere, apply it site-wide, share or download it |
| `site/palettes/index.html` | Member colours as observed, where they overlap, and every theme palette with WCAG contrast |
| `site/results/index.html` | Organisers only (not linked from the hub): paste the review doc to tally everyone's top three picks |

### Review bar

Every theme page has a small toolbar that switches **theme (A–G)**, **page (Home / Style guide / Collateral)** and **logo (1–10)**.

- The logo choice is remembered across pages.
- Share a combination with `?logo=<id>`, e.g. `themes/fieldwork/index.html?logo=tiles`. **Copy link** always writes the explicit logo id, and adds `&contour=<code>` (or `reset`) when the logo is Contour, so the link fully describes what the reviewer saw.
- `?logo=default` resets to the theme's paired logo.
- On collateral pages, `?slides=all` shows every slide in a grid instead of the carousel.
- `?clean` starts with the bar collapsed; `?shot` hides it completely.

### Custom contour

The Contour studio saves only the settings that differ from the original, in `localStorage` (`hda-contour`). While a custom contour is saved, logo 3 uses it on every page.

- `?contour=<code>` applies settings from a share link. The code is base64url-encoded JSON.
- `?contour=reset` goes back to the original.

### Running a review round

1. Share a Google Doc where each reviewer adds their name and organisation, then pastes their **top three** links from **Copy link**, best first:
   ```
   Name — Organisation
   1. https://hda.kobolabs.dev/themes/relief/index.html?logo=summits
   2. …
   3. …
   Comments: optional, can run over several lines
   ```
2. When voting closes, open `results/index.html` (locally is fine) and paste the doc text, or drop in *File → Download → Plain text*. Click **Load example** (or open `results/index.html?example`) to see the expected format.
3. The page turns each link back into a recipe (`{ theme, logo, page, contour? }`) and tallies themes, logos, exact combinations and theme × logo pairings. Rank 1/2/3 scores 3/2/1 by default. You can switch to 5/3/1 or to a plain count of mentions, and you can weight each organisation equally. Links it can't use, and ones it had to interpret (e.g. `logo=default` resolves to the theme's paired logo), are listed at the top.
4. **Download recipes.json** for every resolved pick plus the tallies (the input for building the unified options). **Copy summary** gives a markdown table.

Parsing rules: a line with no link starts a new reviewer (a second line straight after the name is taken as the organisation). Only the first three distinct links per reviewer count. If a name appears twice, the later entry wins. Everything runs in the browser. The pasted text is only kept in `localStorage`.

### How it's built

- **Tokens:** `themes/<id>/tokens.css` defines colours, fonts and radius as CSS custom properties scoped to `[data-theme="<id>"]`. `.inverse` holds the dark-section overrides.
- **Theme styles:** `themes/<id>/theme.css` contains the page layout and components. Every theme implements the same component classes (`.btn`, `.tag`, `.card`, `.input`, `.link-arrow`, `.eyebrow`), so the shared style-guide template works for all of them.
- **Logos:** `assets/logos.js` draws each logo as inline SVG coloured by `--logo-a` to `--logo-d`, `--logo-ink` and `--logo-bg`. Any logo therefore works in any theme. Add `data-hda-logo="horizontal|stacked|mark"` to an element to render one.
- **Graphics:** `assets/graphics.js` generates all graphics procedurally: the dot world map, contour textures, the shaded relief map, the isometric layer stack and the small lifecycle stacks (`data-graphic="worldmap|contours|relief|stack|ministack"`). Checkboxes with `data-stack-toggle="0-3"` switch stack layers on and off. There are no image assets apart from the hub thumbnails.
- **Collateral:** `assets/collateral.js` renders every collateral page from one template. A `FLAVOUR` entry per theme picks the cover style (split, full-bleed or type-led), the artwork and the background texture. `assets/collateral.css` sizes each piece at its real aspect ratio. Each piece is a size container and its type is set in container units, so the layout scales without reflowing.
- **Theme metadata:** `assets/themes.js` holds names, rationale and swatch lists for the hub, palettes page and style guides.

### Regenerating hub thumbnails

With the local server running (needs Google Chrome):

```sh
for id in confluence fieldwork signal commons relief atlas unified; do
  scripts/shot.sh "themes/$id/index.html?shot&logo=default" /tmp/$id.png 1440 900
  sips -Z 960 -s format jpeg -s formatOptions 78 /tmp/$id.png --out site/assets/thumbs/$id.jpg
done
```

## Deployment

The site is hosted on DigitalOcean App Platform as a static site (app `hda-website`, output directory `site`, no build command). The custom domain is `hda.kobolabs.dev`.

**Every push to `main` deploys automatically.**

Pages carry `<meta name="robots" content="noindex">`. Keep that while the site is a review site.

## Content notes

- Copy is drawn from the MoU values and the working-group notes in `docs/`.
- Statistics come from member websites and are marked **TBC**. The same goes for event dates (HILA webinar in Nov 2026, HNPW 2027).
- Member organisations appear as text names. Official member logos should be swapped in once approved.
- Member colours on the palettes page were sampled from screenshots, except Kobo's, which come from its site's `colors.scss`. They are not official brand specifications.
