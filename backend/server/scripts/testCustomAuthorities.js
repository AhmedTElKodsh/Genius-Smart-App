const fs = require('fs');
const path = require('path');

console.log('=== CUSTOM AUTHORITIES TEST ===\n');
console.log('This test demonstrates how an Admin can customize authorities for any role.\n');

// Example scenarios
const scenarios = [
  {
    title: 'Scenario 1: Manager with Limited Authorities',
    description: 'An Admin can create a Manager who can only view analytics but cannot approve requests',
    role: 'MANAGER',
    defaultAuthorities: [
      'Access Manager Portal',
      'Access Teacher Portal',
      'View Teachers Info',
      'Accept and Reject Employee Requests',
      'Accept and Reject Teachers\' Requests',
      'Download Reports',
      'View Analytics',
      'Submit Own Requests'
    ],
    customAuthorities: [
      'Access Manager Portal',
      'Access Teacher Portal',
      'View Teachers Info',
      'View Analytics'  // Removed request approval and report download
    ]
  },
  {
    title: 'Scenario 2: Employee with Extra Privileges',
    description: 'An Admin can grant an Employee the ability to view analytics',
    role: 'EMPLOYEE',
    defaultAuthorities: [
      'Access Teacher Portal',
      'Submit Requests',
      'View Own Data',
      'Check In/Out'
    ],
    customAuthorities: [
      'Access Teacher Portal',
      'Submit Requests',
      'View Own Data',
      'Check In/Out',
      'View Analytics'  // Added analytics viewing
    ]
  },
  {
    title: 'Scenario 3: Admin with Restricted Permissions',
    description: 'An Admin can create another Admin who cannot delete teachers',
    role: 'ADMIN',
    defaultAuthorities: [
      'Access Manager Portal',
      'Access Teacher Portal',
      'Add new teachers',
      'Edit Existing Teachers',
      'Delete Teachers',
      'Accept and Reject All Requests',
      'Accept and Reject Manager Requests',
      'Download Reports',
      'View All Analytics',
      'Manage User Authorities',
      'View Action Audit Trail',
      'Revoke Manager Actions',
      'Promote/Demote Users',
      'System Administration'
    ],
    customAuthorities: [
      'Access Manager Portal',
      'Access Teacher Portal',
      'Add new teachers',
      'Edit Existing Teachers',
      // 'Delete Teachers', // Removed
      'Accept and Reject All Requests',
      'Accept and Reject Manager Requests',
      'Download Reports',
      'View All Analytics',
      // 'Manage User Authorities', // Removed
      'View Action Audit Trail',
      // 'Revoke Manager Actions', // Removed
      // 'Promote/Demote Users', // Removed
      'System Administration'
    ]
  }
];

scenarios.forEach((scenario, index) => {
  console.log(`${scenario.title}`);
  console.log(`${scenario.description}\n`);
  console.log(`Role: ${scenario.role}`);
  console.log(`\nDefault Authorities (${scenario.defaultAuthorities.length}):`);
  scenario.defaultAuthorities.forEach(auth => {
    const removed = !scenario.customAuthorities.includes(auth);
    console.log(`  ${removed ? '❌' : '✓'} ${auth}${removed ? ' (Removed by Admin)' : ''}`);
  });
  
  // Check for added authorities
  const addedAuthorities = scenario.customAuthorities.filter(auth => !scenario.defaultAuthorities.includes(auth));
  if (addedAuthorities.length > 0) {
    console.log(`\nAdded Authorities:`);
    addedAuthorities.forEach(auth => {
      console.log(`  ➕ ${auth} (Added by Admin)`);
    });
  }
  
  console.log(`\nFinal Authority Count: ${scenario.customAuthorities.length}`);
  console.log('\n' + '='.repeat(60) + '\n');
});

console.log('KEY POINTS:');
console.log('1. When an Admin selects a role, they see a notification with two options:');
console.log('   - "Apply Default Authorities": Sets the standard authorities for that role');
console.log('   - "Keep Custom Authorities": Maintains current authority selections');
console.log('\n2. After selecting either option, the Admin can still manually check/uncheck');
console.log('   individual authority boxes to customize permissions');
console.log('\n3. This provides maximum flexibility while maintaining role-based defaults');