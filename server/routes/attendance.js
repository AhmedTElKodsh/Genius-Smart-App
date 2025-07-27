const express = require('express');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const router = express.Router();

// Helper function to load attendance data
const loadAttendanceData = async () => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/attendance.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading attendance data:', error);
    return [];
  }
};

// Helper function to save attendance data
const saveAttendanceData = async (data) => {
  try {
    await fs.writeFile(
      path.join(__dirname, '../data/attendance.json'),
      JSON.stringify(data, null, 2)
    );
    return true;
  } catch (error) {
    console.error('Error saving attendance data:', error);
    return false;
  }
};

// Helper function to parse time string to Date
const parseTime = (timeStr) => {
  try {
    if (!timeStr || typeof timeStr !== 'string') {
      console.warn('Invalid time string:', timeStr);
      return new Date();
    }
    
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    const date = new Date();
    date.setHours(hour24, minutes, 0, 0);
    return date;
  } catch (error) {
    console.error('Error parsing time string:', timeStr, error);
    return new Date();
  }
};

// Helper function to properly convert minutes to hours with correct decimal representation
const convertMinutesToHours = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  return hours + (remainingMinutes / 60);
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

// Helper function to calculate precise time difference in hours
const calculateHoursDifference = (startTime, endTime) => {
  try {
    const startDate = parseTime(startTime);
    const endDate = parseTime(endTime);
    
    // Calculate difference in milliseconds
    const diffMs = endDate.getTime() - startDate.getTime();
    
    // Convert to total minutes first
    const totalMinutes = diffMs / (1000 * 60);
    
    // Convert minutes to proper decimal hours
    const diffHours = convertMinutesToHours(totalMinutes);
    
    // Round to 2 decimal places for precision
    return Math.round(diffHours * 100) / 100;
  } catch (error) {
    console.error('Error calculating hours difference:', error);
    return 0;
  }
};

// Helper function to calculate overtime hours
const calculateOvertimeHours = (totalHours) => {
  const standardWorkDay = 8; // 8 hours per standard work day
  return totalHours > standardWorkDay ? totalHours - standardWorkDay : 0;
};

// Helper function to calculate attendance metrics
const calculateAttendanceMetrics = (attendanceRecords, dateRange = null) => {
  let filteredRecords = attendanceRecords;
  
  // Apply date range filter if provided
  if (dateRange) {
    const { startDate, endDate } = dateRange;
    filteredRecords = attendanceRecords.filter(record => {
      const recordDate = record.dateISO ? new Date(record.dateISO) : new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  const metrics = {
    allowedAbsence: 0,
    unallowedAbsence: 0,
    authorizedAbsence: 0,
    unauthorizedAbsence: 0,
    overtime: 0,
    lateArrival: 0,
    totalDays: filteredRecords.length
  };

  filteredRecords.forEach(record => {
    // Determine record type from raw data (same logic as /history/ endpoint)
    const checkInTime = record.checkIn || record.checkInTime;
    const checkOutTime = record.checkOut || record.checkOutTime;
    const hasPermittedLeaves = record.permittedLeaves && record.permittedLeaves.trim() !== '';
    const hasAuthorizedAbsence = record.authorizedAbsence && record.authorizedAbsence.trim() !== '';
    const isEarlyCheckout = checkOutTime && record.totalHours && parseFloat(record.totalHours) < 8;
    const isAbsent = !checkInTime || record.attendance === 'Absent';
    
    // Count based on type (same logic as /history/ endpoint)
    if (hasPermittedLeaves) {
      metrics.allowedAbsence++;
    } else if (hasAuthorizedAbsence) {
      metrics.authorizedAbsence++;
    } else if (isAbsent && !hasPermittedLeaves && !hasAuthorizedAbsence) {
      metrics.unauthorizedAbsence++;
    } else if (isEarlyCheckout && !hasPermittedLeaves) {
      metrics.unallowedAbsence++;
    }

    // Check for Late Arrival (after 8:00 AM) for present days
    if (checkInTime && !isAbsent) {
      try {
        let timeStr = checkInTime;
        if (timeStr.includes('AM') || timeStr.includes('PM')) {
          const [time, period] = timeStr.split(' ');
          const [hours, minutes] = time.split(':');
          let hour24 = parseInt(hours);
          if (period === 'PM' && hour24 !== 12) hour24 += 12;
          if (period === 'AM' && hour24 === 12) hour24 = 0;
          timeStr = `${hour24.toString().padStart(2, '0')}:${minutes}`;
        }
        
        const checkInTime24 = new Date(`1970-01-01T${timeStr}:00`);
        const eightAM = new Date('1970-01-01T08:00:00');
        if (checkInTime24 > eightAM) {
          metrics.lateArrival++;
        }
      } catch (error) {
        console.error('Error parsing check-in time:', checkInTime);
      }
    }

    // Check for Overtime (more than 8 hours)
    if (record.totalHours && parseFloat(record.totalHours) > 8) {
      metrics.overtime++;
    }
  });

  return metrics;
};

// Helper function to get date range based on period
const getDateRange = (period, customStart = null, customEnd = null) => {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'This week':
      // Week starts on Sunday
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      startDate = startOfWeek;
      endDate = endOfWeek;
      break;

    case 'This month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'Last week':
      const lastWeekEnd = new Date(now);
      lastWeekEnd.setDate(now.getDate() - now.getDay() - 1);
      lastWeekEnd.setHours(23, 59, 59, 999);
      
      const lastWeekStart = new Date(lastWeekEnd);
      lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
      lastWeekStart.setHours(0, 0, 0, 0);
      
      startDate = lastWeekStart;
      endDate = lastWeekEnd;
      break;

    case 'Last month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'Custom':
      if (customStart && customEnd) {
        startDate = new Date(customStart);
        endDate = new Date(customEnd);
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Default to last month if custom dates not provided
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
      }
      break;

    default:
      // Default to last month
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
};

// Get attendance summary for a teacher
router.get('/summary/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { period = 'Last month', startDate = null, endDate = null } = req.query;

    const attendanceData = await loadAttendanceData();
    const teacherRecords = attendanceData.filter(record => record.teacherId === teacherId);

    if (teacherRecords.length === 0) {
      return res.json({
        success: true,
        data: {
          allowedAbsence: 0,
          unallowedAbsence: 0,
          authorizedAbsence: 0,
          unauthorizedAbsence: 0,
          overtime: 0,
          lateArrival: 0,
          totalDays: 0,
          period: period
        }
      });
    }

    // Get date range based on period or custom dates
    let dateRange;
    if (startDate && endDate) {
      // Use custom date range if provided
      dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate + 'T23:59:59.999Z')
      };
    } else {
      // Use period-based date range
      dateRange = getDateRange(period, startDate, endDate);
    }
    
    // Calculate metrics
    const metrics = calculateAttendanceMetrics(teacherRecords, dateRange);

    res.json({
      success: true,
      data: {
        ...metrics,
        period: period,
        dateRange: {
          start: dateRange.startDate.toISOString().split('T')[0],
          end: dateRange.endDate.toISOString().split('T')[0]
        }
      }
    });

  } catch (error) {
    console.error('Error getting attendance summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance summary'
    });
  }
});

// Get all attendance records for a teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { startDate = null, endDate = null } = req.query;

    const attendanceData = await loadAttendanceData();
    let teacherRecords = attendanceData.filter(record => record.teacherId === teacherId);

    // Apply date filter if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      teacherRecords = teacherRecords.filter(record => {
    const recordDate = new Date(record.dateISO);
        return recordDate >= start && recordDate <= end;
      });
    }

    // Sort by date (most recent first)
    teacherRecords.sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));

    // Format the records with the same logic as history endpoint
    const formattedRecords = teacherRecords.map(record => {
      // Map database fields to expected format
      const checkInTime = record.checkIn || record.checkInTime;
      const checkOutTime = record.checkOut || record.checkOutTime;
      const recordDate = record.dateISO || record.date;
      
      // Calculate late minutes if check-in is after 8:00 AM
      let lateMinutes = 0;
      if (checkInTime) {
        try {
          // Handle time formats like "09:59 AM" or "09:59"
          let timeStr = checkInTime;
          if (timeStr.includes('AM') || timeStr.includes('PM')) {
            const [time, period] = timeStr.split(' ');
            const [hours, minutes] = time.split(':');
            let hour24 = parseInt(hours);
            if (period === 'PM' && hour24 !== 12) hour24 += 12;
            if (period === 'AM' && hour24 === 12) hour24 = 0;
            timeStr = `${hour24.toString().padStart(2, '0')}:${minutes}`;
          }
          
          const checkInTime24 = new Date(`1970-01-01T${timeStr}:00`);
          const eightAM = new Date('1970-01-01T08:00:00');
          if (checkInTime24 > eightAM) {
            lateMinutes = Math.floor((checkInTime24 - eightAM) / (1000 * 60));
          }
        } catch (error) {
          console.error('Error parsing check-in time:', checkInTime);
        }
      }

      // Calculate overtime hours if worked more than 8 hours
      const overtimeHours = calculateOvertimeHours(parseFloat(record.totalHours) || 0);
      const overtimeMinutes = Math.floor(overtimeHours * 60);

      // Determine leave types based on database fields
      const hasPermittedLeaves = record.permittedLeaves && record.permittedLeaves.trim() !== '';
      const hasAuthorizedAbsence = record.authorizedAbsence && record.authorizedAbsence.trim() !== '';
      const isEarlyCheckout = checkOutTime && record.totalHours && parseFloat(record.totalHours) < 8;
      const isAbsent = !checkInTime || record.attendance === 'Absent';
      
      let recordType = 'present';
      if (hasPermittedLeaves) {
        recordType = 'permitted_leave';
      } else if (hasAuthorizedAbsence) {
        recordType = 'authorized_absence';
      } else if (isAbsent && !hasPermittedLeaves && !hasAuthorizedAbsence) {
        recordType = 'unauthorized_absence';
      } else if (isEarlyCheckout && !hasPermittedLeaves) {
        recordType = 'unpermitted_leave';
      }

      return {
        id: record.id,
        date: recordDate,
        checkInTime: checkInTime,
        checkOutTime: checkOutTime,
        totalHours: record.totalHours,
        isLate: lateMinutes > 0,
        lateMinutes,
        overtimeMinutes,
        overtime: overtimeHours,
        status: record.attendance || 'present',
        type: recordType,
        hasPermission: hasPermittedLeaves || hasAuthorizedAbsence,
        reason: record.permittedLeaves || record.authorizedAbsence || '',
        permittedLeaves: record.permittedLeaves || '',
        authorizedAbsence: record.authorizedAbsence || ''
      };
    });

    res.json({
      success: true,
      data: formattedRecords
    });

  } catch (error) {
    console.error('Error getting teacher attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get teacher attendance'
    });
  }
});

// Check in/out endpoint (for the timer functionality)
router.post('/checkin/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { action } = req.body; // 'checkin' or 'checkout'
    
    const attendanceData = await loadAttendanceData();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Find today's record for this teacher
    let todayRecord = attendanceData.find(record => 
      record.teacherId === teacherId && record.dateISO === today
    );

    if (action === 'checkin') {
      // Check if already checked in (current session active)
      if (todayRecord && todayRecord.checkIn && !todayRecord.currentSessionCheckOut) {
        return res.status(400).json({
          success: false,
          message: 'Already checked in for current session. Please check out first.'
        });
      }

      const checkInTime = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });

      if (todayRecord) {
        // Update existing record for new session
        todayRecord.checkIn = checkInTime;
        todayRecord.currentSessionCheckOut = null; // Reset for new session
        todayRecord.attendance = 'Active';
        // Initialize sessions array if it doesn't exist
        if (!todayRecord.sessions) {
          todayRecord.sessions = [];
        }
      } else {
        // Create new record
        const newRecord = {
          id: `attendance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          teacherId: teacherId,
          name: req.body.teacherName || 'Unknown Teacher',
          date: now.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          }),
          dateISO: today,
          attendance: 'Active',
          checkIn: checkInTime,
          checkOut: '',
          currentSessionCheckOut: null,
          permittedLeaves: '',
          authorizedAbsence: '',
          totalHours: 0,
          sessions: [], // Track multiple sessions
          subject: req.body.subject || '',
          workType: req.body.workType || 'Full-time',
          createdAt: now.toISOString()
        };
        attendanceData.push(newRecord);
        todayRecord = newRecord;
      }

    } else if (action === 'checkout') {
      if (!todayRecord || !todayRecord.checkIn || todayRecord.currentSessionCheckOut) {
        return res.status(400).json({
          success: false,
          message: 'Must check in first or already checked out of current session'
        });
      }

      const checkOutTime = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });

      // Calculate hours for this session using improved function
      const sessionHours = calculateHoursDifference(todayRecord.checkIn, checkOutTime);

      // Add this session to the sessions array
      if (!todayRecord.sessions) {
        todayRecord.sessions = [];
      }
      
      todayRecord.sessions.push({
        checkIn: todayRecord.checkIn,
        checkOut: checkOutTime,
        hours: sessionHours
      });

      // Update record
      todayRecord.currentSessionCheckOut = checkOutTime;
      todayRecord.checkOut = checkOutTime; // Keep the last checkout time
      
      // Calculate total accumulated hours from all sessions
      const totalAccumulatedHours = todayRecord.sessions.reduce((total, session) => total + session.hours, 0);
      todayRecord.totalHours = Math.round(totalAccumulatedHours * 100) / 100;
      
      todayRecord.attendance = 'Completed';
    }

    // Save updated data
    await saveAttendanceData(attendanceData);

    res.json({
      success: true,
      message: `Successfully ${action === 'checkin' ? 'checked in' : 'checked out'}`,
      data: {
        ...todayRecord,
        currentSessionHours: action === 'checkout' ? 
          todayRecord.sessions[todayRecord.sessions.length - 1]?.hours : 0,
        totalAccumulatedHours: todayRecord.totalHours
      }
    });

  } catch (error) {
    console.error('Error with check in/out:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process check in/out'
    });
  }
});

// Get all attendance records (existing endpoint)
router.get('/', async (req, res) => {
  try {
    const attendanceData = await loadAttendanceData();
    
    const {
      page = 1,
      limit = 10,
      sortBy = 'dateISO',
      sortOrder = 'desc',
      teacherId,
      subject,
      workType,
      attendance,
      startDate,
      endDate
    } = req.query;
    
    let filteredData = attendanceData;

    // Apply filters
    if (teacherId) {
      filteredData = filteredData.filter(record => record.teacherId === teacherId);
    }
    
    if (subject) {
      filteredData = filteredData.filter(record => 
        record.subject && record.subject.toLowerCase().includes(subject.toLowerCase())
      );
    }
    
    if (workType) {
      filteredData = filteredData.filter(record => record.workType === workType);
    }
    
    if (attendance) {
      filteredData = filteredData.filter(record => record.attendance === attendance);
    }
    
    // Filter by date range
    if (startDate || endDate) {
      filteredData = filteredData.filter(record => {
        const recordDate = new Date(record.dateISO);
        if (startDate && recordDate < new Date(startDate)) return false;
        if (endDate && recordDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    // Sort data
    filteredData.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
        
      if (sortBy === 'dateISO') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
        }
        
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
      });
    
    // Pagination
    const totalRecords = filteredData.length;
    const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedData,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecords / limitNum),
        totalRecords: totalRecords,
        recordsPerPage: limitNum,
        hasNext: endIndex < totalRecords,
        hasPrev: pageNum > 1
      },
      filters: {
        teacherId,
        subject,
        workType,
        attendance,
        startDate,
        endDate,
        sortBy,
        sortOrder
      }
    });
    
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance data',
      error: error.message
    });
  }
});

// Get attendance statistics
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate, teacherId, subject } = req.query;
    
    const attendanceData = await loadAttendanceData();
    let filteredData = attendanceData;
    
    // Apply filters
    if (teacherId) {
      filteredData = filteredData.filter(record => record.teacherId === teacherId);
    }
    
    if (subject) {
      filteredData = filteredData.filter(record => 
        record.subject && record.subject.toLowerCase().includes(subject.toLowerCase())
      );
    }
    
    // Filter by date range
    if (startDate || endDate) {
      filteredData = filteredData.filter(record => {
        const recordDate = new Date(record.dateISO);
        if (startDate && recordDate < new Date(startDate)) return false;
        if (endDate && recordDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    // Calculate statistics
    const stats = {
      totalRecords: filteredData.length,
      attendanceBreakdown: {
        'Active': filteredData.filter(r => r.attendance === 'Active').length,
        'Absent': filteredData.filter(r => r.attendance === 'Absent').length,
        'Permitted Leave': filteredData.filter(r => r.attendance === 'Permitted Leave').length,
        'Weekend': filteredData.filter(r => r.attendance === 'Weekend').length
      },
      subjectBreakdown: {},
      workTypeBreakdown: {},
      averageWorkHours: 0,
      totalWorkHours: 0
    };
    
    // Calculate subject breakdown
    filteredData.forEach(record => {
      if (record.subject) {
        stats.subjectBreakdown[record.subject] = (stats.subjectBreakdown[record.subject] || 0) + 1;
      }
    });
    
    // Calculate work type breakdown
    filteredData.forEach(record => {
      if (record.workType) {
        stats.workTypeBreakdown[record.workType] = (stats.workTypeBreakdown[record.workType] || 0) + 1;
      }
    });
    
    // Calculate total and average work hours
    const workHours = filteredData
      .filter(record => record.totalHours && record.attendance === 'Active')
      .map(record => record.totalHours);
    
    if (workHours.length > 0) {
      stats.totalWorkHours = workHours.reduce((sum, hours) => sum + hours, 0);
      stats.averageWorkHours = stats.totalWorkHours / workHours.length;
    }
    
    // Round values
    stats.averageWorkHours = Math.round(stats.averageWorkHours * 100) / 100;
    stats.totalWorkHours = Math.round(stats.totalWorkHours * 100) / 100;
    
    res.json({
      success: true,
      data: stats,
      filters: {
        startDate,
        endDate,
        teacherId,
        subject
      }
    });
    
  } catch (error) {
    console.error('Error generating attendance statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate attendance statistics',
      error: error.message
    });
  }
});

// Get attendance history for a teacher by month/year
router.get('/history/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month are required'
      });
    }

    const attendanceData = await loadAttendanceData();
    
    // Filter records for the specific teacher, year, and month
    const teacherRecords = attendanceData.filter(record => {
      if (record.teacherId !== teacherId) return false;
      
      // Handle both dateISO and date formats
      const recordDate = record.dateISO ? new Date(record.dateISO) : new Date(record.date);
      return recordDate.getFullYear() === parseInt(year) && 
             recordDate.getMonth() === parseInt(month) - 1;
    });

    // Sort by date (newest first for displaying latest records)
    const sortedRecords = teacherRecords.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Format the records for frontend consumption
    const formattedRecords = sortedRecords.map(record => {
      // Map database fields to expected format
      const checkInTime = record.checkIn || record.checkInTime;
      const checkOutTime = record.checkOut || record.checkOutTime;
      const recordDate = record.dateISO || record.date;
      
      // Calculate late minutes if check-in is after 8:00 AM
      let lateMinutes = 0;
      if (checkInTime) {
        try {
          // Handle time formats like "09:59 AM" or "09:59"
          let timeStr = checkInTime;
          if (timeStr.includes('AM') || timeStr.includes('PM')) {
            const [time, period] = timeStr.split(' ');
            const [hours, minutes] = time.split(':');
            let hour24 = parseInt(hours);
            if (period === 'PM' && hour24 !== 12) hour24 += 12;
            if (period === 'AM' && hour24 === 12) hour24 = 0;
            timeStr = `${hour24.toString().padStart(2, '0')}:${minutes}`;
          }
          
          const checkInTime24 = new Date(`1970-01-01T${timeStr}:00`);
          const eightAM = new Date('1970-01-01T08:00:00');
          if (checkInTime24 > eightAM) {
            lateMinutes = Math.floor((checkInTime24 - eightAM) / (1000 * 60));
          }
        } catch (error) {
          console.error('Error parsing check-in time:', checkInTime);
        }
      }

      // Calculate overtime hours if worked more than 8 hours
      const overtimeHours = calculateOvertimeHours(parseFloat(record.totalHours) || 0);
      const overtimeMinutes = Math.floor(overtimeHours * 60);

      // Determine leave types based on database fields
      const hasPermittedLeaves = record.permittedLeaves && record.permittedLeaves.trim() !== '';
      const hasAuthorizedAbsence = record.authorizedAbsence && record.authorizedAbsence.trim() !== '';
      const isEarlyCheckout = checkOutTime && record.totalHours && parseFloat(record.totalHours) < 8;
      const isAbsent = !checkInTime || record.attendance === 'Absent';
      
      let recordType = 'present';
      if (hasPermittedLeaves) {
        recordType = 'permitted_leave';
      } else if (hasAuthorizedAbsence) {
        recordType = 'authorized_absence';
      } else if (isAbsent && !hasPermittedLeaves && !hasAuthorizedAbsence) {
        recordType = 'unauthorized_absence';
      } else if (isEarlyCheckout && !hasPermittedLeaves) {
        recordType = 'unpermitted_leave';
      }

      return {
        id: record.id,
        date: recordDate,
        checkInTime: checkInTime,
        checkOutTime: checkOutTime,
        totalHours: record.totalHours,
        isLate: lateMinutes > 0,
        lateMinutes,
        overtimeMinutes,
        overtime: overtimeHours,
        status: record.attendance || 'present',
        type: recordType,
        hasPermission: hasPermittedLeaves || hasAuthorizedAbsence,
        reason: record.permittedLeaves || record.authorizedAbsence || '',
        permittedLeaves: record.permittedLeaves || '',
        authorizedAbsence: record.authorizedAbsence || ''
      };
    });
    
    res.json({
      success: true,
      data: formattedRecords,
      month: parseInt(month),
      year: parseInt(year),
      totalRecords: formattedRecords.length
    });
    
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance history',
      error: error.message
    });
  }
});

// GET /api/attendance/notifications/:teacherId - Get attendance-based notifications for a teacher
router.get('/notifications/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { lang } = req.query;
    const isArabic = lang === 'ar';
    const attendanceData = await loadAttendanceData();
    
    // Get teacher information to check join date
    const teachersData = JSON.parse(fsSync.readFileSync(path.join(__dirname, '../data/teachers.json'), 'utf8'));
    const teacher = teachersData.find(t => t.id === teacherId);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    // Check if teacher is new (joined within last 7 days)
    const teacherJoinDate = new Date(teacher.joinDate || teacher.createdAt);
    const now = new Date();
    const daysSinceJoined = Math.floor((now - teacherJoinDate) / (1000 * 60 * 60 * 24));
    const isNewTeacher = daysSinceJoined < 7;
    
    // Filter records for this teacher
    const teacherRecords = attendanceData.filter(record => 
      record.teacherId === teacherId || record.teacherId === teacherId.toString()
    );

    const notifications = [];
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // For new teachers (joined within 7 days), return no notifications
    if (isNewTeacher) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Process records from last 30 days
    const recentRecords = teacherRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= thirtyDaysAgo;
    });

    // Group records by consecutive patterns
    const patterns = {
      lateArrival: [],
      earlyLeave: [],
      unauthorizedAbsence: []
    };

    recentRecords.forEach(record => {
      const recordDate = new Date(record.date);
      
      // Check for late arrivals (after 8:00 AM)
      if (record.checkInTime) {
        const checkInTime = new Date(`1970-01-01T${record.checkInTime}`);
        const eightAM = new Date('1970-01-01T08:00:00');
        if (checkInTime > eightAM) {
          patterns.lateArrival.push({
            date: record.date,
            checkInTime: record.checkInTime
          });
        }
      }

      // Check for early leaves (before 4:00 PM without permission)
      if (record.checkOutTime && !record.hasPermission) {
        const checkOutTime = new Date(`1970-01-01T${record.checkOutTime}`);
        const fourPM = new Date('1970-01-01T16:00:00');
        if (checkOutTime < fourPM) {
          patterns.earlyLeave.push({
            date: record.date,
            checkOutTime: record.checkOutTime
          });
        }
      }

      // Check for unauthorized absence
      if (!record.checkInTime && !record.hasPermission) {
        patterns.unauthorizedAbsence.push({
          date: record.date
        });
      }
    });

    // Generate notifications for patterns
          if (patterns.lateArrival.length >= 3) {
        const latestDates = patterns.lateArrival.slice(-3);
      const message = isArabic 
        ? `لقد تأخرت لأكثر من 3 أيام`
        : `You have been arriving late for more than 3 days`;
      
      notifications.push({
        id: `late-${Date.now()}`,
        type: 'warning',
        message,
        date: latestDates[latestDates.length - 1].date,
        category: 'attendance',
        isRead: false
      });
    }

    if (patterns.earlyLeave.length >= 3) {
      const latestDates = patterns.earlyLeave.slice(-3);
      const message = isArabic
        ? `لقد غادرت مبكراً لأكثر من 3 أيام`
        : `You have been leaving early for more than 3 days`;
        
      notifications.push({
        id: `early-${Date.now()}`,
        type: 'warning', 
        message,
        date: latestDates[latestDates.length - 1].date,
        category: 'attendance',
        isRead: false
      });
    }

    if (patterns.unauthorizedAbsence.length >= 1) {
      const latestDate = patterns.unauthorizedAbsence[patterns.unauthorizedAbsence.length - 1];
      const daysCount = patterns.unauthorizedAbsence.length;
      const message = isArabic
        ? (daysCount === 1 
            ? `لديك غياب غير مصرح به`
            : `لديك ${daysCount} أيام غياب غير مصرح بها`)
        : (daysCount === 1 
            ? `You had an unauthorized absence` 
            : `You have ${daysCount} unauthorized absences`);
            
      notifications.push({
        id: `absence-${Date.now()}`,
        type: 'error',
        message,
        date: latestDate.date,
        category: 'attendance',
        isRead: false
      });
    }

    // Weekly and monthly performance reminders
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Add weekly summary notification - only if teacher has actual attendance activity
    const weeklyRecords = recentRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= weekAgo && (record.checkInTime || record.checkOutTime || record.hasPermission);
    });

    // Only add weekly summary if there are meaningful weekly records
    if (weeklyRecords.length > 0) {
      const weeklyMessage = isArabic
        ? 'يرجى مراجعة ملخصك الأسبوعي لمراجعة أدائك'
        : 'Please review your weekly summary to see your Performance';
        
      notifications.push({
        id: `weekly-${Date.now()}`,
        type: 'info',
        message: weeklyMessage,
        date: weekAgo.toISOString(),
        category: 'performance',
        isRead: false
      });
    }

    // Add monthly summary notification - only if teacher has actual attendance activity
    const meaningfulRecords = recentRecords.filter(record => 
      record.checkInTime || record.checkOutTime || record.hasPermission
    );
    
    // Only add monthly summary if there are meaningful monthly records
    if (meaningfulRecords.length > 0) {
      const monthlyMessage = isArabic
        ? 'يرجى مراجعة ملخصك الشهري لمراجعة أدائك'
        : 'Please review your monthly summary to see your Performance';
        
      notifications.push({
        id: `monthly-${Date.now()}`,
        type: 'info',
        message: monthlyMessage,
        date: monthAgo.toISOString(),
        category: 'performance',
        isRead: false
      });
    }
    
    res.json({
      success: true,
      data: notifications
    });
    
  } catch (error) {
    console.error('Error fetching attendance notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance notifications',
      error: error.message
    });
  }
});

module.exports = router; 