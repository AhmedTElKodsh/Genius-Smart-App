const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// Generate random secure password
function generateRandomPassword() {
  const length = 10;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill remaining characters
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Hash password
async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, 10);
}

// Generate documentation markdown
function generateDocumentation(teachers) {
  const currentDate = new Date().toLocaleString('en-US', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let markdown = `# 🏫 Genius Smart Education - Employee Database\n\n`;
  markdown += `**Last Updated:** ${currentDate} (Cairo Time)\n`;
  markdown += `**Total Employees:** ${teachers.length}\n\n`;
  
  // Summary by Department
  markdown += `## 📊 Department Summary\n\n`;
  const departmentCounts = {};
  teachers.forEach(teacher => {
    departmentCounts[teacher.subject] = (departmentCounts[teacher.subject] || 0) + 1;
  });
  
  markdown += `| Department | Count | Percentage |\n`;
  markdown += `|------------|-------|------------|\n`;
  Object.entries(departmentCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([dept, count]) => {
      const percentage = ((count / teachers.length) * 100).toFixed(1);
      markdown += `| **${dept}** | ${count} | ${percentage}% |\n`;
    });
  
  markdown += `\n---\n\n`;
  
  // Management Staff (with full authorities)
  const managementStaff = teachers.filter(t => t.subject === 'Management');
  markdown += `## 👑 Management Staff (${managementStaff.length})\n\n`;
  markdown += `*Full system access and administrative privileges*\n\n`;
  
  markdown += `| ID | Name | Email | Phone | Password | Employment Date | Absence Days |\n`;
  markdown += `|----|------|-------|-------|----------|-----------------|-------------|\n`;
  managementStaff.forEach(teacher => {
    markdown += `| \`${teacher.id.slice(0, 8)}...\` | **${teacher.name}** | ${teacher.email} | ${teacher.phone} | \`${teacher.plainPassword}\` | ${teacher.employmentDate} | ${teacher.allowedAbsenceDays} |\n`;
  });
  
  markdown += `\n---\n\n`;
  
  // Academic Staff by Subject
  const academicSubjects = ['Quran', 'Arabic', 'English', 'Math', 'Science', 'Programming', 'Art', 'Social Studies'];
  academicSubjects.forEach(subject => {
    const subjectTeachers = teachers.filter(t => t.subject === subject);
    if (subjectTeachers.length > 0) {
      markdown += `## 📚 ${subject} Teachers (${subjectTeachers.length})\n\n`;
      
      markdown += `| ID | Name | Email | Phone | Password | Work Type | Employment Date | Absence Days |\n`;
      markdown += `|----|------|-------|-------|----------|-----------|-----------------|-------------|\n`;
      subjectTeachers.forEach(teacher => {
        markdown += `| \`${teacher.id.slice(0, 8)}...\` | **${teacher.name}** | ${teacher.email} | ${teacher.phone} | \`${teacher.plainPassword}\` | ${teacher.workType} | ${teacher.employmentDate} | ${teacher.allowedAbsenceDays} |\n`;
      });
      
      markdown += `\n`;
    }
  });
  
  markdown += `---\n\n`;
  
  // Support Staff
  const supportSubjects = ['Physical Education', 'Scouting', 'Class Teacher', 'General Support', 'Childcare', 'Canteen', 'Security'];
  const supportStaff = teachers.filter(t => supportSubjects.includes(t.subject));
  if (supportStaff.length > 0) {
    markdown += `## 🤝 Support Staff (${supportStaff.length})\n\n`;
    
    markdown += `| ID | Name | Department | Email | Phone | Password | Work Type | Employment Date | Absence Days |\n`;
    markdown += `|----|------|------------|-------|-------|----------|-----------|-----------------|-------------|\n`;
    supportStaff.forEach(teacher => {
      markdown += `| \`${teacher.id.slice(0, 8)}...\` | **${teacher.name}** | ${teacher.subject} | ${teacher.email} | ${teacher.phone} | \`${teacher.plainPassword}\` | ${teacher.workType} | ${teacher.employmentDate} | ${teacher.allowedAbsenceDays} |\n`;
    });
    
    markdown += `\n`;
  }
  
  markdown += `---\n\n`;
  
  // Complete Employee List (Alphabetical)
  markdown += `## 📋 Complete Employee Directory (Alphabetical)\n\n`;
  markdown += `*All employees sorted by name*\n\n`;
  
  const sortedTeachers = [...teachers].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  
  markdown += `| # | Name | Department | Email | Phone | Password | Age | Employment Date | Authorities |\n`;
  markdown += `|---|------|------------|-------|-------|----------|-----|-----------------|-------------|\n`;
  sortedTeachers.forEach((teacher, index) => {
    const authorities = teacher.authorities.includes('None') ? 'None' : teacher.authorities.length + ' permissions';
    markdown += `| ${index + 1} | **${teacher.name}** | ${teacher.subject} | ${teacher.email} | ${teacher.phone} | \`${teacher.plainPassword}\` | ${teacher.age} | ${teacher.employmentDate} | ${authorities} |\n`;
  });
  
  markdown += `\n---\n\n`;
  
  // Quick Reference
  markdown += `## 🔑 Quick Reference\n\n`;
  markdown += `### Default Login Credentials\n`;
  markdown += `- **Management Staff**: Use any management email + their individual password\n`;
  markdown += `- **Teachers**: Use their school email + their individual password\n\n`;
  
  markdown += `### Authority Levels\n`;
  markdown += `- **Management**: Full access to all features\n`;
  markdown += `- **Academic Staff**: Limited teacher portal access\n`;
  markdown += `- **Support Staff**: Basic portal access\n\n`;
  
  markdown += `### Contact Information\n`;
  markdown += `- All phone numbers are formatted for Saudi Arabia (+966)\n`;
  markdown += `- Email addresses are either provided or auto-generated\n`;
  markdown += `- Employment dates range from 2020-2024\n`;
  markdown += `- Allowed absence days: 15-25 per employee\n\n`;
  
  markdown += `---\n\n`;
  markdown += `*This document is auto-generated from the live database. Update using the import scripts.*\n`;
  
  return markdown;
}

async function enhanceEmployeeData() {
  try {
    console.log('🔐 Enhancing employee data with random passwords...');
    
    // Read current teachers data
    const teachersPath = path.join(__dirname, '../data/teachers.json');
    const teachers = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
    
    console.log(`📊 Processing ${teachers.length} employees...`);
    
    // Create backup
    const backupPath = path.join(__dirname, '../data/teachers_backup_enhanced.json');
    fs.writeFileSync(backupPath, JSON.stringify(teachers, null, 2));
    console.log('💾 Created backup of current data');
    
    // Update each teacher with new random password
    const updatedTeachers = [];
    
    for (const teacher of teachers) {
      const newPassword = generateRandomPassword();
      const hashedPassword = await hashPassword(newPassword);
      
      const updatedTeacher = {
        ...teacher,
        password: hashedPassword,
        plainPassword: newPassword,
        updatedAt: new Date().toISOString()
      };
      
      updatedTeachers.push(updatedTeacher);
    }
    
    // Write updated data
    fs.writeFileSync(teachersPath, JSON.stringify(updatedTeachers, null, 2));
    console.log('✅ Updated all passwords successfully');
    
    // Generate documentation
    console.log('📝 Generating comprehensive documentation...');
    const documentation = generateDocumentation(updatedTeachers);
    
    const docsDir = path.join(__dirname, '../../docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    const docPath = path.join(docsDir, 'EMPLOYEE_DATABASE.md');
    fs.writeFileSync(docPath, documentation);
    console.log('📄 Documentation created:', docPath);
    
    // Also create a simple CSV for quick reference
    const csvPath = path.join(docsDir, 'employee_credentials.csv');
    let csvContent = 'Name,Email,Password,Department,Phone,Employment Date,Authorities\n';
    updatedTeachers.forEach(teacher => {
      const authorities = teacher.authorities.includes('None') ? 'None' : teacher.authorities.join('; ');
      csvContent += `"${teacher.name}","${teacher.email}","${teacher.plainPassword}","${teacher.subject}","${teacher.phone}","${teacher.employmentDate}","${authorities}"\n`;
    });
    fs.writeFileSync(csvPath, csvContent);
    console.log('📊 CSV credentials file created:', csvPath);
    
    console.log('\n🎉 Enhancement completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • ${updatedTeachers.length} employees updated with random passwords`);
    console.log(`   • Documentation created: docs/EMPLOYEE_DATABASE.md`);
    console.log(`   • CSV file created: docs/employee_credentials.csv`);
    console.log(`   • Backup created: teachers_backup_enhanced.json`);
    
    // Show sample passwords
    console.log('\n🔑 Sample passwords generated:');
    updatedTeachers.slice(0, 5).forEach(teacher => {
      console.log(`   • ${teacher.name}: ${teacher.plainPassword}`);
    });
    console.log('   • ... and more in the documentation files');
    
  } catch (error) {
    console.error('❌ Error enhancing data:', error);
  }
}

// Run if called directly
if (require.main === module) {
  enhanceEmployeeData();
}

module.exports = { enhanceEmployeeData }; 