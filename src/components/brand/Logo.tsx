import { PIN_PATH, PINS } from '../../lib/logo';
import classes from './Logo.module.css';

/** The Convergence mark on its own: four member pins meeting at one point. */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      className={`${classes.mark} ${className ?? ''}`}
      viewBox="0 0 64 64"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {PINS.map((pin) => (
        <path
          key={pin.rotate}
          transform={`rotate(${pin.rotate} 32 32) translate(32 29.4)`}
          fill={`var(--logo-${pin.colour})`}
          fillRule="evenodd"
          d={PIN_PATH}
        />
      ))}
    </svg>
  );
}

/**
 * Mark and wordmark. `horizontal` (header, footer) or `stacked`. Size it with
 * font-size (or `size`): the mark is 2.7em tall in the horizontal lockup.
 */
export function Logo({ layout = 'horizontal', size }: { layout?: 'horizontal' | 'stacked'; size?: number }) {
  return (
    <span className={classes.lockup} data-layout={layout} style={size ? { fontSize: size } : undefined}>
      <LogoMark />
      <span className={classes.wordmark}>
        Humanitarian
        <br />
        Data Alliance
      </span>
    </span>
  );
}
