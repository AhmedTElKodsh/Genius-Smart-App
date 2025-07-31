const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Helper function to read JSON file
async function readJsonFile(filename) {
  try {
    const filePath = path.join(__dirname, '..', 'data', filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// Helper function to get date range based on period
function getDateRange(period) {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'thisweek':
      const firstDay = now.getDate() - now.getDay();
      startDate = new Date(now.setDate(firstDay));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      break;
    case 'thismonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'last3months':
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      endDate = new Date();
      break;
    default:
      // Default to this month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  return { startDate, endDate };
}

// Routes
router.get('/attendance/summary', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const attendance = await readJsonFile('attendance.json');
    const teachers = await readJsonFile('teachers.json');
    const { startDate, endDate } = getDateRange(period);

    // Filter attendance records by date range
    const filteredAttendance = attendance.filter(record => {
      const recordDate = new Date(record.dateISO);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Calculate statistics
    const totalTeachers = teachers.length;
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = filteredAttendance.filter(r => r.dateISO === today);
    
    const presentToday = todayRecords.filter(r => r.attendance === 'Present').length;
    const absentToday = todayRecords.filter(r => r.attendance === 'Absent').length;
    const lateToday = todayRecords.filter(r => r.attendance === 'Late').length;
    const earlyLeaveToday = todayRecords.filter(r => r.attendance === 'Early Leave').length;

    // Calculate average attendance for the period
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const presentCount = filteredAttendance.filter(r => r.attendance === 'Present').length;
    const averageAttendance = totalDays > 0 ? (presentCount / (totalTeachers * totalDays)) * 100 : 0;

    res.json({
      period,
      totalTeachers,
      presentToday,
      absentToday,
      lateToday,
      earlyLeaveToday,
      averageAttendance: averageAttendance.toFixed(1),
      trends: {
        attendance: 0,
        absence: 0,
        lateArrival: 0,
        earlyLeave: 0
      }
    });
  } catch (error) {
    console.error('Error in attendance summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/departments/comparison', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const attendance = await readJsonFile('attendance.json');
    const teachers = await readJsonFile('teachers.json');
    const departments = await readJsonFile('departments.json');
    const { startDate, endDate } = getDateRange(period);

    // Filter attendance by date range
    const filteredAttendance = attendance.filter(record => {
      const recordDate = new Date(record.dateISO);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Group by department
    const departmentStats = departments.map(dept => {
      // Get teachers in this department
      const deptTeachers = teachers.filter(t => t.department === dept.name);
      const teacherIds = deptTeachers.map(t => t.id);

      // Get attendance records for these teachers
      const deptAttendance = filteredAttendance.filter(a => teacherIds.includes(a.teacherId));

      return {
        department: dept.name,
        metrics: {
          attendance: deptAttendance.filter(a => a.attendance === 'Present').length,
          absences: deptAttendance.filter(a => a.attendance === 'Absent').length,
          lateArrivals: deptAttendance.filter(a => a.attendance === 'Late').length,
          earlyLeaves: deptAttendance.filter(a => a.attendance === 'Early Leave').length
        }
      };
    });

    res.json(departmentStats);
  } catch (error) {
    console.error('Error in departments comparison:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/attendance/weekly-patterns', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const attendance = await readJsonFile('attendance.json');
    const { startDate, endDate } = getDateRange(period);

    // Filter attendance by date range
    const filteredAttendance = attendance.filter(record => {
      const recordDate = new Date(record.dateISO);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Group by day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats = days.map(day => {
      const dayIndex = days.indexOf(day);
      const dayRecords = filteredAttendance.filter(record => {
        const recordDate = new Date(record.dateISO);
        return recordDate.getDay() === dayIndex;
      });

      const totalRecords = dayRecords.length || 1; // Avoid division by zero
      const presentCount = dayRecords.filter(r => r.attendance === 'Present').length;
      const lateCount = dayRecords.filter(r => r.attendance === 'Late').length;
      const earlyLeaveCount = dayRecords.filter(r => r.attendance === 'Early Leave').length;

      return {
        day,
        attendance: totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0,
        lateArrivals: lateCount,
        earlyLeaves: earlyLeaveCount
      };
    });

    // Filter out days with no data (weekends)
    const activeDays = dayStats.filter(d => d.attendance > 0 || d.lateArrivals > 0 || d.earlyLeaves > 0);

    // Return empty array if no attendance data
    res.json(filteredAttendance.length > 0 ? activeDays : [])
  } catch (error) {
    console.error('Error in weekly patterns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/employees/performance-segments', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const attendance = await readJsonFile('attendance.json');
    const teachers = await readJsonFile('teachers.json');
    const { startDate, endDate } = getDateRange(period);

    // Filter attendance by date range
    const filteredAttendance = attendance.filter(record => {
      const recordDate = new Date(record.dateISO);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Calculate performance for each teacher
    const teacherPerformance = teachers.map(teacher => {
      const teacherRecords = filteredAttendance.filter(a => a.teacherId === teacher.id);
      const totalDays = teacherRecords.length || 1;
      const presentDays = teacherRecords.filter(r => r.attendance === 'Present').length;
      const attendanceRate = (presentDays / totalDays) * 100;
      
      return { teacherId: teacher.id, attendanceRate };
    });

    // Segment teachers
    const segments = {
      excellent: teacherPerformance.filter(t => t.attendanceRate >= 95).length,
      good: teacherPerformance.filter(t => t.attendanceRate >= 85 && t.attendanceRate < 95).length,
      needsImprovement: teacherPerformance.filter(t => t.attendanceRate >= 70 && t.attendanceRate < 85).length,
      critical: teacherPerformance.filter(t => t.attendanceRate < 70).length
    };

    res.json(segments);
  } catch (error) {
    console.error('Error in performance segments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/requests/summary', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const requests = await readJsonFile('requests.json');
    const { startDate, endDate } = getDateRange(period);

    // Filter requests by date range
    const filteredRequests = requests.filter(request => {
      const requestDate = new Date(request.date);
      return requestDate >= startDate && requestDate <= endDate;
    });

    const summary = {
      total: filteredRequests.length,
      pending: filteredRequests.filter(r => r.status === 'pending').length,
      approved: filteredRequests.filter(r => r.status === 'approved').length,
      rejected: filteredRequests.filter(r => r.status === 'rejected').length,
      byType: {
        absence: filteredRequests.filter(r => r.type === 'absence').length,
        lateArrival: filteredRequests.filter(r => r.type === 'late').length,
        earlyLeave: filteredRequests.filter(r => r.type === 'earlyLeave').length
      }
    };

    res.json(summary);
  } catch (error) {
    console.error('Error in requests summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/departments/requests', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const requests = await readJsonFile('requests.json');
    const teachers = await readJsonFile('teachers.json');
    const departments = await readJsonFile('departments.json');
    const { startDate, endDate } = getDateRange(period);

    // Filter requests by date range
    const filteredRequests = requests.filter(request => {
      const requestDate = new Date(request.date);
      return requestDate >= startDate && requestDate <= endDate;
    });

    // Group by department
    const departmentRequests = departments.map(dept => {
      const deptTeachers = teachers.filter(t => t.department === dept.name);
      const teacherIds = deptTeachers.map(t => t.id);
      const deptRequests = filteredRequests.filter(r => teacherIds.includes(r.teacherId));

      const stats = {
        department: dept.name,
        requests: {
          absence: deptRequests.filter(r => r.type === 'absence').length,
          lateArrival: deptRequests.filter(r => r.type === 'late').length,
          earlyLeave: deptRequests.filter(r => r.type === 'earlyLeave').length,
          total: deptRequests.length
        }
      };
      
      return stats;
    });

    res.json(departmentRequests);
  } catch (error) {
    console.error('Error in department requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/teachers/requests', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const requests = await readJsonFile('requests.json');
    const teachers = await readJsonFile('teachers.json');
    const { startDate, endDate } = getDateRange(period);

    // Filter requests by date range
    const filteredRequests = requests.filter(request => {
      const requestDate = new Date(request.date);
      return requestDate >= startDate && requestDate <= endDate;
    });

    // Get top 10 teachers by request count
    const teacherRequestCounts = {};
    filteredRequests.forEach(request => {
      if (!teacherRequestCounts[request.teacherId]) {
        teacherRequestCounts[request.teacherId] = {
          absence: 0,
          lateArrival: 0,
          earlyLeave: 0,
          total: 0
        };
      }
      
      teacherRequestCounts[request.teacherId].total++;
      if (request.type === 'absence') teacherRequestCounts[request.teacherId].absence++;
      else if (request.type === 'late') teacherRequestCounts[request.teacherId].lateArrival++;
      else if (request.type === 'earlyLeave') teacherRequestCounts[request.teacherId].earlyLeave++;
    });

    // Convert to array and add teacher names
    const teacherStats = Object.entries(teacherRequestCounts)
      .map(([teacherId, counts]) => {
        const teacher = teachers.find(t => t.id === teacherId);
        return {
          teacher: teacher ? teacher.name : 'Unknown',
          requests: counts
        };
      })
      .sort((a, b) => b.requests.total - a.requests.total)
      .slice(0, 10);

    res.json(teacherStats);
  } catch (error) {
    console.error('Error in teacher requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/departments/attendance', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const attendance = await readJsonFile('attendance.json');
    const teachers = await readJsonFile('teachers.json');
    const departments = await readJsonFile('departments.json');
    const { startDate, endDate } = getDateRange(period);

    // Filter attendance by date range
    const filteredAttendance = attendance.filter(record => {
      const recordDate = new Date(record.dateISO);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Group by department
    const departmentAttendance = departments.map(dept => {
      const deptTeachers = teachers.filter(t => t.department === dept.name);
      const teacherIds = deptTeachers.map(t => t.id);
      const deptAttendance = filteredAttendance.filter(a => teacherIds.includes(a.teacherId));

      return {
        department: dept.name,
        attendance: {
          present: deptAttendance.filter(a => a.attendance === 'Present').length,
          absent: deptAttendance.filter(a => a.attendance === 'Absent').length,
          late: deptAttendance.filter(a => a.attendance === 'Late').length,
          earlyLeave: deptAttendance.filter(a => a.attendance === 'Early Leave').length
        }
      };
    });

    res.json(departmentAttendance);
  } catch (error) {
    console.error('Error in department attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/teachers/attendance', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const attendance = await readJsonFile('attendance.json');
    const teachers = await readJsonFile('teachers.json');
    const { startDate, endDate } = getDateRange(period);

    // Filter attendance by date range
    const filteredAttendance = attendance.filter(record => {
      const recordDate = new Date(record.dateISO);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Get attendance for each teacher
    const teacherAttendance = teachers.map(teacher => {
      const teacherRecords = filteredAttendance.filter(a => a.teacherId === teacher.id);
      
      return {
        teacher: teacher.name,
        attendance: {
          present: teacherRecords.filter(a => a.attendance === 'Present').length,
          absent: teacherRecords.filter(a => a.attendance === 'Absent').length,
          late: teacherRecords.filter(a => a.attendance === 'Late').length,
          earlyLeave: teacherRecords.filter(a => a.attendance === 'Early Leave').length
        }
      };
    })
    .filter(t => t.attendance.present + t.attendance.absent + t.attendance.late + t.attendance.earlyLeave > 0)
    .sort((a, b) => {
      const totalA = a.attendance.present + a.attendance.absent + a.attendance.late + a.attendance.earlyLeave;
      const totalB = b.attendance.present + b.attendance.absent + b.attendance.late + b.attendance.earlyLeave;
      return totalB - totalA;
    })
    .slice(0, 10);

    res.json(teacherAttendance);
  } catch (error) {
    console.error('Error in teacher attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/time-patterns', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const requests = await readJsonFile('requests.json');
    const { startDate, endDate } = getDateRange(period);

    // Filter requests by date range
    const filteredRequests = requests.filter(request => {
      const requestDate = new Date(request.date);
      return requestDate >= startDate && requestDate <= endDate;
    });

    // Group by hour of day
    const hourCounts = {};
    filteredRequests.forEach(request => {
      const hour = new Date(request.createdAt || request.date).getHours();
      const hourLabel = `${hour}:00`;
      hourCounts[hourLabel] = (hourCounts[hourLabel] || 0) + 1;
    });

    const peakRequestTimes = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Monthly trends - only show if there's data
    const monthlyTrends = [];

  res.json({
      peakRequestTimes: peakRequestTimes,
      monthlyTrends: monthlyTrends
    });
  } catch (error) {
    console.error('Error in time patterns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/performance-metrics', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const requests = await readJsonFile('requests.json');
    const { startDate, endDate } = getDateRange(period);

    // Filter requests by date range
    const filteredRequests = requests.filter(request => {
      const requestDate = new Date(request.date);
      return requestDate >= startDate && requestDate <= endDate;
    });

    // Calculate metrics
    const approvedRequests = filteredRequests.filter(r => r.status === 'approved');
    const totalRequests = filteredRequests.length || 1;

    const approvalRates = {
      absence: 0,
      lateArrival: 0,
      earlyLeave: 0
    };

    // Calculate approval rates by type
    ['absence', 'late', 'earlyLeave'].forEach(type => {
      const typeRequests = filteredRequests.filter(r => r.type === type);
      const approvedTypeRequests = typeRequests.filter(r => r.status === 'approved');
      const rate = typeRequests.length > 0 ? (approvedTypeRequests.length / typeRequests.length) * 100 : 0;
      
      if (type === 'late') approvalRates.lateArrival = rate;
      else if (type === 'earlyLeave') approvalRates.earlyLeave = rate;
      else approvalRates[type] = rate;
    });

  res.json({
      approvalRates,
      responseTime: {
        average: 0,
        min: 0,
        max: 0
      },
      processingEfficiency: 0
    });
  } catch (error) {
    console.error('Error in performance metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;