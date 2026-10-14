
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

// Notify components such as Navbar when authentication changes.
function notifyAuthChanged() {
  window.dispatchEvent(new Event("nexora-auth-changed"));
}

async function authRequest(endpoint, payload) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Unable to connect to NEXORA. Check that the backend server is running."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.message || "Something went wrong. Please try again."
    );
  }

  return data;
}

// Register a new user.
export function registerUser({ username, email, password }) {
  return authRequest("register", {
    username,
    email,
    password,
  });
}

// Log in and store the authentication session.
export async function loginUser({ email, password }) {
  const data = await authRequest("login", {
    email,
    password,
  });

  if (!data.token || !data.user) {
    throw new Error("The server returned an invalid login response.");
  }

  try {
    sessionStorage.setItem("nexora-token", data.token);
    sessionStorage.setItem("nexora-user", JSON.stringify(data.user));
  } catch {
    sessionStorage.removeItem("nexora-token");
    sessionStorage.removeItem("nexora-user");

    throw new Error(
      "Unable to save your login session in this browser."
    );
  }

  // Update the navbar immediately after successful login.
  notifyAuthChanged();

  return data;
}

// Log out and notify the navbar.
export function logoutUser() {
  sessionStorage.removeItem("nexora-token");
  sessionStorage.removeItem("nexora-user");

  notifyAuthChanged();
}

// Retrieve the currently logged-in user.
export function getCurrentUser() {
  try {
    const user = sessionStorage.getItem("nexora-user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

// Retrieve the JWT for authenticated API requests.
export function getAuthToken() {
  try {
    return sessionStorage.getItem("nexora-token");
  } catch {
    return null;
  }
}

