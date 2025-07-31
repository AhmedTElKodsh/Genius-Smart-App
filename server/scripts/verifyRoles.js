const fs = require('fs');
const path = require('path');

// Load teachers data
const teachersPath = path.join(__dirname, '../data/teachers.json');
const teachersData = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));

// Group teachers by role
const admins = [];
const managers = [];
const employees = [];

teachersData.forEach(teacher => {
  if (teacher.role === 'ADMIN') {
    admins.push({ name: teacher.name, department: teacher.subject });
  } else if (teacher.role === 'MANAGER') {
    managers.push({ name: teacher.name, department: teacher.subject });
  } else {
    employees.push({ name: teacher.name, department: teacher.subject });
  }
});

console.log('=== ROLE VERIFICATION REPORT ===\n');

console.log(`ADMINS (${admins.length}):`);
admins.forEach(admin => {
  console.log(`  ✓ ${admin.name} (${admin.department})`);
});

console.log(`\nMANAGERS (${managers.length}):`);
managers.forEach(manager => {
  console.log(`  ✓ ${manager.name} (${manager.department})`);
});

console.log(`\nEMPLOYEES (${employees.length}):`);
// Group employees by department
const employeesByDept = {};
employees.forEach(emp => {
  if (!employeesByDept[emp.department]) {
    employeesByDept[emp.department] = [];
  }
  employeesByDept[emp.department].push(emp.name);
});

// Show specific departments of interest
const departmentsOfInterest = ['Mentor', 'KG Manager', 'Floor Admin', 'HR'];
departmentsOfInterest.forEach(dept => {
  if (employeesByDept[dept]) {
    console.log(`  ${dept}:`);
    employeesByDept[dept].forEach(name => {
      console.log(`    ✓ ${name}`);
    });
  }
});

console.log('\n=== SUMMARY ===');
console.log(`Total Teachers: ${teachersData.length}`);
console.log(`Admins: ${admins.length}`);
console.log(`Managers: ${managers.length}`);
console.log(`Employees: ${employees.length}`);