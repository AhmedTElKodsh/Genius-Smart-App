const fs = require('fs');
const path = require('path');

// Function to read JSON file
const readJSON = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
};

// Function to write JSON file
const writeJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Successfully updated ${filePath}`);
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
};

// Function to create backup
const createBackup = (filePath, data) => {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
  const backupPath = path.join(path.dirname(filePath), 'backups', `${timestamp}_${path.basename(filePath)}`);
  writeJSON(backupPath, data);
  console.log(`Backup created: ${backupPath}`);
};

// Main function to update manager roles
const updateManagerRoles = () => {
  const managersPath = path.join(__dirname, '../data/managers.json');
  const managers = readJSON(managersPath);
  
  if (!managers) {
    console.error('Failed to read managers data');
    return;
  }
  
  // Create backup
  createBackup(managersPath, managers);
  
  // Define admin names
  const adminNames = ['إبراهيم حمدي', 'عمرو زاهر'];
  
  // Update each manager
  const updatedManagers = managers.map(manager => {
    const isAdmin = adminNames.includes(manager.name) || adminNames.includes(manager.nameArabic);
    
    return {
      ...manager,
      systemRole: isAdmin ? 'Admin' : 'Manager',
      managerLevel: isAdmin ? 'admin' : 'manager',
      authorities: {
        ...manager.authorities,
        canViewAuditTrail: isAdmin,
        canManageAuthorities: isAdmin
      }
    };
  });
  
  // Check if we need to add Amr Zaher as a manager
  const amrZaherExists = updatedManagers.some(m => 
    m.name === 'عمرو زاهر' || m.nameArabic === 'عمرو زاهر'
  );
  
  if (!amrZaherExists) {
    console.log('Adding عمرو زاهر as an Admin manager...');
    
    // Get teacher data for Amr Zaher
    const teachersPath = path.join(__dirname, '../data/teachers.json');
    const teachers = readJSON(teachersPath);
    const amrZaher = teachers?.find(t => t.name === 'عمرو زاهر');
    
    if (amrZaher) {
      const newManager = {
        id: `MGR_${Math.random().toString(36).substr(2, 8)}`,
        email: amrZaher.email || 'amr_zaher1@hotmail.com',
        password: amrZaher.password || '$2b$10$rCV1jh9vRI3R8wsILgzf0O/K3asB307JWho/xtX3FtraJeny2pJ6K',
        plainPassword: amrZaher.plainPassword || 'iq3D$AZeKm',
        name: 'عمرو زاهر',
        nameArabic: 'عمرو زاهر',
        role: 'Manager',
        systemRole: 'Admin',
        department: 'Management',
        managerLevel: 'admin',
        authorities: {
          canAccessPortal: true,
          canAddTeachers: true,
          canEditTeachers: true,
          canManageRequests: true,
          canDownloadReports: true,
          canManageAuthorities: true,
          canViewAuditTrail: true
        },
        phone: amrZaher.phone || '+201069033223',
        employmentDate: amrZaher.createdAt?.split('T')[0] || '2023-01-01',
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: null,
        status: 'Active'
      };
      
      updatedManagers.push(newManager);
      console.log('Added عمرو زاهر as Admin');
    }
  }
  
  // Write updated data
  writeJSON(managersPath, updatedManagers);
  
  console.log('\nManager roles updated:');
  updatedManagers.forEach(manager => {
    console.log(`- ${manager.name} (${manager.nameArabic}): ${manager.systemRole}`);
  });
};

// Run the update
updateManagerRoles(); 