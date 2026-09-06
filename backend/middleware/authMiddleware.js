const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getSecret = () => {
  if (!process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET is not configured");
  }

  return process.env.AUTH_SECRET;
};

const createToken = (userId) => {
  return jwt.sign({ sub: userId }, getSecret(), { expiresIn: "24h" });
};

const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication is required." });
  }

  try {
    const decoded = jwt.verify(token, getSecret());
    const userId = decoded.sub || decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({ message: "Invalid authentication token." });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User account not found." });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Your session has expired. Please sign in again." });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Administrator access is required." });
  }
  next();
};

module.exports = { createToken, requireAuth, requireAdmin };
