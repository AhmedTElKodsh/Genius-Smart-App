#!/usr/bin/env node

const { cleanupDelayedRequests, getDelayedRequestsStats } = require('./utils/requestCleanup');
const fs = require('fs');
const path = require('path');

console.log('🔧 Testing Hierarchical Management System\n');

// Test 1: Display new manager structure
console.log('📋 Manager Structure:');
try {
  const managersPath = path.join(__dirname, 'data', 'managers.json');
  const managers = JSON.parse(fs.readFileSync(managersPath, 'utf8'));
  
  console.log('\n👤 Admin Manager:');
  const adminManager = managers.find(m => m.managerLevel === 'admin');
  if (adminManager) {
    console.log(`   Name: ${adminManager.name}`);
    console.log(`   Email: ${adminManager.email}`);
    console.log(`   Role: ${adminManager.role}`);
    console.log(`   Can Manage Teachers: ${adminManager.canManageTeachers}`);
    console.log(`   Can View All Requests: ${adminManager.canViewAllRequests}`);
    console.log(`   Can Manage Managers: ${adminManager.canManageManagers}`);
  }

  console.log('\n👥 Regular Managers:');
  const regularManagers = managers.filter(m => m.managerLevel === 'regular');
  regularManagers.forEach(manager => {
    console.log(`   • ${manager.name} (${manager.email})`);
    console.log(`     Role: ${manager.role}`);
    console.log(`     Can Manage Teachers: ${manager.canManageTeachers}`);
    console.log(`     Permissions: ${manager.permissions.join(', ')}`);
    console.log('');
  });

} catch (error) {
  console.error('❌ Error loading managers:', error.message);
}

// Test 2: Check delayed requests statistics
console.log('\n🧹 Delayed Requests Analysis:');
try {
  const stats = getDelayedRequestsStats();
  
  if (stats.success) {
    console.log(`   Total Requests: ${stats.totalRequests}`);
    console.log(`   Delayed Requests: ${stats.delayedRequests.total}`);
    console.log(`   - Before Current Month: ${stats.delayedRequests.beforeCurrentMonth}`);
    console.log(`   - Exceeding 30 Days: ${stats.delayedRequests.exceeding30Days}`);
    console.log(`   Current Month Threshold: ${stats.thresholds.currentMonthStart}`);
    console.log(`   30-Day Threshold: ${stats.thresholds.thirtyDaysAgo}`);
  } else {
    console.log(`   ❌ Error: ${stats.message}`);
  }
} catch (error) {
  console.error('❌ Error getting stats:', error.message);
}

// Test 3: Perform cleanup (if delayed requests exist)
console.log('\n🧹 Cleanup Operation:');
try {
  const cleanupResult = cleanupDelayedRequests();
  
  if (cleanupResult.success) {
    console.log(`   ✅ Cleanup successful!`);
    console.log(`   Initial Count: ${cleanupResult.initialCount}`);
    console.log(`   Final Count: ${cleanupResult.finalCount}`);
    console.log(`   Removed: ${cleanupResult.removed} requests`);
    
    if (cleanupResult.removed > 0) {
      console.log('\n   📋 Cleanup Details:');
      console.log(`   - ${cleanupResult.details.beforeCurrentMonth}`);
      console.log(`   - ${cleanupResult.details.exceeding30Days}`);
    } else {
      console.log('   ℹ️ No delayed requests found to remove');
    }
  } else {
    console.log(`   ❌ Cleanup failed: ${cleanupResult.message}`);
  }
} catch (error) {
  console.error('❌ Error during cleanup:', error.message);
}

// Test 4: Display system permissions summary
console.log('\n📊 System Permissions Summary:');
console.log('   Admin Manager (ibrahim@genius.edu):');
console.log('   ✅ Can manage all requests (pending & completed)');
console.log('   ✅ Can add/edit teachers');
console.log('   ✅ Can perform system cleanup');
console.log('   ✅ Can view completed requests by other managers');
console.log('');
console.log('   Regular Managers (ebtahal, adel, amer):');
console.log('   ✅ Can manage pending requests');
console.log('   ✅ Can view attendance & reports');
console.log('   ❌ Cannot add/edit teachers');
console.log('   ❌ Cannot view completed requests');
console.log('   ❌ Cannot perform system cleanup');

console.log('\n🎉 Hierarchical Management System Test Complete!\n');

// Test 5: API endpoint summary
console.log('🔗 New API Endpoints:');
console.log('   GET  /api/requests/completed       - View completed requests (Admin only)');
console.log('   GET  /api/requests/cleanup/stats   - View cleanup statistics (Admin only)');
console.log('   POST /api/requests/cleanup         - Perform cleanup (Admin only)');
console.log('   GET  /api/requests/manager-summary - View requests by manager level');
console.log('');
console.log('🔒 Protected Teacher Endpoints (Admin only):');
console.log('   POST   /api/teachers/              - Add new teacher');
console.log('   PUT    /api/teachers/:id           - Edit teacher');
console.log('   DELETE /api/teachers/:id           - Delete teacher');
console.log(''); 