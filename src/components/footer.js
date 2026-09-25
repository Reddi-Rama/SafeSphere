/**
 * SafeSphere Footer Component
 * Professional, calm footer with clear disclaimers and structured links
 */

import { storage } from "../utils/storage.js";
import { TRANSLATIONS } from "../data.js";

export function renderFooter(container) {
  const currentLang = storage.get("language", "en");
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-brand-col">
          <div class="footer-brand">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M16 3L5 7.5V15C5 22.2 9.7 28.1 16 30C22.3 28.1 27 22.2 27 15V7.5L16 3Z" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.5"/>
              <circle cx="16" cy="16" r="6" stroke="#0F766E" stroke-width="1.8"/>
              <path d="M16 11V21M11 16H21" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="footer-brand-title">SafeSphere</span>
          </div>
          <p class="footer-tagline">"${t.tagline}"</p>
          <p class="footer-mission">
            Empowering families and communities with authoritative emergency guides, proactive kit planning, and practical crisis survival knowledge.
          </p>
        </div>

        <div class="footer-links-col">
          <h4 class="footer-heading">Preparedness</h4>
          <ul class="footer-link-list">
            <li><a href="#/guides">Emergency Guides</a></li>
            <li><a href="#/assessment">Preparedness Assessment</a></li>
            <li><a href="#/kit-planner">Kit Checklist Planner</a></li>
            <li><a href="#/learning">Learning & Resources</a></li>
          </ul>
        </div>

        <div class="footer-links-col">
          <h4 class="footer-heading">Safety Network</h4>
          <ul class="footer-link-list">
            <li><a href="#/contacts">Emergency Hotlines (112)</a></li>
            <li><a href="#/survey">Community Survey</a></li>
            <li><a href="#/analytics">Readiness Analytics</a></li>
            <li><a href="#/about">About SafeSphere</a></li>
          </ul>
        </div>

        <div class="footer-emergency-col">
          <div class="footer-hotline-card">
            <span class="hotline-eyebrow">National Emergency</span>
            <div class="hotline-number-row">
              <span class="hotline-digits">112</span>
              <a href="tel:112" class="hotline-btn">Call Now</a>
            </div>
            <p class="hotline-sub">Toll-free 24/7 across India for Police, Fire, and Ambulance.</p>
          </div>
        </div>
      </div>

      <div class="footer-divider"></div>

      <div class="footer-bottom">
        <div class="footer-disclaimer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span><strong>Notice:</strong> Educational platform for emergency awareness and preparedness. SafeSphere is not an emergency dispatch service. During an active life-threatening crisis, dial 112 or 108 immediately.</span>
        </div>
        <div class="footer-meta">
          <span>&copy; ${new Date().getFullYear()} SafeSphere. Open Educational Preparedness.</span>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = "";
  container.appendChild(footer);
}
