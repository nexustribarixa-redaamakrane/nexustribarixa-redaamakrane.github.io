/**
 * ghpages-errors.js v1.0.0
 * Client-side error page routing for GitHub Pages
 *
 * GitHub Pages only supports custom 404 pages natively. This library enables
 * custom 403 and 500 error pages through:
 *
 *  1. SMART 404 ROUTING — Your 404.html becomes a router. When someone visits
 *     a path you've marked as "restricted", it seamlessly replaces the page
 *     with your 403.html content (URL stays the same).
 *
 *  2. GLOBAL ERROR CATCHING — Catches unhandled JS errors and promise
 *     rejections on any page, then redirects to your 500.html.
 *
 *  3. CLIENT-SIDE ACCESS CONTROL — Existing pages can check access rules
 *     and redirect to 403.html if unauthorized.
 *
 *  4. MANUAL TRIGGERS — Call GHPagesErrors.show(403) or .show(500) from
 *     anywhere in your code to display an error page.
 *
 * IMPORTANT LIMITATIONS:
 *  - This is 100% client-side. HTTP status codes from GitHub remain unchanged.
 *  - "Restricted" pages are NOT secure — anyone can read the HTML source.
 *  - Real server 500 errors (GitHub is down) cannot be intercepted.
 *  - The 403 routing works by hijacking the 404 catch-all that GitHub provides.
 *
 * USAGE IN 404.html (required for 403 routing to work):
 *
 *   <script src="ghpages-errors.js"></script>
 *   <script>
 *     GHPagesErrors.init({
 *       is404Page: true,
 *       restricted: ['/admin', '/private', '/secret/**'],
 *       catchErrors: true
 *     });
 *   </script>
 *
 * USAGE ON OTHER PAGES (optional, for 500 error catching):
 *
 *   <script src="ghpages-errors.js"></script>
 *   <script>
 *     GHPagesErrors.init({ catchErrors: true });
 *   </script>
 *
 * Or add the init call inside your existing app.js.
 *
 * @license MIT
 * @author Nexus Tribarixa
 */
(function(window, document) {
  'use strict';

  /* ──────────────────────────────────────────────
   *  Path Matching (glob-style patterns)
   *  Supports:
   *    /exact/path   — matches exactly
   *    /path/*       — matches one path segment
   *    /path/**      — matches any depth of segments
   * ────────────────────────────────────────────── */

  function normalizePath(p) {
    // Strip trailing slash (except root), lowercase
    if (p.length > 1 && p.charAt(p.length - 1) === '/') {
      p = p.slice(0, -1);
    }
    return p.toLowerCase();
  }

  function matchPattern(pattern, path) {
    pattern = normalizePath(pattern);
    path = normalizePath(path);

    // Exact match shortcut
    if (pattern === path) return true;

    // Convert glob to regex
    var regexStr = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')   // escape regex specials
      .replace(/\*\*/g, '\u0000GLOBSTAR\u0000') // temp placeholder for **
      .replace(/\*/g, '[^/]+')                  // * = one path segment
      .replace(/\u0000GLOBSTAR\u0000/g, '.*');  // ** = any depth

    return new RegExp('^' + regexStr + '$').test(path);
  }

  function isRestricted(path, patterns, accessCheckFn) {
    for (var i = 0; i < patterns.length; i++) {
      if (matchPattern(patterns[i], path)) {
        // If an access check function exists, it can grant access
        if (typeof accessCheckFn === 'function') {
          return !accessCheckFn(path);
        }
        return true;
      }
    }
    return false;
  }

  /* ──────────────────────────────────────────────
   *  Page Replacement
   *  Fetches another HTML page and replaces current
   *  document content. URL in address bar stays the same.
   * ────────────────────────────────────────────── */

  function replacePageContent(url, fallbackRedirect) {
    fetch(url)
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function(html) {
        document.open();
        document.write(html);
        document.close();
      })
      .catch(function() {
        // If fetch fails (e.g. page doesn't exist), fall back to redirect
        if (fallbackRedirect) {
          window.location.replace(url);
        }
      });
  }

  /* ──────────────────────────────────────────────
   *  Main Library Object
   * ────────────────────────────────────────────── */

  var GHPagesErrors = {

    version: '1.0.0',

    _initialized: false,

    /**
     * Initialize the error handler.
     *
     * @param {Object}    [options]
     * @param {boolean}   [options.is404Page=false]   — Set true ONLY in 404.html
     * @param {string[]}  [options.restricted=[]]     — Glob patterns for restricted paths
     * @param {boolean}   [options.catchErrors=false] — Catch unhandled JS errors → show 500 page
     * @param {Function}  [options.accessCheck]       — fn(path) → true if user has access
     * @param {boolean}   [options.redirect=auto]     — Force redirect instead of content swap
     * @param {Object}    [options.pages]             — Custom error page URLs
     * @param {string}    [options.pages.403]         — Path to 403 page (default: '/403.html')
     * @param {string}    [options.pages.500]         — Path to 500 page (default: '/500.html')
     * @param {string}    [options.basePath='']       — Base path for GitHub project sites (e.g. '/repo-name')
     */
    init: function(options) {
      if (this._initialized) return;
      this._initialized = true;

      var cfg = {
        is404Page:   false,
        restricted:  [],
        catchErrors: false,
        accessCheck: null,
        redirect:    null,     // null = auto-detect
        basePath:    '',
        pages: {
          403: '/403.html',
          500: '/500.html'
        }
      };

      // Merge user options
      if (options) {
        if (options.is404Page)   cfg.is404Page   = true;
        if (options.catchErrors) cfg.catchErrors  = true;
        if (options.accessCheck) cfg.accessCheck  = options.accessCheck;
        if (options.basePath)    cfg.basePath     = options.basePath;
        if (options.redirect !== undefined) cfg.redirect = options.redirect;
        if (Array.isArray(options.restricted)) cfg.restricted = options.restricted;
        if (options.pages) {
          if (options.pages[403]) cfg.pages[403] = options.pages[403];
          if (options.pages[500]) cfg.pages[500] = options.pages[500];
        }
      }

      // Auto-detect redirect mode:
      //  - On 404 page: replace content (keeps the original URL in address bar)
      //  - On other pages: redirect (so user sees /403.html or /500.html)
      if (cfg.redirect === null) {
        cfg.redirect = !cfg.is404Page;
      }

      // Prepend basePath to error page paths
      if (cfg.basePath) {
        cfg.pages[403] = cfg.basePath + cfg.pages[403];
        cfg.pages[500] = cfg.basePath + cfg.pages[500];
      }

      this._config = cfg;

      // ─── Run checks ───

      // 1. Smart 404 routing: check if current path is restricted
      if (cfg.is404Page && cfg.restricted.length > 0) {
        this._route404(cfg);
      }

      // 2. Access control on regular pages
      if (!cfg.is404Page && cfg.restricted.length > 0) {
        this._checkPageAccess(cfg);
      }

      // 3. Global error catching → 500 page
      if (cfg.catchErrors) {
        this._installErrorHandlers(cfg);
      }

      // 4. Register Service Worker for Real 500/Network-failure interception & SW-level 403 blocking
      if (cfg.useServiceWorker !== false && 'serviceWorker' in navigator) {
        this._registerServiceWorker(cfg);
      }
    },

    /* ── Service Worker Registration & Sync ── */
    _registerServiceWorker: function(cfg) {
      var swUrl = (cfg.basePath || '') + '/ghpages-sw.js';
      navigator.serviceWorker.register(swUrl)
        .then(function(reg) {
          // Send config to active/waiting/installing controller
          var sendConfig = function() {
            var activeSw = reg.active || navigator.serviceWorker.controller;
            if (activeSw) {
              activeSw.postMessage({
                type: 'SET_CONFIG',
                config: {
                  restricted: cfg.restricted,
                  basePath: cfg.basePath,
                  pages: cfg.pages
                }
              });
            }
          };

          sendConfig();
          if (reg.installing) reg.installing.addEventListener('statechange', sendConfig);
          if (reg.waiting) reg.waiting.addEventListener('statechange', sendConfig);
        })
        .catch(function(err) {
          console.warn('[ghpages-errors] ServiceWorker registration failed:', err.message);
        });
    },

    /* ── 404 Router ── */
    _route404: function(cfg) {
      var path = window.location.pathname;

      // Strip basePath from the path for matching
      if (cfg.basePath && path.indexOf(cfg.basePath) === 0) {
        path = path.slice(cfg.basePath.length) || '/';
      }

      if (isRestricted(path, cfg.restricted, cfg.accessCheck)) {
        if (cfg.redirect) {
          window.location.replace(cfg.pages[403]);
        } else {
          // Replace page content seamlessly (URL stays the same)
          replacePageContent(cfg.pages[403], true);
        }
      }
      // Otherwise: normal 404 content is already displayed. Do nothing.
    },

    /* ── Page Access Check ── */
    _checkPageAccess: function(cfg) {
      var path = window.location.pathname;

      if (cfg.basePath && path.indexOf(cfg.basePath) === 0) {
        path = path.slice(cfg.basePath.length) || '/';
      }

      if (isRestricted(path, cfg.restricted, cfg.accessCheck)) {
        window.location.replace(cfg.pages[403]);
      }
    },

    /* ── Global Error Handlers → 500 ── */
    _installErrorHandlers: function(cfg) {
      var errorPageUrl = cfg.pages[500];
      var triggered = false;
      var currentPath = window.location.pathname;

      // Prevent infinite error loops: don't redirect if we're already
      // on the 403 or 500 page
      if (currentPath === cfg.pages[500] || currentPath === cfg.pages[403]) {
        return;
      }

      // Catch synchronous errors
      window.addEventListener('error', function(event) {
        if (triggered) return;
        triggered = true;
        console.error('[ghpages-errors] Unhandled error — redirecting to 500:', event.error || event.message);
        window.location.href = errorPageUrl;
      });

      // Catch unhandled promise rejections
      window.addEventListener('unhandledrejection', function(event) {
        if (triggered) return;
        triggered = true;
        console.error('[ghpages-errors] Unhandled promise rejection — redirecting to 500:', event.reason);
        window.location.href = errorPageUrl;
      });
    },

    /* ──────────────────────────────────────────────
     *  Public API: Manual Triggers
     * ────────────────────────────────────────────── */

    /**
     * Manually show an error page.
     * @param {number} code — 403 or 500
     */
    show: function(code) {
      var cfg = this._config || { pages: { 403: '/403.html', 500: '/500.html' } };
      var url = cfg.pages[code];
      if (url) {
        window.location.href = url;
      } else {
        console.warn('[ghpages-errors] Unknown error code:', code);
      }
    },

    /**
     * Programmatically show 403 by replacing current page content.
     * Useful for in-page access checks without a full redirect.
     */
    show403Inline: function() {
      var cfg = this._config || { pages: { 403: '/403.html' } };
      replacePageContent(cfg.pages[403], true);
    },

    /* ──────────────────────────────────────────────
     *  REAL SECURITY: Web Crypto AES-GCM-256 Helpers
     * ────────────────────────────────────────────── */

    /**
     * Encrypt HTML/text content with a passphrase (AES-GCM-256 + PBKDF2)
     * Returns JSON string containing ciphertext, salt, and iv.
     */
    encryptContent: async function(plainText, password) {
      var enc = new TextEncoder();
      var salt = crypto.getRandomValues(new Uint8Array(16));
      var iv = crypto.getRandomValues(new Uint8Array(12));

      var keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
      );

      var key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
      );

      var encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv }, key, enc.encode(plainText)
      );

      function buf2hex(buffer) {
        return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      }

      return JSON.stringify({
        salt: buf2hex(salt),
        iv: buf2hex(iv),
        ciphertext: buf2hex(encrypted)
      });
    },

    /**
     * Decrypt content encrypted with encryptContent using passphrase.
     */
    decryptContent: async function(encryptedJson, password) {
      var data = typeof encryptedJson === 'string' ? JSON.parse(encryptedJson) : encryptedJson;
      var dec = new TextDecoder();

      function hex2buf(hex) {
        var bytes = new Uint8Array(hex.length / 2);
        for (var i = 0; i < hex.length; i += 2) {
          bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
      }

      var salt = hex2buf(data.salt);
      var iv = hex2buf(data.iv);
      var ciphertext = hex2buf(data.ciphertext);

      var keyMaterial = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
      );

      var key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
      );

      var decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv }, key, ciphertext
      );

      return dec.decode(decrypted);
    }
  };

  // Export
  window.GHPagesErrors = GHPagesErrors;

})(window, document);
