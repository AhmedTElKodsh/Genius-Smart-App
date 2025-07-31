# Real Employee Data Import & Comprehensive Tracking System

## 🎯 Overview

This document outlines the complete system for importing real employee data from CSV files and implementing comprehensive data tracking across the entire application. The system includes:

1. **Real Employee Data Import** - Import actual employee data from CSV files
2. **Realistic Data Generation** - Generate comprehensive attendance and request data for testing
3. **Advanced Data Tracking** - Monitor all data changes across the system
4. **Role-Based Access Control** - Properly assign roles based on employee subjects
5. **Backup & Recovery** - Automatic backups before major changes

## 📁 Files Created/Modified

### New Scripts
- `server/scripts/importRealEmployeeDataComplete.js` - Main employee data import
- `server/scripts/generateRealAttendanceAndRequests.js` - Generate realistic test data
- `server/scripts/masterDataImport.js` - Master script that runs everything

### New Middleware
- `server/middleware/dataTrackingMiddleware.js` - Comprehensive data tracking

### New Routes
- `server/routes/dataTracking.js` - API endpoints for monitoring data changes

### Updated Files
- `server/server.js` - Added data tracking middleware and routes
- `server/data/subjects.json` - Updated with new subjects from CSV
- `server/data/teachers.json` - Populated with real employee data
- `server/data/attendance.json` - Generated realistic attendance data
- `server/data/requests.json` - Generated realistic request data

## 🚀 Quick Start - Import Real Data

### Step 1: Run the Master Import Script

```bash
cd server
node scripts/masterDataImport.js
```

This will:
- Import all 31 employees from the CSV files
- Update subjects to match the real data
- Generate 3 months of realistic attendance data
- Generate random request data for testing
- Create comprehensive backups
- Set up data tracking

### Step 2: Restart the Server

```bash
npm start
```

### Step 3: Test with Real Credentials

The script will output sample login credentials. For example:
```
إبراهيم حمدي (Admin): ibrahimmizo55@gmail.com / [generated_password]
عمرو زاهر (Admin): amr_zaher1@hotmail.com / [generated_password]
```

## 📊 Data Structure & Features

### Employee Data Imported
- **Total Employees**: 31 real employees
- **Subjects Updated**: 19 different subjects/departments
- **Role Assignment**: Automatic based on subject
  - **Admin Management** → ADMIN role
  - **Management** → ADMIN role  
  - **KG Manager, Floor Admin, HR, Mentor** → MANAGER role
  - **All others** → TEACHER role

### New Subjects Added
- Admin Management
- KG Manager
- Floor Admin
- HR
- Logistics
- Sales
- Mentor
- Assistant

### Generated Test Data
- **Attendance Records**: ~2,700 records over 90 days
- **Request Records**: ~150 random requests
- **Request Types**: Absence, Late Arrival, Early Leave
- **Realistic Patterns**: Working hours, late arrivals, early leaves

## 🔍 Data Tracking System

### Comprehensive Monitoring
All data changes are tracked with:
- **User Information**: Who made the change
- **Timestamps**: When the change occurred
- **Change Details**: What exactly changed (field-by-field)
- **Original vs New Data**: Complete before/after snapshots
- **Metadata**: IP address, user agent, change reason

### Tracking API Endpoints

#### Get Tracking Statistics (Admin Only)
```
GET /api/tracking/statistics
```

#### Get Recent Changes (Admin/Manager)
```
GET /api/tracking/recent-changes?limit=50
```

#### Search Changes (Admin Only)
```
POST /api/tracking/search
Body: {
  "userId": "optional",
  "action": "optional", 
  "targetType": "optional",
  "dateFrom": "2025-01-01",
  "dateTo": "2025-01-31"
}
```

#### Get Dashboard Data (Admin Only)
```
GET /api/tracking/dashboard
```

#### Export Tracking Data (Admin Only)
```
GET /api/tracking/export?format=json&dateFrom=2025-01-01&dateTo=2025-01-31
GET /api/tracking/export?format=csv&dateFrom=2025-01-01&dateTo=2025-01-31
```

## 👥 Role-Based Access Control

### Admin Users (إبراهيم حمدي, عمرو زاهر)
- Full system access
- All manager portal features
- Teacher portal access
- User management
- Request approval/rejection
- Data tracking monitoring
- System administration

### Manager Users (ماهيتاب مصطفى, أميرة شرف, اسماء كحيل, ابراهيم أحمد, نورهان عادل, أسماء رفعت, عادل محمد)
- Manager portal access
- Teacher portal access  
- Add/edit teachers
- Request approval/rejection
- Analytics viewing
- Limited tracking access

### Teacher Users (All others)
- Teacher portal only
- Personal attendance tracking
- Submit requests
- View personal history

## 🔐 Login Information

### Sample Admin Credentials
```
Email: ibrahimmizo55@gmail.com
Password: [Check console output from import script]

Email: amr_zaher1@hotmail.com  
Password: [Check console output from import script]
```

### Finding All Credentials
After running the import script, all login credentials are displayed in the console output. You can also find them in the generated `teachers.json` file under the `plainPassword` field.

## 💾 Backup & Recovery

### Automatic Backups
- Created before any major data operation
- Stored in `server/data/backups/`
- Timestamped for easy identification
- Include original data structure

### Backup Files
- `YYYY-MM-DDTHH-MM-SS_teachers_backup.json`
- `YYYY-MM-DDTHH-MM-SS_subjects_backup.json` 
- `YYYY-MM-DDTHH-MM-SS_attendance_backup.json`
- `YYYY-MM-DDTHH-MM-SS_requests_backup.json`

### Recovery Process
To restore from backup:
1. Stop the server
2. Copy backup file to replace current data file
3. Restart the server

## 📈 Monitoring & Analytics

### Data Tracking Dashboard
Access comprehensive monitoring at:
- Manager Portal → Data Tracking (Admin only)
- API endpoint: `/api/tracking/dashboard`

### Key Metrics Tracked
- Total data changes
- Changes by type (CREATE, UPDATE, DELETE)
- Changes by user
- Daily activity patterns
- System health indicators

### Alerting Capabilities
The system can track:
- Unusual data modification patterns
- Bulk operations
- Administrative actions
- Failed operations
- Security-related changes

## 🛠️ Troubleshooting

### Common Issues

#### CSV Files Not Found
```
Error: ENOENT: no such file or directory
```
**Solution**: Ensure CSV files are in the project root directory:
- `بيانات الموظفين  - Personal Info.csv`
- `بيانات الموظفين  - Teachers' Absence.csv`
- `بيانات الموظفين  - Teachers' Early leave Requests.csv`
- `بيانات الموظفين  - Teachers' Late Arrival Requests.csv`

#### Permission Errors
```
Error: EACCES: permission denied
```
**Solution**: Check file/directory permissions:
```bash
chmod 755 server/data/
chmod 644 server/data/*.json
```

#### Memory Issues
```
Error: JavaScript heap out of memory
```
**Solution**: Increase Node.js memory limit:
```bash
node --max-old-space-size=4096 scripts/masterDataImport.js
```

### Data Validation
Run validation after import:
```bash
node scripts/masterDataImport.js
# The script automatically validates data at the end
```

### Re-running Import
To re-import data:
1. The script automatically creates backups
2. Safe to run multiple times
3. Previous data will be backed up before replacement

## 🔄 Integration with Existing System

### Clerk Authentication
- All imported users work with existing Clerk authentication
- Passwords are hashed using bcrypt
- Email addresses from CSV are used for login

### Subject Management
- Subjects automatically updated to match real data
- Teacher counts recalculated
- Dropdown menus updated throughout the application

### Request System
- Generated requests integrate with existing approval workflow
- Realistic request types and reasons
- Proper status assignments (pending, approved, rejected)

### Attendance System
- Generated attendance works with existing analytics
- Realistic work patterns (8 AM - 4 PM standard)
- Late arrivals and early leaves properly tracked

## 📋 Next Steps

1. **Run the import** using the master script
2. **Test login** with generated credentials
3. **Verify data** in both portals
4. **Monitor tracking** through the dashboard
5. **Customize as needed** for your specific requirements

## 🎯 Production Considerations

### Data Privacy
- Real email addresses are imported but should be anonymized for production
- Phone numbers should be validated/anonymized
- Consider GDPR compliance for personal data

### Performance
- Data tracking adds minimal overhead
- Consider archiving old tracking data periodically
- Monitor backup file sizes

### Security
- Change default passwords after import
- Review role assignments
- Enable additional security measures as needed

### Scalability
- Tracking system supports 10,000+ changes
- Automatic cleanup prevents file bloat
- Consider database migration for larger datasets

---

**📞 Support**: If you encounter any issues with the import or tracking system, check the console output for detailed error messages and troubleshooting suggestions. 