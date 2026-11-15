/* Design philosophy page: builds the example routing panels and runs the three demos.
   "before" = a cluttered panel of the kind I often find; "after" = the redesigned one,
   in three versions (v1.0 → v1.1 → v2.0) for the Improve demo. */
(function () {
  'use strict';
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- Panels ---------- */
  var FLAGS = { 'SRC 07': 1, 'SRC 12': 2, 'TAKE': 3 }; // where the Observe findings point

  function buildBefore(root) {
    root.appendChild(el('span', 'device__label', 'Router · Studio A'));
    var grid = el('div', 'pb');
    for (var i = 1; i <= 24; i++) grid.appendChild(key('SRC ' + (i < 10 ? '0' : '') + i));
    'ABCDEFGH'.split('').forEach(function (c) { grid.appendChild(key('DST ' + c, 'pb__dst')); });
    grid.appendChild(key('PAGE', 'pb__fn'));
    grid.appendChild(key('LOCK', 'pb__fn'));
    for (var g = 0; g < 5; g++) grid.appendChild(el('span', 'pb__gap'));
    grid.appendChild(key('TAKE', 'pb__take'));
    root.appendChild(grid);
    function key(t, cls) {
      var k = el('span', 'pb__key' + (cls ? ' ' + cls : ''), t);
      if (FLAGS[t]) { k.dataset.flag = FLAGS[t]; k.appendChild(el('b', 'pin', String(FLAGS[t]))); }
      return k;
    }
  }

  var SOURCES = ['CAM 1', 'CAM 2', 'CAM 3', 'CAM 4', 'REPLAY 1', 'REPLAY 2', 'GFX', 'CLIPS'];
  var DESTS = ['Program', 'Preview', 'Record'];
  function buildAfter(root, interactive) {
    var tag = interactive ? 'button' : 'span';
    root.appendChild(el('span', 'device__label', 'Router · Studio A'));
    var dests = el('div', 'pa__dests');
    DESTS.forEach(function (d, i) {
      var b = el(tag, 'pa__dest' + (i === 0 ? ' is-on' : ''), d);
      if (interactive) { b.type = 'button'; b.setAttribute('aria-pressed', String(i === 0)); }
      dests.appendChild(b);
    });
    root.appendChild(dests);
    var body = el('div', 'pa__body'), srcs = el('div', 'pa__srcs');
    SOURCES.forEach(function (s, i) {
      var b = el(tag, 'pa__src' + (i >= 4 ? ' pa__src--replay' : ''));
      b.dataset.i = i;
      b.appendChild(el('span', 'pa__name', s));
      if (interactive) b.type = 'button';
      srcs.appendChild(b);
    });
    var take = el(tag, 'pa__take', 'TAKE');
    if (interactive) take.type = 'button';
    body.appendChild(srcs); body.appendChild(take);
    root.appendChild(body);
  }

  $$('[data-panel]').forEach(function (root) {
    if (root.dataset.panel === 'before') buildBefore(root);
    else buildAfter(root, root.hasAttribute('data-live'));
  });

  /* ---------- 01 Observe: findings light up their spot on the panel ---------- */
  var observe = $('[data-observe]'), finds = $$('[data-find]');
  function flag(n) {
    $$('[data-flag]', observe).forEach(function (k) { k.classList.toggle('is-flagged', k.dataset.flag === String(n)); });
    finds.forEach(function (f) { f.classList.toggle('is-on', f.dataset.find === String(n)); });
  }
  finds.forEach(function (f) {
    f.tabIndex = 0;
    f.addEventListener('mouseenter', function () { flag(f.dataset.find); });
    f.addEventListener('focus', function () { flag(f.dataset.find); });
    f.addEventListener('click', function () { flag(f.dataset.find); });
  });
  $$('.pin', observe).forEach(function (p) {
    var n = p.textContent;
    p.parentNode.addEventListener('mouseenter', function () { flag(n); });
    p.parentNode.addEventListener('click', function () { flag(n); });
  });
  flag(1);

  /* ---------- 02 Reduce: before / after slider ---------- */
  var cmp = $('[data-compare]'), range = $('[data-compare-range]');
  function split() { cmp.style.setProperty('--split', range.value + '%'); }
  range.addEventListener('input', split);
  split();

  /* ---------- 03 Improve: versions + a panel you can operate ---------- */
  var VERSIONS = {
    1: { heard: 'Shipped: named sources replace “SRC 07”, and only three destinations to choose from.',
         changed: 'Next: watch it on air and listen.' },
    2: { heard: '“In a dark room I can’t tell which camera is live.”',
         changed: 'Added tally colours: red is on air, green is up next.' },
    3: { heard: '“I reach across the whole panel for TAKE on every cut.”',
         changed: 'Moved TAKE right beside the sources and made it the biggest button on the panel.' }
  };
  var live = $('[data-live]'), note = $('[data-live-note]');
  var tabs = $$('[data-v]'), heard = $('.feedback__heard'), changed = $('.feedback__changed');
  var st = { pvw: -1, pgm: 0 };
  function setVersion(v) {
    live.dataset.version = v;
    tabs.forEach(function (t) {
      var on = t.dataset.v === String(v);
      t.classList.toggle('is-on', on); t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
    });
    heard.textContent = VERSIONS[v].heard;
    changed.textContent = VERSIONS[v].changed;
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { setVersion(t.dataset.v); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); n.click(); e.preventDefault();
    });
  });
  function paint() {
    $$('.pa__src', live).forEach(function (b, i) {
      b.classList.toggle('is-pvw', i === st.pvw);
      b.classList.toggle('is-pgm', i === st.pgm);
      b.setAttribute('aria-pressed', String(i === st.pvw));
      b.setAttribute('aria-label', SOURCES[i] + (i === st.pgm ? ', on air' : i === st.pvw ? ', up next' : ''));
    });
  }
  $$('.pa__src', live).forEach(function (b, i) {
    b.addEventListener('click', function () {
      st.pvw = i === st.pgm ? -1 : i; paint();
      note.textContent = st.pvw < 0 ? 'already on air: pick another' : SOURCES[i] + ' is up next: now TAKE';
    });
  });
  $('.pa__take', live).addEventListener('click', function () {
    if (st.pvw < 0) { note.textContent = 'pick a source first'; return; }
    st.pgm = st.pvw; st.pvw = -1; paint();
    live.classList.remove('is-cut'); void live.offsetWidth; live.classList.add('is-cut');
    note.textContent = SOURCES[st.pgm] + ' is on air!';
  });
  $$('.pa__dest', live).forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.pa__dest', live).forEach(function (o) { o.classList.toggle('is-on', o === b); o.setAttribute('aria-pressed', String(o === b)); });
    });
  });
  setVersion(1);
  paint();
})();
