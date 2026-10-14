
import express from "express";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/library
// Retrieve all games owned by the authenticated user.
router.get("/", protect, (req, res) => {
  const library = req.user.library || [];

  return res.status(200).json({
    success: true,
    library,
    count: library.length,
  });
});

// GET /api/library/:gameId
// Check whether the authenticated user owns a specific game.
router.get("/:gameId", protect, (req, res) => {
  const { gameId } = req.params;

  const game = (req.user.library || []).find(
    (item) => item.gameId === gameId
  );

  if (!game) {
    return res.status(200).json({
      success: true,
      owned: false,
      game: null,
    });
  }

  return res.status(200).json({
    success: true,
    owned: true,
    game,
  });
});

export default router;
