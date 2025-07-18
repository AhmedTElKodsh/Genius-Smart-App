const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const attendanceFilePath = path.join(__dirname, '..', 'data', 'attendance.json');
const teachersFilePath = path.join(__dirname, '..', 'data', 'teachers.json');

// Helper functions
const readAttendance = () => {
  try {
    const data = fs.readFileSync(attendanceFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const readTeachers = () => {
  try {
    const data = fs.readFileSync(teachersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeAttendance = (attendance) => {
  fs.writeFileSync(attendanceFilePath, JSON.stringify(attendance, null, 2));
};

// GET /api/attendance - Get all attendance records with filtering
router.get('/', (req, res) => {
  try {
    const attendance = readAttendance();
    const teachers = readTeachers();
    
    // Apply filters
    let filteredAttendance = attendance;
    
    const { month, year, teacherId, department, minAttendanceRate, maxAttendanceRate } = req.query;
    
    if (month) {
      filteredAttendance = filteredAttendance.filter(record => 
        record.month.toLowerCase() === month.toLowerCase()
      );
    }
    
    if (year) {
      filteredAttendance = filteredAttendance.filter(record => 
        record.year === parseInt(year)
      );
    }
    
    if (teacherId) {
      filteredAttendance = filteredAttendance.filter(record => 
        record.teacherId === teacherId
      );
    }
    
    if (department) {
      const departmentTeachers = teachers.filter(teacher => 
        teacher.department.toLowerCase() === department.toLowerCase()
      );
      const teacherIds = departmentTeachers.map(teacher => teacher.id);
      filteredAttendance = filteredAttendance.filter(record => 
        teacherIds.includes(record.teacherId)
      );
    }
    
    if (minAttendanceRate) {
      filteredAttendance = filteredAttendance.filter(record => 
        record.attendanceRate >= parseInt(minAttendanceRate)
      );
    }
    
    if (maxAttendanceRate) {
      filteredAttendance = filteredAttendance.filter(record => 
        record.attendanceRate <= parseInt(maxAttendanceRate)
      );
    }
    
    // Enrich with teacher information
    const enrichedAttendance = filteredAttendance.map(record => {
      const teacher = teachers.find(t => t.id === record.teacherId);
      return {
        ...record,
        teacher: teacher ? {
          id: teacher.id,
          name: teacher.name,
          department: teacher.department,
          workType: teacher.workType
        } : null
      };
    });
    
    // Sort by date (newest first) and then by attendance rate (highest first)
    enrichedAttendance.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      const monthOrder = ['April', 'May', 'June'];
      const aMonthIndex = monthOrder.indexOf(a.month);
      const bMonthIndex = monthOrder.indexOf(b.month);
      if (aMonthIndex !== bMonthIndex) return bMonthIndex - aMonthIndex;
      return b.attendanceRate - a.attendanceRate;
    });
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedAttendance = enrichedAttendance.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedAttendance,
      pagination: {
        total: enrichedAttendance.length,
        page,
        limit,
        pages: Math.ceil(enrichedAttendance.length / limit)
      },
      message: `Retrieved ${paginatedAttendance.length} attendance records`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve attendance records',
      details: error.message
    });
  }
});

// GET /api/attendance/:teacherId - Get attendance records for specific teacher
router.get('/:teacherId', (req, res) => {
  try {
    const attendance = readAttendance();
    const teachers = readTeachers();
    
    const teacher = teachers.find(t => t.id === req.params.teacherId);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }
    
    const teacherAttendance = attendance.filter(record => record.teacherId === req.params.teacherId);
    
    // Calculate summary statistics
    const totalWorkingDays = teacherAttendance.reduce((sum, record) => sum + record.totalWorkingDays, 0);
    const totalAttendedDays = teacherAttendance.reduce((sum, record) => sum + record.attendedDays, 0);
    const totalHours = teacherAttendance.reduce((sum, record) => sum + record.totalHours, 0);
    const totalOvertimeHours = teacherAttendance.reduce((sum, record) => sum + record.overtimeHours, 0);
    const totalLateHours = teacherAttendance.reduce((sum, record) => sum + record.lateHours, 0);
    const averageAttendanceRate = totalWorkingDays > 0 ? 
      Math.round((totalAttendedDays / totalWorkingDays) * 100) : 0;
    
    // Sort by date (newest first)
    teacherAttendance.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      const monthOrder = ['April', 'May', 'June'];
      return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
    });
    
    res.json({
      success: true,
      data: {
        teacher: teacher,
        records: teacherAttendance,
        summary: {
          totalRecords: teacherAttendance.length,
          totalWorkingDays,
          totalAttendedDays,
          totalHours,
          totalOvertimeHours,
          totalLateHours,
          averageAttendanceRate,
          totalAbsences: teacherAttendance.reduce((sum, record) => sum + record.totalAbsences, 0)
        }
      },
      message: `Retrieved ${teacherAttendance.length} attendance records for ${teacher.name}`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve teacher attendance',
      details: error.message
    });
  }
});

// GET /api/attendance/:teacherId/:month/:year - Get specific month attendance for teacher
router.get('/:teacherId/:month/:year', (req, res) => {
  try {
    const attendance = readAttendance();
    const teachers = readTeachers();
    
    const { teacherId, month, year } = req.params;
    
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }
    
    const record = attendance.find(att => 
      att.teacherId === teacherId && 
      att.month.toLowerCase() === month.toLowerCase() && 
      att.year === parseInt(year)
    );
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        ...record,
        teacher: teacher
      },
      message: `Retrieved attendance record for ${teacher.name} - ${month} ${year}`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve attendance record',
      details: error.message
    });
  }
});

// POST /api/attendance - Create new attendance record
router.post('/', (req, res) => {
  try {
    const attendance = readAttendance();
    const teachers = readTeachers();
    
    // Validate required fields
    const requiredFields = ['teacherId', 'month', 'year', 'totalWorkingDays', 'attendedDays'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields
      });
    }
    
    // Validate teacher exists
    const teacher = teachers.find(t => t.id === req.body.teacherId);
    if (!teacher) {
      return res.status(400).json({
        success: false,
        error: 'Teacher not found'
      });
    }
    
    // Check if record already exists
    const existingRecord = attendance.find(att => 
      att.teacherId === req.body.teacherId && 
      att.month.toLowerCase() === req.body.month.toLowerCase() && 
      att.year === parseInt(req.body.year)
    );
    
    if (existingRecord) {
      return res.status(400).json({
        success: false,
        error: 'Attendance record already exists for this teacher and month'
      });
    }
    
    const newRecord = {
      id: require('uuid').v4(),
      teacherId: req.body.teacherId,
      month: req.body.month,
      year: parseInt(req.body.year),
      totalWorkingDays: parseInt(req.body.totalWorkingDays),
      attendedDays: parseInt(req.body.attendedDays),
      permittedLeaves: parseInt(req.body.permittedLeaves) || 0,
      unpermittedLeaves: parseInt(req.body.unpermittedLeaves) || 0,
      authorizedAbsence: parseInt(req.body.authorizedAbsence) || 0,
      unauthorizedAbsence: parseInt(req.body.unauthorizedAbsence) || 0,
      lateHours: parseInt(req.body.lateHours) || 0,
      overtimeHours: parseInt(req.body.overtimeHours) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Calculate derived fields
    newRecord.attendanceRate = newRecord.totalWorkingDays > 0 ? 
      Math.round((newRecord.attendedDays / newRecord.totalWorkingDays) * 100) : 0;
    newRecord.totalHours = (newRecord.attendedDays * 8) + newRecord.overtimeHours - newRecord.lateHours;
    newRecord.totalAbsences = newRecord.permittedLeaves + newRecord.unpermittedLeaves + 
                             newRecord.authorizedAbsence + newRecord.unauthorizedAbsence;
    
    attendance.push(newRecord);
    writeAttendance(attendance);
    
    res.status(201).json({
      success: true,
      data: newRecord,
      message: 'Attendance record created successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create attendance record',
      details: error.message
    });
  }
});

// PUT /api/attendance/:id - Update attendance record
router.put('/:id', (req, res) => {
  try {
    const attendance = readAttendance();
    const recordIndex = attendance.findIndex(record => record.id === req.params.id);
    
    if (recordIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
    }
    
    // Update record
    const updatedRecord = {
      ...attendance[recordIndex],
      ...req.body,
      id: req.params.id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    // Recalculate derived fields
    updatedRecord.attendanceRate = updatedRecord.totalWorkingDays > 0 ? 
      Math.round((updatedRecord.attendedDays / updatedRecord.totalWorkingDays) * 100) : 0;
    updatedRecord.totalHours = (updatedRecord.attendedDays * 8) + updatedRecord.overtimeHours - updatedRecord.lateHours;
    updatedRecord.totalAbsences = updatedRecord.permittedLeaves + updatedRecord.unpermittedLeaves + 
                                 updatedRecord.authorizedAbsence + updatedRecord.unauthorizedAbsence;
    
    attendance[recordIndex] = updatedRecord;
    writeAttendance(attendance);
    
    res.json({
      success: true,
      data: updatedRecord,
      message: 'Attendance record updated successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update attendance record',
      details: error.message
    });
  }
});

// DELETE /api/attendance/:id - Delete attendance record
router.delete('/:id', (req, res) => {
  try {
    const attendance = readAttendance();
    const recordIndex = attendance.findIndex(record => record.id === req.params.id);
    
    if (recordIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
    }
    
    const deletedRecord = attendance[recordIndex];
    attendance.splice(recordIndex, 1);
    
    writeAttendance(attendance);
    
    res.json({
      success: true,
      data: deletedRecord,
      message: 'Attendance record deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete attendance record',
      details: error.message
    });
  }
});

// GET /api/attendance/stats/overview - Get attendance overview statistics
router.get('/stats/overview', (req, res) => {
  try {
    const attendance = readAttendance();
    const teachers = readTeachers();
    
    const currentMonth = req.query.month || 'May';
    const currentYear = parseInt(req.query.year) || 2024;
    
    // Filter for current month
    const currentAttendance = attendance.filter(record => 
      record.month === currentMonth && record.year === currentYear
    );
    
    // Calculate overall statistics
    const totalRecords = currentAttendance.length;
    const totalWorkingDays = currentAttendance.reduce((sum, record) => sum + record.totalWorkingDays, 0);
    const totalAttendedDays = currentAttendance.reduce((sum, record) => sum + record.attendedDays, 0);
    const totalHours = currentAttendance.reduce((sum, record) => sum + record.totalHours, 0);
    const totalOvertimeHours = currentAttendance.reduce((sum, record) => sum + record.overtimeHours, 0);
    const totalLateHours = currentAttendance.reduce((sum, record) => sum + record.lateHours, 0);
    
    const overallAttendanceRate = totalWorkingDays > 0 ? 
      Math.round((totalAttendedDays / totalWorkingDays) * 100) : 0;
    
    // Calculate performance metrics
    const excellentPerformers = currentAttendance.filter(record => record.attendanceRate >= 95).length;
    const goodPerformers = currentAttendance.filter(record => record.attendanceRate >= 85 && record.attendanceRate < 95).length;
    const averagePerformers = currentAttendance.filter(record => record.attendanceRate >= 75 && record.attendanceRate < 85).length;
    const poorPerformers = currentAttendance.filter(record => record.attendanceRate < 75).length;
    
    // Department breakdown
    const departmentStats = {};
    currentAttendance.forEach(record => {
      const teacher = teachers.find(t => t.id === record.teacherId);
      if (teacher) {
        if (!departmentStats[teacher.department]) {
          departmentStats[teacher.department] = {
            totalTeachers: 0,
            totalWorkingDays: 0,
            totalAttendedDays: 0,
            totalHours: 0,
            attendanceRate: 0
          };
        }
        
        departmentStats[teacher.department].totalTeachers++;
        departmentStats[teacher.department].totalWorkingDays += record.totalWorkingDays;
        departmentStats[teacher.department].totalAttendedDays += record.attendedDays;
        departmentStats[teacher.department].totalHours += record.totalHours;
      }
    });
    
    // Calculate department attendance rates
    Object.keys(departmentStats).forEach(dept => {
      const stats = departmentStats[dept];
      stats.attendanceRate = stats.totalWorkingDays > 0 ? 
        Math.round((stats.totalAttendedDays / stats.totalWorkingDays) * 100) : 0;
    });
    
    res.json({
      success: true,
      data: {
        period: `${currentMonth} ${currentYear}`,
        overview: {
          totalRecords,
          totalWorkingDays,
          totalAttendedDays,
          totalHours,
          totalOvertimeHours,
          totalLateHours,
          overallAttendanceRate
        },
        performance: {
          excellent: excellentPerformers,
          good: goodPerformers,
          average: averagePerformers,
          poor: poorPerformers
        },
        departmentBreakdown: departmentStats
      },
      message: `Attendance overview for ${currentMonth} ${currentYear} retrieved successfully`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve attendance overview',
      details: error.message
    });
  }
});

// GET /api/attendance/trends/monthly - Get monthly attendance trends
router.get('/trends/monthly', (req, res) => {
  try {
    const attendance = readAttendance();
    const teachers = readTeachers();
    
    const year = parseInt(req.query.year) || 2024;
    const yearAttendance = attendance.filter(record => record.year === year);
    
    // Group by month
    const monthlyTrends = ['April', 'May', 'June'].map(month => {
      const monthAttendance = yearAttendance.filter(record => record.month === month);
      
      const totalWorkingDays = monthAttendance.reduce((sum, record) => sum + record.totalWorkingDays, 0);
      const totalAttendedDays = monthAttendance.reduce((sum, record) => sum + record.attendedDays, 0);
      const totalHours = monthAttendance.reduce((sum, record) => sum + record.totalHours, 0);
      const attendanceRate = totalWorkingDays > 0 ? 
        Math.round((totalAttendedDays / totalWorkingDays) * 100) : 0;
      
      return {
        month,
        teachersRecorded: monthAttendance.length,
        totalWorkingDays,
        totalAttendedDays,
        totalHours,
        attendanceRate,
        avgHoursPerTeacher: monthAttendance.length > 0 ? Math.round(totalHours / monthAttendance.length) : 0
      };
    });
    
    res.json({
      success: true,
      data: {
        year,
        trends: monthlyTrends,
        totalTeachers: teachers.length
      },
      message: `Monthly attendance trends for ${year} retrieved successfully`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve attendance trends',
      details: error.message
    });
  }
});

module.exports = router; 