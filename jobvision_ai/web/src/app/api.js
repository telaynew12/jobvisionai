const API_BASE_URL = "http://localhost:8001"; // make sure backend port matches

// Generic API request
export async function apiRequest(endpoint, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : null,
  });

  return res.json();
}

// Auth functions
export async function loginUser(email, password) {
  return apiRequest("/auth/login", "POST", { email, password });
}

export async function registerUser(name, email, password) {
  return apiRequest("/auth/register", "POST", { name, email, password });
}

export async function verifyEmail(email, code) {
  return apiRequest("/auth/verify", "POST", { email, code });
}

// Other functions
export async function logoutUser() {
  return apiRequest("/auth/logout", "POST");
}

export async function refreshToken() {
  return apiRequest("/auth/refresh", "POST");
}

export async function getCurrentUser() {
  return apiRequest("/auth/me", "GET");
}



// Fetch user by email
export async function fetchUserByEmail(email) {
  const res = await fetch(`${API_BASE_URL}/auth/fetch-by-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  return res.json();
}


export async function fetchUserById(userId) {
  const res = await fetch(`${API_BASE_URL}/auth/user/${userId}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch user by ID");
  return res.json();
}
