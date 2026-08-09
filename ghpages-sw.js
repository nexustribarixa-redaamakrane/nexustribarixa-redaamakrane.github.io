/**
 * ghpages-sw.js — Service Worker for GitHub Pages Error Handling
 * 
 * This Service Worker provides TWO real capabilities that are otherwise
 * impossible on static hosting:
 * 
 *  1. REAL 500 INTERCEPTION — When GitHub's servers go down (network failure,
 *     5xx responses), this SW serves your cached 500.html. It works because
 *     Service Workers persist in the browser independently of the server.
 * 
 *  2. RESTRICTED PATH BLOCKING — Navigation to restricted paths is intercepted
 *     at the network level BEFORE the page loads. The SW serves your 403.html
 *     instead. Combined with AES-256 encryption, this provides defense-in-depth.
 * 
 * @version 1.0.0
 * @license MIT
 */

/* ══════════════════════════════════════════════
 *  CONFIGURATION — Edit these as needed
 * ══════════════════════════════════════════════ */

var RESTRICTED_PATHS = [];

// Cache version — bump this to force re-cache of all assets.
var CACHE_VERSION = 1;
var CACHE_NAME = 'ghpages-errors-v' + CACHE_VERSION;

// Config cache key (used to persist dynamic config from main thread)
var CONFIG_CACHE_KEY = '/__ghpages_errors_config__.json';

// Assets to pre-cache. These are needed so error pages render correctly
// even when the server is completely unreachable.
var PRECACHE_URLS = [
  '/403.html',
  '/500.html',
  '/style.css',
  '/app.js',
  '/wordmark-dark.svg',
  '/wordmark-light.svg',
  '/favicon-dark.svg',
  '/favicon-light.svg'
];


/* ══════════════════════════════════════════════
 *  PATH MATCHING & DIRECTORY POLICIES
 * ══════════════════════════════════════════════ */

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
    .replace(/\*\*/g, '\u0000GLOB\u0000')
    .replace(/\*/g, '[^/]+')
    .replace(/\u0000GLOB\u0000/g, '.*');

  return new RegExp('^' + regexStr + '$').test(path);
}

function checkRule(rule, path) {
  if (typeof rule === 'string') {
    return matchPattern(rule, path);
  }

  if (typeof rule === 'object' && rule !== null && rule.path) {
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
      return normPath === baseDir || normPath.startsWith(baseDir + '/');
    } else if (policy === 'block-dir-allow-subcontent' || policy === 'block-directory-only') {
      return isDirectoryIndex;
    } else if (policy === 'allow-dir-block-subcontent' || policy === 'block-subcontent-only') {
      return isSubcontent;
    } else {
      return matchPattern(rule.path, path);
    }
  }

  return false;
}

function isPathRestricted(path, patterns) {
  for (var i = 0; i < patterns.length; i++) {
    if (checkRule(patterns[i], path)) return true;
  }
  return false;
}


/* ══════════════════════════════════════════════
 *  CONFIG PERSISTENCE
 * ══════════════════════════════════════════════ */

async function loadConfig() {
  try {
    var cache = await caches.open(CACHE_NAME);
    var response = await cache.match(CONFIG_CACHE_KEY);
    if (response) {
      var config = await response.json();
      return config;
    }
  } catch (e) { /* ignore */ }
  return null;
}

async function saveConfig(config) {
  try {
    var cache = await caches.open(CACHE_NAME);
    await cache.put(
      CONFIG_CACHE_KEY,
      new Response(JSON.stringify(config), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
  } catch (e) { /* ignore */ }
}

async function getRestrictedPaths() {
  var config = await loadConfig();
  if (config && Array.isArray(config.restricted) && config.restricted.length > 0) {
    return config.restricted;
  }
  return RESTRICTED_PATHS;
}


/* ══════════════════════════════════════════════
 *  SERVICE WORKER LIFECYCLE
 * ══════════════════════════════════════════════ */

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return Promise.allSettled(
          PRECACHE_URLS.map(function(url) {
            return cache.add(url).catch(function(err) {
              console.warn('[ghpages-sw] Failed to cache:', url, err.message);
            });
          })
        );
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(
          keyList.filter(function(key) {
            return key.startsWith('ghpages-errors-') && key !== CACHE_NAME;
          }).map(function(key) {
            return caches.delete(key);
          })
        );
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});


/* ══════════════════════════════════════════════
 *  FETCH INTERCEPTION
 * ══════════════════════════════════════════════ */

self.addEventListener('fetch', function(event) {
  var request = event.request;
  if (request.mode !== 'navigate') return;
  event.respondWith(handleNavigation(request));
});

async function handleNavigation(request) {
  var url = new URL(request.url);
  var path = url.pathname;

  // Check if path is restricted
  var restricted = await getRestrictedPaths();
  if (isPathRestricted(path, restricted)) {
    var forbidden = await caches.match('/403.html');
    if (forbidden) {
      return new Response(forbidden.body, {
        status: 403,
        statusText: 'Forbidden',
        headers: new Headers({
          'Content-Type': 'text/html; charset=UTF-8',
          'X-GHPages-Error': 'restricted-path'
        })
      });
    }
    return new Response(
      '<!DOCTYPE html><html><head><title>403 Forbidden</title></head>' +
      '<body style="font-family:sans-serif;text-align:center;padding:60px">' +
      '<h1>403 Forbidden</h1><p>Access denied.</p></body></html>',
      { status: 403, headers: { 'Content-Type': 'text/html' } }
    );
  }

  // Try the network
  try {
    var response = await fetch(request);

    if (response.status >= 500 && response.status < 600) {
      var serverError = await caches.match('/500.html');
      if (serverError) {
        return new Response(serverError.body, {
          status: response.status,
          statusText: response.statusText,
          headers: new Headers({
            'Content-Type': 'text/html; charset=UTF-8',
            'X-GHPages-Error': 'server-error-intercepted'
          })
        });
      }
    }

    if (response.status === 403) {
      var forbidden403 = await caches.match('/403.html');
      if (forbidden403) {
        return new Response(forbidden403.body, {
          status: 403,
          statusText: 'Forbidden',
          headers: new Headers({
            'Content-Type': 'text/html; charset=UTF-8',
            'X-GHPages-Error': 'github-403-intercepted'
          })
        });
      }
    }

    return response;

  } catch (networkError) {
    console.error('[ghpages-sw] Network failure:', networkError.message);

    var offline500 = await caches.match('/500.html');
    if (offline500) {
      return new Response(offline500.body, {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/html; charset=UTF-8',
          'X-GHPages-Error': 'server-down-intercepted'
        })
      });
    }

    return new Response(
      '<!DOCTYPE html><html><head><title>500 — Server Down</title>' +
      '<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0D1117;' +
      'color:#E6EDF3;font-family:sans-serif;display:flex;align-items:center;' +
      'justify-content:center;min-height:100vh;text-align:center}' +
      '.c{max-width:480px;padding:40px}h1{font-size:48px;color:#FF3B5C;' +
      'margin-bottom:16px}p{color:#8B949E;line-height:1.6}</style></head>' +
      '<body><div class="c"><h1>500</h1><h2>Server Unreachable</h2>' +
      '<p style="margin-top:12px">GitHub\'s servers appear to be down. ' +
      'This page is being served from your browser\'s cache by the ' +
      'Service Worker.</p></div></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    );
  }
}


/* ══════════════════════════════════════════════
 *  MESSAGE HANDLER
 * ══════════════════════════════════════════════ */

self.addEventListener('message', function(event) {
  if (!event.data || !event.data.type) return;

  switch (event.data.type) {
    case 'SET_CONFIG':
      saveConfig(event.data.config || {});
      break;

    case 'UPDATE_CACHE':
      event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
          var urls = event.data.urls || PRECACHE_URLS;
          return Promise.allSettled(
            urls.map(function(url) { return cache.add(url); })
          );
        })
      );
      break;

    case 'PING':
      event.source.postMessage({
        type: 'PONG',
        version: '1.0.0',
        cacheName: CACHE_NAME
      });
      break;
  }
});
