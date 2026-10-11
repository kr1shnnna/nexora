
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
  const searchTerm =
    typeof search === "string" ? search.trim() : "";

  const genres = req.query.genres;

  const requestedOrdering =
    typeof req.query.ordering === "string"
      ? req.query.ordering.trim()
      : "";

  /*
   * During a search, let RAWG determine relevance by default.
   * Without a search, show highly rated games first.
   * "relevance" is a frontend-only sorting option.
   */
  let ordering;

  if (requestedOrdering === "relevance") {
    ordering = "";
  } else if (requestedOrdering) {
    ordering = requestedOrdering;
  } else {
    ordering = searchTerm ? "" : "-rating";
  }

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

  // Validate genre slugs.
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

  // Validate sorting, allowing an empty ordering for relevance.
  if (ordering && !allowedOrdering.has(ordering)) {
    return res.status(400).json({
      success: false,
      message: "Unsupported sorting option.",
    });
  }

  const rawgUrl = new URL(RAWG_URL);

  rawgUrl.searchParams.set("key", apiKey);
  rawgUrl.searchParams.set("page", String(page));
  rawgUrl.searchParams.set("page_size", String(pageSize));

  // Only send ordering when the user selected an actual sort field.
  if (ordering) {
    rawgUrl.searchParams.set("ordering", ordering);
  }

  if (searchTerm) {
    rawgUrl.searchParams.set("search", searchTerm);
    rawgUrl.searchParams.set("exclude_additions", "true");
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





/* =========================================
   GAME DETAIL API HELPERS
========================================= */

async function fetchGameProvider(endpoint, params = {}) {
  const apiKey = process.env.RAWG_API_KEY;

  if (!apiKey) {
    const error = new Error("Game API key is not configured.");
    error.code = "API_KEY_MISSING";
    throw error;
  }

  const url = new URL(
    `https://api.rawg.io/api/${endpoint}`,
  );

  url.searchParams.set("key", apiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (response.status === 404) {
      const error = new Error("Game not found.");
      error.code = "GAME_NOT_FOUND";
      throw error;
    }

    if (response.status === 429) {
      const error = new Error("Game API rate limit reached.");
      error.code = "GAME_API_RATE_LIMIT";
      throw error;
    }

    if (!response.ok) {
      console.error(
        `Game provider returned HTTP ${response.status}`,
      );

      const error = new Error("Game provider request failed.");
      error.code = "GAME_PROVIDER_ERROR";
      throw error;
    }

    return await response.json();
  } catch (error) {
    if (error.name === "TimeoutError") {
      error.code = "GAME_PROVIDER_TIMEOUT";
    }

    throw error;
  }
}

function handleGameProviderError(res, error) {
  console.error("Game detail API error:", {
    message: error.message,
    code: error.code,
    cause: error.cause?.message,
  });

  const errorResponses = {
    API_KEY_MISSING: {
      status: 500,
      message: "Game API is not configured.",
    },
    GAME_NOT_FOUND: {
      status: 404,
      message: "The requested game was not found.",
    },
    GAME_API_RATE_LIMIT: {
      status: 429,
      message: "Too many requests. Please try again later.",
    },
    GAME_PROVIDER_TIMEOUT: {
      status: 504,
      message: "The game provider took too long to respond.",
    },
  };

  const result =
    errorResponses[error.code] ?? {
      status: 502,
      message: "Unable to retrieve game information.",
    };

  return res.status(result.status).json({
    success: false,
    message: result.message,
  });
}

/* =========================================
   GET /api/games/:id
   Full game information
========================================= */

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid game identifier.",
    });
  }

  try {
    const game = await fetchGameProvider(
      `games/${encodeURIComponent(id)}`,
    );

    const platforms = (game.platforms ?? [])
      .filter((item) => item.platform)
      .map((item) => ({
        id: item.platform.id,
        name: item.platform.name,
        slug: item.platform.slug,
        releasedAt: item.released_at ?? null,
        requirements: {
          minimum: item.requirements?.minimum ?? null,
          recommended: item.requirements?.recommended ?? null,
        },
      }));

    return res.json({
      success: true,
      game: {
        id: game.id,
        slug: game.slug,
        name: game.name,
        description: game.description_raw ?? "",
        backgroundImage: game.background_image ?? null,
        backgroundImageAdditional:
          game.background_image_additional ?? null,
        released: game.released ?? null,
        updated: game.updated ?? null,
        website: game.website ?? null,
        rating: game.rating ?? null,
        ratingsCount: game.ratings_count ?? 0,
        ratings: game.ratings ?? [],
        metacritic: game.metacritic ?? null,
        playtime: game.playtime ?? null,
        esrbRating: game.esrb_rating?.name ?? null,

        genres: (game.genres ?? []).map((genre) => ({
          id: genre.id,
          name: genre.name,
          slug: genre.slug,
        })),

        developers: (game.developers ?? []).map((developer) => ({
          id: developer.id,
          name: developer.name,
          slug: developer.slug,
        })),

        publishers: (game.publishers ?? []).map((publisher) => ({
          id: publisher.id,
          name: publisher.name,
          slug: publisher.slug,
        })),

        platforms,

        stores: (game.stores ?? []).map((item) => ({
          id: item.store?.id,
          name: item.store?.name,
          slug: item.store?.slug,
        })).filter((store) => store.id),

        tags: (game.tags ?? []).slice(0, 20).map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
        })),
      },
    });
  } catch (error) {
    return handleGameProviderError(res, error);
  }
});

/* =========================================
   GET /api/games/:id/screenshots
   Screenshot gallery
========================================= */

router.get("/:id/screenshots", async (req, res) => {
  const { id } = req.params;
  const pageSize = Number(req.query.page_size ?? 12);

  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid game identifier.",
    });
  }

  if (
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 20
  ) {
    return res.status(400).json({
      success: false,
      message: "page_size must be between 1 and 20.",
    });
  }

  try {
    const data = await fetchGameProvider(
      `games/${encodeURIComponent(id)}/screenshots`,
      { page_size: pageSize },
    );

    return res.json({
      success: true,
      count: data.count ?? 0,
      results: (data.results ?? []).map((item) => ({
        id: item.id,
        image: item.image,
        width: item.width,
        height: item.height,
      })),
    });
  } catch (error) {
    return handleGameProviderError(res, error);
  }
});

/* =========================================
   GET /api/games/:id/movies
   Trailers and video previews
========================================= */

router.get("/:id/movies", async (req, res) => {
  const { id } = req.params;

  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid game identifier.",
    });
  }

  try {
    const data = await fetchGameProvider(
      `games/${encodeURIComponent(id)}/movies`,
    );

    const results = (data.results ?? []).map((movie) => ({
      id: movie.id,
      name: movie.name,
      preview: movie.preview ?? null,
      video:
        movie.data?.max ??
        movie.data?.["720"] ??
        movie.data?.["480"] ??
        null,
    }));

    return res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    return handleGameProviderError(res, error);
  }
});



export default router;
