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
  var yearEl = $('[data-year]'), collections = $('[data-collections]');
  var sidebar = $('[data-sidebar]'), drawerBtn = $('[data-drawer-open]'), totalEl = $('[data-total]');
  var prevBtn = $('[data-step="-1"]'), nextBtn = $('[data-step="1"]');

  function isMajor(i) { return STOPS[i].type !== 'minor'; }
  function label(i) { return STOPS[i].label || (STOPS[i].yr ? String(STOPS[i].yr) : ''); }

  /* Where each stop sits on the line. Each job's stretch grows with the number of key
     projects in it (one unit per step), but never shorter than MIN_SPAN so job names
     still fit. Key projects are spread evenly within their stretch. */
  var MIN_SPAN = 2.5;
  var POS = [], majors = [], PREV_MAJ = [], NEXT_MAJ = [];
  STOPS.forEach(function (s, i) { if (isMajor(i)) majors.push(i); });
  POS[majors[0]] = 0;
  majors.forEach(function (mi, k) {
    var next = majors[k + 1];
    if (next === undefined) return;
    var span = Math.max(next - mi, MIN_SPAN);
    for (var j = mi + 1; j <= next; j++) POS[j] = POS[mi] + span * (j - mi) / (next - mi);
    for (j = mi + 1; j < next; j++) { PREV_MAJ[j] = mi; NEXT_MAJ[j] = next; }
  });
  var POS_MAX = Math.max(1, POS[majors[majors.length - 1]]);

  // y = position in "stops" (0 … LAST), possibly fractional while moving between stops
  function posOf(y) {
    var i = Math.min(Math.floor(clamp(y, 0, LAST)), LAST - 1), f = clamp(y - i);
    return POS[i] + (POS[i + 1] - POS[i]) * f;
  }
  function yOfPos(p) {
    p = clamp(p, 0, POS_MAX);
    for (var i = 0; i < LAST; i++) if (p <= POS[i + 1]) return i + (p - POS[i]) / (POS[i + 1] - POS[i]);
    return LAST;
  }
  function pct(y) { return posOf(y) / POS_MAX * 100; }
  function nearest(y) { return Math.round(clamp(y, 0, LAST)); }
  var YEARS = []; // years with gaps (unknown years) filled from the stop before
  STOPS.forEach(function (s, i) { YEARS[i] = s.yr || YEARS[i - 1] || STOPS.find(function (t) { return t.yr; }).yr; });
  function yearAt(y) { // calendar year shown in the big number, interpolated between stops
    var i = Math.min(Math.floor(y), LAST - 1), f = clamp(y - i);
    return YEARS[i] + (YEARS[i + 1] - YEARS[i]) * f;
  }

  /* ---------- Timeline: milestone name above each dot, year below ---------- */
  var dots = [], yrs = [], names = [];
  /* Job names lean into whichever side has more room; two names leaning into the same
     stretch share it. Widths are a share of the line, so they scale with the screen. */
  var DIR = {};
  majors.forEach(function (mi, k) {
    if (k === 0) DIR[mi] = 'r';
    else if (k === majors.length - 1) DIR[mi] = 'l';
    else DIR[mi] = (POS[majors[k + 1]] - POS[mi]) >= (POS[mi] - POS[majors[k - 1]]) ? 'r' : 'l';
  });
  function nameWidth(k) {
    var mi = majors[k], nb = DIR[mi] === 'r' ? majors[k + 1] : majors[k - 1];
    if (nb === undefined) return 10;
    var gap = Math.abs(POS[nb] - POS[mi]);
    var shared = DIR[mi] === 'r' ? DIR[nb] === 'l' : DIR[nb] === 'r';
    return (shared ? gap / 2 : gap) / POS_MAX * 100;
  }
  STOPS.forEach(function (s, i) {
    var pos = pct(i) + '%', major = isMajor(i);
    var m = el('span', major ? 'ms ms--' + DIR[i] : 'ms ms--minor', s.short); m.style.left = pos;
    if (major) m.style.width = 'calc(' + nameWidth(majors.indexOf(i)).toFixed(3) + '% - 10px)';
    stopsEl.appendChild(m); names.push(m);
    var d = el('div', 'dot ' + (major ? 'dot--major' : 'dot--minor')); d.style.left = pos; stopsEl.appendChild(d); dots.push(d);
    var l = el('span', 'yr' + (major ? '' : ' yr--minor'), label(i)); l.style.left = pos; stopsEl.appendChild(l); yrs.push(l);
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

  /* ---------- Intro → header hand-off ----------
     The photo, name and title on the intro glide and shrink into their places in the
     header as the intro scrolls away, then cross-fade to the header's own copies. */
  var morphs = ['avatar', 'name', 'role'].map(function (k) {
    return { from: $('[data-morph="' + k + '"]'), to: $('[data-morph-to="' + k + '"]'), m: null };
  });
  function measureMorph() {
    var stickyTop = intro.parentNode.getBoundingClientRect().top;
    morphs.forEach(function (o) {
      o.from.style.transform = 'none';
      var a = o.from.getBoundingClientRect(), b = o.to.getBoundingClientRect();
      if (!a.width) { o.m = { skip: true }; return; }        // not shown on this screen size
      if (!b.width) { o.m = { fadeOnly: true }; return; }    // no room for it in the header here
      var sc = o.to.classList.contains('avatar')
        ? b.width / a.width
        : parseFloat(getComputedStyle(o.to).fontSize) / parseFloat(getComputedStyle(o.from).fontSize);
      var aTop = a.top - stickyTop;
      o.m = { dx: b.left - a.left, dy: (b.top + b.height / 2 - a.height * sc / 2) - aTop, sc: sc };
    });
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function renderMorph(q, barP) {
    var m = smooth(clamp((q - 0.05) / 0.9));
    var swap = clamp((m - 0.82) / 0.18);                   // cross-fade over the last stretch
    morphs.forEach(function (o) {
      var d = o.m; if (!d) return;
      if (d.skip) { o.to.style.opacity = barP; return; }
      if (d.fadeOnly) {
        o.from.style.opacity = 1 - clamp(m / 0.5);
        o.from.style.transform = reduceMotion ? 'none' : 'translateY(' + (-m * 40).toFixed(1) + 'px)';
        return;
      }
      if (reduceMotion) {
        o.from.style.opacity = 1 - clamp(q * 1.8);
        o.to.style.opacity = barP;
        return;
      }
      o.from.style.transform = 'translate(' + (d.dx * m).toFixed(1) + 'px,' + (d.dy * m).toFixed(1) + 'px) scale(' + (1 + (d.sc - 1) * m).toFixed(4) + ')';
      o.from.style.opacity = 1 - swap;
      o.to.style.opacity = swap;
    });
  }

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
    L.seg = Math.round(vh * 0.7);
    L.length = L.intro + (N - 1) * L.seg + Math.round(vh * 0.4);
    story.style.height = (vh + L.length) + 'px';
    L.top = story.offsetTop;
    measureMorph();
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
    card.classList.toggle('is-minor', !isMajor(i));
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
    // On phones the name flies up through the timeline row, so the timeline waits until it has passed
    setP(bar, '--tl-p', mobileMq.matches ? clamp((q - 0.8) / 0.2) : barP);
    renderMorph(q, barP);
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
      names[i].classList.toggle('is-on', i === near);
      names[i].classList.toggle('is-past', i < near);
      names[i].classList.toggle('is-dim', !isMajor(near) && (i === PREV_MAJ[near] || i === NEXT_MAJ[near]));
    });
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', String(LAST));
    handle.setAttribute('aria-valuenow', String(near));
    handle.setAttribute('aria-valuetext', (label(near) ? label(near) + ': ' : '') + STOPS[near].title);
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

    // Bring the newest pick-ups into view
    var inSide = added.filter(function (n) { return sidebar.contains(n); });
    var newClients = added.filter(function (n) { return lists.clients.el.contains(n); });
    if (forward && newClients.length && lists.clients.el.scrollWidth > lists.clients.el.clientWidth) {
      lists.clients.el.scrollTo({ left: lists.clients.el.scrollWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    // Desktop: scroll the sidebar so the newest tool / case study is visible
    if (forward && inSide.length && !mobileMq.matches) {
      var low = inSide.reduce(function (a, b) { return b.offsetTop > a.offsetTop ? b : a; });
      var sTop = sidebar.getBoundingClientRect().top, r = low.getBoundingClientRect();
      var over = r.bottom - (sTop + sidebar.clientHeight) + 16;
      if (over > 0) sidebar.scrollTop += over;
    }

    var total = nTools + nCases; // what's in the sidebar / mobile drawer
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
    var y = yOfPos(posOf(drag.oy) + (e.clientX - drag.sx) / drag.w * POS_MAX);
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
    var p = clamp((e.clientX - r.left) / r.width) * POS_MAX, best = 0;
    POS.forEach(function (q, i) { if (Math.abs(q - p) < Math.abs(POS[best] - p)) best = i; });
    goToStop(best);
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
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(true); frame(); }); // text sizes change once web fonts load
})();
