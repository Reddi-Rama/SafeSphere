/**
 * SafeSphere Authentication & Data Store
 * Supports Supabase Auth when credentials are provided, with an automatic
 * secure local demo mode (using Web Crypto SHA-256 hashing) for development & offline use.
 * Never stores plaintext passwords.
 */

import { storage } from "./storage.js";
import { showToast } from "../components/toast.js";

// Optional Supabase Client initialization
let supabaseClient = null;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (hasSupabaseConfig) {
  try {
    import("@supabase/supabase-js").then(({ createClient }) => {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }).catch(err => {
      console.warn("Supabase load fallback:", err);
    });
  } catch (e) {
    console.warn("Supabase init error:", e);
  }
}

/**
 * Hash password with salt using standard Web Crypto API (SHA-256)
 * Guarantees zero plaintext passwords in storage
 */
async function hashPassword(password, salt = "safesphere_salt_2026") {
  const enc = new TextEncoder();
  const data = enc.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Initial default demo user
const DEFAULT_DEMO_USER = {
  id: "user_demo_01",
  email: "demo@safesphere.org",
  full_name: "Dr. Ananya Sharma",
  phone: "+91 98765 43210",
  preferred_language: "en",
  emergency_contact_name: "Rajesh Sharma",
  emergency_contact_phone: "+91 98765 43211",
  password_hash: "2b9213f06b6ebda5171fcb44a4968c92a6c11b0e35fa8f1fb15494d4dcf9c4ff", // "safety2026"
  created_at: "2026-03-01T10:00:00.000Z",
  is_demo: true
};

// Seed demo community requests for immediate realistic testing
const SEED_EMERGENCY_REQUESTS = [
  {
    id: "REQ-8492",
    user_id: "user_seed_01",
    requester_name: "Pooja V.",
    category: "Medical Assistance",
    description: "Senior citizen feeling faint and breathless after sudden stairs evacuation. First aid kit available.",
    approx_location: "Kondapur Green Valley (~1.1 km away)",
    latitude: 17.4682,
    longitude: 78.3614,
    created_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    status: "Active", // Active | Help Offered | Resolved | Cancelled
    responders: []
  },
  {
    id: "REQ-3914",
    user_id: "user_seed_02",
    requester_name: "Vikram R.",
    category: "Electricity Hazard",
    description: "Water seepage near building ground panel switchboard. Ground floor flooded 4 inches.",
    approx_location: "Hitech City Phase 2 (~2.4 km away)",
    latitude: 17.4435,
    longitude: 78.3772,
    created_at: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
    status: "Help Offered",
    responders: [{ name: "Community Volunteer Anil", time: "12 mins ago" }]
  }
];

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];
    this.init();
  }

  async init() {
    // Check saved session
    const savedUser = storage.get("safesphere_user", null);
    if (savedUser) {
      this.currentUser = savedUser;
    }

    // Ensure demo accounts exist in local database
    const users = storage.get("safesphere_accounts", []);
    if (users.length === 0) {
      const initialHash = await hashPassword("safety2026");
      DEFAULT_DEMO_USER.password_hash = initialHash;
      storage.set("safesphere_accounts", [DEFAULT_DEMO_USER]);
    }

    // Ensure sample requests exist
    const requests = storage.get("safesphere_requests", []);
    if (requests.length === 0) {
      storage.set("safesphere_requests", SEED_EMERGENCY_REQUESTS);
    }
  }

  isDemoMode() {
    return !hasSupabaseConfig;
  }

  isAuthenticated() {
    return Boolean(this.currentUser && this.currentUser.id);
  }

  getUser() {
    return this.currentUser;
  }

  onAuthStateChange(listener) {
    this.authListeners.push(listener);
    return () => {
      this.authListeners = this.authListeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.authListeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (err) {
        console.error("Auth listener error:", err);
      }
    });
    window.dispatchEvent(new CustomEvent("safesphere:authchange", {
      detail: { user: this.currentUser }
    }));
  }

  /**
   * Log In
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error("Please provide both email and password.");
    }

    // Real Supabase Flow if available
    if (hasSupabaseConfig && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        this.currentUser = {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || email.split("@")[0],
          phone: data.user.user_metadata?.phone || "",
          preferred_language: data.user.user_metadata?.preferred_language || "en",
          emergency_contact_name: data.user.user_metadata?.emergency_contact_name || "",
          emergency_contact_phone: data.user.user_metadata?.emergency_contact_phone || "",
          is_demo: false
        };
        storage.set("safesphere_user", this.currentUser);
        this.notifyListeners();
        return this.currentUser;
      } catch (err) {
        throw new Error(err.message || "Failed to sign in via Supabase.");
      }
    }

    // Local Demo Flow (Secure SHA-256 Hashing)
    const accounts = storage.get("safesphere_accounts", []);
    const user = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      throw new Error("No account found with this email address.");
    }

    const hashedInput = await hashPassword(password);
    if (user.password_hash !== hashedInput) {
      throw new Error("Incorrect password. Please try again.");
    }

    // Safe session representation (strip hash)
    this.currentUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone || "",
      preferred_language: user.preferred_language || "en",
      emergency_contact_name: user.emergency_contact_name || "",
      emergency_contact_phone: user.emergency_contact_phone || "",
      is_demo: true
    };

    storage.set("safesphere_user", this.currentUser);
    this.notifyListeners();
    return this.currentUser;
  }

  /**
   * Sign Up
   */
  async signUp({ fullName, email, password, confirmPassword, phone = "", preferredLanguage = "en", emergencyContactName = "", emergencyContactPhone = "" }) {
    if (!fullName || !fullName.trim()) {
      throw new Error("Full name is required.");
    }
    if (!email || !email.includes("@")) {
      throw new Error("Valid email address is required.");
    }
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    // Real Supabase flow
    if (hasSupabaseConfig && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
              preferred_language: preferredLanguage,
              emergency_contact_name: emergencyContactName.trim(),
              emergency_contact_phone: emergencyContactPhone.trim()
            }
          }
        });
        if (error) throw error;
        this.currentUser = {
          id: data.user.id,
          email: data.user.email,
          full_name: fullName.trim(),
          phone: phone.trim(),
          preferred_language: preferredLanguage,
          emergency_contact_name: emergencyContactName.trim(),
          emergency_contact_phone: emergencyContactPhone.trim(),
          is_demo: false
        };
        storage.set("safesphere_user", this.currentUser);
        this.notifyListeners();
        return this.currentUser;
      } catch (err) {
        throw new Error(err.message || "Failed to create Supabase account.");
      }
    }

    // Local Demo Flow
    const accounts = storage.get("safesphere_accounts", []);
    const existing = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      throw new Error("An account with this email already exists. Please log in.");
    }

    const passwordHash = await hashPassword(password);
    const newAccount = {
      id: "user_" + Date.now(),
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      phone: phone.trim(),
      preferred_language: preferredLanguage,
      emergency_contact_name: emergencyContactName.trim(),
      emergency_contact_phone: emergencyContactPhone.trim(),
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      is_demo: true
    };

    accounts.push(newAccount);
    storage.set("safesphere_accounts", accounts);

    this.currentUser = {
      id: newAccount.id,
      email: newAccount.email,
      full_name: newAccount.full_name,
      phone: newAccount.phone,
      preferred_language: newAccount.preferred_language,
      emergency_contact_name: newAccount.emergency_contact_name,
      emergency_contact_phone: newAccount.emergency_contact_phone,
      is_demo: true
    };

    storage.set("safesphere_user", this.currentUser);
    this.notifyListeners();
    return this.currentUser;
  }

  /**
   * Forgot Password
   */
  async forgotPassword(email) {
    if (!email || !email.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }

    if (hasSupabaseConfig && supabaseClient) {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true, message: "Password reset link sent to your email." };
    }

    // In demo mode
    return {
      success: true,
      message: `In Demo Mode: A simulated password reset link has been issued for ${email}. Default demo password is "safety2026".`
    };
  }

  /**
   * Log Out
   */
  async logout() {
    if (hasSupabaseConfig && supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (err) {
        console.warn("Supabase signout warning:", err);
      }
    }
    this.currentUser = null;
    storage.remove("safesphere_user");
    this.notifyListeners();
    showToast("Signed out successfully.", "info");
  }

  /**
   * Update Profile
   */
  async updateProfile(updates) {
    if (!this.currentUser) throw new Error("Not authenticated");

    const updated = {
      ...this.currentUser,
      ...updates
    };

    this.currentUser = updated;
    storage.set("safesphere_user", updated);

    // If local demo, update in accounts array
    const accounts = storage.get("safesphere_accounts", []);
    const index = accounts.findIndex(a => a.id === updated.id);
    if (index !== -1) {
      accounts[index] = { ...accounts[index], ...updates };
      storage.set("safesphere_accounts", accounts);
    }

    this.notifyListeners();
    return updated;
  }

  /**
   * Personal Emergency Contacts management
   */
  getPersonalContacts() {
    const defaultContacts = [
      { id: "c1", name: "Anand Sharma", relationship: "Brother", phone: "+91 94401 23456" },
      { id: "c2", name: "Dr. Meera Iyer", relationship: "Family Physician", phone: "+91 98480 11223" }
    ];
    return storage.get("personal_contacts_" + (this.currentUser?.id || "guest"), defaultContacts);
  }

  addPersonalContact(contact) {
    const list = this.getPersonalContacts();
    const newContact = {
      id: "pc_" + Date.now(),
      name: contact.name.trim(),
      relationship: contact.relationship.trim(),
      phone: contact.phone.trim(),
      created_at: new Date().toISOString()
    };
    list.push(newContact);
    storage.set("personal_contacts_" + (this.currentUser?.id || "guest"), list);
    return newContact;
  }

  updatePersonalContact(id, updates) {
    const list = this.getPersonalContacts();
    const index = list.findIndex(c => c.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      storage.set("personal_contacts_" + (this.currentUser?.id || "guest"), list);
      return list[index];
    }
    return null;
  }

  deletePersonalContact(id) {
    const list = this.getPersonalContacts().filter(c => c.id !== id);
    storage.set("personal_contacts_" + (this.currentUser?.id || "guest"), list);
    return true;
  }

  /**
   * Community Emergency Requests
   */
  getEmergencyRequests() {
    return storage.get("safesphere_requests", SEED_EMERGENCY_REQUESTS);
  }

  getUserActiveRequest() {
    if (!this.currentUser) return null;
    const requests = this.getEmergencyRequests();
    return requests.find(r => r.user_id === this.currentUser.id && (r.status === "Active" || r.status === "Help Offered")) || null;
  }

  createEmergencyRequest({ category, description, approxLocation, latitude, longitude }) {
    if (!this.currentUser) throw new Error("You must be signed in to submit a request.");

    const requests = this.getEmergencyRequests();
    const newRequest = {
      id: "REQ-" + Math.floor(1000 + Math.random() * 9000),
      user_id: this.currentUser.id,
      requester_name: this.currentUser.full_name || "Community Member",
      category,
      description: description || "Assistance needed.",
      approx_location: approxLocation || "Near My Location",
      latitude: latitude ? Number(latitude.toFixed(3)) : null,
      longitude: longitude ? Number(longitude.toFixed(3)) : null,
      created_at: new Date().toISOString(),
      status: "Active",
      responders: []
    };

    requests.unshift(newRequest);
    storage.set("safesphere_requests", requests);
    return newRequest;
  }

  offerHelp(requestId, responderName) {
    const requests = this.getEmergencyRequests();
    const target = requests.find(r => r.id === requestId);
    if (target) {
      target.status = "Help Offered";
      target.responders.push({
        name: responderName || this.currentUser?.full_name || "SafeSphere Member",
        time: "Just now"
      });
      storage.set("safesphere_requests", requests);
      return target;
    }
    return null;
  }

  cancelEmergencyRequest(requestId) {
    const requests = this.getEmergencyRequests();
    const target = requests.find(r => r.id === requestId);
    if (target) {
      target.status = "Cancelled";
      target.resolved_at = new Date().toISOString();
      storage.set("safesphere_requests", requests);
      return target;
    }
    return null;
  }

  resolveEmergencyRequest(requestId) {
    const requests = this.getEmergencyRequests();
    const target = requests.find(r => r.id === requestId);
    if (target) {
      target.status = "Resolved";
      target.resolved_at = new Date().toISOString();
      storage.set("safesphere_requests", requests);
      return target;
    }
    return null;
  }
}

export const auth = new AuthService();
