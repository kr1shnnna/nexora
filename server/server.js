import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import gamesRouter from "./routes/games.routes.js";
import authRouter from "./routes/auth.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NEXORA API is running!",
  });
});

// Existing game discovery API
app.use("/api/games", gamesRouter);

// Authentication API
app.use("/api/auth", authRouter);

// Start server after MongoDB connects
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`NEXORA API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start NEXORA API:", error.message);
    process.exit(1);
  }
};

startServer();
