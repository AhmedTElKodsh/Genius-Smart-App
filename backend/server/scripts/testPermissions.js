const fs = require('fs');
const path = require('path');

// Load teachers data
const teachersPath = path.join(__dirname, '../data/teachers.json');
const teachersData = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));

console.log('=== PERMISSION TEST REPORT ===\n');

// Test different role scenarios
const testUsers = [
  { name: 'إبراهيم حمدي', expectedRole: 'ADMIN', expectedCanAdd: true, expectedCanEdit: true },
  { name: 'ماهيتاب مصطفى', expectedRole: 'MANAGER', expectedCanAdd: false, expectedCanEdit: false },
  { name: 'ابراهيم أحمد', expectedRole: 'EMPLOYEE', expectedCanAdd: false, expectedCanEdit: false }
];

testUsers.forEach(testUser => {
  const teacher = teachersData.find(t => t.name === testUser.name);
  
  if (teacher) {
    const canAddTeachers = teacher.authorities.includes('Add new teachers');
    const canEditTeachers = teacher.authorities.includes('Edit Existing Teachers');
    
    console.log(`User: ${teacher.name}`);
    console.log(`  Role: ${teacher.role} (Expected: ${testUser.expectedRole}) ${teacher.role === testUser.expectedRole ? '✓' : '✗'}`);
    console.log(`  Can Add Teachers: ${canAddTeachers} (Expected: ${testUser.expectedCanAdd}) ${canAddTeachers === testUser.expectedCanAdd ? '✓' : '✗'}`);
    console.log(`  Can Edit Teachers: ${canEditTeachers} (Expected: ${testUser.expectedCanEdit}) ${canEditTeachers === testUser.expectedCanEdit ? '✓' : '✗'}`);
    console.log(`  Authorities: ${teacher.authorities.join(', ')}`);
    console.log('');
  } else {
    console.log(`User ${testUser.name} not found!`);
  }
});

console.log('\n=== SUMMARY ===');
console.log('For proper functionality:');
console.log('- ADMIN users should see "Add New Teacher" button and can edit all teachers');
console.log('- MANAGER users should NOT see "Add New Teacher" button, can view but not edit teachers');
console.log('- EMPLOYEE users should NOT see "Add New Teacher" button, can view but not edit teachers');