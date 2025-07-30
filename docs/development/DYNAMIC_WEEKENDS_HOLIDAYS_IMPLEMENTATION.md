# Dynamic Weekends and Holidays Implementation

## Overview
This document describes the implementation of dynamic weekend and holiday settings that affect the entire backend functionality.

## Date: December 2024

## What Was Implemented

### 1. Dynamic Date Utilities (`server/utils/dateUtils.js`)
Created a centralized utility module for handling dynamic weekend and holiday checking:
- `isWeekend(date)` - Checks if a date falls on a weekend based on manager's settings
- `isHoliday(date)` - Checks if a date is a holiday (from both manager selections and holidays.json)
- `isWorkingDay(date)` - Checks if a date is a working day (not weekend, not holiday)
- `getNextWorkingDay(date)` - Gets the next working day from a given date
- `getPreviousWorkingDay(date)` - Gets the previous working day from a given date
- `countWorkingDays(startDate, endDate)` - Counts working days between two dates

### 2. Backend API Endpoints

#### General Settings Management
- **GET `/api/manager/general-settings`** - Retrieve current weekend and holiday settings
- **PUT `/api/manager/general-settings`** - Update weekend days and national holidays

```json
// Request body example
{
  "weekendDays": [5, 6], // 0=Sunday, 1=Monday, ..., 6=Saturday
  "nationalHolidays": [
    "2025-01-01T00:00:00.000Z",
    "2025-04-25T00:00:00.000Z"
  ]
}
```

### 3. Updated Backend Modules

#### Attendance Module (`server/routes/attendance.js`)
- Replaced hardcoded Egyptian weekend checks with dynamic `isWeekend()` function
- Now respects manager-configured weekend days
- Excludes weekends and holidays from:
  - Late arrival calculations
  - Early leave tracking
  - Unauthorized absence detection
  - Working hours calculations

#### Data Generation (`server/utils/generateAttendanceData.js`)
- Updated to use `isWorkingDay()` function
- Skips attendance generation for weekends and holidays
- Ensures realistic data generation based on actual working days

### 4. Data Storage

#### Manager Profile Structure
The manager.json file now includes a `generalSettings` object:
```json
{
  "id": "...",
  "email": "...",
  // ... other fields
  "generalSettings": {
    "weekendDays": [5, 6], // Default: Friday and Saturday
    "nationalHolidays": [
      "2025-01-01T00:00:00.000Z",
      "2025-04-25T00:00:00.000Z"
    ]
  }
}
```

### 5. Frontend Integration

#### Settings Page (`src/pages/ManagerSettings.tsx`)
- Added debug logging for troubleshooting
- Loads saved general settings on component mount
- Sends selected weekends and holidays to backend
- Provides visual feedback for save operations

## How It Works

### 1. Weekend Configuration
- Manager selects weekend days in Settings > General tab
- Days are stored as numbers (0=Sunday, 1=Monday, etc.)
- All backend calculations automatically use these settings

### 2. Holiday Configuration
- Manager selects holidays using the calendar interface
- Selected dates are stored as ISO strings
- Both manager-selected holidays and holidays.json entries are considered

### 3. Impact on System Features

#### Attendance Tracking
- Check-ins/check-outs on weekends/holidays are not penalized
- Late arrivals and early leaves are only counted on working days
- Absence tracking excludes non-working days

#### Analytics and Reports
- Working days calculations exclude weekends and holidays
- Attendance rates consider only actual working days
- Overtime calculations respect the working calendar

#### Request Processing
- Leave requests can span weekends/holidays
- Duration calculations count only working days
- Approval workflows consider the working calendar

## Default Settings
If no settings are configured:
- **Weekend Days**: Friday (5) and Saturday (6) - Egyptian standard
- **National Holidays**: Empty array (no holidays selected)

## Testing the Implementation

1. **Configure Settings**:
   - Go to Manager Settings > General tab
   - Select different weekend days
   - Add some holidays using the calendar
   - Click "Save Settings"

2. **Verify Backend Impact**:
   - Check attendance records - weekends should not show violations
   - Generate reports - working days should exclude configured weekends/holidays
   - Review analytics - statistics should reflect only working days

3. **Check Data Persistence**:
   - Refresh the page
   - Settings should reload from the database
   - Selected weekends and holidays should be preserved

## Future Enhancements

1. **Holiday Templates**: Pre-configured holiday sets by country
2. **Recurring Holidays**: Automatic yearly holiday generation
3. **Department-Specific Settings**: Different weekends for different departments
4. **Holiday Import/Export**: Bulk holiday management via CSV
5. **Public Holiday API Integration**: Automatic holiday updates from external sources

## Technical Notes

- All date comparisons normalize to midnight for consistency
- Weekend days use JavaScript's Date.getDay() convention (0-6)
- Holiday dates are stored in ISO 8601 format for timezone consistency
- The system gracefully falls back to defaults if settings are missing 