# Plan: rank-by-link reviews and local recipe analysis

Status: draft, not started. Wait until the theme work in progress (atlas, relief, contour studio) has landed, because step 1 touches `assets/review.js`.

## How it works

1. A reviewer sets up a combination on any theme page and clicks **Copy link** on the review bar.
2. In a shared Google Doc, they paste their **top three links in order** under their name.
3. Afterwards, the whole doc is pasted into a local **analysis page**. It pulls out every link, resolves each one to a recipe, and tallies the results.

No backend, no accounts, no new hosting. The link *is* the recipe.

## 1. Make the copied link a complete recipe

Today **Copy link** clears the query string and writes only `?logo=<chosen or "default">`. That has two problems:
- `logo=default` means different things depending on the theme, and would change meaning if a theme's default logo changed.
- Custom contour settings (from the contour studio) are dropped.

Change the copy handler in `assets/review.js` so the link always carries:

```
themes/<theme>/<page>.html?logo=<explicit id>[&contour=<code>]
```

- `<theme>` and `<page>` come from the path, as now.
- `logo`: always the **effective** id (`effective()`), never `default`.
- `contour`: added only when the effective logo is `contour` and `HDALogos.contour.isCustom()`. The value is `HDALogos.contour.encode(HDALogos.contour.diff(HDALogos.contour.get()))`. `logos.js` already applies `?contour=` on load, so these links open correctly with no other change.
- Optionally add `v=1` so the parser can handle any later format changes.

Opening the link still sets the reviewer's localStorage logo choice, as it does now. That's the existing behaviour and it's fine.

If palette/type mixing is added later, it's just more params (`&palette=relief&type=fieldwork`) on the same link. The parser below ignores unknown params, so nothing else changes.

### Hub instructions
In the "How to review" section of `site/index.html`, add three short lines: pick your favourites, click **Copy link** on each, and paste your top three in order into the doc (link to the doc).

## 2. Google Doc format

Suggested template, so parsing stays forgiving:

```
Name — Organisation
1. https://hda.kobolabs.dev/themes/relief/index.html?logo=summits
2. https://hda.kobolabs.dev/themes/fieldwork/index.html?logo=contour&contour=eyJyaW5ncyI6Nn0
3. https://hda.kobolabs.dev/themes/confluence/style-guide.html?logo=convergence
Comments: (optional)
```

- Any line with no link starts a new reviewer block (the first such line is taken as the name), except lines starting with `Comments:`.
- The order of the links in a block is the rank, whatever numbering the reviewer typed.
- Any host works (localhost, the DO hostname, the custom domain). Only the path and query are read.
- Blocks with more than 3 links: take the first 3 and flag them. Duplicate links in one block: count once and flag.

Export: *File → Download → Plain text (.txt)*, or just select all and copy.

## 3. Local analysis page `site/results/index.html`

A plain HTML page that uses the site's own `themes.js` and `logos.js`, so it can show real names, thumbnails and live logo renders. It is not linked from the hub and has `noindex`.

**Input:** a textarea (paste the doc) or a `.txt` file drop. Everything runs in the browser, and nothing is uploaded.

**Resolve each link to a recipe:**
```json
{ "theme": "fieldwork", "page": "home", "logo": "contour",
  "contour": { "rings": 6 }, "rank": 2, "reviewer": "Name", "org": "Organisation" }
```
- `theme` comes from `/themes/<id>/`, and `logo` from `?logo=`. Older links with `logo=default` or no `logo` resolve to that theme's `defaultLogo` from `themes.js`, and are flagged "resolved from default".
- `contour` is `HDALogos.contour.decode(code)`, which fills in the defaults when displayed.
- `page` (home vs style guide) is recorded but not scored.
- Unknown theme/logo ids, malformed contour codes and non-site links show up in a **Problems** list with the reviewer and the raw line, so they can be chased up.

**Tallies** (rank 1 = 3 pts, 2 = 2 pts, 3 = 1 pt):
- **Themes**: points, number of first choices, number of reviewers who picked it at all.
- **Logos**: the same.
- **Combinations**: identical theme + logo (+ contour) recipes grouped, so you can see where people independently chose the same thing.
- **Theme × logo matrix**: shows which logos people pair with which themes.
- **Contour variants**: if several people customised the contour logo, list their settings side by side with live renders.
- **By organisation**: toggle between "one person, one vote" and "each org's points averaged", so an org with many reviewers doesn't dominate.
- Comments grouped by reviewer.

**Output:**
- Each row links back to its recipe URL, so any option opens in one click.
- **Download JSON**: all resolved recipes plus the tallies (`recipes.json`). This is the input for building the unified options, whether by hand or by asking an agent to "build a theme from the top recipes".
- **Copy summary**: a short markdown table for pasting back into the doc or an email.

## 4. Build order

1. Copy-link fix in `review.js`: explicit logo + contour code. *(~30 min; wait for the other agent.)*
2. Hub "How to review" copy + doc template. *(~15 min)*
3. `site/results/index.html`: parser, resolver, problems list. *(~2 hours)*
4. Tallies, org weighting, downloads. *(~2 hours)*
5. README: "Running a review round".

Test by pasting a doc that mixes good links, a `logo=default` link, an old link without contour, a broken contour code and a non-site URL.

## Files

- Modified: `site/assets/review.js`, `site/index.html`, `README.md`.
- New: `site/results/index.html` (and `site/assets/results.css` if the styles don't fit in the page).

## Open questions

- Should home vs style guide count at all, or is the theme all that matters? The plan assumes it doesn't count.
- Should a pick in any theme using a given logo also count as a vote for that logo? The plan assumes yes, so logos get their own ranking out of the same three links.
- Is 3/2/1 scoring right, or should first choices weigh more (e.g. 5/3/1)? Make it a setting on the page.
