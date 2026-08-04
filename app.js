// ==========================================================================
// Nexus' Software Wiki - Client Application Script (jQuery Implementation)
// Author: Nexus Tribarixa (Reda Amakrane / nexustribarixa-redaamakrane)
// ==========================================================================

$(document).ready(function () {
  let isDarkMode = true;

  // Use the script's absolute URL as the site root
  function themeRoot() {
    var el = document.querySelector('script[src*="app.js"]');
    return el.src.substring(0, el.src.lastIndexOf('/') + 1);
  }

  // Set theme-switchable asset paths using absolute URLs
  function setImg($el, file, attr) {
    attr = attr || 'src';
    if (!$el.length) return;
    $el.attr(attr, themeRoot() + file);
  }

  // Light / Dark Theme Switcher Logic
  function setTheme(darkMode) {
    isDarkMode = darkMode;
    const $body = $('body');
    const $headerImg = $('#headerWordmarkImg');
    const $heroImg = $('#heroWordmarkImg');
    const $toggleBtn = $('#themeToggleBtn');

    // Component Logos
    const $logoNexus = $('.theme-logo-nexus');
    const $logoSoftware = $('.theme-logo-software');
    const $logoKreativ = $('.theme-logo-kreativ');

    const sunSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><defs><radialGradient id="sunCoreG" cx="50%" cy="40%" r="50%"><stop offset="0%" stop-color="#FFF176"/><stop offset="100%" stop-color="#FFB300"/></radialGradient><linearGradient id="sunRayG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD54F"/><stop offset="100%" stop-color="#FF8F00"/></linearGradient></defs><circle cx="12" cy="12" r="5.5" fill="url(#sunCoreG)" stroke="#F57F17" stroke-width=".5"/><g stroke="url(#sunRayG)" stroke-width="2" stroke-linecap="round"><line x1="12" y1="1.5" x2="12" y2="3.5"/><line x1="12" y1="20.5" x2="12" y2="22.5"/><line x1="4.52" y1="4.52" x2="5.94" y2="5.94"/><line x1="18.06" y1="18.06" x2="19.48" y2="19.48"/><line x1="1.5" y1="12" x2="3.5" y2="12"/><line x1="20.5" y1="12" x2="22.5" y2="12"/><line x1="4.52" y1="19.48" x2="5.94" y2="18.06"/><line x1="18.06" y1="5.94" x2="19.48" y2="4.52"/></g></svg>';
    const moonSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><defs><linearGradient id="moonG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#B3E5FC"/><stop offset="100%" stop-color="#5C6BC0"/></linearGradient></defs><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="url(#moonG)" stroke="#3949AB" stroke-width=".6"/><circle cx="10" cy="8" r="1" fill="#E8EAF6" opacity=".5"/><circle cx="14" cy="14" r=".7" fill="#E8EAF6" opacity=".4"/></svg>';

    if (darkMode) {
      $body.removeClass('light-mode').addClass('dark-mode');
      setImg($headerImg, 'wordmark-dark.svg');
      setImg($heroImg, 'wordmark-dark.svg');
      setImg($logoNexus, 'nexus-logo-dark.svg');
      setImg($logoSoftware, 'nexus-software-logo-dark.svg');
      setImg($logoKreativ, 'nexus-kreativ-logo-dark.svg');

      $toggleBtn.html('<span class="theme-icon">' + sunSvg + '</span> <span class="theme-text">Light</span>');
    } else {
      $body.removeClass('dark-mode').addClass('light-mode');
      setImg($headerImg, 'wordmark-light.svg');
      setImg($heroImg, 'wordmark-light.svg');
      setImg($logoNexus, 'nexus-logo-light.svg');
      setImg($logoSoftware, 'nexus-software-logo-light.svg');
      setImg($logoKreativ, 'nexus-kreativ-logo-light.svg');

      $toggleBtn.html('<span class="theme-icon">' + moonSvg + '</span> <span class="theme-text">Dark</span>');
    }
  }

  // Theme Toggle Button Click
  $('#themeToggleBtn').on('click', function (e) {
    e.preventDefault();
    setTheme(!isDarkMode);
  });

  // Browser Theme Favicon Switcher Listener
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function updateFaviconForBrowserTheme(e) {
    const isBrowserDark = e ? e.matches : darkModeMediaQuery.matches;
    if (isBrowserDark) {
      setImg($('#faviconDefault'), 'favicon-dark.svg', 'href');
    } else {
      setImg($('#faviconDefault'), 'favicon-light.svg', 'href');
    }
  }
  
  // Initial Favicon setup & Listener
  updateFaviconForBrowserTheme();
  if (darkModeMediaQuery.addEventListener) {
    darkModeMediaQuery.addEventListener('change', updateFaviconForBrowserTheme);
  }

  // Automatic Markdown (.md) and Text (.txt) Link Router to Document Preview Page
  $(document).on('click', 'a[href$=".md"], a[href$=".txt"]', function (e) {
    const rawHref = $(this).attr('href');
    if (!rawHref || rawHref.startsWith('http://') || rawHref.startsWith('https://')) return;

    e.preventDefault();

    // Resolve target path relative to current URL directory
    const loc = window.location;
    const currentDir = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
    const resolvedUrl = new URL(rawHref, loc.origin + currentDir);

    // Strip the site root prefix so the path is relative to the site, not the domain
    // This is critical for GitHub Pages where the site lives at /repo-name/
    const siteRootPath = new URL(themeRoot()).pathname;
    let relativePath = resolvedUrl.pathname;
    if (relativePath.startsWith(siteRootPath)) {
      relativePath = relativePath.substring(siteRootPath.length);
    } else if (relativePath.startsWith('/')) {
      relativePath = relativePath.substring(1);
    }

    window.location.href = themeRoot() + 'md-viewer.html?file=' + encodeURIComponent(relativePath);
  });
});

