/* Design gallery: a multiviewer page of 12 equal inputs, each with an under-monitor label (UMD).
   Every case study in data.js that has an `id` fills the next input; then comes an open channel
   (colour bars) inviting the next project, and any inputs left over show "No signal".
   Choosing a project "takes" it to the programme monitor and shows its story. */
(function () {
  'use strict';
  var SITE = window.SITE;
  function $(s, el) { return (el || document).querySelector(s); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Collect the case studies from the timeline, keeping the stop each belongs to
  var PROJECTS = [];
  SITE.stops.forEach(function (s) {
    (s.cases || []).forEach(function (c) { if (c.id) PROJECTS.push(Object.assign({ when: s.when, at: s.title }, c)); });
  });
  PROJECTS.push({ id: 'next', title: 'Your project?', tag: 'Open channel', open: true });

  var sourcesEl = $('[data-sources]'), screen = $('[data-pgm-screen]'), pgmLabel = $('[data-pgm-label]');
  var storyEl = $('[data-story]');
  var COLS = 4, CHANNELS = Math.max(12, Math.ceil(PROJECTS.length / COLS) * COLS);
  function ch(n) { return String(n).padStart(2, '0'); }
  var tiles = PROJECTS.map(function (p, i) {
    var b = el('button', 'src' + (p.open ? ' src--open' : ''));
    b.type = 'button'; b.id = 'src-' + p.id;
    b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', 'story');
    var shot = el('span', 'src__shot');
    if (p.img) { var im = el('img'); im.src = p.img; im.alt = ''; shot.appendChild(im); }
    else shot.appendChild(el('span', 'bars'));
    b.appendChild(shot);
    var umd = el('span', 'umd');
    umd.appendChild(el('span', 'umd__tally'));
    umd.appendChild(el('span', 'umd__src', ch(i + 1)));
    umd.appendChild(el('span', 'umd__name', p.title));
    b.appendChild(umd);
    b.addEventListener('click', function () { take(i, true); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = (i + d + tiles.length) % tiles.length; tiles[n].focus(); take(n, true);
    });
    sourcesEl.appendChild(b);
    return b;
  });
  // Spare inputs: nothing plugged in yet
  for (var n = PROJECTS.length + 1; n <= CHANNELS; n++) {
    var e = el('div', 'src src--empty'); e.setAttribute('aria-hidden', 'true');
    var sh = el('span', 'src__shot'); sh.appendChild(el('span', 'src__nosig', 'No signal')); e.appendChild(sh);
    var u = el('span', 'umd');
    u.appendChild(el('span', 'umd__tally')); u.appendChild(el('span', 'umd__src', ch(n))); u.appendChild(el('span', 'umd__name', 'Input ' + ch(n)));
    e.appendChild(u);
    sourcesEl.appendChild(e);
  }
  $('[data-wall-count]').textContent = (PROJECTS.length - 1) + ' projects · ' + CHANNELS + ' inputs';
  storyEl.id = 'story';

  var cur = -1;
  function take(i, user) {
    if (i === cur) return;
    var p = PROJECTS[i];
    cur = i;
    tiles.forEach(function (t, k) {
      var on = k === i;
      t.classList.toggle('is-pgm', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });

    // Programme window: the new picture wipes in over the old one
    var layer = el('div', 'pgm__layer');
    if (p.img) { var im = el('img'); im.src = p.img; im.alt = p.title + ' interface screenshot'; layer.appendChild(im); }
    else { layer.appendChild(el('span', 'bars')); layer.appendChild(el('span', 'pgm__nosignal', 'Awaiting signal')); }
    screen.appendChild(layer);
    if (!reduceMotion && user) { layer.classList.add('is-wiping'); }
    var old = Array.prototype.slice.call(screen.children, 0, -1);
    setTimeout(function () { old.forEach(function (o) { o.remove(); }); }, reduceMotion || !user ? 0 : 450);
    pgmLabel.textContent = p.title;

    // The story underneath
    $('[data-s-tag]').textContent = p.tag || '';
    $('[data-s-title]').textContent = p.title;
    $('[data-s-meta]').textContent = p.open ? 'Channel ' + ch(i + 1) + ' · Next' : [p.when, p.at, p.role].filter(Boolean).join(' · ');
    $('[data-s-problem]').textContent = p.problem || p.blurb || '';
    $('[data-s-solution]').textContent = p.solution || '';
    $('[data-s-result]').textContent = p.result || '';
    $('[data-s-grid]').hidden = !!p.open;
    $('[data-s-open]').hidden = !p.open;
    storyEl.classList.remove('is-in'); void storyEl.offsetWidth; storyEl.classList.add('is-in');
    if (user && history.replaceState) history.replaceState(null, '', '#' + p.id);
    // Picked from the wall: bring the story up if it's below the fold
    if (user) {
      var r = storyEl.getBoundingClientRect();
      // lift it to a third of the way down, so the wall's last row stays in view for the next pick
      if (r.top > window.innerHeight * 0.7) window.scrollBy({ top: r.top - window.innerHeight * 0.35, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }
  $('[data-prev]').addEventListener('click', function () { take((cur - 1 + PROJECTS.length) % PROJECTS.length, true); });
  $('[data-next]').addEventListener('click', function () { take((cur + 1) % PROJECTS.length, true); });

  // Deep links: gallery.html#proc-control opens that project
  function fromHash() {
    var id = location.hash.slice(1), i = PROJECTS.findIndex(function (p) { return p.id === id; });
    return i < 0 ? 0 : i;
  }
  take(fromHash(), false);
  window.addEventListener('hashchange', function () { take(fromHash(), true); });

  /* Running timecode (hours:minutes:seconds:frames at 30 frames a second), from the local clock */
  var tc = $('[data-tc]');
  function two(n) { return n < 10 ? '0' + n : String(n); }
  function tick() {
    var d = new Date();
    tc.textContent = two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()) + ':' + two(Math.floor(d.getMilliseconds() / 1000 * 30));
    if (reduceMotion) setTimeout(tick, 1000); else requestAnimationFrame(tick);
  }
  tick();
})();
