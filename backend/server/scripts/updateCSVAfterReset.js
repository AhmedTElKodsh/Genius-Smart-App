const fs = require('fs');
const path = require('path');

// Paths
const teachersPath = path.join(__dirname, '../data/teachers.json');
const csvPath = path.join(__dirname, '../../resources/datasets/بيانات الموظفين  - Personal Info.csv');

// Read teachers data
const teachers = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));

// Create CSV content
let csvContent = 'Name / الاسم,Subject / المواد,Mobile Number / رقم الموبايل,Email / الإيميل,Password / كلمة السر,Work Type / نوع العمل,Employment Date / تاريخ التعيين,Employee Role / دور الموظف\n';

teachers.forEach(teacher => {
  const workType = teacher.workType === 'Full-time' ? 'Full-Time / دوام كامل' : 'Part-Time / دوام جزئي';
  const role = teacher.roleNameAr ? `${teacher.roleName} / ${teacher.roleNameAr}` : teacher.roleName || 'Employee / موظف';
  const employmentDate = teacher.employmentDate || '';
  
  csvContent += `${teacher.name},${teacher.subject},${teacher.phone},${teacher.email},${teacher.plainPassword || ''},${workType},${employmentDate},${role}\n`;
});

// Write to CSV file
fs.writeFileSync(csvPath, csvContent, 'utf8');

console.log('✅ CSV file updated successfully');
console.log(`   Updated ${teachers.length} teacher records`);
console.log(`   File saved at: ${csvPath}`);