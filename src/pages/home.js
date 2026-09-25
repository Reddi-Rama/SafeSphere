/**
 * SafeSphere Home Page
 * Calm, trustworthy hero with custom safety shield emblem,
 * awareness principles, six core features, and quick action cards.
 */

import { storage } from "../utils/storage.js";
import { TRANSLATIONS } from "../data.js";
import { auth } from "../utils/auth.js";

export function renderHome(mainElement) {
  const currentLang = storage.get("language", "en");
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const currentUser = auth.getUser();
  const latestAssessment = storage.get("latest_assessment", null);
  const kitState = storage.get("safesphere_kit_state", {});
  const packedCount = Object.values(kitState).filter(Boolean).length;
  const personalContacts = auth.getPersonalContacts();
  const activeRequest = auth.getUserActiveRequest();

  let personalizedDashboardHtml = "";
  if (currentUser) {
    personalizedDashboardHtml = `
      <!-- Personalized User Preparedness Dashboard (Section 58) -->
      <section class="user-home-dashboard" aria-label="Personal Preparedness Dashboard">
        <div class="content-container">
          <div class="uhd-card">
            <div class="uhd-top-row">
              <div class="uhd-welcome">
                <div class="uhd-avatar">${(currentUser.full_name || "SP").split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase()}</div>
                <div>
                  <span class="uhd-greeting-badge">SECURE SAFETY PROFILE</span>
                  <h2 class="uhd-title">Welcome back, ${currentUser.full_name}</h2>
                  <p class="uhd-lead">Your household preparedness overview and rapid emergency controls.</p>
                </div>
              </div>
              <div class="uhd-actions-top">
                <a href="#/profile" class="btn btn-secondary btn-sm">Manage Profile</a>
                <a href="#/emergency-help" class="btn btn-emergency btn-sm">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
                  <span>Emergency Help</span>
                </a>
              </div>
            </div>

            ${activeRequest ? `
              <div class="uhd-active-alert">
                <div class="ua-left">
                  <span class="pulse-dot"></span>
                  <strong>Active Community Help Request (${activeRequest.id}):</strong>
                  <span>${activeRequest.category} — ${activeRequest.status}</span>
                </div>
                <a href="#/emergency-help" class="btn btn-outline btn-sm">View Status</a>
              </div>
            ` : ""}

            <!-- Quick Status Metrics Grid -->
            <div class="uhd-metrics-grid">
              <div class="uhd-metric-box">
                <div class="umb-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div class="umb-content">
                  <span class="umb-label">Preparedness Score</span>
                  <strong class="umb-value">${latestAssessment ? latestAssessment.score + '%' : 'Pending'}</strong>
                  <span class="umb-sub">${latestAssessment ? latestAssessment.levelName : 'Take self-assessment'}</span>
                </div>
                <a href="#/assessment" class="umb-link" title="Open Assessment">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
              </div>

              <div class="uhd-metric-box">
                <div class="umb-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
                <div class="umb-content">
                  <span class="umb-label">72-Hour Kit Status</span>
                  <strong class="umb-value">${packedCount > 0 ? packedCount + ' items' : 'Not started'}</strong>
                  <span class="umb-sub">${packedCount >= 18 ? 'Well Supplied' : 'Supplies needed'}</span>
                </div>
                <a href="#/kit-planner" class="umb-link" title="Open Kit Planner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
              </div>

              <div class="uhd-metric-box">
                <div class="umb-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                </div>
                <div class="umb-content">
                  <span class="umb-label">Personal Contacts</span>
                  <strong class="umb-value">${personalContacts.length} saved</strong>
                  <span class="umb-sub">Trusted family & medics</span>
                </div>
                <a href="#/profile" class="umb-link" title="Manage Contacts">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
              </div>

              <div class="uhd-metric-box">
                <div class="umb-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div class="umb-content">
                  <span class="umb-label">Community Radar</span>
                  <strong class="umb-value">Active Aid</strong>
                  <span class="umb-sub">Mutual aid network</span>
                </div>
                <a href="#/community-help" class="umb-link" title="Open Community Radar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
              </div>
            </div>

            <!-- Five Core Quick Actions (Rule 58) -->
            <div class="uhd-quick-actions-bar">
              <span class="uqa-label">QUICK ACTIONS:</span>
              <div class="uqa-buttons">
                <a href="#/emergency-help" class="btn btn-emergency btn-sm">Emergency Help</a>
                <a href="#/guides" class="btn btn-secondary btn-sm">Emergency Guides</a>
                <a href="#/assessment" class="btn btn-secondary btn-sm">Assessment</a>
                <a href="#/kit-planner" class="btn btn-secondary btn-sm">Kit Planner</a>
                <a href="#/contacts" class="btn btn-secondary btn-sm">Emergency Contacts</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  mainElement.className = "page page-home";
  mainElement.innerHTML = `
    ${personalizedDashboardHtml}
    <!-- Hero Section -->
    <section class="home-hero" aria-labelledby="hero-heading">
      <div class="hero-ambient-glow" aria-hidden="true"></div>
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-tag">
            <span class="hero-tag-dot"></span>
            <span>Emergency Awareness & Preparedness Initiative</span>
          </div>
          <h1 id="hero-heading" class="hero-title">${t.heroTitle}</h1>
          <p class="hero-subtitle">${t.heroSubtitle}</p>

          <div class="hero-cta-group">
            <a href="#/guides" class="btn btn-primary btn-lg" id="home-cta-guides">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span>${t.exploreGuides}</span>
            </a>
            <a href="#/assessment" class="btn btn-outline btn-lg" id="home-cta-assessment">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              <span>${t.checkPreparedness}</span>
            </a>
          </div>

          <div class="hero-trust-indicators">
            <div class="trust-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>12 Crisis Protocols</span>
            </div>
            <div class="trust-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Zero-Delay Offline Mode</span>
            </div>
            <div class="trust-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Multilingual (EN, TE, HI)</span>
            </div>
          </div>
        </div>

        <!-- Custom Original SVG/CSS Safety Shield & Protection Graphic -->
        <div class="hero-visual" aria-hidden="true">
          <div class="shield-stage">
            <div class="shield-glow-orbit"></div>
            <div class="shield-geometry">
              <svg class="shield-svg" viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Concentric Safety Rings -->
                <circle cx="180" cy="180" r="160" stroke="currentColor" stroke-opacity="0.08" stroke-width="1.5" stroke-dasharray="6 6"/>
                <circle cx="180" cy="180" r="126" stroke="currentColor" stroke-opacity="0.12" stroke-width="1.5"/>
                <circle cx="180" cy="180" r="92" stroke="currentColor" stroke-opacity="0.18" stroke-width="1.5"/>

                <!-- Radial Crosshairs -->
                <line x1="180" y1="20" x2="180" y2="340" stroke="currentColor" stroke-opacity="0.06" stroke-width="1.5"/>
                <line x1="20" y1="180" x2="340" y2="180" stroke="currentColor" stroke-opacity="0.06" stroke-width="1.5"/>

                <!-- Core Shield Base -->
                <path d="M180 52L86 92V166C86 238 128 296 180 312C232 296 274 238 274 166V92L180 52Z"
                      fill="url(#hero-shield-fill)" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round"/>

                <!-- Inner Protection Emblem -->
                <circle cx="180" cy="174" r="44" fill="var(--color-surface)" stroke="var(--secondary)" stroke-width="2.5"/>
                <!-- Emergency Medical Cross & Safety Beacon -->
                <path d="M180 148V200M154 174H206" stroke="var(--primary)" stroke-width="5" stroke-linecap="round"/>
                <circle cx="180" cy="174" r="12" fill="var(--primary-subtle)" stroke="var(--primary)" stroke-width="2"/>

                <!-- Surrounding Orbit Markers -->
                <circle cx="180" cy="40" r="5" fill="var(--emergency)"/>
                <circle cx="320" cy="180" r="5" fill="var(--secondary)"/>
                <circle cx="180" cy="320" r="5" fill="var(--primary)"/>
                <circle cx="40" cy="180" r="5" fill="var(--warning)"/>

                <defs>
                  <linearGradient id="hero-shield-fill" x1="180" y1="52" x2="180" y2="312" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="var(--color-surface-elevated)"/>
                    <stop offset="100%" stop-color="var(--color-surface)"/>
                  </linearGradient>
                </defs>
              </svg>

              <!-- Dynamic Interactive Legend Floating Nodes -->
              <div class="floating-node node-top">
                <span class="node-icon">⚡</span>
                <div class="node-meta">
                  <span class="node-label">Golden Hour</span>
                  <span class="node-sub">Immediate Actions Count</span>
                </div>
              </div>

              <div class="floating-node node-bottom-left">
                <span class="node-icon">📦</span>
                <div class="node-meta">
                  <span class="node-label">72-Hour Kit</span>
                  <span class="node-sub">Household Autonomy</span>
                </div>
              </div>

              <div class="floating-node node-bottom-right">
                <span class="node-icon">📞</span>
                <div class="node-meta">
                  <span class="node-label">112 Unified</span>
                  <span class="node-sub">National Response</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Awareness & Philosophy Section -->
    <section class="section-awareness" aria-labelledby="awareness-heading">
      <div class="content-container">
        <div class="section-header text-center">
          <span class="section-badge">CRISIS PRINCIPLES</span>
          <h2 id="awareness-heading" class="section-title">Why Emergency Awareness Matters</h2>
          <p class="section-subtitle">
            Emergencies do not announce themselves. When disaster strikes, stress levels spike and memory fragments.
            SafeSphere is built on three core survival doctrines.
          </p>
        </div>

        <div class="awareness-grid">
          <div class="awareness-item">
            <div class="awareness-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3 class="awareness-title">The First 180 Seconds</h3>
            <p class="awareness-text">
              In flash floods, structural fires, and severe arterial wounds, the first three minutes dictate survival. Knowing exact, non-panicked physical steps preserves life before first responders arrive.
            </p>
          </div>

          <div class="awareness-item">
            <div class="awareness-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 class="awareness-title">Clear, Uncluttered Guidance</h3>
            <p class="awareness-text">
              During an emergency, no one has time to read 50-page technical manuals. SafeSphere delivers concise, action-ordered step sequences, explicit "What to Avoid", and verified contacts.
            </p>
          </div>

          <div class="awareness-item">
            <div class="awareness-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 class="awareness-title">Household & Neighbor Self-Reliance</h3>
            <p class="awareness-text">
              Rescue services are often overwhelmed during mass events. Prepared families who possess a 72-hour kit and basic first aid don't just stay safe; they actively help neighbors in need.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Six Core Features Section -->
    <section class="section-features" aria-labelledby="features-heading">
      <div class="content-container">
        <div class="section-header">
          <span class="section-badge">CORE CAPABILITIES</span>
          <h2 id="features-heading" class="section-title">Six Pillars of Preparedness</h2>
          <p class="section-subtitle">
            An end-to-end platform crafted to prepare, guide, and protect your household across all emergency stages.
          </p>
        </div>

        <div class="features-grid">
          <!-- 1. Emergency Guides -->
          <article class="feature-card">
            <div class="feature-card-header">
              <div class="feature-icon icon-primary">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <span class="feature-num">01</span>
            </div>
            <h3 class="feature-title">Emergency Guides</h3>
            <p class="feature-desc">
              12 authoritative, non-graphic protocols spanning natural disasters, medical crises, and home accidents with audio read-aloud and visual demonstrations.
            </p>
            <a href="#/guides" class="feature-link">
              <span>View 12 Guides</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </article>

          <!-- 2. Preparedness Assessment -->
          <article class="feature-card">
            <div class="feature-card-header">
              <div class="feature-icon icon-secondary">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <span class="feature-num">02</span>
            </div>
            <h3 class="feature-title">Preparedness Assessment</h3>
            <p class="feature-desc">
              Evaluate your household readiness across 8 practical scenarios. Receive a tailored score, gap analysis, and realistic action checklist.
            </p>
            <a href="#/assessment" class="feature-link">
              <span>Take Assessment</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </article>

          <!-- 3. Kit Planner -->
          <article class="feature-card">
            <div class="feature-card-header">
              <div class="feature-icon icon-warning">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <span class="feature-num">03</span>
            </div>
            <h3 class="feature-title">Emergency Kit Planner</h3>
            <p class="feature-desc">
              Customizes essential 72-hour supplies based on your family count, infants, elderly members, pets, and medical dependencies. Track and print with one click.
            </p>
            <a href="#/kit-planner" class="feature-link">
              <span>Build Kit Checklist</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </article>

          <!-- 4. Safety Learning -->
          <article class="feature-card">
            <div class="feature-card-header">
              <div class="feature-icon icon-accent">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <span class="feature-num">04</span>
            </div>
            <h3 class="feature-title">Safety Learning</h3>
            <p class="feature-desc">
              Curated editorial deep-dives into disaster biology, bleeding control physics, neighborhood resilience networks, and psychological first aid.
            </p>
            <a href="#/learning" class="feature-link">
              <span>Read Articles</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </article>

          <!-- 5. Emergency Contacts -->
          <article class="feature-card">
            <div class="feature-card-header">
              <div class="feature-icon icon-emergency">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <span class="feature-num">05</span>
            </div>
            <h3 class="feature-title">Emergency Contacts</h3>
            <p class="feature-desc">
              Immediate tap-to-dial access to verified national numbers (112, 108, 101, 100, 1070) plus a private local contact card for your own family.
            </p>
            <a href="#/contacts" class="feature-link">
              <span>View Helplines</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </article>

          <!-- 6. Community Feedback -->
          <article class="feature-card">
            <div class="feature-card-header">
              <div class="feature-icon icon-secondary">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </div>
              <span class="feature-num">06</span>
            </div>
            <h3 class="feature-title">Community Feedback</h3>
            <p class="feature-desc">
              Share real-world preparedness insights through our quick survey with integrated voice input. Helps shape community emergency resource planning.
            </p>
            <a href="#/survey" class="feature-link">
              <span>Give Feedback</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </article>
        </div>
      </div>
    </section>

    <!-- Compact Final CTA Section -->
    <section class="section-final-cta">
      <div class="content-container">
        <div class="cta-banner">
          <div class="cta-banner-content">
            <h2 class="cta-banner-title">Readiness Is Not An Accident</h2>
            <p class="cta-banner-desc">
              Spend 4 minutes today reviewing your household emergency plan and checking your supplies. It costs nothing, but protects everything.
            </p>
            <div class="cta-banner-actions">
              <a href="#/assessment" class="btn btn-primary btn-md">Start Assessment</a>
              <a href="#/kit-planner" class="btn btn-outline btn-md">Open Kit Planner</a>
            </div>
          </div>
          <div class="cta-banner-badge" aria-hidden="true">
            <span class="badge-num">100%</span>
            <span class="badge-txt">Educational & Free</span>
          </div>
        </div>
      </div>
    </section>
  `;
}
