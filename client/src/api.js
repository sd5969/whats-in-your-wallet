const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    if (response.status === 204) {
      return null;
    }
    const message = await response.json().catch(() => ({}));
    const error = message?.message || "Request failed";
    throw new Error(error);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function fetchState() {
  return request("/api/state");
}

export function saveState(state) {
  return request("/api/state", {
    method: "PUT",
    body: JSON.stringify(state)
  });
}
