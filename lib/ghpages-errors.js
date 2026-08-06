/**
 * ghpages-errors.js v1.0.0
 * Client-side error page routing & security library for GitHub Pages
 *
 * Located in /lib/ghpages-errors.js
 *
 * @license MIT
 * @author Nexus Tribarixa
 */
(function(window, document) {
  'use strict';

  /* ──────────────────────────────────────────────
   *  Path Matching & Directory Policies
   * ────────────────────────────────────────────── */

  function normalizePath(p) {
    if (p.length > 1 && p.charAt(p.length - 1) === '/') {
      p = p.slice(0, -1);
    }
    return p.toLowerCase();
  }

  function matchPattern(pattern, path) {
    pattern = normalizePath(pattern);
    path = normalizePath(path);
    if (pattern === path) return true;

    var regexStr = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '\u0000GLOBSTAR\u0000')
      .replace(/\*/g, '[^/]+')
      .replace(/\u0000GLOBSTAR\u0000/g, '.*');

    return new RegExp('^' + regexStr + '$').test(path);
  }

  function checkRule(rule, path, accessCheckFn) {
    var matched = false;

    if (typeof rule === 'string') {
      matched = matchPattern(rule, path);
    } else if (typeof rule === 'object' && rule !== null && rule.path) {
      var baseDir = normalizePath(rule.path);
      var normPath = normalizePath(path);
      var policy = rule.policy || 'block-all';

      var isDirectoryIndex = (
        normPath === baseDir ||
        normPath === baseDir + '/index.html' ||
        normPath === baseDir + '/index.htm'
      );

      var isSubcontent = normPath.startsWith(baseDir + '/') && !isDirectoryIndex;

      if (policy === 'block-all') {
        matched = normPath === baseDir || normPath.startsWith(baseDir + '/');
      } else if (policy === 'block-dir-allow-subcontent' || policy === 'block-directory-only') {
        matched = isDirectoryIndex;
      } else if (policy === 'allow-dir-block-subcontent' || policy === 'block-subcontent-only') {
        matched = isSubcontent;
      } else {
        matched = matchPattern(rule.path, path);
      }
    }

    if (matched) {
      if (typeof accessCheckFn === 'function') {
        return !accessCheckFn(path);
      }
      return true;
    }

    return false;
  }

  function isRestricted(path, patterns, accessCheckFn) {
    for (var i = 0; i < patterns.length; i++) {
      if (checkRule(patterns[i], path, accessCheckFn)) return true;
    }
    return false;
  }

  /* ──────────────────────────────────────────────
   *  Page Replacement
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
     */
    init: function(options) {
      if (this._initialized) return;
      this._initialized = true;

      var cfg = {
        is404Page:   false,
        restricted:  [],
        catchErrors: false,
        accessCheck: null,
        redirect:    null,
        basePath:    '',
        swUrl:       null,
        pages: {
          403: '/403.html',
          500: '/500.html'
        }
      };

      if (options) {
        if (options.is404Page)   cfg.is404Page   = true;
        if (options.catchErrors) cfg.catchErrors  = true;
        if (options.accessCheck) cfg.accessCheck  = options.accessCheck;
        if (options.basePath)    cfg.basePath     = options.basePath;
        if (options.swUrl)       cfg.swUrl        = options.swUrl;
        if (options.redirect !== undefined) cfg.redirect = options.redirect;
        if (Array.isArray(options.restricted)) cfg.restricted = options.restricted;
        if (options.pages) {
          if (options.pages[403]) cfg.pages[403] = options.pages[403];
          if (options.pages[500]) cfg.pages[500] = options.pages[500];
        }
      }

      if (cfg.redirect === null) {
        cfg.redirect = !cfg.is404Page;
      }

      if (cfg.basePath) {
        cfg.pages[403] = cfg.basePath + cfg.pages[403];
        cfg.pages[500] = cfg.basePath + cfg.pages[500];
      }

      this._config = cfg;

      // 1. Smart 404 routing
      if (cfg.is404Page && cfg.restricted.length > 0) {
        this._route404(cfg);
      }

      // 2. Access control on regular pages
      if (!cfg.is404Page && cfg.restricted.length > 0) {
        this._checkPageAccess(cfg);
      }

      // 3. Global error catching
      if (cfg.catchErrors) {
        this._installErrorHandlers(cfg);
      }

      // 4. Register Service Worker
      if (cfg.useServiceWorker !== false && 'serviceWorker' in navigator) {
        this._registerServiceWorker(cfg);
      }
    },

    _registerServiceWorker: function(cfg) {
      var swUrl = cfg.swUrl || ((cfg.basePath || '') + '/lib/ghpages-sw.js');
      navigator.serviceWorker.register(swUrl)
        .then(function(reg) {
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

    _route404: function(cfg) {
      var path = window.location.pathname;

      if (cfg.basePath && path.indexOf(cfg.basePath) === 0) {
        path = path.slice(cfg.basePath.length) || '/';
      }

      if (isRestricted(path, cfg.restricted, cfg.accessCheck)) {
        if (cfg.redirect) {
          window.location.replace(cfg.pages[403]);
        } else {
          replacePageContent(cfg.pages[403], true);
        }
      }
    },

    _checkPageAccess: function(cfg) {
      var path = window.location.pathname;

      if (cfg.basePath && path.indexOf(cfg.basePath) === 0) {
        path = path.slice(cfg.basePath.length) || '/';
      }

      if (isRestricted(path, cfg.restricted, cfg.accessCheck)) {
        window.location.replace(cfg.pages[403]);
      }
    },

    _installErrorHandlers: function(cfg) {
      var errorPageUrl = cfg.pages[500];
      var triggered = false;
      var currentPath = window.location.pathname;

      if (currentPath === cfg.pages[500] || currentPath === cfg.pages[403]) {
        return;
      }

      window.addEventListener('error', function(event) {
        if (triggered) return;
        triggered = true;
        console.error('[ghpages-errors] Unhandled error — redirecting to 500:', event.error || event.message);
        window.location.href = errorPageUrl;
      });

      window.addEventListener('unhandledrejection', function(event) {
        if (triggered) return;
        triggered = true;
        console.error('[ghpages-errors] Unhandled promise rejection — redirecting to 500:', event.reason);
        window.location.href = errorPageUrl;
      });
    },

    show: function(code) {
      var cfg = this._config || { pages: { 403: '/403.html', 500: '/500.html' } };
      var url = cfg.pages[code];
      if (url) {
        window.location.href = url;
      } else {
        console.warn('[ghpages-errors] Unknown error code:', code);
      }
    },

    show403Inline: function() {
      var cfg = this._config || { pages: { 403: '/403.html' } };
      replacePageContent(cfg.pages[403], true);
    },

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

  window.GHPagesErrors = GHPagesErrors;

})(window, document);
