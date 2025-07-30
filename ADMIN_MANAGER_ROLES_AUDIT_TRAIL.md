# Admin/Manager Roles and Audit Trail Implementation

## Date: December 2024

## Overview
Implemented a role-based system where only specific users have Admin privileges, while others are Managers. Added a comprehensive audit trail system to track all manager actions on teacher requests.

## Role Distribution

### Admin Role
Only the following users have Admin privileges:
- **إبراهيم حمدي** (Ibrahim Hamdy)
- **عمرو زاهر** (Amr Zaher)

### Manager Role
All other management team members have Manager privileges with limited access.

## Key Features Implemented

### 1. Manager Data Structure Update
- Added `systemRole` field to distinguish between "Admin" and "Manager"
- Updated all managers in `managers.json` with appropriate roles
- Added `canViewAuditTrail` authority for Admins only

### 2. Audit Trail System
- Created `action_audit.json` to store all request processing actions
- Tracks the following information:
  - Who performed the action (manager name, ID, role)
  - What action was taken (approve/reject)
  - When it was performed (timestamp)
  - Which teacher request was affected
  - Request details and reason

### 3. API Endpoints

#### Request Processing Update
- Modified `PUT /api/requests/:id` to automatically log all actions to audit trail
- Captures manager's systemRole (Admin/Manager) in the audit log

#### Audit Trail Endpoints
- `GET /api/request-audit` - Get audit entries (Admin only)
  - Supports filtering by date, action type, performer
  - Pagination support
- `GET /api/request-audit/:id` - Get specific audit entry
- `GET /api/request-audit/stats/summary` - Get audit statistics

#### Manager Endpoints
- `GET /api/manager/all` - Get all managers (Admin only)
  - Used for audit trail filter dropdown

### 4. UI Components

#### RequestAuditTrail Component
- Comprehensive audit trail viewer for Admins
- Features:
  - Statistics dashboard (total actions, approvals, rejections, active managers)
  - Filterable table with date range, action type, and performer filters
  - Real-time data fetching
  - Proper RTL support for Arabic
  - Role-based badges (Admin/Manager)

#### Manager Requests Page Update
- Added "Audit Trail" tab visible only to Admins
- Tab appears conditionally based on manager's systemRole
- Seamless integration with existing request tabs

### 5. Security Features
- Only Admins can view the audit trail
- Middleware checks systemRole before allowing access
- API endpoints enforce Admin-only access
- Audit entries are immutable once created

## Technical Implementation

### Data Structure
```json
// Manager with Admin role
{
  "id": "MGR_c0440c29",
  "name": "إبراهيم حمدي",
  "systemRole": "Admin",
  "authorities": {
    "canViewAuditTrail": true,
    "canManageAuthorities": true
  }
}

// Audit entry
{
  "id": "uuid",
  "actionType": "approve",
  "requestId": "request-id",
  "performerName": "علي توفيق",
  "performerRole": "Manager",
  "timestamp": "2024-12-01T10:30:00Z",
  "details": {
    "previousStatus": "pending",
    "newStatus": "approved"
  }
}
```

### Middleware Updates
- Updated `roleAuthMiddleware.js` to check both teachers and managers data
- Added systemRole to req.user object
- Proper role mapping for existing users

## Usage

### For Admins
1. Navigate to Requests page
2. Click on "Audit Trail" tab (only visible to Admins)
3. View all actions performed by managers
4. Use filters to find specific actions
5. Monitor manager activity and decision patterns

### For Managers
- Continue normal request processing
- All actions are automatically logged
- No access to audit trail

## Benefits
1. **Accountability**: Every request decision is tracked
2. **Transparency**: Admins can review all manager actions
3. **Security**: Role-based access control
4. **Compliance**: Complete audit history for reviews
5. **Analytics**: Statistics on approval/rejection patterns

## Testing
1. Log in as Admin (إبراهيم حمدي or عمرو زاهر)
2. Navigate to Requests → Audit Trail tab
3. Process some requests as a Manager
4. Verify actions appear in audit trail with correct details
5. Test filters and statistics 