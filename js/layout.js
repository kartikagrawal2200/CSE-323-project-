/**
 * AeroSim Aviation - Shared Layout (Header, Navigation, Notification Bell, Mobile Menu & Footer)
 */

(function () {
  'use strict';

  // Seed default notifications if none exist
  function getNotifications() {
    try {
      const saved = localStorage.getItem('aerosim_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const defaults = [
      { id: 'notif-1', title: 'Baggage Loaded', message: 'Bag LHR-123456 loaded onto Flight LH247.', time: Date.now() - 1000 * 60 * 12, read: false },
      { id: 'notif-2', title: 'Stage Verified', message: 'Security screening completed at Terminal 2.', time: Date.now() - 1000 * 60 * 45, read: false },
      { id: 'notif-3', title: 'Welcome to AeroSim', message: 'Live baggage simulation engine v2.6 active.', time: Date.now() - 1000 * 60 * 180, read: true }
    ];
    localStorage.setItem('aerosim_notifications', JSON.stringify(defaults));
    return defaults;
  }

  function saveNotifications(notifs) {
    localStorage.setItem('aerosim_notifications', JSON.stringify(notifs));
  }

  function formatRelativeTime(timestamp) {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  // Theme Management
  function initTheme() {
    const savedTheme = localStorage.getItem('aerosim_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  window.toggleAeroSimTheme = function () {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('aerosim_theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('aerosim_theme', 'dark');
    }
    updateThemeIcon();
  };

  function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const toggleBtns = document.querySelectorAll('.btn-dark-toggle');
    toggleBtns.forEach(btn => {
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.innerHTML = isDark
        ? `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    });
  }

  // Determine current page for active nav
  function getCurrentPageName() {
    const path = window.location.pathname.replace(/\\/g, '/');
    const filename = path.split('/').pop().toLowerCase();
    if (!filename || filename === '' || filename === 'index.html') return 'index.html';
    return filename;
  }

  // Inject Header
  function renderHeader() {
    const headerContainer = document.getElementById('site-header');
    if (!headerContainer) return;

    const currentUser = localStorage.getItem('aerosim_user');
    const currentPage = getCurrentPageName();
    const notifs = getNotifications();
    const unreadCount = notifs.filter(n => !n.read).length;

    const navLinks = [
      { href: 'index.html', label: 'Home', key: 'index.html' },
      { href: 'track.html', label: 'Track Baggage', key: 'track.html' },
      { href: 'how-it-works.html', label: 'How It Works', key: 'how-it-works.html' },
      { href: 'faq.html', label: 'FAQ', key: 'faq.html' },
      { href: 'contact.html', label: 'Contact', key: 'contact.html' }
    ];

    const navLinksHtml = navLinks.map(link => {
      const isActive = (currentPage === link.key) ? ' active' : '';
      return `<a href="${link.href}" class="nav-link${isActive}">${link.label}</a>`;
    }).join('');

    let authSectionHtml = '';
    if (currentUser) {
      authSectionHtml = `
        <!-- Theme Toggle -->
        <button type="button" class="btn-dark-toggle" onclick="window.toggleAeroSimTheme()" aria-label="Toggle theme">
        </button>

        <!-- Notification Bell Dropdown -->
        <div class="notif-dropdown-wrapper">
          <button type="button" class="btn-nav-notif" id="btn-nav-notif" aria-label="Notifications" aria-expanded="false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            ${unreadCount > 0 ? `<span class="notif-badge-count" id="notif-badge-count">${unreadCount}</span>` : ''}
          </button>

          <div class="notif-dropdown-menu" id="notif-dropdown-menu">
            <div class="notif-dropdown-header">
              <span class="notif-title">Notifications</span>
              <div class="notif-actions-links">
                <button type="button" class="btn-text-action" id="btn-mark-all-read">Mark all read</button>
                <button type="button" class="btn-text-action" id="btn-clear-notifs">Clear</button>
              </div>
            </div>
            <div class="notif-items-list" id="notif-items-list">
              ${renderNotifItemsHtml(notifs)}
            </div>
          </div>
        </div>

        <!-- User Profile Pill -->
        <div class="user-pill-dropdown">
          <button class="user-pill" id="user-menu-btn" aria-label="User Menu" aria-expanded="false">
            <span class="user-avatar-circle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <span id="header-username">${currentUser}</span>
            <svg class="user-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div class="user-dropdown-menu" id="user-dropdown">
            <a href="journey.html" class="dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="15" rx="3"></rect><path d="M9 6V4a3 3 0 0 1 6 0v2"></path></svg>
              Active Baggage
            </a>
            <a href="my-bags.html" class="dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              My Bags
            </a>
            <a href="track.html" class="dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              Track Another Bag
            </a>
            <a href="report-issue.html" class="dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Report a Problem
            </a>
            <a href="profile.html" class="dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Profile Settings
            </a>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item danger" id="nav-logout-btn" role="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </div>
          </div>
        </div>
      `;
    } else {
      authSectionHtml = `
        <!-- Theme Toggle -->
        <button type="button" class="btn-dark-toggle" onclick="window.toggleAeroSimTheme()" aria-label="Toggle theme">
        </button>
        <a href="register.html" class="btn-nav-outline" id="nav-btn-register">Register</a>
        <a href="login.html" class="btn-nav-primary" id="nav-btn-login">Login</a>
      `;
    }

    const headerHtml = `
      <a href="#main-content" class="skip-to-content">Skip to content</a>
      <header class="navbar" role="banner">
        <!-- Logo -->
        <a href="index.html" class="brand-logo" id="brand-logo" aria-label="AeroSim Aviation Home">
          <svg class="logo-icon-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
          <div class="brand-text">
            <span class="brand-name">AeroSim</span>
            <span class="brand-sub">Aviation</span>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="nav-desktop-links" aria-label="Main Navigation">
          ${navLinksHtml}
        </nav>

        <!-- Right Side Nav Actions -->
        <div class="nav-actions">
          ${authSectionHtml}

          <!-- Hamburger Button (Mobile) -->
          <button type="button" class="btn-hamburger" id="btn-nav-hamburger" aria-label="Toggle navigation menu" aria-expanded="false">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
        </div>
      </header>

      <!-- Mobile Navigation Drawer -->
      <div class="mobile-nav-drawer" id="mobile-nav-drawer" aria-hidden="true">
        <div class="mobile-nav-inner">
          <div class="mobile-nav-links">
            ${navLinks.map(l => `<a href="${l.href}" class="mobile-nav-link${(currentPage === l.key) ? ' active' : ''}">${l.label}</a>`).join('')}
            <!-- Install App Action (Mobile Drawer) -->
            <button type="button" class="mobile-nav-link btn-pwa-install" onclick="window.installAeroSimApp()" style="display: flex; align-items: center; gap: 8px; color: #1672ec; font-weight: 600; background: none; border: none; text-align: left; cursor: pointer; padding: 10px 0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              📲 Install Mobile App
            </button>
            ${currentUser ? `
              <div class="mobile-nav-divider"></div>
              <a href="my-bags.html" class="mobile-nav-link">My Tracked Bags</a>
              <a href="report-issue.html" class="mobile-nav-link">Report an Issue</a>
              <a href="profile.html" class="mobile-nav-link">Account Profile</a>
              <div class="mobile-nav-auth">
                <button type="button" class="btn-mobile-logout" id="btn-mobile-logout">
                  Logout (${currentUser})
                </button>
              </div>
            ` : `
              <div class="mobile-nav-divider"></div>
              <div class="mobile-nav-auth">
                <a href="login.html" class="btn-nav-primary" style="text-align: center;">Login</a>
                <a href="register.html" class="btn-nav-outline" style="text-align: center;">Register</a>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    headerContainer.innerHTML = headerHtml;
    updateThemeIcon();
    initHeaderEvents();
  }

  function renderNotifItemsHtml(notifs) {
    if (!notifs || notifs.length === 0) {
      return `<div class="notif-empty-state">No new notifications</div>`;
    }
    return notifs.map(n => `
      <div class="notif-item${n.read ? ' read' : ' unread'}" data-id="${n.id}">
        <div class="notif-item-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>
        <div class="notif-item-body">
          <div class="notif-item-title">${n.title}</div>
          <div class="notif-item-msg">${n.message}</div>
          <div class="notif-item-time">${formatRelativeTime(n.time)}</div>
        </div>
      </div>
    `).join('');
  }

  // Header Event Handlers
  function initHeaderEvents() {
    // User dropdown
    const userBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    if (userBtn && userDropdown) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = userDropdown.classList.toggle('active');
        userBtn.setAttribute('aria-expanded', isOpen);
        // close notif if open
        const notifDropdown = document.getElementById('notif-dropdown-menu');
        if (notifDropdown) notifDropdown.classList.remove('active');
      });
    }

    // Notification dropdown
    const notifBtn = document.getElementById('btn-nav-notif');
    const notifDropdown = document.getElementById('notif-dropdown-menu');
    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = notifDropdown.classList.toggle('active');
        notifBtn.setAttribute('aria-expanded', isOpen);
        // close user dropdown if open
        if (userDropdown) userDropdown.classList.remove('active');
      });

      // Mark all read
      const markAllBtn = document.getElementById('btn-mark-all-read');
      if (markAllBtn) {
        markAllBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const notifs = getNotifications().map(n => ({ ...n, read: true }));
          saveNotifications(notifs);
          document.getElementById('notif-items-list').innerHTML = renderNotifItemsHtml(notifs);
          const badge = document.getElementById('notif-badge-count');
          if (badge) badge.remove();
        });
      }

      // Clear notifications
      const clearBtn = document.getElementById('btn-clear-notifs');
      if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          saveNotifications([]);
          document.getElementById('notif-items-list').innerHTML = `<div class="notif-empty-state">No new notifications</div>`;
          const badge = document.getElementById('notif-badge-count');
          if (badge) badge.remove();
        });
      }
    }

    // Close on outside click
    document.addEventListener('click', () => {
      if (userDropdown) userDropdown.classList.remove('active');
      if (notifDropdown) notifDropdown.classList.remove('active');
    });

    // Mobile Hamburger
    const hamburgerBtn = document.getElementById('btn-nav-hamburger');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    if (hamburgerBtn && mobileDrawer) {
      hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = mobileDrawer.classList.toggle('active');
        hamburgerBtn.classList.toggle('active', isOpen);
        hamburgerBtn.setAttribute('aria-expanded', isOpen);
        mobileDrawer.setAttribute('aria-hidden', !isOpen);
      });

      // Close on link click
      mobileDrawer.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          mobileDrawer.classList.remove('active');
          hamburgerBtn.classList.remove('active');
        });
      });

      // Close on Esc
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          mobileDrawer.classList.remove('active');
          hamburgerBtn.classList.remove('active');
          if (userDropdown) userDropdown.classList.remove('active');
          if (notifDropdown) notifDropdown.classList.remove('active');
        }
      });
    }

    // Logout handlers
    const logoutBtn = document.getElementById('nav-logout-btn');
    const mobileLogoutBtn = document.getElementById('btn-mobile-logout');
    function performLogout(e) {
      if (e) e.preventDefault();
      if (typeof window.showConfirmModal === 'function') {
        window.showConfirmModal({
          title: 'Sign Out Confirmation',
          message: 'Are you sure you want to sign out of your AeroSim account?',
          confirmText: 'Sign Out',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            localStorage.removeItem('aerosim_user');
            if (typeof window.showToast === 'function') {
              window.showToast('Logged out successfully');
            }
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 500);
          }
        });
      } else {
        localStorage.removeItem('aerosim_user');
        if (typeof window.showToast === 'function') {
          window.showToast('Logged out successfully');
        }
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      }
    }

    if (logoutBtn) logoutBtn.addEventListener('click', performLogout);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', performLogout);
  }

  // Inject Footer
  function renderFooter() {
    const footerContainer = document.getElementById('site-footer');
    if (!footerContainer) return;

    const footerHtml = `
      <footer class="site-footer" role="contentinfo">
        <div class="footer-container">
          <!-- 4 Columns Grid -->
          <div class="footer-grid">
            <!-- Col 1: Brand & Blurb -->
            <div class="footer-col footer-col-brand">
              <a href="index.html" class="footer-brand-logo">
                <svg class="footer-logo-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
                <div class="footer-brand-text">
                  <span class="footer-brand-name">AeroSim</span>
                  <span class="footer-brand-sub">Aviation</span>
                </div>
              </a>
              <p class="footer-blurb">
                Real-time baggage handling simulation system. Modeling standard IATA bag journeys from check-in to aircraft loading and arrival carousels.
              </p>
              <div class="footer-social-row">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="social-icon-btn" aria-label="AeroSim on GitHub">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="social-icon-btn" aria-label="AeroSim on X / Twitter">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="social-icon-btn" aria-label="AeroSim on LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="social-icon-btn" aria-label="AeroSim Flight Operations Video Channel">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                </a>
              </div>
            </div>

            <!-- Col 2: Quick Links -->
            <div class="footer-col">
              <h4 class="footer-heading">Quick Links</h4>
              <ul class="footer-links-list">
                <li><a href="index.html">Home</a></li>
                <li><a href="track.html">Track Baggage</a></li>
                <li><a href="how-it-works.html">How It Works</a></li>
                <li><a href="about.html">About AeroSim</a></li>
                <li><a href="my-bags.html">My Tracked Bags</a></li>
              </ul>
            </div>

            <!-- Col 3: Support -->
            <div class="footer-col">
              <h4 class="footer-heading">Support</h4>
              <ul class="footer-links-list">
                <li><a href="faq.html">Help &amp; FAQ</a></li>
                <li><a href="contact.html">Contact Operations</a></li>
                <li><a href="report-issue.html">Report Lost / Delayed Bag</a></li>
                <li><a href="stage.html?step=1">Simulation Stages 1–6</a></li>
              </ul>
            </div>

            <!-- Col 4: Legal & Project -->
            <div class="footer-col">
              <h4 class="footer-heading">Legal &amp; Notice</h4>
              <ul class="footer-links-list">
                <li><a href="terms.html">Terms of Service</a></li>
                <li><a href="privacy.html">Privacy Policy</a></li>
                <li><span class="footer-badge-academic">Academic Project</span></li>
                <li><span class="footer-version-tag">Build v2.6.4 • Vanilla JS</span></li>
              </ul>
            </div>
          </div>

          <!-- Bottom Bar -->
          <div class="footer-bottom-bar">
            <span class="footer-copyright">
              &copy; 2026 AeroSim Aviation. Academic simulation project.
            </span>
            <a href="#top" class="footer-back-to-top" id="footer-back-to-top">
              <span>Back to top</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    `;

    footerContainer.innerHTML = footerHtml;

    // Back to top smooth scroll
    const backToTopBtn = document.getElementById('footer-back-to-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // Global Notification Push Helper
  window.pushAeroSimNotification = function (title, message) {
    const notifs = getNotifications();
    const newNotif = {
      id: 'notif-' + Date.now(),
      title: title,
      message: message,
      time: Date.now(),
      read: false
    };
    notifs.unshift(newNotif);
    if (notifs.length > 20) notifs.pop();
    saveNotifications(notifs);

    // Refresh UI if on page
    const list = document.getElementById('notif-items-list');
    if (list) list.innerHTML = renderNotifItemsHtml(notifs);

    const notifBtn = document.getElementById('btn-nav-notif');
    if (notifBtn) {
      let badge = document.getElementById('notif-badge-count');
      const unreadCount = notifs.filter(n => !n.read).length;
      if (!badge && unreadCount > 0) {
        badge = document.createElement('span');
        badge.id = 'notif-badge-count';
        badge.className = 'notif-badge-count';
        notifBtn.appendChild(badge);
      }
      if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
      }
    }
  };

  // Mobile PWA Setup & Installation Handler
  function initPWA() {
    // 1. Inject Manifest link if not present
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = 'manifest.json';
      document.head.appendChild(manifestLink);
    }
    // 2. Inject mobile theme & iOS web-app metas
    if (!document.querySelector('meta[name="theme-color"]')) {
      const themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
      themeMeta.content = '#1672ec';
      document.head.appendChild(themeMeta);
    }
    if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
      const appleMeta = document.createElement('meta');
      appleMeta.name = 'apple-mobile-web-app-capable';
      appleMeta.content = 'yes';
      document.head.appendChild(appleMeta);
    }
    if (!document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')) {
      const appleStatus = document.createElement('meta');
      appleStatus.name = 'apple-mobile-web-app-status-bar-style';
      appleStatus.content = 'black-translucent';
      document.head.appendChild(appleStatus);
    }

    // 3. Register Service Worker if running under HTTP/HTTPS
    if ('serviceWorker' in navigator && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        console.log('AeroSim PWA ServiceWorker registered with scope:', reg.scope);
      }).catch((err) => {
        console.warn('ServiceWorker registration error:', err);
      });
    }

    // 4. Capture native install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredInstallPrompt = e;
      const btns = document.querySelectorAll('.btn-pwa-install');
      btns.forEach(btn => { btn.style.display = 'inline-flex'; });
    });
  }

  // Global mobile install trigger
  window.installAeroSimApp = function () {
    if (window.deferredInstallPrompt) {
      window.deferredInstallPrompt.prompt();
      window.deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted AeroSim installation');
        }
        window.deferredInstallPrompt = null;
      });
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        alert('📲 To install AeroSim on iPhone/iPad:\n\n1. Tap the Share button (⎋ / square with arrow) at the bottom.\n2. Scroll down and tap "Add to Home Screen".\n3. Tap "Add" to launch AeroSim in full-screen standalone mode.');
      } else {
        alert('📲 To install AeroSim on Android / Mobile:\n\n1. Tap the three dots (⋮) in the top-right corner of Chrome.\n2. Select "Install app" or "Add to Home screen".\n3. AeroSim will install to your app drawer like a native application.');
      }
    }
  };

  // Initialize layout when DOM is ready
  function initLayout() {
    initTheme();
    initPWA();
    renderHeader();
    renderFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayout);
  } else {
    initLayout();
  }
})();
