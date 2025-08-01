const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Helper functions
function generateRandomTime(baseHour, variance = 2) {
    const hour = Math.max(0, Math.min(23, baseHour + (Math.random() - 0.5) * variance * 2));
    const minute = Math.floor(Math.random() * 60);
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
}

function formatTime12Hour(time24) {
    const [hour, minute] = time24.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12.toString().padStart(2, '0')}:${minute} ${ampm}`;
}

function calculateHours(checkIn, checkOut) {
    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);
    
    let totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle next day checkout
    
    return Math.round((totalMinutes / 60) * 100) / 100;
}

function getRandomDate(daysBack) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    return date;
}

function formatDateISO(date) {
    return date.toISOString().split('T')[0];
}

function formatDateDisplay(date) {
    return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function generateAttendanceRecord(employee, date) {
    const attendanceTypes = ['Present', 'Completed', 'Late', 'Early Leave'];
    const attendanceType = attendanceTypes[Math.floor(Math.random() * attendanceTypes.length)];
    
    let checkInTime, checkOutTime, totalHours, lateArrival = 0, earlyLeave = 0;
    
    // Standard work hours: 8:00 AM - 4:00 PM (8 hours)
    const standardCheckIn = 8; // 8 AM
    const standardCheckOut = 16; // 4 PM
    
    switch (attendanceType) {
        case 'Present':
            checkInTime = generateRandomTime(standardCheckIn, 0.5);
            checkOutTime = generateRandomTime(standardCheckOut, 0.5);
            totalHours = calculateHours(checkInTime, checkOutTime);
            break;
            
        case 'Completed':
            checkInTime = generateRandomTime(standardCheckIn, 0.3);
            checkOutTime = generateRandomTime(standardCheckOut, 0.3);
            totalHours = calculateHours(checkInTime, checkOutTime);
            break;
            
        case 'Late':
            const lateMinutes = Math.floor(Math.random() * 120) + 30; // 30-150 minutes late
            checkInTime = generateRandomTime(standardCheckIn + (lateMinutes / 60), 0.2);
            checkOutTime = generateRandomTime(standardCheckOut, 0.5);
            totalHours = calculateHours(checkInTime, checkOutTime);
            lateArrival = Math.round((lateMinutes / 60) * 100) / 100;
            break;
            
        case 'Early Leave':
            checkInTime = generateRandomTime(standardCheckIn, 0.3);
            const earlyMinutes = Math.floor(Math.random() * 120) + 30; // Leave 30-150 minutes early
            checkOutTime = generateRandomTime(standardCheckOut - (earlyMinutes / 60), 0.2);
            totalHours = calculateHours(checkInTime, checkOutTime);
            earlyLeave = Math.round((earlyMinutes / 60) * 100) / 100;
            break;
    }
    
    const overtime = Math.max(0, totalHours - 8);
    
    return {
        id: `attendance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        teacherId: employee.id,
        name: employee.name,
        date: formatDateDisplay(date),
        dateISO: formatDateISO(date),
        attendance: attendanceType,
        checkInTime: checkInTime,
        checkOutTime: checkOutTime,
        checkIn: formatTime12Hour(checkInTime),
        checkOut: formatTime12Hour(checkOutTime),
        currentSessionCheckOut: formatTime12Hour(checkOutTime),
        totalHours: totalHours,
        overtime: overtime,
        lateArrival: lateArrival,
        earlyLeave: earlyLeave,
        subject: employee.subject,
        workType: employee.workType,
        hasPermission: lateArrival > 0 || earlyLeave > 0 ? Math.random() > 0.5 : false,
        notes: attendanceType === 'Present' ? 'Regular attendance' : 
               attendanceType === 'Late' ? 'Late arrival recorded' :
               attendanceType === 'Early Leave' ? 'Early departure recorded' : 'Day completed',
        createdAt: date.toISOString()
    };
}

function generateRequest(employee, type) {
    const statuses = ['pending', 'approved', 'rejected'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const requestDate = getRandomDate(60); // Within last 60 days
    const futureDate = new Date(requestDate);
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 1);
    
    const reasons = {
        'Absence': [
            'Medical appointment',
            'Personal emergency',
            'Family commitment',
            'Health issue',
            'Personal leave'
        ],
        'Late Arrival': [
            'Traffic delay',
            'Medical appointment',
            'Personal emergency',
            'Transportation issue',
            'Family matter'
        ],
        'Early Leave': [
            'Medical appointment',
            'Personal emergency',
            'Family commitment',
            'Official business',
            'Personal matter'
        ]
    };
    
    const reason = reasons[type][Math.floor(Math.random() * reasons[type].length)];
    
    return {
        id: uuidv4(),
        name: employee.name,
        teacherId: employee.id,
        requestType: type,
        appliedDate: formatDateISO(requestDate),
        duration: formatDateDisplay(futureDate),
        startDate: formatDateISO(futureDate),
        endDate: formatDateISO(futureDate),
        reason: reason,
        status: status,
        result: status === 'approved' ? 'Request approved' : 
                status === 'rejected' ? 'Request rejected due to insufficient justification' : '',
        submittedAt: requestDate.toISOString(),
        createdAt: requestDate.toISOString(),
        updatedAt: requestDate.toISOString(),
        subject: employee.subject
    };
}

async function generateRealAttendanceAndRequests() {
    console.log('🚀 Starting realistic attendance and requests data generation...');
    
    try {
        // Read employee data
        const teachersPath = path.join(__dirname, '../data/teachers.json');
        if (!fs.existsSync(teachersPath)) {
            throw new Error('Teachers data not found. Please run importRealEmployeeDataComplete.js first.');
        }
        
        const employees = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
        console.log(`👥 Found ${employees.length} employees`);
        
        // Generate attendance data
        const attendanceRecords = [];
        const daysToGenerate = 90; // Last 90 days
        
        console.log('📅 Generating attendance records...');
        
        for (const employee of employees) {
            // Generate 30-90% attendance rate (some days off)
            const attendanceDays = Math.floor(Math.random() * (daysToGenerate * 0.6)) + (daysToGenerate * 0.3);
            
            for (let i = 0; i < attendanceDays; i++) {
                const attendanceDate = getRandomDate(daysToGenerate);
                
                // Skip weekends (basic implementation)
                if (attendanceDate.getDay() === 5 || attendanceDate.getDay() === 6) {
                    continue;
                }
                
                // Check if already exists for this date
                const existingRecord = attendanceRecords.find(record => 
                    record.teacherId === employee.id && record.dateISO === formatDateISO(attendanceDate)
                );
                
                if (!existingRecord) {
                    attendanceRecords.push(generateAttendanceRecord(employee, attendanceDate));
                }
            }
        }
        
        console.log(`✅ Generated ${attendanceRecords.length} attendance records`);
        
        // Generate request data
        const requests = [];
        const requestTypes = ['Absence', 'Late Arrival', 'Early Leave'];
        
        console.log('📋 Generating request records...');
        
        for (const employee of employees) {
            // Each employee gets 0-8 requests randomly distributed
            const numberOfRequests = Math.floor(Math.random() * 9);
            
            for (let i = 0; i < numberOfRequests; i++) {
                const requestType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
                requests.push(generateRequest(employee, requestType));
            }
        }
        
        console.log(`✅ Generated ${requests.length} request records`);
        
        // Create backups
        const backupDir = path.join(__dirname, '../data/backups');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        const attendancePath = path.join(__dirname, '../data/attendance.json');
        const requestsPath = path.join(__dirname, '../data/requests.json');
        
        if (fs.existsSync(attendancePath)) {
            fs.copyFileSync(attendancePath, path.join(backupDir, `${timestamp}_attendance_backup.json`));
        }
        if (fs.existsSync(requestsPath)) {
            fs.copyFileSync(requestsPath, path.join(backupDir, `${timestamp}_requests_backup.json`));
        }
        
        // Save generated data
        fs.writeFileSync(attendancePath, JSON.stringify(attendanceRecords, null, 2));
        fs.writeFileSync(requestsPath, JSON.stringify(requests, null, 2));
        
        // Generate statistics
        const stats = {
            totalAttendanceRecords: attendanceRecords.length,
            totalRequests: requests.length,
            attendanceByType: {},
            requestsByType: {},
            requestsByStatus: {}
        };
        
        attendanceRecords.forEach(record => {
            stats.attendanceByType[record.attendance] = (stats.attendanceByType[record.attendance] || 0) + 1;
        });
        
        requests.forEach(request => {
            stats.requestsByType[request.requestType] = (stats.requestsByType[request.requestType] || 0) + 1;
            stats.requestsByStatus[request.status] = (stats.requestsByStatus[request.status] || 0) + 1;
        });
        
        console.log('\n📊 Generation Summary:');
        console.log(`- Total Attendance Records: ${stats.totalAttendanceRecords}`);
        console.log(`- Total Requests: ${stats.totalRequests}`);
        
        console.log('\n📈 Attendance Distribution:');
        Object.entries(stats.attendanceByType).forEach(([type, count]) => {
            console.log(`  - ${type}: ${count} records`);
        });
        
        console.log('\n📋 Request Type Distribution:');
        Object.entries(stats.requestsByType).forEach(([type, count]) => {
            console.log(`  - ${type}: ${count} requests`);
        });
        
        console.log('\n⚖️ Request Status Distribution:');
        Object.entries(stats.requestsByStatus).forEach(([status, count]) => {
            console.log(`  - ${status}: ${count} requests`);
        });
        
        console.log('\n✅ Realistic attendance and requests data generation completed!');
        console.log('📁 Files updated: attendance.json, requests.json');
        console.log('💾 Backups saved in: data/backups/');
        
        return {
            success: true,
            attendanceRecords: stats.totalAttendanceRecords,
            requests: stats.totalRequests,
            statistics: stats
        };
        
    } catch (error) {
        console.error('❌ Error generating attendance and requests data:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Run the generation if called directly
if (require.main === module) {
    generateRealAttendanceAndRequests().then(result => {
        if (result.success) {
            console.log('\n🎉 Generation process completed successfully!');
            process.exit(0);
        } else {
            console.error('\n💥 Generation process failed:', result.error);
            process.exit(1);
        }
    });
}

module.exports = { generateRealAttendanceAndRequests }; 