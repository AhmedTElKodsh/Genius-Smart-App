const fs = require('fs');
const path = require('path');

// Load teachers data
const teachersPath = path.join(__dirname, '../data/teachers.json');
const teachersData = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));

console.log('=== ALL TEACHERS INFORMATION ===\n');
console.log(`Total Teachers: ${teachersData.length}\n`);

// Sort teachers by department, then by name
const sortedTeachers = teachersData.sort((a, b) => {
  if (a.subject !== b.subject) {
    return a.subject.localeCompare(b.subject);
  }
  return a.name.localeCompare(b.name);
});

// Group by department
const teachersByDepartment = {};
sortedTeachers.forEach(teacher => {
  if (!teachersByDepartment[teacher.subject]) {
    teachersByDepartment[teacher.subject] = [];
  }
  teachersByDepartment[teacher.subject].push(teacher);
});

// Display by department
Object.keys(teachersByDepartment).sort().forEach(department => {
  console.log(`📁 DEPARTMENT: ${department.toUpperCase()}`);
  console.log('=' + '='.repeat(department.length + 15));
  
  teachersByDepartment[department].forEach((teacher, index) => {
    console.log(`${index + 1}. Name: ${teacher.name}`);
    console.log(`   Email: ${teacher.email}`);
    console.log(`   Password: ${teacher.plainPassword || 'N/A'}`);
    console.log(`   Role: ${teacher.role} (${teacher.roleNameAr || teacher.roleName})`);
    console.log(`   Phone: ${teacher.phone}`);
    console.log(`   Work Type: ${teacher.workType}`);
    console.log(`   Status: ${teacher.status}`);
    console.log('');
  });
  
  console.log(`Total in ${department}: ${teachersByDepartment[department].length} teachers`);
  console.log('\n' + '-'.repeat(60) + '\n');
});

// Summary by role
console.log('📊 SUMMARY BY ROLE:');
console.log('==================');
const roleCount = {};
teachersData.forEach(teacher => {
  roleCount[teacher.role] = (roleCount[teacher.role] || 0) + 1;
});

Object.keys(roleCount).sort().forEach(role => {
  console.log(`${role}: ${roleCount[role]} users`);
});

// Export to CSV format
const csvContent = [
  'Name,Email,Password,Department,Role,Phone,Work Type,Status',
  ...sortedTeachers.map(teacher => 
    `"${teacher.name}","${teacher.email}","${teacher.plainPassword || 'N/A'}","${teacher.subject}","${teacher.role}","${teacher.phone}","${teacher.workType}","${teacher.status}"`
  )
].join('\n');

const csvPath = path.join(__dirname, '../exports/teachers_list.csv');
const exportDir = path.dirname(csvPath);

// Create exports directory if it doesn't exist
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

fs.writeFileSync(csvPath, csvContent);
console.log(`\n📄 CSV file exported to: ${csvPath}`);