/**
 * SafeSphere Emergency Help Feature (#/emergency-help)
 * Clean, calm, rapid-response assistance coordinator.
 * Implements Sections 50, 51, 52, 55, 56, 60, 61, 66, 68.
 */

import { auth } from "../utils/auth.js";
import { renderAuthGate } from "../components/authGate.js";
import { showToast } from "../components/toast.js";
import {
  requestVoluntaryLocation,
  stopSharingLocation,
  getCurrentLocationData,
  LOCATION_STATES
} from "../utils/location.js";

const HELP_CATEGORIES = [
  { id: "Medical Assistance", icon: "cross", label: "Medical Assistance", desc: "First aid, injury, severe sudden illness" },
  { id: "Fire/Evacuation Assistance", icon: "flame", label: "Fire / Evacuation Assistance", desc: "Urgent evacuation guidance or smoke alert" },
  { id: "Stranded / Need Transport", icon: "car", label: "Stranded / Need Transport", desc: "Disabled vehicle, flood road cut-off" },
  { id: "Elderly or Child Assistance", icon: "users", label: "Elderly or Child Assistance", desc: "Vulnerable individuals needing physical aid" },
  { id: "Lost / Disoriented", icon: "compass", label: "Lost / Disoriented", desc: "Unfamiliar territory, separated in crowd" },
  { id: "Flood / Water Emergency", icon: "droplets", label: "Flood / Water Emergency", desc: "Rising water, basement trapping" },
  { id: "Electricity Hazard", icon: "zap", label: "Electricity Hazard", desc: "Fallen wire, spark, water near panel" },
  { id: "Other", icon: "help", label: "Other Community Need", desc: "General urgent neighborhood safety requirement" }
];

export function renderEmergencyHelp(container) {
  if (!auth.isAuthenticated()) {
    renderAuthGate(container, "Emergency Help Coordinator", "#/emergency-help");
    return;
  }

  let flowStep = "initial"; // "initial" | "step1_category" | "step2_location" | "step3_confirm" | "active_request"
  let selectedCategory = "Medical Assistance";
  let descriptionText = "";
  let locationMode = "current"; // "current" | "manual"
  let manualLocationText = "";
  let acquiredLocation = null;
  let isRequestingLoc = false;
  let locError = null;

  // Check if user already has an active request
  const activeReq = auth.getUserActiveRequest();
  if (activeReq) {
    flowStep = "active_request";
  }

  function render() {
    container.innerHTML = `
      <div class="content-container emergency-help-container">
        <!-- Safety Alert Header (MANDATORY RULE 55) -->
        <div class="safety-first-banner" role="alert">
          <div class="sfb-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="sfb-content">
            <span class="sfb-heading">OFFICIAL EMERGENCY NOTICE</span>
            <p class="sfb-text">
              For immediate danger, life-threatening injuries, active fire, or serious crime, <strong>contact official emergency services first</strong>. SafeSphere is a community mutual-aid coordinator and must NEVER replace professional police, medical, or fire rescue services.
            </p>
          </div>
          <a href="tel:112" class="btn btn-emergency btn-sm sfb-direct-call" title="Emergency Direct Dial">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>Dial 112</span>
          </a>
        </div>

        <!-- Official Service Numbers Grid (Rule 56) -->
        <div class="emergency-quick-dial-card">
          <div class="dial-card-header">
            <h3 class="dial-title">Direct Official Emergency Helplines (India)</h3>
            <span class="dial-caption">Toll-free 24/7 telephonic services • Tap to call immediately</span>
          </div>
          <div class="helpline-buttons-grid">
            <a href="tel:112" class="hotline-btn hotline-national" title="Call National Emergency 112">
              <span class="hotline-num">112</span>
              <span class="hotline-lbl">All Emergencies</span>
              <span class="hotline-sub">Police, Fire & Medical</span>
            </a>
            <a href="tel:108" class="hotline-btn hotline-ambulance" title="Call Ambulance 108">
              <span class="hotline-num">108</span>
              <span class="hotline-lbl">Ambulance</span>
              <span class="hotline-sub">Medical Emergency & Trauma</span>
            </a>
            <a href="tel:100" class="hotline-btn hotline-police" title="Call Police 100">
              <span class="hotline-num">100</span>
              <span class="hotline-lbl">Police Control</span>
              <span class="hotline-sub">Security & Urgent Patrol</span>
            </a>
            <a href="tel:101" class="hotline-btn hotline-fire" title="Call Fire & Rescue 101">
              <span class="hotline-num">101</span>
              <span class="hotline-lbl">Fire & Rescue</span>
              <span class="hotline-sub">Fire Hazard & Entrapment</span>
            </a>
          </div>
          <p class="helpline-disclaimer-note">Emergency service availability can vary by state and telecom network. Always verify local regional protocols.</p>
        </div>

        <!-- Main Flow Container -->
        <div class="emergency-main-flow-card">
          ${renderCurrentFlowStep()}
        </div>

        <!-- Secondary Link to Community Dashboard -->
        <div class="community-dashboard-banner">
          <div class="cdb-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <div>
              <strong>Are you able to assist others?</strong>
              <span>Review verified nearby community emergency requests in your area.</span>
            </div>
          </div>
          <a href="#/community-help" class="btn btn-secondary btn-sm">
            <span>View Community Dashboard</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>
      </div>
    `;

    bindEvents();
  }

  function renderCurrentFlowStep() {
    // 1. Initial State (Section 50)
    if (flowStep === "initial") {
      return `
        <div class="emergency-hero-step">
          <div class="eh-emblem">
            <svg width="52" height="52" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 3L5 7.5V15C5 22.2 9.7 28.1 16 30C22.3 28.1 27 22.2 27 15V7.5L16 3Z" fill="url(#eh-grad)" stroke="#DC2626" stroke-width="1.5"/>
              <path d="M16 10V20M11 15H21" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round"/>
              <defs>
                <linearGradient id="eh-grad" x1="16" y1="3" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#FEF2F2"/>
                  <stop offset="100%" stop-color="#FEE2E2"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 class="eh-title">Need Emergency Help?</h1>
          <p class="eh-lead">
            If you are in immediate danger, contact the appropriate emergency service first. SafeSphere can help you share a request for nearby community assistance.
          </p>

          <div class="eh-actions-stack">
            <button type="button" id="btn-start-community-help" class="btn btn-primary btn-xl eh-primary-action">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>Request Community Help</span>
            </button>

            <div class="eh-secondary-row">
              <a href="tel:112" class="btn btn-emergency">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>Call Emergency Services (112)</span>
              </a>
              <a href="#/home" class="btn btn-outline">Cancel</a>
            </div>
          </div>
        </div>
      `;
    }

    // 2. Step 1: Category Selection
    if (flowStep === "step1_category") {
      return `
        <div class="flow-step-container">
          <div class="flow-breadcrumb">
            <span class="fb-item active">1. Assistance Type</span>
            <span class="fb-sep">→</span>
            <span class="fb-item">2. Location</span>
            <span class="fb-sep">→</span>
            <span class="fb-item">3. Confirm</span>
          </div>

          <h2 class="flow-heading">What kind of help do you need?</h2>
          <p class="flow-sub">Select the primary category to alert responders with appropriate gear and proximity.</p>

          <div class="categories-selector-grid">
            ${HELP_CATEGORIES.map(cat => `
              <button type="button" class="cat-select-card ${selectedCategory === cat.id ? 'selected' : ''}" data-cat="${cat.id}">
                <div class="csc-icon">${getCatSvg(cat.icon)}</div>
                <div class="csc-text">
                  <h4 class="csc-title">${cat.label}</h4>
                  <span class="csc-desc">${cat.desc}</span>
                </div>
                <span class="csc-radio-dot"></span>
              </button>
            `).join("")}
          </div>

          <div class="form-group flow-desc-box">
            <label for="help-desc-input" class="form-label">Brief Description (Optional)</label>
            <textarea id="help-desc-input" class="form-control" rows="2" placeholder="e.g. 2 adults stranded on 2nd floor, stairwell blocked by debris.">${descriptionText}</textarea>
          </div>

          <div class="flow-actions-bar">
            <button type="button" id="btn-flow-cancel" class="btn btn-outline">Cancel</button>
            <button type="button" id="btn-goto-step2" class="btn btn-primary">
              <span>Continue to Location</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </div>
      `;
    }

    // 3. Step 2: Location Selection (Rule 48 & 49)
    if (flowStep === "step2_location") {
      return `
        <div class="flow-step-container">
          <div class="flow-breadcrumb">
            <span class="fb-item done">1. ${selectedCategory}</span>
            <span class="fb-sep">→</span>
            <span class="fb-item active">2. Location</span>
            <span class="fb-sep">→</span>
            <span class="fb-item">3. Confirm</span>
          </div>

          <h2 class="flow-heading">Where are you?</h2>
          <p class="flow-sub">
            Your location is used <strong>only to help nearby responders understand where assistance may be needed</strong>. We protect your privacy by showing only approximate neighborhood areas.
          </p>

          <div class="location-choice-tabs">
            <button type="button" class="loc-tab ${locationMode === 'current' ? 'active' : ''}" data-mode="current">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="12 8 8 12 12 16 12 8"/></svg>
              <span>Use My Current Location</span>
            </button>
            <button type="button" class="loc-tab ${locationMode === 'manual' ? 'active' : ''}" data-mode="manual">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Enter Location Manually</span>
            </button>
          </div>

          ${locationMode === 'current' ? `
            <div class="loc-current-flow-box">
              <div class="loc-explanation-banner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Exact coordinates will NOT be published publicly. Community feeds only see an approximate radius (e.g. ~1 km).</span>
              </div>

              ${acquiredLocation ? `
                <div class="loc-acquired-card">
                  <div class="lac-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div class="lac-details">
                    <span class="lac-title">Approximate Location Ready:</span>
                    <strong class="lac-area">${acquiredLocation.approxArea}</strong>
                    <span class="lac-meta">Coordinates: ${acquiredLocation.latitude}°N, ${acquiredLocation.longitude}°E</span>
                  </div>
                  <button type="button" id="btn-refresh-loc" class="btn btn-outline btn-sm">Refresh</button>
                </div>
              ` : `
                <div class="loc-trigger-area">
                  <button type="button" id="btn-request-geo" class="btn btn-secondary btn-lg" ${isRequestingLoc ? 'disabled' : ''}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>
                    <span>${isRequestingLoc ? "Requesting Browser Permission..." : "Click to Obtain Location"}</span>
                  </button>
                  ${locError ? `<p class="loc-error-msg">${locError}</p>` : ""}
                </div>
              `}
            </div>
          ` : `
            <div class="loc-manual-flow-box">
              <div class="form-group">
                <label for="manual-loc-input" class="form-label">Neighborhood, Colony, Landmark or City <span class="required">*</span></label>
                <input type="text" id="manual-loc-input" class="form-control" placeholder="e.g. Near Community Hall, Jubilee Hills, Hyderabad" value="${manualLocationText}" required />
                <p class="form-hint">Provide a recognizable local landmark or intersection for responders.</p>
              </div>
            </div>
          `}

          <div class="flow-actions-bar">
            <button type="button" id="btn-back-to-step1" class="btn btn-outline">Back</button>
            <button type="button" id="btn-goto-step3" class="btn btn-primary" ${!canProceedStep3() ? 'disabled' : ''}>
              <span>Review & Confirm</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </div>
      `;
    }

    // 4. Step 3: Confirmation Dialog
    if (flowStep === "step3_confirm") {
      const locDisplay = locationMode === "current" && acquiredLocation
        ? acquiredLocation.approxArea
        : (manualLocationText || "General local area");

      return `
        <div class="flow-step-container">
          <div class="flow-breadcrumb">
            <span class="fb-item done">1. Assistance Type</span>
            <span class="fb-sep">→</span>
            <span class="fb-item done">2. Location</span>
            <span class="fb-sep">→</span>
            <span class="fb-item active">3. Confirm</span>
          </div>

          <div class="confirm-dialog-card">
            <div class="cdc-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h2 class="flow-heading">Share this help request with nearby community members?</h2>
            <p class="flow-sub">
              Your request will be broadcast to verified SafeSphere responders in your area.
            </p>

            <div class="request-summary-table">
              <div class="rst-row">
                <span class="rst-label">Help Category:</span>
                <strong class="rst-val">${selectedCategory}</strong>
              </div>
              <div class="rst-row">
                <span class="rst-label">Approximate Area:</span>
                <span class="rst-val">${locDisplay}</span>
              </div>
              ${descriptionText ? `
                <div class="rst-row">
                  <span class="rst-label">Situation Details:</span>
                  <span class="rst-val">${descriptionText}</span>
                </div>
              ` : ""}
              <div class="rst-row">
                <span class="rst-label">Privacy Shield:</span>
                <span class="rst-val text-success">Exact coordinates protected; ~1km radius visible</span>
              </div>
            </div>

            <div class="confirm-actions-row">
              <button type="button" id="btn-submit-request" class="btn btn-primary btn-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Share Request</span>
              </button>
              <button type="button" id="btn-cancel-confirm" class="btn btn-outline btn-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // 5. Active Request Screen (Section 52 & 66)
    if (flowStep === "active_request") {
      const active = auth.getUserActiveRequest() || {
        id: "REQ-0001",
        category: selectedCategory,
        approx_location: manualLocationText || "Local Community",
        created_at: new Date().toISOString(),
        status: "Active",
        responders: []
      };

      const hasResponder = active.status === "Help Offered" || (active.responders && active.responders.length > 0);

      return `
        <div class="active-request-view">
          <div class="arv-header">
            <div class="arv-badge-row">
              <span class="req-status-pill ${active.status === 'Help Offered' ? 'status-offered' : 'status-active'}">
                <span class="pulse-dot"></span>
                ${active.status === 'Help Offered' ? 'Help Offered by Responder' : 'Help Request Active'}
              </span>
              <span class="req-id-badge">ID: ${active.id}</span>
            </div>
            <h2 class="arv-title">Your request has been shared.</h2>
            <p class="arv-sub">
              SafeSphere has broadcast your need for <strong>${active.category}</strong> to verified community members in your vicinity.
            </p>
          </div>

          ${hasResponder ? `
            <div class="responder-alert-box" role="alert">
              <div class="rab-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div class="rab-text">
                <h4 class="rab-title">Someone nearby has offered to help!</h4>
                <p class="rab-desc">A community responder acknowledged your request and is coordinating assistance.</p>
                <div class="rab-responders">
                  ${active.responders.map(r => `
                    <span class="responder-tag">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      ${r.name} (${r.time})
                    </span>
                  `).join("")}
                </div>
              </div>
            </div>
          ` : `
            <div class="waiting-responder-box">
              <div class="wrb-pulse"></div>
              <span>Broadcasting to local community members. Keep your phone accessible...</span>
            </div>
          `}

          <div class="request-details-card">
            <div class="rd-row">
              <span class="rd-lbl">Help Category</span>
              <strong class="rd-val">${active.category}</strong>
            </div>
            <div class="rd-row">
              <span class="rd-lbl">Approximate Location</span>
              <span class="rd-val">${active.approx_location}</span>
            </div>
            <div class="rd-row">
              <span class="rd-lbl">Broadcast Time</span>
              <span class="rd-val">${new Date(active.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="rd-row">
              <span class="rd-lbl">Location Privacy Status</span>
              <span class="rd-val text-success">Active voluntary sharing (Approximate area)</span>
            </div>
          </div>

          <div class="active-request-actions">
            <button type="button" id="btn-mark-resolved" class="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Mark Resolved</span>
            </button>
            <button type="button" id="btn-cancel-request" class="btn btn-outline text-emergency">
              <span>Cancel Request</span>
            </button>
            <a href="tel:112" class="btn btn-emergency">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>Direct Emergency (112)</span>
            </a>
          </div>
        </div>
      `;
    }

    return "";
  }

  function canProceedStep3() {
    if (locationMode === "current") {
      return Boolean(acquiredLocation);
    }
    return Boolean(manualLocationText && manualLocationText.trim().length >= 3);
  }

  function bindEvents() {
    // Start Community Help flow
    const startBtn = container.querySelector("#btn-start-community-help");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        flowStep = "step1_category";
        render();
      });
    }

    // Category card clicks
    container.querySelectorAll(".cat-select-card").forEach(card => {
      card.addEventListener("click", () => {
        selectedCategory = card.getAttribute("data-cat");
        render();
      });
    });

    // Description input
    const descInput = container.querySelector("#help-desc-input");
    if (descInput) {
      descInput.addEventListener("input", (e) => {
        descriptionText = e.target.value;
      });
    }

    // Cancel flow
    const cancelFlowBtn = container.querySelector("#btn-flow-cancel");
    if (cancelFlowBtn) {
      cancelFlowBtn.addEventListener("click", () => {
        flowStep = "initial";
        render();
      });
    }

    // Goto Step 2
    const gotoStep2Btn = container.querySelector("#btn-goto-step2");
    if (gotoStep2Btn) {
      gotoStep2Btn.addEventListener("click", () => {
        flowStep = "step2_location";
        render();
      });
    }

    // Back to Step 1
    const backToStep1Btn = container.querySelector("#btn-back-to-step1");
    if (backToStep1Btn) {
      backToStep1Btn.addEventListener("click", () => {
        flowStep = "step1_category";
        render();
      });
    }

    // Location Mode Tabs
    container.querySelectorAll(".loc-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        locationMode = tab.getAttribute("data-mode");
        render();
      });
    });

    // Geolocation Request Button
    const reqGeoBtn = container.querySelector("#btn-request-geo");
    const refreshLocBtn = container.querySelector("#btn-refresh-loc");
    const handleLocRequest = async () => {
      isRequestingLoc = true;
      locError = null;
      render();

      const result = await requestVoluntaryLocation();
      isRequestingLoc = false;

      if (result.state === LOCATION_STATES.AVAILABLE) {
        acquiredLocation = result.data;
        showToast("Location acquired: " + result.data.approxArea, "success");
      } else {
        locError = result.error || "Permission denied or location unavailable. Please enter manually.";
        showToast("Location permission issue. You can enter manually.", "info");
      }
      render();
    };

    if (reqGeoBtn) reqGeoBtn.addEventListener("click", handleLocRequest);
    if (refreshLocBtn) refreshLocBtn.addEventListener("click", handleLocRequest);

    // Manual Location Input
    const manualLocInput = container.querySelector("#manual-loc-input");
    if (manualLocInput) {
      manualLocInput.addEventListener("input", (e) => {
        manualLocationText = e.target.value;
        const gotoStep3 = container.querySelector("#btn-goto-step3");
        if (gotoStep3) {
          gotoStep3.disabled = !canProceedStep3();
        }
      });
    }

    // Goto Step 3
    const gotoStep3Btn = container.querySelector("#btn-goto-step3");
    if (gotoStep3Btn) {
      gotoStep3Btn.addEventListener("click", () => {
        flowStep = "step3_confirm";
        render();
      });
    }

    // Cancel Confirm
    const cancelConfirmBtn = container.querySelector("#btn-cancel-confirm");
    if (cancelConfirmBtn) {
      cancelConfirmBtn.addEventListener("click", () => {
        flowStep = "step2_location";
        render();
      });
    }

    // Submit Request (Broadcast to Community)
    const submitReqBtn = container.querySelector("#btn-submit-request");
    if (submitReqBtn) {
      submitReqBtn.addEventListener("click", () => {
        const approxLoc = locationMode === "current" && acquiredLocation
          ? acquiredLocation.approxArea
          : manualLocationText;

        const newReq = auth.createEmergencyRequest({
          category: selectedCategory,
          description: descriptionText,
          approxLocation: approxLoc,
          latitude: acquiredLocation?.latitude,
          longitude: acquiredLocation?.longitude
        });

        showToast("Emergency request shared with nearby community members.", "success");
        flowStep = "active_request";
        render();
      });
    }

    // Mark Resolved
    const resolveBtn = container.querySelector("#btn-mark-resolved");
    if (resolveBtn) {
      resolveBtn.addEventListener("click", () => {
        const active = auth.getUserActiveRequest();
        if (active) {
          auth.resolveEmergencyRequest(active.id);
        }
        stopSharingLocation();
        showToast("Request marked as resolved. Glad you are safe!", "success");
        flowStep = "initial";
        render();
      });
    }

    // Cancel Request
    const cancelReqBtn = container.querySelector("#btn-cancel-request");
    if (cancelReqBtn) {
      cancelReqBtn.addEventListener("click", () => {
        const active = auth.getUserActiveRequest();
        if (active) {
          auth.cancelEmergencyRequest(active.id);
        }
        stopSharingLocation();
        showToast("Request cancelled.", "info");
        flowStep = "initial";
        render();
      });
    }
  }

  render();
}

function getCatSvg(iconType) {
  switch (iconType) {
    case "cross":
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>`;
    case "flame":
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
    case "car":
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`;
    case "users":
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    case "compass":
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;
    case "droplets":
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
    case "zap":
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
    default:
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  }
}
