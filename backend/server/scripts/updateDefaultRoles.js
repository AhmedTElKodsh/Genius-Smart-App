const fs = require('fs');
const path = require('path');

// Load teachers data
const teachersPath = path.join(__dirname, '../data/teachers.json');
const teachersData = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));

// Define the Employee role authorities
const employeeAuthorities = [
  'Access Teacher Portal',
  'Submit Requests',
  'View Own Data',
  'Check In/Out'
];

// Update teachers
let updateCount = 0;
console.log(`Processing ${teachersData.length} teachers...`);

teachersData.forEach(teacher => {
  // Only إبراهيم حمدي and عمرو زاهر should have Admin role
  if (teacher.name === 'إبراهيم حمدي' || teacher.name === 'عمرو زاهر') {
    // Keep their Admin role (already set)
    console.log(`✓ Keeping Admin role for: ${teacher.name}`);
  }
  // Only Management department employees (except the two admins) should have Manager role
  else if (teacher.subject === 'Management') {
    // These should have Manager role
    if (teacher.role !== 'MANAGER') {
      teacher.role = 'MANAGER';
      teacher.roleLevel = 2;
      teacher.roleName = 'Manager';
      teacher.roleNameAr = 'مدير';
      teacher.authorities = [
        'Access Manager Portal',
        'Access Teacher Portal',
        'View Teachers Info',
        'Accept and Reject Employee Requests',
        'Accept and Reject Teachers\' Requests',
        'Download Reports',
        'View Analytics',
        'Submit Own Requests'
      ];
      teacher.canAccessManagerPortal = true;
      teacher.canAccessTeacherPortal = true;
      teacher.canApproveRequests = true;
      updateCount++;
      console.log(`✓ Updated to Manager role: ${teacher.name}`);
    } else {
      console.log(`✓ Already has Manager role: ${teacher.name}`);
    }
  }
  // Everyone else (including Mentor, KG Manager, Floor Admin, HR) should have Employee role
  else {
    console.log(`Processing ${teacher.name} from ${teacher.subject} department (current role: ${teacher.role})...`);
    if (teacher.role !== 'EMPLOYEE') {
      teacher.role = 'EMPLOYEE';
      teacher.roleLevel = 1;
      teacher.roleName = 'Employee';
      teacher.roleNameAr = 'موظف';
      teacher.authorities = employeeAuthorities;
      teacher.canAccessManagerPortal = false;
      teacher.canAccessTeacherPortal = true;
      teacher.canApproveRequests = false;
      updateCount++;
      console.log(`✓ Updated to Employee role: ${teacher.name} (${teacher.subject})`);
    }
  }
});

// Write updated data
fs.writeFileSync(teachersPath, JSON.stringify(teachersData, null, 2), 'utf8');

console.log(`\n✅ Role update complete! Updated ${updateCount} users.`);
console.log('\nSummary:');
console.log('- Admins (2): إبراهيم حمدي, عمرو زاهر');
console.log('- Managers: All Management department employees (except admins)');
console.log('- Employees: Everyone else (including Mentor, KG Manager, Floor Admin, HR)');