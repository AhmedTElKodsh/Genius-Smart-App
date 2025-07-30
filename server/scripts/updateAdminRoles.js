const fs = require('fs');
const path = require('path');

function updateAdminRoles() {
  const teachersPath = path.join(__dirname, '../data/teachers.json');
  
  try {
    // Read current teachers data
    const teachersData = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
    
    // Define the only allowed admins
    const allowedAdmins = ['إبراهيم حمدي', 'عمرو زاهر'];
    
    // Update Amer Zaher's email
    const amerZaher = teachersData.find(t => t.name === 'عمرو زاهر');
    if (amerZaher && amerZaher.email !== 'badrsalah525@gmail.com') {
      console.log(`Found Amer Zaher with email: ${amerZaher.email}`);
      amerZaher.email = 'badrsalah525@gmail.com';
      console.log(`Updated Amer Zaher's email to: ${amerZaher.email}`);
    }
    
    // Process all teachers
    teachersData.forEach(teacher => {
      // If they have ADMIN role but are not in allowed list, downgrade them
      if (teacher.role === 'ADMIN' && !allowedAdmins.includes(teacher.name)) {
        console.log(`\nDowngrading ${teacher.name} from ADMIN role`);
        
        // Special case for ماهيتاب مصطفى - should be Manager with request approval authority
        if (teacher.name === 'ماهيتاب مصطفى') {
          teacher.role = 'MANAGER';
          teacher.roleLevel = 2;
          teacher.roleName = 'Manager';
          teacher.roleNameAr = 'مدير';
          teacher.authorities = [
            'Access Manager Portal',
            'Access Teacher Portal',
            'View Teachers Info',
            'Accept and Reject Employee Requests',
            'Accept and Reject Teachers\' Requests', // Special authority as mentioned
            'Download Reports',
            'View Analytics',
            'Submit Own Requests'
          ];
          console.log(`  - Set as MANAGER with special request approval authority`);
        } else {
          // Others become regular employees
          teacher.role = 'EMPLOYEE';
          teacher.roleLevel = 1;
          teacher.roleName = 'Employee';
          teacher.roleNameAr = 'موظف';
          teacher.authorities = [
            'Access Teacher Portal',
            'Submit Requests',
            'View Own Data',
            'Check In/Out'
          ];
          teacher.canAccessManagerPortal = false;
          teacher.canApproveRequests = false;
          console.log(`  - Set as EMPLOYEE`);
        }
      }
    })
    
    // Verify current ADMINs
    const admins = teachersData.filter(t => t.role === 'ADMIN');
    console.log('\nCurrent ADMINs:');
    admins.forEach(admin => {
      console.log(`- ${admin.name} (${admin.email})`);
    });
    
    // Save updated data
    fs.writeFileSync(teachersPath, JSON.stringify(teachersData, null, 2), 'utf8');
    console.log('\n✅ Admin roles updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating admin roles:', error);
  }
}

// Run the update
updateAdminRoles();