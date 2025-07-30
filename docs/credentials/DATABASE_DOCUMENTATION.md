# Genius Smart App - Database Documentation

## Table of Contents
1. [Database Overview](#database-overview)
2. [Data Storage Architecture](#data-storage-architecture)
3. [Core Data Models](#core-data-models)
4. [Data Relationships](#data-relationships)
5. [Data Operations](#data-operations)
6. [Backup and Recovery](#backup-and-recovery)
7. [Data Integrity](#data-integrity)
8. [Performance Considerations](#performance-considerations)

---

## 1. Database Overview

The Genius Smart App uses a **file-based JSON database** system. This approach was chosen for:
- **Simplicity**: No external database dependencies
- **Portability**: Easy to deploy and migrate
- **Human Readable**: JSON files can be inspected and edited
- **Version Control**: Database changes can be tracked in Git

### Database Files Location
```
server/data/
├── teachers.json          # Teacher profiles and authentication
├── attendance.json        # Attendance records
├── requests.json          # Leave/absence requests  
├── subjects.json          # Subject definitions
├── holidays.json          # Holiday configurations
├── managers.json          # Manager profiles
├── system_roles.json      # Role definitions
├── action_audit.json      # Audit trail
├── data_tracking.json     # Data change tracking
└── backups/              # Automated backups
```

---

## 2. Data Storage Architecture

### File Structure Pattern
Each JSON file follows this structure:
```json
[
  {
    "id": "unique-identifier",
    "createdAt": "ISO-8601-timestamp",
    "updatedAt": "ISO-8601-timestamp",
    ...other-fields
  }
]
```

### ID Generation
- **Format**: UUID v4 (e.g., "88574e76-66ba-485b-9822-fb28ac6d391c")
- **Generation**: Using Node.js `uuid` package
- **Uniqueness**: Guaranteed across all collections

### Timestamp Standards
- **Format**: ISO 8601 (e.g., "2025-01-27T14:30:00.000Z")
- **Timezone**: UTC for storage, converted to local for display
- **Fields**: `createdAt`, `updatedAt`, `submittedAt`, `reviewedAt`

---

## 3. Core Data Models

### 3.1 Teacher Model (`teachers.json`)

```json
{
  "id": "string (uuid)",
  "name": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string (unique)",
  "phone": "string",
  "password": "string (bcrypt hash)",
  "plainPassword": "string (temporary, for reference)",
  "role": "ADMIN | MANAGER | TEACHER",
  "roleLevel": 1 | 2 | 3,
  "roleName": "string",
  "roleNameAr": "string (Arabic)",
  "authorities": ["string"],
  "subject": "string",
  "workType": "Full-time | Part-time",
  "status": "Active | Inactive",
  "address": "string",
  "employmentDate": "date",
  "allowedAbsenceDays": "number",
  "totalAbsenceDays": "number",
  "remainingLateEarlyHours": "number",
  "totalLateEarlyHours": "number",
  "canAccessManagerPortal": "boolean",
  "canAccessTeacherPortal": "boolean",
  "canApproveRequests": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**Key Points:**
- Hierarchical roles: ADMIN (3) > MANAGER (2) > TEACHER (1)
- Dynamic authorities array for granular permissions
- Tracks absence and late/early hours allowances
- Supports Arabic names and translations

### 3.2 Attendance Model (`attendance.json`)

```json
{
  "id": "string (uuid)",
  "teacherId": "string (uuid)",
  "teacherName": "string",
  "date": "date (YYYY-MM-DD)",
  "checkIn": "datetime",
  "checkOut": "datetime | null",
  "status": "present | absent | late | early-leave",
  "workingHours": "number",
  "overtimeHours": "number",
  "lateMinutes": "number",
  "earlyLeaveMinutes": "number",
  "isWeekend": "boolean",
  "isHoliday": "boolean",
  "location": {
    "checkIn": {
      "lat": "number",
      "lng": "number",
      "address": "string"
    },
    "checkOut": {
      "lat": "number",
      "lng": "number", 
      "address": "string"
    }
  },
  "breaks": [
    {
      "start": "datetime",
      "end": "datetime",
      "duration": "number (minutes)"
    }
  ],
  "notes": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**Key Points:**
- Tracks exact check-in/out times with location
- Calculates working hours, overtime, late/early minutes
- Supports break tracking
- Marks weekends and holidays

### 3.3 Request Model (`requests.json`)

```json
{
  "id": "string (uuid)",
  "teacherId": "string (uuid)",
  "teacherName": "string",
  "type": "absence | leave | late-arrival",
  "date": "date",
  "startDate": "date (for multi-day)",
  "endDate": "date (for multi-day)",
  "reason": "string",
  "status": "pending | approved | rejected",
  "priority": "normal | urgent",
  "duration": "number (hours/days)",
  "attachment": "string (file path)",
  "submittedAt": "datetime",
  "reviewedAt": "datetime | null",
  "reviewedBy": "string (uuid) | null",
  "reviewerName": "string | null",
  "reviewNotes": "string | null",
  "notificationSent": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**Key Points:**
- Three request types with different validation rules
- Tracks full approval workflow
- Supports file attachments for documentation
- Email notification tracking

### 3.4 Subject Model (`subjects.json`)

```json
{
  "id": "string (uuid)",
  "name": "string",
  "nameAr": "string (Arabic)",
  "code": "string (unique)",
  "description": "string",
  "department": "string",
  "teacherCount": "number",
  "isActive": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### 3.5 Holiday Model (`holidays.json`)

```json
{
  "id": "string (uuid)",
  "name": "string",
  "nameAr": "string (Arabic)",
  "date": "date",
  "type": "public | religious | school",
  "isRecurring": "boolean",
  "recurringType": "yearly | monthly | weekly",
  "affectsAttendance": "boolean",
  "description": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### 3.6 System Role Model (`system_roles.json`)

```json
{
  "id": "string (uuid)",
  "name": "string",
  "level": "number (1-3)",
  "authorities": ["string"],
  "description": "string",
  "canAccessManagerPortal": "boolean",
  "canAccessTeacherPortal": "boolean",
  "canApproveRequests": "boolean",
  "maxSubordinates": "number",
  "createdAt": "datetime"
}
```

---

## 4. Data Relationships

### Entity Relationship Diagram

```
Teachers (1) ──────┬──── (*) Attendance
                   │
                   ├──── (*) Requests
                   │
                   └──── (1) Subject

Managers (1) ────────── (*) Requests (approval)

System_Roles (1) ──── (*) Teachers

Holidays (*) ──── (*) Attendance (affects)
```

### Relationship Details

1. **Teacher → Attendance** (One-to-Many)
   - Each teacher has multiple attendance records
   - Linked by `teacherId` field

2. **Teacher → Requests** (One-to-Many)
   - Teachers can submit multiple requests
   - Linked by `teacherId` field

3. **Teacher → Subject** (Many-to-One)
   - Each teacher assigned to one primary subject
   - Linked by `subject` field

4. **Manager → Requests** (Approval Relationship)
   - Managers review and approve/reject requests
   - Linked by `reviewedBy` field

5. **System Role → Teachers** (One-to-Many)
   - Each role can be assigned to multiple teachers
   - Determines permissions and access levels

---

## 5. Data Operations

### CRUD Operations

#### Create Operation
```javascript
// Add new teacher
const newTeacher = {
  id: uuid.v4(),
  ...teacherData,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
teachers.push(newTeacher);
fs.writeFileSync('./data/teachers.json', JSON.stringify(teachers, null, 2));
```

#### Read Operations
```javascript
// Get all active teachers
const activeTeachers = teachers.filter(t => t.status === 'Active');

// Get teacher by ID
const teacher = teachers.find(t => t.id === teacherId);

// Get attendance for date range
const attendance = attendanceRecords.filter(a => 
  a.date >= startDate && a.date <= endDate
);
```

#### Update Operation
```javascript
// Update teacher
const index = teachers.findIndex(t => t.id === teacherId);
teachers[index] = {
  ...teachers[index],
  ...updateData,
  updatedAt: new Date().toISOString()
};
```

#### Delete Operation
```javascript
// Soft delete (recommended)
teacher.status = 'Inactive';
teacher.deletedAt = new Date().toISOString();

// Hard delete (use with caution)
teachers = teachers.filter(t => t.id !== teacherId);
```

### Data Validation

#### Required Field Validation
```javascript
const requiredFields = ['name', 'email', 'phone', 'role'];
const missingFields = requiredFields.filter(field => !data[field]);
```

#### Email Uniqueness
```javascript
const emailExists = teachers.some(t => 
  t.email === newEmail && t.id !== currentId
);
```

#### Date Validation
```javascript
const isValidDate = (date) => {
  return !isNaN(Date.parse(date));
};
```

---

## 6. Backup and Recovery

### Automatic Backup System

#### Backup Schedule
- **Frequency**: Before every write operation
- **Location**: `server/data/backups/`
- **Naming**: `YYYY-MM-DDTHH-mm-ss-SSS_filename.json`

#### Backup Implementation
```javascript
const createBackup = (filename, data) => {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupPath = `./data/backups/${timestamp}_${filename}`;
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
};
```

#### Recovery Process
1. List available backups
2. Select backup by timestamp
3. Validate backup integrity
4. Replace current file with backup
5. Restart application

### Manual Backup Commands
```bash
# Create manual backup
npm run backup

# Restore from backup
npm run restore -- --file=2025-01-27T10-30-00-000Z_teachers.json
```

---

## 7. Data Integrity

### Consistency Checks

#### Referential Integrity
```javascript
// Check all attendance records have valid teacher IDs
const orphanedAttendance = attendance.filter(a => 
  !teachers.some(t => t.id === a.teacherId)
);
```

#### Data Type Validation
```javascript
// Validate numeric fields
const validateNumber = (value, min, max) => {
  return typeof value === 'number' && value >= min && value <= max;
};
```

### Audit Trail

#### Action Logging
```json
{
  "id": "uuid",
  "action": "CREATE | UPDATE | DELETE",
  "entity": "teacher | attendance | request",
  "entityId": "uuid",
  "userId": "uuid",
  "timestamp": "datetime",
  "changes": {
    "before": {},
    "after": {}
  },
  "ipAddress": "string",
  "userAgent": "string"
}
```

---

## 8. Performance Considerations

### Current Limitations
- **File Size**: Performance degrades with files > 10MB
- **Concurrent Access**: No built-in transaction support
- **Query Performance**: O(n) for most operations

### Optimization Strategies

#### 1. Indexing (In-Memory)
```javascript
// Build indexes on startup
const teacherIndex = new Map();
teachers.forEach(t => teacherIndex.set(t.id, t));
```

#### 2. Data Partitioning
```javascript
// Split attendance by year
const attendanceByYear = {
  '2024': 'attendance_2024.json',
  '2025': 'attendance_2025.json'
};
```

#### 3. Caching
```javascript
// Cache frequently accessed data
const cache = new Map();
const getCachedData = (key, loader) => {
  if (!cache.has(key)) {
    cache.set(key, loader());
  }
  return cache.get(key);
};
```

### Migration Path

For scaling beyond current limits, consider:
1. **SQLite**: Minimal changes, file-based
2. **PostgreSQL**: Full RDBMS features [[memory:4652609]]
3. **MongoDB**: Document-based, similar to JSON

### Database Migration Script Example
```javascript
// Migrate to PostgreSQL
const migrateToPostgres = async () => {
  const teachers = JSON.parse(fs.readFileSync('./data/teachers.json'));
  
  for (const teacher of teachers) {
    await db.query(
      'INSERT INTO teachers (id, name, email, ...) VALUES ($1, $2, $3, ...)',
      [teacher.id, teacher.name, teacher.email, ...]
    );
  }
};
```

---

## Conclusion

The JSON-based database system provides a simple, effective solution for the current scale of the application. The structure supports all required features while maintaining flexibility for future enhancements. Regular backups and data validation ensure data integrity and recoverability. 