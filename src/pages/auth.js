/**
 * SafeSphere Authentication Page
 * Professional, calm safety-platform login, signup & password recovery.
 * Fully supports Supabase Authentication or resilient Demo Mode.
 */

import { auth } from "../utils/auth.js";
import { showToast } from "../components/toast.js";

export function renderAuth(container, initialMode = "login") {
  let mode = initialMode; // "login" | "signup" | "forgot"
  const isDemo = auth.isDemoMode();

  // Extract redirect if any
  const hashParts = window.location.hash.split("?");
  const searchParams = new URLSearchParams(hashParts[1] || "");
  const redirectTarget = searchParams.get("redirect") || "#/home";

  function render() {
    container.innerHTML = `
      <div class="content-container auth-page-container">
        <div class="auth-card-wrapper">
          <!-- Auth Header with SafeSphere Emblem -->
          <div class="auth-card-header">
            <div class="auth-brand-emblem">
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 3L5 7.5V15C5 22.2 9.7 28.1 16 30C22.3 28.1 27 22.2 27 15V7.5L16 3Z" fill="url(#auth-shield-grad)" stroke="#2563EB" stroke-width="1.5"/>
                <circle cx="16" cy="16" r="6.5" stroke="#0F766E" stroke-width="2"/>
                <path d="M16 11V21M11 16H21" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>
                <defs>
                  <linearGradient id="auth-shield-grad" x1="16" y1="3" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#EFF6FF"/>
                    <stop offset="100%" stop-color="#DBEAFE"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 class="auth-title">SafeSphere Account Access</h1>
            <p class="auth-subtitle">
              ${mode === "login"
                ? "Sign in to manage emergency contacts, request community help, and coordinate safety."
                : mode === "signup"
                ? "Create your preparedness profile to access verified community emergency assistance."
                : "Reset your SafeSphere password with verified credentials."}
            </p>

            <!-- Mode Indicator Badge -->
            <div class="auth-mode-indicator">
              ${isDemo ? `
                <div class="demo-mode-badge" title="Supabase credentials not detected; running in secure local demo mode">
                  <span class="demo-dot"></span>
                  <span>SafeSphere Development Demo Mode (Web Crypto Secured)</span>
                </div>
              ` : `
                <div class="live-mode-badge">
                  <span class="live-dot"></span>
                  <span>Supabase Authentication Active</span>
                </div>
              `}
            </div>
          </div>

          <!-- Mode Tabs -->
          <div class="auth-tabs" role="tablist">
            <button class="auth-tab ${mode === 'login' ? 'active' : ''}" data-mode="login" type="button" role="tab" aria-selected="${mode === 'login'}">
              Sign In
            </button>
            <button class="auth-tab ${mode === 'signup' ? 'active' : ''}" data-mode="signup" type="button" role="tab" aria-selected="${mode === 'signup'}">
              Create Account
            </button>
            <button class="auth-tab ${mode === 'forgot' ? 'active' : ''}" data-mode="forgot" type="button" role="tab" aria-selected="${mode === 'forgot'}">
              Forgot Password
            </button>
          </div>

          ${isDemo && mode === 'login' ? `
            <!-- Quick Demo Credentials Helper for instant testing -->
            <div class="demo-quickfill-box">
              <div class="dqf-info">
                <strong>Quick Demo Testing Account:</strong>
                <span><code>demo@safesphere.org</code> • Pass: <code>safety2026</code></span>
              </div>
              <button type="button" id="btn-demo-quickfill" class="btn btn-secondary btn-sm">
                1-Click Fill Demo
              </button>
            </div>
          ` : ""}

          <!-- Form Area -->
          <form id="auth-form" class="auth-form" novalidate>
            ${renderFormFields()}

            <div id="auth-error-msg" class="auth-error-banner" hidden></div>

            <button type="submit" id="btn-auth-submit" class="btn btn-primary btn-lg auth-submit-btn">
              <span class="btn-text">
                ${mode === "login" ? "Sign In to SafeSphere" : mode === "signup" ? "Complete Registration" : "Send Password Reset Link"}
              </span>
              <svg class="btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </form>

          <!-- Footer Switcher -->
          <div class="auth-card-footer">
            ${mode === "login" ? `
              <span>Don't have a SafeSphere profile yet?</span>
              <button type="button" class="link-btn switch-mode" data-mode="signup">Create an account</button>
            ` : mode === "signup" ? `
              <span>Already registered on SafeSphere?</span>
              <button type="button" class="link-btn switch-mode" data-mode="login">Sign in here</button>
            ` : `
              <button type="button" class="link-btn switch-mode" data-mode="login">← Return to Sign In</button>
            `}
          </div>

          <!-- Official Helpline Fallback Reminder -->
          <div class="auth-emergency-reminder">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Immediate crisis? You never need to sign in to call emergency services: <a href="tel:112"><strong>Dial 112</strong></a></span>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function renderFormFields() {
    if (mode === "login") {
      return `
        <div class="form-group">
          <label for="login-email" class="form-label">Email Address <span class="required">*</span></label>
          <input type="email" id="login-email" class="form-control" placeholder="name@example.com" required autocomplete="email" />
        </div>

        <div class="form-group">
          <div class="label-with-aside">
            <label for="login-password" class="form-label">Password <span class="required">*</span></label>
            <button type="button" class="aside-link switch-mode" data-mode="forgot">Forgot password?</button>
          </div>
          <input type="password" id="login-password" class="form-control" placeholder="••••••••" required autocomplete="current-password" />
        </div>
      `;
    }

    if (mode === "signup") {
      return `
        <div class="form-group">
          <label for="signup-name" class="form-label">Full Name <span class="required">*</span></label>
          <input type="text" id="signup-name" class="form-control" placeholder="e.g. Dr. Ananya Sharma" required autocomplete="name" />
        </div>

        <div class="form-group">
          <label for="signup-email" class="form-label">Email Address <span class="required">*</span></label>
          <input type="email" id="signup-email" class="form-control" placeholder="name@example.com" required autocomplete="email" />
        </div>

        <div class="form-row">
          <div class="form-group form-col">
            <label for="signup-password" class="form-label">Password <span class="required">*</span></label>
            <input type="password" id="signup-password" class="form-control" placeholder="At least 6 characters" required autocomplete="new-password" />
          </div>
          <div class="form-group form-col">
            <label for="signup-confirm-password" class="form-label">Confirm Password <span class="required">*</span></label>
            <input type="password" id="signup-confirm-password" class="form-control" placeholder="Re-enter password" required autocomplete="new-password" />
          </div>
        </div>

        <!-- Optional Profile Details Section -->
        <details class="optional-profile-accordion">
          <summary class="optional-summary">
            <span class="opt-title">Optional Emergency Profile Information</span>
            <span class="opt-desc">Phone, language preference & primary emergency contact</span>
          </summary>
          <div class="optional-fields-body">
            <div class="form-row">
              <div class="form-group form-col">
                <label for="signup-phone" class="form-label">Phone Number (Optional)</label>
                <input type="tel" id="signup-phone" class="form-control" placeholder="+91 98765 43210" autocomplete="tel" />
              </div>
              <div class="form-group form-col">
                <label for="signup-lang" class="form-label">Preferred Language</label>
                <select id="signup-lang" class="form-control">
                  <option value="en">English</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group form-col">
                <label for="signup-contact-name" class="form-label">Emergency Contact Name</label>
                <input type="text" id="signup-contact-name" class="form-control" placeholder="Family member or neighbor" />
              </div>
              <div class="form-group form-col">
                <label for="signup-contact-phone" class="form-label">Emergency Contact Phone</label>
                <input type="tel" id="signup-contact-phone" class="form-control" placeholder="+91 98765 00000" />
              </div>
            </div>
            <p class="privacy-caption">Emergency contacts are stored privately and never published on public community feeds.</p>
          </div>
        </details>
      `;
    }

    if (mode === "forgot") {
      return `
        <div class="form-group">
          <label for="forgot-email" class="form-label">Registered Email Address <span class="required">*</span></label>
          <input type="email" id="forgot-email" class="form-control" placeholder="name@example.com" required autocomplete="email" />
          <p class="form-hint">We will send verification instructions to your verified address.</p>
        </div>
      `;
    }

    return "";
  }

  function bindEvents() {
    // Mode switcher buttons
    container.querySelectorAll(".auth-tab, .switch-mode").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetMode = btn.getAttribute("data-mode");
        if (targetMode && targetMode !== mode) {
          mode = targetMode;
          render();
        }
      });
    });

    // 1-Click Demo Fill
    const demoQuickfillBtn = container.querySelector("#btn-demo-quickfill");
    if (demoQuickfillBtn) {
      demoQuickfillBtn.addEventListener("click", () => {
        const emailField = container.querySelector("#login-email");
        const passwordField = container.querySelector("#login-password");
        if (emailField && passwordField) {
          emailField.value = "demo@safesphere.org";
          passwordField.value = "safety2026";
          showToast("Demo credentials filled into form.", "info");
        }
      });
    }

    // Form submit
    const form = container.querySelector("#auth-form");
    const errorBanner = container.querySelector("#auth-error-msg");
    const submitBtn = container.querySelector("#btn-auth-submit");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorBanner.setAttribute("hidden", "true");
      errorBanner.textContent = "";

      submitBtn.disabled = true;
      const originalText = submitBtn.querySelector(".btn-text").textContent;
      submitBtn.querySelector(".btn-text").textContent = "Verifying...";

      try {
        if (mode === "login") {
          const email = container.querySelector("#login-email").value;
          const password = container.querySelector("#login-password").value;
          const user = await auth.login(email, password);
          showToast(`Welcome back, ${user.full_name}!`, "success");
          window.location.hash = redirectTarget;
        } else if (mode === "signup") {
          const fullName = container.querySelector("#signup-name").value;
          const email = container.querySelector("#signup-email").value;
          const password = container.querySelector("#signup-password").value;
          const confirmPassword = container.querySelector("#signup-confirm-password").value;
          const phone = container.querySelector("#signup-phone")?.value || "";
          const preferredLanguage = container.querySelector("#signup-lang")?.value || "en";
          const emergencyContactName = container.querySelector("#signup-contact-name")?.value || "";
          const emergencyContactPhone = container.querySelector("#signup-contact-phone")?.value || "";

          const user = await auth.signUp({
            fullName,
            email,
            password,
            confirmPassword,
            phone,
            preferredLanguage,
            emergencyContactName,
            emergencyContactPhone
          });
          showToast(`Account created! Welcome, ${user.full_name}.`, "success");
          window.location.hash = redirectTarget;
        } else if (mode === "forgot") {
          const email = container.querySelector("#forgot-email").value;
          const res = await auth.forgotPassword(email);
          showToast(res.message, "info");
          mode = "login";
          render();
        }
      } catch (err) {
        errorBanner.removeAttribute("hidden");
        errorBanner.textContent = err.message || "An authentication error occurred.";
        submitBtn.disabled = false;
        submitBtn.querySelector(".btn-text").textContent = originalText;
      }
    });
  }

  render();
}
