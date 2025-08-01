const fs = require('fs');
const path = require('path');

// Load teachers data from JSON
const teachersPath = path.join(__dirname, '../data/teachers.json');
const teachersData = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));

// Create a mapping from email to teacher data for quick lookup
const teacherMap = {};
teachersData.forEach(teacher => {
  teacherMap[teacher.email.toLowerCase()] = teacher;
});

// Read the existing CSV file
const csvPath = path.join(__dirname, '../../resources/datasets/بيانات الموظفين  - Personal Info.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n');

// Process the CSV
const updatedLines = [];

// Update header
const header = lines[0];
const newHeader = header + ',Password / كلمة السر,Employee Role / دور الموظف';
updatedLines.push(newHeader);

// Process each data line
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Parse CSV line (simple parsing for this case)
  const columns = line.split(',');
  
  // Extract email (column 4, index 3)
  let email = '';
  if (columns.length >= 4) {
    email = columns[3].trim().toLowerCase();
    // Clean up email format
    email = email.replace(/\s+/g, ''); // Remove spaces
  }
  
  // Find matching teacher data
  const teacher = teacherMap[email];
  
  let password = '';
  let employeeRole = '';
  let employeeRoleAr = '';
  
  if (teacher) {
    password = teacher.plainPassword || '';
    employeeRole = teacher.roleName || teacher.role;
    employeeRoleAr = teacher.roleNameAr || '';
  }
  
  // Add the new columns
  const updatedLine = line + ',' + password + ',' + employeeRole + ' / ' + employeeRoleAr;
  updatedLines.push(updatedLine);
}

// Write the updated CSV
const updatedCSV = updatedLines.join('\n');
fs.writeFileSync(csvPath, updatedCSV, 'utf8');

console.log('✅ CSV file updated successfully!');
console.log(`📄 Updated file: ${csvPath}`);

// Display a preview of the updated data
console.log('\n=== PREVIEW OF UPDATED DATA ===');
console.log('First 10 entries with new columns:\n');

const previewLines = updatedLines.slice(0, 11); // Header + first 10 data rows
previewLines.forEach((line, index) => {
  if (index === 0) {
    console.log('HEADER:');
    console.log(line);
    console.log('\nDATA:');
  } else {
    const columns = line.split(',');
    const name = columns[0] || 'N/A';
    const email = columns[3] || 'N/A';
    const password = columns[7] || 'N/A';
    const role = columns[8] || 'N/A';
    
    console.log(`${index}. ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    console.log('');
  }
});

// Show summary
const dataRows = updatedLines.length - 1; // Exclude header
console.log(`\n📊 SUMMARY:`);
console.log(`Total records updated: ${dataRows}`);
console.log(`New columns added: Password / كلمة السر, Employee Role / دور الموظف`);

// Create a backup
const backupPath = csvPath.replace('.csv', '_backup.csv');
if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, csvContent, 'utf8');
  console.log(`💾 Backup created: ${backupPath}`);
}