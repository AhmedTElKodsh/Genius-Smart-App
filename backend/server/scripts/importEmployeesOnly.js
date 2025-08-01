const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

console.log('🚀 Starting Employee Data Import Only...');
console.log('=====================================');

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
            authorities: [
                'Access Manager Portal',
                'Access Teacher Portal',
                'Add new teachers',
                'Edit Existing Teachers',
                'Delete Teachers',
                'Accept and Reject All Requests',
                'Download Reports',
                'View All Analytics',
                'System Administration'
            ],
            canAccessManagerPortal: true,
            canAccessTeacherPortal: true,
            canApproveRequests: true
        };
    } else if (managerSubjects.includes(subject)) {
        return {
            role: 'MANAGER',
            roleLevel: 2,
            roleName: 'Manager',
            roleNameAr: 'مدير',
            authorities: [
                'Access Manager Portal',
                'Access Teacher Portal',
                'Add new teachers',
                'Edit Existing Teachers',
                'Accept and Reject All Requests',
                'Download Reports'
            ],
            canAccessManagerPortal: true,
            canAccessTeacherPortal: true,
            canApproveRequests: true
        };
    } else {
        return {
            role: 'TEACHER',
            roleLevel: 1,
            roleName: 'Teacher',
            roleNameAr: 'معلم',
            authorities: ['Access Teacher Portal'],
            canAccessManagerPortal: false,
            canAccessTeacherPortal: true,
            canApproveRequests: false
        };
    }
}

// Generate random password
function generateRandomPassword() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

async function importEmployeesOnly() {
    try {
        console.log('📄 Reading CSV file...');
        const csvPath = path.join(__dirname, '../../بيانات الموظفين  - Personal Info.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const employeesData = parseCSV(csvContent);
        
        console.log(`✅ Found ${employeesData.length} employees in CSV`);
        
        console.log('💾 Creating backup...');
        const backupDir = path.join(__dirname, '../data/backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const teachersPath = path.join(__dirname, '../data/teachers.json');
        if (fs.existsSync(teachersPath)) {
            fs.copyFileSync(teachersPath, path.join(backupDir, `${timestamp}_teachers_backup.json`));
            console.log('✅ Backup created');
        }
        
        console.log('👥 Processing employees...');
        const processedEmployees = [];
        const subjectCounts = {};
        
        for (let i = 0; i < employeesData.length; i++) {
            const employee = employeesData[i];
            const progress = `[${i + 1}/${employeesData.length}]`;
            
            if (!employee['Name / الاسم'] || employee['Name / الاسم'].trim() === '') {
                console.log(`${progress} ⏭️  Skipping empty row`);
                continue;
            }
            
            const name = employee['Name / الاسم'];
            console.log(`${progress} 🔄 Processing: ${name}`);
            
            const subject = employee['Subject / المواد'];
            const mobile = employee['Mobile Number / رقم الموبايل'];
            const email = employee['Email / الإيميل'];
            const workType = employee['Work Type / نوع العمل'].includes('Full-Time') ? 'Full-time' : 'Part-time';
            
            // Generate password
            const plainPassword = generateRandomPassword();
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            
            // Get role information
            const roleInfo = assignRoleBasedOnSubject(subject);
            
            const processedEmployee = {
                id: uuidv4(),
                name: name,
                subject: subject,
                workType: workType,
                email: email,
                phone: mobile.startsWith('+') ? mobile : `+966${mobile.replace(/^20/, '')}`,
                password: hashedPassword,
                plainPassword: plainPassword,
                status: 'Active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                firstName: name.split(' ')[0],
                lastName: name.split(' ').slice(1).join(' ') || name.split(' ')[0],
                address: 'Saudi Arabia',
                employmentDate: '2024-01-01', // Default date
                allowedAbsenceDays: 20,
                totalAbsenceDays: 0,
                remainingLateEarlyHours: 8,
                totalLateEarlyHours: 8,
                ...roleInfo
            };
            
            processedEmployees.push(processedEmployee);
            subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
            
            console.log(`${progress} ✅ ${name} (${roleInfo.roleName})`);
        }
        
        console.log(`\n📊 Processed ${processedEmployees.length} employees`);
        
        // Update subjects
        console.log('📚 Updating subjects...');
        const subjects = Object.keys(subjectCounts).map((subject, index) => ({
            id: index + 1,
            name: subject,
            teacherCount: subjectCounts[subject]
        }));
        
        // Save data
        console.log('💾 Saving data...');
        fs.writeFileSync(teachersPath, JSON.stringify(processedEmployees, null, 2));
        
        const subjectsPath = path.join(__dirname, '../data/subjects.json');
        fs.writeFileSync(subjectsPath, JSON.stringify(subjects, null, 2));
        
        console.log('\n🎉 Import completed successfully!');
        console.log('=====================================');
        console.log(`📊 Summary:`);
        console.log(`- Total Employees: ${processedEmployees.length}`);
        console.log(`- Subjects: ${subjects.length}`);
        console.log(`- Admins: ${processedEmployees.filter(e => e.role === 'ADMIN').length}`);
        console.log(`- Managers: ${processedEmployees.filter(e => e.role === 'MANAGER').length}`);
        console.log(`- Teachers: ${processedEmployees.filter(e => e.role === 'TEACHER').length}`);
        
        console.log('\n🔐 Sample Login Credentials:');
        const admins = processedEmployees.filter(e => e.role === 'ADMIN').slice(0, 2);
        admins.forEach(emp => {
            console.log(`${emp.name}: ${emp.email} / ${emp.plainPassword}`);
        });
        
        console.log('\n📁 Files updated:');
        console.log('- teachers.json');
        console.log('- subjects.json');
        console.log(`- Backup: ${timestamp}_teachers_backup.json`);
        
        return {
            success: true,
            employeesImported: processedEmployees.length,
            subjectsUpdated: subjects.length
        };
        
    } catch (error) {
        console.error('\n❌ Import failed:', error.message);
        console.error('Full error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Run the import
importEmployeesOnly().then(result => {
    if (result.success) {
        console.log('\n✅ Import process completed successfully!');
        console.log('🚀 Next: Restart server and test login with the credentials above.');
        process.exit(0);
    } else {
        console.error('\n💥 Import process failed:', result.error);
        process.exit(1);
    }
}).catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
}); 