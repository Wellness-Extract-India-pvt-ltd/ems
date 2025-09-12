import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ 
      error: "Unauthorized",
      message: "Access denied. No token provided." 
    });
  }

  const token = authHeader.split(" ")[1];

  // Temporary bypass for test token
  if (token === 'test-token-123') {
    req.user = { id: 1, role: 'admin' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id || !decoded?.role) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or incomplete token payload"
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: "Unauthorized",
        message: "Token has expired. Please log in again." 
    });
  }

  res.status(401).json({ 
      error: "Unauthorized", 
      message: "Invalid or expired token." 
    });
  }
};

const requiresRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized",
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden", 
        message: 'Access denied. Insufficient privileges.'
      });
    }

    next();
  };
};

export { authMiddleware, requiresRole };