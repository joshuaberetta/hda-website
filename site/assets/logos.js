/*
 * HDA logo concepts.
 *
 * Every mark is drawn with CSS custom properties so it can be re-coloured by
 * whatever theme it sits in:
 *   --logo-a, --logo-b, --logo-c, --logo-d   four accent colours
 *   --logo-ink                               wordmark / primary ink
 *   --logo-bg                                background (used for knock-outs)
 */
(function () {
  const A = 'var(--logo-a, #D23B3F)';
  const B = 'var(--logo-b, #0E2A47)';
  const C = 'var(--logo-c, #1F8FE5)';
  const D = 'var(--logo-d, #2A9D8F)';
  const INK = 'var(--logo-ink, #0E2A47)';
  const BG = 'var(--logo-bg, #FFFFFF)';

  // --- 1. Convergence: four map pins meeting at a single point -------------
  function pin(rotation, colour) {
    const h = 17.5, r = 9.6;
    const tx = (r * Math.sqrt(1 - (r / h) ** 2)).toFixed(3);
    const ty = (-h + (r * r) / h).toFixed(3);
    return `<g transform="rotate(${rotation} 32 32) translate(32 29.4)">
      <path fill="${colour}" fill-rule="evenodd"
        d="M0 0 L${tx} ${ty} A${r} ${r} 0 1 0 -${tx} ${ty} Z
           M0 ${-h - 4.2} a4.2 4.2 0 1 0 0.001 0 Z"/></g>`;
  }
  const convergence = () =>
    `<svg class="hda-mark" viewBox="0 0 64 64" aria-hidden="true">
      ${pin(0, A)}${pin(90, B)}${pin(180, C)}${pin(270, D)}
    </svg>`;

  // --- 2. Layers: four stacked GIS layers ----------------------------------
  function layer(dy, colour) {
    return `<path d="M32 ${8 + dy} L57 ${20.5 + dy} L32 ${33 + dy} L7 ${20.5 + dy} Z"
      fill="${colour}" stroke="${BG}" stroke-width="2.6" stroke-linejoin="round"/>`;
  }
  const layers = () =>
    `<svg class="hda-mark" viewBox="0 0 64 64" aria-hidden="true">
      ${layer(22, D)}${layer(14.5, C)}${layer(7, B)}${layer(-0.5, A)}
    </svg>`;

  // --- 3. Contour: topographic rings rising to a single summit -------------
  function smoothClosed(points) {
    // Catmull-Rom -> cubic Bézier for a closed loop.
    const n = points.length;
    let d = `M${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
    for (let i = 0; i < n; i++) {
      const p0 = points[(i - 1 + n) % n], p1 = points[i];
      const p2 = points[(i + 1) % n], p3 = points[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
    }
    return d + 'Z';
  }
  function ring(i) {
    // Rings tighten toward a summit that sits up and to the right, like terrain.
    const R = [27, 20.5, 14.2, 8.4][i];
    const cx = [32, 34, 36.2, 38.2][i], cy = [33, 31, 29.2, 27.6][i];
    const pts = [];
    for (let k = 0; k < 40; k++) {
      const t = (k / 40) * Math.PI * 2;
      const wobble = 1 + 0.11 * Math.sin(2 * t + 0.9 + i * 0.35) + 0.07 * Math.sin(3 * t + 2.4 - i * 0.5) + 0.03 * Math.sin(5 * t + i);
      pts.push([cx + Math.cos(t) * R * wobble, cy + Math.sin(t) * R * wobble * 0.9]);
    }
    return smoothClosed(pts);
  }
  const contour = () =>
    `<svg class="hda-mark" viewBox="0 0 64 64" aria-hidden="true">
      <g fill="none" stroke-width="3" stroke-linejoin="round">
        <path d="${ring(0)}" stroke="${B}"/>
        <path d="${ring(1)}" stroke="${D}"/>
        <path d="${ring(2)}" stroke="${C}"/>
      </g>
      <circle cx="38.4" cy="27.4" r="4.4" fill="${A}"/>
    </svg>`;

  // --- 4. Tiles: four map tiles framing a shared crosshair -----------------
  const tiles = () =>
    `<svg class="hda-mark" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4"  y="4"  width="26.5" height="26.5" rx="4" fill="${A}"/>
      <rect x="33.5" y="4"  width="26.5" height="26.5" rx="4" fill="${B}"/>
      <rect x="4"  y="33.5" width="26.5" height="26.5" rx="4" fill="${D}"/>
      <rect x="33.5" y="33.5" width="26.5" height="26.5" rx="4" fill="${C}"/>
      <circle cx="32" cy="32" r="13" fill="none" stroke="${BG}" stroke-width="4.6"/>
      <circle cx="32" cy="32" r="3.6" fill="${BG}"/>
    </svg>`;

  // --- 5. Monogram: H and D share a stem; the A is a pinned apex -----------
  const monogram = () =>
    `<svg class="hda-mark hda-mark--wide" viewBox="0 0 122 64" aria-hidden="true">
      <g fill="none" stroke="${INK}" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 10 V54"/>
        <path d="M36 10 V54 M36 10 H45 A22 22 0 0 1 45 54 H36"/>
        <path d="M78 54 L95.5 10 L113 54"/>
      </g>
      <path d="M13 32 H32" stroke="${A}" stroke-width="8.5"/>
      <circle cx="95.5" cy="40" r="6" fill="${C}"/>
    </svg>`;

  const LOGOS = [
    {
      id: 'convergence', num: 1, name: 'Convergence', draw: convergence,
      wordmark: 'Humanitarian<br>Data Alliance', wm: 'wm-convergence',
      summary: 'Four map pins meet at one point.',
      rationale: 'Each member arrives from a different direction (field data, mapping, analysis, open communities) and they meet at the same place: where the need is. The pins also form a compass rose, so it reads as geospatial at a glance. It works as a favicon and doesn’t favour any one member.',
    },
    {
      id: 'layers', num: 2, name: 'Layers', draw: layers,
      wordmark: 'Humanitarian<br>Data Alliance', wm: 'wm-layers',
      summary: 'Four stacked GIS layers.',
      rationale: 'The universal GIS symbol. Four distinct layers stack into one coherent picture, which is the alliance’s pitch: interoperable services from different providers. Very legible, calm and institutional.',
    },
    {
      id: 'contour', num: 3, name: 'Contour', draw: contour,
      wordmark: 'Humanitarian<br>Data Alliance', wm: 'wm-contour',
      summary: 'Topographic rings rising to a summit.',
      rationale: 'Contour lines are the most recognisable map language there is. Rings build up to a single point (the decision, the community, the person) to echo “people will always come before data”. It’s the warmest and most organic concept.',
    },
    {
      id: 'tiles', num: 4, name: 'Tiles', draw: tiles,
      wordmark: 'Humanitarian<br>Data Alliance', wm: 'wm-tiles',
      summary: 'Four map tiles frame one shared target.',
      rationale: 'Web maps are built from tiles, and so is this alliance. Four separate tiles only reveal the crosshair when they’re placed together. Bold and modular, and it scales well to stickers, avatars and app icons.',
    },
    {
      id: 'monogram', num: 5, name: 'Monogram', draw: monogram,
      wordmark: 'Humanitarian Data Alliance', wm: 'wm-monogram',
      summary: 'A connected HDA letterform.',
      rationale: 'A refinement of the group’s first idea. The H and D share a single stem (shared infrastructure) and the H crossbar is the bridge between members. The A carries a data point instead of a crossbar. It’s typographic and quiet, and lets member brands lead.',
    },
  ];

  const byId = Object.fromEntries(LOGOS.map((l) => [l.id, l]));

  /**
   * layout: 'horizontal' | 'stacked' | 'mark'
   */
  function render(id, layout = 'horizontal') {
    const logo = byId[id] || LOGOS[0];
    if (layout === 'mark') {
      return `<span class="hda-lockup hda-lockup--mark" data-logo-id="${logo.id}">${logo.draw()}</span>`;
    }
    return `<span class="hda-lockup hda-lockup--${layout} ${logo.wm}" data-logo-id="${logo.id}">
      ${logo.draw()}<span class="hda-wordmark">${logo.wordmark}</span></span>`;
  }

  function hydrate(root = document, id) {
    root.querySelectorAll('[data-hda-logo]').forEach((el) => {
      const logoId = el.dataset.logoFixed || id || el.dataset.logoDefault || 'convergence';
      el.innerHTML = render(logoId, el.dataset.hdaLogo || 'horizontal');
      if (!el.hasAttribute('aria-label') && el.tagName === 'A') {
        el.setAttribute('aria-label', 'Humanitarian Data Alliance, home');
      }
    });
  }

  const css = `
  .hda-lockup{display:inline-flex;align-items:center;gap:.62em;color:var(--logo-ink,#0E2A47);line-height:1;vertical-align:middle;text-decoration:none}
  .hda-lockup .hda-mark{height:2.7em;width:auto;flex:none;display:block}
  .hda-lockup--mark{height:100%;width:100%;justify-content:center}.hda-lockup--mark .hda-mark{height:100%;width:auto}
  .hda-lockup--stacked{flex-direction:column;gap:.55em;text-align:center}
  .hda-lockup--stacked .hda-mark{height:4.2em}
  .hda-wordmark{display:block;white-space:nowrap}
  .wm-convergence .hda-wordmark{font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-weight:750;font-size:1.02em;letter-spacing:-.018em;line-height:1.02}
  .wm-layers .hda-wordmark{font-family:'Barlow',system-ui,sans-serif;font-weight:600;font-size:.94em;letter-spacing:.075em;text-transform:uppercase;line-height:1.1}
  .wm-contour .hda-wordmark{font-family:'Lora',Georgia,serif;font-weight:600;font-size:1.08em;letter-spacing:-.005em;line-height:1.02}
  .wm-tiles .hda-wordmark{font-family:'Archivo',system-ui,sans-serif;font-weight:800;font-size:1.02em;letter-spacing:-.02em;line-height:1}
  .wm-monogram{gap:.8em}
  .wm-monogram .hda-mark{height:2.2em}
  .wm-monogram .hda-wordmark{font-family:'Inter',system-ui,sans-serif;font-weight:600;font-size:.62em;letter-spacing:.16em;text-transform:uppercase;padding-left:.9em;border-left:1.5px solid currentColor;line-height:1.5;white-space:normal;max-width:9.5em}
  .wm-monogram.hda-lockup--stacked .hda-wordmark{border-left:0;padding-left:0;max-width:none;white-space:nowrap}
  .wm-monogram.hda-lockup--stacked .hda-mark{height:3.4em}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  window.HDALogos = { list: LOGOS, byId, render, hydrate };
})();
