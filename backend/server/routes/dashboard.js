const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const teachersFilePath = path.join(__dirname, '..', 'data', 'teachers.json');
const attendanceFilePath = path.join(__dirname, '..', 'data', 'attendance.json');
const requestsFilePath = path.join(__dirname, '..', 'data', 'requests.json');
const subjectsFilePath = path.join(__dirname, '..', 'data', 'subjects.json');
const systemSettingsPath = path.join(__dirname, '..', 'data', 'system_settings.json');

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

// Helper function to read system settings
const readSystemSettings = () => {
  try {
    return JSON.parse(fs.readFileSync(systemSettingsPath, 'utf8'));
  } catch (error) {
    return {
      launchDate: '2025-08-04',
      weekendDays: ['Friday', 'Saturday']
    };
  }
};

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
    // Filter requests by date range if provided
    let statsRequests = filteredRequests;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      statsRequests = filteredRequests.filter(request => {
        const requestDate = new Date(request.date);
        return requestDate >= start && requestDate <= end;
      });
    }

    const requestStats = {
      authorized_absence: statsRequests.filter(r => r.type === 'AUTHORIZED_ABSENCE' || r.requestType === 'Absence').length,
      unauthorized_absence: statsRequests.filter(r => r.type === 'UNAUTHORIZED_ABSENCE').length,
      early_leave: statsRequests.filter(r => r.type === 'EARLY_LEAVE' || r.requestType === 'Early Leave').length,
      late_arrival: statsRequests.filter(r => r.type === 'LATE_ARRIVAL' || r.requestType === 'Late Arrival').length,
      overtime: roundHoursForDisplay(filteredAttendance.reduce((sum, record) => {
        if (startDate && endDate) {
          const recordDate = new Date(record.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          if (recordDate < start || recordDate > end) return sum;
        }
        const dailyHours = record.totalHours || 0;
        return sum + (dailyHours > 8 ? dailyHours - 8 : 0);
      }, 0)),
      total_hours: roundHoursForDisplay(filteredAttendance.reduce((sum, record) => {
        if (startDate && endDate) {
          const recordDate = new Date(record.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          if (recordDate < start || recordDate > end) return sum;
        }
        return sum + (record.totalHours || 0);
      }, 0))
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
    
    const totalHours = roundHoursForDisplay(currentAttendance.reduce((sum, record) => sum + record.totalHours, 0));
    const totalOvertimeHours = roundHoursForDisplay(currentAttendance.reduce((sum, record) => sum + record.overtimeHours, 0));
    
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

// GET /api/dashboard/today-checkins - Get teacher check-ins with checkout times (supports date range and subject filtering)
router.get('/today-checkins', (req, res) => {
  try {
    const { teachers, attendance } = readAllData();
    const { startDate, endDate, subject } = req.query;
    
    // Use provided date range or default to today
    const targetStartDate = startDate || new Date().toISOString().split('T')[0];
    const targetEndDate = endDate || targetStartDate;
    
    // Filter teachers by subject if specified
    let filteredTeachers = teachers;
    if (subject) {
      filteredTeachers = teachers.filter(t => t.subject === subject);
    }
    const filteredTeacherIds = filteredTeachers.map(t => t.id);
    
    // Find attendance records within date range and subject filter
    const filteredAttendance = attendance.filter(record => {
      const recordDate = record.dateISO;
      const inDateRange = recordDate >= targetStartDate && recordDate <= targetEndDate;
      const inSubjectFilter = !subject || filteredTeacherIds.includes(record.teacherId);
      return inDateRange && inSubjectFilter;
    });
    
    // Enrich with teacher data and remove duplicates (keep latest record per teacher)
    const checkinData = filteredAttendance
      .sort((a, b) => new Date(b.createdAt || b.date || '1970-01-01') - new Date(a.createdAt || a.date || '1970-01-01'))
      .filter((record, index, self) => 
        index === self.findIndex(r => r.teacherId === record.teacherId)
      )
      .map(record => {
        const teacher = teachers.find(t => t.id === record.teacherId);
        return {
          teacherId: record.teacherId,
          name: record.name || (teacher ? teacher.name : 'Unknown'),
          subject: record.subject || (teacher ? teacher.subject : 'Unknown'),
          checkIn: record.checkIn,
          checkOut: record.checkOut || null,
          totalHours: record.totalHours || 0,
          attendance: record.attendance,
          workType: record.workType || (teacher ? teacher.workType : 'Unknown'),
          date: record.dateISO
        };
      });
    
    // Group by status
    const checkedInOnly = checkinData.filter(t => t.checkIn && !t.checkOut);
    const checkedInAndOut = checkinData.filter(t => t.checkIn && t.checkOut);
    
    res.json({
      success: true,
      data: {
        dateRange: `${targetStartDate} to ${targetEndDate}`,
        total: checkinData.length,
        checkedInOnly: checkedInOnly.length,
        checkedInAndOut: checkedInAndOut.length,
        teachers: checkinData,
        filters: { subject: subject || 'All Subjects', startDate: targetStartDate, endDate: targetEndDate }
      },
      message: 'Check-ins retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve today\'s check-ins',
      details: error.message
    });
  }
});

// GET /api/dashboard/today-accepted-requests - Get today's accepted requests by type
router.get('/today-accepted-requests', (req, res) => {
  try {
    const { teachers, requests } = readAllData();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Find today's accepted requests
    const todayRequests = requests.filter(request => {
      const requestForToday = request.startDate === today || 
                             (request.duration && request.duration.includes(today.split('-').reverse().join(' ')));
      const isAccepted = request.status === 'approved' || request.result === 'Accepted';
      return requestForToday && isAccepted;
    });
    
    // Group by request type
    const requestsByType = {
      'Early Leave': todayRequests.filter(r => r.requestType === 'Early Leave').length,
      'Late Arrival': todayRequests.filter(r => r.requestType === 'Late Arrival').length,
      'Authorized Absence': todayRequests.filter(r => r.requestType === 'Authorized Absence' || r.requestType === 'Absence').length,
      'Permitted Leaves': todayRequests.filter(r => r.requestType === 'Permitted Leaves').length
    };
    
    // Detailed data with teacher info
    const detailedRequests = todayRequests.map(request => {
      const teacher = teachers.find(t => t.id === request.teacherId);
      return {
        id: request.id,
        teacherName: request.name || (teacher ? teacher.name : 'Unknown'),
        subject: request.subject || (teacher ? teacher.subject : 'Unknown'),
        requestType: request.requestType,
        reason: request.reason,
        duration: request.duration,
        approvedAt: request.updatedAt
      };
    });
    
    res.json({
      success: true,
      data: {
        date: today,
        total: todayRequests.length,
        byType: requestsByType,
        requests: detailedRequests
      },
      message: 'Today\'s accepted requests retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve today\'s accepted requests',
      details: error.message
    });
  }
});

// GET /api/dashboard/today-absences - Get absences (authorized and unauthorized) (supports date range and subject filtering)
router.get('/today-absences', (req, res) => {
  try {
    const { teachers, attendance, requests } = readAllData();
    const { startDate, endDate, subject } = req.query;
    
    // Read system settings to get launch date
    const systemSettings = readSystemSettings();
    const launchDate = systemSettings.launchDate || '2025-08-04';
    
    // Use provided date range or default to today
    const targetStartDate = startDate || new Date().toISOString().split('T')[0];
    const targetEndDate = endDate || targetStartDate;
    
    // Check if the requested date is before launch date
    if (targetEndDate < launchDate) {
      // Return empty data if checking dates before launch
      return res.json({
        success: true,
        data: {
          totalAbsent: 0,
          authorizedAbsent: 0,
          unauthorizedAbsentNoRequest: 0,
          unauthorizedAbsentRejected: 0,
          teachers: []
        }
      });
    }
    
    // Filter teachers by subject if specified
    let filteredTeachers = teachers;
    if (subject) {
      filteredTeachers = teachers.filter(t => t.subject === subject);
    }
    const filteredTeacherIds = filteredTeachers.map(t => t.id);
    
    // Find attendance records within date range and subject filter
    const filteredAttendance = attendance.filter(record => {
      const recordDate = record.dateISO;
      const inDateRange = recordDate >= targetStartDate && recordDate <= targetEndDate;
      const inSubjectFilter = !subject || filteredTeacherIds.includes(record.teacherId);
      return inDateRange && inSubjectFilter;
    });
    const checkedInTeacherIds = filteredAttendance.map(record => record.teacherId);
    
    // Find absence requests within date range and subject filter
    const filteredAbsenceRequests = requests.filter(request => {
      const requestDate = request.startDate;
      const inDateRange = requestDate >= targetStartDate && requestDate <= targetEndDate;
      const inSubjectFilter = !subject || filteredTeacherIds.includes(request.teacherId);
      const isAbsenceRequest = request.requestType === 'Absence' || 
                              request.requestType === 'Authorized Absence' ||
                              request.type === 'AUTHORIZED_ABSENCE' ||
                              request.type === 'UNAUTHORIZED_ABSENCE';
      return inDateRange && inSubjectFilter && isAbsenceRequest;
    });
    
    // 1. Separate AUTHORIZED absences (approved requests)
    const authorizedAbsences = filteredAbsenceRequests.filter(request => {
      return (request.status === 'approved' || request.result === 'Accepted') &&
             (request.requestType === 'Absence' || request.requestType === 'Authorized Absence' || request.type === 'AUTHORIZED_ABSENCE');
    });
    
    // 2. Find REJECTED absence requests
    const rejectedAbsenceRequests = filteredAbsenceRequests.filter(request => {
      return (request.status === 'rejected' || request.result === 'Rejected') &&
             (request.requestType === 'Absence' || request.requestType === 'Authorized Absence' || request.type === 'AUTHORIZED_ABSENCE');
    });
    
    // 3. Find teachers who are absent but didn't check in
    const absentTeachers = filteredTeachers.filter(teacher => {
      const notCheckedIn = !checkedInTeacherIds.includes(teacher.id);
      const isActive = teacher.status === 'Active';
      return isActive && notCheckedIn;
    });
    
    // 4. Categorize absent teachers into unauthorized types
    const unauthorizedAbsencesRejected = absentTeachers.filter(teacher => {
      return rejectedAbsenceRequests.some(req => req.teacherId === teacher.id);
    });
    
    const unauthorizedAbsencesNoRequest = absentTeachers.filter(teacher => {
      const hasApprovedRequest = authorizedAbsences.some(req => req.teacherId === teacher.id);
      const hasRejectedRequest = rejectedAbsenceRequests.some(req => req.teacherId === teacher.id);
      return !hasApprovedRequest && !hasRejectedRequest;
    });
    
    // Format authorized absences
    const formattedAuthorizedAbsences = authorizedAbsences.map(request => {
      const teacher = teachers.find(t => t.id === request.teacherId);
      return {
        id: request.teacherId,
        teacherId: request.teacherId,
        name: request.name || (teacher ? teacher.name : 'Unknown'),
        subject: request.subject || (teacher ? teacher.subject : 'Unknown'),
        absenceType: 'authorized',
        reason: request.reason || 'Approved absence request',
        duration: request.duration,
        requestDate: request.date || request.startDate
      };
    });
    
    // Format unauthorized absences - rejected requests
    const formattedUnauthorizedRejected = unauthorizedAbsencesRejected.map(teacher => {
      const rejectedRequest = rejectedAbsenceRequests.find(req => req.teacherId === teacher.id);
      return {
        id: teacher.id,
        teacherId: teacher.id,
        name: teacher.name,
        subject: teacher.subject,
        absenceType: 'unauthorized-rejected',
        reason: rejectedRequest ? `Rejected request: ${rejectedRequest.reason}` : 'Absence request was rejected',
        duration: rejectedRequest ? rejectedRequest.duration : 'Full day',
        requestDate: rejectedRequest ? rejectedRequest.startDate : targetStartDate
      };
    });
    
    // Format unauthorized absences - no request submitted
    const formattedUnauthorizedNoRequest = unauthorizedAbsencesNoRequest.map(teacher => {
      return {
        id: teacher.id,
        teacherId: teacher.id,
        name: teacher.name,
        subject: teacher.subject,
        absenceType: 'unauthorized-no-request',
        reason: 'No absence request submitted',
        duration: 'Full day',
        requestDate: targetStartDate
      };
    });
    
    // Combine all absences and remove duplicates by teacher ID
    const allAbsences = [
      ...formattedAuthorizedAbsences, 
      ...formattedUnauthorizedRejected, 
      ...formattedUnauthorizedNoRequest
    ].filter((absence, index, self) => 
      index === self.findIndex(a => a.teacherId === absence.teacherId)
    );
    
    // Add contact information from teachers data
    const enrichedAbsences = allAbsences.map(absence => {
      const teacher = teachers.find(t => t.id === absence.teacherId);
      return {
        ...absence,
        email: teacher?.email || `${absence.name.toLowerCase().replace(/\s+/g, '.').toLowerCase()}@school.edu`,
        phone: teacher?.phone || `+966${Math.floor(Math.random() * 900000000) + 100000000}`
      };
    });
    
    res.json({
      success: true,
      data: {
        dateRange: `${targetStartDate} to ${targetEndDate}`,
        totalAbsent: enrichedAbsences.length,
        authorizedAbsence: formattedAuthorizedAbsences.length,
        unauthorizedAbsence: formattedUnauthorizedRejected.length + formattedUnauthorizedNoRequest.length,
        unauthorizedNoRequest: formattedUnauthorizedNoRequest.length,
        unauthorizedRejected: formattedUnauthorizedRejected.length,
        absentTeachers: enrichedAbsences,
        filters: { subject: subject || 'All Subjects', startDate: targetStartDate, endDate: targetEndDate }
      },
      message: 'Absences retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve today\'s absences',
      details: error.message
    });
  }
});

// GET /api/dashboard/missing-teachers - Get teachers who didn't check in and don't have approved requests
router.get('/missing-teachers', (req, res) => {
  try {
    const { teachers, attendance, requests } = readAllData();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Get today's attendance
    const todayAttendance = attendance.filter(record => record.dateISO === today);
    const checkedInTeacherIds = todayAttendance.map(record => record.teacherId);
    
    // Get today's approved requests
    const todayApprovedRequests = requests.filter(request => {
      const requestForToday = request.startDate === today || 
                             (request.duration && request.duration.includes(today.split('-').reverse().join(' ')));
      const isApproved = request.status === 'approved' || request.result === 'Accepted';
      return requestForToday && isApproved;
    });
    const approvedRequestTeacherIds = todayApprovedRequests.map(request => request.teacherId);
    
    // Get today's rejected requests
    const todayRejectedRequests = requests.filter(request => {
      const requestForToday = request.startDate === today || 
                             (request.duration && request.duration.includes(today.split('-').reverse().join(' ')));
      const isRejected = request.status === 'rejected' || request.result === 'Rejected';
      return requestForToday && isRejected;
    });
    const rejectedRequestTeacherIds = todayRejectedRequests.map(request => request.teacherId);
    
    // Find missing teachers (not checked in AND no approved request)
    const missingTeachers = teachers.filter(teacher => {
      const notCheckedIn = !checkedInTeacherIds.includes(teacher.id);
      const noApprovedRequest = !approvedRequestTeacherIds.includes(teacher.id);
      const isActive = teacher.status === 'Active';
      return isActive && notCheckedIn && noApprovedRequest;
    });
    
    // Teachers with rejected requests who also didn't check in
    const rejectedAndNotCheckedIn = teachers.filter(teacher => {
      const notCheckedIn = !checkedInTeacherIds.includes(teacher.id);
      const hasRejectedRequest = rejectedRequestTeacherIds.includes(teacher.id);
      const isActive = teacher.status === 'Active';
      return isActive && notCheckedIn && hasRejectedRequest;
    });
    
    // Combine and format the data
    const allMissingTeachers = [...missingTeachers, ...rejectedAndNotCheckedIn].map(teacher => {
      const hasRejectedRequest = rejectedRequestTeacherIds.includes(teacher.id);
      return {
        id: teacher.id,
        name: teacher.name,
        subject: teacher.subject,
        workType: teacher.workType,
        phone: teacher.phone,
        status: hasRejectedRequest ? 'Rejected Request' : 'No Request',
        reason: hasRejectedRequest ? 'Had rejected request' : 'No excuse provided'
      };
    });
    
    // Remove duplicates based on teacher ID
    const uniqueMissingTeachers = allMissingTeachers.filter((teacher, index, self) => 
      index === self.findIndex(t => t.id === teacher.id)
    );
    
    res.json({
      success: true,
      data: {
        date: today,
        total: uniqueMissingTeachers.length,
        noExcuse: missingTeachers.length,
        rejectedRequest: rejectedAndNotCheckedIn.length,
        teachers: uniqueMissingTeachers
      },
      message: 'Missing teachers retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve missing teachers',
      details: error.message
    });
  }
});

// GET /api/dashboard/immediate-requests - Get immediate requests (supports date range and subject filtering)
router.get('/immediate-requests', (req, res) => {
  try {
    const { teachers, requests } = readAllData();
    const { startDate, endDate, subject } = req.query;
    
    // Use provided date range or default to tomorrow and day after
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0];
    
    const targetStartDate = startDate || tomorrowStr;
    const targetEndDate = endDate || dayAfterTomorrowStr;
    
    // Filter teachers by subject if specified
    let filteredTeachers = teachers;
    if (subject) {
      filteredTeachers = teachers.filter(t => t.subject === subject);
    }
    const filteredTeacherIds = filteredTeachers.map(t => t.id);
    
    // Find pending requests within date range and subject filter
    const immediateRequests = requests.filter(request => {
      const isPending = request.status === 'pending' || (!request.status && !request.result);
      const requestDate = request.startDate;
      const inDateRange = requestDate >= targetStartDate && requestDate <= targetEndDate;
      const inSubjectFilter = !subject || filteredTeacherIds.includes(request.teacherId);
      
      return isPending && inDateRange && inSubjectFilter;
    });
    
    // Group by date
    const requestsByDate = {};
    immediateRequests.forEach(request => {
      const date = request.startDate;
      if (!requestsByDate[date]) {
        requestsByDate[date] = [];
      }
      requestsByDate[date].push(request);
    });
    
    // Format the data with teacher information
    const formatRequests = (requestList, targetDate) => {
      return requestList.map(request => {
        const teacher = teachers.find(t => t.id === request.teacherId);
        return {
          id: request.id,
          teacherName: request.name || (teacher ? teacher.name : 'Unknown'),
          subject: request.subject || (teacher ? teacher.subject : 'Unknown'),
          requestType: request.requestType,
          reason: request.reason,
          duration: request.duration,
          submittedAt: request.submittedAt || request.createdAt,
          urgency: 'high', // All immediate requests are high urgency
          targetDate: targetDate
        };
      });
    };
    
    // Format all requests
    const allFormattedRequests = immediateRequests.map(request => {
      const teacher = teachers.find(t => t.id === request.teacherId);
      return {
        id: request.id,
        teacherName: request.name || (teacher ? teacher.name : 'Unknown'),
        subject: request.subject || (teacher ? teacher.subject : 'Unknown'),
        requestType: request.requestType,
        reason: request.reason,
        duration: request.duration,
        submittedAt: request.submittedAt || request.createdAt,
        urgency: 'high',
        targetDate: request.startDate
      };
    });
    
    // Create date-specific responses for backward compatibility
    const tomorrowRequests = requestsByDate[tomorrowStr] || [];
    const dayAfterRequests = requestsByDate[dayAfterTomorrowStr] || [];
    const formattedTomorrowRequests = formatRequests(tomorrowRequests, tomorrowStr);
    const formattedDayAfterRequests = formatRequests(dayAfterRequests, dayAfterTomorrowStr);
    
    res.json({
      success: true,
      data: {
        tomorrow: {
          date: tomorrowStr,
          count: formattedTomorrowRequests.length,
          requests: formattedTomorrowRequests
        },
        dayAfterTomorrow: {
          date: dayAfterTomorrowStr,
          count: formattedDayAfterRequests.length,
          requests: formattedDayAfterRequests
        },
        total: immediateRequests.length,
        allRequests: allFormattedRequests,
        requestsByDate: requestsByDate,
        filters: { subject: subject || 'All Subjects', startDate: targetStartDate, endDate: targetEndDate }
      },
      message: 'Immediate requests retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve immediate requests',
      details: error.message
    });
  }
});

module.exports = router; 