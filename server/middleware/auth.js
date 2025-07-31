const jwt = require('jsonwebtoken');
const { requireAuth } = require('@clerk/express');

// Basic authentication middleware
const authenticate = (req, res, next) => {
  // Check for Clerk authentication first
  if (req.auth && req.auth.userId) {
    return next();
  }

  // Fallback to JWT token authentication
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
};

// Manager or Admin middleware
const managerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Manager or Admin privileges required.' });
  }
};

module.exports = {
  authenticate,
  adminOnly,
  managerOrAdmin,
  requireAuth // Export Clerk's requireAuth as well
};