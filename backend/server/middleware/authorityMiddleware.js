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

// Load teachers data  
const loadTeachers = () => {
  try {
    const teachersPath = path.join(__dirname, '..', 'data', 'teachers.json');
    const data = fs.readFileSync(teachersPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading teachers:', error);
    return [];
  }
};

// Generic authority checker
const checkAuthority = (requiredAuthority) => {
  return (req, res, next) => {
    try {
      // Extract manager info from request (assuming it was set by auth middleware)
      const managerEmail = req.managerEmail || req.headers['manager-email'];
      
      if (!managerEmail) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Load teachers data instead of managers
      const teachersPath = path.join(__dirname, '../data/teachers.json');
      const teachersData = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
      const currentUser = teachersData.find(t => t.email.toLowerCase() === managerEmail.toLowerCase());
      
      if (!currentUser) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Map the required authority to actual authority strings
      const authorityMap = {
        'canAddTeachers': 'Add new teachers',
        'canEditTeachers': 'Edit Existing Teachers',
        'canDeleteTeachers': 'Delete Teachers',
        'canManageRequests': 'Accept and Reject Teachers\' Requests',
        'canDownloadReports': 'Download Reports',
        'canAccessPortal': 'Access Manager Portal'
      };

      const requiredAuthorityString = authorityMap[requiredAuthority] || requiredAuthority;

      // Check if user has the required authority
      if (!currentUser.authorities || !currentUser.authorities.includes(requiredAuthorityString)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required authority: ${requiredAuthority}`
        });
      }

      // Store user info for use in route handlers
      req.currentManager = currentUser;
      req.currentUser = currentUser;
      next();
    } catch (error) {
      console.error('Authority check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// Specific authority middleware functions
const checkAddTeacherAuthority = checkAuthority('canAddTeachers');
const checkEditTeacherAuthority = checkAuthority('canEditTeachers');
const checkManageRequestsAuthority = checkAuthority('canManageRequests');
const checkDownloadReportsAuthority = checkAuthority('canDownloadReports');
const checkManageAuthoritiesPermission = checkAuthority('canManageAuthorities');

// Combined authority checker (user must have ANY of the specified authorities)
const checkAnyAuthority = (authorities) => {
  return (req, res, next) => {
    try {
      const managerEmail = req.managerEmail || req.headers['manager-email'];
      
      if (!managerEmail) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const managers = loadManagers();
      const manager = managers.find(m => m.email.toLowerCase() === managerEmail.toLowerCase());
      
      if (!manager) {
        return res.status(401).json({
          success: false,
          message: 'Manager not found'
        });
      }

      // Check if manager has any of the required authorities
      const hasAuthority = authorities.some(auth => 
        manager.authorities && manager.authorities[auth]
      );

      if (!hasAuthority) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required one of: ${authorities.join(', ')}`
        });
      }

      req.currentManager = manager;
      next();
    } catch (error) {
      console.error('Authority check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// Portal access middleware (basic authentication check)
const checkPortalAccess = (req, res, next) => {
  try {
    const managerEmail = req.managerEmail || req.headers['manager-email'];
    
    if (!managerEmail) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Load teachers data instead of managers
    const teachersPath = path.join(__dirname, '../data/teachers.json');
    const teachersData = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
    const currentUser = teachersData.find(t => t.email.toLowerCase() === managerEmail.toLowerCase());
    
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check basic portal access
    if (!currentUser.authorities || !currentUser.authorities.includes('Access Manager Portal')) {
      return res.status(403).json({
        success: false,
        message: 'Portal access denied'
      });
    }

    req.currentManager = currentUser;
    req.currentUser = currentUser;
    next();
  } catch (error) {
    console.error('Portal access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  checkAuthority,
  checkAddTeacherAuthority,
  checkEditTeacherAuthority,
  checkManageRequestsAuthority,
  checkDownloadReportsAuthority,
  checkManageAuthoritiesPermission,
  checkAnyAuthority,
  checkPortalAccess
}; 