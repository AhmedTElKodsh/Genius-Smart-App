const fs = require('fs');
const path = require('path');

// File paths
const teachersFilePath = path.join(__dirname, '..', 'data', 'teachers.json');
const csvFilePath = path.join(__dirname, '..', '..', 'بيانات الموظفين  - Personal Info.csv');

// Read teachers data
const readTeachers = () => {
  try {
    const data = fs.readFileSync(teachersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading teachers.json:', error);
    return [];
  }
};

// Write teachers data
const writeTeachers = (teachers) => {
  try {
    fs.writeFileSync(teachersFilePath, JSON.stringify(teachers, null, 2));
    console.log('Teachers data updated successfully');
  } catch (error) {
    console.error('Error writing teachers.json:', error);
  }
};

// Create backup
const createBackup = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, '..', 'data', 'backups', `teachers_phone_update_${timestamp}.json`);
  
  try {
    const teachers = readTeachers();
    fs.writeFileSync(backupPath, JSON.stringify(teachers, null, 2));
    console.log(`Backup created: ${backupPath}`);
  } catch (error) {
    console.error('Error creating backup:', error);
  }
};

// Update phone numbers
const updatePhoneNumbers = async () => {
  console.log('Starting phone number update...\n');
  
  // Create backup first
  createBackup();
  
  // Read current teachers
  const teachers = readTeachers();
  const phoneUpdates = [];
  
  // Read CSV file
  const csvData = fs.readFileSync(csvFilePath, 'utf8');
  const lines = csvData.split('\n');
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line manually to handle Arabic text properly
    const parts = line.split(',');
    if (parts.length < 7) continue;
    
    const name = parts[0].trim();
    const phone = parts[2].trim();
    const email = parts[3].trim();
    
    // Find matching teacher by email or name
    const teacher = teachers.find(t => 
      t.email.toLowerCase() === email.toLowerCase() || 
      t.name === name
    );
    
    if (teacher && phone) {
      // Format phone number (remove spaces)
      const formattedPhone = phone.replace(/\s/g, '');
      
      if (teacher.phone !== formattedPhone) {
        console.log(`Updating ${teacher.name}:`);
        console.log(`  Old phone: ${teacher.phone}`);
        console.log(`  New phone: ${formattedPhone}`);
        console.log('');
        
        teacher.phone = formattedPhone;
        teacher.updatedAt = new Date().toISOString();
        phoneUpdates.push(teacher.name);
      }
    }
  }
  
  // Write updated data
  if (phoneUpdates.length > 0) {
    writeTeachers(teachers);
    console.log(`\nUpdated phone numbers for ${phoneUpdates.length} teachers:`);
    phoneUpdates.forEach(name => console.log(`  - ${name}`));
  } else {
    console.log('No phone number updates needed.');
  }
};

// Run the update
updatePhoneNumbers().catch(console.error); 