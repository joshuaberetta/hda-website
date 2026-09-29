/*
 * Lightweight, dependency-free SVG graphics shared by all themes:
 *   <div data-graphic="worldmap" data-step="2.5" data-arcs="true"></div>
 *   <div data-graphic="contours" data-seed="3"></div>
 * Colours come from CSS custom properties (--map-dot, --map-hub, --map-arc,
 * --contour-line) so each theme styles them.
 */
(function () {
  // Coarse coastlines as [lon, lat] polygons. Good enough for a dot matrix.
  const LAND = [
    // North America
    [[-168,66],[-162,70],[-156,71.5],[-140,70],[-128,70],[-115,68.5],[-95,72],[-85,70],[-80,64],[-93,61],[-94,58],[-86,55.5],[-82,52],[-79,55],[-77,62],[-72,61],[-64,60],[-61,56],[-56,52],[-60,47],[-66,44],[-70,42],[-74,40],[-76,35],[-81,31],[-80,26],[-82,27],[-84,30],[-90,29],[-97,27],[-97,22],[-94,18.5],[-90,21],[-87,21],[-88,16],[-84,15.5],[-83,10],[-79,9],[-77,8],[-80,7.5],[-83,8.5],[-86,11],[-88,13],[-92,14.5],[-96,16],[-105,20],[-106,23],[-110,24],[-114,30],[-117,32],[-120,34.5],[-124,40],[-124,46],[-123,49],[-128,51],[-133,55],[-140,59.5],[-150,61],[-155,58],[-162,55],[-165,54.5],[-158,57.5],[-162,59],[-165,62],[-168,66]],
    // Canadian Arctic
    [[-120,71],[-100,70],[-82,72],[-68,76],[-64,81],[-90,82.5],[-118,78],[-124,74],[-120,71]],
    // Greenland
    [[-73,78],[-60,82],[-30,83],[-19,80],[-20,72],[-25,69],[-40,65],[-44,60],[-50,62],[-54,67],[-58,75],[-73,78]],
    // Cuba, Hispaniola
    [[-85,22],[-80,23.2],[-74,20],[-78,20],[-85,22]],
    [[-74.4,19.8],[-69,19.8],[-68.4,18.5],[-74.4,18.2],[-74.4,19.8]],
    // South America
    [[-77,8.5],[-72,12],[-64,10.8],[-60,8.5],[-52,5],[-50,0],[-44,-2],[-35,-5],[-35,-9],[-39,-15],[-40,-22],[-48,-26],[-53,-34],[-58,-38],[-62,-40],[-65,-45],[-68,-50],[-69,-55],[-74,-52],[-75,-45],[-73,-37],[-71,-30],[-70,-18],[-76,-14],[-81,-6],[-80,-2],[-78,2],[-77,8.5]],
    // Eurasia
    [[-9,37],[-9,43],[-1.5,43.5],[-4.5,48],[1,50.5],[4,52],[8,54],[8.5,57],[10.5,57.5],[10.5,54.5],[14,54],[20,55],[21,57],[24,59.5],[22.5,60.5],[21.5,63],[25,65.5],[21,65],[17,62],[18.5,59.5],[16,56],[12.5,56],[11,59],[6,58],[5,62],[12,66],[16,69],[20,70],[26,71],[31,70],[41,67],[44,68],[53,68.5],[60,69],[69,73],[80,73],[87,75],[100,77],[112,74],[130,71],[140,72],[160,70],[170,70],[180,68],[180,65],[178,62],[170,60],[163,58],[162,56],[157,51],[156,57],[160,61],[155,59],[143,59],[137,54],[140,48],[135,43],[130,42],[129.4,36],[126.4,34.6],[126,38],[125,40],[121,40],[118,38.5],[122,37],[120,33],[122,30],[120,26],[117,23],[111,21],[108,21.5],[106,19],[109,12],[105,9],[103,11],[100,13],[100,8],[104,1.5],[101,3],[98,8],[98,16],[94,18],[92,22],[89,22],[87,21],[80,16],[80,10],[77,8],[73,17],[72,21],[68,23],[66,25],[62,25],[57,26],[56,27],[52,28],[49,30],[48,30],[50,26],[51.5,24.5],[56,24.5],[59.5,22.5],[55,17],[52,16],[45,13],[43,13],[39,20],[35,28],[34,28],[32.5,30],[34.5,31.5],[35.5,33.5],[36,36],[30,36.5],[27,37],[26,40],[29,41],[24,41],[23,38],[21.5,37],[20,40],[19,42],[14,45.5],[12.5,44],[18.5,40],[16,38],[15.6,40],[12,42],[10,44],[8,44],[4,43.5],[3,42],[0,39],[-2,37],[-5,36],[-9,37]],
    // British Isles, Iceland
    [[-5.5,50],[1.4,51.2],[1.8,53],[-1,55],[-2,58],[-5,58.6],[-6,56],[-3,54.5],[-4.5,53],[-5.5,50]],
    [[-10,51.5],[-6,52],[-6,55],[-8,55.3],[-10,54],[-10,51.5]],
    [[-24,65],[-14,64],[-14,66],[-22,66.5],[-24,65]],
    // Africa, Madagascar
    [[-17,21],[-16,28],[-10,30],[-9,33],[-6,36],[0,36],[10,37],[11,33],[20,31],[20,32.5],[25,32],[32,31],[34,28],[33,23],[37,18],[39,15],[43,12],[51,12],[50,8],[47,3],[41,-2],[40,-10],[40,-15],[35,-20],[35,-25],[33,-27],[30,-31],[25,-34],[20,-35],[18,-32],[15,-27],[12,-18],[13,-12],[12,-5],[9,-1],[9,4],[6,4.5],[2,6],[-4,5],[-8,4.5],[-12,7],[-15,11],[-17,15],[-17,21]],
    [[44,-25],[47,-25],[50.5,-15],[49,-12],[44,-17],[44,-25]],
    // Sri Lanka, Japan, Philippines, Taiwan
    [[79.8,6],[81.8,7],[80,9.8],[79.8,6]],
    [[130,31],[132,34],[135,34],[140,35],[141.5,41],[140,42],[142,45.5],[145.5,44],[142,40],[141,37],[139,34],[131,33],[130,31]],
    [[120,18.5],[122.3,18.5],[124,13],[126.5,7],[125,5.5],[122,7],[120,13],[120,18.5]],
    [[120.2,22],[121.9,25.2],[121.2,22.3],[120.2,22]],
    // Maritime SE Asia
    [[95,5.5],[98,4],[104,-2],[106,-6],[101,-3],[95,3],[95,5.5]],
    [[109,2],[110,-3],[116,-4],[119,1],[117,7],[113,4],[109,2]],
    [[105,-6],[114,-7],[114.5,-8.6],[106,-7.2],[105,-6]],
    [[119,-5.5],[120.5,1],[125,1.6],[121.5,-1],[123,-5.5],[119,-5.5]],
    [[131,-1],[141,-2.5],[148,-6],[150,-10.5],[143,-9],[138,-8],[132,-4],[131,-1]],
    // Australia, New Zealand
    [[114,-22],[114,-34],[118,-35],[124,-34],[131,-31.5],[135,-35],[138,-35],[140,-38],[146,-39],[150,-37],[153,-31],[153,-25],[146,-19],[145,-15],[142,-11],[141,-17],[137,-16],[136,-12],[132,-11],[129,-15],[126,-14],[122,-18],[114,-22]],
    [[173,-35],[178,-37.5],[176,-41.5],[174.5,-41],[174.5,-37],[173,-35]],
    [[172.5,-40.5],[174.2,-41.5],[171,-44],[167,-46.5],[166.5,-45],[172.5,-40.5]],
  ];

  // Places where members operate and humanitarian hubs, for the network overlay.
  const HUBS = [
    [6.1, 46.2], [36.8, -1.3], [35.9, 31.9], [-17.4, 14.7], [-74.1, 4.7],
    [90.4, 23.8], [121.0, 14.6], [85.3, 27.7], [-72.3, 18.5], [35.5, 33.9],
    [15.3, -4.3], [69.2, 34.5], [32.6, -25.9], [-77.0, 38.9], [44.4, 33.3],
    [45.3, 2.0], [7.5, 9.1], [100.5, 13.7], [-66.9, 10.5], [38.7, 9.0],
  ];
  const LINKS = [[0, 2], [0, 3], [0, 13], [2, 9], [9, 14], [2, 11], [11, 7], [7, 5], [5, 17], [17, 6], [1, 15], [1, 19], [19, 2], [1, 10], [10, 16], [16, 3], [1, 12], [13, 8], [8, 4], [4, 18], [13, 4], [0, 1], [14, 11]];

  const X = (lon) => lon + 180;
  const Y = (lat) => 84 - lat;

  function inside(pt, poly) {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  }

  function worldmap(el) {
    const step = parseFloat(el.dataset.step || '2.4');
    const r = step * parseFloat(el.dataset.dotScale || '0.34');
    const showArcs = el.dataset.arcs !== 'false';
    const shape = el.dataset.shape || 'circle';
    const latMin = parseFloat(el.dataset.latMin || '-56');
    let dots = '';
    let row = 0;
    for (let lat = 82; lat >= latMin; lat -= step, row++) {
      const offset = shape === 'square' ? 0 : (row % 2) * step / 2;
      for (let lon = -180 + offset; lon < 180; lon += step) {
        if (LAND.some((p) => inside([lon, lat], p))) {
          dots += shape === 'square'
            ? `<rect x="${(X(lon) - r).toFixed(2)}" y="${(Y(lat) - r).toFixed(2)}" width="${(r * 2).toFixed(2)}" height="${(r * 2).toFixed(2)}"/>`
            : `<circle cx="${X(lon).toFixed(2)}" cy="${Y(lat).toFixed(2)}" r="${r.toFixed(2)}"/>`;
        }
      }
    }
    let arcs = '', hubs = '';
    if (showArcs) {
      LINKS.forEach(([a, b], i) => {
        const [x1, y1] = [X(HUBS[a][0]), Y(HUBS[a][1])];
        const [x2, y2] = [X(HUBS[b][0]), Y(HUBS[b][1])];
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const len = Math.hypot(x2 - x1, y2 - y1);
        const cx = mx + ((y1 - y2) / len) * len * 0.18;
        const cy = my - Math.abs((x2 - x1) / len) * len * 0.22 - 2;
        arcs += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" style="animation-delay:${(i * -0.37).toFixed(2)}s"/>`;
      });
      HUBS.forEach(([lon, lat], i) => {
        const cls = i % 4 === 0 ? 'hub hub--a' : i % 4 === 1 ? 'hub hub--b' : i % 4 === 2 ? 'hub hub--c' : 'hub hub--d';
        hubs += `<g class="${cls}"><circle class="hub-halo" cx="${X(lon)}" cy="${Y(lat)}" r="${step * 1.3}"/><circle class="hub-core" cx="${X(lon)}" cy="${Y(lat)}" r="${step * 0.6}"/></g>`;
      });
    }
    const h = 84 - latMin + step;
    el.innerHTML = `<svg class="worldmap" viewBox="-2 -1 364 ${h.toFixed(1)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Dotted world map with lines connecting humanitarian hubs">
      <g class="worldmap-dots">${dots}</g>
      <g class="worldmap-arcs" fill="none">${arcs}</g>
      <g class="worldmap-hubs">${hubs}</g></svg>`;
  }

  // --- Contours: marching squares over a smooth deterministic field --------
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  // A smooth deterministic "terrain" field over a W x H domain.
  function terrain(seed, W, H, n = 7) {
    const rand = rng(seed);
    const bumps = Array.from({ length: n }, () => ({
      x: rand() * W, y: rand() * H, s: 12 + rand() * 26, a: (rand() * 1.4 + 0.4) * (rand() > 0.25 ? 1 : -0.6),
    }));
    const f = (x, y) => {
      let v = 0.18 * Math.sin(x / 13) * Math.cos(y / 11) + 0.1 * Math.sin((x + y) / 7);
      for (const b of bumps) v += b.a * Math.exp(-((x - b.x) ** 2 + (y - b.y) ** 2) / (2 * b.s * b.s));
      return v;
    };
    return { f, bumps };
  }
  function sample(f, W, H, cols, rows) {
    const grid = [];
    let min = Infinity, max = -Infinity;
    for (let j = 0; j <= rows; j++) {
      grid[j] = [];
      for (let i = 0; i <= cols; i++) {
        const v = f((i / cols) * W, (j / rows) * H);
        grid[j][i] = v; min = Math.min(min, v); max = Math.max(max, v);
      }
    }
    return { grid, min, max, cols, rows, W, H };
  }
  // Marching squares: one path string per level.
  function trace({ grid, min, max, cols, rows, W, H }, levels) {
    const paths = [];
    for (let l = 1; l <= levels; l++) {
      const t = min + ((max - min) * l) / (levels + 1);
      let d = '';
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const v0 = grid[j][i], v1 = grid[j][i + 1], v2 = grid[j + 1][i + 1], v3 = grid[j + 1][i];
          const idx = (v0 > t ? 8 : 0) | (v1 > t ? 4 : 0) | (v2 > t ? 2 : 0) | (v3 > t ? 1 : 0);
          if (idx === 0 || idx === 15) continue;
          const x = (i / cols) * W, y = (j / rows) * H, cw = W / cols, ch = H / rows;
          const lerp = (a, b) => (t - a) / (b - a);
          const top = [x + cw * lerp(v0, v1), y];
          const right = [x + cw, y + ch * lerp(v1, v2)];
          const bottom = [x + cw * lerp(v3, v2), y + ch];
          const left = [x, y + ch * lerp(v0, v3)];
          const seg = {
            1: [left, bottom], 2: [bottom, right], 3: [left, right], 4: [top, right],
            5: [left, top, bottom, right], 6: [top, bottom], 7: [left, top], 8: [left, top],
            9: [top, bottom], 10: [left, bottom, top, right], 11: [top, right], 12: [left, right],
            13: [bottom, right], 14: [left, bottom],
          }[idx];
          for (let k = 0; k < seg.length; k += 2) {
            d += `M${seg[k][0].toFixed(2)} ${seg[k][1].toFixed(2)}L${seg[k + 1][0].toFixed(2)} ${seg[k + 1][1].toFixed(2)}`;
          }
        }
      }
      paths.push({ l, d });
    }
    return paths;
  }

  function contours(el) {
    const W = 160, H = 90;
    const levels = parseInt(el.dataset.levels || '14', 10);
    const { f } = terrain(parseInt(el.dataset.seed || '7', 10), W, H);
    const paths = trace(sample(f, W, H, 160, 90), levels)
      .map(({ l, d }) => `<path class="${l % 5 === 0 ? 'contour-index' : ''}" d="${d}"/>`);
    el.innerHTML = `<svg class="contours" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g fill="none" stroke-linecap="round">${paths.join('')}</g></svg>`;
  }

  // --- Relief: hypsometric tints + hillshade on canvas, contours on top -----
  //   <div data-graphic="relief" data-seed="4" data-levels="12"></div>
  // Colours: --relief-0 … --relief-5 (low to high), --contour-line.
  function relief(el) {
    const draw = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      el._w = w;
      const W = 160, H = (160 * h) / w;
      const levels = parseInt(el.dataset.levels || '12', 10);
      const { f } = terrain(parseInt(el.dataset.seed || '4', 10), W, H, parseInt(el.dataset.bumps || '8', 10));
      const cs = getComputedStyle(el);
      const ramp = [0, 1, 2, 3, 4, 5].map((k) => {
        const c = cs.getPropertyValue(`--relief-${k}`).trim() || '#cccccc';
        const m = c.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
        return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [200, 200, 200];
      });
      const scale = Math.min(1, 900 / w);
      const cw = Math.round(w * scale), ch = Math.round(h * scale);
      const s = sample(f, W, H, cw, ch);
      const canvas = document.createElement('canvas');
      canvas.width = cw; canvas.height = ch;
      const ctx = canvas.getContext('2d');
      const img = ctx.createImageData(cw, ch);
      const span = s.max - s.min, lx = -0.62, ly = -0.62, lz = 0.42, zk = 58 / span;
      for (let j = 0; j < ch; j++) {
        for (let i = 0; i < cw; i++) {
          const v = s.grid[j][i];
          const dx = (s.grid[j][Math.min(i + 1, cw)] - s.grid[j][Math.max(i - 1, 0)]) * zk;
          const dy = (s.grid[Math.min(j + 1, ch)][i] - s.grid[Math.max(j - 1, 0)][i]) * zk;
          const len = Math.hypot(dx, dy, 1);
          const shade = Math.max(0, (-dx * lx - dy * ly + lz) / len);
          // Step the tint at each contour interval, interpolating along the ramp.
          const q = Math.min(1, Math.floor(((v - s.min) / span) * (levels + 1)) / levels) * 5;
          const r0 = ramp[Math.floor(q)], r1 = ramp[Math.min(5, Math.floor(q) + 1)], fr = q - Math.floor(q);
          const c = [0, 1, 2].map((n) => r0[n] + (r1[n] - r0[n]) * fr);
          const k = 0.74 + 0.4 * shade, o = (j * cw + i) * 4;
          img.data[o] = Math.min(255, c[0] * k); img.data[o + 1] = Math.min(255, c[1] * k); img.data[o + 2] = Math.min(255, c[2] * k); img.data[o + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      const paths = trace(sample(f, W, H, 200, Math.round(200 * H / W)), levels)
        .map(({ l, d }) => `<path class="${l % 4 === 0 ? 'contour-index' : ''}" d="${d}"/>`);
      el.innerHTML = '';
      canvas.className = 'relief-canvas';
      el.appendChild(canvas);
      el.insertAdjacentHTML('beforeend', `<svg class="contours" viewBox="0 0 ${W} ${H.toFixed(2)}" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke-linecap="round">${paths.join('')}</g></svg>`);
    };
    draw();
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (el.clientWidth !== el._w) draw(); }, 200); });
  }

  // --- Stack: four GIS layers in isometric view -----------------------------
  //   <div data-graphic="stack" data-labels="Base map|Open mapping|Field data|Analysis"></div>
  // Toggle a layer with any element carrying data-stack-toggle="0..3".
  function stack(el) {
    const S = 100, GAP = parseFloat(el.dataset.gap || '30');
    const uid = (el._uid = el._uid || Math.random().toString(36).slice(2, 7));
    const bare = el.dataset.labels === 'none';
    const labels = bare ? [] : (el.dataset.labels || 'Terrain|Open map data|Field data|Analysis').split('|');
    const rand = rng(parseInt(el.dataset.seed || '11', 10));
    const iso = (y) => `matrix(0.866 0.5 -0.866 0.5 ${0} ${y})`;
    const { f } = terrain(5, S, S, 6);
    const base = trace(sample(f, S, S, 70, 70), 9).map(({ l, d }) => `<path class="${l % 3 === 0 ? 'contour-index' : ''}" d="${d}"/>`).join('');
    let roads = '';
    [[0, 30, 100, 44], [0, 72, 100, 62], [36, 0, 30, 100], [74, 0, 80, 100], [0, 8, 44, 0]].forEach(([a, b, c, d]) => (roads += `<path d="M${a} ${b} L${c} ${d}"/>`));
    let bldg = '';
    for (let k = 0; k < 46; k++) {
      const x = rand() * 92 + 2, y = rand() * 92 + 2, w = 2.4 + rand() * 3.5, h = 2.4 + rand() * 3.5;
      bldg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"/>`;
    }
    let pts = '';
    for (let k = 0; k < 26; k++) {
      const x = 8 + rand() * 84, y = 8 + rand() * 84;
      pts += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.6 + rand() * 1.4).toFixed(1)}"/>`;
    }
    let cells = '';
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
      const v = f(i * 10 + 5, j * 10 + 5);
      const o = Math.max(0, Math.min(1, (v + 0.2) / 1.6));
      if (o > 0.12) cells += `<rect x="${i * 10 + 0.6}" y="${j * 10 + 0.6}" width="8.8" height="8.8" rx="1.2" fill-opacity="${o.toFixed(2)}"/>`;
    }
    const content = [
      `<g class="st-contours" fill="none">${base}</g>`,
      `<g class="st-roads" fill="none">${roads}</g><g class="st-bldg">${bldg}</g>`,
      `<g class="st-points">${pts}</g>`,
      `<g class="st-cells">${cells}</g>`,
    ];
    const H = 3 * GAP + 100 + 20;
    const planes = content.map((c, k) => {
      const y = 10 + (3 - k) * GAP;
      return `<g class="st-layer st-layer--${k}" style="--k:${k}" data-layer="${k}">
        <g transform="translate(95 0) ${iso(y)}">
          <rect class="st-plane" width="${S}" height="${S}" rx="3"/>
          <g clip-path="url(#st-clip-${uid})">${c}</g>
          <rect class="st-edge" width="${S}" height="${S}" rx="3" fill="none"/>
        </g>
        ${bare ? '' : `<g class="st-label" transform="translate(${95 + 86.6 + 14} ${y + 50})"><line x1="-12" y1="0" x2="0" y2="0"/><text x="5" y="3.5">${String(k + 1).padStart(2, '0')}  ${labels[k] || ''}</text></g>`}
      </g>`;
    }).join('');
    el.innerHTML = `<svg class="stack" viewBox="${bare ? '4 -4 182' : '0 -4 300'} ${H}" role="img" aria-label="Four map layers stacked into one picture${bare ? '' : ': ' + labels.join(', ')}">
      <defs><clipPath id="st-clip-${uid}"><rect width="${S}" height="${S}" rx="3"/></clipPath></defs>${planes}</svg>`;
    document.querySelectorAll('[data-stack-toggle]').forEach((t) => {
      t.addEventListener('change', () => {
        const g = el.querySelector(`[data-layer="${t.dataset.stackToggle}"]`);
        if (g) g.classList.toggle('is-off', !t.checked);
      });
    });
  }

  // --- Mini stack: n isometric layers, the top one highlighted -------------
  function ministack(el) {
    const n = parseInt(el.dataset.n || '1', 10);
    let g = '';
    for (let k = 0; k < 4; k++) {
      const dy = (3 - k) * 7;
      g += `<path class="${k < n ? (k === n - 1 ? 'on top' : 'on') : 'off'}" d="M32 ${8 + dy} L57 ${20.5 + dy} L32 ${33 + dy} L7 ${20.5 + dy} Z"/>`;
    }
    el.innerHTML = `<svg class="ministack" viewBox="0 0 64 58" aria-hidden="true">${g}</svg>`;
  }

  function hydrate(root = document) {
    root.querySelectorAll('[data-graphic="worldmap"]').forEach(worldmap);
    root.querySelectorAll('[data-graphic="contours"]').forEach(contours);
    root.querySelectorAll('[data-graphic="relief"]').forEach(relief);
    root.querySelectorAll('[data-graphic="stack"]').forEach(stack);
    root.querySelectorAll('[data-graphic="ministack"]').forEach(ministack);
  }

  window.HDAGraphics = { hydrate, worldmap, contours, relief, stack };
  document.addEventListener('DOMContentLoaded', () => hydrate());
})();
