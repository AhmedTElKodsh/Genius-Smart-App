# Genius Smart App - Backend API Documentation

## Table of Contents
1. [Backend Overview](#backend-overview)
2. [Server Architecture](#server-architecture)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [Authentication & Authorization](#authentication--authorization)
5. [Middleware Implementation](#middleware-implementation)
6. [Error Handling](#error-handling)
7. [Data Validation](#data-validation)
8. [Email Service](#email-service)
9. [Utility Functions](#utility-functions)
10. [Scripts and Tools](#scripts-and-tools)

---

## 1. Backend Overview

The Genius Smart App backend is a **RESTful API** built with Node.js and Express.js. It provides:
- **Dual Authentication**: Legacy system + Clerk integration
- **Role-Based Access Control**: 3-tier hierarchical system
- **JSON File Database**: Lightweight data persistence
- **Email Notifications**: SMTP-based email service
- **Audit Trail**: Comprehensive data tracking
- **Multi-language Support**: Arabic/English responses

### Technology Stack
```
Node.js → Express.js → JSON Database
    ↓          ↓            ↓
  Clerk    Middleware    File System
```

---

## 2. Server Architecture

### Directory Structure
```
server/
├── server.js              # Main application entry
├── config/               # Configuration files
├── middleware/           # Custom middleware
│   ├── authorityMiddleware.js
│   ├── dataTrackingMiddleware.js
│   └── roleAuthMiddleware.js
├── routes/               # API route handlers
│   ├── auth.js          # Legacy authentication
│   ├── teachers.js      # Teacher management
│   ├── attendance.js    # Attendance tracking
│   ├── requests.js      # Request management
│   ├── dashboard.js     # Dashboard data
│   ├── analytics.js     # Analytics endpoints
│   ├── subjects.js      # Subject management
│   ├── holidays.js      # Holiday management
│   ├── manager.js       # Manager operations
│   ├── clerkUser.js     # Clerk user management
│   ├── authorities.js   # Authority management
│   ├── auditTrail.js    # Audit logging
│   └── dataTracking.js  # Data change tracking
├── utils/               # Utility functions
│   ├── dateUtils.js     # Date/time utilities
│   ├── emailService.js  # Email functionality
│   ├── dataProcessor.js # Data processing
│   └── clerkUserUtils.js # Clerk helpers
├── scripts/             # Database scripts
└── data/               # JSON database files
```

### Server Configuration (`server.js`)
```javascript
// Core middleware setup
app.use(helmet());              // Security headers
app.use(cors(corsOptions));     // CORS configuration
app.use(morgan('combined'));    // Request logging
app.use(express.json());        // JSON parsing
app.use(dataTracking);          // Audit trail

// Dual routing system
app.use('/api', legacyRoutes);        // Legacy endpoints
app.use('/api/clerk', clerkRoutes);   // Clerk-protected endpoints
```

---

## 3. API Endpoints Reference

### Authentication Endpoints

#### Legacy Authentication
```
POST   /api/auth/login
POST   /api/auth/reset-password
POST   /api/auth/verify-otp
POST   /api/auth/update-password
```

#### Clerk Authentication
```
POST   /api/clerk/user/create
GET    /api/clerk/user/:id
PUT    /api/clerk/user/:id
DELETE /api/clerk/user/:id
```

### Teacher Management

#### List Teachers
```
GET /api/teachers
Query Parameters:
  - status: Active|Inactive
  - role: ADMIN|MANAGER|TEACHER
  - subject: string
  - page: number
  - limit: number
  - sort: name|email|employmentDate
  - order: asc|desc

Response:
{
  "success": true,
  "data": [{
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "string",
    "subject": "string",
    "status": "string"
  }],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

#### Get Teacher Details
```
GET /api/teachers/:id

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string",
    "role": "TEACHER",
    "authorities": ["string"],
    "attendance": {
      "present": 20,
      "absent": 2,
      "late": 3
    },
    "requests": {
      "approved": 5,
      "pending": 1,
      "rejected": 0
    }
  }
}
```

#### Create Teacher
```
POST /api/teachers
Body:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "role": "TEACHER",
  "subject": "string",
  "workType": "Full-time",
  "address": "string",
  "employmentDate": "2025-01-01"
}

Response:
{
  "success": true,
  "message": "Teacher created successfully",
  "data": {
    "id": "uuid",
    "email": "string"
  }
}
```

#### Update Teacher
```
PUT /api/teachers/:id
Body: (partial update supported)
{
  "name": "string",
  "phone": "string",
  "status": "Active|Inactive"
}
```

#### Delete Teacher
```
DELETE /api/teachers/:id

Response:
{
  "success": true,
  "message": "Teacher deleted successfully"
}
```

### Attendance Management

#### Check In
```
POST /api/attendance/check-in
Body:
{
  "teacherId": "uuid",
  "location": {
    "lat": 24.7136,
    "lng": 46.6753
  }
}

Response:
{
  "success": true,
  "message": "Check-in recorded successfully",
  "data": {
    "attendanceId": "uuid",
    "checkInTime": "2025-01-27T08:00:00.000Z",
    "status": "present|late"
  }
}
```

#### Check Out
```
POST /api/attendance/check-out
Body:
{
  "teacherId": "uuid",
  "attendanceId": "uuid",
  "location": {
    "lat": 24.7136,
    "lng": 46.6753
  }
}

Response:
{
  "success": true,
  "message": "Check-out recorded successfully",
  "data": {
    "workingHours": 8.5,
    "overtimeHours": 0.5
  }
}
```

#### Get Attendance History
```
GET /api/attendance/history/:teacherId
Query Parameters:
  - startDate: YYYY-MM-DD
  - endDate: YYYY-MM-DD
  - status: present|absent|late
  - page: number
  - limit: number

Response:
{
  "success": true,
  "data": [{
    "id": "uuid",
    "date": "2025-01-27",
    "checkIn": "08:00:00",
    "checkOut": "17:00:00",
    "status": "present",
    "workingHours": 8,
    "overtimeHours": 0
  }],
  "summary": {
    "totalDays": 20,
    "presentDays": 18,
    "absentDays": 2,
    "lateDays": 3,
    "totalWorkingHours": 160,
    "totalOvertimeHours": 5
  }
}
```

### Request Management

#### Submit Request
```
POST /api/requests
Body:
{
  "teacherId": "uuid",
  "type": "absence|leave|late-arrival",
  "date": "2025-01-28",
  "reason": "string",
  "duration": 2,
  "priority": "normal|urgent"
}

Response:
{
  "success": true,
  "message": "Request submitted successfully",
  "data": {
    "requestId": "uuid",
    "status": "pending"
  }
}
```

#### Update Request Status
```
PUT /api/requests/:id/status
Body:
{
  "status": "approved|rejected",
  "reviewerId": "uuid",
  "reviewNotes": "string"
}

Response:
{
  "success": true,
  "message": "Request approved/rejected successfully",
  "emailSent": true
}
```

#### Get Requests
```
GET /api/requests
Query Parameters:
  - status: pending|approved|rejected
  - type: absence|leave|late-arrival
  - teacherId: uuid
  - date: YYYY-MM-DD
  - sort: date|submittedAt
  - order: asc|desc

Response:
{
  "success": true,
  "data": [{
    "id": "uuid",
    "teacherName": "string",
    "type": "absence",
    "date": "2025-01-28",
    "reason": "string",
    "status": "pending",
    "submittedAt": "datetime"
  }]
}
```

### Analytics Endpoints

#### Dashboard Overview
```
GET /api/analytics/overview
Query Parameters:
  - startDate: YYYY-MM-DD
  - endDate: YYYY-MM-DD

Response:
{
  "success": true,
  "data": {
    "totalTeachers": 50,
    "activeTeachers": 48,
    "todayAttendance": {
      "present": 45,
      "absent": 3,
      "late": 2
    },
    "pendingRequests": 5,
    "monthlyStats": {
      "averageAttendance": 94.5,
      "totalRequests": 25,
      "approvedRequests": 20
    }
  }
}
```

#### Attendance Analytics
```
GET /api/analytics/attendance
Query Parameters:
  - period: daily|weekly|monthly
  - startDate: YYYY-MM-DD
  - endDate: YYYY-MM-DD
  - groupBy: teacher|subject|department

Response:
{
  "success": true,
  "data": {
    "chartData": [{
      "date": "2025-01-27",
      "present": 45,
      "absent": 3,
      "late": 2
    }],
    "summary": {
      "averageAttendanceRate": 94.5,
      "mostAbsent": ["teacherId1", "teacherId2"],
      "perfectAttendance": ["teacherId3", "teacherId4"]
    }
  }
}
```

---

## 4. Authentication & Authorization

### Dual Authentication System

#### 1. Legacy Authentication
```javascript
// routes/auth.js
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const teacher = teachers.find(t => t.email === email);
  if (!teacher) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid credentials' 
    });
  }
  
  // Verify password
  const isValid = await bcrypt.compare(password, teacher.password);
  if (!isValid) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid credentials' 
    });
  }
  
  // Generate token
  const token = jwt.sign(
    { id: teacher.id, role: teacher.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({ success: true, token, user: teacher });
});
```

#### 2. Clerk Authentication
```javascript
// middleware/clerkAuth.js
const { requireAuth } = require('@clerk/express');

// Protected route example
router.get('/protected', requireAuth(), (req, res) => {
  // req.auth contains user info from Clerk
  const userId = req.auth.userId;
  const sessionId = req.auth.sessionId;
  
  res.json({ 
    success: true, 
    userId, 
    sessionId 
  });
});
```

### Role-Based Access Control

#### Authority Middleware
```javascript
// middleware/authorityMiddleware.js
const checkAuthority = (requiredAuthority) => {
  return (req, res, next) => {
    const user = req.user || req.auth;
    
    if (!user.authorities.includes(requiredAuthority)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Usage
router.post('/teachers', 
  checkAuthority('Add new teachers'), 
  createTeacher
);
```

#### Role Hierarchy
```javascript
const ROLE_HIERARCHY = {
  ADMIN: { level: 3, inherits: ['MANAGER', 'TEACHER'] },
  MANAGER: { level: 2, inherits: ['TEACHER'] },
  TEACHER: { level: 1, inherits: [] }
};

const hasRole = (userRole, requiredRole) => {
  const userLevel = ROLE_HIERARCHY[userRole].level;
  const requiredLevel = ROLE_HIERARCHY[requiredRole].level;
  return userLevel >= requiredLevel;
};
```

---

## 5. Middleware Implementation

### Data Tracking Middleware
```javascript
// middleware/dataTrackingMiddleware.js
const trackDataChange = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log successful data modifications
    if (res.statusCode < 400 && 
        ['POST', 'PUT', 'DELETE'].includes(req.method)) {
      
      const tracking = {
        id: uuid.v4(),
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        userId: req.user?.id || 'anonymous',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        body: req.body,
        response: JSON.parse(data)
      };
      
      // Save to tracking file
      saveTracking(tracking);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};
```

### Error Handling Middleware
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
};
```

### Rate Limiting (Planned)
```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different limits for different endpoints
const loginLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests
  'Too many login attempts'
);

const apiLimiter = createLimiter(
  1 * 60 * 1000, // 1 minute
  60, // 60 requests
  'Too many requests'
);
```

---

## 6. Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional information
}
```

### Error Codes
```javascript
const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'AUTH001',
  TOKEN_EXPIRED: 'AUTH002',
  UNAUTHORIZED: 'AUTH003',
  
  // Validation
  MISSING_REQUIRED_FIELD: 'VAL001',
  INVALID_EMAIL: 'VAL002',
  INVALID_DATE: 'VAL003',
  
  // Business Logic
  TEACHER_NOT_FOUND: 'BUS001',
  DUPLICATE_EMAIL: 'BUS002',
  INVALID_REQUEST_STATUS: 'BUS003',
  
  // System
  DATABASE_ERROR: 'SYS001',
  EMAIL_SEND_FAILED: 'SYS002',
  FILE_OPERATION_FAILED: 'SYS003'
};
```

### Error Handling Examples
```javascript
// Validation error
if (!email || !isValidEmail(email)) {
  return res.status(400).json({
    success: false,
    error: 'Invalid email address',
    code: ERROR_CODES.INVALID_EMAIL
  });
}

// Not found error
const teacher = teachers.find(t => t.id === id);
if (!teacher) {
  return res.status(404).json({
    success: false,
    error: 'Teacher not found',
    code: ERROR_CODES.TEACHER_NOT_FOUND
  });
}

// Business logic error
if (request.status !== 'pending') {
  return res.status(400).json({
    success: false,
    error: 'Only pending requests can be approved',
    code: ERROR_CODES.INVALID_REQUEST_STATUS,
    details: { currentStatus: request.status }
  });
}
```

---

## 7. Data Validation

### Joi Validation Schemas

#### Teacher Schema
```javascript
const Joi = require('joi');

const teacherSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\d{10,15}$/).required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'TEACHER').required(),
  subject: Joi.string().required(),
  workType: Joi.string().valid('Full-time', 'Part-time').default('Full-time'),
  address: Joi.string().max(200),
  employmentDate: Joi.date().max('now').required()
});

// Usage
const validateTeacher = (req, res, next) => {
  const { error } = teacherSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};
```

#### Request Schema
```javascript
const requestSchema = Joi.object({
  teacherId: Joi.string().uuid().required(),
  type: Joi.string().valid('absence', 'leave', 'late-arrival').required(),
  date: Joi.date().min('now').required(),
  reason: Joi.string().min(10).max(500).required(),
  duration: Joi.number().positive().required(),
  priority: Joi.string().valid('normal', 'urgent').default('normal')
});
```

### Custom Validators
```javascript
// Email uniqueness validator
const validateUniqueEmail = async (email, excludeId = null) => {
  const teachers = await loadTeachers();
  return !teachers.some(t => 
    t.email === email && t.id !== excludeId
  );
};

// Date range validator
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

// Working hours validator
const validateWorkingHours = (checkIn, checkOut) => {
  const minHours = 0;
  const maxHours = 24;
  const hours = calculateHours(checkIn, checkOut);
  return hours >= minHours && hours <= maxHours;
};
```

---

## 8. Email Service

### Email Configuration
```javascript
// utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### Email Templates

#### Request Approval Email
```javascript
const sendApprovalEmail = async (teacher, request) => {
  const mailOptions = {
    from: `"Genius Smart App" <${process.env.EMAIL_USER}>`,
    to: teacher.email,
    subject: 'Request Approved',
    html: `
      <h2>Request Approved</h2>
      <p>Dear ${teacher.name},</p>
      <p>Your ${request.type} request for ${request.date} has been approved.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Type: ${request.type}</li>
        <li>Date: ${request.date}</li>
        <li>Duration: ${request.duration} hours</li>
        <li>Approved by: ${request.reviewerName}</li>
      </ul>
      <p>Best regards,<br>Genius Smart Team</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
};
```

#### Password Reset Email
```javascript
const sendPasswordResetEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Genius Smart App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset OTP',
    html: `
      <h2>Password Reset Request</h2>
      <p>Your OTP for password reset is:</p>
      <h1 style="color: #2563eb; font-size: 32px;">${otp}</h1>
      <p>This OTP will expire in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
};
```

---

## 9. Utility Functions

### Date Utilities
```javascript
// utils/dateUtils.js

// Calculate working hours
const calculateWorkingHours = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const hours = (end - start) / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100;
};

// Check if date is weekend
const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 5 || day === 6; // Friday or Saturday
};

// Format date for display
const formatDate = (date, locale = 'en') => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(date).toLocaleDateString(locale, options);
};

// Get date range
const getDateRange = (period) => {
  const end = new Date();
  const start = new Date();
  
  switch(period) {
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setMonth(end.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(end.getFullYear() - 1);
      break;
  }
  
  return { start, end };
};
```

### Data Processing Utilities
```javascript
// utils/dataProcessor.js

// Group data by property
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

// Calculate statistics
const calculateStats = (data, field) => {
  const values = data.map(item => item[field]);
  return {
    sum: values.reduce((a, b) => a + b, 0),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    count: values.length
  };
};

// Paginate results
const paginate = (array, page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return {
    data: array.slice(start, end),
    pagination: {
      page,
      limit,
      total: array.length,
      totalPages: Math.ceil(array.length / limit)
    }
  };
};
```

---

## 10. Scripts and Tools

### Database Management Scripts

#### Import Employee Data
```javascript
// scripts/importRealEmployeeData.js
const importEmployees = async () => {
  const csvData = await readCSV('./data/employees.csv');
  const teachers = [];
  
  for (const row of csvData) {
    const teacher = {
      id: uuid.v4(),
      name: row['Name'],
      email: row['Email'],
      phone: row['Phone'],
      role: mapRole(row['Position']),
      subject: row['Subject'],
      employmentDate: row['Start Date'],
      password: await bcrypt.hash(generatePassword(), 10),
      createdAt: new Date().toISOString()
    };
    
    teachers.push(teacher);
  }
  
  await saveTeachers(teachers);
  console.log(`Imported ${teachers.length} teachers`);
};
```

#### Generate Test Data
```javascript
// scripts/generateTestData.js
const generateAttendanceData = (teacherId, days = 30) => {
  const attendance = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    if (!isWeekend(date)) {
      attendance.push({
        id: uuid.v4(),
        teacherId,
        date: date.toISOString().split('T')[0],
        checkIn: randomTime('08:00', '09:00'),
        checkOut: randomTime('16:00', '18:00'),
        status: randomChoice(['present', 'present', 'late']),
        workingHours: randomNumber(7, 9)
      });
    }
  }
  
  return attendance;
};
```

#### Backup Database
```javascript
// scripts/backupDatabase.js
const backupDatabase = async () => {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupDir = `./backups/${timestamp}`;
  
  // Create backup directory
  await fs.mkdir(backupDir, { recursive: true });
  
  // Backup all JSON files
  const files = ['teachers.json', 'attendance.json', 'requests.json'];
  
  for (const file of files) {
    const source = `./data/${file}`;
    const dest = `${backupDir}/${file}`;
    await fs.copyFile(source, dest);
  }
  
  console.log(`Backup created at ${backupDir}`);
};
```

### Development Tools

#### Data Validation Script
```javascript
// scripts/validateData.js
const validateDatabase = async () => {
  const errors = [];
  
  // Check teacher references
  const teachers = await loadTeachers();
  const teacherIds = new Set(teachers.map(t => t.id));
  
  // Validate attendance records
  const attendance = await loadAttendance();
  attendance.forEach(record => {
    if (!teacherIds.has(record.teacherId)) {
      errors.push(`Orphaned attendance record: ${record.id}`);
    }
  });
  
  // Validate requests
  const requests = await loadRequests();
  requests.forEach(request => {
    if (!teacherIds.has(request.teacherId)) {
      errors.push(`Orphaned request: ${request.id}`);
    }
  });
  
  if (errors.length > 0) {
    console.error('Validation errors found:', errors);
  } else {
    console.log('Database validation passed');
  }
};
```

---

## Conclusion

This backend API provides a robust foundation for the Genius Smart attendance management system. Key strengths include:
- **Flexible Authentication**: Supporting both legacy and modern auth systems
- **Comprehensive API**: Full CRUD operations for all entities
- **Strong Validation**: Input validation and data integrity checks
- **Audit Trail**: Complete tracking of all data modifications
- **Email Integration**: Automated notifications for key events
- **Scalable Architecture**: Modular design ready for future enhancements

For deployment and production considerations, refer to the main architecture documentation. 