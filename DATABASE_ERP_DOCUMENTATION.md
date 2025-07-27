# 🏫 Genius Smart Attendance System - ERP Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Database Structure](#database-structure)
3. [Entity Relationship Diagram](#entity-relationship-diagram)
4. [Authority Management System](#authority-management-system)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Data Flow Architecture](#data-flow-architecture)
7. [Arabic Language Support](#arabic-language-support)
8. [Security Implementation](#security-implementation)

---

## 🎯 System Overview

### Purpose
Genius Smart Attendance System is a comprehensive educational institution management platform designed specifically for **Arabic-speaking educational environments**. The system manages teacher attendance, requests, and administrative operations with a **hierarchical authority-based access control system**.

### Key Features
- ✅ **Multi-level Authority Management** (Admin, Limited, Basic)
- ✅ **Arabic-First Interface** with RTL support
- ✅ **Real-time Attendance Tracking**
- ✅ **Teacher Request Management**
- ✅ **Comprehensive Reporting System**
- ✅ **Granular Permission Control**
- ✅ **Employment History Tracking**

### Technology Stack
- **Frontend**: React + TypeScript + Styled Components
- **Backend**: Node.js + Express.js
- **Database**: JSON-based file system with UTF-8 encoding
- **Authentication**: JWT-based tokens
- **Language**: Arabic (default) + English support

---

## 🗄️ Database Structure

### File-Based Database System
The system uses a JSON-based file structure for data persistence, optimized for Arabic text storage with proper UTF-8 encoding.

### Database Files Location
```
server/data/
├── managers.json      # Management staff data
├── teachers.json      # Teacher information & authorities
├── attendance.json    # Daily attendance records
├── requests.json      # Leave/absence requests
├── subjects.json      # Academic subjects
└── departments.json   # Organizational departments
```

---

## 📊 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      GENIUS SMART ATTENDANCE SYSTEM                             │
│                           DATABASE SCHEMA                                       │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐    manages    ┌──────────────────┐    belongs to   ┌─────────────┐
│    MANAGERS      │◄──────────────│    TEACHERS      │────────────────►│  SUBJECTS   │
│                  │               │                  │                 │             │
│ • id (PK)        │               │ • id (PK)        │                 │ • id (PK)   │
│ • email          │               │ • name           │                 │ • name      │
│ • password       │               │ • nameArabic     │                 │ • nameAr    │
│ • name           │               │ • email          │                 │ • count     │
│ • nameArabic     │               │ • phone          │                 │ • createdAt │
│ • role           │               │ • address        │                 └─────────────┘
│ • department     │               │ • birthdate      │                        │
│ • managerLevel   │               │ • employmentDate │                        │
│ • authorities    │               │ • subject        │◄───────────────────────┘
│   - canAccessPortal             │ • workType       │
│   - canAddTeachers              │ • password       │
│   - canEditTeachers             │ • status         │
│   - canManageRequests           │ • authorities    │
│   - canDownloadReports          │ • managementLevel│
│   - canManageAuthorities        │ • createdAt      │
│ • createdAt      │               │ • updatedAt      │
│ • isActive       │               └──────────────────┘
└──────────────────┘                        │
         │                                  │ submits
         │                                  ▼
         │ approves/rejects    ┌──────────────────┐
         └────────────────────►│    REQUESTS      │
                               │                  │
                               │ • id (PK)        │
                               │ • teacherId (FK) │
                               │ • teacherName    │
                               │ • teacherNameAr  │
                               │ • type           │
                               │ • duration       │
                               │ • fromDate       │
                               │ • toDate         │
                               │ • reason         │
                               │ • reasonArabic   │
                               │ • status         │
                               │ • result         │
                               │ • submittedAt    │
                               │ • processedAt    │
                               │ • managerNotes   │
                               └──────────────────┘
                                        │
                                        │ records
                                        ▼
                               ┌──────────────────┐
                               │   ATTENDANCE     │
                               │                  │
                               │ • id (PK)        │
                               │ • teacherId (FK) │
                               │ • teacherName    │
                               │ • teacherNameAr  │
                               │ • date           │
                               │ • checkIn        │
                               │ • checkOut       │
                               │ • status         │
                               │ • totalHours     │
                               │ • isLate         │
                               │ • earlyLeave     │
                               │ • notes          │
                               │ • location       │
                               └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                            AUTHORITY HIERARCHY                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

        ┌─────────────────┐
        │   ADMIN LEVEL   │ (Ibrahim Hamdy, Amer Zaher)
        │                 │ 
        │ ✅ All Authorities
        │ ✅ Manage Others
        │ ✅ Teacher CRUD
        │ ✅ Authority Assignment
        └─────────────────┘
                │
                │ manages
                ▼
        ┌─────────────────┐
        │  LIMITED LEVEL  │ (Mahitab Mustafa)
        │                 │
        │ ✅ Portal Access
        │ ✅ Request Management  
        │ ✅ Download Reports
        │ ❌ Teacher Management
        └─────────────────┘
                │
                │ alongside
                ▼
        ┌─────────────────┐
        │   BASIC LEVEL   │ (Ebtahal, Adel)
        │                 │
        │ ✅ Portal Access
        │ ✅ Download Reports
        │ ❌ Request Management
        │ ❌ Teacher Management
        └─────────────────┘
                │
                │ can manage
                ▼
        ┌─────────────────┐
        │ TEACHER MEMBERS │ (Configurable)
        │                 │
        │ 🔧 Custom Authorities
        │ 🔧 Assigned by Admins
        │ 🔧 Flexible Roles
        └─────────────────┘
```

---

## 🔐 Authority Management System

### Authority Levels

| Level | Arabic Name | Users | Authorities |
|-------|-------------|-------|-------------|
| **Admin** | مدير عام | Ibrahim Hamdy, Amer Zaher | All permissions + authority management |
| **Limited** | مدير محدود | Mahitab Mustafa | Portal, Requests, Reports |
| **Basic** | مدير أساسي | Ebtahal, Adel | Portal, Reports only |
| **Member** | عضو إدارة | Configurable Teachers | Custom permissions |

### Authority Matrix

```
┌──────────────────────────┬───────┬─────────┬───────┬────────┐
│        Authority         │ Admin │ Limited │ Basic │ Member │
├──────────────────────────┼───────┼─────────┼───────┼────────┤
│ Access Portal            │  ✅   │   ✅    │  ✅   │   🔧   │
│ Add Teachers             │  ✅   │   ❌    │  ❌   │   🔧   │
│ Edit Teachers            │  ✅   │   ❌    │  ❌   │   🔧   │
│ Manage Requests          │  ✅   │   ✅    │  ❌   │   🔧   │
│ Download Reports         │  ✅   │   ✅    │  ✅   │   🔧   │
│ Manage Authorities       │  ✅   │   ❌    │  ❌   │   ❌   │
└──────────────────────────┴───────┴─────────┴───────┴────────┘

Legend: ✅ Allowed  ❌ Denied  🔧 Configurable
```

### Manager Profiles

#### 👑 Admin Managers
```json
{
  "managerLevel": "admin",
  "authorities": {
    "canAccessPortal": true,
    "canAddTeachers": true,
    "canEditTeachers": true,
    "canManageRequests": true,
    "canDownloadReports": true,
    "canManageAuthorities": true
  }
}
```

**Accounts:**
- **Ibrahim Hamdy** (`ibrahimmizo55@gmail.com`)
- **Amer Zaher** (`badrsalah525@gmail.com`)

#### 🎯 Limited Manager
```json
{
  "managerLevel": "limited",
  "authorities": {
    "canAccessPortal": true,
    "canAddTeachers": false,
    "canEditTeachers": false,
    "canManageRequests": true,
    "canDownloadReports": true,
    "canManageAuthorities": false
  }
}
```

**Account:**
- **Mahitab Mustafa** (`mahetabmostafa92@gmail.com`)

#### 📊 Basic Managers
```json
{
  "managerLevel": "basic",
  "authorities": {
    "canAccessPortal": true,
    "canAddTeachers": false,
    "canEditTeachers": false,
    "canManageRequests": false,
    "canDownloadReports": true,
    "canManageAuthorities": false
  }
}
```

**Accounts:**
- **Ebtahal Al-Zahra** (`ebtahal@genius.edu`)
- **Adel Hassan** (`adel@genius.edu`)

---

## 🌐 API Endpoints Reference

### Authentication Endpoints
```
POST   /api/auth/manager/signin          # Manager login
POST   /api/auth/manager/reset-password  # Password reset
GET    /api/auth/manager/verify          # Token verification
```

### Teacher Management (Admin Only)
```
GET    /api/teachers                     # List all teachers
POST   /api/teachers                     # Create new teacher
PUT    /api/teachers/:id                 # Update teacher
DELETE /api/teachers/:id                 # Delete teacher
GET    /api/teachers/reports             # Teacher reports
```

### Request Management
```
GET    /api/requests                     # List requests (filtered by authority)
POST   /api/requests                     # Submit new request
PUT    /api/requests/:id                 # Approve/reject request
GET    /api/requests/completed           # Admin: View all completed requests
POST   /api/requests/cleanup             # Admin: Cleanup old requests
```

### Authority Management (Admin Only)
```
GET    /api/authorities/available        # Get available authorities
PUT    /api/authorities/teacher/:id      # Update teacher authorities
GET    /api/authorities/teacher/:id      # Get teacher authorities
```

### Dashboard Data
```
GET    /api/dashboard/overview           # Dashboard statistics
GET    /api/dashboard/today-checkins     # Today's check-ins
GET    /api/dashboard/today-accepted-requests  # Today's accepted requests
GET    /api/dashboard/missing-teachers   # Missing teachers today
GET    /api/dashboard/immediate-requests # Urgent pending requests
```

### Subjects & Departments
```
GET    /api/subjects                     # List academic subjects
GET    /api/departments                  # List departments
```

---

## 🏗️ Data Flow Architecture

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM ARCHITECTURE                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

 Frontend (React + TypeScript)           Backend (Node.js + Express)
┌─────────────────────────────┐         ┌────────────────────────────┐
│                             │   HTTP  │                            │
│  🌐 Manager Portal (Arabic) │◄───────►│  🛡️ Authority Middleware   │
│                             │ Requests│                            │
│  📱 Responsive UI           │         │  🔐 JWT Authentication     │
│  🎨 Arabic RTL Support      │         │                            │
│  📊 Real-time Dashboard     │         │  📊 Business Logic         │
│  🔧 Authority-based UI      │         │                            │
└─────────────────────────────┘         └────────────────────────────┘
                                                    │
                                                    │ File I/O
                                                    ▼
                                        ┌────────────────────────────┐
                                        │     📁 JSON Database       │
                                        │                            │
                                        │  managers.json (UTF-8)     │
                                        │  teachers.json (UTF-8)     │
                                        │  requests.json (UTF-8)     │
                                        │  attendance.json (UTF-8)   │
                                        │  subjects.json (UTF-8)     │
                                        └────────────────────────────┘
```

### Request Processing Flow
```
1. 👤 User Action (Arabic Interface)
        ↓
2. 🔐 Authentication Check (JWT Token)
        ↓
3. 🛡️ Authority Validation (Middleware)
        ↓
4. 📊 Business Logic Processing
        ↓
5. 📁 Database Operation (UTF-8 JSON)
        ↓
6. 📤 Response (Arabic/English)
        ↓
7. 🎨 UI Update (RTL/LTR Support)
```

### Authority Check Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Extract Token  │───►│  Find Manager   │───►│ Check Authority │
│                 │    │                 │    │                 │
│ • JWT decode    │    │ • Load managers │    │ • Match required│
│ • Get manager ID│    │ • Verify active │    │ • Validate perm │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   ❌ Invalid            ❌ Not Found           ✅ Authorized
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ Execute Request │
                                              │                 │
                                              │ • Process data  │
                                              │ • Save to DB    │
                                              │ • Return result │
                                              └─────────────────┘
```

---

## 🇸🇦 Arabic Language Support

### Default Language Configuration
The system defaults to **Arabic (العربية)** as the primary language:

```typescript
// Language Context Default
const [language, setLanguage] = useState<Language>(() => {
  const savedLanguage = localStorage.getItem('managerLanguage') as Language;
  return savedLanguage || 'ar'; // ✅ Defaults to Arabic
});
```

### RTL (Right-to-Left) Support
```css
/* Automatic RTL when Arabic is selected */
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'ar';

/* CSS Custom Properties */
--text-align-start: right;
--text-align-end: left;
```

### Arabic Data Storage

#### UTF-8 Encoding
All database files use UTF-8 encoding to properly store Arabic characters:

```json
{
  "name": "أحمد حسن",
  "nameArabic": "أحمد حسن محمد",
  "address": "شارع الملك فهد، الرياض",
  "subject": "اللغة العربية",
  "reason": "مرض في العائلة"
}
```

#### Bilingual Data Fields
Many entities support both Arabic and English:

```json
{
  "subjects": {
    "name": "Arabic",
    "nameAr": "اللغة العربية"
  },
  "teachers": {
    "name": "Ahmed Hassan",
    "nameArabic": "أحمد حسن"
  }
}
```

### Arabic-First UI Components

#### Dashboard Charts
- **Arabic Labels**: All chart titles and data in Arabic
- **Arabic Numbers**: Using Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩)
- **RTL Layout**: Charts flow right-to-left

#### Forms and Modals
- **Arabic Placeholders**: Form fields show Arabic text
- **Arabic Validation**: Error messages in Arabic
- **Arabic Buttons**: Action buttons in Arabic

#### Calendar Support
- **Hijri Calendar**: Optional Islamic calendar support
- **Arabic Months**: Month names in Arabic
- **Arabic Day Names**: Day abbreviations in Arabic

---

## 🔒 Security Implementation

### Authentication System
```javascript
// JWT Token Structure
{
  "token": "gse_MGR_ADM001_1753364576171",
  "manager": {
    "id": "MGR_ADM001",
    "name": "Ibrahim Hamdy",
    "nameArabic": "إبراهيم حمدي",
    "authorities": { /* ... */ }
  }
}
```

### Password Security
- **bcrypt Hashing**: All passwords hashed with salt
- **Minimum Requirements**: 8+ characters
- **Arabic Support**: Passwords can contain Arabic characters

### Route Protection
Each API endpoint is protected by appropriate middleware:

```javascript
// Example: Teacher creation requires specific authority
router.post('/teachers', 
  extractManagerEmail, 
  checkAddTeacherAuthority, 
  createTeacher
);
```

### Data Validation
- **Input Sanitization**: XSS protection for Arabic text
- **Type Validation**: Proper data type checking
- **Arabic Text Validation**: UTF-8 compliance

---

## 📈 Employment History Tracking

### Employment Date Management
All teachers now include employment history:

```json
{
  "teacherId": "uuid",
  "employmentDate": "2023-09-01",
  "employmentCategory": "recent|mid-tenure|senior"
}
```

### Employment Categories
- **Recent Hires** (< 3 months): 8 teachers (32%)
- **Mid-Tenure** (3 months - 2 years): 10 teachers (40%)
- **Senior Employees** (2+ years): 7 teachers (28%)

### Employment Analytics
The system automatically categorizes teachers for:
- **Probation Period Tracking**
- **Tenure Analysis**
- **Retention Reporting**
- **Performance Evaluation Timing**

---

## 📊 Database Schema Details

### Managers Table Structure
```json
{
  "id": "string (Primary Key)",
  "email": "string (Unique)",
  "password": "string (bcrypt hash)",
  "name": "string",
  "nameArabic": "string",
  "role": "string",
  "department": "string",
  "managerLevel": "admin|limited|basic",
  "authorities": {
    "canAccessPortal": "boolean",
    "canAddTeachers": "boolean", 
    "canEditTeachers": "boolean",
    "canManageRequests": "boolean",
    "canDownloadReports": "boolean",
    "canManageAuthorities": "boolean"
  },
  "createdAt": "ISO Date string",
  "lastLogin": "ISO Date string",
  "isActive": "boolean"
}
```

### Teachers Table Structure
```json
{
  "id": "string (Primary Key)",
  "name": "string",
  "nameArabic": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string (Unique)",
  "phone": "string",
  "address": "string",
  "birthdate": "ISO Date string",
  "employmentDate": "ISO Date string",
  "subject": "string (Foreign Key to subjects)",
  "workType": "Full-time|Part-time",
  "password": "string (bcrypt hash)",
  "status": "Active|Inactive",
  "authorities": {
    "canAccessPortal": "boolean",
    "canAddTeachers": "boolean",
    "canEditTeachers": "boolean", 
    "canManageRequests": "boolean",
    "canDownloadReports": "boolean",
    "canManageAuthorities": "boolean"
  },
  "managementLevel": "member|none",
  "createdAt": "ISO Date string",
  "updatedAt": "ISO Date string"
}
```

### Requests Table Structure
```json
{
  "id": "string (Primary Key)",
  "teacherId": "string (Foreign Key)",
  "teacherName": "string",
  "teacherNameArabic": "string",
  "type": "earlyLeave|lateArrival|sickLeave|personal|travel|other",
  "duration": "string",
  "fromDate": "ISO Date string",
  "toDate": "ISO Date string", 
  "reason": "string",
  "reasonArabic": "string",
  "status": "pending|approved|rejected",
  "result": "string",
  "submittedAt": "ISO Date string",
  "processedAt": "ISO Date string",
  "managerNotes": "string",
  "isDelayed": "boolean"
}
```

### Attendance Table Structure
```json
{
  "id": "string (Primary Key)",
  "teacherId": "string (Foreign Key)",
  "teacherName": "string",
  "teacherNameArabic": "string",
  "date": "ISO Date string",
  "checkIn": "ISO DateTime string",
  "checkOut": "ISO DateTime string",
  "status": "present|absent|late|excused",
  "totalHours": "number",
  "isLate": "boolean",
  "earlyLeave": "boolean",
  "notes": "string",
  "location": "string"
}
```

---

## 🚀 System Deployment Guide

### Prerequisites
- **Node.js**: v16+ 
- **NPM**: v8+
- **UTF-8 Support**: Server must support Unicode

### Environment Setup
```bash
# Backend Environment
cd server
npm install

# Frontend Environment  
cd ../
npm install
```

### Arabic Font Configuration
Ensure proper Arabic font rendering:

```css
/* System Fonts */
font-family: 'Segoe UI', 'Tahoma', 'Arial', sans-serif;

/* Arabic-specific */
font-family: 'Traditional Arabic', 'Arial Unicode MS', sans-serif;
```

### Database Initialization
The system auto-creates database files with proper UTF-8 encoding:

```javascript
// Automatic UTF-8 encoding
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
```

---

## 📞 Support & Maintenance

### System Administrator Contacts
- **Technical Lead**: Ibrahim Hamdy
- **System Admin**: Amer Zaher
- **User Support**: Mahitab Mustafa

### Backup Strategy
- **Daily JSON Backups**: Automatic file system backup
- **Authority Configuration**: Backed up in git repository
- **User Data**: Weekly manual backups recommended

### Performance Monitoring
- **File Size Monitoring**: JSON files growth tracking
- **API Response Times**: Monitor Arabic text processing
- **Memory Usage**: UTF-8 string memory optimization

---

## 📝 Change Log

### Version 2.0.0 - Authority System Implementation
- ✅ **Added**: Granular authority management
- ✅ **Added**: Employment date tracking
- ✅ **Updated**: Arabic-first interface
- ✅ **Enhanced**: Manager hierarchy system
- ✅ **Improved**: Database structure for multilingual support

### Version 1.5.0 - Arabic Localization
- ✅ **Added**: Complete Arabic translation
- ✅ **Added**: RTL layout support
- ✅ **Added**: Arabic calendar integration
- ✅ **Fixed**: UTF-8 encoding issues

---

*Documentation last updated: January 2025*
*Language Priority: Arabic (العربية) - Default | English - Secondary* 