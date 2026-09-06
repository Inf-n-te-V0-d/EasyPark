const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
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

export function saveSession(user) {
  localStorage.setItem("easypark-user", JSON.stringify(user));
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
