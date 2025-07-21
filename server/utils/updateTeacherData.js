const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { parseISO, addDays, startOfMonth, addMonths } = require('date-fns');

// Read the CSV data
const csvData = `Teacher,Subject,Work Type,Date,Birthdate,Email,Attendance,Permitted Leaves,Unpermitted Leaves,Authorized Absence,Unauthorized Absence,Late Hours,Overtime Hours,Total Hours
teacher1-Management,Management,Full-time,05/04,15/03/1985,teacher1.management@school.edu,19/22,2,0,1,0,4,6,158
teacher2-Management,Management,Part-time,12/04,22/07/1990,teacher2.management@school.edu,20/22,1,1,0,0,2,0,158
teacher1-Quran,Quran,Full-time,18/04,08/11/1982,teacher1.quran@school.edu,17/22,3,0,1,1,6,9,145
teacher2-Quran,Quran,Part-time,25/04,14/05/1988,teacher2.quran@school.edu,18/22,2,1,1,0,0,12,156
teacher1-Arabic,Arabic,Full-time,02/05,03/09/1980,teacher1.arabic@school.edu,16/22,4,1,0,1,8,0,120
teacher2-Arabic,Arabic,Part-time,09/05,29/01/1992,teacher2.arabic@school.edu,21/22,1,0,0,0,3,15,180
teacher1-Math,Math,Full-time,16/05,11/12/1984,teacher1.math@school.edu,15/22,5,1,1,0,10,6,122
teacher2-Math,Math,Part-time,23/05,07/06/1991,teacher2.math@school.edu,19/22,2,0,0,1,0,9,161
teacher1-English,English,Full-time,30/05,25/04/1983,teacher1.english@school.edu,18/22,3,1,0,0,4,12,152
teacher2-English,English,Part-time,06/06,18/10/1989,teacher2.english@school.edu,17/22,4,0,1,0,6,3,142
teacher1-Science,Science,Full-time,13/06,02/08/1981,teacher1.science@school.edu,20/22,1,0,1,0,2,18,178
teacher2-Science,Science,Part-time,20/06,13/02/1993,teacher2.science@school.edu,16/22,3,2,1,0,8,0,120
teacher1-Art,Art,Full-time,27/06,09/07/1987,teacher1.art@school.edu,14/22,6,1,0,1,12,9,123
teacher2-Art,Art,Part-time,03/04,21/11/1994,teacher2.art@school.edu,22/22,0,0,0,0,0,21,197
teacher1-Programming,Programming,Full-time,10/04,16/01/1986,teacher1.programming@school.edu,13/22,7,1,1,0,14,15,125
teacher2-Programming,Programming,Part-time,17/04,04/03/1995,teacher2.programming@school.edu,19/22,2,1,0,0,5,6,157
teacher1-Social studies,Social studies,Full-time,24/04,27/09/1979,teacher1.socialstudies@school.edu,21/22,1,0,0,0,1,24,191
teacher2-Social studies,Social studies,Part-time,01/05,12/12/1996,teacher2.socialstudies@school.edu,15/22,5,1,0,1,9,0,111
teacher1-Fitness,Fitness,Full-time,08/05,05/05/1978,teacher1.fitness@school.edu,12/22,8,1,1,0,16,12,112
teacher2-Fitness,Fitness,Part-time,15/05,30/08/1997,teacher2.fitness@school.edu,18/22,3,0,1,0,7,18,157
teacher1-Scouting,Scouting,Full-time,22/05,19/06/1977,teacher1.scouting@school.edu,11/22,9,1,0,1,18,6,96
teacher2-Scouting,Scouting,Part-time,29/05,23/04/1998,teacher2.scouting@school.edu,20/22,1,0,1,0,3,27,186
teacher1-Nanny,Nanny,Full-time,05/06,10/10/1976,teacher1.nanny@school.edu,10/22,10,1,1,0,20,3,83
teacher2-Nanny,Nanny,Part-time,12/06,06/07/1999,teacher2.nanny@school.edu,17/22,4,1,0,0,11,0,125`;

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

function processCSVData() {
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
const { teachers, attendance, requests } = processCSVData();

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