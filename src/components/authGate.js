/**
 * SafeSphere Auth Gate Component
 * Friendly guard card for protected routes:
 * - #/profile
 * - #/emergency-help
 * - #/community-help
 * - #/personal-contacts
 */

export function renderAuthGate(container, featureName = "this feature", redirectHash = "#/home") {
  container.innerHTML = `
    <div class="content-container auth-gate-wrapper">
      <div class="auth-gate-card">
        <div class="auth-gate-emblem">
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 3L5 7.5V15C5 22.2 9.7 28.1 16 30C22.3 28.1 27 22.2 27 15V7.5L16 3Z" fill="url(#gate-shield)" stroke="#2563EB" stroke-width="1.5"/>
            <circle cx="16" cy="16" r="6" stroke="#0F766E" stroke-width="2"/>
            <rect x="13" y="14" width="6" height="5" rx="1" fill="#2563EB"/>
            <path d="M14 14V12.5C14 11.4 14.9 10.5 16 10.5C17.1 10.5 18 11.4 18 12.5V14" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/>
            <defs>
              <linearGradient id="gate-shield" x1="16" y1="3" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#EFF6FF"/>
                <stop offset="100%" stop-color="#DBEAFE"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <span class="auth-gate-badge">VERIFIED SAFETY ACCESS</span>
        <h2 class="auth-gate-title">Please sign in to use this feature</h2>
        <p class="auth-gate-desc">
          Accessing <strong>${featureName}</strong> requires an authenticated SafeSphere account to safeguard community requests, verify trusted responders, and secure personal emergency contacts.
        </p>

        <div class="auth-gate-actions">
          <a href="#/login?redirect=${encodeURIComponent(redirectHash)}" class="btn btn-primary btn-lg gate-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            <span>Sign In</span>
          </a>
          <a href="#/signup?redirect=${encodeURIComponent(redirectHash)}" class="btn btn-secondary btn-lg gate-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            <span>Create Account</span>
          </a>
          <a href="#/home" class="btn btn-outline gate-btn">
            <span>Back to Home</span>
          </a>
        </div>

        <div class="auth-gate-helpline-note">
          <span>Need immediate emergency services?</span>
          <a href="tel:112" class="gate-call-now">Call 112 directly</a>
        </div>
      </div>
    </div>
  `;
}
