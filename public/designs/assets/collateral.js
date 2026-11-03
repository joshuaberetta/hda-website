/*
 * Collateral mock-ups: brochure, slides, booth banners and small pieces.
 * Renders into <main id="cl">. Every piece is a .cl-doc with a real aspect
 * ratio; its .cl-page font-size is set in container units, so the whole
 * layout (logo included) scales with the width it is shown at.
 */
(function () {
  const body = document.body;
  const root = body.dataset.root || '../../';
  const theme = window.HDAThemes.find((t) => t.id === body.dataset.themeId);
  const icon = (id) => `<svg aria-hidden="true"><use href="${root}assets/icons.svg#${id}"/></svg>`;

  // How each theme dresses the same content.
  //   art: main motif · tex: quiet background texture · cover: cover layout
  const FLAVOUR = {
    confluence: { hl: 'Connecting data, maps and expertise for <em>humanitarian action.</em>', art: 'map', tex: 'contours', cover: 'split', divider: 'inverse' },
    fieldwork: { hl: 'Data and maps that start in the field and <em>serve the people in it.</em>', art: 'contours', tex: 'contours', cover: 'full', divider: 'inverse' },
    signal: { hl: 'Humanitarian data services, <em>coordinated</em> across the crisis lifecycle.', art: 'map-sq', tex: 'grid', cover: 'full', dark: true, divider: 'accent' },
    commons: { hl: 'Stronger <em>together</em> for humanitarian data.', art: 'bars', tex: 'none', cover: 'type', divider: 'accent' },
    relief: { hl: 'Every decision rests on the <em>ground truth.</em>', art: 'relief', tex: 'contours', cover: 'full', divider: 'inverse', frame: true },
    atlas: { hl: 'Four layers of expertise. <em>One clear picture.</em>', art: 'stack', tex: 'grid', cover: 'split', divider: 'inverse' },
    unified: { hl: 'Connecting data, maps and expertise for <em>humanitarian action.</em>', art: 'map', tex: 'contours', cover: 'split', divider: 'inverse' },
  };
  const F = FLAVOUR[theme.id];

  // ---- shared content ------------------------------------------------------
  const URL = 'alliance-website.org';
  const EMAIL = 'hello@alliance-website.org';
  const WHO = 'iMMAP · CartONG · HOT · Kobo';
  const LEAD = 'Four organisations with deep expertise in data collection, open mapping, geospatial analysis and information management, working as one.';
  const SHORT = 'Data, maps and expertise for humanitarian action.';
  const QUOTE = '“People will always come before data.”';
  const MEMBERS = [
    ['iMMAP', 'Information management, analysis and geoinformatics.', 'immap.org'],
    ['CartONG', 'Mapping and data management grounded in field realities.', 'cartong.org'],
    ['HOT', 'A global community mapping for disaster response.', 'hotosm.org'],
    ['Kobo', 'Data collection tools trusted in the hardest settings.', 'kobo.ngo'],
  ];
  const SERVICES = [
    ['i-form', 'Data collection & management', 'Field-ready digital data collection, with responsible-data safeguards built in.'],
    ['i-map', 'Mapping & geospatial', 'Open base maps, remote sensing and GIS analysis that show where needs are.'],
    ['i-chart', 'Information management', 'Products, dashboards and analysis that inform timely decisions.'],
    ['i-people', 'Capacity strengthening', 'Training and accompaniment that builds lasting local expertise.'],
  ];
  const PHASES = [
    ['Before', 'Preparedness', 'Baseline data, maps and trained local teams.'],
    ['Onset', 'Rapid response', 'Coordinated surge support, fast.'],
    ['Protracted', 'Sustained operations', 'Reliable information management.'],
    ['After', 'Early recovery', 'Handover to local actors.'],
  ];
  const COMMITS = ['Coordination over fragmentation', 'Expertise where it’s needed', 'Interoperable by design', 'Responsible & open data', 'Local leadership', 'Practical innovation'];
  const STATS = [['35,000+', 'organisations rely on Kobo'], ['758K+', 'community mappers with HOT'], ['80+', 'partners supported by iMMAP'], ['20 yrs', 'of humanitarian mapping at CartONG']];

  // ---- building blocks -----------------------------------------------------
  function art(seed = 4, o = {}) {
    switch (F.art) {
      case 'map': return `<div class="cl-art cl-art--map"><div data-graphic="worldmap" data-step="${o.step || 2.6}"></div></div>`;
      case 'map-sq': return `<div class="cl-art cl-art--map"><div data-graphic="worldmap" data-shape="square" data-step="${o.step || 2.6}" data-dot-scale="0.36"></div></div>`;
      case 'contours': return `<div class="cl-art cl-art--fill" data-graphic="contours" data-seed="${seed}" data-levels="${o.levels || 16}"></div>`;
      case 'relief': return `<div class="cl-art cl-art--fill" data-graphic="relief" data-seed="${seed}" data-levels="${o.levels || 12}" data-bumps="9"></div>`;
      case 'stack': return `<div class="cl-art cl-art--stack"><div data-graphic="stack" data-labels="none" data-gap="40"></div></div>`;
      default: return '<div class="cl-art cl-bars"><i></i><i></i><i></i><i></i></div>';
    }
  }
  function tex(seed = 17) {
    if (F.tex === 'contours') return `<div class="cl-tex" data-graphic="contours" data-seed="${seed}" data-levels="14" aria-hidden="true"></div>`;
    if (F.tex === 'grid') return '<div class="cl-tex cl-tex--grid" aria-hidden="true"></div>';
    return '<div class="cl-tex cl-tex--bars" aria-hidden="true"><i></i><i></i><i></i><i></i></div>';
  }
  const logo = (layout = 'horizontal', cls = 'cl-logo') => `<span class="${cls}" data-hda-logo="${layout}"></span>`;
  const qr = () => '<span class="cl-qr" aria-label="QR code placeholder"><i></i><i></i><i></i></span>';

  /** A mock document. kind sets aspect ratio and scale (see collateral.css). */
  const doc = (kind, inner, cls = '') => `<div class="cl-doc cl-doc--${kind}"><div class="cl-page ${cls}">${inner}</div></div>`;
  const fig = (content, caption, cls = '') => `<figure class="cl-fig ${cls}">${content}<figcaption>${caption}</figcaption></figure>`;

  /** The theme's cover composition. orient: 'land' | 'port'. */
  function cover({ orient = 'land', lead = true, meta = '', seed = 4, eyebrow = WHO, hl = F.hl } = {}) {
    return `<div class="cl-cover cl-cover--${F.cover} cl-cover--${orient}${F.dark ? ' inverse' : ''}">
      <div class="cl-cover-vis">${art(seed)}</div>
      ${F.frame ? '<span class="cl-collar" aria-hidden="true"></span>' : ''}
      <div class="cl-cover-copy">
        ${logo()}
        <div class="cl-cover-main">
          <p class="eyebrow">${eyebrow}</p>
          <h1 class="cl-display">${hl}</h1>
          ${lead ? `<p class="cl-lead">${LEAD}</p>` : ''}
        </div>
        ${meta ? `<p class="cl-meta">${meta}</p>` : ''}
      </div>
    </div>`;
  }

  const dividerCls = () => (F.divider === 'accent' ? 'cl-accent' : 'inverse');

  // ---- 01 Brochure ---------------------------------------------------------
  function brochure() {
    const flap = `<div class="cl-panel">
        ${tex(21)}
        <p class="eyebrow">Why an alliance</p>
        <h3 class="cl-h2">Collaboration creates more value than any of us can achieve alone.</h3>
        <p class="cl-p">Instead of navigating four organisations, humanitarian actors reach aligned services designed to work together.</p>
        <ul class="cl-checks" role="list">${COMMITS.map((c) => `<li>${c}</li>`).join('')}</ul>
      </div>`;
    const back = `<div class="cl-panel cl-panel--back">
        ${logo('stacked', 'cl-logo cl-logo--stacked')}
        <p class="cl-p cl-center">An alliance of ${WHO.replace(/ · /g, ', ').replace(/, (?=[^,]*$)/, ' and ')}.</p>
        <ul class="cl-urls" role="list">${MEMBERS.map(([n, , u]) => `<li><b>${n}</b><span>${u}</span></li>`).join('')}</ul>
        <div class="cl-contact">${qr()}<div><b>Get in touch</b><span>${EMAIL}</span><span>${URL}</span></div></div>
        <p class="cl-fine">Printed on recycled paper · 2026 · Draft</p>
      </div>`;
    const front = `<div class="cl-panel cl-panel--cover">${cover({ orient: 'port', lead: false, meta: URL })}</div>`;

    const members = `<div class="cl-panel">
        <p class="eyebrow">Who we are</p>
        <h3 class="cl-h2">Four organisations, one coordinated approach.</h3>
        <div class="cl-members">${MEMBERS.map(([n, d, u]) => `<div><b>${n}</b><p>${d}</p><span>${u}</span></div>`).join('')}</div>
        <p class="cl-panel-quote">${QUOTE}</p>
      </div>`;
    const services = `<div class="cl-panel cl-panel--tint">
        ${tex(9)}
        <p class="eyebrow">What we do</p>
        <h3 class="cl-h2">One entry point to complementary expertise.</h3>
        <div class="cl-services">${SERVICES.map(([i, h, p]) => `<div><span class="cl-ico">${icon(i)}</span><b>${h}</b><p>${p}</p></div>`).join('')}</div>
      </div>`;
    const life = `<div class="cl-panel">
        <p class="eyebrow">Across the crisis lifecycle</p>
        <ol class="cl-phases" role="list">${PHASES.map(([k, h, p], n) => `<li><span>0${n + 1} · ${k}</span><b>${h}</b><p>${p}</p></li>`).join('')}</ol>
        <div class="cl-stats">${STATS.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('')}</div>
        <div class="cl-cta ${dividerCls()}"><b>Planning a response?</b><span>Tell us what you need at ${EMAIL}</span></div>
      </div>`;

    const sheet = (panels, labels) => `
      <div class="cl-panel-labels" aria-hidden="true">${labels.map((l) => `<span>${l}</span>`).join('')}</div>
      ${doc('sheet', `<div class="cl-sheet">${panels.join('')}</div><span class="cl-folds" aria-hidden="true"></span>`)}`;

    const flyerFront = cover({ orient: 'port', lead: true, seed: 6 });
    const flyerBack = `<div class="cl-flyer-back">
        <p class="eyebrow">What we do</p>
        <h3 class="cl-h2">One entry point to complementary expertise.</h3>
        <div class="cl-services cl-services--rows">${SERVICES.map(([i, h, p]) => `<div><span class="cl-ico">${icon(i)}</span><b>${h}</b><p>${p}</p></div>`).join('')}</div>
        <div class="cl-cta ${dividerCls()}"><b>Work with us</b><span>${EMAIL}</span></div>
        <div class="cl-flyer-foot">${logo()}<span>${URL}</span></div>
      </div>`;

    return `
    <section class="sg-section" id="brochure">
      <div class="container">
        <div class="sg-head"><span>01</span><h2>Brochure</h2><p>A DL tri-fold on A4 (297 × 210 mm). The outside sheet carries the front and back covers; the inside opens onto members, services and the lifecycle. Dashed lines are folds.</p></div>
        ${fig(sheet([flap, back, front], ['Inside flap', 'Back cover', 'Front cover']), 'Outside: printed side 1')}
        ${fig(sheet([members, services, life], ['Inside left', 'Inside centre', 'Inside right']), 'Inside: printed side 2', 'cl-gap')}
        <div class="cl-row cl-row--flyer cl-gap">
          ${fig(`<div class="cl-folded">${doc('dl', cover({ orient: 'port', lead: false, meta: URL }))}</div>`, 'Folded, as handed out (99 × 210 mm)')}
          ${fig(doc('a5', flyerFront), 'Option B: A5 flyer, front')}
          ${fig(doc('a5', flyerBack), 'A5 flyer, back')}
        </div>
      </div>
    </section>`;
  }

  // ---- 02 Slides -----------------------------------------------------------
  const sfoot = (n) => `<footer class="cl-sfoot">${logo()}<span>Humanitarian Data Alliance</span><b>${String(n).padStart(2, '0')}</b></footer>`;
  const SLIDES = [
    ['Title', () => doc('slide', cover({ meta: 'Presenter name · Event name · Date' }))],
    ['Agenda', () => doc('slide', `${tex(33)}<div class="cl-s cl-s--agenda">
        <div><p class="eyebrow">Agenda</p><h2 class="cl-h1">What we’ll cover today</h2></div>
        <ol class="cl-agenda" role="list">${['Who we are', 'What we do', 'Across the crisis lifecycle', 'Working with us', 'Questions'].map((t, i) => `<li><b>0${i + 1}</b><span>${t}</span></li>`).join('')}</ol>
      </div>${sfoot(2)}`)],
    ['Section divider', () => doc('slide', `${tex(12)}<div class="cl-s cl-s--divider"><b class="cl-num">01</b><div><h2 class="cl-h0">Who we are</h2><p class="cl-lead">Four organisations, one coordinated approach.</p></div></div>${sfoot(3)}`, dividerCls())],
    ['Members', () => doc('slide', `<div class="cl-s">
        <p class="eyebrow">Who we are</p><h2 class="cl-h1">Four members, one alliance</h2>
        <div class="cl-cards">${MEMBERS.map(([n, d, u]) => `<div class="cl-card"><b>${n}</b><p>${d}</p><span>${u}</span></div>`).join('')}</div>
      </div>${sfoot(4)}`)],
    ['Content + image', () => doc('slide', `<div class="cl-s cl-s--two">
        <div><p class="eyebrow">The challenge</p><h2 class="cl-h1">Expertise is spread across many organisations.</h2>
          <ul class="cl-bullets" role="list"><li>Responders spend time finding the right partner instead of acting.</li><li>Tools and datasets don’t always work together.</li><li>Local capacity is built, then lost between crises.</li></ul></div>
        <div class="cl-artbox">${art(12, { levels: 12 })}</div>
      </div>${sfoot(5)}`)],
    ['Services grid', () => doc('slide', `<div class="cl-s">
        <p class="eyebrow">What we do</p><h2 class="cl-h1">One entry point to complementary expertise</h2>
        <div class="cl-services cl-services--grid">${SERVICES.map(([i, h, p]) => `<div><span class="cl-ico">${icon(i)}</span><div><b>${h}</b><p>${p}</p></div></div>`).join('')}</div>
      </div>${sfoot(6)}`)],
    ['Timeline', () => doc('slide', `<div class="cl-s">
        <p class="eyebrow">Across the crisis lifecycle</p><h2 class="cl-h1">With you before, during and after a crisis</h2>
        <ol class="cl-timeline" role="list">${PHASES.map(([k, h, p], n) => `<li><i></i><span>0${n + 1} · ${k}</span><b>${h}</b><p>${p}</p></li>`).join('')}</ol>
      </div>${sfoot(7)}`)],
    ['Big numbers', () => doc('slide', `${tex(40)}<div class="cl-s">
        <p class="eyebrow">Our combined reach</p><h2 class="cl-h1">Decades of trust, built in the field</h2>
        <div class="cl-bignums">${STATS.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('')}</div>
        <p class="cl-src">Figures from member websites, September 2026. <span class="tbc">To be confirmed</span></p>
      </div>${sfoot(8)}`)],
    ['Chart', () => doc('slide', `<div class="cl-s cl-s--chart">
        <div><p class="eyebrow">Demand</p><h2 class="cl-h1">Requests by service area</h2><p class="cl-p">Use one highlight colour for the point you want people to remember; keep everything else neutral.</p><span class="tag">Placeholder data</span></div>
        <div class="cl-chart">${[['Mapping & geospatial', 86], ['Data collection', 72], ['Information management', 58], ['Capacity strengthening', 41], ['Other', 17]].map(([l, v], i) => `<div class="${i === 0 ? 'is-hi' : ''}"><span>${l}</span><i style="--v:${v}%"></i><b>${v}</b></div>`).join('')}</div>
      </div>${sfoot(9)}`)],
    ['Full-bleed photo', () => doc('slide', `<div class="cl-photo"><span>${icon('i-pin')} Full-bleed photo: community mapping in the field</span></div>
        <div class="cl-photo-cap"><p class="eyebrow">In the field</p><h2 class="cl-h2">Local mappers update the base map after a flood.</h2><small>Photo: credit and consent note</small></div>`)],
    ['Quote', () => doc('slide', `${tex(17)}<div class="cl-s cl-s--quote"><span class="cl-quote-mark" data-hda-logo="mark"></span><div><p class="cl-quote">${QUOTE}</p><p class="cl-lead">Every dataset, map and tool must serve faster, more accountable decisions for communities affected by crises.</p></div></div>${sfoot(11)}`, 'inverse')],
    ['Thank you', () => doc('slide', `<div class="cl-s cl-s--end">
        <div><h2 class="cl-h0">Thank you</h2><p class="cl-lead">Let’s talk about your next response.</p>
          <ul class="cl-endlist" role="list"><li>${icon('i-mail')} ${EMAIL}</li><li>${icon('i-link')} ${URL}</li><li>${icon('i-people')} ${WHO}</li></ul></div>
        <div class="cl-end-art">${art(5, { levels: 12 })}<span class="cl-end-logo">${logo('stacked', 'cl-logo cl-logo--stacked')}</span></div>
      </div>`)],
  ];

  function slides() {
    const main = SLIDES.map(([name, make], i) => `<div class="cl-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${SLIDES.length}: ${name}">${make()}</div>`).join('');
    const thumbs = SLIDES.map(([name, make], i) => `<button class="cl-thumb" type="button" data-go="${i}" aria-label="Go to slide ${i + 1}: ${name}"><span aria-hidden="true">${make()}</span><small>${String(i + 1).padStart(2, '0')} ${name}</small></button>`).join('');
    return `
    <section class="sg-section sg-alt" id="slides">
      <div class="container">
        <div class="sg-head"><span>02</span><h2>Slides</h2><p>A 16:9 template with ${SLIDES.length} layouts, from the title slide to the closing slide. Use the arrows, your keyboard or the thumbnails to flip through.</p></div>
        <div class="cl-carousel" tabindex="0" aria-roledescription="carousel" aria-label="Slide templates">
          <div class="cl-viewport"><div class="cl-track">${main}</div></div>
          <div class="cl-controls">
            <button class="cl-nav" type="button" data-step="-1" aria-label="Previous slide">←</button>
            <p class="cl-counter" aria-live="polite"></p>
            <button class="cl-nav" type="button" data-step="1" aria-label="Next slide">→</button>
            <button class="cl-all" type="button" aria-pressed="false">Show all</button>
          </div>
          <div class="cl-thumbs">${thumbs}</div>
        </div>
      </div>
    </section>`;
  }

  function wireCarousel(el) {
    const track = el.querySelector('.cl-track');
    const slidesEls = [...track.children];
    const thumbs = [...el.querySelectorAll('.cl-thumb')];
    const counter = el.querySelector('.cl-counter');
    const strip = el.querySelector('.cl-thumbs');
    let i = 0;
    const go = (n, user) => {
      i = (n + slidesEls.length) % slidesEls.length;
      track.style.transform = `translateX(${-100 * i}%)`;
      slidesEls.forEach((s, k) => { s.inert = k !== i; });
      thumbs.forEach((t, k) => t.setAttribute('aria-current', String(k === i)));
      counter.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b> / ${slidesEls.length} · ${SLIDES[i][0]}`;
      if (user) {
        const t = thumbs[i];
        strip.scrollTo({ left: t.offsetLeft - (strip.clientWidth - t.offsetWidth) / 2, behavior: 'smooth' });
      }
    };
    const all = el.querySelector('.cl-all');
    const setGrid = (on) => {
      el.classList.toggle('is-grid', on);
      all.setAttribute('aria-pressed', String(on));
      all.textContent = on ? 'Show as carousel' : 'Show all';
      slidesEls.forEach((s, k) => { s.inert = !on && k !== i; });
    };
    all.addEventListener('click', () => setGrid(!el.classList.contains('is-grid')));
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-step],[data-go]');
      if (!b) return;
      go(b.dataset.go !== undefined ? +b.dataset.go : i + +b.dataset.step, true);
    });
    el.addEventListener('keydown', (e) => {
      if (el.classList.contains('is-grid')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); go(i + (e.key === 'ArrowRight' ? 1 : -1), true); }
    });
    let x0 = null;
    const vp = el.querySelector('.cl-viewport');
    vp.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    vp.addEventListener('pointerup', (e) => {
      if (x0 !== null && Math.abs(e.clientX - x0) > 40) go(i + (e.clientX < x0 ? 1 : -1), true);
      x0 = null;
    });
    go(0);
    if (new URLSearchParams(location.search).get('slides') === 'all') setGrid(true);
  }

  // ---- 03 Booth ------------------------------------------------------------
  const base = '<span class="cl-zone cl-zone--base" aria-hidden="true"><em>Stand base</em></span>';
  const rollups = [
    ['Statement', () => doc('rollup', cover({ orient: 'port', lead: false, meta: URL, seed: 8 }) + base)],
    ['Services', () => doc('rollup', `${tex(26)}<div class="cl-rollup">
        ${logo()}
        <div><p class="eyebrow">What we do</p><h2 class="cl-h1">One entry point to complementary expertise.</h2></div>
        <div class="cl-services cl-services--rows">${SERVICES.map(([i, h]) => `<div><span class="cl-ico">${icon(i)}</span><b>${h}</b></div>`).join('')}</div>
        <p class="cl-meta">${URL}</p>
      </div>${base}`)],
    ['Quote + members', () => doc('rollup', `${tex(17)}<div class="cl-rollup">
        ${logo()}
        <p class="cl-quote">${QUOTE}</p>
        <ul class="cl-urls" role="list">${MEMBERS.map(([n, , u]) => `<li><b>${n}</b><span>${u}</span></li>`).join('')}</ul>
        <div class="cl-contact">${qr()}<div><b>Talk to us</b><span>${URL}</span></div></div>
      </div>${base}`, 'inverse')],
  ];
  const backdrop = () => doc('backdrop', cover({ lead: false, meta: `${URL} · ${EMAIL}`, seed: 3 }) + '<span class="cl-zone cl-zone--table" aria-hidden="true"><em>Hidden by the table (0.75 m)</em></span>');
  const table = () => doc('table', `<div class="cl-table${F.dark ? ' inverse' : ''}">${F.art === 'bars' ? art() : tex(29)}${logo()}<div class="cl-table-copy"><p>${SHORT}</p><b>${URL}</b></div></div>`);

  function booth() {
    const person = `<svg class="cl-person" viewBox="0 0 40 170" aria-hidden="true"><circle cx="20" cy="11" r="10"/><path d="M8 26h24c4 0 6 3 6 7v50c0 3-2 4-4 4h-2v78c0 3-2 5-5 5h-2l-5-70-5 70h-2c-3 0-5-2-5-5V87H6c-2 0-4-1-4-4V33c0-4 2-7 6-7z"/></svg>`;
    return `
    <section class="sg-section" id="booth">
      <div class="container">
        <div class="sg-head"><span>03</span><h2>Conference booth</h2><p>Three roll-up banner options, a backdrop wall and a table front, then all of them together on a typical 5 m booth. Keep text above waist height and readable from 3 m away.</p></div>
        <div class="cl-row cl-row--rollups">${rollups.map(([n, make], i) => fig(make(), `Roll-up ${String.fromCharCode(65 + i)}: ${n} · 850 × 2000 mm`)).join('')}</div>
        <div class="cl-row cl-row--wall cl-gap">
          ${fig(backdrop(), 'Backdrop wall · 3000 × 2250 mm')}
          ${fig(table(), 'Table front · 1800 × 700 mm')}
        </div>
        ${fig(`<div class="cl-scene" aria-hidden="true">
            <div class="cl-s-backdrop">${backdrop()}</div>
            <div class="cl-s-roll cl-s-roll--l">${rollups[0][1]()}</div>
            <div class="cl-s-roll cl-s-roll--r">${rollups[1][1]()}</div>
            <div class="cl-s-table">${table()}<i></i></div>
            ${person}
            <span class="cl-floor"></span>
            <span class="cl-dim"><i></i>5.2 m</span>
          </div>`, 'Front elevation to scale, with a 1.7 m person. Sizes are common print sizes; confirm with the printer and add 3 mm bleed (roll-ups often need extra at the base).', 'cl-gap')}
      </div>
    </section>`;
  }

  // ---- 04 More -------------------------------------------------------------
  function more() {
    const badge = doc('badge', `<span class="cl-slot" aria-hidden="true"></span>
      <div class="cl-badge">${logo()}<div><b>Firstname Lastname</b><span>CartONG · GIS Officer</span></div></div>
      <div class="cl-badge-band ${dividerCls()}">${tex(44)}<b>HNPW 2027</b><span>Geneva</span></div>`);
    const post1 = doc('social', cover({ orient: 'port', lead: false, eyebrow: 'Announcement', hl: 'Introducing the <em>Humanitarian Data Alliance.</em>', seed: 7 }));
    const post2 = doc('social', `${tex(8)}<div class="cl-post">
      ${logo()}
      <div><p class="eyebrow">Event</p><h2 class="cl-h0">Meet us at <em>HNPW 2027</em></h2><p class="cl-lead">Geneva · Booth number TBC</p></div>
      <p class="cl-meta">${icon('i-calendar')} Dates to be confirmed</p></div>`, dividerCls());
    const sig = `<div class="cl-sig">
      <div class="cl-mail-head"><span>To: partner@example.org</span><span>Subject: Following up from HNPW</span></div>
      <p>Thanks for stopping by the booth. I’ve attached the brochure we talked about.</p>
      <div class="cl-sig-block"><div><b>Firstname Lastname</b><span>Information Management Officer, iMMAP</span><span>${EMAIL} · +00 000 000 000</span></div>
        <div class="cl-sig-logo"><small>Member of</small>${logo()}</div></div>
    </div>`;
    return `
    <section class="sg-section sg-alt" id="more">
      <div class="container">
        <div class="sg-head"><span>04</span><h2>Event extras</h2><p>Small pieces that make the booth feel like one brand: a name badge, social posts and an email signature that members can add under their own.</p></div>
        <div class="cl-row cl-row--more">
          ${fig(badge, 'Name badge · A6')}
          ${fig(post1, 'Social post · 1080 × 1080')}
          ${fig(post2, 'Event post · 1080 × 1080')}
        </div>
        ${fig(sig, 'Email signature under a member’s own signature', 'cl-gap cl-sig-fig')}
      </div>
    </section>`;
  }

  const intro = () => `
    <header class="sg-intro">
      <div class="container">
        <p class="sg-kicker">Theme ${theme.letter} · Collateral</p>
        <h1>${theme.name} in print and on stage</h1>
        <p class="sg-lede">The same identity on a brochure, a slide deck and a conference booth.</p>
        <div class="sg-intro-grid">
          <div><h2>About these mock-ups</h2><p>Layouts are drafts to compare direction, not print-ready files. All copy, photos, figures, the web address and email are placeholders. Change the logo in the review bar and every piece updates.</p></div>
          <div><h2>Also for ${theme.name}</h2><p><a class="link-arrow" href="index.html">Home page ${icon('i-arrow')}</a></p><p style="margin-top:.6rem"><a class="link-arrow" href="style-guide.html">Style guide ${icon('i-arrow')}</a></p></div>
        </div>
      </div>
    </header>`;

  function init() {
    const cl = document.getElementById('cl');
    cl.innerHTML = intro() + brochure() + slides() + booth() + more();
    window.HDAGraphics.hydrate(cl);
    cl.querySelectorAll('.cl-carousel').forEach(wireCarousel);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
