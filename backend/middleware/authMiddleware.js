const crypto = require("crypto");
const User = require("../models/User");

const getSecret = () => process.env.AUTH_SECRET || "easypark-development-secret";

const createToken = (userId) => {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
  const payload = `${userId}.${expiresAt}`;
  const signature = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
};

const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication is required." });
  }

  try {
    const [userId, expiresAt, signature] = token.split(".");
    const payload = `${userId}.${expiresAt}`;
    const expectedSignature = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
    const validSignature = signature && crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );

    if (!userId || !expiresAt || !validSignature || Number(expiresAt) < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ message: "Your session has expired. Please sign in again." });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User account not found." });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid authentication token." });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Administrator access is required." });
  }
  next();
};

module.exports = { createToken, requireAuth, requireAdmin };
