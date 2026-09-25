/**
 * SafeSphere Community Help Dashboard (#/community-help)
 * Displays nearby assistance requests with privacy-first approximate areas.
 * Implements Sections 53, 54, 55, 69.
 */

import { auth } from "../utils/auth.js";
import { renderAuthGate } from "../components/authGate.js";
import { showToast } from "../components/toast.js";

export function renderCommunityHelp(container) {
  if (!auth.isAuthenticated()) {
    renderAuthGate(container, "Community Help Dashboard", "#/community-help");
    return;
  }

  let filterCategory = "all";
  let activeModalRequestId = null;
  let activeDetailRequestId = null;

  function render() {
    const allRequests = auth.getEmergencyRequests();
    const currentUser = auth.getUser();

    // Filter requests
    const visibleRequests = allRequests.filter(req => {
      if (req.status === "Cancelled" || req.status === "Resolved") return false;
      if (filterCategory !== "all" && req.category !== filterCategory) return false;
      return true;
    });

    container.innerHTML = `
      <div class="content-container community-help-container">
        <!-- Safety Disclaimer Banner (Rule 55) -->
        <div class="safety-first-banner community-rule-banner" role="alert">
          <div class="sfb-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="sfb-content">
            <span class="sfb-heading">RESPONDER SAFETY FIRST</span>
            <p class="sfb-text">
              <strong>Only help if it is safe for you to do so.</strong> Do not enter hazardous structures, deep flood waters, or confront electrical fires. Community aid is supplemental — always advise requesters to alert official services (112) for life hazards.
            </p>
          </div>
        </div>

        <!-- Dashboard Header -->
        <div class="community-header-row">
          <div>
            <div class="comm-badge">VERIFIED LOCAL MUTUAL AID</div>
            <h1 class="page-title">Community Emergency Assistance</h1>
            <p class="page-lead">
              Nearby community members seeking non-professional assistance, temporary shelter guidance, evacuation support, or first aid.
            </p>
          </div>
          <div class="comm-header-actions">
            <a href="#/emergency-help" class="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Need Help Yourself?</span>
            </a>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="community-filters-bar">
          <div class="comm-filter-chips">
            <button class="comm-chip ${filterCategory === 'all' ? 'active' : ''}" data-cat="all">All Requests (${visibleRequests.length})</button>
            <button class="comm-chip ${filterCategory === 'Medical Assistance' ? 'active' : ''}" data-cat="Medical Assistance">Medical</button>
            <button class="comm-chip ${filterCategory === 'Fire/Evacuation Assistance' ? 'active' : ''}" data-cat="Fire/Evacuation Assistance">Evacuation</button>
            <button class="comm-chip ${filterCategory === 'Stranded / Need Transport' ? 'active' : ''}" data-cat="Stranded / Need Transport">Stranded</button>
            <button class="comm-chip ${filterCategory === 'Electricity Hazard' ? 'active' : ''}" data-cat="Electricity Hazard">Hazards</button>
          </div>
          <div class="privacy-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>Approximate areas shown (~1km) to protect requester privacy</span>
          </div>
        </div>

        <!-- Requests Grid -->
        <div class="community-requests-grid">
          ${visibleRequests.length === 0 ? `
            <div class="empty-requests-card">
              <div class="erc-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0F766E" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3>No Active Requests in this Category</h3>
              <p>Your local neighborhood is currently quiet. Stay prepared and review the SafeSphere guides.</p>
            </div>
          ` : visibleRequests.map(req => {
            const isUserOwn = req.user_id === currentUser.id;
            const isHelpOffered = req.status === "Help Offered";

            return `
              <div class="comm-req-card ${isHelpOffered ? 'req-offered' : ''}" data-id="${req.id}">
                <div class="crc-top">
                  <span class="crc-category-badge cat-${slugify(req.category)}">
                    ${req.category}
                  </span>
                  <span class="crc-status ${isHelpOffered ? 'status-offered' : 'status-active'}">
                    ${isHelpOffered ? '● Help Offered' : '● Active Request'}
                  </span>
                </div>

                <div class="crc-body">
                  <div class="crc-distance-row">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span class="crc-loc">${req.approx_location}</span>
                  </div>
                  <p class="crc-description">${req.description}</p>
                </div>

                <div class="crc-meta">
                  <span class="crc-time">Posted ${formatTimeAgo(req.created_at)}</span>
                  <span class="crc-id">ID: ${req.id}</span>
                </div>

                <div class="crc-actions">
                  ${isUserOwn ? `
                    <span class="own-req-badge">Your Active Request</span>
                    <a href="#/emergency-help" class="btn btn-outline btn-sm">Manage</a>
                  ` : isHelpOffered ? `
                    <button class="btn btn-secondary btn-sm btn-details" data-id="${req.id}">
                      View Details
                    </button>
                    <span class="helper-acknowledged-text">Volunteer Assigned</span>
                  ` : `
                    <button class="btn btn-primary btn-sm btn-can-help" data-id="${req.id}">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>I Can Help</span>
                    </button>
                    <button class="btn btn-outline btn-sm btn-details" data-id="${req.id}">
                      Details
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- Responder Confirmation Dialog (Rule 54) -->
      <div id="responder-modal" class="modal-backdrop" ${activeModalRequestId ? '' : 'hidden'}>
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">Confirm Community Assistance</h3>
            <button id="close-resp-modal" class="btn-icon" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="modal-safety-warning">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B45309" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div>
                <strong>Are you able to safely assist this person?</strong>
                <p>Only help if it is safe for you to do so. Never risk your life or enter unsafe disaster zones.</p>
              </div>
            </div>
            <p class="modal-resp-note">
              Clicking <strong>"Yes, I Can Help"</strong> will notify the requester that a nearby community member has acknowledged their situation.
            </p>
          </div>
          <div class="modal-actions">
            <button type="button" id="btn-cancel-help" class="btn btn-outline">Cancel</button>
            <button type="button" id="btn-confirm-help" class="btn btn-primary">Yes, I Can Help</button>
          </div>
        </div>
      </div>

      <!-- Details Modal -->
      <div id="details-modal" class="modal-backdrop" ${activeDetailRequestId ? '' : 'hidden'}>
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">Assistance Request Details</h3>
            <button id="close-details-modal" class="btn-icon" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body" id="details-modal-body">
            ${renderDetailsModalBody(activeDetailRequestId)}
          </div>
          <div class="modal-actions">
            <button type="button" id="btn-close-details" class="btn btn-primary">Close</button>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function renderDetailsModalBody(reqId) {
    if (!reqId) return "";
    const req = auth.getEmergencyRequests().find(r => r.id === reqId);
    if (!req) return "<p>Request not found.</p>";

    return `
      <div class="request-summary-table">
        <div class="rst-row">
          <span class="rst-label">Request ID:</span>
          <strong class="rst-val">${req.id}</strong>
        </div>
        <div class="rst-row">
          <span class="rst-label">Category:</span>
          <strong class="rst-val">${req.category}</strong>
        </div>
        <div class="rst-row">
          <span class="rst-label">Approximate Area:</span>
          <span class="rst-val">${req.approx_location}</span>
        </div>
        <div class="rst-row">
          <span class="rst-label">Details:</span>
          <span class="rst-val">${req.description}</span>
        </div>
        <div class="rst-row">
          <span class="rst-label">Current Status:</span>
          <span class="rst-val">${req.status}</span>
        </div>
      </div>
      <div class="callout-box info-callout">
        <strong>Safety Advisory:</strong> If this situation requires urgent medical attention, ensure official services (108/112) have been contacted.
      </div>
    `;
  }

  function bindEvents() {
    // Filter chips
    container.querySelectorAll(".comm-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        filterCategory = chip.getAttribute("data-cat");
        render();
      });
    });

    // "I Can Help" buttons
    container.querySelectorAll(".btn-can-help").forEach(btn => {
      btn.addEventListener("click", () => {
        activeModalRequestId = btn.getAttribute("data-id");
        render();
      });
    });

    // Details buttons
    container.querySelectorAll(".btn-details").forEach(btn => {
      btn.addEventListener("click", () => {
        activeDetailRequestId = btn.getAttribute("data-id");
        render();
      });
    });

    // Close details modal
    const closeDetailsBtn = container.querySelector("#close-details-modal");
    const closeDetailsBtn2 = container.querySelector("#btn-close-details");
    if (closeDetailsBtn) closeDetailsBtn.addEventListener("click", () => { activeDetailRequestId = null; render(); });
    if (closeDetailsBtn2) closeDetailsBtn2.addEventListener("click", () => { activeDetailRequestId = null; render(); });

    // Responder modal actions
    const closeRespModal = container.querySelector("#close-resp-modal");
    const cancelHelp = container.querySelector("#btn-cancel-help");
    const confirmHelp = container.querySelector("#btn-confirm-help");

    if (closeRespModal) closeRespModal.addEventListener("click", () => { activeModalRequestId = null; render(); });
    if (cancelHelp) cancelHelp.addEventListener("click", () => { activeModalRequestId = null; render(); });

    if (confirmHelp) {
      confirmHelp.addEventListener("click", () => {
        if (activeModalRequestId) {
          const user = auth.getUser();
          auth.offerHelp(activeModalRequestId, user.full_name);
          showToast("Thank you! Your willingness to assist has been recorded.", "success");
          activeModalRequestId = null;
          render();
        }
      });
    }
  }

  render();
}

function slugify(text) {
  return (text || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function formatTimeAgo(isoString) {
  if (!isoString) return "Recently";
  const diffMinutes = Math.round((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes === 1) return "1 minute ago";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  const diffHours = Math.round(diffMinutes / 60);
  return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
}
