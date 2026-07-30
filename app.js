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

    const sunSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    const moonSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

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
});
