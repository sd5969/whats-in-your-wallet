const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

function withUser(path, userId) {
  if (!userId) {
    return path;
  }
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}user=${encodeURIComponent(userId)}`;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    credentials: "include",
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

export function fetchState(userId) {
  return request(withUser("/api/state", userId));
}

export function saveState(state, userId) {
  return request(withUser("/api/state", userId), {
    method: "PUT",
    body: JSON.stringify(state)
  });
}

export function resetState(userId) {
  return request(withUser("/api/state", userId), {
    method: "DELETE"
  });
}
