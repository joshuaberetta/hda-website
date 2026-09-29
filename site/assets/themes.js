/*
 * Theme metadata shared by the review hub, palettes page, style guides and
 * review toolbar. Colour values live in each theme's tokens.css; this file
 * only says which tokens to show and why.
 */
window.HDAThemes = [
  {
    id: 'confluence', letter: 'A', name: 'Confluence', defaultLogo: 'convergence',
    tagline: 'Clear, institutional and map-led. A polished take on the group’s first mock-up.',
    blend: 'Built on the navy that iMMAP, Kobo and CartONG share, with the red that iMMAP and HOT share as the call-to-action colour. Kobo blue and CartONG teal are supporting data colours. White and a warm stone keep it calm and credible for donors and UN audiences.',
    fonts: { head: 'Plus Jakarta Sans', body: 'Inter' },
    bestFor: 'Donor and coordination audiences who need to understand the alliance quickly.',
    swatches: [
      ['--c-primary', 'Alliance Navy', 'Headings, navigation, dark sections'],
      ['--c-accent', 'Response Red', 'Primary actions, highlights (used sparingly)'],
      ['--c-accent-2', 'Data Blue', 'Links, data points, charts'],
      ['--c-accent-3', 'Field Teal', 'Secondary data colour, success states'],
      ['--c-surface', 'Stone', 'Section backgrounds'],
      ['--c-surface-2', 'Mist', 'Cards, info panels'],
      ['--c-ink-2', 'Slate', 'Body copy, secondary text'],
      ['--c-line', 'Rule', 'Borders and dividers'],
    ],
  },
  {
    id: 'fieldwork', letter: 'B', name: 'Fieldwork', defaultLogo: 'contour',
    tagline: 'Warm, human and grounded. Paper, contour lines and earthy tones.',
    blend: 'Takes CartONG’s cream paper and deep slate-teal, Kobo’s Lora serif headings and a terracotta that softens the iMMAP and HOT reds. Olive and ochre come from CartONG’s pastel system. It feels closest to “people before data”.',
    fonts: { head: 'Lora', body: 'Inter' },
    bestFor: 'Community-facing and field audiences; storytelling-led communications.',
    swatches: [
      ['--c-primary', 'Deep Teal', 'Headings, primary buttons, footer'],
      ['--c-accent', 'Terracotta', 'Highlights, calls to action'],
      ['--c-accent-2', 'Olive', 'Tags, illustrations, secondary accents'],
      ['--c-accent-3', 'Ochre', 'Markers, small highlights'],
      ['--c-accent-4', 'River Blue', 'Links, data points'],
      ['--c-bg', 'Paper', 'Page background'],
      ['--c-surface', 'Sand', 'Section backgrounds'],
      ['--c-surface-2', 'Sage', 'Cards, callouts'],
    ],
  },
  {
    id: 'signal', letter: 'C', name: 'Signal', defaultLogo: 'layers',
    tagline: 'Technical, data-forward and precise. Dark map-room hero, grids and coordinates.',
    blend: 'Starts from iMMAP’s deep navy and HOT’s dark photo overlays, lifted with brighter “signal” versions of each member colour: coral red (iMMAP and HOT), sky blue (Kobo), mint teal (CartONG). Barlow comes from iMMAP and a monospace font adds the GIS touch.',
    fonts: { head: 'Barlow Semi Condensed', body: 'Barlow', mono: 'IBM Plex Mono' },
    bestFor: 'Technical partners, IM and GIS working groups, product and data audiences.',
    swatches: [
      ['--c-night', 'Map Room', 'Hero, dark sections, footer'],
      ['--c-primary', 'Signal Blue', 'Primary actions, links'],
      ['--c-accent', 'Coral', 'Alerts, highlights, key figures'],
      ['--c-accent-3', 'Mint', 'Data series, positive states'],
      ['--c-accent-4', 'Amber', 'Data series, warnings'],
      ['--c-bg', 'Grid Paper', 'Light section background'],
      ['--c-ink', 'Ink', 'Text on light'],
      ['--c-line', 'Gridline', 'Borders, grids'],
    ],
  },
  {
    id: 'commons', letter: 'D', name: 'Commons', defaultLogo: 'monogram',
    tagline: 'Editorial, confident and minimal. Big type, strong rules and one shared red.',
    blend: 'Mostly black and white, with a single red (the colour iMMAP and HOT both own) doing all the work, and Kobo blue as the only other accent. Archivo comes from HOT. Because it’s so restrained, member logos can sit alongside it without clashing, which suits a “strong project name, existing brands” strategy.',
    fonts: { head: 'Archivo', body: 'Archivo' },
    bestFor: 'Launch moments, reports and events. Lets member brands lead.',
    swatches: [
      ['--c-ink', 'Ink', 'Type, rules, primary buttons'],
      ['--c-accent', 'Alliance Red', 'The one accent: highlights, CTAs, key numbers'],
      ['--c-accent-2', 'Link Blue', 'Links, interactive states'],
      ['--c-accent-3', 'Teal', 'Occasional data colour'],
      ['--c-bg', 'White', 'Page background'],
      ['--c-surface', 'Newsprint', 'Section backgrounds'],
      ['--c-ink-2', 'Graphite', 'Secondary text'],
      ['--c-line-soft', 'Hairline', 'Subtle dividers'],
    ],
  },
];
