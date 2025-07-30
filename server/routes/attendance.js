const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const ATTENDANCE_FILE = path.join(__dirname, '../data/attendance.json');
const SYSTEM_SETTINGS_FILE = path.join(__dirname, '../data/system_settings.json');

// Helper function to get system settings
async function getSystemSettings() {
  try {
    const data = await fs.readFile(SYSTEM_SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return default settings if file doesn't exist
    return {
      weekendDays: ['Friday', 'Saturday'],
      holidays: []
    };
  }
}

// Helper function to check if a date is a weekend or holiday
async function isNonWorkingDay(date) {
  const settings = await getSystemSettings();
  const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  
  // Check if it's a weekend
  if (settings.weekendDays.includes(dayName)) {
    return { isNonWorking: true, reason: 'weekend' };
  }
  
  // Check if it's a holiday
  const dateStr = new Date(date).toISOString().split('T')[0];
  const isHoliday = settings.holidays.some(holiday => {
    const holidayDate = new Date(holiday.date).toISOString().split('T')[0];
    return holidayDate === dateStr;
  });
  
  if (isHoliday) {
    return { isNonWorking: true, reason: 'holiday' };
  }
  
  return { isNonWorking: false, reason: null };
}

// Get all attendance records
router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(ATTENDANCE_FILE, 'utf8');
    const attendance = JSON.parse(data);
    res.json({
      success: true,
      data: attendance,
      message: 'Attendance records retrieved successfully' 
    });
  } catch (error) {
    console.error('Error reading attendance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve attendance records' 
    });
  }
});

// Get attendance for a specific teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const data = await fs.readFile(ATTENDANCE_FILE, 'utf8');
    const allAttendance = JSON.parse(data);
    
    const teacherAttendance = allAttendance.filter(record => record.teacherId === teacherId);

    res.json({
      success: true,
      data: teacherAttendance,
      message: `Attendance records for teacher ${teacherId} retrieved successfully` 
    });
  } catch (error) {
    console.error('Error reading teacher attendance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve teacher attendance records' 
    });
  }
});

// Check in
router.post('/checkin', async (req, res) => {
  try {
    const { teacherId, location, deviceInfo } = req.body;
    
    // Check if today is a non-working day
    const today = new Date();
    const nonWorkingCheck = await isNonWorkingDay(today);
    
    if (nonWorkingCheck.isNonWorking) {
        return res.status(400).json({
          success: false,
        error: `Cannot check in on ${nonWorkingCheck.reason}`
      });
    }
    
    const data = await fs.readFile(ATTENDANCE_FILE, 'utf8');
    const attendance = JSON.parse(data);
    
    const now = new Date();
    const todayString = now.toISOString().split('T')[0];
    
    // Check if already checked in today
    const existingRecord = attendance.find(record => 
      record.teacherId === teacherId && 
      record.date === todayString &&
      record.checkIn
    );
    
    if (existingRecord && !existingRecord.checkOut) {
        return res.status(400).json({
          success: false,
        error: 'Already checked in today' 
      });
    }
    
    // Create new attendance record
    const newRecord = {
      id: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      teacherId,
      date: todayString,
      checkIn: now.toISOString(),
      checkOut: null,
      location: location || 'Unknown',
      deviceInfo: deviceInfo || {},
      status: now.getHours() < 8 || (now.getHours() === 8 && now.getMinutes() <= 30) ? 'on-time' : 'late',
      workDuration: null
    };
    
    attendance.push(newRecord);
    
    await fs.writeFile(ATTENDANCE_FILE, JSON.stringify(attendance, null, 2));

    res.json({
      success: true,
      data: newRecord,
      message: 'Check-in successful' 
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process check-in' 
    });
  }
});

// Check out
router.post('/checkout', async (req, res) => {
  try {
    const { teacherId } = req.body;
    
    const data = await fs.readFile(ATTENDANCE_FILE, 'utf8');
    const attendance = JSON.parse(data);
    
    const checkOutNow = new Date();
    const checkOutToday = checkOutNow.toISOString().split('T')[0];
    
    // Find today's check-in record
    const recordIndex = attendance.findIndex(record => 
      record.teacherId === teacherId && 
      record.date === checkOutToday &&
      record.checkIn &&
      !record.checkOut
    );
    
    if (recordIndex === -1) {
      return res.status(400).json({ 
        success: false, 
        error: 'No active check-in found for today' 
      });
    }
    
    // Update record with check-out time
    attendance[recordIndex].checkOut = checkOutNow.toISOString();
    
    // Calculate work duration
    const checkInTime = new Date(attendance[recordIndex].checkIn);
    const duration = checkOutNow - checkInTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    attendance[recordIndex].workDuration = `${hours}h ${minutes}m`;
    
    await fs.writeFile(ATTENDANCE_FILE, JSON.stringify(attendance, null, 2));
    
    res.json({
      success: true,
      data: attendance[recordIndex],
      message: 'Check-out successful' 
    });
  } catch (error) {
    console.error('Error during check-out:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process check-out' 
    });
  }
});

// Get today's attendance summary
router.get('/today', async (req, res) => {
  try {
    const data = await fs.readFile(ATTENDANCE_FILE, 'utf8');
    const attendance = JSON.parse(data);
    
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendance.filter(record => record.date === today);
    
    const summary = {
      date: today,
      totalCheckedIn: todayRecords.filter(r => r.checkIn).length,
      currentlyWorking: todayRecords.filter(r => r.checkIn && !r.checkOut).length,
      checkedOut: todayRecords.filter(r => r.checkOut).length,
      onTime: todayRecords.filter(r => r.status === 'on-time').length,
      late: todayRecords.filter(r => r.status === 'late').length
    };
    
    // Check if today is a non-working day
    const nonWorkingCheck = await isNonWorkingDay(new Date());
    if (nonWorkingCheck.isNonWorking) {
      summary.nonWorkingDay = true;
      summary.nonWorkingReason = nonWorkingCheck.reason;
    }
    
    res.json({
      success: true,
      data: summary,
      message: 'Today\'s attendance summary retrieved successfully' 
    });
  } catch (error) {
    console.error('Error getting today\'s summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve today\'s attendance summary' 
    });
  }
});

// Get attendance by date range
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required' 
      });
    }
    
    const data = await fs.readFile(ATTENDANCE_FILE, 'utf8');
    const attendance = JSON.parse(data);
    
    const filteredRecords = attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
    });
    
    res.json({
      success: true,
      data: filteredRecords,
      message: `Attendance records from ${startDate} to ${endDate} retrieved successfully` 
    });
  } catch (error) {
    console.error('Error getting attendance range:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve attendance records for the specified range' 
    });
  }
});

module.exports = router; 