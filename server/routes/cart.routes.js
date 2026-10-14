
import express from "express";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/cart
// Retrieve the authenticated user's cart.
router.get("/", protect, (req, res) => {
  const cart = req.user.cart || [];

  const total = cart.reduce(
    (sum, item) => sum + item.price,
    0
  );

  return res.status(200).json({
    success: true,
    cart,
    total,
    itemCount: cart.length,
  });
});

// POST /api/cart
// Add a game to the authenticated user's cart.
router.post("/", protect, async (req, res) => {
  try {
    const {
      gameId,
      slug = "",
      name,
      backgroundImage = "",
      price,
    } = req.body;

    if (
      gameId === undefined ||
      gameId === null ||
      typeof name !== "string" ||
      !name.trim() ||
      typeof price !== "number" ||
      !Number.isFinite(price)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid game ID, name, and price are required.",
      });
    }

    const normalizedGameId = String(gameId).trim();
    const normalizedName = name.trim();

    if (
      !normalizedGameId ||
      normalizedGameId.length > 100 ||
      normalizedName.length > 200
    ) {
      return res.status(400).json({
        success: false,
        message: "The game details are invalid.",
      });
    }

    if (
      price < 0 ||
      price > 100000 ||
      typeof slug !== "string" ||
      slug.length > 200 ||
      typeof backgroundImage !== "string" ||
      backgroundImage.length > 2048
    ) {
      return res.status(400).json({
        success: false,
        message: "The supplied game details are invalid.",
      });
    }

    if (backgroundImage) {
      let imageUrl;

      try {
        imageUrl = new URL(backgroundImage);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid artwork URL.",
        });
      }

      if (!["http:", "https:"].includes(imageUrl.protocol)) {
        return res.status(400).json({
          success: false,
          message: "The artwork URL must use HTTP or HTTPS.",
        });
      }
    }

    const alreadyOwned = req.user.library.some(
      (item) => item.gameId === normalizedGameId
    );

    if (alreadyOwned) {
      return res.status(409).json({
        success: false,
        message: "You already own this game.",
      });
    }

    const existingItem = req.user.cart.find(
      (item) => item.gameId === normalizedGameId
    );

    if (existingItem) {
      return res.status(200).json({
        success: true,
        message: "This game is already in your cart.",
        cart: req.user.cart,
        total: req.user.cart.reduce(
          (sum, item) => sum + item.price,
          0
        ),
        itemCount: req.user.cart.length,
      });
    }

    req.user.cart.push({
      gameId: normalizedGameId,
      slug: slug.trim(),
      name: normalizedName,
      backgroundImage: backgroundImage.trim(),
      price,
    });

    await req.user.save();

    const cart = req.user.cart;
    const total = cart.reduce(
      (sum, item) => sum + item.price,
      0
    );

    return res.status(201).json({
      success: true,
      message: "Game added to your cart!",
      cart,
      total,
      itemCount: cart.length,
    });
  } catch (error) {
    console.error("Add to cart error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to add this game to your cart.",
    });
  }
});

// POST /api/cart/checkout
// Simulate a purchase and transfer cart games into the library.
router.post("/checkout", protect, async (req, res) => {
  try {
    const cart = req.user.cart || [];

    if (cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    const ownedGameIds = new Set(
      (req.user.library || []).map((item) => item.gameId)
    );

    const purchased = [];
    const alreadyOwned = [];
    const purchasedAt = new Date();

    for (const item of cart) {
      // Never add duplicate ownership.
      if (ownedGameIds.has(item.gameId)) {
        alreadyOwned.push(item.name);
        continue;
      }

      const libraryItem = {
        gameId: item.gameId,
        slug: item.slug || "",
        name: item.name,
        backgroundImage: item.backgroundImage || "",
        price: item.price,
        purchasedAt,
      };

      purchased.push(libraryItem);
      ownedGameIds.add(item.gameId);
    }

    // Move newly purchased games into the library.
    if (purchased.length > 0) {
      req.user.library.push(...purchased);
    }

    // Clear the cart only after preparing the library update.
    req.user.cart = [];

    await req.user.save();

    const total = purchased.reduce(
      (sum, item) => sum + item.price,
      0
    );

    return res.status(200).json({
      success: true,
      message:
        purchased.length > 0
          ? "Demo checkout completed successfully!"
          : "All games were already in your library. Your cart has been cleared.",
      purchased,
      alreadyOwned,
      total,
      itemCount: purchased.length,
      libraryCount: req.user.library.length,
      cart: [],
    });
  } catch (error) {
    console.error("Demo checkout error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to complete demo checkout. Please try again.",
    });
  }
});

// DELETE /api/cart/:gameId
// Remove a game from the authenticated user's cart.
router.delete("/:gameId", protect, async (req, res) => {
  try {
    const gameId = req.params.gameId;

    const existingItem = req.user.cart.some(
      (item) => item.gameId === gameId
    );

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "This game was not found in your cart.",
      });
    }

    req.user.cart = req.user.cart.filter(
      (item) => item.gameId !== gameId
    );

    await req.user.save();

    const cart = req.user.cart;
    const total = cart.reduce(
      (sum, item) => sum + item.price,
      0
    );

    return res.status(200).json({
      success: true,
      message: "Game removed from your cart.",
      cart,
      total,
      itemCount: cart.length,
    });
  } catch (error) {
    console.error("Remove from cart error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to remove this game from your cart.",
    });
  }
});

export default router;

