# Localisation: French, Spanish and Arabic

The site is published in English (`/members`), French (`/fr/members`), Spanish (`/es/members`) and Arabic (`/ar/members`, right-to-left). These are the languages the members offered to cover in the content feedback: French and Spanish at CartONG, Arabic at iMMAP. English is the source of truth. Translations start as machine drafts and are reviewed by people.

It works the same way as kobo.ngo (`../kobo.ngo/docs/LOCALISATION.md`), and the code was ported from there.

## How it fits together

```
content/pages/home.md          English: text, layout, links, images
content/pages/home.fr.md       French text only, plus a `translation:` status block
content/pages/home.es.md
content/pages/home.ar.md
content/settings/ui.yml        interface text (buttons, labels, messages), + ui.fr.yml…
content/settings/site.yml      menu and footer labels are translated in site.fr.yml…
content/settings/translation.yml   style guide and glossary for the translation bot
```

- **Layout always comes from English.** A translation file only supplies text. Section types, links, images, the order of things: all of it is read from the English file, so a translation can't break a page.
  - The fields that count as text are listed in [`src/lib/i18n.json`](src/lib/i18n.json).
  - The site ([`src/lib/content.ts`](src/lib/content.ts)) and the tools ([`scripts/i18n.mjs`](scripts/i18n.mjs)) both read that file.
- **English shows wherever a translation is missing or out of line.**
  - If a section is added to the English page, that section shows in English on the translated page until it's retranslated.
  - A page with no translation at all shows in English, with a note, and tells search engines that the English page is the original.
- **URLs stay in English.** `/fr/what-we-do` is the French version of `/what-we-do`, so links in content (`/members`, `/#contact`) work in every language without changes.
- **Interface text** (the "Work with us" form labels, "Read more", aria labels, placeholder markers) lives in `content/settings/ui.yml`, not in components. Read it with `useT()`. Read content with `useContent()`, never from a module-level import, so it's in the visitor's language.

### Translation status

Each translation has a block at the top:

```yaml
translation:
  status: machine        # machine | reviewed | outdated | retranslate
  source: d92aaa5dc30a   # fingerprint of the English text it was made from
  model: claude-opus-5-5
  updated: 2026-11-03
```

| status | meaning | what the bot does when the English changes |
|---|---|---|
| `machine` | an unchecked machine translation. Pages show a "translated automatically" note. | retranslates it |
| `reviewed` | a person has checked it | never overwrites it; marks it `outdated` |
| `outdated` | reviewed, but the English has changed since | nothing; a person updates it, then sets `reviewed` |
| `retranslate` | someone asked for a fresh machine translation | retranslates it on the next push |

When a person edits a translation on GitHub, the bot marks it `reviewed` and records that it matches the current English.

## Reviewing a translation

1. Open the file, e.g. `content/pages/home.fr.md`.
2. Fix the text. Only change text: the layout comes from `home.md`.
3. Set `status: reviewed`, then commit. (If you forget, the bot does it for you on the next push.)

The style guide and glossary are in `content/settings/translation.yml`. Add a term there when reviewers agree on a translation (for example, how to render "information management"), so the bot uses it from then on.

## The translation bot

[`.github/workflows/translate.yml`](.github/workflows/translate.yml) runs after every push that changes `content/`. It calls Claude through the Anthropic API, using [`scripts/translate.mjs`](scripts/translate.mjs), and commits the result, which redeploys the site:

- missing translations, and `retranslate` requests, are translated;
- `machine` translations whose English changed are retranslated, reusing the previous wording where the English still says the same thing;
- `reviewed` translations whose English changed are marked `outdated`;
- translations a person just edited are marked `reviewed`.

It sends only the text (as a list of strings) and writes the answers back into place, so the layout can't drift.

**Setup (once):** add an `ANTHROPIC_API_KEY` repository secret (*Settings → Secrets and variables → Actions*). Without it, the workflow does nothing. The first drafts in the repo were made without the bot, following the same style guide, and are marked `machine` like any bot draft.

### Commands

```sh
npm run translate -- status            # every translation and whether it's current
npm run translate -- check             # layout drift, text still in English
npm run translate                      # translate what's missing or out of date (needs ANTHROPIC_API_KEY)
npm run translate -- --locale fr --only pages/home.md --force
npm run translate -- scaffold          # create missing files with English text, for hand translation
npm run translate -- stamp content/pages/home.fr.md   # "this matches today's English"
npm run lint:content                   # also checks translations
```

## Arabic and right-to-left

- `/ar/…` pages render with `<html lang="ar" dir="rtl">`, and Mantine's `DirectionProvider` mirrors its components.
- CSS uses logical properties (`padding-inline-start`, `inset-inline-end`, `border-inline-start`), so layouts mirror automatically. Use them in new CSS, not `left`/`right`.
- Arrows that point "forward" get the `rtl-flip` class, or are flipped in `SmartLink.module.css`. The hero and page-hero contour fades, the hero map's origin and the lifecycle line have `[dir='rtl']` overrides.
- Noto Kufi Arabic (headings) and Noto Sans Arabic (text and mono labels) supply the Arabic glyphs that Plus Jakarta Sans, Inter and IBM Plex Mono lack. They only download on pages with Arabic text.
- Letter-spacing is turned off in Arabic, because it breaks joined letters.
- Digits stay Western, matching the figures in content.

## Language menu and suggestion

- **The menu** (globe icon in the header) switches to the same page in another language. That's a full page load, since each language has its own prerendered HTML, and it remembers the choice (`localStorage`, key `hda-language`).
- **The suggestion bar:** on English pages, a visitor whose browser prefers French, Spanish or Arabic, and who hasn't chosen yet, sees a bar in that language offering the same page there. That language's text only downloads when the bar is shown. Choosing either option hides the bar from then on. Visitors are never redirected.

## SEO

- Every page is prerendered in every language.
- Each page lists its translations with `hreflang` links (plus `x-default` for English), and the sitemap includes every translated URL.
- Pages that aren't translated yet point their canonical URL at the English page.
- There's one 404 page, in English.

## Before launch

- [ ] Native-speaker review of every page, at least home and commitments: CartONG for French and Spanish, iMMAP for Arabic. Set each file to `reviewed`.
- [ ] Agree terminology in `translation.yml`, including whether the alliance's name stays in English (the current rule, because the logo's wordmark is English).
- [ ] Add the `ANTHROPIC_API_KEY` secret so the bot keeps translations in step.
- [ ] Visual check of every page in Arabic (right-to-left).
