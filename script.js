(function () {
  'use strict';

  var SITE = window.SITE, STOPS = SITE.stops, N = STOPS.length, LAST = N - 1;
  // Positions on the timeline are measured in "stops" (0 = first stop, LAST = Now),
  // so stops are evenly spaced however many years apart they are.
  var Y0 = 0, Y1 = LAST;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobileMq = window.matchMedia('(max-width: 900px)');

  function $(sel, el) { return (el || document).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }
  function clamp(v, a, b) { return Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v)); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- Fill in name, photo, contact ---------- */
  $$('[data-name]').forEach(function (e) { e.textContent = SITE.name; });
  $$('[data-role]').forEach(function (e) { e.textContent = SITE.role; });
  $$('[data-avatar]').forEach(function (e) {
    if (SITE.photo) { var i = el('img'); i.src = SITE.photo; i.alt = ''; e.appendChild(i); }
    else e.textContent = SITE.initials;
  });
  $$('[data-email]').forEach(function (e) { e.href = 'mailto:' + SITE.email; e.textContent = SITE.email; });
  $$('[data-linkedin]').forEach(function (e) { e.href = SITE.linkedin; });
  var yrEl = $('[data-yr]'); if (yrEl) yrEl.textContent = new Date().getFullYear();

  /* ---------- Elements ---------- */
  var story = $('[data-story]'), intro = $('[data-intro]'), bar = $('[data-bar]'), stage = $('[data-stage]');
  var track = $('[data-track]'), fill = $('[data-fill]'), handle = $('[data-handle]'), stopsEl = $('[data-stops]');
  var card = $('[data-card]'), curMeta = $('[data-cur-meta]'), curTitle = $('[data-cur-title]'), curBody = $('[data-cur-body]');
  var projWrap = $('[data-projects-wrap]'), projList = $('[data-projects]'), cta = $('[data-cta]');
  var yearEl = $('[data-year]'), collections = $('[data-collections]'), gotEl = $('[data-got]'), badgesEl = $('[data-badges]');
  var sidebar = $('[data-sidebar]'), drawerBtn = $('[data-drawer-open]'), totalEl = $('[data-total]');
  var prevBtn = $('[data-step="-1"]'), nextBtn = $('[data-step="1"]');

  function label(i) { return STOPS[i].label || String(STOPS[i].yr); }
  function pct(y) { return y / LAST * 100; }
  function nearest(y) { return Math.round(clamp(y, 0, LAST)); }
  function yearAt(y) { // calendar year shown in the big number, interpolated between stops
    var i = Math.min(Math.floor(y), LAST - 1), f = clamp(y - i);
    return STOPS[i].yr + (STOPS[i + 1].yr - STOPS[i].yr) * f;
  }

  /* ---------- Timeline dots, labels and Collections badges ---------- */
  var dots = [], yrs = [], badges = [];
  STOPS.forEach(function (s, i) {
    var d = el('div', 'dot'); d.style.left = pct(i) + '%'; stopsEl.appendChild(d); dots.push(d);
    var l = el('span', 'yr', label(i)); l.dataset.i = i; l.style.left = pct(i) + '%'; stopsEl.appendChild(l); yrs.push(l);
    var b = el('button', 'badge'); b.type = 'button';
    b.appendChild(el('span', 'badge__yr', label(i))); b.appendChild(el('span', 'badge__t'));
    b.addEventListener('click', function () { goToStop(i); });
    badgesEl.appendChild(b); badges.push(b);
  });

  /* ---------- Collectable items (flattened, each tagged with the stop it belongs to) ---------- */
  function norm(x) { return typeof x === 'string' ? { name: x } : x; }
  var ITEMS = { clients: [], interface: [], creative: [], systems: [] }, CASES = [];
  STOPS.forEach(function (s, i) {
    (s.clients || []).forEach(function (c) { c = norm(c); ITEMS.clients.push({ key: 'c:' + c.name, name: c.name, accent: c.accent, stop: i }); });
    ['interface', 'creative', 'systems'].forEach(function (g) {
      ((s.tools || {})[g] || []).forEach(function (t) { ITEMS[g].push({ key: g + ':' + t, name: t, stop: i }); });
    });
    (s.cases || []).forEach(function (c) { CASES.push(Object.assign({ stop: i }, c)); });
  });
  var TOOL_TOTAL = ITEMS.interface.length + ITEMS.creative.length + ITEMS.systems.length;

  var lists = {};
  Object.keys(ITEMS).forEach(function (k) { lists[k] = { el: $('[data-list="' + k + '"]'), nodes: {} }; });

  function makeChip(item) {
    var li = el('li');
    if (item.accent) {
      li.className = 'chip--accent';
      var a = el('a', null, item.name); a.href = '#contact'; li.appendChild(a);
    } else li.textContent = item.name;
    return li;
  }

  // Keep a list in sync with "everything up to stop k": new items animate in, removed ones animate out.
  var added = []; // nodes collected in the latest step, so the sidebar can bring them into view
  function syncList(name, k) {
    var L = lists[name], prev = null, have = 0;
    ITEMS[name].forEach(function (item) {
      var node = L.nodes[item.key];
      if (item.stop <= k) {
        have++;
        if (!node) {
          node = L.nodes[item.key] = makeChip(item);
          node.classList.add('is-new'); added.push(node);
          node.addEventListener('animationend', function () { node.classList.remove('is-new'); });
          if (prev) prev.after(node); else L.el.prepend(node);
        } else if (node.classList.contains('is-leaving')) {
          node.classList.remove('is-leaving');
        }
        prev = node;
      } else if (node) {
        if (!node.classList.contains('is-leaving')) {
          node.classList.remove('is-new');
          node.classList.add('is-leaving');
          var done = function () { if (node.classList.contains('is-leaving')) { node.remove(); delete L.nodes[item.key]; } };
          node.addEventListener('animationend', done, { once: true });
          setTimeout(done, 400); // in case animations are disabled
        }
        prev = node;
      }
    });
    return have;
  }

  /* Case study slots: one per case, filled as they are collected */
  var casesEl = $('[data-cases]'), slots = CASES.map(function (c) {
    var b = el('button', 'slot' + (c.placeholder ? ' is-placeholder' : '')); b.type = 'button';
    b.appendChild(el('span', 'slot__q', '?'));
    b.setAttribute('aria-label', 'Case study not yet collected');
    b.disabled = true;
    b.addEventListener('click', function () { openCase(c); });
    casesEl.appendChild(b);
    return b;
  });
  function syncCases(k) {
    var have = 0;
    CASES.forEach(function (c, i) {
      var s = slots[i], on = c.stop <= k, filled = s.classList.contains('is-filled');
      if (on) have++;
      if (on && !filled) {
        s.textContent = '';
        if (c.img) { var im = el('img', 'slot__img'); im.src = c.img; im.alt = ''; im.loading = 'lazy'; s.appendChild(im); }
        s.appendChild(el('span', 'slot__cap', c.title));
        s.classList.add('is-filled', 'is-new'); added.push(s);
        s.addEventListener('animationend', function () { s.classList.remove('is-new'); }, { once: true });
        s.disabled = false;
        s.setAttribute('aria-label', 'Open case study: ' + c.title);
      } else if (!on && filled) {
        s.classList.remove('is-filled', 'is-new');
        s.textContent = ''; s.appendChild(el('span', 'slot__q', '?'));
        s.disabled = true;
        s.setAttribute('aria-label', 'Case study not yet collected');
      }
    });
    return have;
  }

  /* Case study viewer */
  var viewer = $('[data-viewer]');
  function openCase(c) {
    if (c.placeholder) { location.hash = '#contact'; return; }
    var shot = $('[data-viewer-shot]', viewer); shot.textContent = '';
    if (c.img) { var im = el('img'); im.src = c.img; im.alt = c.title + ' interface screenshot'; shot.appendChild(im); }
    $('[data-viewer-tag]', viewer).textContent = c.tag || '';
    $('[data-viewer-title]', viewer).textContent = c.title;
    $('[data-viewer-blurb]', viewer).textContent = c.blurb || '';
    $('[data-viewer-when]', viewer).textContent = STOPS[c.stop].when + ' · ' + STOPS[c.stop].title;
    if (viewer.showModal) viewer.showModal(); else viewer.setAttribute('open', '');
  }
  viewer.addEventListener('click', function (e) { if (e.target === viewer) viewer.close(); });

  /* ---------- Scroll ↔ timeline mapping ----------
     The story section is tall; its contents stay pinned while you scroll through it.
     First stretch of scroll = intro fading away. Then each gap between milestones gets
     an equal stretch of scroll, with a pause (PAUSE) around each milestone so the card
     can be read before the next one starts sliding in. */
  var PAUSE = 0.22;
  var L = { vh: 0, w: 0, intro: 0, seg: 0, top: 0, length: 0 };
  function layout(force) {
    var vh = window.innerHeight, w = window.innerWidth;
    // Ignore small height changes (mobile address bar showing/hiding) to avoid jumps
    if (!force && w === L.w && Math.abs(vh - L.vh) < 120) return;
    L.vh = vh; L.w = w;
    L.intro = Math.round(vh * 0.9);
    L.seg = Math.round(vh * 0.85);
    L.length = L.intro + (N - 1) * L.seg + Math.round(vh * 0.4);
    story.style.height = (vh + L.length) + 'px';
    L.top = story.offsetTop;
  }
  function yFromT(t) {
    var i = Math.min(Math.floor(t), N - 2), f = t - i;
    var g = clamp((f - PAUSE) / (1 - 2 * PAUSE));
    return i + g;
  }
  function scrollForY(y) {
    var i = Math.min(Math.floor(y), N - 2), g = clamp(y - i);
    var f = g <= 0 ? 0 : g >= 1 ? 1 : PAUSE + g * (1 - 2 * PAUSE);
    return L.top + L.intro + (i + f) * L.seg;
  }
  function scrollForStop(i) { return L.top + L.intro + i * L.seg; }

  var target = { i: -1, until: 0 }; // where a smooth scroll is heading, so repeated clicks keep stepping
  function goToStop(i) {
    i = clamp(i, 0, LAST);
    target = { i: i, until: performance.now() + 900 };
    window.scrollTo({ top: scrollForStop(i), behavior: reduceMotion ? 'auto' : 'smooth' });
    closeDrawer();
  }
  function step(dir) {
    var from = performance.now() < target.until ? target.i : nearest(state.y);
    goToStop(from + dir);
  }

  /* ---------- Card ---------- */
  var shownIdx = -1;
  function fillCard(i) {
    var s = STOPS[i];
    curMeta.textContent = s.when + ' · ' + s.kind;
    curTitle.textContent = s.title;
    curBody.textContent = s.body;
    projList.textContent = '';
    (s.projects || []).forEach(function (p) {
      var li = el('li'); li.appendChild(el('strong', null, p.name)); if (p.note) li.appendChild(el('span', null, p.note));
      projList.appendChild(li);
    });
    projWrap.hidden = !(s.projects && s.projects.length);
    cta.hidden = !s.cta;
    shownIdx = i;
  }
  function slideDistance() { return window.innerWidth <= 720 ? 36 : 64; }
  // Signed distance from milestone i: ±1 at the midpoint to the neighbour. Positive = handle to the right.
  function offsetFrom(i, y) {
    var delta = y - i, nb = delta >= 0 ? STOPS[i + 1] : STOPS[i - 1];
    if (!nb) return 0;
    return clamp(delta / 0.5, -1, 1);
  }

  /* ---------- Render ---------- */
  var state = { y: Y0, k: -2, total: 0 };
  function setP(node, name, v) { node.style.setProperty(name, v.toFixed(3)); }

  function frame() {
    var s = window.scrollY - L.top;
    var q = clamp(s / L.intro);                       // intro progress 0→1
    var t = clamp((s - L.intro) / L.seg, 0, N - 1);   // timeline progress 0→N-1
    var y = yFromT(t);
    state.y = y;

    setP(intro, '--intro-p', q);
    var barP = clamp((q - 0.45) / 0.45), stageP = clamp((q - 0.55) / 0.4), collP = clamp((q - 0.75) / 0.25);
    setP(bar, '--bar-p', barP);
    setP(stage, '--stage-p', stageP);
    setP(collections, '--coll-p', collP);
    intro.classList.toggle('is-gone', q >= 1);
    bar.classList.toggle('is-live', barP > 0.5);
    stage.classList.toggle('is-live', stageP > 0.5);
    var inStory = stageP > 0.5 && s < L.length + L.vh * 0.3;
    drawerBtn.classList.toggle('is-live', inStory);
    if (!inStory) closeDrawer();

    // Timeline handle
    var p = pct(y);
    handle.style.left = p + '%';
    fill.style.width = p + '%';
    var near = nearest(y);

    // Card follows the handle: slides the same way and fades towards the midpoint
    if (near !== shownIdx) fillCard(near);
    var d = offsetFrom(near, y);
    card.style.opacity = String(1 - Math.pow(Math.abs(d), 1.6));
    card.style.transform = reduceMotion ? 'none' : 'translateX(' + (d * slideDistance()).toFixed(1) + 'px)';
    yearEl.textContent = near === LAST ? 'Now' : String(Math.round(yearAt(y)));

    // What's been collected so far (nothing until the intro is done)
    var k = q < 0.85 ? -1 : near;
    if (k !== state.k) collect(k);

    STOPS.forEach(function (st, i) {
      dots[i].classList.toggle('is-past', i <= y + 0.001);
      yrs[i].classList.toggle('is-on', i === near);
    });
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', String(LAST));
    handle.setAttribute('aria-valuenow', String(near));
    handle.setAttribute('aria-valuetext', label(near) + ': ' + STOPS[near].title);
    prevBtn.disabled = near === 0;
    nextBtn.disabled = near === LAST;
  }

  function collect(k) {
    var forward = k > state.k;
    state.k = k; added = [];
    var nClients = syncList('clients', k);
    var nTools = syncList('interface', k) + syncList('creative', k) + syncList('systems', k);
    var nCases = syncCases(k);
    $('[data-count="clients"]').textContent = nClients + ' / ' + ITEMS.clients.length;
    $('[data-count="tools"]').textContent = nTools + ' / ' + TOOL_TOTAL;
    $('[data-count="cases"]').textContent = nCases + ' / ' + CASES.length;
    $('[data-empty="clients"]').hidden = nClients > 0;

    var got = k + 1;
    gotEl.textContent = got + ' of ' + N + ' milestones';
    badges.forEach(function (b, i) {
      var have = i <= k;
      b.classList.toggle('is-have', have);
      b.querySelector('.badge__t').textContent = have ? STOPS[i].short : 'Not yet';
      b.setAttribute('aria-label', label(i) + ': ' + (have ? STOPS[i].short : 'not yet reached') + '. Go to this milestone.');
    });

    // Desktop: scroll the sidebar so the newest pick-up is visible (case studies sit at the bottom)
    if (forward && added.length && !mobileMq.matches) {
      var low = added.reduce(function (a, b) { return b.offsetTop > a.offsetTop ? b : a; });
      var sTop = sidebar.getBoundingClientRect().top, r = low.getBoundingClientRect();
      var over = r.bottom - (sTop + sidebar.clientHeight) + 16;
      if (over > 0) sidebar.scrollTop += over;
    }

    var total = nClients + nTools + nCases;
    if (total > state.total) {
      drawerBtn.classList.remove('is-pulse'); void drawerBtn.offsetWidth; drawerBtn.classList.add('is-pulse');
    }
    state.total = total;
    totalEl.textContent = total;
  }

  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; frame(); }); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { layout(false); frame(); });

  /* ---------- Dragging the handle scrolls the page ---------- */
  var drag = null;
  handle.addEventListener('pointerdown', function (e) {
    if (e.button && e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    handle.focus({ preventScroll: true });
    drag = { sx: e.clientX, oy: state.y, w: track.getBoundingClientRect().width };
    track.classList.add('is-dragging');
    try { handle.setPointerCapture(e.pointerId); } catch (_) {}
  });
  handle.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var y = clamp(drag.oy + (e.clientX - drag.sx) / drag.w * (Y1 - Y0), Y0, Y1);
    window.scrollTo({ top: scrollForY(y), behavior: 'instant' });
  });
  function endDrag() {
    if (!drag) return;
    drag = null; track.classList.remove('is-dragging');
    goToStop(nearest(state.y)); // settle on the closest milestone
  }
  handle.addEventListener('pointerup', endDrag);
  handle.addEventListener('pointercancel', endDrag);

  track.addEventListener('pointerdown', function (e) {
    if (handle.contains(e.target)) return;
    var r = track.getBoundingClientRect();
    goToStop(nearest(Y0 + clamp((e.clientX - r.left) / r.width) * (Y1 - Y0)));
  });
  handle.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowLeft' || k === 'ArrowDown') { step(-1); e.preventDefault(); }
    else if (k === 'ArrowRight' || k === 'ArrowUp') { step(1); e.preventDefault(); }
    else if (k === 'Home') { goToStop(0); e.preventDefault(); }
    else if (k === 'End') { goToStop(LAST); e.preventDefault(); }
  });
  prevBtn.addEventListener('click', function () { step(-1); });
  nextBtn.addEventListener('click', function () { step(1); });
  $('.brand').addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Mobile drawer ---------- */
  var stageHome = sidebar.parentNode;
  function placeSidebar() {
    // A fixed drawer can't live inside the faded/transformed stage, so move it to <body> on small screens
    if (mobileMq.matches) { if (sidebar.parentNode !== document.body) document.body.appendChild(sidebar); }
    else { closeDrawer(); if (sidebar.parentNode !== stageHome) stageHome.appendChild(sidebar); }
  }
  function openDrawer() { sidebar.classList.add('is-open'); drawerBtn.setAttribute('aria-expanded', 'true'); }
  function closeDrawer() { if (!sidebar.classList.contains('is-open')) return; sidebar.classList.remove('is-open'); drawerBtn.setAttribute('aria-expanded', 'false'); }
  drawerBtn.setAttribute('aria-expanded', 'false');
  drawerBtn.addEventListener('click', function () { sidebar.classList.contains('is-open') ? closeDrawer() : openDrawer(); });
  $('[data-drawer-close]').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
  if (mobileMq.addEventListener) mobileMq.addEventListener('change', placeSidebar); else mobileMq.addListener(placeSidebar);

  /* ---------- Start ---------- */
  placeSidebar();
  layout(true);
  fillCard(0);
  collect(-1);
  frame();
  window.addEventListener('load', function () { layout(true); frame(); });
})();
