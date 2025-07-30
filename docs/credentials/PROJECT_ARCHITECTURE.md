# Genius Smart App - Project Architecture Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Database Design](#database-design)
7. [Authentication System](#authentication-system)
8. [API Documentation](#api-documentation)
9. [Security Features](#security-features)
10. [Deployment Guide](#deployment-guide)

---

## 1. Project Overview

**Genius Smart App** is a comprehensive attendance management system designed for educational institutions. It provides separate interfaces for:
- **Managers/Administrators**: Full system control, analytics, and management capabilities
- **Teachers**: Personal attendance tracking, request management, and profile management

### Key Features
- Real-time attendance tracking with location verification
- Multi-language support (English/Arabic) with RTL layout
- Hierarchical role-based access control (3-tier system)
- Advanced analytics and reporting
- Request management system (leave, absence, late arrival)
- Holiday and weekend management
- Email notifications

---

## 2. Architecture Overview

The application follows a **client-server architecture** with:
- **Frontend**: React SPA with TypeScript
- **Backend**: Express.js REST API
- **Database**: JSON file-based storage
- **Authentication**: Clerk (external service)

```
┌─────────────────┐     ┌─────────────────┐
│   React Client  │────▶│   Express API   │
│   (TypeScript)  │◀────│    (Node.js)    │
└─────────────────┘     └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │  JSON Database  │
         │              └─────────────────┘
         │                       
         ▼                      
┌─────────────────┐            
│  Clerk Auth     │            
└─────────────────┘            
```

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18.2.0
- **Language**: TypeScript 4.9.5
- **Build Tool**: Vite 4.1.0
- **Routing**: React Router DOM 6.8.0
- **Styling**: Styled Components 5.3.6
- **State Management**: React Context API
- **Forms**: React Hook Form 7.43.0
- **Charts**: Chart.js 4.5.0 + React Chart.js 2
- **Date Handling**: date-fns 4.1.0
- **PDF Generation**: jsPDF 3.0.1
- **Authentication**: Clerk React SDK 5.35.3

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Authentication**: Clerk Express SDK 1.7.10
- **Security**: Helmet 7.1.0, CORS 2.8.5
- **Validation**: Joi 17.11.0
- **Email**: Nodemailer 7.0.5
- **Password Hashing**: Bcrypt 6.0.0
- **Logging**: Morgan 1.10.0
- **Environment**: Dotenv 17.2.0

### Database
- **Type**: File-based JSON storage
- **Backup System**: Automated JSON backups
- **Data Files**:
  - `teachers.json`: Teacher profiles and credentials
  - `attendance.json`: Attendance records
  - `requests.json`: Leave/absence requests
  - `subjects.json`: Subject definitions
  - `holidays.json`: Holiday configurations
  - `managers.json`: Manager profiles
  - `system_roles.json`: Role definitions

---

## 4. Frontend Architecture

### Directory Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page-level components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── styles/             # Global styles and themes
├── types/              # TypeScript type definitions
└── config/             # Configuration files
```

### Key Components

#### Pages
- **AllRoleSelection**: Landing page for role selection
- **ManagerDashboard**: Main dashboard with analytics
- **ManagerTeachers**: Teacher management interface
- **ManagerRequests**: Request approval interface
- **TeacherHome**: Teacher dashboard with attendance
- **TeacherHistory**: Attendance history view

#### Core Components
- **Sidebar**: Navigation component with role-based menus
- **LanguageThemeSwitcher**: Language and theme controls
- **Analytics Components**: Various chart components
- **Modal Components**: Request, holiday, teacher management

### State Management
- **LanguageContext**: Manages language selection and translations
- **ThemeContext**: Handles dark/light theme switching
- **Local Storage**: Persists user preferences

### Routing Structure
```
/                           # Role selection
/manager-signin             # Manager login
/manager-dashboard          # Manager dashboard
/manager-teachers           # Teacher management
/manager-requests           # Request management
/manager-settings           # Settings page

/teacher-signin             # Teacher login
/teacher-home              # Teacher dashboard
/teacher-history           # Attendance history
/teacher-profile           # Profile management
```

---

## 5. Backend Architecture

### API Structure
```
server/
├── config/             # Server configuration
├── middleware/         # Custom middleware
├── models/            # Data models (JSON-based)
├── routes/            # API route handlers
├── utils/             # Utility functions
├── scripts/           # Database scripts
└── data/              # JSON database files
```

### Middleware Stack
1. **Security**: Helmet for security headers
2. **CORS**: Cross-origin resource sharing
3. **Logging**: Morgan for request logging
4. **Authentication**: Clerk middleware
5. **Data Tracking**: Custom audit trail
6. **Role Authorization**: Role-based access control

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Legacy login
- `POST /api/clerk/user/create` - Create Clerk user
- `GET /api/clerk/user/:id` - Get user details

#### Teachers
- `GET /api/teachers` - List all teachers
- `GET /api/teachers/:id` - Get teacher details
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

#### Attendance
- `POST /api/attendance/check-in` - Record check-in
- `POST /api/attendance/check-out` - Record check-out
- `GET /api/attendance/history/:teacherId` - Get history
- `GET /api/attendance/report` - Generate reports

#### Requests
- `GET /api/requests` - List requests
- `POST /api/requests` - Create request
- `PUT /api/requests/:id/status` - Update request status
- `GET /api/requests/teacher/:teacherId` - Get teacher requests

#### Analytics
- `GET /api/analytics/overview` - Dashboard statistics
- `GET /api/analytics/attendance` - Attendance analytics
- `GET /api/analytics/requests` - Request analytics

---

## 6. Database Design

### Data Models

#### Teacher Model
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "hashed",
  "role": "ADMIN|MANAGER|TEACHER",
  "roleLevel": "1|2|3",
  "authorities": ["string"],
  "subject": "string",
  "workType": "Full-time|Part-time",
  "status": "Active|Inactive",
  "address": "string",
  "employmentDate": "date",
  "allowedAbsenceDays": "number",
  "remainingLateEarlyHours": "number",
  "canAccessManagerPortal": "boolean",
  "canAccessTeacherPortal": "boolean",
  "canApproveRequests": "boolean"
}
```

#### Attendance Model
```json
{
  "id": "uuid",
  "teacherId": "uuid",
  "date": "date",
  "checkIn": "datetime",
  "checkOut": "datetime",
  "status": "present|absent|late|early-leave",
  "workingHours": "number",
  "overtimeHours": "number",
  "location": {
    "checkIn": { "lat": "number", "lng": "number" },
    "checkOut": { "lat": "number", "lng": "number" }
  }
}
```

#### Request Model
```json
{
  "id": "uuid",
  "teacherId": "uuid",
  "teacherName": "string",
  "type": "absence|leave|late-arrival",
  "date": "date",
  "reason": "string",
  "status": "pending|approved|rejected",
  "submittedAt": "datetime",
  "reviewedAt": "datetime",
  "reviewedBy": "uuid",
  "duration": "number"
}
```

### Relationships
- Teachers → Attendance (1:N)
- Teachers → Requests (1:N)
- Teachers → Subjects (N:M)
- Managers → Requests (approval relationship)

---

## 7. Authentication System

### Clerk Integration
- **User Management**: Centralized user authentication
- **Session Management**: Secure session handling
- **Multi-factor Authentication**: Optional 2FA
- **Password Reset**: Built-in password recovery

### Role-Based Access Control (RBAC)
```
Level 3: ADMIN
├── Full system access
├── All manager permissions
└── System administration

Level 2: MANAGER  
├── Approve/reject requests
├── Manage teachers
├── View analytics
└── Access reports

Level 1: TEACHER
├── Personal attendance
├── Submit requests
├── View own history
└── Update profile
```

### Authority System
Dynamic permission checking based on user authorities array:
- "Access Manager Portal"
- "Access Teacher Portal"
- "Add new teachers"
- "Edit Existing Teachers"
- "Accept and Reject All Requests"
- "View All Analytics"
- "System Administration"

---

## 8. API Documentation

### Request/Response Format

#### Standard Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Authentication Headers
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

### Pagination
```
GET /api/teachers?page=1&limit=10&sort=name&order=asc
```

### Filtering
```
GET /api/requests?status=pending&type=absence&date=2025-01-01
```

---

## 9. Security Features

### Application Security
- **HTTPS**: Enforced in production
- **CORS**: Restricted origins
- **Helmet**: Security headers
- **Input Validation**: Joi schema validation
- **SQL Injection**: N/A (JSON database)
- **XSS Protection**: React's built-in protection
- **CSRF**: Token-based protection

### Data Security
- **Password Hashing**: Bcrypt with salt rounds
- **Session Security**: Clerk managed sessions
- **API Rate Limiting**: Planned implementation
- **Audit Trail**: All data changes logged
- **Backup System**: Automated JSON backups

### Authentication Security
- **Multi-factor**: Available through Clerk
- **Session Timeout**: Configurable
- **Password Policy**: Enforced by Clerk
- **Account Lockout**: After failed attempts

---

## 10. Deployment Guide

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Clerk account
- Email service (SMTP)

### Environment Variables

#### Frontend (.env)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_***
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Genius Smart App
```

#### Backend (.env)
```env
PORT=5000
CLERK_SECRET_KEY=sk_***
CLERK_PUBLISHABLE_KEY=pk_***
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Build Process
```bash
# Frontend
cd client
npm install
npm run build

# Backend  
cd server
npm install
npm start
```

### Production Considerations
1. Use environment-specific configs
2. Enable HTTPS
3. Set up monitoring (PM2, etc.)
4. Configure backup automation
5. Set up error tracking
6. Enable rate limiting
7. Configure CDN for static assets

### Docker Deployment (Optional)
```dockerfile
# Frontend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
```

---

## Conclusion

This documentation provides a comprehensive overview of the Genius Smart App architecture. For specific implementation details, refer to the individual component documentation and code comments. 