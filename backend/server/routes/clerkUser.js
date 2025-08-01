const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { requireAuth } = require('@clerk/express');
const {
  determineUserRole,
  createTeacherFromClerkUser,
  createManagerFromClerkUser,
  updateClerkUserMetadata,
  requireRole,
  loadTeachers,
  loadManagers
} = require('../utils/clerkUserUtils');

// Save data functions
const saveTeachers = (teachers) => {
  try {
    fs.writeFileSync(
      path.join(__dirname, '../data/teachers.json'),
      JSON.stringify(teachers, null, 2)
    );
  } catch (error) {
    console.error('Error saving teachers:', error);
    throw error;
  }
};

const saveManagers = (managers) => {
  try {
    fs.writeFileSync(
      path.join(__dirname, '../data/managers.json'),
      JSON.stringify(managers, null, 2)
    );
  } catch (error) {
    console.error('Error saving managers:', error);
    throw error;
  }
};

/**
 * GET /api/clerk/user/profile
 * Get current user profile with role information
 */
router.get('/profile', requireAuth(), async (req, res) => {
  try {
    const user = req.auth.user;
    const email = user.emailAddresses?.[0]?.emailAddress;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'User email not found'
      });
    }

    const roleInfo = determineUserRole(email, user);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        imageUrl: user.imageUrl,
        role: roleInfo.role,
        existing: roleInfo.existing,
        needsApproval: roleInfo.needsApproval,
        ...roleInfo
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
});

/**
 * POST /api/clerk/user/register
 * Register a new user and sync with local database
 */
router.post('/register', requireAuth(), async (req, res) => {
  try {
    const user = req.auth.user;
    const { role, additionalInfo } = req.body;
    const email = user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'User email not found'
      });
    }

    const roleInfo = determineUserRole(email, user);

    // If user already exists, return their info
    if (roleInfo.existing) {
      return res.json({
        success: true,
        message: 'User already registered',
        user: roleInfo,
        redirect: roleInfo.role === 'teacher' ? '/teacher/home' : '/dashboard'
      });
    }

    // Create new user record based on role
    let newUserRecord;
    let savedSuccessfully = false;

    if (role === 'teacher' || roleInfo.role === 'teacher') {
      const teachers = loadTeachers();
      newUserRecord = createTeacherFromClerkUser(user, {
        ...roleInfo,
        ...additionalInfo
      });
      
      teachers.push(newUserRecord);
      saveTeachers(teachers);
      savedSuccessfully = true;

    } else if (role === 'manager' || roleInfo.role === 'manager') {
      const managers = loadManagers();
      newUserRecord = createManagerFromClerkUser(user, {
        ...roleInfo,
        ...additionalInfo
      });
      
      managers.push(newUserRecord);
      saveManagers(managers);
      savedSuccessfully = true;
    }

    if (savedSuccessfully) {
      // Update Clerk user metadata
      await updateClerkUserMetadata(user.id, {
        role: newUserRecord.role || role,
        localId: newUserRecord.id,
        status: newUserRecord.status
      });

      res.json({
        success: true,
        message: 'User registered successfully',
        user: newUserRecord,
        needsApproval: newUserRecord.status === 'pending'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid role specified'
      });
    }

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user'
    });
  }
});

/**
 * PUT /api/clerk/user/approve/:clerkUserId
 * Approve a pending user (Admin only)
 */
router.put('/approve/:clerkUserId', requireAuth(), requireRole(['manager']), async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const { role } = req.body;

    let userFound = false;
    let updatedUser = null;

    if (role === 'teacher') {
      const teachers = loadTeachers();
      const teacherIndex = teachers.findIndex(t => t.clerkUserId === clerkUserId);
      
      if (teacherIndex !== -1) {
        teachers[teacherIndex].status = 'active';
        saveTeachers(teachers);
        updatedUser = teachers[teacherIndex];
        userFound = true;
      }
    } else if (role === 'manager') {
      const managers = loadManagers();
      const managerIndex = managers.findIndex(m => m.clerkUserId === clerkUserId);
      
      if (managerIndex !== -1) {
        managers[managerIndex].status = 'active';
        saveManagers(managers);
        updatedUser = managers[managerIndex];
        userFound = true;
      }
    }

    if (userFound) {
      // Update Clerk metadata
      await updateClerkUserMetadata(clerkUserId, {
        status: 'active',
        approvedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'User approved successfully',
        user: updatedUser
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve user'
    });
  }
});

/**
 * GET /api/clerk/user/pending
 * Get all pending users (Admin only)
 */
router.get('/pending', requireAuth(), requireRole(['manager']), (req, res) => {
  try {
    const teachers = loadTeachers();
    const managers = loadManagers();

    const pendingTeachers = teachers
      .filter(t => t.status === 'pending')
      .map(t => ({ ...t, role: 'teacher' }));

    const pendingManagers = managers
      .filter(m => m.status === 'pending')
      .map(m => ({ ...m, role: 'manager' }));

    const pendingUsers = [...pendingTeachers, ...pendingManagers];

    res.json({
      success: true,
      pendingUsers,
      count: pendingUsers.length
    });

  } catch (error) {
    console.error('Error getting pending users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pending users'
    });
  }
});

/**
 * GET /api/clerk/user/role-redirect
 * Get appropriate redirect URL based on user role
 */
router.get('/role-redirect', requireAuth(), (req, res) => {
  try {
    const user = req.auth.user;
    const email = user.emailAddresses?.[0]?.emailAddress;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'User email not found'
      });
    }

    const roleInfo = determineUserRole(email, user);

    let redirectUrl = '/';
    
    if (roleInfo.existing) {
      if (roleInfo.role === 'teacher') {
        redirectUrl = '/teacher/home';
      } else if (roleInfo.role === 'manager') {
        redirectUrl = '/dashboard';
      }
    } else {
      // New user needs to complete registration
      redirectUrl = '/register';
    }

    res.json({
      success: true,
      role: roleInfo.role,
      existing: roleInfo.existing,
      redirectUrl,
      needsApproval: roleInfo.needsApproval
    });

  } catch (error) {
    console.error('Error determining role redirect:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to determine redirect'
    });
  }
});

module.exports = router; 