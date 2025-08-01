# Genius Smart Attendance Backend API

## 🚀 Overview

This is the backend API for the Genius Smart Attendance Management System. It provides a comprehensive RESTful API for managing teachers, attendance records, requests, and departments with real-time analytics and dashboard functionality.

## 📋 Features

- **Teacher Management**: Complete CRUD operations for teacher profiles
- **Attendance Tracking**: Monthly attendance records with statistics
- **Request Management**: Handle leave requests, overtime, and other appeals
- **Department Analytics**: Performance tracking by department
- **Dashboard Data**: Real-time statistics and analytics
- **Mock Database**: JSON-based data storage (easily replaceable with real DB)
- **Validation**: Input validation and error handling
- **CORS Support**: Cross-origin requests for frontend integration

## 🛠 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **UUID** - Unique identifier generation
- **Date-fns** - Date manipulation
- **Joi** - Data validation
- **Helmet** - Security headers
- **Morgan** - HTTP request logging
- **CORS** - Cross-origin resource sharing

## 📊 Data Structure

### Teachers
- Personal information (name, email, phone, birthdate)
- Work details (department, work type, join date)
- Status tracking (active/inactive)

### Attendance Records
- Monthly tracking (April, May, June 2024)
- Working days, attended days, attendance rate
- Hours tracking (regular, overtime, late)
- Leave and absence records

### Requests (Appeals)
- 6 types: Permitted Leaves, Unpermitted Leaves, Authorized Absence, Unauthorized Absence, Overtime, Late In
- Status workflow: Pending → Approved/Rejected
- Arabic translations included

### Departments
- 12 departments/subjects with Arabic names
- Teacher assignments and head of department
- Performance metrics and statistics

## 🚀 Quick Start

### Installation
```bash
cd server
npm install
```

### Generate Data
```bash
node scripts/processData.js
```

### Start Server
```bash
npm start
# or
npm run dev  # with nodemon for development
```

### Health Check
```
GET http://localhost:5000/api/health
```

## 📡 API Endpoints

### 🔍 Health & Status
- `GET /api/health` - Server health check

### 👥 Teachers
- `GET /api/teachers` - Get all teachers (with filtering, pagination)
- `GET /api/teachers/:id` - Get specific teacher
- `GET /api/teachers/:id/summary` - Get teacher summary with statistics
- `POST /api/teachers` - Create new teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

**Query Parameters:**
- `department`, `workType`, `status`, `search`
- `page`, `limit` (pagination)

### 📈 Attendance
- `GET /api/attendance` - Get all attendance records (with filtering)
- `GET /api/attendance/:teacherId` - Get teacher's attendance records
- `GET /api/attendance/:teacherId/:month/:year` - Get specific month record
- `GET /api/attendance/stats/overview` - Attendance overview statistics
- `GET /api/attendance/trends/monthly` - Monthly attendance trends
- `POST /api/attendance` - Create attendance record
- `PUT /api/attendance/:id` - Update attendance record
- `DELETE /api/attendance/:id` - Delete attendance record

### 📝 Requests
- `GET /api/requests` - Get all requests (with filtering)
- `GET /api/requests/:id` - Get specific request
- `GET /api/requests/types` - Get request types with translations
- `GET /api/requests/stats/summary` - Request statistics
- `POST /api/requests` - Create new request
- `PUT /api/requests/:id/approve` - Approve request
- `PUT /api/requests/:id/reject` - Reject request
- `PUT /api/requests/:id` - Update pending request
- `DELETE /api/requests/:id` - Delete pending request

### 🏢 Departments
- `GET /api/departments` - Get all departments with statistics
- `GET /api/departments/:id` - Get specific department details
- `GET /api/departments/:name/teachers` - Get teachers by department
- `GET /api/departments/stats/summary` - Department summary statistics
- `GET /api/departments/performance/ranking` - Performance rankings

### 📊 Dashboard
- `GET /api/dashboard/overview` - Comprehensive dashboard overview
- `GET /api/dashboard/analytics` - Analytics data for charts
- `GET /api/dashboard/alerts` - System alerts and notifications
- `GET /api/dashboard/quick-stats` - Quick statistics for widgets

## 📋 Request/Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully",
  "pagination": { /* if applicable */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

## 🌍 Business Logic

### Attendance Calculation
- **Full-time**: 22 working days/month, 8 hours/day
- **Part-time**: 11 working days/month, 8 hours/day
- **Attendance Rate**: (attended_days / total_working_days) × 100
- **Total Hours**: (attended_days × 8) + overtime_hours - late_hours

### Request Types (Arabic Translations)
- **Permitted Leaves** = "إجازات مسموح بها"
- **Unpermitted Leaves** = "إجازات غير مسموح بها"
- **Authorized Absence** = "غياب مصرح به"
- **Unauthorized Absence** = "غياب غير مصرح به"
- **Overtime** = "العمل الإضافي"
- **Late In** = "التأخير"

### Performance Metrics
- **Excellent**: 95%+ attendance
- **Good**: 85-94% attendance
- **Average**: 75-84% attendance
- **Poor**: <75% attendance

## 🔧 Configuration

### Environment Variables
```bash
PORT=5000                    # Server port
NODE_ENV=development         # Environment
```

### CORS Settings
```javascript
origin: ['http://localhost:3000', 'http://localhost:3001']
credentials: true
```

## 📁 Project Structure

```
server/
├── data/                    # JSON database files
│   ├── teachers.json
│   ├── attendance.json
│   ├── requests.json
│   └── departments.json
├── models/                  # Data models and schemas
│   └── index.js
├── routes/                  # API route handlers
│   ├── teachers.js
│   ├── attendance.js
│   ├── requests.js
│   ├── departments.js
│   └── dashboard.js
├── scripts/                 # Utility scripts
│   └── processData.js
├── utils/                   # Helper utilities
│   └── dataProcessor.js
├── package.json
├── server.js               # Main server file
└── README.md
```

## 🚀 Deployment

### Production Considerations
1. Replace JSON files with proper database (MongoDB, PostgreSQL)
2. Add authentication middleware
3. Implement rate limiting
4. Set up proper logging
5. Configure environment variables
6. Add data backup strategies

### Database Migration
The current JSON-based system can be easily migrated to any database by:
1. Updating the helper functions in routes
2. Adding database connection logic
3. Replacing file operations with database queries
4. Keeping the same API contracts

## 🧪 Testing

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Get all teachers
curl http://localhost:5000/api/teachers

# Get dashboard overview
curl http://localhost:5000/api/dashboard/overview
```

### Sample Data
- **24 Teachers**: 2 per department across 12 subjects
- **72 Attendance Records**: 3 months × 24 teachers
- **100+ Requests**: Various types with realistic data
- **12 Departments**: With Arabic translations

## 📞 Support

For questions or issues:
1. Check the API endpoint documentation above
2. Verify data files exist in `/data` directory
3. Ensure all dependencies are installed
4. Check server logs for detailed error messages

## 🔮 Future Enhancements

- Real database integration
- User authentication & authorization
- Real-time notifications
- Advanced analytics
- Export functionality
- Multi-language support
- Mobile API optimizations 