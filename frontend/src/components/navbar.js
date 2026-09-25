/**
 * SafeSphere Navbar Component
 * Compact, sticky, accessible navigation with custom shield emblem,
 * language selector, theme toggle, mobile drawer with backdrop,
 * and mobile bottom navigation dock for native touch experience.
 */

import { storage } from "../utils/storage.js";
import { toggleTheme, getTheme } from "../utils/theme.js";
import { TRANSLATIONS } from "../data.js";
import { auth } from "../utils/auth.js";

export function renderNavbar(container, onLanguageChange) {
  const currentLang = storage.get("language", "en");
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const currentTheme = getTheme();
  const currentUser = auth.getUser();
  const isAuthenticated = auth.isAuthenticated();

  const navWrapper = document.createElement("div");
  navWrapper.className = "nav-wrapper-root";

  navWrapper.innerHTML = `
    <nav class="site-navbar" role="navigation" aria-label="Main navigation">
      <div class="nav-container">
        <a href="#/home" class="nav-brand" aria-label="SafeSphere Home">
          <div class="brand-emblem">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M16 3L5 7.5V15C5 22.2 9.7 28.1 16 30C22.3 28.1 27 22.2 27 15V7.5L16 3Z" fill="url(#shield-grad)" stroke="#2563EB" stroke-width="1.5" stroke-linejoin="round"/>
              <circle cx="16" cy="16" r="6.5" fill="none" stroke="#0F766E" stroke-width="2"/>
              <path d="M16 11V21M11 16H21" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>
              <defs>
                <linearGradient id="shield-grad" x1="16" y1="3" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#EFF6FF"/>
                  <stop offset="100%" stop-color="#DBEAFE"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">SafeSphere</span>
            <span class="brand-badge hide-on-narrow">PREPAREDNESS</span>
          </div>
        </a>

        <!-- Desktop Nav Links (Section 63) -->
        <div class="nav-links" id="desktop-nav-links">
          <a href="#/home" class="nav-link" data-route="home">${t.navHome || "Home"}</a>
          <a href="#/guides" class="nav-link" data-route="guides">${t.navGuides || "Emergency Guides"}</a>
          <a href="#/assessment" class="nav-link" data-route="assessment">${t.navAssessment || "Assessment"}</a>
          <a href="#/kit-planner" class="nav-link" data-route="kit-planner">${t.navKitPlanner || "Kit Planner"}</a>
          <a href="#/learning" class="nav-link" data-route="learning">${t.navLearning || "Learning"}</a>
          <a href="#/emergency-help" class="nav-link nav-link-emergency-help" data-route="emergency-help">
            <span class="pulse-dot"></span>
            <span>Emergency Help</span>
          </a>
          <a href="#/contacts" class="nav-link" data-route="contacts">
            ${t.navContacts || "Emergency Contacts"}
          </a>
        </div>

        <!-- Controls: Auth, Lang, Theme & Mobile Toggle -->
        <div class="nav-actions">
          <!-- Auth Link: Profile or Sign In -->
          ${isAuthenticated ? `
            <a href="#/profile" class="nav-auth-btn nav-profile-pill hide-on-narrow" title="User Profile & Settings" data-route="profile">
              <span class="nav-user-avatar">${(currentUser.full_name || "U").slice(0, 1).toUpperCase()}</span>
              <span class="nav-user-name">${(currentUser.full_name || "Profile").split(" ")[0]}</span>
            </a>
          ` : `
            <a href="#/auth" class="nav-auth-btn btn btn-primary btn-sm hide-on-narrow" data-route="auth">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Sign In</span>
            </a>
          `}

          <!-- Quick 112 Mobile Button for instant dial -->
          <a href="tel:112" class="mobile-quick-call mobile-only" title="Emergency Dial 112" aria-label="Dial emergency 112">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span>112</span>
          </a>

          <!-- Language Switcher -->
          <div class="lang-selector-wrapper">
            <label for="lang-select" class="sr-only">Choose Language</label>
            <select id="lang-select" class="lang-select" aria-label="Select Language">
              <option value="en" ${currentLang === "en" ? "selected" : ""}>EN</option>
              <option value="te" ${currentLang === "te" ? "selected" : ""}>తెలుగు</option>
              <option value="hi" ${currentLang === "hi" ? "selected" : ""}>हिन्दी</option>
            </select>
          </div>

          <!-- Theme Toggle -->
          <button id="theme-toggle-btn" class="btn-icon" type="button" aria-label="Toggle dark mode" title="Toggle dark mode">
            <span class="theme-icon-light ${currentTheme === 'dark' ? 'hidden' : ''}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
            </span>
            <span class="theme-icon-dark ${currentTheme === 'dark' ? '' : 'hidden'}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
              </svg>
            </span>
          </button>

          <!-- Mobile Hamburger Button -->
          <button id="mobile-menu-btn" class="btn-icon mobile-only" type="button" aria-expanded="false" aria-label="Toggle navigation menu">
            <svg class="hamburger-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Backdrop Overlay for Mobile Drawer -->
      <div id="mobile-drawer-overlay" class="mobile-drawer-overlay" hidden></div>

      <!-- Enhanced Mobile Drawer (Section 63) -->
      <div id="mobile-drawer" class="mobile-drawer" hidden>
        <div class="mobile-drawer-header">
          <div class="drawer-brand">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 3L5 7.5V15C5 22.2 9.7 28.1 16 30C22.3 28.1 27 22.2 27 15V7.5L16 3Z" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.5"/>
              <circle cx="16" cy="16" r="6" stroke="#0F766E" stroke-width="2"/>
              <path d="M16 11V21M11 16H21" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="drawer-title">Navigation Menu</span>
          </div>
          <button id="mobile-drawer-close" class="btn-icon drawer-close-btn" type="button" aria-label="Close navigation menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Auth Status Box in Mobile Drawer -->
        <div class="drawer-auth-box">
          ${isAuthenticated ? `
            <div class="dab-user">
              <div class="dab-avatar">${(currentUser.full_name || "U").slice(0, 1).toUpperCase()}</div>
              <div class="dab-info">
                <strong class="dab-name">${currentUser.full_name}</strong>
                <span class="dab-email">${currentUser.email}</span>
              </div>
            </div>
            <a href="#/profile" class="btn btn-secondary btn-sm dab-action">View Profile</a>
          ` : `
            <div class="dab-guest">
              <strong>Account Access</strong>
              <span>Save your kit, emergency contacts & request community aid</span>
            </div>
            <a href="#/auth" class="btn btn-primary btn-sm dab-action">Sign In / Register</a>
          `}
        </div>

        <!-- Emergency Hotline Quick Banner inside drawer -->
        <div class="drawer-emergency-banner">
          <div class="deb-left">
            <span class="deb-badge">CRISIS HELPLINE</span>
            <span class="deb-title">National Emergency: 112</span>
          </div>
          <a href="tel:112" class="btn btn-emergency btn-sm deb-call-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>Dial Now</span>
          </a>
        </div>

        <div class="drawer-section-label">Emergency Action</div>
        <div class="mobile-drawer-links">
          <a href="#/emergency-help" class="mobile-nav-link text-emergency font-semibold" data-route="emergency-help">
            <span class="mnl-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </span>
            <span class="mnl-text">Emergency Help</span>
            <span class="mnl-badge badge-emergency">Urgent</span>
          </a>
          <a href="#/community-help" class="mobile-nav-link" data-route="community-help">
            <span class="mnl-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <span class="mnl-text">Community Help Radar</span>
          </a>
          <a href="#/contacts" class="mobile-nav-link" data-route="contacts">
            <span class="mnl-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </span>
            <span class="mnl-text">Emergency Contacts</span>
          </a>
        </div>

        <div class="drawer-section-label">Preparedness & Learning</div>
        <div class="mobile-drawer-links">
          <a href="#/home" class="mobile-nav-link" data-route="home">
            <span class="mnl-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </span>
            <span class="mnl-text">${t.navHome}</span>
          </a>
          <a href="#/guides" class="mobile-nav-link" data-route="guides">
            <span class="mnl-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </span>
            <span class="mnl-text">${t.navGuides}</span>
            <span class="mnl-badge">12</span>
          </a>
          <a href="#/assessment" class="mobile-nav-link" data-route="assessment">
            <span class="mnl-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </span>
            <span class="mnl-text">${t.navAssessment}</span>
          </a>
          <a href="#/kit-planner" class="mobile-nav-link" data-route="kit-planner">
            <span class="mnl-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </span>
            <span class="mnl-text">${t.navKitPlanner}</span>
          </a>
          <a href="#/learning" class="mobile-nav-link" data-route="learning">
            <span class="mnl-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </span>
            <span class="mnl-text">${t.navLearning}</span>
          </a>
          <a href="#/survey" class="mobile-nav-link" data-route="survey">
            <span class="mnl-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            <span class="mnl-text">${t.navSurvey}</span>
          </a>
          <a href="#/analytics" class="mobile-nav-link" data-route="analytics">
            <span class="mnl-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </span>
            <span class="mnl-text">${t.navAnalytics}</span>
          </a>
          <a href="#/about" class="mobile-nav-link" data-route="about">
            <span class="mnl-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </span>
            <span class="mnl-text">${t.navAbout}</span>
          </a>
        </div>
      </div>
    </nav>

    <!-- Mobile Bottom Navigation Dock (Sticky for Thumb Reach) -->
    <div id="mobile-bottom-nav" class="mobile-bottom-nav" role="navigation" aria-label="Mobile quick navigation">
      <a href="#/home" class="mb-nav-item" data-route="home">
        <span class="mb-nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </span>
        <span class="mb-nav-label">Home</span>
      </a>

      <a href="#/guides" class="mb-nav-item" data-route="guides">
        <span class="mb-nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </span>
        <span class="mb-nav-label">Guides</span>
      </a>

      <a href="#/emergency-help" class="mb-nav-item mb-nav-emergency" data-route="emergency-help" title="Emergency Help & Community Aid">
        <span class="mb-nav-icon-emergency">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </span>
        <span class="mb-nav-label">Help</span>
      </a>

      <a href="#/kit-planner" class="mb-nav-item" data-route="kit-planner">
        <span class="mb-nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </span>
        <span class="mb-nav-label">Kit</span>
      </a>

      ${isAuthenticated ? `
        <a href="#/profile" class="mb-nav-item" data-route="profile">
          <span class="mb-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </span>
          <span class="mb-nav-label">Profile</span>
        </a>
      ` : `
        <a href="#/auth" class="mb-nav-item" data-route="auth">
          <span class="mb-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          </span>
          <span class="mb-nav-label">Sign In</span>
        </a>
      `}
    </div>
  `;

  // Attach Event Listeners
  const langSelect = navWrapper.querySelector("#lang-select");
  langSelect.addEventListener("change", (e) => {
    const chosen = e.target.value;
    storage.set("language", chosen);
    if (onLanguageChange) onLanguageChange(chosen);
  });

  const themeBtn = navWrapper.querySelector("#theme-toggle-btn");
  themeBtn.addEventListener("click", () => {
    const next = toggleTheme();
    const lightIcon = navWrapper.querySelector(".theme-icon-light");
    const darkIcon = navWrapper.querySelector(".theme-icon-dark");
    if (next === "dark") {
      lightIcon.classList.add("hidden");
      darkIcon.classList.remove("hidden");
    } else {
      lightIcon.classList.remove("hidden");
      darkIcon.classList.add("hidden");
    }
  });

  const mobileBtn = navWrapper.querySelector("#mobile-menu-btn");
  const drawer = navWrapper.querySelector("#mobile-drawer");
  const overlay = navWrapper.querySelector("#mobile-drawer-overlay");
  const drawerCloseBtn = navWrapper.querySelector("#mobile-drawer-close");

  function toggleMobileMenu(forceClose = false) {
    const isExpanded = mobileBtn.getAttribute("aria-expanded") === "true";
    const nextState = forceClose ? false : !isExpanded;
    mobileBtn.setAttribute("aria-expanded", String(nextState));

    if (nextState) {
      overlay.removeAttribute("hidden");
      drawer.removeAttribute("hidden");
      // Prevent background scroll
      document.body.classList.add("drawer-open");
      requestAnimationFrame(() => {
        overlay.classList.add("open");
        drawer.classList.add("open");
      });
    } else {
      drawer.classList.remove("open");
      overlay.classList.remove("open");
      document.body.classList.remove("drawer-open");
      setTimeout(() => {
        if (!drawer.classList.contains("open")) {
          drawer.setAttribute("hidden", "true");
          overlay.setAttribute("hidden", "true");
        }
      }, 220);
    }
  }

  mobileBtn.addEventListener("click", () => toggleMobileMenu());
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener("click", () => toggleMobileMenu(true));
  }
  if (overlay) {
    overlay.addEventListener("click", () => toggleMobileMenu(true));
  }

  // Close mobile drawer when clicking a link
  drawer.querySelectorAll(".mobile-nav-link, .deb-call-btn").forEach(link => {
    link.addEventListener("click", () => toggleMobileMenu(true));
  });

  // Highlight active link across desktop, drawer, and bottom nav
  function updateActiveLinks(route) {
    const current = (route && route.primary) || "home";
    navWrapper.querySelectorAll(".nav-link, .mobile-nav-link, .mb-nav-item").forEach(link => {
      const target = link.getAttribute("data-route");
      if (target === current || (current === "guide" && target === "guides")) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });
  }

  window.addEventListener("safesphere:routechange", (e) => {
    updateActiveLinks(e.detail && e.detail.route);
  });

  // Re-render when auth changes if container still active
  if (!window.__safesphere_navbar_auth_attached) {
    window.__safesphere_navbar_auth_attached = true;
    auth.onAuthStateChange(() => {
      renderNavbar(container, onLanguageChange);
    });
  }

  container.innerHTML = "";
  container.appendChild(navWrapper);

  // Initial active update
  const hash = window.location.hash.replace(/^#\/?/, "") || "home";
  const primary = hash.split("/")[0] || "home";
  updateActiveLinks({ primary });
}
