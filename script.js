(function () {
  'use strict';

  /* ---------- Career scrubber (ported from the mockup's logic) ---------- */
  var Y0 = 2015, Y1 = 2026;
  var STOPS = [
    { yr: 2015, when: '2015 to 2017', kind: 'Control room', short: 'Live sports', title: 'Giants, Sharks, Stanford', body: 'Technical director, replay, graphics and video engineering for live sports. I learned what operators need when it all happens at once.' },
    { yr: 2017, when: '2017 to 2022', kind: 'EVS · Burbank', short: 'Solutions Architect', title: 'Solutions Architect', body: 'Shaped systems for Apple, Meta, Riot Games, NBC, ESPN and CBS, and built the Cerebrum interfaces behind every demo.' },
    { yr: 2022, when: '2022 to now', kind: 'EVS · Remote', short: 'Senior Tech Architect', title: 'Senior Technical Architect', body: 'Designing, coding and supporting operator interfaces used daily at 15+ live facilities, from routing panels to master control.' },
    { yr: 2025, when: '2025', kind: 'Certificate', short: 'Google UX', title: 'Google UX Design certificate', body: 'Putting formal UX method behind ten years of designing with operators at their desks.' },
    { yr: 2026, when: 'Now', kind: 'Looking for', short: 'UI / UX role', title: 'A UI / UX design role', body: 'Simple, clean interfaces anyone can pick up without training. Hybrid or remote from Millbrae, CA.' }
  ];
  var LAST = STOPS.length - 1;

  var root = document.getElementById('timeline');
  if (root) initScrubber(root);

  function initScrubber(root) {
    var $ = function (sel) { return root.querySelector(sel); };
    var track = $('[data-track]'), fill = $('[data-fill]'), handle = $('[data-handle]');
    var stopsEl = $('[data-stops]'), badgesEl = $('[data-badges]');
    var curMeta = $('[data-cur-meta]'), curTitle = $('[data-cur-title]'), curBody = $('[data-cur-body]');
    var yearEl = $('[data-year]'), gotEl = $('[data-got]');
    var prevBtn = root.querySelector('[data-step="-1"]'), nextBtn = root.querySelector('[data-step="1"]');

    // state.y is a (fractional) year between Y0 and Y1 — same model as the mockup's x.
    var state = { y: 2022, drag: null, seen: { 2: true }, lastIdx: -1 };

    function pct(y) { return (y - Y0) / (Y1 - Y0) * 100; }
    function label(i) { return i === LAST ? 'Now' : String(STOPS[i].yr); }
    function idxAt(y) { var b = 0; STOPS.forEach(function (s, i) { if (s.yr <= y + 0.001) b = i; }); return b; }
    function nearest(y) {
      var b = 0;
      STOPS.forEach(function (s, i) { if (Math.abs(s.yr - y) < Math.abs(STOPS[b].yr - y)) b = i; });
      return b;
    }
    function yFromClientX(clientX) {
      var r = track.getBoundingClientRect();
      var f = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      return Y0 + f * (Y1 - Y0);
    }

    // Build dots, labels, badges
    var dots = [], yrs = [], badges = [];
    STOPS.forEach(function (s, i) {
      var d = document.createElement('div');
      d.className = 'dot'; d.style.left = pct(s.yr) + '%';
      stopsEl.appendChild(d); dots.push(d);

      var l = document.createElement('span');
      l.className = 'yr'; l.dataset.i = i; l.style.left = pct(s.yr) + '%'; l.textContent = label(i);
      stopsEl.appendChild(l); yrs.push(l);

      var b = document.createElement('button');
      b.type = 'button'; b.className = 'badge';
      b.innerHTML = '<span class="badge__yr"></span><span class="badge__t"></span>';
      b.querySelector('.badge__yr').textContent = label(i);
      b.addEventListener('click', function () { goTo(i); });
      badgesEl.appendChild(b); badges.push(b);
    });

    function goTo(i) {
      i = Math.max(0, Math.min(LAST, i));
      state.y = STOPS[i].yr; state.seen[i] = true; render();
    }
    function jump(dir) { goTo(idxAt(state.y) + dir); }

    function render() {
      var cur = idxAt(state.y), s = STOPS[cur], p = pct(state.y);
      handle.style.left = p + '%';
      fill.style.width = p + '%';

      if (cur !== state.lastIdx) {
        curMeta.textContent = s.when + ' · ' + s.kind;
        curTitle.textContent = s.title;
        curBody.textContent = s.body;
        state.lastIdx = cur;
      }
      yearEl.textContent = cur === LAST ? 'Now' : String(Math.round(state.y));

      var got = Object.keys(state.seen).length;
      gotEl.textContent = 'Milestones collected: ' + got + ' of ' + STOPS.length;

      STOPS.forEach(function (st, i) {
        dots[i].classList.toggle('is-past', st.yr <= state.y + 0.001);
        yrs[i].classList.toggle('is-on', i === cur);
        var have = !!state.seen[i];
        badges[i].classList.toggle('is-have', have);
        badges[i].querySelector('.badge__t').textContent = have ? st.short : 'Not yet';
        badges[i].setAttribute('aria-label', label(i) + ': ' + (have ? st.short : 'not yet collected') + '. Show this milestone.');
        badges[i].setAttribute('aria-current', i === cur ? 'step' : 'false');
      });

      handle.setAttribute('aria-valuenow', String(Math.round(state.y)));
      handle.setAttribute('aria-valuetext', label(cur) + ': ' + s.title);
      prevBtn.disabled = cur === 0;
      nextBtn.disabled = cur === LAST;
    }

    // Dragging the handle (relative, like the mockup)
    handle.addEventListener('pointerdown', function (e) {
      if (e.button && e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();
      handle.focus({ preventScroll: true });
      var r = track.getBoundingClientRect();
      state.drag = { sx: e.clientX, oy: state.y, w: r.width };
      track.classList.add('is-dragging');
      try { handle.setPointerCapture(e.pointerId); } catch (_) {}
    });
    handle.addEventListener('pointermove', function (e) {
      var d = state.drag; if (!d) return;
      var y = d.oy + (e.clientX - d.sx) / d.w * (Y1 - Y0);
      state.y = Math.max(Y0, Math.min(Y1, y));
      state.seen[idxAt(state.y)] = true;
      render();
    });
    function endDrag() {
      if (!state.drag) return;
      state.drag = null;
      track.classList.remove('is-dragging');
      goTo(nearest(state.y));
    }
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);

    // Clicking/tapping the line jumps to the nearest milestone
    track.addEventListener('pointerdown', function (e) {
      if (e.target === handle || handle.contains(e.target)) return;
      goTo(nearest(yFromClientX(e.clientX)));
    });

    // Keyboard
    handle.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'ArrowLeft' || k === 'ArrowDown') { jump(-1); e.preventDefault(); }
      else if (k === 'ArrowRight' || k === 'ArrowUp') { jump(1); e.preventDefault(); }
      else if (k === 'Home') { goTo(0); e.preventDefault(); }
      else if (k === 'End') { goTo(LAST); e.preventDefault(); }
    });

    prevBtn.addEventListener('click', function () { jump(-1); });
    nextBtn.addEventListener('click', function () { jump(1); });

    render();
  }

  /* ---------- Nav: border on scroll + active section ---------- */
  var nav = document.querySelector('.nav');
  function onScroll() { nav.classList.toggle('is-stuck', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if ('IntersectionObserver' in window) {
    var links = {};
    document.querySelectorAll('.nav__links a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.toggle('is-active', k === en.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  var yr = document.querySelector('[data-yr]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
