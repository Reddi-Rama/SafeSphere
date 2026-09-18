/**
 * SafeSphere Storage Utility
 * Safe, fault-tolerant LocalStorage wrapper with defaults
 */

const PREFIX = "safesphere_";

export const storage = {
  get(key, defaultValue = null) {
    try {
      const val = localStorage.getItem(PREFIX + key);
      if (val === null || val === undefined) return defaultValue;
      return JSON.parse(val);
    } catch (e) {
      console.warn(`[SafeSphere Storage] Failed to read ${key}:`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`[SafeSphere Storage] Failed to write ${key}:`, e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (e) {
      console.warn(`[SafeSphere Storage] Failed to remove ${key}:`, e);
    }
  }
};
