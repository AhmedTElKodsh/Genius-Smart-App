const express = require('express');
const fs = require('fs');
const path = require('path');
const {
  checkManageAuthoritiesPermission
} = require('../middleware/authorityMiddleware');
const router = express.Router();

// Extract manager email from token for authority middleware
const extractManagerEmail = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !token.startsWith('gse_')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token'
      });
    }

    const parts = token.split('_');
    if (parts.length < 3) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token format'
      });
    }

    const managerId = parts.slice(1, -1).join('_');
    
    const managersPath = path.join(__dirname, '..', 'data', 'managers.json');
    const managersData = fs.readFileSync(managersPath, 'utf8');
    const managers = JSON.parse(managersData);
    const manager = managers.find(m => m.id === managerId);

    if (!manager || !manager.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Manager not found or inactive'
      });
    }

    req.managerEmail = manager.email;
    next();

  } catch (error) {
    console.error('Error extracting manager email:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper functions
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

// GET /api/authorities/available - Get list of available authorities
router.get('/available', extractManagerEmail, checkManageAuthoritiesPermission, (req, res) => {
  try {
    const availableAuthorities = {
      canAccessPortal: {
        name: 'Access Manager Portal',
        nameArabic: 'الوصول إلى بوابة المدير',
        description: 'Allows access to the manager portal and inside pages',
        descriptionArabic: 'يسمح بالوصول إلى بوابة المدير والصفحات الداخلية'
      },
      canAddTeachers: {
        name: 'Add New Teachers',
        nameArabic: 'إضافة مدرسين جدد',
        description: 'Allows adding new teachers to the system',
        descriptionArabic: 'يسمح بإضافة مدرسين جدد إلى النظام'
      },
      canEditTeachers: {
        name: 'Edit Teachers Info',
        nameArabic: 'تعديل معلومات المدرسين',
        description: 'Allows editing existing teacher information',
        descriptionArabic: 'يسمح بتعديل معلومات المدرسين الحاليين'
      },
      canManageRequests: {
        name: 'Accept and Reject Requests',
        nameArabic: 'قبول ورفض الطلبات',
        description: 'Allows accepting and rejecting teacher requests',
        descriptionArabic: 'يسمح بقبول ورفض طلبات المدرسين'
      },
      canDownloadReports: {
        name: 'Download Reports',
        nameArabic: 'تحميل التقارير',
        description: 'Allows downloading various reports',
        descriptionArabic: 'يسمح بتحميل التقارير المختلفة'
      },
      canManageAuthorities: {
        name: 'Manage Authorities',
        nameArabic: 'إدارة الصلاحيات',
        description: 'Admin only - allows managing other users authorities',
        descriptionArabic: 'للمدير فقط - يسمح بإدارة صلاحيات المستخدمين الآخرين'
      }
    };

    res.json({
      success: true,
      data: availableAuthorities
    });

  } catch (error) {
    console.error('Error fetching available authorities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available authorities'
    });
  }
});

// PUT /api/authorities/teacher/:id - Update teacher authorities
router.put('/teacher/:id', extractManagerEmail, checkManageAuthoritiesPermission, (req, res) => {
  try {
    const teacherId = req.params.id;
    const { authorities } = req.body;

    const teachers = loadTeachers();
    const teacherIndex = teachers.findIndex(t => t.id === teacherId);

    if (teacherIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Validate authorities object
    if (!authorities || typeof authorities !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid authorities data'
      });
    }

    // Update teacher with authorities
    teachers[teacherIndex].authorities = authorities;
    teachers[teacherIndex].updatedAt = new Date().toISOString();

    // Determine management level based on authorities
    const hasManagementAuthorities = Object.values(authorities).some(auth => auth === true);
    teachers[teacherIndex].managementLevel = hasManagementAuthorities ? 'member' : 'none';

    if (saveTeachers(teachers)) {
      res.json({
        success: true,
        message: 'Teacher authorities updated successfully',
        data: {
          id: teacherId,
          authorities: authorities,
          managementLevel: teachers[teacherIndex].managementLevel
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save teacher authorities'
      });
    }

  } catch (error) {
    console.error('Error updating teacher authorities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update teacher authorities'
    });
  }
});

// GET /api/authorities/teacher/:id - Get teacher authorities
router.get('/teacher/:id', extractManagerEmail, checkManageAuthoritiesPermission, (req, res) => {
  try {
    const teacherId = req.params.id;
    const teachers = loadTeachers();
    const teacher = teachers.find(t => t.id === teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: teacherId,
        name: teacher.name,
        email: teacher.email,
        authorities: teacher.authorities || {},
        managementLevel: teacher.managementLevel || 'none'
      }
    });

  } catch (error) {
    console.error('Error fetching teacher authorities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher authorities'
    });
  }
});

module.exports = router; 