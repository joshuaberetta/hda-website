import { contours, stackLayers, worldMap } from '../../lib/graphics';
import type { CSSProperties } from 'react';
import classes from './Graphics.module.css';

// The markup comes from src/lib/graphics.ts: generated, deterministic SVG
// (never user content), so it's safe to inject and identical on server and client.

export function WorldMap({ step, arcs, className }: { step?: number; arcs?: boolean; className?: string }) {
  const { viewBox, markup } = worldMap({ step, arcs });
  return (
    <svg
      className={`${classes.worldmap} ${className ?? ''}`}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Dotted world map with lines connecting humanitarian hubs"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

export function Contours({ seed = 7, levels = 14, className }: { seed?: number; levels?: number; className?: string }) {
  const { viewBox, markup } = contours(seed, levels);
  return (
    <svg
      className={`${classes.contours} ${className ?? ''}`}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <g fill="none" strokeLinecap="round" dangerouslySetInnerHTML={{ __html: markup }} />
    </svg>
  );
}

const ISO = (y: number) => `matrix(0.866 0.5 -0.866 0.5 0 ${y})`;

/**
 * Four GIS layers in isometric view: terrain (0), open map data (1), field
 * data (2) and analysis (3). Layers listed in `off` lift away.
 */
export function LayerStack({ off = [], gap = 44, label }: { off?: number[]; gap?: number; label: string }) {
  const layers = stackLayers();
  const height = 3 * gap + 120;
  return (
    <svg className={classes.stack} viewBox={`4 -4 182 ${height}`} role="img" aria-label={label}>
      <defs>
        <clipPath id="hda-stack-clip">
          <rect width="100" height="100" rx="3" />
        </clipPath>
      </defs>
      {layers.map((content, k) => (
        <g key={k} className={classes.layer} data-layer={k} data-off={off.includes(k) || undefined} style={{ '--k': k } as CSSProperties}>
          <g transform={`translate(95 0) ${ISO(10 + (3 - k) * gap)}`}>
            <rect className={classes.plane} width="100" height="100" rx="3" />
            <g clipPath="url(#hda-stack-clip)" dangerouslySetInnerHTML={{ __html: content }} />
            <rect className={classes.edge} width="100" height="100" rx="3" fill="none" />
          </g>
        </g>
      ))}
    </svg>
  );
}

/** A small stack of four layers with the first `n` switched on (lifecycle steps). */
export function MiniStack({ n }: { n: number }) {
  return (
    <svg className={classes.ministack} viewBox="0 0 64 58" aria-hidden>
      {[0, 1, 2, 3].map((k) => {
        const dy = (3 - k) * 7;
        const state = k < n ? (k === n - 1 ? 'top' : 'on') : 'off';
        return <path key={k} data-state={state} d={`M32 ${8 + dy} L57 ${20.5 + dy} L32 ${33 + dy} L7 ${20.5 + dy} Z`} />;
      })}
    </svg>
  );
}
