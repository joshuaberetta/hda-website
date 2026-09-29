/*
 * Generic style guide. Renders into <main id="sg"> using the current theme's
 * tokens.css + theme.css, so every theme gets the same structure while the
 * colours, type and components are its own.
 */
(function () {
  const body = document.body;
  const root = body.dataset.root || '../../';
  const theme = window.HDAThemes.find((t) => t.id === body.dataset.themeId);
  const icon = (id) => `<svg aria-hidden="true"><use href="${root}assets/icons.svg#${id}"/></svg>`;

  // ---- colour helpers ------------------------------------------------------
  const probe = document.createElement('i');
  function resolve(token, scope) {
    probe.style.color = `var(${token})`;
    (scope || document.getElementById('sg')).appendChild(probe);
    const rgb = getComputedStyle(probe).color.match(/[\d.]+/g).slice(0, 3).map(Number);
    probe.remove();
    return rgb;
  }
  const hex = (rgb) => '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const grade = (c) => (c >= 7 ? 'AAA' : c >= 4.5 ? 'AA' : c >= 3 ? 'AA Large' : 'Fail');

  function badge(fg, bg, label) {
    const c = contrast(fg, bg);
    return `<span class="sg-contrast is-${grade(c).replace(' ', '-').toLowerCase()}" title="${label}: ${c.toFixed(2)}:1">
      <b style="color:${hex(fg)};background:${hex(bg)}">Aa</b>${label} ${c.toFixed(1)} · ${grade(c)}</span>`;
  }

  // ---- sections ------------------------------------------------------------
  const intro = () => `
    <header class="sg-intro">
      <div class="container">
        <p class="sg-kicker">Theme ${theme.letter} · Style guide</p>
        <h1>${theme.name}</h1>
        <p class="sg-lede">${theme.tagline}</p>
        <div class="sg-intro-grid">
          <div><h2>How it merges our brands</h2><p>${theme.blend}</p></div>
          <div><h2>Best for</h2><p>${theme.bestFor}</p>
            <p style="margin-top:1.2rem"><a class="link-arrow" href="index.html">View the ${theme.name} home page ${icon('i-arrow')}</a></p><p style="margin-top:.6rem"><a class="link-arrow" href="collateral.html">Brochure, slides and booth ${icon('i-arrow')}</a></p></div>
        </div>
      </div>
    </header>`;

  const logo = () => `
    <section class="sg-section" id="logo">
      <div class="container">
        <div class="sg-head"><span>01</span><h2>Logo</h2><p class="sg-logo-meta"></p></div>
        <div class="sg-logo-grid">
          <figure class="sg-tile sg-tile--wide"><div class="sg-stage"><span data-hda-logo="horizontal" style="font-size:30px"></span></div><figcaption>Primary: horizontal lockup</figcaption></figure>
          <figure class="sg-tile"><div class="sg-stage"><span data-hda-logo="stacked" style="font-size:24px"></span></div><figcaption>Stacked</figcaption></figure>
          <figure class="sg-tile"><div class="sg-stage inverse"><span data-hda-logo="horizontal" style="font-size:22px"></span></div><figcaption>Reversed on dark</figcaption></figure>
          <figure class="sg-tile"><div class="sg-stage sg-mono"><span data-hda-logo="horizontal" style="font-size:22px"></span></div><figcaption>One colour</figcaption></figure>
          <figure class="sg-tile"><div class="sg-stage inverse sg-mono"><span data-hda-logo="horizontal" style="font-size:22px"></span></div><figcaption>One colour, reversed</figcaption></figure>
          <figure class="sg-tile"><div class="sg-stage sg-sizes">
              <span class="sg-mark" data-hda-logo="mark" style="width:64px;height:64px"></span>
              <span class="sg-mark" data-hda-logo="mark" style="width:40px;height:40px"></span>
              <span class="sg-mark" data-hda-logo="mark" style="width:24px;height:24px"></span>
              <span class="sg-mark" data-hda-logo="mark" style="width:16px;height:16px"></span>
            </div><figcaption>Mark only: 64 / 40 / 24 / 16 px (16 px minimum)</figcaption></figure>
          <figure class="sg-tile"><div class="sg-stage"><div class="sg-clear"><span data-hda-logo="horizontal" style="font-size:20px"></span></div></div><figcaption>Clear space: keep the height of the mark free on all sides</figcaption></figure>
          <figure class="sg-tile"><div class="sg-stage sg-appicons">
              <span class="sg-app inverse"><span data-hda-logo="mark"></span></span>
              <span class="sg-app sg-app--light"><span data-hda-logo="mark"></span></span>
              <span class="sg-app sg-app--round inverse"><span data-hda-logo="mark"></span></span>
            </div><figcaption>App icon, favicon and social avatar</figcaption></figure>
          <figure class="sg-tile sg-tile--full"><div class="sg-stage sg-cobrand">
              <span data-hda-logo="horizontal" style="font-size:22px"></span>
              <span class="sg-cobrand-members"><small>An alliance of</small><b>iMMAP</b><b>CartONG</b><b>HOT</b><b>Kobo</b></span>
            </div><figcaption>Co-branding: member names (or logos) sit to the right, divided by a rule and given equal weight</figcaption></figure>
        </div>
        <ul class="sg-rules">
          <li><b>Do</b> use the full-colour logo on the page background or the primary dark colour.</li>
          <li><b>Do</b> use the one-colour version on photos, busy backgrounds or single-colour print.</li>
          <li><b>Don’t</b> recolour individual parts of the mark, stretch it, add effects or place it on low-contrast colours.</li>
          <li><b>Don’t</b> make the alliance logo bigger than member logos when they’re shown together.</li>
        </ul>
      </div>
    </section>`;

  function colour() {
    const cards = theme.swatches.map(([token, name, role]) => `
      <div class="sg-swatch" data-token="${token}">
        <div class="sg-chip" style="background:var(${token})"></div>
        <div class="sg-swatch-body"><b>${name}</b><code class="sg-hex"></code><code>${token}</code><p>${role}</p><div class="sg-badges"></div></div>
      </div>`).join('');
    const logoChips = ['a', 'b', 'c', 'd'].map((k) => `<span class="sg-logo-chip" data-token="--logo-${k}"><i style="background:var(--logo-${k})"></i><code></code></span>`).join('');
    return `
    <section class="sg-section sg-alt" id="colour">
      <div class="container">
        <div class="sg-head"><span>02</span><h2>Colour</h2><p>Contrast is checked live (WCAG 2.1) against the page background and white. Body text needs AA (4.5:1). Large text and UI elements need 3:1.</p></div>
        <div class="sg-swatches">${cards}</div>
        <div class="sg-logo-colours"><h3>Logo colours</h3><div>${logoChips}</div><p>The four logo colours are a fixed set, one per quadrant or layer. They are not assigned to specific members.</p></div>
        <div class="sg-ratio"><h3>Suggested proportion</h3><div class="sg-ratio-bar">
          <i style="flex:60;background:var(--c-bg)"></i><i style="flex:18;background:var(--c-surface)"></i><i style="flex:12;background:var(--c-primary)"></i><i style="flex:5;background:var(--c-accent)"></i><i style="flex:3;background:var(--c-accent-2)"></i><i style="flex:2;background:var(--c-accent-3)"></i></div>
          <p>Mostly background and surface, the primary colour for structure, and the accent for the few things that should be clicked.</p></div>
      </div>
    </section>`;
  }

  const type = () => {
    const f = theme.fonts;
    return `
    <section class="sg-section" id="type">
      <div class="container">
        <div class="sg-head"><span>03</span><h2>Typography</h2><p>Headings: <b>${f.head}</b>. Body: <b>${f.body}</b>.${f.mono ? ` Data and labels: <b>${f.mono}</b>.` : ''} All free on Google Fonts.</p></div>
        <div class="sg-type">
          <div class="sg-type-row"><code>Display · 56–72</code><p class="sg-t-display">Connecting data, maps and people</p></div>
          <div class="sg-type-row"><code>H2 · 40</code><h2 class="sg-t-h2">Support across the crisis lifecycle</h2></div>
          <div class="sg-type-row"><code>H3 · 24</code><h3 class="sg-t-h3">Information management &amp; analysis</h3></div>
          <div class="sg-type-row"><code>Eyebrow</code><p class="eyebrow">Humanitarian Data Alliance</p></div>
          <div class="sg-type-row"><code>Lead · 20</code><p class="sg-t-lead">Four organisations combining data collection, open mapping, geospatial analysis and information management.</p></div>
          <div class="sg-type-row"><code>Body · 17</code><p class="sg-t-body">Every dataset, map, analysis and tool must ultimately serve a greater purpose: enabling faster, more informed and more accountable decisions for communities affected by crises. Keep line length between 60 and 75 characters.</p></div>
          <div class="sg-type-row"><code>Small · 14</code><p class="sg-t-small">Figures from member websites, Sept 2026. Source and date go under every statistic.</p></div>
        </div>
      </div>
    </section>`;
  };

  const components = () => `
    <section class="sg-section sg-alt" id="components">
      <div class="container">
        <div class="sg-head"><span>04</span><h2>Components</h2><p>The same building blocks power all four themes. Only the tokens and a few details change.</p></div>
        <div class="sg-comp-grid">
          <div class="sg-comp"><h3>Buttons</h3><div class="sg-row">
            <a class="btn btn--primary" href="#components">Request support ${icon('i-arrow')}</a>
            <a class="btn btn--secondary" href="#components">Our services</a>
            <a class="btn btn--ghost" href="#components">Learn more</a></div>
            <div class="sg-row inverse sg-dark-strip">
            <a class="btn btn--primary" href="#components">On dark ${icon('i-arrow')}</a>
            <a class="btn btn--secondary" href="#components">Secondary</a></div></div>
          <div class="sg-comp"><h3>Tags &amp; links</h3><div class="sg-row">
            <span class="tag">Announcement</span><span class="tag">Webinar</span><span class="tag">Event</span></div>
            <div class="sg-row"><a class="link-arrow" href="#components">Read more ${icon('i-arrow')}</a></div></div>
          <div class="sg-comp"><h3>Form</h3>
            <label class="sg-label">Email<input class="input" placeholder="name@organisation.org"></label>
            <label class="sg-label">Request<textarea class="input" rows="2" placeholder="Tell us what you need"></textarea></label></div>
          <div class="sg-comp"><h3>Card</h3>
            <article class="card"><span class="tag">Service</span><h3 style="margin:.7rem 0 .4rem;font-size:1.3rem">Mapping &amp; geospatial</h3><p style="font-size:.95rem">Open base maps, remote sensing and GIS analysis that show where needs are.</p></article></div>
          <div class="sg-comp sg-comp--wide"><h3>Icons</h3><div class="sg-icons">
            ${['i-form', 'i-map', 'i-chart', 'i-people', 'i-layers', 'i-pin', 'i-link', 'i-shield', 'i-puzzle', 'i-sprout', 'i-bulb', 'i-open', 'i-calendar', 'i-mail'].map((i) => `<span>${icon(i)}<code>${i.slice(2)}</code></span>`).join('')}
            </div><p class="sg-note">1.7px outline icons on a 24px grid, in the text colour. No filled or multicolour icons.</p></div>
        </div>
      </div>
    </section>`;

  const graphics = () => `
    <section class="sg-section" id="graphics">
      <div class="container">
        <div class="sg-head"><span>05</span><h2>Graphics</h2><p>Lightweight, code-generated SVG instead of stock photography: fast on low bandwidth, and on-message for data and GIS. Use real photos of partners’ work only when they come with consent.</p></div>
        <div class="sg-graphics">
          <figure class="sg-tile"><div class="sg-stage sg-map"><div data-graphic="worldmap" data-step="3"></div></div><figcaption>Dot map with links between humanitarian hubs</figcaption></figure>
          <figure class="sg-tile"><div class="sg-stage inverse sg-map"><div data-graphic="worldmap" data-step="3" data-arcs="false"></div></div><figcaption>Dot map on dark, without links</figcaption></figure>
          <figure class="sg-tile"><div class="sg-stage sg-contours"><div data-graphic="contours" data-seed="7" data-levels="9"></div></div><figcaption>Contour texture for backgrounds</figcaption></figure>
          <figure class="sg-tile"><div class="sg-stage inverse sg-contours"><div data-graphic="contours" data-seed="3" data-levels="7"></div></div><figcaption>Contour texture on dark</figcaption></figure>
        </div>
      </div>
    </section>`;

  const voice = () => `
    <section class="sg-section sg-alt" id="voice">
      <div class="container">
        <div class="sg-head"><span>06</span><h2>Voice</h2><p>How the alliance sounds, whichever theme is chosen.</p></div>
        <div class="sg-voice">
          <div><h3>People before data</h3><p>Lead with who is helped and what changes, then explain the method.</p></div>
          <div><h3>Plain and precise</h3><p>Short sentences, with acronyms written out on first use. Say “maps that show where needs are”, not “geospatial intelligence solutions”.</p></div>
          <div><h3>Together, not over</h3><p>Say “iMMAP, CartONG, HOT and Kobo”. Always list all four. Never present the alliance as replacing its members.</p></div>
          <div><h3>Honest numbers</h3><p>Every figure has a source and a date. If it’s not confirmed, don’t publish it.</p></div>
        </div>
      </div>
    </section>`;

  // ---- render --------------------------------------------------------------
  function fillColours() {
    const sg = document.getElementById('sg');
    const bg = resolve('--c-bg'), white = [255, 255, 255];
    sg.querySelectorAll('.sg-swatch').forEach((el) => {
      const rgb = resolve(el.dataset.token);
      el.querySelector('.sg-hex').textContent = hex(rgb);
      const sameAsBg = hex(rgb) === hex(bg);
      el.querySelector('.sg-badges').innerHTML = (sameAsBg ? badge(resolve('--c-ink'), rgb, 'Ink on it') : badge(rgb, bg, 'On bg')) + badge(rgb, white, 'On white');
    });
    sg.querySelectorAll('.sg-logo-chip').forEach((el) => { el.querySelector('code').textContent = hex(resolve(el.dataset.token)); });
  }

  function logoMeta(id) {
    const l = window.HDALogos.byId[id];
    const el = document.querySelector('.sg-logo-meta');
    if (l && el) el.innerHTML = `<b>Logo ${l.num} · ${l.name}.</b> ${l.rationale} <a href="${root}logos/index.html">Compare all logos</a>`;
  }

  function init() {
    const sg = document.getElementById('sg');
    sg.innerHTML = intro() + logo() + colour() + type() + components() + graphics() + voice();
    fillColours();
    window.HDAGraphics.hydrate(sg);
    logoMeta(theme.defaultLogo);
  }
  document.addEventListener('hda:logo', (e) => logoMeta(e.detail));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
