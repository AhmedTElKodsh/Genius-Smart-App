const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

// Mapping from Google Sheets subjects to standardized subjects
const subjectMapping = {
  'Management': 'Management',
  'Quraan': 'Quran',
  'Arabic': 'Arabic',
  'English': 'English', 
  'Math': 'Math',
  'Science': 'Science',
  'Art': 'Art',
  'Programming': 'Programming',
  'Fitness': 'Physical Education',
  'Scouting': 'Scouting',
  'Class Teacher': 'Class Teacher',
  'Social Studies': 'Social Studies', 
  'Joker': 'General Support',
  'Nanny': 'Childcare',
  'Canteen': 'Canteen',
  'Security': 'Security'
};

// Generate random but realistic birthdates
function generateBirthdate() {
  const startYear = 1970;
  const endYear = 2000;
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// Calculate age from birthdate
function calculateAge(birthdate) {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Generate employment date (random date in the past 1-5 years)
function generateEmploymentDate() {
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 5, 0, 1);
  const maxDate = new Date(today.getFullYear() - 1, 11, 31);
  const randomTime = minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
}

// Clean and format phone number
function formatPhoneNumber(phone) {
  if (!phone || phone === '') return '+966500000000';
  
  // Remove spaces and non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +966, add it
  if (!cleaned.startsWith('+966')) {
    if (cleaned.startsWith('966')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('1') || cleaned.startsWith('5')) {
      cleaned = '+966' + cleaned;
    } else {
      cleaned = '+966' + cleaned;
    }
  }
  
  return cleaned;
}

// Clean and format email
function formatEmail(email, name) {
  if (!email || email === '' || email.includes(' ')) {
    // Generate email from name
    const cleanName = name.replace(/\s+/g, '.').toLowerCase();
    return `${cleanName}@school.edu`;
  }
  return email.toLowerCase().trim();
}

// Generate password
async function generateHashedPassword() {
  const defaultPassword = 'School123!';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  return {
    password: hashedPassword,
    plainPassword: defaultPassword
  };
}

// Parse CSV content
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
}

async function importEmployeeData() {
  try {
    console.log('🚀 Starting employee data import...');
    
    // Read CSV file
    const csvPath = path.join(__dirname, '../../real_employee_data.csv');
    if (!fs.existsSync(csvPath)) {
      console.error('❌ CSV file not found at:', csvPath);
      console.log('📋 Please download the CSV from Google Sheets and save it as "real_employee_data.csv" in the project root');
      return;
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const employeeData = parseCSV(csvContent);
    
    console.log(`📊 Found ${employeeData.length} employees in CSV`);
    
    // Backup current data
    const teachersPath = path.join(__dirname, '../data/teachers.json');
    const backupPath = path.join(__dirname, '../data/teachers_backup.json');
    
    if (fs.existsSync(teachersPath)) {
      fs.copyFileSync(teachersPath, backupPath);
      console.log('💾 Created backup of current teachers data');
    }
    
    // Convert data to our format
    const teachers = [];
    
    for (const employee of employeeData) {
      // Skip empty rows
      if (!employee['الاسم'] || employee['الاسم'] === '') continue;
      
      const birthdate = generateBirthdate();
      const age = calculateAge(birthdate);
      const passwordData = await generateHashedPassword();
      const employmentDate = generateEmploymentDate();
      
      const teacher = {
        id: uuidv4(),
        name: employee['الاسم'],
        subject: subjectMapping[employee['الوظيفة']] || employee['الوظيفة'],
        workType: ['Management', 'Security', 'Canteen'].includes(employee['الوظيفة']) ? 'Full-time' : 'Part-time',
        joinDate: new Date(employmentDate).toISOString(),
        birthdate: birthdate,
        age: age,
        email: formatEmail(employee['الايميل'], employee['الاسم']),
        phone: formatPhoneNumber(employee['رقم الموبايل']),
        password: passwordData.password,
        plainPassword: passwordData.plainPassword,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        firstName: employee['الاسم'].split(' ')[0],
        lastName: employee['الاسم'].split(' ').slice(1).join(' ') || employee['الاسم'].split(' ')[0],
        address: 'Cairo, Egypt',
        employmentDate: employmentDate,
        allowedAbsenceDays: Math.floor(Math.random() * 10) + 15, // 15-25 days
        authorities: employee['الوظيفة'] === 'Management' ? [
          'Access Manager Portal',
          'Add new teachers', 
          'Edit Existing Teachers',
          'Accept and Reject Requests',
          'Download Reports'
        ] : ['None']
      };
      
      teachers.push(teacher);
    }
    
    // Write new data
    fs.writeFileSync(teachersPath, JSON.stringify(teachers, null, 2));
    console.log(`✅ Successfully imported ${teachers.length} teachers`);
    
    // Update subjects.json to include all subjects
    const subjectsPath = path.join(__dirname, '../data/subjects.json');
    const uniqueSubjects = [...new Set(teachers.map(t => t.subject))];
    const subjects = uniqueSubjects.map((subject, index) => ({
      id: index + 1,
      name: subject,
      teacherCount: teachers.filter(t => t.subject === subject).length
    }));
    
    fs.writeFileSync(subjectsPath, JSON.stringify(subjects, null, 2));
    console.log(`📚 Updated subjects.json with ${subjects.length} subjects`);
    
    // Generate sample attendance data for real teachers
    console.log('📊 Generating sample attendance data...');
    const generateAttendanceScript = require('../utils/generateAttendanceData.js');
    
    console.log('\n🎉 Data import completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • ${teachers.length} teachers imported`);
    console.log(`   • ${subjects.length} subjects updated`);
    console.log(`   • Backup created: teachers_backup.json`);
    console.log(`   • Default password for all teachers: School123!`);
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
  }
}

// Run if called directly
if (require.main === module) {
  importEmployeeData();
}

module.exports = { importEmployeeData }; 