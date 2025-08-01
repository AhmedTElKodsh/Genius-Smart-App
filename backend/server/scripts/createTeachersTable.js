const fs = require('fs');
const path = require('path');

// Load teachers data
const teachersPath = path.join(__dirname, '../data/teachers.json');
const teachersData = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));

console.log('=== COMPLETE TEACHERS DATABASE ===\n');
console.log(`Total Teachers: ${teachersData.length}\n`);

// Create a clean table
const tableData = teachersData.map((teacher, index) => ({
  No: index + 1,
  Name: teacher.name,
  Email: teacher.email,
  Password: teacher.plainPassword || 'N/A',
  Department: teacher.subject,
  Role: teacher.role,
  RoleArabic: teacher.roleNameAr || teacher.roleName,
  Phone: teacher.phone || 'N/A',
  WorkType: teacher.workType,
  Status: teacher.status
}));

// Sort by department, then by name
tableData.sort((a, b) => {
  if (a.Department !== b.Department) {
    return a.Department.localeCompare(b.Department);
  }
  return a.Name.localeCompare(b.Name);
});

// Print formatted table
console.log('┌─────┬──────────────────────┬─────────────────────────────────────┬─────────────────┬─────────────────┬──────────────┬─────────────────┬──────────────────┬─────────────┬─────────────┐');
console.log('│ No. │        Name          │                Email                │    Password     │   Department    │     Role     │   Role (AR)     │      Phone       │  Work Type  │   Status    │');
console.log('├─────┼──────────────────────┼─────────────────────────────────────┼─────────────────┼─────────────────┼──────────────┼─────────────────┼──────────────────┼─────────────┼─────────────┤');

tableData.forEach(teacher => {
  const no = teacher.No.toString().padEnd(3);
  const name = teacher.Name.padEnd(20).substring(0, 20);
  const email = teacher.Email.padEnd(35).substring(0, 35);
  const password = teacher.Password.padEnd(15).substring(0, 15);
  const dept = teacher.Department.padEnd(15).substring(0, 15);
  const role = teacher.Role.padEnd(12).substring(0, 12);
  const roleAr = teacher.RoleArabic.padEnd(15).substring(0, 15);
  const phone = teacher.Phone.padEnd(16).substring(0, 16);
  const workType = teacher.WorkType.padEnd(11).substring(0, 11);
  const status = teacher.Status.padEnd(11).substring(0, 11);
  
  console.log(`│ ${no} │ ${name} │ ${email} │ ${password} │ ${dept} │ ${role} │ ${roleAr} │ ${phone} │ ${workType} │ ${status} │`);
});

console.log('└─────┴──────────────────────┴─────────────────────────────────────┴─────────────────┴─────────────────┴──────────────┴─────────────────┴──────────────────┴─────────────┴─────────────┘');

// Summary by role
console.log('\n=== ROLE SUMMARY ===');
const roleCount = {};
tableData.forEach(teacher => {
  roleCount[teacher.Role] = (roleCount[teacher.Role] || 0) + 1;
});

Object.keys(roleCount).forEach(role => {
  console.log(`${role}: ${roleCount[role]} users`);
});

// Summary by department
console.log('\n=== DEPARTMENT SUMMARY ===');
const deptCount = {};
tableData.forEach(teacher => {
  deptCount[teacher.Department] = (deptCount[teacher.Department] || 0) + 1;
});

Object.keys(deptCount).sort().forEach(dept => {
  console.log(`${dept}: ${deptCount[dept]} teachers`);
});

// Create a simplified plain text list
console.log('\n\n=== SIMPLIFIED LIST ===');
tableData.forEach((teacher, index) => {
  console.log(`${index + 1}. ${teacher.Name}`);
  console.log(`   Email: ${teacher.Email}`);
  console.log(`   Password: ${teacher.Password}`);
  console.log(`   Department: ${teacher.Department}`);
  console.log(`   Role: ${teacher.Role} (${teacher.RoleArabic})`);
  console.log(`   Phone: ${teacher.Phone}`);
  console.log('');
});

// Export to a clean text file
const exportText = [
  '=== GENIUS SMART EDUCATION - TEACHERS DATABASE ===\n',
  `Total Teachers: ${teachersData.length}\n`,
  'COMPLETE TEACHER LIST:\n',
  ...tableData.map((teacher, index) => 
    `${index + 1}. ${teacher.Name}\n` +
    `   Email: ${teacher.Email}\n` +
    `   Password: ${teacher.Password}\n` +
    `   Department: ${teacher.Department}\n` +
    `   Role: ${teacher.Role} (${teacher.RoleArabic})\n` +
    `   Phone: ${teacher.Phone}\n` +
    `   Work Type: ${teacher.WorkType}\n` +
    `   Status: ${teacher.Status}\n`
  )
].join('\n');

const textPath = path.join(__dirname, '../exports/teachers_database.txt');
fs.writeFileSync(textPath, exportText, 'utf8');
console.log(`\n📄 Complete database exported to: ${textPath}`);

// Admin and Manager credentials (most important)
console.log('\n=== 🔑 ADMIN CREDENTIALS ===');
const admins = tableData.filter(t => t.Role === 'ADMIN');
admins.forEach(admin => {
  console.log(`Name: ${admin.Name}`);
  console.log(`Email: ${admin.Email}`);
  console.log(`Password: ${admin.Password}`);
  console.log(`Phone: ${admin.Phone}`);
  console.log('---');
});

console.log('\n=== 👥 MANAGER CREDENTIALS ===');
const managers = tableData.filter(t => t.Role === 'MANAGER');
managers.forEach(manager => {
  console.log(`Name: ${manager.Name}`);
  console.log(`Email: ${manager.Email}`);
  console.log(`Password: ${manager.Password}`);
  console.log(`Phone: ${manager.Phone}`);
  console.log('---');
});