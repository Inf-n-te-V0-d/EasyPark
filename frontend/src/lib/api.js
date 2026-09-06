const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiRequest(path, options = {}) {
  const session = getSession();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "The server could not complete that request.");
  }

  return payload;
}

export function saveSession(user, token) {
  localStorage.setItem("easypark-user", JSON.stringify({ ...user, token }));
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem("easypark-user")) || null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("easypark-user");
}

export function getVehicleLocations() {
  try {
    const savedList = JSON.parse(localStorage.getItem("easypark-vehicle-locations"));
    if (Array.isArray(savedList) && savedList.length) return savedList;

    const legacy = JSON.parse(localStorage.getItem("easypark-vehicle-location"));
    if (Number.isFinite(legacy?.lat) && Number.isFinite(legacy?.lng)) {
      return [{ ...legacy, id: legacy.id || `vehicle-${legacy.lat}-${legacy.lng}` }];
    }
  } catch {
    return [];
  }
  return [];
}

export function saveVehicleLocation(location) {
  const nextLocation = {
    ...location,
    id: location.id || `vehicle-${Date.now()}-${location.lat}-${location.lng}`,
  };
  const locations = getVehicleLocations();
  const nextLocations = locations.some((item) => item.id === nextLocation.id)
    ? locations.map((item) => item.id === nextLocation.id ? nextLocation : item)
    : [...locations, nextLocation];
  localStorage.setItem("easypark-vehicle-locations", JSON.stringify(nextLocations));
  localStorage.setItem("easypark-vehicle-location", JSON.stringify(nextLocation));
  return nextLocation;
}
