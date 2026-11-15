/* Design gallery: a multiviewer.
   Left: a scrolling rail of small monitors (at least 6 inputs), each with an under-monitor
   label (UMD). Every case study in data.js with an `id` fills the next input, then an open
   channel (colour bars) invites the next project, and any inputs left over show "No signal".
   Right: the programme window. Choosing a project loads its `pages` (problem, philosophy,
   solution…) into it; dots at the top and the round arrows at the sides move between pages. */
(function () {
  'use strict';
  var SITE = window.SITE;
  function $(s, el) { return (el || document).querySelector(s); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function ch(n) { return String(n).padStart(2, '0'); }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Projects ---------- */
  var PROJECTS = [];
  SITE.stops.forEach(function (s) {
    (s.cases || []).forEach(function (c) { if (c.id) PROJECTS.push(Object.assign({ when: s.when, at: s.title }, c)); });
  });
  PROJECTS.push({ id: 'next', title: 'Your project?', tag: 'Open channel', open: true, pages: [{ kind: 'open' }] });
  PROJECTS.forEach(function (p) { // a case without pages still gets one, from its blurb
    if (!p.pages || !p.pages.length) p.pages = [{ kind: 'solution', title: p.title, text: p.blurb, img: p.img }];
  });

  var KIND = { problem: 'The problem', philosophy: 'The philosophy', solution: 'The solution', open: 'Open channel' };
  var PRINCIPLE = { observe: ['01', 'Observe'], reduce: ['02', 'Reduce'], improve: ['03', 'Improve'] };

  /* ---------- Rail of inputs ---------- */
  var sourcesEl = $('[data-sources]');
  var CHANNELS = Math.max(6, PROJECTS.length);
  function umd(num, name) {
    var u = el('span', 'umd');
    u.appendChild(el('span', 'umd__tally')); u.appendChild(el('span', 'umd__src', num)); u.appendChild(el('span', 'umd__name', name));
    return u;
  }
  var tiles = PROJECTS.map(function (p, i) {
    var b = el('button', 'src' + (p.open ? ' src--open' : ''));
    b.type = 'button'; b.id = 'src-' + p.id;
    b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', 'pgm');
    var shot = el('span', 'src__shot');
    if (p.img) { var im = el('img'); im.src = p.img; im.alt = ''; shot.appendChild(im); }
    else shot.appendChild(el('span', 'bars'));
    b.appendChild(shot);
    b.appendChild(umd(ch(i + 1), p.title));
    b.addEventListener('click', function () { select(i, true); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = (i + d + tiles.length) % tiles.length; tiles[n].focus(); select(n, true);
    });
    sourcesEl.appendChild(b);
    return b;
  });
  for (var n = PROJECTS.length + 1; n <= CHANNELS; n++) { // spare inputs: nothing plugged in yet
    var e = el('div', 'src src--empty'); e.setAttribute('aria-hidden', 'true');
    var sh = el('span', 'src__shot'); sh.appendChild(el('span', 'src__nosig', 'No signal')); e.appendChild(sh);
    e.appendChild(umd(ch(n), 'Input ' + ch(n)));
    sourcesEl.appendChild(e);
  }
  $('[data-wall-count]').textContent = (PROJECTS.length - 1) + ' projects · ' + CHANNELS + ' inputs';

  // Up / down buttons on the rail (left / right when the rail lies sideways on phones)
  var railUp = $('[data-rail-step="-1"]'), railDown = $('[data-rail-step="1"]');
  function sideways() { return getComputedStyle(sourcesEl).flexDirection === 'row'; }
  function railStep(dir) {
    var t = tiles[0], gap = 8, beh = reduceMotion ? 'auto' : 'smooth';
    if (sideways()) sourcesEl.scrollBy({ left: dir * (t.offsetWidth + gap), behavior: beh });
    else sourcesEl.scrollBy({ top: dir * (t.offsetHeight + gap), behavior: beh });
  }
  function railEnds() {
    var side = sideways();
    var pos = side ? sourcesEl.scrollLeft : sourcesEl.scrollTop;
    var max = side ? sourcesEl.scrollWidth - sourcesEl.clientWidth : sourcesEl.scrollHeight - sourcesEl.clientHeight;
    railUp.disabled = pos <= 4;           // a few pixels of slack for scroll snapping
    railDown.disabled = pos >= max - 4;
  }
  railUp.addEventListener('click', function () { railStep(-1); });
  railDown.addEventListener('click', function () { railStep(1); });
  sourcesEl.addEventListener('scroll', railEnds, { passive: true });
  window.addEventListener('resize', railEnds);

  /* ---------- Programme window ---------- */
  var screen = $('[data-screen]'), pagesEl = $('[data-pages]'), dotsEl = $('[data-dots]');
  var sectionEl = $('[data-section]'), countEl = $('[data-count]');
  var prevBtn = $('[data-page-step="-1"]'), nextBtn = $('[data-page-step="1"]');
  var cur = -1, page = 0, pageEls = [], dotEls = [];

  function buildPage(p, pg, k, total) {
    var sec = el('section', 'page page--' + pg.kind);
    sec.setAttribute('role', 'group');
    sec.setAttribute('aria-roledescription', 'page');
    sec.setAttribute('aria-label', (k + 1) + ' of ' + total + ': ' + KIND[pg.kind]);

    if (pg.kind === 'open') {
      sec.appendChild(el('span', 'bars'));
      var card = el('div', 'open-card');
      card.appendChild(el('p', 'page__kicker', 'Awaiting signal'));
      card.appendChild(el('h3', 'page__title', 'Your project could be next'));
      card.appendChild(el('p', 'page__text', 'If you have an interface operators struggle with, or a new tool that needs to be simple from day one, I’d love to hear about it.'));
      var acts = el('div', 'page__actions');
      var mail = el('a', 'btn btn--primary', SITE.email); mail.href = 'mailto:' + SITE.email;
      var li = el('a', 'btn', 'LinkedIn ↗'); li.href = SITE.linkedin; li.target = '_blank'; li.rel = 'noopener';
      acts.appendChild(mail); acts.appendChild(li); card.appendChild(acts);
      sec.appendChild(card);
      return sec;
    }

    var visual = null;
    if (pg.kind === 'philosophy' && PRINCIPLE[pg.principle]) {
      // a scrap of the sketchbook, linking to that principle on the Philosophy page
      var pr = PRINCIPLE[pg.principle];
      visual = el('a', 'page__visual sketch');
      visual.href = 'philosophy.html#' + pg.principle;
      visual.appendChild(el('span', 'sketch__n', pr[0]));
      visual.appendChild(el('span', 'sketch__word', pr[1]));
      visual.appendChild(el('span', 'sketch__note', 'from my design philosophy →'));
    } else if (pg.img) {
      visual = el('figure', 'page__visual shot');
      var im = el('img'); im.src = pg.img; im.alt = p.title + ' interface screenshot'; im.loading = 'lazy';
      visual.appendChild(im);
    }
    if (!visual) sec.classList.add('page--wide');

    var text = el('div', 'page__body');
    var same = p.pages.filter(function (x) { return x.kind === pg.kind; });
    text.appendChild(el('p', 'page__kicker', KIND[pg.kind] + (same.length > 1 ? ' · ' + (same.indexOf(pg) + 1) + ' of ' + same.length : '')));
    text.appendChild(el('h3', 'page__title', pg.title || ''));
    if (pg.quote) text.appendChild(el('blockquote', 'page__quote', pg.quote));
    if (pg.text) text.appendChild(el('p', 'page__text', pg.text));
    if (k === 0) text.appendChild(el('p', 'page__meta', [p.when, p.at, p.role].filter(Boolean).join(' · ')));
    sec.appendChild(text);
    if (visual) sec.appendChild(visual);
    return sec;
  }

  function select(i, user) {
    if (i === cur) return;
    var p = PROJECTS[i];
    cur = i;
    tiles.forEach(function (t, k) {
      var on = k === i;
      t.classList.toggle('is-pgm', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    $('[data-pgm-label]').textContent = p.title;
    $('[data-pgm-tag]').textContent = p.tag || '';

    pagesEl.textContent = ''; dotsEl.textContent = '';
    pageEls = p.pages.map(function (pg, k) { var s = buildPage(p, pg, k, p.pages.length); pagesEl.appendChild(s); return s; });
    dotEls = p.pages.map(function (pg, k) {
      var d = el('button', 'dot dot--' + pg.kind);
      d.type = 'button';
      d.setAttribute('aria-label', 'Page ' + (k + 1) + ': ' + KIND[pg.kind] + (pg.title ? ', ' + pg.title : ''));
      d.addEventListener('click', function () { go(k); });
      dotsEl.appendChild(d);
      return d;
    });
    screen.classList.toggle('is-single', p.pages.length < 2);
    go(0, true);
    if (user && !reduceMotion) { screen.classList.remove('is-wiping'); void screen.offsetWidth; screen.classList.add('is-wiping'); }
    if (user && history.replaceState) history.replaceState(null, '', '#' + p.id);
    if (user) keepInRail(tiles[i]);
  }
  // Scroll the rail (only the rail, never the page) so the chosen tile is fully visible.
  // Tile offsets are measured from the rail, which is their positioned parent (see gallery.css).
  function keepInRail(t) {
    var beh = reduceMotion ? 'auto' : 'smooth';
    if (sideways()) {
      var l = t.offsetLeft, r = l + t.offsetWidth;
      if (l < sourcesEl.scrollLeft) sourcesEl.scrollTo({ left: l, behavior: beh });
      else if (r > sourcesEl.scrollLeft + sourcesEl.clientWidth) sourcesEl.scrollTo({ left: r - sourcesEl.clientWidth, behavior: beh });
    } else {
      var top = t.offsetTop, bot = top + t.offsetHeight;
      if (top < sourcesEl.scrollTop) sourcesEl.scrollTo({ top: top, behavior: beh });
      else if (bot > sourcesEl.scrollTop + sourcesEl.clientHeight) sourcesEl.scrollTo({ top: bot - sourcesEl.clientHeight, behavior: beh });
    }
  }

  function go(k, instant) {
    k = Math.max(0, Math.min(pageEls.length - 1, k));
    page = k;
    pagesEl.style.transition = instant || reduceMotion ? 'none' : '';
    pagesEl.style.transform = 'translateX(' + (-k * 100) + '%)';
    pageEls.forEach(function (s, j) {
      var on = j === k;
      s.setAttribute('aria-hidden', String(!on));
      if (on) s.removeAttribute('inert'); else s.setAttribute('inert', '');
    });
    dotEls.forEach(function (d, j) {
      d.classList.toggle('is-on', j === k);
      if (j === k) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
    });
    var pg = PROJECTS[cur].pages[k];
    sectionEl.textContent = KIND[pg.kind];
    sectionEl.className = 'pgm__section pgm__section--' + pg.kind;
    countEl.textContent = ch(k + 1) + ' / ' + ch(pageEls.length);
    prevBtn.disabled = k === 0;
    nextBtn.disabled = k === pageEls.length - 1;
  }
  prevBtn.addEventListener('click', function () { go(page - 1); });
  nextBtn.addEventListener('click', function () { go(page + 1); });
  $('[data-pgm]').addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { go(page - 1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { go(page + 1); e.preventDefault(); }
  });

  // Swipe sideways on the window to turn pages (touch or mouse)
  var sw = null;
  pagesEl.addEventListener('pointerdown', function (e) { if (e.button) return; sw = { x: e.clientX, y: e.clientY }; });
  pagesEl.addEventListener('pointerup', function (e) {
    if (!sw) return;
    var dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(page + (dx < 0 ? 1 : -1));
  });
  pagesEl.addEventListener('pointercancel', function () { sw = null; });

  // Deep links: gallery.html#proc-control opens that project
  function fromHash() {
    var id = location.hash.slice(1), i = PROJECTS.findIndex(function (p) { return p.id === id; });
    return i < 0 ? 0 : i;
  }
  select(fromHash(), false);
  window.addEventListener('hashchange', function () { select(fromHash(), true); });
  railEnds();
  window.addEventListener('load', railEnds);

  /* ---------- Running timecode (hours:minutes:seconds:frames at 30 fps) ---------- */
  var tc = $('[data-tc]');
  function two(x) { return x < 10 ? '0' + x : String(x); }
  function tick() {
    var d = new Date();
    tc.textContent = two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()) + ':' + two(Math.floor(d.getMilliseconds() / 1000 * 30));
    if (reduceMotion) setTimeout(tick, 1000); else requestAnimationFrame(tick);
  }
  tick();
})();
