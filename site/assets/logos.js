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
  // Fully parameterised so it can be tuned in logos/contour-studio.html. The
  // defaults reproduce the original concept.
  const CONTOUR_DEFAULTS = {
    rings: 3, outer: 27, step: 6.4, ease: 1,     // ring count, outer radius, spacing, spacing curve
    cx: 32, cy: 33, dx: 6.4, dy: -5.6,           // base centre and summit offset
    wobble: 1, detail: 1, twist: 1, seed: 0,     // terrain shape
    rotate: 0, squash: 0.9,
    stroke: 3, taper: 0, gap: 0, gapAt: 90,      // line weight and cartographic label gap
    style: 'lines', colours: 'BDC', summit: 'A', mark: 'dot', dot: 4.4,
    font: 'lora', fit: false,
  };
  const CONTOUR_KEY = 'hda-contour';
  const FONTS = { lora: 'wm-contour', fraunces: 'wm-summits', jakarta: 'wm-convergence', barlow: 'wm-layers', archivo: 'wm-tiles', sora: 'wm-strata' };
  const PAINT = { A, B, C, D, I: INK };

  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
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
  // One wobbly terrain ring. Rings tighten toward a summit, like real terrain.
  function terrainRing(p, i, R, cx, cy) {
    const ph = p.seed ? (() => { const r = rng(p.seed * 7919); return [0, 0, 0, 0].map(() => r() * Math.PI * 2); })() : [0.9, 2.4, 0, 0.6];
    const rot = (p.rotate * Math.PI) / 180, tw = p.twist;
    const pts = [];
    for (let k = 0; k < 40; k++) {
      const a = (k / 40) * Math.PI * 2, q = a - rot;
      const w = 1 + p.wobble * (0.11 * Math.sin(2 * q + ph[0] + i * 0.35 * tw) + 0.07 * Math.sin(3 * q + ph[1] - i * 0.5 * tw)
        + 0.03 * p.detail * Math.sin(5 * q + ph[2] + i * tw) + 0.025 * Math.max(0, p.detail - 1) * Math.sin(7 * q + ph[3] + i * 1.3 * tw));
      pts.push([cx + Math.cos(a) * R * w, cy + Math.sin(a) * R * w * p.squash]);
    }
    return pts;
  }
  function contourGeometry(p) {
    const rings = [];
    for (let i = 0; i < p.rings; i++) {
      const t = i / p.rings;
      const R = Math.max(1, p.outer - p.step * p.rings * t ** p.ease);
      rings.push({ i, t, pts: terrainRing(p, i, R, p.cx + p.dx * t, p.cy + p.dy * t) });
    }
    return { rings, sx: p.cx + p.dx, sy: p.cy + p.dy };
  }
  function contour(params) {
    const p = Object.assign({}, CONTOUR_DEFAULTS, params === undefined ? storedContour() : params);
    const g = contourGeometry(p);
    const col = (i) => PAINT[p.colours[i % p.colours.length]] || B;
    let rings = '';
    g.rings.forEach(({ i, t, pts }) => {
      const d = smoothClosed(pts), sw = (p.stroke * Math.max(0.15, 1 - p.taper * t)).toFixed(2);
      if (p.style === 'filled') {
        rings += `<path d="${d}" fill="${col(i)}" stroke="${BG}" stroke-width="${(p.stroke * 0.8).toFixed(2)}"/>`;
      } else {
        const gap = p.gap > 0 ? ` pathLength="100" stroke-dasharray="${100 - p.gap} ${p.gap}" stroke-dashoffset="${(100 - p.gap / 2 - (p.gapAt * 100) / 360).toFixed(2)}" stroke-linecap="round"` : '';
        const fill = p.style === 'tint' ? `fill="${col(i)}" fill-opacity=".16"` : 'fill="none"';
        rings += `<path d="${d}" ${fill} stroke="${col(i)}" stroke-width="${sw}"${gap}/>`;
      }
    });
    let summit = '';
    const sc = PAINT[p.summit];
    if (sc && p.dot > 0) {
      const r = p.dot, x = g.sx, y = g.sy;
      if (p.mark === 'triangle') {
        const h = r * 1.9;
        summit = `<path d="M${x.toFixed(2)} ${(y - h * 0.62).toFixed(2)} L${(x + h * 0.58).toFixed(2)} ${(y + h * 0.38).toFixed(2)} L${(x - h * 0.58).toFixed(2)} ${(y + h * 0.38).toFixed(2)} Z" fill="${sc}" stroke-linejoin="round"/>`;
      } else if (p.mark === 'ring') {
        summit = `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(r * 0.72).toFixed(2)}" fill="none" stroke="${sc}" stroke-width="${(r * 0.55).toFixed(2)}"/>`;
      } else {
        summit = `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r}" fill="${sc}"/>`;
      }
    }
    let vb = '0 0 64 64';
    if (p.fit) {
      const all = g.rings.flatMap((r) => r.pts).concat([[g.sx - p.dot, g.sy - p.dot], [g.sx + p.dot, g.sy + p.dot]]);
      const pad = p.stroke / 2 + 1;
      const xs = all.map((q) => q[0]), ys = all.map((q) => q[1]);
      const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad;
      vb = `${x0.toFixed(1)} ${y0.toFixed(1)} ${(Math.max(...xs) + pad - x0).toFixed(1)} ${(Math.max(...ys) + pad - y0).toFixed(1)}`;
    }
    return `<svg class="hda-mark" viewBox="${vb}" aria-hidden="true">
      <g stroke-linejoin="round">${rings}</g>${summit}</svg>`;
  }

  // Custom contour settings persist in localStorage and can be shared with
  // ?contour=<code> (from the studio). ?contour=reset clears them.
  const encode = (o) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const decode = (s) => JSON.parse(atob(s.replace(/-/g, '+').replace(/_/g, '/')));
  const diffContour = (p) => Object.fromEntries(Object.entries(p).filter(([k, v]) => k in CONTOUR_DEFAULTS && CONTOUR_DEFAULTS[k] !== v));
  function storedContour() {
    try { return JSON.parse(localStorage.getItem(CONTOUR_KEY) || '{}'); } catch { return {}; }
  }
  function saveContour(p) {
    const d = diffContour(p);
    if (Object.keys(d).length) localStorage.setItem(CONTOUR_KEY, JSON.stringify(d));
    else localStorage.removeItem(CONTOUR_KEY);
  }
  try {
    const q = new URLSearchParams(location.search).get('contour');
    if (q === 'reset' || q === '') localStorage.removeItem(CONTOUR_KEY);
    else if (q) saveContour(Object.assign({}, CONTOUR_DEFAULTS, decode(q)));
  } catch { /* ignore malformed codes */ }
  const contourFont = (params) => FONTS[Object.assign({}, CONTOUR_DEFAULTS, params === undefined ? storedContour() : params).font] || 'wm-contour';

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

  // --- 6. Summits: four peaks rising from one shared landscape ------------
  // Iso-lines of four equal hills. The low contours merge into one shape; the
  // high ones separate into four distinct summits. Traced with marching squares.
  let summitsCache;
  function summits() {
    if (!summitsCache) {
      const P = [[24, 21], [43.5, 25.5], [38.5, 44], [19.5, 38.5]];
      const s2 = 2 * 6.4 * 6.4;
      const f = (x, y) => P.reduce((v, [px, py]) => v + Math.exp(-((x - px) ** 2 + (y - py) ** 2) / s2), 0);
      const near = (x, y) => P.reduce((b, q, k) => ((x - q[0]) ** 2 + (y - q[1]) ** 2 < (x - P[b][0]) ** 2 + (y - P[b][1]) ** 2 ? k : b), 0);
      const N = 128, cell = 64 / N;
      const grid = Array.from({ length: N + 1 }, (_, j) => Array.from({ length: N + 1 }, (_, i) => f(i * cell, j * cell)));
      const levels = [[0.36, 'shared'], [0.78, 'split']];
      const out = { shared: '', 0: '', 1: '', 2: '', 3: '' };
      const SEG = { 1: [3, 2], 2: [2, 1], 3: [3, 1], 4: [0, 1], 5: [3, 0, 2, 1], 6: [0, 2], 7: [3, 0], 8: [3, 0], 9: [0, 2], 10: [3, 2, 0, 1], 11: [0, 1], 12: [3, 1], 13: [2, 1], 14: [3, 2] };
      for (const [t, kind] of levels) {
        for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
          const v0 = grid[j][i], v1 = grid[j][i + 1], v2 = grid[j + 1][i + 1], v3 = grid[j + 1][i];
          const idx = (v0 > t ? 8 : 0) | (v1 > t ? 4 : 0) | (v2 > t ? 2 : 0) | (v3 > t ? 1 : 0);
          if (!idx || idx === 15) continue;
          const x = i * cell, y = j * cell, l = (a, b) => (t - a) / (b - a);
          const e = [[x + cell * l(v0, v1), y], [x + cell, y + cell * l(v1, v2)], [x + cell * l(v3, v2), y + cell], [x, y + cell * l(v0, v3)]];
          const seg = SEG[idx];
          for (let k = 0; k < seg.length; k += 2) {
            const [a, b] = [e[seg[k]], e[seg[k + 1]]];
            const key = kind === 'shared' ? 'shared' : near(a[0], a[1]);
            out[key] += `M${a[0].toFixed(2)} ${a[1].toFixed(2)}L${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
          }
        }
      }
      summitsCache = { out, P };
    }
    const { out, P } = summitsCache;
    const colours = [A, C, D, B];
    return `<svg class="hda-mark" viewBox="0 0 64 64" aria-hidden="true">
      <g fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="${out.shared}" stroke="${B}"/>
        ${colours.map((c, k) => `<path d="${out[k]}" stroke="${c}"/>`).join('')}
      </g>
      ${P.map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="2.3" fill="${colours[k]}"/>`).join('')}
    </svg>`;
  }

  // --- 7. Strata: contour plates stacked into a terraced landscape --------
  // Layers (concept 2) meets Contour (concept 3): each contour becomes a
  // raised plate, seen in isometric view.
  function strata() {
    const p = Object.assign({}, CONTOUR_DEFAULTS, { squash: 0.52, wobble: 0.9 });
    const TH = 3.6; // plate thickness
    const plate = (i, R, cx, cy, colour) => {
      const top = smoothClosed(terrainRing(p, i, R, cx, cy));
      const side = smoothClosed(terrainRing(p, i, R, cx, cy + TH));
      return `<path d="${side}" fill="${colour}" stroke="${BG}" stroke-width="2.4" paint-order="stroke"/>
        <path d="${side}" fill="#000" fill-opacity=".22"/><path d="${top}" fill="${colour}"/>`;
    };
    return `<svg class="hda-mark" viewBox="0 0 64 64" aria-hidden="true"><g stroke-linejoin="round">
      ${plate(0, 26.5, 30.5, 43, D)}${plate(1, 20.2, 32.2, 35.4, C)}${plate(2, 14, 33.8, 27.8, B)}${plate(3, 8.2, 35.2, 20.4, A)}
    </g></svg>`;
  }

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
      id: 'contour', num: 3, name: 'Contour', draw: contour, wmFor: contourFont, customisable: true,
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
    {
      id: 'summits', num: 6, name: 'Summits', draw: summits,
      wordmark: 'Humanitarian<br>Data Alliance', wm: 'wm-summits',
      summary: 'Four peaks rising from one shared landscape.',
      rationale: 'The Contour idea, told as a partnership. Each member is its own summit, equal in height and distinct at the top. Lower down, their contour lines merge into one shared ground: the common base the alliance stands on. It works as real topography, which gives it credibility with GIS audiences.',
    },
    {
      id: 'strata', num: 7, name: 'Strata', draw: strata,
      wordmark: 'Humanitarian<br>Data Alliance', wm: 'wm-strata',
      summary: 'Contour plates stacked into terrain.',
      rationale: 'A hybrid of Layers and Contour. Four contour plates stack in isometric view, like a terraced relief model, so it reads as both a GIS layer stack and a landscape. Each layer is needed to build the summit. It has the most depth of any concept and still holds up as a favicon.',
    },
  ];

  const byId = Object.fromEntries(LOGOS.map((l) => [l.id, l]));

  /**
   * layout: 'horizontal' | 'stacked' | 'mark'
   */
  function render(id, layout = 'horizontal', params) {
    const logo = byId[id] || LOGOS[0];
    if (layout === 'mark') {
      return `<span class="hda-lockup hda-lockup--mark" data-logo-id="${logo.id}">${logo.draw(params)}</span>`;
    }
    const wm = logo.wmFor ? logo.wmFor(params) : logo.wm;
    return `<span class="hda-lockup hda-lockup--${layout} ${wm}" data-logo-id="${logo.id}">
      ${logo.draw(params)}<span class="hda-wordmark">${logo.wordmark}</span></span>`;
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
  .wm-summits .hda-wordmark{font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:1.08em;letter-spacing:-.01em;line-height:1.02;font-variation-settings:'opsz' 48}
  .wm-strata .hda-wordmark{font-family:'Sora',system-ui,sans-serif;font-weight:600;font-size:.98em;letter-spacing:-.02em;line-height:1.08}
  .wm-monogram{gap:.8em}
  .wm-monogram .hda-mark{height:2.2em}
  .wm-monogram .hda-wordmark{font-family:'Inter',system-ui,sans-serif;font-weight:600;font-size:.62em;letter-spacing:.16em;text-transform:uppercase;padding-left:.9em;border-left:1.5px solid currentColor;line-height:1.5;white-space:normal;max-width:9.5em}
  .wm-monogram.hda-lockup--stacked .hda-wordmark{border-left:0;padding-left:0;max-width:none;white-space:nowrap}
  .wm-monogram.hda-lockup--stacked .hda-mark{height:3.4em}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const contourApi = {
    defaults: CONTOUR_DEFAULTS, fonts: Object.keys(FONTS), draw: contour,
    get: () => Object.assign({}, CONTOUR_DEFAULTS, storedContour()),
    isCustom: () => Object.keys(diffContour(Object.assign({}, CONTOUR_DEFAULTS, storedContour()))).length > 0,
    save: saveContour, reset: () => localStorage.removeItem(CONTOUR_KEY),
    diff: diffContour, encode, decode,
  };
  window.HDALogos = { list: LOGOS, byId, render, hydrate, contour: contourApi };
})();
