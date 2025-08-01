const fs = require('fs');
const path = require('path');

// Helper function to properly convert minutes to decimal hours
function convertMinutesToHours(totalMinutes) {
  return totalMinutes / 60;
}

// Helper function to calculate work hours from check-in and check-out times
function calculateWorkHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  
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
  
  try {
    const checkInHours = parseTime(checkIn);
    const checkOutHours = parseTime(checkOut);
    
    // Calculate difference in decimal hours
    const workHours = checkOutHours - checkInHours;
    
    return Math.round(workHours * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating work hours:', error);
    return 0;
  }
}

// Helper function to round hours according to business rules
function roundHoursForDisplay(totalHours) {
  const hours = Math.floor(totalHours);
  const decimalPart = totalHours - hours;
  const minutes = decimalPart * 60;
  
  // If remaining minutes < 30, round down; if >= 30, round up
  if (minutes < 30) {
    return hours;
  } else {
    return hours + 1;
  }
}

async function fixTimeCalculations() {
  try {
    const attendancePath = path.join(__dirname, '../data/attendance.json');
    
    // Read existing attendance data
    const attendanceData = JSON.parse(fs.readFileSync(attendancePath, 'utf8'));
    
    console.log(`Processing ${attendanceData.length} attendance records...`);
    
    let updatedCount = 0;
    
    // Fix each record
    attendanceData.forEach((record, index) => {
      if (record.checkIn && record.checkOut) {
        const oldTotalHours = record.totalHours;
        const newTotalHours = calculateWorkHours(record.checkIn, record.checkOut);
        
        if (Math.abs(oldTotalHours - newTotalHours) > 0.01) { // If there's a significant difference
          console.log(`Record ${index + 1}: ${record.name} (${record.date})`);
          console.log(`  Check-in: ${record.checkIn}, Check-out: ${record.checkOut}`);
          console.log(`  Old hours: ${oldTotalHours}, New hours: ${newTotalHours}`);
          console.log(`  Rounded for display: ${roundHoursForDisplay(newTotalHours)}`);
          
          record.totalHours = newTotalHours;
          updatedCount++;
        }
      }
    });
    
    // Save the updated data
    fs.writeFileSync(attendancePath, JSON.stringify(attendanceData, null, 2), 'utf8');
    
    console.log(`\n✅ Fixed ${updatedCount} records out of ${attendanceData.length} total records`);
    console.log('📊 All time calculations have been corrected!');
    
    // Show some statistics
    console.log('\n📈 Sample corrected calculations:');
    const sampleRecords = attendanceData.filter(r => r.checkIn && r.checkOut).slice(0, 5);
    sampleRecords.forEach(record => {
      const roundedHours = roundHoursForDisplay(record.totalHours);
      console.log(`  ${record.name}: ${record.totalHours}h (rounded: ${roundedHours}h) on ${record.date}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing time calculations:', error);
  }
}

// Run the fix if this script is executed directly
if (require.main === module) {
  fixTimeCalculations();
}

module.exports = { fixTimeCalculations, calculateWorkHours, roundHoursForDisplay }; 