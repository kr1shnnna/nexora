
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  // Read the JWT from the Authorization header.
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Please log in to access this resource.",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is missing.",
    });
  }

  // Check server configuration.
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is missing from server/.env");

    return res.status(500).json({
      success: false,
      message: "Authentication is not configured correctly.",
    });
  }

  let decoded;

  // Verify the JWT signature and expiry.
  try {
    decoded = jwt.verify(token, secret);
  } catch {
    return res.status(401).json({
      success: false,
      message: "Your session is invalid or has expired. Please log in again.",
    });
  }

  // Find the authenticated user in MongoDB.
  try {
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your account could not be found. Please log in again.",
      });
    }

    // Make the authenticated user available to protected routes.
    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify your account right now.",
    });
  }
};

