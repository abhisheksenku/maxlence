const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/User");
const { getCache, setCache } = require("../config/redis");

// Authenticate middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check token presence
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    // Try fetching user from cache
    let user = await getCache(`user:${decoded.id}`);

    if (!user) {
      const dbUser = await User.findByPk(decoded.id, {
        attributes: {
          exclude: [
            "password",
            "refreshToken",
            "verificationToken",
            "resetPasswordToken",
          ],
        },
      });

      if (!dbUser) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      user = dbUser.toJSON();

      // Cache user for 5 minutes
      await setCache(`user:${decoded.id}`, user, 300);
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    // 1. Check if authenticate middleware successfully set req.user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 2. Check if the user's role is allowed
    // roles.includes(req.user.role) checks if 'admin' is in the allowed list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires ${roles.join(" or ")} privileges.`,
      });
    }

    // 3. Optional: Extra check for verified status for Admin actions
    if (roles.includes("admin") && !req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Admin account must be verified to perform this action.",
      });
    }

    next();
  };
};

// Optional authentication middleware
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findByPk(decoded.id);

    if (user) {
      req.user = user.toJSON();
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
};
