export const BASE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export async function apiRequest(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    ...(options.headers || {})
  };

  // Only set Bearer token if it's an actual JWT (not just "true")
  if (token && token !== "true") {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include" // Send httpOnly cookies for Google OAuth
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return { response, payload };
}
