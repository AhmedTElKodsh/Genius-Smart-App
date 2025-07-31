# 3-Tier Role System Documentation

## Overview
The Genius Smart App implements a 3-tier role system with hierarchical authority management and comprehensive audit trails.

## Role Definitions

### 1. ADMIN (Level 3) - مدير عام
**Full Authority with System Administration**

**Current Admins:**
- **Ibrahim Hamdy (إبراهيم حمدي)** - ibrahimmizo55@gmail.com
- **Amer Zaher (عمرو زاهر)** - badrsalah525@gmail.com

**Authorities:**
- Access Manager Portal
- Access Teacher Portal (without timer/hours submission)
- Add new teachers
- Edit existing teachers
- Delete teachers
- Accept and reject ALL requests (including Manager requests)
- Download reports
- View all analytics
- Manage user authorities
- View action audit trail
- Revoke manager actions
- Promote/demote users
- System administration

**Special Features:**
- Can give or remove authorities to any teacher/employee
- Can upgrade or downgrade role levels
- Can control authorities within a role
- No one has authority over Admins
- Can trace back who from Management processed requests

### 2. MANAGER (Level 2) - مدير
**Limited Management Authority**

**Example Manager with Special Authority:**
- **Mahetab Mostafa (ماهيتاب مصطفى)** - Has Manager role with additional "Accept and Reject Teachers' Requests" authority

**Default Authorities:**
- Access Manager Portal
- Access Teacher Portal (with timer and hours submission)
- View teachers info
- Accept and reject Employee requests only
- Download reports
- View analytics
- Submit own requests

**Limitations:**
- Cannot approve own requests
- Cannot revoke admin actions
- Cannot approve other Manager requests
- Performance tracking applies

### 3. EMPLOYEE (Level 1) - موظف
**Basic Access**

**Authorities:**
- Access Teacher Portal only
- Submit requests
- View own data
- Check in/out

**Limitations:**
- No access to Manager Portal
- Cannot approve any requests
- Performance tracking applies

## Authority Hierarchy

1. **Request Approval Flow:**
   - Admins can accept/reject requests for both Managers and Teachers
   - Managers can accept/reject requests for Teachers only
   - Employees cannot approve any requests
   - No one can approve requests for Admins

2. **Self-Approval Prevention:**
   - Managers cannot approve their own requests
   - System automatically prevents self-approval attempts

3. **Action Revocation:**
   - Only Admins can revoke Manager actions
   - Managers cannot revoke Admin actions

## Audit Trail System

All request approvals/rejections are tracked with:
- **approvedBy**: User ID who approved/rejected
- **approverName**: Name of the approver
- **approverRole**: Role of the approver (ADMIN/MANAGER)
- **approvedAt**: Timestamp of the action
- **canBeRevokedBy**: If approved by MANAGER, can be revoked by ADMIN

## UI Role Management

### For Admins Only:
1. **Edit Teacher Modal**: 
   - Shows "System Role" dropdown
   - Can change any teacher's role to ADMIN, MANAGER, or EMPLOYEE
   - Authorities automatically update based on role selection

2. **Add New Teacher Modal**:
   - Shows "System Role" dropdown
   - Can set role during teacher creation
   - Default role is EMPLOYEE

### Role Detection:
The system automatically detects the current user's role from:
- `localStorage.getItem('managerInfo')` for logged-in managers
- Role information is included in authentication tokens

## Implementation Notes

1. **Role Changes**: When a role is changed, authorities are automatically updated to match the new role's default authorities.

2. **Custom Authorities**: Admins can grant additional authorities beyond the default role authorities (e.g., giving a Manager the ability to approve teacher requests).

3. **Performance Tracking**: Applies only to MANAGER and EMPLOYEE roles, not ADMIN.

4. **Email Notifications**: When requests are approved/rejected, the system sends email notifications to the affected teachers.

## Security Considerations

- Role assignments are server-validated
- Client-side role checks are for UI only
- All API endpoints verify user authorities
- Audit trail cannot be modified or deleted
- Role changes are logged in the audit system