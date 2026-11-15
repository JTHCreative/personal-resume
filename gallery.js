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
  var trackEl = el('div', 'sources__track'); sourcesEl.appendChild(trackEl); // tiles live on a track that can stretch past the ends
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
    if (p.img) { var im = el('img'); im.src = p.img; im.alt = ''; im.draggable = false; shot.appendChild(im); }
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
    trackEl.appendChild(b);
    return b;
  });
  for (var n = PROJECTS.length + 1; n <= CHANNELS; n++) { // spare inputs: nothing plugged in yet
    var e = el('div', 'src src--empty'); e.setAttribute('aria-hidden', 'true');
    var sh = el('span', 'src__shot'); sh.appendChild(el('span', 'src__nosig', 'No signal')); e.appendChild(sh);
    e.appendChild(umd(ch(n), 'Input ' + ch(n)));
    trackEl.appendChild(e);
  }
  $('[data-wall-count]').textContent = (PROJECTS.length - 1) + ' projects · ' + CHANNELS + ' inputs';

  // Up / down buttons on the rail (left / right when the rail lies sideways on phones)
  var railUp = $('[data-rail-step="-1"]'), railDown = $('[data-rail-step="1"]');
  function sideways() { return getComputedStyle(trackEl).flexDirection === 'row'; }
  function railStep(dir) {
    var t = tiles[0], gap = 8, beh = reduceMotion ? 'auto' : 'smooth';
    settle();
    if (sideways()) sourcesEl.scrollBy({ left: dir * (t.offsetWidth + gap), behavior: beh });
    else sourcesEl.scrollBy({ top: dir * (t.offsetHeight + gap), behavior: beh });
  }
  function railEnds() {
    var side = sideways();
    var pos = side ? sourcesEl.scrollLeft : sourcesEl.scrollTop;
    var max = side ? sourcesEl.scrollWidth - sourcesEl.clientWidth : sourcesEl.scrollHeight - sourcesEl.clientHeight;
    railUp.disabled = pos <= 4;           // a few pixels of slack
    railDown.disabled = pos >= max - 4;
  }
  railUp.addEventListener('click', function () { railStep(-1); });
  railDown.addEventListener('click', function () { railStep(1); });
  sourcesEl.addEventListener('scroll', railEnds, { passive: true });
  window.addEventListener('resize', railEnds);

  /* ---------- Grab the rail: drag with momentum and rubber banding ----------
     Works the same with a mouse and a finger. Drag and the rail follows. Let go mid-drag and
     it keeps gliding with the speed you gave it, slowing down like a puck on ice. Pulled past
     either end it stretches with growing resistance, and springs back when released (a fast
     flick into an end overshoots a little and bounces back). Pressing while it glides catches
     it. A click or tap without movement still picks a project. */
  var FRICTION = 0.95;                       // share of speed kept per 16ms frame while gliding
  var K = 0.0009, C = 2 * Math.sqrt(K);      // spring stiffness / damping at the ends (no wobble)
  var phys = { raf: 0, pos: 0, v: 0, last: 0 };
  var curOver = 0;                           // how far the track is stretched past an end (px)
  function axis() { return sideways() ? 'scrollLeft' : 'scrollTop'; }
  function maxScroll() { return Math.max(0, sideways() ? sourcesEl.scrollWidth - sourcesEl.clientWidth : sourcesEl.scrollHeight - sourcesEl.clientHeight); }
  function viewSize() { return (sideways() ? sourcesEl.clientWidth : sourcesEl.clientHeight) || 300; }
  function clampPos(p) { return Math.max(0, Math.min(maxScroll(), p)); }
  // The further you pull past an end, the less the rail moves (the curve iOS uses), and back again
  function rubber(x) { var d = viewSize(); return (1 - 1 / (Math.abs(x) * 0.55 / d + 1)) * d * Math.sign(x); }
  function unrubber(y) { var d = viewSize(), a = Math.min(Math.abs(y), d * 0.99); return d * (1 / (1 - a / d) - 1) / 0.55 * Math.sign(y); }
  // Show a position along the rail; anything past an end shows as stretch on the track
  function render(pos, band) {
    var inside = clampPos(pos), over = pos - inside;
    sourcesEl[axis()] = inside;
    curOver = band ? rubber(over) : over;
    trackEl.style.transform = Math.abs(curOver) > 0.05 ? (sideways() ? 'translateX(' : 'translateY(') + (-curOver).toFixed(1) + 'px)' : '';
    if (!curOver) curOver = 0;
  }
  function visual() { return sourcesEl[axis()] + curOver; }
  function stopPhys() { cancelAnimationFrame(phys.raf); phys.raf = 0; }
  function settle() { stopPhys(); if (curOver) render(clampPos(visual()), false); } // jump to rest (used before button scrolling)
  function glide(pos, v) {
    stopPhys();
    if (reduceMotion) { render(clampPos(pos), false); return; }
    phys.pos = pos; phys.v = Math.max(-6, Math.min(6, v)); phys.last = performance.now();
    phys.raf = requestAnimationFrame(stepPhys);
  }
  function stepPhys(now) {
    var dt = Math.min(32, now - phys.last); phys.last = now;
    var max = maxScroll(), p = phys.pos, v = phys.v;
    var bound = p < 0 ? 0 : p > max ? max : null;
    if (bound === null) v *= Math.pow(FRICTION, dt / 16);       // friction while inside
    else v += (-K * (p - bound) - C * v) * dt;                   // spring pulls it back past an end
    p += v * dt;
    phys.pos = p; phys.v = v;
    var nb = p < 0 ? 0 : p > max ? max : null;
    if (Math.abs(v) < 0.02 && (nb === null || Math.abs(p - nb) < 0.5)) { render(nb === null ? p : nb, false); phys.raf = 0; return; }
    render(p, false);
    phys.raf = requestAnimationFrame(stepPhys);
  }

  var grab = null, justDragged = false;
  sourcesEl.addEventListener('pointerdown', function (e) {
    if (e.button) return;
    justDragged = false;
    var caught = !!phys.raf;
    stopPhys();
    var start = clampPos(visual()) + unrubber(visual() - clampPos(visual())); // finger position matching what's on screen
    grab = { id: e.pointerId, side: sideways(), x: e.clientX, y: e.clientY, start: start, live: false, caught: caught, samples: [] };
  });
  sourcesEl.addEventListener('pointermove', function (e) {
    if (!grab || e.pointerId !== grab.id) return;
    var d = grab.side ? e.clientX - grab.x : e.clientY - grab.y;
    var cross = grab.side ? e.clientY - grab.y : e.clientX - grab.x;
    if (!grab.live) {
      if (Math.abs(d) < 6 && Math.abs(cross) < 6) return;          // not a drag yet: could still be a click
      if (Math.abs(cross) > Math.abs(d)) { release(e); return; }   // moving across the rail: not ours
      grab.live = true;
      sourcesEl.classList.add('is-grabbing');
      try { sourcesEl.setPointerCapture(e.pointerId); } catch (_) {}
    }
    e.preventDefault();
    var raw = grab.start - d;
    render(raw, true);
    var now = performance.now();
    grab.samples.push({ t: now, p: raw });
    while (grab.samples.length > 2 && now - grab.samples[0].t > 100) grab.samples.shift();
  });
  function release(e) {
    if (!grab || e.pointerId !== grab.id) return;
    var g = grab; grab = null;
    sourcesEl.classList.remove('is-grabbing');
    if (g.live || g.caught) justDragged = true;                   // so the tile under the pointer isn't picked
    var v = 0, s = g.samples;
    if (g.live && s.length > 1) {
      var a = s[0], b = s[s.length - 1];
      if (performance.now() - b.t < 80) v = (b.p - a.p) / Math.max(1, b.t - a.t);  // a pause before letting go isn't a flick
    }
    var pos = visual();
    if (pos !== clampPos(pos)) v = 0;                             // let go while stretched: just spring back
    glide(pos, v);
  }
  sourcesEl.addEventListener('pointerup', release);
  sourcesEl.addEventListener('pointercancel', release);
  sourcesEl.addEventListener('click', function (e) {
    if (justDragged) { e.stopPropagation(); e.preventDefault(); justDragged = false; }
  }, true);
  sourcesEl.addEventListener('wheel', function () { if (phys.raf && !curOver) stopPhys(); }, { passive: true });

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
    settle();
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
