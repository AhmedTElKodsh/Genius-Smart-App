const fs = require('fs');
const path = require('path');

// Define the launch date
const LAUNCH_DATE = '2025-08-04'; // Sunday, August 4th, 2025

// Function to reset teacher attendance data
function resetTeacherData() {
  const teachersPath = path.join(__dirname, '../data/teachers.json');
  
  try {
    // Read current teachers data
    const teachersData = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
    
    // Reset attendance-related fields for all teachers
    const resetTeachers = teachersData.map(teacher => ({
      ...teacher,
      totalAbsenceDays: 0,
      remainingLateEarlyHours: teacher.totalLateEarlyHours || 8,
      // Keep all other fields unchanged
    }));
    
    // Write back the reset data
    fs.writeFileSync(teachersPath, JSON.stringify(resetTeachers, null, 2));
    console.log('✅ Teacher attendance data reset successfully');
    console.log(`   - Reset totalAbsenceDays to 0 for ${resetTeachers.length} teachers`);
    console.log(`   - Reset remainingLateEarlyHours to full allowance`);
  } catch (error) {
    console.error('❌ Error resetting teacher data:', error);
  }
}

// Function to clear data files
function clearDataFiles() {
  const dataDir = path.join(__dirname, '../data');
  const filesToClear = [
    'attendance.json',
    'requests.json',
    'all_requests.json',
    'manager_requests.json',
    'test-attendance.json',
    'data_tracking.json',
    'action_audit.json'
  ];
  
  filesToClear.forEach(file => {
    const filePath = path.join(dataDir, file);
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]');
        console.log(`✅ Cleared ${file}`);
      }
    } catch (error) {
      console.error(`❌ Error clearing ${file}:`, error.message);
    }
  });
}

// Function to update system settings
function updateSystemSettings() {
  const settingsPath = path.join(__dirname, '../data/system_settings.json');
  
  try {
    let settings = {};
    
    // Read existing settings if file exists
    if (fs.existsSync(settingsPath)) {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }
    
    // Update with launch date and weekend settings
    settings = {
      ...settings,
      launchDate: LAUNCH_DATE,
      weekendDays: ['Friday', 'Saturday'],
      attendanceStartDate: LAUNCH_DATE,
      systemInitialized: true,
      developmentMode: false,
      lastReset: new Date().toISOString()
    };
    
    // Write updated settings
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    console.log('✅ System settings updated with launch date:', LAUNCH_DATE);
  } catch (error) {
    console.error('❌ Error updating system settings:', error);
  }
}

// Main function
function prepareForLaunch() {
  console.log('🚀 Preparing Genius Smart App for Launch...');
  console.log('================================================');
  console.log(`Launch Date: Sunday, ${LAUNCH_DATE}`);
  console.log(`Current Date: ${new Date().toLocaleDateString()}`);
  console.log('================================================\n');
  
  // Step 1: Clear all development data
  console.log('Step 1: Clearing development data...');
  clearDataFiles();
  
  // Step 2: Reset teacher attendance statistics
  console.log('\nStep 2: Resetting teacher attendance statistics...');
  resetTeacherData();
  
  // Step 3: Update system settings
  console.log('\nStep 3: Updating system settings...');
  updateSystemSettings();
  
  console.log('\n================================================');
  console.log('✅ Launch preparation complete!');
  console.log('The app is now ready for launch on Sunday, August 4th, 2025');
  console.log('No absences will be counted before this date.');
  console.log('================================================');
}

// Run the preparation
prepareForLaunch();