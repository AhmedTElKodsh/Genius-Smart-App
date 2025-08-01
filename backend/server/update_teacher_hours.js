const fs = require('fs');
const path = require('path');

// Update all teachers to include remaining hours field (4 hours total for Late Arrival + Early Leave)
const updateTeacherHours = () => {
  try {
    const teachersPath = path.join(__dirname, 'data', 'teachers.json');
    const teachersData = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
    
    const updatedTeachers = teachersData.map(teacher => ({
      ...teacher,
      remainingLateEarlyHours: teacher.remainingLateEarlyHours !== undefined ? teacher.remainingLateEarlyHours : 4.0,
      totalLateEarlyHours: teacher.totalLateEarlyHours !== undefined ? teacher.totalLateEarlyHours : 4.0
    }));
    
    fs.writeFileSync(teachersPath, JSON.stringify(updatedTeachers, null, 2));
    console.log('✅ Successfully updated all teachers with hour tracking fields');
    console.log(`Updated ${updatedTeachers.length} teachers`);
    
  } catch (error) {
    console.error('❌ Error updating teacher hours:', error);
  }
};

// Run the update
updateTeacherHours(); 