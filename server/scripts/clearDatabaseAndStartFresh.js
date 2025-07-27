const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

async function clearDatabaseAndStartFresh() {
  try {
    console.log('🧹 Starting database cleanup and fresh setup...');
    
    const dataDir = path.join(__dirname, '../data');
    
    // Create backup of current state
    const backupDir = path.join(__dirname, '../data/backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    console.log('💾 Creating backup of current data...');
    
    // Backup key files
    const filesToBackup = ['attendance.json', 'requests.json', 'all_requests.json', 'managers.json'];
    filesToBackup.forEach(file => {
      const sourcePath = path.join(dataDir, file);
      const backupPath = path.join(backupDir, `${timestamp}_${file}`);
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, backupPath);
        console.log(`   ✅ Backed up ${file}`);
      }
    });
    
    // Load real teachers data
    console.log('📊 Loading real employee data...');
    const teachersPath = path.join(dataDir, 'teachers.json');
    const teachers = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
    console.log(`   📋 Found ${teachers.length} real employees`);
    
    // Extract management staff
    const managementStaff = teachers.filter(teacher => teacher.subject === 'Management');
    console.log(`   👑 Found ${managementStaff.length} management staff`);
    
    // 1. Clear and create fresh attendance.json
    console.log('🗑️ Clearing attendance data...');
    const attendancePath = path.join(dataDir, 'attendance.json');
    fs.writeFileSync(attendancePath, JSON.stringify([], null, 2));
    console.log('   ✅ Attendance data cleared (empty array)');
    
    // 2. Clear and create fresh requests.json
    console.log('🗑️ Clearing requests data...');
    const requestsPath = path.join(dataDir, 'requests.json');
    fs.writeFileSync(requestsPath, JSON.stringify([], null, 2));
    console.log('   ✅ Requests data cleared (empty array)');
    
    // 3. Clear and create fresh all_requests.json
    const allRequestsPath = path.join(dataDir, 'all_requests.json');
    fs.writeFileSync(allRequestsPath, JSON.stringify([], null, 2));
    console.log('   ✅ All requests data cleared (empty array)');
    
    // 4. Create fresh managers.json from real management staff
    console.log('👑 Creating managers data from real management staff...');
    const managers = managementStaff.map((manager, index) => ({
      id: `MGR_${manager.id.slice(0, 8)}`,
      email: manager.email,
      password: manager.password, // Use the real hashed password
      plainPassword: manager.plainPassword, // For reference
      name: manager.name,
      nameArabic: manager.name, // Same as name since it's already in Arabic
      role: "Manager",
      department: "Management",
      managerLevel: index === 0 ? "admin" : "manager", // First one is admin
      authorities: manager.authorities.includes('Access Manager Portal') ? {
        canAccessPortal: true,
        canAddTeachers: manager.authorities.includes('Add new teachers'),
        canEditTeachers: manager.authorities.includes('Edit Existing Teachers'),
        canManageRequests: manager.authorities.includes('Accept and Reject Requests'),
        canDownloadReports: manager.authorities.includes('Download Reports'),
        canManageAuthorities: index === 0 // Only admin can manage authorities
      } : {
        canAccessPortal: false,
        canAddTeachers: false,
        canEditTeachers: false,
        canManageRequests: false,
        canDownloadReports: false,
        canManageAuthorities: false
      },
      phone: manager.phone,
      employmentDate: manager.employmentDate,
      createdAt: manager.createdAt.split('T')[0],
      lastLogin: null,
      status: "Active"
    }));
    
    const managersPath = path.join(dataDir, 'managers.json');
    fs.writeFileSync(managersPath, JSON.stringify(managers, null, 2));
    console.log(`   ✅ Created ${managers.length} real managers`);
    
    // 5. Update manager.json (single manager profile) with first admin
    console.log('👤 Updating single manager profile...');
    const singleManager = {
      id: managers[0].id,
      email: managers[0].email,
      name: managers[0].name,
      nameArabic: managers[0].nameArabic,
      role: managers[0].role,
      department: managers[0].department,
      authorities: managers[0].authorities,
      lastLogin: null,
      createdAt: managers[0].createdAt,
      phone: managers[0].phone
    };
    
    const singleManagerPath = path.join(dataDir, 'manager.json');
    fs.writeFileSync(singleManagerPath, JSON.stringify(singleManager, null, 2));
    console.log('   ✅ Updated single manager profile');
    
    // 6. Verify departments.json is correct
    console.log('🏢 Verifying departments data...');
    const departmentsPath = path.join(dataDir, 'departments.json');
    if (fs.existsSync(departmentsPath)) {
      const departments = JSON.parse(fs.readFileSync(departmentsPath, 'utf8'));
      console.log(`   ✅ Departments file exists with ${departments.length} departments`);
    } else {
      console.log('   ⚠️ Departments file not found - will create basic structure');
      const basicDepartments = [
        { id: 1, name: "Management", teacherCount: managementStaff.length },
        { id: 2, name: "Academic", teacherCount: teachers.filter(t => !['Management', 'Security', 'Canteen', 'Childcare', 'General Support'].includes(t.subject)).length },
        { id: 3, name: "Support", teacherCount: teachers.filter(t => ['Security', 'Canteen', 'Childcare', 'General Support'].includes(t.subject)).length }
      ];
      fs.writeFileSync(departmentsPath, JSON.stringify(basicDepartments, null, 2));
      console.log('   ✅ Created basic departments structure');
    }
    
    console.log('\n🎉 Database cleanup and fresh setup completed!');
    console.log('\n📋 Summary:');
    console.log(`   • ${teachers.length} real employees (kept from Google Sheets import)`);
    console.log(`   • ${managers.length} real managers (created from management staff)`);
    console.log(`   • 0 attendance records (fresh start)`);
    console.log(`   • 0 requests (fresh start)`);
    console.log(`   • Backups created in: ${backupDir}`);
    
    console.log('\n🔑 Manager Login Credentials:');
    managers.forEach((manager, index) => {
      console.log(`   ${index + 1}. ${manager.name}`);
      console.log(`      Email: ${manager.email}`);
      console.log(`      Password: ${manager.plainPassword}`);
      console.log(`      Level: ${manager.managerLevel}`);
    });
    
    return {
      teachersCount: teachers.length,
      managersCount: managers.length,
      attendanceRecords: 0,
      requestsCount: 0,
      backupLocation: backupDir
    };
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    throw error;
  }
}

// Optional: Generate minimal test data for verification
async function generateMinimalTestData() {
  try {
    console.log('\n🔬 Generating minimal test data for verification...');
    
    const dataDir = path.join(__dirname, '../data');
    const teachersPath = path.join(dataDir, 'teachers.json');
    const teachers = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
    
    // Generate 5 sample attendance records (current week)
    const attendanceRecords = [];
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const teacher = teachers[i % teachers.length];
      
      const record = {
        id: uuidv4(),
        teacherId: teacher.id,
        name: teacher.name,
        date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        dateISO: date.toISOString().split('T')[0],
        attendance: "Present",
        checkIn: "08:00 AM",
        checkOut: "04:00 PM",
        totalHours: 8.0,
        overtime: 0,
        lateArrival: 0,
        earlyLeave: 0,
        subject: teacher.subject,
        workType: teacher.workType,
        permittedLeaves: "",
        authorizedAbsence: "",
        notes: `Test attendance record for ${teacher.name}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      attendanceRecords.push(record);
    }
    
    // Generate 3 sample requests
    const requestsRecords = [];
    for (let i = 0; i < 3; i++) {
      const teacher = teachers[i];
      const request = {
        id: uuidv4(),
        teacherId: teacher.id,
        name: teacher.name,
        requestType: i === 0 ? "Early Leave" : i === 1 ? "Late Arrival" : "Absence",
        duration: today.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        appliedDate: today.toISOString().split('T')[0],
        reason: "Test request for verification",
        result: i === 0 ? "Approved" : i === 1 ? "Pending" : "Rejected",
        createdAt: new Date().toISOString(),
        subject: teacher.subject,
        workType: teacher.workType
      };
      
      requestsRecords.push(request);
    }
    
    // Save test data
    const attendancePath = path.join(dataDir, 'attendance.json');
    fs.writeFileSync(attendancePath, JSON.stringify(attendanceRecords, null, 2));
    
    const requestsPath = path.join(dataDir, 'requests.json');
    fs.writeFileSync(requestsPath, JSON.stringify(requestsRecords, null, 2));
    
    const allRequestsPath = path.join(dataDir, 'all_requests.json');
    fs.writeFileSync(allRequestsPath, JSON.stringify(requestsRecords, null, 2));
    
    console.log(`   ✅ Generated ${attendanceRecords.length} test attendance records`);
    console.log(`   ✅ Generated ${requestsRecords.length} test requests`);
    console.log('   🔬 Test data ready for verification');
    
    return {
      attendanceRecords: attendanceRecords.length,
      requestsRecords: requestsRecords.length
    };
    
  } catch (error) {
    console.error('❌ Error generating test data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const includeTestData = args.includes('--test-data');
  
  clearDatabaseAndStartFresh()
    .then(result => {
      if (includeTestData) {
        return generateMinimalTestData().then(testResult => ({
          ...result,
          testData: testResult
        }));
      }
      return result;
    })
    .then(result => {
      console.log('\n✨ Database is now ready with real employee data and fresh records!');
      if (result.testData) {
        console.log('🔬 Test data included for verification');
      } else {
        console.log('💡 Tip: Run with --test-data flag to include minimal test data for verification');
      }
    })
    .catch(error => {
      console.error('❌ Failed to complete database setup:', error);
      process.exit(1);
    });
}

module.exports = { clearDatabaseAndStartFresh, generateMinimalTestData }; 