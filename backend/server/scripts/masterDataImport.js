const { importRealEmployeeData } = require('./importRealEmployeeDataComplete');
const { generateRealAttendanceAndRequests } = require('./generateRealAttendanceAndRequests');
const { trackFileOperation } = require('../middleware/dataTrackingMiddleware');

async function masterDataImport() {
    console.log('🎯 Starting Master Data Import Process');
    console.log('=====================================');
    console.log('This will import real employee data and generate comprehensive test data');
    console.log('');

    const results = {
        employeeImport: null,
        attendanceGeneration: null,
        overallSuccess: false,
        summary: {
            totalEmployees: 0,
            totalSubjects: 0,
            totalAttendanceRecords: 0,
            totalRequests: 0
        },
        timing: {
            startTime: new Date(),
            endTime: null,
            duration: null
        }
    };

    try {
        // Step 1: Import Real Employee Data
        console.log('📊 Step 1: Importing Real Employee Data');
        console.log('---------------------------------------');
        
        results.employeeImport = await importRealEmployeeData();
        
        if (!results.employeeImport.success) {
            throw new Error(`Employee import failed: ${results.employeeImport.error}`);
        }

        console.log(`✅ Employee import completed successfully!`);
        console.log(`   - Employees imported: ${results.employeeImport.employeesImported}`);
        console.log(`   - Subjects updated: ${results.employeeImport.subjectsUpdated}`);
        console.log('');

        // Update summary
        results.summary.totalEmployees = results.employeeImport.employeesImported;
        results.summary.totalSubjects = results.employeeImport.subjectsUpdated;

        // Step 2: Generate Attendance and Requests Data
        console.log('📅 Step 2: Generating Realistic Attendance and Requests Data');
        console.log('-----------------------------------------------------------');
        
        results.attendanceGeneration = await generateRealAttendanceAndRequests();
        
        if (!results.attendanceGeneration.success) {
            throw new Error(`Attendance generation failed: ${results.attendanceGeneration.error}`);
        }

        console.log(`✅ Data generation completed successfully!`);
        console.log(`   - Attendance records: ${results.attendanceGeneration.attendanceRecords}`);
        console.log(`   - Request records: ${results.attendanceGeneration.requests}`);
        console.log('');

        // Update summary
        results.summary.totalAttendanceRecords = results.attendanceGeneration.attendanceRecords;
        results.summary.totalRequests = results.attendanceGeneration.requests;

        // Mark as successful
        results.overallSuccess = true;
        results.timing.endTime = new Date();
        results.timing.duration = results.timing.endTime - results.timing.startTime;

        // Track the import operation
        await trackFileOperation(
            'BULK_IMPORT',
            'complete_database_import',
            'SYSTEM',
            'System Import',
            'ADMIN',
            null,
            results.summary
        );

        // Final Summary
        console.log('🎉 Master Data Import Completed Successfully!');
        console.log('===========================================');
        console.log('📊 Final Summary:');
        console.log(`   Total Employees: ${results.summary.totalEmployees}`);
        console.log(`   Total Subjects: ${results.summary.totalSubjects}`);
        console.log(`   Total Attendance Records: ${results.summary.totalAttendanceRecords}`);
        console.log(`   Total Request Records: ${results.summary.totalRequests}`);
        console.log(`   Total Processing Time: ${Math.round(results.timing.duration / 1000)} seconds`);
        console.log('');
        
        console.log('🔐 Sample Login Credentials (Check employee import output above)');
        console.log('💾 Backups: All original data backed up in server/data/backups/');
        console.log('📈 Data Tracking: Comprehensive tracking enabled for all future changes');
        console.log('');
        
        console.log('🚀 Next Steps:');
        console.log('   1. Restart the server to ensure all data is loaded');
        console.log('   2. Test login with sample credentials');
        console.log('   3. Verify data in Manager and Teacher portals');
        console.log('   4. Monitor data changes via the tracking system');
        console.log('');

        return results;

    } catch (error) {
        console.error('❌ Master Data Import Failed!');
        console.error('==============================');
        console.error('Error:', error.message);
        console.error('');
        
        results.overallSuccess = false;
        results.error = error.message;
        results.timing.endTime = new Date();
        results.timing.duration = results.timing.endTime - results.timing.startTime;

        // Track the failed operation
        await trackFileOperation(
            'BULK_IMPORT_FAILED',
            'complete_database_import',
            'SYSTEM',
            'System Import',
            'ADMIN',
            null,
            { error: error.message, results: results }
        );

        console.log('🔧 Troubleshooting:');
        console.log('   1. Check if CSV files exist in the root directory');
        console.log('   2. Verify server/data directory permissions');
        console.log('   3. Ensure no other processes are using the files');
        console.log('   4. Check the detailed error message above');
        console.log('');

        return results;
    }
}

// Data validation and integrity check
async function validateImportedData() {
    console.log('🔍 Validating imported data...');
    
    try {
        const fs = require('fs');
        const path = require('path');
        
        const dataDir = path.join(__dirname, '../data');
        const requiredFiles = ['teachers.json', 'subjects.json', 'attendance.json', 'requests.json'];
        
        const validation = {
            filesExist: true,
            dataIntegrity: true,
            issues: []
        };

        // Check if all required files exist
        for (const file of requiredFiles) {
            const filePath = path.join(dataDir, file);
            if (!fs.existsSync(filePath)) {
                validation.filesExist = false;
                validation.issues.push(`Missing file: ${file}`);
            }
        }

        if (!validation.filesExist) {
            console.log('❌ Validation failed: Missing required files');
            validation.issues.forEach(issue => console.log(`   - ${issue}`));
            return validation;
        }

        // Check data integrity
        const teachers = JSON.parse(fs.readFileSync(path.join(dataDir, 'teachers.json'), 'utf8'));
        const subjects = JSON.parse(fs.readFileSync(path.join(dataDir, 'subjects.json'), 'utf8'));
        const attendance = JSON.parse(fs.readFileSync(path.join(dataDir, 'attendance.json'), 'utf8'));
        const requests = JSON.parse(fs.readFileSync(path.join(dataDir, 'requests.json'), 'utf8'));

        // Basic integrity checks
        if (!Array.isArray(teachers) || teachers.length === 0) {
            validation.dataIntegrity = false;
            validation.issues.push('Teachers data is invalid or empty');
        }

        if (!Array.isArray(subjects) || subjects.length === 0) {
            validation.dataIntegrity = false;
            validation.issues.push('Subjects data is invalid or empty');
        }

        if (!Array.isArray(attendance)) {
            validation.dataIntegrity = false;
            validation.issues.push('Attendance data is invalid');
        }

        if (!Array.isArray(requests)) {
            validation.dataIntegrity = false;
            validation.issues.push('Requests data is invalid');
        }

        // Check for required fields
        const sampleTeacher = teachers[0];
        const requiredTeacherFields = ['id', 'name', 'email', 'subject', 'role'];
        
        for (const field of requiredTeacherFields) {
            if (!sampleTeacher[field]) {
                validation.dataIntegrity = false;
                validation.issues.push(`Missing required teacher field: ${field}`);
            }
        }

        if (validation.filesExist && validation.dataIntegrity) {
            console.log('✅ Data validation passed');
            console.log(`   - Teachers: ${teachers.length} records`);
            console.log(`   - Subjects: ${subjects.length} records`);
            console.log(`   - Attendance: ${attendance.length} records`);
            console.log(`   - Requests: ${requests.length} records`);
        } else {
            console.log('❌ Data validation failed');
            validation.issues.forEach(issue => console.log(`   - ${issue}`));
        }

        return validation;

    } catch (error) {
        console.error('❌ Validation error:', error.message);
        return {
            filesExist: false,
            dataIntegrity: false,
            issues: [`Validation error: ${error.message}`]
        };
    }
}

// Run the master import if called directly
if (require.main === module) {
    masterDataImport().then(async (results) => {
        if (results.overallSuccess) {
            console.log('🔍 Running data validation...');
            const validation = await validateImportedData();
            
            if (validation.filesExist && validation.dataIntegrity) {
                console.log('\n🎉 Complete Success! Database is ready for production use.');
                process.exit(0);
            } else {
                console.log('\n⚠️  Import completed but validation found issues.');
                process.exit(1);
            }
        } else {
            console.error('\n💥 Import process failed. Check the error details above.');
            process.exit(1);
        }
    }).catch(error => {
        console.error('💥 Fatal error in master import:', error);
        process.exit(1);
    });
}

module.exports = { 
    masterDataImport, 
    validateImportedData 
}; 