const nodemailer = require('nodemailer');
const path = require('path');

// Email configuration for Gmail
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'geniussmart.edu@gmail.com', // Replace with actual email
      pass: process.env.EMAIL_PASS || 'your-app-password-here'       // Replace with actual app password
    }
  });
};

// Email templates
const emailTemplates = {
  // Password Reset Template
  passwordReset: (resetLink, userType, userName) => ({
    subject: `Password Reset - Genius Smart Education`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #D4AF37; margin-bottom: 10px;">🎓 Genius Smart Education</h1>
          <h2 style="color: #333; margin-top: 20px;">Password Reset Request</h2>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hello <strong>${userName}</strong>,
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password for your <strong>${userType}</strong> account.
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            If you didn't request this password reset, please ignore this email or contact support if you have concerns.
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            This link will expire in 1 hour for security reasons.
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          <p>© 2025 Genius Smart Education. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `
  }),

  // Request Notification Template (Manager)
  requestNotification: (requestData) => ({
    subject: `New ${requestData.requestType} Request - ${requestData.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #D4AF37; margin-bottom: 10px;">🎓 Genius Smart Education</h1>
          <h2 style="color: #333; margin-top: 20px;">New Request Notification</h2>
        </div>
        
        <div style="background-color: #fff3cd; border-left: 4px solid #D4AF37; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Request Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold; width: 30%;">Teacher:</td>
              <td style="padding: 8px 0; color: #333;">${requestData.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Request Type:</td>
              <td style="padding: 8px 0; color: #333;">${requestData.requestType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Duration:</td>
              <td style="padding: 8px 0; color: #333;">${requestData.duration}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Applied Date:</td>
              <td style="padding: 8px 0; color: #333;">${requestData.appliedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Reason:</td>
              <td style="padding: 8px 0; color: #333;">${requestData.reason}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Subject:</td>
              <td style="padding: 8px 0; color: #333;">${requestData.subject}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #333; margin-bottom: 15px;">Please review and approve this request in the management system.</p>
          <a href="http://localhost:3000/manager/requests" 
             style="background-color: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Review Request
          </a>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          <p>© 2025 Genius Smart Education. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `
  }),

  // Request Status Update Template (Teacher)
  requestStatusUpdate: (requestData, status) => ({
    subject: `Request ${status} - ${requestData.requestType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #D4AF37; margin-bottom: 10px;">🎓 Genius Smart Education</h1>
          <h2 style="color: #333; margin-top: 20px;">Request Status Update</h2>
        </div>
        
        <div style="background-color: ${status === 'Accepted' ? '#d4edda' : '#f8d7da'}; border-left: 4px solid ${status === 'Accepted' ? '#28a745' : '#dc3545'}; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">
            ${status === 'Accepted' ? '✅ Request Approved' : '❌ Request Rejected'}
          </h3>
          <p style="color: #333; margin-bottom: 15px;">
            Your <strong>${requestData.requestType}</strong> request has been <strong>${status.toLowerCase()}</strong> by the administration.
          </p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold; width: 30%;">Request Type:</td>
              <td style="padding: 8px 0; color: #333;">${requestData.requestType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Duration:</td>
              <td style="padding: 8px 0; color: #333;">${requestData.duration}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Applied Date:</td>
              <td style="padding: 8px 0; color: #333;">${requestData.appliedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Reason:</td>
              <td style="padding: 8px 0; color: #333;">${requestData.reason}</td>
            </tr>
          </table>
        </div>
        
        ${status === 'Accepted' ? 
          `<div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #333; margin: 0;">✨ Your request has been approved. Please check your schedule for any updates.</p>
          </div>` : 
          `<div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #333; margin: 0;">If you have questions about this decision, please contact the administration office.</p>
          </div>`
        }
        
        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          <p>© 2025 Genius Smart Education. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data = {}) => {
  try {
    const transporter = createEmailTransporter();
    
    // Test the connection
    await transporter.verify();
    console.log('📧 Email server connection verified');
    
    const mailOptions = {
      from: {
        name: 'Genius Smart Education',
        address: process.env.EMAIL_USER || 'geniussmart.edu@gmail.com'
      },
      to: to,
      subject: template.subject,
      html: template.html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', result.messageId);
    return {
      success: true,
      messageId: result.messageId
    };
    
  } catch (error) {
    console.error('📧 Email sending failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Specific email sending functions
const sendPasswordResetEmail = async (email, resetLink, userType, userName) => {
  const template = emailTemplates.passwordReset(resetLink, userType, userName);
  return await sendEmail(email, template);
};

const sendRequestNotificationEmail = async (managerEmail, requestData) => {
  const template = emailTemplates.requestNotification(requestData);
  return await sendEmail(managerEmail, template);
};

const sendRequestStatusEmail = async (teacherEmail, requestData, status) => {
  const template = emailTemplates.requestStatusUpdate(requestData, status);
  return await sendEmail(teacherEmail, template);
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendRequestNotificationEmail,
  sendRequestStatusEmail,
  emailTemplates
}; 