const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

// Read CSV data - simplified parser for the provided format
function parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index] ? values[index].trim() : '';
        });
        data.push(row);
    }
    
    return data;
}

// Generate random data helpers
function generateRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateRandomPassword() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

function generateEmploymentDate() {
    const start = new Date(2015, 0, 1); // January 1, 2015
    const end = new Date(2024, 11, 31); // December 31, 2024
    return generateRandomDate(start, end).toISOString().split('T')[0];
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

function generateBirthdate(age) {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    return `${birthYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// Role assignment based on subject
function assignRoleBasedOnSubject(subject) {
    const adminSubjects = ['Admin Management', 'Management'];
    const managerSubjects = ['KG Manager', 'Floor Admin', 'HR', 'Mentor'];
    
    if (adminSubjects.includes(subject)) {
        return {
            role: 'ADMIN',
            roleLevel: 3,
            roleName: 'Admin',
            roleNameAr: 'مدير عام',
            roleDescription: 'Full system access with ability to manage all layers and revoke actions',
            authorities: [
                'Access Manager Portal',
                'Access Teacher Portal',
                'Add new teachers',
                'Edit Existing Teachers',
                'Delete Teachers',
                'Accept and Reject All Requests',
                'Accept and Reject Manager Requests',
                'Download Reports',
                'View All Analytics',
                'Manage User Authorities',
                'View Action Audit Trail',
                'Revoke Manager Actions',
                'Promote/Demote Users',
                'System Administration'
            ],
            canAccessManagerPortal: true,
            canAccessTeacherPortal: true,
            canApproveRequests: true,
            canApproveManagerRequests: true,
            canRevokeActions: true,
            canViewAuditTrail: true
        };
    } else if (managerSubjects.includes(subject)) {
        return {
            role: 'MANAGER',
            roleLevel: 2,
            roleName: 'Manager',
            roleNameAr: 'مدير',
            roleDescription: 'Departmental management with teacher oversight capabilities',
            authorities: [
                'Access Manager Portal',
                'Access Teacher Portal',
                'Add new teachers',
                'Edit Existing Teachers',
                'Accept and Reject All Requests',
                'Download Reports',
                'View Analytics'
            ],
            canAccessManagerPortal: true,
            canAccessTeacherPortal: true,
            canApproveRequests: true,
            canApproveManagerRequests: false,
            canRevokeActions: false,
            canViewAuditTrail: false
        };
    } else {
        return {
            role: 'TEACHER',
            roleLevel: 1,
            roleName: 'Teacher',
            roleNameAr: 'معلم',
            roleDescription: 'Teaching staff with basic portal access',
            authorities: [
                'Access Teacher Portal'
            ],
            canAccessManagerPortal: false,
            canAccessTeacherPortal: true,
            canApproveRequests: false,
            canApproveManagerRequests: false,
            canRevokeActions: false,
            canViewAuditTrail: false
        };
    }
}

// Map subjects from CSV to database format
function mapSubject(csvSubject) {
    const subjectMap = {
        'Admin Management': 'Admin Management',
        'Management': 'Management',
        'Mentor': 'Mentor',
        'KG Manager': 'KG Manager',
        'Floor Admin': 'Floor Admin',
        'HR': 'HR',
        'Logistics': 'Logistics',
        'Sales': 'Sales',
        'Quran': 'Quran',
        'Arabic': 'Arabic',
        'English': 'English',
        'Science': 'Science',
        'Art': 'Art',
        'Programming': 'Programming',
        'Fitness': 'Fitness',
        'Assistant': 'Assistant',
        'Childcare': 'Childcare',
        'Canteen': 'Canteen',
        'Security': 'Security'
    };
    
    return subjectMap[csvSubject] || csvSubject;
}

// Generate realistic absence data
function generateAbsenceData(employeeName) {
    const allowedDays = Math.floor(Math.random() * 15) + 10; // 10-25 days
    const usedDays = Math.floor(Math.random() * (allowedDays * 0.7)); // Use up to 70% of allowed
    const acceptedRequests = Math.floor(Math.random() * 5); // 0-4 accepted requests
    
    return {
        allowedAbsenceDays: allowedDays,
        totalAbsenceDays: usedDays,
        acceptedAbsenceRequests: acceptedRequests
    };
}

// Generate realistic request data
function generateRequestData(employeeName, type) {
    const numberOfRequests = Math.floor(Math.random() * 8); // 0-7 requests
    const responses = ['approved', 'rejected', 'pending'];
    
    return {
        numberOfRequests,
        response: numberOfRequests > 0 ? responses[Math.floor(Math.random() * responses.length)] : ''
    };
}

async function importRealEmployeeData() {
    console.log('🚀 Starting comprehensive employee data import...');
    
    try {
        // Read CSV files
        const personalInfoPath = path.join(__dirname, '../../بيانات الموظفين  - Personal Info.csv');
        const personalInfoCSV = fs.readFileSync(personalInfoPath, 'utf8');
        const employeesData = parseCSV(personalInfoCSV);
        
        console.log(`📄 Found ${employeesData.length} employees in Personal Info CSV`);
        
        // Create backup of existing data
        const backupDir = path.join(__dirname, '../data/backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const teachersPath = path.join(__dirname, '../data/teachers.json');
        const subjectsPath = path.join(__dirname, '../data/subjects.json');
        
        if (fs.existsSync(teachersPath)) {
            fs.copyFileSync(teachersPath, path.join(backupDir, `${timestamp}_teachers_backup.json`));
        }
        if (fs.existsSync(subjectsPath)) {
            fs.copyFileSync(subjectsPath, path.join(backupDir, `${timestamp}_subjects_backup.json`));
        }
        
        console.log('💾 Backup created successfully');
        
        // Process employee data
        const processedEmployees = [];
        const subjectCounts = {};
        
        for (const employee of employeesData) {
            if (!employee['Name / الاسم'] || employee['Name / الاسم'].trim() === '') {
                continue; // Skip empty rows
            }
            
            const name = employee['Name / الاسم'];
            const subject = mapSubject(employee['Subject / المواد']);
            const mobile = employee['Mobile Number / رقم الموبايل'];
            const email = employee['Email / الإيميل'];
            const workType = employee['Work Type / نوع العمل'].includes('Full-Time') ? 'Full-time' : 'Part-time';
            const employmentDate = employee['Employment Date / تاريخ التعيين'] || generateEmploymentDate();
            
            // Generate missing data
            const age = Math.floor(Math.random() * 20) + 25; // Age between 25-45
            const birthdate = generateBirthdate(age);
            const plainPassword = generateRandomPassword();
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            
            // Get role information
            const roleInfo = assignRoleBasedOnSubject(subject);
            
            // Generate absence and request data
            const absenceData = generateAbsenceData(name);
            const earlyLeaveData = generateRequestData(name, 'Early Leave');
            const lateArrivalData = generateRequestData(name, 'Late Arrival');
            
            const processedEmployee = {
                id: uuidv4(),
                name: name,
                subject: subject,
                workType: workType,
                joinDate: new Date(employmentDate).toISOString(),
                birthdate: birthdate,
                age: age,
                email: email,
                phone: mobile.startsWith('+') ? mobile : `+966${mobile.replace(/^20/, '')}`,
                password: hashedPassword,
                plainPassword: plainPassword,
                status: 'Active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                firstName: name.split(' ')[0],
                lastName: name.split(' ').slice(1).join(' ') || name.split(' ')[0],
                address: 'Saudi Arabia', // Default address
                employmentDate: employmentDate,
                allowedAbsenceDays: absenceData.allowedAbsenceDays,
                totalAbsenceDays: absenceData.totalAbsenceDays,
                acceptedAbsenceRequests: absenceData.acceptedAbsenceRequests,
                earlyLeaveRequests: earlyLeaveData.numberOfRequests,
                earlyLeaveResponse: earlyLeaveData.response,
                lateArrivalRequests: lateArrivalData.numberOfRequests,
                lateArrivalResponse: lateArrivalData.response,
                remainingLateEarlyHours: Math.floor(Math.random() * 8) + 4, // 4-12 hours
                totalLateEarlyHours: Math.floor(Math.random() * 8) + 4,
                ...roleInfo
            };
            
            processedEmployees.push(processedEmployee);
            
            // Count subjects
            subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
        }
        
        console.log(`✅ Processed ${processedEmployees.length} employees`);
        
        // Update subjects.json
        const subjects = Object.keys(subjectCounts).map((subject, index) => ({
            id: index + 1,
            name: subject,
            teacherCount: subjectCounts[subject]
        }));
        
        // Save data
        fs.writeFileSync(teachersPath, JSON.stringify(processedEmployees, null, 2));
        fs.writeFileSync(subjectsPath, JSON.stringify(subjects, null, 2));
        
        console.log('📊 Data Summary:');
        console.log(`- Total Employees: ${processedEmployees.length}`);
        console.log(`- Subjects: ${subjects.length}`);
        console.log(`- Admins: ${processedEmployees.filter(e => e.role === 'ADMIN').length}`);
        console.log(`- Managers: ${processedEmployees.filter(e => e.role === 'MANAGER').length}`);
        console.log(`- Teachers: ${processedEmployees.filter(e => e.role === 'TEACHER').length}`);
        
        console.log('\n📋 Subject Distribution:');
        subjects.forEach(subject => {
            console.log(`- ${subject.name}: ${subject.teacherCount} employees`);
        });
        
        console.log('\n🔐 Sample Login Credentials (for testing):');
        const sampleEmployees = processedEmployees.slice(0, 5);
        sampleEmployees.forEach(emp => {
            console.log(`${emp.name} (${emp.roleName}): ${emp.email} / ${emp.plainPassword}`);
        });
        
        console.log('\n✅ Real employee data import completed successfully!');
        console.log('📁 Files updated: teachers.json, subjects.json');
        console.log('💾 Backups saved in: data/backups/');
        
        return {
            success: true,
            employeesImported: processedEmployees.length,
            subjectsUpdated: subjects.length,
            backupLocation: `data/backups/${timestamp}_*_backup.json`
        };
        
    } catch (error) {
        console.error('❌ Error importing employee data:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Run the import if called directly
if (require.main === module) {
    importRealEmployeeData().then(result => {
        if (result.success) {
            console.log('\n🎉 Import process completed successfully!');
            process.exit(0);
        } else {
            console.error('\n💥 Import process failed:', result.error);
            process.exit(1);
        }
    });
}

module.exports = { importRealEmployeeData }; 