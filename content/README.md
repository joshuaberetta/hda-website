# Content model

All the site's copy lives here. Edit a file (or use the website editor at `/admin/`, see [`../EDITING.md`](../EDITING.md)), push to `main`, and the site rebuilds. `npm run lint:content` checks everything against this model. The build runs it too, so a typo fails the build rather than breaking a page.

```
content/settings/site.yml   name, contact email, menu, footer
content/pages/<slug>.md     one file per page: home.md is /, members.md is /members
content/members/<slug>.md   one file per member (the slug is used to refer to it)
content/news/<slug>.md      news and events, shown newest first
```

Every `.md` file is YAML front matter between `---` lines. The body under the second `---` isn't used.

Files named `*.fr.md`, `*.es.md` and `*.ar.md` (and `ui.fr.yml`…) are translations. They hold only text, and the layout always comes from the English file. See [`../LOCALISATION.md`](../LOCALISATION.md).

## Placeholders

Copy that's still waiting on the team is marked, so reviewers can see it and it's easy to find later:

- `placeholder: true` on a member, an example or a `services` section;
- `tbc: true` on a news item or a `stats` section;
- `emailConfirmed: false` in `site.yml`;
- italic notes in the text (*"…still to come."*).

Search for `placeholder`, `tbc` and `TBC` before launch.

## Links

`{ label, href, variant }`.

- `href` is a page (`/members`), a section of the home page (`/#contact`), or a full URL. Full URLs open in a new tab with ↗.
- `variant` is `filled` (default, red button), `outline` (navy outline) or `arrow` (text link with →).

In the main menu (`nav` in `site.yml`), an entry can have `items` (a list of links) instead of an `href`. It then opens a dropdown of those links, like *Our work*.

## Pages

```yaml
title: Members                 # browser tab: "Members · Humanitarian Data Alliance"
description: …                 # search results and link previews
hero:                          # detail pages only; the home page uses a `hero` section
  eyebrow: Members
  title: …
  subtitle: …
sections: [ … ]
```

### Section types

Every section can have these fields:

| Field | Values |
|---|---|
| `id` | An anchor for links (`/#contact`) |
| `eyebrow`, `title` | Heading text |
| `intro` | Markdown shown under the title |
| `background` | `paper` (default), `stone`, `mist` or `dark`. Two bands of the same colour in a row merge into one |
| `align` | `left` (default) or `center` |
| `links` | Shown at the end of the section |

| `type` | Fields | Notes |
|---|---|---|
| `hero` | `title`, `highlight` (the end of the title, in red), `subtitle`, `links`, `pins` [`title`, `body`, `label`] | Home page only. Shows the world map with map-label pins |
| `examples` | `items` [`member`, `title`, `place`, `body`, `image?`, `href?`, `placeholder?`] | One piece of work per member. With no `image`, a contour texture in the member's colour shows instead |
| `members` | `variant`: `grid` (home tiles) or `detail` (members page) | Reads `content/members/` |
| `layers` | `items` [`label`, `title`, `body`, `icon`], `hint` | The interactive services stack. Four items, top layer first |
| `lifecycle` | `items` [`phase`, `title`, `body`] | Dark band. Each stage adds a layer to its mini stack |
| `commitments` | `variant`: `grid` or `detail`, `items` [`title`, `body`, `icon`, `detail?`] | `detail` is Markdown, shown on the `detail` variant |
| `quote` | `quote`, `body` | On contour paper, with the logo mark |
| `stats` | `items` [`member`, `value`, `label`], `note`, `tbc` | Any number of figures per member. They're shown side by side and never added up |
| `split` | `body` (Markdown), `image?`, `imageAlt?`, `graphic?` (`contours`, `worldmap`, `stack`), `imagePosition` (`left`, `right`) | |
| `news` | `limit` | Reads `content/news/` |
| `services` | `groups` [`title`, `icon`, `body`, `services` [`name`, `body`, `members` [slugs], `phases?`]], `placeholder?` | The service catalogue |
| `text` | `body` (Markdown) | Long text at a readable width |
| `cta` | `items` [`title`, `body`, `links`] | Two next steps side by side, to close a page |
| `contact` | `title`, `body` | The "Work with us" form. Sending opens the visitor's email app, addressed to `email` in `site.yml` |

Icons are referred to by name: `alert-triangle`, `bulb`, `chart`, `compass`, `eye`, `form`, `heart-handshake`, `link`, `map`, `pin`, `people`, `puzzle`, `scale`, `school`, `shield`, `sprout`, `stack`, `target`, `tool`, `world`. To add one, register it in `src/lib/icons.tsx`.

## Members

```yaml
name: CartONG                  # short name, used everywhere
fullName: CartONG              # shown on the members page
order: 2                       # position in every list
colour: teal                   # red, teal, ochre or blue: tints the member's tiles and tags
focus: Mapping & data          # short label on the tile
url: https://www.cartong.org
summary: …                     # one sentence for the home page tile
intro: |                       # Markdown, for the members page
  …
skills: [ …, … ]
focalPoint: { name: …, role: …, photo: /images/people/….jpg, placeholder: true }
socials:
  - { network: linkedin, href: … }   # linkedin, x, facebook, instagram, youtube, github
placeholder: true              # marks the intro as a draft
```

## News

```yaml
title: Meet us at HNPW
date: 2027-03-01               # for sorting (YYYY-MM-DD)
dateLabel: 2027                # how the date shows
tag: Event
tone: red                      # red, teal, ochre or blue
summary: …
href: …                        # optional
linkLabel: Event details       # optional
tbc: true                      # optional: marks the date as unconfirmed
```

## Changing the model

If you change the shape of the content, update all of these together:

- `src/lib/types.ts`;
- the section component, plus `src/components/sections/SectionRenderer.tsx`;
- `scripts/validate-content.mjs`;
- `public/admin/config.yml`, the website editor's fields (`lint:content` checks that it covers every field in use);
- this file.
