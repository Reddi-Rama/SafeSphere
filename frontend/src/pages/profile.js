/**
 * SafeSphere User Profile Page (#/profile)
 * Displays user identity, emergency contacts, location permission status,
 * personal contacts management and profile editing.
 */

import { auth } from "../utils/auth.js";
import { renderAuthGate } from "../components/authGate.js";
import { showToast } from "../components/toast.js";
import { requestVoluntaryLocation, stopSharingLocation, getCurrentLocationState, LOCATION_STATE_LABELS, LOCATION_STATES } from "../utils/location.js";

export function renderProfile(container) {
  if (!auth.isAuthenticated()) {
    renderAuthGate(container, "User Profile & Personal Safety Contacts", "#/profile");
    return;
  }

  let isEditing = false;
  let user = auth.getUser();
  let personalContacts = auth.getPersonalContacts();
  let locState = getCurrentLocationState();

  function render() {
    container.innerHTML = `
      <div class="content-container profile-container">
        <!-- Profile Header -->
        <div class="profile-header-card">
          <div class="profile-avatar-large">
            <span>${getInitials(user.full_name)}</span>
          </div>
          <div class="profile-header-meta">
            <div class="profile-name-row">
              <h1 class="profile-user-name">${user.full_name}</h1>
              ${user.is_demo ? `
                <span class="profile-badge demo-badge">Demo Account</span>
              ` : `
                <span class="profile-badge verified-badge">Verified Member</span>
              `}
            </div>
            <p class="profile-email">${user.email}</p>
            <div class="profile-quick-stats">
              <span class="p-stat"><strong>Language:</strong> ${formatLanguage(user.preferred_language)}</span>
              <span class="p-stat"><strong>Registered:</strong> Safety Member</span>
            </div>
          </div>
          <div class="profile-header-actions">
            <button id="btn-edit-toggle" class="btn btn-secondary btn-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span>${isEditing ? "Cancel Edit" : "Edit Profile"}</span>
            </button>
            <button id="btn-logout" class="btn btn-outline btn-sm btn-logout">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Log Out</span>
            </button>
          </div>
        </div>

        <!-- Main Content Columns -->
        <div class="profile-grid">
          <!-- Column 1: Profile Information or Edit Form -->
          <div class="profile-card profile-details-card">
            <div class="card-section-head">
              <div class="csh-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <h2 class="card-sec-title">Preparedness Profile</h2>
                <p class="card-sec-sub">Essential details for emergency notification & coordination</p>
              </div>
            </div>

            ${isEditing ? renderEditForm() : renderStaticDetails()}
          </div>

          <!-- Column 2: Location Privacy & Permission Status -->
          <div class="profile-card profile-location-card">
            <div class="card-section-head">
              <div class="csh-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <h2 class="card-sec-title">Location Privacy Status</h2>
                <p class="card-sec-sub">Voluntary, on-demand geolocation controls</p>
              </div>
            </div>

            <div class="location-status-box">
              <div class="loc-indicator-row">
                <span class="status-indicator-dot ${getLocIndicatorClass(locState)}"></span>
                <strong>Status:</strong>
                <span class="loc-status-text">${LOCATION_STATE_LABELS[locState] || "Inactive"}</span>
              </div>
              <p class="loc-explanation-text">
                SafeSphere never tracks your location in the background. Location is only queried when you explicitly request community emergency assistance to help nearby volunteers reach you.
              </p>
              <div class="loc-actions-row">
                <button id="btn-test-location" class="btn btn-secondary btn-sm" type="button">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="12 8 8 12 12 16 12 8"/></svg>
                  <span>Test Location Permission</span>
                </button>
                ${locState === LOCATION_STATES.AVAILABLE || locState === LOCATION_STATES.SHARING_ACTIVE ? `
                  <button id="btn-stop-loc" class="btn btn-outline btn-sm text-emergency" type="button">
                    <span>Stop Sharing Location</span>
                  </button>
                ` : ""}
              </div>
            </div>
          </div>
        </div>

        <!-- Personal Emergency Contacts Section -->
        <div class="profile-card personal-contacts-section">
          <div class="card-section-head section-head-between">
            <div class="head-left-group">
              <div class="csh-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <h2 class="card-sec-title">Personal Emergency Contacts</h2>
                <p class="card-sec-sub">Private list of family members, doctors, and trusted neighbors</p>
              </div>
            </div>
            <button id="btn-add-contact-modal" class="btn btn-primary btn-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Add Personal Contact</span>
            </button>
          </div>

          <div class="personal-contacts-list">
            ${personalContacts.length === 0 ? `
              <div class="empty-contacts-note">
                <p>No personal emergency contacts added yet.</p>
                <span>Add trusted individuals who should be reached in an urgent evacuation or incident.</span>
              </div>
            ` : personalContacts.map(c => `
              <div class="profile-contact-row" data-id="${c.id}">
                <div class="pcr-info">
                  <div class="pcr-avatar">${getInitials(c.name)}</div>
                  <div>
                    <h4 class="pcr-name">${c.name}</h4>
                    <span class="pcr-rel">${c.relationship}</span>
                  </div>
                </div>
                <div class="pcr-phone">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <a href="tel:${c.phone.replace(/[^0-9+]/g, '')}">${c.phone}</a>
                </div>
                <div class="pcr-actions">
                  <a href="tel:${c.phone.replace(/[^0-9+]/g, '')}" class="btn btn-secondary btn-sm" title="Call contact">
                    Call
                  </a>
                  <button class="btn-icon btn-delete-contact" data-id="${c.id}" title="Delete contact">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- Add Contact Modal Container -->
      <div id="contact-modal-overlay" class="modal-backdrop" hidden>
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">Add Emergency Contact</h3>
            <button id="modal-close-btn" class="btn-icon" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form id="add-contact-form" class="modal-form">
            <div class="form-group">
              <label class="form-label">Contact Name <span class="required">*</span></label>
              <input type="text" id="mc-name" class="form-control" placeholder="e.g. Sumanth Rao" required />
            </div>
            <div class="form-group">
              <label class="form-label">Relationship <span class="required">*</span></label>
              <input type="text" id="mc-rel" class="form-control" placeholder="e.g. Spouse, Parent, Neighbor, Doctor" required />
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number <span class="required">*</span></label>
              <input type="tel" id="mc-phone" class="form-control" placeholder="+91 98765 12345" required />
            </div>
            <div class="modal-actions">
              <button type="button" id="modal-cancel-btn" class="btn btn-outline">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Contact</button>
            </div>
          </form>
        </div>
      </div>
    `;

    bindEvents();
  }

  function renderStaticDetails() {
    return `
      <div class="profile-info-grid">
        <div class="info-field">
          <span class="field-label">Full Name</span>
          <span class="field-val">${user.full_name || "—"}</span>
        </div>
        <div class="info-field">
          <span class="field-label">Email Address</span>
          <span class="field-val">${user.email || "—"}</span>
        </div>
        <div class="info-field">
          <span class="field-label">Primary Phone</span>
          <span class="field-val">${user.phone || "Not specified"}</span>
        </div>
        <div class="info-field">
          <span class="field-label">Preferred Interface Language</span>
          <span class="field-val">${formatLanguage(user.preferred_language)}</span>
        </div>
        <div class="info-field">
          <span class="field-label">Primary Emergency Contact</span>
          <span class="field-val">${user.emergency_contact_name || "Not specified"}</span>
        </div>
        <div class="info-field">
          <span class="field-label">Emergency Contact Phone</span>
          <span class="field-val">${user.emergency_contact_phone || "Not specified"}</span>
        </div>
      </div>
    `;
  }

  function renderEditForm() {
    return `
      <form id="edit-profile-form" class="profile-edit-form">
        <div class="form-group">
          <label class="form-label" for="ep-name">Full Name <span class="required">*</span></label>
          <input type="text" id="ep-name" class="form-control" value="${user.full_name}" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="ep-phone">Phone Number</label>
          <input type="tel" id="ep-phone" class="form-control" value="${user.phone || ''}" placeholder="+91 98765 43210" />
        </div>
        <div class="form-group">
          <label class="form-label" for="ep-lang">Preferred Language</label>
          <select id="ep-lang" class="form-control">
            <option value="en" ${user.preferred_language === 'en' ? 'selected' : ''}>English</option>
            <option value="te" ${user.preferred_language === 'te' ? 'selected' : ''}>తెలుగు (Telugu)</option>
            <option value="hi" ${user.preferred_language === 'hi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group form-col">
            <label class="form-label" for="ep-ec-name">Emergency Contact Name</label>
            <input type="text" id="ep-ec-name" class="form-control" value="${user.emergency_contact_name || ''}" placeholder="Contact name" />
          </div>
          <div class="form-group form-col">
            <label class="form-label" for="ep-ec-phone">Emergency Contact Phone</label>
            <input type="tel" id="ep-ec-phone" class="form-control" value="${user.emergency_contact_phone || ''}" placeholder="+91 98765 00000" />
          </div>
        </div>
        <div class="edit-actions-row">
          <button type="submit" class="btn btn-primary">Save Changes</button>
          <button type="button" id="btn-cancel-edit" class="btn btn-outline">Cancel</button>
        </div>
      </form>
    `;
  }

  function bindEvents() {
    // Edit toggle
    const editToggle = container.querySelector("#btn-edit-toggle");
    if (editToggle) {
      editToggle.addEventListener("click", () => {
        isEditing = !isEditing;
        render();
      });
    }

    const cancelEditBtn = container.querySelector("#btn-cancel-edit");
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener("click", () => {
        isEditing = false;
        render();
      });
    }

    // Save profile changes
    const editForm = container.querySelector("#edit-profile-form");
    if (editForm) {
      editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const full_name = container.querySelector("#ep-name").value.trim();
        const phone = container.querySelector("#ep-phone").value.trim();
        const preferred_language = container.querySelector("#ep-lang").value;
        const emergency_contact_name = container.querySelector("#ep-ec-name").value.trim();
        const emergency_contact_phone = container.querySelector("#ep-ec-phone").value.trim();

        try {
          user = await auth.updateProfile({
            full_name,
            phone,
            preferred_language,
            emergency_contact_name,
            emergency_contact_phone
          });
          isEditing = false;
          showToast("Profile updated successfully.", "success");
          render();
        } catch (err) {
          showToast("Failed to update profile: " + err.message, "error");
        }
      });
    }

    // Logout button
    const logoutBtn = container.querySelector("#btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await auth.logout();
        window.location.hash = "#/home";
      });
    }

    // Location testing
    const testLocBtn = container.querySelector("#btn-test-location");
    if (testLocBtn) {
      testLocBtn.addEventListener("click", async () => {
        testLocBtn.disabled = true;
        testLocBtn.innerHTML = `<span>Checking permission...</span>`;
        const result = await requestVoluntaryLocation();
        locState = result.state;
        if (result.state === LOCATION_STATES.AVAILABLE) {
          showToast("Location permission granted: " + result.data.approxArea, "success");
        } else {
          showToast(LOCATION_STATE_LABELS[result.state] || "Location unavailable", "info");
        }
        render();
      });
    }

    // Stop location sharing
    const stopLocBtn = container.querySelector("#btn-stop-loc");
    if (stopLocBtn) {
      stopLocBtn.addEventListener("click", () => {
        stopSharingLocation();
        locState = LOCATION_STATES.SHARING_STOPPED;
        showToast("Location sharing stopped.", "info");
        render();
      });
    }

    // Add Contact Modal
    const modalOverlay = container.querySelector("#contact-modal-overlay");
    const openModalBtn = container.querySelector("#btn-add-contact-modal");
    const closeModalBtn = container.querySelector("#modal-close-btn");
    const cancelModalBtn = container.querySelector("#modal-cancel-btn");
    const addContactForm = container.querySelector("#add-contact-form");

    function toggleModal(show) {
      if (show) {
        modalOverlay.removeAttribute("hidden");
        container.querySelector("#mc-name").focus();
      } else {
        modalOverlay.setAttribute("hidden", "true");
        addContactForm.reset();
      }
    }

    if (openModalBtn) openModalBtn.addEventListener("click", () => toggleModal(true));
    if (closeModalBtn) closeModalBtn.addEventListener("click", () => toggleModal(false));
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", () => toggleModal(false));

    if (addContactForm) {
      addContactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = container.querySelector("#mc-name").value;
        const relationship = container.querySelector("#mc-rel").value;
        const phone = container.querySelector("#mc-phone").value;

        auth.addPersonalContact({ name, relationship, phone });
        personalContacts = auth.getPersonalContacts();
        toggleModal(false);
        showToast("Personal contact added.", "success");
        render();
      });
    }

    // Delete contact buttons
    container.querySelectorAll(".btn-delete-contact").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (id) {
          auth.deletePersonalContact(id);
          personalContacts = auth.getPersonalContacts();
          showToast("Contact removed.", "info");
          render();
        }
      });
    });
  }

  render();
}

function getInitials(name) {
  if (!name) return "SP";
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatLanguage(code) {
  switch (code) {
    case "te": return "తెలుగు (Telugu)";
    case "hi": return "हिन्दी (Hindi)";
    default: return "English";
  }
}

function getLocIndicatorClass(state) {
  switch (state) {
    case LOCATION_STATES.AVAILABLE:
    case LOCATION_STATES.SHARING_ACTIVE:
      return "dot-green";
    case LOCATION_STATES.REQUESTING:
      return "dot-amber";
    case LOCATION_STATES.DENIED:
      return "dot-red";
    default:
      return "dot-gray";
  }
}
