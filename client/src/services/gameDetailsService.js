
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(endpoint, signal) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.message || "Unable to load game information.",
    );
  }

  return data;
}

/**
 * Fetch full metadata for an individual game.
 */
export async function fetchGameDetails(id, { signal } = {}) {
  if (!id) {
    throw new Error("A game ID is required.");
  }

  const data = await request(
    `/games/${encodeURIComponent(id)}`,
    signal,
  );

  return data.game;
}

/**
 * Fetch screenshots for a game's media gallery.
 */
export async function fetchGameScreenshots(
  id,
  { pageSize = 12, signal } = {},
) {
  if (!id) {
    throw new Error("A game ID is required.");
  }

  const params = new URLSearchParams({
    page_size: String(pageSize),
  });

  const data = await request(
    `/games/${encodeURIComponent(id)}/screenshots?${params}`,
    signal,
  );

  return data.results ?? [];
}

/**
 * Fetch available trailers and video previews.
 */
export async function fetchGameMovies(id, { signal } = {}) {
  if (!id) {
    throw new Error("A game ID is required.");
  }

  const data = await request(
    `/games/${encodeURIComponent(id)}/movies`,
    signal,
  );

  return data.results ?? [];
}

