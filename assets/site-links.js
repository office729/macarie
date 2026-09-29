// Swaps the default social links in headers/footers for the ones set in the
// dashboard (Setări linkuri). Only anchors whose href is exactly a default
// value are touched, so video/product links are never affected.
(function () {
  var DEFAULTS = {
    'https://www.tiktok.com/@gpmacarieieromonahul': 'tiktok_url',
    'https://www.youtube.com/channel/UCK4gCwcPXXcR25kEh7hhRzA': 'youtube_url',
    'https://www.facebook.com/GrupulPsaltic.M.I/': 'facebook_url',
    'https://www.instagram.com/': 'instagram_url'
  };
  fetch('/api/content/settings')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var s = (d && d.items) || {};
      document.querySelectorAll('a[href]').forEach(function (a) {
        var key = DEFAULTS[a.getAttribute('href')];
        if (key && s[key]) a.setAttribute('href', s[key]);
      });
    })
    .catch(function () {});

  // Adds a "Dashboard" link to the nav only for someone with a valid admin
  // session cookie — regular visitors never get this link (the element is
  // never created for them, not just hidden), so it can't be seen or clicked
  // by mistake. The check itself is a cheap cookie-signature verification,
  // no database access, so it's safe to run on every public page load.
  fetch('/api/admin/me', { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (!d || !d.authenticated) return;
      var nav = document.querySelector('.site-nav');
      if (!nav) return;
      var a = document.createElement('a');
      a.href = '/admin/';
      a.textContent = 'Dashboard';
      a.style.cssText = 'padding: 10px 14px; border-radius: 999px; font-size: 13.5px; color: #8A6520; font-weight: 600; white-space: nowrap;';
      nav.appendChild(a);
    })
    .catch(function () {});
})();
