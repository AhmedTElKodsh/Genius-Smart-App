const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { Teacher } = require('../models');
const {
  checkAddTeacherAuthority,
  checkEditTeacherAuthority,
  checkPortalAccess
} = require('../middleware/authorityMiddleware');
const { SYSTEM_LAYERS } = require('../scripts/implement3TierSystem');

// Helper function to load requests data
const getRequestsData = () => {
  try {
    const requestsPath = path.join(__dirname, '../data/requests.json');
    return JSON.parse(fs.readFileSync(requestsPath, 'utf8'));
  } catch (error) {
    console.error('Error loading requests:', error);
    return [];
  }
};

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

    // Extract manager ID from token and find manager email
    const parts = token.split('_');
    if (parts.length < 3) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token format'
      });
    }

    const managerId = parts.slice(1, -1).join('_');
    
    // Load manager data to get email
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

    // Set manager email for authority middleware
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

const teachersFilePath = path.join(__dirname, '..', 'data', 'teachers.json');
const attendanceFilePath = path.join(__dirname, '..', 'data', 'attendance.json');

// Helper function to read teachers data
const readTeachers = () => {
  try {
    const data = fs.readFileSync(teachersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper function to read attendance data
const readAttendance = () => {
  try {
    const data = fs.readFileSync(attendanceFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper function to write teachers data with UTF-8 encoding for Arabic support
const writeTeachers = (teachers) => {
  fs.writeFileSync(teachersFilePath, JSON.stringify(teachers, null, 2), 'utf8');
};

// GET /api/teachers - Get all teachers with optional filtering (filtered by user role)
router.get('/', (req, res) => {
  try {
    const teachers = readTeachers();
    const attendance = readAttendance();
    
    // Extract user role from token
    let userRole = 'EMPLOYEE';
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token && token.startsWith('gse_')) {
      const parts = token.split('_');
      if (parts.length >= 3) {
        const userId = parts.slice(1, -1).join('_');
        const user = teachers.find(t => t.id === userId);
        if (user) {
          userRole = user.role || 'EMPLOYEE';
        }
      }
    }
    
    // Apply filters
    let filteredTeachers = teachers;
    
    const { subject, workType, status, search } = req.query;
    
    if (subject) {
      filteredTeachers = filteredTeachers.filter(teacher => 
        teacher.subject.toLowerCase() === subject.toLowerCase()
      );
    }
    
    if (workType) {
      filteredTeachers = filteredTeachers.filter(teacher => 
        teacher.workType.toLowerCase() === workType.toLowerCase()
      );
    }
    
    if (status) {
      filteredTeachers = filteredTeachers.filter(teacher => 
        teacher.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredTeachers = filteredTeachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm) ||
        teacher.email.toLowerCase().includes(searchTerm) ||
        teacher.department.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply role-based filtering
    if (userRole !== 'ADMIN') {
      // Managers can only see non-Admin users
      filteredTeachers = filteredTeachers.filter(teacher => teacher.role !== 'ADMIN');
    }
    // Admins can see all users
    
    // Add current month attendance data to each teacher
    const currentMonth = 'May'; // Based on user requirement
    const teachersWithAttendance = filteredTeachers.map(teacher => {
      const currentAttendance = attendance.find(att => 
        att.teacherId === teacher.id && att.month === currentMonth
      );
      
      return {
        ...teacher,
        currentAttendance: currentAttendance || null
      };
    });
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedTeachers = teachersWithAttendance.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedTeachers,
      pagination: {
        total: teachersWithAttendance.length,
        page,
        limit,
        pages: Math.ceil(teachersWithAttendance.length / limit)
      },
      message: `Retrieved ${paginatedTeachers.length} teachers`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve teachers',
      details: error.message
    });
  }
});

// GET /api/teachers/me - Get current user info (must come before /:id routes)
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided'
      });
    }

    // Check if it's a JWT token or legacy gse_ token
    let userId;
    
    if (token.startsWith('gse_')) {
      // Legacy token format
      const parts = token.split('_');
      if (parts.length < 3) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Invalid token format'
        });
      }
      userId = parts.slice(1, -1).join('_');
    } else {
      // JWT token format
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'genius-smart-secret-key');
        userId = decoded.userId;
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Invalid token'
        });
      }
    }
    
    // Read teachers data
    const teachers = readTeachers();
    const user = teachers.find(t => t.id === userId);

    if (!user || user.status !== 'Active') {
      return res.status(404).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Return user info (excluding password)
    const { password, plainPassword, ...userInfo } = user;
    res.json({
      success: true,
      data: userInfo,
      role: user.role,
      roleName: user.roleName,
      roleNameAr: user.roleNameAr,
      authorities: user.authorities,
      canAccessManagerPortal: user.canAccessManagerPortal
    });

  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
      details: error.message
    });
  }
});

// Get teachers reports with attendance and request data
router.get('/reports', (req, res) => {
  try {
    const { subject, startDate, endDate } = req.query;
    
    // Load data files
    const teachers = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/teachers.json'), 'utf8'));
    const requests = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/requests.json'), 'utf8'));
    const attendance = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/attendance.json'), 'utf8'));

    // Filter teachers by subject if specified
    let filteredTeachers = teachers.filter(teacher => teacher.status === 'Active');
    if (subject) {
      filteredTeachers = filteredTeachers.filter(teacher => teacher.subject === subject);
    }

    // Parse date range
    const start = startDate ? new Date(startDate) : new Date('2025-01-01');
    const end = endDate ? new Date(endDate) : new Date();

    // Helper function to count working days between dates (excluding weekends)
    const countWorkingDays = (startDate, endDate) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      let count = 0;
      const current = new Date(start);
      
      while (current <= end) {
        // Skip weekends (Saturday = 6, Sunday = 0)
        const day = current.getDay();
        if (day !== 0 && day !== 6) { // Not Sunday or Saturday
          count++;
        }
        current.setDate(current.getDate() + 1);
      }
      return count;
    };

    // Helper function to calculate days from date range string
    const calculateDaysFromDateRange = (startDateStr, endDateStr) => {
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
      return diffDays;
    };

    // Generate reports for each teacher
    const reportsData = filteredTeachers.map(teacher => {
      // Filter attendance for this teacher within date range
      const teacherAttendance = attendance.filter(record => {
        const recordDate = new Date(record.date);
        return record.teacherId === teacher.id && 
               recordDate >= start && 
               recordDate <= end;
      });

      // Filter requests for this teacher within date range
      const teacherRequests = requests.filter(request => {
        const requestStart = new Date(request.startDate);
        const requestEnd = new Date(request.endDate);
        return request.teacherId === teacher.id && 
               ((requestStart >= start && requestStart <= end) ||
                (requestEnd >= start && requestEnd <= end) ||
                (requestStart <= start && requestEnd >= end));
      });

      // Calculate attendance statistics
      const presentDays = teacherAttendance.filter(record => 
        record.status === 'PRESENT' || record.status === 'LATE'
      ).length;
      
      const totalWorkingDays = countWorkingDays(start, end);
      const attendsRatio = `${presentDays}/${totalWorkingDays}d`;

      // Count different types of requests by summing up the days
      const requestCounts = {
        authorizedAbsence: 0,
        unauthorizedAbsence: 0,
        earlyLeave: 0,
        lateArrival: 0,
        overtime: 0
      };

      // Count approved requests within date range
      teacherRequests.forEach(request => {
        if (request.status === 'APPROVED') {
          const days = calculateDaysFromDateRange(request.startDate, request.endDate);
          
          switch (request.type) {
            case 'AUTHORIZED_ABSENCE':
              requestCounts.authorizedAbsence += days;
              break;
            case 'UNAUTHORIZED_ABSENCE':
              requestCounts.unauthorizedAbsence += days;
              break;
            case 'EARLY_LEAVE':
              requestCounts.earlyLeave += days;
              break;
            case 'LATE_ARRIVAL':
              requestCounts.lateArrival += days;
              break;
          }
        }
      });

      // Also count "Late Arrival" requests from the current data format
      const lateArrivalRequests = requests.filter(request => 
        request.name === teacher.name && 
        request.requestType === 'Late Arrival' &&
        (request.result === 'Accepted' || !request.result) // Include pending and accepted
      );
      requestCounts.lateArrival += lateArrivalRequests.length;

      // Count "Early Leave" requests from the current data format
      const earlyLeaveRequests = requests.filter(request => 
        request.name === teacher.name && 
        request.requestType === 'Early Leave' &&
        (request.result === 'Accepted' || !request.result) // Include pending and accepted
      );
      requestCounts.earlyLeave += earlyLeaveRequests.length;

      // Helper function to round hours according to business rules
      const roundHoursForDisplay = (totalHours) => {
        const hours = Math.floor(totalHours);
        const decimalPart = totalHours - hours;
        const minutes = decimalPart * 60;
        
        // If remaining minutes < 30, round down; if >= 30, round up
        if (minutes < 30) {
          return hours;
        } else {
          return hours + 1;
        }
      };

      // Calculate total hours and overtime from attendance
      const totalHours = teacherAttendance.reduce((sum, record) => {
        return sum + (record.totalHours || 0);
      }, 0);

      // Calculate overtime (hours beyond 8 per day)
      const overtime = teacherAttendance.reduce((sum, record) => {
        const dailyHours = record.totalHours || 0;
        return sum + (dailyHours > 8 ? dailyHours - 8 : 0);
      }, 0);

      return {
        id: teacher.id,
        name: teacher.name,
        workType: teacher.workType,
        subject: teacher.subject,
        attends: presentDays,
        authorizedAbsence: requestCounts.authorizedAbsence,
        unauthorizedAbsence: requestCounts.unauthorizedAbsence,
        earlyLeave: requestCounts.earlyLeave,
        lateArrival: requestCounts.lateArrival,
        overtime: roundHoursForDisplay(overtime), // Round according to business rules
        totalHours: roundHoursForDisplay(totalHours) // Round according to business rules
      };
    });

    res.json({
      success: true,
      data: reportsData,
      total: reportsData.length,
      dateRange: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Error fetching teacher reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher reports',
      error: error.message
    });
  }
});

// GET /api/teachers/:id - Get specific teacher by ID (filtered by user role)
router.get('/:id', (req, res) => {
  try {
    const teachers = readTeachers();
    const attendance = readAttendance();
    
    const teacher = teachers.find(t => t.id === req.params.id);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }
    
    // Extract user role from token
    let userRole = 'EMPLOYEE';
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token && token.startsWith('gse_')) {
      const parts = token.split('_');
      if (parts.length >= 3) {
        const userId = parts.slice(1, -1).join('_');
        const user = teachers.find(t => t.id === userId);
        if (user) {
          userRole = user.role || 'EMPLOYEE';
        }
      }
    }
    
    // Check if Manager is trying to view an Admin
    if (userRole === 'MANAGER' && teacher.role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Managers cannot view Admin user details'
      });
    }
    
    // Get all attendance records for this teacher
    const teacherAttendance = attendance.filter(att => att.teacherId === teacher.id);
    
    res.json({
      success: true,
      data: {
        ...teacher,
        attendance: teacherAttendance
      },
      message: 'Teacher retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve teacher',
      details: error.message
    });
  }
});

// POST /api/teachers - Create new teacher (Admin only)
router.post('/', extractManagerEmail, checkAddTeacherAuthority, async (req, res) => {
  try {
    const teachers = readTeachers();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'subject', 'workType', 'birthdate', 'employmentDate', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields
      });
    }

    // Check if email already exists
    const existingTeacher = teachers.find(t => t.email === req.body.email);
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    const newTeacher = {
      id: uuidv4(),
      name: req.body.name,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      subject: req.body.subject,
      workType: req.body.workType,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      birthdate: req.body.birthdate,
      employmentDate: req.body.employmentDate,
      password: hashedPassword,
      status: 'Active',
      joinDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    teachers.push(newTeacher);
    writeTeachers(teachers);
   
    res.status(201).json({
      success: true,
      data: newTeacher,
      message: 'Teacher created successfully'
    });
    
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create teacher',
      details: error.message
    });
  }
});

// PUT /api/teachers/:id - Update teacher (Admin only, Managers can't edit Admin users)
router.put('/:id', extractManagerEmail, checkEditTeacherAuthority, (req, res) => {
  try {
    const teachers = readTeachers();
    const teacherIndex = teachers.findIndex(t => t.id === req.params.id);
    
    if (teacherIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }
    
    // Get current user's role
    const currentUser = teachers.find(t => t.email === req.managerEmail);
    const currentUserRole = currentUser ? currentUser.role : 'EMPLOYEE';
    
    // Check if Manager is trying to edit an Admin
    if (currentUserRole === 'MANAGER' && teachers[teacherIndex].role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Managers cannot edit Admin users'
      });
    }
    
    // Update teacher data
    const updatedTeacher = {
      ...teachers[teacherIndex],
      ...req.body,
      id: req.params.id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    teachers[teacherIndex] = updatedTeacher;
    writeTeachers(teachers);
    
    res.json({
      success: true,
      data: updatedTeacher,
      message: 'Teacher updated successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update teacher',
      details: error.message
    });
  }
});

// DELETE /api/teachers/:id - Delete teacher (Admin only, Managers can't delete Admin users)
router.delete('/:id', extractManagerEmail, checkEditTeacherAuthority, (req, res) => {
  try {
    const teachers = readTeachers();
    const teacherIndex = teachers.findIndex(t => t.id === req.params.id);
    
    if (teacherIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }
    
    // Get current user's role
    const currentUser = teachers.find(t => t.email === req.managerEmail);
    const currentUserRole = currentUser ? currentUser.role : 'EMPLOYEE';
    
    // Check if Manager is trying to delete an Admin
    if (currentUserRole === 'MANAGER' && teachers[teacherIndex].role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Managers cannot delete Admin users'
      });
    }
    
    const deletedTeacher = teachers[teacherIndex];
    teachers.splice(teacherIndex, 1);
    
    writeTeachers(teachers);
    
    res.json({
      success: true,
      data: deletedTeacher,
      message: 'Teacher deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete teacher',
      details: error.message
    });
  }
});

// GET /api/teachers/:id/summary - Get teacher summary with statistics
router.get('/:id/summary', (req, res) => {
  try {
    const teachers = readTeachers();
    const attendance = readAttendance();
    
    const teacher = teachers.find(t => t.id === req.params.id);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }
    
    const teacherAttendance = attendance.filter(att => att.teacherId === teacher.id);
    
    // Calculate summary statistics
    const totalWorkingDays = teacherAttendance.reduce((sum, att) => sum + att.totalWorkingDays, 0);
    const totalAttendedDays = teacherAttendance.reduce((sum, att) => sum + att.attendedDays, 0);
    const totalHours = teacherAttendance.reduce((sum, att) => sum + att.totalHours, 0);
    const totalOvertimeHours = teacherAttendance.reduce((sum, att) => sum + att.overtimeHours, 0);
    const totalLateHours = teacherAttendance.reduce((sum, att) => sum + att.lateHours, 0);
    const averageAttendanceRate = totalWorkingDays > 0 ? Math.round((totalAttendedDays / totalWorkingDays) * 100) : 0;
    
    const summary = {
      teacher: teacher,
      statistics: {
        totalWorkingDays,
        totalAttendedDays,
        totalHours,
        totalOvertimeHours,
        totalLateHours,
        averageAttendanceRate,
        monthsRecorded: teacherAttendance.length
      },
      monthlyAttendance: teacherAttendance
    };
    
    res.json({
      success: true,
      data: summary,
      message: 'Teacher summary retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve teacher summary',
      details: error.message
    });
  }
});

// POST /api/teachers - Add a new teacher (Admin only)  
router.post('/', extractManagerEmail, checkAddTeacherAuthority, async (req, res) => {
  try {
    const {
      name,
      firstName,
      lastName,
      email,
      phone,
      address,
      subject,
      workType,
      password,
      birthdate,
      systemRole,
      authorities
    } = req.body;

    // Validate required fields
    if (!name || !firstName || !lastName || !email || !phone || !address || !subject || !workType || !password || !birthdate) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
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

    // Read existing teachers
    const teachers = readTeachers();

    // Check if email already exists
    const existingTeacher = teachers.find(teacher => 
      teacher.email.toLowerCase() === email.toLowerCase()
    );
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Calculate age from birthdate
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Process authorities based on systemRole or provided authorities
    let processedAuthorities = [];
    let role = systemRole || 'EMPLOYEE';
    let roleLevel = 1;
    let roleName = 'Employee';
    let roleNameAr = 'موظف';
    
    // Get current user's role
    const currentUser = teachers.find(t => t.email === req.managerEmail);
    const currentUserRole = currentUser ? currentUser.role : 'EMPLOYEE';
    
    // Check if Manager is trying to create an Admin
    if (currentUserRole === 'MANAGER' && role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Managers cannot create Admin users'
      });
    }
    
    if (role === 'ADMIN') {
      roleLevel = 3;
      roleName = 'Admin';
      roleNameAr = 'مدير عام';
      processedAuthorities = [
        'Access Manager Portal',
        'Access Teacher Portal',
        'Add new teachers',
        'Edit Existing Teachers',
        'Delete Teachers',
        'Accept and Reject All Requests',
        'Download Reports',
        'View All Analytics',
        'System Administration'
      ];
    } else if (role === 'MANAGER') {
      roleLevel = 2;
      roleName = 'Manager';
      roleNameAr = 'مدير';
      processedAuthorities = [
        'Access Manager Portal',
        'Access Teacher Portal',
        'View Teachers Info',
        'Accept and Reject Employee Requests',
        'Accept and Reject Teachers\' Requests',
        'Download Reports',
        'View Analytics',
        'Submit Own Requests'
      ];
    } else {
      // Employee role - use provided authorities or default
      processedAuthorities = authorities || [
        'Access Teacher Portal',
        'Submit Requests',
        'View Own Data',
        'Check In/Out'
      ];
    }

    // Create new teacher object
    const newTeacher = {
      id: uuidv4(),
      name: name,
      firstName: firstName,
      lastName: lastName,
      subject: subject,
      workType: workType,
      joinDate: new Date().toISOString(),
      birthdate: birthDate.toISOString(),
      age: age,
      email: email,
      phone: phone,
      address: address,
      password: hashedPassword,
      plainPassword: password, // Store for reference (remove in production)
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: role,
      roleLevel: roleLevel,
      roleName: roleName,
      roleNameAr: roleNameAr,
      authorities: processedAuthorities,
      canAccessManagerPortal: roleLevel >= 2,
      canAccessTeacherPortal: true,
      canApproveRequests: roleLevel >= 2,
      employmentDate: req.body.employmentDate || new Date().toISOString().split('T')[0],
      allowedAbsenceDays: req.body.allowedAbsenceDays || 20,
      totalAbsenceDays: 0,
      remainingLateEarlyHours: 8,
      totalLateEarlyHours: 8
    };

    // Add to teachers array
    teachers.push(newTeacher);

    // Write back to file
    writeTeachers(teachers);

    // Update subject counts
    updateSubjectCounts();

    // Return success response (exclude password from response)
    const { password: _, plainPassword: __, ...teacherResponse } = newTeacher;
    
    res.status(201).json({
      success: true,
      data: teacherResponse,
      message: 'Teacher added successfully'
    });

  } catch (error) {
    console.error('Error adding teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add teacher',
      details: error.message
    });
  }
});

// PUT /api/teachers/:id - Update a specific teacher (Admin only)
router.put('/:id', 
  require('../middleware/roleAuthMiddleware').extractUserAndRole,
  require('../middleware/roleAuthMiddleware').requireRole(require('../middleware/roleAuthMiddleware').ROLES.ADMIN),
  async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      firstName,
      lastName,
      email,
      phone,
      address,
      subject,
      workType,
      password,
      birthdate,
      role,
      authorities,
      employmentDate,
      allowedAbsenceDays
    } = req.body;

    // Validate required fields
    if (!name || !firstName || !lastName || !email || !phone || !address || !subject || !workType || !birthdate) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
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

    // Read existing teachers
    const teachers = readTeachers();

    // Find the teacher to update
    const teacherIndex = teachers.findIndex(teacher => teacher.id === id);
    if (teacherIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    const existingTeacher = teachers[teacherIndex];

    // Check if email already exists for another teacher
    const duplicateTeacher = teachers.find(teacher => 
      teacher.email.toLowerCase() === email.toLowerCase() && teacher.id !== id
    );
    if (duplicateTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists for another teacher'
      });
    }

    // Calculate age from birthdate
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Process role and authorities
    let processedRole = role || existingTeacher.role || 'EMPLOYEE';
    let processedAuthorities = authorities || existingTeacher.authorities || [];
    
    // If role is provided, update authorities based on the 3-tier system
    if (role && SYSTEM_LAYERS[role]) {
      const roleConfig = SYSTEM_LAYERS[role];
      processedAuthorities = [...roleConfig.authorities];
    }

    // Prepare updated teacher object
    const updatedTeacher = {
      ...existingTeacher,
      name: name,
      firstName: firstName,
      lastName: lastName,
      subject: subject,
      workType: workType,
      birthdate: birthDate.toISOString(),
      age: age,
      email: email,
      phone: phone,
      address: address,
      employmentDate: employmentDate || existingTeacher.employmentDate,
      allowedAbsenceDays: allowedAbsenceDays || existingTeacher.allowedAbsenceDays || 20,
      // Update role and related fields
      role: processedRole,
      roleLevel: SYSTEM_LAYERS[processedRole]?.level || 1,
      roleName: SYSTEM_LAYERS[processedRole]?.name || 'Employee',
      roleNameAr: SYSTEM_LAYERS[processedRole]?.nameAr || 'موظف',
      authorities: processedAuthorities,
      roleDescription: SYSTEM_LAYERS[processedRole]?.description || 'Basic teacher access',
      canAccessManagerPortal: processedRole === 'ADMIN' || processedRole === 'MANAGER',
      canAccessTeacherPortal: true,
      canApproveRequests: processedRole === 'ADMIN' || processedRole === 'MANAGER',
      canApproveManagerRequests: processedRole === 'ADMIN',
      canRevokeActions: processedRole === 'ADMIN',
      canViewAuditTrail: processedRole === 'ADMIN',
      isPerformanceTracked: processedRole === 'MANAGER' || processedRole === 'EMPLOYEE',
      lastRoleUpdate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update password if provided
    if (password && password.trim()) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updatedTeacher.password = hashedPassword;
      updatedTeacher.plainPassword = password; // Store for reference (remove in production)
    }

    // Update the teacher in the array
    teachers[teacherIndex] = updatedTeacher;

    // Write back to file
    writeTeachers(teachers);

    // Update subject counts
    updateSubjectCounts();

    // Return success response (exclude passwords from response)
    const { password: _, plainPassword: __, ...teacherResponse } = updatedTeacher;
    
    res.status(200).json({
      success: true,
      data: teacherResponse,
      message: 'Teacher updated successfully'
    });

  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update teacher',
      details: error.message
    });
  }
});

// PUT /api/teachers/profile/:id - Update teacher's own profile (including password)
router.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      currentPassword,
      newPassword
    } = req.body;

    // Read existing teachers
    const teachers = readTeachers();

    // Find the teacher to update
    const teacherIndex = teachers.findIndex(teacher => teacher.id === id);
    if (teacherIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    const existingTeacher = teachers[teacherIndex];

    // Check if email already exists for another teacher
    if (email) {
      const duplicateTeacher = teachers.find(teacher => 
        teacher.email.toLowerCase() === email.toLowerCase() && teacher.id !== id
      );
      if (duplicateTeacher) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists for another teacher'
        });
      }
    }

    // If password change is requested, validate current password
    if (currentPassword && newPassword) {
      if (!existingTeacher.password) {
        return res.status(400).json({
          success: false,
          message: 'Current password not found in system'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, existingTeacher.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }
    }

    // Prepare updated teacher object
    const updatedTeacher = {
      ...existingTeacher,
      updatedAt: new Date().toISOString()
    };

    // Update fields if provided
    if (firstName) updatedTeacher.firstName = firstName;
    if (lastName) updatedTeacher.lastName = lastName;
    if (email) updatedTeacher.email = email;
    if (phone) updatedTeacher.phone = phone;
    if (address) updatedTeacher.address = address;

    // Update full name if first/last name changed
    if (firstName || lastName) {
      updatedTeacher.name = `${updatedTeacher.firstName || ''} ${updatedTeacher.lastName || ''}`.trim();
    }

    // Update password if provided and validated
    if (currentPassword && newPassword) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      updatedTeacher.password = hashedPassword;
      updatedTeacher.plainPassword = newPassword; // Store for reference (remove in production)
    }

    // Update the teacher in the array
    teachers[teacherIndex] = updatedTeacher;

    // Write back to file
    writeTeachers(teachers);

    // Return success response (exclude passwords from response)
    const { password: _, plainPassword: __, ...teacherResponse } = updatedTeacher;
    
    res.status(200).json({
      success: true,
      data: teacherResponse,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating teacher profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      details: error.message
    });
  }
});

// Helper function to update subject counts
const updateSubjectCounts = () => {
  try {
    const teachers = readTeachers();
    const subjectsFilePath = path.join(__dirname, '..', 'data', 'subjects.json');
    
    // Count teachers per subject
    const subjectCounts = {};
    teachers.forEach(teacher => {
      const subject = teacher.subject;
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });

    // Read current subjects
    let subjects = [];
    try {
      const data = fs.readFileSync(subjectsFilePath, 'utf8');
      subjects = JSON.parse(data);
    } catch (error) {
      // If file doesn't exist, create default subjects
      subjects = [];
    }

    // Update counts and add new subjects if needed
    const subjectNames = Object.keys(subjectCounts);
    subjectNames.forEach(subjectName => {
      const existingSubject = subjects.find(s => s.name === subjectName);
      if (existingSubject) {
        existingSubject.count = subjectCounts[subjectName];
      } else {
        subjects.push({
          id: uuidv4(),
          name: subjectName,
          count: subjectCounts[subjectName]
        });
      }
    });

    // Write back to subjects file
    fs.writeFileSync(subjectsFilePath, JSON.stringify(subjects, null, 2), 'utf8');
  } catch (error) {
    console.error('Error updating subject counts:', error);
  }
};

// GET /api/teachers/:id/remaining-hours - Get teacher's remaining late/early hours
router.get('/:id/remaining-hours', (req, res) => {
  try {
    const teacherId = req.params.id;
    
    const teachersFilePath = path.join(__dirname, '..', 'data', 'teachers.json');
    const teachersData = JSON.parse(fs.readFileSync(teachersFilePath, 'utf8'));
    
    const teacher = teachersData.find(t => t.id === teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    const remainingHours = teacher.remainingLateEarlyHours || 4;
    const totalHours = teacher.totalLateEarlyHours || 4;
    const usedHours = totalHours - remainingHours;
    
    res.json({
      success: true,
      data: {
        remainingHours,
        totalHours,
        usedHours
      }
    });
    
  } catch (error) {
    console.error('Error getting teacher remaining hours:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
  });



// GET /api/teachers/:id/notifications - Get teacher notifications
router.get('/:id/notifications', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Load requests data
    const requests = getRequestsData();
    
    // Filter requests for this teacher that have been processed
    const teacherRequests = requests.filter(r => 
      r.teacherId === id && 
      (r.status === 'approved' || r.status === 'rejected' || 
       r.result === 'Accepted' || r.result === 'Rejected')
    );
    
    // Transform to notifications
    const notifications = teacherRequests.map(request => {
      // Translate request types to Arabic
      const requestTypeAr = {
        'Late Arrival': 'التأخر',
        'Early Leave': 'المغادرة المبكرة',
        'Absence': 'الغياب',
        'Authorized Absence': 'الغياب المصرح به'
      }[request.requestType] || request.requestType;
      
      return {
        id: request.id,
        type: request.result === 'Accepted' || request.status === 'approved' ? 'success' : 'warning',
        message: request.result === 'Accepted' || request.status === 'approved'
          ? `Your ${request.requestType} request for ${request.duration} has been approved`
          : `Your ${request.requestType} request for ${request.duration} has been rejected`,
        messageAr: request.result === 'Accepted' || request.status === 'approved'
          ? `تم قبول طلب ${requestTypeAr} الخاص بك لمدة ${request.duration}`
          : `تم رفض طلب ${requestTypeAr} الخاص بك لمدة ${request.duration}`,
        date: request.approvedAt || request.updatedAt || request.appliedDate,
        requestType: request.requestType,
        duration: request.duration,
        reason: request.reason,
        approvedBy: request.approverName || 'Manager',
        isRead: request.isRead || false
      };
    });
    
    res.json({
      success: true,
      notifications: notifications.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    });
    
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// GET /api/teachers/:id/balance - Get teacher balance summary
router.get('/:id/balance', async (req, res) => {
  try {
    const { id } = req.params;
    const teachers = loadTeachers();
    const teacher = teachers.find(t => t.id === id);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    res.json({
      success: true,
      balance: {
        remainingLateEarlyHours: teacher.remainingLateEarlyHours || 8,
        totalLateEarlyHours: teacher.totalLateEarlyHours || 8,
        usedLateEarlyHours: teacher.usedLateEarlyHours || 0,
        allowedAbsenceDays: teacher.allowedAbsenceDays || 20,
        totalAbsenceDays: teacher.totalAbsenceDays || 0,
        remainingAbsenceDays: teacher.remainingAbsenceDays || 
          ((teacher.allowedAbsenceDays || 20) - (teacher.totalAbsenceDays || 0)),
        balanceLastUpdated: teacher.balanceLastUpdated || null
      }
    });
    
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch balance'
    });
  }
});

module.exports = router; 