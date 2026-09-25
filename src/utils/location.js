/**
 * SafeSphere Privacy-Preserving Location Utility
 * Strictly respects user privacy:
 * - NO automatic background or continuous tracking
 * - Explicit user action required
 * - Clear location states & explanations
 * - Approximate locality formatting without revealing exact street address
 */

export const LOCATION_STATES = {
  NOT_REQUESTED: "NOT_REQUESTED",
  REQUESTING: "REQUESTING",
  AVAILABLE: "AVAILABLE",
  DENIED: "DENIED",
  UNAVAILABLE: "UNAVAILABLE",
  SHARING_ACTIVE: "SHARING_ACTIVE",
  SHARING_STOPPED: "SHARING_STOPPED"
};

export const LOCATION_STATE_LABELS = {
  NOT_REQUESTED: "Location hasn't been shared.",
  REQUESTING: "Waiting for location permission...",
  AVAILABLE: "Location available (Approximate coordinates secured)",
  DENIED: "Location permission was denied. You can enter your location manually.",
  UNAVAILABLE: "Unable to determine your location. Please try again or enter it manually.",
  SHARING_ACTIVE: "Your location is currently being shared for this request.",
  SHARING_STOPPED: "Location sharing has stopped."
};

let currentLocationData = null;
let currentLocationState = LOCATION_STATES.NOT_REQUESTED;

/**
 * Approximate coordinates (fuzz to 2 decimal places ~1.1km radius)
 * to prevent leaking exact residential addresses in public community feeds.
 */
export function blurCoordinates(lat, lng) {
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return {
    latitude: Math.round(lat * 100) / 100,
    longitude: Math.round(lng * 100) / 100
  };
}

/**
 * Reverse geocode approximate area name
 */
async function reverseGeocodeApprox(lat, lng) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json", "User-Agent": "SafeSphereEmergencyApp/1.0" },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const neighbourhood = addr.neighbourhood || addr.suburb || addr.residential || addr.road;
      const city = addr.city || addr.town || addr.county || addr.state_district;
      if (neighbourhood && city) {
        return `${neighbourhood}, ${city} (Approx. ~1km radius)`;
      } else if (city) {
        return `${city} Area (Approx. ~1km radius)`;
      }
    }
  } catch (e) {
    // Offline or rate-limited; fallback to coordinates approximation
  }
  return `Approx. ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`;
}

/**
 * Request single location reading upon explicit user click
 */
export async function requestVoluntaryLocation() {
  if (!("geolocation" in navigator)) {
    currentLocationState = LOCATION_STATES.UNAVAILABLE;
    return {
      state: LOCATION_STATES.UNAVAILABLE,
      error: "Geolocation is not supported by your browser."
    };
  }

  currentLocationState = LOCATION_STATES.REQUESTING;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const rawLat = pos.coords.latitude;
        const rawLng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        // Fuzz coordinates to protect private residence
        const blurred = blurCoordinates(rawLat, rawLng);
        const approxName = await reverseGeocodeApprox(rawLat, rawLng);

        currentLocationData = {
          rawLatitude: rawLat,
          rawLongitude: rawLng,
          latitude: blurred.latitude,
          longitude: blurred.longitude,
          approxArea: approxName,
          accuracyMeters: accuracy,
          timestamp: new Date().toISOString()
        };

        currentLocationState = LOCATION_STATES.AVAILABLE;

        resolve({
          state: LOCATION_STATES.AVAILABLE,
          data: currentLocationData
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          currentLocationState = LOCATION_STATES.DENIED;
        } else {
          currentLocationState = LOCATION_STATES.UNAVAILABLE;
        }
        resolve({
          state: currentLocationState,
          error: err.message
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

export function getCurrentLocationState() {
  return currentLocationState;
}

export function getCurrentLocationData() {
  return currentLocationData;
}

export function stopSharingLocation() {
  currentLocationState = LOCATION_STATES.SHARING_STOPPED;
  currentLocationData = null;
  return {
    state: LOCATION_STATES.SHARING_STOPPED,
    message: LOCATION_STATE_LABELS[LOCATION_STATES.SHARING_STOPPED]
  };
}
