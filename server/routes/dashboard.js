const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const teachersFilePath = path.join(__dirname, '..', 'data', 'teachers.json');
const attendanceFilePath = path.join(__dirname, '..', 'data', 'attendance.json');
const requestsFilePath = path.join(__dirname, '..', 'data', 'requests.json');
const subjectsFilePath = path.join(__dirname, '..', 'data', 'subjects.json');

// Helper functions
const readAllData = () => {
  try {
    return {
      teachers: JSON.parse(fs.readFileSync(teachersFilePath, 'utf8')),
      attendance: JSON.parse(fs.readFileSync(attendanceFilePath, 'utf8')),
      requests: JSON.parse(fs.readFileSync(requestsFilePath, 'utf8')),
      subjects: JSON.parse(fs.readFileSync(subjectsFilePath, 'utf8'))
    };
  } catch (error) {
    return {
      teachers: [],
      attendance: [],
      requests: [],
      subjects: []
    };
  }
};

// GET /api/dashboard/overview - Get comprehensive dashboard overview
router.get('/overview', (req, res) => {
  try {
    const { teachers, attendance, requests, subjects } = readAllData();
    const { startDate, endDate, subject } = req.query;
    
    // Filter data based on query parameters
    let filteredTeachers = teachers;
    let filteredRequests = requests;
    let filteredAttendance = attendance;
    
    // Filter by subject if specified
    if (subject) {
      filteredTeachers = teachers.filter(t => t.subject === subject);
      const teacherIds = filteredTeachers.map(t => t.id);
      filteredRequests = requests.filter(r => teacherIds.includes(r.teacherId));
      filteredAttendance = attendance.filter(a => teacherIds.includes(a.teacherId));
    }
    
    // Helper function to calculate age from birthdate
    const calculateAge = (birthdate) => {
      const today = new Date();
      const birth = new Date(birthdate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };
    
    // Request Statistics (for analytics cards) - using correct data types
    const requestStats = {
      permitted_leaves: filteredRequests.filter(r => r.type === 'PERMITTED_LEAVES').length,
      unpermitted_leaves: filteredRequests.filter(r => r.type === 'UNPERMITTED_LEAVES').length,
      authorized_absence: filteredRequests.filter(r => r.type === 'AUTHORIZED_ABSENCE').length,
      unauthorized_absence: filteredRequests.filter(r => r.type === 'UNAUTHORIZED_ABSENCE').length,
      overtime: filteredRequests.filter(r => r.type === 'OVERTIME').length,
      late_arrival: filteredRequests.filter(r => r.type === 'LATE_IN').length,
    };
    
    // Age Distribution using real birthdates
    const ageDistribution = {
      under24: 0,
      between24And32: 0,
      above32: 0,
      total: filteredTeachers.length
    };
    
    filteredTeachers.forEach(teacher => {
      if (teacher.birthdate) {
        const age = calculateAge(teacher.birthdate);
        if (age < 24) {
          ageDistribution.under24++;
        } else if (age >= 24 && age <= 32) {
          ageDistribution.between24And32++;
        } else {
          ageDistribution.above32++;
        }
      }
    });
    
    // Helper function to get requests by day of week within date range
    const getRequestsByDay = (startDate, endDate) => {
      const start = startDate ? new Date(startDate) : new Date('2024-04-01');
      const end = endDate ? new Date(endDate) : new Date();
      
      return filteredRequests.filter(request => {
        const requestDate = new Date(request.date);
        return requestDate >= start && requestDate <= end;
      });
    };
    
    // Filter requests by date range
    const dateFilteredRequests = getRequestsByDay(startDate, endDate);
    
    // Calculate Weekly Attendance based on actual data
    const weeklyAttendance = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'].map(day => {
      const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'].indexOf(day);
      
      // Count requests by type for this day of week
      const dayRequests = dateFilteredRequests.filter(request => {
        const requestDate = new Date(request.date);
        return requestDate.getDay() === dayIndex;
      });
      
      // Calculate attendance categories
      const lateCount = dayRequests.filter(r => r.type === 'LATE_IN').length;
      const absentCount = dayRequests.filter(r => 
        r.type === 'AUTHORIZED_ABSENCE' || r.type === 'UNAUTHORIZED_ABSENCE'
      ).length;
      
      // On-time = Total teachers - Late - Absent (but ensure it's not negative)
      const onTimeCount = Math.max(0, filteredTeachers.length - lateCount - absentCount);
      
      return {
        day: day,
        onTime: onTimeCount,
        late: lateCount,
        absent: absentCount
      };
    });
    
    // Total teachers for overall stats
    const totalTeachers = filteredTeachers.length;
    
    res.json({
      success: true,
      requestStats: requestStats,
      ageDistribution: ageDistribution,
      weeklyAttendance: weeklyAttendance,
      totalTeachers: totalTeachers,
      message: 'Dashboard overview retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard overview',
      details: error.message
    });
  }
});

// GET /api/dashboard/analytics - Get detailed analytics for charts and graphs
router.get('/analytics', (req, res) => {
  try {
    const { teachers, attendance, requests } = readAllData();
    const year = parseInt(req.query.year) || 2024;
    
    // Monthly attendance trends
    const monthlyTrends = ['April', 'May', 'June'].map(month => {
      const monthAttendance = attendance.filter(record => 
        record.month === month && record.year === year
      );
      
      const totalWorkingDays = monthAttendance.reduce((sum, record) => sum + record.totalWorkingDays, 0);
      const totalAttendedDays = monthAttendance.reduce((sum, record) => sum + record.attendedDays, 0);
      const attendanceRate = totalWorkingDays > 0 ? 
        Math.round((totalAttendedDays / totalWorkingDays) * 100) : 0;
      
      return {
        month,
        attendanceRate,
        totalTeachers: monthAttendance.length,
        totalHours: monthAttendance.reduce((sum, record) => sum + record.totalHours, 0),
        overtimeHours: monthAttendance.reduce((sum, record) => sum + record.overtimeHours, 0)
      };
    });
    
    // Request trends by month
    const requestTrends = ['April', 'May', 'June'].map(month => {
      const monthStart = new Date(year, ['April', 'May', 'June'].indexOf(month), 1);
      const monthEnd = new Date(year, ['April', 'May', 'June'].indexOf(month) + 1, 0);
      
      const monthRequests = requests.filter(r => {
        const requestDate = new Date(r.date);
        return requestDate >= monthStart && requestDate <= monthEnd;
      });
      
      return {
        month,
        totalRequests: monthRequests.length,
        approved: monthRequests.filter(r => r.status === 'Approved').length,
        rejected: monthRequests.filter(r => r.status === 'Rejected').length,
        pending: monthRequests.filter(r => r.status === 'Pending').length
      };
    });
    
    // Work type distribution
    const workTypeDistribution = [
      {
        type: 'Full-time',
        count: teachers.filter(t => t.workType === 'Full-time').length,
        percentage: Math.round((teachers.filter(t => t.workType === 'Full-time').length / teachers.length) * 100)
      },
      {
        type: 'Part-time',
        count: teachers.filter(t => t.workType === 'Part-time').length,
        percentage: Math.round((teachers.filter(t => t.workType === 'Part-time').length / teachers.length) * 100)
      }
    ];
    
    // Age distribution
    const ageGroups = [
      { range: '20-30', min: 20, max: 30 },
      { range: '31-40', min: 31, max: 40 },
      { range: '41-50', min: 41, max: 50 },
      { range: '51+', min: 51, max: 100 }
    ];
    
    const ageDistribution = ageGroups.map(group => {
      const count = teachers.filter(teacher => {
        const age = new Date().getFullYear() - new Date(teacher.birthdate).getFullYear();
        return age >= group.min && age <= group.max;
      }).length;
      
      return {
        range: group.range,
        count,
        percentage: Math.round((count / teachers.length) * 100)
      };
    });
    
    // Request type distribution
    const requestTypes = ['PERMITTED_LEAVES', 'UNPERMITTED_LEAVES', 'AUTHORIZED_ABSENCE', 
                         'UNAUTHORIZED_ABSENCE', 'OVERTIME', 'LATE_IN'];
    
    const requestTypeDistribution = requestTypes.map(type => {
      const count = requests.filter(r => r.type === type).length;
      return {
        type,
        count,
        percentage: Math.round((count / requests.length) * 100)
      };
    });
    
    // Performance distribution
    const currentMonth = 'May';
    const currentAttendance = attendance.filter(record => record.month === currentMonth);
    const performanceDistribution = [
      {
        category: 'Excellent (95%+)',
        count: currentAttendance.filter(record => record.attendanceRate >= 95).length,
        color: '#22c55e'
      },
      {
        category: 'Good (85-94%)',
        count: currentAttendance.filter(record => record.attendanceRate >= 85 && record.attendanceRate < 95).length,
        color: '#3b82f6'
      },
      {
        category: 'Average (75-84%)',
        count: currentAttendance.filter(record => record.attendanceRate >= 75 && record.attendanceRate < 85).length,
        color: '#f59e0b'
      },
      {
        category: 'Poor (<75%)',
        count: currentAttendance.filter(record => record.attendanceRate < 75).length,
        color: '#ef4444'
      }
    ];
    
    res.json({
      success: true,
      data: {
        year,
        trends: {
          attendance: monthlyTrends,
          requests: requestTrends
        },
        distributions: {
          workType: workTypeDistribution,
          age: ageDistribution,
          requestType: requestTypeDistribution,
          performance: performanceDistribution
        }
      },
      message: 'Dashboard analytics retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard analytics',
      details: error.message
    });
  }
});

// GET /api/dashboard/alerts - Get system alerts and notifications
router.get('/alerts', (req, res) => {
  try {
    const { teachers, attendance, requests } = readAllData();
    const currentMonth = 'May';
    const currentYear = 2024;
    
    const alerts = [];
    
    // Low attendance alerts
    const currentAttendance = attendance.filter(record => 
      record.month === currentMonth && record.year === currentYear
    );
    
    const lowAttendanceTeachers = currentAttendance.filter(record => record.attendanceRate < 75);
    lowAttendanceTeachers.forEach(record => {
      const teacher = teachers.find(t => t.id === record.teacherId);
      alerts.push({
        type: 'warning',
        category: 'attendance',
        title: 'Low Attendance Alert',
        message: `${teacher ? teacher.name : 'Unknown'} has ${record.attendanceRate}% attendance`,
        teacher: teacher ? teacher.name : 'Unknown',
        department: teacher ? teacher.department : 'Unknown',
        severity: record.attendanceRate < 50 ? 'high' : 'medium',
        date: new Date().toISOString()
      });
    });
    
    // Pending requests alerts
    const urgentRequests = requests.filter(r => {
      const requestDate = new Date(r.date);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return r.status === 'Pending' && requestDate <= threeDaysAgo;
    });
    
    urgentRequests.forEach(request => {
      const teacher = teachers.find(t => t.id === request.teacherId);
      alerts.push({
        type: 'info',
        category: 'requests',
        title: 'Pending Request Alert',
        message: `${request.type} request from ${teacher ? teacher.name : 'Unknown'} pending for 3+ days`,
        teacher: teacher ? teacher.name : 'Unknown',
        department: teacher ? teacher.department : 'Unknown',
        severity: 'medium',
        date: new Date().toISOString()
      });
    });
    
    // High overtime alerts
    const highOvertimeTeachers = currentAttendance.filter(record => record.overtimeHours > 20);
    highOvertimeTeachers.forEach(record => {
      const teacher = teachers.find(t => t.id === record.teacherId);
      alerts.push({
        type: 'warning',
        category: 'overtime',
        title: 'High Overtime Alert',
        message: `${teacher ? teacher.name : 'Unknown'} has ${record.overtimeHours} overtime hours`,
        teacher: teacher ? teacher.name : 'Unknown',
        department: teacher ? teacher.department : 'Unknown',
        severity: record.overtimeHours > 30 ? 'high' : 'medium',
        date: new Date().toISOString()
      });
    });
    
    // Excessive late hours alerts
    const excessiveLateTeachers = currentAttendance.filter(record => record.lateHours > 10);
    excessiveLateTeachers.forEach(record => {
      const teacher = teachers.find(t => t.id === record.teacherId);
      alerts.push({
        type: 'warning',
        category: 'punctuality',
        title: 'Punctuality Concern',
        message: `${teacher ? teacher.name : 'Unknown'} has ${record.lateHours} late hours`,
        teacher: teacher ? teacher.name : 'Unknown',
        department: teacher ? teacher.department : 'Unknown',
        severity: record.lateHours > 15 ? 'high' : 'medium',
        date: new Date().toISOString()
      });
    });
    
    // Sort alerts by severity and date
    alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return new Date(b.date) - new Date(a.date);
    });
    
    // Summary statistics
    const alertSummary = {
      total: alerts.length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
      byCategory: {
        attendance: alerts.filter(a => a.category === 'attendance').length,
        requests: alerts.filter(a => a.category === 'requests').length,
        overtime: alerts.filter(a => a.category === 'overtime').length,
        punctuality: alerts.filter(a => a.category === 'punctuality').length
      }
    };
    
    res.json({
      success: true,
      data: {
        alerts: alerts.slice(0, 20), // Return top 20 alerts
        summary: alertSummary
      },
      message: 'Dashboard alerts retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard alerts',
      details: error.message
    });
  }
});

// GET /api/dashboard/quick-stats - Get quick statistics for dashboard widgets
router.get('/quick-stats', (req, res) => {
  try {
    const { teachers, attendance, requests } = readAllData();
    const currentMonth = 'May';
    const currentYear = 2024;
    
    const currentAttendance = attendance.filter(record => 
      record.month === currentMonth && record.year === currentYear
    );
    
    // Quick stats calculations
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.status === 'Active').length;
    
    const totalWorkingDays = currentAttendance.reduce((sum, record) => sum + record.totalWorkingDays, 0);
    const totalAttendedDays = currentAttendance.reduce((sum, record) => sum + record.attendedDays, 0);
    const attendanceRate = totalWorkingDays > 0 ? 
      Math.round((totalAttendedDays / totalWorkingDays) * 100) : 0;
    
    const pendingRequests = requests.filter(r => r.status === 'Pending').length;
    const totalRequests = requests.length;
    
    const totalHours = currentAttendance.reduce((sum, record) => sum + record.totalHours, 0);
    const totalOvertimeHours = currentAttendance.reduce((sum, record) => sum + record.overtimeHours, 0);
    
    // Performance indicators
    const excellentPerformers = currentAttendance.filter(record => record.attendanceRate >= 95).length;
    const needsAttention = currentAttendance.filter(record => record.attendanceRate < 75).length;
    
    // Recent trends (compare with previous month)
    const previousMonth = 'April';
    const previousAttendance = attendance.filter(record => 
      record.month === previousMonth && record.year === currentYear
    );
    
    const prevTotalWorkingDays = previousAttendance.reduce((sum, record) => sum + record.totalWorkingDays, 0);
    const prevTotalAttendedDays = previousAttendance.reduce((sum, record) => sum + record.attendedDays, 0);
    const prevAttendanceRate = prevTotalWorkingDays > 0 ? 
      Math.round((prevTotalAttendedDays / prevTotalWorkingDays) * 100) : 0;
    
    const attendanceTrend = attendanceRate - prevAttendanceRate;
    
    res.json({
      success: true,
      data: {
        period: `${currentMonth} ${currentYear}`,
        stats: {
          totalTeachers: {
            value: totalTeachers,
            label: 'Total Teachers'
          },
          activeTeachers: {
            value: activeTeachers,
            label: 'Active Teachers',
            percentage: Math.round((activeTeachers / totalTeachers) * 100)
          },
          attendanceRate: {
            value: attendanceRate,
            label: 'Overall Attendance',
            trend: attendanceTrend,
            unit: '%'
          },
          pendingRequests: {
            value: pendingRequests,
            label: 'Pending Requests',
            total: totalRequests
          },
          totalHours: {
            value: totalHours,
            label: 'Total Hours Worked'
          },
          overtimeHours: {
            value: totalOvertimeHours,
            label: 'Overtime Hours',
            percentage: totalHours > 0 ? Math.round((totalOvertimeHours / totalHours) * 100) : 0
          },
          excellentPerformers: {
            value: excellentPerformers,
            label: 'Excellent Performers (95%+)',
            percentage: currentAttendance.length > 0 ? Math.round((excellentPerformers / currentAttendance.length) * 100) : 0
          },
          needsAttention: {
            value: needsAttention,
            label: 'Needs Attention (<75%)',
            percentage: currentAttendance.length > 0 ? Math.round((needsAttention / currentAttendance.length) * 100) : 0
          }
        }
      },
      message: 'Quick statistics retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve quick statistics',
      details: error.message
    });
  }
});

module.exports = router; 