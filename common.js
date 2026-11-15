/* Shared by the Design philosophy and Design gallery pages:
   fills in name, photo, email and LinkedIn from data.js. */
(function () {
  'use strict';
  var SITE = window.SITE;
  function all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  all('[data-name]').forEach(function (e) { e.textContent = SITE.name; });
  all('[data-role]').forEach(function (e) { e.textContent = SITE.role; });
  all('[data-avatar]').forEach(function (e) {
    if (SITE.photo) { var i = document.createElement('img'); i.src = SITE.photo; i.alt = ''; e.appendChild(i); }
    else e.textContent = SITE.initials;
  });
  all('[data-email]').forEach(function (e) { e.href = 'mailto:' + SITE.email; e.textContent = SITE.email; });
  all('[data-linkedin]').forEach(function (e) { e.href = SITE.linkedin; });
  all('[data-yr]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
})();
