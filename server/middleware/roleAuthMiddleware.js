const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Load system roles and hierarchy rules
const loadSystemRoles = () => {
  try {
    const rolesPath = path.join(__dirname, '../data/system_roles.json');
    return JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
  } catch (error) {
    console.error('Error loading system roles:', error);
    return null;
  }
};

// Load teachers data
const loadTeachers = () => {
  try {
    const teachersPath = path.join(__dirname, '../data/teachers.json');
    return JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
  } catch (error) {
    console.error('Error loading teachers:', error);
    return [];
  }
};

// Log action for audit trail
const logAction = async (actionData) => {
  try {
    const auditPath = path.join(__dirname, '../data/action_audit.json');
    const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
    
    const actionRecord = {
      actionId: uuidv4(),
      timestamp: new Date().toISOString(),
      ...actionData,
      canBeRevoked: actionData.userRole === 'MANAGER', // Only manager actions can be revoked by admin
      revokedAt: null,
      revokedBy: null,
      revokedReason: null
    };
    
    audit.actions.push(actionRecord);
    fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2), 'utf8');
    
    return actionRecord.actionId;
  } catch (error) {
    console.error('Error logging action:', error);
    return null;
  }
};

// Extract user info from token and verify role permissions
const extractUserAndRole = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided'
      });
    }

    let userId, userEmail, userRole;
    
    // Check if it's a JWT token
    if (token.includes('.')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'genius-smart-secret-key');
        userId = decoded.userId;
        userEmail = decoded.email;
        userRole = decoded.role;
        // Extract authorities from token if available
        req.tokenAuthorities = decoded.authorities || [];
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Invalid token'
        });
      }
    } else if (token.startsWith('gse_')) {
      // Handle old format tokens
      const parts = token.split('_');
      if (parts.length < 3) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Invalid token format'
        });
      }
      userId = parts.slice(1, -1).join('_');
    } else {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token format'
      });
    }
    
    // Load user data
    const teachers = loadTeachers();
    const user = teachers.find(t => t.id === userId || t.email === userEmail);

    if (!user || user.status !== 'Active') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not found or inactive'
      });
    }

    // Attach user info to request
    // Use authorities from token if available, otherwise use from user data
    const authorities = req.tokenAuthorities && req.tokenAuthorities.length > 0 
      ? req.tokenAuthorities 
      : (user.authorities || []);
    
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleLevel: user.roleLevel,
      roleName: user.roleName,
      roleNameAr: user.roleNameAr,
      authorities: authorities,
      canAccessManagerPortal: user.canAccessManagerPortal,
      canAccessTeacherPortal: user.canAccessTeacherPortal,
      canApproveRequests: user.canApproveRequests,
      canApproveManagerRequests: user.canApproveManagerRequests,
      canRevokeActions: user.canRevokeActions,
      canViewAuditTrail: user.canViewAuditTrail,
      isPerformanceTracked: user.isPerformanceTracked
    };

    next();

  } catch (error) {
    console.error('Error extracting user and role:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to require specific role level
const requireRole = (minRoleLevel) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated'
      });
    }

    if (req.user.roleLevel < minRoleLevel) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient role level',
        required: minRoleLevel,
        current: req.user.roleLevel
      });
    }

    next();
  };
};

// Middleware to require specific authority
const requireAuthority = (authority) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated'
      });
    }

    // Log for debugging
    console.log('Checking authority:', authority);
    console.log('User authorities:', req.user.authorities);
    console.log('User role:', req.user.role, req.user.roleName);
    
    if (!req.user.authorities || !req.user.authorities.includes(authority)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required authority: ${authority}`,
        userAuthorities: req.user.authorities || [],
        userRole: req.user.roleName,
        requiredAuthority: authority
      });
    }

    next();
  };
};

// Middleware for manager portal access
const requireManagerPortalAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: User not authenticated'
    });
  }

  if (!req.user.canAccessManagerPortal) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Manager portal access denied',
      userRole: req.user.roleName
    });
  }

  next();
};

// Middleware to log actions with audit trail
const auditAction = (actionType, targetType = 'system') => {
  return async (req, res, next) => {
    // Store original end function
    const originalEnd = res.end;
    
    // Override end function to capture response
    res.end = function(chunk, encoding) {
      // Log action if request was successful (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const actionData = {
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: actionType,
          targetType: targetType,
          targetId: req.params.id || req.body.id || 'N/A',
          targetName: req.body.name || req.params.name || 'Unknown',
          details: {
            method: req.method,
            url: req.originalUrl,
            body: req.body,
            params: req.params,
            query: req.query
          },
          originalData: req.originalData || null,
          newData: req.body || null
        };
        
        // Don't wait for logging to complete
        logAction(actionData).catch(err => {
          console.error('Audit logging failed:', err);
        });
      }
      
      // Call original end function
      originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
};

// Middleware to prevent managers from approving their own requests
const preventSelfApproval = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: User not authenticated'
    });
  }

  // Only apply to non-admin users
  if (req.user.role !== 'ADMIN') {
    const requestId = req.params.id;
    
    // Load and check if this is the user's own request
    try {
      const requestsPath = path.join(__dirname, '../data/requests.json');
      const requests = JSON.parse(fs.readFileSync(requestsPath, 'utf8'));
      const request = requests.find(r => r.id === requestId);
      
      if (request && request.teacherId === req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Cannot approve your own request',
          details: 'Manager requests must be approved by an Admin'
        });
      }
      
      // Also check manager requests
      const managerRequestsPath = path.join(__dirname, '../data/manager_requests.json');
      if (fs.existsSync(managerRequestsPath)) {
        const managerRequests = JSON.parse(fs.readFileSync(managerRequestsPath, 'utf8'));
        const managerRequest = managerRequests.requests.find(r => r.id === requestId);
        
        if (managerRequest && managerRequest.requesterId === req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: Cannot approve your own request',
            details: 'Manager requests must be approved by an Admin'
          });
        }
      }
      
    } catch (error) {
      console.error('Error checking self-approval:', error);
    }
  }

  next();
};

// Helper function to check if user can approve specific request type
const canApproveRequestType = (user, requestType, requesterId) => {
  // Admin can approve everything
  if (user.role === 'ADMIN') {
    return true;
  }
  
  // Manager can only approve employee requests (not their own or other manager requests)
  if (user.role === 'MANAGER') {
    // Cannot approve own requests
    if (requesterId === user.id) {
      return false;
    }
    
    // Load requester to check their role
    const teachers = loadTeachers();
    const requester = teachers.find(t => t.id === requesterId);
    
    if (requester) {
      // Can only approve employee requests
      return requester.role === 'EMPLOYEE';
    }
  }
  
  return false;
};

// Role constants for easy use
const ROLES = {
  ADMIN: 3,
  MANAGER: 2,
  EMPLOYEE: 1
};

module.exports = {
  extractUserAndRole,
  requireRole,
  requireAuthority,
  requireManagerPortalAccess,
  auditAction,
  preventSelfApproval,
  canApproveRequestType,
  logAction,
  ROLES
}; 