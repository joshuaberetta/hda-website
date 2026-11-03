// Logo 1, Convergence: four map pins meeting at a single point. Ported from
// the review site's assets/logos.js so the mark is drawn from the same
// geometry. Each pin takes one member colour via CSS variables (--logo-a…d).

const H = 17.5;
const R = 9.6;
const TX = (R * Math.sqrt(1 - (R / H) ** 2)).toFixed(3);
const TY = (-H + (R * R) / H).toFixed(3);

/** One pin, pointing at the centre, with a round hole near its head. */
export const PIN_PATH = `M0 0 L${TX} ${TY} A${R} ${R} 0 1 0 -${TX} ${TY} Z M0 ${-H - 4.2} a4.2 4.2 0 1 0 0.001 0 Z`;

/** Rotation and colour slot for each of the four pins (viewBox 0 0 64 64). */
export const PINS = [
  { rotate: 0, colour: 'a' },
  { rotate: 90, colour: 'b' },
  { rotate: 180, colour: 'c' },
  { rotate: 270, colour: 'd' },
] as const;

/** Fallback colours when the mark is used outside the themed app (favicon). */
export const LOGO_COLOURS = { a: '#C8363B', b: '#0E2A47', c: '#2B8FE0', d: '#2A9D8F' };
