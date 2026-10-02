/**
 * AeroSim Aviation - Core Application Logic
 * Pure Vanilla JavaScript (No frameworks, No external dependencies)
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1. Password Hashing & Crypto Helper (Web Cryptography API)
  // -------------------------------------------------------------
  async function hashPassword(plainText) {
    if (!plainText) return '';
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(plainText);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('SubtleCrypto unavailable, falling back to simulated hash', e);
      // Fallback hash simulation for restricted environments
      let hash = 0;
      for (let i = 0; i < plainText.length; i++) {
        const char = plainText.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      return 'sim_' + Math.abs(hash).toString(16).padStart(16, '0');
    }
  }

  // -------------------------------------------------------------
  // 2. User Store & Seed Accounts (localStorage: aerosim_users)
  // -------------------------------------------------------------
  function getUsers() {
    try {
      const u = localStorage.getItem('aerosim_users');
      if (u) return JSON.parse(u);
    } catch (e) {
      console.error(e);
    }
    return {};
  }

  function saveUsers(users) {
    localStorage.setItem('aerosim_users', JSON.stringify(users));
  }

  async function seedDefaultUsers() {
    const users = getUsers();
    if (!users['User2244']) {
      const passHash = await hashPassword('password123');
      users['User2244'] = {
        userId: 'User2244',
        passwordHash: passHash,
        phone: '+1 555-019-2834',
        displayName: 'User2244',
        email: 'user2244@aerosim.example.com',
        createdAt: new Date().toISOString()
      };
      saveUsers(users);
    }
  }

  // -------------------------------------------------------------
  // 3. Session & Auth State Helpers
  // -------------------------------------------------------------
  function getCurrentUser() {
    try {
      return localStorage.getItem('aerosim_user') || sessionStorage.getItem('aerosim_user') || null;
    } catch (e) {
      console.warn('Storage read error in getCurrentUser:', e);
      return null;
    }
  }

  function setCurrentUser(username, rememberMe = true) {
    try {
      if (rememberMe) {
        localStorage.setItem('aerosim_user', username);
        sessionStorage.removeItem('aerosim_user');
      } else {
        sessionStorage.setItem('aerosim_user', username);
        localStorage.removeItem('aerosim_user');
      }
    } catch (e) {
      console.warn('Storage write error in setCurrentUser:', e);
    }
  }

  function clearCurrentUser() {
    try {
      localStorage.removeItem('aerosim_user');
      sessionStorage.removeItem('aerosim_user');
    } catch (e) {
      console.warn('Storage remove error in clearCurrentUser:', e);
    }
  }

  // Auth Guard: protect pages requiring login
  window.requireLogin = function (targetPage) {
    const user = getCurrentUser();
    if (!user) {
      const currentPath = targetPage || (window.location.pathname.split('/').pop() || 'index.html') + (window.location.search || '');
      window.location.href = `login.html?next=${encodeURIComponent(currentPath)}`;
      return false;
    }
    return true;
  };

  // Expose global session getters/setters for legacy compatibility
  window.getCurrentUser = getCurrentUser;
  window.setCurrentUser = setCurrentUser;
  window.clearCurrentUser = clearCurrentUser;

  // -------------------------------------------------------------
  // 4. Toast Notifications
  // -------------------------------------------------------------
  // 4. Toast Notifications (with ARIA live region)
  // -------------------------------------------------------------
  window.showToast = function (message, duration = 3200) {
    let toast = document.getElementById('aerosim-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'aerosim-toast';
      toast.className = 'toast-box';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.innerHTML = `
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span id="toast-message-text"></span>
      `;
      document.body.appendChild(toast);
    }
    const textEl = document.getElementById('toast-message-text');
    if (textEl) textEl.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  };

  // -------------------------------------------------------------
  // 5. Custom Confirm Modal using native <dialog> element
  //    (meets WCAG, semantic HTML5, and ARIA requirements)
  // -------------------------------------------------------------
  window.showConfirmModal = function ({ title, message, confirmText = 'Confirm', confirmClass = 'btn-primary-action', onConfirm }) {
    // Create once, reuse
    let dlg = document.getElementById('aerosim-confirm-dialog');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'aerosim-confirm-dialog';
      dlg.className = 'confirm-dialog';
      dlg.setAttribute('aria-labelledby', 'confirm-dialog-heading');
      dlg.innerHTML =
        '<div class="confirm-dialog__inner">' +
          '<div class="confirm-dialog__header">' +
            '<h2 class="confirm-dialog__heading" id="confirm-dialog-heading">Confirm Action</h2>' +
            '<button type="button" class="confirm-dialog__close" id="btn-confirm-dialog-close" aria-label="Close">&times;</button>' +
          '</div>' +
          '<p class="confirm-dialog__body" id="confirm-dialog-body">Are you sure you want to proceed?</p>' +
          '<div class="confirm-dialog__actions">' +
            '<button type="button" class="btn-secondary-action" id="btn-confirm-dialog-cancel">Cancel</button>' +
            '<button type="button" class="btn-primary-action" id="btn-confirm-dialog-ok">Confirm</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(dlg);
    }

    const headingEl = document.getElementById('confirm-dialog-heading');
    const bodyEl    = document.getElementById('confirm-dialog-body');
    const okBtn     = document.getElementById('btn-confirm-dialog-ok');
    const cancelBtn = document.getElementById('btn-confirm-dialog-cancel');
    const closeBtn  = document.getElementById('btn-confirm-dialog-close');
    const previousActive = document.activeElement;

    if (headingEl) headingEl.textContent = title;
    if (bodyEl)    bodyEl.innerHTML = message;
    if (okBtn) {
      okBtn.textContent = confirmText;
      okBtn.className = confirmClass;
    }

    function closeDlg() {
      dlg.close();
      if (previousActive && typeof previousActive.focus === 'function') previousActive.focus();
    }

    // Re-clone buttons to remove stale event listeners
    const freshOk     = okBtn.cloneNode(true);
    const freshCancel = cancelBtn.cloneNode(true);
    const freshClose  = closeBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(freshOk, okBtn);
    cancelBtn.parentNode.replaceChild(freshCancel, cancelBtn);
    closeBtn.parentNode.replaceChild(freshClose, closeBtn);

    document.getElementById('btn-confirm-dialog-ok').addEventListener('click', function () {
      closeDlg();
      if (typeof onConfirm === 'function') onConfirm();
    });
    document.getElementById('btn-confirm-dialog-cancel').addEventListener('click', closeDlg);
    document.getElementById('btn-confirm-dialog-close').addEventListener('click', closeDlg);

    // Close on backdrop click (::backdrop)
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) closeDlg();
    });

    dlg.showModal();
    const firstBtn = document.getElementById('btn-confirm-dialog-ok');
    if (firstBtn) setTimeout(function () { firstBtn.focus(); }, 50);
  };

  // -------------------------------------------------------------
  // 6. UI Enhancements: Cookie Banner & Floating Scroll-To-Top
  // -------------------------------------------------------------
  function initCookieConsent() {
    const consent = localStorage.getItem('aerosim_cookie_consent');
    if (consent) return;

    let banner = document.getElementById('cookie-consent-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'cookie-consent-banner';
      banner.className = 'cookie-consent-banner';
      banner.innerHTML = `
        <div class="cookie-banner-content">
          <div class="cookie-text-col">
            <strong>Cookie &amp; Local Storage Consent</strong>
            <p>AeroSim Aviation stores baggage telemetry, authentication sessions, and simulation preferences locally in your browser for academic demonstration purposes.</p>
          </div>
          <div class="cookie-actions-col">
            <button type="button" class="btn-cookie-decline" id="btn-cookie-decline">Decline</button>
            <button type="button" class="btn-cookie-accept" id="btn-cookie-accept">Accept All</button>
          </div>
        </div>
      `;
      document.body.appendChild(banner);
    }

    const acceptBtn = document.getElementById('btn-cookie-accept');
    const declineBtn = document.getElementById('btn-cookie-decline');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('aerosim_cookie_consent', 'accepted');
        banner.classList.add('dismissed');
        setTimeout(() => banner.remove(), 400);
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        localStorage.setItem('aerosim_cookie_consent', 'declined');
        banner.classList.add('dismissed');
        setTimeout(() => banner.remove(), 400);
      });
    }
  }

  function initScrollToTop() {
    let scrollBtn = document.getElementById('btn-scroll-top-float');
    if (!scrollBtn) {
      scrollBtn = document.createElement('button');
      scrollBtn.id = 'btn-scroll-top-float';
      scrollBtn.className = 'btn-scroll-top-float';
      scrollBtn.setAttribute('aria-label', 'Scroll to top');
      scrollBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      `;
      document.body.appendChild(scrollBtn);
    }

    window.addEventListener('scroll', () => {
      if (window.scrollY > 280) {
        scrollBtn.classList.add('visible');
      } else {
        scrollBtn.classList.remove('visible');
      }
    });

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Scroll reveal animations using IntersectionObserver
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;
    const cards = document.querySelectorAll('.feature-card, .info-feature-card, .stat-counter-card, .team-card, .airport-chip-card, .faq-preview-card, .how-step-card');
    
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach(card => {
      card.classList.add('reveal-item');
      observer.observe(card);
    });
  }

  // -------------------------------------------------------------
  // 7. Password Visibility Toggles
  // -------------------------------------------------------------
  function initPasswordToggle() {
    const toggleBtns = document.querySelectorAll('.btn-toggle-eye');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const input = btn.parentElement.querySelector('input');
        if (!input) return;
        if (input.type === 'password') {
          input.type = 'text';
          btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          `;
        } else {
          input.type = 'password';
          btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          `;
        }
      });
    });
  }

  // -------------------------------------------------------------
  // 8. initUserDropdown — now handled by layout.js renderAuthHeader().
  //    This function only updates the visible username text if the
  //    element still exists (legacy pages that might render it differently).
  // -------------------------------------------------------------
  function initUserDropdown() {
    // Account menu is fully managed by layout.js / renderAuthHeader().
    // Nothing extra needed here. The logout button is wired in initHeaderEvents().
    const userNameEl = document.getElementById('header-username');
    if (userNameEl) {
      userNameEl.textContent = getCurrentUser() || '';
    }
  }

  // -------------------------------------------------------------
  // 9. Search Baggage Handler (with Format Validation & Unknown Tag Alert)
  // -------------------------------------------------------------
  function initSearchForms() {
    const searchForms = document.querySelectorAll('.baggage-search-form');
    searchForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('.search-input-box');
        const errorEl = document.getElementById('track-input-error');
        const notFoundCard = document.getElementById('track-notfound-card');
        const loadingSkeleton = document.getElementById('track-loading-state');
        const submitBtn = form.querySelector('button[type="submit"]');

        const rawTag = input ? input.value.trim().toUpperCase() : '';

        // Reset previous errors
        if (errorEl) {
          errorEl.style.display = 'none';
          errorEl.textContent = '';
        }
        if (notFoundCard) notFoundCard.style.display = 'none';

        // 1. Validation Regex Check: ^[A-Z]{3}-\d{6}$
        const tagRegex = /^[A-Z]{3}-\d{6}$/;
        if (!tagRegex.test(rawTag)) {
          if (errorEl) {
            errorEl.setAttribute('role', 'alert');
            errorEl.setAttribute('aria-live', 'assertive');
            errorEl.style.display = 'block';
            errorEl.textContent = 'Invalid format. Baggage tag must match 3 capital letters, a hyphen, and 6 digits (e.g. LHR-123456).';
          } else {
            window.showToast('Invalid tag format. Must match e.g. LHR-123456');
          }
          if (input) input.focus();
          return;
        }

        // 2. Database Lookup
        let foundBag = null;
        if (window.AeroSimData) {
          foundBag = window.AeroSimData.getBagByTag(rawTag);
        }

        // 3. Unknown Tag -> Show Not Found Card
        if (!foundBag) {
          if (notFoundCard) {
            notFoundCard.setAttribute('role', 'alert');
            notFoundCard.setAttribute('aria-live', 'polite');
            const notFoundTagDisplay = document.getElementById('notfound-tag-display');
            if (notFoundTagDisplay) notFoundTagDisplay.textContent = rawTag;
            notFoundCard.style.display = 'block';
            notFoundCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            window.showToast(`Baggage tag ${rawTag} not found in airport telemetry database`);
          }
          return;
        }

        // 4. Found Tag -> Show Skeleton Loader (400ms delay) & Transition
        if (loadingSkeleton) {
          loadingSkeleton.setAttribute('role', 'status');
          loadingSkeleton.setAttribute('aria-live', 'polite');
          loadingSkeleton.style.display = 'block';
        }
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `
            <span class="btn-spinner"></span>
            Locating...
          `;
        }

        // Save to Recent Searches
        addRecentSearch(rawTag);

        if (window.AeroSimData) {
          window.AeroSimData.syncToActiveBagData(foundBag);
        }

        setTimeout(() => {
          window.location.href = `journey.html?tag=${encodeURIComponent(rawTag)}`;
        }, 450);
      });
    });

    // Helper: Add and Render Recent Searches
    function getRecentSearches() {
      const saved = window.safeGetJSON ? window.safeGetJSON('aerosim_recent_searches', []) : null;
      return Array.isArray(saved) ? saved : [];
    }

    function addRecentSearch(tag) {
      if (!tag) return;
      let list = getRecentSearches();
      list = [tag, ...list.filter(t => t !== tag)].slice(0, 6);
      if (window.safeSetStorage) {
        window.safeSetStorage('aerosim_recent_searches', list);
      }
      renderRecentSearches();
    }

    function renderRecentSearches() {
      const container = document.getElementById('recent-searches-section');
      const listEl = document.getElementById('recent-searches-list');
      if (!container || !listEl) return;
      const list = getRecentSearches();
      if (list.length === 0) {
        container.style.display = 'none';
        return;
      }
      container.style.display = 'block';
      listEl.innerHTML = list.map(tag => `
        <button type="button" class="recent-chip-btn" data-tag="${tag}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${tag}
        </button>
      `).join('');

      listEl.querySelectorAll('.recent-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tag = btn.dataset.tag;
          const input = document.getElementById('track-tag-input');
          if (input) {
            input.value = tag;
            const form = document.getElementById('track-search-form');
            if (form) form.dispatchEvent(new Event('submit'));
          }
        });
      });
    }

    const clearRecentBtn = document.getElementById('btn-clear-recent-searches');
    if (clearRecentBtn) {
      clearRecentBtn.addEventListener('click', () => {
        if (window.safeRemoveStorage) window.safeRemoveStorage('aerosim_recent_searches');
        renderRecentSearches();
        if (typeof window.showToast === 'function') {
          window.showToast('Search history cleared');
        }
      });
    }

    renderRecentSearches();

    // Helper: Autocomplete Suggestions Dropdown
    const trackInput = document.getElementById('track-tag-input');
    const autocompleteDropdown = document.getElementById('track-autocomplete-dropdown');
    if (trackInput && autocompleteDropdown) {
      trackInput.addEventListener('input', () => {
        const val = trackInput.value.trim().toUpperCase();
        if (val.length < 1) {
          autocompleteDropdown.style.display = 'none';
          return;
        }

        const allBags = (window.AeroSimData && window.AeroSimData.SAMPLE_BAGS) ? window.AeroSimData.SAMPLE_BAGS : [];
        const matches = allBags.filter(b => b.tagId.toUpperCase().includes(val) || (b.originCode + ' ' + b.destCode).includes(val)).slice(0, 5);

        if (matches.length === 0) {
          autocompleteDropdown.style.display = 'none';
          return;
        }

        autocompleteDropdown.innerHTML = matches.map(b => `
          <div class="autocomplete-item" data-tag="${b.tagId}" role="option">
            <div>
              <strong>${b.tagId}</strong>
              <span class="autocomplete-meta" style="margin-left: 8px;">${b.airline} (${b.flight})</span>
            </div>
            <span class="autocomplete-meta">${b.originCode} &rarr; ${b.destCode}</span>
          </div>
        `).join('');
        autocompleteDropdown.style.display = 'block';

        autocompleteDropdown.querySelectorAll('.autocomplete-item').forEach(item => {
          item.addEventListener('click', () => {
            trackInput.value = item.dataset.tag;
            autocompleteDropdown.style.display = 'none';
            const form = document.getElementById('track-search-form');
            if (form) form.dispatchEvent(new Event('submit'));
          });
        });
      });

      document.addEventListener('click', (e) => {
        if (!trackInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
          autocompleteDropdown.style.display = 'none';
        }
      });
    }

    // Helper: Compare Mode Tabs & Comparison Engine
    const tabSingle = document.getElementById('tab-single-track');
    const tabCompare = document.getElementById('tab-compare-track');
    const panelSingle = document.getElementById('single-track-panel');
    const panelCompare = document.getElementById('compare-track-panel');

    if (tabSingle && tabCompare && panelSingle && panelCompare) {
      tabSingle.addEventListener('click', () => {
        tabSingle.classList.add('active');
        tabSingle.setAttribute('aria-selected', 'true');
        tabCompare.classList.remove('active');
        tabCompare.setAttribute('aria-selected', 'false');
        panelSingle.style.display = 'block';
        panelCompare.style.display = 'none';
      });

      tabCompare.addEventListener('click', () => {
        tabCompare.classList.add('active');
        tabCompare.setAttribute('aria-selected', 'true');
        tabSingle.classList.remove('active');
        tabSingle.setAttribute('aria-selected', 'false');
        panelCompare.style.display = 'block';
        panelSingle.style.display = 'none';
      });
    }

    // Compare Preset Button
    const comparePresetBtn = document.getElementById('btn-compare-preset');
    if (comparePresetBtn) {
      comparePresetBtn.addEventListener('click', () => {
        const inp1 = document.getElementById('compare-tag-1');
        const inp2 = document.getElementById('compare-tag-2');
        if (inp1) inp1.value = 'LHR-123456';
        if (inp2) inp2.value = 'DXB-309481';
      });
    }

    // Compare Form Submit
    const compareForm = document.getElementById('compare-search-form');
    const compareResults = document.getElementById('compare-results-container');
    const compareErr = document.getElementById('compare-error-msg');

    if (compareForm && compareResults) {
      compareForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tag1 = (document.getElementById('compare-tag-1').value || '').trim().toUpperCase();
        const tag2 = (document.getElementById('compare-tag-2').value || '').trim().toUpperCase();

        if (compareErr) compareErr.style.display = 'none';

        const tagRegex = /^[A-Z]{3}-\d{6}$/;
        if (!tagRegex.test(tag1) || !tagRegex.test(tag2)) {
          if (compareErr) {
            compareErr.style.display = 'block';
            compareErr.textContent = 'Both baggage tags must match the standard format ^[A-Z]{3}-\\d{6}$ (e.g. LHR-123456).';
          }
          return;
        }

        const bag1 = window.AeroSimData ? window.AeroSimData.getBagByTag(tag1) : null;
        const bag2 = window.AeroSimData ? window.AeroSimData.getBagByTag(tag2) : null;

        if (!bag1 || !bag2) {
          if (compareErr) {
            compareErr.style.display = 'block';
            compareErr.textContent = `Could not locate telemetry for: ${!bag1 ? tag1 : ''} ${!bag2 ? tag2 : ''}`;
          }
          return;
        }

        const stagesList = window.AeroSimData.STAGES;
        const stage1Name = stagesList[bag1.currentStepIndex]?.title || 'Processing';
        const stage2Name = stagesList[bag2.currentStepIndex]?.title || 'Processing';
        const pct1 = Math.round(((bag1.currentStepIndex + 1) / 6) * 100);
        const pct2 = Math.round(((bag2.currentStepIndex + 1) / 6) * 100);

        compareResults.innerHTML = `
          <div class="compare-grid">
            <div class="compare-col-card">
              <div class="compare-col-header">
                <div>
                  <strong style="font-size: 1.1rem; color: #1672ec;">${bag1.tagId}</strong>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">${bag1.airline} • ${bag1.flight}</div>
                </div>
                <span class="badge-pill" style="color: #10b981; border-color: #10b981;">Stage ${bag1.currentStepIndex + 1}/6</span>
              </div>
              <p style="margin: 6px 0; font-size: 0.85rem;"><strong>Route:</strong> ${bag1.originCode} &rarr; ${bag1.destCode}</p>
              <p style="margin: 6px 0; font-size: 0.85rem;"><strong>Current Stage:</strong> ${stage1Name}</p>
              <p style="margin: 6px 0; font-size: 0.85rem;"><strong>Weight / Color:</strong> ${bag1.weightKg || 23} kg (${bag1.bagColor || 'Navy Blue'})</p>
              <div style="margin-top: 10px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                  <span>Sortation Progress</span>
                  <strong>${pct1}%</strong>
                </div>
                <div style="height: 8px; border-radius: 4px; background: #e2e8f0; overflow: hidden;">
                  <div style="width: ${pct1}%; height: 100%; background: #1672ec;"></div>
                </div>
              </div>
              <div style="margin-top: 14px;">
                <a href="journey.html?tag=${encodeURIComponent(bag1.tagId)}" class="btn-primary-action" style="display: block; text-align: center; font-size: 0.85rem; padding: 8px;">View Full Journey</a>
              </div>
            </div>

            <div class="compare-col-card">
              <div class="compare-col-header">
                <div>
                  <strong style="font-size: 1.1rem; color: #7c3aed;">${bag2.tagId}</strong>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">${bag2.airline} • ${bag2.flight}</div>
                </div>
                <span class="badge-pill" style="color: #10b981; border-color: #10b981;">Stage ${bag2.currentStepIndex + 1}/6</span>
              </div>
              <p style="margin: 6px 0; font-size: 0.85rem;"><strong>Route:</strong> ${bag2.originCode} &rarr; ${bag2.destCode}</p>
              <p style="margin: 6px 0; font-size: 0.85rem;"><strong>Current Stage:</strong> ${stage2Name}</p>
              <p style="margin: 6px 0; font-size: 0.85rem;"><strong>Weight / Color:</strong> ${bag2.weightKg || 21} kg (${bag2.bagColor || 'Silver Grey'})</p>
              <div style="margin-top: 10px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                  <span>Sortation Progress</span>
                  <strong>${pct2}%</strong>
                </div>
                <div style="height: 8px; border-radius: 4px; background: #e2e8f0; overflow: hidden;">
                  <div style="width: ${pct2}%; height: 100%; background: #7c3aed;"></div>
                </div>
              </div>
              <div style="margin-top: 14px;">
                <a href="journey.html?tag=${encodeURIComponent(bag2.tagId)}" class="btn-primary-action" style="display: block; text-align: center; font-size: 0.85rem; padding: 8px; background: #7c3aed;">View Full Journey</a>
              </div>
            </div>
          </div>
        `;
        compareResults.style.display = 'block';
        if (typeof window.showToast === 'function') {
          window.showToast(`Compared ${tag1} vs ${tag2}`);
        }
      });
    }

    // Sample Tag Pills click handler
    document.querySelectorAll('.sample-tag-btn, .btn-suggestion-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag || btn.textContent.split(' ')[0].trim();
        const input = document.querySelector('.search-input-box');
        if (input) {
          input.value = tag;
          input.focus();
          // Hide previous error states
          const err = document.getElementById('track-input-error');
          if (err) err.style.display = 'none';
          const notFound = document.getElementById('track-notfound-card');
          if (notFound) notFound.style.display = 'none';
        }
      });
    });
  }

  // -------------------------------------------------------------
  // 10. Registration Engine (Phone validation, OTP timer/attempts, Strength meter)
  // -------------------------------------------------------------
  function initRegisterForm() {
    const regForm = document.getElementById('form-register');
    if (!regForm) return;

    const phoneInput = document.getElementById('reg-phone');
    const otpInput = document.getElementById('reg-otp');
    const sendOtpBtn = document.getElementById('btn-send-otp');
    const userInput = document.getElementById('reg-userid');
    const passInput = document.getElementById('reg-password');
    const errorEl = document.getElementById('register-error-msg');
    const submitBtn = document.getElementById('btn-register-submit');
    const fillDemoRegBtn = document.getElementById('btn-fill-demo-reg');

    // Auto Fill Demo Registration Details
    if (fillDemoRegBtn) {
      fillDemoRegBtn.addEventListener('click', () => {
        if (phoneInput) phoneInput.value = '+1 555-019-2834';
        if (userInput) userInput.value = 'DemoUser_' + Math.floor(100 + Math.random() * 899);
        if (passInput) {
          passInput.value = 'SkyTrack@2026';
          passInput.dispatchEvent(new Event('input'));
        }
        // Auto trigger send OTP for complete convenience
        if (sendOtpBtn && !sendOtpBtn.disabled) {
          sendOtpBtn.click();
        }
        window.showToast('Demo registration details loaded! Check the toast for your OTP.');
      });
    }

    // Live Password Strength Meter
    if (passInput) {
      passInput.addEventListener('input', () => {
        const val = passInput.value;
        const b1 = document.getElementById('str-bar-1');
        const b2 = document.getElementById('str-bar-2');
        const b3 = document.getElementById('str-bar-3');
        const text = document.getElementById('str-text');

        let score = 0;
        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
        if (/\d/.test(val) && /[^A-Za-z0-9]/.test(val)) score++;

        [b1, b2, b3].forEach(b => { if (b) b.className = 'strength-bar'; });

        if (val.length === 0) {
          if (text) text.textContent = 'Password strength: Empty';
        } else if (score <= 1) {
          if (b1) b1.classList.add('weak');
          if (text) text.textContent = 'Password strength: Weak (min 8 chars, mixed case & numbers)';
        } else if (score === 2) {
          if (b1) b1.classList.add('medium');
          if (b2) b2.classList.add('medium');
          if (text) text.textContent = 'Password strength: Medium';
        } else {
          if (b1) b1.classList.add('strong');
          if (b2) b2.classList.add('strong');
          if (b3) b3.classList.add('strong');
          if (text) text.textContent = 'Password strength: Strong';
        }
      });
    }

    // OTP Generation & Countdown
    if (sendOtpBtn && phoneInput) {
      sendOtpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const phone = phoneInput.value.trim().replace(/[\s-]/g, '');

        // Phone digits validation (10 to 15 digits)
        const digitsOnly = phone.replace(/\D/g, '');
        if (digitsOnly.length < 10 || digitsOnly.length > 15) {
          showAuthError(errorEl, 'Please enter a valid phone number (10 to 15 digits).');
          phoneInput.focus();
          return;
        }

        // Generate mock 4-digit OTP
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        const otpRecord = {
          code: otpCode,
          phone: phone,
          expiresAt: Date.now() + 60 * 1000, // 60s expiry
          attemptsLeft: 3
        };
        sessionStorage.setItem('aerosim_reg_otp', JSON.stringify(otpRecord));

        // Display ONLY in toast
        window.showToast(`Verification OTP: ${otpCode} (Expires in 60s)`, 6000);
        showAuthError(errorEl, '');

        // 60-second timer on button
        let countdown = 60;
        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = `${countdown}s`;

        const interval = setInterval(() => {
          countdown--;
          if (countdown <= 0) {
            clearInterval(interval);
            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = 'Resend OTP';
          } else {
            sendOtpBtn.textContent = `${countdown}s`;
          }
        }, 1000);
      });
    }

    // Registration Submission
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showAuthError(errorEl, '');

      const phone = phoneInput.value.trim().replace(/[\s-]/g, '');
      const digitsOnly = phone.replace(/\D/g, '');
      const enteredOtp = otpInput.value.trim();
      const userId = userInput.value.trim();
      const password = passInput.value;

      // 1. Phone validation
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        showAuthError(errorEl, 'Phone number must contain 10–15 digits.');
        return;
      }

      // 2. OTP Validation
      const rawOtpData = sessionStorage.getItem('aerosim_reg_otp');
      if (!rawOtpData) {
        showAuthError(errorEl, 'Please click "Send OTP" to receive a verification code first.');
        return;
      }
      const otpData = JSON.parse(rawOtpData);

      if (Date.now() > otpData.expiresAt) {
        showAuthError(errorEl, 'The OTP has expired. Please click "Resend OTP" to generate a new code.');
        return;
      }

      if (enteredOtp !== otpData.code) {
        otpData.attemptsLeft--;
        sessionStorage.setItem('aerosim_reg_otp', JSON.stringify(otpData));
        if (otpData.attemptsLeft <= 0) {
          sessionStorage.removeItem('aerosim_reg_otp');
          showAuthError(errorEl, 'Maximum OTP attempts exceeded. Please request a new OTP.');
        } else {
          showAuthError(errorEl, `Incorrect OTP. ${otpData.attemptsLeft} attempt(s) remaining.`);
        }
        return;
      }

      // 3. User ID Validation (min 4 chars, unique)
      if (userId.length < 4) {
        showAuthError(errorEl, 'User ID must be at least 4 characters long.');
        return;
      }
      const existingUsers = getUsers();
      if (existingUsers[userId]) {
        showAuthError(errorEl, `User ID "${userId}" is already registered. Please choose another.`);
        return;
      }

      // 4. Password validation: min 8, uppercase, lowercase, digit
      if (password.length < 8) {
        showAuthError(errorEl, 'Password must be at least 8 characters long.');
        return;
      }
      if (!(/[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password))) {
        showAuthError(errorEl, 'Password must include at least one uppercase letter, one lowercase letter, and one number.');
        return;
      }

      // 5. Store user with SHA-256 hash
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-spinner"></span> Creating Account...';
      }

      const passHash = await hashPassword(password);
      existingUsers[userId] = {
        userId: userId,
        passwordHash: passHash,
        phone: phone,
        displayName: userId,
        email: `${userId.toLowerCase()}@example.com`,
        createdAt: new Date().toISOString()
      };
      saveUsers(existingUsers);

      // Clean up session OTP
      sessionStorage.removeItem('aerosim_reg_otp');

      // Auto login & redirect
      setCurrentUser(userId, true);
      window.showToast(`Account created successfully! Welcome, ${userId}.`);

      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const nextUrl = urlParams.get('next') || 'track.html';
        window.location.href = nextUrl;
      }, 700);
    });
  }

  // -------------------------------------------------------------
  // 11. Login Engine (Password verify, 3-attempt lock for 30s, Remember Me)
  // -------------------------------------------------------------
  function initLoginForm() {
    const loginForm = document.getElementById('form-login');
    if (!loginForm) return;

    const userInput = document.getElementById('login-userid');
    const passInput = document.getElementById('login-password');
    const errorEl = document.getElementById('login-error-msg');
    const lockoutBanner = document.getElementById('login-lockout-banner');
    const lockoutText = document.getElementById('login-lockout-text');
    const rememberMeCheck = document.getElementById('login-remember-me');
    const submitBtn = document.getElementById('btn-login-submit');
    const fillDemoLoginBtn = document.getElementById('btn-fill-demo-login');

    // Auto Fill Demo Login Credentials
    if (fillDemoLoginBtn) {
      fillDemoLoginBtn.addEventListener('click', () => {
        if (userInput) userInput.value = 'User2244';
        if (passInput) passInput.value = 'password123';
        showAuthError(errorEl, '');
        window.showToast('Demo credentials filled: User2244 / password123');
      });
    }

    // Check if currently locked out
    function checkLockout() {
      const lockUntil = parseInt(localStorage.getItem('aerosim_lockout_until') || '0', 10);
      const remainingSec = Math.ceil((lockUntil - Date.now()) / 1000);
      if (remainingSec > 0) {
        applyLockout(remainingSec);
        return true;
      } else {
        localStorage.removeItem('aerosim_lockout_until');
        if (lockoutBanner) lockoutBanner.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;
        if (userInput) userInput.disabled = false;
        if (passInput) passInput.disabled = false;
        return false;
      }
    }

    function applyLockout(seconds) {
      if (lockoutBanner) lockoutBanner.style.display = 'flex';
      if (submitBtn) submitBtn.disabled = true;
      if (userInput) userInput.disabled = true;
      if (passInput) passInput.disabled = true;

      let remaining = seconds;
      if (lockoutText) lockoutText.textContent = `Too many failed attempts. Login locked for ${remaining}s.`;

      const timer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          clearInterval(timer);
          localStorage.removeItem('aerosim_lockout_until');
          localStorage.removeItem('aerosim_failed_attempts');
          if (lockoutBanner) lockoutBanner.style.display = 'none';
          if (submitBtn) submitBtn.disabled = false;
          if (userInput) userInput.disabled = false;
          if (passInput) passInput.disabled = false;
        } else {
          if (lockoutText) lockoutText.textContent = `Too many failed attempts. Login locked for ${remaining}s.`;
        }
      }, 1000);
    }

    checkLockout();

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showAuthError(errorEl, '');

      if (checkLockout()) return;

      const userId = userInput.value.trim();
      const password = passInput.value;

      if (!userId || !password) {
        showAuthError(errorEl, 'Please enter your User ID and Password.');
        return;
      }

      const users = getUsers();
      const user = users[userId];

      if (!user) {
        handleFailedAttempt('User ID not recognized. Please check your credentials or Register.');
        return;
      }

      // Check Password Hash
      const enteredHash = await hashPassword(password);
      if (enteredHash !== user.passwordHash) {
        handleFailedAttempt('Incorrect password. Please try again.');
        return;
      }

      // Successful Login
      localStorage.removeItem('aerosim_failed_attempts');
      const remember = rememberMeCheck ? rememberMeCheck.checked : true;
      setCurrentUser(user.userId, remember);

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-spinner"></span> Authenticating...';
      }

      window.showToast(`Welcome back, ${user.displayName || user.userId}!`);

      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const nextUrl = urlParams.get('next') || 'journey.html';
        window.location.href = nextUrl;
      }, 600);
    });

    function handleFailedAttempt(message) {
      let attempts = parseInt(localStorage.getItem('aerosim_failed_attempts') || '0', 10) + 1;
      localStorage.setItem('aerosim_failed_attempts', attempts);

      if (attempts >= 3) {
        const lockDuration = 30 * 1000; // 30 seconds lockout
        localStorage.setItem('aerosim_lockout_until', Date.now() + lockDuration);
        applyLockout(30);
      } else {
        const remaining = 3 - attempts;
        showAuthError(errorEl, `${message} (${remaining} attempt${remaining === 1 ? '' : 's'} remaining before 30s lockout)`);
      }
    }
  }

  function showAuthError(el, text) {
    if (!el) return;
    if (text) {
      el.textContent = text;
      el.style.display = 'block';
    } else {
      el.textContent = '';
      el.style.display = 'none';
    }
  }

  // -------------------------------------------------------------
  // 12. Baggage Journey Controller (Telemetry, Route Map, Live Simulation, Print Receipt)
  // -------------------------------------------------------------
  function initTimeline() {
    const timelineEl = document.getElementById('baggage-timeline');
    if (!timelineEl) return;

    // Retrieve active bag from URL param or DB
    const urlParams = new URLSearchParams(window.location.search);
    const tagParam = urlParams.get('tag');

    let currentBag = null;
    if (window.AeroSimData) {
      if (tagParam) {
        currentBag = window.AeroSimData.getBagByTag(tagParam);
      }
      if (!currentBag) {
        currentBag = window.AeroSimData.getActiveBagData();
      }
    }

    // Merge with master seed database to guarantee all metadata exists
    if (currentBag && currentBag.tagId && window.AeroSimData) {
      const full = window.AeroSimData.getBagByTag(currentBag.tagId);
      if (full) {
        currentBag = { ...full, ...currentBag };
      }
    }

    if (!currentBag) {
      currentBag = {
        tagId: 'LHR-123456',
        airline: 'Lufthansa',
        flight: 'LH247',
        originCode: 'LHR',
        originCity: 'London Heathrow',
        destCode: 'FRA',
        destCity: 'Frankfurt',
        passenger: 'R*** S.',
        weightKg: 23.5,
        bagColor: 'Navy Blue',
        gate: 'B22',
        carousel: 'Belt 4',
        currentStepIndex: 0,
        timestamps: ['Today, 06:45 GMT - Check-in Counter 14']
      };
    }

    // Defensive parsing for originCode/City and destCode/City
    if (!currentBag.originCode && currentBag.origin) {
      const parts = currentBag.origin.split('-');
      currentBag.originCode = parts[0].trim();
      currentBag.originCity = parts[1] ? parts[1].trim() : parts[0].trim();
    }
    if (!currentBag.destCode && currentBag.destination) {
      const parts = currentBag.destination.split('-');
      currentBag.destCode = parts[0].trim();
      currentBag.destCity = parts[1] ? parts[1].trim() : parts[0].trim();
    }
    currentBag.originCode = currentBag.originCode || 'LHR';
    currentBag.originCity = currentBag.originCity || 'London';
    currentBag.destCode = currentBag.destCode || 'FRA';
    currentBag.destCity = currentBag.destCity || 'Frankfurt';
    currentBag.flight = currentBag.flight || 'LH247';
    currentBag.airline = currentBag.airline || 'Lufthansa';
    currentBag.passenger = currentBag.passenger || 'Passenger';
    currentBag.weightKg = currentBag.weightKg || 23.0;
    currentBag.bagColor = currentBag.bagColor || 'Navy Blue';
    currentBag.gate = currentBag.gate || 'B22';
    currentBag.carousel = currentBag.carousel || 'Belt 4';

    function updateDetailsDisplay() {
      // Populate Left Column Bag Details
      document.querySelectorAll('.display-tag-id').forEach(el => el.textContent = currentBag.tagId);
      
      const airlineFlightEl = document.getElementById('journey-airline-flight');
      if (airlineFlightEl) {
        airlineFlightEl.textContent = `${currentBag.airline} • ${currentBag.flight}`;
      }

      const routeTextEl = document.getElementById('journey-route-text');
      if (routeTextEl) {
        routeTextEl.innerHTML = `${currentBag.originCode} (${currentBag.originCity}) &rarr; ${currentBag.destCode} (${currentBag.destCity})`;
      }

      const passWeightEl = document.getElementById('journey-passenger-weight');
      if (passWeightEl) {
        passWeightEl.textContent = `${currentBag.passenger} • ${currentBag.weightKg} kg (${currentBag.bagColor || 'Navy Blue'})`;
      }

      const gateCarouselEl = document.getElementById('journey-gate-carousel');
      if (gateCarouselEl) {
        gateCarouselEl.innerHTML = `Gate ${currentBag.gate || 'B22'} &rarr; Carousel ${currentBag.carousel || 'Belt 4'}`;
      }

      const userDisplayEls = document.querySelectorAll('.display-user-name');
      userDisplayEls.forEach(el => el.textContent = getCurrentUser() || 'User2244');
    }

    updateDetailsDisplay();

    // Render Status Badge
    function updateStatusBadge() {
      const statusBadge = document.getElementById('journey-bag-status-badge');
      if (!statusBadge) return;

      if (currentBag.currentStepIndex >= 5) {
        statusBadge.className = 'status-badge-completed';
        statusBadge.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Completed
        `;
      } else {
        statusBadge.className = 'status-badge-inprogress';
        statusBadge.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          In Progress
        `;
      }
    }

    // Render SVG Route Map & Plane position
    function updateRouteMap() {
      try {
        const origCodeEl = document.getElementById('svg-origin-code');
        const origCityEl = document.getElementById('svg-origin-city');
        const destCodeEl = document.getElementById('svg-dest-code');
        const destCityEl = document.getElementById('svg-dest-city');
        const stageLabelEl = document.getElementById('route-map-stage-label');
        const planeMarker = document.getElementById('airplane-marker');
        const activeTrajectory = document.getElementById('flight-trajectory-active');

        if (origCodeEl) origCodeEl.textContent = currentBag.originCode;
        if (origCityEl) origCityEl.textContent = (currentBag.originCity || 'London').split(' ')[0];
        if (destCodeEl) destCodeEl.textContent = currentBag.destCode;
        if (destCityEl) destCityEl.textContent = (currentBag.destCity || 'Frankfurt').split(' ')[0];

        const stagesList = (window.AeroSimData && window.AeroSimData.STAGES) ? window.AeroSimData.STAGES : [
          { title: 'Check-in Complete' },
          { title: 'Baggage Handling' },
          { title: 'Aircraft Loading' },
          { title: 'Flight in Transit' },
          { title: 'Aircraft Unloading' },
          { title: 'Arrival Claim' }
        ];

        const stageObj = stagesList[currentBag.currentStepIndex] || stagesList[0];
        if (stageLabelEl) {
          stageLabelEl.textContent = `Stage ${currentBag.currentStepIndex + 1}: ${stageObj.title}`;
        }

        // Bezier curve telemetry coordinates:
        // Start: P0(90, 120), Control: P1(340, 20), End: P2(590, 120)
        const t = (currentBag.currentStepIndex || 0) / 5;
        const x = Math.round((1 - t) * (1 - t) * 90 + 2 * (1 - t) * t * 340 + t * t * 590);
        const y = Math.round((1 - t) * (1 - t) * 120 + 2 * (1 - t) * t * 20 + t * t * 120);

        // Compute tangent angle for plane rotation
        const dx = 2 * (1 - t) * (340 - 90) + 2 * t * (590 - 340);
        const dy = 2 * (1 - t) * (20 - 120) + 2 * t * (120 - 20);
        const angleDeg = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);

        if (planeMarker) {
          planeMarker.setAttribute('transform', `translate(${x}, ${y}) rotate(${angleDeg})`);
        }

        // Update Active Arc dash offset for visual progression
        if (activeTrajectory) {
          const totalPathLength = 530;
          const visibleLength = totalPathLength * t;
          activeTrajectory.style.strokeDasharray = `${visibleLength} ${totalPathLength}`;
        }

        // Metrics display
        const metricAltitude = document.getElementById('metric-altitude');
        if (metricAltitude) {
          if (currentBag.currentStepIndex === 3) {
            metricAltitude.textContent = 'Cruising FL370 (37,000 ft)';
          } else if (currentBag.currentStepIndex === 2 || currentBag.currentStepIndex === 4) {
            metricAltitude.textContent = 'Apron Level / Ramp Bay';
          } else if (currentBag.currentStepIndex >= 5) {
            metricAltitude.textContent = 'Arrival Carousel Active';
          } else {
            metricAltitude.textContent = 'Terminal Sorter Level 1';
          }
        }
      } catch (e) {
        console.warn('Error updating route map:', e);
      }
    }

    // Render Timeline Steps
    function renderTimeline() {
      timelineEl.innerHTML = '';
      updateDetailsDisplay();
      updateStatusBadge();
      updateRouteMap();

      const stages = (window.AeroSimData && window.AeroSimData.STAGES) ? window.AeroSimData.STAGES : [
        { num: 1, title: 'CHECK-IN COMPLETE', desc: 'Your bag has been checked in.', icon: 'file-check' },
        { num: 2, title: 'BAGGAGE HANDLING', desc: 'Baggage passes security screening.', icon: 'conveyor' },
        { num: 3, title: 'AIRCRAFT LOADING', desc: 'Secured inside cargo hold.', icon: 'plane-load' },
        { num: 4, title: 'FLIGHT IN TRANSIT', desc: 'In flight to destination.', icon: 'plane-fly' },
        { num: 5, title: 'AIRCRAFT UNLOADING', desc: 'Ground crew transferring to apron.', icon: 'plane-unload' },
        { num: 6, title: 'ARRIVAL CLAIM STAGE', desc: 'Baggage ready on carousel.', icon: 'bag-claim' }
      ];

      stages.forEach((stage, idx) => {
        const stepRow = document.createElement('div');
        let stepClass = 'timeline-step';
        let nodeContent = '';
        let badgeClass = 'status-pill';
        let badgeLabel = '';
        let iconColorClass = '';

        const ts = (currentBag.timestamps && currentBag.timestamps[idx]) ? currentBag.timestamps[idx] : null;

        if (idx < currentBag.currentStepIndex) {
          stepClass += ' completed';
          badgeClass += ' completed';
          badgeLabel = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Completed
          `;
          nodeContent = `
            <div class="step-node completed">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          `;
        } else if (idx === currentBag.currentStepIndex) {
          stepClass += ' in-progress';
          badgeClass += ' in-progress';
          iconColorClass = ' in-progress';
          badgeLabel = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            In Progress
          `;
          nodeContent = `
            <div class="step-node in-progress">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          `;
        } else {
          stepClass += ' pending';
          badgeClass += ' pending';
          iconColorClass = ' pending';
          badgeLabel = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>
            Pending
          `;
          nodeContent = `
            <div class="step-node pending">
              <span class="step-node-dot"></span>
            </div>
          `;
        }

        // Stage Icons
        let stageSvg = '';
        if (idx === 0) {
          stageSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m9 15 2 2 4-4"></path></svg>`;
        } else if (idx === 1) {
          stageSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"></rect><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle><path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"></path></svg>`;
        } else if (idx === 2) {
          stageSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"></path></svg>`;
        } else if (idx === 3) {
          stageSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>`;
        } else if (idx === 4) {
          stageSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 16 10-4 10 4-10 4z"></path><path d="M12 12V3"></path><path d="m8 7 4-4 4 4"></path></svg>`;
        } else {
          stageSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="15" rx="3"></rect><path d="M9 6V4a3 3 0 0 1 6 0v2"></path><circle cx="9" cy="18" r="1"></circle><circle cx="15" cy="18" r="1"></circle></svg>`;
        }

        // Stage ETA and Duration estimate
        const stageEtas = ['15 min', '25 min', '30 min', '1 hr 45 min', '20 min', '10 min'];
        let etaText = '';
        if (idx === currentBag.currentStepIndex) {
          etaText = `
            <div class="step-eta-badge" style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #1672ec; font-weight: 700; margin-top: 4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Est. Remaining: ${stageEtas[idx]}
            </div>
          `;
        } else if (idx > currentBag.currentStepIndex) {
          etaText = `
            <div class="step-eta-badge" style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
              Est. Duration: ~${stageEtas[idx]}
            </div>
          `;
        }

        stepRow.className = stepClass;
        stepRow.innerHTML = `
          ${nodeContent}
          <div class="step-icon-badge${iconColorClass}">
            ${stageSvg}
          </div>
          <div class="step-info">
            <div class="step-title">${idx + 1}. ${stage.title}</div>
            <div class="step-desc">${stage.desc}</div>
            ${etaText}
            ${ts ? `<div class="step-timestamp-tag">✓ ${ts}</div>` : ''}
          </div>
          <span class="${badgeClass}">
            ${badgeLabel}
          </span>
        `;

        stepRow.title = `Click to inspect Stage ${idx + 1} operational details`;
        stepRow.addEventListener('click', () => {
          window.location.href = `stage.html?step=${idx + 1}&tag=${encodeURIComponent(currentBag.tagId)}`;
        });

        timelineEl.appendChild(stepRow);
      });
    }

    renderTimeline();

    // -----------------------------------------------------------
    // Live Simulation Engine Toggle (~8s per stage)
    // -----------------------------------------------------------
    const liveSimToggle = document.getElementById('live-sim-toggle');
    const toggleStatusText = document.getElementById('toggle-status-text');
    const progressBarWrapper = document.getElementById('sim-progress-bar-wrapper');
    const progressFill = document.getElementById('sim-progress-fill');
    const countdownLabel = document.getElementById('sim-countdown-label');

    let simInterval = null;
    let simCountdown = 8;

    if (liveSimToggle) {
      liveSimToggle.addEventListener('change', () => {
        if (liveSimToggle.checked) {
          if (toggleStatusText) toggleStatusText.textContent = 'ACTIVE';
          if (progressBarWrapper) progressBarWrapper.style.display = 'block';
          startLiveSim();
          window.showToast('Live Simulation Mode ON: Bag advances every 8 seconds');
        } else {
          stopLiveSim();
          if (toggleStatusText) toggleStatusText.textContent = 'OFF';
          if (progressBarWrapper) progressBarWrapper.style.display = 'none';
          window.showToast('Live Simulation Mode Paused');
        }
      });
    }

    function startLiveSim() {
      stopLiveSim();
      simCountdown = 8;
      updateSimProgressBar();

      simInterval = setInterval(() => {
        simCountdown--;
        updateSimProgressBar();

        if (simCountdown <= 0) {
          simCountdown = 8;
          advanceStep(true);
        }
      }, 1000);
    }

    function stopLiveSim() {
      if (simInterval) clearInterval(simInterval);
      simInterval = null;
    }

    function updateSimProgressBar() {
      if (countdownLabel) countdownLabel.textContent = `${simCountdown}s`;
      if (progressFill) {
        const percent = ((8 - simCountdown) / 8) * 100;
        progressFill.style.width = `${percent}%`;
      }
    }

    function advanceStep(isAuto = false) {
      if (currentBag.currentStepIndex < 5) {
        if (window.AeroSimData) {
          const updated = window.AeroSimData.advanceBagStage(currentBag.tagId);
          if (updated) currentBag = { ...currentBag, ...updated };
        } else {
          currentBag.currentStepIndex++;
        }

        renderTimeline();

        const stageTitle = (window.AeroSimData && window.AeroSimData.STAGES[currentBag.currentStepIndex])
          ? window.AeroSimData.STAGES[currentBag.currentStepIndex].title
          : `Stage ${currentBag.currentStepIndex + 1}`;

        if (typeof window.pushAeroSimNotification === 'function') {
          window.pushAeroSimNotification(
            `Stage ${currentBag.currentStepIndex + 1} Confirmed`,
            `Bag ${currentBag.tagId} (${currentBag.flight}) has advanced to ${stageTitle}.`
          );
        }

        window.showToast(`${isAuto ? 'Auto-Simulated' : 'Simulated'}: Stage ${currentBag.currentStepIndex + 1} (${stageTitle}) active!`);

        if (currentBag.currentStepIndex >= 5) {
          stopLiveSim();
          if (liveSimToggle) liveSimToggle.checked = false;
          if (toggleStatusText) toggleStatusText.textContent = 'OFF';
          if (progressBarWrapper) progressBarWrapper.style.display = 'none';
          window.showToast(`Baggage ${currentBag.tagId} has reached the arrival carousel!`);
        }
      } else {
        stopLiveSim();
        if (liveSimToggle) liveSimToggle.checked = false;
        if (toggleStatusText) toggleStatusText.textContent = 'OFF';
        if (progressBarWrapper) progressBarWrapper.style.display = 'none';
        window.showToast('All 6 baggage handling stages are completed!');
      }
    }

    // Manual Simulate Next Stage & Restart Buttons
    const advanceBtn = document.getElementById('btn-advance-step');
    const resetBtn = document.getElementById('btn-reset-step');

    if (advanceBtn) {
      advanceBtn.addEventListener('click', () => advanceStep(false));
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        stopLiveSim();
        if (liveSimToggle) liveSimToggle.checked = false;
        if (toggleStatusText) toggleStatusText.textContent = 'OFF';
        if (progressBarWrapper) progressBarWrapper.style.display = 'none';

        if (window.AeroSimData) {
          const updated = window.AeroSimData.resetBagStage(currentBag.tagId);
          if (updated) currentBag = { ...currentBag, ...updated };
        } else {
          currentBag.currentStepIndex = 0;
        }

        renderTimeline();
        window.showToast(`Restarted baggage ${currentBag.tagId} from Origin (Stage 1: Check-in)`);
      });
    }

    // Copy Tracking Link
    const copyLinkBtn = document.getElementById('btn-copy-tracking-link');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        const fullUrl = `${window.location.origin}${window.location.pathname}?tag=${encodeURIComponent(currentBag.tagId)}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(fullUrl).then(() => {
            window.showToast(`Tracking link for ${currentBag.tagId} copied!`);
          }).catch(() => {
            window.showToast(`Tracking URL: ${fullUrl}`);
          });
        } else {
          window.showToast(`Tracking URL: ${fullUrl}`);
        }
      });
    }

    // Download Summary (.txt file)
    const downloadSummaryBtn = document.getElementById('btn-download-summary');
    if (downloadSummaryBtn) {
      downloadSummaryBtn.addEventListener('click', () => {
        const textSummary = [
          '========================================',
          'AEROSIM AVIATION - BAGGAGE TELEMETRY SUMMARY',
          '========================================',
          `Tag ID:        ${currentBag.tagId}`,
          `Airline:       ${currentBag.airline} • Flight: ${currentBag.flight}`,
          `Route:         ${currentBag.originCode} (${currentBag.originCity}) -> ${currentBag.destCode} (${currentBag.destCity})`,
          `Current Stage: Stage ${currentBag.currentStepIndex + 1} of 6`,
          `Status:        ${currentBag.currentStepIndex >= 5 ? 'Completed (Ready for Carousel Claim)' : 'In Transit / Handling Active'}`,
          `Passenger:     ${currentBag.passenger}`,
          `Weight/Color:  ${currentBag.weightKg} kg (${currentBag.bagColor || 'Navy Blue'})`,
          `Gate & Belt:   Gate ${currentBag.gate || 'B22'} -> Carousel ${currentBag.carousel || 'Belt 4'}`,
          `Generated At:  ${new Date().toLocaleString()}`,
          `Tracking URL:  ${window.location.origin}${window.location.pathname}?tag=${currentBag.tagId}`,
          '========================================',
          'Academic Simulation Project - AeroSim Aviation',
          '========================================'
        ].join('\n');

        const blob = new Blob([textSummary], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AeroSim_Telemetry_${currentBag.tagId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (typeof window.showToast === 'function') {
          window.showToast(`Telemetry report downloaded for ${currentBag.tagId}`);
        }
      });
    }

    // Print Receipt Modal
    const printReceiptBtn = document.getElementById('btn-print-receipt');
    const printModal = document.getElementById('print-receipt-modal');
    const closeReceiptBtn = document.getElementById('btn-close-receipt');

    if (printReceiptBtn && printModal) {
      printReceiptBtn.addEventListener('click', () => {
        // Populate Receipt Info
        const recPassenger = document.getElementById('receipt-passenger');
        const recFlight = document.getElementById('receipt-flight');
        const recRoute = document.getElementById('receipt-route');
        const recWeight = document.getElementById('receipt-weight');
        const recColor = document.getElementById('receipt-color');
        const recStage = document.getElementById('receipt-stage');

        if (recPassenger) recPassenger.textContent = currentBag.passenger;
        if (recFlight) recFlight.textContent = `${currentBag.airline} ${currentBag.flight}`;
        if (recRoute) recRoute.innerHTML = `${currentBag.originCode} &rarr; ${currentBag.destCode}`;
        if (recWeight) recWeight.textContent = `${currentBag.weightKg} kg`;
        if (recColor) recColor.textContent = currentBag.bagColor || 'Navy Blue Hardshell';
        if (recStage) {
          const stageName = (window.AeroSimData && window.AeroSimData.STAGES[currentBag.currentStepIndex])
            ? window.AeroSimData.STAGES[currentBag.currentStepIndex].title
            : `Stage ${currentBag.currentStepIndex + 1}`;
          recStage.textContent = `${currentBag.currentStepIndex + 1}. ${stageName}`;
        }

        printModal.style.display = 'flex';
        printModal.setAttribute('role', 'dialog');
        printModal.setAttribute('aria-modal', 'true');
        printModal.setAttribute('aria-label', 'Print Baggage Receipt');
      });
    }

    if (closeReceiptBtn && printModal) {
      closeReceiptBtn.addEventListener('click', () => {
        printModal.style.display = 'none';
      });

      // Escape key to close print modal
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && printModal.style.display === 'flex') {
          printModal.style.display = 'none';
        }
      });

      // Outside click to close
      printModal.addEventListener('click', (e) => {
        if (e.target === printModal) {
          printModal.style.display = 'none';
        }
      });
    }
  }

  // -------------------------------------------------------------
  // 13. Global DOM Ready Initialization
  // -------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', async () => {
    // 1. Seed demo user in storage
    await seedDefaultUsers();

    // 2. Auth Guard on Protected Pages
    const currentPath = window.location.pathname.split('/').pop().toLowerCase();
    const protectedPages = ['journey.html', 'stage.html', 'my-bags.html', 'profile.html', 'report-issue.html'];
    if (protectedPages.includes(currentPath)) {
      if (!window.requireLogin(currentPath + (window.location.search || ''))) {
        return; // Redirecting
      }
    }

    // 3. Initialize Shared Components
    initPasswordToggle();
    initUserDropdown();
    initSearchForms();
    initRegisterForm();
    initLoginForm();
    initTimeline();
    initCookieConsent();
    initScrollToTop();
    initScrollReveal();
  });
})();
