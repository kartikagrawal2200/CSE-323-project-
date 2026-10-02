/**
 * AeroSim Aviation - Shared Layout (Header, Navigation, Notification Bell, Mobile Menu & Footer)
 * v2.8.0 - Full semantic HTML5 account menu, native <dialog> logout confirm,
 *           pageshow/back-forward sync, cross-tab storage event, avatar initials.
 */

(function () {
  'use strict';

  // -----------------------------------------------------------------------
  // Safe storage wrappers (localStorage with try/catch)
  // -----------------------------------------------------------------------
  window.safeGetStorage = function (key, fallback) {
    if (fallback === undefined) fallback = null;
    try {
      const val = localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch (e) {
      console.warn('Storage read error:', key, e);
      return fallback;
    }
  };

  window.safeGetJSON = function (key, fallback) {
    if (fallback === undefined) fallback = null;
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      console.warn('Storage JSON parse error:', key, e);
      return fallback;
    }
  };

  window.safeSetStorage = function (key, value) {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Storage write error:', key, e);
      return false;
    }
  };

  window.safeRemoveStorage = function (key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('Storage remove error:', key, e);
      return false;
    }
  };

  // -----------------------------------------------------------------------
  // Session read — checks both localStorage and sessionStorage
  // -----------------------------------------------------------------------
  /** @returns {string|null} current logged-in username or null */
  function getSessionUser() {
    try {
      return localStorage.getItem('aerosim_user') || sessionStorage.getItem('aerosim_user') || null;
    } catch (e) {
      console.warn('getSessionUser error:', e);
      return null;
    }
  }

  /** Get full user object from the users store */
  function getSessionUserObject() {
    const userId = getSessionUser();
    if (!userId) return null;
    try {
      const users = JSON.parse(localStorage.getItem('aerosim_users') || '{}');
      return users[userId] || { userId: userId, displayName: userId };
    } catch (e) {
      return { userId: userId, displayName: userId };
    }
  }

  /** Derive 1–2 capital initials from a display name or user ID */
  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  // -----------------------------------------------------------------------
  // Internationalisation dictionary (English & Hindi)
  // -----------------------------------------------------------------------
  const I18N = {
    en: {
      lang_label: 'हिन्दी',
      lang_title: 'Switch to Hindi',
      nav_home: 'Home',
      nav_track: 'Track Baggage',
      nav_how: 'How It Works',
      nav_faq: 'FAQ',
      nav_contact: 'Contact',
      nav_my_bags: 'My Bags',
      nav_login: 'Login',
      nav_register: 'Register',
      nav_logout: 'Logout',
      nav_profile: 'My Profile',
      nav_report: 'Report an Issue',
      nav_account: 'Account menu',
      home_badge: 'Standard IATA Baggage Telemetry Simulation',
      home_hero_title: 'Real-Time Aviation Baggage Sortation Simulation',
      home_hero_sub: 'Experience end-to-end IATA luggage telemetry tracking from check-in conveyor sortation to arrival carousel belts.',
      home_track_btn: 'TRACK',
      home_live_ops: 'LIVE OPERATIONS',
      footer_academic: 'Academic simulation project – not affiliated with any real airline.',
      quick_links: 'Quick Links',
      support_heading: 'Support',
      legal_heading: 'Legal & Notice'
    },
    hi: {
      lang_label: 'EN',
      lang_title: 'Switch to English',
      nav_home: 'होम',
      nav_track: 'बैगेज ट्रैक करें',
      nav_how: 'यह कैसे काम करता है',
      nav_faq: 'सामान्य प्रश्न',
      nav_contact: 'संपर्क करें',
      nav_my_bags: 'मेरे बैग',
      nav_login: 'लॉग इन',
      nav_register: 'पंजीकरण',
      nav_logout: 'लॉग आउट',
      nav_profile: 'मेरी प्रोफ़ाइल',
      nav_report: 'समस्या रिपोर्ट करें',
      nav_account: 'खाता मेनू',
      home_badge: 'मानक IATA बैगेज टेलीमेट्री सिमुलेशन',
      home_hero_title: 'रीयल-टाइम विमानन सामान छँटाई सिमुलेशन',
      home_hero_sub: 'चेक-इन कन्वेयर से लेकर आगमन कन्वेयर तक एंड-टू-एंड IATA सामान ट्रैकिंग का अनुभव करें।',
      home_track_btn: 'ट्रैक करें',
      home_live_ops: 'लाइव संचालन',
      footer_academic: 'शैक्षणिक सिमुलेशन परियोजना – किसी वास्तविक एयरलाइन से संबद्ध नहीं।',
      quick_links: 'त्वरित लिंक',
      support_heading: 'सहायता',
      legal_heading: 'कानूनी एवं सूचना'
    }
  };

  function getLanguage() {
    return window.safeGetStorage('aerosim_lang', 'en');
  }

  window.toggleAeroSimLang = function () {
    const currentLang = getLanguage();
    const newLang = currentLang === 'en' ? 'hi' : 'en';
    window.safeSetStorage('aerosim_lang', newLang);
    window.applyAeroSimLanguage();
    renderHeader();
    renderFooter();
    if (typeof window.showToast === 'function') {
      window.showToast(newLang === 'hi' ? 'भाषा बदलकर हिन्दी कर दी गई है' : 'Language switched to English');
    }
  };

  window.applyAeroSimLanguage = function () {
    const lang = getLanguage();
    const dict = I18N[lang] || I18N.en;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    document.documentElement.lang = lang;
  };

  // -----------------------------------------------------------------------
  // Notification helpers
  // -----------------------------------------------------------------------
  function getNotifications() {
    const saved = window.safeGetJSON('aerosim_notifications', null);
    if (saved && Array.isArray(saved)) return saved;
    const defaults = [
      { id: 'notif-1', title: 'Baggage Loaded', message: 'Bag LHR-123456 loaded onto Flight LH247.', time: Date.now() - 720000, read: false },
      { id: 'notif-2', title: 'Stage Verified', message: 'Security screening completed at Terminal 2.', time: Date.now() - 2700000, read: false },
      { id: 'notif-3', title: 'Welcome to AeroSim', message: 'Live baggage simulation engine v2.8 active.', time: Date.now() - 10800000, read: true }
    ];
    window.safeSetStorage('aerosim_notifications', defaults);
    return defaults;
  }

  function saveNotifications(notifs) {
    window.safeSetStorage('aerosim_notifications', notifs);
  }

  function formatRelativeTime(timestamp) {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return diffMin + ' min ago';
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return diffHours + ' hr ago';
    return Math.floor(diffHours / 24) + 'd ago';
  }

  // -----------------------------------------------------------------------
  // Theme management
  // -----------------------------------------------------------------------
  function initTheme() {
    const savedTheme = localStorage.getItem('aerosim_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  window.toggleAeroSimTheme = function () {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('aerosim_theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('aerosim_theme', 'dark');
    }
    updateThemeIcon();
  };

  function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.querySelectorAll('.btn-dark-toggle').forEach(function (btn) {
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.innerHTML = isDark
        ? '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
        : '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    });
  }

  // -----------------------------------------------------------------------
  // Current page detection
  // -----------------------------------------------------------------------
  function getCurrentPageName() {
    const path = window.location.pathname.replace(/\\/g, '/');
    const filename = path.split('/').pop().toLowerCase();
    if (!filename || filename === '') return 'index.html';
    return filename;
  }

  // -----------------------------------------------------------------------
  // Notification panel HTML
  // -----------------------------------------------------------------------
  function renderNotifItemsHtml(notifs) {
    if (!notifs || notifs.length === 0) {
      return '<div class="notif-empty-state">No new notifications</div>';
    }
    return notifs.map(function (n) {
      return '<div class="notif-item' + (n.read ? ' read' : ' unread') + '" data-id="' + n.id + '">' +
        '<div class="notif-item-icon" aria-hidden="true">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">' +
            '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>' +
          '</svg>' +
        '</div>' +
        '<div class="notif-item-body">' +
          '<div class="notif-item-title">' + n.title + '</div>' +
          '<div class="notif-item-msg">' + n.message + '</div>' +
          '<div class="notif-item-time">' + formatRelativeTime(n.time) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  // -----------------------------------------------------------------------
  // MAIN: renderAuthHeader() — the single source of truth for auth state
  // Reads session synchronously before any DOM is written (no flash).
  // -----------------------------------------------------------------------
  /**
   * Build and return the HTML string for the auth section of the header.
   * Logged out: Login & Register links.
   * Logged in: avatar button + semantic <ul role="menu"> dropdown.
   */
  window.renderAuthHeader = function renderAuthHeader() {
    const lang = getLanguage();
    const dict = I18N[lang] || I18N.en;
    const user = getSessionUserObject(); // synchronous read

    // -- Theme toggle is shared in both states --
    const utilBtns =
      '<button type="button" class="btn-dark-toggle" id="btn-dark-toggle" aria-label="Switch theme"></button>';

    if (!user) {
      // LOGGED OUT — show Login and Register links
      return utilBtns +
        '<a href="register.html" class="btn-nav-outline" id="nav-btn-register">' + dict.nav_register + '</a>' +
        '<a href="login.html" class="btn-nav-primary" id="nav-btn-login">' + dict.nav_login + '</a>';
    }

    // LOGGED IN — show notification bell + avatar button
    const notifs = getNotifications();
    const unreadCount = notifs.filter(function (n) { return !n.read; }).length;
    const initials = getInitials(user.displayName || user.userId);
    const accountLabel = dict.nav_account + ' – ' + (user.displayName || user.userId);

    return utilBtns +

      // Notification bell
      '<div class="notif-dropdown-wrapper">' +
        '<button type="button" class="btn-nav-notif" id="btn-nav-notif"' +
          ' aria-label="Notifications' + (unreadCount > 0 ? ', ' + unreadCount + ' unread' : '') + '"' +
          ' aria-expanded="false" aria-haspopup="true" aria-controls="notif-dropdown-menu">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
            '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>' +
            '<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>' +
          '</svg>' +
          (unreadCount > 0 ? '<span class="notif-badge-count" id="notif-badge-count" aria-hidden="true">' + unreadCount + '</span>' : '') +
        '</button>' +

        '<div class="notif-dropdown-menu" id="notif-dropdown-menu" role="region" aria-label="Notifications panel">' +
          '<div class="notif-dropdown-header">' +
            '<span class="notif-title">Notifications</span>' +
            '<div class="notif-actions-links">' +
              '<button type="button" class="btn-text-action" id="btn-mark-all-read">Mark all read</button>' +
              '<button type="button" class="btn-text-action" id="btn-clear-notifs">Clear</button>' +
            '</div>' +
          '</div>' +
          '<div class="notif-items-list" id="notif-items-list" aria-live="polite">' +
            renderNotifItemsHtml(notifs) +
          '</div>' +
        '</div>' +
      '</div>' +

      // Account button + dropdown
      '<div class="account-menu-wrapper" id="account-menu-wrapper">' +
        '<button type="button" class="account-btn" id="account-btn"' +
          ' aria-haspopup="menu" aria-expanded="false" aria-controls="account-menu"' +
          ' aria-label="' + accountLabel + '">' +
          '<span class="account-avatar" aria-hidden="true">' + initials + '</span>' +
          '<span class="account-display-name">' + (user.displayName || user.userId) + '</span>' +
          '<svg class="account-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
            '<polyline points="6 9 12 15 18 9"></polyline>' +
          '</svg>' +
        '</button>' +

        // Dropdown — <ul role="menu"> per ARIA spec
        '<ul class="account-menu" id="account-menu" role="menu" hidden>' +
          // User info row (not a menu item — role="none")
          '<li class="account-menu__user-row" role="none">' +
            '<div class="account-menu__avatar-lg" aria-hidden="true">' + initials + '</div>' +
            '<div class="account-menu__user-info">' +
              '<strong class="account-menu__display-name">' + (user.displayName || user.userId) + '</strong>' +
              '<small class="account-menu__user-id">ID: ' + user.userId + '</small>' +
            '</div>' +
          '</li>' +
          '<li role="none"><hr class="account-menu__divider" role="separator"></li>' +

          '<li role="none">' +
            '<a href="profile.html" class="account-menu__item" role="menuitem">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' +
              dict.nav_profile +
            '</a>' +
          '</li>' +
          '<li role="none">' +
            '<a href="my-bags.html" class="account-menu__item" role="menuitem">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>' +
              dict.nav_my_bags +
            '</a>' +
          '</li>' +
          '<li role="none">' +
            '<a href="report-issue.html" class="account-menu__item" role="menuitem">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>' +
              dict.nav_report +
            '</a>' +
          '</li>' +
          '<li role="none"><hr class="account-menu__divider" role="separator"></li>' +
          '<li role="none">' +
            '<button type="button" class="account-menu__item account-menu__item--danger" id="nav-logout-btn" role="menuitem">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>' +
              dict.nav_logout +
            '</button>' +
          '</li>' +
        '</ul>' +
      '</div>';
  };

  // -----------------------------------------------------------------------
  // Logout confirmation — uses native <dialog> as required
  // -----------------------------------------------------------------------
  function ensureLogoutDialog() {
    let dlg = document.getElementById('logout-confirm-dialog');
    if (dlg) return dlg;

    dlg = document.createElement('dialog');
    dlg.id = 'logout-confirm-dialog';
    dlg.className = 'logout-dialog';
    dlg.setAttribute('aria-labelledby', 'logout-dialog-heading');
    dlg.innerHTML =
      '<div class="logout-dialog__inner">' +
        '<h2 class="logout-dialog__heading" id="logout-dialog-heading">Sign out of AeroSim?</h2>' +
        '<p class="logout-dialog__body">Your tracked bags and preferences stored in this browser will remain available when you next log in.</p>' +
        '<div class="logout-dialog__actions">' +
          '<button type="button" class="logout-dialog__btn logout-dialog__btn--cancel" id="btn-logout-cancel">Cancel</button>' +
          '<button type="button" class="logout-dialog__btn logout-dialog__btn--confirm" id="btn-logout-confirm">Sign Out</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(dlg);
    return dlg;
  }

  /**
   * Perform logout: clear only the session key, keep theme/users/tracked-bags.
   * Shows a toast and redirects to index.html.
   */
  function performLogout() {
    try {
      localStorage.removeItem('aerosim_user');
      sessionStorage.removeItem('aerosim_user');
    } catch (e) {
      console.warn('Logout storage clear error:', e);
    }
    if (typeof window.showToast === 'function') {
      window.showToast('Logged out successfully');
    }
    setTimeout(function () {
      window.location.href = 'index.html';
    }, 500);
  }

  /**
   * Open the native <dialog> logout confirmation.
   * @param {HTMLElement} triggerEl - the element that opened the dialog (for focus return)
   */
  function openLogoutDialog(triggerEl) {
    const dlg = ensureLogoutDialog();
    const cancelBtn = document.getElementById('btn-logout-cancel');
    const confirmBtn = document.getElementById('btn-logout-confirm');

    // Remove stale listeners before re-attaching
    const newConfirm = confirmBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    document.getElementById('btn-logout-confirm').addEventListener('click', function () {
      dlg.close();
      performLogout();
    });
    document.getElementById('btn-logout-cancel').addEventListener('click', function () {
      dlg.close();
      if (triggerEl && typeof triggerEl.focus === 'function') triggerEl.focus();
    });

    dlg.addEventListener('close', function onClose() {
      dlg.removeEventListener('close', onClose);
      if (triggerEl && typeof triggerEl.focus === 'function') triggerEl.focus();
    });

    dlg.showModal();
  }

  // -----------------------------------------------------------------------
  // renderHeader() — injects the full header + mobile nav into #site-header
  // -----------------------------------------------------------------------
  function renderHeader() {
    const headerContainer = document.getElementById('site-header');
    if (!headerContainer) return;

    const currentPage = getCurrentPageName();
    const lang = getLanguage();
    const dict = I18N[lang] || I18N.en;
    const user = getSessionUserObject();

    const navLinks = [
      { href: 'index.html',       label: dict.nav_home,      key: 'index.html' },
      { href: 'track.html',       label: dict.nav_track,     key: 'track.html' },
      { href: 'how-it-works.html',label: dict.nav_how,       key: 'how-it-works.html' },
      { href: 'faq.html',         label: dict.nav_faq,       key: 'faq.html' },
      { href: 'contact.html',     label: dict.nav_contact,   key: 'contact.html' }
    ];

    // Desktop nav links <ul><li><a>
    const desktopNavHtml = '<ul class="nav-desktop-list" role="list">' +
      navLinks.map(function (link) {
        const active = currentPage === link.key ? ' aria-current="page"' : '';
        return '<li><a href="' + link.href + '" class="nav-link' + (currentPage === link.key ? ' active' : '') + '"' + active + '>' + link.label + '</a></li>';
      }).join('') +
    '</ul>';

    // Mobile nav links
    const mobileNavLinksHtml = navLinks.map(function (l) {
      return '<li><a href="' + l.href + '" class="mobile-nav-link' + (currentPage === l.key ? ' active' : '') + '"' + (currentPage === l.key ? ' aria-current="page"' : '') + '>' + l.label + '</a></li>';
    }).join('');

    // Mobile auth section
    let mobileAuthHtml;
    if (user) {
      const initials = getInitials(user.displayName || user.userId);
      mobileAuthHtml =
        '<li role="none"><div class="mobile-nav-divider" aria-hidden="true"></div></li>' +
        '<li class="mobile-nav-user-card" role="none">' +
          '<span class="mobile-nav-avatar" aria-hidden="true">' + initials + '</span>' +
          '<div class="mobile-nav-user-info">' +
            '<strong>' + (user.displayName || user.userId) + '</strong>' +
            '<small>ID: ' + user.userId + '</small>' +
          '</div>' +
        '</li>' +
        '<li><a href="profile.html" class="mobile-nav-link">' + dict.nav_profile + '</a></li>' +
        '<li><a href="my-bags.html" class="mobile-nav-link">' + dict.nav_my_bags + '</a></li>' +
        '<li><a href="report-issue.html" class="mobile-nav-link">' + dict.nav_report + '</a></li>' +
        '<li role="none"><div class="mobile-nav-auth">' +
          '<button type="button" class="btn-mobile-logout" id="btn-mobile-logout">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>' +
            dict.nav_logout +
          '</button>' +
        '</div></li>';
    } else {
      mobileAuthHtml =
        '<li role="none"><div class="mobile-nav-divider" aria-hidden="true"></div></li>' +
        '<li role="none"><div class="mobile-nav-auth">' +
          '<a href="login.html" class="btn-nav-primary">' + dict.nav_login + '</a>' +
          '<a href="register.html" class="btn-nav-outline">' + dict.nav_register + '</a>' +
        '</div></li>';
    }

    const headerHtml =
      '<a href="#main-content" class="skip-to-content">Skip to main content</a>' +

      // Semantic <header> wraps the <nav>
      '<header class="navbar" id="site-header-bar" role="banner">' +
        '<a href="index.html" class="brand-logo" aria-label="AeroSim Aviation Home">' +
          '<svg class="logo-icon-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' +
            '<path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>' +
          '</svg>' +
          '<div class="brand-text">' +
            '<span class="brand-name">AeroSim</span>' +
            '<span class="brand-sub">Aviation</span>' +
          '</div>' +
        '</a>' +

        '<nav class="nav-desktop-links" aria-label="Main navigation">' +
          desktopNavHtml +
        '</nav>' +

        '<div class="nav-actions" id="nav-actions">' +
          window.renderAuthHeader() +
          // Hamburger (always present)
          '<button type="button" class="btn-hamburger" id="btn-nav-hamburger"' +
            ' aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobile-nav-drawer">' +
            '<span class="hamburger-line" aria-hidden="true"></span>' +
            '<span class="hamburger-line" aria-hidden="true"></span>' +
            '<span class="hamburger-line" aria-hidden="true"></span>' +
          '</button>' +
        '</div>' +
      '</header>' +

      // Mobile drawer — semantic <nav>
      '<nav class="mobile-nav-drawer" id="mobile-nav-drawer"' +
        ' aria-label="Mobile navigation" aria-hidden="true">' +
        '<div class="mobile-nav-inner">' +
          '<ul class="mobile-nav-links" role="list">' +
            mobileNavLinksHtml +
            mobileAuthHtml +
            // PWA install
            '<li role="none">' +
              '<button type="button" class="mobile-nav-link mobile-nav-install-btn btn-pwa-install" id="btn-pwa-install-mobile">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>' +
                'Install App' +
              '</button>' +
            '</li>' +
          '</ul>' +
        '</div>' +
      '</nav>';

    headerContainer.innerHTML = headerHtml;
    updateThemeIcon();
    initHeaderEvents();
  }

  // -----------------------------------------------------------------------
  // initHeaderEvents() — wire up all interactive header behaviour
  // -----------------------------------------------------------------------
  function initHeaderEvents() {
    // -- Theme button (added via renderAuthHeader) --
    const themeBtn = document.getElementById('btn-dark-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () { window.toggleAeroSimTheme(); });
    }

    // -- Account dropdown --
    const accountBtn = document.getElementById('account-btn');
    const accountMenu = document.getElementById('account-menu');

    if (accountBtn && accountMenu) {
      // Open/close on click
      accountBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = !accountMenu.hidden;
        closeAccountMenu();
        if (!isOpen) openAccountMenu();
      });

      // Arrow key navigation between menu items
      accountMenu.addEventListener('keydown', function (e) {
        const items = Array.from(accountMenu.querySelectorAll('[role="menuitem"]'));
        const idx = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          items[(idx + 1) % items.length].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          items[(idx - 1 + items.length) % items.length].focus();
        } else if (e.key === 'Home') {
          e.preventDefault();
          items[0].focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          items[items.length - 1].focus();
        } else if (e.key === 'Escape') {
          closeAccountMenu();
          accountBtn.focus();
        } else if (e.key === 'Tab') {
          // Trap is not required for menu; close and let Tab move naturally
          closeAccountMenu();
        }
      });

      // Close on outside click
      document.addEventListener('click', function onOutsideClick(e) {
        if (!accountMenu.hidden && !accountBtn.contains(e.target) && !accountMenu.contains(e.target)) {
          closeAccountMenu();
        }
      });

      // Logout from dropdown
      const logoutBtn = document.getElementById('nav-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
          closeAccountMenu();
          openLogoutDialog(accountBtn);
        });
      }
    }

    function openAccountMenu() {
      if (!accountMenu) return;
      accountMenu.hidden = false;
      accountBtn.setAttribute('aria-expanded', 'true');
      accountBtn.querySelector('.account-chevron').style.transform = 'rotate(180deg)';
      // Close notif panel if open
      const notifDropdown = document.getElementById('notif-dropdown-menu');
      if (notifDropdown) notifDropdown.classList.remove('active');
      // Focus first item
      const firstItem = accountMenu.querySelector('[role="menuitem"]');
      if (firstItem) setTimeout(function () { firstItem.focus(); }, 50);
    }

    function closeAccountMenu() {
      if (!accountMenu) return;
      accountMenu.hidden = true;
      if (accountBtn) {
        accountBtn.setAttribute('aria-expanded', 'false');
        const chevron = accountBtn.querySelector('.account-chevron');
        if (chevron) chevron.style.transform = '';
      }
    }

    // -- Notification panel --
    const notifBtn = document.getElementById('btn-nav-notif');
    const notifDropdown = document.getElementById('notif-dropdown-menu');

    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = notifDropdown.classList.toggle('active');
        notifBtn.setAttribute('aria-expanded', isOpen);
        // Close account menu if open
        closeAccountMenu();
      });

      const markAllBtn = document.getElementById('btn-mark-all-read');
      if (markAllBtn) {
        markAllBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          const notifs = getNotifications().map(function (n) { return Object.assign({}, n, { read: true }); });
          saveNotifications(notifs);
          const listEl = document.getElementById('notif-items-list');
          if (listEl) listEl.innerHTML = renderNotifItemsHtml(notifs);
          const badge = document.getElementById('notif-badge-count');
          if (badge) badge.remove();
          notifBtn.setAttribute('aria-label', 'Notifications');
        });
      }

      const clearBtn = document.getElementById('btn-clear-notifs');
      if (clearBtn) {
        clearBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          saveNotifications([]);
          const listEl = document.getElementById('notif-items-list');
          if (listEl) listEl.innerHTML = '<div class="notif-empty-state">No new notifications</div>';
          const badge = document.getElementById('notif-badge-count');
          if (badge) badge.remove();
          notifBtn.setAttribute('aria-label', 'Notifications');
        });
      }
    }

    // -- Escape closes everything --
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAccountMenu();
        if (notifDropdown) notifDropdown.classList.remove('active');
        const mobileDrawer = document.getElementById('mobile-nav-drawer');
        const hamburgerBtn = document.getElementById('btn-nav-hamburger');
        if (mobileDrawer) {
          mobileDrawer.classList.remove('active');
          mobileDrawer.setAttribute('aria-hidden', 'true');
        }
        if (hamburgerBtn) {
          hamburgerBtn.classList.remove('active');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // Outside click closes notif panel
    document.addEventListener('click', function () {
      if (notifDropdown) notifDropdown.classList.remove('active');
      if (notifBtn) notifBtn.setAttribute('aria-expanded', 'false');
    });

    // -- Mobile hamburger --
    const hamburgerBtn = document.getElementById('btn-nav-hamburger');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    if (hamburgerBtn && mobileDrawer) {
      hamburgerBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = mobileDrawer.classList.toggle('active');
        hamburgerBtn.classList.toggle('active', isOpen);
        hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
        mobileDrawer.setAttribute('aria-hidden', String(!isOpen));
      });

      // Close drawer when a link is activated
      mobileDrawer.querySelectorAll('a, button').forEach(function (el) {
        el.addEventListener('click', function () {
          mobileDrawer.classList.remove('active');
          hamburgerBtn.classList.remove('active');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          mobileDrawer.setAttribute('aria-hidden', 'true');
        });
      });
    }

    // -- Mobile logout button --
    const mobileLogoutBtn = document.getElementById('btn-mobile-logout');
    if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener('click', function () {
        openLogoutDialog(hamburgerBtn || document.body);
      });
    }

    // -- PWA install --
    const installBtn = document.getElementById('btn-pwa-install-mobile');
    if (installBtn) {
      installBtn.addEventListener('click', function () { window.installAeroSimApp(); });
    }
  }

  // -----------------------------------------------------------------------
  // renderFooter()
  // -----------------------------------------------------------------------
  function renderFooter() {
    const footerContainer = document.getElementById('site-footer');
    if (!footerContainer) return;
    const lang = getLanguage();
    const dict = I18N[lang] || I18N.en;

    const footerHtml =
      '<footer class="site-footer" role="contentinfo">' +
        '<div class="footer-container">' +
          '<div class="footer-grid">' +

            // Col 1: Brand
            '<div class="footer-col footer-col-brand">' +
              '<a href="index.html" class="footer-brand-logo" aria-label="AeroSim Aviation Home">' +
                '<svg class="footer-logo-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' +
                  '<path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>' +
                '</svg>' +
                '<div class="footer-brand-text">' +
                  '<span class="footer-brand-name">AeroSim</span>' +
                  '<span class="footer-brand-sub">Aviation</span>' +
                '</div>' +
              '</a>' +
              '<p class="footer-blurb">Real-time baggage handling simulation system. Modeling standard IATA bag journeys from check-in to aircraft loading and arrival carousels.</p>' +
              '<div class="footer-social-row" aria-label="Social links">' +
                '<a href="https://github.com" target="_blank" rel="noopener noreferrer" class="social-icon-btn" aria-label="AeroSim on GitHub"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></a>' +
                '<a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="social-icon-btn" aria-label="AeroSim on X / Twitter"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></a>' +
                '<a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="social-icon-btn" aria-label="AeroSim on LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>' +
              '</div>' +
            '</div>' +

            // Col 2: Quick Links
            '<div class="footer-col">' +
              '<h4 class="footer-heading">' + dict.quick_links + '</h4>' +
              '<ul class="footer-links-list">' +
                '<li><a href="index.html">' + dict.nav_home + '</a></li>' +
                '<li><a href="track.html">' + dict.nav_track + '</a></li>' +
                '<li><a href="how-it-works.html">' + dict.nav_how + '</a></li>' +
                '<li><a href="about.html">About AeroSim</a></li>' +
                '<li><a href="my-bags.html">' + dict.nav_my_bags + '</a></li>' +
              '</ul>' +
            '</div>' +

            // Col 3: Support
            '<div class="footer-col">' +
              '<h4 class="footer-heading">' + dict.support_heading + '</h4>' +
              '<ul class="footer-links-list">' +
                '<li><a href="faq.html">' + dict.nav_faq + '</a></li>' +
                '<li><a href="contact.html">' + dict.nav_contact + '</a></li>' +
                '<li><a href="report-issue.html">Report Lost / Delayed Bag</a></li>' +
                '<li><a href="stage.html?step=1">Simulation Stages 1–6</a></li>' +
              '</ul>' +
            '</div>' +

            // Col 4: Legal
            '<div class="footer-col">' +
              '<h4 class="footer-heading">' + dict.legal_heading + '</h4>' +
              '<ul class="footer-links-list">' +
                '<li><a href="terms.html">Terms of Service</a></li>' +
                '<li><a href="privacy.html">Privacy Policy</a></li>' +
                '<li><span class="footer-badge-academic">Academic Project</span></li>' +
                '<li><span class="footer-version-tag">Build v2.8.0 · Vanilla JS</span></li>' +
              '</ul>' +
            '</div>' +
          '</div>' +

          '<div class="footer-bottom-bar">' +
            '<span class="footer-copyright">&copy; 2026 AeroSim Aviation. ' + dict.footer_academic + '</span>' +
            '<a href="#top" class="footer-back-to-top" id="footer-back-to-top">' +
              '<span>Back to top</span>' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="18 15 12 9 6 15"></polyline></svg>' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</footer>';

    footerContainer.innerHTML = footerHtml;

    const backToTopBtn = document.getElementById('footer-back-to-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // -----------------------------------------------------------------------
  // Global notification push helper
  // -----------------------------------------------------------------------
  window.pushAeroSimNotification = function (title, message) {
    const notifs = getNotifications();
    notifs.unshift({ id: 'notif-' + Date.now(), title: title, message: message, time: Date.now(), read: false });
    if (notifs.length > 20) notifs.pop();
    saveNotifications(notifs);

    const list = document.getElementById('notif-items-list');
    if (list) list.innerHTML = renderNotifItemsHtml(notifs);

    const notifBtn = document.getElementById('btn-nav-notif');
    if (notifBtn) {
      let badge = document.getElementById('notif-badge-count');
      const unreadCount = notifs.filter(function (n) { return !n.read; }).length;
      if (!badge && unreadCount > 0) {
        badge = document.createElement('span');
        badge.id = 'notif-badge-count';
        badge.className = 'notif-badge-count';
        badge.setAttribute('aria-hidden', 'true');
        notifBtn.appendChild(badge);
      }
      if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
      }
    }
  };

  // -----------------------------------------------------------------------
  // Re-render header when profile is updated (name change)
  // Exposed so profile.html can call window.refreshAeroSimHeader()
  // -----------------------------------------------------------------------
  window.refreshAeroSimHeader = function () {
    renderHeader();
  };

  // -----------------------------------------------------------------------
  // PWA setup
  // -----------------------------------------------------------------------
  function initPWA() {
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = 'manifest.json';
      document.head.appendChild(link);
    }
    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#1672ec';
      document.head.appendChild(meta);
    }

    if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
      navigator.serviceWorker.register('./sw.js').then(function (reg) {
        reg.addEventListener('updatefound', function () {
          const worker = reg.installing;
          if (worker) {
            worker.addEventListener('statechange', function () {
              if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                if (typeof window.showToast === 'function') {
                  window.showToast('🚀 New update available! Refresh the page to load the latest version.', 8000);
                }
              }
            });
          }
        });
      }).catch(function (err) {
        console.warn('ServiceWorker registration error:', err);
      });
    }

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      window.deferredInstallPrompt = e;
      document.querySelectorAll('.btn-pwa-install').forEach(function (btn) {
        btn.style.display = 'inline-flex';
      });
    });
  }

  window.installAeroSimApp = function () {
    if (window.deferredInstallPrompt) {
      window.deferredInstallPrompt.prompt();
      window.deferredInstallPrompt.userChoice.then(function () {
        window.deferredInstallPrompt = null;
      });
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      alert(isIOS
        ? '📲 To install AeroSim on iPhone/iPad:\n\n1. Tap the Share button at the bottom.\n2. Scroll down and tap "Add to Home Screen".\n3. Tap "Add".'
        : '📲 To install AeroSim:\n\n1. Tap the three dots in Chrome.\n2. Select "Install app" or "Add to Home screen".');
    }
  };

  // -----------------------------------------------------------------------
  // Auth-page redirect: already-logged-in users should not see login/register
  // -----------------------------------------------------------------------
  function redirectIfAlreadyLoggedIn() {
    const page = getCurrentPageName();
    if (page !== 'login.html' && page !== 'register.html') return;
    const user = getSessionUser();
    if (!user) return;
    try {
      const params = new URLSearchParams(window.location.search);
      window.location.replace(params.get('next') || 'my-bags.html');
    } catch (e) {
      window.location.replace('my-bags.html');
    }
  }

  // -----------------------------------------------------------------------
  // Cross-tab sync via storage event
  // -----------------------------------------------------------------------
  window.addEventListener('storage', function (e) {
    if (e.key === 'aerosim_user' || e.key === 'aerosim_lang') {
      renderHeader();
    }
  });

  // -----------------------------------------------------------------------
  // Back/forward cache (pageshow) — re-check auth state
  // -----------------------------------------------------------------------
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      renderHeader();
    }
  });

  // -----------------------------------------------------------------------
  // Initialise layout
  // -----------------------------------------------------------------------
  function initLayout() {
    redirectIfAlreadyLoggedIn(); // synchronous, before any rendering
    initTheme();
    initPWA();
    renderHeader();
    renderFooter();
    if (typeof window.applyAeroSimLanguage === 'function') {
      window.applyAeroSimLanguage();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayout);
  } else {
    initLayout();
  }
})();
