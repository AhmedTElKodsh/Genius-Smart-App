const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load managers data
const loadManagers = () => {
  try {
    const managersPath = path.join(__dirname, '..', 'data', 'managers.json');
    const data = fs.readFileSync(managersPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading managers:', error);
    return [];
  }
};

// Manager authentication
router.post('/manager/signin', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const managers = loadManagers();
    
    // Find manager by email
    const manager = managers.find(m => m.email.toLowerCase() === email.toLowerCase());
    
    if (!manager) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password (in production, use proper password hashing)
    if (manager.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!manager.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled. Please contact administrator.'
      });
    }

    // Update last login (in production, update the actual data file)
    const currentTime = new Date().toISOString();
    
    // Generate a simple token (in production, use JWT)
    const token = `gse_${manager.id}_${Date.now()}`;

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        manager: {
          id: manager.id,
          name: manager.name,
          email: manager.email,
          role: manager.role,
          department: manager.department,
          permissions: manager.permissions
        }
      }
    });

  } catch (error) {
    console.error('Manager signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify token endpoint
router.get('/manager/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Simple token validation (in production, use JWT verification)
    if (!token.startsWith('gse_')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Extract manager ID from token
    const parts = token.split('_');
    if (parts.length !== 3) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    const managerId = parts[1];
    const managers = loadManagers();
    const manager = managers.find(m => m.id === managerId);

    if (!manager || !manager.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Manager not found or inactive'
      });
    }

    res.json({
      success: true,
      data: {
        manager: {
          id: manager.id,
          name: manager.name,
          email: manager.email,
          role: manager.role,
          department: manager.department,
          permissions: manager.permissions
        }
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Manager logout
router.post('/manager/logout', (req, res) => {
  // In a real application, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router; 