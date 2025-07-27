require('dotenv').config();
const { sendPasswordResetEmail, sendRequestNotificationEmail, sendRequestStatusEmail } = require('./utils/emailService');

// Test email configuration
const testEmailConfiguration = async () => {
  console.log('🧪 Testing Email Configuration');
  console.log('=====================================');
  
  // Check environment variables
  console.log('📧 Email Configuration:');
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
  console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? 'SET (hidden)' : 'NOT SET'}`);
  console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log('');

  // Test email for Ali Arabic (teacher)
  const testTeacherEmail = 'ahmed_elkodsh@yahoo.com';
  
  console.log('🎯 Test Cases:');
  console.log('=====================================');
  
  // Test 1: Password Reset Email (Teacher)
  console.log('📝 Test 1: Teacher Password Reset Email');
  try {
    const resetLink = 'http://localhost:3000/teacher/reset-password?token=test-token-123';
    const result1 = await sendPasswordResetEmail(
      testTeacherEmail, 
      resetLink, 
      'Teacher', 
      'Ali Arabic'
    );
    console.log(`   ✅ Result: ${result1.success ? 'SUCCESS' : 'FAILED'}`);
    if (!result1.success) console.log(`   ❌ Error: ${result1.error}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 2: Password Reset Email (Manager)
  console.log('📝 Test 2: Manager Password Reset Email');
  try {
    const resetLink = 'http://localhost:3000/manager/reset-password?token=test-token-456';
    const result2 = await sendPasswordResetEmail(
      testTeacherEmail, 
      resetLink, 
      'Manager', 
      'Admin Manager'
    );
    console.log(`   ✅ Result: ${result2.success ? 'SUCCESS' : 'FAILED'}`);
    if (!result2.success) console.log(`   ❌ Error: ${result2.error}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 3: Request Notification Email (Manager)
  console.log('📝 Test 3: Request Notification Email (Manager)');
  try {
    const testRequestData = {
      id: 'test-request-123',
      name: 'Ali Arabic',
      teacherId: '8655f62b-3991-4bc7-9fb0-6c8452cc3b68',
      requestType: 'Authorized Absence',
      appliedDate: '2025-07-22',
      duration: '24 July - 30 July 2025',
      startDate: '2025-07-24',
      endDate: '2025-07-30',
      reason: 'family reasons - TEST EMAIL',
      subject: 'Arabic'
    };
    
    const result3 = await sendRequestNotificationEmail(testTeacherEmail, testRequestData);
    console.log(`   ✅ Result: ${result3.success ? 'SUCCESS' : 'FAILED'}`);
    if (!result3.success) console.log(`   ❌ Error: ${result3.error}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 4: Request Status Email (Teacher - Accepted)
  console.log('📝 Test 4: Request Status Email (Teacher - Accepted)');
  try {
    const testRequestData = {
      id: 'test-request-456',
      name: 'Ali Arabic',
      teacherId: '8655f62b-3991-4bc7-9fb0-6c8452cc3b68',
      requestType: 'Authorized Absence',
      appliedDate: '2025-07-22',
      duration: '24 July - 30 July 2025',
      reason: 'family reasons - TEST EMAIL'
    };
    
    const result4 = await sendRequestStatusEmail(testTeacherEmail, testRequestData, 'Accepted');
    console.log(`   ✅ Result: ${result4.success ? 'SUCCESS' : 'FAILED'}`);
    if (!result4.success) console.log(`   ❌ Error: ${result4.error}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 5: Request Status Email (Teacher - Rejected)
  console.log('📝 Test 5: Request Status Email (Teacher - Rejected)');
  try {
    const testRequestData = {
      id: 'test-request-789',
      name: 'Ali Arabic',
      teacherId: '8655f62b-3991-4bc7-9fb0-6c8452cc3b68',
      requestType: 'Late Arrival',
      appliedDate: '2025-07-22',
      duration: '30 July 2025',
      reason: 'family reasons - TEST EMAIL'
    };
    
    const result5 = await sendRequestStatusEmail(testTeacherEmail, testRequestData, 'Rejected');
    console.log(`   ✅ Result: ${result5.success ? 'SUCCESS' : 'FAILED'}`);
    if (!result5.success) console.log(`   ❌ Error: ${result5.error}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  console.log('🎉 Email Testing Complete!');
  console.log('=====================================');
  console.log('📌 Setup Instructions:');
  console.log('1. Create a .env file in the server directory');
  console.log('2. Add your Gmail credentials:');
  console.log('   EMAIL_USER=your-email@gmail.com');
  console.log('   EMAIL_PASS=your-app-password');
  console.log('3. Enable 2FA and create an App Password in Gmail');
  console.log('4. Restart the server and run tests again');
  console.log('');
};

// Run the test
if (require.main === module) {
  testEmailConfiguration().catch(console.error);
}

module.exports = { testEmailConfiguration }; 