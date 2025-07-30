import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

interface LanguageProviderProps {
  children: ReactNode;
}

// English translations
const enTranslations = {
  // Common
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.add': 'Add',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.export': 'Export',
  'common.accept': 'Accept',
  'common.reject': 'Reject',
  'common.close': 'Close',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.all': 'All',
  'common.today': 'Today',
  'common.thisWeek': 'This Week',
  'common.thisMonth': 'This Month',
  'common.delayed': 'Delayed',
  'common.name': 'Name',
  'common.email': 'Email',
  'common.phone': 'Phone',
  'common.address': 'Address',
  'common.subject': 'Subject',
  'common.workType': 'Work Type',
  'common.status': 'Status',
  'common.date': 'Date',
  'common.reason': 'Reason',
  'common.duration': 'Duration',
  'common.type': 'Type',
  'common.days': 'Days',
  'common.hours': 'Hours',
  'common.custom': 'Custom',
  'common.done': 'Done',

  // Date Picker
  'datePicker.selectDateRange': 'Select date range',
  'datePicker.selectEndDate': 'Select end date',
  'datePicker.dayHeaders': ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

  // Navigation/Sidebar
  'nav.dashboard': 'Dashboard',
  'nav.teachers': 'Teachers',
  'nav.requests': 'Requests',
  'nav.settings': 'Settings',
  'nav.logout': 'Log out',
  'nav.addTeacher': 'Add a New Teacher +',

  // Dashboard
  'dashboard.title': 'Dashboard Overview',
  'dashboard.totalTeachers': 'Total Teachers',
  'dashboard.activeTeachers': 'Active Teachers',
  'dashboard.pendingRequests': 'Pending Requests',
  'dashboard.monthlyAttendance': 'Monthly Attendance',
  'dashboard.recentActivity': 'Recent Activity',
  'dashboard.quickStats': 'Quick Statistics',
  'dashboard.overtime': 'Overtime',
  'dashboard.averageTeachersAges': 'Avg. Teachers Ages',
  'dashboard.todayAbsences': 'Today Absences',
  'dashboard.allMissing': 'All Missing',
  'dashboard.authorizedAbsence': 'Authorized Absence',
  'dashboard.unauthorizedNoRequest': 'Unauthorized Absence - No Request',
  'dashboard.unauthorizedRejected': 'Unauthorized Absence - Request Rejected',
  'dashboard.contact': 'Contact',

  // Teachers Page
  'teachers.title': 'Teachers Management',
  'teachers.allTeachers': 'All Teachers',
  'teachers.reports': 'Reports',
  'teachers.analytics': 'Analytics',
  'teachers.searchTeachers': 'Search teachers...',
  'teachers.filterBySubject': 'Filter by Subject',
  'teachers.allSubjects': 'All Subjects',
  'teachers.addTeacher': 'Add New Teacher',
  'teachers.editTeacher': 'Edit Teacher',
  'teachers.teacherDetails': 'Teacher Details',
  'teachers.personalInfo': 'Personal Info',
  'teachers.activity': 'Activity',
  'teachers.workType.fullTime': 'Full-time',
  'teachers.workType.partTime': 'Part-time',
  'teachers.status.active': 'Active',
  'teachers.status.inactive': 'Inactive',
  'teachers.noTeachers': 'No Teachers Found',
  'teachers.noTeachersDesc': 'No teachers match your current filters',

  // Teachers Reports
  'reports.teacher': 'Teacher',
  'reports.workType': 'Work Type',
  'reports.attends': 'Attends',
  'reports.allowedAbsence': 'Allowed Absence',
  'reports.unallowedAbsence': 'Unallowed Absence',
  'reports.authorizedAbsence': 'Authorized Absence',
  'reports.unauthorizedAbsence': 'Unauthorized Absence',
  'reports.lateArrival': 'Late Arrival',
  'reports.earlyLeave': 'Early Leave',
  'reports.overtime': 'Overtime',
  'reports.totalHours': 'Total Hours',
  'reports.showing': 'Showing',
  'reports.exportPDF': 'Export PDF',
  'reports.exportExcel': 'Export Excel',
  'reports.dateRange': 'Date Range',
  'reports.from': 'From',
  'reports.to': 'To',

  // Add Teacher Modal
  'addTeacher.title': 'Add a New Teacher',
  'addTeacher.subtitle': 'Add a new teacher to your team and manage operations seamlessly',
  'addTeacher.firstName': 'First Name',
  'addTeacher.lastName': 'Last Name',
  'addTeacher.phone': 'Teacher\'s Phone',
  'addTeacher.email': 'Teacher\'s Email',
  'addTeacher.address': 'Teacher\'s Address',
  'addTeacher.password': 'Teacher\'s Password',
  'addTeacher.dateOfBirth': 'Date of Birth',
  'addTeacher.day': 'Day',
  'addTeacher.month': 'Month',
  'addTeacher.year': 'Year',
  'addTeacher.subject': 'Teacher\'s Subject',
  'addTeacher.selectSubject': 'Select Subject',
  'addTeacher.roleType': 'Work Type',
  'addTeacher.fullTime': 'Full-time',
  'addTeacher.partTime': 'Part-time',
  'addTeacher.employmentDate': 'Employment Date',
      'addTeacher.allowedAbsenceDays': 'Allowed Absence Days',
    'addTeacher.employmentDateHelper': 'Auto-calculates absence days: 0 days (<3 months), 9 days (3 months-2 years), 12 days (>2 years)',
    'addTeacher.allowedAbsenceDaysHelper': 'Manager can override the auto-calculated value',
    'addTeacher.authorities': 'Authorities',
  'addTeacher.systemRole': 'System Role',
  'addTeacher.selectSystemRole': 'Select System Role',
  'systemRoles.admin': 'Admin',
  'systemRoles.manager': 'Manager',
  'systemRoles.employee': 'Employee',
  'systemRoles.adminDescription': 'Full system access with all authorities',
  'systemRoles.managerDescription': 'Manager portal access, can approve employee requests',
  'systemRoles.employeeDescription': 'Basic teacher portal access',
  'addTeacher.selectAuthorities': 'Select Authorities',
  'authorities.managerPortal': 'Access Manager Portal and inside pages',
  'authorities.addTeachers': 'Add new teachers',
  'authorities.editTeachers': 'Edit Existing Teachers\' info',
  'authorities.manageRequests': 'Accept and Reject Teachers\' Requests',
  'authorities.downloadReports': 'Download Reports',
  'addTeacher.save': 'Save',
  'addTeacher.success': 'Teacher added successfully',
  'addTeacher.error': 'Failed to add teacher',

  // Edit Teacher Modal
  'editTeacher.title': 'Edit Teacher Information',
  'editTeacher.personalInfo': 'Personal Info',
  'editTeacher.activity': 'Activity',
  'editTeacher.password': 'Teacher\'s Password (Leave empty to keep current password)',
  'editTeacher.passwordPlaceholder': 'Enter new password to change',
  'editTeacher.save': 'Edit',
  'editTeacher.success': 'Teacher updated successfully',
  'editTeacher.error': 'Failed to update teacher',

  // Activity Tab
  'activity.title': 'Activity',
  'activity.leaves': 'Leaves',
  'activity.absents': 'Absents',
  'activity.totalHours': 'Total Hours',
  'activity.date': 'Date',
  'activity.attends': 'Attends',
  'activity.checkIn': 'Check In',
  'activity.checkOut': 'Check Out',
  'activity.allowedAbsence': 'Allowed Absence',
  'activity.authorizedAbsence': 'Authorized Absence',
  'activity.totalTime': 'Total time',
  'activity.active': 'Active',
  'activity.absent': 'Absent',
  'activity.yes': 'Yes',
  'activity.no': '--',

  // Requests Page
  'requests.title': 'Requests Management',
  'requests.allRequests': 'All Requests',
  'requests.absenceRequests': 'Absence requests',
  'requests.earlyLeaveRequests': 'Early Leave Requests',
  'requests.lateRequests': 'Late requests',
  'requests.appliedDuration': 'Applied Duration',
  'requests.requestType': 'Request Type',
  'requests.accept': 'Accept',
  'requests.reject': 'Reject',
  'requests.noRequests': 'No {type} requests found',
  'requests.noRequestsDesc': 'There are currently no pending requests to review.',
  'requests.reasonTitle': 'Request Details',
  'requests.reason': 'Reason',

  // Request Types
  'requestTypes.absence': 'Absence',
  'requestTypes.authorizedAbsence': 'Authorized Absence',
  'requestTypes.earlyLeave': 'Early Leave',
  'requestTypes.lateArrival': 'Late Arrival',

  // Settings Page
  'settings.title': 'Settings',
  'settings.personalInfo': 'Personal Info',
  'settings.general': 'General',
  'settings.notifications': 'Notifications',
  'settings.security': 'Security',
  'settings.language': 'Language',
  'settings.selectLanguage': 'Select Language',
  'settings.english': 'English',
  'settings.arabic': 'العربية',
  'settings.languageNote': 'Change the interface language',
  
  // Settings Tab Keys
  'settings.personalInfoTab': 'Personal Info',
  'settings.generalTab': 'General',
  'settings.notificationsTab': 'Notifications',
  'settings.securityTab': 'Security',
  'settings.holidaysTab': 'Holidays',

  // Personal Info Settings
  'settings.personalInfo.title': 'Personal Information',
  'settings.personalInfo.subtitle': 'Manage your personal details and profile information',
  'settings.personalInfo.uploadButton': 'Upload Profile Picture',
  'settings.personalInfo.firstName': 'First Name',
  'settings.personalInfo.firstNamePlaceholder': 'Enter your first name',
  'settings.personalInfo.lastName': 'Last Name',
  'settings.personalInfo.lastNamePlaceholder': 'Enter your last name',
  'settings.personalInfo.email': 'Email Address',
  'settings.personalInfo.emailPlaceholder': 'Enter your email address',
  'settings.personalInfo.phone': 'Phone Number',
  'settings.personalInfo.phonePlaceholder': 'Enter your phone number',
  'settings.personalInfo.address': 'Address',
  'settings.personalInfo.addressPlaceholder': 'Enter your address',
  'settings.personalInfo.dateOfBirth': 'Date of Birth',
  'settings.personalInfo.save': 'Save Changes',

  // General Settings  
  'settings.general.title': 'General Settings',
  'settings.general.subtitle': 'Configure work schedules, weekends, and system preferences',
  'settings.general.weekendDays': 'Weekend Days',
  'settings.general.weekendDaysSubtitle': 'Select which days are considered weekends (non-working days)',
  'settings.general.nationalHolidays': 'National Holidays',
  'settings.general.nationalHolidaysSubtitle': 'Select dates that are national holidays for the current year',
  'settings.general.selectedHolidays': 'Selected Holidays',
  'settings.general.selectedHolidaysSubtitle': 'Review and manage your selected holiday dates',
  'settings.general.removeHoliday': 'Remove Holiday',
  'settings.general.clearAllHolidays': 'Clear All',
  'settings.general.holidayCount': 'holidays selected',
  'settings.general.save': 'Save Settings',

  // Notifications Settings
  'settings.notifications.title': 'Notification Preferences',
  'settings.notifications.subtitle': 'Configure your notification preferences',
  'settings.notifications.emailNotifications': 'Email Notifications',
  'settings.notifications.requestNotifications': 'New Request Notifications',
  'settings.notifications.requestDesc': 'Receive email notifications for new teacher requests',
  'settings.notifications.save': 'Save Settings',
  'settings.notifications.allNotifications': 'All Notifications',
  'settings.notifications.earlyArrival': 'Early Arrival',
  'settings.notifications.lateArrival': 'Late Arrival',
  'settings.notifications.earlyLeaves': 'Early Leaves',
  'settings.notifications.lateLeaves': 'Late Leaves',
  'settings.notifications.absentsTeachers': 'Absents Teachers',
  'settings.notifications.dailyReports': 'Daily Reports',
  'settings.notifications.weeklyReports': 'Weekly Reports',
  'settings.notifications.monthlyReports': 'Monthly Reports',
  'settings.notifications.yearlyReports': 'Yearly Reports',
  'settings.notifications.testTitle': 'Test Notifications',
  'settings.notifications.testDesc': 'Send test notifications to verify email delivery:',
  'settings.notifications.testEarlyLeave': 'Test Early Leave',
  'settings.notifications.testAbsence': 'Test Absence',
  'settings.notifications.testLateArrival': 'Test Late Arrival',

        // Security Settings
  'settings.security.title': 'Change Password',
  'settings.security.subtitle': 'Update your account password for enhanced security',
  'settings.security.changePassword': 'Change Password',
  'settings.security.changingPassword': 'Changing Password...',
  'settings.security.currentPassword': 'Current Password',
  'settings.security.newPassword': 'New Password',
  'settings.security.confirmPassword': 'Confirm New Password',
  'settings.security.updatePassword': 'Update Password',

    // Holiday Management Settings
    'settings.holidays': 'Holidays',
    'settings.holidays.title': 'Holiday Management',
    'settings.holidays.subtitle': 'Manage formal holidays where absences are not counted',
    'settings.holidays.adminOnly': 'Admin Only Feature',
    'settings.holidays.addHoliday': 'Add Holiday',
    'settings.holidays.editHoliday': 'Edit Holiday',
    'settings.holidays.deleteHoliday': 'Delete Holiday',
    'settings.holidays.confirmDelete': 'Are you sure you want to delete this holiday?',
    'settings.holidays.holidayName': 'Holiday Name',
    'settings.holidays.holidayNamePlaceholder': 'Enter holiday name',
    'settings.holidays.holidayNameAr': 'Holiday Name (Arabic)',
    'settings.holidays.holidayNameArPlaceholder': 'Enter holiday name in Arabic',
    'settings.holidays.holidayDate': 'Holiday Date',
    'settings.holidays.description': 'Description',
    'settings.holidays.descriptionPlaceholder': 'Enter holiday description (optional)',
    'settings.holidays.isRecurring': 'Recurring Annually',
    'settings.holidays.recurringNote': 'Holiday repeats every year on the same date',
    'settings.holidays.save': 'Save Holiday',
    'settings.holidays.cancel': 'Cancel',
    'settings.holidays.noHolidays': 'No holidays configured yet',
    'settings.holidays.addFirst': 'Add your first holiday',
    'settings.holidays.upcomingHolidays': 'Upcoming Holidays',
    'settings.holidays.pastHolidays': 'Past Holidays',
    'settings.holidays.thisYear': 'This Year',
    'settings.holidays.nextYear': 'Next Year',

  // Authentication
  'auth.signIn': 'Manager Sign In',
  'auth.signInSubtitle': 'Enter your credentials to access the management panel',
  'auth.emailAddress': 'Email Address',
  'auth.password': 'Password',
  'auth.rememberMe': 'Remember me for 30 days',
  'auth.signInButton': 'Sign In',
  'auth.signingIn': 'Signing In...',
  'auth.forgotPassword': 'Forgot your password?',
  'auth.backToRoleSelection': '← Back to Role Selection',
  'auth.invalidCredentials': 'Invalid email or password',
  'auth.loginFailed': 'Login failed. Please check your connection and try again.',

  // Brand
  'brand.title': 'Genius Smart',
  'brand.subtitle': 'Manager Portal',
  'brand.education': 'Genius Smart Education',

  // Validation Messages
  'validation.required': 'This field is required',
  'validation.email': 'Please enter a valid email address',
  'validation.minLength': 'Must be at least {min} characters',
  'validation.passwordMismatch': 'Passwords do not match',

  // Time periods
  'time.today': 'Today',
  'time.thisWeek': 'This Week',
  'time.thisMonth': 'This Month',
  'time.delayed': 'Delayed',

  // Months
  'months.january': 'January',
  'months.february': 'February',
  'months.march': 'March',
  'months.april': 'April',
  'months.may': 'May',
  'months.june': 'June',
  'months.july': 'July',
  'months.august': 'August',
  'months.september': 'September',
  'months.october': 'October',
  'months.november': 'November',
  'months.december': 'December',

  // Subjects
  'subjects.management': 'Management',
  'subjects.quran': 'Quran',
  'subjects.arabic': 'Arabic',
  'subjects.math': 'Math',
  'subjects.english': 'English',
  'subjects.science': 'Science',
  'subjects.art': 'Art',
  'subjects.programming': 'Programming',
  'subjects.socialStudies': 'Social studies',
  'subjects.fitness': 'Fitness',
  'subjects.scouting': 'Scouting',
  'subjects.nanny': 'Nanny',

  // Teacher Info
  'teacherInfo.employmentDate': 'Employment Date',

  // Authority Management
  'authorities.title': 'Management Authorities',
  'authorities.canAccessPortal': 'Access Manager Portal',
  'authorities.canAddTeachers': 'Add New Teachers',
  'authorities.canEditTeachers': 'Edit Teachers Info',
  'authorities.canManageRequests': 'Accept and Reject Requests',
  'authorities.canDownloadReports': 'Download Reports',
  'authorities.canManageAuthorities': 'Manage Authorities (Admin Only)',

  // Time Periods
  'periods.today': 'Today',
  'periods.week': 'This Week',
  'periods.month': 'This Month',
  'periods.quarter': 'This Quarter',
  'periods.year': 'This Year',
  
  // Analytics KPIs
  'analytics.totalTeachers': 'Total Teachers',
  'analytics.attendanceRate': 'Attendance Rate',
  'analytics.topPerformers': 'Top Performers',
  'analytics.atRisk': 'At Risk',
  'analytics.departments': 'Departments',
  
  // Analytics Charts
  'analytics.performanceDistribution': 'Performance Distribution',
  'analytics.departmentPerformance': 'Department Performance',
  'analytics.departmentPerformanceDesc': 'Compare attendance, absence, late arrival, and early leave patterns between departments across different time periods',
  'analytics.attendanceCommitmentLevel': 'Attendance Commitment Level',
  'analytics.attendanceCommitmentDesc': 'Monitor overall teacher commitment to attendance policies and identify trends in punctuality and presence.',
  'analytics.weeklyAttendancePatterns': 'Weekly Attendance Patterns',
  'analytics.weeklyAttendancePatternsDesc': 'Analyze attendance patterns across different days of the week to identify peak absence periods and optimize scheduling.',
  'analytics.teacherPerformanceRanking': 'Teacher Performance Ranking',
  
  // New Comparison and Tracking Sections
  'analytics.departmentComparison': 'Department Performance Comparison',
  'analytics.teacherComparison': 'Teachers Performance Comparison',
  'analytics.departmentTracking': 'Department Performance Tracking',
  'analytics.teacherTracking': 'Teacher Performance Tracking',
  
  // Comparison Charts
  'analytics.absenceComparison': 'Absence Comparison',
  'analytics.earlyLeavesComparison': 'Early Leaves Comparison',
  'analytics.lateArrivalComparison': 'Late Arrival Comparison',
  
  // Tracking Charts
  'analytics.registeredAbsenceProgress': 'Registered Absence Progress',
  'analytics.registeredEarlyLeavesProgress': 'Registered Early Leaves Progress',
  'analytics.registeredLateArrivalProgress': 'Registered Late Arrival Progress',
  
  // Analytics Table Headers
  'analytics.teacher': 'Teacher',
  'analytics.department': 'Department',
  'analytics.attendanceRateCol': 'Attendance Rate',
  'analytics.punctuality': 'Punctuality',
  'analytics.performance': 'Performance',
  
  // Performance Status Labels
  'performance.excellent': 'Excellent',
  'performance.good': 'Good',
  'performance.average': 'Average',
  'performance.poor': 'Poor',
  
  // Analytics Chart Labels
  'analytics.attendance': 'Attendance',
  'analytics.punctualityChart': 'Punctuality',
  'analytics.absence': 'Absence',
  'analytics.lateArrival': 'Late Arrival',
  'analytics.earlyLeave': 'Early Leave',
  
  // Analytics Sections
  'analytics.departmentsPerformanceComparison': 'Departments Performance Comparison',
  'analytics.teachersPerformanceComparison': 'Teachers Performance Comparison',  
  'analytics.departmentPerformanceTracking': 'Department Performance Tracking',
  'analytics.teacherPerformanceTracking': 'Teacher Performance Tracking',
  'analytics.registeredAbsence': 'Registered Absence',
  'analytics.registeredEarlyLeave': 'Registered Early Leave',
  'analytics.registeredLateArrival': 'Registered Late Arrival',
  
  // Analytics KPI Modal
  'analytics.totalTeachersDesc': 'Total number of active teachers in the system across all departments and subjects.',
  'analytics.attendanceRateDesc': 'Overall attendance rate percentage calculated from daily check-ins and check-outs.',
  'analytics.topPerformersDesc': 'Teachers with excellent attendance, punctuality, and overall performance ratings.',
  'analytics.atRiskDesc': 'Teachers who may need additional support based on attendance patterns and performance metrics.',
  'analytics.departmentsDesc': 'Total number of active departments with assigned teaching staff.',
  'analytics.activeTeachers': 'Active Teachers',
  'analytics.newThisMonth': 'New This Month',
  'analytics.currentRate': 'Current Rate',
  'analytics.lastMonth': 'Last Month',
  'analytics.trend': 'Trend',
  'analytics.excellentRating': 'Excellent Rating',
  'analytics.averageScore': 'Average Score',
  'analytics.improvement': 'Improvement',
  'analytics.needingSupport': 'Needing Support',
  'analytics.attendanceBelow': 'Attendance Below',
  'analytics.improvementPlan': 'Improvement Plan',
  'analytics.totalDepartments': 'Total Departments',
  'analytics.fullyStaffed': 'Fully Staffed',
  'analytics.needingStaff': 'Needing Staff',
  'analytics.keyInsights': 'Key Insights',
  
  // Collapsible Section Titles
  'analytics.departmentComparisonsSection': 'Department Comparisons',
  'analytics.departmentRequestsSection': 'Department Requests',
  'analytics.departmentComparisons': 'Department Comparisons',
  'analytics.departmentRequests': 'Department Requests',
  'analytics.teachersPerformanceComparisonSection': 'Teachers Performance Comparison',
  'analytics.departmentPerformanceTrackingSection': 'Department Performance Tracking',
  'analytics.teacherPerformanceTrackingSection': 'Teacher Performance Tracking',
  
  // Section Descriptions
  'analytics.departmentComparisonsDesc': 'Compare absence, early leave, and late arrival metrics across different departments to identify patterns and areas for improvement.',
  'analytics.departmentRequestsDesc': 'Analyze request patterns for absence, early leave, and late arrival across departments to understand workflow and staffing needs.',

  
  // Department Comparison Charts
  'analytics.departmentAbsenceComparison': 'Absence Comparison',
  'analytics.departmentEarlyLeaveComparison': 'Early Leaves Comparison',
  'analytics.departmentLateArrivalComparison': 'Late Arrival Comparison',
  'analytics.absenceRequests': 'Absence Requests',
  'analytics.earlyLeavesRequests': 'Early Leaves Requests',
  'analytics.lateArrivalRequests': 'Late Arrival Requests',
  
  // Chart Descriptions
  'analytics.absenceComparisonDesc': 'Compare the number of absent days across different departments to identify which areas have higher absence rates.',
  'analytics.earlyLeaveComparisonDesc': 'Analyze early departure patterns by department to understand workload distribution and scheduling needs.',
  'analytics.lateArrivalComparisonDesc': 'Track late arrival incidents across departments to identify punctuality trends and potential scheduling issues.',
  'analytics.absenceRequestsDesc': 'Monitor formal absence request volumes by department to understand planned leave patterns and staffing requirements.',
  'analytics.earlyLeaveRequestsDesc': 'Review early departure request patterns to identify departments with frequent early leave needs.',
  'analytics.lateArrivalRequestsDesc': 'Analyze late arrival request trends to understand traffic, transportation, or scheduling challenges by department.',
  
  // Teacher Comparison Charts
  'analytics.teacherAbsenceComparison': 'Teacher Absence Comparison',
  'analytics.teacherEarlyLeaveComparison': 'Teacher Early Leave Comparison',
  'analytics.teacherLateArrivalComparison': 'Teacher Late Arrival Comparison',
  'analytics.teacherAbsenceRequests': 'Teacher Absence Requests',
  'analytics.teacherEarlyLeaveRequests': 'Teacher Early Leave Requests',
  'analytics.teacherLateArrivalRequests': 'Teacher Late Arrival Requests',
  
  // Teacher Chart Descriptions
  'analytics.teacherAbsenceComparisonDesc': 'Compare absence patterns among individual teachers to identify those who may need support or recognition.',
  'analytics.teacherEarlyLeaveComparisonDesc': 'Analyze early departure patterns by teacher to understand individual scheduling needs and workload distribution.',
  'analytics.teacherLateArrivalComparisonDesc': 'Track late arrival incidents by teacher to provide targeted support and identify potential challenges.',
  'analytics.teacherAbsenceRequestsDesc': 'Monitor formal absence requests by individual teachers to understand planned leave patterns and coverage needs.',
  'analytics.teacherEarlyLeaveRequestsDesc': 'Review early departure requests by teacher to identify individual scheduling preferences and constraints.',
  'analytics.teacherLateArrivalRequestsDesc': 'Analyze late arrival requests by teacher to understand individual transportation or scheduling challenges.',
  
  // Department Tracking Charts
  'analytics.departmentRegisteredAbsenceTracking': 'Department Registered Absence Tracking',
  'analytics.departmentRegisteredEarlyLeavesTracking': 'Department Registered Early Leaves Tracking',
  'analytics.departmentRegisteredLateArrivalTracking': 'Department Registered Late Arrival Tracking',
  'analytics.departmentAbsenceRequestsTracking': 'Department Absence Requests Tracking',
  'analytics.departmentEarlyLeaveRequestsTracking': 'Department Early Leave Requests Tracking',
  'analytics.departmentLateArrivalRequestsTracking': 'Department Late Arrival Requests Tracking',
  
  // Department Tracking Descriptions
  'analytics.departmentRegisteredAbsenceTrackingDesc': 'Track registered absence trends over time to identify seasonal patterns and department-specific issues.',
  'analytics.departmentRegisteredEarlyLeavesTrackingDesc': 'Monitor early departure trends to understand workload cycles and staffing optimization opportunities.',
  'analytics.departmentRegisteredLateArrivalTrackingDesc': 'Track late arrival patterns over time to identify systemic issues and improvement areas.',
  'analytics.departmentAbsenceRequestsTrackingDesc': 'Monitor absence request volumes over time to predict staffing needs and plan coverage.',
  'analytics.departmentEarlyLeaveRequestsTrackingDesc': 'Track early departure request trends to understand scheduling patterns and optimize work hours.',
  'analytics.departmentLateArrivalRequestsTrackingDesc': 'Monitor late arrival request patterns to identify recurring challenges and implement solutions.',
  
  // Teacher Tracking Charts
  'analytics.teacherRegisteredAbsenceTracking': 'Teacher Registered Absence Tracking',
  'analytics.teacherRegisteredEarlyLeavesTracking': 'Teacher Registered Early Leaves Tracking',
  'analytics.teacherRegisteredLateArrivalTracking': 'Teacher Registered Late Arrival Tracking',
  'analytics.teacherAbsenceRequestsTracking': 'Teacher Absence Requests Tracking',
  'analytics.teacherEarlyLeaveRequestsTracking': 'Teacher Early Leave Requests Tracking',
  'analytics.teacherLateArrivalRequestsTracking': 'Teacher Late Arrival Requests Tracking',
  
  // Section Descriptions
  'analytics.teachersPerformanceComparisonDesc': 'Compare individual teacher performance across absence, early leave, and late arrival metrics to identify top performers and those needing support.',
  'analytics.departmentPerformanceTrackingDesc': 'Track department-level attendance patterns over time to monitor trends, seasonal variations, and improvement progress.',
  'analytics.teacherPerformanceTrackingDesc': 'Monitor individual teacher attendance patterns over time to identify trends and provide targeted support.',
  
  // Teacher Tracking Descriptions
  'analytics.teacherRegisteredAbsenceTrackingDesc': 'Track individual teacher absence trends over time to provide personalized support and recognition.',
  'analytics.teacherRegisteredEarlyLeavesTrackingDesc': 'Monitor individual early departure patterns to understand personal scheduling needs and constraints.',
  'analytics.teacherRegisteredLateArrivalTrackingDesc': 'Track individual late arrival trends to identify personal challenges and provide targeted support.',
  'analytics.teacherAbsenceRequestsTrackingDesc': 'Monitor individual absence request patterns to understand personal leave preferences and needs.',
  'analytics.teacherEarlyLeaveRequestsTrackingDesc': 'Track individual early departure requests to accommodate personal scheduling requirements.',
  'analytics.teacherLateArrivalRequestsTrackingDesc': 'Monitor individual late arrival requests to understand personal transportation or scheduling challenges.',
  
  // Analytics KPI Modal Tables
  'analytics.allTeachersOverview': 'All Teachers Overview',
  'analytics.attendanceDetails': 'Attendance Details',
  'analytics.excellentPerformers': 'Top Performing Teachers',
  'analytics.teachersNeedingSupport': 'Teachers Needing Support',
  'analytics.departmentStaffing': 'Department Staffing Overview',
  'analytics.teacherPerformance': 'Teacher Performance',
  'analytics.teacherName': 'Teacher Name',
  'analytics.workType': 'Work Type',
  'analytics.employmentDate': 'Employment Date',
  'analytics.absences': 'Absences',
  'analytics.workHours': 'Work Hours',
  'analytics.overallScore': 'Overall Score',
  'analytics.lateArrivals': 'Late Arrivals',
  'analytics.concernLevel': 'Concern Level',
  'analytics.role': 'Role',
  'analytics.status.excellent': 'Excellent',
  'analytics.status.good': 'Good',
  'analytics.status.average': 'Average',
  'analytics.status.poor': 'Poor',
  'analytics.status.atRisk': 'At Risk',
  
  // Analytics Insights
  'analytics.insights.staffBalance': 'Staff distribution across departments is well balanced',
  'analytics.insights.onboarding': 'New teacher onboarding is proceeding smoothly',
  'analytics.insights.ratios': 'Teacher-to-student ratios are within optimal ranges',
  'analytics.insights.coverage': 'Department coverage is complete with no gaps',
  'analytics.insights.targetThreshold': 'Attendance rate is above the 85% target threshold',
  'analytics.insights.improvement': 'Steady improvement over the past three months',
  'analytics.insights.morningAttendance': 'Morning attendance is consistently higher than afternoon',
  'analytics.insights.weekendStable': 'Weekend activities show lower but stable attendance',
  'analytics.insights.topAttendance': 'Top performers maintain 95%+ attendance rates',
  'analytics.insights.punctuality': 'Consistent early arrivals and minimal late departures',
  'analytics.insights.satisfaction': 'High student satisfaction scores in evaluations',
  'analytics.insights.development': 'Active participation in professional development',
  'analytics.insights.challenges': 'Personal challenges affecting work attendance identified',
  'analytics.insights.support': 'Targeted support programs have been initiated',
  'analytics.insights.checkins': 'Monthly check-ins scheduled with department heads',
  'analytics.insights.opportunities': 'Professional development opportunities provided',
  'analytics.insights.adequate': 'Most departments have adequate staffing levels',
  'analytics.insights.stemSatisfaction': 'STEM departments show highest teacher satisfaction',
  'analytics.insights.languageOutcomes': 'Language departments have excellent student outcomes',
  'analytics.insights.artsEngagement': 'Arts departments demonstrate strong community engagement',

  // Comparison Labels
  'comparison.comparePeriods': 'Compare Periods',
  'comparison.hideComparison': 'Hide Comparison',
  'comparison.compare': 'Compare',
  'comparison.compareWith': 'Compare with:',
  'comparison.vs': 'vs',
  'comparison.current': 'Current:'
};

// Arabic translations
const arTranslations = {
  // Common
  'common.loading': 'جاري التحميل...',
  'common.error': 'خطأ',
  'common.success': 'نجح',
  'common.cancel': 'إلغاء',
  'common.save': 'حفظ',
  'common.edit': 'تعديل',
  'common.delete': 'حذف',
  'common.add': 'إضافة',
  'common.search': 'بحث',
  'common.filter': 'تصفية',
  'common.export': 'تصدير',
  'common.accept': 'قبول',
  'common.reject': 'رفض',
  'common.close': 'إغلاق',
  'common.back': 'العودة',
  'common.next': 'التالي',
  'common.previous': 'السابق',
  'common.all': 'الكل',
  'common.today': 'اليوم',
  'common.thisWeek': 'هذا الأسبوع',
  'common.thisMonth': 'هذا الشهر',
  'common.delayed': 'متأخر',
  'common.name': 'الاسم',
  'common.email': 'البريد الإلكتروني',
  'common.phone': 'الهاتف',
  'common.address': 'العنوان',
  'common.subject': 'المادة',
  'common.workType': 'نوع العمل',
  'common.status': 'الحالة',
  'common.date': 'التاريخ',
  'common.reason': 'السبب',
  'common.duration': 'المدة',
  'common.type': 'النوع',
  'common.days': 'أيام',
  'common.hours': 'ساعات',
  'common.custom': 'مخصص',
  'common.done': 'تم',

  // Date Picker
  'datePicker.selectDateRange': 'اختر نطاق التاريخ',
  'datePicker.selectEndDate': 'اختر تاريخ النهاية',
  'datePicker.dayHeaders': ['أ', 'إ', 'ث', 'أ', 'خ', 'ج', 'س'],

  // Navigation/Sidebar
  'nav.dashboard': 'لوحة التحكم',
  'nav.teachers': 'المعلمين',
  'nav.requests': 'الطلبات',
  'nav.settings': 'الإعدادات',
  'nav.logout': 'تسجيل الخروج',
  'nav.addTeacher': 'إضافة معلم جديد +',

  // Dashboard
  'dashboard.title': 'نظرة عامة على لوحة التحكم',
  'dashboard.totalTeachers': 'إجمالي المعلمين',
  'dashboard.activeTeachers': 'المعلمين النشطين',
  'dashboard.pendingRequests': 'الطلبات المعلقة',
  'dashboard.monthlyAttendance': 'الحضور الشهري',
  'dashboard.recentActivity': 'النشاط الحديث',
  'dashboard.quickStats': 'إحصائيات سريعة',
  'dashboard.overtime': 'الإضافي',
  'dashboard.averageTeachersAges': 'متوسط أعمار المعلمين',
  'dashboard.todayAbsences': 'غياب اليوم',
  'dashboard.allMissing': 'إجمالي الغياب',
  'dashboard.authorizedAbsence': 'غياب مصرح به',
  'dashboard.unauthorizedNoRequest': 'غياب بدون إذن - بدون طلب',
  'dashboard.unauthorizedRejected': 'غياب بدون إذن - طلب مرفوض',
  'dashboard.contact': 'تواصل',

  // Teachers Page
  'teachers.title': 'إدارة المعلمين',
  'teachers.allTeachers': 'جميع المعلمين',
  'teachers.reports': 'التقارير',
  'teachers.analytics': 'التحليلات',
  'teachers.searchTeachers': 'البحث عن المعلمين...',
  'teachers.filterBySubject': 'تصفية حسب المادة',
  'teachers.allSubjects': 'جميع المواد',
  'teachers.addTeacher': 'إضافة معلم جديد',
  'teachers.editTeacher': 'تعديل المعلم',
  'teachers.teacherDetails': 'تفاصيل المعلم',
  'teachers.personalInfo': 'المعلومات الشخصية',
  'teachers.activity': 'النشاط',
  'teachers.workType.fullTime': 'دوام كامل',
  'teachers.workType.partTime': 'دوام جزئي',
  'teachers.status.active': 'نشط',
  'teachers.status.inactive': 'غير نشط',
  'teachers.noTeachers': 'لم يتم العثور على معلمين',
  'teachers.noTeachersDesc': 'لا يوجد معلمين يطابقون التصفية الحالية.',

  // Teachers Reports
  'reports.teacher': 'المعلم',
  'reports.workType': 'نوع العمل',
  'reports.attends': 'الحضور',
  'reports.allowedAbsence': 'الغياب المصرح به',
  'reports.unallowedAbsence': 'غياب بدون إذن',
  'reports.authorizedAbsence': 'الغياب المصرح به',
  'reports.unauthorizedAbsence': 'الغياب غير المصرح به',
  'reports.lateArrival': 'وصول متأخر',
  'reports.earlyLeave': 'المغادرة المبكرة',
  'reports.overtime': 'الساعات الإضافية',
  'reports.totalHours': 'إجمالي ساعات العمل',
  'reports.showing': 'عرض',
  'reports.exportPDF': 'تصدير PDF',
  'reports.exportExcel': 'تصدير Excel',
  'reports.dateRange': 'نطاق التاريخ',
  'reports.from': 'من',
  'reports.to': 'إلى',

  // Add Teacher Modal
  'addTeacher.title': 'إضافة معلم جديد',
  'addTeacher.subtitle': 'أضف معلماً جديداً إلى فريقك وأدر العمليات بسلاسة',
  'addTeacher.firstName': 'الاسم الأول',
  'addTeacher.lastName': 'الاسم الأخير',
  'addTeacher.phone': 'هاتف المعلم',
  'addTeacher.email': 'بريد المعلم الإلكتروني',
  'addTeacher.address': 'عنوان المعلم',
  'addTeacher.password': 'كلمة مرور المعلم',
  'addTeacher.dateOfBirth': 'تاريخ الميلاد',
  'addTeacher.day': 'اليوم',
  'addTeacher.month': 'الشهر',
  'addTeacher.year': 'السنة',
  'addTeacher.subject': 'مادة المعلم',
  'addTeacher.selectSubject': 'اختر المادة',
  'addTeacher.roleType': 'نوع الدوام',
  'addTeacher.fullTime': 'دوام كامل',
  'addTeacher.partTime': 'دوام جزئي',
  'addTeacher.employmentDate': 'تاريخ التعيين',
      'addTeacher.allowedAbsenceDays': 'أيام الغياب المسموحة',
    'addTeacher.employmentDateHelper': 'حساب تلقائي لأيام الغياب: 0 أيام (أقل من 3 أشهر)، 9 أيام (3 أشهر-سنتان)، 12 يوماً (أكثر من سنتين)',
    'addTeacher.allowedAbsenceDaysHelper': 'يمكن للمدير تعديل القيمة المحسوبة تلقائياً',
    'addTeacher.authorities': 'الصلاحيات',
  'addTeacher.systemRole': 'الدور في النظام',
  'addTeacher.selectSystemRole': 'اختر الدور في النظام',
  'systemRoles.admin': 'مدير عام',
  'systemRoles.manager': 'مدير',
  'systemRoles.employee': 'موظف',
  'systemRoles.adminDescription': 'وصول كامل للنظام مع جميع الصلاحيات',
  'systemRoles.managerDescription': 'وصول لبوابة المدير، يمكن قبول طلبات الموظفين',
  'systemRoles.employeeDescription': 'وصول أساسي لبوابة المعلم',
  'addTeacher.selectAuthorities': 'اختر الصلاحيات',
  'authorities.managerPortal': 'الوصول إلى بوابة المدير والصفحات الداخلية',
  'authorities.addTeachers': 'إضافة معلمين جدد',
  'authorities.editTeachers': 'تعديل معلومات المعلمين الحاليين',
  'authorities.manageRequests': 'قبول ورفض طلبات المعلمين',
  'authorities.downloadReports': 'تحميل التقارير',
  'addTeacher.save': 'حفظ',
  'addTeacher.success': 'تم إضافة المعلم بنجاح',
  'addTeacher.error': 'فشل في إضافة المعلم',

  // Edit Teacher Modal
  'editTeacher.title': 'تعديل معلومات المعلم',
  'editTeacher.personalInfo': 'المعلومات الشخصية',
  'editTeacher.activity': 'النشاط',
  'editTeacher.password': 'كلمة مرور المعلم (اتركها فارغة للاحتفاظ بكلمة المرور الحالية)',
  'editTeacher.passwordPlaceholder': 'أدخل كلمة مرور جديدة للتغيير',
  'editTeacher.save': 'تعديل',
  'editTeacher.success': 'تم تحديث المعلم بنجاح',
  'editTeacher.error': 'فشل في تحديث المعلم',

  // Activity Tab
  'activity.title': 'النشاط',
  'activity.leaves': 'الإجازات',
  'activity.absents': 'الغياب',
  'activity.totalHours': 'إجمالي ساعات العمل',
  'activity.date': 'التاريخ',
  'activity.attends': 'الحضور',
  'activity.checkIn': 'تسجيل الدخول',
  'activity.checkOut': 'تسجيل الخروج',
  'activity.allowedAbsence': 'الغياب المصرح به',
  'activity.authorizedAbsence': 'الغياب المصرح به',
  'activity.totalTime': 'إجمالي الوقت',
  'activity.active': 'نشط',
  'activity.absent': 'غائب',
  'activity.yes': 'نعم',
  'activity.no': '--',

  // Requests Page
  'requests.title': 'إدارة الطلبات',
  'requests.allRequests': 'جميع الطلبات',
  'requests.absenceRequests': 'طلبات الغياب',
  'requests.earlyLeaveRequests': 'طلبات إنصراف مبكر',
  'requests.lateRequests': 'طلبات وصول متأخر',
  'requests.appliedDuration': 'المدة المطلوبة',
  'requests.requestType': 'نوع الطلب',
  'requests.accept': 'قبول',
  'requests.reject': 'رفض',
  'requests.noRequests': 'لم يتم العثور على طلبات {type}',
  'requests.noRequestsDesc': 'لا توجد حالياً طلبات معلقة للمراجعة.',
  'requests.reasonTitle': 'تفاصيل الطلب',
  'requests.reason': 'السبب',

  // Request Types
  'requestTypes.absence': 'غياب',
  'requestTypes.authorizedAbsence': 'غياب مصرح به',
  'requestTypes.earlyLeave': 'مغادرة مبكرة',
  'requestTypes.lateArrival': 'وصول متأخر',

  // Settings Page
  'settings.title': 'الإعدادات',
  'settings.personalInfo': 'المعلومات الشخصية',
  'settings.general': 'عام',
  'settings.notifications': 'الإشعارات',
  'settings.security': 'الأمان',
  'settings.language': 'اللغة',
  'settings.selectLanguage': 'اختر اللغة',
  'settings.english': 'English',
  'settings.arabic': 'العربية',
  'settings.languageNote': 'تغيير لغة الواجهة',
  
  // Settings Tab Keys
  'settings.personalInfoTab': 'المعلومات الشخصية',
  'settings.generalTab': 'عام',
  'settings.notificationsTab': 'الإشعارات',
  'settings.securityTab': 'الأمان',
  'settings.holidaysTab': 'العطل',

  // Personal Info Settings
  'settings.personalInfo.title': 'المعلومات الشخصية',
  'settings.personalInfo.subtitle': 'إدارة التفاصيل الشخصية ومعلومات الملف الشخصي',
  'settings.personalInfo.uploadButton': 'رفع صورة الملف الشخصي',
  'settings.personalInfo.firstName': 'الاسم الأول',
  'settings.personalInfo.firstNamePlaceholder': 'أدخل اسمك الأول',
  'settings.personalInfo.lastName': 'الاسم الأخير',
  'settings.personalInfo.lastNamePlaceholder': 'أدخل اسمك الأخير',
  'settings.personalInfo.email': 'البريد الإلكتروني',
  'settings.personalInfo.emailPlaceholder': 'أدخل عنوان بريدك الإلكتروني',
  'settings.personalInfo.phone': 'رقم الهاتف',
  'settings.personalInfo.phonePlaceholder': 'أدخل رقم هاتفك',
  'settings.personalInfo.address': 'العنوان',
  'settings.personalInfo.addressPlaceholder': 'أدخل عنوانك',
  'settings.personalInfo.dateOfBirth': 'تاريخ الميلاد',
  'settings.personalInfo.save': 'حفظ التغييرات',

  // General Settings
  'settings.general.title': 'الإعدادات العامة',
  'settings.general.subtitle': 'تكوين جداول العمل وأيام الإجازة وتفضيلات النظام',
  'settings.general.weekendDays': 'أيام الإجازة الأسبوعية',
  'settings.general.weekendDaysSubtitle': 'حدد الأيام التي تعتبر أيام إجازة أسبوعية (أيام غير عمل)',
  'settings.general.nationalHolidays': 'العطل الوطنية',
  'settings.general.nationalHolidaysSubtitle': 'حدد التواريخ التي تعتبر عطل وطنية للعام الحالي',
  'settings.general.selectedHolidays': 'العطل المحددة',
  'settings.general.selectedHolidaysSubtitle': 'مراجعة وإدارة تواريخ العطل المحددة',
  'settings.general.removeHoliday': 'إزالة العطلة',
  'settings.general.clearAllHolidays': 'مسح الكل',
  'settings.general.holidayCount': 'عطلة محددة',
  'settings.general.save': 'حفظ الإعدادات',

  // Notifications Settings
  'settings.notifications.title': 'تفضيلات الإشعارات',
  'settings.notifications.subtitle': 'تكوين تفضيلات الإشعارات الخاصة بك',
  'settings.notifications.emailNotifications': 'إشعارات البريد الإلكتروني',
  'settings.notifications.requestNotifications': 'إشعارات الطلبات الجديدة',
  'settings.notifications.requestDesc': 'تلقي إشعارات بريد إلكتروني للطلبات الجديدة من المعلمين',
  'settings.notifications.save': 'حفظ الإعدادات',
  'settings.notifications.allNotifications': 'جميع الإشعارات',
  'settings.notifications.earlyArrival': 'الوصول المبكر',
  'settings.notifications.lateArrival': 'وصول متأخر',
  'settings.notifications.earlyLeaves': 'المغادرة المبكرة',
  'settings.notifications.lateLeaves': 'المغادرة المتأخرة',
  'settings.notifications.absentsTeachers': 'المعلمين الغائبين',
  'settings.notifications.dailyReports': 'التقارير اليومية',
  'settings.notifications.weeklyReports': 'التقارير الأسبوعية',
  'settings.notifications.monthlyReports': 'التقارير الشهرية',
  'settings.notifications.yearlyReports': 'التقارير السنوية',
  'settings.notifications.testTitle': 'اختبار الإشعارات',
  'settings.notifications.testDesc': 'إرسال إشعارات تجريبية للتحقق من تسليم البريد الإلكتروني:',
  'settings.notifications.testEarlyLeave': 'اختبار المغادرة المبكرة',
  'settings.notifications.testAbsence': 'اختبار الغياب',
  'settings.notifications.testLateArrival': 'اختبار وصول متأخر',

  // Security Settings
  'settings.security.title': 'تغيير كلمة المرور',
  'settings.security.subtitle': 'تحديث كلمة مرور حسابك للأمان المحسن',
  'settings.security.changePassword': 'تغيير كلمة المرور',
  'settings.security.changingPassword': 'جاري تغيير كلمة المرور...',
  'settings.security.currentPassword': 'كلمة المرور الحالية',
  'settings.security.newPassword': 'كلمة المرور الجديدة',
  'settings.security.confirmPassword': 'تأكيد كلمة المرور الجديدة',
  'settings.security.updatePassword': 'تحديث كلمة المرور',

  // Holiday Management Settings
  'settings.holidays': 'العطل',
  'settings.holidays.title': 'إدارة العطل',
  'settings.holidays.subtitle': 'إدارة العطل الرسمية التي لا تحتسب فيها الغيابات',
  'settings.holidays.adminOnly': 'ميزة المدير العام فقط',
  'settings.holidays.addHoliday': 'إضافة عطلة',
  'settings.holidays.editHoliday': 'تعديل العطلة',
  'settings.holidays.deleteHoliday': 'حذف العطلة',
  'settings.holidays.confirmDelete': 'هل أنت متأكد من حذف هذه العطلة؟',
  'settings.holidays.holidayName': 'اسم العطلة',
  'settings.holidays.holidayNamePlaceholder': 'أدخل اسم العطلة',
  'settings.holidays.holidayNameAr': 'اسم العطلة (بالعربية)',
  'settings.holidays.holidayNameArPlaceholder': 'أدخل اسم العطلة بالعربية',
  'settings.holidays.holidayDate': 'تاريخ العطلة',
  'settings.holidays.description': 'الوصف',
  'settings.holidays.descriptionPlaceholder': 'أدخل وصف العطلة (اختياري)',
  'settings.holidays.isRecurring': 'تتكرر سنوياً',
  'settings.holidays.recurringNote': 'العطلة تتكرر كل عام في نفس التاريخ',
  'settings.holidays.save': 'حفظ العطلة',
  'settings.holidays.cancel': 'إلغاء',
  'settings.holidays.noHolidays': 'لم يتم تكوين أي عطل بعد',
  'settings.holidays.addFirst': 'أضف عطلتك الأولى',
  'settings.holidays.upcomingHolidays': 'العطل القادمة',
  'settings.holidays.pastHolidays': 'العطل السابقة',
  'settings.holidays.thisYear': 'هذا العام',
  'settings.holidays.nextYear': 'العام القادم',

  // Authentication
  'auth.signIn': 'تسجيل دخول المدير',
  'auth.signInSubtitle': 'أدخل بياناتك للوصول إلى لوحة الإدارة',
  'auth.emailAddress': 'عنوان البريد الإلكتروني',
  'auth.password': 'كلمة المرور',
  'auth.rememberMe': 'تذكرني لمدة 30 يوماً',
  'auth.signInButton': 'تسجيل الدخول',
  'auth.signingIn': 'جاري تسجيل الدخول...',
  'auth.forgotPassword': 'نسيت كلمة المرور؟',
  'auth.backToRoleSelection': '← العودة إلى اختيار الدور',
  'auth.invalidCredentials': 'بريد إلكتروني أو كلمة مرور غير صحيحة',
  'auth.loginFailed': 'فشل تسجيل الدخول. يرجى التحقق من اتصالك والمحاولة مرة أخرى.',

  // Brand
  'brand.title': 'جينيوس سمارت',
  'brand.subtitle': 'بوابة المدير',
  'brand.education': 'جينيوس سمارت للتعليم',

  // Validation Messages
  'validation.required': 'هذا الحقل مطلوب',
  'validation.email': 'يرجى إدخال عنوان بريد إلكتروني صحيح',
  'validation.minLength': 'يجب أن يكون على الأقل {min} أحرف',
  'validation.passwordMismatch': 'كلمات المرور غير متطابقة',

  // Time periods
  'time.today': 'اليوم',
  'time.thisWeek': 'هذا الأسبوع',
  'time.thisMonth': 'هذا الشهر',
  'time.delayed': 'متأخر',

  // Months
  'months.january': 'يناير',
  'months.february': 'فبراير',
  'months.march': 'مارس',
  'months.april': 'أبريل',
  'months.may': 'مايو',
  'months.june': 'يونيو',
  'months.july': 'يوليو',
  'months.august': 'أغسطس',
  'months.september': 'سبتمبر',
  'months.october': 'أكتوبر',
  'months.november': 'نوفمبر',
  'months.december': 'ديسمبر',

  // Subjects
  'subjects.management': 'الإدارة',
  'subjects.quran': 'القرآن',
  'subjects.arabic': 'اللغة العربية',
  'subjects.math': 'الرياضيات',
  'subjects.english': 'اللغة الإنجليزية',
  'subjects.science': 'العلوم',
  'subjects.art': 'الفنون',
  'subjects.programming': 'البرمجة',
  'subjects.socialStudies': 'الدراسات الاجتماعية',
  'subjects.fitness': 'التربية الرياضية',
  'subjects.scouting': 'البحث العلمي',
  'subjects.nanny': 'الدادات',

  // Teacher Info
  'teacherInfo.employmentDate': 'تاريخ التعيين',

  // Authority Management
  'authorities.title': 'صلاحيات المدير',
  'authorities.canAccessPortal': 'الوصول إلى بوابة المدير',
  'authorities.canAddTeachers': 'إضافة مدرسين جدد',
  'authorities.canEditTeachers': 'تعديل معلومات المدرسين',
  'authorities.canManageRequests': 'قبول ورفض الطلبات',
  'authorities.canDownloadReports': 'تحميل التقارير',
  'authorities.canManageAuthorities': 'إدارة الصلاحيات (للمدير فقط)',

  // Time Periods
  'periods.today': 'اليوم',
  'periods.week': 'هذا الأسبوع',
  'periods.month': 'هذا الشهر',
  'periods.quarter': 'هذا الربع',
  'periods.year': 'هذا العام',
  
  // Analytics KPIs
  'analytics.totalTeachers': 'إجمالي المعلمين',
  'analytics.attendanceRate': 'معدل الحضور',
  'analytics.topPerformers': 'المتميزون',
  'analytics.atRisk': 'المخاطر',
  'analytics.departments': 'الأقسام',
  
  // Analytics Charts
  'analytics.performanceDistribution': 'توزيع الأداء',
  'analytics.departmentPerformance': 'تحليل أداء الأقسام',
  'analytics.departmentPerformanceDesc': 'مقارنة أنماط الحضور والغياب والوصول المتأخر والانصراف المبكر بين الأقسام عبر فترات زمنية مختلفة',
  'analytics.attendanceCommitmentLevel': 'مستوى التزام الحضور',
  'analytics.attendanceCommitmentDesc': 'مراقبة التزام المعلمين العام بسياسات الحضور وتحديد اتجاهات الانضباط والحضور.',
  'analytics.weeklyAttendancePatterns': 'أنماط الحضور الأسبوعية',
  'analytics.weeklyAttendancePatternsDesc': 'تحليل أنماط الحضور عبر أيام الأسبوع المختلفة لتحديد فترات الغياب العالية وتحسين الجدولة.',
  'analytics.teacherPerformanceRanking': 'ترتيب أداء المعلمين',
  
  // New Comparison and Tracking Sections
  'analytics.departmentComparison': 'مقارنة أداء الأقسام',
  'analytics.teacherComparison': 'مقارنة أداء المعلمين',
  'analytics.departmentTracking': 'تتبع أداء الأقسام',
  'analytics.teacherTracking': 'تتبع أداء المعلمين',
  
  // Comparison Charts
  'analytics.absenceComparison': 'مقارنة الغياب',
  'analytics.earlyLeavesComparison': 'مقارنة الانصراف المبكر',
  'analytics.lateArrivalComparison': 'مقارنة التأخير',
  'analytics.departmentAbsenceComparison': 'مقارنة غياب الأقسام',
  'analytics.departmentEarlyLeaveComparison': 'مقارنة الانصراف المبكر للأقسام',
  'analytics.departmentLateArrivalComparison': 'مقارنة التأخير للأقسام',
  'analytics.absenceRequests': 'طلبات الغياب',
  'analytics.earlyLeavesRequests': 'طلبات الانصراف المبكر',
  'analytics.lateArrivalRequests': 'طلبات التأخير',
  
  // Tracking Charts
  'analytics.registeredAbsenceProgress': 'تقدم الغياب المسجل',
  'analytics.registeredEarlyLeavesProgress': 'تقدم الانصراف المبكر المسجل',
  'analytics.registeredLateArrivalProgress': 'تقدم التأخير المسجل',
  
  // Analytics Table Headers
  'analytics.teacher': 'المعلم',
  'analytics.department': 'القسم',
  'analytics.attendanceRateCol': 'معدل الحضور',
  'analytics.punctuality': 'التأخير',
  'analytics.performance': 'الأداء',
  
  // Performance Status Labels
  'performance.excellent': 'ممتاز',
  'performance.good': 'جيد',
  'performance.average': 'متوسط',
  'performance.poor': 'ضعيف',
  
  // Analytics Chart Labels
  'analytics.attendance': 'الحضور',
  'analytics.punctualityChart': 'التأخير',
  'analytics.absence': 'الغياب',
  'analytics.lateArrival': 'الوصول المتأخر',
  'analytics.earlyLeave': 'الانصراف المبكر',
  
  // Analytics Sections
  'analytics.departmentsPerformanceComparison': 'مقارنة أداء الأقسام',
  'analytics.teachersPerformanceComparison': 'مقارنة أداء المعلمين',  
  'analytics.departmentPerformanceTracking': 'تتبع أداء الأقسام',
  'analytics.teacherPerformanceTracking': 'تتبع أداء المعلمين',

  
  // Analytics KPI Modal
  'analytics.totalTeachersDesc': 'إجمالي عدد المعلمين النشطين في النظام عبر جميع الأقسام والمواد.',
  'analytics.attendanceRateDesc': 'معدل الحضور الإجمالي بالنسبة المئوية محسوب من أيام التسجيل اليومي والخروج.',
  'analytics.topPerformersDesc': 'المعلمون الذين لديهم حضور وتأخير وأداء عام جيد.',
  'analytics.atRiskDesc': 'المعلمون الذين قد يحتاجون إلى دعم إضافي بناءً على أنماط الغياب والمقاييس الأدائية.',
  'analytics.departmentsDesc': 'إجمالي عدد الأقسام النشطة مع فريق التدريس.',
  'analytics.activeTeachers': 'المعلمون النشطون',
  'analytics.newThisMonth': 'الجدد هذا الشهر',
  'analytics.currentRate': 'المعدل الحالي',
  'analytics.lastMonth': 'الشهر الماضي',
  'analytics.trend': 'الاتجاه',
  'analytics.excellentRating': 'تقييم جيد جداً',
  'analytics.averageScore': 'النتيجة المتوسطة',
  'analytics.improvement': 'التحسين',
  'analytics.needingSupport': 'التأكيد على الدعم',
  'analytics.attendanceBelow': 'الحضور أقل من',
  'analytics.improvementPlan': 'خطة التحسين',
  'analytics.totalDepartments': 'إجمالي الأقسام',
  'analytics.fullyStaffed': 'مكتمل الفريق',
  'analytics.needingStaff': 'التأكيد على الفريق',
  'analytics.keyInsights': 'المفاهيم الرئيسية',
  
  // Collapsible Section Titles
  'analytics.departmentComparisonsSection': 'مقارنات الأقسام',
  'analytics.departmentRequestsSection': 'طلبات الأقسام',
  'analytics.departmentComparisons': 'مقارنات الأقسام',
  'analytics.departmentRequests': 'طلبات الأقسام',
  'analytics.teachersPerformanceComparisonSection': 'مقارنة أداء المعلمين',
  'analytics.departmentPerformanceTrackingSection': 'تتبع أداء الأقسام',
  'analytics.teacherPerformanceTrackingSection': 'تتبع أداء المعلمين',
  
  // Section Descriptions
  'analytics.departmentComparisonsDesc': 'قارن مقاييس الغياب والانصراف المبكر والوصول المتأخر عبر الأقسام المختلفة لتحديد الأنماط ومجالات التحسين.',
  'analytics.departmentRequestsDesc': 'حلل أنماط الطلبات للغياب والانصراف المبكر والوصول المتأخر عبر الأقسام لفهم سير العمل واحتياجات التوظيف.',
    'analytics.teachersPerformanceComparisonDesc': 'قارن مقاييس أداء المعلمين الفردي لتحديد المتميزين والذين قد يحتاجون إلى دعم إضافي.',
  'analytics.departmentPerformanceTrackingDesc': 'تتبع اتجاهات أداء الأقسام مع مرور الوقت لمراقبة التحسن وتحديد الأنماط الموسمية.',
  'analytics.teacherPerformanceTrackingDesc': 'راقب اتجاهات أداء المعلمين الفردي مع مرور الوقت لدعم التطوير المهني والتقدير.',

  // Teacher Comparison Charts
  'analytics.teacherAbsenceComparison': 'مقارنة غياب المعلمين',
  'analytics.teacherEarlyLeaveComparison': 'مقارنة الانصراف المبكر للمعلمين',
  'analytics.teacherLateArrivalComparison': 'مقارنة التأخير للمعلمين',

  // Teacher Request Charts
  'analytics.teacherAbsenceRequests': 'طلبات غياب المعلمين',
  'analytics.teacherEarlyLeaveRequests': 'طلبات الانصراف المبكر للمعلمين',
  'analytics.teacherLateArrivalRequests': 'طلبات التأخير للمعلمين',

  // Department Tracking Charts
  'analytics.departmentRegisteredAbsenceTracking': 'تتبع غياب الأقسام المسجل',
  'analytics.departmentRegisteredEarlyLeavesTracking': 'تتبع الانصراف المبكر المسجل للأقسام',
  'analytics.departmentRegisteredLateArrivalTracking': 'تتبع التأخير المسجل للأقسام',
  'analytics.departmentAbsenceRequestsTracking': 'تتبع طلبات غياب الأقسام',
  'analytics.departmentEarlyLeaveRequestsTracking': 'تتبع طلبات الانصراف المبكر للأقسام',
  'analytics.departmentLateArrivalRequestsTracking': 'تتبع طلبات التأخير للأقسام',
  
  // Department Tracking Descriptions
  'analytics.departmentRegisteredAbsenceTrackingDesc': 'تتبع اتجاهات الغياب المسجل مع مرور الوقت لتحديد الأنماط الموسمية ومشاكل الأقسام المحددة.',
  'analytics.departmentRegisteredEarlyLeavesTrackingDesc': 'مراقبة اتجاهات الانصراف المبكر لفهم دورات عبء العمل وفرص تحسين التوظيف.',
  'analytics.departmentRegisteredLateArrivalTrackingDesc': 'تتبع أنماط التأخير مع مرور الوقت لتحديد القضايا النظامية ومناطق التحسين.',
  'analytics.departmentAbsenceRequestsTrackingDesc': 'مراقبة أحجام طلبات الغياب مع مرور الوقت للتنبؤ باحتياجات التوظيف والتخطيط للتغطية.',
  'analytics.departmentEarlyLeaveRequestsTrackingDesc': 'تتبع اتجاهات طلبات الانصراف المبكر لفهم أنماط الجدولة وتحسين ساعات العمل.',
  'analytics.departmentLateArrivalRequestsTrackingDesc': 'مراقبة أنماط طلبات التأخير لتحديد التحديات المتكررة وتنفيذ الحلول.',
  
  // Teacher Tracking Charts
  'analytics.teacherRegisteredAbsenceTracking': 'تتبع غياب المعلمين المسجل',
  'analytics.teacherRegisteredEarlyLeavesTracking': 'تتبع الانصراف المبكر المسجل للمعلمين',
  'analytics.teacherRegisteredLateArrivalTracking': 'تتبع التأخير المسجل للمعلمين',
  'analytics.teacherAbsenceRequestsTracking': 'تتبع طلبات غياب المعلمين',
  'analytics.teacherEarlyLeaveRequestsTracking': 'تتبع طلبات الانصراف المبكر للمعلمين',
  'analytics.teacherLateArrivalRequestsTracking': 'تتبع طلبات التأخير للمعلمين',
  
  // Teacher Tracking Descriptions
  'analytics.teacherRegisteredAbsenceTrackingDesc': 'تتبع اتجاهات غياب المعلمين الفردي مع مرور الوقت لتقديم الدعم والتقدير الشخصي.',
  'analytics.teacherRegisteredEarlyLeavesTrackingDesc': 'مراقبة أنماط الانصراف المبكر الفردي لفهم احتياجات الجدولة الشخصية والقيود.',
  'analytics.teacherRegisteredLateArrivalTrackingDesc': 'تتبع اتجاهات التأخير الفردي لتحديد التحديات الشخصية وتقديم الدعم المستهدف.',
  'analytics.teacherAbsenceRequestsTrackingDesc': 'مراقبة أنماط طلبات الغياب الفردي لفهم تفضيلات الإجازة الشخصية والاحتياجات.',
  'analytics.teacherEarlyLeaveRequestsTrackingDesc': 'تتبع طلبات الانصراف المبكر الفردي لاستيعاب متطلبات الجدولة الشخصية.',
  'analytics.teacherLateArrivalRequestsTrackingDesc': 'مراقبة طلبات التأخير الفردي لفهم تحديات النقل أو الجدولة الشخصية.',
  
  // Analytics KPI Modal Tables
  'analytics.allTeachersOverview': 'نظرة عامة على جميع المعلمين',
  'analytics.attendanceDetails': 'تفاصيل الحضور',
  'analytics.excellentPerformers': 'المعلمون المتميزون في الأداء',
  'analytics.teachersNeedingSupport': 'المعلمون الذين يحتاجون إلى الدعم',
  'analytics.departmentStaffing': 'توزيع الموظفين على الأقسام',
  'analytics.teacherPerformance': 'أداء المعلمين',
  'analytics.teacherName': 'اسم المعلم',
  'analytics.workType': 'نوع العمل',
  'analytics.employmentDate': 'تاريخ التوظيف',
  'analytics.absences': 'أيام الغياب',
  'analytics.workHours': 'ساعات العمل',
  'analytics.overallScore': 'النتيجة الإجمالية',
  'analytics.lateArrivals': 'مرات التأخير',
  'analytics.concernLevel': 'مستوى الاهتمام',
  'analytics.role': 'الدور الوظيفي',
  'analytics.status.excellent': 'متميز',
  'analytics.status.good': 'جيد',
  'analytics.status.average': 'متوسط',
  'analytics.status.poor': 'ضعيف',
  'analytics.status.atRisk': 'يحتاج دعم',
  
  // Analytics Insights
  'analytics.insights.staffBalance': 'توزيع الموظفين عبر الأقسام متوازن بشكل جيد',
  'analytics.insights.onboarding': 'توظيف المعلمين الجدد يتم بإتقان',
  'analytics.insights.ratios': 'نسب المعلمين إلى الطلاب داخل نطاقات أمثل',
  'analytics.insights.coverage': 'تغطية الأقسام مكتملة بدون خلافات',
  'analytics.insights.targetThreshold': 'معدل الحضور أعلى من أهداف الإرغاء الـ 85%',
  'analytics.insights.improvement': 'التحسين المستمر خلال الثلاثة أشهر الماضية',
  'analytics.insights.morningAttendance': 'الحضور في الصباح أعلى بشكل منتظم من الظهر',
  'analytics.insights.weekendStable': 'النشاطات في الأسبوع الخارجية تظهر حضوراً أقل ولكن مستقراً',
  'analytics.insights.topAttendance': 'المتميزون يحافظون على معدلات حضور 95%+',
  'analytics.insights.punctuality': 'وصول مبكر متناسق وتأخيراً أقل من الأطوال',
  'analytics.insights.satisfaction': 'درجات الرضا على التقييمات عالية',
  'analytics.insights.development': 'المشاركة النشطة في التطوير المهني',
  'analytics.insights.challenges': 'التحديات الشخصية التي تؤثر على حضور العمل تم التحديد',
  'analytics.insights.support': 'برامج الدعم الهدفية تم إنشاؤها',
  'analytics.insights.checkins': 'تم إعداد التفاعلات الشهرية مع رؤساء الأقسام',
  'analytics.insights.opportunities': 'الفرص التطويرية المقدمة',
  'analytics.insights.adequate': 'أغلب الأقسام لديها مستويات دعم كافية',
  'analytics.insights.stemSatisfaction': 'الأقسام العلمية (STEM) تظهر أعلى رضا المعلمين',
  'analytics.insights.languageOutcomes': 'الأقسام اللغوية تحقق أفضل نتائج الطلاب',
  'analytics.insights.artsEngagement': 'الأقسام الفنونية تظهر تفاعلاً قوياً مع المجتمع',

  // Comparison Labels
  'comparison.comparePeriods': 'مقارنة الفترات',
  'comparison.hideComparison': 'إخفاء المقارنة',
  'comparison.compare': 'مقارنة',
  'comparison.compareWith': 'مقارنة بـ:',
  'comparison.vs': 'على',
  'comparison.current': 'الحالي:'
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Get language from localStorage or default to Arabic
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('managerLanguage') as Language;
    return savedLanguage || 'ar';
  });

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('managerLanguage', language);
    
    // Update document direction and language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Update CSS custom properties for text alignment
    document.documentElement.style.setProperty(
      '--text-align-start', 
      language === 'ar' ? 'right' : 'left'
    );
    document.documentElement.style.setProperty(
      '--text-align-end', 
      language === 'ar' ? 'left' : 'right'
    );
  }, [language]);

  const translations = language === 'ar' ? arTranslations : enTranslations;

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[key as keyof typeof translations] || key;
    
    // Handle parameter substitution
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    
    return translation;
  };

  const isRTL = language === 'ar';

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext; 