const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function fetchGames({
  page = 1,
  pageSize = 12,
  search = "",
  genres = "",
  ordering = "-rating",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    ordering,
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (genres) {
    params.set("genres", genres);
  }

  const response = await fetch(
    `${API_BASE_URL}/games?${params.toString()}`,
  );

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Unable to fetch games.");
  }

  return data;
}
