const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const router = express.Router();

// Helper function to read and parse manager data
function getManagerData() {
  try {
    const filePath = path.join(__dirname, '../data/manager.json');
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    
    // If file doesn't exist, create default manager profile
    const defaultManager = {
      id: uuidv4(),
      firstName: 'Admin',
      lastName: 'Manager',
      email: 'admin@geniussmart.com',
      phone: '+1234567890',
      address: 'Cairo, Egypt',
      dateOfBirth: {
        day: '01',
        month: '01',
        year: '1990'
      },
      profileImage: '',
      role: 'Manager',
      // Default notification preferences
      notifications: {
        allNotifications: true,
        earlyArrival: true,
        lateArrival: true,
        earlyLeaves: true,
        lateLeaves: true,
        absentsTeachers: true,
        dailyReports: true,
        weeklyReports: true,
        monthlyReports: true,
        yearlyReports: true
      },
      // Default password (should be hashed in production)
      passwordHash: '$2b$10$default.hash.for.demo.purposes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    saveManagerData(defaultManager);
    return defaultManager;
    
  } catch (error) {
    console.error('Error reading manager data:', error);
    return null;
  }
}

// Helper function to save manager data
function saveManagerData(manager) {
  try {
    const dataDir = path.join(__dirname, '../data');
    const filePath = path.join(dataDir, 'manager.json');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(manager, null, 2), 'utf8');
    console.log('Manager profile saved successfully');
    
  } catch (error) {
    console.error('Error saving manager data:', error);
  }
}

// Email transporter configuration
const createEmailTransporter = () => {
  // For demo purposes, using a test configuration
  // In production, use actual SMTP settings
  return nodemailer.createTransport({
    host: 'smtp.gmail.com', // Replace with actual SMTP host
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'demo@geniussmart.com',
      pass: process.env.EMAIL_PASS || 'demo-password'
    }
  });
};

// Function to send notification email
const sendNotificationEmail = async (notificationType, requestData) => {
  try {
    const manager = getManagerData();
    
    if (!manager || !manager.notifications) {
      console.log('Manager notifications not configured');
      return false;
    }
    
    // Check if notifications are enabled
    if (!manager.notifications.allNotifications) {
      console.log('All notifications disabled');
      return false;
    }
    
    // Check specific notification type
    const notificationKey = getNotificationKey(notificationType);
    if (notificationKey && !manager.notifications[notificationKey]) {
      console.log(`${notificationType} notifications disabled`);
      return false;
    }
    
    // For demo purposes, just log the email instead of actually sending
    console.log('📧 EMAIL NOTIFICATION SENT:');
    console.log(`To: ${manager.email}`);
    console.log(`Subject: New ${notificationType} Request`);
    console.log(`Content: Teacher ${requestData.name} has submitted a ${notificationType} request`);
    console.log(`Duration: ${requestData.duration}`);
    console.log(`Reason: ${requestData.reason}`);
    console.log('-------------------');
    
    // In production, uncomment this to actually send emails:
    /*
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@geniussmart.com',
      to: manager.email,
      subject: `New ${notificationType} Request - Genius Smart Education`,
      html: `
        <h2>New Request Notification</h2>
        <p><strong>Teacher:</strong> ${requestData.name}</p>
        <p><strong>Request Type:</strong> ${notificationType}</p>
        <p><strong>Duration:</strong> ${requestData.duration}</p>
        <p><strong>Applied Date:</strong> ${requestData.appliedDate}</p>
        <p><strong>Reason:</strong> ${requestData.reason}</p>
        <br>
        <p>Please log in to the Genius Smart Education system to review and approve this request.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    */
    
    return true;
  } catch (error) {
    console.error('Error sending notification email:', error);
    return false;
  }
};

// Helper function to map request types to notification keys
const getNotificationKey = (requestType) => {
  const mapping = {
    'Early Leave': 'earlyLeaves',
    'Late Leave': 'lateLeaves',
    'Absence': 'absentsTeachers',
    'Early Arrival': 'earlyArrival',
    'Late Arrival': 'lateArrival'
  };
  return mapping[requestType];
};

// Middleware to verify authorization token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided or invalid format'
    });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  // For this demo, we'll use a simple token validation
  // In production, you'd verify JWT tokens properly
  if (!token || token.length < 10) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  // Add user info to request (in production, decode from JWT)
  req.user = { id: 'manager', role: 'manager' };
  next();
};

// GET /api/manager/profile - Get manager profile
router.get('/profile', verifyToken, (req, res) => {
  try {
    const manager = getManagerData();
    
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager profile not found'
      });
    }
    
    // Remove sensitive information
    const profileData = { ...manager };
    delete profileData.passwordHash;
    
    res.json({
      success: true,
      message: 'Manager profile retrieved successfully',
      data: profileData
    });
    
  } catch (error) {
    console.error('Error fetching manager profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch manager profile',
      error: error.message
    });
  }
});

// PUT /api/manager/profile - Update manager profile
router.put('/profile', verifyToken, (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      dateOfBirth,
      profileImage
    } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    const currentManager = getManagerData();
    
    if (!currentManager) {
      return res.status(404).json({
        success: false,
        message: 'Manager profile not found'
      });
    }
    
    // Update manager profile
    const updatedManager = {
      ...currentManager,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : currentManager.phone,
      address: address ? address.trim() : currentManager.address,
      dateOfBirth: dateOfBirth || currentManager.dateOfBirth,
      profileImage: profileImage || currentManager.profileImage,
      updatedAt: new Date().toISOString()
    };
    
    // Save updated profile
    saveManagerData(updatedManager);
    
    // Log profile update
    console.log(`Manager profile updated: ${updatedManager.email}`);
    
    // Remove sensitive information from response
    const responseData = { ...updatedManager };
    delete responseData.passwordHash;
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: responseData
    });
    
  } catch (error) {
    console.error('Error updating manager profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// GET /api/manager/notifications - Get notification preferences
router.get('/notifications', verifyToken, (req, res) => {
  try {
    const manager = getManagerData();
    
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager profile not found'
      });
    }
    
    // Ensure notifications object exists
    if (!manager.notifications) {
      manager.notifications = {
        allNotifications: true,
        earlyArrival: true,
        lateArrival: true,
        earlyLeaves: true,
        lateLeaves: true,
        absentsTeachers: true,
        dailyReports: true,
        weeklyReports: true,
        monthlyReports: true,
        yearlyReports: true
      };
      saveManagerData(manager);
    }
    
    res.json({
      success: true,
      message: 'Notification preferences retrieved successfully',
      data: manager.notifications
    });
    
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification preferences',
      error: error.message
    });
  }
});

// PUT /api/manager/notifications - Update notification preferences
router.put('/notifications', verifyToken, (req, res) => {
  try {
    const notifications = req.body;
    
    const manager = getManagerData();
    
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager profile not found'
      });
    }
    
    // Update notification preferences
    const updatedManager = {
      ...manager,
      notifications: {
        ...manager.notifications,
        ...notifications
      },
      updatedAt: new Date().toISOString()
    };
    
    saveManagerData(updatedManager);
    
    console.log('Notification preferences updated:', notifications);
    
    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: updatedManager.notifications
    });
    
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
});

// POST /api/manager/change-password - Change password
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required'
      });
    }
    
    // Validate new password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match'
      });
    }
    
    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }
    
    const manager = getManagerData();
    
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager profile not found'
      });
    }
    
    // For demo purposes, skip current password verification
    // In production, verify current password against stored hash:
    // const isCurrentPasswordValid = await bcrypt.compare(currentPassword, manager.passwordHash);
    
    // Hash the new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update manager with new password hash
    const updatedManager = {
      ...manager,
      passwordHash: newPasswordHash,
      updatedAt: new Date().toISOString()
    };
    
    saveManagerData(updatedManager);
    
    console.log('Manager password changed successfully');
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// POST /api/manager/test-notification - Test notification system
router.post('/test-notification', verifyToken, (req, res) => {
  try {
    const { requestType = 'Early Leave' } = req.body;
    
    // Create dummy request data for testing
    const dummyRequestData = {
      name: 'John Doe',
      requestType: requestType,
      duration: '23 July 2025',
      appliedDate: new Date().toISOString().split('T')[0],
      reason: 'Personal appointment - Testing notification system'
    };
    
    // Send test notification
    const sent = sendNotificationEmail(requestType, dummyRequestData);
    
    if (sent) {
      res.json({
        success: true,
        message: `Test ${requestType} notification sent successfully`,
        data: dummyRequestData
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test notification'
      });
    }
    
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
});

// Export the sendNotificationEmail function for use in other routes
router.sendNotificationEmail = sendNotificationEmail;

// POST /api/manager/upload-image - Upload profile image
router.post('/upload-image', verifyToken, (req, res) => {
  try {
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }
    
    // Validate base64 image data
    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format'
      });
    }
    
    const currentManager = getManagerData();
    
    if (!currentManager) {
      return res.status(404).json({
        success: false,
        message: 'Manager profile not found'
      });
    }
    
    // Update profile image
    const updatedManager = {
      ...currentManager,
      profileImage: imageData,
      updatedAt: new Date().toISOString()
    };
    
    saveManagerData(updatedManager);
    
    res.json({
      success: true,
      message: 'Profile image updated successfully',
      data: {
        profileImage: imageData
      }
    });
    
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// GET /api/manager/settings - Get manager settings
router.get('/settings', verifyToken, (req, res) => {
  try {
    const manager = getManagerData();
    
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager profile not found'
      });
    }
    
    // Return settings-specific information
    const settings = {
      notifications: manager.notifications || {
        allNotifications: true,
        earlyArrival: true,
        lateArrival: true,
        earlyLeaves: true,
        lateLeaves: true,
        absentsTeachers: true,
        dailyReports: true,
        weeklyReports: true,
        monthlyReports: true,
        yearlyReports: true
      },
      security: {
        twoFactorEnabled: false,
        lastPasswordChange: manager.updatedAt,
        loginAttempts: 0
      },
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC+2'
      }
    };
    
    res.json({
      success: true,
      message: 'Settings retrieved successfully',
      data: settings
    });
    
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
});

module.exports = router; 