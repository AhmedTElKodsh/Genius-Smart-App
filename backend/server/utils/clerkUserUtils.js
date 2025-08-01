const fs = require('fs');
const path = require('path');

/**
 * Utility functions for managing Clerk users and roles
 */

// Load existing teachers and managers data
const loadTeachers = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/teachers.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading teachers:', error);
    return [];
  }
};

const loadManagers = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/managers.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading managers:', error);
    return [];
  }
};

/**
 * Determine user role based on email domain or existing records
 * @param {string} email - User's email address
 * @param {object} clerkUser - Clerk user object
 * @returns {object} Role information
 */
const determineUserRole = (email, clerkUser) => {
  const teachers = loadTeachers();
  const managers = loadManagers();

  // Check if user exists in teachers database
  const existingTeacher = teachers.find(t => 
    t.email.toLowerCase() === email.toLowerCase()
  );

  if (existingTeacher) {
    return {
      role: 'teacher',
      id: existingTeacher.id,
      name: existingTeacher.name,
      subject: existingTeacher.subject,
      department: existingTeacher.department,
      existing: true
    };
  }

  // Check if user exists in managers database
  const existingManager = managers.find(m => 
    m.email.toLowerCase() === email.toLowerCase()
  );

  if (existingManager) {
    return {
      role: 'manager',
      id: existingManager.id,
      name: existingManager.name,
      position: existingManager.position,
      permissions: existingManager.permissions || [],
      existing: true
    };
  }

  // For new users, determine role based on email domain or metadata
  // You can customize this logic based on your organization's needs
  if (email.includes('@admin.') || email.includes('@manager.')) {
    return {
      role: 'manager',
      existing: false,
      needsApproval: true
    };
  }

  // Default to teacher role for new users
  return {
    role: 'teacher',
    existing: false,
    needsApproval: true
  };
};

/**
 * Create a new teacher record from Clerk user data
 * @param {object} clerkUser - Clerk user object
 * @param {object} roleInfo - Role information
 * @returns {object} New teacher record
 */
const createTeacherFromClerkUser = (clerkUser, roleInfo) => {
  const newTeacher = {
    id: clerkUser.id, // Use Clerk user ID
    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New Teacher',
    email: clerkUser.emailAddresses[0].emailAddress,
    subject: roleInfo.subject || 'Unassigned',
    department: roleInfo.department || 'Unassigned',
    phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || '',
    dateJoined: new Date().toISOString().split('T')[0],
    status: 'pending', // Requires admin approval
    clerkUserId: clerkUser.id,
    password: null // No password needed with Clerk
  };

  return newTeacher;
};

/**
 * Create a new manager record from Clerk user data
 * @param {object} clerkUser - Clerk user object
 * @param {object} roleInfo - Role information
 * @returns {object} New manager record
 */
const createManagerFromClerkUser = (clerkUser, roleInfo) => {
  const newManager = {
    id: clerkUser.id, // Use Clerk user ID
    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New Manager',
    email: clerkUser.emailAddresses[0].emailAddress,
    position: roleInfo.position || 'Manager',
    phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || '',
    dateJoined: new Date().toISOString().split('T')[0],
    permissions: roleInfo.permissions || ['view_dashboard'],
    status: 'pending', // Requires admin approval
    clerkUserId: clerkUser.id
  };

  return newManager;
};

/**
 * Update Clerk user metadata with role information
 * @param {string} clerkUserId - Clerk user ID
 * @param {object} roleData - Role data to store in metadata
 */
const updateClerkUserMetadata = async (clerkUserId, roleData) => {
  try {
    // This would typically use the Clerk Backend API
    // For now, we'll store it locally and sync later
    console.log(`📝 Update Clerk metadata for ${clerkUserId}:`, roleData);
    
    // In production, you would use:
    // const { clerkClient } = require('@clerk/express');
    // await clerkClient.users.updateUserMetadata(clerkUserId, {
    //   publicMetadata: roleData
    // });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating Clerk metadata:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Middleware to check if user has required role
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {function} Express middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.auth?.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const email = user.emailAddresses?.[0]?.emailAddress;
      const roleInfo = determineUserRole(email, user);

      if (!allowedRoles.includes(roleInfo.role)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          requiredRoles: allowedRoles,
          userRole: roleInfo.role
        });
      }

      // Add role info to request for use in route handlers
      req.userRole = roleInfo;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify user role'
      });
    }
  };
};

module.exports = {
  determineUserRole,
  createTeacherFromClerkUser,
  createManagerFromClerkUser,
  updateClerkUserMetadata,
  requireRole,
  loadTeachers,
  loadManagers
}; 