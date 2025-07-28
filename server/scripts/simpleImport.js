const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

console.log('🚀 Starting Simple Employee Data Import...');

// Simple CSV parser
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

async function simpleImport() {
    try {
        console.log('📄 Reading CSV file...');
        const csvPath = path.join(__dirname, '../../بيانات الموظفين  - Personal Info.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const employees = parseCSV(csvContent);
        
        console.log(`✅ Found ${employees.length} employees`);
        
        console.log('🔐 Processing first employee...');
        const firstEmployee = employees[0];
        console.log('Name:', firstEmployee['Name / الاسم']);
        console.log('Subject:', firstEmployee['Subject / المواد']);
        console.log('Email:', firstEmployee['Email / الإيميل']);
        
        console.log('🔒 Generating password...');
        const plainPassword = 'TestPassword123!';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        console.log('✅ Password hashed successfully');
        
        console.log('📦 Creating employee object...');
        const processedEmployee = {
            id: uuidv4(),
            name: firstEmployee['Name / الاسم'],
            subject: firstEmployee['Subject / المواد'],
            email: firstEmployee['Email / الإيميل'],
            phone: '+966' + firstEmployee['Mobile Number / رقم الموبايل'],
            password: hashedPassword,
            plainPassword: plainPassword,
            workType: firstEmployee['Work Type / نوع العمل'].includes('Full-Time') ? 'Full-time' : 'Part-time',
            status: 'Active',
            role: 'TEACHER',
            authorities: ['Access Teacher Portal'],
            createdAt: new Date().toISOString()
        };
        
        console.log('✅ Employee processed successfully');
        console.log('Sample data:', {
            name: processedEmployee.name,
            email: processedEmployee.email,
            subject: processedEmployee.subject,
            role: processedEmployee.role
        });
        
        console.log('📁 Creating backup...');
        const backupDir = path.join(__dirname, '../data/backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        console.log('✅ Backup directory ready');
        
        console.log('🎉 Simple import test completed successfully!');
        console.log('');
        console.log('🔐 Test Login Credentials:');
        console.log(`Email: ${processedEmployee.email}`);
        console.log(`Password: ${processedEmployee.plainPassword}`);
        
    } catch (error) {
        console.error('❌ Import failed:', error);
        throw error;
    }
}

// Run the import
simpleImport().then(() => {
    console.log('✅ All done!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
}); 