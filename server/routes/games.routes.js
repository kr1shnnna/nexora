
import { Router } from "express";

const router = Router();

const RAWG_URL = "https://api.rawg.io/api/games";

const allowedOrdering = new Set([
  "name",
  "-name",
  "released",
  "-released",
  "added",
  "-added",
  "created",
  "-created",
  "updated",
  "-updated",
  "rating",
  "-rating",
  "metacritic",
  "-metacritic",
]);

router.get("/", async (req, res) => {
  const apiKey = process.env.RAWG_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: "RAWG API key is not configured on the server.",
    });
  }

  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.page_size ?? 12);
  const search = req.query.search;
  const genres = req.query.genres;
  const ordering = req.query.ordering ?? "-rating";

  // Validate pagination.
  if (!Number.isSafeInteger(page) || page < 1) {
    return res.status(400).json({
      success: false,
      message: "Page must be a positive integer.",
    });
  }

  if (
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 40
  ) {
    return res.status(400).json({
      success: false,
      message: "page_size must be an integer between 1 and 40.",
    });
  }

  // Validate search input.
  if (
    search !== undefined &&
    (typeof search !== "string" || search.trim().length > 100)
  ) {
    return res.status(400).json({
      success: false,
      message: "Search must be a string of at most 100 characters.",
    });
  }

  // Accept genre slugs such as action, rpg, or action,rpg.
  if (
    genres !== undefined &&
    (
      typeof genres !== "string" ||
      genres.length > 150 ||
      !/^[a-z0-9,_-]+$/i.test(genres)
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid genre filter.",
    });
  }

  // Only allow documented sorting fields.
  if (
    typeof ordering !== "string" ||
    !allowedOrdering.has(ordering)
  ) {
    return res.status(400).json({
      success: false,
      message: "Unsupported sorting option.",
    });
  }

  const rawgUrl = new URL(RAWG_URL);

  rawgUrl.searchParams.set("key", apiKey);
  rawgUrl.searchParams.set("page", String(page));
  rawgUrl.searchParams.set("page_size", String(pageSize));
  rawgUrl.searchParams.set("ordering", ordering);

  if (typeof search === "string" && search.trim()) {
    rawgUrl.searchParams.set("search", search.trim());
  }

  if (typeof genres === "string" && genres) {
    rawgUrl.searchParams.set("genres", genres);
  }

  try {
    const response = await fetch(rawgUrl, {
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      // Keep the API key and upstream response out of client errors.
      console.error(`RAWG returned HTTP ${response.status}`);

      if (response.status === 429) {
        return res.status(429).json({
          success: false,
          message: "The game API rate limit was reached. Please try later.",
        });
      }

      return res.status(502).json({
        success: false,
        message: "The game provider could not fulfill this request.",
      });
    }

    const data = await response.json();

    // Return only the fields the storefront needs.
    const results = (data.results ?? []).map((game) => ({
      id: game.id,
      slug: game.slug,
      name: game.name,
      released: game.released ?? null,
      backgroundImage: game.background_image ?? null,
      rating: game.rating ?? null,
      ratingsCount: game.ratings_count ?? 0,
      metacritic: game.metacritic ?? null,
      genres: (game.genres ?? []).map((genre) => ({
        id: genre.id,
        name: genre.name,
        slug: genre.slug,
      })),
      platforms: (game.platforms ?? [])
        .map(({ platform }) =>
          platform
            ? {
                id: platform.id,
                name: platform.name,
                slug: platform.slug,
              }
            : null,
        )
        .filter(Boolean),
    }));

    return res.json({
      success: true,
      count: data.count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((data.count ?? 0) / pageSize),
      results,
    });
  } catch (error) {
    
    console.error("Game API request failed:", {
  message: error.message,
  cause: error.cause?.message,
  code: error.cause?.code,
  name: error.cause?.name,
});


    if (error.name === "TimeoutError") {
      return res.status(504).json({
        success: false,
        message: "The game provider took too long to respond.",
      });
    }

    return res.status(502).json({
      success: false,
      message: "Unable to fetch games right now. Please try again.",
    });
  }
});

export default router;

