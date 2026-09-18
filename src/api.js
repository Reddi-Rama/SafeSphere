/**
 * SafeSphere API Client
 * Connects to FastAPI backend with full resilient offline/localStorage fallback
 */

import { GUIDES, EMERGENCY_CONTACTS_DATA, DEMO_ANALYTICS } from "./data.js";
import { storage } from "./utils/storage.js";
import { showToast } from "./components/toast.js";

// Target FastAPI backend URL when running alongside frontend
const API_BASE = "http://127.0.0.1:8000/api";
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
  }
};
