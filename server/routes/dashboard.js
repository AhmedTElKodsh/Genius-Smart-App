const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const teachersFilePath = path.join(__dirname, '..', 'data', 'teachers.json');
const attendanceFilePath = path.join(__dirname, '..', 'data', 'attendance.json');
const requestsFilePath = path.join(__dirname, '..', 'data', 'requests.json');
const departmentsFilePath = path.join(__dirname, '..', 'data', 'departments.json');

// Helper functions
const readAllData = () => {
  try {
    return {
      teachers: JSON.parse(fs.readFileSync(teachersFilePath, 'utf8')),
      attendance: JSON.parse(fs.readFileSync(attendanceFilePath, 'utf8')),
      requests: JSON.parse(fs.readFileSync(requestsFilePath, 'utf8')),
      departments: JSON.parse(fs.readFileSync(departmentsFilePath, 'utf8'))
    };
  } catch (error) {
    return {
      teachers: [],
      attendance: [],
      requests: [],
      departments: []
    };
  }
};

// GET /api/dashboard/overview - Get comprehensive dashboard overview
router.get('/overview', (req, res) => {
  try {
    const { teachers, attendance, requests, departments } = readAllData();
    const currentMonth = req.query.month || 'May';
    const currentYear = parseInt(req.query.year) || 2024;
    
    // Filter current month data
    const currentAttendance = attendance.filter(record => 
      record.month === currentMonth && record.year === currentYear
    );
    
    // Teacher Statistics
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.status === 'Active').length;
    const fullTimeTeachers = teachers.filter(t => t.workType === 'Full-time').length;
    const partTimeTeachers = teachers.filter(t => t.workType === 'Part-time').length;
    
    // Attendance Statistics
    const totalWorkingDays = currentAttendance.reduce((sum, record) => sum + record.totalWorkingDays, 0);
    const totalAttendedDays = currentAttendance.reduce((sum, record) => sum + record.attendedDays, 0);
    const overallAttendanceRate = totalWorkingDays > 0 ? 
      Math.round((totalAttendedDays / totalWorkingDays) * 100) : 0;
    const totalHours = currentAttendance.reduce((sum, record) => sum + record.totalHours, 0);
    const totalOvertimeHours = currentAttendance.reduce((sum, record) => sum + record.overtimeHours, 0);
    
    // Request Statistics
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'Pending').length;
    const recentRequests = requests.filter(r => {
      const requestDate = new Date(r.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return requestDate >= thirtyDaysAgo;
    }).length;
    
    // Performance Metrics
    const excellentPerformers = currentAttendance.filter(record => record.attendanceRate >= 95).length;
    const goodPerformers = currentAttendance.filter(record => record.attendanceRate >= 85 && record.attendanceRate < 95).length;
    const needsAttention = currentAttendance.filter(record => record.attendanceRate < 75).length;
    
    // Top Performers
    const topPerformers = currentAttendance
      .map(record => {
        const teacher = teachers.find(t => t.id === record.teacherId);
        return {
          teacher: teacher ? teacher.name : 'Unknown',
          department: teacher ? teacher.department : 'Unknown',
          attendanceRate: record.attendanceRate,
          totalHours: record.totalHours
        };
      })
      .sort((a, b) => b.attendanceRate - a.attendanceRate)
      .slice(0, 5);
    
    // Department Performance
    const departmentPerformance = departments.map(dept => {
      const deptTeachers = teachers.filter(t => t.department === dept.name);
      const deptAttendance = currentAttendance.filter(record => 
        deptTeachers.some(t => t.id === record.teacherId)
      );
      
      const deptWorkingDays = deptAttendance.reduce((sum, record) => sum + record.totalWorkingDays, 0);
      const deptAttendedDays = deptAttendance.reduce((sum, record) => sum + record.attendedDays, 0);
      const attendanceRate = deptWorkingDays > 0 ? 
        Math.round((deptAttendedDays / deptWorkingDays) * 100) : 0;
      
      return {
        department: dept.name,
        arabicName: dept.arabicName,
        teacherCount: deptTeachers.length,
        attendanceRate
      };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate);
    
    // Recent Activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = requests
      .filter(r => new Date(r.date) >= sevenDaysAgo)
      .map(r => {
        const teacher = teachers.find(t => t.id === r.teacherId);
        return {
          type: 'request',
          date: r.date,
          teacher: teacher ? teacher.name : 'Unknown',
          department: teacher ? teacher.department : 'Unknown',
          action: r.type,
          status: r.status
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    res.json({
      success: true,
      data: {
        period: `${currentMonth} ${currentYear}`,
        summary: {
          totalTeachers,
          activeTeachers,
          fullTimeTeachers,
          partTimeTeachers,
          overallAttendanceRate,
          totalHours,
          totalOvertimeHours,
          pendingRequests,
          recentRequests
        },
        performance: {
          excellent: excellentPerformers,
          good: goodPerformers,
          needsAttention: needsAttention,
          topPerformers: topPerformers
        },
        departments: {
          total: departments.length,
          performance: departmentPerformance.slice(0, 6) // Top 6 departments
        },
        activity: {
          recent: recentActivity
        }
      },
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