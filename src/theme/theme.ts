import {
  Anchor,
  Badge,
  Button,
  Card,
  Container,
  Input,
  Paper,
  createTheme,
  rem,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from '@mantine/core';

// The design system is documented in DESIGN.md. Values come from the review
// site's Theme G, Unified (public/designs/themes/unified/tokens.css); the token
// names are noted next to each shade.

// Alliance Navy: headings, navigation, dark bands. Shade 8 is the brand navy.
const navy: MantineColorsTuple = [
  '#eaf2fa', // --c-surface-2 "Mist": info panels
  '#d3e0ee',
  '#a9c0da',
  '#7c9dc2',
  '#557eaa',
  '#3a6591',
  '#255078',
  '#173e69', // dark-band surface 2
  '#0e2a47', // --c-primary / --c-ink
  '#0a2038', // footer
];

// Response Red: the call to action. Use it sparingly.
const red: MantineColorsTuple = [
  '#fbefee',
  '#f8e4e1', // --c-tint-a
  '#efc1bc',
  '#e5676b', // on dark bands
  '#db5458',
  '#d2444a',
  '#c8363b', // --c-accent: filled buttons
  '#a92c31', // button hover
  '#9e2a2e', // red tag text
  '#7a1f23',
];

// Data Blue: links, data points, eyebrows.
const blue: MantineColorsTuple = [
  '#f3f8fd',
  '#e3ecf5', // --c-tint-b
  '#c4daef',
  '#6cb6f5', // links and labels on dark bands
  '#4fa0e6',
  '#2b8fe0', // --logo-c
  '#2280d2',
  // --c-accent-2 (#1a72bf), darkened so 12px eyebrows keep AA on stone and
  // mist (4.8:1; the original is 4.4:1). Links, eyebrows, focus ring.
  '#186cb6',
  '#1a4f86', // blue tag text
  '#133b66',
];

// Field Teal: secondary data colour.
const teal: MantineColorsTuple = [
  '#eff7f5',
  '#e0efec', // --c-tint-c
  '#bfe0d9',
  '#8fc0b6',
  '#5baea3',
  '#2a9d8f', // --logo-d
  '#24907f',
  '#22857a', // --c-accent-3
  '#17665d', // teal tag text
  '#104a43',
];

// Ochre: fourth data colour. Decorative at shade 7 (3.4:1 on paper), so use
// shade 8 for text.
const ochre: MantineColorsTuple = [
  '#fbf5ea',
  '#f6ebd6', // --c-tint-d
  '#eed7ac',
  '#e8b44e', // on dark bands
  '#d9a23c',
  '#cc9226',
  '#c2871c',
  '#b97d16', // --c-accent-4
  '#8a5c0e',
  '#5e3f0a',
];

// Warm neutrals, from paper to ink.
const gray: MantineColorsTuple = [
  '#fdfbf7', // --c-bg "Paper"
  '#f4f0e7', // --c-surface "Stone"
  '#e0dcd2', // --c-line
  '#cfcabd',
  '#a9a497',
  '#857f72',
  '#5f6b78',
  '#3f5064', // --c-ink-2: body text
  '#2a3b4f',
  '#0e2a47',
];

/** Brand colours that aren't a single shade, as `var(--hda-*)` for CSS modules. */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    '--hda-paper': gray[0],
    '--hda-stone': gray[1],
    '--hda-mist': navy[0],
    '--hda-line': gray[2],
    '--hda-ink': navy[8],
    '--hda-ink-2': gray[7],
    '--hda-font-mono': "'IBM Plex Mono', ui-monospace, monospace",
    // Logo colours: one per member pin. Dark bands override b, ink and bg.
    '--logo-a': red[6],
    '--logo-b': navy[8],
    '--logo-c': blue[5],
    '--logo-d': teal[5],
    '--logo-ink': navy[8],
    '--logo-bg': gray[0],
  },
  light: {},
  dark: {},
});

export const theme = createTheme({
  colors: { navy, red, blue, teal, ochre, gray },
  primaryColor: 'blue',
  primaryShade: 7,
  black: navy[8],
  white: '#ffffff',
  fontFamily: "'Inter Variable', Inter, system-ui, sans-serif",
  fontFamilyMonospace: "'IBM Plex Mono', ui-monospace, monospace",
  headings: {
    fontFamily: "'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', system-ui, sans-serif",
    fontWeight: '750',
    sizes: {
      h1: { fontSize: 'clamp(2.3rem, 1.6rem + 2.6vw, 3.3rem)', lineHeight: '1.12' },
      h2: { fontSize: 'clamp(1.8rem, 1.4rem + 1.4vw, 2.5rem)', lineHeight: '1.12' },
      h3: { fontSize: rem(22), lineHeight: '1.25' },
      h4: { fontSize: rem(18), lineHeight: '1.3' },
    },
  },
  fontSizes: { xs: rem(12), sm: rem(14), md: rem(16.5), lg: rem(18), xl: rem(20) },
  lineHeights: { md: '1.65' },
  spacing: { xs: rem(10), sm: rem(12), md: rem(16), lg: rem(24), xl: rem(32) },
  defaultRadius: 'md',
  radius: { xs: rem(4), sm: rem(8), md: rem(10), lg: rem(12), xl: rem(32) },
  breakpoints: { xs: '36em', sm: '48em', md: '62em', lg: '75em', xl: '88em' },
  focusRing: 'auto',
  components: {
    // Pill buttons, as in Unified. Filled buttons are Response Red; the
    // secondary button is a navy outline.
    Button: Button.extend({
      defaultProps: { radius: 'xl', color: 'red.6' },
      styles: { root: { fontWeight: 600 } },
    }),
    Badge: Badge.extend({ defaultProps: { radius: 'xl' } }),
    Card: Card.extend({ defaultProps: { radius: 'lg', padding: 'lg' } }),
    Paper: Paper.extend({ defaultProps: { radius: 'lg' } }),
    Container: Container.extend({ defaultProps: { size: 1200 } }),
    Anchor: Anchor.extend({ defaultProps: { c: 'blue.7' } }),
    Input: Input.extend({ defaultProps: { radius: 'md' } }),
  },
});
