/**
 * SafeSphere Emergency Contacts Page
 * High-visibility national hotlines (112, 108, 101, 100, 1070)
 * with explicit location disclaimers and personal emergency contacts manager.
 */

import { EMERGENCY_CONTACTS_DATA } from "../data.js";
import { storage } from "../utils/storage.js";
import { showToast } from "../components/toast.js";

export function renderContacts(mainElement) {
  let personalContacts = storage.get("personal_contacts", [
    { name: "Primary Household Contact", relation: "Spouse / Partner", phone: "" },
    { name: "Out-of-Area Check-In", relation: "Relative (distant city)", phone: "" }
  ]);

  mainElement.className = "page page-contacts";
  mainElement.innerHTML = `
    <div class="content-container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-pre">Immediate Response Directory</div>
        <h1 class="page-title">Emergency Response Helplines</h1>
        <p class="page-lead">
          Verified national emergency numbers across India. Dial directly from this device in life-safety situations.
          Emergency dispatchers operate 24 hours a day, 7 days a week, 365 days a year.
        </p>
      </header>

      <!-- Crucial Platform Disclaimers Banner -->
      <div class="contacts-alert-banner" role="alert">
        <div class="banner-icon-col">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="banner-text-col">
          <strong>Important Verification & Scope Notice:</strong>
          <p>
            Emergency numbers can vary by location and service. Verify locally when possible.
            <strong>SafeSphere is an educational preparedness platform and is not an emergency service.</strong>
            If you are witnessing a crime in progress, active structure fire, or severe acute trauma, immediately dial <strong>112</strong> or <strong>108</strong>.
          </p>
        </div>
      </div>

      <!-- Prime Hero Dial 112 Card -->
      <div class="primary-hotline-card">
        <div class="primary-hotline-left">
          <span class="hotline-badge-top">NATIONAL UNIFIED HELPLINE</span>
          <div class="primary-digits-row">
            <span class="big-digits">112</span>
            <div class="hotline-desc-block">
              <h3>All-in-One Emergency Response</h3>
              <p>Police • Fire Brigade • Ambulance • Disaster Relief</p>
            </div>
          </div>
          <p class="primary-hotline-sub">
            Single emergency response number equivalent to 911 or 999. Can be dialed from mobile phones even with screen lock enabled or without a SIM card in GSM coverage.
          </p>
        </div>
        <div class="primary-hotline-right">
          <a href="tel:112" class="btn btn-emergency btn-xl" id="btn-call-112">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>Dial 112 Now</span>
          </a>
        </div>
      </div>

      <!-- Specialized Helplines Grid -->
      <section class="contacts-grid-section">
        <h2 class="section-title">Specialized Emergency Services</h2>
        <div class="contacts-grid">
          ${EMERGENCY_CONTACTS_DATA.filter(c => c.number !== "112").map(c => `
            <article class="contact-card">
              <div class="contact-card-top">
                <span class="contact-number">${c.number}</span>
                <span class="contact-badge badge-${c.badgeColor}">${c.badge}</span>
              </div>
              <h3 class="contact-title">${c.title}</h3>
              <p class="contact-desc">${c.description}</p>
              <div class="contact-card-footer">
                <a href="tel:${c.number}" class="btn-call-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span>${c.callText}</span>
                </a>
              </div>
            </article>
          `).join("")}
        </div>
      </section>

      <!-- Personal Household Emergency Contacts Section -->
      <section class="personal-contacts-section">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">Household Emergency Contacts</h2>
            <p class="section-subtitle">
              Store private emergency phone numbers for your family or neighborhood lead. Stored securely on your device.
            </p>
          </div>
          <button id="btn-add-contact" class="btn btn-outline btn-sm">
            + Add New Contact
          </button>
        </div>

        <div id="personal-contacts-list" class="personal-contacts-list">
          <!-- Rendered dynamically -->
        </div>
      </section>
    </div>
  `;

  const personalList = mainElement.querySelector("#personal-contacts-list");
  const addBtn = mainElement.querySelector("#btn-add-contact");

  function renderPersonalContacts() {
    personalList.innerHTML = personalContacts.map((contact, idx) => `
      <div class="personal-contact-card" data-index="${idx}">
        <div class="personal-contact-inputs">
          <div class="form-group">
            <label class="sr-only">Contact Name</label>
            <input type="text" class="form-input-clean p-name" placeholder="Contact Full Name" value="${escapeHtml(contact.name)}" />
          </div>
          <div class="form-group">
            <label class="sr-only">Relationship</label>
            <input type="text" class="form-input-clean p-relation" placeholder="Relationship (e.g. Neighbor, Sister)" value="${escapeHtml(contact.relation)}" />
          </div>
          <div class="form-group">
            <label class="sr-only">Phone Number</label>
            <input type="tel" class="form-input-clean p-phone" placeholder="Phone (e.g. +91 9876543210)" value="${escapeHtml(contact.phone)}" />
          </div>
        </div>
        <div class="personal-contact-actions">
          ${contact.phone ? `
            <a href="tel:${contact.phone}" class="btn btn-primary btn-sm btn-call-personal" title="Call this contact">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>Call</span>
            </a>
          ` : ''}
          <button type="button" class="btn-icon-del btn-delete-personal" data-index="${idx}" aria-label="Delete contact">&times;</button>
        </div>
      </div>
    `).join("");

    // Attach listeners to input fields to auto-save
    personalList.querySelectorAll(".personal-contact-card").forEach(card => {
      const idx = parseInt(card.getAttribute("data-index"), 10);
      const nameInput = card.querySelector(".p-name");
      const relInput = card.querySelector(".p-relation");
      const phoneInput = card.querySelector(".p-phone");

      const saveItem = () => {
        personalContacts[idx] = {
          name: nameInput.value.trim(),
          relation: relInput.value.trim(),
          phone: phoneInput.value.trim()
        };
        storage.set("personal_contacts", personalContacts);
      };

      nameInput.addEventListener("input", saveItem);
      relInput.addEventListener("input", saveItem);
      phoneInput.addEventListener("input", () => {
        saveItem();
      });
    });

    // Delete buttons
    personalList.querySelectorAll(".btn-delete-personal").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        personalContacts.splice(idx, 1);
        storage.set("personal_contacts", personalContacts);
        renderPersonalContacts();
        showToast("Contact removed", "info");
      });
    });
  }

  addBtn.addEventListener("click", () => {
    personalContacts.push({ name: "", relation: "", phone: "" });
    storage.set("personal_contacts", personalContacts);
    renderPersonalContacts();
    const lastInput = personalList.querySelector(".personal-contact-card:last-child .p-name");
    if (lastInput) lastInput.focus();
  });

  renderPersonalContacts();
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
