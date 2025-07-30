const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

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
    console.log('🔍 extractUserAndRole middleware called');
    console.log('📋 Headers:', req.headers.authorization);
    
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🎫 Token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided'
      });
    }

    let userId;
    
    // Handle two token types: custom gse_ tokens and JWT tokens
    if (token.startsWith('gse_')) {
      console.log('🔧 Using custom GSE token format');
      // Custom token format: gse_userId_timestamp
      const parts = token.split('_');
      if (parts.length < 3) {
        console.log('❌ Invalid GSE token format');
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Invalid token format'
        });
      }
      userId = parts.slice(1, -1).join('_');
      console.log('👤 GSE User ID:', userId);
    } else {
      console.log('🔧 Using JWT token format');
      // JWT token format
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'genius-smart-secret-key');
        userId = decoded.userId;
        console.log('👤 JWT User ID:', userId);
        console.log('🎯 JWT Decoded:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
      } catch (jwtError) {
        console.error('❌ JWT verification error:', jwtError.message);
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Invalid token'
        });
      }
    }
    
    // Load user data
    const teachers = loadTeachers();
    let user = teachers.find(t => t.id === userId);
    
    // If not found in teachers, check managers
    if (!user) {
      const managersPath = path.join(__dirname, '..', 'data', 'managers.json');
      try {
        const managers = JSON.parse(fs.readFileSync(managersPath, 'utf8'));
        const manager = managers.find(m => m.id === userId);
        if (manager) {
          // Convert manager data to user format
          user = {
            id: manager.id,
            name: manager.name,
            email: manager.email,
            status: manager.status,
            role: manager.role,
            roleLevel: manager.managerLevel === 'admin' ? 3 : 2,
            roleName: manager.systemRole || 'Manager',
            roleNameAr: manager.systemRole === 'Admin' ? 'مسؤول' : 'مدير',
            systemRole: manager.systemRole,
            authorities: Object.keys(manager.authorities || {}).filter(k => manager.authorities[k]),
            canAccessManagerPortal: true,
            canAccessTeacherPortal: false,
            canApproveRequests: manager.authorities?.canManageRequests || false,
            canApproveManagerRequests: manager.systemRole === 'Admin',
            canRevokeActions: manager.systemRole === 'Admin',
            canViewAuditTrail: manager.systemRole === 'Admin',
            isPerformanceTracked: false
          };
        }
      } catch (error) {
        console.error('Error loading managers:', error);
      }
    }

    console.log('🔍 Looking for user with ID:', userId);
    console.log('👥 Total teachers loaded:', teachers.length);
    console.log('👤 User found:', user ? `${user.name} (${user.email})` : 'NOT FOUND');

    if (!user || user.status !== 'Active') {
      console.log('❌ User not found or inactive');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not found or inactive'
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleLevel: user.roleLevel,
      roleName: user.roleName,
      roleNameAr: user.roleNameAr,
      systemRole: user.systemRole || (user.roleLevel === 3 ? 'Admin' : 'Manager'),
      authorities: user.authorities,
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

    // Check if user has the exact authority
    let hasAuthority = req.user.authorities.includes(authority);

    // Special handling for hierarchical request authorities
    if (!hasAuthority && authority === 'Accept and Reject Employee Requests') {
      // Admin with "Accept and Reject All Requests" can also approve employee requests
      hasAuthority = req.user.authorities.includes('Accept and Reject All Requests');
    }
    
    if (!hasAuthority && authority === 'Accept and Reject Manager Requests') {
      // Admin with "Accept and Reject All Requests" can also approve manager requests
      hasAuthority = req.user.authorities.includes('Accept and Reject All Requests');
    }

    if (!hasAuthority) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required authority: ${authority}`,
        userAuthorities: req.user.authorities
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