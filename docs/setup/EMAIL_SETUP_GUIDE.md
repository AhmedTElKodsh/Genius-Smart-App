# 📧 Email Setup Guide - Genius Smart Education App

This guide will help you set up email functionality for password resets and notifications.

## 🚀 Quick Setup Steps

### Step 1: Gmail Account Setup

1. **Go to your Gmail account**: https://mail.google.com
2. **Enable 2-Factor Authentication**:
   - Go to Google Account Settings → Security
   - Turn on 2-Step Verification
   - Follow the setup process

3. **Generate App Password**:
   - In Google Account Settings → Security
   - Under "Signing in to Google" click "App passwords"
   - Select "Mail" as the app
   - Copy the 16-character password that appears

### Step 2: Backend Configuration

1. **Create .env file** in the `server` directory:
```bash
cd server
copy email-config-template.env .env
```

2. **Edit the .env file** with your actual credentials:
```env
# Replace with your actual Gmail address
EMAIL_USER=your-email@gmail.com

# Replace with your Gmail App Password (16 characters, no spaces)
EMAIL_PASS=abcd efgh ijkl mnop

# Frontend URL (change if different)
FRONTEND_URL=http://localhost:3000

# Server settings
PORT=5000
NODE_ENV=development
JWT_SECRET=genius-smart-secret-key-change-in-production
RESET_TOKEN_EXPIRY=3600
```

3. **Restart the server**:
```bash
npm start
```

## 🧪 Testing Email Functionality

### Test Script
Run the comprehensive email test:
```bash
cd server
node test-email-setup.js
```

### Manual Testing

#### 1. Test Teacher Password Reset
```bash
curl -X POST http://localhost:5000/api/auth/teacher/reset-password-request \
  -H "Content-Type: application/json" \
  -d '{"email": "ahmed_elkodsh@yahoo.com"}'
```

#### 2. Test Manager Password Reset  
```bash
curl -X POST http://localhost:5000/api/auth/manager/reset-password-request \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@geniussmart.edu"}'
```

#### 3. Test Request Notification (Manager receives)
```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": "8655f62b-3991-4bc7-9fb0-6c8452cc3b68",
    "teacherName": "Ali Arabic", 
    "type": "authorizedAbsence",
    "duration": "oneDay",
    "fromDate": "2025-08-15",
    "reason": "TEST EMAIL",
    "subject": "Arabic"
  }'
```

#### 4. Test Request Status (Teacher receives)
```bash
# First get a request ID from the above command, then:
curl -X PUT http://localhost:5000/api/requests/[REQUEST_ID] \
  -H "Content-Type: application/json" \
  -d '{"result": "Accepted"}'
```

## 📋 Email Templates

The system includes professional email templates for:

### 🔑 Password Reset Emails
- Clean, professional design
- Secure reset links with 1-hour expiry
- Different templates for Teachers vs Managers
- Security warnings and instructions

### 📨 Request Notifications (Manager)
- New request alerts with full details
- Teacher information, request type, duration, reason
- Direct link to management dashboard
- Professional formatting with company branding

### ✅ Status Updates (Teacher)
- Request approval/rejection notifications
- Clear visual indicators (✅ approved, ❌ rejected)
- Complete request details for reference
- Encouraging messages and next steps

## 🔧 Configuration Details

### Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_USER` | Gmail address | `yourschool@gmail.com` |
| `EMAIL_PASS` | Gmail App Password | `abcd efgh ijkl mnop` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |
| `JWT_SECRET` | Secret for password reset tokens | `your-secret-key` |
| `RESET_TOKEN_EXPIRY` | Token expiry time in seconds | `3600` (1 hour) |

### Email Service Features
- ✅ Gmail SMTP configuration
- ✅ HTML email templates
- ✅ Error handling and logging
- ✅ Connection verification
- ✅ Professional styling with school branding
- ✅ Responsive design for mobile devices
- ✅ Security best practices

## 🚨 Troubleshooting

### Common Issues

1. **"Failed to send email" error**:
   - Check if 2FA is enabled on Gmail
   - Verify App Password is correct (16 chars, no spaces)
   - Ensure EMAIL_USER and EMAIL_PASS are in .env file

2. **"Authentication failed" error**:
   - Regenerate App Password in Gmail
   - Make sure you're using App Password, not regular password
   - Check Gmail account security settings

3. **"Connection timeout" error**:
   - Check internet connection
   - Verify Gmail SMTP settings
   - Check firewall/antivirus blocking port 587

4. **Emails not received**:
   - Check spam/junk folder
   - Verify recipient email address
   - Check Gmail sending limits

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
```

## 🔐 Security Notes

- **Never commit .env file** to version control
- **Use App Passwords**, not regular Gmail passwords
- **Regenerate App Passwords** periodically
- **Monitor email sending** for unusual activity
- **Use strong JWT secrets** in production

## 📊 Current Test Status

✅ **Backend Email System**: Fully implemented
✅ **Password Reset**: Teacher & Manager support
✅ **Request Notifications**: Manager alerts
✅ **Status Updates**: Teacher notifications
✅ **Email Templates**: Professional design
✅ **Error Handling**: Comprehensive logging
⚠️ **Email Credentials**: Needs configuration
⚠️ **Frontend Integration**: Requires setup

## 📞 Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Run the test script: `node test-email-setup.js`
3. Verify Gmail account settings
4. Check .env file configuration

---

**Note**: Ali Arabic's email is already configured as `ahmed_elkodsh@yahoo.com` in the database. All test emails will be sent to this address. 