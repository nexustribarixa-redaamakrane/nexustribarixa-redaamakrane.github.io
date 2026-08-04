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

  // Automatic File Link Router to File Reader Page
  $(document).on('click', 'a', function (e) {
    const rawHref = $(this).attr('href');
    if (!rawHref || rawHref.startsWith('http://') || rawHref.startsWith('https://') || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('javascript:')) return;

    // Check if it's a directory link (ends with a slash)
    if (rawHref.endsWith('/')) return;

    // Check if it has a file extension
    const dotIndex = rawHref.lastIndexOf('.');
    if (dotIndex === -1) return;

    const ext = rawHref.substring(dotIndex + 1).toLowerCase();

    // If it's a standard .html page, only intercept it if it's inside a directory listing block
    if (ext === 'html' || ext === 'htm') {
      if (!$(this).closest('.dir-listing').length) {
        return; // Navigate standard wiki pages normally
      }
    }

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

    window.location.href = themeRoot() + 'file-reader.html?file=' + encodeURIComponent(relativePath);
  });

  // Dynamic directory listings custom 3D file/folder icon assignment
  $('.dir-listing li').each(function () {
    const $li = $(this);
    const $link = $li.find('a.dir-entry-name');
    if (!$link.length) return;

    const href = $link.attr('href') || '';
    const text = $link.text() || '';

    if ($link.hasClass('parent-dir') || text.includes('[Parent Directory]')) {
      $li.find('.dir-icon').html(getParentFolderSvg());
      return;
    }

    if (href.endsWith('/') || text.endsWith('/')) {
      $li.find('.dir-icon').html(getFolderSvg());
      return;
    }

    const dotIdx = href.lastIndexOf('.');
    if (dotIdx !== -1) {
      const ext = href.substring(dotIdx + 1).toLowerCase();
      $li.find('.dir-icon').html(getFileIconSvg(ext));
    } else {
      $li.find('.dir-icon').html(getFileIconSvg(''));
    }
  });

  // Helper functions for custom 3D folder and file icons
  function getParentFolderSvg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="greenParentG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#81C784"/>
          <stop offset="100%" stop-color="#2E7D32"/>
        </linearGradient>
        <linearGradient id="greenParentTab" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#A5D6A7"/>
          <stop offset="100%" stop-color="#388E3C"/>
        </linearGradient>
      </defs>
      <path d="M2 7V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H11L9 5H4a2 2 0 0 0-2 2z" fill="url(#greenParentG)" stroke="#1B5E20" stroke-width=".5"/>
      <path d="M2 7h7l2 2h11" fill="url(#greenParentTab)" stroke="none" opacity=".6"/>
      <line x1="14" y1="16" x2="8" y2="10" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
      <polyline points="12 10 8 10 8 14" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="16" cy="11" r="1.3" fill="#ffffff"/>
    </svg>`;
  }

  function getFolderSvg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="folderPlusG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFE082"/>
          <stop offset="100%" stop-color="#F9A825"/>
        </linearGradient>
      </defs>
      <path d="M2 7V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H11L9 5H4a2 2 0 0 0-2 2z" fill="url(#folderPlusG)" stroke="#E65100" stroke-width=".5"/>
      <path d="M2 7h7l2 2h11" fill="#FFD54F" stroke="none" opacity=".5"/>
      <line x1="9.5" y1="14.5" x2="14.5" y2="14.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="12" y1="12" x2="12" y2="17" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;
  }

  function getFileIconSvg(ext) {
    ext = ext.toLowerCase();

    // 1. Markdown
    if (ext === 'md') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="mdPaperG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#ECEFF1"/>
          </linearGradient>
          <linearGradient id="mdFoldG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#CFD8DC"/>
            <stop offset="100%" stop-color="#90A4AE"/>
          </linearGradient>
        </defs>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#mdPaperG)" stroke="#78909C" stroke-width=".5"/>
        <path d="M14 2v6h6" fill="url(#mdFoldG)" stroke="#78909C" stroke-width=".5"/>
        <path d="M 6.5 17.5 L 6.5 11.5 L 9.2 15 L 11.9 11.5 L 11.9 17.5" fill="none" stroke="#121011" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="15.5" y1="11.5" x2="15.5" y2="16.5" stroke="#121011" stroke-width="1.4" stroke-linecap="round"/>
        <polyline points="13.5 15 15.5 17.5 17.5 15" fill="none" stroke="#121011" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    }

    // 2. HTML, XML, SVG
    if (ext === 'html' || ext === 'htm' || ext === 'xml' || ext === 'svg') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="htmlDocGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#ECEFF1"/>
          </linearGradient>
          <linearGradient id="htmlFoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#CFD8DC"/>
            <stop offset="100%" stop-color="#90A4AE"/>
          </linearGradient>
          <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF6D00"/>
            <stop offset="100%" stop-color="#E65100"/>
          </linearGradient>
        </defs>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#htmlDocGrad)" stroke="#78909C" stroke-width=".5"/>
        <path d="M14 2v6h6" fill="url(#htmlFoldGrad)" stroke="#78909C" stroke-width=".5"/>
        <polyline points="9.5 12.5 7 15 9.5 17.5" fill="none" stroke="url(#orangeGrad)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="14.5 12.5 17 15 14.5 17.5" fill="none" stroke="url(#orangeGrad)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    }

    // 3. JavaScript, TypeScript, JSX, TSX
    if (ext === 'js' || ext === 'ts' || ext === 'jsx' || ext === 'tsx' || ext === 'mjs' || ext === 'cjs') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="jsDocG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFDE7"/>
            <stop offset="100%" stop-color="#FFF9C4"/>
          </linearGradient>
          <linearGradient id="jsFoldG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFE082"/>
            <stop offset="100%" stop-color="#FBC02D"/>
          </linearGradient>
        </defs>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#jsDocG)" stroke="#F57F17" stroke-width=".5"/>
        <path d="M14 2v6h6" fill="url(#jsFoldG)" stroke="#F57F17" stroke-width=".5"/>
        <rect x="7" y="11" width="10" height="8" rx="1.5" fill="#FBC02D" stroke="#F57F17" stroke-width=".5"/>
        <text x="8.5" y="17.2" font-family="'VT323', monospace" font-size="7.5" fill="#121011" font-weight="900">JS</text>
      </svg>`;
    }

    // 4. CSS, SCSS, SASS, LESS
    if (ext === 'css' || ext === 'scss' || ext === 'sass' || ext === 'less') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="cssDocG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#E3F2FD"/>
            <stop offset="100%" stop-color="#BBDEFB"/>
          </linearGradient>
          <linearGradient id="cssFoldG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#90CAF9"/>
            <stop offset="100%" stop-color="#1976D2"/>
          </linearGradient>
        </defs>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#cssDocG)" stroke="#0D47A1" stroke-width=".5"/>
        <path d="M14 2v6h6" fill="url(#cssFoldG)" stroke="#0D47A1" stroke-width=".5"/>
        <rect x="7" y="11" width="10" height="8" rx="1.5" fill="#29B6F6" stroke="#0288D1" stroke-width=".5"/>
        <text x="9" y="17.2" font-family="'VT323', monospace" font-size="7.5" fill="#ffffff" font-weight="900">#</text>
      </svg>`;
    }

    // 5. Python
    if (ext === 'py') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="pyDocG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#E8F5E9"/>
            <stop offset="100%" stop-color="#C8E6C9"/>
          </linearGradient>
          <linearGradient id="pyFoldG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#A5D6A7"/>
            <stop offset="100%" stop-color="#388E3C"/>
          </linearGradient>
        </defs>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#pyDocG)" stroke="#1B5E20" stroke-width=".5"/>
        <path d="M14 2v6h6" fill="url(#pyFoldG)" stroke="#1B5E20" stroke-width=".5"/>
        <path d="M12 10.5 A 2 2 0 0 0 10 12.5 L 10 14 L 11.5 14 L 11.5 13.5 A 0.5 0.5 0 0 1 12 13 L 13.5 13 A 1.5 1.5 0 0 0 15 11.5 L 15 10 A 1 1 0 0 0 14 9 L 12.5 9 A 1.5 1.5 0 0 0 11 10.5 L 11 11" fill="none" stroke="#1565C0" stroke-width="1" stroke-linecap="round"/>
        <path d="M12 16.5 A 2 2 0 0 0 14 14.5 L 14 13 L 12.5 13 L 12.5 13.5 A 0.5 0.5 0 0 1 12 14 L 10.5 14 A 1.5 1.5 0 0 0 9 15.5 L 9 17 A 1 1 0 0 0 10 18 L 11.5 18 A 1.5 1.5 0 0 0 13 16.5 L 13 16" fill="none" stroke="#FBC02D" stroke-width="1" stroke-linecap="round"/>
      </svg>`;
    }

    // 6. JSON, YAML, TOML, SQL, CONFIG
    if (ext === 'json' || ext === 'yaml' || ext === 'yml' || ext === 'toml' || ext === 'ini' || ext === 'sql' || ext === 'cfg' || ext === 'conf') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="jsonDocG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#E0F7FA"/>
            <stop offset="100%" stop-color="#B2EBF2"/>
          </linearGradient>
          <linearGradient id="jsonFoldG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#80DEEA"/>
            <stop offset="100%" stop-color="#00ACC1"/>
          </linearGradient>
        </defs>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#jsonDocG)" stroke="#006064" stroke-width=".5"/>
        <path d="M14 2v6h6" fill="url(#jsonFoldG)" stroke="#006064" stroke-width=".5"/>
        <text x="8.5" y="16.5" font-family="'Noto Sans', sans-serif" font-size="7" fill="#00ACC1" font-weight="900">{ }</text>
      </svg>`;
    }

    // 7. C, C++, C#, Java, Go, Rust, Kotlin
    if (ext === 'c' || ext === 'cpp' || ext === 'cs' || ext === 'h' || ext === 'hpp' || ext === 'go' || ext === 'rs' || ext === 'java' || ext === 'kt') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="cppDocG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#F3E5F5"/>
            <stop offset="100%" stop-color="#E1BEE7"/>
          </linearGradient>
          <linearGradient id="cppFoldG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#CE93D8"/>
            <stop offset="100%" stop-color="#8E24AA"/>
          </linearGradient>
        </defs>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#cppDocG)" stroke="#4A148C" stroke-width=".5"/>
        <path d="M14 2v6h6" fill="url(#cppFoldG)" stroke="#4A148C" stroke-width=".5"/>
        <polyline points="9 11.5 7 13.5 9 15.5" fill="none" stroke="#8E24AA" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="15 11.5 17 13.5 15 15.5" fill="none" stroke="#8E24AA" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="13" y1="11" x2="11" y2="16" stroke="#8E24AA" stroke-width="1.2"/>
      </svg>`;
    }

    // 8. Script Shell / PowerShell
    if (ext === 'sh' || ext === 'bash' || ext === 'ps1' || ext === 'bat' || ext === 'cmd') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="shDocG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ECEFF1"/>
            <stop offset="100%" stop-color="#CFD8DC"/>
          </linearGradient>
          <linearGradient id="shFoldG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#B0BEC5"/>
            <stop offset="100%" stop-color="#546E7A"/>
          </linearGradient>
        </defs>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#shDocG)" stroke="#37474F" stroke-width=".5"/>
        <path d="M14 2v6h6" fill="url(#shFoldG)" stroke="#37474F" stroke-width=".5"/>
        <polyline points="7.5 12 9.5 13.5 7.5 15" fill="none" stroke="#2E7D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="11.5" y1="15" x2="15.5" y2="15" stroke="#2E7D32" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`;
    }

    // 9. Images
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'bmp'].indexOf(ext) !== -1) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="imgDocG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#ECEFF1"/>
          </linearGradient>
          <linearGradient id="imgFoldG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#CFD8DC"/>
            <stop offset="100%" stop-color="#90A4AE"/>
          </linearGradient>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#4FC3F7"/>
            <stop offset="100%" stop-color="#0288D1"/>
          </linearGradient>
        </defs>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#imgDocG)" stroke="#78909C" stroke-width=".5"/>
        <path d="M14 2v6h6" fill="url(#imgFoldG)" stroke="#78909C" stroke-width=".5"/>
        <rect x="7" y="11" width="10" height="8" rx="1" fill="url(#skyGrad)" stroke="#0288D1" stroke-width=".5"/>
        <circle cx="9.5" cy="13" r="1" fill="#FFF176"/>
        <polygon points="7 19 11 14.5 14 17 15.5 15.5 17 19" fill="#388E3C"/>
      </svg>`;
    }

    // 10. Fonts
    if (['ttf', 'otf', 'woff', 'woff2'].indexOf(ext) !== -1) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="fntDocG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ECEFF1"/>
            <stop offset="100%" stop-color="#CFD8DC"/>
          </linearGradient>
          <linearGradient id="fntFoldG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#B0BEC5"/>
            <stop offset="100%" stop-color="#546E7A"/>
          </linearGradient>
        </defs>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#fntDocG)" stroke="#37474F" stroke-width=".5"/>
        <path d="M14 2v6h6" fill="url(#fntFoldG)" stroke="#37474F" stroke-width=".5"/>
        <text x="8.5" y="17.2" font-family="'Noto Sans', sans-serif" font-size="8" fill="#546E7A" font-weight="900">A</text>
      </svg>`;
    }

    // 11. Text / Fallback
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="txtDocG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#ECEFF1"/>
        </linearGradient>
        <linearGradient id="txtFoldG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#CFD8DC"/>
          <stop offset="100%" stop-color="#90A4AE"/>
        </linearGradient>
      </defs>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#txtDocG)" stroke="#78909C" stroke-width=".5"/>
      <path d="M14 2v6h6" fill="url(#txtFoldG)" stroke="#78909C" stroke-width=".5"/>
      <line x1="7" y1="12" x2="17" y2="12" stroke="#90A4AE" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="7" y1="14.5" x2="17" y2="14.5" stroke="#90A4AE" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="7" y1="17" x2="13" y2="17" stroke="#90A4AE" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`;
  }
});

