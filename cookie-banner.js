// ═══════════════════════════════════════════════════════════════
// Vantage Home — GDPR Cookie Consent Banner
// Free, no third-party service needed. Works on all pages.
// GA4 only loads AFTER visitor clicks Accept.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var GA_ID = 'G-LW2GQKDG3P';
  var CONSENT_KEY = 'vh_cookie_consent';

  // ── Load GA4 only after consent ──────────────────────────────
  function loadGA() {
    if (document.getElementById('vh-ga-script')) return;
    var s = document.createElement('script');
    s.id  = 'vh-ga-script';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  // ── Check existing consent ───────────────────────────────────
  var existing = localStorage.getItem(CONSENT_KEY);
  if (existing === 'accepted') { loadGA(); return; }
  if (existing === 'declined') { return; }

  // ── Build banner ─────────────────────────────────────────────
  var banner = document.createElement('div');
  banner.id = 'vh-cookie-banner';
  banner.innerHTML = [
    '<div style="max-width:900px;margin:0 auto;display:flex;flex-wrap:wrap;',
    'align-items:center;gap:12px;justify-content:space-between;">',
    '<div style="flex:1;min-width:220px;font-size:13.5px;line-height:1.6;color:#e5e7eb;">',
    '<strong style="color:#fff;">We value your privacy</strong><br>',
    'We use Google Analytics to understand how visitors use our site. ',
    'No data is sold. ',
    '<a href="/privacy.html" style="color:#C9A84C;text-decoration:underline;">Privacy Policy</a>',
    '</div>',
    '<div style="display:flex;gap:10px;flex-shrink:0;">',
    '<button id="vh-cookie-decline" style="',
      'padding:9px 18px;border-radius:6px;border:1px solid #6b7280;',
      'background:transparent;color:#d1d5db;cursor:pointer;font-size:13px;',
      'font-family:inherit;white-space:nowrap;">Decline</button>',
    '<button id="vh-cookie-accept" style="',
      'padding:9px 20px;border-radius:6px;border:none;',
      'background:#C9A84C;color:#fff;cursor:pointer;font-size:13px;',
      'font-weight:600;font-family:inherit;white-space:nowrap;">Accept</button>',
    '</div>',
    '</div>'
  ].join('');

  banner.style.cssText = [
    'position:fixed;bottom:0;left:0;right:0;z-index:99999;',
    'background:#1a1a2e;border-top:2px solid #C9A84C;',
    'padding:14px 20px;box-shadow:0 -4px 20px rgba(0,0,0,.3);',
    'font-family:Inter,sans-serif;'
  ].join('');

  // ── Button handlers ──────────────────────────────────────────
  function removeBanner() {
    if (banner.parentNode) banner.parentNode.removeChild(banner);
  }

  banner.querySelector('#vh-cookie-accept').addEventListener('click', function () {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    loadGA();
    removeBanner();
  });

  banner.querySelector('#vh-cookie-decline').addEventListener('click', function () {
    localStorage.setItem(CONSENT_KEY, 'declined');
    removeBanner();
  });

  // ── Show banner after page loads ─────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.appendChild(banner);
    });
  } else {
    document.body.appendChild(banner);
  }

})();
