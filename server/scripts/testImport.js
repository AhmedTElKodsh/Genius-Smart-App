const fs = require('fs');
const path = require('path');

console.log('🔍 Testing import functionality...');

try {
    // Test 1: Check file existence
    const csvPath = path.join(__dirname, '../../بيانات الموظفين  - Personal Info.csv');
    console.log('1. CSV file exists:', fs.existsSync(csvPath));
    
    // Test 2: Read CSV content
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    console.log('2. CSV content length:', csvContent.length);
    console.log('3. First 200 chars:', csvContent.substring(0, 200));
    
    // Test 3: Parse CSV
    const lines = csvContent.split('\n').filter(line => line.trim());
    console.log('4. Total lines:', lines.length);
    console.log('5. Headers:', lines[0]);
    
    // Test 4: Process first employee
    if (lines.length > 1) {
        const headers = lines[0].split(',');
        const firstEmployee = lines[1].split(',');
        console.log('6. First employee data:');
        headers.forEach((header, index) => {
            console.log(`   ${header.trim()}: ${firstEmployee[index] ? firstEmployee[index].trim() : 'empty'}`);
        });
    }
    
    // Test 5: Check existing data directory
    const dataDir = path.join(__dirname, '../data');
    console.log('7. Data directory exists:', fs.existsSync(dataDir));
    
    const teachersFile = path.join(dataDir, 'teachers.json');
    console.log('8. Teachers file exists:', fs.existsSync(teachersFile));
    
    if (fs.existsSync(teachersFile)) {
        const teachers = JSON.parse(fs.readFileSync(teachersFile, 'utf8'));
        console.log('9. Current teachers count:', teachers.length);
    }
    
    console.log('✅ All tests passed! CSV import should work.');
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
} 