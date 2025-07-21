const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Teacher } = require('../models');

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

// Helper function to write teachers data
const writeTeachers = (teachers) => {
  fs.writeFileSync(teachersFilePath, JSON.stringify(teachers, null, 2));
};

// GET /api/teachers - Get all teachers with optional filtering
router.get('/', (req, res) => {
  try {
    const teachers = readTeachers();
    const attendance = readAttendance();
    
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
        permittedLeaves: 0,
        unpermittedLeaves: 0,
        authorizedAbsence: 0,
        unauthorizedAbsence: 0
      };

      // Count approved requests within date range
      teacherRequests.forEach(request => {
        if (request.status === 'APPROVED') {
          const days = calculateDaysFromDateRange(request.startDate, request.endDate);
          
          switch (request.type) {
            case 'PERMITTED_LEAVES':
              requestCounts.permittedLeaves += days;
              break;
            case 'UNPERMITTED_LEAVES':
              requestCounts.unpermittedLeaves += days;
              break;
            case 'AUTHORIZED_ABSENCE':
              requestCounts.authorizedAbsence += days;
              break;
            case 'UNAUTHORIZED_ABSENCE':
              requestCounts.unauthorizedAbsence += days;
              break;
          }
        }
      });

      return {
        id: teacher.id,
        name: teacher.name,
        workType: teacher.workType,
        subject: teacher.subject,
        attends: attendsRatio,
        permittedLeaves: requestCounts.permittedLeaves,
        unpermittedLeaves: requestCounts.unpermittedLeaves,
        authorizedAbsence: requestCounts.authorizedAbsence,
        unauthorizedAbsence: requestCounts.unauthorizedAbsence
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

// GET /api/teachers/:id - Get specific teacher by ID
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

// POST /api/teachers - Create new teacher
router.post('/', (req, res) => {
  try {
    const teachers = readTeachers();
    
    // Validate required fields
    const requiredFields = ['name', 'department', 'workType', 'birthdate'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields
      });
    }
    
    const newTeacher = new Teacher(req.body);
    teachers.push(newTeacher.toJSON());
    
    writeTeachers(teachers);
    
    res.status(201).json({
      success: true,
      data: newTeacher.toJSON(),
      message: 'Teacher created successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create teacher',
      details: error.message
    });
  }
});

// PUT /api/teachers/:id - Update teacher
router.put('/:id', (req, res) => {
  try {
    const teachers = readTeachers();
    const teacherIndex = teachers.findIndex(t => t.id === req.params.id);
    
    if (teacherIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
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

// DELETE /api/teachers/:id - Delete teacher
router.delete('/:id', (req, res) => {
  try {
    const teachers = readTeachers();
    const teacherIndex = teachers.findIndex(t => t.id === req.params.id);
    
    if (teacherIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
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

module.exports = router; 