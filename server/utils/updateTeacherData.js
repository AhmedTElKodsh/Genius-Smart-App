const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { parseISO, addDays, startOfMonth, addMonths } = require('date-fns');
const bcrypt = require('bcrypt');

// Read the CSV data from the actual file
function readCSVFile() {
  const csvFilePath = path.join(__dirname, '../../teacher_data_csv.txt');
  return fs.readFileSync(csvFilePath, 'utf8');
}

function parseDate(dateStr) {
  // Parse DD/MM format and add current year
  const [day, month] = dateStr.split('/');
  const currentYear = new Date().getFullYear();
  return new Date(currentYear, parseInt(month) - 1, parseInt(day));
}

function parseBirthdate(dateStr) {
  // Parse DD/MM/YYYY format
  const [day, month, year] = dateStr.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

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

function generatePhoneNumber() {
  const prefix = '+966 5';
  const number = Math.floor(Math.random() * 90000000) + 10000000;
  return `${prefix}${number}`;
}

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function processCSVData() {
  const csvData = readCSVFile();
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  const teachers = [];
  const attendance = [];
  const requests = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const data = {};
    
    headers.forEach((header, index) => {
      data[header.trim()] = values[index]?.trim();
    });

    // Process teacher
    const teacherId = uuidv4();
    const birthdate = parseBirthdate(data.Birthdate);
    const joinDate = parseDate(data.Date);
    
    // Hash the password
    const hashedPassword = await hashPassword(data.Password);
    
    const teacher = {
      id: teacherId,
      name: data.Teacher,
      subject: data.Subject,
      workType: data['Work Type'],
      joinDate: joinDate.toISOString(),
      birthdate: birthdate.toISOString(),
      age: calculateAge(birthdate),
      email: data.Email,
      phone: generatePhoneNumber(),
      password: hashedPassword,
      plainPassword: data.Password, // Store for reference (remove in production)
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    teachers.push(teacher);

    // Generate attendance records for the last 3 months
    const startDate = startOfMonth(addMonths(new Date(), -2));
    const endDate = new Date();
    
    const attendanceStats = data.Attendance.split('/');
    const presentDays = parseInt(attendanceStats[0]);
    const totalDays = parseInt(attendanceStats[1]);
    const absentDays = totalDays - presentDays;

    // Generate attendance records
    for (let d = new Date(startDate); d <= endDate; d = addDays(d, 1)) {
      // Skip weekends (Friday = 5, Saturday = 6)
      if (d.getDay() === 5 || d.getDay() === 6) continue;

      const isPresent = Math.random() < (presentDays / totalDays);
      const arrivalTime = isPresent ? new Date(d.setHours(7 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))) : null;
      const departureTime = isPresent ? new Date(d.setHours(14 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60))) : null;

      attendance.push({
        id: uuidv4(),
        teacherId: teacherId,
        date: new Date(d).toISOString().split('T')[0],
        status: isPresent ? 'PRESENT' : (Math.random() > 0.5 ? 'ABSENT' : 'LATE'),
        arrivalTime: arrivalTime ? arrivalTime.toISOString() : null,
        departureTime: departureTime ? departureTime.toISOString() : null,
        workingHours: isPresent ? Math.floor(Math.random() * 3) + 6 : 0,
        overtimeHours: isPresent ? Math.floor(Math.random() * 3) : 0,
        lateMinutes: !isPresent && Math.random() > 0.5 ? Math.floor(Math.random() * 60) + 15 : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Generate requests based on CSV data
    const requestTypes = ['PERMITTED_LEAVES', 'UNPERMITTED_LEAVES', 'AUTHORIZED_ABSENCE', 'UNAUTHORIZED_ABSENCE'];
    const requestValues = [
      parseInt(data['Permitted Leaves']),
      parseInt(data['Unpermitted Leaves']),
      parseInt(data['Authorized Absence']),
      parseInt(data['Unauthorized Absence'])
    ];

    requestTypes.forEach((type, index) => {
      const count = requestValues[index];
      for (let r = 0; r < count; r++) {
        const requestDate = new Date(startDate);
        requestDate.setDate(requestDate.getDate() + Math.floor(Math.random() * 90));

        requests.push({
          id: uuidv4(),
          teacherId: teacherId,
          type: type,
          subject: `${type.toLowerCase().replace('_', ' ')} request`,
          description: `Request for ${type.toLowerCase().replace('_', ' ')} from ${teacher.name}`,
          startDate: requestDate.toISOString().split('T')[0],
          endDate: addDays(requestDate, Math.floor(Math.random() * 3) + 1).toISOString().split('T')[0],
          status: type.includes('UNPERMITTED') || type.includes('UNAUTHORIZED') ? 'REJECTED' : 'APPROVED',
          submittedAt: requestDate.toISOString(),
          respondedAt: addDays(requestDate, 1).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });
  }

  return { teachers, attendance, requests };
}

// Process and save data
async function updateDatabase() {
  try {
    console.log('🔄 Processing teacher data with passwords...');
    const { teachers, attendance, requests } = await processCSVData();

    // Save to files
    const dataPath = path.join(__dirname, '..', 'data');

    fs.writeFileSync(
      path.join(dataPath, 'teachers.json'),
      JSON.stringify(teachers, null, 2)
    );

    fs.writeFileSync(
      path.join(dataPath, 'attendance.json'),
      JSON.stringify(attendance, null, 2)
    );

    fs.writeFileSync(
      path.join(dataPath, 'requests.json'),
      JSON.stringify(requests, null, 2)
    );

    console.log('✅ Teacher data updated successfully!');
    console.log(`📊 Generated: ${teachers.length} teachers, ${attendance.length} attendance records, ${requests.length} requests`);
    
    // Display sample passwords for verification
    console.log('\n🔐 Sample teacher credentials:');
    teachers.slice(0, 5).forEach(teacher => {
      console.log(`   ${teacher.name}: ${teacher.email} | Password: ${teacher.plainPassword}`);
    });
    
    console.log('\n⚠️  NOTE: Plain passwords are stored temporarily for reference. Remove in production!');
  } catch (error) {
    console.error('❌ Error updating teacher database:', error);
  }
}

// Run the update
updateDatabase(); 