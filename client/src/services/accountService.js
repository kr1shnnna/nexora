
import { getAuthToken } from "./authService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

async function accountRequest(endpoint, options = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Please log in to access your account.");
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to NEXORA. Please check your connection."
    );
  }

  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new Error(
      "Your session has expired. Please log in again."
    );
  }

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.message || "Something went wrong. Please try again."
    );
  }

  return data;
}

// Retrieve the logged-in user's cart.
export function fetchCart() {
  return accountRequest("/cart");
}

// Remove a game from the cart.
export function removeCartItem(gameId) {
  return accountRequest(
    `/cart/${encodeURIComponent(gameId)}`,
    {
      method: "DELETE",
    }
  );
}

// Complete the simulated checkout.
export function checkoutCart() {
  return accountRequest("/cart/checkout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

// Retrieve games owned by the logged-in user.
export function fetchLibrary() {
  return accountRequest("/library");
}

// Check whether a particular game is owned.
export function checkGameOwnership(gameId) {
  return accountRequest(
    `/library/${encodeURIComponent(gameId)}`
  );
}

