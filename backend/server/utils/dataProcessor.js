const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { addMonths, format, parseISO, subDays, addDays } = require('date-fns');
const { Teacher, AttendanceRecord, Request, Department, REQUEST_TYPES, WORK_TYPES, REQUEST_STATUS } = require('../models');

class DataProcessor {
  constructor() {
    this.dataPath = path.join(__dirname, '..', 'data');
    this.teachers = [];
    this.attendance = [];
    this.requests = [];
    this.departments = [];
    
    // Ensure data directory exists
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  // Parse CSV data and create structured data
  parseCSVData(csvContent) {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    
    console.log('📊 Processing CSV data...');
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const teacherData = {};
      
      headers.forEach((header, index) => {
        teacherData[header.trim()] = values[index]?.trim();
      });
      
      this.processTeacherData(teacherData);
    }
    
    this.generateDepartments();
    this.generateRequests();
    this.saveAllData();
    
    console.log('✅ Data processing completed');
    console.log(`👥 Teachers: ${this.teachers.length}`);
    console.log(`📈 Attendance records: ${this.attendance.length}`);
    console.log(`📝 Requests: ${this.requests.length}`);
    console.log(`🏢 Departments: ${this.departments.length}`);
  }

  processTeacherData(data) {
    // Parse dates and create teacher
    const birthdate = this.parseDate(data.Birthdate);
    const joinDate = this.parseDate(data.Date);
    
    const teacher = new Teacher({
      id: uuidv4(),
      name: data.Teacher,
      department: data.Department,
      workType: data['Work Type'],
      joinDate: joinDate,
      birthdate: birthdate
    });

    this.teachers.push(teacher);

    // Create attendance records for April, May, June 2024
    const months = [
      { month: 'April', year: 2024, totalDays: 22 },
      { month: 'May', year: 2024, totalDays: 22 },
      { month: 'June', year: 2024, totalDays: 22 }
    ];

    months.forEach(({ month, year, totalDays }) => {
      // Calculate working days based on work type
      const workingDays = data['Work Type'] === 'Full-time' ? totalDays : Math.floor(totalDays / 2);
      
      // Parse attendance data
      const attendanceData = this.parseAttendanceString(data.Attendance);
      const attendedDays = Math.min(attendanceData.attended, workingDays);
      
      const attendance = new AttendanceRecord({
        teacherId: teacher.id,
        month: month,
        year: year,
        totalWorkingDays: workingDays,
        attendedDays: attendedDays,
        permittedLeaves: parseInt(data['Permitted Leaves']) || 0,
        unpermittedLeaves: parseInt(data['Unpermitted Leaves']) || 0,
        authorizedAbsence: parseInt(data['Authorized Absence']) || 0,
        unauthorizedAbsence: parseInt(data['Unauthorized Absence']) || 0,
        lateHours: parseInt(data['Late Hours']) || 0,
        overtimeHours: parseInt(data['Overtime Hours']) || 0
      });

      this.attendance.push(attendance);
    });
  }

  parseDate(dateString) {
    if (!dateString) return new Date().toISOString();
    
    // Handle DD/MM or DD/MM/YYYY format
    const parts = dateString.split('/');
    if (parts.length === 2) {
      // DD/MM format - assume current year
      return new Date(2024, parseInt(parts[1]) - 1, parseInt(parts[0])).toISOString();
    } else if (parts.length === 3) {
      // DD/MM/YYYY format
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).toISOString();
    }
    
    return new Date().toISOString();
  }

  parseAttendanceString(attendanceStr) {
    if (!attendanceStr) return { attended: 0, total: 22 };
    
    const parts = attendanceStr.split('/');
    return {
      attended: parseInt(parts[0]) || 0,
      total: parseInt(parts[1]) || 22
    };
  }

  generateDepartments() {
    const departmentNames = [
      { name: 'Management', arabic: 'الإدارة' },
      { name: 'Quran', arabic: 'القرآن الكريم' },
      { name: 'Arabic', arabic: 'اللغة العربية' },
      { name: 'Math', arabic: 'الرياضيات' },
      { name: 'English', arabic: 'اللغة الإنجليزية' },
      { name: 'Science', arabic: 'العلوم' },
      { name: 'Art', arabic: 'الفنون' },
      { name: 'Programming', arabic: 'البرمجة' },
      { name: 'Social studies', arabic: 'الدراسات الاجتماعية' },
      { name: 'Fitness', arabic: 'التربية البدنية' },
      { name: 'Scouting', arabic: 'الكشافة' },
      { name: 'Nanny', arabic: 'رعاية الأطفال' }
    ];

    departmentNames.forEach(dept => {
      const teacherCount = this.teachers.filter(t => t.department === dept.name).length;
      const headTeacher = this.teachers.find(t => t.department === dept.name && t.workType === 'Full-time');
      
      const department = new Department({
        name: dept.name,
        arabicName: dept.arabic,
        description: `${dept.name} Department - Excellence in ${dept.name.toLowerCase()} education`,
        headOfDepartment: headTeacher ? headTeacher.id : null,
        teacherCount: teacherCount
      });

      this.departments.push(department);
    });
  }

  generateRequests() {
    const requestTypes = Object.values(REQUEST_TYPES);
    const statuses = Object.values(REQUEST_STATUS);
    
    // Generate realistic requests for each teacher
    this.teachers.forEach(teacher => {
      const numRequests = Math.floor(Math.random() * 5) + 2; // 2-6 requests per teacher
      
      for (let i = 0; i < numRequests; i++) {
        const requestType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const date = this.generateRandomDate();
        
        const request = new Request({
          teacherId: teacher.id,
          type: requestType.key,
          date: date,
          hours: ['OVERTIME', 'LATE_IN'].includes(requestType.key) ? Math.floor(Math.random() * 8) + 1 : null,
          days: ['PERMITTED_LEAVES', 'UNPERMITTED_LEAVES', 'AUTHORIZED_ABSENCE', 'UNAUTHORIZED_ABSENCE'].includes(requestType.key) ? Math.floor(Math.random() * 3) + 1 : null,
          reason: this.generateRequestReason(requestType.key),
          status: status,
          approvedBy: status !== REQUEST_STATUS.PENDING ? 'manager-001' : null,
          approvedDate: status !== REQUEST_STATUS.PENDING ? addDays(parseISO(date), Math.floor(Math.random() * 3) + 1).toISOString() : null
        });

        this.requests.push(request);
      }
    });
  }

  generateRandomDate() {
    const startDate = new Date(2024, 3, 1); // April 1, 2024
    const endDate = new Date(2024, 5, 30); // June 30, 2024
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    return new Date(randomTime).toISOString();
  }

  generateRequestReason(requestType) {
    const reasons = {
      PERMITTED_LEAVES: [
        'Annual vacation',
        'Family vacation',
        'Personal matters',
        'Medical appointment',
        'Wedding attendance'
      ],
      UNPERMITTED_LEAVES: [
        'Emergency leave',
        'Sick leave',
        'Family emergency',
        'Transportation issues'
      ],
      AUTHORIZED_ABSENCE: [
        'Professional development',
        'Training course',
        'Conference attendance',
        'Educational seminar'
      ],
      UNAUTHORIZED_ABSENCE: [
        'Personal reasons',
        'Health issues',
        'Family matters'
      ],
      OVERTIME: [
        'Extra classes',
        'Exam preparation',
        'Administrative work',
        'Student activities',
        'Special projects'
      ],
      LATE_IN: [
        'Traffic delay',
        'Transportation issues',
        'Personal matters',
        'Weather conditions'
      ]
    };

    const typeReasons = reasons[requestType] || ['General request'];
    return typeReasons[Math.floor(Math.random() * typeReasons.length)];
  }

  saveAllData() {
    // Save teachers
    fs.writeFileSync(
      path.join(this.dataPath, 'teachers.json'),
      JSON.stringify(this.teachers.map(t => t.toJSON()), null, 2)
    );

    // Save attendance
    fs.writeFileSync(
      path.join(this.dataPath, 'attendance.json'),
      JSON.stringify(this.attendance.map(a => a.toJSON()), null, 2)
    );

    // Save requests
    fs.writeFileSync(
      path.join(this.dataPath, 'requests.json'),
      JSON.stringify(this.requests.map(r => r.toJSON()), null, 2)
    );

    // Save departments
    fs.writeFileSync(
      path.join(this.dataPath, 'departments.json'),
      JSON.stringify(this.departments.map(d => d.toJSON()), null, 2)
    );

    console.log('💾 All data saved to JSON files');
  }

  // Load existing data
  loadData() {
    try {
      const teachersData = JSON.parse(fs.readFileSync(path.join(this.dataPath, 'teachers.json'), 'utf8'));
      const attendanceData = JSON.parse(fs.readFileSync(path.join(this.dataPath, 'attendance.json'), 'utf8'));
      const requestsData = JSON.parse(fs.readFileSync(path.join(this.dataPath, 'requests.json'), 'utf8'));
      const departmentsData = JSON.parse(fs.readFileSync(path.join(this.dataPath, 'departments.json'), 'utf8'));

      return {
        teachers: teachersData,
        attendance: attendanceData,
        requests: requestsData,
        departments: departmentsData
      };
    } catch (error) {
      console.log('⚠️  No existing data found, will create new data');
      return null;
    }
  }
}

module.exports = DataProcessor; 