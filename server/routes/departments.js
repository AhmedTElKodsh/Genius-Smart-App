const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const departmentsFilePath = path.join(__dirname, '..', 'data', 'departments.json');
const teachersFilePath = path.join(__dirname, '..', 'data', 'teachers.json');
const attendanceFilePath = path.join(__dirname, '..', 'data', 'attendance.json');

// Helper functions
const readDepartments = () => {
  try {
    const data = fs.readFileSync(departmentsFilePath, 'utf8');
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

const readAttendance = () => {
  try {
    const data = fs.readFileSync(attendanceFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// GET /api/departments - Get all departments with statistics
router.get('/', (req, res) => {
  try {
    const departments = readDepartments();
    const teachers = readTeachers();
    const attendance = readAttendance();
    
    // Enrich departments with current statistics
    const enrichedDepartments = departments.map(department => {
      const departmentTeachers = teachers.filter(t => t.department === department.name);
      const activeTeachers = departmentTeachers.filter(t => t.status === 'Active');
      
      // Calculate attendance statistics for current month (May)
      const currentMonth = 'May';
      const currentAttendance = attendance.filter(att => 
        att.month === currentMonth && 
        departmentTeachers.some(t => t.id === att.teacherId)
      );
      
      const totalWorkingDays = currentAttendance.reduce((sum, att) => sum + att.totalWorkingDays, 0);
      const totalAttendedDays = currentAttendance.reduce((sum, att) => sum + att.attendedDays, 0);
      const averageAttendanceRate = totalWorkingDays > 0 ? 
        Math.round((totalAttendedDays / totalWorkingDays) * 100) : 0;
      
      return {
        ...department,
        statistics: {
          totalTeachers: departmentTeachers.length,
          activeTeachers: activeTeachers.length,
          inactiveTeachers: departmentTeachers.length - activeTeachers.length,
          fullTimeTeachers: departmentTeachers.filter(t => t.workType === 'Full-time').length,
          partTimeTeachers: departmentTeachers.filter(t => t.workType === 'Part-time').length,
          averageAttendanceRate,
          currentMonthRecords: currentAttendance.length
        }
      };
    });
    
    res.json({
      success: true,
      data: enrichedDepartments,
      message: `Retrieved ${enrichedDepartments.length} departments`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve departments',
      details: error.message
    });
  }
});

// GET /api/departments/:id - Get specific department with detailed information
router.get('/:id', (req, res) => {
  try {
    const departments = readDepartments();
    const teachers = readTeachers();
    const attendance = readAttendance();
    
    const department = departments.find(d => d.id === req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }
    
    // Get department teachers
    const departmentTeachers = teachers.filter(t => t.department === department.name);
    
    // Get department attendance for all months
    const departmentAttendance = attendance.filter(att => 
      departmentTeachers.some(t => t.id === att.teacherId)
    );
    
    // Calculate monthly statistics
    const monthlyStats = ['April', 'May', 'June'].map(month => {
      const monthAttendance = departmentAttendance.filter(att => att.month === month);
      const totalWorkingDays = monthAttendance.reduce((sum, att) => sum + att.totalWorkingDays, 0);
      const totalAttendedDays = monthAttendance.reduce((sum, att) => sum + att.attendedDays, 0);
      
      return {
        month,
        teachersRecorded: monthAttendance.length,
        totalWorkingDays,
        totalAttendedDays,
        attendanceRate: totalWorkingDays > 0 ? Math.round((totalAttendedDays / totalWorkingDays) * 100) : 0,
        totalHours: monthAttendance.reduce((sum, att) => sum + att.totalHours, 0),
        totalOvertimeHours: monthAttendance.reduce((sum, att) => sum + att.overtimeHours, 0)
      };
    });
    
    res.json({
      success: true,
      data: {
        ...department,
        teachers: departmentTeachers,
        monthlyStatistics: monthlyStats,
        totalAttendanceRecords: departmentAttendance.length
      },
      message: 'Department details retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve department',
      details: error.message
    });
  }
});

// GET /api/departments/:name/teachers - Get teachers by department name
router.get('/:name/teachers', (req, res) => {
  try {
    const teachers = readTeachers();
    const attendance = readAttendance();
    
    const departmentName = decodeURIComponent(req.params.name);
    const departmentTeachers = teachers.filter(t => 
      t.department.toLowerCase() === departmentName.toLowerCase()
    );
    
    if (departmentTeachers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No teachers found for this department'
      });
    }
    
    // Add current month attendance to each teacher
    const currentMonth = 'May';
    const teachersWithAttendance = departmentTeachers.map(teacher => {
      const currentAttendance = attendance.find(att => 
        att.teacherId === teacher.id && att.month === currentMonth
      );
      
      return {
        ...teacher,
        currentAttendance: currentAttendance || null
      };
    });
    
    res.json({
      success: true,
      data: teachersWithAttendance,
      message: `Retrieved ${teachersWithAttendance.length} teachers from ${departmentName} department`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve department teachers',
      details: error.message
    });
  }
});

// GET /api/departments/stats/summary - Get departments summary statistics
router.get('/stats/summary', (req, res) => {
  try {
    const departments = readDepartments();
    const teachers = readTeachers();
    const attendance = readAttendance();
    
    // Overall statistics
    const totalDepartments = departments.length;
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.status === 'Active').length;
    const fullTimeTeachers = teachers.filter(t => t.workType === 'Full-time').length;
    const partTimeTeachers = teachers.filter(t => t.workType === 'Part-time').length;
    
    // Current month statistics
    const currentMonth = 'May';
    const currentAttendance = attendance.filter(att => att.month === currentMonth);
    const totalWorkingDays = currentAttendance.reduce((sum, att) => sum + att.totalWorkingDays, 0);
    const totalAttendedDays = currentAttendance.reduce((sum, att) => sum + att.attendedDays, 0);
    const overallAttendanceRate = totalWorkingDays > 0 ? 
      Math.round((totalAttendedDays / totalWorkingDays) * 100) : 0;
    
    // Department breakdown
    const departmentBreakdown = departments.map(dept => {
      const deptTeachers = teachers.filter(t => t.department === dept.name);
      const deptAttendance = currentAttendance.filter(att => 
        deptTeachers.some(t => t.id === att.teacherId)
      );
      
      const deptWorkingDays = deptAttendance.reduce((sum, att) => sum + att.totalWorkingDays, 0);
      const deptAttendedDays = deptAttendance.reduce((sum, att) => sum + att.attendedDays, 0);
      
      return {
        department: dept.name,
        arabicName: dept.arabicName,
        teacherCount: deptTeachers.length,
        attendanceRate: deptWorkingDays > 0 ? Math.round((deptAttendedDays / deptWorkingDays) * 100) : 0
      };
    });
    
    res.json({
      success: true,
      data: {
        overview: {
          totalDepartments,
          totalTeachers,
          activeTeachers,
          fullTimeTeachers,
          partTimeTeachers,
          overallAttendanceRate
        },
        departmentBreakdown: departmentBreakdown.sort((a, b) => b.attendanceRate - a.attendanceRate)
      },
      message: 'Department statistics retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve department statistics',
      details: error.message
    });
  }
});

// GET /api/departments/performance/ranking - Get departments ranked by performance
router.get('/performance/ranking', (req, res) => {
  try {
    const departments = readDepartments();
    const teachers = readTeachers();
    const attendance = readAttendance();
    
    const currentMonth = req.query.month || 'May';
    
    const departmentPerformance = departments.map(dept => {
      const deptTeachers = teachers.filter(t => t.department === dept.name && t.status === 'Active');
      const deptAttendance = attendance.filter(att => 
        att.month === currentMonth && 
        deptTeachers.some(t => t.id === att.teacherId)
      );
      
      const totalWorkingDays = deptAttendance.reduce((sum, att) => sum + att.totalWorkingDays, 0);
      const totalAttendedDays = deptAttendance.reduce((sum, att) => sum + att.attendedDays, 0);
      const totalHours = deptAttendance.reduce((sum, att) => sum + att.totalHours, 0);
      const totalOvertimeHours = deptAttendance.reduce((sum, att) => sum + att.overtimeHours, 0);
      const totalLateHours = deptAttendance.reduce((sum, att) => sum + att.lateHours, 0);
      
      const attendanceRate = totalWorkingDays > 0 ? (totalAttendedDays / totalWorkingDays) * 100 : 0;
      const avgHoursPerTeacher = deptTeachers.length > 0 ? totalHours / deptTeachers.length : 0;
      
      // Performance score (weighted average)
      const performanceScore = (
        (attendanceRate * 0.6) + // 60% weight for attendance
        (Math.min(avgHoursPerTeacher / 160, 1) * 100 * 0.3) + // 30% weight for hours (normalized to 160h/month)
        (Math.max(0, 100 - (totalLateHours / Math.max(deptTeachers.length, 1)) * 5) * 0.1) // 10% weight for punctuality
      );
      
      return {
        department: dept.name,
        arabicName: dept.arabicName,
        teacherCount: deptTeachers.length,
        attendanceRate: Math.round(attendanceRate),
        totalHours,
        avgHoursPerTeacher: Math.round(avgHoursPerTeacher),
        totalOvertimeHours,
        totalLateHours,
        performanceScore: Math.round(performanceScore),
        grade: performanceScore >= 90 ? 'A' : 
               performanceScore >= 80 ? 'B' : 
               performanceScore >= 70 ? 'C' : 
               performanceScore >= 60 ? 'D' : 'F'
      };
    });
    
    // Sort by performance score (highest first)
    departmentPerformance.sort((a, b) => b.performanceScore - a.performanceScore);
    
    res.json({
      success: true,
      data: {
        month: currentMonth,
        rankings: departmentPerformance,
        topPerformer: departmentPerformance[0] || null,
        averageScore: departmentPerformance.length > 0 ? 
          Math.round(departmentPerformance.reduce((sum, dept) => sum + dept.performanceScore, 0) / departmentPerformance.length) : 0
      },
      message: `Department performance rankings for ${currentMonth} retrieved successfully`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve department performance rankings',
      details: error.message
    });
  }
});

module.exports = router; 