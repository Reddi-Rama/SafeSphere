/**
 * SafeSphere API Client
 * Connects to FastAPI backend with full resilient offline/localStorage fallback
 */

import { GUIDES, EMERGENCY_CONTACTS_DATA, DEMO_ANALYTICS } from "./data.js";
import { storage } from "./utils/storage.js";
import { showToast } from "./components/toast.js";

// Target API base URL (relative /api seamlessly proxied to FastAPI backend)
const API_BASE = "/api";
const TIMEOUT_MS = 2500;

async function fetchWithTimeout(resource, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const api = {
  async checkHealth() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/health`);
      if (!res.ok) return false;
      const data = await res.json();
      return data.status === "ok";
    } catch {
      return false;
    }
  },

  async getGuides() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/guides`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // Backend not running; silent local fallback
    }
    return GUIDES;
  },

  async getContacts() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/contacts`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // Backend not running; silent local fallback
    }
    return EMERGENCY_CONTACTS_DATA;
  },

  async submitAssessment(payload) {
    // Always persist to localStorage first
    storage.set("latest_assessment", payload);
    const existingHistory = storage.get("assessment_history", []);
    existingHistory.unshift({
      ...payload,
      id: "local_" + Date.now(),
      created_at: new Date().toISOString()
    });
    storage.set("assessment_history", existingHistory.slice(0, 10));

    try {
      const res = await fetchWithTimeout(`${API_BASE}/assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        showToast("Assessment results saved and synced.", "success");
        return { success: true, synced: true, data: saved };
      }
    } catch {
      // Fallback
    }

    showToast("Saved locally. Sync will be available when the server is connected.", "info");
    return { success: true, synced: false, data: payload };
  },

  async submitSurvey(payload) {
    // Persist to local surveys
    const surveys = storage.get("local_surveys", []);
    surveys.unshift({
      ...payload,
      id: "survey_" + Date.now(),
      created_at: new Date().toISOString()
    });
    storage.set("local_surveys", surveys);

    try {
      const res = await fetchWithTimeout(`${API_BASE}/survey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        showToast("Survey response submitted and recorded. Thank you!", "success");
        return { success: true, synced: true, data: saved };
      }
    } catch {
      // Fallback
    }

    showToast("Saved locally. Sync will be available when the server is connected.", "info");
    return { success: true, synced: false, data: payload };
  },

  async getAnalytics() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/analytics`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      // Fallback to demo analytics
    }
    return DEMO_ANALYTICS;
  },

  // --- Emergency Assistance API ---
  async getEmergencyRequests() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/emergency-requests`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // Fallback to local storage
    }
    return storage.get("safesphere_emergency_requests", []);
  },

  async createEmergencyRequest(requestData) {
    const existing = storage.get("safesphere_emergency_requests", []);
    existing.unshift(requestData);
    storage.set("safesphere_emergency_requests", existing);

    try {
      const res = await fetchWithTimeout(`${API_BASE}/emergency-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback succeeded locally
    }
    return requestData;
  },

  async offerHelp(requestId, helperInfo) {
    const requests = storage.get("safesphere_emergency_requests", []);
    const reqIndex = requests.findIndex(r => r.id === requestId);
    if (reqIndex !== -1) {
      requests[reqIndex].status = "help_offered";
      if (!requests[reqIndex].responders) requests[reqIndex].responders = [];
      requests[reqIndex].responders.push(helperInfo);
      storage.set("safesphere_emergency_requests", requests);
    }

    try {
      await fetchWithTimeout(`${API_BASE}/emergency-requests/${requestId}/offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(helperInfo)
      });
    } catch {
      // Offline fallback
    }
    return true;
  },

  async updateEmergencyRequestStatus(requestId, newStatus) {
    const requests = storage.get("safesphere_emergency_requests", []);
    const reqIndex = requests.findIndex(r => r.id === requestId);
    if (reqIndex !== -1) {
      requests[reqIndex].status = newStatus;
      storage.set("safesphere_emergency_requests", requests);
    }
    try {
      await fetchWithTimeout(`${API_BASE}/emergency-requests/${requestId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    } catch {
      // Offline fallback
    }
    return true;
  },

  // --- Profile API ---
  async getProfile() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/profile`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return storage.get("safesphere_profile", null);
  },

  async updateProfile(profileData) {
    storage.set("safesphere_profile", profileData);
    try {
      const res = await fetchWithTimeout(`${API_BASE}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return profileData;
  },

  // --- Personal Emergency Contacts API ---
  async getPersonalContacts() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/personal-contacts`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // Fallback
    }
    return storage.get("safesphere_personal_contacts", []);
  },

  async createPersonalContact(contact) {
    const contacts = storage.get("safesphere_personal_contacts", []);
    const newContact = { ...contact, id: "pc_" + Date.now() };
    contacts.push(newContact);
    storage.set("safesphere_personal_contacts", contacts);

    try {
      const res = await fetchWithTimeout(`${API_BASE}/personal-contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return newContact;
  },

  async updatePersonalContact(id, updates) {
    const contacts = storage.get("safesphere_personal_contacts", []);
    const idx = contacts.findIndex(c => c.id === id);
    if (idx !== -1) {
      contacts[idx] = { ...contacts[idx], ...updates };
      storage.set("safesphere_personal_contacts", contacts);
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/personal-contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return idx !== -1 ? contacts[idx] : null;
  },

  async deletePersonalContact(id) {
    const contacts = storage.get("safesphere_personal_contacts", []);
    const filtered = contacts.filter(c => c.id !== id);
    storage.set("safesphere_personal_contacts", filtered);

    try {
      await fetchWithTimeout(`${API_BASE}/personal-contacts/${id}`, {
        method: "DELETE"
      });
    } catch {
      // Fallback
    }
    return true;
  }
};
