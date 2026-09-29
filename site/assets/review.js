/*
 * Review toolbar: switch theme / page / logo on any themed page.
 * <body data-root="../../" data-theme-id="confluence" data-view="home">
 * The logo choice persists (localStorage) and can be shared with ?logo=<id>.
 * ?clean starts collapsed; ?shot hides the bar entirely (used for thumbnails).
 */
(function () {
  const KEY = 'hda-review-logo';
  const body = document.body;
  const root = body.dataset.root || './';
  const themeId = body.dataset.themeId;
  const view = body.dataset.view || 'home';
  const theme = (window.HDAThemes || []).find((t) => t.id === themeId);

  const params = new URLSearchParams(location.search);
  if (params.has('logo')) localStorage.setItem(KEY, params.get('logo') === 'default' ? '' : params.get('logo'));
  const chosen = () => localStorage.getItem(KEY) || '';
  const effective = () => chosen() || (theme && theme.defaultLogo) || 'convergence';

  function applyLogo() {
    window.HDALogos.hydrate(document, effective());
    document.dispatchEvent(new CustomEvent('hda:logo', { detail: effective() }));
  }

  function toolbar() {
    if (!theme || params.has('shot')) return;
    const pageFile = { guide: 'style-guide.html', collateral: 'collateral.html' }[view] || 'index.html';
    const themeLinks = window.HDAThemes.map((t) =>
      `<a href="${root}themes/${t.id}/${pageFile}" class="${t.id === themeId ? 'is-active' : ''}" title="${t.name}">${t.letter}<span> ${t.name}</span></a>`
    ).join('');
    const logoOptions = [`<option value="">Theme default (${window.HDALogos.byId[theme.defaultLogo].num})</option>`]
      .concat(window.HDALogos.list.map((l) => `<option value="${l.id}">${l.num} · ${l.name}</option>`)).join('');

    const bar = document.createElement('aside');
    bar.className = 'review-bar';
    bar.setAttribute('aria-label', 'Design review controls');
    bar.innerHTML = `
      <a class="rb-home" href="${root}index.html" title="All design options">HDA <b>Design review</b></a>
      <div class="rb-group" role="group" aria-label="Theme"><span class="rb-label">Theme</span><nav class="rb-seg">${themeLinks}</nav></div>
      <div class="rb-group" role="group" aria-label="Page"><span class="rb-label">Page</span><nav class="rb-seg">
        <a href="index.html" class="${view === 'home' ? 'is-active' : ''}">Home</a>
        <a href="style-guide.html" class="${view === 'guide' ? 'is-active' : ''}">Style guide</a>
        <a href="collateral.html" class="${view === 'collateral' ? 'is-active' : ''}">Collateral</a></nav></div>
      <label class="rb-group"><span class="rb-label">Logo</span><select class="rb-select">${logoOptions}</select></label>
      <button class="rb-copy" type="button" title="Copy a link to this exact combination">Copy link</button>
      <button class="rb-toggle" type="button" aria-expanded="true" title="Hide toolbar">×</button>`;
    document.body.appendChild(bar);

    const select = bar.querySelector('.rb-select');
    select.value = chosen();
    select.addEventListener('change', () => { localStorage.setItem(KEY, select.value); applyLogo(); });

    bar.querySelector('.rb-copy').addEventListener('click', async (e) => {
      const url = new URL(location.href);
      url.search = ''; url.searchParams.set('logo', chosen() || 'default');
      try { await navigator.clipboard.writeText(url.toString()); e.target.textContent = 'Copied'; }
      catch { prompt('Copy this link', url.toString()); }
      setTimeout(() => (e.target.textContent = 'Copy link'), 1600);
    });

    const toggle = bar.querySelector('.rb-toggle');
    const setCollapsed = (c) => {
      bar.classList.toggle('is-collapsed', c);
      toggle.textContent = c ? 'Review' : '×';
      toggle.setAttribute('aria-expanded', String(!c));
      sessionStorage.setItem('hda-review-collapsed', c ? '1' : '');
    };
    toggle.addEventListener('click', () => setCollapsed(!bar.classList.contains('is-collapsed')));
    setCollapsed(!!sessionStorage.getItem('hda-review-collapsed') || params.has('clean'));
  }

  function init() {
    applyLogo();
    toolbar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
