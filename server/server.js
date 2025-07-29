const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import Clerk middleware
const { clerkMiddleware, requireAuth } = require('@clerk/express');

// Import routes
const authRoutes = require('./routes/auth');
const teachersRoutes = require('./routes/teachers');
const requestsRoutes = require('./routes/requests');
const subjectsRoutes = require('./routes/subjects');
const dashboardRoutes = require('./routes/dashboard');
const attendanceRoutes = require('./routes/attendance');
const managerRoutes = require('./routes/manager');
const clerkUserRoutes = require('./routes/clerkUser');
const authoritiesRoutes = require('./routes/authorities');
const auditTrailRoutes = require('./routes/auditTrail');
const holidaysRoutes = require('./routes/holidays');
const dataTrackingRoutes = require('./routes/dataTracking');
const analyticsRoutes = require('./routes/analytics');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security and basic middleware
app.use(helmet()); // Security headers

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:4000', 
    'http://localhost:5173',
    'http://localhost:5176'
  ], // Frontend URLs
  credentials: true
}));

app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb', charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// Data tracking middleware for comprehensive monitoring
const { trackDataChange } = require('./middleware/dataTrackingMiddleware');
app.use(trackDataChange);

// Initialize Clerk middleware (must be before routes)
if (process.env.CLERK_SECRET_KEY) {
  app.use(clerkMiddleware());
  console.log('🔐 Clerk middleware initialized');
} else {
  console.warn('⚠️  CLERK_SECRET_KEY not found - Clerk authentication disabled');
}

// API Routes

// Public routes (no authentication required)
app.use('/api/auth', authRoutes); // Legacy authentication - public for transition

// Health check endpoint (public)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Genius Smart Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    clerkEnabled: !!process.env.CLERK_SECRET_KEY
  });
});

// Clerk-protected routes (for new authentication)
if (process.env.CLERK_SECRET_KEY) {
  app.use('/api/clerk/user', clerkUserRoutes); // User management routes (auth handled within)
  app.use('/api/clerk/teachers', requireAuth(), teachersRoutes);
  app.use('/api/clerk/requests', requireAuth(), requestsRoutes);
  app.use('/api/clerk/subjects', requireAuth(), subjectsRoutes);
  app.use('/api/clerk/dashboard', requireAuth(), dashboardRoutes);
  app.use('/api/clerk/attendance', requireAuth(), attendanceRoutes);
  app.use('/api/clerk/manager', requireAuth(), managerRoutes);
  app.use('/api/clerk/analytics', requireAuth(), analyticsRoutes);
}

// Legacy routes (for backward compatibility during transition)
app.use('/api/teachers', teachersRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/authorities', authoritiesRoutes);
app.use('/api/audit', auditTrailRoutes);
app.use('/api/holidays', holidaysRoutes);
app.use('/api/tracking', dataTrackingRoutes);
app.use('/api/analytics', analyticsRoutes);

// Clerk user info endpoint
if (process.env.CLERK_SECRET_KEY) {
  app.get('/api/clerk/user', requireAuth(), (req, res) => {
    try {
      const user = req.auth.user;
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.emailAddresses?.[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          metadata: user.publicMetadata
        }
      });
    } catch (error) {
      console.error('Error getting user info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user information'
      });
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Genius Smart Backend API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.CLERK_SECRET_KEY) {
    console.log(`🔐 Clerk authentication: ENABLED`);
    console.log(`🛡️  Protected routes: /api/clerk/*`);
  } else {
    console.log(`⚠️  Clerk authentication: DISABLED (missing CLERK_SECRET_KEY)`);
  }
});

module.exports = app; 