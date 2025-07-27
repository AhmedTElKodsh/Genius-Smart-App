const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Helper function to get date range between two dates
function getDatesInRange(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  
  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

// Helper function to format date as "DD Month YYYY"
function formatDate(date) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

// Helper function to format date as YYYY-MM-DD for comparison
function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

// Helper function to generate random check-in time (7:00 AM to 9:00 AM)
function generateCheckInTime() {
  const hour = Math.floor(Math.random() * 3) + 7; // 7, 8, or 9
  const minute = Math.floor(Math.random() * 60);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  
  return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

// Helper function to generate check-out time based on check-in (8-9 hours later)
function generateCheckOutTime(checkInTime) {
  // Parse check-in time
  const [time, ampm] = checkInTime.split(' ');
  const [hour, minute] = time.split(':').map(Number);
  
  // Convert to 24-hour format
  let checkInHour = hour;
  if (ampm === 'PM' && hour !== 12) checkInHour += 12;
  if (ampm === 'AM' && hour === 12) checkInHour = 0;
  
  // Add 8-9 hours for checkout
  const hoursToAdd = Math.floor(Math.random() * 2) + 8; // 8 or 9 hours
  let checkOutHour = checkInHour + hoursToAdd;
  let checkOutMinute = minute + Math.floor(Math.random() * 30) - 15; // ±15 minutes variation
  
  // Handle minute overflow
  if (checkOutMinute >= 60) {
    checkOutMinute -= 60;
    checkOutHour += 1;
  } else if (checkOutMinute < 0) {
    checkOutMinute += 60;
    checkOutHour -= 1;
  }
  
  // Convert back to 12-hour format
  const checkOutAmPm = checkOutHour >= 12 ? 'PM' : 'AM';
  const displayCheckOutHour = checkOutHour > 12 ? checkOutHour - 12 : (checkOutHour === 0 ? 12 : checkOutHour);
  
  return `${displayCheckOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')} ${checkOutAmPm}`;
}

// Helper function to properly convert minutes to decimal hours
function convertMinutesToHours(totalMinutes) {
  return totalMinutes / 60;
}

// Helper function to calculate work hours from check-in and check-out times
function calculateWorkHours(checkIn, checkOut) {
  // Parse times
  const parseTime = (timeStr) => {
    const [time, ampm] = timeStr.split(' ');
    const [hour, minute] = time.split(':').map(Number);
    let hour24 = hour;
    if (ampm === 'PM' && hour !== 12) hour24 += 12;
    if (ampm === 'AM' && hour === 12) hour24 = 0;
    
    // Convert to total minutes first, then to decimal hours
    const totalMinutes = (hour24 * 60) + minute;
    return convertMinutesToHours(totalMinutes);
  };
  
  const checkInHours = parseTime(checkIn);
  const checkOutHours = parseTime(checkOut);
  
  // Calculate difference in decimal hours
  const workHours = checkOutHours - checkInHours;
  
  return Math.round(workHours * 100) / 100; // Round to 2 decimal places
}

// Helper function to check if a date falls within a date range
function isDateInRange(targetDate, startDate, endDate) {
  const target = new Date(targetDate);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return target >= start && target <= end;
}

async function generateAttendanceData() {
  try {
    // Read existing data
    const teachersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/teachers.json'), 'utf8'));
    const requestsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/requests.json'), 'utf8'));
    
    console.log(`Processing ${teachersData.length} teachers...`);
    
    // Generate attendance data for the last 3 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    
    const allDates = getDatesInRange(startDate, endDate);
    console.log(`Generating attendance for ${allDates.length} days (${formatDate(startDate)} to ${formatDate(endDate)})`);
    
    const attendanceRecords = [];
    
    // Process each teacher
    for (const teacher of teachersData) {
      console.log(`Processing teacher: ${teacher.name}`);
      
      // Get approved requests for this teacher
      const teacherRequests = requestsData.filter(req => 
        req.teacherId === teacher.id && req.status === 'APPROVED'
      );
      
      // Process each date
      for (const date of allDates) {
        const dateISO = formatDateISO(date);
        const dateFormatted = formatDate(date);
        
        // Check if this date falls within any approved leaves or absences
        const permittedLeave = teacherRequests.find(req => 
          req.type === 'PERMITTED_LEAVES' && 
          isDateInRange(dateISO, req.startDate, req.endDate)
        );
        
        const authorizedAbsence = teacherRequests.find(req => 
          req.type === 'AUTHORIZED_ABSENCE' && 
          isDateInRange(dateISO, req.startDate, req.endDate)
        );
        
        // Determine attendance status
        let attendance = 'Active';
        let checkIn = '';
        let checkOut = '';
        let totalHours = 0;
        
        // Skip weekends (Saturday = 6, Sunday = 0 in Egypt context, but let's assume Saturday and Sunday are weekends)
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday and Saturday in Egypt
        
        if (isWeekend) {
          attendance = 'Weekend';
          checkIn = '';
          checkOut = '';
          totalHours = 0;
        } else if (permittedLeave || authorizedAbsence) {
          attendance = 'Permitted Leave';
          checkIn = '';
          checkOut = '';
          totalHours = 0;
        } else {
          // Random chance of absence (5% for active teachers)
          const randomAbsence = Math.random() < 0.05;
          
          if (randomAbsence) {
            attendance = 'Absent';
            checkIn = '';
            checkOut = '';
            totalHours = 0;
          } else {
            attendance = 'Active';
            checkIn = generateCheckInTime();
            checkOut = generateCheckOutTime(checkIn);
            totalHours = calculateWorkHours(checkIn, checkOut);
          }
        }
        
        // Create attendance record
        const attendanceRecord = {
          id: uuidv4(),
          teacherId: teacher.id,
          name: teacher.name,
          date: dateFormatted,
          dateISO: dateISO,
          attendance: attendance,
          checkIn: checkIn,
          checkOut: checkOut,
          permittedLeaves: permittedLeave ? `${formatDate(new Date(permittedLeave.startDate))} - ${formatDate(new Date(permittedLeave.endDate))}` : '',
          authorizedAbsence: authorizedAbsence ? `${formatDate(new Date(authorizedAbsence.startDate))} - ${formatDate(new Date(authorizedAbsence.endDate))}` : '',
          totalHours: totalHours,
          subject: teacher.subject,
          workType: teacher.workType,
          createdAt: new Date().toISOString()
        };
        
        attendanceRecords.push(attendanceRecord);
      }
    }
    
    console.log(`Generated ${attendanceRecords.length} attendance records`);
    
    // Save to file
    const outputPath = path.join(__dirname, '../data/attendance.json');
    fs.writeFileSync(outputPath, JSON.stringify(attendanceRecords, null, 2), 'utf8');
    
    console.log(`Attendance data saved to: ${outputPath}`);
    
    // Generate summary statistics
    const stats = {
      totalRecords: attendanceRecords.length,
      totalTeachers: teachersData.length,
      dateRange: {
        start: formatDate(startDate),
        end: formatDate(endDate),
        totalDays: allDates.length
      },
      attendanceBreakdown: {
        active: attendanceRecords.filter(r => r.attendance === 'Active').length,
        absent: attendanceRecords.filter(r => r.attendance === 'Absent').length,
        permittedLeave: attendanceRecords.filter(r => r.attendance === 'Permitted Leave').length,
        weekend: attendanceRecords.filter(r => r.attendance === 'Weekend').length
      }
    };
    
    console.log('\n=== ATTENDANCE DATA GENERATION SUMMARY ===');
    console.log(`Total Records: ${stats.totalRecords}`);
    console.log(`Total Teachers: ${stats.totalTeachers}`);
    console.log(`Date Range: ${stats.dateRange.start} to ${stats.dateRange.end}`);
    console.log(`Total Days: ${stats.dateRange.totalDays}`);
    console.log('\nAttendance Breakdown:');
    console.log(`  Active: ${stats.attendanceBreakdown.active}`);
    console.log(`  Absent: ${stats.attendanceBreakdown.absent}`);
    console.log(`  Permitted Leave: ${stats.attendanceBreakdown.permittedLeave}`);
    console.log(`  Weekend: ${stats.attendanceBreakdown.weekend}`);
    console.log('==========================================\n');
    
    return attendanceRecords;
    
  } catch (error) {
    console.error('Error generating attendance data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateAttendanceData()
    .then(() => {
      console.log('Attendance data generation completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to generate attendance data:', error);
      process.exit(1);
    });
}

module.exports = { generateAttendanceData }; 