
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import gamesRouter from "./routes/games.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NEXORA API is running!",
  });
});

// Game discovery API
app.use("/api/games", gamesRouter);

// Start server
app.listen(PORT, () => {
  console.log(`NEXORA API running at http://localhost:${PORT}`);
});
