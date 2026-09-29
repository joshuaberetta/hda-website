# Humanitarian Data Alliance: design options

A static review site for the HDA website and brand exploration: four website themes, five logo concepts, and a style guide and colour palette for each theme. It is intended for **hda.kobolabs.dev**.

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
| `site/themes/<id>/index.html` | Home page in each theme: `confluence` (A), `fieldwork` (B), `signal` (C), `commons` (D) |
| `site/themes/<id>/style-guide.html` | Style guide for that theme: logo usage, colour and contrast, type, components, graphics, voice |
| `site/logos/index.html` | All five logo concepts with rationale, variants, theme colourways, co-branding and SVG download |
| `site/palettes/index.html` | Member colours as observed, where they overlap, and every theme palette with WCAG contrast |

### Review bar

Every theme page has a small toolbar that switches **theme (A–D)**, **page (Home / Style guide)** and **logo (1–5)**.

- The logo choice is remembered across pages.
- Share a combination with `?logo=<id>`, e.g. `themes/fieldwork/index.html?logo=tiles`.
- `?logo=default` resets to the theme's paired logo.
- `?clean` starts with the bar collapsed; `?shot` hides it completely.

### How it's built

- **Tokens:** `themes/<id>/tokens.css` defines colours, fonts and radius as CSS custom properties scoped to `[data-theme="<id>"]`. `.inverse` holds the dark-section overrides.
- **Theme styles:** `themes/<id>/theme.css` contains the page layout and components. Every theme implements the same component classes (`.btn`, `.tag`, `.card`, `.input`, `.link-arrow`, `.eyebrow`), so the shared style-guide template works for all of them.
- **Logos:** `assets/logos.js` draws each logo as inline SVG coloured by `--logo-a` to `--logo-d`, `--logo-ink` and `--logo-bg`. Any logo therefore works in any theme. Add `data-hda-logo="horizontal|stacked|mark"` to an element to render one.
- **Graphics:** `assets/graphics.js` generates the dot world map and the contour textures procedurally (`data-graphic="worldmap|contours"`). There are no image assets apart from the hub thumbnails.
- **Theme metadata:** `assets/themes.js` holds names, rationale and swatch lists for the hub, palettes page and style guides.

### Regenerating hub thumbnails

With the local server running (needs Google Chrome):

```sh
for id in confluence fieldwork signal commons; do
  scripts/shot.sh "themes/$id/index.html?shot&logo=default" /tmp/$id.png 1440 900
  sips -Z 960 -s format jpeg -s formatOptions 78 /tmp/$id.png --out site/assets/thumbs/$id.jpg
done
```

## Deploying to DigitalOcean (not done yet)

For when a direction is agreed. Use App Platform with a **Static Site** component:

- Source: this repo (after it's pushed to GitHub).
- Build command: none.
- Output directory: `site`.
- Custom domain: `hda.kobolabs.dev`, added as a CNAME to the app's `ondigitalocean.app` hostname in the kobolabs.dev DNS.

Pages carry `<meta name="robots" content="noindex">`. Keep that while the site is a review site.

## Content notes

- Copy is drawn from the MoU values and the working-group notes in `docs/`.
- Statistics come from member websites and are marked **TBC**. The same goes for event dates (HILA webinar in Nov 2026, HNPW 2027).
- Member organisations appear as text names. Official member logos should be swapped in once approved.
- Member colours on the palettes page were sampled from screenshots, except Kobo's, which come from its site's `colors.scss`. They are not official brand specifications.
