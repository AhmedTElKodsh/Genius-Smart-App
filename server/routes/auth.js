const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../utils/emailService');

// Store reset tokens temporarily (in production, use Redis or database)
const resetTokens = new Map();

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

// Save managers data
const saveManagers = (managers) => {
  try {
    const managersPath = path.join(__dirname, '..', 'data', 'managers.json');
    fs.writeFileSync(managersPath, JSON.stringify(managers, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving managers:', error);
    return false;
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

// Save teachers data
const saveTeachers = (teachers) => {
  try {
    const teachersPath = path.join(__dirname, '..', 'data', 'teachers.json');
    fs.writeFileSync(teachersPath, JSON.stringify(teachers, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving teachers:', error);
    return false;
  }
};

// Generate reset token
const generateResetToken = (email, userType) => {
  const token = jwt.sign(
    { email, userType, timestamp: Date.now() },
    process.env.JWT_SECRET || 'genius-smart-secret-key',
    { expiresIn: process.env.RESET_TOKEN_EXPIRY || '1h' }
  );
  return token;
};

// Verify reset token
const verifyResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'genius-smart-secret-key');
    return decoded;
  } catch (error) {
    return null;
  }
};

// Manager authentication (Updated for 3-tier system)
router.post('/manager/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔍 Manager signin attempt:', { email, password: password.substring(0, 3) + '***' });

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const teachers = loadTeachers();
    console.log('📊 Total teachers loaded:', teachers.length);
    
    // Find user by email (can be Admin, Manager, or Employee with manager portal access)
    const user = teachers.find(t => t.email.toLowerCase() === email.toLowerCase());
    console.log('👤 User found:', user ? `${user.name} (${user.email})` : 'Not found');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('🔐 User has manager portal access:', user.canAccessManagerPortal);
    // Check if user has manager portal access
    if (!user.canAccessManagerPortal) {
      console.log('❌ Access denied - no manager portal access');
      return res.status(401).json({
        success: false,
        message: 'Access denied. Manager portal access required.'
      });
    }

    console.log('🔑 Checking password...');
    console.log('Stored hash:', user.password.substring(0, 20) + '...');
    console.log('Plain password from DB:', user.plainPassword);
    
    // Check password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('✅ Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (user.status !== 'Active') {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled. Please contact administrator.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        roleLevel: user.roleLevel
      },
      process.env.JWT_SECRET || 'genius-smart-secret-key',
      { expiresIn: '24h' }
    );

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        manager: {
          id: user.id,
          name: user.name,
          nameArabic: user.name, // Since names are already in Arabic
          email: user.email,
          role: user.role,
          roleName: user.roleName,
          roleNameAr: user.roleNameAr,
          department: user.subject,
          managerLevel: user.roleLevel,
          authorities: user.authorities,
          canAccessManagerPortal: user.canAccessManagerPortal,
          canAccessTeacherPortal: user.canAccessTeacherPortal
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

// Manager password reset request
router.post('/manager/reset-password-request', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const managers = loadManagers();
    const manager = managers.find(m => m.email.toLowerCase() === email.toLowerCase());
    
    if (!manager) {
      // For security, don't reveal if email exists
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = generateResetToken(email, 'manager');
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/manager/reset-password?token=${resetToken}`;
    
    // Store token temporarily
    resetTokens.set(resetToken, {
      email: email,
      userType: 'manager',
      createdAt: Date.now()
    });

    // Send reset email
    const emailResult = await sendPasswordResetEmail(email, resetLink, 'Manager', manager.name);
    
    if (emailResult.success) {
      console.log(`📧 Password reset email sent to manager: ${email}`);
      res.json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } else {
      console.error('Failed to send password reset email:', emailResult.error);
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email'
      });
    }

  } catch (error) {
    console.error('Manager password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Manager password reset confirm
router.post('/manager/reset-password-confirm', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Verify token
    const decoded = verifyResetToken(token);
    if (!decoded || decoded.userType !== 'manager') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const managers = loadManagers();
    const managerIndex = managers.findIndex(m => m.email.toLowerCase() === decoded.email.toLowerCase());
    
    if (managerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found'
      });
    }

    // Update password (note: for this demo, storing plain text - in production, hash the password)
    managers[managerIndex].password = newPassword;
    managers[managerIndex].updatedAt = new Date().toISOString();

    // Save updated managers
    const saved = saveManagers(managers);
    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    // Remove the used token
    resetTokens.delete(token);

    console.log(`✅ Manager password reset successful: ${decoded.email}`);

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Manager password reset confirm error:', error);
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
    if (parts.length < 3) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    const managerId = parts.slice(1, -1).join('_');
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
          permissions: manager.permissions,
          managerLevel: manager.managerLevel,
          canManageTeachers: manager.canManageTeachers,
          canViewAllRequests: manager.canViewAllRequests,
          canManageManagers: manager.canManageManagers
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

// Teacher authentication
router.post('/teacher/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const teachers = loadTeachers();
    
    // Find teacher by email
    const teacher = teachers.find(t => t.email.toLowerCase() === email.toLowerCase());
    
    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, teacher.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (teacher.status !== 'Active') {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled. Please contact administrator.'
      });
    }

    // Generate a simple token (in production, use JWT)
    const token = `gse_teacher_${teacher.id}_${Date.now()}`;

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        teacher: {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          subject: teacher.subject,
          workType: teacher.workType,
          phone: teacher.phone,
          employmentDate: teacher.employmentDate,
          joinDate: teacher.joinDate,
          allowedAbsenceDays: teacher.allowedAbsenceDays
        }
      }
    });

  } catch (error) {
    console.error('Teacher signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Teacher password reset request
router.post('/teacher/reset-password-request', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const teachers = loadTeachers();
    const teacher = teachers.find(t => t.email.toLowerCase() === email.toLowerCase());
    
    if (!teacher) {
      // For security, don't reveal if email exists
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = generateResetToken(email, 'teacher');
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/teacher/reset-password?token=${resetToken}`;
    
    // Store token temporarily
    resetTokens.set(resetToken, {
      email: email,
      userType: 'teacher',
      createdAt: Date.now()
    });

    // Send reset email
    const emailResult = await sendPasswordResetEmail(email, resetLink, 'Teacher', teacher.name);
    
    if (emailResult.success) {
      console.log(`📧 Password reset email sent to teacher: ${email}`);
      res.json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } else {
      console.error('Failed to send password reset email:', emailResult.error);
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email'
      });
    }

  } catch (error) {
    console.error('Teacher password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Teacher password reset confirm
router.post('/teacher/reset-password-confirm', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Verify token
    const decoded = verifyResetToken(token);
    if (!decoded || decoded.userType !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const teachers = loadTeachers();
    const teacherIndex = teachers.findIndex(t => t.email.toLowerCase() === decoded.email.toLowerCase());
    
    if (teacherIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    teachers[teacherIndex].password = hashedPassword;
    teachers[teacherIndex].updatedAt = new Date().toISOString();

    // Save updated teachers
    const saved = saveTeachers(teachers);
    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    // Remove the used token
    resetTokens.delete(token);

    console.log(`✅ Teacher password reset successful: ${decoded.email}`);

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Teacher password reset confirm error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Teacher OTP sending (placeholder)
router.post('/teacher/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const teachers = loadTeachers();
    const teacher = teachers.find(t => t.email.toLowerCase() === email.toLowerCase());
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // In a real application, generate and send OTP
    // For now, return success
    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        otp: '123456' // Demo OTP
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Teacher OTP verification (placeholder)
router.post('/teacher/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // In a real application, verify OTP from database/cache
    // For now, accept demo OTP
    if (otp === '123456') {
      res.json({
        success: true,
        message: 'OTP verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Teacher password reset (placeholder)
router.post('/teacher/reset-password', async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    if (!email || !newPassword || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email, new password, and OTP are required'
      });
    }

    // In a real application, verify OTP and update password
    // For now, return success
    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Teacher logout
router.post('/teacher/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router; 