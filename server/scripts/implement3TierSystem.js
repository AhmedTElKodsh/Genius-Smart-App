const fs = require('fs');
const path = require('path');

// Define the 3-tier system structure
const SYSTEM_LAYERS = {
  ADMIN: {
    level: 3,
    name: 'Admin',
    nameAr: 'مدير عام',
    authorities: [
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
    description: 'Full system access with ability to manage all layers and revoke actions'
  },
  MANAGER: {
    level: 2,
    name: 'Manager',
    nameAr: 'مدير',
    authorities: [
      'Access Manager Portal',
      'Access Teacher Portal',
      'View Teachers Info',
      'Accept and Reject Employee Requests',
      'Download Reports',
      'View Analytics',
      'Submit Own Requests'
    ],
    description: 'Restricted management access, cannot approve own requests or revoke admin actions'
  },
  EMPLOYEE: {
    level: 1,
    name: 'Employee', 
    nameAr: 'موظف',
    authorities: [
      'Access Teacher Portal',
      'Submit Requests',
      'View Own Data',
      'Check In/Out'
    ],
    description: 'Basic teacher access with request submission capabilities'
  }
};

// Define initial role assignments
const INITIAL_ROLE_ASSIGNMENTS = {
  // Admin - people who should have full access
  ADMIN: [
    'إبراهيم حمدي',
    'علي توفيق'
  ],
  // Manager - starting with ماهيتاب مصطفى as requested
  MANAGER: [
    'ماهيتاب مصطفى'
  ],
  // All others will be EMPLOYEE by default
};

function updateTeachersWithRoles() {
  const teachersPath = path.join(__dirname, '../data/teachers.json');
  const teachers = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
  
  console.log('🔄 Updating teachers with 3-tier role system...');
  
  const updatedTeachers = teachers.map(teacher => {
    let role = 'EMPLOYEE'; // Default role
    
    // Assign roles based on names
    if (INITIAL_ROLE_ASSIGNMENTS.ADMIN.includes(teacher.name)) {
      role = 'ADMIN';
    } else if (INITIAL_ROLE_ASSIGNMENTS.MANAGER.includes(teacher.name)) {
      role = 'MANAGER';
    }
    
    const roleConfig = SYSTEM_LAYERS[role];
    
    return {
      ...teacher,
      role: role,
      roleLevel: roleConfig.level,
      roleName: roleConfig.name,
      roleNameAr: roleConfig.nameAr,
      authorities: [...roleConfig.authorities],
      roleDescription: roleConfig.description,
      canAccessManagerPortal: role === 'ADMIN' || role === 'MANAGER',
      canAccessTeacherPortal: true, // All roles can access teacher portal
      canApproveRequests: role === 'ADMIN' || role === 'MANAGER',
      canApproveManagerRequests: role === 'ADMIN', // Only admin can approve manager requests
      canRevokeActions: role === 'ADMIN',
      canViewAuditTrail: role === 'ADMIN',
      isPerformanceTracked: role === 'MANAGER' || role === 'EMPLOYEE', // Don't track admin performance
      updatedAt: new Date().toISOString(),
      lastRoleUpdate: new Date().toISOString()
    };
  });
  
  // Create backup
  const backupPath = path.join(__dirname, `../data/backups/teachers_before_3tier_${Date.now()}.json`);
  const backupDir = path.dirname(backupPath);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  fs.writeFileSync(backupPath, JSON.stringify(teachers, null, 2), 'utf8');
  
  // Write updated teachers
  fs.writeFileSync(teachersPath, JSON.stringify(updatedTeachers, null, 2), 'utf8');
  
  console.log('✅ Teachers updated with roles:');
  
  // Summary
  const roleCounts = updatedTeachers.reduce((acc, teacher) => {
    acc[teacher.role] = (acc[teacher.role] || 0) + 1;
    return acc;
  }, {});
  
  Object.entries(roleCounts).forEach(([role, count]) => {
    const roleConfig = SYSTEM_LAYERS[role];
    console.log(`   ${roleConfig.nameAr} (${roleConfig.name}): ${count} users`);
  });
  
  // Show specific assignments
  console.log('\n📋 Role Assignments:');
  ['ADMIN', 'MANAGER'].forEach(role => {
    const usersInRole = updatedTeachers.filter(t => t.role === role);
    if (usersInRole.length > 0) {
      console.log(`\n${SYSTEM_LAYERS[role].nameAr} (${SYSTEM_LAYERS[role].name}):`);
      usersInRole.forEach(user => {
        console.log(`  - ${user.name} (${user.email})`);
      });
    }
  });
  
  return updatedTeachers;
}

function createActionAuditSchema() {
  const auditPath = path.join(__dirname, '../data/action_audit.json');
  
  if (!fs.existsSync(auditPath)) {
    const initialAudit = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      actions: [],
      schema: {
        actionId: 'string (UUID)',
        timestamp: 'ISO string',
        userId: 'string (performer ID)', 
        userName: 'string (performer name)',
        userRole: 'string (ADMIN/MANAGER/EMPLOYEE)',
        action: 'string (action type)',
        targetType: 'string (request/teacher/system)',
        targetId: 'string (target ID)',
        targetName: 'string (target name)',
        details: 'object (action details)',
        originalData: 'object (before state)',
        newData: 'object (after state)',
        canBeRevoked: 'boolean',
        revokedAt: 'ISO string or null',
        revokedBy: 'string (revoker ID) or null',
        revokedReason: 'string or null'
      }
    };
    
    fs.writeFileSync(auditPath, JSON.stringify(initialAudit, null, 2), 'utf8');
    console.log('✅ Action audit system created');
  }
}

function createRoleDefinitionsFile() {
  const rolesPath = path.join(__dirname, '../data/system_roles.json');
  
  const roleDefinitions = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    layers: SYSTEM_LAYERS,
    hierarchyRules: {
      adminCanRevokeManager: true,
      managerCannotRevokeAdmin: true,
      managerCannotApproveOwnRequests: true,
      adminCanViewAllActions: true,
      performanceTrackingAppliesTo: ['MANAGER', 'EMPLOYEE']
    },
    defaultAuthorities: {
      'Access Manager Portal': ['ADMIN', 'MANAGER'],
      'Access Teacher Portal': ['ADMIN', 'MANAGER', 'EMPLOYEE'],
      'Accept and Reject Requests': ['ADMIN', 'MANAGER'],
      'Accept and Reject Manager Requests': ['ADMIN'],
      'Revoke Manager Actions': ['ADMIN'],
      'View Action Audit Trail': ['ADMIN']
    }
  };
  
  fs.writeFileSync(rolesPath, JSON.stringify(roleDefinitions, null, 2), 'utf8');
  console.log('✅ Role definitions file created');
}

function createManagerRequestsCollection() {
  const managerRequestsPath = path.join(__dirname, '../data/manager_requests.json');
  
  if (!fs.existsSync(managerRequestsPath)) {
    const initialManagerRequests = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      description: 'Requests submitted by managers that require admin approval',
      requests: [],
      schema: {
        id: 'string (UUID)',
        requesterId: 'string (manager ID)',
        requesterName: 'string',
        requesterEmail: 'string',
        requestType: 'string (Absence/Late Arrival/Early Leave)',
        startDate: 'ISO date string',
        endDate: 'ISO date string',
        reason: 'string',
        duration: 'string',
        status: 'string (pending/approved/rejected)',
        submittedAt: 'ISO string',
        reviewedAt: 'ISO string or null',
        reviewedBy: 'string (admin ID) or null',
        reviewerName: 'string or null',
        adminComments: 'string or null',
        canOnlyBeApprovedByAdmin: true
      }
    };
    
    fs.writeFileSync(managerRequestsPath, JSON.stringify(initialManagerRequests, null, 2), 'utf8');
    console.log('✅ Manager requests collection created');
  }
}

// Main execution
async function implement3TierSystem() {
  try {
    console.log('🚀 Implementing 3-Tier Permission System...\n');
    
    // 1. Update teachers with roles
    const updatedTeachers = updateTeachersWithRoles();
    
    // 2. Create action audit system
    createActionAuditSchema();
    
    // 3. Create role definitions
    createRoleDefinitionsFile();
    
    // 4. Create manager requests collection  
    createManagerRequestsCollection();
    
    console.log('\n🎉 3-Tier System Implementation Complete!');
    console.log('\n📋 System Summary:');
    console.log('   • Admin Layer: Full access, can revoke manager actions');
    console.log('   • Manager Layer: Portal access, can approve employee requests');
    console.log('   • Employee Layer: Basic teacher portal access');
    console.log('\n🔒 Security Features:');
    console.log('   • Audit trail for all admin/manager actions');
    console.log('   • Managers cannot approve their own requests');
    console.log('   • Admin can revoke manager actions');
    console.log('   • Performance tracking for Manager/Employee layers only');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error implementing 3-tier system:', error);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  implement3TierSystem();
}

module.exports = { implement3TierSystem, SYSTEM_LAYERS }; 