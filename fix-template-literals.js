const fs = require('fs');
const path = require('path');

// Files that need fixing based on grep search
const filesToFix = [
  'frontend/src/pages/TeacherSignin.tsx',
  'frontend/src/pages/TeacherResetPassword.tsx',
  'frontend/src/pages/ManagerSettings.tsx',
  'frontend/src/pages/ManagerRequests.tsx',
  'frontend/src/pages/ManagerDashboard.tsx',
  'frontend/src/components/ServerStatus.tsx',
  'frontend/src/components/SendRequestModal.tsx',
  'frontend/src/components/EditTeacherModal.tsx',
  'frontend/src/components/AddTeacherModal.tsx'
];

let totalFixed = 0;

filesToFix.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace single quotes with backticks for template literals
    const regex = /fetch\(\s*'\$\{([^}]+)\}([^']*)'([^)]*)\)/g;
    let fixedContent = content.replace(regex, 'fetch(`${$1}$2`$3)');
    
    if (content !== fixedContent) {
      fs.writeFileSync(fullPath, fixedContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      totalFixed++;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Total files fixed: ${totalFixed}`);