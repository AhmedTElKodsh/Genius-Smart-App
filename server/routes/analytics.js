const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// JWT Authentication middleware
const authenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'genius-smart-secret-key');
    
    // Load user data to get full user info
    const teachers = loadTeachers();
    const user = teachers.find(t => t.id === decoded.userId);

    if (!user || user.status !== 'Active') {
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
      authorities: user.authorities,
      canAccessManagerPortal: user.canAccessManagerPortal
    };

    next();
  } catch (error) {
    console.error('JWT authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid token'
    });
  }
};

// Role-based authorization middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    const userAuthorities = req.user?.authorities || [];
    
    // Convert allowedRoles to array if it's a string
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    // Check if user has required role or manager portal access
    if (rolesArray.includes(userRole) || req.user?.canAccessManagerPortal) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions'
      });
    }
  };
};

// Load teachers data
const loadTeachers = () => {
  try {
    const teachersPath = path.join(__dirname, '../data', 'teachers.json');
    const data = fs.readFileSync(teachersPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading teachers:', error);
    return [];
  }
};

// Helper function to load data files
const loadData = (filename) => {
  try {
    const filePath = path.join(__dirname, '../data', filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
};

// Helper function to parse date range from query
const parseDateRange = (req) => {
  const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
  return { startDate, endDate };
};

// Helper function to calculate date ranges
const getDateRange = (period) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today':
      return {
        start: startOfToday,
        end: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'week':
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
      return {
        start: startOfWeek,
        end: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
      };
    case 'month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
    case 'lastMonth':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 1)
      };
    case 'quarter':
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      return {
        start: quarterStart,
        end: new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 1)
      };
    case 'year':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear() + 1, 0, 1)
      };
    default:
      return { start: new Date(0), end: now };
  }
};

// Helper function to filter data by date range
const filterByDateRange = (data, startDate, endDate, dateField = 'dateISO') => {
  return data.filter(record => {
    const recordDate = new Date(record[dateField]);
    return recordDate >= startDate && recordDate < endDate;
  });
};

// Helper function to generate chart data for tracking
const generateChartData = (data, type, dateRange, groupBy = 'day') => {
  const { startDate, endDate } = dateRange;
  const chartData = [];
  
  // Create date labels based on groupBy
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateKey = current.toISOString().split('T')[0];
    chartData.push({
      date: dateKey,
      value: 0,
      label: groupBy === 'day' ? current.toLocaleDateString() : current.toISOString().split('T')[0]
    });
    
    if (groupBy === 'day') {
      current.setDate(current.getDate() + 1);
    } else if (groupBy === 'week') {
      current.setDate(current.getDate() + 7);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
  }
  
  // Aggregate data by date
  data.forEach(record => {
    const recordDate = new Date(record.dateISO || record.appliedDate);
    const dateKey = recordDate.toISOString().split('T')[0];
    const chartPoint = chartData.find(point => point.date === dateKey);
    
    if (chartPoint) {
      // Count based on type
      if (type.includes('absence') && (record.attendance === 'Absent' || record.requestType === 'Absence')) {
        chartPoint.value++;
      } else if (type.includes('early-leave') && (record.attendance === 'Early Leave' || record.requestType === 'Early Leave')) {
        chartPoint.value++;
      } else if (type.includes('late-arrival') && (record.attendance === 'Late' || record.requestType === 'Late Arrival')) {
        chartPoint.value++;
      }
    }
  });
  
  return chartData;
};

// Teachers Analytics Endpoints

// Teachers Absence Tracking
router.get('/teachers/absence-tracking', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const attendanceData = loadData('attendance.json');
    const filteredData = filterByDateRange(attendanceData, startDate, endDate);
    
    const chartData = generateChartData(filteredData, 'absence', { startDate, endDate });
    
    res.json({
      success: true,
      data: chartData,
      summary: {
        totalAbsences: filteredData.filter(r => r.attendance === 'Absent').length,
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get absence tracking data', error: error.message });
  }
});

// Teachers Early Leave Tracking
router.get('/teachers/early-leave-tracking', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const attendanceData = loadData('attendance.json');
    const filteredData = filterByDateRange(attendanceData, startDate, endDate);
    
    const chartData = generateChartData(filteredData, 'early-leave', { startDate, endDate });
    
    res.json({
      success: true,
      data: chartData,
      summary: {
        totalEarlyLeaves: filteredData.filter(r => r.attendance === 'Early Leave').length,
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get early leave tracking data', error: error.message });
  }
});

// Teachers Late Arrival Tracking
router.get('/teachers/late-arrival-tracking', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const attendanceData = loadData('attendance.json');
    const filteredData = filterByDateRange(attendanceData, startDate, endDate);
    
    const chartData = generateChartData(filteredData, 'late-arrival', { startDate, endDate });
    
    res.json({
      success: true,
      data: chartData,
      summary: {
        totalLateArrivals: filteredData.filter(r => r.attendance === 'Late').length,
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get late arrival tracking data', error: error.message });
  }
});

// Teachers Absence Requests Tracking
router.get('/teachers/absence-requests-tracking', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const requestsData = loadData('requests.json');
    const filteredData = filterByDateRange(requestsData, startDate, endDate, 'appliedDate');
    
    const chartData = generateChartData(filteredData, 'absence', { startDate, endDate });
    
    res.json({
      success: true,
      data: chartData,
      summary: {
        totalAbsenceRequests: filteredData.filter(r => r.requestType === 'Absence').length,
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get absence requests tracking data', error: error.message });
  }
});

// Teachers Early Leave Requests Tracking
router.get('/teachers/early-leave-requests-tracking', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const requestsData = loadData('requests.json');
    const filteredData = filterByDateRange(requestsData, startDate, endDate, 'appliedDate');
    
    const chartData = generateChartData(filteredData, 'early-leave', { startDate, endDate });
    
    res.json({
      success: true,
      data: chartData,
      summary: {
        totalEarlyLeaveRequests: filteredData.filter(r => r.requestType === 'Early Leave').length,
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get early leave requests tracking data', error: error.message });
  }
});

// Teachers Late Arrival Requests Tracking
router.get('/teachers/late-arrival-requests-tracking', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const requestsData = loadData('requests.json');
    const filteredData = filterByDateRange(requestsData, startDate, endDate, 'appliedDate');
    
    const chartData = generateChartData(filteredData, 'late-arrival', { startDate, endDate });
    
    res.json({
      success: true,
      data: chartData,
      summary: {
        totalLateArrivalRequests: filteredData.filter(r => r.requestType === 'Late Arrival').length,
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get late arrival requests tracking data', error: error.message });
  }
});

// Teachers Comparison Endpoints
router.get('/teachers/absence-comparison', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const attendanceData = loadData('attendance.json');
    const teachersData = loadTeachers();
    const filteredData = filterByDateRange(attendanceData, startDate, endDate);
    
    // Group by teachers and calculate absence rates
    const teacherStats = {};
    teachersData.forEach(teacher => {
      teacherStats[teacher.id] = {
        name: teacher.name,
        subject: teacher.subject,
        totalDays: 0,
        absentDays: 0
      };
    });
    
    filteredData.forEach(record => {
      if (teacherStats[record.teacherId]) {
        teacherStats[record.teacherId].totalDays++;
        if (record.attendance === 'Absent') {
          teacherStats[record.teacherId].absentDays++;
        }
      }
    });
    
    const comparisonData = Object.values(teacherStats)
      .map(teacher => ({
        name: teacher.name,
        subject: teacher.subject,
        absenceRate: teacher.totalDays > 0 ? ((teacher.absentDays / teacher.totalDays) * 100).toFixed(1) : 0,
        totalDays: teacher.totalDays,
        absentDays: teacher.absentDays
      }))
      .filter(teacher => teacher.totalDays > 0)
      .sort((a, b) => parseFloat(b.absenceRate) - parseFloat(a.absenceRate));
    
    res.json({
      success: true,
      data: comparisonData,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get teachers absence comparison', error: error.message });
  }
});

// Teachers Early Leave Comparison
router.get('/teachers/early-leave-comparison', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const attendanceData = loadData('attendance.json');
    const teachersData = loadTeachers();
    const filteredData = filterByDateRange(attendanceData, startDate, endDate);
    
    // Group by teachers and calculate early leave rates
    const teacherStats = {};
    teachersData.forEach(teacher => {
      teacherStats[teacher.id] = {
        name: teacher.name,
        subject: teacher.subject,
        totalDays: 0,
        earlyLeaveDays: 0
      };
    });
    
    filteredData.forEach(record => {
      if (teacherStats[record.teacherId]) {
        teacherStats[record.teacherId].totalDays++;
        if (record.attendance === 'Early Leave') {
          teacherStats[record.teacherId].earlyLeaveDays++;
        }
      }
    });
    
    const comparisonData = Object.values(teacherStats)
      .map(teacher => ({
        name: teacher.name,
        subject: teacher.subject,
        earlyLeaveRate: teacher.totalDays > 0 ? ((teacher.earlyLeaveDays / teacher.totalDays) * 100).toFixed(1) : 0,
        totalDays: teacher.totalDays,
        earlyLeaveDays: teacher.earlyLeaveDays
      }))
      .filter(teacher => teacher.totalDays > 0)
      .sort((a, b) => parseFloat(b.earlyLeaveRate) - parseFloat(a.earlyLeaveRate));
    
    res.json({
      success: true,
      data: comparisonData,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get teachers early leave comparison', error: error.message });
  }
});

// Teachers Late Arrival Comparison
router.get('/teachers/late-arrival-comparison', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const attendanceData = loadData('attendance.json');
    const teachersData = loadTeachers();
    const filteredData = filterByDateRange(attendanceData, startDate, endDate);
    
    // Group by teachers and calculate late arrival rates
    const teacherStats = {};
    teachersData.forEach(teacher => {
      teacherStats[teacher.id] = {
        name: teacher.name,
        subject: teacher.subject,
        totalDays: 0,
        lateDays: 0
      };
    });
    
    filteredData.forEach(record => {
      if (teacherStats[record.teacherId]) {
        teacherStats[record.teacherId].totalDays++;
        if (record.attendance === 'Late') {
          teacherStats[record.teacherId].lateDays++;
        }
      }
    });
    
    const comparisonData = Object.values(teacherStats)
      .map(teacher => ({
        name: teacher.name,
        subject: teacher.subject,
        lateArrivalRate: teacher.totalDays > 0 ? ((teacher.lateDays / teacher.totalDays) * 100).toFixed(1) : 0,
        totalDays: teacher.totalDays,
        lateDays: teacher.lateDays
      }))
      .filter(teacher => teacher.totalDays > 0)
      .sort((a, b) => parseFloat(b.lateArrivalRate) - parseFloat(a.lateArrivalRate));
    
    res.json({
      success: true,
      data: comparisonData,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get teachers late arrival comparison', error: error.message });
  }
});

// Teacher Absence Requests (without tracking suffix)
router.get('/teachers/absence-requests', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const teachers = loadTeachers();
    
    // Generate teacher request data
    const teacherData = teachers.slice(0, 5).map(teacher => ({
      name: teacher.name,
      value: Math.floor(Math.random() * 15) + 3
    }));
    
    res.json({
      success: true,
      data: teacherData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get teacher absence requests data',
      error: error.message
    });
  }
});

// Teacher Early Leave Requests (without tracking suffix)
router.get('/teachers/early-leave-requests', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const teachers = loadTeachers();
    
    // Generate teacher request data
    const teacherData = teachers.slice(0, 5).map(teacher => ({
      name: teacher.name,
      value: Math.floor(Math.random() * 10) + 2
    }));
    
    res.json({
      success: true,
      data: teacherData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get teacher early leave requests data',
      error: error.message
    });
  }
});

// Teacher Late Arrival Requests (without tracking suffix)
router.get('/teachers/late-arrival-requests', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const teachers = loadTeachers();
    
    // Generate teacher request data
    const teacherData = teachers.slice(0, 5).map(teacher => ({
      name: teacher.name,
      value: Math.floor(Math.random() * 8) + 1
    }));
    
    res.json({
      success: true,
      data: teacherData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get teacher late arrival requests data',
      error: error.message
    });
  }
});

// Departments Analytics Endpoints

// Departments Absence Tracking
router.get('/departments/absence-tracking', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const attendanceData = loadData('attendance.json');
    const filteredData = filterByDateRange(attendanceData, startDate, endDate);
    
    // Group by department/subject
    const departmentStats = {};
    filteredData.forEach(record => {
      if (!departmentStats[record.subject]) {
        departmentStats[record.subject] = { total: 0, absences: 0 };
      }
      departmentStats[record.subject].total++;
      if (record.attendance === 'Absent') {
        departmentStats[record.subject].absences++;
      }
    });
    
    const chartData = Object.entries(departmentStats).map(([dept, stats]) => ({
      department: dept,
      absenceCount: stats.absences,
      totalCount: stats.total,
      absenceRate: ((stats.absences / stats.total) * 100).toFixed(1)
    }));
    
    res.json({
      success: true,
      data: chartData,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get departments absence tracking data', error: error.message });
  }
});

// Departments Early Leave Tracking
router.get('/departments/early-leave-tracking', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const attendanceData = loadData('attendance.json');
    const filteredData = filterByDateRange(attendanceData, startDate, endDate);
    
    // Group by department/subject
    const departmentStats = {};
    filteredData.forEach(record => {
      if (!departmentStats[record.subject]) {
        departmentStats[record.subject] = { total: 0, earlyLeaves: 0 };
      }
      departmentStats[record.subject].total++;
      if (record.attendance === 'Early Leave') {
        departmentStats[record.subject].earlyLeaves++;
      }
    });
    
    const chartData = Object.entries(departmentStats).map(([dept, stats]) => ({
      department: dept,
      earlyLeaveCount: stats.earlyLeaves,
      totalCount: stats.total,
      earlyLeaveRate: ((stats.earlyLeaves / stats.total) * 100).toFixed(1)
    }));
    
    res.json({
      success: true,
      data: chartData,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get departments early leave tracking data', error: error.message });
  }
});

// Departments Late Arrival Tracking
router.get('/departments/late-arrival-tracking', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const attendanceData = loadData('attendance.json');
    const filteredData = filterByDateRange(attendanceData, startDate, endDate);
    
    // Group by department/subject
    const departmentStats = {};
    filteredData.forEach(record => {
      if (!departmentStats[record.subject]) {
        departmentStats[record.subject] = { total: 0, lateArrivals: 0 };
      }
      departmentStats[record.subject].total++;
      if (record.attendance === 'Late') {
        departmentStats[record.subject].lateArrivals++;
      }
    });
    
    const chartData = Object.entries(departmentStats).map(([dept, stats]) => ({
      department: dept,
      lateArrivalCount: stats.lateArrivals,
      totalCount: stats.total,
      lateArrivalRate: ((stats.lateArrivals / stats.total) * 100).toFixed(1)
    }));
    
    res.json({
      success: true,
      data: chartData,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get departments late arrival tracking data', error: error.message });
  }
});

// Departments Absence Requests Tracking
router.get('/departments/absence-requests-tracking', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const requestsData = loadData('requests.json');
    const filteredData = filterByDateRange(requestsData, startDate, endDate, 'appliedDate');
    
    // Group by department/subject
    const departmentStats = {};
    filteredData.forEach(request => {
      if (request.requestType === 'Absence') {
        if (!departmentStats[request.subject]) {
          departmentStats[request.subject] = { total: 0, approved: 0, rejected: 0, pending: 0 };
        }
        departmentStats[request.subject].total++;
        departmentStats[request.subject][request.status]++;
      }
    });
    
    const chartData = Object.entries(departmentStats).map(([dept, stats]) => ({
      department: dept,
      totalRequests: stats.total,
      approved: stats.approved,
      rejected: stats.rejected,
      pending: stats.pending,
      approvalRate: stats.total > 0 ? (((stats.approved / (stats.approved + stats.rejected)) * 100) || 0).toFixed(1) : 0
    }));
    
    res.json({
      success: true,
      data: chartData,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get departments absence requests tracking data', error: error.message });
  }
});

// Departments Early Leave Requests Tracking
router.get('/departments/early-leave-requests-tracking', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const requestsData = loadData('requests.json');
    const filteredData = filterByDateRange(requestsData, startDate, endDate, 'appliedDate');
    
    // Group by department/subject
    const departmentStats = {};
    filteredData.forEach(request => {
      if (request.requestType === 'Early Leave') {
        if (!departmentStats[request.subject]) {
          departmentStats[request.subject] = { total: 0, approved: 0, rejected: 0, pending: 0 };
        }
        departmentStats[request.subject].total++;
        departmentStats[request.subject][request.status]++;
      }
    });
    
    const chartData = Object.entries(departmentStats).map(([dept, stats]) => ({
      department: dept,
      totalRequests: stats.total,
      approved: stats.approved,
      rejected: stats.rejected,
      pending: stats.pending,
      approvalRate: stats.total > 0 ? (((stats.approved / (stats.approved + stats.rejected)) * 100) || 0).toFixed(1) : 0
    }));
    
    res.json({
      success: true,
      data: chartData,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get departments early leave requests tracking data', error: error.message });
  }
});

// Departments Late Arrival Requests Tracking
router.get('/departments/late-arrival-requests-tracking', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const requestsData = loadData('requests.json');
    const filteredData = filterByDateRange(requestsData, startDate, endDate, 'appliedDate');
    
    // Group by department/subject
    const departmentStats = {};
    filteredData.forEach(request => {
      if (request.requestType === 'Late Arrival') {
        if (!departmentStats[request.subject]) {
          departmentStats[request.subject] = { total: 0, approved: 0, rejected: 0, pending: 0 };
        }
        departmentStats[request.subject].total++;
        departmentStats[request.subject][request.status]++;
      }
    });
    
    const chartData = Object.entries(departmentStats).map(([dept, stats]) => ({
      department: dept,
      totalRequests: stats.total,
      approved: stats.approved,
      rejected: stats.rejected,
      pending: stats.pending,
      approvalRate: stats.total > 0 ? (((stats.approved / (stats.approved + stats.rejected)) * 100) || 0).toFixed(1) : 0
    }));
    
    res.json({
      success: true,
      data: chartData,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get departments late arrival requests tracking data', error: error.message });
  }
});

// Department Absence Requests (without tracking suffix)
router.get('/departments/absence-requests', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const departments = [
      'Mathematics',
      'Science',
      'English',
      'Arabic',
      'History',
      'Physical Education'
    ];
    
    // Generate department request data
    const departmentData = departments.map(dept => ({
      name: dept,
      value: Math.floor(Math.random() * 40) + 10
    }));
    
    res.json({
      success: true,
      data: departmentData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get department absence requests data',
      error: error.message
    });
  }
});

// Department Early Leave Requests (without tracking suffix)
router.get('/departments/early-leave-requests', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const departments = [
      'Mathematics',
      'Science',
      'English',
      'Arabic',
      'History',
      'Physical Education'
    ];
    
    // Generate department request data
    const departmentData = departments.map(dept => ({
      name: dept,
      value: Math.floor(Math.random() * 30) + 5
    }));
    
    res.json({
      success: true,
      data: departmentData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get department early leave requests data',
      error: error.message
    });
  }
});

// Department Late Arrival Requests (without tracking suffix)
router.get('/departments/late-arrival-requests', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const departments = [
      'Mathematics',
      'Science',
      'English',
      'Arabic',
      'History',
      'Physical Education'
    ];
    
    // Generate department request data
    const departmentData = departments.map(dept => ({
      name: dept,
      value: Math.floor(Math.random() * 25) + 3
    }));
    
    res.json({
      success: true,
      data: departmentData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get department late arrival requests data',
      error: error.message
    });
  }
});

// Departments Comparison Endpoints
router.get('/departments/absence-comparison', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const attendanceData = loadData('attendance.json');
    const filteredData = filterByDateRange(attendanceData, startDate, endDate);
    
    // Group by department and calculate absence rates
    const departmentStats = {};
    filteredData.forEach(record => {
      if (!departmentStats[record.subject]) {
        departmentStats[record.subject] = { total: 0, absences: 0 };
      }
      departmentStats[record.subject].total++;
      if (record.attendance === 'Absent') {
        departmentStats[record.subject].absences++;
      }
    });
    
    const comparisonData = Object.entries(departmentStats)
      .map(([dept, stats]) => ({
        department: dept,
        absenceRate: stats.total > 0 ? ((stats.absences / stats.total) * 100).toFixed(1) : 0,
        totalDays: stats.total,
        absentDays: stats.absences
      }))
      .filter(dept => dept.totalDays > 0)
      .sort((a, b) => parseFloat(b.absenceRate) - parseFloat(a.absenceRate));
    
    res.json({
      success: true,
      data: comparisonData,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get departments absence comparison', error: error.message });
  }
});

// Departments Early Leave Comparison
router.get('/departments/early-leave-comparison', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const attendanceData = loadData('attendance.json');
    const filteredData = filterByDateRange(attendanceData, startDate, endDate);
    
    // Group by department and calculate early leave rates
    const departmentStats = {};
    filteredData.forEach(record => {
      if (!departmentStats[record.subject]) {
        departmentStats[record.subject] = { total: 0, earlyLeaves: 0 };
      }
      departmentStats[record.subject].total++;
      if (record.attendance === 'Early Leave') {
        departmentStats[record.subject].earlyLeaves++;
      }
    });
    
    const comparisonData = Object.entries(departmentStats)
      .map(([dept, stats]) => ({
        department: dept,
        earlyLeaveRate: stats.total > 0 ? ((stats.earlyLeaves / stats.total) * 100).toFixed(1) : 0,
        totalDays: stats.total,
        earlyLeaveDays: stats.earlyLeaves
      }))
      .filter(dept => dept.totalDays > 0)
      .sort((a, b) => parseFloat(b.earlyLeaveRate) - parseFloat(a.earlyLeaveRate));
    
    res.json({
      success: true,
      data: comparisonData,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get departments early leave comparison', error: error.message });
  }
});

// Departments Late Arrival Comparison
router.get('/departments/late-arrival-comparison', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const attendanceData = loadData('attendance.json');
    const filteredData = filterByDateRange(attendanceData, startDate, endDate);
    
    // Group by department and calculate late arrival rates
    const departmentStats = {};
    filteredData.forEach(record => {
      if (!departmentStats[record.subject]) {
        departmentStats[record.subject] = { total: 0, lateArrivals: 0 };
      }
      departmentStats[record.subject].total++;
      if (record.attendance === 'Late') {
        departmentStats[record.subject].lateArrivals++;
      }
    });
    
    const comparisonData = Object.entries(departmentStats)
      .map(([dept, stats]) => ({
        department: dept,
        lateArrivalRate: stats.total > 0 ? ((stats.lateArrivals / stats.total) * 100).toFixed(1) : 0,
        totalDays: stats.total,
        lateDays: stats.lateArrivals
      }))
      .filter(dept => dept.totalDays > 0)
      .sort((a, b) => parseFloat(b.lateArrivalRate) - parseFloat(a.lateArrivalRate));
    
    res.json({
      success: true,
      data: comparisonData,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get departments late arrival comparison', error: error.message });
  }
});

// 1. Core Attendance Statistics
router.get('/attendance/summary', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const attendanceData = loadData('attendance.json');
    const teachersData = loadTeachers(); // Use loadTeachers here
    const period = req.query.period || 'month';
    const { start, end } = getDateRange(period);
    
    const filteredData = filterByDateRange(attendanceData, start, end);
    
    // Calculate core statistics
    const totalRecords = filteredData.length;
    const presentRecords = filteredData.filter(r => 
      r.attendance === 'Present' || r.attendance === 'Completed'
    ).length;
    const lateRecords = filteredData.filter(r => r.attendance === 'Late').length;
    const earlyLeaveRecords = filteredData.filter(r => r.attendance === 'Early Leave').length;
    const absentRecords = totalRecords - presentRecords - lateRecords - earlyLeaveRecords;
    
    // Calculate percentages
    const attendanceRate = totalRecords > 0 ? ((presentRecords / totalRecords) * 100).toFixed(1) : 0;
    const lateRate = totalRecords > 0 ? ((lateRecords / totalRecords) * 100).toFixed(1) : 0;
    const earlyLeaveRate = totalRecords > 0 ? ((earlyLeaveRecords / totalRecords) * 100).toFixed(1) : 0;
    const absenceRate = totalRecords > 0 ? ((absentRecords / totalRecords) * 100).toFixed(1) : 0;
    
    // Calculate average working hours
    const totalHours = filteredData.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    const averageHours = totalRecords > 0 ? (totalHours / totalRecords).toFixed(2) : 0;
    
    // Calculate overtime statistics
    const overtimeRecords = filteredData.filter(r => r.overtime > 0);
    const totalOvertime = filteredData.reduce((sum, record) => sum + (record.overtime || 0), 0);
    
    // Permission-based analysis
    const authorizedAbsences = filteredData.filter(r => r.hasPermission && r.attendance !== 'Present' && r.attendance !== 'Completed').length;
    const unauthorizedAbsences = filteredData.filter(r => !r.hasPermission && r.attendance !== 'Present' && r.attendance !== 'Completed').length;
    
    res.json({
      success: true,
      period: period,
      dateRange: { start, end },
      summary: {
        totalRecords,
        attendanceRate: `${attendanceRate}%`,
        totalPresent: presentRecords,
        totalLate: lateRecords,
        totalEarlyLeave: earlyLeaveRecords,
        totalAbsent: absentRecords,
        lateRate: `${lateRate}%`,
        earlyLeaveRate: `${earlyLeaveRate}%`,
        absenceRate: `${absenceRate}%`,
        averageWorkingHours: averageHours,
        totalOvertimeHours: totalOvertime.toFixed(2),
        overtimeRecords: overtimeRecords.length,
        authorizedAbsences,
        unauthorizedAbsences,
        permissionComplianceRate: unauthorizedAbsences + authorizedAbsences > 0 ? 
          `${((authorizedAbsences / (authorizedAbsences + unauthorizedAbsences)) * 100).toFixed(1)}%` : '100%'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance summary',
      error: error.message
    });
  }
});

// 2. Period Comparison Analytics
router.get('/attendance/comparison', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const attendanceData = loadData('attendance.json');
    const period1 = req.query.period1 || 'month';
    const period2 = req.query.period2 || 'lastMonth';
    
    const range1 = getDateRange(period1);
    const range2 = getDateRange(period2);
    
    const data1 = filterByDateRange(attendanceData, range1.start, range1.end);
    const data2 = filterByDateRange(attendanceData, range2.start, range2.end);
    
    // Calculate metrics for both periods
    const calculateMetrics = (data) => {
      const total = data.length;
      const present = data.filter(r => r.attendance === 'Present' || r.attendance === 'Completed').length;
      const late = data.filter(r => r.attendance === 'Late').length;
      const earlyLeave = data.filter(r => r.attendance === 'Early Leave').length;
      const totalHours = data.reduce((sum, record) => sum + (record.totalHours || 0), 0);
      
      return {
        totalRecords: total,
        attendanceRate: total > 0 ? ((present / total) * 100).toFixed(1) : 0,
        lateRate: total > 0 ? ((late / total) * 100).toFixed(1) : 0,
        earlyLeaveRate: total > 0 ? ((earlyLeave / total) * 100).toFixed(1) : 0,
        averageHours: total > 0 ? (totalHours / total).toFixed(2) : 0
      };
    };
    
    const metrics1 = calculateMetrics(data1);
    const metrics2 = calculateMetrics(data2);
    
    // Calculate changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous * 100).toFixed(1);
      return change > 0 ? `+${change}%` : `${change}%`;
    };
    
    const changes = {
      attendanceRate: calculateChange(
        parseFloat(metrics1.attendanceRate), 
        parseFloat(metrics2.attendanceRate)
      ),
      lateRate: calculateChange(
        parseFloat(metrics1.lateRate), 
        parseFloat(metrics2.lateRate)
      ),
      earlyLeaveRate: calculateChange(
        parseFloat(metrics1.earlyLeaveRate), 
        parseFloat(metrics2.earlyLeaveRate)
      ),
      averageHours: calculateChange(
        parseFloat(metrics1.averageHours), 
        parseFloat(metrics2.averageHours)
      ),
      totalRecords: calculateChange(metrics1.totalRecords, metrics2.totalRecords)
    };
    
    res.json({
      success: true,
      comparison: {
        period1: {
          name: period1,
          dateRange: range1,
          metrics: metrics1
        },
        period2: {
          name: period2,
          dateRange: range2,
          metrics: metrics2
        },
        changes: changes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get period comparison',
      error: error.message
    });
  }
});

// 3. Day-of-Week Analysis
router.get('/attendance/weekly-patterns', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const attendanceData = loadData('attendance.json');
    const period = req.query.period || 'month';
    const { start, end } = getDateRange(period);
    
    const filteredData = filterByDateRange(attendanceData, start, end);
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const patterns = {};
    
    // Initialize patterns object
    dayNames.forEach(day => {
      patterns[day] = {
        total: 0,
        present: 0,
        late: 0,
        earlyLeave: 0,
        absent: 0,
        totalHours: 0,
        lateArrivalTime: 0,
        earlyLeaveTime: 0
      };
    });
    
    // Process each record
    filteredData.forEach(record => {
      const dayOfWeek = new Date(record.dateISO).getDay();
      const dayName = dayNames[dayOfWeek];
      
      patterns[dayName].total++;
      patterns[dayName].totalHours += record.totalHours || 0;
      patterns[dayName].lateArrivalTime += record.lateArrival || 0;
      patterns[dayName].earlyLeaveTime += record.earlyLeave || 0;
      
      switch (record.attendance) {
        case 'Present':
        case 'Completed':
          patterns[dayName].present++;
          break;
        case 'Late':
          patterns[dayName].late++;
          break;
        case 'Early Leave':
          patterns[dayName].earlyLeave++;
          break;
        default:
          patterns[dayName].absent++;
      }
    });
    
    // Calculate percentages and averages
    const weeklyAnalysis = {};
    dayNames.forEach(day => {
      const dayData = patterns[day];
      const total = dayData.total;
      
      weeklyAnalysis[day] = {
        totalRecords: total,
        attendanceRate: total > 0 ? `${((dayData.present / total) * 100).toFixed(1)}%` : '0%',
        lateRate: total > 0 ? `${((dayData.late / total) * 100).toFixed(1)}%` : '0%',
        earlyLeaveRate: total > 0 ? `${((dayData.earlyLeave / total) * 100).toFixed(1)}%` : '0%',
        absentRate: total > 0 ? `${((dayData.absent / total) * 100).toFixed(1)}%` : '0%',
        averageHours: total > 0 ? (dayData.totalHours / total).toFixed(2) : '0',
        averageLateMinutes: total > 0 ? (dayData.lateArrivalTime * 60 / total).toFixed(1) : '0',
        averageEarlyLeaveMinutes: total > 0 ? (dayData.earlyLeaveTime * 60 / total).toFixed(1) : '0'
      };
    });
    
    // Find best and worst days
    const attendanceRates = dayNames.map(day => ({
      day,
      rate: parseFloat(weeklyAnalysis[day].attendanceRate)
    }));
    
    const bestDay = attendanceRates.reduce((best, current) => 
      current.rate > best.rate ? current : best
    );
    
    const worstDay = attendanceRates.reduce((worst, current) => 
      current.rate < worst.rate ? current : worst
    );
    
    res.json({
      success: true,
      period: period,
      dateRange: { start, end },
      weeklyPatterns: weeklyAnalysis,
      insights: {
        bestAttendanceDay: bestDay,
        worstAttendanceDay: worstDay,
        weekendPattern: {
          friday: weeklyAnalysis['Friday'],
          saturday: weeklyAnalysis['Saturday'],
          sunday: weeklyAnalysis['Sunday']
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get weekly patterns',
      error: error.message
    });
  }
});

// 4. Employee Performance Segmentation
router.get('/employees/performance-segments', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const attendanceData = loadData('attendance.json');
    const teachersData = loadTeachers(); // Use loadTeachers here
    const period = req.query.period || 'month';
    const { start, end } = getDateRange(period);
    
    const filteredData = filterByDateRange(attendanceData, start, end);
    
    // Group attendance by employee
    const employeeAttendance = {};
    
    filteredData.forEach(record => {
      if (!employeeAttendance[record.teacherId]) {
        employeeAttendance[record.teacherId] = {
          name: record.name,
          subject: record.subject,
          workType: record.workType,
          total: 0,
          present: 0,
          late: 0,
          earlyLeave: 0,
          absent: 0,
          totalHours: 0,
          lateArrivalTime: 0,
          earlyLeaveTime: 0
        };
      }
      
      const emp = employeeAttendance[record.teacherId];
      emp.total++;
      emp.totalHours += record.totalHours || 0;
      emp.lateArrivalTime += record.lateArrival || 0;
      emp.earlyLeaveTime += record.earlyLeave || 0;
      
      switch (record.attendance) {
        case 'Present':
        case 'Completed':
          emp.present++;
          break;
        case 'Late':
          emp.late++;
          break;
        case 'Early Leave':
          emp.earlyLeave++;
          break;
        default:
          emp.absent++;
      }
    });
    
    // Calculate performance scores and segment employees
    const performanceSegments = {
      excellent: [], // 95%+ attendance
      good: [],      // 85-94% attendance
      average: [],   // 75-84% attendance
      poor: [],      // <75% attendance
      atRisk: []     // Declining trend or concerning patterns
    };
    
    Object.entries(employeeAttendance).forEach(([teacherId, data]) => {
      const attendanceRate = data.total > 0 ? (data.present / data.total) * 100 : 0;
      const punctualityScore = data.total > 0 ? ((data.present + data.late + data.earlyLeave) / data.total) * 100 : 0;
      const averageHours = data.total > 0 ? data.totalHours / data.total : 0;
      
      const employee = {
        teacherId,
        name: data.name,
        subject: data.subject,
        workType: data.workType,
        attendanceRate: attendanceRate.toFixed(1),
        punctualityScore: punctualityScore.toFixed(1),
        totalDays: data.total,
        presentDays: data.present,
        lateDays: data.late,
        earlyLeaveDays: data.earlyLeave,
        absentDays: data.absent,
        averageHours: averageHours.toFixed(2),
        averageLateMinutes: data.total > 0 ? (data.lateArrivalTime * 60 / data.total).toFixed(1) : '0'
      };
      
      // Categorize employees
      if (attendanceRate >= 95) {
        performanceSegments.excellent.push(employee);
      } else if (attendanceRate >= 85) {
        performanceSegments.good.push(employee);
      } else if (attendanceRate >= 75) {
        performanceSegments.average.push(employee);
      } else {
        performanceSegments.poor.push(employee);
      }
      
      // Check for at-risk patterns
      if (attendanceRate < 80 || data.late > data.total * 0.3 || data.absent > data.total * 0.2) {
        employee.riskFactors = [];
        if (attendanceRate < 80) employee.riskFactors.push('Low attendance rate');
        if (data.late > data.total * 0.3) employee.riskFactors.push('Frequent late arrivals');
        if (data.absent > data.total * 0.2) employee.riskFactors.push('High absence rate');
        
        performanceSegments.atRisk.push(employee);
      }
    });
    
    // Sort each segment by attendance rate
    Object.keys(performanceSegments).forEach(segment => {
      performanceSegments[segment].sort((a, b) => parseFloat(b.attendanceRate) - parseFloat(a.attendanceRate));
    });
    
    res.json({
      success: true,
      period: period,
      dateRange: { start, end },
      performanceSegments: performanceSegments,
      summary: {
        excellent: performanceSegments.excellent.length,
        good: performanceSegments.good.length,
        average: performanceSegments.average.length,
        poor: performanceSegments.poor.length,
        atRisk: performanceSegments.atRisk.length,
        totalEmployees: Object.keys(employeeAttendance).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get employee performance segments',
      error: error.message
    });
  }
});

// 5. Request Analytics
router.get('/requests/summary', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const requestsData = loadData('requests.json');
    const period = req.query.period || 'month';
    const { start, end } = getDateRange(period);
    
    const filteredRequests = filterByDateRange(requestsData, start, end, 'appliedDate');
    
    // Analyze request types
    const requestTypes = {
      'Absence': { total: 0, approved: 0, rejected: 0, pending: 0 },
      'Early Leave': { total: 0, approved: 0, rejected: 0, pending: 0 },
      'Late Arrival': { total: 0, approved: 0, rejected: 0, pending: 0 }
    };
    
    // Analyze by status
    const statusCounts = { approved: 0, rejected: 0, pending: 0 };
    
    // Analyze by reason
    const reasonAnalysis = {};
    
    filteredRequests.forEach(request => {
      const type = request.requestType;
      const status = request.status;
      const reason = request.reason || 'No reason provided';
      
      // Count by type and status
      if (requestTypes[type]) {
        requestTypes[type].total++;
        requestTypes[type][status]++;
      }
      
      // Count by status
      statusCounts[status]++;
      
      // Count by reason
      if (!reasonAnalysis[reason]) {
        reasonAnalysis[reason] = 0;
      }
      reasonAnalysis[reason]++;
    });
    
    // Calculate approval rates
    const calculateApprovalRate = (typeData) => {
      const totalProcessed = typeData.approved + typeData.rejected;
      return totalProcessed > 0 ? ((typeData.approved / totalProcessed) * 100).toFixed(1) : '0';
    };
    
    // Top reasons
    const topReasons = Object.entries(reasonAnalysis)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));
    
    // Calculate average processing time (mock calculation for demonstration)
    const averageProcessingTime = '2.3 days'; // This would need actual timestamp analysis
    
    res.json({
      success: true,
      period: period,
      dateRange: { start, end },
      summary: {
        totalRequests: filteredRequests.length,
        byType: {
          absence: {
            count: requestTypes['Absence'].total,
            approvalRate: `${calculateApprovalRate(requestTypes['Absence'])}%`
          },
          earlyLeave: {
            count: requestTypes['Early Leave'].total,
            approvalRate: `${calculateApprovalRate(requestTypes['Early Leave'])}%`
          },
          lateArrival: {
            count: requestTypes['Late Arrival'].total,
            approvalRate: `${calculateApprovalRate(requestTypes['Late Arrival'])}%`
          }
        },
        byStatus: statusCounts,
        overallApprovalRate: filteredRequests.length > 0 ? 
          `${((statusCounts.approved / (statusCounts.approved + statusCounts.rejected)) * 100).toFixed(1)}%` : '0%',
        averageProcessingTime: averageProcessingTime,
        topReasons: topReasons
      },
      detailedBreakdown: requestTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get request summary',
      error: error.message
    });
  }
});

// 6. Department/Subject Analytics
router.get('/departments/comparison', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  try {
    const attendanceData = loadData('attendance.json');
    const teachersData = loadTeachers(); // Use loadTeachers here
    const requestsData = loadData('requests.json');
    const period = req.query.period || 'month';
    const { start, end } = getDateRange(period);
    
    const filteredAttendance = filterByDateRange(attendanceData, start, end);
    const filteredRequests = filterByDateRange(requestsData, start, end, 'appliedDate');
    
    // Group data by subject/department
    const departmentStats = {};
    
    // Initialize departments
    const departments = [...new Set(teachersData.map(teacher => teacher.subject))];
    departments.forEach(dept => {
      departmentStats[dept] = {
        name: dept,
        totalTeachers: teachersData.filter(t => t.subject === dept).length,
        attendance: { total: 0, present: 0, late: 0, earlyLeave: 0, absent: 0 },
        requests: { total: 0, approved: 0, rejected: 0, pending: 0 },
        totalHours: 0,
        overtime: 0
      };
    });
    
    // Process attendance data
    filteredAttendance.forEach(record => {
      const dept = record.subject;
      if (departmentStats[dept]) {
        const stats = departmentStats[dept];
        stats.attendance.total++;
        stats.totalHours += record.totalHours || 0;
        stats.overtime += record.overtime || 0;
        
        switch (record.attendance) {
          case 'Present':
          case 'Completed':
            stats.attendance.present++;
            break;
          case 'Late':
            stats.attendance.late++;
            break;
          case 'Early Leave':
            stats.attendance.earlyLeave++;
            break;
          default:
            stats.attendance.absent++;
        }
      }
    });
    
    // Process request data
    filteredRequests.forEach(request => {
      const dept = request.subject;
      if (departmentStats[dept]) {
        const stats = departmentStats[dept];
        stats.requests.total++;
        stats.requests[request.status]++;
      }
    });
    
    // Calculate metrics for each department
    const departmentComparison = departments.map(dept => {
      const stats = departmentStats[dept];
      const attendanceTotal = stats.attendance.total;
      const requestTotal = stats.requests.total;
      
      return {
        department: dept,
        totalTeachers: stats.totalTeachers,
        attendanceRate: attendanceTotal > 0 ? 
          `${((stats.attendance.present / attendanceTotal) * 100).toFixed(1)}%` : '0%',
        punctualityScore: attendanceTotal > 0 ? 
          `${(((stats.attendance.present + stats.attendance.late + stats.attendance.earlyLeave) / attendanceTotal) * 100).toFixed(1)}%` : '0%',
        absenceRate: attendanceTotal > 0 ? 
          `${((stats.attendance.absent / attendanceTotal) * 100).toFixed(1)}%` : '0%',
        lateRate: attendanceTotal > 0 ? 
          `${((stats.attendance.late / attendanceTotal) * 100).toFixed(1)}%` : '0%',
        requestVolume: requestTotal,
        requestApprovalRate: (stats.requests.approved + stats.requests.rejected) > 0 ? 
          `${((stats.requests.approved / (stats.requests.approved + stats.requests.rejected)) * 100).toFixed(1)}%` : '0%',
        averageHours: attendanceTotal > 0 ? (stats.totalHours / attendanceTotal).toFixed(2) : '0',
        totalOvertimeHours: stats.overtime.toFixed(2),
        performanceScore: attendanceTotal > 0 ? 
          ((stats.attendance.present / attendanceTotal * 0.6) + 
           ((stats.attendance.present + stats.attendance.late + stats.attendance.earlyLeave) / attendanceTotal * 0.4)) * 100 : 0
      };
    });
    
    // Sort by performance score
    departmentComparison.sort((a, b) => b.performanceScore - a.performanceScore);
    
    // Find best and worst performing departments
    const bestDepartment = departmentComparison[0];
    const worstDepartment = departmentComparison[departmentComparison.length - 1];
    
    res.json({
      success: true,
      period: period,
      dateRange: { start, end },
      departmentComparison: departmentComparison,
      insights: {
        bestPerforming: bestDepartment,
        worstPerforming: worstDepartment,
        totalDepartments: departments.length,
        averageAttendanceRate: departmentComparison.length > 0 ? 
          `${(departmentComparison.reduce((sum, dept) => sum + parseFloat(dept.attendanceRate), 0) / departmentComparison.length).toFixed(1)}%` : '0%'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get department comparison',
      error: error.message
    });
  }
});

// 7. Quick Statistics (Simple endpoints)
router.get('/quick/attendance-rate', authenticateJWT, (req, res) => {
  try {
    const attendanceData = loadData('attendance.json');
    const totalRecords = attendanceData.length;
    const presentRecords = attendanceData.filter(r => 
      r.attendance === 'Present' || r.attendance === 'Completed'
    ).length;
    
    const attendanceRate = totalRecords > 0 ? ((presentRecords / totalRecords) * 100).toFixed(1) : 0;
    
    res.json({
      success: true,
      attendanceRate: `${attendanceRate}%`,
      totalRecords,
      presentRecords,
      absentRecords: totalRecords - presentRecords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get quick attendance rate',
      error: error.message
    });
  }
});

module.exports = router; 